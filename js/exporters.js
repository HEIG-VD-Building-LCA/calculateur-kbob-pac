/**
 * js/exporters.js
 * Exports 100 % côté client : Excel KBOB 2027 (.xlsx), Fiche HTML et CSV.
 */
import { SCOPE_SIA_KBOB, formaterValeur } from "./kbob_engine.js";

function safeFilename(name) {
  return (name || "Projet_PAC")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "") || "Projet_PAC";
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

export function exportExcelKbob2027(res, projetNom) {
  if (typeof window.XLSX === "undefined") {
    alert("La bibliothèque Excel (SheetJS) n'est pas chargée.");
    return;
  }

  const wb = window.XLSX.utils.book_new();
  const showB1 = res.phasesActives.includes("fuites_usage");
  const fabHeader = res.scope === SCOPE_SIA_KBOB ? "Fabrication (y.c. fuites B1)" : "Fabrication (A1–A3)";
  const nowStr = new Date().toLocaleString("fr-CH");

  const aoa1 = [
    ["Calculateur KBOB / KBOB Rechner — Écobilan Pompe à chaleur"],
    [`Export au format tableau d'indicateurs KBOB 2027 | Généré le ${nowStr} | HEIG-VD / OFEN (projet LCA-PAC)`],
    [],
    ["1. Paramètres de calcul"],
    ["Nom du projet", projetNom || "Projet PAC"],
    ["Base de données d'écobilan", res.datasetLabel],
    ["Cadre d'évaluation", res.cadreLabel],
    ["Technologie & Puissance nominale", `PAC ${res.technologie} — ${res.puissanceKw} kW`],
    ["Réfrigérant sélectionné", res.fluideSelectionne],
    ["Donnée de référence appliquée", `${res.fluideReference} (${res.noteFluide})`],
    [
      "Masse & Ratio de masse (r_m)",
      `Utilisée : ${res.massInfo.masseUtiliseeKg.toFixed(1)} kg | Théorique : ${res.massInfo.masseTheoriqueKg.toFixed(1)} kg | Ratio r_m = ${res.massInfo.ratioMasse.toFixed(4)}`,
    ],
    ["Périmètre du cycle de vie", res.scopeLabel],
    ["Unité de référence", res.uniteLabel],
    ["Méthode d'interpolation", res.methodeInterpolation],
    [],
    ["2. Indicateurs d'écobilan principaux (format KBOB)"],
  ];

  const headers = ["Indicateur", "Unité", "Total", fabHeader];
  if (showB1) headers.push("Fuites en usage (B1)");
  headers.push("Élimination (C1–C4)");
  aoa1.push(headers);

  const principaux = res.indicators.filter((i) => i.afficher_par_defaut);
  const indList1 = principaux.length ? principaux : res.indicators.slice(0, 4);

  for (const ind of indList1) {
    const v = res.values[ind.id];
    const row = [
      ind.nom,
      `${ind.unite}${res.suffixeUnite}`,
      Number(v.total),
      Number(v.fabrication),
    ];
    if (showB1) row.push(Number(v.fuites_usage));
    row.push(Number(v.elimination));
    aoa1.push(row);
  }

  const bioRow = ["Teneur en carbone biogénique contenu dans le produit", `kg C${res.suffixeUnite}`, 0, 0];
  if (showB1) bioRow.push(0);
  bioRow.push(0);
  aoa1.push(bioRow);
  aoa1.push([]);
  aoa1.push(["Développé par la HEIG-VD (Institut des Énergies) et financé par l'Office fédéral de l'énergie (OFEN), projet LCA-PAC."]);

  const ws1 = window.XLSX.utils.aoa_to_sheet(aoa1);
  ws1["!cols"] = [
    { wch: 48 },
    { wch: 18 },
    { wch: 18 },
    { wch: 24 },
    ...(showB1 ? [{ wch: 22 }] : []),
    { wch: 22 },
  ];
  window.XLSX.utils.book_append_sheet(wb, ws1, "Fiche KBOB 2027");

  const extras = res.indicators.filter((i) => !i.afficher_par_defaut);
  if (extras.length > 0) {
    const aoa2 = [
      [`Indicateurs complémentaires EF 3.1 — PAC ${res.technologie} ${res.puissanceKw} kW (${res.fluideSelectionne})`],
      [],
      headers,
    ];
    for (const ind of extras) {
      const v = res.values[ind.id];
      const row = [
        ind.nom,
        `${ind.unite}${res.suffixeUnite}`,
        Number(v.total),
        Number(v.fabrication),
      ];
      if (showB1) row.push(Number(v.fuites_usage));
      row.push(Number(v.elimination));
      aoa2.push(row);
    }
    const ws2 = window.XLSX.utils.aoa_to_sheet(aoa2);
    ws2["!cols"] = ws1["!cols"];
    window.XLSX.utils.book_append_sheet(wb, ws2, "Indicateurs EF 3.1");
  }

  window.XLSX.writeFile(wb, `KBOB_2027_PAC_${safeFilename(projetNom)}.xlsx`);
}

