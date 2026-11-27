/**
 * js/exporters.js
 * Exports 100 % côté client :
 * - Excel KBOB 2027 (.xlsx) à 2 onglets :
 *     1) "Donnée configurée PAC" (paramètres + 4 KBOB + carbone biogénique + 19 EF 3.1)
 *     2) "Indicateurs KBOB 2027" (format officiel colonnes A à CA en français pour review KBOB)
 * - Fiche HTML & PDF (gabarit strictement identique)
 * - CSV
 */
import { formaterValeur } from "./kbob_engine.js";
import {
  DEFAULT_LANG,
  buildConfiguredTitle,
  getPack,
  localizeFluidOption,
  localizeFluidRef,
  localizeIndicator,
  localizeTech,
  localizeUnite,
  t,
} from "./i18n.js";

const SCREENING_IDS = ["ubp", "ges", "nre"];

function safeFilename(name, fallback = "Pompe_a_chaleur") {
  return (name || fallback)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 90) || fallback;
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getLocalizedContext(res, lang = DEFAULT_LANG) {
  const pack = getPack(lang);
  const nowStr = new Date().toLocaleString(pack.locale);
  const configTitleFull = buildConfiguredTitle(res, lang, true);
  const configTitleShort = buildConfiguredTitle(res, lang, false);
  const techLoc = localizeTech(res.technologie, lang);
  const fluidRefLoc = localizeFluidRef(res.fluideReference, lang);
  const optLoc = localizeFluidOption(
    {
      id: res.fluideOptionId,
      label: res.fluideSelectionne,
    },
    lang
  );
  const unitFullLoc = localizeUnite(res.uniteReference, lang, "full");
  const massVal = res.massInfo.masseUtiliseeKg.toFixed(1);
  const massDesc = res.massInfo.masseConnue
    ? t(lang, "massManualDesc", { val: massVal })
    : t(lang, "massEstDesc", { val: massVal });

  const indicators = res.indicators.map((i) => localizeIndicator(i, lang));
  const principaux = indicators.filter((i) => i.groupe === "principal" || i.afficher_par_defaut);
  const indMain = principaux.length ? principaux : indicators.slice(0, 4);
  const extras = indicators.filter((i) => !indMain.includes(i));
  const screening = SCREENING_IDS
    .map((id) => indMain.find((i) => i.id === id))
    .filter(Boolean);

  return {
    lang,
    nowStr,
    configTitleFull,
    configTitleShort,
    techLoc,
    fluidRefLoc,
    fluidLabelLoc: optLoc.label,
    unitFullLoc,
    massDesc,
    indicators,
    indMain,
    extras,
    screening: screening.length ? screening : indMain.slice(0, 3),
  };
}

/**
 * Gabarit HTML unique utilisé à la fois pour l'export HTML et pour l'export PDF.
 */
