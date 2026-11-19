/* water-hydrology.js - IsoCalib v1.5.0 Water Isotope Hydrology Diagnostics (d-excess & GMWL/LMWL) */

(function () {
  // 1. HO 시스템일 때만 수문학 진단 섹션(Figure 5) DOM 준비
  function ensureHydrologyPanel() {
    const plot4Box = document.getElementById('plot-drift-box-2');
    if (!plot4Box) return null;

    let hydroBox = document.getElementById('plot-hydrology-box');
    if (!hydroBox) {
      hydroBox = document.createElement('div');
      hydroBox.id = 'plot-hydrology-box';
      hydroBox.className = 'hidden border border-[#d1cfc7] bg-white p-3 shadow-sm space-y-2';
      hydroBox.innerHTML = `
        <div class="flex justify-between items-center px-1">
          <span class="font-mono text-[10px] uppercase font-bold text-stone-400">Figure 5 · Water Hydrology (GMWL vs. LMWL)</span>
          <button id="btn-export-svg-hydro" type="button" class="text-[11px] font-mono text-stone-600 hover:text-stone-900 underline underline-offset-2 cursor-pointer">
            Export Publication SVG
          </button>
        </div>
        <div id="hydro-summary-strip" class="bg-[#fbfaf8] border border-stone-200 px-3 py-2 font-mono text-[11px] text-stone-700 flex flex-wrap justify-between gap-2"></div>
        <div id="plot-hydrology" class="plot-container flex items-center justify-center text-xs text-stone-400 font-serif-title italic">
          Awaiting water isotope computation...
        </div>
      `;
      plot4Box.insertAdjacentElement('afterend', hydroBox);

      document.getElementById('btn-export-svg-hydro').addEventListener('click', () => {
        Plotly.downloadImage('plot-hydrology', {
          format: 'svg',
          width: 800,
          height: 600,
          filename: 'IsoCalib_HO_GMWL_LMWL_Diagnostics'
        });
      });
    }
    return hydroBox;
  }

  // 2. 표준물질 이름 목록 수집 (미지 시료 필터링용)
  function getStandardPrefixes() {
    const names = [];
    document.querySelectorAll('#std-input-container > div').forEach(card => {
      const inp = card.querySelector('input[type="text"]');
      if (inp && inp.value.trim()) {
        names.push(inp.value.trim().toLowerCase());
      }
    });
    return names;
  }

  function isStandardOrBlank(sampleId, stdPrefixes) {
    const lower = sampleId.toLowerCase();
    if (lower.includes('blank') || lower === 'blk' || lower.startsWith('blk_') || lower.startsWith('tin')) {
      return true;
    }
    return stdPrefixes.some(p => lower === p || lower.startsWith(p + '_') || lower.startsWith(p + '-'));
  }

  // 3. OLS 선형 회귀 (LMWL: δD = slope * δ18O + intercept)
  function fitLMWL(xArr, yArr) {
    const n = xArr.length;
    if (n < 2) return null;

    const meanX = xArr.reduce((a, b) => a + b, 0) / n;
    const meanY = yArr.reduce((a, b) => a + b, 0) / n;

    let num = 0, denX = 0, denY = 0;
    for (let i = 0; i < n; i++) {
      const dx = xArr[i] - meanX;
      const dy = yArr[i] - meanY;
      num += dx * dy;
      denX += dx * dx;
      denY += dy * dy;
    }
    if (denX === 0) return null;

    const slope = num / denX;
    const intercept = meanY - slope * meanX;
    const r2 = denY > 0 ? (num * num) / (denX * denY) : 1;

    return { n, slope, intercept, r2, meanX, meanY };
  }

  // 4. Section 03 결과 테이블에 d-excess 열 주입 및 Figure 5 렌더링
  function updateWaterHydrologyDiagnostics() {
    const mode = document.getElementById('isotope-preset')?.value;
    const hydroBox = ensureHydrologyPanel();

    if (mode !== 'HO') {
      if (hydroBox) hydroBox.classList.add('hidden');
      return;
    }

    // sequenceExportData / groupedSummaryData 전역 배열 확인
    const seqData = (typeof sequenceExportData !== 'undefined' && Array.isArray(sequenceExportData)) ? sequenceExportData : [];
    const grpData = (typeof groupedSummaryData !== 'undefined' && Array.isArray(groupedSummaryData)) ? groupedSummaryData : [];

    if (seqData.length === 0) {
      if (hydroBox) hydroBox.classList.add('hidden');
      return;
    }

    const isEn = typeof currentLang !== 'undefined' && currentLang === 'en';

    // A. Run-by-Run Sequence 테이블에 d-excess 열 추가
    const resHeadRow = document.querySelector('#result-head tr');
    const resBodyRows = document.querySelectorAll('#result-body tr');
    if (resHeadRow && resBodyRows.length === seqData.length) {
      if (!resHeadRow.querySelector('.hydro-col-header')) {
        const thD = document.createElement('th');
        thD.className = 'p-2.5 text-right hydro-col-header text-sky-950';
        thD.textContent = 'd-excess (‰)';

        const thSd = document.createElement('th');
        thSd.className = 'p-2.5 text-right hydro-col-header text-stone-500';
        thSd.textContent = '± 1σ (d)';

        resHeadRow.appendChild(thD);
        resHeadRow.appendChild(thSd);
      }

      seqData.forEach((row, idx) => {
        const tr = resBodyRows[idx];
        if (!tr) return;
        tr.querySelectorAll('.hydro-col-cell').forEach(c => c.remove());

        const dH = parseFloat(row.cal1);
        const dO = parseFloat(row.cal2);
        const sdH = parseFloat(row.propSd1) || 0;
        const sdO = parseFloat(row.propSd2) || 0;

        const valid = !isNaN(dH) && !isNaN(dO);
        const dExcess = valid ? (dH - 8 * dO) : null;
        const sdExcess = valid ? Math.sqrt(sdH * sdH + Math.pow(8 * sdO, 2)) : null;

        // 엑셀 내보내기용 객체에도 d-excess 저장
        row.dExcess = dExcess !== null ? Number(dExcess.toFixed(2)) : null;
        row.sdDExcess = sdExcess !== null ? Number(sdExcess.toFixed(2)) : null;

        const tdD = document.createElement('td');
        tdD.className = 'p-2.5 text-right font-mono font-semibold text-stone-900 hydro-col-cell';
        tdD.textContent = dExcess !== null ? dExcess.toFixed(2) : '-';

        const tdSd = document.createElement('td');
        tdSd.className = 'p-2.5 text-right font-mono text-stone-500 hydro-col-cell';
        tdSd.textContent = sdExcess !== null ? `±${sdExcess.toFixed(2)}` : '-';

        tr.appendChild(tdD);
        tr.appendChild(tdSd);
      });
    }

    // B. Grouped Sample Summary 테이블에 Mean d-excess 열 추가
    const grpHeadRow = document.querySelector('#grouped-head tr');
    const grpBodyRows = document.querySelectorAll('#grouped-body tr');
    if (grpHeadRow && grpBodyRows.length === grpData.length && grpData.length > 0) {
      if (!grpHeadRow.querySelector('.hydro-grp-header')) {
        const thD = document.createElement('th');
        thD.className = 'p-2.5 text-right hydro-grp-header text-sky-950';
        thD.textContent = 'Mean d-excess (‰)';

        const thSd = document.createElement('th');
        thSd.className = 'p-2.5 text-right hydro-grp-header text-stone-500';
        thSd.textContent = 'Rep 1σ (d)';

        grpHeadRow.appendChild(thD);
        grpHeadRow.appendChild(thSd);
      }

      grpData.forEach((g, idx) => {
        const tr = grpBodyRows[idx];
        if (!tr) return;
        tr.querySelectorAll('.hydro-grp-cell').forEach(c => c.remove());

        const mH = parseFloat(g.mean1);
        const mO = parseFloat(g.mean2);
        const sH = parseFloat(g.sd1) || 0;
        const sO = parseFloat(g.sd2) || 0;

        const valid = !isNaN(mH) && !isNaN(mO);
        const meanD = valid ? (mH - 8 * mO) : null;
        const repSdD = valid ? Math.sqrt(sH * sH + Math.pow(8 * sO, 2)) : null;

        g.meanDExcess = meanD !== null ? Number(meanD.toFixed(2)) : null;
        g.sdDExcess = repSdD !== null ? Number(repSdD.toFixed(2)) : null;

        const tdD = document.createElement('td');
        tdD.className = 'p-2.5 text-right font-mono font-semibold text-stone-900 hydro-grp-cell';
        tdD.textContent = meanD !== null ? meanD.toFixed(2) : '-';

        const tdSd = document.createElement('td');
        tdSd.className = 'p-2.5 text-right font-mono text-stone-500 hydro-grp-cell';
        tdSd.textContent = repSdD !== null ? `±${repSdD.toFixed(2)}` : '-';

        tr.appendChild(tdD);
        tr.appendChild(tdSd);
      });
    }

    // C. 미지 물 시료 추출 및 Figure 5 (GMWL vs. LMWL) 플롯 그리기
    if (!hydroBox) return;
    hydroBox.classList.remove('hidden');

    const stdPrefixes = getStandardPrefixes();
    const unknownSamples = seqData.filter(r => {
      const isActive = r.status === 'Active' || r.status === '유효' || !String(r.status).toLowerCase().includes('excl');
      const dH = parseFloat(r.cal1);
      const dO = parseFloat(r.cal2);
      return isActive && !isNaN(dH) && !isNaN(dO) && !isStandardOrBlank(String(r.id || ''), stdPrefixes);
    });

    const plotEl = document.getElementById('plot-hydrology');
    const summaryStrip = document.getElementById('hydro-summary-strip');

    if (unknownSamples.length === 0) {
      summaryStrip.innerHTML = `<span>${isEn ? 'No unknown water samples found in sequence.' : '시퀀스에 유효한 미지 물 시료가 없습니다.'}</span>`;
      plotEl.innerHTML = `<span class="text-xs text-stone-400 font-serif-title italic">${isEn ? 'Add unknown water samples to plot LMWL.' : '미지 시료를 입력하면 GMWL 대비 LMWL 그래프가 표시됩니다.'}</span>`;
      return;
    }

    const xO18 = unknownSamples.map(s => parseFloat(s.cal2)); // δ18O (X축)
    const yD = unknownSamples.map(s => parseFloat(s.cal1));   // δD (Y축)
    const names = unknownSamples.map(s => s.id);
    const dExcessArr = unknownSamples.map(s => parseFloat(s.cal1) - 8 * parseFloat(s.cal2));
    const meanDExcess = dExcessArr.reduce((a, b) => a + b, 0) / dExcessArr.length;

    const lmwl = fitLMWL(xO18, yD);

    const minO = Math.min(...xO18);
    const maxO = Math.max(...xO18);
    const padO = Math.max((maxO - minO) * 0.25, 1.5);
    const lineX = [minO - padO, maxO + padO];
    const gmwlY = lineX.map(x => 8 * x + 10);

    const traces = [
      {
        x: xO18,
        y: yD,
        text: names.map((nm, i) => `${nm}<br>d-excess = ${dExcessArr[i].toFixed(2)} ‰`),
        mode: 'markers',
        type: 'scatter',
        name: isEn ? `Water Samples (n=${unknownSamples.length})` : `물 시료 (n=${unknownSamples.length})`,
        marker: { size: 8, color: '#111827', line: { color: '#000000', width: 1 } }
      },
      {
        x: lineX,
        y: gmwlY,
        mode: 'lines',
        type: 'scatter',
        name: 'GMWL: δD = 8.00·δ¹⁸O + 10.00 (Craig, 1961)',
        line: { color: '#047857', width: 1.8, dash: 'dash' }
      }
    ];

    if (lmwl) {
      const lmwlY = lineX.map(x => lmwl.slope * x + lmwl.intercept);
      const sign = lmwl.intercept >= 0 ? '+' : '-';
      traces.push({
        x: lineX,
        y: lmwlY,
        mode: 'lines',
        type: 'scatter',
        name: `LMWL: δD = ${lmwl.slope.toFixed(2)}·δ¹⁸O ${sign} ${Math.abs(lmwl.intercept).toFixed(2)} (R²=${lmwl.r2.toFixed(3)})`,
        line: { color: '#b45309', width: 2, dash: 'solid' }
      });

      summaryStrip.innerHTML = `
        <span><strong>LMWL:</strong> δD = ${lmwl.slope.toFixed(2)}·δ¹⁸O ${sign} ${Math.abs(lmwl.intercept).toFixed(2)} (R² = ${lmwl.r2.toFixed(3)})</span>
        <span><strong>Mean d-excess:</strong> ${meanDExcess.toFixed(2)} ‰ (n = ${unknownSamples.length})</span>
      `;
    } else {
      summaryStrip.innerHTML = `
        <span><strong>GMWL Ref:</strong> δD = 8·δ¹⁸O + 10</span>
        <span><strong>Mean d-excess:</strong> ${meanDExcess.toFixed(2)} ‰ (n = ${unknownSamples.length})</span>
      `;
    }

    plotEl.innerHTML = '';
    const layout = {
      title: {
        text: isEn ? 'Meteoric Water Line & d-excess Diagnostics' : '순환수선(GMWL / LMWL) 및 d-excess 진단',
        font: { family: 'Newsreader, Georgia, serif', size: 15, color: '#111827' },
        x: 0.05
      },
      paper_bgcolor: '#ffffff',
      plot_bgcolor: '#ffffff',
      margin: { l: 55, r: 25, t: 40, b: 45 },
      xaxis: {
        title: { text: 'Calibrated δ¹⁸O (‰ VSMOW)', font: { family: 'Inter, sans-serif', size: 11, color: '#374151' } },
        showgrid: true,
        gridcolor: '#f0ede6',
        linecolor: '#c7c5bc',
        tickfont: { family: 'IBM Plex Mono, monospace', size: 10, color: '#4b5563' },
        automargin: true
      },
      yaxis: {
        title: { text: 'Calibrated δD (‰ VSMOW)', font: { family: 'Inter, sans-serif', size: 11, color: '#374151' } },
        showgrid: true,
        gridcolor: '#f0ede6',
        linecolor: '#c7c5bc',
        tickfont: { family: 'IBM Plex Mono, monospace', size: 10, color: '#4b5563' },
        automargin: true
      },
      showlegend: true,
      legend: {
        orientation: 'h',
        y: -0.28,
        x: 0.02,
        font: { family: 'Inter, sans-serif', size: 10, color: '#374151' }
      }
    };

    Plotly.newPlot('plot-hydrology', traces, layout, { responsive: true, displayModeBar: false });
  }

  // 5. 검량 실행 및 시스템 변경 시 자동 동기화
  window.addEventListener('DOMContentLoaded', () => {
    const resultBody = document.getElementById('result-body');
    if (resultBody) {
      const observer = new MutationObserver(() => {
        setTimeout(updateWaterHydrologyDiagnostics, 30);
      });
      observer.observe(resultBody, { childList: true });
    }

    const presetSel = document.getElementById('isotope-preset');
    if (presetSel) {
      presetSel.addEventListener('change', () => {
        setTimeout(updateWaterHydrologyDiagnostics, 60);
      });
    }

    setTimeout(updateWaterHydrologyDiagnostics, 150);
  });
})();
