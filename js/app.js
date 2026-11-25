/**
 * js/app.js
 * Contrôleur page unique.
 * Base fixe : BAFU:2026v1 | Périmètre fixe : SIA 390/1 (Fabrication inclus fuites annuelles et élimination).
 * Tous les indicateurs (4 KBOB + 18 EF 3.1) sont calculés et affichés systématiquement.
 */
import { loadAllData } from "./data_loader.js";
import {
  CADRE_SIA_REGLEMENTAIRE,
  PUISSANCE_DEFAUT_KW,
  PUISSANCE_MAX_KW,
  PUISSANCE_MIN_KW,
  SCOPE_SIA_KBOB,
  UNITE_APPAREIL,
  calculerEcobilan,
  formaterValeur,
} from "./kbob_engine.js";
import { exportCsv, exportExcelKbob2027, exportHtml } from "./exporters.js";

const LABEL_FAB = "Fabrication (inclus fuites annuelles)";
const LABEL_ELIM = "Élimination";

const PHASE_COLORS = {
  fabrication: "#007a53",
  elimination: "#616e7c",
};

let activeCharts = [];

const state = {
  dataset: null,
  reglesMasse: [],
  projetNom: "Projet PAC",
  technologie: "",
  puissanceKw: PUISSANCE_DEFAUT_KW,
  fluideOptionId: "",
  masseConnue: false,
  masseSaisieKg: "",
  uniteReference: UNITE_APPAREIL,
  lastResult: null,
};

function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
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

function renderTechSegmented() {
  const ds = state.dataset;
  const container = document.getElementById("tech-segmented");
  if (!ds.technologies.includes(state.technologie)) {
    state.technologie = ds.technologies[0];
  }

  container.innerHTML = ds.technologies
    .map((tech) => {
      const checked = tech === state.technologie ? "checked" : "";
      return `
        <label class="seg-option">
          <input type="radio" name="technologie" value="${escapeHtml(tech)}" ${checked} />
          <span>${escapeHtml(tech)}</span>
        </label>`;
    })
    .join("");

  container.querySelectorAll("input[name='technologie']").forEach((radio) => {
    radio.addEventListener("change", (e) => {
      state.technologie = e.target.value;
      syncFluidesDropdown();
      recalculateAndRender();
    });
  });
}

