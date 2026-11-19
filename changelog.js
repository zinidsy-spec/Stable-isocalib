/* changelog.js - IsoCalib Dedicated Permanent Version History (v1.0.0 ~ v1.5.0-alpha) */
/* 주의: 새 버전 추가 시 배열 최상단에만 새 객체를 추가하고, 기존 하위 버전 기록은 절대 삭제하지 마세요. */

window.CHANGELOG_DATA = [
  {
    version: "v1.5.0-alpha",
    date: "2026-11",
    badge: "Session Snapshot & Audit Trail",
    title_ko: ".isocalib 프로젝트 세션 저장/복원 및 이상치 제외 감사 추적(Audit Trail) 엔진",
    title_en: ".isocalib Session Snapshot Save/Restore & Outlier Exclusion Audit Trail",
    desc_ko: "검량 설정, 표준물질 구성, 시퀀스 입력 데이터, 이상치 제외 체크 상태와 사유 메모를 단일 .isocalib 파일로 영구 보존·재현하고 엑셀 보고서에 감사 추적 열을 연동했습니다.",
    desc_en: "Added single-file .isocalib session serialization to preserve and reproduce calibration setups, sequence data, outlier flags, and audit notes across sessions and Excel exports.",
    changes_ko: [
      "<strong><code>.isocalib</code> 세션 저장 및 불러오기 (<code>session-audit.js</code>)</strong>: 분석 체계, 앵커 표준물질, 전처리 파라미터, 시퀀스 전체 행, 이상치 체크 상태를 단일 JSON 파일로 저장·복원하여 동료 연구원 간 100% 동일한 검량 결과 재현 가능.",
      "<strong>이상치 제외 감사 추적 (Audit Trail)</strong>: <code>Use (✓)</code> 해제 시 Raw SD 초과 여부를 자동 판독해 사유 메모 배지(<code>📝 Note</code>)를 부여하고, 배지 클릭 또는 우클릭 메뉴를 통해 상세 사유 편집 지원.",
      "<strong>독립형 업데이트 이력 모듈(<code>changelog.js</code>) 분리</strong>: 버전 업데이트 시 과거 이력이 누락되지 않도록 전체 개발 히스토리를 전용 파일로 영구 분리."
    ],
    changes_en: [
      "<strong><code>.isocalib</code> Session Save & Restore (<code>session-audit.js</code>)</strong>: Serializes instrument presets, anchor standards, preprocessing parameters, sequence rows, and outlier states into a portable JSON snapshot.",
      "<strong>Outlier Exclusion Audit Trail</strong>: Automatically attaches editable reason badges (<code>📝 Note</code>) when runs are unchecked, with full export to the <code>Audit_Note</code> column in Excel reports.",
      "<strong>Dedicated Changelog Module (<code>changelog.js</code>)</strong>: Isolated complete version history into a standalone file to prevent accidental truncation during future updates."
    ]
  },
  {
    version: "v1.4.3",
    date: "2026-11",
    badge: "Anchor Guard & Standalone SOP",
    title_ko: "앵커 표준물질 정밀도 경고·원클릭 자동 제외 및 독립형 한/영 실무 SOP 매뉴얼(manual.html) 구축",
    title_en: "Anchor Standard Precision Guard, One-Click Auto-Exclude & Standalone Bilingual SOP Manual",
    desc_ko: "검량선 기울기를 왜곡할 수 있는 불안정 앵커 표준물질을 사전 차단하는 긴급 경고·원클릭 자동 제외 기능과 인쇄 가능한 독립형 표준 운영 절차서(manual.html)를 탑재하고 Zenodo 영구 아카이브(DOI: 10.5281/zenodo.24296623)를 동기화했습니다.",
    desc_en: "Added an Anchor Standard Precision Alert with one-click Auto-Exclude protection to safeguard WLS regression slopes, alongside a printable bilingual SOP manual (manual.html) archived under Zenodo DOI 10.5281/zenodo.24296623.",
    changes_ko: [
      "<strong>앵커 표준물질 정밀도 경고 및 원클릭 자동 제외</strong>: 활성화된 앵커 표준물질(NBS-18, IAEA-603 등)의 Raw 1σ SD가 임계치를 초과할 경우 QC 배너 최상단에 긴급 경고를 표출하고, 버튼 클릭 한 번으로 해당 앵커만 안전하게 제외(최소 2개 활성 앵커 보호 가드 내장)하여 WLS 회귀선을 즉시 재산출.",
      "<strong>독립형 한/영 실무 SOP 매뉴얼 (<code>manual.html</code>) 신설</strong>: 상단 <code>Quick Start</code> 메뉴에서 새 탭으로 열리는 8대 섹션 상세 매뉴얼, 6대 분석 계통별 마스터 세팅 매트릭스, 트러블슈팅 FAQ 및 인쇄/PDF 저장 기능 탑재.",
      "<strong>학술 인용 메타데이터(<code>CITATION.cff</code>) 및 Zenodo DOI 갱신</strong>: GitHub 저장소 인용 카드 활성화 및 Zenodo 영구 버전 아카이브(<code>10.5281/zenodo.24296623</code>) 동기화 완료."
    ],
    changes_en: [
      "<strong>Anchor Standard Precision Alert & One-Click Auto-Exclude</strong>: Detects noisy calibration anchor runs exceeding the Raw SD limit and provides a one-click Auto-Exclude button (with a minimum 2-anchor safety guard) to recalculate WLS slopes immediately.",
      "<strong>Standalone Bilingual SOP Manual (<code>manual.html</code>)</strong>: Replaced the compact modal with a dedicated, printable Korean/English Standard Operating Procedure featuring a 6-workflow setup matrix, column mapping diagrams, and troubleshooting FAQ.",
      "<strong>Academic Citation Metadata & Zenodo Archive Sync</strong>: Added <code>CITATION.cff</code> for native GitHub citation export and synchronized version archiving under Zenodo DOI <code>10.5281/zenodo.24296623</code>."
    ]
  },
  {
    version: "v1.4.2",
    date: "2026-11",
    badge: "Raw SD Guard & %C/%N",
    title_ko: "원시 반복 정밀도(Raw 1σ SD) 실시간 경고 및 시료 무게 기반 %C/%N 원소 정량화 엔진 도입",
    title_en: "Real-Time Raw 1σ SD Precision Flagging & Sample Weight-Based %C/%N Elemental Quantification",
    desc_ko: "탄산염 및 유기물 분석 시 기기 내부 반복 정밀도(Raw 1σ SD) 임계치 초과 런을 즉시 식별하는 하이라이트 가드와 시료 계량 무게(mg) 기반 %C, %N, Atomic C/N 산출 파이프라인을 통합했습니다.",
    desc_en: "Integrated real-time cell highlighting and warning badges for runs exceeding internal repeatability (Raw 1σ SD) thresholds, alongside sample weight (mg) based %C, %N, and Atomic C/N quantification.",
    changes_ko: [
      "<strong>원시 1σ SD 임계치 초과 실시간 하이라이트 (<code>Raw SD Limit</code>)</strong>: 설정된 허용 기준(탄산염 기본 <code>0.100‰</code>)을 초과하는 입력 셀을 즉시 붉은색으로 강조하고, 결과 테이블(<code>▲ Raw SD</code>) 및 엑셀 보고서(<code>Raw_SD_Flag</code>)에 경고 플래그 자동 기록.",
      "<strong>EA-IRMS 원소 함량(%C, %N) 및 Atomic C/N 자동 산출</strong>: 시료 계량 무게(mg)와 표준물질 공인 함량으로부터 응답 계수(Response Factor, Vs/mg)를 역산하여 시료별 및 그룹별 원소 함량 자동 계산.",
      "<strong>수동 선형성 기울기(Manual Slope) 및 3점 이상 다중 앵커 확장</strong>: 크기 시리즈 표준물질이 없는 시퀀스를 위한 고정 선형성 계수(<code>‰/Vs</code>) 입력 및 <code>+ Add Anchor</code> 다중 점 WLS 회귀 지원."
    ],
    changes_en: [
      "<strong>Real-Time Raw 1σ SD Threshold Guard</strong>: Highlights input cells exceeding the user-defined repeatability threshold (default <code>0.100‰</code>) in red and appends <code>▲ Raw SD</code> badges to result tables and Excel exports.",
      "<strong>Weight-Based %C, %N & Atomic C/N Quantification</strong>: Computes instrument Response Factors (Vs/mg) from certified standards to derive elemental weight percentages and molar C/N ratios.",
      "<strong>Manual Linearity Slope & Multi-Point Anchoring</strong>: Added manual linearity slope input (<code>‰/Vs</code>) and dynamic 3+ anchor WLS regression support."
    ]
  },
  {
    version: "v1.4.0",
    date: "2026-10",
    badge: "EA-IRMS Linearity & Blank",
    title_ko: "EA-IRMS 피크 면적 선형성 정규화 및 캡슐 블랭크 질량 보존 보정 파이프라인 구축",
    title_en: "EA-IRMS Peak Area Size Linearity & Mass-Balance Capsule Blank Correction Pipeline",
    desc_ko: "유기물 및 퇴적물 분석 시 빈 주석 캡슐(BLANK/BLK) 바탕값 오염 차감과 피크 면적(Vs) 크기에 따른 이온원 비선형성(Size Effect) 자동 회귀 보정을 도입했습니다.",
    desc_en: "Introduced sequential mass-balance capsule blank subtraction and peak-area size linearity regression normalization for bulk organic and sediment EA-IRMS workflows.",
    changes_ko: [
      "<strong>4단계 순차 전처리 연산 엔진</strong>: 캡슐 블랭크 차감 → 피크 면적 선형성 정규화 → 시간 표류 보정 → WLS 스케일 교정의 엄격한 연산 순서 확립.",
      "<strong><code>BLANK</code> / <code>BLK</code> / <code>TIN</code> 키워드 자동 인식</strong>: 블랭크 런을 자동 분리하여 바탕값 평균만 산출하고 검량선 회귀 및 미지 시료 평균에서 안전하게 제외.",
      "<strong>피크 면적 선형성 진단 플롯(Figure 3 & 4) 추가</strong>: 모니터 표준물질의 면적 대비 원시 δ 기울기(‰/Vs) 시각화."
    ],
    changes_en: [
      "<strong>4-Stage Sequential Preprocessing Engine</strong>: Enforced strict mathematical order: blank subtraction → peak area normalization → time drift correction → WLS scale calibration.",
      "<strong>Automated Blank Keyword Detection</strong>: Automatically isolates <code>BLANK</code>, <code>BLK</code>, and <code>TIN</code> runs for mass-balance correction without contaminating calibration curves.",
      "<strong>Size Linearity Diagnostic Plots (Figures 3 & 4)</strong>: Visualizes raw δ vs. peak area slopes for monitor standards."
    ]
  },
  {
    version: "v1.3.0",
    date: "2026-10",
    badge: "ExcelJS & Embedded Plots",
    title_ko: "ExcelJS 엔진 전환 및 보고서 내 고해상도 검량선·진단 그래프 자동 삽입",
    title_en: "ExcelJS Engine Integration & Embedded Publication Figures in Excel Reports",
    desc_ko: "기존 SheetJS를 ExcelJS로 전면 교체하여 내보낸 .xlsx 파일의 세 번째 시트에 고해상도 검량선 및 드리프트/선형성 진단 그림(PNG)이 자동 삽입되도록 고도화했습니다.",
    desc_en: "Replaced SheetJS with ExcelJS to support native raster image embedding (.addImage) directly inside browser memory for publication-ready Excel workbooks.",
    changes_ko: [
      "<strong>Figures_and_QC 시트 신설</strong>: 엑셀 보고서 내에 검량선(Figure 1 & 2), 드리프트/선형성 진단 그래프(Figure 3 & 4) 및 QC 편차 요약 리포트 자동 삽입.",
      "<strong>시퀀스 보존형 이상치 제외 토글 (<code>Use ✓</code>)</strong>: 행 삭제 없이 개별 런의 체크박스만 해제하여 시간축 간격을 유지한 채 실시간 재계산.",
      "<strong>브라우저 언어 자동 감지 (KO/EN)</strong>: 접속 환경에 따른 한국어/영어 인터페이스 자동 전환 및 수식(MathJax) 렌더링 지원."
    ],
    changes_en: [
      "<strong>Dedicated 'Figures_and_QC' Worksheet</strong>: Embeds high-resolution Plotly calibration and diagnostic curves alongside quantitative QC bias metrics inside exported <code>.xlsx</code> files.",
      "<strong>Sequence-Preserving Outlier Toggle</strong>: Uncheck <code>Use (✓)</code> to exclude anomalous runs without shifting sequence run indices (#).",
      "<strong>Smart Locale Auto-Detection</strong>: Automatically adapts UI language (KO/EN) with full MathJax equation typesetting."
    ]
  },
  {
    version: "v1.2.1",
    date: "2026-09",
    badge: "Zenodo Archive & Multi-System",
    title_ko: "10대 동위원소 분석 체계 확장, 커스텀 프리셋 저장 및 Zenodo 첫 영구 DOI 등록",
    title_en: "10 Isotope System Presets, Custom Reference Suites & First Zenodo DOI Release",
    desc_ko: "탄산염(CO), 질산염(NO), 물(HO, WATER_H, WATER_O), 황(S), 유기물(CN, EA_C, EA_N, CH) 등 10가지 분석 라인 프리셋과 사용자 정의 표준물질 저장 기능을 탑재하고 학술 영구 보존을 개시했습니다.",
    desc_en: "Expanded analytical presets across 10 dual/single isotope systems with browser-persisted custom standard suites and registered the permanent Zenodo DOI archive.",
    changes_ko: [
      "<strong>10대 안정동위원소 분석 체계 프리셋</strong>: VPDB/VSMOW 산소 스케일 실시간 상호 환산 및 원소별 맞춤형 QC 허용 오차 판정 기준 적용.",
      "<strong>커스텀 표준물질 프리셋 관리자</strong>: 실험실 고유 내부 표준물질(In-house Std) 세트를 브라우저 로컬 스토리지에 영구 저장·불러오기 지원.",
      "<strong>인접 반복 시료 자동 그룹화(<code>Grouped Sample Summary</code>)</strong>: 시퀀스 내 연속 측정된 동일 시료의 평균 및 1σ 반복 정밀도 자동 집계."
    ],
    changes_en: [
      "<strong>10 Analytical Isotope System Presets</strong>: Added real-time VPDB/VSMOW oxygen scale conversion and element-specific QC tolerance thresholds.",
      "<strong>Custom Reference Preset Manager</strong>: Save and load laboratory-specific in-house standard suites in local browser storage.",
      "<strong>Adjacent Replicate Auto-Grouping</strong>: Automatically aggregates consecutive sample replicates into group means and 1σ repeatabilities."
    ]
  },
  {
    version: "v1.1.0",
    date: "2026-08",
    badge: "Drift & GUM Error Propagation",
    title_ko: "시퀀스 시간 표류(Linear & Anchor Bracketing) 보정 및 GUM 1차 오차 전파 엔진",
    title_en: "Sequence Time-Drift Correction & JCGM GUM First-Order Error Propagation",
    desc_ko: "장시간 시퀀스 분석 중 발생하는 기기 드리프트(선형 및 앵커 구간 보간) 보정과 시료 반복 오차·검량선 기울기/절편 표준오차를 통합한 합성 불확도(±1σ) 산출식을 구현했습니다.",
    desc_en: "Implemented linear and anchor-bracketing sequence drift corrections paired with JCGM 100:2008 (GUM) first-order Gaussian uncertainty propagation.",
    changes_ko: [
      "<strong>2가지 드리프트 보정 알고리즘</strong>: 전체 시퀀스 단일 기울기 선형 보정(Linear) 및 브래케팅 표준물질 구간별 선형 보간(Anchor Bracketing) 지원.",
      "<strong>합성 표준 불확도 전파</strong>: 개별 측정 정밀도와 WLS 회귀선 파라미터 오차를 결합한 논문 투고용 최종 불확도 산출.",
      "<strong>출판용 벡터 그래프(SVG) 내보내기</strong>: Plotly 기반 인터랙티브 검량선 및 드리프트 진단 그래프의 고해상도 SVG 다운로드 지원."
    ],
    changes_en: [
      "<strong>Dual Drift Correction Modes</strong>: Added single-slope linear drift and piecewise anchor-bracketing interpolation.",
      "<strong>Combined Standard Uncertainty</strong>: Propagates run repeatability with WLS slope and intercept standard errors per JCGM GUM guidelines.",
      "<strong>Publication-Grade SVG Export</strong>: Added one-click vector SVG export for all calibration and diagnostic plots."
    ]
  },
  {
    version: "v1.0.0",
    date: "2026-07",
    badge: "Initial Release",
    title_ko: "IsoCalib 제로-서버 안정동위원소 WLS 검량 웹 플랫폼 최초 출시",
    title_en: "Initial Release of IsoCalib Zero-Server Stable Isotope WLS Calibration Platform",
    desc_ko: "외부 서버 전송 없이 브라우저 로컬 메모리에서 York-Ludwig 가중 최소자승 회귀(WLS)와 MSWD 적합도 검정을 수행하는 스프레드시트 기반 데이터 리덕션 도구를 최초 공개했습니다.",
    desc_en: "Launched the zero-server client-side data reduction platform featuring York-Ludwig Weighted Least Squares (WLS) regression, MSWD goodness-of-fit diagnostics, and Excel clipboard integration.",
    changes_ko: [
      "<strong>York-Ludwig 가중 최소자승 회귀(WLS) & MSWD 엔진</strong>: 측정 정밀도(1σ SD) 역제곱 가중치 기반 2점·다중점 스케일 검량 및 축약 카이제곱 적합도 산출.",
      "<strong>엑셀 호환 인터랙티브 스프레드시트 그리드</strong>: <code>Ctrl+V</code> 다중 열 붙여넣기, 키보드 탐색, 우클릭 컨텍스트 메뉴 지원.",
      "<strong>100% 클라이언트 로컬 연산 아키텍처</strong>: 외부 데이터 유출이 원천 차단된 연구실 전용 보안 설계."
    ],
    changes_en: [
      "<strong>York-Ludwig WLS & MSWD Engine</strong>: Implemented inverse-variance weighted linear regression and reduced chi-squared fit diagnostics.",
      "<strong>Excel-Compatible Interactive Grid</strong>: Enabled multi-column clipboard pasting (<code>Ctrl+V</code>), keyboard navigation, and context menus.",
      "<strong>Zero-Server Client Architecture</strong>: 100% local browser execution guaranteeing complete research data privacy."
    ]
  }
];

