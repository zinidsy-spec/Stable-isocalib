/* plot-export.js - IsoCalib v1.4.1 Interactive Plots & ExcelJS Publication Export Engine */

/**
 * 1. Figure 1 & 2: WLS 선형 검량선 피팅 차트
 */
function drawPlot(elemId, title, pts, reg, xTitle, yTitle) {
  const container = document.getElementById(elemId);
  if (!container) return;
  container.innerHTML = '';
  if (pts.x.length === 0) return;

  const minX = Math.min(...pts.x), maxX = Math.max(...pts.x);
  const pad = (maxX - minX) * 0.1 || 1;
  const lx = [minX - pad, maxX + pad];
  const ly = [lx[0] * reg.slope + reg.intercept, lx[1] * reg.slope + reg.intercept];

  const traces = [
    {
      x: pts.x,
      y: pts.y,
      text: pts.names,
      mode: 'markers',
      type: 'scatter',
      name: currentLang === 'en' ? 'Active Anchors' : '유효 앵커 표준물질',
      marker: { size: 7, color: '#111827', line: { color: '#000000', width: 1 } },
      error_x: { type: 'data', array: pts.sd, visible: true, color: '#4b5563', thickness: 1.2, width: 4 }
    },
    {
      x: lx,
      y: ly,
      mode: 'lines',
      type: 'scatter',
      name: `WLS: y = ${reg.slope.toFixed(4)}x + ${reg.intercept.toFixed(4)} (MSWD = ${reg.mswd.toFixed(2)})`,
      line: { dash: 'solid', width: 1.5, color: '#6b7280' }
    }
  ];

  const layout = {
    title: { text: title, font: { family: 'Newsreader, Georgia, serif', size: 15, color: '#111827' }, x: 0.05 },
    paper_bgcolor: '#ffffff',
    plot_bgcolor: '#ffffff',
    margin: { l: 55, r: 25, t: 40, b: 45 },
    xaxis: {
      title: { text: xTitle, font: { family: 'Inter, sans-serif', size: 11, color: '#374151' } },
      showgrid: true, gridcolor: '#f0ede6', linecolor: '#c7c5bc',
      tickfont: { family: 'IBM Plex Mono, monospace', size: 10, color: '#4b5563' }, automargin: true
    },
    yaxis: {
      title: { text: yTitle, font: { family: 'Inter, sans-serif', size: 11, color: '#374151' } },
      showgrid: true, gridcolor: '#f0ede6', linecolor: '#c7c5bc',
      tickfont: { family: 'IBM Plex Mono, monospace', size: 10, color: '#4b5563' }, automargin: true
    },
    showlegend: true,
    legend: { orientation: 'h', y: -0.28, x: 0.05, font: { family: 'Inter, sans-serif', size: 10, color: '#374151' } }
  };

  Plotly.newPlot(elemId, traces, layout, { responsive: true, displayModeBar: false });
}

/**
 * 2. Figure 3 & 4 (Linearity 모드): 피크 면적 대비 동위원소 선형성 진단 차트
 */