export function exportCsv(res, projetNom, inclureEf31 = true) {
  const inds = inclureEf31
    ? res.indicators
    : res.indicators.filter((i) => i.afficher_par_defaut);
  const showB1 = res.phasesActives.includes("fuites_usage");
  const fabLabel = res.scope === SCOPE_SIA_KBOB ? "Fabrication (y.c. B1)" : "Fabrication (A1-A3)";

  const lines = [
    ["# Calculateur KBOB / KBOB Rechner — Écobilan PAC (HEIG-VD / OFEN, projet LCA-PAC)"],
    ["Projet", projetNom || "Projet PAC"],
    ["Base de données", res.datasetLabel],
    ["Cadre d'évaluation", res.cadreLabel],
    ["Technologie", res.technologie],
    ["Puissance nominale [kW]", res.puissanceKw],
    ["Réfrigérant sélectionné", res.fluideSelectionne],
    ["Donnée KBOB appliquée", res.fluideReference],
    ["Masse théorique m_théo(P) [kg]", res.massInfo.masseTheoriqueKg.toFixed(2)],
    ["Masse utilisée [kg]", res.massInfo.masseUtiliseeKg.toFixed(2)],
    ["Ratio de masse r_m [-]", res.massInfo.ratioMasse.toFixed(4)],
    ["Périmètre", res.scopeLabel],
    ["Unité de référence", res.uniteLabel],
    [],
    ["Indicateur", "Groupe", "Unité", "Total", fabLabel, ...(showB1 ? ["Fuites en usage (B1)"] : []), "Élimination (C1-C4)"],
  ];

  for (const ind of inds) {
    const v = res.values[ind.id];
    lines.push([
      ind.nom,
      ind.groupe,
      `${ind.unite}${res.suffixeUnite}`,
      v.total,
      v.fabrication,
      ...(showB1 ? [v.fuites_usage] : []),
      v.elimination,
    ]);
  }

  const csvContent = "\uFEFF" + lines.map((row) =>
    row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(";")
  ).join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  triggerDownload(blob, `KBOB_PAC_${safeFilename(projetNom)}.csv`);
}

