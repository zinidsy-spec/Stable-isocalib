/* engine.js - IsoCalib v1.4.0 Core Data Reduction, Area Linearity, Blank & WLS Engine */

let currentLang = localStorage.getItem('isocalib_lang') || (navigator.language && navigator.language.startsWith('ko') ? 'ko' : 'en');
let currentTab = 'sequence';
let groupedSummaryData = [];
let sequenceExportData = [];
let lastQcSummaryReport = null;
let hasCalibratedOnce = false;

let currentMode = "CO";
let oxygenScale = "VPDB";
let areaMode = "off"; // 'off', 'linearity', 'blank', 'blank_lin'
let gridData = [];
let excludedRows = [];
let currentAnchorCount = 2;
let userCustomStandardsByMode = {};

let isMouseDown = false;
let isSelectingRows = false;
let dragStart = { r: 0, c: 0 };
let dragEnd = { r: 0, c: 0 };
let selectedCellRange = { minR: 0, maxR: 0, minC: 0, maxC: 0 };
let activeEditingCell = null;

function isAreaActive() {
  return areaMode !== 'off';
}

function getNumDataCols() {
  const isDual = PRESETS[currentMode].elements.length === 2;
  if (isAreaActive()) {
    return isDual ? 7 : 4; // [ID, Area1, Raw1, SD1, (Area2, Raw2, SD2)]
  }
  return isDual ? 5 : 3; // [ID, Raw1, SD1, (Raw2, SD2)]
}

function vpdbToVsmow(vpdb) {
  return isNaN(vpdb) ? vpdb : (1.03092 * vpdb + 30.92);
}

function vsmowToVpdb(vsmow) {
  return isNaN(vsmow) ? vsmow : ((vsmow - 30.92) / 1.03092);
}