function drawLinearityPlot(elemId, areaArr, valArr, anchorName, slopeVal, meanArea, isoLabel, isManual = false) {
  const container = document.getElementById(elemId);
  if (!container) return;
  container.innerHTML = '';
  const isEn = currentLang === 'en';

  if (!areaArr || areaArr.length === 0) {
    container.innerHTML = `<span class="text-xs text-stone-400 font-serif-title italic">${isEn ? 'No Peak Area runs available for Linearity Plot.' : '피크 면적 선형성 진단을 위한 데이터가 없습니다.'}</span>`;
    return;
  }

  const minA = Math.min(...areaArr);
  const maxA = Math.max(...areaArr);
  const padA = (maxA - minA) * 0.1 || (minA * 0.2) || 2;
  const lx = [Math.max(0, minA - padA), maxA + padA];

  const traces = [
    {
      x: areaArr,
      y: valArr,
      mode: 'markers',
      type: 'scatter',
      name: `${anchorName} (Blank-corr Raw)`,
      marker: { size: 8, color: '#0369a1' }
    }
  ];

  const meanY = valArr.reduce((a, b) => a + b, 0) / valArr.length;

  if (isManual) {
    // 수동 계수 라인: 기준 면적(meanArea) 및 중심 Y를 통과하는 붉은색 점선
    const lyManual = lx.map(x => meanY + slopeVal * (x - meanArea));
    traces.push({
      x: lx,
      y: lyManual,
      mode: 'lines',
      type: 'scatter',
      name: `Manual Slope: k = ${slopeVal >= 0 ? '+' : ''}${slopeVal.toFixed(4)} ‰/Area (Ref=${meanArea.toFixed(1)})`,
      line: { color: '#dc2626', width: 2.2, dash: 'dash' }
    });

    // 2점 이상일 경우 실제 데이터 관측 회귀선을 회색 보조선으로 함께 표기
    if (areaArr.length >= 2) {
      const ols = calcOLS(areaArr, valArr);
      const lyObs = [ols.slope * lx[0] + ols.intercept, ols.slope * lx[1] + ols.intercept];
      traces.push({
        x: lx,
        y: lyObs,
        mode: 'lines',
        type: 'scatter',
        name: `Observed Fit: k = ${ols.slope >= 0 ? '+' : ''}${ols.slope.toFixed(4)} ‰/Area`,
        line: { color: '#9ca3af', width: 1.2, dash: 'dot' }
      });
    }
  } else {
    // 자동 계산 OLS 회귀선
    if (areaArr.length >= 2) {
      const ols = calcOLS(areaArr, valArr);
      const ly = [ols.slope * lx[0] + ols.intercept, ols.slope * lx[1] + ols.intercept];
      traces.push({
        x: lx,
        y: ly,
        mode: 'lines',
        type: 'scatter',
        name: `Auto Linearity: k = ${slopeVal >= 0 ? '+' : ''}${slopeVal.toExponential(2)} ‰/Area (Ref=${meanArea.toFixed(1)})`,
        line: { color: '#b45309', width: 2, dash: 'dash' }
      });
    }
  }

  const titlePrefix = isManual ? `[Manual k] ` : ``;
  const layout = {
    title: { 
      text: `${titlePrefix}${isoLabel} Size Linearity (${anchorName})`, 
      font: { family: 'Newsreader, Georgia, serif', size: 15, color: '#111827' }, 
      x: 0.05 
    },
    paper_bgcolor: '#ffffff',
    plot_bgcolor: '#ffffff',
    margin: { l: 55, r: 25, t: 40, b: 45 },
    xaxis: { 
      title: { text: isEn ? 'Peak Area (Vs / Amplitude mV)' : '피크 면적 (Vs / Amplitude mV)', font: { size: 11, color: '#374151' } }, 
      showgrid: true, gridcolor: '#f0ede6', linecolor: '#c7c5bc',
      tickfont: { family: 'IBM Plex Mono, monospace', size: 10, color: '#4b5563' }
    },
    yaxis: { 
      title: { text: `Raw ${isoLabel} (‰)`, font: { size: 11, color: '#374151' } }, 
      showgrid: true, gridcolor: '#f0ede6', linecolor: '#c7c5bc',
      tickfont: { family: 'IBM Plex Mono, monospace', size: 10, color: '#4b5563' }
    },
    showlegend: true,
    legend: { orientation: 'h', y: -0.28, x: 0.05, font: { family: 'Inter, sans-serif', size: 10, color: '#374151' } }
  };

  Plotly.newPlot(elemId, traces, layout, { responsive: true, displayModeBar: false });
}

/**
 * 3. Figure 3 & 4 (Drift 모드): 시퀀스 시간축 기기 표류 진단 차트
 */
function drawDriftPlot(elemId, seqArr, valArr, anchorName, mode, slopeVal, anchorRuns, maxRun, isoLabel) {
  const container = document.getElementById(elemId);
  if (!container) return;
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
    paper_bgcolor: '#ffffff',
    plot_bgcolor: '#ffffff',
    margin: { l: 55, r: 25, t: 40, b: 45 },
    xaxis: { title: { text: 'Run Sequence Order (Run #)', font: { size: 11 } }, showgrid: true, gridcolor: '#f0ede6', linecolor: '#c7c5bc' },
    yaxis: { title: { text: `Raw ${isoLabel} (‰)`, font: { size: 11 } }, showgrid: true, gridcolor: '#f0ede6', linecolor: '#c7c5bc' },
    showlegend: true, legend: { orientation: 'h', y: -0.28, x: 0.05, font: { size: 10 } }
  };

  Plotly.newPlot(elemId, traces, layout, { responsive: true, displayModeBar: false });
}

/**
 * 4. SVG 단독 내보내기 이벤트 바인딩
 */
['1', '2', 'drift-1', 'drift-2'].forEach(suffix => {
  const btn = document.getElementById(`btn-export-svg-${suffix}`);
  if (btn) {
    btn.addEventListener('click', () => {
      Plotly.downloadImage(`plot-${suffix}`, {
        format: 'svg', width: 800, height: 600, filename: `IsoCalib_${currentMode}_Plot_${suffix}`
      });
    });
  }
});

