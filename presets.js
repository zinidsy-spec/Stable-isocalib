/* presets.js - IsoCalib v1.5.0 Isotope System Presets, Certified %C/%N, QC Criteria & i18n Dictionary */
/* 참고: 버전 업데이트 이력(CHANGELOG_DATA)은 이제 독립 파일인 changelog.js에서 영구 관리됩니다. */

const ELEMENT_QC_THRESHOLDS = {
  "δ¹³C": { bias: 0.08, sd: 0.08 },
  "δ¹⁸O": { bias: 0.12, sd: 0.12 },
  "δ¹⁵N": { bias: 0.15, sd: 0.15 },
  "δ³⁴S": { bias: 0.20, sd: 0.20 },
  "δD":   { bias: 1.50, sd: 1.50 }
};

function getElementThreshold(label) {
  return ELEMENT_QC_THRESHOLDS[label] || { bias: 0.15, sd: 0.15 };
}

const PRESETS = {
  CO: {
    elements: [
      { label: "δ¹³C", unit: "‰ VPDB", element: "C" },
      { label: "δ¹⁸O", unit: "‰ VPDB", element: "O" }
    ],
    defaultDriftAnchorIdx: 1,
    stds: [
      { name: "NBS-18", v1: -5.014, v2: -23.200, wt1: 12.00, wt2: 47.96 },
      { name: "IAEA-603", v1: 2.460, v2: -2.370, wt1: 12.00, wt2: 47.96 }
    ],
    extraStds: [
      { name: "NBS-19", v1: 1.950, v2: -2.200, wt1: 12.00, wt2: 47.96 },
      { name: "IAEA-CO-8", v1: -5.764, v2: -22.700, wt1: 12.00, wt2: 47.96 }
    ],
    qcStd: { name: "KDO", v1: 0.850, v2: -8.420, wt1: 12.00, wt2: 47.96 },
    demo: [
      ["NBS-18_1", -5.210, 0.025, -23.450, 0.042],
      ["IAEA-603_1", 2.380, 0.021, -2.510, 0.038],
      ["KDO_QC1", 0.745, 0.028, -8.610, 0.045],
      ["Stalagmite-A_01", -6.420, 0.031, -9.850, 0.049],
      ["Stalagmite-A_02", -6.445, 0.029, -9.885, 0.052],
      ["Stalagmite-A_03", -6.410, 0.034, -9.820, 0.046],
      ["Stalagmite-B_01", -7.120, 0.035, -10.340, 0.055],
      ["Stalagmite-B_02", -7.890, 0.125, -11.420, 0.138],
      ["Stalagmite-B_03", -7.145, 0.032, -10.315, 0.048],
      ["NBS-18_2", -5.225, 0.027, -23.480, 0.044],
      ["IAEA-603_2", 2.365, 0.022, -2.540, 0.039],
      ["Core-Carb-C_01", 1.120, 0.024, -4.180, 0.041],
      ["Core-Carb-C_02", 1.095, 0.026, -4.210, 0.043],
      ["Core-Carb-D_01", -1.450, 0.030, -6.720, 0.051],
      ["Core-Carb-D_02", -1.475, 0.028, -6.695, 0.047],
      ["KDO_QC2", 0.730, 0.025, -8.635, 0.042],
      ["Foram-Mix-1_01", 0.940, 0.038, -1.890, 0.061],
      ["Foram-Mix-1_02", 0.915, 0.035, -1.925, 0.058],
      ["Foram-Mix-2_01", 1.320, 0.033, -1.450, 0.054],
      ["Foram-Mix-2_02", 1.345, 0.036, -1.420, 0.057],
      ["NBS-18_3", -5.240, 0.026, -23.510, 0.045],
      ["Lake-Sed-E_01", -3.810, 0.142, -7.940, 0.068],
      ["Lake-Sed-E_02", -3.835, 0.039, -7.915, 0.064],
      ["IAEA-603_3", 2.350, 0.023, -2.565, 0.040],
      ["KDO_QC3", 0.720, 0.027, -8.650, 0.044]
    ]
  },

  NO: {
    elements: [
      { label: "δ¹⁵N", unit: "‰ AIR", element: "N" },
      { label: "δ¹⁸O", unit: "‰ VSMOW", element: "O" }
    ],
    defaultDriftAnchorIdx: 0,
    stds: [
      { name: "USGS34", v1: -1.800, v2: -27.900 },
      { name: "USGS35", v1: 2.700, v2: 57.500 }
    ],
    extraStds: [
      { name: "IAEA-NO-3", v1: 4.700, v2: 25.600 }
    ],
    qcStd: { name: "USGS32", v1: 180.000, v2: 25.700 },
    demo: [
      ["USGS34_1", -1.950, 0.045, -28.420, 0.085],
      ["USGS35_1", 2.610, 0.048, 56.850, 0.092],
      ["Groundwater-01_a", 6.420, 0.055, 4.120, 0.095],
      ["Groundwater-01_b", 6.480, 0.052, 4.190, 0.091],
      ["Stream-N2_a", 9.850, 0.061, 8.740, 0.105],
      ["Stream-N2_b", 9.790, 0.058, 8.690, 0.098],
      ["USGS34_2", -1.970, 0.044, -28.460, 0.088],
      ["USGS35_2", 2.590, 0.049, 56.810, 0.090]
    ]
  },

  HO: {
    elements: [
      { label: "δD", unit: "‰ VSMOW", element: "H" },
      { label: "δ¹⁸O", unit: "‰ VSMOW", element: "O" }
    ],
    defaultDriftAnchorIdx: 1,
    stds: [
      { name: "SLAP2", v1: -427.500, v2: -55.500 },
      { name: "VSMOW2", v1: 0.000, v2: 0.000 }
    ],
    extraStds: [
      { name: "GISP", v1: -189.500, v2: -24.760 }
    ],
    qcStd: { name: "USGS45", v1: -10.300, v2: -2.238 },
    demo: [
      ["VSMOW2_1", -0.450, 0.420, -0.120, 0.035],
      ["SLAP2_1", -428.800, 0.580, -55.820, 0.048],
      ["USGS45_QC1", -10.750, 0.450, -2.360, 0.038],
      ["Rain-Busan-01_a", -48.200, 0.490, -7.450, 0.041],
      ["Rain-Busan-01_b", -48.650, 0.510, -7.490, 0.042],
      ["Cave-Drip-02_a", -54.100, 0.470, -8.320, 0.039],
      ["Cave-Drip-02_b", -53.850, 0.480, -8.290, 0.040],
      ["VSMOW2_2", -0.520, 0.440, -0.145, 0.036],
      ["SLAP2_2", -428.950, 0.610, -55.860, 0.050],
      ["USGS45_QC2", -10.820, 0.460, -2.385, 0.039]
    ]
  },

  CN: {
    elements: [
      { label: "δ¹³C", unit: "‰ VPDB", element: "C" },
      { label: "δ¹⁵N", unit: "‰ AIR", element: "N" }
    ],
    defaultDriftAnchorIdx: 0,
    stds: [
      { name: "USGS40", v1: -26.389, v2: -4.520, wt1: 40.82, wt2: 9.52 },
      { name: "USGS41a", v1: 36.550, v2: 47.550, wt1: 40.82, wt2: 9.52 }
    ],
    extraStds: [
      { name: "IAEA-600", v1: -27.771, v2: 1.000, wt1: 49.48, wt2: 28.85 }
    ],
    qcStd: { name: "B2151", v1: -28.850, v2: 4.320, wt1: 43.20, wt2: 4.45 },
    demo: [
      ["USGS40_1", -26.520, 0.035, -4.680, 0.055],
      ["USGS41a_1", 36.310, 0.048, 47.210, 0.072],
      ["B2151_QC1", -28.980, 0.041, 4.150, 0.062],
      ["Soil-Org-01_a", -24.150, 0.045, 3.820, 0.068],
      ["Soil-Org-01_b", -24.210, 0.042, 3.880, 0.065],
      ["Marine-POM-02_a", -21.420, 0.039, 6.450, 0.071],
      ["Marine-POM-02_b", -21.380, 0.044, 6.510, 0.069],
      ["USGS40_2", -26.540, 0.036, -4.710, 0.058],
      ["USGS41a_2", 36.280, 0.050, 47.180, 0.075],
      ["B2151_QC2", -29.010, 0.043, 4.120, 0.064]
    ],
    demoArea: [
      ["Tin-Blank_1", 0, 0.35, -27.800, 0.180, 0.22, -1.200, 0.250],
      ["USGS40_0.2mg", 0.210, 4.25, -26.680, 0.045, 1.15, -4.820, 0.075],
      ["USGS40_0.5mg", 0.505, 10.30, -26.520, 0.032, 2.75, -4.650, 0.052],
      ["USGS40_0.9mg", 0.895, 18.25, -26.410, 0.028, 4.88, -4.540, 0.048],
      ["USGS41a_1", 0.480, 9.80, 36.320, 0.046, 2.62, 47.240, 0.070],
      ["B2151_QC1", 0.620, 13.40, -28.960, 0.038, 1.58, 4.180, 0.060],
      ["Estuary-Sed-1_a", 1.850, 9.15, -23.840, 0.044, 1.42, 5.120, 0.068],
      ["Estuary-Sed-1_b", 1.920, 9.48, -23.890, 0.041, 1.48, 5.180, 0.065],
      ["Leaf-Litter-2_a", 0.550, 12.60, -29.450, 0.036, 1.12, 1.450, 0.072],
      ["Leaf-Litter-2_b", 0.530, 12.15, -29.410, 0.039, 1.08, 1.410, 0.074],
      ["Tin-Blank_2", 0, 0.38, -27.950, 0.190, 0.24, -1.350, 0.260],
      ["USGS40_end", 0.510, 10.42, -26.530, 0.034, 2.78, -4.670, 0.054],
      ["USGS41a_end", 0.495, 10.10, 36.290, 0.048, 2.70, 47.200, 0.072]
    ]
  },

  EA_C: {
    elements: [
      { label: "δ¹³C", unit: "‰ VPDB", element: "C" }
    ],
    defaultDriftAnchorIdx: 0,
    stds: [
      { name: "USGS40", v1: -26.389, wt1: 40.82 },
      { name: "IAEA-CH-6", v1: -10.449, wt1: 42.10 }
    ],
    extraStds: [
      { name: "USGS24", v1: -16.049, wt1: 100.00 }
    ],
    qcStd: { name: "B2151", v1: -28.850, wt1: 43.20 },
    demo: [
      ["USGS40_1", -26.510, 0.034],
      ["IAEA-CH-6_1", -10.580, 0.031],
      ["B2151_QC1", -28.970, 0.038],
      ["Acid-Sed-01_a", -22.640, 0.042],
      ["Acid-Sed-01_b", -22.690, 0.040],
      ["Acid-Sed-02_a", -25.120, 0.045],
      ["Acid-Sed-02_b", -25.080, 0.043],
      ["USGS40_2", -26.530, 0.035],
      ["IAEA-CH-6_2", -10.600, 0.032]
    ],
    demoArea: [
      ["BLK_01", 0, 0.32, -27.600, 0.175],
      ["USGS40_0.2mg", 0.205, 4.18, -26.650, 0.042],
      ["USGS40_0.5mg", 0.502, 10.25, -26.510, 0.031],
      ["USGS40_0.8mg", 0.810, 16.52, -26.420, 0.029],
      ["IAEA-CH-6_1", 0.490, 10.32, -10.580, 0.030],
      ["B2151_QC1", 0.610, 13.15, -28.960, 0.037],
      ["Marine-Core-TOC1_a", 4.250, 8.95, -21.850, 0.044],
      ["Marine-Core-TOC1_b", 4.380, 9.22, -21.890, 0.041],
      ["BLK_02", 0, 0.34, -27.720, 0.180],
      ["USGS40_2", 0.508, 10.35, -26.520, 0.033],
      ["IAEA-CH-6_2", 0.500, 10.52, -10.595, 0.032]
    ]
  },

  EA_N: {
    elements: [
      { label: "δ¹⁵N", unit: "‰ AIR", element: "N" }
    ],
    defaultDriftAnchorIdx: 0,
    stds: [
      { name: "USGS40", v1: -4.520, wt1: 9.52 },
      { name: "IAEA-N-2", v1: 20.300, wt1: 21.20 }
    ],
    extraStds: [
      { name: "IAEA-N-1", v1: 0.400, wt1: 21.20 }
    ],
    qcStd: { name: "B2151", v1: 4.320, wt1: 4.45 },
    demo: [
      ["USGS40_1", -4.680, 0.055],
      ["IAEA-N-2_1", 20.110, 0.062],
      ["B2151_QC1", 4.160, 0.058],
      ["Bulk-Sed-TN1_a", 5.840, 0.065],
      ["Bulk-Sed-TN1_b", 5.910, 0.061],
      ["USGS40_2", -4.710, 0.056],
      ["IAEA-N-2_2", 20.080, 0.064]
    ],
    demoArea: [
      ["BLK_01", 0, 0.21, -1.150, 0.240],
      ["USGS40_0.5mg", 0.505, 2.76, -4.670, 0.054],
      ["USGS40_1.0mg", 1.010, 5.52, -4.560, 0.048],
      ["IAEA-N-2_1", 0.450, 5.48, 20.120, 0.060],
      ["B2151_QC1", 1.250, 3.18, 4.150, 0.058],
      ["Shelf-Sed-TN1_a", 8.500, 3.85, 6.240, 0.066],
      ["Shelf-Sed-TN1_b", 8.620, 3.91, 6.290, 0.063],
      ["USGS40_2", 0.510, 2.79, -4.690, 0.055],
      ["IAEA-N-2_2", 0.460, 5.60, 20.090, 0.062]
    ]
  },

  CH: {
    elements: [
      { label: "δ¹³C", unit: "‰ VPDB", element: "C" },
      { label: "δD", unit: "‰ VSMOW", element: "H" }
    ],
    defaultDriftAnchorIdx: 0,
    stds: [
      { name: "NBS-22", v1: -30.031, v2: -116.900 },
      { name: "IAEA-CH-7", v1: -32.151, v2: -100.300 }
    ],
    extraStds: [],
    qcStd: { name: "USGS70", v1: -30.530, v2: -183.900 },
    demo: [
      ["NBS-22_1", -30.180, 0.042, -118.400, 0.850],
      ["IAEA-CH-7_1", -32.310, 0.045, -101.700, 0.820],
      ["n-Alkane-C29_a", -29.450, 0.048, -142.300, 0.910],
      ["n-Alkane-C29_b", -29.510, 0.046, -141.850, 0.890],
      ["NBS-22_2", -30.200, 0.044, -118.650, 0.870],
      ["IAEA-CH-7_2", -32.330, 0.047, -101.900, 0.840]
    ]
  },

  WATER_H: {
    elements: [
      { label: "δD", unit: "‰ VSMOW" }
    ],
    defaultDriftAnchorIdx: 1,
    stds: [
      { name: "SLAP2", v1: -427.500 },
      { name: "VSMOW2", v1: 0.000 }
    ],
    extraStds: [
      { name: "GISP", v1: -189.500 }
    ],
    qcStd: { name: "USGS45", v1: -10.300 },
    demo: [
      ["VSMOW2_1", -0.450, 0.420],
      ["SLAP2_1", -428.800, 0.580],
      ["USGS45_QC1", -10.750, 0.450],
      ["Spring-Water-1_a", -52.400, 0.480],
      ["Spring-Water-1_b", -52.750, 0.500],
      ["VSMOW2_2", -0.510, 0.430],
      ["SLAP2_2", -428.920, 0.600]
    ]
  },

  WATER_O: {
    elements: [
      { label: "δ¹⁸O", unit: "‰ VSMOW" }
    ],
    defaultDriftAnchorIdx: 1,
    stds: [
      { name: "SLAP2", v1: -55.500 },
      { name: "VSMOW2", v1: 0.000 }
    ],
    extraStds: [
      { name: "GISP", v1: -24.760 }
    ],
    qcStd: { name: "USGS45", v1: -2.238 },
    demo: [
      ["VSMOW2_1", -0.120, 0.035],
      ["SLAP2_1", -55.820, 0.048],
      ["USGS45_QC1", -2.360, 0.038],
      ["Cave-Pool-01_a", -8.140, 0.041],
      ["Cave-Pool-01_b", -8.175, 0.040],
      ["VSMOW2_2", -0.140, 0.036],
      ["SLAP2_2", -55.850, 0.049]
    ]
  },

  S: {
    elements: [
      { label: "δ³⁴S", unit: "‰ VCDT", element: "S" }
    ],
    defaultDriftAnchorIdx: 0,
    stds: [
      { name: "IAEA-S-1", v1: -0.300, wt1: 12.94 },
      { name: "IAEA-S-2", v1: 22.620, wt1: 12.94 }
    ],
    extraStds: [
      { name: "NBS-127", v1: 21.120, wt1: 13.74 }
    ],
    qcStd: { name: "IAEA-SO-5", v1: 0.490, wt1: 13.74 },
    demo: [
      ["IAEA-S-1_1", -0.480, 0.075],
      ["IAEA-S-2_1", 22.350, 0.082],
      ["IAEA-SO-5_QC1", 0.310, 0.078],
      ["Pyrite-Core-1_a", -14.250, 0.092],
      ["Pyrite-Core-1_b", -14.340, 0.088],
      ["Barite-Vein-2_a", 18.640, 0.085],
      ["Barite-Vein-2_b", 18.580, 0.089],
      ["IAEA-S-1_2", -0.510, 0.076],
      ["IAEA-S-2_2", 22.310, 0.084]
    ]
  }
};