function extractBaseId(rawId) {
  if (!rawId) return '';
  return rawId.trim().replace(/[-_.#\s]+(0?[1-9]|[a-zA-Z])$/, '').trim();
}

function isBlankRowId(idStr) {
  if (!idStr) return false;
  const u = idStr.toString().trim().toUpperCase();
  return u.includes('BLANK') || u.includes('BLK') || u.includes('TIN');
}

function getElementThreshold(label) {
  if (label.includes('δD') || label.includes('2H')) return { bias: 1.50, sd: 1.50 };
  if (label.includes('³⁴S') || label.includes('34S')) return { bias: 0.20, sd: 0.20 };
  if (label.includes('¹⁵N') || label.includes('15N')) return { bias: 0.15, sd: 0.15 };
  if (label.includes('¹⁸O') || label.includes('18O')) return { bias: 0.12, sd: 0.12 };
  return { bias: 0.08, sd: 0.08 };
}

function getElementUnit(elemIdx) {
  const p = PRESETS[currentMode];
  if (!p.elements[elemIdx]) return "";
  if ((currentMode === "CO" && elemIdx === 1) || (currentMode === "WATER_O" && elemIdx === 0)) {
    return oxygenScale === "VSMOW" ? "‰ VSMOW" : "‰ VPDB";
  }
  return p.elements[elemIdx].unit;
}

// Navigation Dropdown & Modals
const btnToggleMore = document.getElementById('btn-toggle-more');
const moreMenuDropdown = document.getElementById('more-menu-dropdown');
const moreMenuArrow = document.getElementById('more-menu-arrow');
const moreMenuContainer = document.getElementById('more-menu-container');

function closeMoreDropdown() {
  if (moreMenuDropdown && !moreMenuDropdown.classList.contains('hidden')) {
    moreMenuDropdown.classList.add('hidden');
    moreMenuArrow.classList.remove('rotate-180');
  }
}

if (btnToggleMore) {
  btnToggleMore.addEventListener('click', (e) => {
    e.stopPropagation();
    const isHidden = moreMenuDropdown.classList.toggle('hidden');
    moreMenuArrow.classList.toggle('rotate-180', !isHidden);
  });
}

document.addEventListener('click', (e) => {
  if (moreMenuContainer && !moreMenuContainer.contains(e.target)) closeMoreDropdown();
});

function renderChangelog() {
  const container = document.getElementById('changelog-content');
  if (!container) return;
  const isEn = currentLang === 'en';
  container.innerHTML = CHANGELOG_DATA.map((rel, idx) => `
    <div class="border-l-2 ${idx === 0 ? 'border-stone-900' : 'border-stone-300'} pl-4 space-y-2 relative">
      <div class="absolute -left-[5px] top-1 w-2 h-2 rounded-full ${idx === 0 ? 'bg-stone-900 ring-4 ring-stone-100' : 'bg-stone-400'}"></div>
      <div class="flex flex-wrap items-baseline justify-between gap-2 border-b border-stone-100 pb-1">
        <div class="flex items-center space-x-2">
          <span class="font-mono font-bold text-stone-900 text-sm">${rel.version}</span>
          <span class="px-1.5 py-0.5 bg-stone-100 border border-stone-300 text-[10px] font-mono font-bold text-stone-700">${rel.badge}</span>
        </div>
        <span class="text-[11px] font-mono text-stone-400">${rel.date}</span>
      </div>
      <div>
        <h4 class="font-serif-title text-base font-semibold text-stone-900">${isEn ? rel.title_en : rel.title_ko}</h4>
        <p class="text-stone-600 font-light text-[11px] leading-relaxed">${isEn ? rel.desc_en : rel.desc_ko}</p>
      </div>
      <ul class="list-disc list-inside space-y-1.5 text-[11px] text-stone-700 font-light leading-relaxed pt-1">
        ${(isEn ? rel.changes_en : rel.changes_ko).map(c => `<li>${c}</li>`).join('')}
      </ul>
    </div>
  `).join('');
}

function captureCurrentStandardsSnapshot(mode = currentMode) {
  const p = PRESETS[mode];
  const isDual = p.elements.length === 2;
  const stds = [];
  for (let idx = 0; idx < currentAnchorCount; idx++) {
    const elName = document.getElementById(`ref-std${idx}-name`);
    const elV1 = document.getElementById(`ref-std${idx}-v1`);
    const elV2 = document.getElementById(`ref-std${idx}-v2`);
    if (elName) {
      stds.push({
        name: elName.value.trim(),
        v1: (elV1 && elV1.value !== '') ? parseFloat(elV1.value) : 0,
        v2: (isDual && elV2 && elV2.value !== '') ? parseFloat(elV2.value) : 0
      });
    }
  }
  const elQcName = document.getElementById('qc-std-name');
  const elQcV1 = document.getElementById('qc-std-v1');
  const elQcV2 = document.getElementById('qc-std-v2');
  const qcStd = {
    name: elQcName ? elQcName.value.trim() : null,
    v1: (elQcV1 && elQcV1.value !== '') ? parseFloat(elQcV1.value) : null,
    v2: (isDual && elQcV2 && elQcV2.value !== '') ? parseFloat(elQcV2.value) : null
  };
  const elAnchorSelect = document.getElementById('drift-anchor-select');
  const selectedDriftAnchor = elAnchorSelect ? parseInt(elAnchorSelect.value) : p.defaultDriftAnchorIdx;
  return { stds, qcStd, selectedDriftAnchor, oxygenScale };
}

function saveCurrentModeStandards() {
  const snap = captureCurrentStandardsSnapshot(currentMode);
  if (snap && snap.stds && snap.stds.length >= 2) {
    userCustomStandardsByMode[currentMode] = snap;
  }
}

function syncDriftAnchorDropdown() {
  const p = PRESETS[currentMode];
  const select = document.getElementById('drift-anchor-select');
  if (!select) return;
  const prevVal = select.value !== "" ? parseInt(select.value) : null;
  select.innerHTML = '';

  for (let idx = 0; idx < currentAnchorCount; idx++) {
    const nameInput = document.getElementById(`ref-std${idx}-name`);
    const fallbackStd = p.stds[idx] || { name: `Std-${idx + 1}` };
    const displayName = nameInput && nameInput.value.trim() !== '' ? nameInput.value.trim() : fallbackStd.name;
    const opt = document.createElement('option');
    opt.value = idx;
    opt.innerText = `Anchor 0${idx + 1} (${displayName})`;
    select.appendChild(opt);
  }

  const snap = userCustomStandardsByMode[currentMode];
  if (snap && snap.selectedDriftAnchor !== undefined && snap.selectedDriftAnchor < currentAnchorCount) {
    select.value = snap.selectedDriftAnchor;
  } else if (prevVal !== null && prevVal < currentAnchorCount) {
    select.value = prevVal;
  } else {
    select.value = Math.min(p.defaultDriftAnchorIdx, currentAnchorCount - 1);
  }
}

document.getElementById('btn-add-anchor').addEventListener('click', () => {
  saveCurrentModeStandards();
  const p = PRESETS[currentMode];
  const isDual = p.elements.length === 2;
  const snap = userCustomStandardsByMode[currentMode] || captureCurrentStandardsSnapshot(currentMode);
  const newIdx = snap.stds.length;
  const extraCandidate = (p.extraStds && p.extraStds[newIdx - 2]) ? p.extraStds[newIdx - 2] : null;

  let defaultV1 = extraCandidate ? extraCandidate.v1 : 0.000;
  let defaultV2 = extraCandidate && extraCandidate.v2 !== undefined ? extraCandidate.v2 : 0.000;
  if (currentMode === 'CO' && oxygenScale === 'VSMOW' && extraCandidate) {
    defaultV2 = parseFloat(vpdbToVsmow(defaultV2).toFixed(3));
  } else if (currentMode === 'WATER_O' && oxygenScale === 'VPDB' && extraCandidate) {
    defaultV1 = parseFloat(vsmowToVpdb(defaultV1).toFixed(3));
  }

  snap.stds.push({
    name: extraCandidate ? extraCandidate.name : `STD-0${newIdx + 1}`,
    v1: defaultV1,
    v2: isDual ? defaultV2 : null
  });
  userCustomStandardsByMode[currentMode] = snap;
  updateLayoutForMode(false);
});

function removeAnchorAtIndex(idxToRemove) {
  if (currentAnchorCount <= 2) return;
  saveCurrentModeStandards();
  const snap = userCustomStandardsByMode[currentMode];
  if (snap && snap.stds && snap.stds.length > 2) {
    snap.stds.splice(idxToRemove, 1);
    if (snap.selectedDriftAnchor >= snap.stds.length) snap.selectedDriftAnchor = 0;
    userCustomStandardsByMode[currentMode] = snap;
    updateLayoutForMode(false);
  }
}

function getStoredPresetsKey() {
  return `isocalib_custom_presets_${currentMode}`;
}

function getStoredPresets() {
  try {
    const raw = localStorage.getItem(getStoredPresetsKey());
    return raw ? JSON.parse(raw) : {};
  } catch (e) { return {}; }
}

function renderPresetDropdown() {
  const select = document.getElementById('user-presets-select');
  if (!select) return;
  const presets = getStoredPresets();
  select.innerHTML = `<option value="">${TRANSLATIONS[currentLang].preset_select_default}</option>`;
  Object.keys(presets).forEach(name => {
    const opt = document.createElement('option');
    opt.value = name;
    opt.innerText = name;
    select.appendChild(opt);
  });
}

document.getElementById('btn-save-preset').addEventListener('click', () => {
  const nameInput = document.getElementById('preset-save-name');
  const name = nameInput.value.trim();
  const isEn = currentLang === 'en';
  if (!name) {
    alert(isEn ? "Please enter a preset name." : "프리셋 이름을 입력해 주세요.");
    return;
  }
  const snap = captureCurrentStandardsSnapshot(currentMode);
  const presets = getStoredPresets();
  presets[name] = snap;
  localStorage.setItem(getStoredPresetsKey(), JSON.stringify(presets));
  nameInput.value = '';
  renderPresetDropdown();
  document.getElementById('user-presets-select').value = name;
  alert(isEn ? `Preset '${name}' (${snap.stds.length} anchors) saved.` : `프리셋 '${name}' (${snap.stds.length}점 앵커)이 저장되었습니다.`);
});

document.getElementById('btn-load-preset').addEventListener('click', () => {
  const select = document.getElementById('user-presets-select');
  const name = select.value;
  if (!name) {
    userCustomStandardsByMode[currentMode] = null;
    updateLayoutForMode(true);
    return;
  }
  const presets = getStoredPresets();
  if (presets[name]) {
    userCustomStandardsByMode[currentMode] = JSON.parse(JSON.stringify(presets[name]));
    if (presets[name].oxygenScale) oxygenScale = presets[name].oxygenScale;
    updateLayoutForMode(false);
  }
});

document.getElementById('btn-delete-preset').addEventListener('click', () => {
  const select = document.getElementById('user-presets-select');
  const name = select.value;
  const isEn = currentLang === 'en';
  if (!name) {
    alert(isEn ? "Please select a custom preset to delete." : "삭제할 커스텀 프리셋을 선택해 주세요.");
    return;
  }
  if (confirm(isEn ? `Delete preset '${name}'?` : `정말 '${name}' 프리셋을 삭제하시겠습니까?`)) {
    const presets = getStoredPresets();
    delete presets[name];
    localStorage.setItem(getStoredPresetsKey(), JSON.stringify(presets));
    renderPresetDropdown();
  }
});

function convertGridRowsForAreaToggle(oldAreaActive, newAreaActive) {
  if (oldAreaActive === newAreaActive || gridData.length === 0) return;
  const isDual = PRESETS[currentMode].elements.length === 2;

  gridData = gridData.map(row => {
    const id = row[0] !== undefined ? row[0] : '';
    if (!oldAreaActive && newAreaActive) {
      if (isDual) return [id, '', row[1] ?? '', row[2] ?? '', '', row[3] ?? '', row[4] ?? ''];
      return [id, '', row[1] ?? '', row[2] ?? ''];
    } else {
      if (isDual) return [id, row[2] ?? '', row[3] ?? '', row[5] ?? '', row[6] ?? ''];
      return [id, row[2] ?? '', row[3] ?? ''];
    }
  });
}

document.getElementById('area-mode').addEventListener('change', (e) => {
  closeEditingCell();
  const prevActive = isAreaActive();
  areaMode = e.target.value;
  const nextActive = isAreaActive();

  const p = PRESETS[currentMode];
  const hasAnyInput = gridData.some(r => r[0] && r[0].toString().trim() !== '');
  if (nextActive && p.demoArea && (!hasAnyInput || gridData[0][0] === p.demo[0][0])) {
    gridData = JSON.parse(JSON.stringify(p.demoArea));
    excludedRows = Array(gridData.length).fill(false);
  } else if (!nextActive && p.demoArea && hasAnyInput && gridData[0][0] === p.demoArea[0][0]) {
    gridData = JSON.parse(JSON.stringify(p.demo));
    excludedRows = Array(gridData.length).fill(false);
  } else {
    convertGridRowsForAreaToggle(prevActive, nextActive);
  }

  updateLayoutForMode(false);
  if (hasCalibratedOnce) runCalibration();
});

function updateLayoutForMode(forcePresetDefault = false) {
  const p = PRESETS[currentMode];
  const isDual = p.elements.length === 2;
  const isEn = currentLang === 'en';
  const areaOn = isAreaActive();

  const oScaleWrapper = document.getElementById('oxygen-scale-wrapper');
  if (currentMode === 'CO' || currentMode === 'WATER_O') {
    oScaleWrapper.classList.remove('hidden');
    document.getElementById('oxygen-scale-select').value = oxygenScale;
  } else {
    oScaleWrapper.classList.add('hidden');
  }

  let snapshot = (!forcePresetDefault && userCustomStandardsByMode[currentMode]) ? userCustomStandardsByMode[currentMode] : null;
  const activeStdsList = (snapshot && snapshot.stds && snapshot.stds.length >= 2) ? snapshot.stds : p.stds;
  currentAnchorCount = activeStdsList.length;

  const u1 = getElementUnit(0);
  const u2 = getElementUnit(1);
  const stdContainer = document.getElementById('std-input-container');
  stdContainer.innerHTML = '';

  activeStdsList.forEach((std, idx) => {
    const valName = std.name ?? `STD-0${idx + 1}`;
    let valV1 = (std.v1 !== null && !isNaN(std.v1)) ? std.v1 : 0;
    let valV2 = (std.v2 !== null && !isNaN(std.v2)) ? std.v2 : 0;

    if (!snapshot) {
      if (currentMode === 'CO' && oxygenScale === 'VSMOW') valV2 = parseFloat(vpdbToVsmow(valV2).toFixed(3));
      if (currentMode === 'WATER_O' && oxygenScale === 'VPDB') valV1 = parseFloat(vsmowToVpdb(valV1).toFixed(3));
    }

    const canRemove = idx >= 2;
    const div = document.createElement('div');
    div.className = 'bg-white p-4 border border-[#d1cfc7] flex flex-col space-y-3 shadow-sm relative';
    div.innerHTML = `
      <div class="flex items-center justify-between border-b border-stone-200 pb-1.5">
        <div class="flex items-center space-x-1.5">
          <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-500">${isEn ? 'Anchor Standard' : '앵커 표준물질'} 0${idx+1}</span>
          ${canRemove ? `<button type="button" data-remove-anchor="${idx}" class="text-rose-600 hover:text-rose-800 font-mono text-xs font-bold px-1 cursor-pointer">&times;</button>` : ''}
        </div>
        <input type="text" id="ref-std${idx}-name" value="${valName}" class="w-32 text-xs font-bold text-stone-900 border-b border-stone-400 focus:border-stone-900 outline-none text-right font-mono bg-transparent">
      </div>
      <div class="flex items-center gap-4">
        <div class="flex-1 space-y-1">
          <div class="flex justify-between text-[11px] text-stone-600 font-medium">
            <span>${p.elements[0].label} ${isEn ? 'True' : '참값'}</span>
            <span class="text-stone-400 font-mono text-[10px]">${u1}</span>
          </div>
          <input type="number" step="0.001" id="ref-std${idx}-v1" value="${valV1}" class="w-full bg-[#fbfaf8] border border-[#c7c5bc] px-2.5 py-1 text-xs font-data font-semibold text-stone-900 focus:border-stone-900 outline-none">
        </div>
        ${isDual ? `
        <div class="flex-1 space-y-1">
          <div class="flex justify-between text-[11px] text-stone-600 font-medium">
            <span>${p.elements[1].label} ${isEn ? 'True' : '참값'}</span>
            <span class="text-stone-400 font-mono text-[10px]">${u2}</span>
          </div>
          <input type="number" step="0.001" id="ref-std${idx}-v2" value="${valV2}" class="w-full bg-[#fbfaf8] border border-[#c7c5bc] px-2.5 py-1 text-xs font-data font-semibold text-stone-900 focus:border-stone-900 outline-none">
        </div>` : ''}
      </div>
    `;
    stdContainer.appendChild(div);
  });

  const snapQc = snapshot && snapshot.qcStd;
  const qcName = (snapQc && snapQc.name) ? snapQc.name : (p.qcStd ? p.qcStd.name : 'QC');
  let qcV1 = (snapQc && snapQc.v1 !== null && !isNaN(snapQc.v1)) ? snapQc.v1 : (p.qcStd ? p.qcStd.v1 : 0);
  let qcV2 = (snapQc && snapQc.v2 !== null && !isNaN(snapQc.v2)) ? snapQc.v2 : (p.qcStd && p.qcStd.v2 !== undefined ? p.qcStd.v2 : 0);
  if (!snapQc) {
    if (currentMode === 'CO' && oxygenScale === 'VSMOW') qcV2 = parseFloat(vpdbToVsmow(qcV2).toFixed(3));
    if (currentMode === 'WATER_O' && oxygenScale === 'VPDB') qcV1 = parseFloat(vsmowToVpdb(qcV1).toFixed(3));
  }

  const qcDiv = document.createElement('div');
  qcDiv.className = 'bg-[#fcfdfc] p-4 border border-emerald-300 flex flex-col space-y-3 shadow-sm';
  qcDiv.innerHTML = `
    <div class="flex items-center justify-between border-b border-emerald-200 pb-1.5">
      <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> ${isEn ? 'QC Check Standard' : '품질관리(QC) 검증 표준'}
      </span>
      <input type="text" id="qc-std-name" value="${qcName}" class="w-28 text-xs font-bold text-emerald-950 border-b border-emerald-400 focus:border-emerald-800 outline-none text-right font-mono bg-transparent">
    </div>
    <div class="flex items-center gap-4">
      <div class="flex-1 space-y-1">
        <div class="flex justify-between text-[11px] text-stone-600 font-medium">
          <span>${p.elements[0].label} ${isEn ? 'Accepted' : '공인값'}</span>
          <span class="text-stone-400 font-mono text-[10px]">${u1}</span>
        </div>
        <input type="number" step="0.001" id="qc-std-v1" value="${qcV1}" class="w-full bg-white border border-emerald-300 px-2.5 py-1 text-xs font-data font-semibold text-stone-900 focus:border-emerald-800 outline-none">
      </div>
      ${isDual ? `
      <div class="flex-1 space-y-1">
        <div class="flex justify-between text-[11px] text-stone-600 font-medium">
          <span>${p.elements[1].label} ${isEn ? 'Accepted' : '공인값'}</span>
          <span class="text-stone-400 font-mono text-[10px]">${u2}</span>
        </div>
        <input type="number" step="0.001" id="qc-std-v2" value="${qcV2}" class="w-full bg-white border border-emerald-300 px-2.5 py-1 text-xs font-data font-semibold text-stone-900 focus:border-emerald-800 outline-none">
      </div>` : ''}
    </div>
  `;
  stdContainer.appendChild(qcDiv);

  syncDriftAnchorDropdown();
  renderPresetDropdown();

  stdContainer.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', () => {
      saveCurrentModeStandards();
      syncDriftAnchorDropdown();
    });
  });

  stdContainer.querySelectorAll('[data-remove-anchor]').forEach(btn => {
    btn.addEventListener('click', (e) => removeAnchorAtIndex(parseInt(e.currentTarget.getAttribute('data-remove-anchor'))));
  });

  document.getElementById('drift-anchor-select').addEventListener('change', saveCurrentModeStandards);

  // Grid Header
  const gHead = document.getElementById('grid-head');
  if (isDual) {
    gHead.innerHTML = `
      <tr>
        <th class="w-9 px-1.5 py-2 text-center text-stone-500 border-r border-[#d1cfc7] font-mono">#</th>
        <th class="w-9 px-1 py-2 text-center text-stone-700 border-r border-[#d1cfc7] font-mono">Use</th>
        <th class="px-2.5 py-2 border-r border-[#d1cfc7]">${isEn ? 'Sample / Std ID' : '시료/표준 ID'}</th>
        ${areaOn ? `<th class="px-2 py-2 border-r border-[#d1cfc7] text-sky-900 bg-sky-50/60">Area ${p.elements[0].label}</th>` : ''}
        <th class="px-2.5 py-2 border-r border-[#d1cfc7]">Raw ${p.elements[0].label}</th>
        <th class="px-2 py-2 border-r border-[#d1cfc7] text-stone-900">1σ SD</th>
        ${areaOn ? `<th class="px-2 py-2 border-r border-[#d1cfc7] text-sky-900 bg-sky-50/60">Area ${p.elements[1].label}</th>` : ''}
        <th class="px-2.5 py-2 border-r border-[#d1cfc7]">Raw ${p.elements[1].label}</th>
        <th class="px-2 py-2 text-stone-900">1σ SD</th>
      </tr>
    `;
  } else {
    gHead.innerHTML = `
      <tr>
        <th class="w-10 px-2 py-2 text-center text-stone-500 border-r border-[#d1cfc7] font-mono">#</th>
        <th class="w-10 px-1.5 py-2 text-center text-stone-700 border-r border-[#d1cfc7] font-mono">Use</th>
        <th class="px-3.5 py-2 border-r border-[#d1cfc7]">${isEn ? 'Sample / Std ID' : '시료/표준물질 ID'}</th>
        ${areaOn ? `<th class="px-3 py-2 border-r border-[#d1cfc7] text-sky-900 bg-sky-50/60">Area (Vs/mV)</th>` : ''}
        <th class="px-3.5 py-2 border-r border-[#d1cfc7]">Raw ${p.elements[0].label}</th>
        <th class="px-3 py-2 text-stone-900">1σ SD</th>
      </tr>
    `;
  }

  // Regression Cards
  const pContainer = document.getElementById('param-cards-container');
  const cardHtml = (elem, idx, unitLabel) => `
    <div class="border border-[#c7c5bc] bg-white p-4 space-y-3 shadow-sm">
      <div class="flex justify-between items-baseline">
        <span class="text-xs font-mono font-bold uppercase tracking-wider text-stone-600 block">${elem.label} ${isEn ? 'Geostat Model' : '지화학 모델 통계'}</span>
        <span class="text-[10px] font-mono text-stone-400">${unitLabel}</span>
      </div>
      <div class="space-y-1.5 text-xs font-data">
        <div class="flex justify-between border-b border-stone-100 pb-1"><span class="text-stone-500 font-sans">${isEn ? 'Slope (a)' : '기울기 (a)'}</span> <strong id="p${idx}-slope" class="text-stone-900 font-semibold">-</strong></div>
        <div class="flex justify-between border-b border-stone-100 pb-1"><span class="text-stone-500 font-sans">${isEn ? 'Intercept (b)' : '절편 (b)'}</span> <strong id="p${idx}-intercept" class="text-stone-900 font-semibold">-</strong></div>
        <div class="flex justify-between border-b border-stone-100 pb-1"><span class="text-stone-500 font-sans">${isEn ? 'Slope SE (1σ)' : '기울기 표준오차'}</span> <span id="p${idx}-se" class="text-stone-700 font-medium">-</span></div>
        <div class="flex justify-between items-center border-b border-stone-100 pb-1"><span class="text-stone-500 font-sans">MSWD (Reduced χ²)</span> <strong id="p${idx}-mswd" class="text-cyan-900 font-bold">-</strong></div>
        <div class="flex justify-between pt-0.5"><span class="text-stone-500 font-sans">${isEn ? 'Weighted R²' : '가중 결정계수 R²'}</span> <strong id="p${idx}-r2" class="text-emerald-800 font-bold">-</strong></div>
      </div>
    </div>
  `;

  const diagTitle = (areaMode === 'linearity' || areaMode === 'blank_lin') ? 'Size Linearity Diagnostics' : 'Drift Diagnostics';
  if (isDual) {
    pContainer.className = "grid grid-cols-2 gap-4";
    pContainer.innerHTML = cardHtml(p.elements[0], 1, u1) + cardHtml(p.elements[1], 2, u2);
    document.getElementById('plot-2-box').style.display = 'block';
    document.getElementById('plot-drift-box-2').style.display = 'block';
    document.getElementById('plot-drift-1-tag').innerText = `Figure 3 · ${p.elements[0].label} ${diagTitle}`;
    document.getElementById('plot-drift-2-tag').innerText = `Figure 4 · ${p.elements[1].label} ${diagTitle}`;
  } else {
    pContainer.className = "grid grid-cols-1 gap-4";
    pContainer.innerHTML = cardHtml(p.elements[0], 1, u1);
    document.getElementById('plot-2-box').style.display = 'none';
    document.getElementById('plot-drift-box-2').style.display = 'none';
    document.getElementById('plot-drift-1-tag').innerText = `Figure 3 · ${p.elements[0].label} ${diagTitle}`;
  }

  const rHead = document.getElementById('result-head');
  if (isDual) {
    rHead.innerHTML = `
      <tr>
        <th class="px-4 py-2.5 border-r border-[#d1cfc7]">${isEn ? 'Sample ID' : '시료 ID'}</th>
        <th class="px-3.5 py-2.5 border-r border-[#d1cfc7]">Raw ${p.elements[0].label}</th>
        <th class="px-3.5 py-2.5 border-r border-[#d1cfc7]">Raw ${p.elements[1].label}</th>
        <th class="px-3.5 py-2.5 border-r border-[#d1cfc7] bg-stone-100/70 font-bold text-stone-900">${isEn ? 'Calibrated' : '보정값'} ${p.elements[0].label} (${u1})</th>
        <th class="px-3 py-2.5 border-r border-[#d1cfc7] text-stone-600">± 1σ</th>
        <th class="px-3.5 py-2.5 border-r border-[#d1cfc7] bg-stone-100/70 font-bold text-stone-900">${isEn ? 'Calibrated' : '보정값'} ${p.elements[1].label} (${u2})</th>
        <th class="px-3.5 py-2.5 text-stone-600">± 1σ</th>
      </tr>
    `;
  } else {
    rHead.innerHTML = `
      <tr>
        <th class="px-4 py-2.5 border-r border-[#d1cfc7]">${isEn ? 'Sample ID' : '시료 ID'}</th>
        <th class="px-4 py-2.5 border-r border-[#d1cfc7]">Raw ${p.elements[0].label}</th>
        <th class="px-4 py-2.5 border-r border-[#d1cfc7] bg-stone-100/70 font-bold text-stone-900">${isEn ? 'Calibrated' : '보정값'} ${p.elements[0].label} (${u1})</th>
        <th class="px-4 py-2.5 text-stone-600">± 1σ</th>
      </tr>
    `;
  }

  const gSummaryHead = document.getElementById('grouped-head');
  if (isDual) {
    gSummaryHead.innerHTML = `
      <tr>
        <th class="px-4 py-2.5 border-r border-[#d1cfc7]">${isEn ? 'Sample Base ID' : '시료명 (Base ID)'}</th>
        <th class="px-3 py-2.5 border-r border-[#d1cfc7] text-center font-mono">Rep. (n)</th>
        <th class="px-4 py-2.5 border-r border-[#d1cfc7] bg-stone-100/70 font-bold text-stone-900">Mean ${p.elements[0].label} (${u1})</th>
        <th class="px-3.5 py-2.5 border-r border-[#d1cfc7] text-stone-600">Rep. 1σ SD</th>
        <th class="px-4 py-2.5 border-r border-[#d1cfc7] bg-stone-100/70 font-bold text-stone-900">Mean ${p.elements[1].label} (${u2})</th>
        <th class="px-3.5 py-2.5 text-stone-700">Rep. 1σ SD</th>
      </tr>
    `;
  } else {
    gSummaryHead.innerHTML = `
      <tr>
        <th class="px-4 py-2.5 border-r border-[#d1cfc7]">${isEn ? 'Sample Base ID' : '시료명 (Base ID)'}</th>
        <th class="px-3 py-2.5 border-r border-[#d1cfc7] text-center font-mono">Rep. (n)</th>
        <th class="px-4 py-2.5 border-r border-[#d1cfc7] bg-stone-100/70 font-bold text-stone-900">Mean ${p.elements[0].label} (${u1})</th>
        <th class="px-4 py-2.5 text-stone-600">Rep. 1σ SD</th>
      </tr>
    `;
  }

  const numCols = getNumDataCols();
  if (gridData.length === 0) {
    gridData = Array.from({ length: 30 }, () => Array(numCols).fill(''));
    excludedRows = Array(30).fill(false);
  }
  renderGrid();
  resetOutputs();
}