function buildReportHtml(res, { lang = DEFAULT_LANG, showKbob = true, showEf31 = false } = {}) {
  const ctx = getLocalizedContext(res, lang);
  const includeKbob = showKbob || !showEf31;
  const includeEf31 = showEf31 && ctx.extras.length > 0;

  const fabLabel = t(lang, "phaseFab");
  const elimLabel = t(lang, "phaseElim");

  const kpiCards = ctx.screening
    .map(
      (ind) => `
    <div class="kpi-card">
      <div class="kpi-label">${escapeHtml(ind.nom_court)}</div>
      <div class="kpi-val">${formaterValeur(res.values[ind.id].total, ind)}</div>
      <div class="kpi-unit">${escapeHtml(ind.unite + res.suffixeUnite)}</div>
    </div>`
    )
    .join("");

  const buildTable = (title, list) => {
    if (!list.length) return "";
    const rows = list
      .map((ind) => {
        const v = res.values[ind.id];
        return `
        <tr>
          <td><strong>${escapeHtml(ind.nom)}</strong></td>
          <td class="unit">${escapeHtml(ind.unite + res.suffixeUnite)}</td>
          <td class="num total">${formaterValeur(v.total, ind)}</td>
          <td class="num">${formaterValeur(v.fabrication, ind)}</td>
          <td class="num">${formaterValeur(v.elimination, ind)}</td>
        </tr>`;
      })
      .join("");

    return `
      <section class="table-section">
        <h2>${escapeHtml(title)}</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>${escapeHtml(t(lang, "colIndicator"))}</th>
              <th>${escapeHtml(t(lang, "colUnit"))}</th>
              <th class="num">${escapeHtml(t(lang, "colTotal"))}</th>
              <th class="num">${escapeHtml(fabLabel)}</th>
              <th class="num">${escapeHtml(elimLabel)}</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </section>`;
  };

  let tablesHtml = "";
  let sectionIdx = 1;
  if (includeKbob) {
    tablesHtml += buildTable(`${sectionIdx++}. ${t(lang, "groupKbob")}`, ctx.indMain);
  }
  if (includeEf31) {
    tablesHtml += buildTable(`${sectionIdx++}. ${t(lang, "checkEf31")}`, ctx.extras);
  }

  return `<!DOCTYPE html>
<html lang="${escapeHtml(lang)}">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(t(lang, "headerTitle"))} — ${escapeHtml(ctx.configTitleShort)}</title>
  <style>
    @page {
      size: A4;
      margin: 14mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      color: #1f2933;
      background: #ffffff;
      margin: 0;
      padding: 28px;
      line-height: 1.45;
    }
    @media print {
      body { padding: 0; }
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
    }
    .header {
      border: 2px solid #2c7a6b;
      border-left: 6px solid #2c7a6b;
      border-radius: 6px;
      padding: 13px 18px;
      margin-bottom: 20px;
    }
    .header-context {
      font-size: 0.76rem;
      color: #52606d;
      font-weight: 600;
      margin-bottom: 6px;
      padding-bottom: 6px;
      border-bottom: 1px solid #d8e0e5;
      display: flex;
      justify-content: space-between;
      gap: 10px;
    }
    .header h1 {
      margin: 0;
      font-size: 1.36rem;
      color: #1f2933;
    }
    .header .sub {
      color: #215e52;
      font-size: 0.86rem;
      font-weight: 600;
      margin-top: 3px;
    }
    h2 {
      font-size: 1.02rem;
      color: #1f2933;
      border-bottom: 1px solid #d8e0e5;
      padding-bottom: 5px;
      margin: 22px 0 10px;
    }
    .meta-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 18px;
      font-size: 0.88rem;
    }
    .meta-table th,
    .meta-table td {
      padding: 7px 11px;
      border: 1px solid #d8e0e5;
      text-align: left;
    }
    .meta-table th {
      background: #f8fafb;
      width: 32%;
      color: #3e4c59;
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 12px;
      margin: 18px 0;
    }
    .kpi-card {
      background: #f8fafb;
      border: 1px solid #d8e0e5;
      border-top: 3px solid #2c7a6b;
      border-radius: 4px;
      padding: 11px 12px;
    }
    .kpi-label {
      font-size: 0.76rem;
      color: #3e4c59;
      font-weight: 700;
    }
    .kpi-val {
      font-size: 1.3rem;
      font-weight: 700;
      color: #1f2933;
      font-variant-numeric: tabular-nums;
      margin: 4px 0 2px;
    }
    .kpi-unit {
      font-size: 0.76rem;
      color: #7b8794;
    }
    .table-section {
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.84rem;
    }
    .data-table th,
    .data-table td {
      padding: 7px 10px;
      border-bottom: 1px solid #d8e0e5;
    }
    .data-table thead th {
      background: #f8fafb;
      color: #3e4c59;
      text-align: left;
      border-top: 1px solid #d8e0e5;
      border-bottom: 2px solid #bcccdc;
    }
    .num {
      text-align: right;
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }
    .unit {
      color: #7b8794;
      white-space: nowrap;
    }
    .total {
      font-weight: 700;
      background: #f9fbfc;
    }
    .footnote {
      margin-top: 16px;
      font-size: 0.78rem;
      color: #52606d;
    }
    .footer {
      margin-top: 20px;
      padding-top: 10px;
      border-top: 2px solid #2c7a6b;
      font-size: 0.76rem;
      color: #52606d;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="header-context">
        <span>${escapeHtml(t(lang, "headerKicker"))}</span>
        <span>${escapeHtml(t(lang, "reportGenerated", { date: ctx.nowStr }))}</span>
      </div>
      <h1>${escapeHtml(t(lang, "headerTitle"))}</h1>
      <div class="sub">${escapeHtml(t(lang, "headerSubtitle"))}</div>
    </div>

    <table class="meta-table">
      <tr><th>${escapeHtml(t(lang, "metaConfig"))}</th><td><strong>${escapeHtml(ctx.configTitleFull)}</strong></td></tr>
      <tr><th>${escapeHtml(t(lang, "metaDb"))}</th><td>${escapeHtml(t(lang, "dbLabel"))}</td></tr>
      <tr><th>${escapeHtml(t(lang, "metaScope"))}</th><td>${escapeHtml(t(lang, "metaScopeValue"))}</td></tr>
      <tr><th>${escapeHtml(t(lang, "metaTechPower"))}</th><td>${escapeHtml(t(lang, "hpFullName"))} ${escapeHtml(ctx.techLoc)} — <strong>${res.puissanceKw} kW</strong></td></tr>
      <tr><th>${escapeHtml(t(lang, "metaFluid"))}</th><td><strong>${escapeHtml(ctx.fluidLabelLoc)}</strong> (${escapeHtml(ctx.fluidRefLoc)})</td></tr>
      <tr><th>${escapeHtml(t(lang, "metaMass"))}</th><td>${escapeHtml(ctx.massDesc)}</td></tr>
      <tr><th>${escapeHtml(t(lang, "metaUnit"))}</th><td><strong>${escapeHtml(ctx.unitFullLoc)}</strong></td></tr>
    </table>

    <div class="kpi-grid">${kpiCards}</div>

    ${tablesHtml}

    <div class="footnote">${escapeHtml(t(lang, "footnoteText"))}</div>

    <div class="footer">${t(lang, "footerHtml")}</div>
  </div>
</body>
</html>`;
}