const TRANSLATIONS = {
  en: {
    nav_quickstart: "Quick Start",
    nav_methodology: "Methodology",
    nav_more: "More",
    nav_about: "<span>About IsoCalib</span><span class='font-mono text-[10px] text-stone-400'>About</span>",
    nav_changelog: "<span>Changelog</span><span class='font-mono text-[10px] text-stone-400'>v1.5.0</span>",
    nav_citation: "<span>Citation & DOI</span><span class='font-mono text-[10px] text-stone-400'>Cite</span>",
    nav_feedback_form: "<span class='flex items-center gap-1'><span>💬</span> Quick Feedback (No Login)</span><span class='font-mono text-[10px] text-emerald-700 bg-emerald-100 px-1 py-0.2'>No Login</span>",
    nav_feedback_github: "<span>GitHub Issues</span><span class='font-mono text-[10px] text-stone-400'>GitHub</span>",
    hero_badge: "Precision Data Reduction & QC Protocol",
    hero_title: "Stable Isotope Calibration",
    hero_desc: "Performs sequence drift correction, EA-IRMS peak area linearity (Auto/Manual) & blank subtraction, sample weight (mg) based %C/%N & Atomic C/N quantification, multi-point WLS regression, and Raw SD precision flagging.",
    system_label: "Isotope System",
    grp_carbonate: "Carbonate & GasBench Systems",
    grp_ea: "EA-IRMS (Bulk Organic & Sediments)",
    grp_water: "Water & Single Element Lines",
    sys_co: "1. Carbon & Oxygen (δ¹³C, δ¹⁸O - Dual)",
    sys_no: "2. Nitrogen & Oxygen (δ¹⁵N, δ¹⁸O - Dual)",
    sys_ho: "3. Hydrogen & Oxygen (δD, δ¹⁸O - Dual)",
    sys_cn: "4. EA Organic Bulk C & N (δ¹³C, δ¹⁵N - Dual)",
    sys_ea_c: "5. EA Organic Carbon only (δ¹³C - Acidified Sediments)",
    sys_ea_n: "6. EA Total Nitrogen only (δ¹⁵N - Untreated Sediments)",
    sys_ch: "7. EA Organic Bulk C & H (δ¹³C, δD - Dual)",
    sys_water_h: "8. Water Hydrogen (δD only - Single)",
    sys_water_o: "9. Water Oxygen (δ¹⁸O only - Single)",
    sys_s: "10. Sulfur Isotope (δ³⁴S - Single)",
    sec1_title: "Reference & QC Standards",
    btn_add_anchor: "<span>+ Add Anchor (3+ Multi-Point)</span>",
    o_scale_label: "δ¹⁸O Scale:",
    area_mode_label: "Area / Blank:",
    area_opt_off: "Off (Standard columns)",
    area_opt_lin: "Size Linearity (Area vs δ)",
    area_opt_blk: "Blank Subtraction Only",
    area_opt_blk_lin: "Blank + Size Linearity",
    slope_method_label: "Slope Method:",
    slope_opt_auto: "Auto-Fit (Monitor Std)",
    slope_opt_manual: "Manual Input (‰/Vs)",
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
    drift_guide_desc: "* Supports <strong>2-point and multi-point (3+ anchors) WLS calibration</strong>, <strong>Peak Area Size Linearity (Auto/Manual)</strong>, <strong>Capsule Blank subtraction ('BLANK'/'BLK')</strong>, and <strong>Sample Weight (mg) based %C/%N & Atomic C/N quantification</strong>.",
    sec2_title: "Measurement Sequence Data",
    sec2_desc: "Select a cell and press <kbd class='px-1.5 py-0.5 bg-stone-200 border border-stone-300 rounded font-mono text-[10px] font-bold'>Ctrl + V</kbd> to paste from Excel. Uncheck <strong>Use (✓)</strong> to exclude outlier runs while preserving sequence order (#).",
    raw_sd_limit_label: "Raw SD Limit:",
    btn_delete_rows: "Delete Row(s)",
    btn_clear: "Clear All",
    btn_demo: "Load Demo",
    demo_guide_tag: "30+ Sample Runs",
    btn_add_rows: "+ 30 Rows",
    btn_calc: "Run Calibration & QC",
    grid_hint: "* Unchecking 'Use' excludes outliers without shifting sequence run numbers (#)",
    btn_export_svg: "Export Publication SVG",
    sec3_title: "Calibrated Results & Quality Control Report",
    btn_export_excel: "<span>Export Excel Report (.xlsx)</span>",
    tab_sequence: "Run-by-Run Sequence",
    tab_grouped: "Grouped Sample Summary",
    result_empty: "Execute calibration above to view reduced isotopic ratios, propagated uncertainties, and elemental concentrations (%).",
    grouped_empty: "No grouped sample replicates calculated yet.",
    sec4_tag: "Methodology & Standard Principles",
    sec4_heading: "Statistical Principles & Analytical Guidelines",
    sec4_subheading: "All calibrations adhere strictly to international metrological frameworks (JCGM 100:2008 GUM) and geochronological standards (Ludwig Isoplot).",
    card1_title: "1. Weighted Regression (WLS)",
    card1_desc: "Measurements with higher precision (smaller 1σ SD) are assigned greater statistical weight ($w_i = 1/\\sigma_i^2$) across 2 or more anchor standards.",
    card1_quote: "A run with 2x higher uncertainty exerts only 1/4 the statistical leverage on the calibration slope.",
    card1_basis: "Basis: York (1968) / Ludwig (2003)",
    card2_title: "2. Goodness-of-Fit (MSWD)",
    card2_desc: "Evaluates the reduced chi-squared ($\\chi^2/\\nu$) to objectively determine whether residuals reflect pure analytical precision.",
    card2_quote: "An MSWD close to 1 indicates an ideal fit; values >> 1 indicate unmodeled instrumental drift or non-analytical variance.",
    card2_basis: "Basis: McIntyre et al. (1966) / IsoplotR",
    card3_title: "3. Combined Uncertainty",
    card3_desc: "Propagates sample repeatability together with the standard errors of the regression parameters.",
    card3_quote: "Provides peer-review-proof uncertainty budgets that satisfy editorial requirements of major journals.",
    card3_basis: "Basis: JCGM 100:2008 (GUM Guide)",
    acc_title: "[+] Detailed Mathematical Derivations & Formulas (Click to expand)",
    acc_a_title: "A. Weighted Least Squares Normal Equations",
    acc_a_desc: "Exact analytical solution minimizing the sum of weighted squared residuals $\\sum w_i (y_i - ax_i - b)^2$:",
    acc_b_title: "B. EA-IRMS Blank Mass Balance, Size Linearity & Elemental Quantification (%C, %N)",
    acc_b_desc: "Mass-balance blank subtraction and peak-area linearity normalization prior to WLS scale calibration, paired with response factor ($RF$) elemental mass quantification:",
    acc_c_title: "C. First-Order Gaussian Error Propagation (GUM 5.1.2)",
    acc_c_desc: "Partial differential expansion for the linear calibration function $y_{\\text{cal}} = a \\cdot x_{\\text{raw}} + b$:",
    privacy_title: "Zero-Server Client Computation (Total Privacy)",
    privacy_desc: "All calculations execute 100% locally within your browser's JavaScript engine. Zero data is transmitted externally.",
    cite_title: "Citation & Permanent Archive",
    cite_desc: "To cite this software and its algorithms in your Analytical Methods section, please refer to the permanent Zenodo DOI below:",
    about_p1: "<strong>IsoCalib</strong> is an open-source, browser-based data reduction and quality control platform developed for stable isotope geochemistry laboratories (GasBench II, Kiel IV, EA-IRMS, and CRDS).",
    about_p2: "Designed around zero-server client execution, all raw measurements remain strictly inside the analyst's local workstation memory while delivering peer-review-grade statistical diagnostics.",
    about_p3: "Developed and maintained at the IBS Center for Climate Physics, Pusan National University. Licensed under GNU GPL v3.0.",
    about_protocols_title: "Core Analytical Protocols:",
    changelog_title: "/ Version Evolution & Changelog",
    changelog_subtitle: "Continuous methodological and UX advancements tailored to real isotope lab requirements.",
    ctx_toggle_exclude: "Toggle Outlier Exclude (✓)",
    ctx_del_row: "Delete Selected Rows",
    ctx_clear_cells: "Clear Selected Cells",
    ctx_insert_row: "Insert 1 Blank Row Below"
  },

  ko: {
    nav_quickstart: "사용 매뉴얼 (SOP)",
    nav_methodology: "통계 방법론",
    nav_more: "더보기",
    nav_about: "<span>IsoCalib 소개</span><span class='font-mono text-[10px] text-stone-400'>About</span>",
    nav_changelog: "<span>업데이트 이력</span><span class='font-mono text-[10px] text-stone-400'>v1.5.0</span>",
    nav_citation: "<span>학술 인용 & DOI</span><span class='font-mono text-[10px] text-stone-400'>Cite</span>",
    nav_feedback_form: "<span class='flex items-center gap-1'><span>💬</span> 빠른 의견 보내기 (로그인 불필요)</span><span class='font-mono text-[10px] text-emerald-700 bg-emerald-100 px-1 py-0.2'>No Login</span>",
    nav_feedback_github: "<span>GitHub 이슈 등록</span><span class='font-mono text-[10px] text-stone-400'>GitHub</span>",
    hero_badge: "정밀 동위원소 데이터 리덕션 & QC 프로토콜",
    hero_title: "안정동위원소 스케일 검량 플랫폼",
    hero_desc: "시퀀스 시간 표류(Drift) 보정, EA-IRMS 피크 면적 선형성(Auto/Manual) 및 캡슐 블랭크 차감, 시료 무게(mg) 기반 %C/%N 및 Atomic C/N 정량화, 다중 앵커 WLS 회귀와 원시 정밀도(Raw SD) 실시간 경고를 수행합니다.",
    system_label: "동위원소 분석 체계 (Isotope System)",
    grp_carbonate: "탄산염 및 GasBench 분석 라인",
    grp_ea: "EA-IRMS (벌크 유기물 및 퇴적물)",
    grp_water: "물 동위원소 및 단일 원소 라인",
    sys_co: "1. 탄소 & 산소 (δ¹³C, δ¹⁸O - 탄산염/가스벤치)",
    sys_no: "2. 질소 & 산소 (δ¹⁵N, δ¹⁸O - 질산염/탈질법)",
    sys_ho: "3. 수소 & 산소 (δD, δ¹⁸O - 물/강수 듀얼)",
    sys_cn: "4. EA 벌크 유기물 C & N (δ¹³C, δ¹⁵N + %C/%N)",
    sys_ea_c: "5. EA 유기탄소 단독 (δ¹³C + %TOC - 산처리 퇴적물)",
    sys_ea_n: "6. EA 총질소 단독 (δ¹⁵N + %TN - 무처리 퇴적물)",
    sys_ch: "7. EA 유기물 C & H (δ¹³C, δD - 바이오마커/알케인)",
    sys_water_h: "8. 물 수소 동위원소 단독 (δD - Single)",
    sys_water_o: "9. 물 산소 동위원소 단독 (δ¹⁸O - Single)",
    sys_s: "10. 황 동위원소 (δ³⁴S - 황산염/황화광물)",
    sec1_title: "기준 표준물질(Anchors) 및 품질관리(QC) 표준 설정",
    btn_add_anchor: "<span>+ 앵커 추가 (3점 이상 다중 검량)</span>",
    o_scale_label: "δ¹⁸O 스케일:",
    area_mode_label: "면적 / 블랭크:",
    area_opt_off: "Off (기본 열 구조)",
    area_opt_lin: "크기 선형성 보정 (Area vs δ)",
    area_opt_blk: "블랭크 차감만 적용",
    area_opt_blk_lin: "블랭크 차감 + 크기 선형성 보정",
    slope_method_label: "기울기 산출:",
    slope_opt_auto: "자동 회귀 (Auto-Fit)",
    slope_opt_manual: "수동 계수 입력 (‰/Vs)",
    drift_anchor_label: "모니터 표준:",
    drift_label: "시간 표류:",
    drift_opt_none: "적용 안 함 (Off)",
    drift_opt_linear: "선형 드리프트 (단일 기울기)",
    drift_opt_piecewise: "앵커 브래케팅 (구간 보간)",
    preset_manage_label: "표준물질 프리셋:",
    preset_select_default: "-- 기본 프리셋 선택 --",
    btn_preset_load: "불러오기",
    btn_preset_delete: "삭제",
    btn_preset_save: "현재 설정 저장",
    drift_guide_desc: "* <strong>2점 및 3점 이상 다중 앵커 WLS 검량</strong>, <strong>피크 면적 선형성 정규화(Auto/Manual)</strong>, <strong>캡슐 블랭크('BLANK'/'BLK') 질량 보존 차감</strong>, <strong>무게(mg) 기반 %C/%N 및 Atomic C/N 계산</strong>을 지원합니다.",
    sec2_title: "시퀀스 측정 데이터 입력 및 이상치 제어",
    sec2_desc: "셀을 클릭한 뒤 엑셀에서 복사한 데이터를 <kbd class='px-1.5 py-0.5 bg-stone-200 border border-stone-300 rounded font-mono text-[10px] font-bold'>Ctrl + V</kbd>로 붙여넣으세요. 이상치 런은 좌측 <strong>Use (✓)</strong> 체크만 해제하면 시퀀스 번호(#)를 유지한 채 제외됩니다.",
    raw_sd_limit_label: "Raw SD 허용기준:",
    btn_delete_rows: "선택 행 삭제",
    btn_clear: "전체 초기화",
    btn_demo: "데모 데이터 로드",
    demo_guide_tag: "예제 시퀀스",
    btn_add_rows: "+ 30행 추가",
    btn_calc: "검량 및 QC 실행",
    grid_hint: "* 'Use (✓)' 체크 해제 시 시퀀스 시간 순서(#)를 망가뜨리지 않고 이상치만 계산에서 제외합니다",
    btn_export_svg: "학술용 SVG 저장",
    sec3_title: "보정 결과 및 품질관리(QC) 진단 보고서",
    btn_export_excel: "<span>엑셀 보고서 내보내기 (.xlsx)</span>",
    tab_sequence: "개별 시퀀스 런 결과",
    tab_grouped: "시료별 평균 요약 (Grouped)",
    result_empty: "상단에서 '검량 및 QC 실행'을 누르면 스케일 보정값, 합성 불확도(±1σ) 및 원소 함량(%)이 표시됩니다.",
    grouped_empty: "아직 그룹화된 반복 시료 평균 결과가 없습니다.",
    sec4_tag: "통계 방법론 및 측정학 표준 원칙",
    sec4_heading: "지화학 통계 모델 및 불확도 전파 가이드라인",
    sec4_subheading: "모든 검량 연산은 국제 측정 불확도 지침(JCGM 100:2008 GUM) 및 연대학 표준 회귀 프로토콜(York-Ludwig WLS)을 엄격히 따릅니다.",
    card1_title: "1. 가중 최소자승 회귀 (WLS)",
    card1_desc: "반복 정밀도가 높은(1σ SD가 작은) 측정값에 더 큰 통계적 가중치($w_i = 1/\\sigma_i^2$)를 부여하여 2개 이상의 앵커 표준물질에 대한 최적 회귀선을 산출합니다.",
    card1_quote: "오차가 2배 큰 런은 검량선 기울기에 1/4 수준의 영향력만 행사하여 노이즈 왜곡을 억제합니다.",
    card1_basis: "근거 문헌: York (1968) / Ludwig (2003)",
    card2_title: "2. 적합도 지수 (MSWD)",
    card2_desc: "축약 카이제곱($\\chi^2/\\nu$)을 산출하여 회귀선 잔차가 순수 분석 오차 범위 내에 있는지 객관적으로 검증합니다.",
    card2_quote: "MSWD가 1에 가까우면 이상적이며, 2.5를 초과하면 보정되지 않은 기기 표류나 표준물질 오염을 시사합니다.",
    card2_basis: "근거 문헌: McIntyre et al. (1966) / IsoplotR",
    card3_title: "3. 합성 표준 불확도 전파",
    card3_desc: "개별 시료의 내부 반복 정밀도와 검량선 기울기·절편의 표준오차를 1차 가우스 오차 전파식으로 통합합니다.",
    card3_quote: "국제 학술지 심사 기준을 충족하는 완전한 불확도 예산(Uncertainty Budget)을 제공합니다.",
    card3_basis: "근거 문헌: JCGM 100:2008 (GUM Guide)",
    acc_title: "[+] 상세 수학적 유도식 및 전처리 방정식 보기 (클릭하여 펼치기)",
    acc_a_title: "A. 가중 최소자승법(WLS) 정규 방정식",
    acc_a_desc: "가중 잔차 제곱합 $\\sum w_i (y_i - ax_i - b)^2$을 최소화하는 해석적 해:",
    acc_b_title: "B. EA-IRMS 블랭크 질량 보존, 크기 선형성 및 원소 함량(%C, %N) 정량식",
    acc_b_desc: "WLS 스케일 교정 전 수행되는 캡슐 블랭크 차감·피크 면적 정규화 및 응답 계수($RF$) 기반 원소 질량 산출식:",
    acc_c_title: "C. 1차 가우스 오차 전파 방정식 (GUM 5.1.2)",
    acc_c_desc: "선형 검량 함수 $y_{\\text{cal}} = a \\cdot x_{\\text{raw}} + b$에 대한 편미분 불확도 전파:",
    privacy_title: "제로-서버(Zero-Server) 로컬 브라우저 연산 보안",
    privacy_desc: "모든 데이터 처리와 그래프 생성은 사용자 PC의 브라우저 메모리 내에서 100% 로컬로 실행되며 외부 서버로 어떠한 분석 데이터도 전송되지 않습니다.",
    cite_title: "학술 논문 인용 및 영구 아카이브 (Citation & DOI)",
    cite_desc: "연구 논문의 분석 방법(Analytical Methods) 섹션에 본 소프트웨어를 인용할 때는 아래의 영구 Zenodo DOI를 사용해 주세요:",
    about_p1: "<strong>IsoCalib</strong>은 안정동위원소 지화학 실험실(GasBench II, Kiel IV, EA-IRMS, CRDS)을 위해 설계된 오픈소스 브라우저 기반 데이터 리덕션 및 품질관리 플랫폼입니다.",
    about_p2: "서버 전송 없는 100% 클라이언트 로컬 연산 구조를 채택하여 미공개 연구 데이터의 보안을 완벽히 보장하면서 국제 학술지 투고 수준의 통계 진단 지표를 제공합니다.",
    about_p3: "부산대학교 IBS 기후물리연구단(ICCP)에서 개발 및 유지보수하며 GNU GPL v3.0 라이선스를 따릅니다.",
    about_protocols_title: "핵심 지원 프로토콜:",
    changelog_title: "/ 버전 업데이트 이력 (Changelog)",
    changelog_subtitle: "실제 동위원소 분석실의 요구사항을 반영하여 지속적으로 고도화되고 있습니다.",
    ctx_toggle_exclude: "이상치 제외 토글 (✓)",
    ctx_del_row: "선택한 행 삭제",
    ctx_clear_cells: "선택한 셀 값 지우기",
    ctx_insert_row: "아래에 빈 행 1개 추가"
  }
};