function renderFullChangelogModal() {
  const container = document.getElementById('changelog-content');
  if (!container || !Array.isArray(window.CHANGELOG_DATA)) return;

  const isEn = (typeof currentLang !== 'undefined' && currentLang === 'en') || localStorage.getItem('isocalib_lang') === 'en';

  container.innerHTML = window.CHANGELOG_DATA.map((item, idx) => {
    const isLatest = idx === 0;
    const title = isEn ? item.title_en : item.title_ko;
    const desc = isEn ? item.desc_en : item.desc_ko;
    const changes = isEn ? item.changes_en : item.changes_ko;

    return `
      <div class="relative pl-5 border-l-2 ${isLatest ? 'border-stone-900' : 'border-stone-300'} space-y-2">
        <span class="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full ${isLatest ? 'bg-stone-900' : 'bg-stone-400'}"></span>
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="flex items-center space-x-2">
            <span class="font-mono font-bold text-sm text-stone-900">${item.version}</span>
            <span class="px-2 py-0.5 text-[10px] font-mono font-semibold border ${isLatest ? 'bg-stone-900 text-white border-stone-900' : 'bg-stone-100 text-stone-700 border-stone-300'}">${item.badge}</span>
          </div>
          <span class="font-mono text-[11px] text-stone-400">${item.date}</span>
        </div>
        <h4 class="font-serif-title text-base font-medium text-stone-900">${title}</h4>
        <p class="text-xs text-stone-600 leading-relaxed">${desc}</p>
        <ul class="list-disc list-inside space-y-1 text-xs text-stone-700 pt-1">
          ${changes.map(c => `<li>${c}</li>`).join('')}
        </ul>
      </div>
    `;
  }).join('');
}

window.addEventListener('DOMContentLoaded', () => {
  renderFullChangelogModal();
  const btnOpen = document.getElementById('btn-open-changelog');
  if (btnOpen) {
    btnOpen.addEventListener('click', () => {
      setTimeout(renderFullChangelogModal, 0);
    });
  }
});
