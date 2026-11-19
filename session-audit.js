/* session-audit.js - IsoCalib v1.5.0 Session Snapshot (.isocalib) & Outlier Audit Trail (Unified Editorial Style) */

(function () {
  window.sequenceAuditNotes = {};
  let lastInteractedRowIdx = -1;

  function getAuditDefaultReason(rowIdx) {
    const isEn = typeof currentLang !== 'undefined' && currentLang === 'en';
    const tr = document.querySelectorAll('#grid-body tr')[rowIdx];
    if (!tr) return isEn ? 'Manual exclusion' : '수동 제외';

    const limit = parseFloat(document.getElementById('raw-sd-limit')?.value) || 0.100;
    const tds = tr.querySelectorAll('td');
    let exceeded = false;
    tds.forEach((td, idx) => {
      if (idx >= 3) {
        const val = parseFloat(td.innerText.trim());
        if (!isNaN(val) && val > 0 && val < 1 && val > limit) {
          exceeded = true;
        }
      }
    });

    if (exceeded || tr.querySelector('.bg-rose-100, .bg-rose-50')) {
      return isEn ? `Excluded: Raw 1σ SD exceeded ${limit.toFixed(3)}‰` : `제외: 원시 1σ SD 허용 기준(${limit.toFixed(3)}‰) 초과`;
    }
    return isEn ? 'Excluded: Analytical outlier' : '제외: 분석 이상치 판정';
  }

  // 1. 기존 툴바 버튼들과 동일한 에디토리얼 스타일(bg-white border-[#c7c5bc])로 통합
  function injectSessionControls() {
    const btnCalc = document.getElementById('btn-calc');
    if (!btnCalc || document.getElementById('btn-save-session')) return;

    const toolbar = btnCalc.parentElement;
    const isEn = typeof currentLang !== 'undefined' && currentLang === 'en';

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.id = 'session-file-input';
    fileInput.accept = '.isocalib,.json';
    fileInput.className = 'hidden';
    document.body.appendChild(fileInput);

    // Save Session 버튼 (무채색 화이트 + Crisp Stone 테두리 통일)
    const btnSave = document.createElement('button');
    btnSave.id = 'btn-save-session';
    btnSave.type = 'button';
    btnSave.className = 'px-3.5 py-2 text-xs font-semibold text-stone-800 bg-white border border-[#c7c5bc] hover:border-stone-900 transition shadow-xs cursor-pointer';
    btnSave.textContent = isEn ? 'Save Session' : '세션 저장';
    btnSave.title = isEn ? 'Save calibration setup, sequence data, and audit notes (.isocalib)' : '현재 검량 설정, 시퀀스 데이터, 이상치 사유를 .isocalib 파일로 저장';

    // Load Session 버튼
    const btnLoad = document.createElement('button');
    btnLoad.id = 'btn-load-session';
    btnLoad.type = 'button';
    btnLoad.className = 'px-3.5 py-2 text-xs font-semibold text-stone-800 bg-white border border-[#c7c5bc] hover:border-stone-900 transition shadow-xs cursor-pointer';
    btnLoad.textContent = isEn ? 'Load Session' : '세션 불러오기';
    btnLoad.title = isEn ? 'Restore a saved .isocalib project snapshot' : '저장된 .isocalib 프로젝트 파일 불러오기';

    toolbar.insertBefore(btnLoad, btnCalc);
    toolbar.insertBefore(btnSave, btnCalc);

    // 우클릭 컨텍스트 메뉴에 Audit Note 편집 버튼 추가
    const ctxMenu = document.getElementById('grid-context-menu');
    const ctxToggle = document.getElementById('ctx-toggle-exclude');
    if (ctxMenu && ctxToggle && !document.getElementById('ctx-edit-audit')) {
      const btnAudit = document.createElement('button');
      btnAudit.id = 'ctx-edit-audit';
      btnAudit.type = 'button';
      btnAudit.className = 'w-full text-left px-3.5 py-1.5 hover:bg-stone-100 flex justify-between items-center text-stone-700 font-medium';
      btnAudit.innerHTML = `<span>${isEn ? 'Edit Outlier Audit Note' : '이상치 사유 메모 편집'}</span><span class="font-mono text-[10px] text-stone-400">Note</span>`;
      ctxToggle.insertAdjacentElement('afterend', btnAudit);

      btnAudit.addEventListener('click', () => {
        ctxMenu.classList.add('hidden');
        promptAuditNoteForRow(lastInteractedRowIdx);
      });
    }

    btnSave.addEventListener('click', exportIsocalibSession);
    btnLoad.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleSessionFileSelect);
  }

  function getCleanCellText(td) {
    const clone = td.cloneNode(true);
    clone.querySelectorAll('.audit-note-badge').forEach(b => b.remove());
    const inp = clone.querySelector('input');
    return inp ? inp.value : clone.innerText.trim();
  }

  function captureGridRows() {
    const rows = [];
    document.querySelectorAll('#grid-body tr').forEach((tr, idx) => {
      const chk = tr.querySelector('input[type="checkbox"]');
      const use = chk ? chk.checked : true;
      const cells = [];
      tr.querySelectorAll('td').forEach((td, cIdx) => {
        if (cIdx >= 2) {
          cells.push(getCleanCellText(td));
        }
      });
      const hasData = cells.some(v => v !== '');
      if (hasData || !use || window.sequenceAuditNotes[idx]) {
        rows.push({
          rowIndex: idx,
          use: use,
          cells: cells,
          auditNote: window.sequenceAuditNotes[idx] || ''
        });
      }
    });
    return rows;
  }

  function captureStandardsState() {
    const anchors = [];
    const qc = {};
    document.querySelectorAll('#std-input-container > div').forEach((card, idx) => {
      const inputs = Array.from(card.querySelectorAll('input'));
      const values = inputs.map(i => ({ id: i.id || '', value: i.value }));
      if (card.dataset.role === 'qc' || card.textContent.includes('QC')) {
        qc.fields = values;
      } else {
        anchors.push({ index: idx, fields: values });
      }
    });
    return { anchors, qc };
  }

  function exportIsocalibSession() {
    const modeEl = document.getElementById('isotope-preset');
    const mode = modeEl ? modeEl.value : 'CO';
    const payload = {
      format: 'IsoCalib-Session',
      schemaVersion: '1.5.0',
      exportedAt: new Date().toISOString(),
      doi: '10.5281/zenodo.24296623',
      config: {
        isotopeSystem: mode,
        oxygenScale: document.getElementById('oxygen-scale-select')?.value || 'VPDB',
        areaMode: document.getElementById('area-mode')?.value || 'off',
        linCalcMode: document.getElementById('lin-calc-mode')?.value || 'auto',
        manualK1: document.getElementById('manual-k1')?.value || '',
        manualK2: document.getElementById('manual-k2')?.value || '',
        driftAnchor: document.getElementById('drift-anchor-select')?.value || '0',
        driftMode: document.getElementById('drift-mode')?.value || 'none',
        rawSdLimit: document.getElementById('raw-sd-limit')?.value || '0.100'
      },
      standards: captureStandardsState(),
      sequenceRows: captureGridRows()
    };

    const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Session_${mode}_${ts}.isocalib`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  function handleSessionFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    const isEn = typeof currentLang !== 'undefined' && currentLang === 'en';

    const reader = new FileReader();
    reader.onload = function (evt) {
      try {
        const data = JSON.parse(evt.target.result);
        if (data.format !== 'IsoCalib-Session' || !data.config) {
          throw new Error(isEn ? 'Invalid .isocalib session file.' : '올바른 .isocalib 세션 파일이 아닙니다.');
        }

        const setVal = (id, val) => {
          const el = document.getElementById(id);
          if (el && val !== undefined) {
            el.value = val;
            el.dispatchEvent(new Event('change', { bubbles: true }));
          }
        };

        setVal('isotope-preset', data.config.isotopeSystem);

        const targetAnchors = data.standards?.anchors?.length || 2;
        const btnAddAnchor = document.getElementById('btn-add-anchor');
        while (document.querySelectorAll('#std-input-container > div').length - 1 < targetAnchors && btnAddAnchor) {
          btnAddAnchor.click();
        }

        setVal('oxygen-scale-select', data.config.oxygenScale);
        setVal('area-mode', data.config.areaMode);
        setVal('lin-calc-mode', data.config.linCalcMode);
        setVal('manual-k1', data.config.manualK1);
        setVal('manual-k2', data.config.manualK2);
        setVal('drift-mode', data.config.driftMode);
        setVal('raw-sd-limit', data.config.rawSdLimit);

        const cards = Array.from(document.querySelectorAll('#std-input-container > div'));
        if (data.standards?.anchors) {
          data.standards.anchors.forEach((anc, i) => {
            if (cards[i]) {
              const inputs = cards[i].querySelectorAll('input');
              anc.fields.forEach((f, fIdx) => {
                if (inputs[fIdx]) {
                  inputs[fIdx].value = f.value;
                  inputs[fIdx].dispatchEvent(new Event('input', { bubbles: true }));
                }
              });
            }
          });
        }
        if (data.standards?.qc?.fields && cards.length > 0) {
          const qcCard = cards[cards.length - 1];
          const inputs = qcCard.querySelectorAll('input');
          data.standards.qc.fields.forEach((f, fIdx) => {
            if (inputs[fIdx]) {
              inputs[fIdx].value = f.value;
              inputs[fIdx].dispatchEvent(new Event('input', { bubbles: true }));
            }
          });
        }

        setVal('drift-anchor-select', data.config.driftAnchor);

        const rowsData = data.sequenceRows || [];
        const maxRowIdx = rowsData.reduce((m, r) => Math.max(m, r.rowIndex), 0);
        const btnAddRow = document.getElementById('btn-add-row');
        while (document.querySelectorAll('#grid-body tr').length <= maxRowIdx && btnAddRow) {
          btnAddRow.click();
        }

        window.sequenceAuditNotes = {};
        const trs = document.querySelectorAll('#grid-body tr');
        trs.forEach(tr => {
          const chk = tr.querySelector('input[type="checkbox"]');
          if (chk) chk.checked = true;
          tr.querySelectorAll('td').forEach((td, cIdx) => {
            if (cIdx >= 2) {
              td.querySelectorAll('.audit-note-badge').forEach(b => b.remove());
              const inp = td.querySelector('input');
              if (inp) inp.value = '';
              else td.innerText = '';
            }
          });
        });

        rowsData.forEach(r => {
          const tr = trs[r.rowIndex];
          if (!tr) return;
          const tds = tr.querySelectorAll('td');
          r.cells.forEach((val, cIdx) => {
            const td = tds[cIdx + 2];
            if (!td) return;
            const inp = td.querySelector('input');
            if (inp) {
              inp.value = val;
              inp.dispatchEvent(new Event('input', { bubbles: true }));
            } else {
              td.innerText = val;
            }
          });
          const chk = tr.querySelector('input[type="checkbox"]');
          if (chk && chk.checked !== r.use) {
            chk.checked = r.use;
            chk.dispatchEvent(new Event('change', { bubbles: true }));
          }
          if (r.auditNote) {
            window.sequenceAuditNotes[r.rowIndex] = r.auditNote;
          }
        });

        renderAuditBadges();

        const btnCalc = document.getElementById('btn-calc');
        if (btnCalc) btnCalc.click();

      } catch (err) {
        alert((isEn ? 'Failed to load session: ' : '세션 불러오기 실패: ') + err.message);
      } finally {
        fileInput.value = '';
      }
    };
    reader.readAsText(file);
  }

  function bindAuditListeners() {
    const gridBody = document.getElementById('grid-body');
    if (!gridBody || gridBody.dataset.auditBound) return;
    gridBody.dataset.auditBound = 'true';

    gridBody.addEventListener('mousedown', (e) => {
      const tr = e.target.closest('tr');
      if (tr) {
        lastInteractedRowIdx = Array.from(gridBody.children).indexOf(tr);
      }
    });

    gridBody.addEventListener('change', (e) => {
      if (e.target && e.target.type === 'checkbox') {
        const tr = e.target.closest('tr');
        if (!tr) return;
        const rowIdx = Array.from(gridBody.children).indexOf(tr);
        lastInteractedRowIdx = rowIdx;

        if (!e.target.checked) {
          if (!window.sequenceAuditNotes[rowIdx]) {
            window.sequenceAuditNotes[rowIdx] = getAuditDefaultReason(rowIdx);
          }
        } else {
          delete window.sequenceAuditNotes[rowIdx];
        }
        renderAuditBadges();
      }
    });
  }

  function promptAuditNoteForRow(targetIdx) {
    const isEn = typeof currentLang !== 'undefined' && currentLang === 'en';
    const gridBody = document.getElementById('grid-body');
    if (!gridBody) return;

    let rowIdx = (typeof targetIdx === 'number' && targetIdx >= 0) ? targetIdx : lastInteractedRowIdx;
    if (rowIdx < 0) {
      const selectedTr = document.querySelector('#grid-body tr.bg-sky-50, #grid-body tr.selected-row');
      if (selectedTr) rowIdx = Array.from(gridBody.children).indexOf(selectedTr);
    }

    if (rowIdx < 0) {
      alert(isEn ? 'Select a row in the table first.' : '먼저 표에서 사유를 기록할 행을 클릭해 주세요.');
      return;
    }

    const tr = gridBody.children[rowIdx];
    if (!tr) return;

    const currentNote = window.sequenceAuditNotes[rowIdx] || getAuditDefaultReason(rowIdx);
    const input = prompt(
      isEn
        ? `Audit Note for Run #${String(rowIdx + 1).padStart(2, '0')} (Outlier Exclusion Reason):`
        : `Run #${String(rowIdx + 1).padStart(2, '0')} 이상치 제외 사유 메모:`,
      currentNote
    );

    if (input !== null) {
      const trimmed = input.trim();
      if (trimmed) {
        window.sequenceAuditNotes[rowIdx] = trimmed;
        const chk = tr.querySelector('input[type="checkbox"]');
        if (chk && chk.checked) {
          chk.checked = false;
          chk.dispatchEvent(new Event('change', { bubbles: true }));
        }
      } else {
        delete window.sequenceAuditNotes[rowIdx];
      }
      renderAuditBadges();
    }
  }

  // 모노크롬 에디토리얼 스타일 배지 ([Note])
  function renderAuditBadges() {
    const trs = document.querySelectorAll('#grid-body tr');
    trs.forEach((tr, idx) => {
      const idCell = tr.querySelectorAll('td')[2];
      if (!idCell) return;

      idCell.querySelectorAll('.audit-note-badge').forEach(b => b.remove());
      if (idCell.innerText.includes('[Note]') || idCell.innerText.includes('📝 Note')) {
        idCell.innerText = idCell.innerText.replace(/\[Note\]|📝\s*Note/g, '').trim();
      }

      const note = window.sequenceAuditNotes[idx];
      if (note) {
        const badge = document.createElement('span');
        badge.className = 'audit-note-badge ml-1.5 px-1.5 py-0.2 bg-stone-100 border border-stone-300 text-stone-700 hover:border-stone-900 font-mono text-[9px] cursor-pointer inline-block select-none transition';
        badge.contentEditable = 'false';
        badge.textContent = '[Note]';
        badge.title = note;
        badge.addEventListener('mousedown', (ev) => {
          ev.stopPropagation();
          ev.preventDefault();
          lastInteractedRowIdx = idx;
          promptAuditNoteForRow(idx);
        });
        idCell.appendChild(badge);
      }
    });
  }

  window.addEventListener('DOMContentLoaded', () => {
    injectSessionControls();
    bindAuditListeners();
  });
})();
