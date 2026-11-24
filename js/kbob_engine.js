/**
 * js/kbob_engine.js
 * Moteur de calcul d'écobilan KBOB (portage exact de core/mass_model.py + core/kbob_engine.py).
 */

export const PUISSANCE_MIN_KW = 1.0;
export const PUISSANCE_MAX_KW = 100.0;
export const PUISSANCE_DEFAUT_KW = 10.0;

export const CADRE_SIA_REGLEMENTAIRE = "sia_390_1";
export const CADRE_ECOBILAN_LIBRE = "libre";

export const SCOPE_SIA_KBOB = "sia_kbob";
export const SCOPE_SIA_SEPARE = "sia_separe";
export const SCOPE_FAB_ELIM = "fab_elim";

export const UNITE_APPAREIL = "appareil";
export const UNITE_PAR_KW = "kw";
export const UNITE_PAR_KG = "kg";

export const CADRE_LABELS = {
  [CADRE_SIA_REGLEMENTAIRE]: "Calcul selon SIA 390/1 ou labels / réglementations (Minergie-ECO, SNBS, etc.)",
  [CADRE_ECOBILAN_LIBRE]: "Écobilan libre (choix manuel du périmètre)",
};

export const SCOPE_LABELS = {
  [SCOPE_SIA_KBOB]: "Fabrication (y.c. fuites en usage B1 — 2 %/an sur 20 ans) et élimination (à utiliser pour un calcul SIA 390/1)",
  [SCOPE_SIA_SEPARE]: "Fabrication, fuites en usage (B1) et élimination — vue détaillée (à utiliser pour un calcul SIA 390/1)",
  [SCOPE_FAB_ELIM]: "Fabrication et élimination (A1–A3 / C1–C4)",
};

export const UNITE_LABELS = {
  [UNITE_APPAREIL]: "Par appareil (unité PAC)",
  [UNITE_PAR_KW]: "Par kW de puissance nominale",
  [UNITE_PAR_KG]: "Par kg de PAC",
};

function interp1d(x, xs, ys) {
  const n = xs.length;
  if (n === 0) return 0.0;
  if (n === 1 || x <= xs[0]) return ys[0];
  if (x >= xs[n - 1]) return ys[n - 1];
  for (let i = 0; i < n - 1; i++) {
    if (x >= xs[i] && x <= xs[i + 1]) {
      const dx = xs[i + 1] - xs[i];
      if (dx === 0) return ys[i];
      const t = (x - xs[i]) / dx;
      return ys[i] + t * (ys[i + 1] - ys[i]);
    }
  }
  return ys[n - 1];
}

export function estimerMasseTheorique(reglesMasse, technologie, puissanceKw, datasetRows = []) {
  const p = Number(puissanceKw);
  const sub = reglesMasse
    .filter((r) => r.technologie === technologie)
    .sort((a, b) => a.p_min_kw - b.p_min_kw);

  if (sub.length > 0) {
    let selected = null;
    for (let i = 0; i < sub.length; i++) {
      const row = sub[i];
      if (i === 0 && p <= row.p_max_kw) {
        selected = row;
        break;
      }
      if (p > row.p_min_kw && p <= row.p_max_kw) {
        selected = row;
        break;
      }
    }
    if (!selected) selected = sub[sub.length - 1];
    const masse = Math.max(selected.a * p + selected.b, 1.0);
    return { masse, source: selected.source };
  }

  const seen = new Map();
  for (const r of datasetRows) {
    if (r.technologie === technologie && !seen.has(r.puissance_kw)) {
      seen.set(r.puissance_kw, r.masse_ref_kg);
    }
  }
  const pts = Array.from(seen.entries()).sort((a, b) => a[0] - b[0]);
  if (pts.length > 0) {
    const xs = pts.map((x) => x[0]);
    const ys = pts.map((x) => x[1]);
    let masse;
    if (pts.length === 1 || p < xs[0]) {
      masse = ys[0] * (p / xs[0]);
    } else if (p > xs[xs.length - 1]) {
      const slope = (ys[ys.length - 1] - ys[ys.length - 2]) / (xs[xs.length - 1] - xs[xs.length - 2]);
      masse = ys[ys.length - 1] + slope * (p - xs[xs.length - 1]);
    } else {
      masse = interp1d(p, xs, ys);
    }
    return { masse: Math.max(masse, 1.0), source: "Interpolation automatique (masse_ref_kg)" };
  }

  throw new Error(`Aucune règle de masse disponible pour la technologie '${technologie}'.`);
}

