/**
 * js/app.js
 * Contrôleur principal de l'application Web statique (GitHub Pages).
 * Utilise Chart.js (100 % compatible CSP strict sans eval/unsafe-eval).
 */
import { loadAllData } from "./data_loader.js";
import {
  CADRE_SIA_REGLEMENTAIRE,
  PUISSANCE_DEFAUT_KW,
  PUISSANCE_MAX_KW,
  PUISSANCE_MIN_KW,
  SCOPE_FAB_ELIM,
  SCOPE_SIA_KBOB,
  UNITE_APPAREIL,
  calculerEcobilan,
  formaterValeur,
} from "./kbob_engine.js";
import { exportCsv, exportExcelKbob2027, exportHtml } from "./exporters.js";

const PHASE_COLORS = {
  fabrication: "#2563eb",
  fuites_usage: "#f59e0b",
  elimination: "#dc2626",
};

let activeCharts = [];

let state = {
  datasets: [],
  reglesMasse: [],
  datasetIdx: 0,
  cadreEvaluation: CADRE_SIA_REGLEMENTAIRE,
  projetNom: "Projet PAC",
  technologie: "",
  puissanceKw: PUISSANCE_DEFAUT_KW,
  fluideOptionId: "",
  masseConnue: false,
  masseSaisieKg: "",
  scope: SCOPE_SIA_KBOB,
  uniteReference: UNITE_APPAREIL,
  selectedIndicators: [],
  inclureEf31Table: false,
  lastResult: null,
};

function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getActiveDataset() {
  return state.datasets[state.datasetIdx];
}

function showWarning(msg) {
  const el = document.getElementById("warning-banner");
  if (!msg) {
    el.textContent = "";
    el.classList.remove("visible");
  } else {
    el.textContent = msg;
    el.classList.add("visible");
  }
}

function syncControlsFromDataset(resetIndicators = true) {
  const ds = getActiveDataset();
  document.getElementById("dataset-desc").innerHTML =
    `<em>${escapeHtml(ds.description)}</em> — <strong>${ds.indicators.length} indicateur(s)</strong> disponibles dans <code>${escapeHtml(ds.filename)}</code>.`;

  const techSel = document.getElementById("select-tech");
  techSel.innerHTML = ds.technologies
    .map((t) => `<option value="${escapeHtml(t)}">${escapeHtml(t)}</option>`)
    .join("");
  if (!ds.technologies.includes(state.technologie)) {
    state.technologie = ds.technologies[0];
  }
  techSel.value = state.technologie;

  syncFluidesDropdown();

  const indContainer = document.getElementById("indicators-checkboxes");
  if (resetIndicators || !state.selectedIndicators.length) {
    const defaults = ds.indicators.filter((i) => i.afficher_par_defaut).map((i) => i.id);
    state.selectedIndicators = defaults.length ? defaults : ds.indicators.slice(0, 4).map((i) => i.id);
  } else {
    const validIds = new Set(ds.indicators.map((i) => i.id));
    state.selectedIndicators = state.selectedIndicators.filter((id) => validIds.has(id));
  }

  indContainer.innerHTML = ds.indicators
    .map((ind) => {
      const checked = state.selectedIndicators.includes(ind.id) ? "checked" : "";
      return `
        <label class="ind-chip">
          <input type="checkbox" value="${escapeHtml(ind.id)}" ${checked} />
          <span>${escapeHtml(ind.nom_court)} (${escapeHtml(ind.unite)})</span>
        </label>`;
    })
    .join("");

  indContainer.querySelectorAll("input[type='checkbox']").forEach((cb) => {
    cb.addEventListener("change", () => {
      state.selectedIndicators = Array.from(
        indContainer.querySelectorAll("input[type='checkbox']:checked")
      ).map((x) => x.value);
      recalculateAndRender();
    });
  });

  const hasExtra = ds.indicators.some((i) => !i.afficher_par_defaut);
  const efWrap = document.getElementById("ef31-toggle-wrap");
  efWrap.style.display = hasExtra ? "flex" : "none";
  if (!hasExtra) {
    state.inclureEf31Table = false;
    document.getElementById("cb-ef31").checked = false;
  }

  renderGuideTables();
}