function switchTab(target) {
  currentTab = target;
  const btnSeq = document.getElementById('tab-btn-sequence');
  const btnGrp = document.getElementById('tab-btn-grouped');
  const contentSeq = document.getElementById('tab-content-sequence');
  const contentGrp = document.getElementById('tab-content-grouped');
  if (target === 'sequence') {
    btnSeq.className = 'px-4 py-2 font-bold bg-white border-t-2 border-stone-900 text-stone-900 border-x border-[#d1cfc7] -mb-px transition cursor-pointer';
    btnGrp.className = 'px-4 py-2 font-semibold text-stone-500 hover:text-stone-900 border-t-2 border-transparent transition cursor-pointer';
    contentSeq.classList.remove('hidden');
    contentGrp.classList.add('hidden');
  } else {
    btnGrp.className = 'px-4 py-2 font-bold bg-white border-t-2 border-stone-900 text-stone-900 border-x border-[#d1cfc7] -mb-px transition cursor-pointer';
    btnSeq.className = 'px-4 py-2 font-semibold text-stone-500 hover:text-stone-900 border-t-2 border-transparent transition cursor-pointer';
    contentGrp.classList.remove('hidden');
    contentSeq.classList.add('hidden');
  }
}

document.getElementById('tab-btn-sequence').addEventListener('click', () => switchTab('sequence'));
document.getElementById('tab-btn-grouped').addEventListener('click', () => switchTab('grouped'));

document.getElementById('oxygen-scale-select').addEventListener('change', (e) => {
  const newScale = e.target.value;
  if (newScale === oxygenScale || (currentMode !== "CO" && currentMode !== "WATER_O")) return;
  const targetProp = currentMode === "CO" ? "v2" : "v1";

  for (let idx = 0; idx < currentAnchorCount; idx++) {
    const elV = document.getElementById(`ref-std${idx}-${targetProp}`);
    if (elV && elV.value !== '') {
      const curVal = parseFloat(elV.value);
      const converted = newScale === 'VSMOW' ? vpdbToVsmow(curVal) : vsmowToVpdb(curVal);
      elV.value = converted.toFixed(3);
    }
  }
  const elQcV = document.getElementById(`qc-std-${targetProp}`);
  if (elQcV && elQcV.value !== '') {
    const curVal = parseFloat(elQcV.value);
    const converted = newScale === 'VSMOW' ? vpdbToVsmow(curVal) : vsmowToVpdb(curVal);
    elQcV.value = converted.toFixed(3);
  }
  oxygenScale = newScale;
  saveCurrentModeStandards();
  updateLayoutForMode(false);
  if (hasCalibratedOnce) runCalibration();
});

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('isocalib_lang', lang);
  const btnKo = document.getElementById('lang-ko');
  const btnEn = document.getElementById('lang-en');
  if (lang === 'ko') {
    btnKo.className = 'px-2 py-0.5 bg-stone-900 text-white transition cursor-pointer';
    btnEn.className = 'px-2 py-0.5 text-stone-600 hover:text-stone-900 transition cursor-pointer';
  } else {
    btnEn.className = 'px-2 py-0.5 bg-stone-900 text-white transition cursor-pointer';
    btnKo.className = 'px-2 py-0.5 text-stone-600 hover:text-stone-900 transition cursor-pointer';
  }

  const dict = TRANSLATIONS[lang];
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) el.innerHTML = dict[key];
  });

  document.getElementById('about-p1').innerHTML = dict.about_p1;
  document.getElementById('about-p2').innerHTML = dict.about_p2;
  document.getElementById('about-p3').innerHTML = dict.about_p3;
  document.getElementById('about-protocols-title').innerText = dict.about_protocols_title;

  const listEl = document.getElementById('about-protocols-list');
  if (lang === 'ko') {
    listEl.innerHTML = `
      <li>EA-IRMS 피크 면적 선형성(Size Linearity) 회귀 및 주석 캡슐 블랭크(Blank) 질량 보존 차감</li>
      <li>시퀀스 런 순서(#)를 유지하는 비파괴 이상치(Outlier) 개별 제외 토글 시스템</li>
      <li>2점(Two-Point) 및 3점 이상 다중 앵커(Multi-Point) 가중 선형 회귀(WLS) 동적 확장</li>
      <li>수소(δD), 탄소(δ¹³C), 질소(δ¹⁵N), 산소(δ¹⁸O) 원소별 스마트 QC 진단 엔진</li>
      <li>ExcelJS 통합 엔진을 통한 엑셀 내 고해상도 검량선/진단 그림 자동 삽입</li>
    `;
  } else {
    listEl.innerHTML = `
      <li>EA-IRMS Peak Area size-linearity normalization & mass-balance Tin Capsule Blank subtraction</li>
      <li>Sequence-preserving outlier exclusion checkbox ('Use ✓') with instant live recalibration</li>
      <li>Dynamic 2-point and 3+ multi-point Weighted Least Squares (WLS) anchor calibration</li>
      <li>Element-specific smart QC diagnostic engine adapting to δD, δ¹³C, δ¹⁵N, and δ¹⁸O tolerances</li>
      <li>ExcelJS engine for embedding publication figures & diagnostics into Excel</li>
    `;
  }

  renderChangelog();
  saveCurrentModeStandards();
  updateLayoutForMode(false);
  switchTab(currentTab);
  if (window.MathJax && window.MathJax.typesetPromise) window.MathJax.typesetPromise();
}

document.getElementById('lang-ko').addEventListener('click', () => setLanguage('ko'));
document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));

// Modals
const quickstartModal = document.getElementById('quickstart-modal');
const aboutModal = document.getElementById('about-modal');
const changelogModal = document.getElementById('changelog-modal');

document.getElementById('btn-open-quickstart').addEventListener('click', () => { closeMoreDropdown(); quickstartModal.classList.remove('hidden'); });
document.getElementById('btn-close-quickstart').addEventListener('click', () => quickstartModal.classList.add('hidden'));
document.getElementById('btn-quickstart-close-bottom').addEventListener('click', () => quickstartModal.classList.add('hidden'));

document.getElementById('btn-open-about').addEventListener('click', () => { closeMoreDropdown(); aboutModal.classList.remove('hidden'); });
document.getElementById('btn-close-about').addEventListener('click', () => aboutModal.classList.add('hidden'));
document.getElementById('btn-modal-close-bottom').addEventListener('click', () => aboutModal.classList.add('hidden'));

document.getElementById('btn-open-changelog').addEventListener('click', () => { closeMoreDropdown(); renderChangelog(); changelogModal.classList.remove('hidden'); });
document.getElementById('btn-close-changelog').addEventListener('click', () => changelogModal.classList.add('hidden'));
document.getElementById('btn-changelog-close-bottom').addEventListener('click', () => changelogModal.classList.add('hidden'));

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeMoreDropdown();
    quickstartModal.classList.add('hidden');
    aboutModal.classList.add('hidden');
    changelogModal.classList.add('hidden');
  }
});

function resetOutputs() {
  const isEn = currentLang === 'en';
  const waitMsg = `<span class="text-xs text-stone-400 font-serif-title italic">${isEn ? 'Awaiting data computation...' : '데이터 계산 대기 중...'}</span>`;
  document.getElementById('plot-1').innerHTML = waitMsg;
  document.getElementById('plot-2').innerHTML = waitMsg;
  document.getElementById('plot-drift-1').innerHTML = waitMsg;
  document.getElementById('plot-drift-2').innerHTML = waitMsg;
  document.getElementById('result-body').innerHTML = `<tr><td colspan="7" class="px-6 py-12 text-center text-xs font-serif-title italic text-stone-400">${TRANSLATIONS[currentLang].result_empty}</td></tr>`;
  document.getElementById('grouped-body').innerHTML = `<tr><td colspan="7" class="px-6 py-12 text-center text-xs font-serif-title italic text-stone-400">${TRANSLATIONS[currentLang].grouped_empty}</td></tr>`;
  document.getElementById('qc-summary-banner').classList.add('hidden');
  groupedSummaryData = [];
  sequenceExportData = [];
  lastQcSummaryReport = null;
  hasCalibratedOnce = false;
}

