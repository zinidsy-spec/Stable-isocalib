/* presets.js - IsoCalib v1.4.0 Extended Reference Presets & Multilingual Dictionary */

const TRANSLATIONS = {
  ko: {
    tagline: "/ 오픈 지화학 분석 플랫폼",
    nav_quickstart: "사용법 (Quick Start)",
    nav_methodology: "통계 방법론",
    nav_more: "더보기",
    nav_about: "IsoCalib 소개",
    nav_changelog: "업데이트 로그",
    nav_citation: "인용 정보 & DOI",
    nav_feedback_form: "빠른 피드백 (로그인 불필요)",
    nav_feedback_github: "개발자 버그 제보 (GitHub)",
    hero_badge: "정밀 데이터 리덕션 & 품질관리(QC) 프로토콜",
    hero_title: "안정동위원소 분석 보정 (Stable Isotope Calibration)",
    hero_desc: "원시 측정 데이터의 시퀀스 드리프트 보정, EA-IRMS 피크 면적 선형성(Size Linearity) 및 캡슐 블랭크(Blank) 차감, 다중 앵커(Multi-Point) WLS 회귀, 이상치 제외 및 불확도 전파를 수행합니다.",
    system_label: "분석 동위원소 체계 (Isotope System)",
    sec1_title: "Reference & QC Standards (검량 및 품질관리 표준)",
    btn_add_anchor: "+ 앵커 추가 (3+ Multi-Point)",
    o_scale_label: "δ¹⁸O Scale:",
    area_mode_label: "Area / Blank:",
    area_opt_off: "Off (기본 열 구조)",
    area_opt_lin: "Linearity (피크 면적 선형성 보정)",
    area_opt_blk: "Blank Only (캡슐 블랭크 차감만)",
    area_opt_blk_lin: "Blank + Linearity (블랭크 + 선형성 통합)",
    drift_anchor_label: "Monitor:",
    drift_label: "Drift:",
    drift_opt_none: "None (Off)",
    drift_opt_linear: "Linear (단일 선형 표류)",
    drift_opt_piecewise: "Anchor Bracketing (구간 보간)",
    preset_manage_label: "Reference Presets:",
    preset_select_default: "-- 기본 프리셋 (Default) --",
    btn_preset_load: "Load",
    btn_preset_delete: "Delete",
    btn_preset_save: "Save",
    drift_guide_desc: "* <strong>2점 및 3점+ 다중 앵커 WLS 검량선</strong>, <strong>피크 면적 선형성(Size Linearity)</strong> 및 <strong>주석 캡슐 블랭크(ID에 'BLANK' 또는 'BLK' 포함 행) 자동 차감</strong>을 지원합니다.",
    sec2_title: "Measurement Sequence Data (런 시퀀스 데이터 입력)",
    sec2_desc: "셀 클릭 후 <kbd class=\"px-1.5 py-0.5 bg-stone-200 border border-stone-300 rounded font-mono text-[10px] font-bold\">Ctrl + V</kbd>로 엑셀 데이터를 붙여넣으세요. 특정 런이 튄 경우 <strong>Use(✓) 체크를 해제</strong>하면 런 순서(#)는 유지한 채 계산에서만 제외됩니다.",
    btn_delete_rows: "선택 행 삭제",
    btn_clear: "Clear All",
    btn_demo: "Load Demo",
    demo_guide_tag: "시연 데이터",
    btn_add_rows: "+ 30 Rows",
    btn_calc: "Run Calibration & QC",
    grid_hint: "* 'Use' 체크 해제 시 시퀀스 번호(#) 왜곡 없이 해당 이상치(Outlier) 런만 검량·평균에서 제외됩니다",
    btn_export_svg: "Export Publication SVG",
    sec3_title: "Calibrated Results & Quality Control Report (최종 보정 결과 및 QC 보고서)",
    btn_export_excel: "엑셀 보고서 내보내기 (.xlsx)",
    tab_sequence: "개별 런 시퀀스 (Run-by-Run)",
    tab_grouped: "시료별 평균 보고서 (Grouped Sample Summary)",
    result_empty: "상단에서 검량을 실행하면 보정된 동위원소 값과 합성 불확도가 여기에 표시됩니다.",
    grouped_empty: "상단에서 검량을 실행하면 연속으로 반복 측정된 미지시료의 평균(Mean ± 1σ) 요약표가 여기에 생성됩니다.",
    sec4_tag: "Methodology & Standard Principles",
    sec4_heading: "통계적 회귀 원리 및 표준 분석 지침",
    sec4_subheading: "IsoCalib에 적용된 계산식은 국제측정학위원회(JCGM/BIPM)와 동위원소 지질학계 표준 문헌(GUM & Ludwig Isoplot)에 부합하도록 엄격히 수립된 정석 프로토콜입니다.",
    card1_title: "1. 다중 가중 선형 회귀 (WLS)",
    card1_desc: "2점 또는 3점 이상의 다중 앵커 표준물질에 대해 <strong>기기 측정 편차(1σ SD)가 작고 안정적인 측정일수록 검량선에 더 큰 영향력(가중치 $w_i = 1/\\sigma_i^2$)</strong>을 갖도록 계산합니다.",
    card1_quote: "측정 편차가 2배 큰 불안정한 런은, 안정적인 런보다 검량선 결정 영향력을 1/4로 줄여 반영합니다.",
    card1_basis: "기준: York (1968) / Ludwig (2003)",
    card2_title: "2. 적합도 검증 (MSWD)",
    card2_desc: "지화학 및 연대학 논문의 핵심 지표인 <strong>축약 카이제곱(Reduced $\\chi^2$)</strong>을 통해, 다중 앵커의 오차가 통계적으로 직선 회귀선에 완벽히 부합하는지 진단합니다.",
    card2_quote: "MSWD가 1에 가까우면 최적이며, 1보다 지나치게 크면 기기 드리프트나 비선형성이 존재한다는 신호입니다.",
    card2_basis: "기준: McIntyre et al. (1966) / IsoplotR",
    card3_title: "3. 합성 불확도 전파",
    card3_desc: "시료 자체의 기기 반복 분석 오차뿐만 아니라, <strong>\"표준물질 검량선 자체가 흔들릴 수 있는 통계적 오차\"까지 함께 합성</strong>하여 최종 보고용 오차를 산출합니다.",
    card3_quote: "논문 리뷰어가 \"검량선 불확도를 오차에 반영했는가?\"라고 질문할 때 완벽하게 방어할 수 있는 표준식입니다.",
    card3_basis: "기준: JCGM 100:2008 (GUM Guide)",
    acc_title: "[+] Detailed Mathematical Derivations & Formulas (세부 유도식 보기)",
    acc_a_title: "A. 가중 회귀 파라미터 행렬식 (WLS Normal Equations)",
    acc_a_desc: "$x_i$(원시 측정값)와 $y_i$(표준물질 참값)에 대해 가중 잔차 제곱합 $\\sum w_i (y_i - ax_i - b)^2$을 최소화하는 정규방정식 해입니다:",
    acc_b_title: "B. EA-IRMS 블랭크 질량 보존 차감 및 피크 면적 선형성(Size Linearity) 보정",
    acc_b_desc: "빈 캡슐(Blank)의 기여분을 질량 보존식으로 먼저 차감한 후, 모니터 표준물질의 피크 면적 대비 $\\delta$ 기울기($k_{\\text{area}}$)로 정규화합니다:",
    acc_c_title: "C. 1차 편미분 가우스 오차 전파 유도식 (GUM 5.1.2)",
    acc_c_desc: "선형 변환식 $y_{\\text{cal}} = a \\cdot x_{\\text{raw}} + b$에 대해 각 변수($x_{\\text{raw}}, a, b$)를 편미분하여 합성 표준불확도를 도출합니다:",
    privacy_title: "Zero-Server Client Computation (완전 무서버 보안)",
    privacy_desc: "연구자의 미발표 데이터 및 실험실 기밀을 보호하기 위해, 붙여넣은 모든 원시 데이터와 회귀 계산은 <strong>접속한 브라우저 내부(JavaScript Engine)에서만 100% 실행</strong>됩니다.",
    cite_title: "공식 인용 정보 및 영구 아카이브 (Citation & Permanent Archive)",
    cite_desc: "본 플랫폼의 정산 알고리즘 및 데이터를 학술 논문에 인용하실 경우, 방법론(Analytical Methods) 섹션에 아래 공식 영구 DOI 식별자를 표기해 주시기 바랍니다:",
    changelog_title: "/ 버전별 업데이트 이력 (Release Notes)",
    changelog_subtitle: "안정동위원소 랩 실무진의 피드백을 반영한 지속적 알고리즘 및 UX 업데이트 내역입니다.",
    ctx_toggle_exclude: "선택 행 이상치 제외/포함 토글 (✓)",
    ctx_del_row: "선택 행 완전 삭제",
    ctx_clear_cells: "선택 셀 내용 지우기",
    ctx_insert_row: "아래에 빈 행 1줄 삽입",
    about_p1: "<strong>IsoCalib</strong>은 안정동위원소 지화학 데이터 정산(Data Reduction)을 위해 설계된 경량 오픈소스 웹 도구로, 영구 무료·투명성·재현성을 지향합니다.",
    about_p2: "탄산염 및 가스벤치뿐만 아니라 EA-IRMS 전용 피크 면적 선형성(Size Linearity) 보정, 주석 캡슐 블랭크(Blank) 차감, 3점 이상 다중 앵커(Multi-Point) 검량선, 이상치(Outlier) 개별 제외 토글, 물 및 황(S) 체계를 모두 지원합니다.",
    about_protocols_title: "주요 분석 프로토콜 (Core Analytical Protocols):",
    about_p3: "모든 연산은 <strong>사용자 브라우저 내부에서 100% 로컬 연산</strong>되며 외부 서버로 일체 전송되지 않습니다.",
    qs_modal_title: "/ Quick Start Protocol (빠른 시작 가이드)",
    qs_modal_subtitle: "안정동위원소 분석 데이터 정산을 위한 초간단 3단계 가이드",
    qs_step1_title: "Step 1. 표준물질 및 면적/블랭크 보정 설정 (Section 01)",
    qs_step1_desc: "검량 표준물질(Anchor 1, 2, 3+)과 품질관리 표준물질(QC)의 참값을 확인합니다. EA-IRMS 분석 시 'Area / Blank' 옵션을 켜면 피크 면적(Area) 열이 활성화되어 크기 선형성 및 캡슐 블랭크 차감이 자동 수행됩니다.",
    qs_step1_tip: "* 팁: 블랭크 보정 시 시료 이름에 'BLANK' 또는 'BLK'가 들어간 행들의 평균 면적과 δ 값을 자동으로 감지하여 차감합니다.",
    qs_step2_title: "Step 2. 엑셀 런 시퀀스 붙여넣기 & 이상치 제외 (Section 02)",
    qs_step2_desc: "엑셀에서 분석 열을 복사해 첫 번째 셀에 Ctrl + V로 붙여넣습니다. 값이 튄 런은 좌측 Use(✓) 체크박스를 해제하여 런 순서(#) 왜곡 없이 제외하세요.",
    qs_step2_columns: "[일반 열] Sample ID | Raw δ | 1σ SD  //  [Area 활성 열] Sample ID | Area | Raw δ | 1σ SD",
    qs_step3_title: "Step 3. 보정 실행 및 엑셀 다운로드 (Section 03)",
    qs_step3_desc: "Run Calibration & QC를 클릭하면 블랭크 차감 → 면적 선형성 보정 → 시간 드리프트 보정 → 다중 WLS 검량선이 순차 계산됩니다.",
    qs_step3_desc2: "완료 후 상단의 Export Excel Report (.xlsx) 버튼을 누르면 고해상도 그래프(Figure 1~4)가 포함된 최종 분석 성적서 엑셀 파일이 다운로드됩니다.",
    qs_footer_tip: "* Load Demo 버튼을 누르면 현재 설정된 모드(Area 포함)에 맞는 시연 데이터로 즉시 테스트할 수 있습니다."
  },
  en: {
    tagline: "/ Open Geochemistry Tool",
    nav_quickstart: "Quick Start",
    nav_methodology: "Methodology",
    nav_more: "More",
    nav_about: "About IsoCalib",
    nav_changelog: "Changelog",
    nav_citation: "Citation & DOI",
    nav_feedback_form: "Quick Feedback (No Login)",
    nav_feedback_github: "Developer Issues (GitHub)",
    hero_badge: "Precision Data Reduction & QC Protocol",
    hero_title: "Stable Isotope Calibration",
    hero_desc: "Performs sequence drift correction, EA-IRMS peak area linearity & blank subtraction, multi-point WLS regression, outlier exclusion, and uncertainty propagation.",
    system_label: "Isotope System",
    sec1_title: "Reference & QC Standards",
    btn_add_anchor: "+ Add Anchor (3+ Multi-Point)",
    o_scale_label: "δ¹⁸O Scale:",
    area_mode_label: "Area / Blank:",
    area_opt_off: "Off (Standard columns)",
    area_opt_lin: "Size Linearity (Area vs δ)",
    area_opt_blk: "Blank Subtraction Only",
    area_opt_blk_lin: "Blank + Size Linearity",
    drift_anchor_label: "Monitor:",
    drift_label: "Drift:",
    drift_opt_none: "None (Off)",
    drift_opt_linear: "Linear (Single slope)",
    drift_opt_piecewise: "Anchor Bracketing",
    preset_manage_label: "Reference Presets:",
    preset_select_default: "-- Default Presets --",
    btn_preset_load: "Load",
    btn_preset_delete: "Delete",
    btn_preset_save: "Save",
    drift_guide_desc: "* Supports <strong>2-point and multi-point (3+ anchors) WLS calibration</strong>, <strong>Peak Area Size Linearity</strong>, and <strong>Tin Capsule Blank subtraction</strong> (rows containing 'BLANK' or 'BLK').",
    sec2_title: "Measurement Sequence Data",
    sec2_desc: "Select a cell and press <kbd class=\"px-1.5 py-0.5 bg-stone-200 border border-stone-300 rounded font-mono text-[10px] font-bold\">Ctrl + V</kbd> to paste from Excel. Uncheck <strong>Use (✓)</strong> to exclude outlier runs while preserving sequence order (#).",
    btn_delete_rows: "Delete Row(s)",
    btn_clear: "Clear All",
    btn_demo: "Load Demo",
    demo_guide_tag: "Sample Runs",
    btn_add_rows: "+ 30 Rows",
    btn_calc: "Run Calibration & QC",
    grid_hint: "* Unchecking 'Use' excludes outliers without shifting sequence run numbers (#)",
    btn_export_svg: "Export Publication SVG",
    sec3_title: "Calibrated Results & Quality Control Report",
    btn_export_excel: "Export Excel Report (.xlsx)",
    tab_sequence: "Run-by-Run Sequence",
    tab_grouped: "Grouped Sample Summary",
    result_empty: "Execute calibration above to view reduced isotopic ratios and propagated uncertainties.",
    grouped_empty: "Execute calibration above to generate grouped adjacent sample replicate summaries (Mean ± 1σ).",
    sec4_tag: "Methodology & Standard Principles",
    sec4_heading: "Statistical Principles & Analytical Guidelines",
    sec4_subheading: "All calibrations adhere strictly to international metrological frameworks (JCGM 100:2008 GUM) and geochronological standards (Ludwig Isoplot).",
    card1_title: "1. Multi-Point WLS Regression",
    card1_desc: "Measurements with higher precision (smaller 1σ SD) are assigned greater statistical weight ($w_i = 1/\\sigma_i^2$) across 2 or more anchor standards.",
    card1_quote: "A run with 2x higher uncertainty exerts only 1/4 the statistical leverage on the calibration slope.",
    card1_basis: "Basis: York (1968) / Ludwig (2003)",
    card2_title: "2. Goodness-of-Fit (MSWD)",
    card2_desc: "Evaluates the reduced chi-squared ($\\chi^2/\\nu$) to objectively determine whether multi-point residuals reflect pure analytical precision.",
    card2_quote: "An MSWD close to 1 indicates an ideal fit; values >> 1 indicate unmodeled instrumental drift or non-linearity.",
    card2_basis: "Basis: McIntyre et al. (1966) / IsoplotR",
    card3_title: "3. Combined Uncertainty",
    card3_desc: "Propagates sample repeatability together with the standard errors of the regression parameters.",
    card3_quote: "Provides peer-review-proof uncertainty budgets that satisfy editorial requirements of major journals.",
    card3_basis: "Basis: JCGM 100:2008 (GUM Guide)",
    acc_title: "[+] Detailed Mathematical Derivations & Formulas (Click to expand)",
    acc_a_title: "A. Weighted Least Squares Normal Equations",
    acc_a_desc: "Exact analytical solution minimizing the sum of weighted squared residuals $\\sum w_i (y_i - ax_i - b)^2$:",
    acc_b_title: "B. EA-IRMS Blank Mass Balance & Size Linearity Correction",
    acc_b_desc: "Mass-balance blank subtraction and peak-area linearity normalization prior to WLS scale calibration:",
    acc_c_title: "C. First-Order Gaussian Error Propagation (GUM 5.1.2)",
    acc_c_desc: "Partial differential expansion for the linear calibration function $y_{\\text{cal}} = a \\cdot x_{\\text{raw}} + b$:",
    privacy_title: "Zero-Server Client Computation (Total Privacy)",
    privacy_desc: "All calculations execute 100% locally within your browser's JavaScript engine. Zero data is transmitted externally.",
    cite_title: "Citation & Permanent Archive",
    cite_desc: "To cite this software and its algorithms in your Analytical Methods section, please refer to the permanent Zenodo DOI below:",
    changelog_title: "/ Version Evolution & Changelog",
    changelog_subtitle: "Continuous methodological and UX advancements tailored to real isotope lab requirements.",
    ctx_toggle_exclude: "Toggle Outlier Exclude (✓)",
    ctx_del_row: "Delete Selected Rows",
    ctx_clear_cells: "Clear Selected Cells",
    ctx_insert_row: "Insert 1 Blank Row Below",
    about_p1: "<strong>IsoCalib</strong> is an open-source web application for stable isotope geochemistry data reduction, designed to be free, transparent, and future-proof.",
    about_p2: "It supports dual carbonate systems as well as EA-IRMS peak-area linearity correction, tin capsule blank subtraction, dynamic 3+ multi-point anchor calibration, non-destructive outlier exclusion, single-element water channels, and sulfur.",
    about_protocols_title: "Core Analytical Protocols:",
    about_p3: "All computations are executed 100% locally; no analytical data is ever transferred externally.",
    qs_modal_title: "/ Quick Start Protocol",
    qs_modal_subtitle: "Essential 3-step guideline for fast and reproducible data reduction",
    qs_step1_title: "Step 1. Configure Standards & Area/Blank Mode (Section 01)",
    qs_step1_desc: "Verify accepted values for Anchor 1, 2, 3+ and QC standards. Enable 'Area / Blank' for EA-IRMS runs to activate Peak Area columns for automatic size-linearity and capsule blank corrections.",
    qs_step1_tip: "* Tip: Rows containing 'BLANK' or 'BLK' are automatically averaged and subtracted via mass balance when Blank mode is active.",
    qs_step2_title: "Step 2. Paste Sequence Rows & Filter Outliers (Section 02)",
    qs_step2_desc: "Copy sequence runs from Excel, click the first cell, and press Ctrl + V. Uncheck 'Use' on any anomalous run to exclude it without altering sequence run indices (#).",
    qs_step2_columns: "[Standard] Sample ID | Raw δ | 1σ SD  //  [Area Mode] Sample ID | Area | Raw δ | 1σ SD",
    qs_step3_title: "Step 3. Calibrate & Export (Section 03)",
    qs_step3_desc: "Click Run Calibration & QC to execute Blank subtraction → Area Linearity → Sequence Drift → Multi-point WLS regression.",
    qs_step3_desc2: "Export complete Excel (.xlsx) workbooks embedding high-resolution figures (Figure 1-4) with one click.",
    qs_footer_tip: "* Click 'Load Demo' to inspect an active calculation with realistic peak area & blank runs immediately."
  }
};