function syncFluidesDropdown() {
  const ds = getActiveDataset();
  const dispo = new Set(ds.fluidesParTech[state.technologie] || []);
  const opts = ds.refrigerantOptions.filter((o) => dispo.has(o.fluide_reference));

  const fluSel = document.getElementById("select-fluide");
  fluSel.innerHTML = opts
    .map((o) => `<option value="${escapeHtml(o.id)}">${escapeHtml(o.label)}</option>`)
    .join("");

  if (!opts.some((o) => o.id === state.fluideOptionId)) {
    state.fluideOptionId = opts[0]?.id || "";
  }
  fluSel.value = state.fluideOptionId;
}

function syncScopeLock() {
  const isSia = state.cadreEvaluation === CADRE_SIA_REGLEMENTAIRE;
  if (isSia && state.scope === SCOPE_FAB_ELIM) {
    state.scope = SCOPE_SIA_KBOB;
  }

  document.querySelectorAll("input[name='scope']").forEach((radio) => {
    radio.checked = radio.value === state.scope;
    radio.disabled = isSia;
    const pill = radio.closest(".choice-pill");
    if (pill) pill.classList.toggle("disabled", isSia);
  });
}

function renderKpiCards(res) {
  const byId = Object.fromEntries(res.indicators.map((i) => [i.id, i]));
  let chosen = state.selectedIndicators.map((id) => byId[id]).filter(Boolean);
  if (!chosen.length) {
    chosen = res.indicators.filter((i) => i.afficher_par_defaut);
  }

  const colors = ["#1d4ed8", "#b91c1c", "#0f766e", "#047857", "#6d28d9", "#c2410c", "#0284c7", "#4338ca"];
  document.getElementById("kpi-cards").innerHTML = chosen
    .map((ind, idx) => {
      const val = formaterValeur(res.values[ind.id].total, ind);
      return `
        <div class="kpi-card" style="border-top: 4px solid ${colors[idx % colors.length]};">
          <div class="kpi-title">${escapeHtml(ind.nom_court)}</div>
          <div class="kpi-value">${val}</div>
          <div class="kpi-unit">${escapeHtml(ind.unite + res.suffixeUnite)}</div>
        </div>`;
    })
    .join("");
}

function renderMetaBanner(res) {
  const m = res.massInfo;
  let statut = "Estimée (modèle LCA-PAC)";
  if (m.masseConnue) statut = "Saisie manuelle";
  else if (m.attenteSaisieMasse) statut = "En attente de saisie — masse théorique utilisée";

  const ratioHtml =
    Math.abs(m.ratioMasse - 1.0) > 1e-4
      ? `<span style="color:#b45309;font-weight:700;">${m.ratioMasse.toFixed(3)}</span>`
      : "1.000 (référence)";

  document.getElementById("meta-banner").innerHTML = `
    <div class="calc-meta-grid">
      <div><strong>Donnée fluide appliquée :</strong> ${escapeHtml(res.fluideReference)}</div>
      <div><strong>Masse théorique m<sub>théo</sub>(${res.puissanceKw} kW) :</strong> ${m.masseTheoriqueKg.toFixed(1)} kg</div>
      <div><strong>Masse utilisée :</strong> ${m.masseUtiliseeKg.toFixed(1)} kg <em>(${statut})</em></div>
      <div><strong>Ratio de masse r<sub>m</sub> :</strong> ${ratioHtml}</div>
    </div>
    <div class="calc-meta-method">${escapeHtml(res.noteFluide)} &nbsp;|&nbsp; ${escapeHtml(res.methodeInterpolation)}</div>
  `;
}

