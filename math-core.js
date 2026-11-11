/* math-core.js - IsoCalib v1.4.1 Pure Geochemical & Statistical Reduction Engine */

/**
 * 1. 단위 및 스케일 변환 유틸리티
 */
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
  return { bias: 0.08, sd: 0.08 }; // δ¹³C Default
}

/**
 * 2. 통계 회귀 솔버 (OLS & York-Ludwig WLS)
 */
function calcOLS(xArr, yArr) {
  const n = xArr.length;
  if (n < 2) return { slope: 0, intercept: yArr[0] || 0 };
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += xArr[i];
    sumY += yArr[i];
    sumXY += xArr[i] * yArr[i];
    sumX2 += xArr[i] * xArr[i];
  }
  const denom = (n * sumX2 - sumX * sumX);
  if (Math.abs(denom) < 1e-12) return { slope: 0, intercept: sumY / n };
  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

function calcWLS(xArr, yArr, sdArr) {
  const n = xArr.length;
  if (n < 2) return { slope: 0, intercept: 0, r2: 0, seSlope: 0, seIntercept: 0, mswd: 0, chi2: 0 };
  
  let sumW = 0, sumWX = 0, sumWY = 0, sumWXY = 0, sumWX2 = 0;
  for (let i = 0; i < n; i++) {
    const sd = (sdArr[i] && sdArr[i] > 0) ? sdArr[i] : 0.03;
    const w = 1 / (sd * sd);
    sumW += w;
    sumWX += w * xArr[i];
    sumWY += w * yArr[i];
    sumWXY += w * xArr[i] * yArr[i];
    sumWX2 += w * xArr[i] * xArr[i];
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

/**
 * 3. 앵커 간 선형 브래케팅 보간 오프셋 계산
 */
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

/**
 * 4. EA-IRMS 주석 캡슐 블랭크 질량 보존 차감 수식
 */
function computeBlankSubtractedDelta(sampleArea, sampleRawDelta, blankMeanArea, blankMeanDelta) {
  if (!blankMeanArea || blankMeanArea <= 0 || isNaN(sampleArea)) return sampleRawDelta;
  // 시료 피크 면적이 블랭크 평균의 1.05배 이상일 때 질량 보존식 적용
  if (sampleArea > blankMeanArea * 1.05) {
    return (sampleArea * sampleRawDelta - blankMeanArea * blankMeanDelta) / (sampleArea - blankMeanArea);
  }
  return sampleRawDelta;
}

/**
 * 5. 피크 면적 크기 선형성(Size Effect) 정규화 수식
 */
function computeSizeLinearityNormalizedDelta(deltaVal, sampleArea, refArea, linearitySlope) {
  if (isNaN(sampleArea) || !refArea || refArea <= 0 || !linearitySlope) return deltaVal;
  return deltaVal - linearitySlope * (sampleArea - refArea);
}

/**
 * 6. JCGM GUM 1차 편미분 합성 표준불확도 전파 계산
 */
function computeCombinedUncertainty(rawSd, calSlope, seSlope, seIntercept, preprocessedRaw) {
  const term1 = Math.pow(calSlope * rawSd, 2);
  const term2 = Math.pow(preprocessedRaw * seSlope, 2);
  const term3 = Math.pow(seIntercept, 2);
  return Math.sqrt(term1 + term2 + term3);
}