function syncFluidesDropdown() {
  const ds = state.dataset;
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

function renderInputSummaries(res) {
  document.getElementById("fluide-note").innerHTML =
    `Donnée KBOB appliquée : <strong>${escapeHtml(res.fluideReference)}</strong> — ${escapeHtml(res.noteFluide)}`;

  const m = res.massInfo;
  const ratioStr =
    Math.abs(m.ratioMasse - 1.0) > 1e-4
      ? `<span class="ratio-highlight">${m.ratioMasse.toFixed(3)}</span>`
      : "1.000";

  const statutTxt = m.masseConnue
    ? "saisie manuelle"
    : m.attenteSaisieMasse
    ? "en attente de saisie"
    : "modèle LCA-PAC";

  document.getElementById("mass-summary").innerHTML = `
    <div>Masse théorique m<sub>théo</sub>(${res.puissanceKw} kW) : <strong>${m.masseTheoriqueKg.toFixed(1)} kg</strong></div>
    <div>Masse utilisée : <strong>${m.masseUtiliseeKg.toFixed(1)} kg</strong> (${statutTxt}) &middot; Ratio r<sub>m</sub> = ${ratioStr}</div>
  `;

  const massInput = document.getElementById("input-masse");
  if (massInput) {
    massInput.placeholder = `Ex. ${Math.round(m.masseTheoriqueKg)}`;
  }

  document.getElementById("results-subtitle").textContent =
    `PAC ${res.technologie} · ${res.puissanceKw} kW · ${res.fluideReference} · ${m.masseUtiliseeKg.toFixed(1)} kg · ${res.uniteLabel}`;

  document.getElementById("interp-badge").textContent = res.methodeInterpolation;
}

function renderKpiCards(res) {
  const principaux = res.indicators.filter((i) => i.afficher_par_defaut);
  const list = principaux.length ? principaux : res.indicators.slice(0, 4);

  document.getElementById("kpi-cards").innerHTML = list
    .map((ind) => {
      const v = res.values[ind.id];
      return `
        <div class="kpi-card">
          <div class="kpi-title">${escapeHtml(ind.nom_court)}</div>
          <div class="kpi-value">${formaterValeur(v.total, ind)}</div>
          <div class="kpi-unit">${escapeHtml(ind.unite + res.suffixeUnite)}</div>
          <div class="kpi-split">
            <div class="kpi-split-row">
              <span>${LABEL_FAB}</span>
              <strong>${formaterValeur(v.fabrication, ind)}</strong>
            </div>
            <div class="kpi-split-row">
              <span>${LABEL_ELIM}</span>
              <strong>${formaterValeur(v.elimination, ind)}</strong>
            </div>
          </div>
        </div>`;
    })
    .join("");
}

function renderCharts(res) {
  for (const ch of activeCharts) {
    try {
      ch.destroy();
    } catch {}
  }
  activeCharts = [];

  const container = document.getElementById("charts-grid");
  if (typeof window.Chart === "undefined") {
    container.innerHTML = "<p class='field-note'>Graphiques indisponibles hors ligne (Chart.js non chargé).</p>";
    return;
  }

  const principaux = res.indicators.filter((i) => i.afficher_par_defaut);
  const list = principaux.length ? principaux : res.indicators.slice(0, 4);

  container.innerHTML = list
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

  list.forEach((ind, idx) => {
    const ctx = document.getElementById(`chart-canvas-${idx}`);
    if (!ctx) return;

    const vals = res.values[ind.id];
    const total = vals.total;

    const chart = new window.Chart(ctx, {
      type: "bar",
      data: {
        labels: [ind.nom_court],
        datasets: [
          {
            label: LABEL_FAB,
            data: [vals.fabrication || 0],
            backgroundColor: PHASE_COLORS.fabrication,
            borderRadius: 2,
            barThickness: 44,
          },
          {
            label: LABEL_ELIM,
            data: [vals.elimination || 0],
            backgroundColor: PHASE_COLORS.elimination,
            borderRadius: 2,
            barThickness: 44,
          },
        ],
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
            grid: { color: "#e5eaee" },
            ticks: {
              font: { size: 10 },
              color: "#52606d",
              maxTicksLimit: 5,
              callback: (value) => Number(value).toLocaleString("fr-CH"),
            },
          },
        },
      },
    });
    activeCharts.push(chart);
  });
}

function renderResultsTable(res) {
  const principaux = res.indicators.filter((i) => i.groupe === "principal" || i.afficher_par_defaut);
  const complementaires = res.indicators.filter((i) => !principaux.includes(i));

  const renderRows = (list) =>
    list
      .map((ind) => {
        const v = res.values[ind.id];
        return `
          <tr>
            <td><strong>${escapeHtml(ind.nom)}</strong></td>
            <td class="unit">${escapeHtml(ind.unite + res.suffixeUnite)}</td>
            <td class="num total-col">${formaterValeur(v.total, ind)}</td>
            <td class="num">${formaterValeur(v.fabrication, ind)}</td>
            <td class="num">${formaterValeur(v.elimination, ind)}</td>
          </tr>`;
      })
      .join("");

  const efSection = complementaires.length
    ? `
      <tr class="group-row">
        <td colspan="5">Indicateurs complémentaires — Méthode EF 3.1 (${complementaires.length} indicateurs)</td>
      </tr>
      ${renderRows(complementaires)}`
    : "";

  document.getElementById("results-table-wrap").innerHTML = `
    <table class="kbob-table">
      <thead>
        <tr>
          <th>Indicateur</th>
          <th>Unité</th>
          <th class="num">Total</th>
          <th class="num">${LABEL_FAB}</th>
          <th class="num">${LABEL_ELIM}</th>
        </tr>
      </thead>
      <tbody>
        <tr class="group-row">
          <td colspan="5">Indicateurs principaux KBOB</td>
        </tr>
        ${renderRows(principaux)}
        ${efSection}
      </tbody>
    </table>`;
}