function renderCharts(res) {
  for (const ch of activeCharts) {
    try { ch.destroy(); } catch {}
  }
  activeCharts = [];

  const container = document.getElementById("charts-grid");
  if (typeof window.Chart === "undefined") {
    container.innerHTML = "<p style='color:#64748b;'>Graphiques indisponibles hors ligne (Chart.js non chargé).</p>";
    return;
  }

  const byId = Object.fromEntries(res.indicators.map((i) => [i.id, i]));
  let chosen = state.selectedIndicators.map((id) => byId[id]).filter(Boolean);
  if (!chosen.length) {
    chosen = res.indicators.filter((i) => i.afficher_par_defaut);
  }
  const chosenPlot = chosen.slice(0, 8);

  const phaseDisplay = {
    fabrication: res.scope === SCOPE_SIA_KBOB ? "Fabrication (y.c. B1)" : "Fabrication (A1–A3)",
    fuites_usage: "Fuites en usage (B1)",
    elimination: "Élimination (C1–C4)",
  };

  container.innerHTML = chosenPlot
    .map(
      (ind, idx) => `
      <div class="chart-card">
        <div class="chart-card-title">${escapeHtml(ind.nom_court)}</div>
        <div class="chart-card-unit">${escapeHtml(ind.unite + res.suffixeUnite)}</div>
        <div class="chart-canvas-wrap">
          <canvas id="chart-canvas-${idx}"></canvas>
        </div>
      </div>`
    )
    .join("");

  // Légende commune sous la grille de graphiques
  let legendEl = document.getElementById("charts-shared-legend");
  if (!legendEl) {
    legendEl = document.createElement("div");
    legendEl.id = "charts-shared-legend";
    legendEl.className = "charts-legend";
    container.parentNode.appendChild(legendEl);
  }
  legendEl.innerHTML = res.phasesActives
    .map(
      (ph) => `
      <span class="legend-item">
        <span class="legend-swatch" style="background:${PHASE_COLORS[ph]};"></span>
        <span>${escapeHtml(phaseDisplay[ph])}</span>
      </span>`
    )
    .join("");

  chosenPlot.forEach((ind, idx) => {
    const ctx = document.getElementById(`chart-canvas-${idx}`);
    if (!ctx) return;
    const vals = res.values[ind.id];
    const total = vals.total;

    const datasets = res.phasesActives.map((phase) => ({
      label: phaseDisplay[phase],
      data: [vals[phase] || 0],
      backgroundColor: PHASE_COLORS[phase],
      borderRadius: 2,
      barThickness: 64,
    }));

    const chart = new window.Chart(ctx, {
      type: "bar",
      data: {
        labels: [ind.nom_court],
        datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => {
                const v = context.parsed.y || 0;
                const pct = total > 0 ? ((v / total) * 100).toFixed(1) : "0.0";
                return `${context.dataset.label} : ${formaterValeur(v, ind)} ${ind.unite}${res.suffixeUnite} (${pct} %)`;
              },
            },
          },
        },
        scales: {
          x: {
            stacked: true,
            grid: { display: false },
            ticks: { display: false },
          },
          y: {
            stacked: true,
            beginAtZero: true,
            grid: { color: "#e2e8f0" },
            ticks: {
              font: { size: 11 },
              callback: (value) => {
                if (ind.notation_scientifique) return Number(value).toExponential(1);
                return Number(value).toLocaleString("fr-CH");
              },
            },
          },
        },
      },
    });
    activeCharts.push(chart);
  });
}

function renderResultsTable(res) {
  const inds = state.inclureEf31Table
    ? res.indicators
    : res.indicators.filter((i) => i.afficher_par_defaut);
  const showB1 = res.phasesActives.includes("fuites_usage");
  const fabCol = res.scope === SCOPE_SIA_KBOB ? "Fabrication (y.c. B1)" : "Fabrication (A1–A3)";

  const thead = `
    <thead>
      <tr>
        <th>Indicateur</th>
        <th>Unité</th>
        <th class="num">Total</th>
        <th class="num">${escapeHtml(fabCol)}</th>
        ${showB1 ? `<th class="num">Fuites en usage (B1)</th>` : ""}
        <th class="num">Élimination (C1–C4)</th>
      </tr>
    </thead>`;

  const tbody = inds
    .map((ind) => {
      const v = res.values[ind.id];
      return `
        <tr>
          <td><strong>${escapeHtml(ind.nom)}</strong></td>
          <td class="unit">${escapeHtml(ind.unite + res.suffixeUnite)}</td>
          <td class="num total-col">${formaterValeur(v.total, ind)}</td>
          <td class="num">${formaterValeur(v.fabrication, ind)}</td>
          ${showB1 ? `<td class="num">${formaterValeur(v.fuites_usage, ind)}</td>` : ""}
          <td class="num">${formaterValeur(v.elimination, ind)}</td>
        </tr>`;
    })
    .join("");

  document.getElementById("results-table-wrap").innerHTML = `<table class="kbob-table">${thead}<tbody>${tbody}</tbody></table>`;
}