export function exportHtml(res, options = {}) {
  const lang = options.lang || DEFAULT_LANG;
  const titleShort = buildConfiguredTitle(res, lang, false);
  const doc = buildReportHtml(res, options);
  const blob = new Blob([doc], { type: "text/html;charset=utf-8;" });
  triggerDownload(blob, `${t(lang, "filePrefixHtml")}${safeFilename(titleShort)}.html`);
}

export function exportPdf(res, options = {}) {
  const docHtml = buildReportHtml(res, options);

  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.setAttribute("aria-hidden", "true");
  document.body.appendChild(iframe);

  const win = iframe.contentWindow;
  const doc = iframe.contentDocument || win.document;

  const cleanup = () => {
    setTimeout(() => {
      if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
    }, 800);
  };

  doc.open();
  doc.write(docHtml);
  doc.close();

  const triggerPrint = () => {
    win.addEventListener("afterprint", cleanup, { once: true });
    win.focus();
    win.print();
    setTimeout(cleanup, 60000);
  };

  setTimeout(triggerPrint, 120);
}

/**
 * Construit l'onglet 2 "Indicateurs KBOB 2027" (colonnes A à CA, format officiel KBOB 2027 en français).
 */
function buildKbob2027Sheet(res) {
  const emptyRow = () => Array(79).fill("");

  const r1 = emptyRow();
  r1[1] = "Données des écobilans dans la construction";
  r1[16] = "KBOB / ecobau / IPB 2009/1:2027 — Prototype FOR KBOB-REVIEW";

  const r2 = emptyRow();

  const triplets = [
    { code: "UBP", r4: "UBP'21", r5: "", unit: "UBP", get: () => res.values.ubp },
    {
      code: "PEF-ges",
      r4: "Énergie primaire",
      r5: "total",
      unit: "kWh oil-eq",
      get: () => ({
        total: (res.values.re?.total || 0) + (res.values.nre?.total || 0),
        fabrication: (res.values.re?.fabrication || 0) + (res.values.nre?.fabrication || 0),
        elimination: (res.values.re?.elimination || 0) + (res.values.nre?.elimination || 0),
      }),
    },
    { code: "PEF-e", r4: "", r5: "renouvelable", unit: "kWh oil-eq", get: () => res.values.re },
    { code: "PEF-ne", r4: "", r5: "non renouvelable (énergie grise)", unit: "kWh oil-eq", get: () => res.values.nre },
    { code: "GWP-ges", r4: "Émissions de gaz à effet de serre", r5: "Total", unit: "kg CO2-eq", get: () => res.values.ef_cc_total },
    { code: "GWP-f", r4: "", r5: "fossile", unit: "kg CO2-eq", get: () => res.values.ges },
    { code: "GWP-b", r4: "", r5: "biogénique", unit: "kg CO2-eq", get: () => res.values.ef_cc_biogene },
    { code: "GWP-L", r4: "", r5: "affectation des sols (LULUC)", unit: "kg CO2-eq", get: () => res.values.ef_cc_luluc },
    { code: "ODP", r4: "Appauvrissement de la couche d'ozone", r5: "", unit: "kg CFC11-eq", get: () => res.values.ef_ozone_depletion },
    { code: "AP", r4: "Acidification", r5: "", unit: "mol H+-eq", get: () => res.values.ef_acidification },
    { code: "EP-fw", r4: "Eutrophisation", r5: "Eau douce", unit: "kg P-eq", get: () => res.values.ef_eutro_eau_douce },
    { code: "EP-m", r4: "", r5: "Marine", unit: "kg N-eq", get: () => res.values.ef_eutro_marine },
    { code: "EP-t", r4: "", r5: "Terrestre", unit: "mol N-eq", get: () => res.values.ef_eutro_terrestre },
    { code: "POCP", r4: "Formation d'ozone photochimique", r5: "", unit: "kg NMVOC-eq", get: () => res.values.ef_ozone_photo },
    { code: "ADP-e", r4: "Épuisement des ressources abiotiques", r5: "Minéraux et métaux", unit: "kg Sb-eq", get: () => res.values.ef_ressources_min },
    { code: "ADP-f", r4: "", r5: "Ressources fossiles", unit: "MJ", get: () => res.values.ef_ressources_fos },
    { code: "WDP", r4: "Utilisation de l'eau", r5: "", unit: "m3 world-eq", get: () => res.values.ef_utilisation_eau },
    { code: "PM", r4: "Particules fines", r5: "", unit: "disease inc.", get: () => res.values.ef_particules },
    { code: "IRP", r4: "Rayonnements ionisants", r5: "", unit: "kBq U235-eq", get: () => res.values.ef_rayonnements },
    { code: "ETPw", r4: "Écotoxicité, eau douce", r5: "", unit: "CTUe", get: () => res.values.ef_ecotox_eau_douce },
    { code: "HTP-c", r4: "Toxicité humaine", r5: "Effets cancérigènes", unit: "CTUh", get: () => res.values.ef_tox_cancer },
    { code: "HTP-nc", r4: "", r5: "Effets non cancérigènes", unit: "CTUh", get: () => res.values.ef_tox_non_cancer },
    { code: "SQP", r4: "Utilisation des sols", r5: "", unit: "Pt", get: () => res.values.ef_utilisation_sols },
  ];

  const r3 = emptyRow();
  const r4 = emptyRow();
  const r5 = emptyRow();
  const r6 = emptyRow();
  const r7 = emptyRow();
  const r8 = emptyRow();
  const r9 = emptyRow();

  r4[0] = "N° ID";
  r4[1] = "TECHNIQUE DU BÂTIMENT";
  r4[2] = "UUID BAFU 2026 OpenLCA, Fabrication";
  r4[3] = "Jeu de données BAFU:2026, Fabrication";
  r4[4] = "N° ID Élimination";
  r4[5] = "Élimination";
  r4[6] = "UUID BAFU 2026 OpenLCA, Élimination";
  r4[7] = "Jeu de données BAFU:2026, Élimination";
  r4[8] = "Référence";
  r9[8] = "Grandeur";
  r9[9] = "Unité";

  const r10 = emptyRow();
  r10[0] = "31";
  r10[1] = "Installations de chauffage";

  const r11 = emptyRow();
  const frUnitMap = {
    appareil: { grandeur: "Appareil", unite: "pce" },
    kw: { grandeur: "Puissance", unite: "kW" },
    kg: { grandeur: "Masse", unite: "kg" },
  };
  const refUnit = frUnitMap[res.uniteReference] || frUnitMap.appareil;
  const frTitleShort = buildConfiguredTitle(res, "fr", false);

  r11[0] = "Calculateur KBOB PAC";
  r11[1] = frTitleShort;
  r11[3] = `BAFU:2026v1 — ${res.fluideReference}`;
  r11[5] = `Élimination, ${frTitleShort}`;
  r11[7] = `BAFU:2026v1 — ${res.fluideReference}`;
  r11[8] = refUnit.grandeur;
  r11[9] = refUnit.unite;

  triplets.forEach((tr, idx) => {
    const c = 10 + idx * 3;
    r3[c + 1] = tr.code;
    r3[c + 2] = tr.code;
    if (tr.r4) r4[c] = tr.r4;
    if (tr.r5) r5[c] = tr.r5;

    r7[c] = "Total";
    r7[c + 1] = "Fabrication¹";
    r7[c + 2] = "Élimination";

    const u = `${tr.unit}${res.suffixeUnite}`;
    r9[c] = u;
    r9[c + 1] = u;
    r9[c + 2] = u;

    const val = tr.get() || { total: 0, fabrication: 0, elimination: 0 };
    r11[c] = Number(val.total || 0);
    r11[c + 1] = Number(val.fabrication || 0);
    r11[c + 2] = Number(val.elimination || 0);
  });

  const r12 = emptyRow();
  const r13 = emptyRow();
  r13[0] = t("fr", "footnoteText");

  const aoa = [r1, r2, r3, r4, r5, r6, r7, r8, r9, r10, r11, r12, r13];
  const ws = window.XLSX.utils.aoa_to_sheet(aoa);

  ws["!merges"] = [
    { s: { r: 3, c: 8 }, e: { r: 5, c: 9 } },
    { s: { r: 3, c: 10 }, e: { r: 3, c: 12 } },
    { s: { r: 3, c: 13 }, e: { r: 3, c: 21 } },
    { s: { r: 3, c: 22 }, e: { r: 3, c: 33 } },
    { s: { r: 3, c: 34 }, e: { r: 3, c: 36 } },
    { s: { r: 3, c: 37 }, e: { r: 3, c: 39 } },
    { s: { r: 3, c: 40 }, e: { r: 3, c: 48 } },
    { s: { r: 3, c: 49 }, e: { r: 3, c: 51 } },
    { s: { r: 3, c: 52 }, e: { r: 3, c: 57 } },
    { s: { r: 3, c: 58 }, e: { r: 3, c: 60 } },
    { s: { r: 3, c: 61 }, e: { r: 3, c: 63 } },
    { s: { r: 3, c: 64 }, e: { r: 3, c: 66 } },
    { s: { r: 3, c: 67 }, e: { r: 3, c: 69 } },
    { s: { r: 3, c: 70 }, e: { r: 3, c: 75 } },
    { s: { r: 3, c: 76 }, e: { r: 3, c: 78 } },

    { s: { r: 4, c: 13 }, e: { r: 4, c: 15 } },
    { s: { r: 4, c: 16 }, e: { r: 4, c: 18 } },
    { s: { r: 4, c: 19 }, e: { r: 4, c: 21 } },
    { s: { r: 4, c: 22 }, e: { r: 4, c: 24 } },
    { s: { r: 4, c: 25 }, e: { r: 4, c: 27 } },
    { s: { r: 4, c: 28 }, e: { r: 4, c: 30 } },
    { s: { r: 4, c: 31 }, e: { r: 4, c: 33 } },
    { s: { r: 4, c: 40 }, e: { r: 4, c: 42 } },
    { s: { r: 4, c: 43 }, e: { r: 4, c: 45 } },
    { s: { r: 4, c: 46 }, e: { r: 4, c: 48 } },
    { s: { r: 4, c: 52 }, e: { r: 4, c: 54 } },
    { s: { r: 4, c: 55 }, e: { r: 4, c: 57 } },
    { s: { r: 4, c: 70 }, e: { r: 4, c: 72 } },
    { s: { r: 4, c: 73 }, e: { r: 4, c: 75 } },
  ];

  const cols = [
    { wch: 22 },
    { wch: 52 },
    { wch: 16 },
    { wch: 28 },
    { wch: 14 },
    { wch: 46 },
    { wch: 16 },
    { wch: 28 },
    { wch: 12 },
    { wch: 10 },
  ];
  for (let i = 10; i < 79; i++) {
    cols.push({ wch: 15 });
  }
  ws["!cols"] = cols;

  return ws;
}

