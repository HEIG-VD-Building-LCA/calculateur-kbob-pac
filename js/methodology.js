/**
 * js/methodology.js
 * Contrôleur interactif de l'onglet « Méthodologie & Données » (KBOB 2027 / projet LCA-PAC).
 * Utilise directement le moteur kbob_engine.js et les jeux de données chargés.
 */
import {
  CADRE_ECOBILAN_LIBRE,
  CADRE_SIA_REGLEMENTAIRE,
  SCOPE_FAB_ELIM,
  SCOPE_SIA_KBOB,
  UNITE_APPAREIL,
  calculerEcobilan,
  estimerMasseTheorique,
  formaterValeur,
} from "./kbob_engine.js";

const FLUID_CARDS = {
  hfc: {
    titre: "HFC générique (modélisé avec le R410A)",
    gwp: "2'256 kg CO₂-eq/kg (IPCC 2021)",
    ubp: "1'940'000 UBP/kg (émission)",
    priorite: "Dernière priorité (ecoCFC)",
    gain7kw: "Référence KBOB (100 %)",
    refKeys: ["HFC (R410A)"],
    description:
      "Donnée générique par défaut lorsqu'on ne connaît pas encore le réfrigérant en phase de planification, ou lorsque la PAC utilise un HFC à GWP élevé (R410A, R407C, R134a). Par principe de précaution vis-à-vis de la dégradation en TFA/PFAS, la HEIG-VD recommande également d'appliquer cette donnée aux fluides HFO et mélanges HFC/HFO.",
  },
  r32: {
    titre: "HFC spécifique — Difluorométhane (R32)",
    gwp: "771 kg CO₂-eq/kg (IPCC 2021)",
    ubp: "680'000 UBP/kg (émission)",
    priorite: "Dernière priorité (HFC)",
    gain7kw: "−36 % GES (−51 % y.c. fuites)",
    refKeys: ["HFC (R32)"],
    description:
      "Fluide HFC pur courant dans les PAC air-eau split et résidentielles (5–16 kW). Son pouvoir de réchauffement global est environ 3 fois inférieur à celui du R410A, entraînant une baisse de 35 à 44 % des GES (50 à 56 % avec les fuites sur 20 ans) et justifiant une entrée distincte dans la liste KBOB 2027.",
  },
  nat: {
    titre: "Réfrigérant naturel (modélisé avec le propane R290)",
    gwp: "0.02 kg CO₂-eq/kg (IPCC 2021)",
    ubp: "12'000 UBP/kg (émission)",
    priorite: "1ʳᵉ priorité (ecoCFC)",
    gain7kw: "−55 % GES (−77 % y.c. fuites)",
    refKeys: ["Naturel (R290)"],
    description:
      "Alternative bas carbone couvrant l'ensemble des réfrigérants naturels (propane R290, CO₂ R744, ammoniac R717, isobutane). Les fuites en fonctionnement deviennent quasi nulles sur le bilan climatique. Conforme à la révision de l'ORRChim / F-gas imposant un GWP < 150 dès le 1er juillet 2027 pour les monoblocs extérieures ≤ 50 kW.",
  },
};

const PRESETS = {
  ex_rapport: {
    tech: "Air-Eau",
    power: 10,
    massMode: "connue",
    massVal: 230,
    fluid: "r290",
    scope: SCOPE_FAB_ELIM,
    indicator: "ges",
  },
  ex_villa: {
    tech: "Air-Eau",
    power: 12,
    massMode: "inconnue",
    massVal: 265,
    fluid: "inconnu",
    scope: SCOPE_SIA_KBOB,
    indicator: "ges",
  },
  ex_collectif: {
    tech: "Saumure-Eau",
    power: 40,
    massMode: "connue",
    massVal: 340,
    fluid: "r32",
    scope: SCOPE_SIA_KBOB,
    indicator: "ges",
  },
  ex_ref50: {
    tech: "Air-Eau",
    power: 50,
    massMode: "connue",
    massVal: 781,
    fluid: "r290",
    scope: SCOPE_SIA_KBOB,
    indicator: "ges",
  },
};