function renderGuideTables() {
  const ds = getActiveDataset();

  const fRows = ds.refrigerantOptions
    .map(
      (o) => `
      <tr>
        <td><strong>${escapeHtml(o.label)}</strong></td>
        <td>${escapeHtml(o.fluide_reference)}</td>
        <td>${escapeHtml(o.categorie)}</td>
        <td>${escapeHtml(o.note_methodologique)}</td>
      </tr>`
    )
    .join("");
  document.getElementById("guide-fluides-table").innerHTML = `
    <table class="kbob-table">
      <thead><tr><th>Option utilisateur</th><th>Donnée KBOB appliquée</th><th>Catégorie</th><th>Justification / Règle</th></tr></thead>
      <tbody>${fRows}</tbody>
    </table>`;

  const mRows = state.reglesMasse
    .map(
      (r) => `
      <tr>
        <td><strong>${escapeHtml(r.technologie)}</strong></td>
        <td class="num">${r.p_min_kw}</td>
        <td class="num">${r.p_max_kw}</td>
        <td class="num">${r.a.toFixed(2)}</td>
        <td class="num">${r.b.toFixed(2)}</td>
        <td>${escapeHtml(r.source)}</td>
      </tr>`
    )
    .join("");
  document.getElementById("guide-masse-table").innerHTML = `
    <table class="kbob-table">
      <thead><tr><th>Technologie</th><th class="num">P min [kW]</th><th class="num">P max [kW]</th><th class="num">Pente a [kg/kW]</th><th class="num">Ordonnée b [kg]</th><th>Source</th></tr></thead>
      <tbody>${mRows}</tbody>
    </table>`;

  const mainInds = ds.indicators.filter((i) => i.afficher_par_defaut);
  const rHead = `
    <thead>
      <tr>
        <th>Technologie</th>
        <th>Fluide référence</th>
        <th class="num">Puissance [kW]</th>
        <th class="num">Masse réf. [kg]</th>
        <th>Phase</th>
        ${mainInds.map((i) => `<th class="num">${escapeHtml(i.nom_court)} [${escapeHtml(i.unite)}]</th>`).join("")}
      </tr>
    </thead>`;
  const rBody = ds.rows
    .map(
      (row) => `
      <tr>
        <td>${escapeHtml(row.technologie)}</td>
        <td>${escapeHtml(row.fluide)}</td>
        <td class="num">${row.puissance_kw}</td>
        <td class="num">${row.masse_ref_kg}</td>
        <td>${escapeHtml(row.phase)}</td>
        ${mainInds.map((i) => `<td class="num">${formaterValeur(row[i.id], i)}</td>`).join("")}
      </tr>`
    )
    .join("");
  document.getElementById("guide-ref-table").innerHTML = `<table class="kbob-table">${rHead}<tbody>${rBody}</tbody></table>`;
}

function recalculateAndRender() {
  const warnings = [];
  let pVal = Number(state.puissanceKw);
  if (!Number.isFinite(pVal) || state.puissanceKw === "") {
    pVal = PUISSANCE_DEFAUT_KW;
  }
  if (pVal < PUISSANCE_MIN_KW || pVal > PUISSANCE_MAX_KW) {
    pVal = Math.max(PUISSANCE_MIN_KW, Math.min(PUISSANCE_MAX_KW, pVal));
    document.getElementById("input-puissance").value = pVal;
    state.puissanceKw = pVal;
    warnings.push(`La puissance a été bornée dans la plage étalonnée [${PUISSANCE_MIN_KW} ; ${PUISSANCE_MAX_KW} kW].`);
  }

  if (state.masseConnue && state.masseSaisieKg !== "" && Number(state.masseSaisieKg) < 0) {
    warnings.push("La masse saisie doit être strictement positive : masse théorique utilisée par défaut.");
  }
  showWarning(warnings.join(" "));

  const res = calculerEcobilan({
    dataset: getActiveDataset(),
    reglesMasse: state.reglesMasse,
    cadreEvaluation: state.cadreEvaluation,
    technologie: state.technologie,
    puissanceKw: pVal,
    fluideOptionId: state.fluideOptionId,
    masseConnue: state.masseConnue,
    masseSaisieKg: state.masseSaisieKg,
    scope: state.scope,
    uniteReference: state.uniteReference,
  });

  state.lastResult = res;
  renderMetaBanner(res);
  renderKpiCards(res);
  renderCharts(res);
  renderResultsTable(res);
}

