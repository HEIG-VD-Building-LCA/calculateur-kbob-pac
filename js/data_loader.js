/**
 * js/data_loader.js
 * Chargement dynamique de la base unique BAFU:2026v1 et des tables de référence CSV.
 */

const COLONNES_METADONNEES = new Set([
  "technologie",
  "fluide",
  "puissance_kw",
  "masse_ref_kg",
  "phase",
]);

const DEFAULT_DATASET_FILE = "kbob_2027_bafu2026.csv";

function parseNumber(val) {
  if (val === null || val === undefined || val === "") return NaN;
  if (typeof val === "number") return val;
  const cleaned = String(val).trim().replace(/'/g, "").replace(",", ".");
  return Number(cleaned);
}

async function fetchText(url) {
  const resp = await fetch(url, { cache: "no-cache" });
  if (!resp.ok) {
    throw new Error(`Impossible de charger ${url} (HTTP ${resp.status})`);
  }
  return await resp.text();
}

async function fetchJsonOptional(url, fallback = {}) {
  try {
    const resp = await fetch(url, { cache: "no-cache" });
    if (!resp.ok) return fallback;
    return await resp.json();
  } catch {
    return fallback;
  }
}

function parseCsvText(csvText) {
  const text = csvText.replace(/^\uFEFF/, "");
  const firstLine = text.split(/\r?\n/)[0] || "";
  const delimiter = firstLine.split(";").length >= firstLine.split(",").length ? ";" : ",";

  const parsed = Papa.parse(text, {
    header: true,
    delimiter,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });
  return parsed.data;
}

export async function loadAllData() {
  const [indCsv, reglesCsv, fluidesCsv, metaDict, manifest] = await Promise.all([
    fetchText("data/indicateurs.csv"),
    fetchText("data/regles_masse.csv"),
    fetchText("data/fluides_options.csv"),
    fetchJsonOptional("data/datasets_meta.json", {}),
    fetchJsonOptional("data/datasets_manifest.json", { datasets: [DEFAULT_DATASET_FILE] }),
  ]);

  const catalogueIndicateurs = {};
  for (const row of parseCsvText(indCsv)) {
    const id = String(row.id || "").trim();
    if (!id) continue;
    catalogueIndicateurs[id] = {
      id,
      nom: String(row.nom || id).trim(),
      nom_court: String(row.nom_court || id).trim(),
      unite: String(row.unite || "").trim(),
      decimales: Number.isFinite(parseNumber(row.decimales)) ? parseInt(row.decimales, 10) : 2,
      notation_scientifique: ["oui", "true", "1", "yes"].includes(
        String(row.notation_scientifique || "non").trim().toLowerCase()
      ),
      groupe: String(row.groupe || "principal").trim().toLowerCase(),
      afficher_par_defaut: ["oui", "true", "1", "yes"].includes(
        String(row.afficher_par_defaut || "oui").trim().toLowerCase()
      ),
      ordre: Number.isFinite(parseNumber(row.ordre)) ? parseInt(row.ordre, 10) : 999,
    };
  }

  const reglesMasse = parseCsvText(reglesCsv)
    .map((r) => ({
      technologie: String(r.technologie || "").trim(),
      p_min_kw: parseNumber(r.p_min_kw),
      p_max_kw: parseNumber(r.p_max_kw),
      a: parseNumber(r.a),
      b: parseNumber(r.b),
      source: String(r.source || "regles_masse.csv").trim(),
    }))
    .filter((r) => r.technologie && Number.isFinite(r.a) && Number.isFinite(r.b))
    .sort((x, y) => x.technologie.localeCompare(y.technologie) || x.p_min_kw - y.p_min_kw);

  const fluidesOptions = parseCsvText(fluidesCsv)
    .map((r) => ({
      ordre: Number.isFinite(parseNumber(r.ordre)) ? parseInt(r.ordre, 10) : 999,
      id: String(r.id || "").trim(),
      label: String(r.label || "").trim(),
      fluide_reference: String(r.fluide_reference || "").trim(),
      categorie: String(r.categorie || "").trim(),
      note_methodologique: String(r.note_methodologique || "").trim(),
    }))
    .filter((o) => o.label && o.fluide_reference)
    .sort((a, b) => a.ordre - b.ordre);

  // Base unique : priorité à BAFU:2026v1 (premier élément du manifest)
  const manifestList = Array.isArray(manifest.datasets) && manifest.datasets.length
    ? manifest.datasets
    : [DEFAULT_DATASET_FILE];
  const filename =
    manifestList.find((f) => f.includes("bafu")) || manifestList[0] || DEFAULT_DATASET_FILE;

  const rawText = await fetchText(`data/datasets/${filename}`);
  const rawRows = parseCsvText(rawText);
  if (!rawRows.length) {
    throw new Error(`Le jeu de données ${filename} est vide.`);
  }

  const allCols = Object.keys(rawRows[0]);
  const indCols = allCols.filter((c) => !COLONNES_METADONNEES.has(c));

  const indicators = indCols
    .map((col, idx) => {
      if (catalogueIndicateurs[col]) return catalogueIndicateurs[col];
      return {
        id: col,
        nom: col.replace(/_/g, " "),
        nom_court: col.replace(/_/g, " "),
        unite: "unité",
        decimales: 2,
        notation_scientifique: false,
        groupe: "principal",
        afficher_par_defaut: true,
        ordre: 500 + idx,
      };
    })
    .sort((a, b) => a.ordre - b.ordre || a.id.localeCompare(b.id));

  const rows = rawRows.map((r) => {
    const clean = {
      technologie: String(r.technologie || "").trim(),
      fluide: String(r.fluide || "").trim(),
      puissance_kw: parseNumber(r.puissance_kw),
      masse_ref_kg: parseNumber(r.masse_ref_kg),
      phase: String(r.phase || "").trim().toLowerCase(),
    };
    for (const ind of indicators) {
      const val = parseNumber(r[ind.id]);
      clean[ind.id] = Number.isFinite(val) ? val : 0.0;
    }
    return clean;
  });

  const technologies = Array.from(new Set(rows.map((r) => r.technologie)));
  const fluidesParTech = {};
  for (const tech of technologies) {
    fluidesParTech[tech] = Array.from(
      new Set(rows.filter((r) => r.technologie === tech).map((r) => r.fluide))
    );
  }

  const fluidesPresents = new Set(rows.map((r) => r.fluide));
  const optionsCompatibles = fluidesOptions.filter((o) => fluidesPresents.has(o.fluide_reference));
  const couverts = new Set(optionsCompatibles.map((o) => o.fluide_reference));
  let autoIdx = 100;
  for (const flu of fluidesPresents) {
    if (!couverts.has(flu)) {
      optionsCompatibles.push({
        ordre: autoIdx++,
        id: `auto_${autoIdx}`,
        label: flu,
        fluide_reference: flu,
        categorie: "Personnalisé",
        note_methodologique: "Fluide détecté directement depuis le fichier CSV.",
      });
    }
  }

  const meta = metaDict[filename] || {};
  const dataset = {
    id: filename,
    filename,
    label: meta.label || "KBOB 2027 — BAFU:2026v1 (IPCC 2021 / EF 3.1)",
    description: meta.description || `Jeu de données chargé depuis ${filename}.`,
    rows,
    indicators,
    technologies,
    fluidesParTech,
    refrigerantOptions: optionsCompatibles,
  };

  return { dataset, reglesMasse };
}