/**
 * 5. Plotly DOM 이미지를 Base64 PNG로 캡처
 */
async function capturePlotAsBase64Png(elemId) {
  const el = document.getElementById(elemId);
  if (!el || !el.data || el.data.length === 0) return null;
  try {
    const dataUrl = await Plotly.toImage(el, { format: 'png', width: 750, height: 480 });
    return dataUrl.split(',')[1];
  } catch (err) {
    console.warn(`Could not export plot ${elemId}:`, err);
    return null;
  }
}

/**
 * 6. ExcelJS 멀티 시트 보고서 (.xlsx) 생성 및 차트 이미지 자동 삽입
 */
const btnExportExcel = document.getElementById('btn-export');
if (btnExportExcel) {
  btnExportExcel.addEventListener('click', async () => {
    if (!sequenceExportData || sequenceExportData.length === 0) {
      alert(currentLang === 'en' ? "Please run calibration first." : "먼저 상단에서 검량을 실행해 주세요.");
      return;
    }

    const p = PRESETS[currentMode];
    const isDual = p.elements.length === 2;
    const u1 = getElementUnit(0), u2 = getElementUnit(1);
    const originalBtnText = btnExportExcel.innerHTML;

    try {
      btnExportExcel.innerHTML = `<span>Exporting (.xlsx)...</span>`;
      btnExportExcel.style.opacity = '0.6';
      btnExportExcel.style.pointerEvents = 'none';

      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'IsoCalib v1.4.1 (Zenodo: 10.5281/zenodo.23239186)';
      workbook.created = new Date();

      // Sheet 1: Grouped Summary
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

      // Sheet 2: Sequence Runs
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

      // Sheet 3: Figures & QC Diagnostics
      const wsFig = workbook.addWorksheet('Figures_and_QC');
      wsFig.columns = [{ width: 4 }, { width: 30 }, { width: 30 }, { width: 30 }];
      wsFig.getCell('B2').value = `IsoCalib v1.4.1 Report (${currentMode} · AreaMode: ${areaMode})`;
      wsFig.getCell('B2').font = { size: 14, bold: true, color: { argb: 'FF111827' } };
      wsFig.getCell('B3').value = `Exported: ${new Date().toISOString()} | Permanent DOI: 10.5281/zenodo.23239186 | License: GNU GPL v3.0`;
      wsFig.getCell('B3').font = { size: 9, italic: true, color: { argb: 'FF6B7280' } };

      let curRow = 5;
      if (lastQcSummaryReport) {
        wsFig.getCell(`B${curRow}`).value = `QC Status: [${lastQcSummaryReport.status}] — Standard: [${lastQcSummaryReport.qcName}] (${lastQcSummaryReport.count} active runs)`;
        wsFig.getCell(`B${curRow}`).font = { bold: true, color: { argb: lastQcSummaryReport.status === 'PASS' ? 'FF047857' : 'FFD97706' } };
        curRow++;

        wsFig.getCell(`B${curRow}`).value = `${p.elements[0].label} Mean Calibrated: ${lastQcSummaryReport.mean1.toFixed(3)} ${u1} | Bias: ${lastQcSummaryReport.bias1 >= 0 ? '+' : ''}${lastQcSummaryReport.bias1.toFixed(3)} ‰ | Rep 1σ: ±${lastQcSummaryReport.sdQc1.toFixed(3)} ‰`;
        curRow++;

        if (isDual && lastQcSummaryReport.mean2 !== null) {
          wsFig.getCell(`B${curRow}`).value = `${p.elements[1].label} Mean Calibrated: ${lastQcSummaryReport.mean2.toFixed(3)} ${u2} | Bias: ${lastQcSummaryReport.bias2 >= 0 ? '+' : ''}${lastQcSummaryReport.bias2.toFixed(3)} ‰ | Rep 1σ: ±${lastQcSummaryReport.sdQc2.toFixed(3)} ‰`;
          curRow++;
        }
        curRow++;
      }

      let imgRow = curRow + 1;
      const plotIds = ['plot-1', ...(isDual ? ['plot-2'] : []), 'plot-drift-1', ...(isDual ? ['plot-drift-2'] : [])];
      for (const pid of plotIds) {
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
      a.download = `IsoCalib_v1.4.1_${currentMode}_Report.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (err) {
      console.error('Error during Excel export:', err);
      alert(currentLang === 'en' ? `Excel export failed: ${err.message}` : `엑셀 생성 중 오류가 발생했습니다: ${err.message}`);
    } finally {
      btnExportExcel.innerHTML = originalBtnText;
      btnExportExcel.style.opacity = '1';
      btnExportExcel.style.pointerEvents = 'auto';
    }
  });
}