function bindEvents() {
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(btn.dataset.target).classList.add("active");
      if (btn.dataset.target === "tab-calc" && state.lastResult) {
        renderCharts(state.lastResult);
      }
    });
  });

  document.getElementById("select-dataset").addEventListener("change", (e) => {
    state.datasetIdx = Number(e.target.value);
    syncControlsFromDataset(true);
    recalculateAndRender();
  });

  document.getElementById("input-projet").addEventListener("input", (e) => {
    state.projetNom = e.target.value;
  });

  document.querySelectorAll("input[name='cadre']").forEach((radio) => {
    radio.addEventListener("change", (e) => {
      state.cadreEvaluation = e.target.value;
      syncScopeLock();
      recalculateAndRender();
    });
  });

  document.getElementById("select-tech").addEventListener("change", (e) => {
    state.technologie = e.target.value;
    syncFluidesDropdown();
    recalculateAndRender();
  });

  document.getElementById("input-puissance").addEventListener("change", (e) => {
    state.puissanceKw = e.target.value;
    recalculateAndRender();
  });

  document.getElementById("select-fluide").addEventListener("change", (e) => {
    state.fluideOptionId = e.target.value;
    recalculateAndRender();
  });

  document.querySelectorAll("input[name='masse_statut']").forEach((radio) => {
    radio.addEventListener("change", (e) => {
      state.masseConnue = e.target.value === "connue";
      const wrap = document.getElementById("masse-saisie-wrap");
      wrap.style.display = state.masseConnue ? "flex" : "none";
      recalculateAndRender();
    });
  });

  document.getElementById("input-masse").addEventListener("input", (e) => {
    state.masseSaisieKg = e.target.value;
    recalculateAndRender();
  });

  document.querySelectorAll("input[name='scope']").forEach((radio) => {
    radio.addEventListener("change", (e) => {
      state.scope = e.target.value;
      recalculateAndRender();
    });
  });

  document.querySelectorAll("input[name='unite']").forEach((radio) => {
    radio.addEventListener("change", (e) => {
      state.uniteReference = e.target.value;
      recalculateAndRender();
    });
  });

  document.getElementById("cb-ef31").addEventListener("change", (e) => {
    state.inclureEf31Table = e.target.checked;
    if (state.lastResult) renderResultsTable(state.lastResult);
  });

  document.getElementById("btn-export-xlsx").addEventListener("click", () => {
    if (state.lastResult) exportExcelKbob2027(state.lastResult, state.projetNom);
  });
  document.getElementById("btn-export-html").addEventListener("click", () => {
    if (state.lastResult) exportHtml(state.lastResult, state.projetNom, state.inclureEf31Table);
  });
  document.getElementById("btn-export-csv").addEventListener("click", () => {
    if (state.lastResult) exportCsv(state.lastResult, state.projetNom, true);
  });
}

async function init() {
  try {
    const { datasets, reglesMasse } = await loadAllData();
    if (!datasets.length) {
      throw new Error("Aucun jeu de données CSV trouvé dans data/datasets/.");
    }
    state.datasets = datasets;
    state.reglesMasse = reglesMasse;

    const dsSel = document.getElementById("select-dataset");
    dsSel.innerHTML = datasets
      .map((ds, idx) => `<option value="${idx}">${escapeHtml(ds.label)}</option>`)
      .join("");
    if (datasets.length <= 1) {
      document.getElementById("dataset-select-wrap").style.display = "none";
    }

    bindEvents();
    syncControlsFromDataset(true);
    syncScopeLock();
    recalculateAndRender();
  } catch (err) {
    console.error(err);
    showWarning(`Erreur lors du chargement des données CSV : ${err.message}`);
  }
}

document.addEventListener("DOMContentLoaded", init);