function renderGrid() {
  const gridBody = document.getElementById('grid-body');
  gridBody.innerHTML = '';
  const numCols = getNumDataCols();

  while (excludedRows.length < gridData.length) excludedRows.push(false);

  gridData.forEach((row, rIdx) => {
    const isExcl = !!excludedRows[rIdx];
    const tr = document.createElement('tr');
    tr.className = `hover:bg-stone-50/60 transition-colors ${isExcl ? 'row-excluded' : ''}`;
    tr.dataset.r = rIdx;

    const tdIdx = document.createElement('td');
    tdIdx.className = 'row-header px-1.5 py-1.5 text-center text-stone-400 border-r border-[#e5e3dc] select-none bg-[#fbfaf8] text-xs font-mono font-medium cursor-pointer hover:bg-stone-200';
    tdIdx.innerText = String(rIdx + 1).padStart(2, '0');
    tdIdx.dataset.r = rIdx;

    tdIdx.addEventListener('mousedown', (e) => {
      if (e.button !== 0 && e.button !== 2) return;
      closeEditingCell();
      isMouseDown = true;
      isSelectingRows = true;
      dragStart = { r: rIdx, c: 0 };
      dragEnd = { r: rIdx, c: numCols - 1 };
      updateSelectionRange();
      syncPasteTarget();
      e.preventDefault();
    });
    tr.appendChild(tdIdx);

    const tdUse = document.createElement('td');
    tdUse.className = 'px-1 py-1.5 text-center border-r border-[#e5e3dc] bg-[#fbfaf8] select-none';
    const chk = document.createElement('input');
    chk.type = 'checkbox';
    chk.checked = !isExcl;
    chk.className = 'w-3.5 h-3.5 accent-stone-900 cursor-pointer rounded-none align-middle';
    chk.addEventListener('change', (e) => {
      excludedRows[rIdx] = !e.target.checked;
      tr.classList.toggle('row-excluded', excludedRows[rIdx]);
      updateRowCountLabel();
      if (hasCalibratedOnce) runCalibration();
    });
    tdUse.appendChild(chk);
    tr.appendChild(tdUse);

    for (let cIdx = 0; cIdx < numCols; cIdx++) {
      const val = row[cIdx];
      const td = document.createElement('td');
      td.className = 'px-2.5 py-1.5 border-r border-[#e5e3dc] grid-cell text-xs font-data';
      td.dataset.r = rIdx;
      td.dataset.c = cIdx;
      td.innerText = val !== null && val !== undefined ? val : '';

      td.addEventListener('mousedown', (e) => {
        if (e.button !== 0 && e.button !== 2) return;
        if (td === activeEditingCell) return;
        closeEditingCell();
        isMouseDown = true;
        isSelectingRows = false;
        dragStart = { r: rIdx, c: cIdx };
        dragEnd = { r: rIdx, c: cIdx };
        updateSelectionRange();
        syncPasteTarget();
      });

      td.addEventListener('dblclick', () => openEditingCell(td));
      tr.appendChild(td);
    }
    gridBody.appendChild(tr);
  });

  updateRowCountLabel();
  applySelectionVisuals();
}

function updateRowCountLabel() {
  const exCount = excludedRows.filter(Boolean).length;
  const labelEl = document.getElementById('row-count');
  if (!labelEl) return;
  labelEl.innerText = exCount > 0 ? `${gridData.length} rows (${exCount} excluded)` : `${gridData.length} samples loaded`;
}

function syncPasteTarget() {
  const active = document.activeElement;
  if (active && (active.tagName === 'SELECT' || active.tagName === 'INPUT' || active.tagName === 'BUTTON')) return;
  const pt = document.getElementById('paste-target');
  pt.value = '';
  pt.focus({ preventScroll: true });
}

function openEditingCell(td) {
  activeEditingCell = td;
  td.contentEditable = 'true';
  td.classList.add('cell-editing');
  td.focus();
  const range = document.createRange();
  range.selectNodeContents(td);
  range.collapse(false);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
  const blurHandler = () => {
    closeEditingCell();
    td.removeEventListener('blur', blurHandler);
  };
  td.addEventListener('blur', blurHandler);
}

function closeEditingCell() {
  if (!activeEditingCell) return;
  activeEditingCell.contentEditable = 'false';
  activeEditingCell.classList.remove('cell-editing');
  const r = parseInt(activeEditingCell.dataset.r);
  const c = parseInt(activeEditingCell.dataset.c);
  const rawText = activeEditingCell.innerText.trim();
  gridData[r][c] = c === 0 ? rawText : (rawText === '' ? '' : (isNaN(Number(rawText)) ? rawText : Number(rawText)));
  activeEditingCell = null;
}

window.addEventListener('mousemove', (e) => {
  if (!isMouseDown) return;
  const target = document.elementFromPoint(e.clientX, e.clientY);
  if (!target) return;
  const numCols = getNumDataCols();
  if (isSelectingRows) {
    const rowEl = target.closest('tr');
    if (rowEl && rowEl.dataset.r !== undefined) {
      dragEnd = { r: parseInt(rowEl.dataset.r), c: numCols - 1 };
      updateSelectionRange();
    }
  } else {
    const cellEl = target.closest('.grid-cell');
    if (cellEl && cellEl.dataset.r !== undefined && cellEl.dataset.c !== undefined) {
      dragEnd = { r: parseInt(cellEl.dataset.r), c: parseInt(cellEl.dataset.c) };
      updateSelectionRange();
    }
  }
});

window.addEventListener('mouseup', (e) => {
  isMouseDown = false;
  const t = e.target;
  if (t && (t.tagName === 'SELECT' || t.tagName === 'INPUT' || t.tagName === 'BUTTON' || t.closest('select') || t.closest('input'))) return;
  if (!activeEditingCell) syncPasteTarget();
});

function updateSelectionRange() {
  selectedCellRange = {
    minR: Math.min(dragStart.r, dragEnd.r),
    maxR: Math.max(dragStart.r, dragEnd.r),
    minC: Math.min(dragStart.c, dragEnd.c),
    maxC: Math.max(dragStart.c, dragEnd.c)
  };
  applySelectionVisuals();
}

function applySelectionVisuals() {
  document.querySelectorAll('.grid-cell').forEach(cell => cell.classList.remove('cell-selected', 'cell-primary'));
  document.querySelectorAll('.row-header').forEach(rh => rh.classList.remove('row-selected'));
  if (!selectedCellRange) return;
  const { minR, maxR, minC, maxC } = selectedCellRange;

  document.querySelectorAll('.row-header').forEach(rh => {
    const r = parseInt(rh.dataset.r);
    if (r >= minR && r <= maxR) rh.classList.add('row-selected');
  });

  document.querySelectorAll('.grid-cell').forEach(cell => {
    const r = parseInt(cell.dataset.r);
    const c = parseInt(cell.dataset.c);
    if (r >= minR && r <= maxR && c >= minC && c <= maxC) cell.classList.add('cell-selected');
    if (r === dragStart.r && c === dragStart.c) cell.classList.add('cell-primary');
  });
}

window.addEventListener('paste', (e) => {
  const active = document.activeElement;
  if (active && (active.tagName === 'INPUT' || (active.tagName === 'TEXTAREA' && active.id !== 'paste-target'))) return;
  if (activeEditingCell) return;
  e.preventDefault();
  const clipboardText = (e.clipboardData || window.clipboardData).getData('text');
  if (!clipboardText) return;
  handlePaste(clipboardText, selectedCellRange ? selectedCellRange.minR : 0, selectedCellRange ? selectedCellRange.minC : 0);
});

function handlePaste(text, startR, startC) {
  const numCols = getNumDataCols();
  const rows = text.trim().split(/\r\n|\n|\r/);
  while (gridData.length < startR + rows.length) {
    gridData.push(Array(numCols).fill(''));
    excludedRows.push(false);
  }
  rows.forEach((rText, i) => {
    const trIdx = startR + i;
    if (!gridData[trIdx]) {
      gridData[trIdx] = Array(numCols).fill('');
      excludedRows[trIdx] = false;
    }
    const cols = rText.split('\t');
    cols.forEach((cText, j) => {
      const tcIdx = startC + j;
      if (tcIdx < numCols) {
        const v = cText.trim();
        gridData[trIdx][tcIdx] = tcIdx === 0 ? v : (v === '' ? '' : (isNaN(Number(v)) ? v : Number(v)));
      }
    });
  });

  dragStart = { r: startR, c: startC };
  dragEnd = {
    r: Math.min(startR + rows.length - 1, gridData.length - 1),
    c: Math.min(startC + rows[0].split('\t').length - 1, numCols - 1)
  };
  updateSelectionRange();
  renderGrid();
  syncPasteTarget();
}

window.addEventListener('keydown', (e) => {
  const active = document.activeElement;
  if (active && (active.tagName === 'INPUT' || active.tagName === 'SELECT')) return;
  if (activeEditingCell) {
    if (e.key === 'Enter') {
      e.preventDefault();
      const nextR = Math.min(parseInt(activeEditingCell.dataset.r) + 1, gridData.length - 1);
      const c = parseInt(activeEditingCell.dataset.c);
      closeEditingCell();
      dragStart = { r: nextR, c };
      dragEnd = { r: nextR, c };
      updateSelectionRange();
      syncPasteTarget();
    }
    return;
  }
  if (!selectedCellRange) return;
  const { minR, maxR, minC, maxC } = selectedCellRange;
  const numCols = getNumDataCols();

  if (e.key === 'Delete' || e.key === 'Backspace') {
    e.preventDefault();
    for (let r = minR; r <= maxR; r++) {
      for (let c = minC; c <= maxC; c++) gridData[r][c] = '';
    }
    renderGrid();
    syncPasteTarget();
    return;
  }

  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
    e.preventDefault();
    let curR = dragStart.r, curC = dragStart.c;
    if (e.key === 'ArrowUp') curR = Math.max(0, curR - 1);
    else if (e.key === 'ArrowDown') curR = Math.min(gridData.length - 1, curR + 1);
    else if (e.key === 'ArrowLeft') curC = Math.max(0, curC - 1);
    else if (e.key === 'ArrowRight' || (e.key === 'Tab' && !e.shiftKey)) curC = Math.min(numCols - 1, curC + 1);
    else if (e.key === 'Tab' && e.shiftKey) curC = Math.max(0, curC - 1);
    dragStart = { r: curR, c: curC };
    dragEnd = { r: curR, c: curC };
    updateSelectionRange();
    syncPasteTarget();
    return;
  }

  if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
    const targetTd = document.querySelector(`.grid-cell[data-r="${dragStart.r}"][data-c="${dragStart.c}"]`);
    if (targetTd) {
      targetTd.innerText = '';
      openEditingCell(targetTd);
    }
  }
});

function deleteSelectedRows() {
  if (!selectedCellRange) return;
  const { minR, maxR } = selectedCellRange;
  gridData.splice(minR, maxR - minR + 1);
  excludedRows.splice(minR, maxR - minR + 1);
  const numCols = getNumDataCols();
  while (gridData.length < 10) {
    gridData.push(Array(numCols).fill(''));
    excludedRows.push(false);
  }
  dragStart = { r: Math.min(minR, gridData.length - 1), c: 0 };
  dragEnd = { r: dragStart.r, c: numCols - 1 };
  updateSelectionRange();
  renderGrid();
  syncPasteTarget();
}

const contextMenu = document.getElementById('grid-context-menu');
document.getElementById('interactive-grid').addEventListener('contextmenu', (e) => {
  e.preventDefault();
  if (!selectedCellRange) return;
  contextMenu.style.left = `${e.clientX}px`;
  contextMenu.style.top = `${e.clientY}px`;
  contextMenu.classList.remove('hidden');
});
window.addEventListener('click', () => contextMenu.classList.add('hidden'));

document.getElementById('ctx-toggle-exclude').addEventListener('click', () => {
  if (!selectedCellRange) return;
  const { minR, maxR } = selectedCellRange;
  const shouldExclude = !excludedRows[minR];
  for (let r = minR; r <= maxR; r++) excludedRows[r] = shouldExclude;
  renderGrid();
  if (hasCalibratedOnce) runCalibration();
  contextMenu.classList.add('hidden');
});
document.getElementById('ctx-del-rows').addEventListener('click', () => { deleteSelectedRows(); contextMenu.classList.add('hidden'); });
document.getElementById('ctx-clear-values').addEventListener('click', () => {
  if (!selectedCellRange) return;
  const { minR, maxR, minC, maxC } = selectedCellRange;
  for (let r = minR; r <= maxR; r++) for (let c = minC; c <= maxC; c++) gridData[r][c] = '';
  renderGrid();
  syncPasteTarget();
  contextMenu.classList.add('hidden');
});
document.getElementById('ctx-insert-below').addEventListener('click', () => {
  if (!selectedCellRange) return;
  const insertAt = selectedCellRange.maxR + 1;
  gridData.splice(insertAt, 0, Array(getNumDataCols()).fill(''));
  excludedRows.splice(insertAt, 0, false);
  renderGrid();
  syncPasteTarget();
  contextMenu.classList.add('hidden');
});
document.getElementById('btn-delete-selected').addEventListener('click', deleteSelectedRows);