const CHANGELOG_DATA = [
  {
    version: "v1.4.0",
    date: "2026-11",
    badge: "EA-IRMS Area Linearity & Blank Suite",
    title_ko: "피크 면적 기반 시료량 선형성(Size Linearity) & 주석 캡슐 블랭크(Blank) 보정 및 모듈화 아키텍처 탑재",
    title_en: "Peak Area Size Linearity & Tin Capsule Blank Correction Suite + Modular Architecture",
    desc_ko: "시료 무게와 유기물 함량이 불균일한 EA-IRMS 분석 특성을 완벽히 해결하기 위해, 피크 면적(Peak Area / Amplitude) 열을 동적으로 활성화하여 캡슐 블랭크 질량 보존 차감과 신호 크기 선형성(Size Effect) 보정을 동시에 수행하며, 전체 소스 코드를 4개 모듈로 분리했습니다.",
    desc_en: "Added dynamic Peak Area columns for mass-balance tin capsule blank subtraction and automated size-effect linearity correction, while refactoring the platform into a clean modular file architecture.",
    changes_ko: [
      "<strong>'Area / Blank' 4단계 전처리 셀렉터 탑재</strong>: <code>Off</code>, <code>Linearity (피크 면적 선형성)</code>, <code>Blank Only (캡슐 블랭크 차감)</code>, <code>Blank + Linearity 통합</code> 모드 지원.",
      "<strong>주석 캡슐 블랭크(Blank) 자동 감지 및 질량 보존 차감</strong>: 시퀀스 내 <code>BLANK</code> 또는 <code>BLK</code>가 포함된 행의 피크 면적($A_{\\text{blk}}$)과 동위원소 값($\\delta_{\\text{blk}}$)을 자동 추출하여 미지 시료 및 표준물질에서 백그라운드 기여분 제거.",
      "<strong>피크 면적 선형성(Size Effect) 자동 회귀 보정</strong>: 모니터 표준물질의 피크 면적 대비 원시 $\\delta$ 값 기울기($k_{\\text{area}}$)를 도출하여 시료량 차이에 따른 이온원 비선형성 편차 교정 및 Figure 3·4 진단 플롯 시각화.",
      "<strong>단일 산소 모드(WATER_O) VPDB ↔ VSMOW 스케일 전환 연동</strong>: 탄산염 듀얼 모드뿐만 아니라 단일 산소 채널에서도 Coplen (1983) 스케일 즉시 변환 지원.",
      "<strong>4-파일 모듈형 아키텍처 전환</strong>: <code>index.html</code>, <code>style.css</code>, <code>presets.js</code>, <code>engine.js</code>로 분리하여 유지보수성 극대화."
    ],
    changes_en: [
      "<strong>4-Way 'Area / Blank' Preprocessing Selector</strong>: Switch seamlessly between <code>Off</code>, <code>Size Linearity</code>, <code>Blank Subtraction Only</code>, and <code>Blank + Size Linearity</code>.",
      "<strong>Automated Mass-Balance Blank Subtraction</strong>: Detects rows labeled <code>BLANK</code> or <code>BLK</code> and subtracts capsule background contamination prior to regression.",
      "<strong>Peak-Area Linearity Normalization & Diagnostics</strong>: Computes $\\delta$ vs. Area slope ($k_{\\text{area}}$) from monitor standards and visualizes size-linearity trends in Figures 3 & 4.",
      "<strong>Single Oxygen (WATER_O) VPDB ↔ VSMOW Toggle</strong>: Extended IUPAC scale conversion to single-channel oxygen workflows.",
      "<strong>Modular Codebase Architecture</strong>: Separated HTML, CSS, Presets, and JS Engine into standalone files."
    ]
  },
  {
    version: "v1.3.3",
    date: "2026-11",
    badge: "Outlier Exclusion Toggle",
    title_ko: "시퀀스 런 순서(#) 보존형 이상치(Outlier) 개별 제외 체크박스 탑재",
    title_en: "Non-Destructive Outlier Exclusion Checkbox (Sequence-Preserving)",
    desc_ko: "표준물질이나 미지 시료 반복 측정 중 특정 런이 튀었을 때, 행을 삭제하여 시퀀스 시간축(Run #)을 왜곡시키는 대신 체크박스 하나로 해당 런만 검량선·드리프트·평균 계산에서 깔끔하게 제외하고 즉시 재검량하는 기능을 탑재했습니다.",
    desc_en: "Added a per-row 'Use (✓)' checkbox and right-click context toggle that excludes anomalous runs from WLS regression, drift modeling, QC, and replicate averaging while strictly preserving sequence acquisition indices (#).",
    changes_ko: [
      "<strong>시퀀스 그리드 'Use (✓)' 체크박스 열 신설</strong>: 체크 해제 시 해당 행에 취소선(Strike-through)이 표시되며 즉시 자동 재검량 실행.",
      "<strong>시계열 드리프트(Run #) 무결성 보존</strong>: 행을 물리적으로 삭제하지 않으므로 앞뒤 런 사이의 측정 시간 간격이 그대로 유지됨.",
      "<strong>최종 결과표 및 엑셀(.xlsx) 내역 투명성 확보</strong>: 제외된 런은 <code>[EXCLUDED]</code> 태그로 명시되어 데이터 투명성 보장."
    ],
    changes_en: [
      "<strong>Interactive 'Use (✓)' Column</strong>: One-click toggle to exclude/include individual runs with instant live recalibration.",
      "<strong>Preserves Drift Time-Series Integrity</strong>: Keeps original sequence run numbers (#) intact.",
      "<strong>Transparent Audit Trail in Excel</strong>: Excluded runs are clearly flagged as <code>[EXCLUDED]</code>."
    ]
  }
];