export function exportExcelKbob2027(res, lang = DEFAULT_LANG) {
  if (typeof window.XLSX === "undefined") {
    alert(t(lang, "errNoXlsx"));
    return;
  }

  const ctx = getLocalizedContext(res, lang);
  const wb = window.XLSX.utils.book_new();
  const headers = [
    t(lang, "colIndicator"),
    t(lang, "colUnit"),
    t(lang, "colTotal"),
    t(lang, "phaseFab"),
    t(lang, "phaseElim"),
  ];

  const aoa1 = [
    [t(lang, "excelHeaderTitle")],
    [t(lang, "excelHeaderSub", { date: ctx.nowStr })],
    [],
    [t(lang, "excelSecParams")],
    [t(lang, "metaConfig"), ctx.configTitleFull],
    [t(lang, "metaDb"), t(lang, "dbLabel")],
    [t(lang, "metaScope"), t(lang, "metaScopeValue")],
    [t(lang, "metaTechPower"), `${t(lang, "hpFullName")} ${ctx.techLoc} — ${res.puissanceKw} kW`],
    [t(lang, "metaFluid"), ctx.fluidLabelLoc],
    [t(lang, "metaFluidRef"), ctx.fluidRefLoc],
    [t(lang, "metaMass"), ctx.massDesc],
    [t(lang, "metaUnit"), ctx.unitFullLoc],
    [],
    [t(lang, "excelSecAll")],
    headers,
  ];

  for (const ind of ctx.indMain) {
    const v = res.values[ind.id];
    aoa1.push([
      ind.nom,
      `${ind.unite}${res.suffixeUnite}`,
      Number(v.total),
      Number(v.fabrication),
      Number(v.elimination),
    ]);
  }

  aoa1.push([t(lang, "excelBioCarbon"), `kg C${res.suffixeUnite}`, 0, 0, 0]);

  for (const ind of ctx.extras) {
    const v = res.values[ind.id];
    aoa1.push([
      ind.nom,
      `${ind.unite}${res.suffixeUnite}`,
      Number(v.total),
      Number(v.fabrication),
      Number(v.elimination),
    ]);
  }

  aoa1.push([]);
  aoa1.push([t(lang, "footnoteText")]);
  aoa1.push([t(lang, "footerPlain")]);

  const ws1 = window.XLSX.utils.aoa_to_sheet(aoa1);
  ws1["!cols"] = [
    { wch: 52 },
    { wch: 18 },
    { wch: 18 },
    { wch: 20 },
    { wch: 18 },
  ];
  window.XLSX.utils.book_append_sheet(wb, ws1, "Donnée configurée PAC");

  const ws2 = buildKbob2027Sheet(res);
  window.XLSX.utils.book_append_sheet(wb, ws2, "Indicateurs KBOB 2027");

  window.XLSX.writeFile(wb, `${t(lang, "filePrefixXlsx")}${safeFilename(ctx.configTitleShort)}.xlsx`);
}