// -------------------------------------------------------------
// Statistical Solvers (WLS, OLS & Interpolated Drift)
// -------------------------------------------------------------
function calcWLS(xArr, yArr, sdArr) {
  const n = xArr.length;
  if (n < 2) return { slope: 0, intercept: 0, r2: 0, seSlope: 0, seIntercept: 0, mswd: 0, chi2: 0 };
  let sumW = 0, sumWX = 0, sumWY = 0, sumWXY = 0, sumWX2 = 0;
  for (let i = 0; i < n; i++) {
    const sd = (sdArr[i] && sdArr[i] > 0) ? sdArr[i] : 0.03;
    const w = 1 / (sd * sd);
    sumW += w; sumWX += w * xArr[i]; sumWY += w * yArr[i];
    sumWXY += w * xArr[i] * yArr[i]; sumWX2 += w * xArr[i] * xArr[i];
  }
  const delta = sumW * sumWX2 - sumWX * sumWX;
  const slope = (sumW * sumWXY - sumWX * sumWY) / delta;
  const intercept = (sumWX2 * sumWY - sumWX * sumWXY) / delta;

  let chi2 = 0;
  for (let i = 0; i < n; i++) {
    const sd = (sdArr[i] && sdArr[i] > 0) ? sdArr[i] : 0.03;
    const w = 1 / (sd * sd);
    const diff = yArr[i] - (slope * xArr[i] + intercept);
    chi2 += w * diff * diff;
  }
  const df = n - 2;
  const mswd = (df > 0) ? (chi2 / df) : 1;
  const s2 = (df > 0) ? (chi2 / df) : 1;
  const seSlope = Math.sqrt(s2 * (sumW / delta));
  const seIntercept = Math.sqrt(s2 * (sumWX2 / delta));

  const meanY = sumWY / sumW;
  let ssTot = 0, ssRes = 0;
  for (let i = 0; i < n; i++) {
    const sd = (sdArr[i] && sdArr[i] > 0) ? sdArr[i] : 0.03;
    const w = 1 / (sd * sd);
    ssTot += w * Math.pow(yArr[i] - meanY, 2);
    ssRes += w * Math.pow(yArr[i] - (slope * xArr[i] + intercept), 2);
  }
  const r2 = ssTot !== 0 ? Math.max(0, 1 - (ssRes / ssTot)) : 0;
  return { slope, intercept, r2, seSlope, seIntercept, mswd, chi2 };
}

function calcOLS(xArr, yArr) {
  const n = xArr.length;
  if (n < 2) return { slope: 0, intercept: yArr[0] || 0 };
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += xArr[i]; sumY += yArr[i]; sumXY += xArr[i] * yArr[i]; sumX2 += xArr[i] * xArr[i];
  }
  const denom = (n * sumX2 - sumX * sumX);
  if (Math.abs(denom) < 1e-12) return { slope: 0, intercept: sumY / n };
  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

function getInterpolatedDriftOffset(rIdx, anchorRuns) {
  if (!anchorRuns || anchorRuns.length === 0) return 0;
  if (anchorRuns.length === 1 || rIdx <= anchorRuns[0].idx) return anchorRuns[0].diff;
  if (rIdx >= anchorRuns[anchorRuns.length - 1].idx) return anchorRuns[anchorRuns.length - 1].diff;
  for (let i = 0; i < anchorRuns.length - 1; i++) {
    const p1 = anchorRuns[i], p2 = anchorRuns[i + 1];
    if (rIdx >= p1.idx && rIdx <= p2.idx) {
      return p1.diff + ((rIdx - p1.idx) / (p2.idx - p1.idx)) * (p2.diff - p1.diff);
    }
  }
  return 0;
}

function formatMswdWithStatus(mswd, isEn) {
  if (mswd > 2.5) {
    return `<span class="text-amber-700 font-bold">${mswd.toFixed(3)}</span> <span class="px-1.5 py-0.5 text-[10px] bg-amber-100 text-amber-900 border border-amber-300 font-sans font-semibold ml-1">${isEn ? 'High Scatter' : '분산 큼'}</span>`;
  }
  return `<span class="text-cyan-900 font-bold">${mswd.toFixed(3)}</span> <span class="px-1.5 py-0.5 text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 font-sans font-semibold ml-1">${isEn ? 'Optimal' : '양호'}</span>`;
}

function extractRowFields(row, isDual, areaOn) {
  const id = (row[0] || '').toString().trim();
  if (areaOn) {
    return {
      id,
      area1: parseFloat(row[1]),
      raw1: parseFloat(row[2]),
      sd1: parseFloat(row[3]) || 0.03,
      area2: isDual ? parseFloat(row[4]) : NaN,
      raw2: isDual ? parseFloat(row[5]) : NaN,
      sd2: isDual ? (parseFloat(row[6]) || 0.05) : 0
    };
  }
  return {
    id,
    area1: NaN,
    raw1: parseFloat(row[1]),
    sd1: parseFloat(row[2]) || 0.03,
    area2: NaN,
    raw2: isDual ? parseFloat(row[3]) : NaN,
    sd2: isDual ? (parseFloat(row[4]) || 0.05) : 0
  };
}

