/**
 * js/exporters.js
 * Exports multilingues (FR / DE / IT / EN) 100 % côté client :
 * Excel (.xlsx), CSV, Fiche HTML et PDF (gabarit identique au HTML).
 */
import { formaterValeur } from "./kbob_engine.js";
import {
  DEFAULT_LANG,
  getPack,
  localizeFluidOption,
  localizeFluidRef,
  localizeIndicator,
  localizeTech,
  localizeUnite,
  t,
} from "./i18n.js";

function safeFilename(name, fallback = "Projet_PAC") {
  return (name || fallback)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "") || fallback;
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

function getLocalizedContext(res, projetNom, lang = DEFAULT_LANG) {
  const pack = getPack(lang);
  const nowStr = new Date().toLocaleString(pack.locale);
  const projectDisplay = (projetNom || "").trim() || t(lang, "defaultProjectName");
  const techLoc = localizeTech(res.technologie, lang);
  const fluidRefLoc = localizeFluidRef(res.fluideReference, lang);
  const optLoc = localizeFluidOption(
    {
      id: res.fluideOptionId,
      label: res.fluideSelectionne,
      note_methodologique: res.noteFluide,
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

  return {
    lang,
    nowStr,
    projectDisplay,
    techLoc,
    fluidRefLoc,
    fluidLabelLoc: optLoc.label,
    fluidNoteLoc: optLoc.note_methodologique,
    unitFullLoc,
    massDesc,
    indicators,
    indMain,
    extras,
  };
}

/**
 * Gabarit HTML unique utilisé à la fois pour l'export HTML et pour l'export PDF.
 */
function buildReportHtml(res, projetNom, { lang = DEFAULT_LANG, showKbob = true, showEf31 = false } = {}) {
  const ctx = getLocalizedContext(res, projetNom, lang);
  const includeKbob = showKbob || !showEf31;
  const includeEf31 = showEf31 && ctx.extras.length > 0;

  const fabLabel = t(lang, "phaseFab");
  const elimLabel = t(lang, "phaseElim");

  const kpiCards = ctx.indMain
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
  <title>${escapeHtml(t(lang, "headerTitle"))} — ${escapeHtml(ctx.projectDisplay)}</title>
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
      border: 2px solid #007a53;
      border-left: 6px solid #007a53;
      border-radius: 6px;
      padding: 14px 18px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 12px;
    }
    .header h1 {
      margin: 0;
      font-size: 1.38rem;
      color: #1f2933;
    }
    .header .sub {
      color: #005f40;
      font-size: 0.88rem;
      font-weight: 600;
      margin-top: 3px;
    }
    .badge {
      font-size: 0.78rem;
      color: #52606d;
      white-space: nowrap;
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
      width: 30%;
      color: #3e4c59;
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 10px;
      margin: 18px 0;
    }
    .kpi-card {
      background: #f8fafb;
      border: 1px solid #d8e0e5;
      border-top: 3px solid #007a53;
      border-radius: 4px;
      padding: 10px 11px;
    }
    .kpi-label {
      font-size: 0.74rem;
      text-transform: uppercase;
      color: #52606d;
      font-weight: 700;
    }
    .kpi-val {
      font-size: 1.28rem;
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
      margin-top: 22px;
      padding-top: 10px;
      border-top: 2px solid #007a53;
      font-size: 0.76rem;
      color: #52606d;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div>
        <h1>${escapeHtml(t(lang, "headerTitle"))}</h1>
        <div class="sub">${escapeHtml(t(lang, "headerSubtitle"))}</div>
      </div>
      <div class="badge">${escapeHtml(t(lang, "reportGenerated", { date: ctx.nowStr }))}</div>
    </div>

    <table class="meta-table">
      <tr><th>${escapeHtml(t(lang, "metaProject"))}</th><td><strong>${escapeHtml(ctx.projectDisplay)}</strong></td></tr>
      <tr><th>${escapeHtml(t(lang, "metaDb"))}</th><td>${escapeHtml(t(lang, "dbLabel"))}</td></tr>
      <tr><th>${escapeHtml(t(lang, "metaScope"))}</th><td>${escapeHtml(t(lang, "metaScopeValue"))}</td></tr>
      <tr><th>${escapeHtml(t(lang, "metaTechPower"))}</th><td>${escapeHtml(t(lang, "hpPrefix"))} ${escapeHtml(ctx.techLoc)} — <strong>${res.puissanceKw} kW</strong></td></tr>
      <tr><th>${escapeHtml(t(lang, "metaFluid"))}</th><td><strong>${escapeHtml(ctx.fluidLabelLoc)}</strong><br><small style="color:#52606d;">${escapeHtml(t(lang, "fluidNotePrefix"))} ${escapeHtml(ctx.fluidRefLoc)} — ${escapeHtml(ctx.fluidNoteLoc)}</small></td></tr>
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

export function exportHtml(res, projetNom, options = {}) {
  const lang = options.lang || DEFAULT_LANG;
  const doc = buildReportHtml(res, projetNom, options);
  const blob = new Blob([doc], { type: "text/html;charset=utf-8;" });
  triggerDownload(blob, `${t(lang, "filePrefixHtml")}${safeFilename(projetNom)}.html`);
}

export function exportPdf(res, projetNom, options = {}) {
  const docHtml = buildReportHtml(res, projetNom, options);

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

export function exportExcelKbob2027(res, projetNom, lang = DEFAULT_LANG) {
  if (typeof window.XLSX === "undefined") {
    alert(t(lang, "errNoXlsx"));
    return;
  }

  const ctx = getLocalizedContext(res, projetNom, lang);
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
    [t(lang, "metaProject"), ctx.projectDisplay],
    [t(lang, "metaDb"), t(lang, "dbLabel")],
    [t(lang, "metaScope"), t(lang, "metaScopeValue")],
    [t(lang, "metaTechPower"), `${t(lang, "hpPrefix")} ${ctx.techLoc} — ${res.puissanceKw} kW`],
    [t(lang, "metaFluid"), ctx.fluidLabelLoc],
    [t(lang, "metaFluidRef"), `${ctx.fluidRefLoc} (${ctx.fluidNoteLoc})`],
    [t(lang, "metaMass"), ctx.massDesc],
    [t(lang, "metaUnit"), ctx.unitFullLoc],
    [],
    [t(lang, "excelSecKbob")],
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
  window.XLSX.utils.book_append_sheet(wb, ws1, t(lang, "excelSheetKbob"));

  if (ctx.extras.length > 0) {
    const aoa2 = [
      [
        t(lang, "excelEfTitle", {
          tech: ctx.techLoc,
          power: res.puissanceKw,
          fluid: ctx.fluidLabelLoc,
        }),
      ],
      [],
      headers,
    ];
    for (const ind of ctx.extras) {
      const v = res.values[ind.id];
      aoa2.push([
        ind.nom,
        `${ind.unite}${res.suffixeUnite}`,
        Number(v.total),
        Number(v.fabrication),
        Number(v.elimination),
      ]);
    }
    aoa2.push([]);
    aoa2.push([t(lang, "footnoteText")]);

    const ws2 = window.XLSX.utils.aoa_to_sheet(aoa2);
    ws2["!cols"] = ws1["!cols"];
    window.XLSX.utils.book_append_sheet(wb, ws2, t(lang, "excelSheetEf31"));
  }

  window.XLSX.writeFile(wb, `${t(lang, "filePrefixXlsx")}${safeFilename(projetNom)}.xlsx`);
}

export function exportCsv(res, projetNom, lang = DEFAULT_LANG) {
  const ctx = getLocalizedContext(res, projetNom, lang);
  const lines = [
    [t(lang, "csvHeaderComment")],
    [t(lang, "metaProject"), ctx.projectDisplay],
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
  triggerDownload(blob, `${t(lang, "filePrefixCsv")}${safeFilename(projetNom)}.csv`);
}