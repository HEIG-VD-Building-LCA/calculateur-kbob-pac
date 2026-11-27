/**
 * js/app.js
 * Contrôleur page unique multilingue (FR / DE / IT / EN).
 * Base fixe : BAFU:2026v1 | Périmètre fixe : KBOB 2027 (Fabrication¹ et élimination).
 * 3 indicateurs de screening en KPI & graphiques (UBP'21, GES fossiles, NRE).
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
import {
  exportCsv,
  exportExcelKbob2027,
  exportHtml,
  exportPdf,
} from "./exporters.js";
import {
  buildConfiguredTitle,
  detectInitialLang,
  getPack,
  localizeFluidOption,
  localizeIndicator,
  localizeTech,
  localizeUnite,
  normalizeLang,
  saveLang,
  t,
} from "./i18n.js";

const SCREENING_IDS = ["ubp", "ges", "nre"];

const PHASE_COLORS = {
  fabrication: "#2b7a78",
  elimination: "#d97742",
};

let activeCharts = [];
let copyResetTimer = null;

const state = {
  lang: detectInitialLang(),
  dataset: null,
  reglesMasse: [],
  technologie: "",
  puissanceKw: PUISSANCE_DEFAUT_KW,
  fluideOptionId: "",
  masseConnue: false,
  masseSaisieKg: "",
  uniteReference: UNITE_APPAREIL,
  showKbob: true,
  showEf31: false,
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

function splitIndicators(res) {
  const localized = res.indicators.map((i) => localizeIndicator(i, state.lang));
  const principaux = localized.filter((i) => i.groupe === "principal" || i.afficher_par_defaut);
  const complementaires = localized.filter((i) => !principaux.includes(i));
  const screening = SCREENING_IDS
    .map((id) => principaux.find((i) => i.id === id))
    .filter(Boolean);
  return {
    principaux,
    complementaires,
    screening: screening.length ? screening : principaux.slice(0, 3),
  };
}

function applyStaticTranslations() {
  const lang = state.lang;
  const pack = getPack(lang);

  document.documentElement.lang = lang;
  document.title = t(lang, "pageTitle");

  document.querySelectorAll(".lang-btn").forEach((btn) => {
    const isActive = btn.dataset.lang === lang;
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-pressed", String(isActive));
  });

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(lang, el.dataset.i18n);
  });

  document.querySelectorAll("[data-i18n-html]").forEach((el) => {
    el.innerHTML = t(lang, el.dataset.i18nHtml);
  });

  document.getElementById("unit-lbl-appareil").textContent = localizeUnite("appareil", lang, "short");
  document.getElementById("unit-lbl-kw").textContent = localizeUnite("kw", lang, "short");
  document.getElementById("unit-lbl-kg").textContent = localizeUnite("kg", lang, "short");

  const docMethodo = document.getElementById("doc-methodo-link");
  const docCdc = document.getElementById("doc-cdc-link");
  if (docMethodo && pack.docs?.methodo) docMethodo.setAttribute("href", pack.docs.methodo);
  if (docCdc && pack.docs?.cdc) docCdc.setAttribute("href", pack.docs.cdc);

  clearTimeout(copyResetTimer);
  const copyBtn = document.getElementById("btn-copy-tables");
  if (copyBtn) {
    copyBtn.classList.remove("btn-copied");
    copyBtn.textContent = t(lang, "copyTablesBtn");
  }
}

function setLanguage(newLang) {
  state.lang = normalizeLang(newLang);
  saveLang(state.lang);
  applyStaticTranslations();

  if (state.dataset) {
    renderTechSegmented();
    syncFluidesDropdown();
    recalculateAndRender();
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
      const label = localizeTech(tech, state.lang);
      return `
        <label class="seg-option">
          <input type="radio" name="technologie" value="${escapeHtml(tech)}" ${checked} />
          <span>${escapeHtml(label)}</span>
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
  const opts = ds.refrigerantOptions
    .filter((o) => dispo.has(o.fluide_reference))
    .map((o) => localizeFluidOption(o, state.lang));

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
  const lang = state.lang;
  const m = res.massInfo;
  const massSummaryEl = document.getElementById("mass-summary");

  if (!state.masseConnue) {
    massSummaryEl.style.display = "block";
    massSummaryEl.innerHTML = `${escapeHtml(t(lang, "massUsedPrefix"))} <strong>${m.masseUtiliseeKg.toFixed(1)} kg</strong>`;
  } else {
    massSummaryEl.style.display = "none";
    massSummaryEl.innerHTML = "";
  }

  const massInput = document.getElementById("input-masse");
  if (massInput) {
    massInput.placeholder = `${t(lang, "massExamplePrefix")} ${Math.round(m.masseTheoriqueKg)}`;
  }

  document.getElementById("results-subtitle").textContent = buildConfiguredTitle(res, lang, true);
}

function renderKpiCards(res) {
  const lang = state.lang;
  const { screening } = splitIndicators(res);
  const fabLabel = t(lang, "phaseFab");
  const elimLabel = t(lang, "phaseElim");

  document.getElementById("kpi-cards").innerHTML = screening
    .map((ind) => {
      const v = res.values[ind.id];
      return `
        <div class="kpi-card">
          <div class="kpi-title">${escapeHtml(ind.nom_court)}</div>
          <div class="kpi-value">${formaterValeur(v.total, ind)}</div>
          <div class="kpi-unit">${escapeHtml(ind.unite + res.suffixeUnite)}</div>
          <div class="kpi-split">
            <div class="kpi-split-row">
              <span class="kpi-phase-label"><span class="phase-dot dot-fab"></span>${escapeHtml(fabLabel)}</span>
              <strong>${formaterValeur(v.fabrication, ind)}</strong>
            </div>
            <div class="kpi-split-row">
              <span class="kpi-phase-label"><span class="phase-dot dot-elim"></span>${escapeHtml(elimLabel)}</span>
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

  const lang = state.lang;
  const container = document.getElementById("charts-grid");
  if (typeof window.Chart === "undefined") {
    container.innerHTML = `<p class="field-note">${escapeHtml(t(lang, "chartsOffline"))}</p>`;
    return;
  }

  const { screening } = splitIndicators(res);
  const fabLabel = t(lang, "phaseFab");
  const elimLabel = t(lang, "phaseElim");
  const locale = getPack(lang).locale;

  container.innerHTML = screening
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

  screening.forEach((ind, idx) => {
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
            label: fabLabel,
            data: [vals.fabrication || 0],
            backgroundColor: PHASE_COLORS.fabrication,
            borderRadius: 2,
            barThickness: 54,
          },
          {
            label: elimLabel,
            data: [vals.elimination || 0],
            backgroundColor: PHASE_COLORS.elimination,
            borderRadius: 2,
            barThickness: 54,
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
                return `${context.dataset.label}: ${formaterValeur(v, ind)} ${ind.unite}${res.suffixeUnite} (${pct} %)`;
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
              callback: (value) => Number(value).toLocaleString(locale),
            },
          },
        },
      },
    });
    activeCharts.push(chart);
  });
}

function renderResultsTable(res) {
  const lang = state.lang;
  const { principaux, complementaires } = splitIndicators(res);
  const copyBtn = document.getElementById("btn-copy-tables");
  const wrap = document.getElementById("results-table-wrap");

  if (!state.showKbob && !state.showEf31) {
    copyBtn.disabled = true;
    wrap.innerHTML = `<div class="empty-table-msg">${escapeHtml(t(lang, "emptyTableMsg"))}</div>`;
    return;
  }

  copyBtn.disabled = false;

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

  const showGroupHeaders = state.showKbob && state.showEf31;
  let bodyHtml = "";

  if (state.showKbob) {
    if (showGroupHeaders) {
      bodyHtml += `<tr class="group-row"><td colspan="5">${escapeHtml(t(lang, "groupKbob"))}</td></tr>`;
    }
    bodyHtml += renderRows(principaux);
  }

  if (state.showEf31 && complementaires.length) {
    if (showGroupHeaders) {
      bodyHtml += `<tr class="group-row"><td colspan="5">${escapeHtml(
        t(lang, "groupEf31", { count: complementaires.length })
      )}</td></tr>`;
    }
    bodyHtml += renderRows(complementaires);
  }

  wrap.innerHTML = `
    <table class="kbob-table">
      <thead>
        <tr>
          <th>${escapeHtml(t(lang, "colIndicator"))}</th>
          <th>${escapeHtml(t(lang, "colUnit"))}</th>
          <th class="num">${escapeHtml(t(lang, "colTotal"))}</th>
          <th class="num">${escapeHtml(t(lang, "phaseFab"))}</th>
          <th class="num">${escapeHtml(t(lang, "phaseElim"))}</th>
        </tr>
      </thead>
      <tbody>${bodyHtml}</tbody>
    </table>`;
}

function formatNumberForExcelPaste(val, ind) {
  if (!Number.isFinite(val)) return "";
  if (ind.notation_scientifique) {
    return val.toExponential(3);
  }
  const dec = ind.decimales ?? 2;
  return val.toFixed(dec);
}

async function copyActiveTablesToClipboard() {
  const res = state.lastResult;
  if (!res || (!state.showKbob && !state.showEf31)) return;

  const lang = state.lang;
  const { principaux, complementaires } = splitIndicators(res);
  const lines = [buildConfiguredTitle(res, lang, true), ""];
  const headerRow = [
    t(lang, "colIndicator"),
    t(lang, "colUnit"),
    t(lang, "colTotal"),
    t(lang, "phaseFab"),
    t(lang, "phaseElim"),
  ].join("\t");

  const appendBlock = (title, list) => {
    if (state.showKbob && state.showEf31) {
      lines.push(title);
    }
    lines.push(headerRow);
    for (const ind of list) {
      const v = res.values[ind.id];
      lines.push(
        [
          ind.nom,
          `${ind.unite}${res.suffixeUnite}`,
          formatNumberForExcelPaste(v.total, ind),
          formatNumberForExcelPaste(v.fabrication, ind),
          formatNumberForExcelPaste(v.elimination, ind),
        ].join("\t")
      );
    }
  };

  if (state.showKbob) {
    appendBlock(t(lang, "groupKbob"), principaux);
  }
  if (state.showEf31 && complementaires.length) {
    if (state.showKbob) lines.push("");
    appendBlock(t(lang, "checkEf31"), complementaires);
  }
  lines.push("");
  lines.push(t(lang, "footnoteText"));

  const tsv = lines.join("\r\n");

  let copied = false;
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(tsv);
      copied = true;
    }
  } catch {
    copied = false;
  }

  if (!copied) {
    const ta = document.createElement("textarea");
    ta.value = tsv;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      copied = document.execCommand("copy");
    } catch {
      copied = false;
    }
    document.body.removeChild(ta);
  }

  const btn = document.getElementById("btn-copy-tables");
  if (copied && btn) {
    clearTimeout(copyResetTimer);
    btn.textContent = t(state.lang, "copiedBtn");
    btn.classList.add("btn-copied");
    copyResetTimer = setTimeout(() => {
      btn.textContent = t(state.lang, "copyTablesBtn");
      btn.classList.remove("btn-copied");
    }, 2200);
  }
}

function recalculateAndRender() {
  const lang = state.lang;
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
    warnings.push(t(lang, "warnPowerClamped", { min: PUISSANCE_MIN_KW, max: PUISSANCE_MAX_KW }));
  }

  if (state.masseConnue && state.masseSaisieKg !== "" && Number(state.masseSaisieKg) <= 0) {
    warnings.push(t(lang, "warnMassInvalid"));
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

  res.fluideOptionId = state.fluideOptionId;

  state.lastResult = res;
  renderInputSummaries(res);
  renderKpiCards(res);
  renderCharts(res);
  renderResultsTable(res);
}

function bindEvents() {
  // Masque proprement tout logo manquant (ex. logo_ofen.png avant dépôt)
  document.querySelectorAll(".safe-logo").forEach((img) => {
    const hide = () => {
      img.style.display = "none";
    };
    img.addEventListener("error", hide);
    if (img.complete && img.naturalWidth === 0) {
      hide();
    }
  });

  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.dataset.lang && btn.dataset.lang !== state.lang) {
        setLanguage(btn.dataset.lang);
      }
    });
  });

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

  document.getElementById("cb-show-kbob").addEventListener("change", (e) => {
    state.showKbob = e.target.checked;
    if (state.lastResult) renderResultsTable(state.lastResult);
  });

  document.getElementById("cb-show-ef31").addEventListener("change", (e) => {
    state.showEf31 = e.target.checked;
    if (state.lastResult) renderResultsTable(state.lastResult);
  });

  document.getElementById("btn-copy-tables").addEventListener("click", copyActiveTablesToClipboard);

  document.getElementById("btn-export-xlsx").addEventListener("click", () => {
    if (state.lastResult) exportExcelKbob2027(state.lastResult, state.lang);
  });

  document.getElementById("btn-export-csv").addEventListener("click", () => {
    if (state.lastResult) exportCsv(state.lastResult, state.lang);
  });

  document.getElementById("btn-export-html").addEventListener("click", () => {
    if (state.lastResult) {
      exportHtml(state.lastResult, {
        lang: state.lang,
        showKbob: state.showKbob,
        showEf31: state.showEf31,
      });
    }
  });

  document.getElementById("btn-export-pdf").addEventListener("click", () => {
    if (state.lastResult) {
      exportPdf(state.lastResult, {
        lang: state.lang,
        showKbob: state.showKbob,
        showEf31: state.showEf31,
      });
    }
  });
}

async function init() {
  applyStaticTranslations();
  bindEvents();

  try {
    const { dataset, reglesMasse } = await loadAllData();
    state.dataset = dataset;
    state.reglesMasse = reglesMasse;

    renderTechSegmented();
    syncFluidesDropdown();
    recalculateAndRender();
  } catch (err) {
    console.error(err);
    showWarning(t(state.lang, "errLoadCsv", { msg: err.message }));
  }
}

document.addEventListener("DOMContentLoaded", init);