// -------------------------------------------------------------
// Main Calibration Pipeline (Blank -> Area Linearity -> Drift -> WLS)
// -------------------------------------------------------------
function runCalibration() {
  closeEditingCell();
  saveCurrentModeStandards();

  const p = PRESETS[currentMode];
  const isDual = p.elements.length === 2;
  const isEn = currentLang === 'en';
  const areaOn = isAreaActive();
  const useBlank = (areaMode === 'blank' || areaMode === 'blank_lin');
  const useLin = (areaMode === 'linearity' || areaMode === 'blank_lin');
  const driftMode = document.getElementById('drift-mode').value;
  const chosenDriftAnchorIdx = parseInt(document.getElementById('drift-anchor-select').value) || 0;
  const u1 = getElementUnit(0);
  const u2 = getElementUnit(1);

  const refStds = [];
  for (let idx = 0; idx < currentAnchorCount; idx++) {
    const elName = document.getElementById(`ref-std${idx}-name`);
    if (!elName) continue;
    const nameInput = elName.value.trim();
    refStds.push({
      name: nameInput,
      keyMatch: nameInput.toUpperCase().replace(/[^A-Z0-9]/g, ''),
      v1: parseFloat(document.getElementById(`ref-std${idx}-v1`).value),
      v2: isDual ? parseFloat(document.getElementById(`ref-std${idx}-v2`).value) : null
    });
  }

  const qcNameInput = document.getElementById('qc-std-name').value.trim();
  const qcStd = {
    name: qcNameInput,
    keyMatch: qcNameInput.toUpperCase().replace(/[^A-Z0-9]/g, ''),
    v1: parseFloat(document.getElementById('qc-std-v1').value),
    v2: isDual ? parseFloat(document.getElementById('qc-std-v2').value) : null
  };

  // Step A: Blank Averages
  let meanBlkA1 = 0, meanBlkD1 = 0, blkCount1 = 0;
  let meanBlkA2 = 0, meanBlkD2 = 0, blkCount2 = 0;

  if (useBlank) {
    gridData.forEach((row, rIdx) => {
      if (excludedRows[rIdx]) return;
      const f = extractRowFields(row, isDual, areaOn);
      if (isBlankRowId(f.id)) {
        if (!isNaN(f.area1) && f.area1 > 0 && !isNaN(f.raw1)) {
          meanBlkA1 += f.area1; meanBlkD1 += f.raw1; blkCount1++;
        }
        if (isDual && !isNaN(f.area2) && f.area2 > 0 && !isNaN(f.raw2)) {
          meanBlkA2 += f.area2; meanBlkD2 += f.raw2; blkCount2++;
        }
      }
    });
    if (blkCount1 > 0) { meanBlkA1 /= blkCount1; meanBlkD1 /= blkCount1; }
    if (blkCount2 > 0) { meanBlkA2 /= blkCount2; meanBlkD2 /= blkCount2; }
  }

  function applyBlankCorr(area, raw, isoIdx) {
    if (!useBlank) return raw;
    const bA = isoIdx === 1 ? meanBlkA1 : meanBlkA2;
    const bD = isoIdx === 1 ? meanBlkD1 : meanBlkD2;
    const bCnt = isoIdx === 1 ? blkCount1 : blkCount2;
    if (bCnt > 0 && !isNaN(area) && area > bA * 1.05) {
      return (area * raw - bA * bD) / (area - bA);
    }
    return raw;
  }

  // Step B: Size Linearity Slope
  const monitorAnchor = refStds[chosenDriftAnchorIdx] || refStds[0];
  const linMonitorPts = { a1: [], d1: [], a2: [], d2: [] };
  let linSlope1 = 0, meanAnchorArea1 = 0;
  let linSlope2 = 0, meanAnchorArea2 = 0;

  gridData.forEach((row, rIdx) => {
    if (excludedRows[rIdx]) return;
    const f = extractRowFields(row, isDual, areaOn);
    if (!f.id || isBlankRowId(f.id)) return;
    const clean = f.id.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (monitorAnchor && monitorAnchor.keyMatch && clean.includes(monitorAnchor.keyMatch)) {
      if (!isNaN(f.area1) && !isNaN(f.raw1)) {
        linMonitorPts.a1.push(f.area1);
        linMonitorPts.d1.push(applyBlankCorr(f.area1, f.raw1, 1));
      }
      if (isDual && !isNaN(f.area2) && !isNaN(f.raw2)) {
        linMonitorPts.a2.push(f.area2);
        linMonitorPts.d2.push(applyBlankCorr(f.area2, f.raw2, 2));
      }
    }
  });

  if (useLin && linMonitorPts.a1.length >= 2) {
    linSlope1 = calcOLS(linMonitorPts.a1, linMonitorPts.d1).slope;
    meanAnchorArea1 = linMonitorPts.a1.reduce((a, b) => a + b, 0) / linMonitorPts.a1.length;
  }
  if (useLin && isDual && linMonitorPts.a2.length >= 2) {
    linSlope2 = calcOLS(linMonitorPts.a2, linMonitorPts.d2).slope;
    meanAnchorArea2 = linMonitorPts.a2.reduce((a, b) => a + b, 0) / linMonitorPts.a2.length;
  }

  function applyBlankAndLin(area, raw, isoIdx) {
    let val = applyBlankCorr(area, raw, isoIdx);
    if (useLin && !isNaN(area)) {
      if (isoIdx === 1 && meanAnchorArea1 > 0) val -= linSlope1 * (area - meanAnchorArea1);
      if (isoIdx === 2 && meanAnchorArea2 > 0) val -= linSlope2 * (area - meanAnchorArea2);
    }
    return val;
  }

  // Step C: Sequence Drift Model
  let driftSlope1 = 0, driftSlope2 = 0;
  let monitorRuns1 = [], monitorRuns2 = [];
  const rawMonitorRuns = { seq: [], v1: [], v2: [] };

  gridData.forEach((row, rIdx) => {
    if (excludedRows[rIdx]) return;
    const f = extractRowFields(row, isDual, areaOn);
    if (!f.id || isBlankRowId(f.id)) return;
    const clean = f.id.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (monitorAnchor && monitorAnchor.keyMatch && clean.includes(monitorAnchor.keyMatch)) {
      if (!isNaN(f.raw1)) {
        rawMonitorRuns.seq.push(rIdx + 1);
        rawMonitorRuns.v1.push(applyBlankAndLin(f.area1, f.raw1, 1));
        if (isDual && !isNaN(f.raw2)) {
          rawMonitorRuns.v2.push(applyBlankAndLin(f.area2, f.raw2, 2));
        }
      }
    }
  });

  if (driftMode === 'linear' && rawMonitorRuns.seq.length >= 2) {
    driftSlope1 = calcOLS(rawMonitorRuns.seq, rawMonitorRuns.v1).slope;
    if (isDual && rawMonitorRuns.v2.length >= 2) driftSlope2 = calcOLS(rawMonitorRuns.seq, rawMonitorRuns.v2).slope;
  } else if (driftMode === 'piecewise') {
    let base1 = null, base2 = null;
    gridData.forEach((row, rIdx) => {
      if (excludedRows[rIdx]) return;
      const f = extractRowFields(row, isDual, areaOn);
      if (!f.id || isBlankRowId(f.id)) return;
      const clean = f.id.toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (monitorAnchor && monitorAnchor.keyMatch && clean.includes(monitorAnchor.keyMatch)) {
        if (!isNaN(f.raw1)) {
          const v1 = applyBlankAndLin(f.area1, f.raw1, 1);
          if (base1 === null) base1 = v1;
          monitorRuns1.push({ idx: rIdx, diff: v1 - base1 });
          if (isDual && !isNaN(f.raw2)) {
            const v2 = applyBlankAndLin(f.area2, f.raw2, 2);
            if (base2 === null) base2 = v2;
            monitorRuns2.push({ idx: rIdx, diff: v2 - base2 });
          }
        }
      }
    });
  }

  function getFullyPreprocessedRaw(rIdx, area, raw, isoIdx) {
    let val = applyBlankAndLin(area, raw, isoIdx);
    if (driftMode === 'linear') {
      return isoIdx === 1 ? (val - driftSlope1 * rIdx) : (val - driftSlope2 * rIdx);
    } else if (driftMode === 'piecewise') {
      const offset = isoIdx === 1 ? getInterpolatedDriftOffset(rIdx, monitorRuns1) : getInterpolatedDriftOffset(rIdx, monitorRuns2);
      return val - offset;
    }
    return val;
  }

  // Step D: Anchor Fitting (WLS)
  const pts1 = { x: [], y: [], sd: [], names: [] };
  const pts2 = { x: [], y: [], sd: [], names: [] };

  gridData.forEach((row, rIdx) => {
    if (excludedRows[rIdx]) return;
    const f = extractRowFields(row, isDual, areaOn);
    if (!f.id || isBlankRowId(f.id)) return;
    const clean = f.id.toUpperCase().replace(/[^A-Z0-9]/g, '');

    refStds.forEach(std => {
      if (std.keyMatch && clean.includes(std.keyMatch)) {
        if (!isNaN(f.raw1) && !isNaN(std.v1)) {
          const adj1 = getFullyPreprocessedRaw(rIdx, f.area1, f.raw1, 1);
          pts1.x.push(adj1); pts1.y.push(std.v1); pts1.sd.push(f.sd1); pts1.names.push(f.id);
        }
        if (isDual && !isNaN(f.raw2) && !isNaN(std.v2)) {
          const adj2 = getFullyPreprocessedRaw(rIdx, f.area2, f.raw2, 2);
          pts2.x.push(adj2); pts2.y.push(std.v2); pts2.sd.push(f.sd2); pts2.names.push(f.id);
        }
      }
    });
  });

  if (pts1.x.length < 2) {
    alert(isEn ? "At least 2 active anchor standard runs are required." : "최소 2개 이상의 활성화된 앵커 표준물질 데이터가 필요합니다.");
    return;
  }

  hasCalibratedOnce = true;

  const reg1 = calcWLS(pts1.x, pts1.y, pts1.sd);
  document.getElementById('p1-slope').innerText = reg1.slope.toFixed(6);
  document.getElementById('p1-intercept').innerText = reg1.intercept.toFixed(6);
  document.getElementById('p1-se').innerText = `± ${reg1.seSlope.toFixed(6)}`;
  document.getElementById('p1-mswd').innerHTML = formatMswdWithStatus(reg1.mswd, isEn);
  document.getElementById('p1-r2').innerText = reg1.r2.toFixed(5);

  drawPlot('plot-1', `${p.elements[0].label} Calibration Fit`, pts1, reg1, `Corrected Raw ${p.elements[0].label} (‰)`, `True ${p.elements[0].label} (${u1})`);

  let reg2 = null;
  if (isDual) {
    reg2 = calcWLS(pts2.x, pts2.y, pts2.sd);
    document.getElementById('p2-slope').innerText = reg2.slope.toFixed(6);
    document.getElementById('p2-intercept').innerText = reg2.intercept.toFixed(6);
    document.getElementById('p2-se').innerText = `± ${reg2.seSlope.toFixed(6)}`;
    document.getElementById('p2-mswd').innerHTML = formatMswdWithStatus(reg2.mswd, isEn);
    document.getElementById('p2-r2').innerText = reg2.r2.toFixed(5);
    drawPlot('plot-2', `${p.elements[1].label} Calibration Fit`, pts2, reg2, `Corrected Raw ${p.elements[1].label} (‰)`, `True ${p.elements[1].label} (${u2})`);
  }

  // Diagnostic Plots (Figure 3 & 4)
  if (useLin && linMonitorPts.a1.length >= 2) {
    drawLinearityPlot('plot-drift-1', linMonitorPts.a1, linMonitorPts.d1, monitorAnchor ? monitorAnchor.name : 'Anchor', linSlope1, meanAnchorArea1, p.elements[0].label);
    if (isDual) drawLinearityPlot('plot-drift-2', linMonitorPts.a2, linMonitorPts.d2, monitorAnchor ? monitorAnchor.name : 'Anchor', linSlope2, meanAnchorArea2, p.elements[1].label);
  } else {
    drawDriftPlot('plot-drift-1', rawMonitorRuns.seq, rawMonitorRuns.v1, monitorAnchor ? monitorAnchor.name : 'Anchor', driftMode, driftSlope1, monitorRuns1, gridData.length, p.elements[0].label);
    if (isDual) drawDriftPlot('plot-drift-2', rawMonitorRuns.seq, rawMonitorRuns.v2, monitorAnchor ? monitorAnchor.name : 'Anchor', driftMode, driftSlope2, monitorRuns2, gridData.length, p.elements[1].label);
  }

  // Step E: Compute Sequence Table
  const resBody = document.getElementById('result-body');
  resBody.innerHTML = '';
  const qcResults = { cals1: [], cals2: [] };
  const computedRows = [];
  sequenceExportData = [];

  gridData.forEach((row, rIdx) => {
    const f = extractRowFields(row, isDual, areaOn);
    if (!f.id) return;
    const isExcl = !!excludedRows[rIdx];
    const isBlk = isBlankRowId(f.id);
    const clean = f.id.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const isAnchor = refStds.some(s => s.keyMatch && clean.includes(s.keyMatch));
    const isQC = (qcStd.keyMatch && clean.includes(qcStd.keyMatch)) || (clean.includes('QC') && !isAnchor);

    let cal1 = null, propSd1 = null;
    if (!isBlk && !isNaN(f.raw1) && reg1.slope !== 0) {
      const adjRaw1 = getFullyPreprocessedRaw(rIdx, f.area1, f.raw1, 1);
      cal1 = adjRaw1 * reg1.slope + reg1.intercept;
      propSd1 = Math.sqrt(Math.pow(reg1.slope * f.sd1, 2) + Math.pow(adjRaw1 * reg1.seSlope, 2) + Math.pow(reg1.seIntercept, 2));
      if (isQC && !isExcl) qcResults.cals1.push(cal1);
    }

    let cal2 = null, propSd2 = null;
    if (!isBlk && isDual && !isNaN(f.raw2) && reg2 && reg2.slope !== 0) {
      const adjRaw2 = getFullyPreprocessedRaw(rIdx, f.area2, f.raw2, 2);
      cal2 = adjRaw2 * reg2.slope + reg2.intercept;
      propSd2 = Math.sqrt(Math.pow(reg2.slope * f.sd2, 2) + Math.pow(adjRaw2 * reg2.seSlope, 2) + Math.pow(reg2.seIntercept, 2));
      if (isQC && !isExcl) qcResults.cals2.push(cal2);
    }

    computedRows.push({ rIdx, id: f.id, clean, isAnchor, isQC, isBlk, isExcl, raw1: f.raw1, sd1: f.sd1, cal1, propSd1, raw2: f.raw2, sd2: f.sd2, cal2, propSd2 });

    sequenceExportData.push({
      runNumber: rIdx + 1,
      status: isExcl ? 'EXCLUDED' : (isBlk ? 'BLANK' : 'INCLUDED'),
      id: f.id,
      area1: (areaOn && !isNaN(f.area1)) ? f.area1 : null,
      raw1: !isNaN(f.raw1) ? parseFloat(f.raw1.toFixed(3)) : null,
      sd1: f.sd1 > 0 ? parseFloat(f.sd1.toFixed(3)) : null,
      cal1: (!isExcl && !isBlk && cal1 !== null) ? parseFloat(cal1.toFixed(3)) : null,
      propSd1: (!isExcl && !isBlk && propSd1 !== null) ? parseFloat(propSd1.toFixed(3)) : null,
      area2: (areaOn && isDual && !isNaN(f.area2)) ? f.area2 : null,
      raw2: (isDual && !isNaN(f.raw2)) ? parseFloat(f.raw2.toFixed(3)) : null,
      sd2: (isDual && f.sd2 > 0) ? parseFloat(f.sd2.toFixed(3)) : null,
      cal2: (!isExcl && !isBlk && isDual && cal2 !== null) ? parseFloat(cal2.toFixed(3)) : null,
      propSd2: (!isExcl && !isBlk && isDual && propSd2 !== null) ? parseFloat(propSd2.toFixed(3)) : null
    });

    const tr = document.createElement('tr');
    tr.className = isExcl ? 'bg-stone-100/80 text-stone-400 line-through' : (isAnchor || isBlk ? 'bg-[#fcfbf9] text-stone-500' : 'hover:bg-stone-50');
    const idBadge = isExcl
      ? `${f.id} <span class="no-underline inline-block ml-1 px-1 py-0.2 bg-stone-200 text-stone-600 font-mono text-[9px] uppercase">Excluded</span>`
      : (isBlk ? `${f.id} <span class="inline-block ml-1 px-1 py-0.2 bg-sky-100 text-sky-800 font-mono text-[9px] uppercase">Blank</span>` : f.id);

    if (isDual) {
      tr.innerHTML = `
        <td class="px-4 py-2 border-r border-[#e5e3dc] font-semibold">${idBadge}</td>
        <td class="px-3.5 py-2 border-r border-[#e5e3dc] text-stone-700">${!isNaN(f.raw1) ? f.raw1.toFixed(3) : '-'}</td>
        <td class="px-3.5 py-2 border-r border-[#e5e3dc] text-stone-700">${!isNaN(f.raw2) ? f.raw2.toFixed(3) : '-'}</td>
        <td class="px-3.5 py-2 border-r border-[#e5e3dc] font-bold ${isExcl || isBlk ? 'text-stone-400' : 'text-stone-900 bg-stone-50/50'}">${!isExcl && !isBlk && cal1 !== null ? cal1.toFixed(3) : '-'}</td>
        <td class="px-3 py-2 border-r border-[#e5e3dc] text-stone-600 font-medium">${!isExcl && !isBlk && propSd1 !== null ? '±' + propSd1.toFixed(3) : '-'}</td>
        <td class="px-3.5 py-2 border-r border-[#e5e3dc] font-bold ${isExcl || isBlk ? 'text-stone-400' : 'text-stone-900 bg-stone-50/50'}">${!isExcl && !isBlk && cal2 !== null ? cal2.toFixed(3) : '-'}</td>
        <td class="px-3.5 py-2 text-stone-600 font-medium">${!isExcl && !isBlk && propSd2 !== null ? '±' + propSd2.toFixed(3) : '-'}</td>
      `;
    } else {
      tr.innerHTML = `
        <td class="px-4 py-2 border-r border-[#e5e3dc] font-semibold">${idBadge}</td>
        <td class="px-4 py-2 border-r border-[#e5e3dc] text-stone-700">${!isNaN(f.raw1) ? f.raw1.toFixed(3) : '-'}</td>
        <td class="px-4 py-2 border-r border-[#e5e3dc] font-bold ${isExcl || isBlk ? 'text-stone-400' : 'text-stone-900 bg-stone-50/50'}">${!isExcl && !isBlk && cal1 !== null ? cal1.toFixed(3) : '-'}</td>
        <td class="px-4 py-2 text-stone-600 font-medium">${!isExcl && !isBlk && propSd1 !== null ? '±' + propSd1.toFixed(3) : '-'}</td>
      `;
    }
    resBody.appendChild(tr);
  });

  // Step F: Grouped Sample Summary
  groupedSummaryData = [];
  const groupedBody = document.getElementById('grouped-body');
  groupedBody.innerHTML = '';
  let currentGroup = null;

  function finishGroup() {
    if (!currentGroup || currentGroup.items.length === 0) return;
    const n = currentGroup.items.length;
    const c1List = currentGroup.items.map(x => x.cal1).filter(v => v !== null && !isNaN(v));
    const c2List = currentGroup.items.map(x => x.cal2).filter(v => v !== null && !isNaN(v));
    const mean1 = c1List.length > 0 ? (c1List.reduce((a, b) => a + b, 0) / c1List.length) : null;
    const sd1 = c1List.length > 1 ? Math.sqrt(c1List.map(v => Math.pow(v - mean1, 2)).reduce((a, b) => a + b) / (c1List.length - 1)) : (c1List.length === 1 ? currentGroup.items[0].propSd1 : 0);
    const mean2 = (isDual && c2List.length > 0) ? (c2List.reduce((a, b) => a + b, 0) / c2List.length) : null;
    const sd2 = (isDual && c2List.length > 1) ? Math.sqrt(c2List.map(v => Math.pow(v - mean2, 2)).reduce((a, b) => a + b) / (c2List.length - 1)) : (isDual && c2List.length === 1 ? currentGroup.items[0].propSd2 : 0);

    groupedSummaryData.push({
      baseId: currentGroup.baseId, n,
      mean1: mean1 !== null ? parseFloat(mean1.toFixed(3)) : null,
      sd1: sd1 !== null ? parseFloat(sd1.toFixed(3)) : null,
      mean2: mean2 !== null ? parseFloat(mean2.toFixed(3)) : null,
      sd2: sd2 !== null ? parseFloat(sd2.toFixed(3)) : null
    });
    currentGroup = null;
  }

  computedRows.forEach(row => {
    if (row.isAnchor || row.isQC || row.isBlk) { finishGroup(); return; }
    if (row.isExcl) return;
    const bId = extractBaseId(row.id);
    if (!currentGroup) currentGroup = { baseId: bId, items: [row] };
    else if (currentGroup.baseId === bId) currentGroup.items.push(row);
    else { finishGroup(); currentGroup = { baseId: bId, items: [row] }; }
  });
  finishGroup();

  if (groupedSummaryData.length === 0) {
    groupedBody.innerHTML = `<tr><td colspan="7" class="px-6 py-12 text-center text-xs font-serif-title italic text-stone-400">${isEn ? 'No active unknown sample replicates found.' : '그룹화 가능한 미지 시료가 없습니다.'}</td></tr>`;
  } else {
    groupedSummaryData.forEach(g => {
      const tr = document.createElement('tr');
      tr.className = 'hover:bg-stone-50';
      if (isDual) {
        tr.innerHTML = `
          <td class="px-4 py-2 border-r border-[#e5e3dc] font-bold text-stone-900">${g.baseId}</td>
          <td class="px-3 py-2 border-r border-[#e5e3dc] text-center font-mono font-semibold text-stone-600 bg-stone-50/40">${g.n}</td>
          <td class="px-4 py-2 border-r border-[#e5e3dc] font-bold text-stone-900 bg-emerald-50/30">${g.mean1 !== null ? g.mean1.toFixed(3) : '-'}</td>
          <td class="px-3.5 py-2 border-r border-[#e5e3dc] text-stone-700 font-medium">±${g.sd1 !== null ? g.sd1.toFixed(3) : '-'}</td>
          <td class="px-4 py-2 border-r border-[#e5e3dc] font-bold text-stone-900 bg-emerald-50/30">${g.mean2 !== null ? g.mean2.toFixed(3) : '-'}</td>
          <td class="px-3.5 py-2 text-stone-700 font-medium">±${g.sd2 !== null ? g.sd2.toFixed(3) : '-'}</td>
        `;
      } else {
        tr.innerHTML = `
          <td class="px-4 py-2 border-r border-[#e5e3dc] font-bold text-stone-900">${g.baseId}</td>
          <td class="px-3 py-2 border-r border-[#e5e3dc] text-center font-mono font-semibold text-stone-600 bg-stone-50/40">${g.n}</td>
          <td class="px-4 py-2 border-r border-[#e5e3dc] font-bold text-stone-900 bg-emerald-50/30">${g.mean1 !== null ? g.mean1.toFixed(3) : '-'}</td>
          <td class="px-4 py-2 text-stone-700 font-medium">±${g.sd1 !== null ? g.sd1.toFixed(3) : '-'}</td>
        `;
      }
      groupedBody.appendChild(tr);
    });
  }

  // Step G: Smart QC Validation Banner & Actionable Diagnostics (Restored & Enhanced)
  const qcBanner = document.getElementById('qc-summary-banner');
  if (qcResults.cals1.length > 0 && !isNaN(qcStd.v1)) {
    const mean1 = qcResults.cals1.reduce((a, b) => a + b, 0) / qcResults.cals1.length;
    const bias1 = mean1 - qcStd.v1;
    const sdQc1 = qcResults.cals1.length > 1 ? Math.sqrt(qcResults.cals1.map(x => Math.pow(x - mean1, 2)).reduce((a, b) => a + b) / (qcResults.cals1.length - 1)) : 0;
    const thresh1 = getElementThreshold(p.elements[0].label);
    const failBias1 = Math.abs(bias1) > thresh1.bias, failSd1 = sdQc1 > thresh1.sd;

    let mean2 = null, bias2 = null, sdQc2 = null, thresh2 = null, failBias2 = false, failSd2 = false;
    if (isDual && qcResults.cals2.length > 0 && !isNaN(qcStd.v2)) {
      mean2 = qcResults.cals2.reduce((a, b) => a + b, 0) / qcResults.cals2.length;
      bias2 = mean2 - qcStd.v2;
      sdQc2 = qcResults.cals2.length > 1 ? Math.sqrt(qcResults.cals2.map(x => Math.pow(x - mean2, 2)).reduce((a, b) => a + b) / (qcResults.cals2.length - 1)) : 0;
      thresh2 = getElementThreshold(p.elements[1].label);
      failBias2 = Math.abs(bias2) > thresh2.bias; failSd2 = sdQc2 > thresh2.sd;
    }

    const highMswd = reg1.mswd > 2.5 || (isDual && reg2 && reg2.mswd > 2.5);
    const isOverallPass = !failBias1 && !failSd1 && !failBias2 && !failSd2 && !highMswd;

    lastQcSummaryReport = { qcName: qcStd.name, count: qcResults.cals1.length, status: isOverallPass ? 'PASS' : 'WARNING', mean1, bias1, sdQc1, mean2, bias2, sdQc2 };
    qcBanner.className = isOverallPass ? 'bg-[#f8fdf9] border-2 border-emerald-400 p-4 rounded-none space-y-3 shadow-xs' : 'bg-[#fffcf5] border-2 border-amber-400 p-4 rounded-none space-y-3 shadow-xs';

    const statusBadgeHtml = isOverallPass
      ? `<span class="px-2.5 py-0.5 bg-emerald-700 text-white font-mono text-[11px] font-bold uppercase flex items-center gap-1.5"><span>●</span> ${isEn ? 'QC PASS · Ready for Publication' : 'QC PASS · 학술 보고 기준 만족'}</span>`
      : `<span class="px-2.5 py-0.5 bg-amber-600 text-white font-mono text-[11px] font-bold uppercase flex items-center gap-1.5"><span>▲</span> ${isEn ? 'QC WARNING · Action Required' : 'QC WARNING · 데이터 점검 및 보정 필요'}</span>`;

    let qcHtml = `
      <div class="flex flex-wrap items-center justify-between border-b ${isOverallPass ? 'border-emerald-200' : 'border-amber-200'} pb-2.5 gap-2">
        <div class="flex items-center flex-wrap gap-2.5">${statusBadgeHtml}</div>
        <span class="text-[11px] font-mono text-stone-500">${isEn ? 'Evaluated on' : '평가 대상:'} ${qcResults.cals1.length} ${isEn ? 'active runs of' : '회 유효 반복측정'} [${qcStd.name}]</span>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-data pt-0.5">
        <div class="space-y-1">
          <div class="flex justify-between text-stone-700 font-sans font-semibold">
            <span>${p.elements[0].label} ${isEn ? 'Performance' : '정밀도 및 정확도'}</span>
            <span class="text-[10px] font-mono text-stone-400">${isEn ? 'Criterion' : '허용기준'}: ±${thresh1.bias.toFixed(2)} ‰</span>
          </div>
          <div class="flex justify-between bg-white p-2.5 border ${failBias1 || failSd1 ? 'border-amber-300 bg-amber-50/20' : 'border-stone-200'}">
            <span>${isEn ? 'Mean' : '평균 보정값'}: <strong>${mean1.toFixed(3)} ${u1}</strong></span>
            <span>${isEn ? 'Bias' : '정확도 편차'}: <strong class="${!failBias1 ? 'text-emerald-700' : 'text-amber-700'}">${bias1 >= 0 ? '+' : ''}${bias1.toFixed(3)} ‰</strong></span>
            <span>${isEn ? 'Rep (1σ)' : '반복 정밀도'}: <strong class="${!failSd1 ? 'text-emerald-700' : 'text-amber-700'}">±${sdQc1.toFixed(3)} ‰</strong></span>
          </div>
        </div>
    `;

    if (isDual && mean2 !== null) {
      qcHtml += `
        <div class="space-y-1">
          <div class="flex justify-between text-stone-700 font-sans font-semibold">
            <span>${p.elements[1].label} ${isEn ? 'Performance' : '정밀도 및 정확도'}</span>
            <span class="text-[10px] font-mono text-stone-400">${isEn ? 'Criterion' : '허용기준'}: ±${thresh2.bias.toFixed(2)} ‰</span>
          </div>
          <div class="flex justify-between bg-white p-2.5 border ${failBias2 || failSd2 ? 'border-amber-300 bg-amber-50/20' : 'border-stone-200'}">
            <span>${isEn ? 'Mean' : '평균 보정값'}: <strong>${mean2.toFixed(3)} ${u2}</strong></span>
            <span>${isEn ? 'Bias' : '정확도 편차'}: <strong class="${!failBias2 ? 'text-emerald-700' : 'text-amber-700'}">${bias2 >= 0 ? '+' : ''}${bias2.toFixed(3)} ‰</strong></span>
            <span>${isEn ? 'Rep (1σ)' : '반복 정밀도'}: <strong class="${!failSd2 ? 'text-emerald-700' : 'text-amber-700'}">±${sdQc2.toFixed(3)} ‰</strong></span>
          </div>
        </div>
      `;
    }
    qcHtml += `</div>`;

    // Actionable Diagnostic Guide Box
    if (!isOverallPass) {
      qcHtml += `
        <div class="bg-amber-100/70 border-l-4 border-amber-600 p-3 text-xs text-amber-950 font-sans space-y-1">
          <div class="font-bold flex items-center gap-1.5">
            <span>💡</span>
            <span>${isEn ? 'Diagnostic Action Guide: QC Offset or Outlier Detected' : '자동 진단 가이드: QC 표준물질 편차 또는 이상치 점검 필요'}</span>
          </div>
          <p class="text-[11px] leading-relaxed text-amber-900">
            ${isEn
              ? `One or more QC metrics exceed analytical tolerance. Verify accepted true values in Section 01, check size-linearity settings, or uncheck 'Use (✓)' on anomalous runs in Section 02.`
              : `QC 표준물질의 정확도 편차(Bias) 또는 반복 정밀도가 허용 기준을 초과했습니다. 01 섹션의 공인값을 확인하거나, 02 섹션 표에서 면적 보정 모드 및 이상치 런의 체크박스(Use)를 점검해 보세요.`}
          </p>
        </div>
      `;
    } else {
      qcHtml += `
        <div class="bg-emerald-100/50 border-l-4 border-emerald-600 px-3 py-2 text-[11px] text-emerald-950 font-sans flex items-center justify-between">
          <span><strong>✓ ${isEn ? 'Diagnostic Summary:' : '진단 요약:'}</strong> ${isEn ? 'Calibration linearity (MSWD), QC accuracy bias, and replicate reproducibility all satisfy international publication criteria.' : '검량선 적합도(MSWD), QC 정확도 편차 및 반복 정밀도가 모두 학술 보고 기준을 완벽히 충족합니다.'}</span>
        </div>
      `;
    }

    const metaNotes = [];
    if (useBlank && blkCount1 > 0) metaNotes.push(`Blank subtracted (${blkCount1} runs: Area₁=${meanBlkA1.toFixed(2)}, δ₁=${meanBlkD1.toFixed(2)}‰)`);
    if (useLin && meanAnchorArea1 > 0) metaNotes.push(`Size Linearity slope (${monitorAnchor.name}): k₁=${linSlope1.toExponential(2)} ‰/Area`);
    if (driftMode === 'linear') metaNotes.push(`Time Drift slope: ${(driftSlope1).toExponential(2)} ‰/run`);

    if (metaNotes.length > 0) {
      qcHtml += `<div class="text-[11px] font-mono text-stone-600 pt-1 border-t border-stone-200">* ${metaNotes.join('  |  ')}</div>`;
    }

    qcBanner.innerHTML = qcHtml;
    qcBanner.classList.remove('hidden');
  } else {
    qcBanner.classList.add('hidden');
    lastQcSummaryReport = null;
  }
}