function recalculateAndRender() {
  const warnings = [];
  let pVal = Number(state.puissanceKw);
  if (!Number.isFinite(pVal) || state.puissanceKw === "") {
    pVal = PUISSANCE_DEFAUT_KW;
  }
  if (pVal < PUISSANCE_MIN_KW || pVal > PUISSANCE_MAX_KW) {
    pVal = Math.max(PUISSANCE_MIN_KW, Math.min(PUISSANCE_MAX_KW, pVal));
    state.puissanceKw = pVal;
    document.getElementById("input-puissance").value = pVal;
    document.getElementById("range-puissance").value = pVal;
    warnings.push(`La puissance nominale a été bornée dans la plage étalonnée [${PUISSANCE_MIN_KW} ; ${PUISSANCE_MAX_KW} kW].`);
  }

  if (state.masseConnue && state.masseSaisieKg !== "" && Number(state.masseSaisieKg) <= 0) {
    warnings.push("La masse saisie doit être strictement positive : masse théorique utilisée par défaut.");
  }
  showWarning(warnings.join(" "));

  const res = calculerEcobilan({
    dataset: state.dataset,
    reglesMasse: state.reglesMasse,
    cadreEvaluation: CADRE_SIA_REGLEMENTAIRE,
    technologie: state.technologie,
    puissanceKw: pVal,
    fluideOptionId: state.fluideOptionId,
    masseConnue: state.masseConnue,
    masseSaisieKg: state.masseSaisieKg,
    scope: SCOPE_SIA_KBOB,
    uniteReference: state.uniteReference,
  });

  state.lastResult = res;
  renderInputSummaries(res);
  renderKpiCards(res);
  renderCharts(res);
  renderResultsTable(res);
}

function bindEvents() {
  const logo = document.getElementById("brand-logo");
  if (logo) {
    logo.addEventListener("error", () => {
      logo.style.display = "none";
    });
  }

  const inputP = document.getElementById("input-puissance");
  const rangeP = document.getElementById("range-puissance");

  rangeP.addEventListener("input", (e) => {
    state.puissanceKw = Number(e.target.value);
    inputP.value = state.puissanceKw;
    recalculateAndRender();
  });

  inputP.addEventListener("input", (e) => {
    const val = Number(e.target.value);
    if (Number.isFinite(val) && val >= PUISSANCE_MIN_KW && val <= PUISSANCE_MAX_KW) {
      state.puissanceKw = val;
      rangeP.value = val;
      recalculateAndRender();
    }
  });

  inputP.addEventListener("change", (e) => {
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
      document.getElementById("masse-saisie-wrap").style.display = state.masseConnue ? "block" : "none";
      recalculateAndRender();
    });
  });

  document.getElementById("input-masse").addEventListener("input", (e) => {
    state.masseSaisieKg = e.target.value;
    recalculateAndRender();
  });

  document.querySelectorAll("input[name='unite']").forEach((radio) => {
    radio.addEventListener("change", (e) => {
      state.uniteReference = e.target.value;
      recalculateAndRender();
    });
  });

  document.getElementById("input-projet").addEventListener("input", (e) => {
    state.projetNom = e.target.value;
  });

  document.getElementById("btn-export-xlsx").addEventListener("click", () => {
    if (state.lastResult) exportExcelKbob2027(state.lastResult, state.projetNom);
  });

  document.getElementById("btn-export-html").addEventListener("click", () => {
    if (state.lastResult) exportHtml(state.lastResult, state.projetNom);
  });

  document.getElementById("btn-export-csv").addEventListener("click", () => {
    if (state.lastResult) exportCsv(state.lastResult, state.projetNom);
  });

  document.getElementById("btn-print").addEventListener("click", () => {
    window.print();
  });
}

async function init() {
  try {
    const { dataset, reglesMasse } = await loadAllData();
    state.dataset = dataset;
    state.reglesMasse = reglesMasse;

    document.getElementById("dataset-label-display").textContent = dataset.label;

    renderTechSegmented();
    syncFluidesDropdown();
    bindEvents();
    recalculateAndRender();
  } catch (err) {
    console.error(err);
    showWarning(`Erreur lors du chargement des données CSV : ${err.message}`);
  }
}

document.addEventListener("DOMContentLoaded", init);