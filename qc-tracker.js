/* qc-tracker.js - IsoCalib v1.5.0 Long-Term Laboratory QC Control Chart & Instrument Tracker (Unified Editorial Style) */

(function () {
  const QC_STORAGE_KEY = 'isocalib_longterm_qc_logs_v1';

  function loadQcLogs() {
    try {
      const raw = localStorage.getItem(QC_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('Failed to load QC logs:', e);
      return [];
    }
  }

  function saveQcLogs(logs) {
    try {
      localStorage.setItem(QC_STORAGE_KEY, JSON.stringify(logs));
    } catch (e) {
      alert('브라우저 저장 공간 한도로 인해 QC 기록 저장에 실패했습니다.');
    }
  }

  // 1. 상단 내비게이션에 메뉴 추가 및 대시보드 모달 생성
  function injectQcTrackerUI() {
    const isEn = typeof currentLang !== 'undefined' && currentLang === 'en';

    const moreContainer = document.getElementById('more-menu-container');
    if (moreContainer && !document.getElementById('btn-open-qc-tracker')) {
      const sep = document.createElement('span');
      sep.className = 'text-stone-300';
      sep.textContent = '·';

      const btnNav = document.createElement('button');
      btnNav.id = 'btn-open-qc-tracker';
      btnNav.type = 'button';
      btnNav.className = 'hover:text-stone-900 transition text-stone-600 hover:font-medium cursor-pointer';
      btnNav.textContent = isEn ? 'QC Control Chart' : '장기 QC 관리도';

      moreContainer.parentNode.insertBefore(sep, moreContainer);
      moreContainer.parentNode.insertBefore(btnNav, moreContainer);

      btnNav.addEventListener('click', openQcTrackerModal);
    }

    if (!document.getElementById('qc-tracker-modal')) {
      const modal = document.createElement('div');
      modal.id = 'qc-tracker-modal';
      modal.className = 'hidden fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4';
      modal.innerHTML = `
        <div class="bg-white border border-[#c7c5bc] max-w-5xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl space-y-6">
          <div class="flex flex-wrap justify-between items-start border-b border-stone-200 pb-4 gap-4">
            <div>
              <div class="flex items-center space-x-2">
                <span class="font-brand text-lg font-bold text-stone-900">ISOCALIB</span>
                <span class="text-xs uppercase tracking-widest text-stone-500 font-mono font-bold">/ Long-Term QC Control Chart (Shewhart)</span>
              </div>
              <p class="text-xs text-stone-500 pt-1">
                장기 내부 표준물질(KDO, B2151, USGS45 등) 누적 정밀도 및 ±2σ 경고 / ±3σ 조치 한계 모니터링
              </p>
            </div>
            <div class="flex items-center space-x-2">
              <button id="btn-qc-export-json" type="button" class="px-3 py-1.5 bg-white border border-[#c7c5bc] hover:border-stone-900 text-xs font-mono font-semibold text-stone-800 transition cursor-pointer">
                Backup JSON
              </button>
              <button id="btn-qc-import-json" type="button" class="px-3 py-1.5 bg-white border border-[#c7c5bc] hover:border-stone-900 text-xs font-mono font-semibold text-stone-800 transition cursor-pointer">
                Restore JSON
              </button>
              <input type="file" id="qc-json-file-input" accept=".json" class="hidden">
              <button id="btn-close-qc-tracker" type="button" class="text-stone-400 hover:text-stone-800 font-mono text-xl p-1 leading-none cursor-pointer">&times;</button>
            </div>
          </div>

          <div class="bg-[#fbfaf8] border border-[#c7c5bc] p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div class="flex flex-wrap items-center gap-3">
              <div class="flex items-center space-x-1.5">
                <label for="qc-filter-std" class="font-bold text-stone-800">QC Standard:</label>
                <select id="qc-filter-std" class="bg-white border border-stone-300 px-2.5 py-1 text-xs font-sans text-stone-900 focus:outline-none focus:border-stone-900 cursor-pointer"></select>
              </div>
              <div class="flex items-center space-x-1.5">
                <label for="qc-filter-inst" class="font-bold text-stone-800">Instrument / Line:</label>
                <select id="qc-filter-inst" class="bg-white border border-stone-300 px-2.5 py-1 text-xs font-sans text-stone-900 focus:outline-none focus:border-stone-900 cursor-pointer"></select>
              </div>
            </div>
            <div class="flex items-center space-x-2.5">
              <button id="btn-qc-load-sample-history" type="button" class="px-2.5 py-1 bg-white border border-[#c7c5bc] hover:border-stone-900 text-[11px] font-semibold text-stone-800 transition cursor-pointer">
                + Load Demo History
              </button>
              <button id="btn-qc-clear-all" type="button" class="px-2 py-1 text-rose-700 hover:text-rose-900 underline underline-offset-2 text-[11px] cursor-pointer">
                Clear Logs
              </button>
            </div>
          </div>

          <div id="qc-stats-cards" class="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs"></div>

          <div class="space-y-4">
            <div class="border border-[#d1cfc7] bg-white p-3 shadow-xs space-y-2">
              <div class="flex justify-between items-center px-1">
                <span class="font-mono text-[10px] uppercase font-bold text-stone-400">Control Chart 01 · Primary Isotope</span>
                <button id="btn-export-qc-svg-1" type="button" class="text-[11px] font-mono text-stone-600 hover:text-stone-900 underline underline-offset-2 cursor-pointer">Export Publication SVG</button>
              </div>
              <div id="qc-control-plot-1" class="w-full h-[320px] flex items-center justify-center text-xs text-stone-400 font-serif-title italic">
                No logged QC records yet. Run calibration and log QC results in Section 03.
              </div>
            </div>

            <div id="qc-control-plot-2-box" class="hidden border border-[#d1cfc7] bg-white p-3 shadow-xs space-y-2">
              <div class="flex justify-between items-center px-1">
                <span class="font-mono text-[10px] uppercase font-bold text-stone-400">Control Chart 02 · Secondary Isotope</span>
                <button id="btn-export-qc-svg-2" type="button" class="text-[11px] font-mono text-stone-600 hover:text-stone-900 underline underline-offset-2 cursor-pointer">Export Publication SVG</button>
              </div>
              <div id="qc-control-plot-2" class="w-full h-[320px] flex items-center justify-center text-xs text-stone-400 font-serif-title italic"></div>
            </div>
          </div>

          <div class="space-y-2">
            <div class="font-mono text-xs font-bold uppercase tracking-wider text-stone-800">Cumulative QC Run History Log</div>
            <div class="border border-[#c7c5bc] bg-white overflow-x-auto max-h-[260px]">
              <table class="w-full text-left text-xs font-data text-stone-900">
                <thead class="bg-[#f0ede6] sticky top-0 border-b border-[#d1cfc7] font-sans text-[11px] font-bold uppercase tracking-wider text-stone-800">
                  <tr>
                    <th class="p-2">Date / Time</th>
                    <th class="p-2">Instrument</th>
                    <th class="p-2">QC Std</th>
                    <th class="p-2">System</th>
                    <th class="p-2 text-right">n</th>
                    <th class="p-2 text-right">Mean 1</th>
                    <th class="p-2 text-right">Bias 1</th>
                    <th class="p-2 text-right">1σ SD 1</th>
                    <th class="p-2 text-right">Mean 2</th>
                    <th class="p-2 text-right">Bias 2</th>
                    <th class="p-2 text-right">1σ SD 2</th>
                    <th class="p-2 text-center">Del</th>
                  </tr>
                </thead>
                <tbody id="qc-history-tbody" class="divide-y divide-[#e5e3dc]"></tbody>
              </table>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      document.getElementById('btn-close-qc-tracker').addEventListener('click', () => modal.classList.add('hidden'));
      modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.add('hidden'); });

      document.getElementById('qc-filter-std').addEventListener('change', renderQcDashboard);
      document.getElementById('qc-filter-inst').addEventListener('change', renderQcDashboard);

      document.getElementById('btn-qc-export-json').addEventListener('click', exportQcJson);
      document.getElementById('btn-qc-import-json').addEventListener('click', () => document.getElementById('qc-json-file-input').click());
      document.getElementById('qc-json-file-input').addEventListener('change', importQcJson);

      document.getElementById('btn-qc-clear-all').addEventListener('click', () => {
        if (confirm('누적된 모든 장기 QC 이력을 삭제하시겠습니까? (삭제 전 Backup JSON을 권장합니다)')) {
          saveQcLogs([]);
          renderQcDashboard();
        }
      });

      document.getElementById('btn-qc-load-sample-history').addEventListener('click', seedDemoQcHistory);

      document.getElementById('btn-export-qc-svg-1').addEventListener('click', () => {
        Plotly.downloadImage('qc-control-plot-1', { format: 'svg', width: 900, height: 420, filename: 'IsoCalib_QC_Control_Chart_1' });
      });
      document.getElementById('btn-export-qc-svg-2').addEventListener('click', () => {
        Plotly.downloadImage('qc-control-plot-2', { format: 'svg', width: 900, height: 420, filename: 'IsoCalib_QC_Control_Chart_2' });
      });
    }
  }

  // 2. Section 03 QC 배너가 보일 때마다 하단에 누적 기록 버튼 강제 주입
  function ensureQcBannerActionBar() {
    const banner = document.getElementById('qc-summary-banner');
    if (!banner || banner.classList.contains('hidden')) return;
    if (document.getElementById('qc-log-action-bar')) return;

    const isEn = typeof currentLang !== 'undefined' && currentLang === 'en';
    const bar = document.createElement('div');
    bar.id = 'qc-log-action-bar';
    bar.className = 'pt-2.5 mt-2 border-t border-stone-300/70 flex flex-wrap items-center justify-between gap-2 text-xs font-mono';
    bar.innerHTML = `
      <div class="flex items-center space-x-2">
        <label for="qc-instrument-tag" class="font-bold text-stone-800">${isEn ? 'Instrument:' : '장비/라인:'}</label>
        <select id="qc-instrument-tag" class="bg-white border border-[#c7c5bc] px-2 py-1 text-xs font-sans text-stone-900 focus:outline-none focus:border-stone-900 cursor-pointer">
          <option value="MAT253-Kiel">MAT253 + Kiel IV</option>
          <option value="MAT253-GasBench">MAT253 + GasBench II</option>
          <option value="DeltaQ-EA">Delta Q + EA-IRMS</option>
          <option value="CRDS-Water">CRDS (L2130-i / L2140-i)</option>
          <option value="Lab-IRMS">General IRMS</option>
        </select>
      </div>
      <div class="flex items-center space-x-2">
        <button id="btn-log-current-qc" type="button" class="px-3 py-1 bg-stone-900 hover:bg-stone-800 text-white font-semibold transition cursor-pointer">
          ${isEn ? '+ Log QC Run' : '+ 장기 QC DB에 기록'}
        </button>
        <button id="btn-view-qc-chart-inline" type="button" class="px-3 py-1 bg-white border border-[#c7c5bc] hover:border-stone-900 text-stone-800 font-semibold transition cursor-pointer">
          ${isEn ? 'Open Control Chart' : '장기 QC 관리도'}
        </button>
      </div>
    `;
    banner.appendChild(bar);

    const instSelect = document.getElementById('qc-instrument-tag');
    const sysVal = document.getElementById('isotope-preset')?.value || 'CO';
    if (sysVal === 'CO') instSelect.value = 'MAT253-Kiel';
    else if (['CN', 'EA_C', 'EA_N', 'CH', 'S'].includes(sysVal)) instSelect.value = 'DeltaQ-EA';
    else if (['HO', 'WATER_H', 'WATER_O'].includes(sysVal)) instSelect.value = 'CRDS-Water';

    document.getElementById('btn-log-current-qc').addEventListener('click', recordCurrentQcRun);
    document.getElementById('btn-view-qc-chart-inline').addEventListener('click', openQcTrackerModal);
  }

  function observeQcBanner() {
    const banner = document.getElementById('qc-summary-banner');
    if (!banner) return;

    const observer = new MutationObserver(() => ensureQcBannerActionBar());
    observer.observe(banner, { attributes: true, childList: true, subtree: true });

    // 실행 버튼 클릭 직후에도 보장
    const btnCalc = document.getElementById('btn-calc');
    if (btnCalc) {
      btnCalc.addEventListener('click', () => setTimeout(ensureQcBannerActionBar, 60));
    }
    ensureQcBannerActionBar();
  }

  // 3. 전역 객체 또는 배너 DOM 텍스트에서 현재 QC 결과를 추출하여 저장
  function extractCurrentQcData() {
    // 1순위: 전역 변수 직접 참조
    if (typeof lastQcSummaryReport !== 'undefined' && lastQcSummaryReport) {
      return lastQcSummaryReport;
    }
    if (window.lastQcSummaryReport) {
      return window.lastQcSummaryReport;
    }

    // 2순위: 화면에 렌더링된 QC 배너 텍스트에서 직접 파싱
    const banner = document.getElementById('qc-summary-banner');
    if (!banner || banner.classList.contains('hidden')) return null;

    const text = banner.innerText;
    const countMatch = text.match(/(\d+)\s*(?:회|active)/i);
    const nameMatch = text.match(/\[([A-Za-z0-9._-]+)\]/);
    const means = [...text.matchAll(/(?:평균 보정값|Mean Calibrated):\s*([+-]?\d+\.\d+)/g)].map(m => parseFloat(m[1]));
    const biases = [...text.matchAll(/(?:정확도 편차|Bias):\s*([+-]?\d+\.\d+)/g)].map(m => parseFloat(m[1]));
    const sds = [...text.matchAll(/(?:반복 정밀도|Rep 1σ):\s*±?\s*(\d+\.\d+)/g)].map(m => parseFloat(m[1]));

    if (means.length === 0) return null;

    // QC 카드에서 표준물질 이름 및 공인값 읽기
    const cards = document.querySelectorAll('#std-input-container > div');
    const qcCard = cards[cards.length - 1];
    const qcInputs = qcCard ? qcCard.querySelectorAll('input') : [];
    const qcStdName = qcInputs[0]?.value?.trim() || (nameMatch ? nameMatch[1] : 'QC-Std');
    const true1 = parseFloat(qcInputs[1]?.value);
    const true2 = parseFloat(qcInputs[2]?.value);

    return {
      qcName: qcStdName,
      count: countMatch ? parseInt(countMatch[1], 10) : 1,
      status: text.includes('PASS') ? 'PASS' : 'WARN',
      true1: !isNaN(true1) ? true1 : (means[0] - (biases[0] || 0)),
      mean1: means[0],
      bias1: biases[0] || 0,
      sdQc1: sds[0] || 0,
      true2: means.length > 1 ? (!isNaN(true2) ? true2 : (means[1] - (biases[1] || 0))) : null,
      mean2: means.length > 1 ? means[1] : null,
      bias2: biases.length > 1 ? biases[1] : null,
      sdQc2: sds.length > 1 ? sds[1] : null
    };
  }

  function recordCurrentQcRun() {
    const rep = extractCurrentQcData();
    const isEn = typeof currentLang !== 'undefined' && currentLang === 'en';
    if (!rep) {
      alert(isEn ? 'No active QC summary available to log. Please run calibration first.' : '기록할 유효한 QC 결과가 없습니다. 먼저 검량을 실행해 주세요.');
      return;
    }

    const inst = document.getElementById('qc-instrument-tag')?.value || 'Lab-IRMS';
    const sysVal = document.getElementById('isotope-preset')?.value || 'CO';
    const preset = typeof PRESETS !== 'undefined' ? PRESETS[sysVal] : null;
    const label1 = preset?.elements?.[0]?.label || 'δ₁';
    const label2 = preset?.elements?.[1]?.label || 'δ₂';
    const unit1 = typeof getElementUnit === 'function' ? getElementUnit(0) : '‰';
    const unit2 = typeof getElementUnit === 'function' ? getElementUnit(1) : '‰';

    const logs = loadQcLogs();
    const entry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      dateStr: new Date().toISOString().slice(0, 16).replace('T', ' '),
      instrument: inst,
      system: sysVal,
      qcName: rep.qcName,
      count: rep.count,
      status: rep.status,
      label1,
      unit1,
      true1: rep.true1 ?? (rep.mean1 - rep.bias1),
      mean1: rep.mean1,
      bias1: rep.bias1,
      sd1: rep.sdQc1,
      label2: rep.mean2 !== null ? label2 : null,
      unit2: rep.mean2 !== null ? unit2 : null,
      true2: rep.mean2 !== null ? (rep.true2 ?? (rep.mean2 - rep.bias2)) : null,
      mean2: rep.mean2,
      bias2: rep.bias2,
      sd2: rep.sdQc2
    };

    logs.push(entry);
    saveQcLogs(logs);

    const btn = document.getElementById('btn-log-current-qc');
    if (btn) {
      const orig = btn.textContent;
      btn.textContent = isEn ? 'Logged ✓' : '기록 완료 ✓';
      btn.classList.replace('bg-stone-900', 'bg-emerald-800');
      setTimeout(() => {
        btn.textContent = orig;
        btn.classList.replace('bg-emerald-800', 'bg-stone-900');
      }, 1500);
    }
  }

  function openQcTrackerModal() {
    const modal = document.getElementById('qc-tracker-modal');
    if (!modal) return;
    modal.classList.remove('hidden');

    const logs = loadQcLogs();
    const stdSel = document.getElementById('qc-filter-std');
    const instSel = document.getElementById('qc-filter-inst');

    const uniqueStds = [...new Set(logs.map(l => l.qcName))];
    const uniqueInsts = [...new Set(logs.map(l => l.instrument))];

    const prevStd = stdSel.value;
    const prevInst = instSel.value;

    stdSel.innerHTML = uniqueStds.length
      ? uniqueStds.map(s => `<option value="${s}">${s}</option>`).join('')
      : `<option value="">-- None --</option>`;

    instSel.innerHTML = `<option value="ALL">All Instruments (${logs.length})</option>` +
      uniqueInsts.map(i => `<option value="${i}">${i}</option>`).join('');

    if (prevStd && uniqueStds.includes(prevStd)) stdSel.value = prevStd;
    if (prevInst && (prevInst === 'ALL' || uniqueInsts.includes(prevInst))) instSel.value = prevInst;

    renderQcDashboard();
  }

  function renderQcDashboard() {
    const logs = loadQcLogs();
    const selectedStd = document.getElementById('qc-filter-std').value;
    const selectedInst = document.getElementById('qc-filter-inst').value;

    const filtered = logs.filter(l => {
      const matchStd = !selectedStd || l.qcName === selectedStd;
      const matchInst = selectedInst === 'ALL' || l.instrument === selectedInst;
      return matchStd && matchInst;
    });

    const statsContainer = document.getElementById('qc-stats-cards');
    const tbody = document.getElementById('qc-history-tbody');
    const plot1 = document.getElementById('qc-control-plot-1');
    const plot2Box = document.getElementById('qc-control-plot-2-box');

    if (filtered.length === 0) {
      statsContainer.innerHTML = '';
      tbody.innerHTML = `<tr><td colspan="12" class="p-6 text-center text-stone-400 font-serif-title italic">누적된 QC 기록이 없습니다. 상단 '+ Load Demo History'로 예시 추이를 보거나 검량 후 '+ 장기 QC DB에 기록'을 눌러주세요.</td></tr>`;
      plot1.innerHTML = `<span class="text-xs text-stone-400 font-serif-title italic">No QC records to plot.</span>`;
      plot2Box.classList.add('hidden');
      return;
    }

    const calcStats = (arr) => {
      const n = arr.length;
      const mean = arr.reduce((a, b) => a + b, 0) / n;
      const sd = n > 1 ? Math.sqrt(arr.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / (n - 1)) : 0;
      return { n, mean, sd };
    };

    const vals1 = filtered.map(f => f.mean1);
    const st1 = calcStats(vals1);
    const true1 = filtered[filtered.length - 1].true1;
    const label1 = filtered[0].label1 || 'δ₁';
    const unit1 = filtered[0].unit1 || '‰';

    const hasDual = filtered.some(f => f.mean2 !== null && !isNaN(f.mean2));
    let st2 = null, true2 = null, label2 = 'δ₂', unit2 = '‰';
    if (hasDual) {
      const valid2 = filtered.filter(f => f.mean2 !== null && !isNaN(f.mean2));
      st2 = calcStats(valid2.map(f => f.mean2));
      true2 = valid2[valid2.length - 1].true2;
      label2 = valid2[0].label2 || 'δ₂';
      unit2 = valid2[0].unit2 || '‰';
    }

    statsContainer.innerHTML = `
      <div class="bg-[#fbfaf8] border border-[#d1cfc7] p-3">
        <div class="text-[10px] text-stone-500 uppercase">Total QC Sequences</div>
        <div class="text-base font-bold text-stone-900 mt-0.5">${filtered.length} runs</div>
        <div class="text-[10px] text-stone-500 mt-0.5">${selectedStd} (${selectedInst})</div>
      </div>
      <div class="bg-[#fbfaf8] border border-[#d1cfc7] p-3">
        <div class="text-[10px] text-stone-500 uppercase">Long-Term ${label1}</div>
        <div class="text-sm font-bold text-stone-900 mt-0.5">${st1.mean.toFixed(3)} ± ${st1.sd.toFixed(3)}</div>
        <div class="text-[10px] text-emerald-800 mt-0.5">Certified: ${true1.toFixed(3)} ${unit1}</div>
      </div>
      ${hasDual && st2 ? `
      <div class="bg-[#fbfaf8] border border-[#d1cfc7] p-3">
        <div class="text-[10px] text-stone-500 uppercase">Long-Term ${label2}</div>
        <div class="text-sm font-bold text-stone-900 mt-0.5">${st2.mean.toFixed(3)} ± ${st2.sd.toFixed(3)}</div>
        <div class="text-[10px] text-emerald-800 mt-0.5">Certified: ${true2.toFixed(3)} ${unit2}</div>
      </div>
      ` : ''}
      <div class="bg-[#fbfaf8] border border-[#d1cfc7] p-3">
        <div class="text-[10px] text-stone-500 uppercase">Control Limits (Shewhart)</div>
        <div class="text-xs font-bold text-amber-700 mt-1">Warning: ±2σ (${(st1.sd * 2).toFixed(3)}‰)</div>
        <div class="text-xs font-bold text-rose-700 mt-0.5">Action: ±3σ (${(st1.sd * 3).toFixed(3)}‰)</div>
      </div>
    `;

    const drawShewhart = (elemId, dates, values, insts, stats, certifiedVal, isoLabel, unitStr) => {
      const el = document.getElementById(elemId);
      el.innerHTML = '';
      const xLabels = dates.map((d, idx) => `#${idx + 1} (${d.slice(5, 10)})`);
      const xRange = [xLabels[0], xLabels[xLabels.length - 1]];
      const sd = stats.sd > 0 ? stats.sd : 0.05;

      const traces = [
        {
          x: xLabels,
          y: values,
          text: insts,
          mode: 'lines+markers',
          type: 'scatter',
          name: `${selectedStd} Measured Mean`,
          marker: { size: 7, color: '#111827' },
          line: { color: '#374151', width: 1.5 }
        },
        {
          x: xRange,
          y: [certifiedVal, certifiedVal],
          mode: 'lines',
          name: `Certified (${certifiedVal.toFixed(3)})`,
          line: { color: '#047857', width: 2, dash: 'solid' }
        },
        {
          x: xRange,
          y: [stats.mean + 2 * sd, stats.mean + 2 * sd],
          mode: 'lines',
          name: '+2σ Warning',
          line: { color: '#d97706', width: 1.2, dash: 'dash' }
        },
        {
          x: xRange,
          y: [stats.mean - 2 * sd, stats.mean - 2 * sd],
          mode: 'lines',
          name: '-2σ Warning',
          line: { color: '#d97706', width: 1.2, dash: 'dash' },
          showlegend: false
        },
        {
          x: xRange,
          y: [stats.mean + 3 * sd, stats.mean + 3 * sd],
          mode: 'lines',
          name: '+3σ Action Limit',
          line: { color: '#dc2626', width: 1.2, dash: 'dot' }
        },
        {
          x: xRange,
          y: [stats.mean - 3 * sd, stats.mean - 3 * sd],
          mode: 'lines',
          name: '-3σ Action Limit',
          line: { color: '#dc2626', width: 1.2, dash: 'dot' },
          showlegend: false
        }
      ];

      const layout = {
        title: { text: `Shewhart Control Chart: ${selectedStd} — ${isoLabel} (${unitStr})`, font: { family: 'Newsreader, Georgia, serif', size: 15, color: '#111827' }, x: 0.03 },
        paper_bgcolor: '#ffffff',
        plot_bgcolor: '#ffffff',
        margin: { l: 55, r: 25, t: 40, b: 50 },
        xaxis: { showgrid: true, gridcolor: '#f0ede6', linecolor: '#c7c5bc', tickfont: { family: 'IBM Plex Mono, monospace', size: 10, color: '#4b5563' } },
        yaxis: { title: { text: `${isoLabel} (${unitStr})`, font: { family: 'Inter, sans-serif', size: 11, color: '#374151' } }, showgrid: true, gridcolor: '#f0ede6', linecolor: '#c7c5bc', tickfont: { family: 'IBM Plex Mono, monospace', size: 10, color: '#4b5563' } },
        showlegend: true,
        legend: { orientation: 'h', y: -0.25, x: 0.02, font: { family: 'Inter, sans-serif', size: 10, color: '#374151' } }
      };

      Plotly.newPlot(elemId, traces, layout, { responsive: true, displayModeBar: false });
    };

    drawShewhart(
      'qc-control-plot-1',
      filtered.map(f => f.dateStr),
      vals1,
      filtered.map(f => f.instrument),
      st1,
      true1,
      label1,
      unit1
    );

    if (hasDual && st2) {
      plot2Box.classList.remove('hidden');
      const valid2 = filtered.filter(f => f.mean2 !== null && !isNaN(f.mean2));
      drawShewhart(
        'qc-control-plot-2',
        valid2.map(f => f.dateStr),
        valid2.map(f => f.mean2),
        valid2.map(f => f.instrument),
        st2,
        true2,
        label2,
        unit2
      );
    } else {
      plot2Box.classList.add('hidden');
    }

    tbody.innerHTML = filtered.slice().reverse().map(row => `
      <tr class="hover:bg-stone-50">
        <td class="p-2 font-mono text-[11px]">${row.dateStr}</td>
        <td class="p-2 font-mono text-[11px] font-semibold text-stone-800">${row.instrument}</td>
        <td class="p-2 font-bold">${row.qcName}</td>
        <td class="p-2 font-mono text-[11px]">${row.system}</td>
        <td class="p-2 text-right font-mono">${row.count}</td>
        <td class="p-2 text-right font-mono font-semibold">${row.mean1.toFixed(3)}</td>
        <td class="p-2 text-right font-mono ${Math.abs(row.bias1) > 0.1 ? 'text-amber-700 font-bold' : 'text-emerald-800'}">${row.bias1 >= 0 ? '+' : ''}${row.bias1.toFixed(3)}</td>
        <td class="p-2 text-right font-mono">±${row.sd1.toFixed(3)}</td>
        <td class="p-2 text-right font-mono font-semibold">${row.mean2 !== null ? row.mean2.toFixed(3) : '-'}</td>
        <td class="p-2 text-right font-mono">${row.bias2 !== null ? (row.bias2 >= 0 ? '+' : '') + row.bias2.toFixed(3) : '-'}</td>
        <td class="p-2 text-right font-mono">${row.sd2 !== null ? '±' + row.sd2.toFixed(3) : '-'}</td>
        <td class="p-2 text-center">
          <button type="button" data-del-id="${row.id}" class="text-rose-700 hover:text-rose-900 font-mono text-xs cursor-pointer">✕</button>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('button[data-del-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = Number(btn.dataset.delId);
        const updated = loadQcLogs().filter(l => l.id !== id);
        saveQcLogs(updated);
        renderQcDashboard();
      });
    });
  }

  function exportQcJson() {
    const logs = loadQcLogs();
    const blob = new Blob([JSON.stringify({ format: 'IsoCalib-QC-History', exportedAt: new Date().toISOString(), records: logs }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `IsoCalib_LongTerm_QC_Log_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  function importQcJson(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target.result);
        const arr = Array.isArray(parsed) ? parsed : parsed.records;
        if (!Array.isArray(arr)) throw new Error('Invalid QC log JSON format');
        const existing = loadQcLogs();
        const existingIds = new Set(existing.map(x => x.id));
        const merged = [...existing, ...arr.filter(x => !existingIds.has(x.id))];
        saveQcLogs(merged);
        openQcTrackerModal();
      } catch (err) {
        alert('QC 백업 파일 불러오기 실패: ' + err.message);
      } finally {
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  }

  function seedDemoQcHistory() {
    const logs = loadQcLogs();
    const baseDates = ['2026-09-12 10:15', '2026-09-19 14:20', '2026-09-28 09:45', '2026-10-05 16:10', '2026-10-14 11:30', '2026-10-29 15:05', '2026-11-08 10:40', '2026-11-18 13:50'];
    const cVals = [0.842, 0.858, 0.835, 0.861, 0.849, 0.872, 0.831, 0.853];
    const oVals = [-8.435, -8.395, -8.450, -8.410, -8.428, -8.382, -8.465, -8.418];

    baseDates.forEach((d, idx) => {
      logs.push({
        id: 1700000000000 + idx,
        timestamp: d,
        dateStr: d,
        instrument: 'MAT253-Kiel',
        system: 'CO',
        qcName: 'KDO',
        count: 3,
        status: 'PASS',
        label1: 'δ¹³C',
        unit1: '‰ VPDB',
        true1: 0.850,
        mean1: cVals[idx],
        bias1: Number((cVals[idx] - 0.850).toFixed(3)),
        sd1: 0.024,
        label2: 'δ¹⁸O',
        unit2: '‰ VPDB',
        true2: -8.420,
        mean2: oVals[idx],
        bias2: Number((oVals[idx] - (-8.420)).toFixed(3)),
        sd2: 0.041
      });
    });

    saveQcLogs(logs);
    openQcTrackerModal();
  }

  window.addEventListener('DOMContentLoaded', () => {
    injectQcTrackerUI();
    observeQcBanner();
  });
})();