// -------------------------------------------------------------
// Plotly Chart Renderers
// -------------------------------------------------------------
function drawPlot(elemId, title, pts, reg, xTitle, yTitle) {
  const container = document.getElementById(elemId);
  container.innerHTML = '';
  if (pts.x.length === 0) return;
  const minX = Math.min(...pts.x), maxX = Math.max(...pts.x);
  const pad = (maxX - minX) * 0.1 || 1;
  const lx = [minX - pad, maxX + pad];
  const ly = [lx[0] * reg.slope + reg.intercept, lx[1] * reg.slope + reg.intercept];

  const traces = [
    {
      x: pts.x, y: pts.y, text: pts.names, mode: 'markers', type: 'scatter',
      name: currentLang === 'en' ? 'Active Anchors' : '유효 앵커 표준물질',
      marker: { size: 7, color: '#111827', line: { color: '#000000', width: 1 } },
      error_x: { type: 'data', array: pts.sd, visible: true, color: '#4b5563', thickness: 1.2, width: 4 }
    },
    {
      x: lx, y: ly, mode: 'lines', type: 'scatter',
      name: `WLS: y = ${reg.slope.toFixed(4)}x + ${reg.intercept.toFixed(4)} (MSWD = ${reg.mswd.toFixed(2)})`,
      line: { dash: 'solid', width: 1.5, color: '#6b7280' }
    }
  ];

  const layout = {
    title: { text: title, font: { family: 'Newsreader, Georgia, serif', size: 15, color: '#111827' }, x: 0.05 },
    paper_bgcolor: '#ffffff', plot_bgcolor: '#ffffff',
    margin: { l: 55, r: 25, t: 40, b: 45 },
    xaxis: { title: { text: xTitle, font: { size: 11 } }, showgrid: true, gridcolor: '#f0ede6', linecolor: '#c7c5bc' },
    yaxis: { title: { text: yTitle, font: { size: 11 } }, showgrid: true, gridcolor: '#f0ede6', linecolor: '#c7c5bc' },
    showlegend: true, legend: { orientation: 'h', y: -0.28, x: 0.05, font: { size: 10 } }
  };
  Plotly.newPlot(elemId, traces, layout, { responsive: true, displayModeBar: false });
}

