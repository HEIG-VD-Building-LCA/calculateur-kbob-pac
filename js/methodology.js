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

  function buildInterpolationDetails(tech, fluideRef, power, scope, indMeta, reglesMasse) {
    const sub = ds2027.rows.filter(
      (r) => r.technologie === tech && r.fluide === fluideRef
    );
    const pRefs = Array.from(new Set(sub.map((r) => r.puissance_kw))).sort((a, b) => a - b);

    const getRefTotal = (pTarget) => {
      const rowsP = sub.filter((r) => r.puissance_kw === pTarget);
      const vFab = rowsP.find((r) => r.phase === "fabrication")?.[indMeta.id] || 0;
      const vB1 = rowsP.find((r) => r.phase === "fuites_usage")?.[indMeta.id] || 0;
      const vElim = rowsP.find((r) => r.phase === "elimination")?.[indMeta.id] || 0;
      return scope === SCOPE_FAB_ELIM ? vFab + vElim : vFab + vB1 + vElim;
    };

    const pMin = pRefs[0];
    const pMax = pRefs[pRefs.length - 1];

    if (pRefs.includes(power)) {
      const valExact = getRefTotal(power);
      return {
        formula: `Donnée directe au palier ${power} kW`,
        explain: `La puissance choisie (<strong>${power} kW</strong>) correspond exactement à l'un des trois modèles de référence Carbotech / BAFU:2026v1 (7, 15 et 50 kW). Aucune interpolation n'est requise : on lit directement <strong>${formaterValeur(valExact, indMeta)} ${escapeHtml(indMeta.unite)}</strong>.`,
      };
    }

    if (power > pMin && power < pMax) {
      let p0 = pMin;
      let p1 = pMax;
      for (let i = 0; i < pRefs.length - 1; i++) {
        if (power > pRefs[i] && power < pRefs[i + 1]) {
          p0 = pRefs[i];
          p1 = pRefs[i + 1];
          break;
        }
      }
      const v0 = getRefTotal(p0);
      const v1 = getRefTotal(p1);
      const t = (power - p0) / (p1 - p0);
      const pctT = (t * 100).toFixed(1);
      return {
        formula: `I(${p0}) + ${pctT} % × [I(${p1}) − I(${p0})]`,
        explain: `<strong>${power} kW</strong> se situe entre les références <strong>${p0} kW</strong> (${formaterValeur(v0, indMeta)} ${escapeHtml(indMeta.unite)}) et <strong>${p1} kW</strong> (${formaterValeur(v1, indMeta)} ${escapeHtml(indMeta.unite)}). Le poids d'interpolation vaut <code>t = (${power} − ${p0}) / (${p1} − ${p0}) = ${pctT} %</code>, d'où une interpolation linéaire continue entre ces deux machines.`,
      };
    }

    const pBorne = power < pMin ? pMin : pMax;
    const vBorne = getRefTotal(pBorne);
    const mP = estimerMasseTheorique(reglesMasse, tech, power, ds2027.rows).masse;
    const mBorne = estimerMasseTheorique(reglesMasse, tech, pBorne, ds2027.rows).masse;
    const fExtrap = mP / mBorne;

    return {
      formula: `I(${pBorne} kW) × (${mP.toFixed(1)} ÷ ${mBorne.toFixed(1)})`,
      explain: `Hors de la plage couverte par les modèles de référence [${pMin} ; ${pMax} kW], l'impact est extrapolé depuis le palier le plus proche (<strong>${pBorne} kW</strong> = ${formaterValeur(vBorne, indMeta)} ${escapeHtml(indMeta.unite)}) au prorata de la masse théorique : facteur <code>${mP.toFixed(1)} / ${mBorne.toFixed(1)} = ${fExtrap.toFixed(3)}</code>.`,
    };
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

    // Calcul séparé des 3 phases (A1-A3, B1, C1-C4) pour la décomposition pédagogique
    const resSplit = calculerEcobilan({
      dataset: ds2027,
      reglesMasse: state.reglesMasse,
      cadreEvaluation: CADRE_ECOBILAN_LIBRE,
      technologie: tech,
      puissanceKw: power,
      fluideOptionId: fluidId,
      masseConnue,
      masseSaisieKg: masseSaisie,
      scope: "sia_separe",
      uniteReference: UNITE_APPAREIL,
    });

    const indMeta =
      ds2027.indicators.find((i) => i.id === indId) || ds2027.indicators[1];
    const mInfo = resSelected.massInfo;
    const totalVal = resSelected.values[indMeta.id].total;
    const baseInterpVal = totalVal / mInfo.ratioMasse;

    // Segment de masse actif
    const seg =
      state.reglesMasse.find(
        (r) =>
          r.technologie === tech &&
          ((r.p_min_kw === 1 && power <= r.p_max_kw) ||
            (power > r.p_min_kw && power <= r.p_max_kw))
      ) || state.reglesMasse.find((r) => r.technologie === tech);

    const eqMasseStr = seg
      ? `m = ${seg.a.toFixed(2)} × ${power} + ${seg.b.toFixed(2)}`
      : `m_théo(${power} kW)`;

    const step1Explain = seg
      ? `Sur le segment <strong>]${seg.p_min_kw} ; ${seg.p_max_kw} kW]</strong> (${escapeHtml(tech)}), le modèle continu LCA-PAC (régression LOWESS calibrée sur 214 PAC et ancrée sur 7, 15 et 50 kW) estime la masse standard d'une machine du marché.`
      : `Estimation de la masse standard de référence pour ${power} kW.`;

    let step2Formula = "Masse inconnue ⇒ r_m = 1.000";
    let step2Explain =
      "Aucune masse constructeur n'étant renseignée, la machine est supposée conforme à la masse théorique du marché : aucun facteur correctif n'est appliqué (<code>r_m = 1.000</code>).";
    if (mInfo.masseConnue) {
      const diffMassPct = ((mInfo.ratioMasse - 1) * 100).toFixed(1);
      const compTxt =
        mInfo.ratioMasse < 1
          ? `<strong>${Math.abs(diffMassPct)} % plus légère</strong>`
          : mInfo.ratioMasse > 1
          ? `<strong>${diffMassPct} % plus lourde</strong>`
          : "de masse identique";
      step2Formula = `${mInfo.masseUtiliseeKg.toFixed(1)} kg ÷ ${mInfo.masseTheoriqueKg.toFixed(1)} kg`;
      step2Explain = `Votre machine (${mInfo.masseUtiliseeKg.toFixed(1)} kg) est ${compTxt} que la référence théorique (${mInfo.masseTheoriqueKg.toFixed(1)} kg). Ce ratio <code>r_m</code> ajuste proportionnellement les matériaux et la charge de réfrigérant.`;
    }

    const interpInfo = buildInterpolationDetails(
      tech,
      resSelected.fluideReference,
      power,
      scope,
      indMeta,
      state.reglesMasse
    );

    // Ventilation par phase du résultat final
    const pVals = resSplit.values[indMeta.id];
    const vFab = pVals.fabrication;
    const vB1 = scope === SCOPE_FAB_ELIM ? 0 : pVals.fuites_usage;
    const vElim = pVals.elimination;
    const pctOf = (x) => (totalVal > 0 ? ((x / totalVal) * 100).toFixed(0) : "0");

    const phaseBreakdownHtml =
      scope === SCOPE_FAB_ELIM
        ? `Ventilation : Fabrication (A1–A3) = <strong>${formaterValeur(vFab, indMeta)}</strong> (${pctOf(vFab)} %) + Élimination (C1–C4) = <strong>${formaterValeur(vElim, indMeta)}</strong> (${pctOf(vElim)} %). <em>Fuites B1 exclues.</em>`
        : `Ventilation SIA 390/1 : Fabrication (A1–A3) = <strong>${formaterValeur(vFab, indMeta)}</strong> (${pctOf(vFab)} %) + Fuites 20 ans (B1) = <strong>${formaterValeur(vB1, indMeta)}</strong> (${pctOf(vB1)} %) + Élimination (C1–C4) = <strong>${formaterValeur(vElim, indMeta)}</strong> (${pctOf(vElim)} %).`;

    // Rendu des 4 étapes détaillées
    const stepsEl = document.getElementById("meth-steps-container");
    stepsEl.innerHTML = `
      <div class="sim-step-card">
        <div class="sim-step-top">
          <span class="sim-step-tag">Étape 1 · Masse théorique m<sub>théo</sub></span>
          <span class="sim-step-result">${mInfo.masseTheoriqueKg.toFixed(1)} kg</span>
        </div>
        <div class="sim-step-formula">${escapeHtml(eqMasseStr)}</div>
        <p class="sim-step-desc">${step1Explain}</p>
      </div>

      <div class="sim-step-card">
        <div class="sim-step-top">
          <span class="sim-step-tag">Étape 2 · Ratio de masse r<sub>m</sub></span>
          <span class="sim-step-result">r<sub>m</sub> = ${mInfo.ratioMasse.toFixed(3)}</span>
        </div>
        <div class="sim-step-formula">${step2Formula}</div>
        <p class="sim-step-desc">${step2Explain}</p>
      </div>

      <div class="sim-step-card">
        <div class="sim-step-top">
          <span class="sim-step-tag">Étape 3 · Interpolation (${escapeHtml(resSelected.fluideReference)})</span>
          <span class="sim-step-result">${formaterValeur(baseInterpVal, indMeta)} ${escapeHtml(indMeta.unite)}</span>
        </div>
        <div class="sim-step-formula">${interpInfo.formula}</div>
        <p class="sim-step-desc">${interpInfo.explain}</p>
      </div>

      <div class="sim-step-card highlight">
        <div class="sim-step-top">
          <span class="sim-step-tag">Étape 4 · Résultat final × r<sub>m</sub></span>
          <span class="sim-step-result">${formaterValeur(totalVal, indMeta)} ${escapeHtml(indMeta.unite)}</span>
        </div>
        <div class="sim-step-formula">${formaterValeur(baseInterpVal, indMeta)} × ${mInfo.ratioMasse.toFixed(3)}</div>
        <p class="sim-step-desc">${phaseBreakdownHtml}</p>
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