export function calculerEcobilan({
  dataset,
  reglesMasse,
  cadreEvaluation,
  technologie,
  puissanceKw,
  fluideOptionId,
  masseConnue,
  masseSaisieKg,
  scope,
  uniteReference,
}) {
  const p = Number(puissanceKw);

  const optsTech = dataset.refrigerantOptions.filter((o) =>
    (dataset.fluidesParTech[technologie] || []).includes(o.fluide_reference)
  );
  const refOpt =
    optsTech.find((o) => o.id === fluideOptionId || o.label === fluideOptionId) ||
    optsTech[0];

  let scopeEffectif = scope;
  if (cadreEvaluation === CADRE_SIA_REGLEMENTAIRE && scope === SCOPE_FAB_ELIM) {
    scopeEffectif = SCOPE_SIA_KBOB;
  }

  const { masse: mTheo, source: sourceMasse } = estimerMasseTheorique(
    reglesMasse,
    technologie,
    p,
    dataset.rows
  );

  let mUtilisee = mTheo;
  let ratioMasse = 1.0;
  let isMasseConnueEffective = false;
  let attenteSaisieMasse = false;

  if (masseConnue) {
    const mParsed = Number(masseSaisieKg);
    if (Number.isFinite(mParsed) && mParsed > 0) {
      mUtilisee = mParsed;
      ratioMasse = mParsed / mTheo;
      isMasseConnueEffective = true;
    } else {
      attenteSaisieMasse = true;
    }
  }

  const sub = dataset.rows.filter(
    (r) => r.technologie === technologie && r.fluide === refOpt.fluide_reference
  );
  if (!sub.length) {
    throw new Error(`Aucune donnée pour (${technologie}, ${refOpt.fluide_reference}).`);
  }

  const pRefs = Array.from(new Set(sub.map((r) => r.puissance_kw))).sort((a, b) => a - b);
  const pMinRef = pRefs[0];
  const pMaxRef = pRefs[pRefs.length - 1];

  let pEval = p;
  let facteurExtrap = 1.0;
  let methodeStr = "";

  if (p >= pMinRef && p <= pMaxRef) {
    methodeStr = `Interpolation linéaire directe sur les puissances de référence [${pRefs.join(", ")}] kW`;
  } else if (p < pMinRef) {
    const { masse: mRef } = estimerMasseTheorique(reglesMasse, technologie, pMinRef, dataset.rows);
    facteurExtrap = mTheo / mRef;
    pEval = pMinRef;
    methodeStr = `Extrapolation continue sous ${pMinRef} kW (ancrage à ${pMinRef} kW × m_théo(P)/m_théo(${pMinRef} kW) = ${facteurExtrap.toFixed(3)})`;
  } else {
    const { masse: mRef } = estimerMasseTheorique(reglesMasse, technologie, pMaxRef, dataset.rows);
    facteurExtrap = mTheo / mRef;
    pEval = pMaxRef;
    methodeStr = `Extrapolation continue au-delà de ${pMaxRef} kW (ancrage à ${pMaxRef} kW × m_théo(P)/m_théo(${pMaxRef} kW) = ${facteurExtrap.toFixed(3)})`;
  }

  let facteurEchelle = 1.0;
  let suffixeUnite = "";
  if (uniteReference === UNITE_PAR_KW) {
    facteurEchelle = 1.0 / p;
    suffixeUnite = "/kW";
  } else if (uniteReference === UNITE_PAR_KG) {
    facteurEchelle = 1.0 / mUtilisee;
    suffixeUnite = "/kg";
  }

  const phasesActives =
    scopeEffectif === SCOPE_SIA_SEPARE
      ? ["fabrication", "fuites_usage", "elimination"]
      : ["fabrication", "elimination"];

  const values = {};
  for (const ind of dataset.indicators) {
    const getPhaseBase = (phaseName) => {
      const rowsP = sub
        .filter((r) => r.phase === phaseName)
        .sort((a, b) => a.puissance_kw - b.puissance_kw);
      if (!rowsP.length) return 0.0;
      const xs = rowsP.map((r) => r.puissance_kw);
      const ys = rowsP.map((r) => r[ind.id]);
      return interp1d(pEval, xs, ys) * facteurExtrap;
    };

    const vFab = getPhaseBase("fabrication") * ratioMasse * facteurEchelle;
    const vB1 = getPhaseBase("fuites_usage") * ratioMasse * facteurEchelle;
    const vElim = getPhaseBase("elimination") * ratioMasse * facteurEchelle;

    if (scopeEffectif === SCOPE_FAB_ELIM) {
      values[ind.id] = {
        fabrication: vFab,
        fuites_usage: 0.0,
        elimination: vElim,
        total: vFab + vElim,
      };
    } else if (scopeEffectif === SCOPE_SIA_KBOB) {
      values[ind.id] = {
        fabrication: vFab + vB1,
        fuites_usage: 0.0,
        elimination: vElim,
        total: vFab + vB1 + vElim,
      };
    } else {
      values[ind.id] = {
        fabrication: vFab,
        fuites_usage: vB1,
        elimination: vElim,
        total: vFab + vB1 + vElim,
      };
    }
  }

  return {
    datasetLabel: dataset.label,
    cadreEvaluation,
    cadreLabel: CADRE_LABELS[cadreEvaluation],
    technologie,
    puissanceKw: p,
    fluideSelectionne: refOpt.label,
    fluideReference: refOpt.fluide_reference,
    noteFluide: refOpt.note_methodologique,
    massInfo: {
      masseTheoriqueKg: mTheo,
      masseUtiliseeKg: mUtilisee,
      ratioMasse,
      sourceMasse,
      masseConnue: isMasseConnueEffective,
      attenteSaisieMasse,
    },
    methodeInterpolation: methodeStr,
    scope: scopeEffectif,
    scopeLabel: SCOPE_LABELS[scopeEffectif],
    uniteReference,
    uniteLabel: UNITE_LABELS[uniteReference],
    suffixeUnite,
    indicators: dataset.indicators,
    values,
    phasesActives,
  };
}

export function formaterValeur(val, ind) {
  if (!Number.isFinite(val)) return "—";
  if (ind.notation_scientifique) {
    return val.toExponential(2);
  }
  const dec = ind.decimales ?? 2;
  const fixed = val.toFixed(dec);
  const [intPart, decPart] = fixed.split(".");
  const intFormatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, "'");
  return decPart !== undefined ? `${intFormatted}.${decPart}` : intFormatted;
}