function drawLinearityPlot(elemId, areaArr, valArr, anchorName, slopeVal, meanArea, isoLabel) {
  const container = document.getElementById(elemId);
  container.innerHTML = '';
  const isEn = currentLang === 'en';
  if (!areaArr || areaArr.length < 2) {
    container.innerHTML = `<span class="text-xs text-stone-400 font-serif-title italic">${isEn ? 'Insufficient Peak Area points for Linearity Plot.' : '피크 면적 선형성 진단을 위한 데이터가 부족합니다.'}</span>`;
    return;
  }
  const minA = Math.min(...areaArr), maxA = Math.max(...areaArr);
  const ols = calcOLS(areaArr, valArr);
  const lx = [minA, maxA];
  const ly = [ols.slope * minA + ols.intercept, ols.slope * maxA + ols.intercept];

  const traces = [
    {
      x: areaArr, y: valArr, mode: 'markers', type: 'scatter',
      name: `${anchorName} (Blank-corr Raw)`,
      marker: { size: 8, color: '#0369a1' }
    },
    {
      x: lx, y: ly, mode: 'lines', type: 'scatter',
      name: `Linearity Slope k = ${slopeVal.toExponential(2)} ‰/Area (Ref=${meanArea.toFixed(1)})`,
      line: { color: '#b45309', width: 2, dash: 'dash' }
    }
  ];

  const layout = {
    title: { text: `${isoLabel} Size Linearity (Peak Area vs δ · ${anchorName})`, font: { family: 'Newsreader, Georgia, serif', size: 15, color: '#111827' }, x: 0.05 },
    paper_bgcolor: '#ffffff', plot_bgcolor: '#ffffff',
    margin: { l: 55, r: 25, t: 40, b: 45 },
    xaxis: { title: { text: 'Peak Area (Vs / Amplitude mV)', font: { size: 11 } }, showgrid: true, gridcolor: '#f0ede6', linecolor: '#c7c5bc' },
    yaxis: { title: { text: `Raw ${isoLabel} (‰)`, font: { size: 11 } }, showgrid: true, gridcolor: '#f0ede6', linecolor: '#c7c5bc' },
    showlegend: true, legend: { orientation: 'h', y: -0.28, x: 0.05, font: { size: 10 } }
  };
  Plotly.newPlot(elemId, traces, layout, { responsive: true, displayModeBar: false });
}

function drawDriftPlot(elemId, seqArr, valArr, anchorName, mode, slopeVal, anchorRuns, maxRun, isoLabel) {
  const container = document.getElementById(elemId);
  container.innerHTML = '';
  const isEn = currentLang === 'en';
  if (!seqArr || seqArr.length === 0) {
    container.innerHTML = `<span class="text-xs text-stone-400 font-serif-title italic">${isEn ? `No active anchor runs for ${isoLabel} drift.` : `${isoLabel} 드리프트 진단을 위한 유효 측정값이 없습니다.`}</span>`;
    return;
  }
  const traces = [{
    x: seqArr, y: valArr, mode: 'markers+lines', type: 'scatter',
    name: `${anchorName} Raw Runs`,
    marker: { size: 7, color: '#0369a1' }, line: { dash: 'dot', color: '#93c5fd', width: 1.2 }
  }];

  if (mode === 'linear') {
    const firstSeq = seqArr[0], baseVal = valArr[0];
    traces.push({
      x: [firstSeq, maxRun], y: [baseVal, baseVal + slopeVal * (maxRun - firstSeq)],
      mode: 'lines', type: 'scatter',
      name: `Linear Drift (${(slopeVal).toExponential(2)} ‰/run)`,
      line: { color: '#b91c1c', width: 2 }
    });
  } else if (mode === 'piecewise' && anchorRuns && anchorRuns.length >= 2) {
    const baseVal = valArr[0];
    traces.push({
      x: anchorRuns.map(i => i.idx + 1), y: anchorRuns.map(i => baseVal + i.diff),
      mode: 'lines', type: 'scatter', name: 'Bracketing Spline', line: { color: '#047857', width: 2 }
    });
  }

  const layout = {
    title: { text: `${isoLabel} Sequence Drift Diagnostics (${anchorName})`, font: { family: 'Newsreader, Georgia, serif', size: 15, color: '#111827' }, x: 0.05 },
    paper_bgcolor: '#ffffff', plot_bgcolor: '#ffffff',
    margin: { l: 55, r: 25, t: 40, b: 45 },
    xaxis: { title: { text: 'Run Sequence Order (Run #)', font: { size: 11 } }, showgrid: true, gridcolor: '#f0ede6', linecolor: '#c7c5bc' },
    yaxis: { title: { text: `Raw ${isoLabel} (‰)`, font: { size: 11 } }, showgrid: true, gridcolor: '#f0ede6', linecolor: '#c7c5bc' },
    showlegend: true, legend: { orientation: 'h', y: -0.28, x: 0.05, font: { size: 10 } }
  };
  Plotly.newPlot(elemId, traces, layout, { responsive: true, displayModeBar: false });
}

// SVG Exports
['1', '2', 'drift-1', 'drift-2'].forEach(suffix => {
  const btn = document.getElementById(`btn-export-svg-${suffix}`);
  if (btn) {
    btn.addEventListener('click', () => {
      Plotly.downloadImage(`plot-${suffix}`, { format: 'svg', width: 800, height: 600, filename: `IsoCalib_${currentMode}_Plot_${suffix}` });
    });
  }
});

document.getElementById('isotope-preset').addEventListener('change', (e) => {
  saveCurrentModeStandards();
  currentMode = e.target.value;
  if (currentMode === 'WATER_O') oxygenScale = 'VSMOW';
  else if (currentMode === 'CO') oxygenScale = 'VPDB';
  const p = PRESETS[currentMode];
  const sourceDemo = (isAreaActive() && p.demoArea) ? p.demoArea : p.demo;
  gridData = JSON.parse(JSON.stringify(sourceDemo));
  excludedRows = Array(gridData.length).fill(false);
  updateLayoutForMode(false);
});

document.getElementById('btn-calc').addEventListener('click', runCalibration);

document.getElementById('btn-demo').addEventListener('click', () => {
  userCustomStandardsByMode[currentMode] = null;
  oxygenScale = currentMode === 'WATER_O' ? 'VSMOW' : 'VPDB';
  const p = PRESETS[currentMode];
  const sourceDemo = (isAreaActive() && p.demoArea) ? p.demoArea : p.demo;
  gridData = JSON.parse(JSON.stringify(sourceDemo));
  excludedRows = Array(gridData.length).fill(false);
  selectedCellRange = { minR: 0, maxR: 0, minC: 0, maxC: 0 };
  updateLayoutForMode(true);
  renderGrid();
  runCalibration();
  syncPasteTarget();
});

document.getElementById('btn-clear').addEventListener('click', () => {
  const numCols = getNumDataCols();
  gridData = Array.from({ length: 30 }, () => Array(numCols).fill(''));
  excludedRows = Array(30).fill(false);
  selectedCellRange = { minR: 0, maxR: 0, minC: 0, maxC: 0 };
  renderGrid();
  resetOutputs();
  syncPasteTarget();
});

document.getElementById('btn-add-row').addEventListener('click', () => {
  const numCols = getNumDataCols();
  for (let i = 0; i < 30; i++) {
    gridData.push(Array(numCols).fill(''));
    excludedRows.push(false);
  }
  renderGrid();
  syncPasteTarget();
});

// -------------------------------------------------------------
// ExcelJS Multi-Sheet + Embedded Figures Export
// -------------------------------------------------------------
async function capturePlotAsBase64Png(elemId) {
  const el = document.getElementById(elemId);
  if (!el || !el.data || el.data.length === 0) return null;
  try {
    const dataUrl = await Plotly.toImage(el, { format: 'png', width: 750, height: 480 });
    return dataUrl.split(',')[1];
  } catch (err) { return null; }
}

document.getElementById('btn-export').addEventListener('click', async () => {
  if (!sequenceExportData || sequenceExportData.length === 0) {
    alert(currentLang === 'en' ? "Please run calibration first." : "먼저 상단에서 검량을 실행해 주세요.");
    return;
  }
  const p = PRESETS[currentMode];
  const isDual = p.elements.length === 2;
  const u1 = getElementUnit(0), u2 = getElementUnit(1);
  const exportBtn = document.getElementById('btn-export');
  const originalBtnText = exportBtn.innerHTML;

  try {
    exportBtn.innerHTML = `<span>Exporting (.xlsx)...</span>`;
    exportBtn.style.opacity = '0.6';
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'IsoCalib v1.4.0';

    const wsGrouped = workbook.addWorksheet('Grouped_Summary');
    wsGrouped.columns = isDual ? [
      { header: 'Sample_Base_ID', key: 'baseId', width: 22 },
      { header: 'Active_Replicates (n)', key: 'n', width: 20 },
      { header: `Mean_${p.elements[0].label} (${u1})`, key: 'mean1', width: 24 },
      { header: 'Rep_1SD', key: 'sd1', width: 14 },
      { header: `Mean_${p.elements[1].label} (${u2})`, key: 'mean2', width: 24 },
      { header: 'Rep_1SD', key: 'sd2', width: 14 }
    ] : [
      { header: 'Sample_Base_ID', key: 'baseId', width: 22 },
      { header: 'Active_Replicates (n)', key: 'n', width: 20 },
      { header: `Mean_${p.elements[0].label} (${u1})`, key: 'mean1', width: 24 },
      { header: 'Rep_1SD', key: 'sd1', width: 14 }
    ];
    groupedSummaryData.forEach(g => wsGrouped.addRow(g));

    const wsSeq = workbook.addWorksheet('Sequence_Runs');
    wsSeq.columns = isDual ? [
      { header: 'Run_Order', key: 'runNumber', width: 12 },
      { header: 'Status', key: 'status', width: 14 },
      { header: 'Sample_ID', key: 'id', width: 22 },
      { header: `Area_${p.elements[0].label}`, key: 'area1', width: 14 },
      { header: `Raw_${p.elements[0].label}`, key: 'raw1', width: 16 },
      { header: '1SD', key: 'sd1', width: 12 },
      { header: `Area_${p.elements[1].label}`, key: 'area2', width: 14 },
      { header: `Raw_${p.elements[1].label}`, key: 'raw2', width: 16 },
      { header: '1SD', key: 'sd2', width: 12 },
      { header: `Calibrated_${p.elements[0].label} (${u1})`, key: 'cal1', width: 22 },
      { header: 'Combined_1SD', key: 'propSd1', width: 16 },
      { header: `Calibrated_${p.elements[1].label} (${u2})`, key: 'cal2', width: 22 },
      { header: 'Combined_1SD', key: 'propSd2', width: 16 }
    ] : [
      { header: 'Run_Order', key: 'runNumber', width: 12 },
      { header: 'Status', key: 'status', width: 14 },
      { header: 'Sample_ID', key: 'id', width: 22 },
      { header: `Area_${p.elements[0].label}`, key: 'area1', width: 14 },
      { header: `Raw_${p.elements[0].label}`, key: 'raw1', width: 16 },
      { header: '1SD', key: 'sd1', width: 12 },
      { header: `Calibrated_${p.elements[0].label} (${u1})`, key: 'cal1', width: 22 },
      { header: 'Combined_1SD', key: 'propSd1', width: 16 }
    ];
    sequenceExportData.forEach(r => wsSeq.addRow(r));

    const wsFig = workbook.addWorksheet('Figures_and_QC');
    wsFig.getCell('B2').value = `IsoCalib v1.4.0 Report (${currentMode} · AreaMode: ${areaMode})`;
    wsFig.getCell('B2').font = { size: 14, bold: true };

    let imgRow = 6;
    for (const pid of ['plot-1', ...(isDual ? ['plot-2'] : []), 'plot-drift-1', ...(isDual ? ['plot-drift-2'] : [])]) {
      const b64 = await capturePlotAsBase64Png(pid);
      if (b64) {
        const imgId = workbook.addImage({ base64: b64, extension: 'png' });
        wsFig.addImage(imgId, { tl: { col: 1, row: imgRow }, ext: { width: 580, height: 360 } });
        imgRow += 20;
      }
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `IsoCalib_v1.4.0_${currentMode}_Report.xlsx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } finally {
    exportBtn.innerHTML = originalBtnText;
    exportBtn.style.opacity = '1';
  }
});

window.addEventListener('DOMContentLoaded', () => {
  updateLayoutForMode(false);
  setLanguage(currentLang);
});