export function exportHtml(res, projetNom, inclureEf31 = false) {
  const principaux = res.indicators.filter((i) => i.afficher_par_defaut);
  const indMain = principaux.length ? principaux : res.indicators.slice(0, 4);
  const extras = inclureEf31 ? res.indicators.filter((i) => !i.afficher_par_defaut) : [];
  const showB1 = res.phasesActives.includes("fuites_usage");
  const fabColLabel = res.scope === SCOPE_SIA_KBOB ? "Fabrication (y.c. fuites B1)" : "Fabrication (A1–A3)";

  const kpiColors = ["#1d4ed8", "#b91c1c", "#0f766e", "#047857", "#6d28d9", "#c2410c"];
  const kpiCards = indMain.map((ind, idx) => `
    <div class="kpi-card" style="border-top: 4px solid ${kpiColors[idx % kpiColors.length]};">
      <div class="kpi-label">${escapeHtml(ind.nom_court)}</div>
      <div class="kpi-val">${formaterValeur(res.values[ind.id].total, ind)}</div>
      <div class="kpi-unit">${escapeHtml(ind.unite + res.suffixeUnite)}</div>
    </div>
  `).join("");

  const buildTable = (title, list) => {
    if (!list.length) return "";
    const rows = list.map((ind) => {
      const v = res.values[ind.id];
      return `
        <tr>
          <td><strong>${escapeHtml(ind.nom)}</strong></td>
          <td class="unit">${escapeHtml(ind.unite + res.suffixeUnite)}</td>
          <td class="num total">${formaterValeur(v.total, ind)}</td>
          <td class="num">${formaterValeur(v.fabrication, ind)}</td>
          ${showB1 ? `<td class="num">${formaterValeur(v.fuites_usage, ind)}</td>` : ""}
          <td class="num">${formaterValeur(v.elimination, ind)}</td>
        </tr>`;
    }).join("");

    return `
      <h2>${escapeHtml(title)}</h2>
      <table class="data-table">
        <thead>
          <tr>
            <th>Indicateur</th>
            <th>Unité</th>
            <th class="num">Total</th>
            <th class="num">${escapeHtml(fabColLabel)}</th>
            ${showB1 ? `<th class="num">Fuites en usage (B1)</th>` : ""}
            <th class="num">Élimination (C1–C4)</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>`;
  };

  const masseStr = res.massInfo.masseConnue
    ? `Saisie manuelle (${res.massInfo.masseUtiliseeKg.toFixed(1)} kg)`
    : `Estimée par le modèle LCA-PAC (${res.massInfo.masseTheoriqueKg.toFixed(1)} kg)`;

  const doc = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Calculateur KBOB / KBOB Rechner — ${escapeHtml(projetNom || "Projet PAC")}</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #0f172a; background: #fff; margin: 0; padding: 32px; line-height: 1.45; }
    .container { max-width: 920px; margin: 0 auto; }
    .header { border-bottom: 4px solid #dc2626; padding-bottom: 14px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; }
    .header h1 { margin: 0; font-size: 1.5rem; color: #0f172a; }
    .header .sub { color: #475569; font-size: 0.92rem; margin-top: 4px; }
    .badge { font-size: 0.82rem; color: #64748b; }
    h2 { font-size: 1.1rem; color: #1e293b; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px; margin-top: 26px; }
    .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 22px; font-size: 0.91rem; }
    .meta-table th, .meta-table td { padding: 8px 12px; border: 1px solid #cbd5e1; text-align: left; }
    .meta-table th { background: #f8fafc; width: 32%; color: #334155; }
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; margin: 22px 0; }
    .kpi-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px; text-align: center; }
    .kpi-label { font-size: 0.8rem; text-transform: uppercase; color: #475569; font-weight: 600; }
    .kpi-val { font-size: 1.42rem; font-weight: 700; color: #0f172a; font-family: ui-monospace, Consolas, monospace; margin: 6px 0 2px; }
    .kpi-unit { font-size: 0.82rem; color: #64748b; }
    .data-table { width: 100%; border-collapse: collapse; font-size: 0.88rem; margin-top: 10px; }
    .data-table th, .data-table td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; }
    .data-table thead th { background: #f1f5f9; color: #334155; text-align: left; border-top: 1px solid #cbd5e1; border-bottom: 2px solid #94a3b8; }
    .num { text-align: right; font-family: ui-monospace, Consolas, monospace; white-space: nowrap; }
    .unit { color: #64748b; white-space: nowrap; }
    .total { font-weight: 700; background: #f8fafc; }
    .footer { margin-top: 34px; padding-top: 14px; border-top: 1px solid #e2e8f0; font-size: 0.78rem; color: #64748b; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div>
        <h1>Calculateur KBOB / KBOB Rechner — Pompe à chaleur</h1>
        <div class="sub">Fiche d'écobilan paramétrée (puissance &amp; ratio de masse)</div>
      </div>
      <div class="badge">Généré le ${escapeHtml(new Date().toLocaleString("fr-CH"))}</div>
    </div>
    <table class="meta-table">
      <tr><th>Nom du projet</th><td><strong>${escapeHtml(projetNom || "Projet PAC")}</strong></td></tr>
      <tr><th>Base de données</th><td>${escapeHtml(res.datasetLabel)}</td></tr>
      <tr><th>Cadre d'évaluation</th><td>${escapeHtml(res.cadreLabel)}</td></tr>
      <tr><th>Technologie &amp; Puissance</th><td>PAC ${escapeHtml(res.technologie)} — <strong>${res.puissanceKw} kW</strong></td></tr>
      <tr><th>Réfrigérant sélectionné</th><td><strong>${escapeHtml(res.fluideSelectionne)}</strong><br><small style="color:#475569;">Donnée KBOB appliquée : ${escapeHtml(res.fluideReference)} — ${escapeHtml(res.noteFluide)}</small></td></tr>
      <tr><th>Masse de la machine</th><td>${escapeHtml(masseStr)} — Masse théorique : ${res.massInfo.masseTheoriqueKg.toFixed(1)} kg — <strong>Ratio r<sub>m</sub> = ${res.massInfo.ratioMasse.toFixed(3)}</strong></td></tr>
      <tr><th>Méthode de calcul</th><td>${escapeHtml(res.methodeInterpolation)}</td></tr>
      <tr><th>Périmètre &amp; Unité</th><td>${escapeHtml(res.scopeLabel)} | <strong>${escapeHtml(res.uniteLabel)}</strong></td></tr>
    </table>
    <div class="kpi-grid">${kpiCards}</div>
    ${buildTable("1. Indicateurs KBOB principaux", indMain)}
    ${buildTable("2. Indicateurs complémentaires (EF 3.1)", extras)}
    <div class="footer">
      Développé par la Haute École d'Ingénierie et de Gestion du canton de Vaud (HEIG-VD — Institut des Énergies) et financé par l'Office fédéral de l'énergie (OFEN), dans le cadre du projet <strong>LCA-PAC</strong>.
    </div>
  </div>
</body>
</html>`;

  const blob = new Blob([doc], { type: "text/html;charset=utf-8;" });
  triggerDownload(blob, `Fiche_KBOB_PAC_${safeFilename(projetNom)}.html`);
}