function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function initMethodologyTab(state, onApplyScenario) {
  const ds2027 =
    state.datasets.find((d) => d.filename.includes("2027")) || state.datasets[0];
  if (!ds2027) return;

  // 1. Explorateur des 3 familles de fluides
  function renderFluidCard(key) {
    const info = FLUID_CARDS[key];
    const panel = document.getElementById("meth-fluid-panel");
    if (!info || !panel) return;

    const matchingOpts = ds2027.refrigerantOptions.filter((o) =>
      info.refKeys.includes(o.fluide_reference)
    );

    const chipsHtml = matchingOpts
      .map(
        (o) =>
          `<span class="fluid-opt-chip">✓ ${escapeHtml(o.label)}</span>`
      )
      .join("");

    panel.innerHTML = `
      <div class="fluid-kpis">
        <div class="fluid-kpi-item"><span>PRG / GWP₁₀₀ (AR6)</span><strong>${escapeHtml(info.gwp)}</strong></div>
        <div class="fluid-kpi-item"><span>Facteur UBP'21</span><strong>${escapeHtml(info.ubp)}</strong></div>
        <div class="fluid-kpi-item"><span>Classement ecobau</span><strong>${escapeHtml(info.priorite)}</strong></div>
        <div class="fluid-kpi-item"><span>Impact Air-eau 7 kW</span><strong>${escapeHtml(info.gain7kw)}</strong></div>
      </div>
      <p style="margin: 0; font-size: 0.91rem; color: var(--slate-700); line-height: 1.55;">
        ${escapeHtml(info.description)}
      </p>
      <div style="margin-top: 10px; font-size: 0.82rem; font-weight: 600; color: var(--slate-600);">
        Entrées du menu déroulant associées à cette donnée :
        <div class="fluid-options-chips">${chipsHtml}</div>
      </div>
    `;
  }

  document.querySelectorAll(".fluid-tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".fluid-tab-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      renderFluidCard(btn.dataset.fluidKey);
    });
  });
  renderFluidCard("hfc");

  // 2. Simulateur interactif pas-à-pas
  const elPreset = document.getElementById("meth-preset");
  const elTech = document.getElementById("meth-tech");
  const elPower = document.getElementById("meth-power");
  const elMassMode = document.getElementById("meth-mass-mode");
  const elMassWrap = document.getElementById("meth-mass-input-wrap");
  const elMassVal = document.getElementById("meth-mass-val");
  const elFluid = document.getElementById("meth-fluid");
  const elScope = document.getElementById("meth-scope");
  const elInd = document.getElementById("meth-indicator");

  function syncMassVisibility() {
    const isConnue = elMassMode.value === "connue";
    elMassWrap.style.display = isConnue ? "flex" : "none";
  }

  function updateSimulator() {
    const tech = elTech.value;
    let power = parseFloat(elPower.value);
    if (!Number.isFinite(power) || power < 1) power = 10;
    if (power > 100) power = 100;

    const masseConnue = elMassMode.value === "connue";
    const masseSaisie = parseFloat(elMassVal.value);
    const fluidId = elFluid.value;
    const scope = elScope.value;
    const indId = elInd.value;

    const cadre =
      scope === SCOPE_FAB_ELIM ? CADRE_ECOBILAN_LIBRE : CADRE_SIA_REGLEMENTAIRE;

    const resSelected = calculerEcobilan({
      dataset: ds2027,
      reglesMasse: state.reglesMasse,
      cadreEvaluation: cadre,
      technologie: tech,
      puissanceKw: power,
      fluideOptionId: fluidId,
      masseConnue,
      masseSaisieKg: masseSaisie,
      scope,
      uniteReference: UNITE_APPAREIL,
    });

    const indMeta =
      ds2027.indicators.find((i) => i.id === indId) || ds2027.indicators[1];
    const mInfo = resSelected.massInfo;
    const totalVal = resSelected.values[indMeta.id].total;
    const baseInterpVal = totalVal / mInfo.ratioMasse;

    // Trouver le segment actif de régression de masse
    const seg =
      state.reglesMasse.find(
        (r) =>
          r.technologie === tech &&
          ((r.p_min_kw === 1 && power <= r.p_max_kw) ||
            (power > r.p_min_kw && power <= r.p_max_kw))
      ) || state.reglesMasse.find((r) => r.technologie === tech);

    const eqMasseStr = seg
      ? `m = ${seg.a.toFixed(2)}×${power} + ${seg.b.toFixed(2)}`
      : `m_théo(${power} kW)`;

    // Rendu des 4 étapes
    const stepsEl = document.getElementById("meth-steps-container");
    stepsEl.innerHTML = `
      <div class="sim-step-card">
        <div>
          <div class="sim-step-tag">Étape 1 · Masse théorique m<sub>théo</sub></div>
          <div class="sim-step-formula">${escapeHtml(eqMasseStr)}</div>
        </div>
        <div class="sim-step-result">${mInfo.masseTheoriqueKg.toFixed(1)} kg</div>
      </div>

      <div class="sim-step-card">
        <div>
          <div class="sim-step-tag">Étape 2 · Ratio de masse r<sub>m</sub></div>
          <div class="sim-step-formula">${
            mInfo.masseConnue
              ? `${mInfo.masseUtiliseeKg.toFixed(1)} kg ÷ ${mInfo.masseTheoriqueKg.toFixed(1)} kg`
              : "Masse estimée (r_m = 1)"
          }</div>
        </div>
        <div class="sim-step-result">r<sub>m</sub> = ${mInfo.ratioMasse.toFixed(3)}</div>
      </div>

      <div class="sim-step-card">
        <div>
          <div class="sim-step-tag">Étape 3 · Interpolation (${escapeHtml(resSelected.fluideReference)})</div>
          <div class="sim-step-formula">Base interpolée à ${power} kW</div>
        </div>
        <div class="sim-step-result">${formaterValeur(baseInterpVal, indMeta)} ${escapeHtml(indMeta.unite)}</div>
      </div>

      <div class="sim-step-card highlight">
        <div>
          <div class="sim-step-tag">Étape 4 · Résultat final × r<sub>m</sub></div>
          <div class="sim-step-formula">${formaterValeur(baseInterpVal, indMeta)} × ${mInfo.ratioMasse.toFixed(3)}</div>
        </div>
        <div class="sim-step-result">${formaterValeur(totalVal, indMeta)} ${escapeHtml(indMeta.unite)}</div>
      </div>
    `;

    // Comparaison des 3 familles de fluides
    const variants = [
      { id: "inconnu", label: "HFC générique (R410A)", fillClass: "fill-hfc" },
      { id: "r32", label: "HFC spécifique (R32)", fillClass: "fill-r32" },
      { id: "r290", label: "Naturel (R290 / propane)", fillClass: "fill-nat" },
    ];

    const computedVariants = variants.map((v) => {
      const r = calculerEcobilan({
        dataset: ds2027,
        reglesMasse: state.reglesMasse,
        cadreEvaluation: cadre,
        technologie: tech,
        puissanceKw: power,
        fluideOptionId: v.id,
        masseConnue,
        masseSaisieKg: masseSaisie,
        scope,
        uniteReference: UNITE_APPAREIL,
      });
      return { ...v, val: r.values[indMeta.id].total };
    });

    const maxVal = Math.max(...computedVariants.map((x) => x.val), 1e-9);
    const refHfcVal = computedVariants[0].val;

    document.getElementById("meth-compare-subtitle").textContent =
      `PAC ${tech} · ${power} kW · ${mInfo.masseUtiliseeKg.toFixed(1)} kg · ${indMeta.nom}`;

    document.getElementById("meth-compare-bars").innerHTML = computedVariants
      .map((item) => {
        const pct = Math.min(100, (item.val / maxVal) * 100);
        const isSel = item.id === fluidId;
        let deltaHtml = "";
        if (item.id !== "inconnu" && refHfcVal > 0) {
          const diffPct = Math.round(((item.val - refHfcVal) / refHfcVal) * 100);
          deltaHtml = `<span class="delta-badge">${diffPct > 0 ? "+" : ""}${diffPct} %</span>`;
        }
        return `
          <div class="compare-bar-row ${isSel ? "selected" : ""}">
            <div>${escapeHtml(item.label)}</div>
            <div class="compare-track">
              <div class="compare-fill ${item.fillClass}" style="width: ${pct.toFixed(1)}%;"></div>
            </div>
            <div class="compare-val">
              ${formaterValeur(item.val, indMeta)} ${escapeHtml(indMeta.unite)}${deltaHtml}
            </div>
          </div>
        `;
      })
      .join("");
  }

  elPreset.addEventListener("change", () => {
    const p = PRESETS[elPreset.value];
    if (!p) return;
    elTech.value = p.tech;
    elPower.value = p.power;
    elMassMode.value = p.massMode;
    elMassVal.value = p.massVal;
    elFluid.value = p.fluid;
    elScope.value = p.scope;
    elInd.value = p.indicator;
    syncMassVisibility();
    updateSimulator();
  });

  [elTech, elPower, elMassMode, elMassVal, elFluid, elScope, elInd].forEach((el) => {
    el.addEventListener("input", () => {
      elPreset.value = "custom";
      syncMassVisibility();
      updateSimulator();
    });
  });

  // Bouton d'envoi vers le calculateur principal
  const btnApply = document.getElementById("btn-apply-example");
  if (btnApply && typeof onApplyScenario === "function") {
    btnApply.addEventListener("click", () => {
      onApplyScenario({
        technologie: elTech.value,
        puissanceKw: parseFloat(elPower.value) || 10,
        fluideOptionId: elFluid.value,
        masseConnue: elMassMode.value === "connue",
        masseSaisieKg: elMassVal.value,
        scope: elScope.value,
        cadreEvaluation:
          elScope.value === SCOPE_FAB_ELIM
            ? CADRE_ECOBILAN_LIBRE
            : CADRE_SIA_REGLEMENTAIRE,
      });
    });
  }

  syncMassVisibility();
  updateSimulator();
}