const PRESETS = {
  CO: {
    name: "Carbon & Oxygen (Carbonate / GasBench)",
    elements: [
      { key: "iso1", label: "δ¹³C", unit: "‰ VPDB" },
      { key: "iso2", label: "δ¹⁸O", unit: "‰ VPDB" }
    ],
    stds: [
      { name: "NBS-18", v1: -5.012, v2: -23.200 },
      { name: "IAEA-603", v1: 2.460, v2: -2.370 }
    ],
    extraStds: [
      { name: "IAEA-CO-8", v1: -5.764, v2: -22.700 },
      { name: "NBS-19", v1: 1.950, v2: -2.200 }
    ],
    defaultDriftAnchorIdx: 1,
    qcStd: { name: "KDO", v1: -1.250, v2: -14.800 },
    demo: [
      ["NBS-18_1", 21.745, 0.032, -0.775, 0.055],
      ["IAEA-603_1", 29.325, 0.028, 20.055, 0.052],
      ["KDO_QC1", 25.562, 0.030, 7.655, 0.054],
      ["Sample-A_1", 26.815, 0.031, 11.810, 0.056],
      ["Sample-A_2", 26.802, 0.029, 11.795, 0.053],
      ["Sample-A_3", 26.788, 0.030, 11.780, 0.055],
      ["Sample-B_1", 24.085, 0.028, 15.290, 0.051],
      ["Sample-B_2", 24.072, 0.030, 15.275, 0.054],
      ["Sample-B_3", 24.058, 0.027, 15.260, 0.050],
      ["NBS-18_2", 21.635, 0.033, -0.955, 0.058],
      ["IAEA-603_2", 29.215, 0.026, 19.875, 0.050],
      ["KDO_QC2", 25.442, 0.029, 7.460, 0.052],
      ["Sample-C_1", 18.330, 0.034, 13.710, 0.060],
      ["Sample-C_2", 18.318, 0.031, 13.695, 0.058],
      ["Sample-C_3", 18.305, 0.032, 13.680, 0.059],
      ["NBS-18_3", 21.525, 0.031, -1.115, 0.056],
      ["IAEA-603_3", 29.105, 0.025, 19.715, 0.049],
      ["KDO_QC3", 25.245, 0.028, 7.175, 0.051]
    ]
  },
  NO: {
    name: "Nitrogen & Oxygen (Nitrate / Denitrifier)",
    elements: [
      { key: "iso1", label: "δ¹⁵N", unit: "‰ Air" },
      { key: "iso2", label: "δ¹⁸O", unit: "‰ VSMOW" }
    ],
    stds: [
      { name: "IAEA-NO-3", v1: 4.700, v2: 25.600 },
      { name: "USGS34", v1: -1.800, v2: -27.900 }
    ],
    extraStds: [{ name: "USGS32", v1: 180.000, v2: 25.700 }],
    defaultDriftAnchorIdx: 0,
    qcStd: { name: "USGS35", v1: 5.700, v2: 57.500 },
    demo: [
      ["IAEA-NO-3_1", 5.120, 0.080, 26.110, 0.150],
      ["USGS34_1", -1.450, 0.090, -27.320, 0.180],
      ["USGS35_QC1", 6.130, 0.085, 58.200, 0.200],
      ["Nitrate-01_1", 3.250, 0.090, 15.400, 0.170],
      ["Nitrate-01_2", 3.270, 0.085, 15.420, 0.160],
      ["Nitrate-01_3", 3.240, 0.080, 15.390, 0.150],
      ["IAEA-NO-3_2", 5.102, 0.075, 26.080, 0.145],
      ["USGS34_2", -1.468, 0.085, -27.350, 0.170],
      ["USGS35_QC2", 6.112, 0.080, 58.160, 0.190]
    ]
  },
  HO: {
    name: "Hydrogen & Oxygen (Water Dual)",
    elements: [
      { key: "iso1", label: "δD", unit: "‰ VSMOW" },
      { key: "iso2", label: "δ¹⁸O", unit: "‰ VSMOW" }
    ],
    stds: [
      { name: "VSMOW2", v1: 0.000, v2: 0.000 },
      { name: "SLAP2", v1: -427.500, v2: -55.500 }
    ],
    extraStds: [{ name: "USGS45", v1: -10.300, v2: -2.238 }],
    defaultDriftAnchorIdx: 0,
    qcStd: { name: "GISP", v1: -189.500, v2: -24.760 },
    demo: [
      ["VSMOW2_1", 1.200, 0.500, 0.120, 0.050],
      ["SLAP2_1", -424.300, 0.800, -54.900, 0.080],
      ["GISP_QC1", -187.900, 0.600, -24.450, 0.060],
      ["Rain-01_1", -45.200, 0.520, -7.120, 0.055],
      ["Rain-01_2", -45.100, 0.480, -7.105, 0.052],
      ["Rain-01_3", -45.300, 0.510, -7.135, 0.058],
      ["VSMOW2_2", 1.050, 0.480, 0.100, 0.048],
      ["SLAP2_2", -424.550, 0.750, -54.940, 0.075],
      ["GISP_QC2", -188.050, 0.580, -24.480, 0.058]
    ]
  },
  CN: {
    name: "EA Organic Bulk C & N (Dual)",
    elements: [
      { key: "iso1", label: "δ¹³C", unit: "‰ VPDB" },
      { key: "iso2", label: "δ¹⁵N", unit: "‰ Air" }
    ],
    stds: [
      { name: "USGS40", v1: -26.390, v2: -4.520 },
      { name: "USGS41a", v1: 36.550, v2: 47.550 }
    ],
    extraStds: [
      { name: "USGS62", v1: -14.790, v2: 20.170 },
      { name: "IAEA-600", v1: -27.771, v2: 1.000 }
    ],
    defaultDriftAnchorIdx: 0,
    qcStd: { name: "USGS61", v1: -35.050, v2: -2.870 },
    demo: [
      ["USGS40_1", -25.850, 0.080, -4.100, 0.120],
      ["USGS41a_1", 37.150, 0.090, 48.050, 0.140],
      ["USGS61_QC1", -34.520, 0.085, -2.420, 0.130],
      ["Plankton-A_1", -21.400, 0.075, 7.850, 0.110],
      ["Plankton-A_2", -21.380, 0.080, 7.860, 0.115],
      ["Plankton-A_3", -21.420, 0.070, 7.840, 0.105],
      ["Fish-Muscle-B_1", -18.600, 0.085, 12.450, 0.125],
      ["Fish-Muscle-B_2", -18.580, 0.080, 12.430, 0.120],
      ["Fish-Muscle-B_3", -18.620, 0.090, 12.470, 0.130],
      ["USGS40_2", -25.900, 0.075, -4.150, 0.115],
      ["USGS41a_2", 37.080, 0.085, 47.980, 0.135],
      ["USGS61_QC2", -34.580, 0.080, -2.480, 0.125]
    ],
    // Extended 21-run Real-world Sequence: [ID, Area1(Vs), Raw1, SD1, Area2(Vs), Raw2, SD2]
    demoArea: [
      ["Tin-Blank_1", 0.35, -28.500, 0.250, 0.18, -1.200, 0.350],
      ["Tin-Blank_2", 0.33, -28.300, 0.240, 0.16, -1.100, 0.320],
      ["USGS40_Low_0.2mg", 12.50, -26.020, 0.080, 4.20, -4.250, 0.120],
      ["USGS40_Mid_0.5mg", 28.40, -25.850, 0.070, 9.80, -4.100, 0.110],
      ["USGS40_High_1.0mg", 54.20, -25.580, 0.075, 18.60, -3.860, 0.115],
      ["USGS41a_1", 29.10, 37.150, 0.085, 10.10, 48.050, 0.130],
      ["USGS61_QC1", 27.80, -34.520, 0.080, 9.50, -2.420, 0.120],
      ["Plankton-A_1", 18.20, -21.460, 0.075, 6.40, 7.780, 0.110],
      ["Plankton-A_2", 32.50, -21.310, 0.080, 11.20, 7.910, 0.115],
      ["Plankton-A_3", 46.80, -21.160, 0.070, 16.10, 8.040, 0.105],
      ["Fish-Muscle-B_1", 22.40, -18.650, 0.085, 7.90, 12.390, 0.125],
      ["Fish-Muscle-B_2", 36.10, -18.520, 0.080, 12.60, 12.510, 0.120],
      ["Fish-Muscle-B_3", 51.00, -18.380, 0.090, 17.80, 12.640, 0.130],
      ["USGS40_Bracket", 28.60, -25.840, 0.075, 9.90, -4.090, 0.110],
      ["USGS41a_2", 28.80, 37.140, 0.085, 10.00, 48.040, 0.135],
      ["USGS61_QC2", 16.50, -34.640, 0.085, 5.80, -2.530, 0.125],
      ["Macroalgae-C_1", 24.30, -14.240, 0.090, 8.40, 5.560, 0.110],
      ["Macroalgae-C_2", 38.00, -14.120, 0.085, 13.20, 5.670, 0.115],
      ["Macroalgae-C_3", 52.50, -13.980, 0.095, 18.20, 5.790, 0.120],
      ["USGS40_End", 28.80, -25.820, 0.070, 10.00, -4.080, 0.110],
      ["USGS41a_End", 29.20, 37.160, 0.080, 10.20, 48.060, 0.130]
    ]
  },
  EA_C: {
    name: "EA Organic Carbon only (Acidified Sediments)",
    elements: [{ key: "iso1", label: "δ¹³C", unit: "‰ VPDB" }],
    stds: [
      { name: "USGS40", v1: -26.390 },
      { name: "USGS41a", v1: 36.550 }
    ],
    extraStds: [
      { name: "IAEA-CH-7", v1: -32.151 },
      { name: "USGS62", v1: -14.790 }
    ],
    defaultDriftAnchorIdx: 0,
    qcStd: { name: "IAEA-CH-6", v1: -10.450 },
    demo: [
      ["USGS40_1", -25.820, 0.075],
      ["USGS41a_1", 37.180, 0.085],
      ["IAEA-CH-6_QC1", -9.850, 0.080],
      ["Core-Sed-01_1", -22.450, 0.090],
      ["Core-Sed-01_2", -22.430, 0.085],
      ["Core-Sed-01_3", -22.470, 0.080],
      ["USGS40_2", -25.880, 0.070],
      ["USGS41a_2", 37.120, 0.080],
      ["IAEA-CH-6_QC2", -9.910, 0.075]
    ],
    // Extended 19-run Marine Sediment Sequence: [ID, Area1(Vs), Raw1, SD1]
    demoArea: [
      ["Tin-Blank_1", 0.40, -28.600, 0.200],
      ["Tin-Blank_2", 0.36, -28.400, 0.220],
      ["USGS40_0.15mg", 10.20, -26.050, 0.080],
      ["USGS40_0.50mg", 30.50, -25.820, 0.070],
      ["USGS40_1.20mg", 62.00, -25.470, 0.075],
      ["USGS41a_1", 31.00, 37.180, 0.085],
      ["IAEA-CH-6_QC1", 29.80, -9.850, 0.080],
      ["Core-Sed-01_1", 14.50, -22.620, 0.090],
      ["Core-Sed-01_2", 31.20, -22.430, 0.085],
      ["Core-Sed-01_3", 48.00, -22.240, 0.080],
      ["Core-Sed-02_1", 12.00, -24.980, 0.075],
      ["Core-Sed-02_2", 28.50, -24.780, 0.080],
      ["Core-Sed-02_3", 44.00, -24.590, 0.070],
      ["USGS40_MidCheck", 30.80, -25.810, 0.070],
      ["IAEA-CH-6_QC2", 15.40, -10.010, 0.075],
      ["Core-Sed-03_1", 16.20, -21.320, 0.085],
      ["Core-Sed-03_2", 33.40, -21.130, 0.080],
      ["Core-Sed-03_3", 51.00, -20.930, 0.090],
      ["USGS41a_End", 31.50, 37.190, 0.080]
    ]
  },
  EA_N: {
    name: "EA Total Nitrogen only (Untreated Sediments)",
    elements: [{ key: "iso1", label: "δ¹⁵N", unit: "‰ Air" }],
    stds: [
      { name: "USGS40", v1: -4.520 },
      { name: "USGS41a", v1: 47.550 }
    ],
    extraStds: [
      { name: "IAEA-N-2", v1: 20.300 },
      { name: "USGS25", v1: -30.400 }
    ],
    defaultDriftAnchorIdx: 0,
    qcStd: { name: "IAEA-N-1", v1: 0.400 },
    demo: [
      ["USGS40_1", -4.080, 0.110],
      ["USGS41a_1", 48.100, 0.130],
      ["IAEA-N-1_QC1", 0.920, 0.120],
      ["Raw-Sed-01_1", 5.400, 0.115],
      ["Raw-Sed-01_2", 5.380, 0.110],
      ["Raw-Sed-01_3", 5.420, 0.120],
      ["USGS40_2", -4.130, 0.105],
      ["USGS41a_2", 48.040, 0.125],
      ["IAEA-N-1_QC2", 0.860, 0.115]
    ],
    demoArea: [
      ["Tin-Blank_1", 0.22, -1.500, 0.300],
      ["USGS40_Small", 5.10, -4.240, 0.115],
      ["USGS40_Mid", 12.40, -4.080, 0.105],
      ["USGS40_Large", 24.80, -3.810, 0.110],
      ["USGS41a_1", 12.80, 48.100, 0.130],
      ["IAEA-N-1_QC1", 12.10, 0.920, 0.120],
      ["Raw-Sed-01_1", 6.20, 5.260, 0.115],
      ["Raw-Sed-01_2", 12.50, 5.400, 0.110],
      ["Raw-Sed-01_3", 21.00, 5.580, 0.120],
      ["USGS41a_2", 12.50, 48.090, 0.125],
      ["IAEA-N-1_QC2", 7.40, 0.810, 0.115]
    ]
  },
  CH: {
    name: "EA Organic Bulk C & H (Dual)",
    elements: [
      { key: "iso1", label: "δ¹³C", unit: "‰ VPDB" },
      { key: "iso2", label: "δD", unit: "‰ VSMOW" }
    ],
    stds: [
      { name: "USGS40", v1: -26.390, v2: -9.200 },
      { name: "USGS41a", v1: 36.550, v2: -4.300 }
    ],
    extraStds: [
      { name: "IAEA-CH-7", v1: -32.151, v2: -100.300 },
      { name: "USGS62", v1: -14.790, v2: -156.100 }
    ],
    defaultDriftAnchorIdx: 0,
    qcStd: { name: "USGS61", v1: -35.050, v2: -7.500 },
    demo: [
      ["USGS40_1", -25.800, 0.080, -8.100, 1.200],
      ["USGS41a_1", 37.200, 0.090, -3.200, 1.400],
      ["USGS61_QC1", -34.450, 0.085, -6.350, 1.300],
      ["Wax-Sample-A_1", -28.400, 0.080, -145.200, 1.350],
      ["Wax-Sample-A_2", -28.380, 0.075, -145.050, 1.280],
      ["Wax-Sample-A_3", -28.420, 0.085, -145.350, 1.420],
      ["USGS40_2", -25.860, 0.075, -8.250, 1.150],
      ["USGS41a_2", 37.120, 0.085, -3.350, 1.350],
      ["USGS61_QC2", -34.520, 0.080, -6.500, 1.250]
    ]
  },
  WATER_H: {
    name: "Water Hydrogen (δD only)",
    elements: [{ key: "iso1", label: "δD", unit: "‰ VSMOW" }],
    stds: [
      { name: "VSMOW2", v1: 0.000 },
      { name: "SLAP2", v1: -427.500 }
    ],
    extraStds: [{ name: "USGS46", v1: -235.800 }],
    defaultDriftAnchorIdx: 0,
    qcStd: { name: "GISP", v1: -189.500 },
    demo: [
      ["VSMOW2_1", 1.250, 0.500],
      ["SLAP2_1", -424.100, 0.800],
      ["GISP_QC1", -187.800, 0.600],
      ["Well-Water-A_1", -72.400, 0.550],
      ["Well-Water-A_2", -72.350, 0.520],
      ["Well-Water-A_3", -72.480, 0.500],
      ["VSMOW2_2", 1.080, 0.470],
      ["SLAP2_2", -424.450, 0.760],
      ["GISP_QC2", -187.980, 0.580]
    ]
  },
  WATER_O: {
    name: "Water / Solid Oxygen (δ¹⁸O only)",
    elements: [{ key: "iso1", label: "δ¹⁸O", unit: "‰ VSMOW" }],
    stds: [
      { name: "VSMOW2", v1: 0.000 },
      { name: "SLAP2", v1: -55.500 }
    ],
    extraStds: [
      { name: "USGS46", v1: -29.800 },
      { name: "IAEA-601", v1: 28.900 }
    ],
    defaultDriftAnchorIdx: 0,
    qcStd: { name: "GISP", v1: -24.760 },
    demo: [
      ["VSMOW2_1", 0.150, 0.050],
      ["SLAP2_1", -54.850, 0.080],
      ["GISP_QC1", -24.400, 0.060],
      ["Well-Water-A_1", -9.850, 0.055],
      ["Well-Water-A_2", -9.840, 0.052],
      ["Well-Water-A_3", -9.860, 0.050],
      ["VSMOW2_2", 0.115, 0.045],
      ["SLAP2_2", -54.910, 0.075],
      ["GISP_QC2", -24.440, 0.055]
    ]
  },
  S: {
    name: "Sulfur Isotope (δ³⁴S)",
    elements: [{ key: "iso1", label: "δ³⁴S", unit: "‰ VCDT" }],
    stds: [
      { name: "IAEA-S-1", v1: -0.300 },
      { name: "IAEA-S-2", v1: 22.700 }
    ],
    extraStds: [{ name: "IAEA-S-3", v1: -32.300 }],
    defaultDriftAnchorIdx: 0,
    qcStd: { name: "NBS-127", v1: 21.100 },
    demo: [
      ["IAEA-S-1_1", -0.150, 0.120],
      ["IAEA-S-2_1", 23.150, 0.150],
      ["NBS-127_QC1", 21.480, 0.130],
      ["Pyrite-01_1", 12.450, 0.130],
      ["Pyrite-01_2", 12.470, 0.120],
      ["Pyrite-01_3", 12.440, 0.110],
      ["IAEA-S-1_2", -0.168, 0.110],
      ["IAEA-S-2_2", 23.115, 0.140],
      ["NBS-127_QC2", 21.450, 0.125]
    ]
  }
};