export function exportCsv(res, lang = DEFAULT_LANG) {
  const ctx = getLocalizedContext(res, lang);
  const lines = [
    [t(lang, "csvHeaderComment")],
    [t(lang, "metaConfig"), ctx.configTitleFull],
    [t(lang, "metaDb"), t(lang, "dbLabel")],
    [t(lang, "metaScope"), t(lang, "metaScopeValue")],
    [t(lang, "labelTech"), ctx.techLoc],
    [t(lang, "csvPowerLabel"), res.puissanceKw],
    [t(lang, "metaFluid"), ctx.fluidLabelLoc],
    [t(lang, "metaFluidRef"), ctx.fluidRefLoc],
    [t(lang, "metaMass"), ctx.massDesc],
    [t(lang, "metaUnit"), ctx.unitFullLoc],
    [],
    [
      t(lang, "colIndicator"),
      t(lang, "colGroup"),
      t(lang, "colUnit"),
      t(lang, "colTotal"),
      t(lang, "phaseFab"),
      t(lang, "phaseElim"),
    ],
  ];

  for (const ind of ctx.indicators) {
    const v = res.values[ind.id];
    lines.push([
      ind.nom,
      ind.groupe,
      `${ind.unite}${res.suffixeUnite}`,
      v.total,
      v.fabrication,
      v.elimination,
    ]);
  }

  lines.push([]);
  lines.push([t(lang, "footnoteText")]);

  const csvContent =
    "\uFEFF" +
    lines
      .map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(";"))
      .join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  triggerDownload(blob, `${t(lang, "filePrefixCsv")}${safeFilename(ctx.configTitleShort)}.csv`);
}