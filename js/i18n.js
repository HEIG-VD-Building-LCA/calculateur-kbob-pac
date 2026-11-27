/**
 * js/i18n.js
 * Dictionnaire complet FR / DE / IT / EN (terminologie suisse KBOB, SIA 390/1 et EF 3.1).
 */

export const SUPPORTED_LANGS = ["fr", "de", "it", "en"];
export const DEFAULT_LANG = "fr";
const STORAGE_KEY = "kbob_pac_lang";

export const TRANSLATIONS = {
  fr: {
    locale: "fr-CH",
    docHref: "docs/methodologie_kbob_pac_2027.docx",
    ui: {
      pageTitle: "Calculateur de Pompe à chaleur — KBOB",
      headerTitle: "Calculateur de Pompe à chaleur",
      headerSubtitle: "Technique du bâtiment · PAC (1–100 kW)",
      panelInputsTitle: "Paramètres de la PAC",
      labelTech: "Technologie (source froide)",
      labelPower: "Puissance nominale",
      powerBounds: "1 – 100 kW",
      labelFluid: "Fluide frigorigène",
      fluidNotePrefix: "Donnée KBOB appliquée :",
      labelMass: "Masse de la pompe à chaleur",
      massEstimated: "Estimée (LCA-PAC)",
      massKnown: "Connue (saisie)",
      labelMassReal: "Masse réelle de l'appareil",
      massUsedPrefix: "Masse utilisée :",
      massExamplePrefix: "Ex.",
      labelUnit: "Unité de référence",
      labelProject: "Désignation du projet (pour l'export)",
      defaultProjectName: "Projet PAC",
      projectPlaceholder: "Ex. Immeuble Rue du Lac",
      scopeBoxTitle: "Périmètre et base de données",
      scopeTerm: "Périmètre de calcul (SIA 390/1)",
      scopeDesc: "Fabrication¹ et élimination",
      dbTerm: "Base d'écobilan",
      dbLabel: "KBOB 2027 — BAFU:2026v1 (IPCC 2021 / EF 3.1)",
      downloadDoc: "Télécharger la méthodologie (.docx)",

      resultsTitle: "Résultats — Indicateurs KBOB",
      hpPrefix: "PAC",
      chartsTitle: "Répartition par phase du cycle de vie",
      chartsOffline: "Graphiques indisponibles hors ligne (Chart.js non chargé).",
      phaseFab: "Fabrication¹",
      phaseElim: "Élimination",

      tablesTitle: "Tableaux des indicateurs",
      checkKbob: "Indicateurs KBOB principaux",
      checkEf31: "Indicateurs complémentaires EF 3.1",
      copyTablesBtn: "Copier les tableaux actifs dans le presse-papiers",
      copiedBtn: "Copié dans le presse-papiers !",
      emptyTableMsg: "Cochez au moins un tableau d'indicateurs ci-dessus pour l'afficher.",

      colIndicator: "Indicateur",
      colGroup: "Groupe",
      colUnit: "Unité",
      colTotal: "Total",
      groupKbob: "Indicateurs KBOB principaux",
      groupEf31: "Indicateurs complémentaires — Méthode EF 3.1 ({count} indicateurs)",

      exportTitle: "Exporter les résultats",
      exportSubtitle: "Téléchargez la fiche complète au format souhaité (PDF identique à la fiche HTML).",
      btnExcel: "Excel (.xlsx)",
      btnCsv: "CSV",
      btnHtml: "Fiche HTML",
      btnPdf: "PDF",

      footnoteHtml:
        "<strong>¹ Fabrication :</strong> inclut les fuites annuelles de fluide frigorigène en phase d'utilisation (2 %/an sur 20 ans, conformément à la norme SIA 390/1).",
      footnoteText:
        "¹ Fabrication : inclut les fuites annuelles de fluide frigorigène en phase d'utilisation (2 %/an sur 20 ans, conformément à la norme SIA 390/1).",
      footerHtml:
        "Développé par la <strong>Haute École d'Ingénierie et de Gestion du canton de Vaud (HEIG-VD — Institut des Énergies)</strong> et financé par l'<strong>Office fédéral de l'énergie (OFEN)</strong>, dans le cadre du projet <strong>LCA-PAC</strong>.",
      footerPlain:
        "Développé par la HEIG-VD (Institut des Énergies) et financé par l'Office fédéral de l'énergie (OFEN), dans le cadre du projet LCA-PAC.",

      warnPowerClamped: "La puissance nominale a été bornée dans la plage étalonnée [{min} ; {max} kW].",
      warnMassInvalid: "La masse saisie doit être strictement positive : masse estimée utilisée par défaut.",
      errLoadCsv: "Erreur lors du chargement des données CSV : {msg}",
      errNoXlsx: "La bibliothèque Excel (SheetJS) n'est pas chargée.",

      // Exports
      reportGenerated: "Généré le {date}",
      metaProject: "Nom du projet",
      metaDb: "Base de données",
      metaScope: "Périmètre SIA 390/1",
      metaScopeValue: "Fabrication¹ et élimination (SIA 390/1)",
      metaTechPower: "Technologie & Puissance",
      metaFluid: "Fluide frigorigène",
      metaFluidRef: "Donnée de référence appliquée",
      metaMass: "Masse de la PAC",
      metaUnit: "Unité de référence",
      massManualDesc: "{val} kg (saisie manuelle)",
      massEstDesc: "{val} kg (estimée LCA-PAC)",
      excelHeaderTitle: "Calculateur de Pompe à chaleur — KBOB",
      excelHeaderSub: "Technique du bâtiment · PAC (1–100 kW) | Généré le {date} | HEIG-VD / OFEN (projet LCA-PAC)",
      excelSecParams: "1. Paramètres de calcul",
      excelSecKbob: "2. Indicateurs d'écobilan principaux (format KBOB)",
      excelBioCarbon: "Teneur en carbone biogénique contenu dans le produit",
      excelSheetKbob: "Fiche KBOB 2027",
      excelSheetEf31: "Indicateurs EF 3.1",
      excelEfTitle: "Indicateurs complémentaires EF 3.1 — PAC {tech} {power} kW ({fluid})",
      csvHeaderComment: "# Calculateur de Pompe à chaleur — KBOB (HEIG-VD / OFEN, projet LCA-PAC)",
      csvPowerLabel: "Puissance nominale [kW]",
      filePrefixHtml: "Fiche_KBOB_PAC_",
      filePrefixXlsx: "KBOB_2027_PAC_",
      filePrefixCsv: "KBOB_PAC_",
    },
    technologies: {
      "Air-Eau": "Air-Eau",
      "Saumure-Eau": "Saumure-Eau",
    },
    unites: {
      appareil: { short: "Par appareil", full: "Par appareil (unité PAC)" },
      kw: { short: "Par kW", full: "Par kW de puissance nominale" },
      kg: { short: "Par kg", full: "Par kg de PAC" },
    },
    fluidRefs: {
      "HFC (R410A)": "HFC (R410A)",
      "HFC (R32)": "HFC (R32)",
      "Naturel (R290)": "Naturel (R290)",
    },
    fluidOptions: {
      inconnu: {
        label: "Inconnu (par défaut : HFC standard)",
        note: "Reprend strictement les valeurs des PAC HFC (R410A) par approche conservatrice.",
      },
      autres_hfc: {
        label: "Autres réfrigérants HFC (R410A, R407C, R134a, etc.)",
        note: "Reprend strictement les valeurs des PAC HFC (R410A).",
      },
      hfo: {
        label: "Réfrigérants HFO et mélanges HFC/HFO (R1234ze, R454B/C, etc.)",
        note: "Assimilé par défaut aux PAC HFC (R410A) par principe de précaution vis-à-vis de la dégradation en TFA/PFAS (KBOB 2027).",
      },
      r32: {
        label: "HFC R32",
        note: "Donnée spécifique HFC R32 (PRG100 AR6 = 771 kg CO₂-eq/kg, BAFU:2026v1).",
      },
      r290: {
        label: "Naturel R290 (propane)",
        note: "Donnée de référence fluide naturel modélisée avec le propane R290 (1re priorité ecoCFC).",
      },
      autres_naturels: {
        label: "Autres fluides naturels (CO₂ / R744, NH₃ / R717, isobutane, etc.)",
        note: "Reprend strictement les valeurs et indicateurs de la variante R290 (propane).",
      },
    },
    indicators: {
      ubp: { nom: "Écopoints (UBP'21)", nom_court: "UBP'21" },
      ges: { nom: "Émissions de GES fossiles", nom_court: "GES fossiles" },
      nre: { nom: "Énergie primaire non renouvelable (NRE)", nom_court: "Énergie NRE" },
      re: { nom: "Énergie primaire renouvelable (RE)", nom_court: "Énergie RE" },
      ef_cc_total: { nom: "Changement climatique — total (EF 3.1)", nom_court: "CC total" },
      ef_cc_biogene: { nom: "Changement climatique — biogénique (EF 3.1)", nom_court: "CC biogène" },
      ef_cc_luluc: { nom: "Changement climatique — affectation des sols (EF 3.1)", nom_court: "CC LULUC" },
      ef_acidification: { nom: "Acidification (EF 3.1)", nom_court: "Acidification" },
      ef_ozone_depletion: { nom: "Appauvrissement de la couche d'ozone (EF 3.1)", nom_court: "Couche d'ozone" },
      ef_tox_cancer: { nom: "Toxicité humaine : cancer (EF 3.1)", nom_court: "Tox. cancer" },
      ef_tox_non_cancer: { nom: "Toxicité humaine : hors cancer (EF 3.1)", nom_court: "Tox. hors cancer" },
      ef_particules: { nom: "Particules fines (EF 3.1)", nom_court: "Particules fines" },
      ef_rayonnements: { nom: "Rayonnements ionisants (EF 3.1)", nom_court: "Rayonnements" },
      ef_ozone_photo: { nom: "Ozone photochimique (EF 3.1)", nom_court: "Ozone photo." },
      ef_eutro_terrestre: { nom: "Eutrophisation terrestre (EF 3.1)", nom_court: "Eutro. terrestre" },
      ef_eutro_eau_douce: { nom: "Eutrophisation eau douce (EF 3.1)", nom_court: "Eutro. eau douce" },
      ef_eutro_marine: { nom: "Eutrophisation marine (EF 3.1)", nom_court: "Eutro. marine" },
      ef_ecotox_eau_douce: { nom: "Écotoxicité eau douce (EF 3.1)", nom_court: "Écotoxicité" },
      ef_utilisation_sols: { nom: "Utilisation des sols (EF 3.1)", nom_court: "Sols" },
      ef_utilisation_eau: { nom: "Utilisation de l'eau (EF 3.1)", nom_court: "Eau" },
      ef_ressources_min: { nom: "Épuisement des ressources : minéraux et métaux (EF 3.1)", nom_court: "Minéraux/métaux" },
      ef_ressources_fos: { nom: "Épuisement des ressources : fossiles (EF 3.1)", nom_court: "Ress. fossiles" },
    },
  },

  de: {
    locale: "de-CH",
    docHref: "docs/methodologie_kbob_pac_2027.docx",
    ui: {
      pageTitle: "Wärmepumpen-Rechner — KBOB",
      headerTitle: "Wärmepumpen-Rechner",
      headerSubtitle: "Gebäudetechnik · WP (1–100 kW)",
      panelInputsTitle: "Parameter der Wärmepumpe",
      labelTech: "Technologie (Wärmequelle)",
      labelPower: "Nennleistung",
      powerBounds: "1 – 100 kW",
      labelFluid: "Kältemittel",
      fluidNotePrefix: "Verwendeter KBOB-Datensatz:",
      labelMass: "Masse der Wärmepumpe",
      massEstimated: "Geschätzt (LCA-PAC)",
      massKnown: "Bekannt (Eingabe)",
      labelMassReal: "Effektive Gerätemasse",
      massUsedPrefix: "Verwendete Masse:",
      massExamplePrefix: "z. B.",
      labelUnit: "Bezugseinheit",
      labelProject: "Projektbezeichnung (für den Export)",
      defaultProjectName: "WP-Projekt",
      projectPlaceholder: "z. B. Mehrfamilienhaus Seestrasse",
      scopeBoxTitle: "Systemgrenze und Datenbank",
      scopeTerm: "Systemgrenze (SIA 390/1)",
      scopeDesc: "Herstellung¹ und Entsorgung",
      dbTerm: "Ökobilanzdatenbank",
      dbLabel: "KBOB 2027 — BAFU:2026v1 (IPCC 2021 / EF 3.1)",
      downloadDoc: "Methodik herunterladen (.docx)",

      resultsTitle: "Ergebnisse — KBOB-Indikatoren",
      hpPrefix: "WP",
      chartsTitle: "Verteilung nach Lebenszyklusphase",
      chartsOffline: "Diagramme offline nicht verfügbar (Chart.js nicht geladen).",
      phaseFab: "Herstellung¹",
      phaseElim: "Entsorgung",

      tablesTitle: "Indikatortabellen",
      checkKbob: "KBOB-Hauptindikatoren",
      checkEf31: "Zusätzliche EF 3.1-Indikatoren",
      copyTablesBtn: "Aktive Tabellen in die Zwischenablage kopieren",
      copiedBtn: "In die Zwischenablage kopiert!",
      emptyTableMsg: "Wählen Sie oben mindestens eine Indikatortabelle zur Anzeige aus.",

      colIndicator: "Indikator",
      colGroup: "Gruppe",
      colUnit: "Einheit",
      colTotal: "Total",
      groupKbob: "KBOB-Hauptindikatoren",
      groupEf31: "Zusätzliche Indikatoren — Methode EF 3.1 ({count} Indikatoren)",

      exportTitle: "Ergebnisse exportieren",
      exportSubtitle: "Laden Sie das vollständige Datenblatt im gewünschten Format herunter (PDF identisch mit HTML).",
      btnExcel: "Excel (.xlsx)",
      btnCsv: "CSV",
      btnHtml: "HTML-Datenblatt",
      btnPdf: "PDF",

      footnoteHtml:
        "<strong>¹ Herstellung:</strong> beinhaltet die jährlichen Kältemittelleckagen während der Nutzungsphase (2 %/Jahr über 20 Jahre gemäss Norm SIA 390/1).",
      footnoteText:
        "¹ Herstellung: beinhaltet die jährlichen Kältemittelleckagen während der Nutzungsphase (2 %/Jahr über 20 Jahre gemäss Norm SIA 390/1).",
      footerHtml:
        "Entwickelt von der <strong>Haute École d'Ingénierie et de Gestion du canton de Vaud (HEIG-VD — Institut des Énergies)</strong> und finanziert vom <strong>Bundesamt für Energie (BFE)</strong> im Rahmen des Projekts <strong>LCA-PAC</strong>.",
      footerPlain:
        "Entwickelt von der HEIG-VD (Institut des Énergies) und finanziert vom Bundesamt für Energie (BFE) im Rahmen des Projekts LCA-PAC.",

      warnPowerClamped: "Die Nennleistung wurde auf den kalibrierten Bereich [{min} ; {max} kW] begrenzt.",
      warnMassInvalid: "Die eingegebene Masse muss positiv sein: Es wird standardmässig die geschätzte Masse verwendet.",
      errLoadCsv: "Fehler beim Laden der CSV-Daten: {msg}",
      errNoXlsx: "Die Excel-Bibliothek (SheetJS) ist nicht geladen.",

      // Exports
      reportGenerated: "Erstellt am {date}",
      metaProject: "Projektname",
      metaDb: "Datenbank",
      metaScope: "Systemgrenze SIA 390/1",
      metaScopeValue: "Herstellung¹ und Entsorgung (SIA 390/1)",
      metaTechPower: "Technologie & Leistung",
      metaFluid: "Kältemittel",
      metaFluidRef: "Verwendeter Referenzdatensatz",
      metaMass: "Masse der WP",
      metaUnit: "Bezugseinheit",
      massManualDesc: "{val} kg (manuelle Eingabe)",
      massEstDesc: "{val} kg (geschätzt LCA-PAC)",
      excelHeaderTitle: "Wärmepumpen-Rechner — KBOB",
      excelHeaderSub: "Gebäudetechnik · WP (1–100 kW) | Erstellt am {date} | HEIG-VD / BFE (Projekt LCA-PAC)",
      excelSecParams: "1. Berechnungsparameter",
      excelSecKbob: "2. Ökobilanz-Hauptindikatoren (KBOB-Format)",
      excelBioCarbon: "Biogener Kohlenstoffgehalt im Produkt",
      excelSheetKbob: "KBOB 2027 Datenblatt",
      excelSheetEf31: "EF 3.1 Indikatoren",
      excelEfTitle: "Zusätzliche EF 3.1-Indikatoren — WP {tech} {power} kW ({fluid})",
      csvHeaderComment: "# Wärmepumpen-Rechner — KBOB (HEIG-VD / BFE, Projekt LCA-PAC)",
      csvPowerLabel: "Nennleistung [kW]",
      filePrefixHtml: "KBOB_WP_Datenblatt_",
      filePrefixXlsx: "KBOB_2027_WP_",
      filePrefixCsv: "KBOB_WP_",
    },
    technologies: {
      "Air-Eau": "Luft-Wasser",
      "Saumure-Eau": "Sole-Wasser",
    },
    unites: {
      appareil: { short: "Pro Gerät", full: "Pro Gerät (WP-Einheit)" },
      kw: { short: "Pro kW", full: "Pro kW Nennleistung" },
      kg: { short: "Pro kg", full: "Pro kg Wärmepumpe" },
    },
    fluidRefs: {
      "HFC (R410A)": "HFKW (R410A)",
      "HFC (R32)": "HFKW (R32)",
      "Naturel (R290)": "Natürlich (R290)",
    },
    fluidOptions: {
      inconnu: {
        label: "Unbekannt (Standard: HFKW-Referenz)",
        note: "Übernimmt aus Vorsichtsgründen direkt die Werte von HFKW-Wärmepumpen (R410A).",
      },
      autres_hfc: {
        label: "Andere HFKW-Kältemittel (R410A, R407C, R134a usw.)",
        note: "Übernimmt direkt die Werte von HFKW-Wärmepumpen (R410A).",
      },
      hfo: {
        label: "HFO-Kältemittel und HFKW/HFO-Gemische (R1234ze, R454B/C usw.)",
        note: "Wird gemäss Vorsorgeprinzip wegen des Abbaus zu TFA/PFAS standardmässig HFKW-Wärmepumpen (R410A) gleichgestellt (KBOB 2027).",
      },
      r32: {
        label: "HFKW R32",
        note: "Spezifischer Datensatz HFKW R32 (GWP100 AR6 = 771 kg CO₂-eq/kg, BAFU:2026v1).",
      },
      r290: {
        label: "Natürlich R290 (Propan)",
        note: "Referenzdatensatz für natürliche Kältemittel, modelliert mit Propan R290 (1. Priorität ecoBKP).",
      },
      autres_naturels: {
        label: "Andere natürliche Kältemittel (CO₂ / R744, NH₃ / R717, Isobutan usw.)",
        note: "Übernimmt direkt die Werte und Indikatoren der Variante R290 (Propan).",
      },
    },
    indicators: {
      ubp: { nom: "Umweltbelastungspunkte (UBP'21)", nom_court: "UBP'21" },
      ges: { nom: "Treibhausgasemissionen fossil", nom_court: "THG fossil" },
      nre: { nom: "Primärenergie nicht erneuerbar (NRE)", nom_court: "Energie NRE" },
      re: { nom: "Primärenergie erneuerbar (RE)", nom_court: "Energie RE" },
      ef_cc_total: { nom: "Klimawandel — total (EF 3.1)", nom_court: "Klima total" },
      ef_cc_biogene: { nom: "Klimawandel — biogen (EF 3.1)", nom_court: "Klima biogen" },
      ef_cc_luluc: { nom: "Klimawandel — Landnutzung und -änderung (EF 3.1)", nom_court: "Klima LULUC" },
      ef_acidification: { nom: "Versauerung (EF 3.1)", nom_court: "Versauerung" },
      ef_ozone_depletion: { nom: "Ozonabbau (EF 3.1)", nom_court: "Ozonabbau" },
      ef_tox_cancer: { nom: "Humantoxizität: krebserregend (EF 3.1)", nom_court: "Tox. Krebs" },
      ef_tox_non_cancer: { nom: "Humantoxizität: nicht krebserregend (EF 3.1)", nom_court: "Tox. nicht Krebs" },
      ef_particules: { nom: "Feinstaubemissionen (EF 3.1)", nom_court: "Feinstaub" },
      ef_rayonnements: { nom: "Ionisierende Strahlung (EF 3.1)", nom_court: "Strahlung" },
      ef_ozone_photo: { nom: "Photochemische Ozonbildung (EF 3.1)", nom_court: "Sommersmog" },
      ef_eutro_terrestre: { nom: "Eutrophierung terrestrisch (EF 3.1)", nom_court: "Eutro. terr." },
      ef_eutro_eau_douce: { nom: "Eutrophierung Süsswasser (EF 3.1)", nom_court: "Eutro. Süssw." },
      ef_eutro_marine: { nom: "Eutrophierung Meerwasser (EF 3.1)", nom_court: "Eutro. Meer" },
      ef_ecotox_eau_douce: { nom: "Ökotoxizität Süsswasser (EF 3.1)", nom_court: "Ökotoxizität" },
      ef_utilisation_sols: { nom: "Landnutzung (EF 3.1)", nom_court: "Landnutzung" },
      ef_utilisation_eau: { nom: "Wassernutzung (EF 3.1)", nom_court: "Wasser" },
      ef_ressources_min: { nom: "Ressourcenverbrauch: Mineralien und Metalle (EF 3.1)", nom_court: "Minerale/Metalle" },
      ef_ressources_fos: { nom: "Ressourcenverbrauch: fossile Energieträger (EF 3.1)", nom_court: "Fossile Ress." },
    },
  },

  it: {
    locale: "it-CH",
    docHref: "docs/methodologie_kbob_pac_2027.docx",
    ui: {
      pageTitle: "Calcolatore per pompe di calore — KBOB",
      headerTitle: "Calcolatore per pompe di calore",
      headerSubtitle: "Tecnica della costruzione · PdC (1–100 kW)",
      panelInputsTitle: "Parametri della pompa di calore",
      labelTech: "Tecnologia (sorgente fredda)",
      labelPower: "Potenza nominale",
      powerBounds: "1 – 100 kW",
      labelFluid: "Fluido refrigerante",
      fluidNotePrefix: "Dato KBOB applicato:",
      labelMass: "Massa della pompa di calore",
      massEstimated: "Stimata (LCA-PAC)",
      massKnown: "Nota (inserimento)",
      labelMassReal: "Massa reale dell'apparecchio",
      massUsedPrefix: "Massa utilizzata:",
      massExamplePrefix: "Es.",
      labelUnit: "Unità di riferimento",
      labelProject: "Nome del progetto (per l'esportazione)",
      defaultProjectName: "Progetto PdC",
      projectPlaceholder: "Es. Edificio Via del Lago",
      scopeBoxTitle: "Perimetro e banca dati",
      scopeTerm: "Perimetro di calcolo (SIA 390/1)",
      scopeDesc: "Produzione¹ e smaltimento",
      dbTerm: "Banca dati di ecobilancio",
      dbLabel: "KBOB 2027 — BAFU:2026v1 (IPCC 2021 / EF 3.1)",
      downloadDoc: "Scarica la metodologia (.docx)",

      resultsTitle: "Risultati — Indicatori KBOB",
      hpPrefix: "PdC",
      chartsTitle: "Ripartizione per fase del ciclo di vita",
      chartsOffline: "Grafici non disponibili offline (Chart.js non caricato).",
      phaseFab: "Produzione¹",
      phaseElim: "Smaltimento",

      tablesTitle: "Tabelle degli indicatori",
      checkKbob: "Indicatori KBOB principali",
      checkEf31: "Indicatori complementari EF 3.1",
      copyTablesBtn: "Copia le tabelle attive negli appunti",
      copiedBtn: "Copiato negli appunti!",
      emptyTableMsg: "Selezionare almeno una tabella di indicatori qui sopra per visualizzarla.",

      colIndicator: "Indicatore",
      colGroup: "Gruppo",
      colUnit: "Unità",
      colTotal: "Totale",
      groupKbob: "Indicatori KBOB principali",
      groupEf31: "Indicatori complementari — Metodo EF 3.1 ({count} indicatori)",

      exportTitle: "Esporta i risultati",
      exportSubtitle: "Scarica la scheda completa nel formato desiderato (PDF identico alla scheda HTML).",
      btnExcel: "Excel (.xlsx)",
      btnCsv: "CSV",
      btnHtml: "Scheda HTML",
      btnPdf: "PDF",

      footnoteHtml:
        "<strong>¹ Produzione:</strong> include le perdite annuali di fluido refrigerante durante la fase di esercizio (2 %/anno su 20 anni, conformemente alla norma SIA 390/1).",
      footnoteText:
        "¹ Produzione: include le perdite annuali di fluido refrigerante durante la fase di esercizio (2 %/anno su 20 anni, conformemente alla norma SIA 390/1).",
      footerHtml:
        "Sviluppato dalla <strong>Haute École d'Ingénierie et de Gestion du canton de Vaud (HEIG-VD — Institut des Énergies)</strong> e finanziato dall'<strong>Ufficio federale dell'energia (UFE)</strong> nell'ambito del progetto <strong>LCA-PAC</strong>.",
      footerPlain:
        "Sviluppato dalla HEIG-VD (Institut des Énergies) e finanziato dall'Ufficio federale dell'energia (UFE) nell'ambito del progetto LCA-PAC.",

      warnPowerClamped: "La potenza nominale è stata limitata all'intervallo calibrato [{min} ; {max} kW].",
      warnMassInvalid: "La massa inserita deve essere positiva: viene utilizzata la massa stimata per impostazione predefinita.",
      errLoadCsv: "Errore durante il caricamento dei dati CSV: {msg}",
      errNoXlsx: "La libreria Excel (SheetJS) non è caricata.",

      // Exports
      reportGenerated: "Generato il {date}",
      metaProject: "Nome del progetto",
      metaDb: "Banca dati",
      metaScope: "Perimetro SIA 390/1",
      metaScopeValue: "Produzione¹ e smaltimento (SIA 390/1)",
      metaTechPower: "Tecnologia e potenza",
      metaFluid: "Fluido refrigerante",
      metaFluidRef: "Dato di riferimento applicato",
      metaMass: "Massa della PdC",
      metaUnit: "Unità di riferimento",
      massManualDesc: "{val} kg (inserimento manuale)",
      massEstDesc: "{val} kg (stimata LCA-PAC)",
      excelHeaderTitle: "Calcolatore per pompe di calore — KBOB",
      excelHeaderSub: "Tecnica della costruzione · PdC (1–100 kW) | Generato il {date} | HEIG-VD / UFE (progetto LCA-PAC)",
      excelSecParams: "1. Parametri di calcolo",
      excelSecKbob: "2. Indicatori di ecobilancio principali (formato KBOB)",
      excelBioCarbon: "Contenuto di carbonio biogenico nel prodotto",
      excelSheetKbob: "Scheda KBOB 2027",
      excelSheetEf31: "Indicatori EF 3.1",
      excelEfTitle: "Indicatori complementari EF 3.1 — PdC {tech} {power} kW ({fluid})",
      csvHeaderComment: "# Calcolatore per pompe di calore — KBOB (HEIG-VD / UFE, progetto LCA-PAC)",
      csvPowerLabel: "Potenza nominale [kW]",
      filePrefixHtml: "Scheda_KBOB_PdC_",
      filePrefixXlsx: "KBOB_2027_PdC_",
      filePrefixCsv: "KBOB_PdC_",
    },
    technologies: {
      "Air-Eau": "Aria-Acqua",
      "Saumure-Eau": "Salamoia-Acqua",
    },
    unites: {
      appareil: { short: "Per apparecchio", full: "Per apparecchio (unità PdC)" },
      kw: { short: "Per kW", full: "Per kW di potenza nominale" },
      kg: { short: "Per kg", full: "Per kg di PdC" },
    },
    fluidRefs: {
      "HFC (R410A)": "HFC (R410A)",
      "HFC (R32)": "HFC (R32)",
      "Naturel (R290)": "Naturale (R290)",
    },
    fluidOptions: {
      inconnu: {
        label: "Sconosciuto (predefinito: HFC standard)",
        note: "Riprende esattamente i valori delle PdC HFC (R410A) con approccio conservativo.",
      },
      autres_hfc: {
        label: "Altri refrigeranti HFC (R410A, R407C, R134a, ecc.)",
        note: "Riprende esattamente i valori delle PdC HFC (R410A).",
      },
      hfo: {
        label: "Refrigeranti HFO e miscele HFC/HFO (R1234ze, R454B/C, ecc.)",
        note: "Assimilato per impostazione predefinita alle PdC HFC (R410A) per principio di precauzione rispetto alla degradazione in TFA/PFAS (KBOB 2027).",
      },
      r32: {
        label: "HFC R32",
        note: "Dato specifico HFC R32 (GWP100 AR6 = 771 kg CO₂-eq/kg, BAFU:2026v1).",
      },
      r290: {
        label: "Naturale R290 (propano)",
        note: "Dato di riferimento per refrigerante naturale modellato con propano R290 (1ª priorità ecoCCC).",
      },
      autres_naturels: {
        label: "Altri refrigeranti naturali (CO₂ / R744, NH₃ / R717, isobutano, ecc.)",
        note: "Riprende esattamente i valori e gli indicatori della variante R290 (propano).",
      },
    },
    indicators: {
      ubp: { nom: "Punti d'impatto ambientale (UBP'21)", nom_court: "UBP'21" },
      ges: { nom: "Emissioni di gas serra fossili", nom_court: "Gas serra fossili" },
      nre: { nom: "Energia primaria non rinnovabile (NRE)", nom_court: "Energia NRE" },
      re: { nom: "Energia primaria rinnovabile (RE)", nom_court: "Energia RE" },
      ef_cc_total: { nom: "Cambiamento climatico — totale (EF 3.1)", nom_court: "Clima totale" },
      ef_cc_biogene: { nom: "Cambiamento climatico — biogenico (EF 3.1)", nom_court: "Clima biogenico" },
      ef_cc_luluc: { nom: "Cambiamento climatico — uso del suolo (EF 3.1)", nom_court: "Clima LULUC" },
      ef_acidification: { nom: "Acidificazione (EF 3.1)", nom_court: "Acidificazione" },
      ef_ozone_depletion: { nom: "Riduzione dello strato di ozono (EF 3.1)", nom_court: "Strato di ozono" },
      ef_tox_cancer: { nom: "Tossicità umana: cancerogena (EF 3.1)", nom_court: "Toss. cancro" },
      ef_tox_non_cancer: { nom: "Tossicità umana: non cancerogena (EF 3.1)", nom_court: "Toss. non cancro" },
      ef_particules: { nom: "Particolato fine (EF 3.1)", nom_court: "Particolato" },
      ef_rayonnements: { nom: "Radiazioni ionizzanti (EF 3.1)", nom_court: "Radiazioni" },
      ef_ozone_photo: { nom: "Formazione di ozono fotochimico (EF 3.1)", nom_court: "Ozono fotoch." },
      ef_eutro_terrestre: { nom: "Eutrofizzazione terrestre (EF 3.1)", nom_court: "Eutro. terrestre" },
      ef_eutro_eau_douce: { nom: "Eutrofizzazione acqua dolce (EF 3.1)", nom_court: "Eutro. dolce" },
      ef_eutro_marine: { nom: "Eutrofizzazione marina (EF 3.1)", nom_court: "Eutro. marina" },
      ef_ecotox_eau_douce: { nom: "Ecotossicità acqua dolce (EF 3.1)", nom_court: "Ecotossicità" },
      ef_utilisation_sols: { nom: "Uso del suolo (EF 3.1)", nom_court: "Suolo" },
      ef_utilisation_eau: { nom: "Uso dell'acqua (EF 3.1)", nom_court: "Acqua" },
      ef_ressources_min: { nom: "Uso delle risorse: minerali e metalli (EF 3.1)", nom_court: "Minerali/metalli" },
      ef_ressources_fos: { nom: "Uso delle risorse: fonti fossili (EF 3.1)", nom_court: "Risorse fossili" },
    },
  },

  en: {
    locale: "en-GB",
    docHref: "docs/methodologie_kbob_pac_2027.docx",
    ui: {
      pageTitle: "Heat Pump Calculator — KBOB",
      headerTitle: "Heat Pump Calculator",
      headerSubtitle: "Building services · HP (1–100 kW)",
      panelInputsTitle: "Heat Pump Parameters",
      labelTech: "Technology (heat source)",
      labelPower: "Rated thermal power",
      powerBounds: "1 – 100 kW",
      labelFluid: "Refrigerant",
      fluidNotePrefix: "Applied KBOB dataset:",
      labelMass: "Heat pump mass",
      massEstimated: "Estimated (LCA-PAC)",
      massKnown: "Known (manual)",
      labelMassReal: "Actual unit mass",
      massUsedPrefix: "Mass used:",
      massExamplePrefix: "e.g.",
      labelUnit: "Reference unit",
      labelProject: "Project name (for exports)",
      defaultProjectName: "Heat Pump Project",
      projectPlaceholder: "e.g. Lakefront Building",
      scopeBoxTitle: "Scope and LCA database",
      scopeTerm: "Calculation scope (SIA 390/1)",
      scopeDesc: "Manufacturing¹ and disposal",
      dbTerm: "LCA database",
      dbLabel: "KBOB 2027 — BAFU:2026v1 (IPCC 2021 / EF 3.1)",
      downloadDoc: "Download methodology (.docx)",

      resultsTitle: "Results — KBOB Indicators",
      hpPrefix: "HP",
      chartsTitle: "Breakdown by life cycle stage",
      chartsOffline: "Charts unavailable offline (Chart.js not loaded).",
      phaseFab: "Manufacturing¹",
      phaseElim: "Disposal",

      tablesTitle: "Indicator Tables",
      checkKbob: "Main KBOB indicators",
      checkEf31: "Additional EF 3.1 indicators",
      copyTablesBtn: "Copy active tables to clipboard",
      copiedBtn: "Copied to clipboard!",
      emptyTableMsg: "Check at least one indicator table above to display it.",

      colIndicator: "Indicator",
      colGroup: "Group",
      colUnit: "Unit",
      colTotal: "Total",
      groupKbob: "Main KBOB indicators",
      groupEf31: "Additional indicators — EF 3.1 method ({count} indicators)",

      exportTitle: "Export results",
      exportSubtitle: "Download the complete datasheet in your preferred format (PDF matches the HTML report).",
      btnExcel: "Excel (.xlsx)",
      btnCsv: "CSV",
      btnHtml: "HTML Report",
      btnPdf: "PDF",

      footnoteHtml:
        "<strong>¹ Manufacturing:</strong> includes annual refrigerant leakage during the use phase (2%/year over 20 years, in accordance with SIA 390/1).",
      footnoteText:
        "¹ Manufacturing: includes annual refrigerant leakage during the use phase (2%/year over 20 years, in accordance with SIA 390/1).",
      footerHtml:
        "Developed by the <strong>School of Engineering and Management Vaud (HEIG-VD — Institute of Energies)</strong> and funded by the <strong>Swiss Federal Office of Energy (SFOE)</strong> within the <strong>LCA-PAC</strong> project.",
      footerPlain:
        "Developed by HEIG-VD (Institute of Energies) and funded by the Swiss Federal Office of Energy (SFOE) within the LCA-PAC project.",

      warnPowerClamped: "Rated power has been clamped to the calibrated range [{min}; {max} kW].",
      warnMassInvalid: "Entered mass must be strictly positive: estimated mass is used by default.",
      errLoadCsv: "Error loading CSV data: {msg}",
      errNoXlsx: "The Excel library (SheetJS) is not loaded.",

      // Exports
      reportGenerated: "Generated on {date}",
      metaProject: "Project name",
      metaDb: "LCA database",
      metaScope: "SIA 390/1 scope",
      metaScopeValue: "Manufacturing¹ and disposal (SIA 390/1)",
      metaTechPower: "Technology & Rated power",
      metaFluid: "Refrigerant",
      metaFluidRef: "Applied reference dataset",
      metaMass: "Heat pump mass",
      metaUnit: "Reference unit",
      massManualDesc: "{val} kg (manual input)",
      massEstDesc: "{val} kg (estimated LCA-PAC)",
      excelHeaderTitle: "Heat Pump Calculator — KBOB",
      excelHeaderSub: "Building services · HP (1–100 kW) | Generated on {date} | HEIG-VD / SFOE (LCA-PAC project)",
      excelSecParams: "1. Calculation parameters",
      excelSecKbob: "2. Main LCA indicators (KBOB format)",
      excelBioCarbon: "Biogenic carbon content in product",
      excelSheetKbob: "KBOB 2027 Report",
      excelSheetEf31: "EF 3.1 Indicators",
      excelEfTitle: "Additional EF 3.1 indicators — HP {tech} {power} kW ({fluid})",
      csvHeaderComment: "# Heat Pump Calculator — KBOB (HEIG-VD / SFOE, LCA-PAC project)",
      csvPowerLabel: "Rated power [kW]",
      filePrefixHtml: "KBOB_HP_Report_",
      filePrefixXlsx: "KBOB_2027_HP_",
      filePrefixCsv: "KBOB_HP_",
    },
    technologies: {
      "Air-Eau": "Air-to-Water",
      "Saumure-Eau": "Brine-to-Water",
    },
    unites: {
      appareil: { short: "Per unit", full: "Per unit (HP appliance)" },
      kw: { short: "Per kW", full: "Per kW of rated power" },
      kg: { short: "Per kg", full: "Per kg of heat pump" },
    },
    fluidRefs: {
      "HFC (R410A)": "HFC (R410A)",
      "HFC (R32)": "HFC (R32)",
      "Naturel (R290)": "Natural (R290)",
    },
    fluidOptions: {
      inconnu: {
        label: "Unknown (default: standard HFC)",
        note: "Strictly applies HFC (R410A) heat pump values as a conservative default.",
      },
      autres_hfc: {
        label: "Other HFC refrigerants (R410A, R407C, R134a, etc.)",
        note: "Strictly applies HFC (R410A) heat pump values.",
      },
      hfo: {
        label: "HFO refrigerants and HFC/HFO blends (R1234ze, R454B/C, etc.)",
        note: "Defaulted to HFC (R410A) heat pumps under the precautionary principle regarding TFA/PFAS degradation (KBOB 2027).",
      },
      r32: {
        label: "HFC R32",
        note: "Specific HFC R32 dataset (GWP100 AR6 = 771 kg CO₂-eq/kg, BAFU:2026v1).",
      },
      r290: {
        label: "Natural R290 (propane)",
        note: "Natural refrigerant reference dataset modelled with propane R290 (1st priority ecoCFC).",
      },
      autres_naturels: {
        label: "Other natural refrigerants (CO₂ / R744, NH₃ / R717, isobutane, etc.)",
        note: "Strictly applies the values and indicators of the R290 (propane) variant.",
      },
    },
    indicators: {
      ubp: { nom: "Eco-points (UBP'21)", nom_court: "UBP'21" },
      ges: { nom: "Fossil GHG emissions", nom_court: "Fossil GHG" },
      nre: { nom: "Non-renewable primary energy (NRE)", nom_court: "NRE Energy" },
      re: { nom: "Renewable primary energy (RE)", nom_court: "RE Energy" },
      ef_cc_total: { nom: "Climate change — total (EF 3.1)", nom_court: "CC total" },
      ef_cc_biogene: { nom: "Climate change — biogenic (EF 3.1)", nom_court: "CC biogenic" },
      ef_cc_luluc: { nom: "Climate change — land use and LULUC (EF 3.1)", nom_court: "CC LULUC" },
      ef_acidification: { nom: "Acidification (EF 3.1)", nom_court: "Acidification" },
      ef_ozone_depletion: { nom: "Ozone depletion (EF 3.1)", nom_court: "Ozone depletion" },
      ef_tox_cancer: { nom: "Human toxicity: cancer (EF 3.1)", nom_court: "Human tox. cancer" },
      ef_tox_non_cancer: { nom: "Human toxicity: non-cancer (EF 3.1)", nom_court: "Human tox. non-c." },
      ef_particules: { nom: "Particulate matter (EF 3.1)", nom_court: "Particulate matter" },
      ef_rayonnements: { nom: "Ionising radiation (EF 3.1)", nom_court: "Ionising radiation" },
      ef_ozone_photo: { nom: "Photochemical ozone formation (EF 3.1)", nom_court: "Photoch. ozone" },
      ef_eutro_terrestre: { nom: "Eutrophication, terrestrial (EF 3.1)", nom_court: "Eutro. terrestrial" },
      ef_eutro_eau_douce: { nom: "Eutrophication, freshwater (EF 3.1)", nom_court: "Eutro. freshwater" },
      ef_eutro_marine: { nom: "Eutrophication, marine (EF 3.1)", nom_court: "Eutro. marine" },
      ef_ecotox_eau_douce: { nom: "Ecotoxicity, freshwater (EF 3.1)", nom_court: "Ecotoxicity" },
      ef_utilisation_sols: { nom: "Land use (EF 3.1)", nom_court: "Land use" },
      ef_utilisation_eau: { nom: "Water use (EF 3.1)", nom_court: "Water use" },
      ef_ressources_min: { nom: "Resource use: minerals and metals (EF 3.1)", nom_court: "Minerals/metals" },
      ef_ressources_fos: { nom: "Resource use: fossils (EF 3.1)", nom_court: "Fossil resources" },
    },
  },
};

export function normalizeLang(lang) {
  const code = String(lang || "").toLowerCase().slice(0, 2);
  return SUPPORTED_LANGS.includes(code) ? code : DEFAULT_LANG;
}

export function detectInitialLang() {
  try {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("lang");
    if (fromUrl && SUPPORTED_LANGS.includes(fromUrl.toLowerCase())) {
      return fromUrl.toLowerCase();
    }
  } catch {}

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && SUPPORTED_LANGS.includes(saved)) {
      return saved;
    }
  } catch {}

  const browser = (navigator.language || "").toLowerCase().slice(0, 2);
  return SUPPORTED_LANGS.includes(browser) ? browser : DEFAULT_LANG;
}

export function saveLang(lang) {
  try {
    localStorage.setItem(STORAGE_KEY, normalizeLang(lang));
  } catch {}
}

export function getPack(lang) {
  return TRANSLATIONS[normalizeLang(lang)] || TRANSLATIONS[DEFAULT_LANG];
}

export function t(lang, key, vars = {}) {
  const pack = getPack(lang);
  let str = pack.ui[key] ?? TRANSLATIONS[DEFAULT_LANG].ui[key] ?? key;
  for (const [k, v] of Object.entries(vars)) {
    str = str.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
  }
  return str;
}

export function isDefaultProjectName(val) {
  const trimmed = String(val || "").trim();
  if (!trimmed) return true;
  return SUPPORTED_LANGS.some((l) => TRANSLATIONS[l].ui.defaultProjectName === trimmed);
}

export function localizeTech(tech, lang) {
  return getPack(lang).technologies[tech] || tech;
}

export function localizeUnite(uniteId, lang, variant = "full") {
  const entry = getPack(lang).unites[uniteId];
  return entry ? entry[variant] : uniteId;
}

export function localizeFluidRef(ref, lang) {
  return getPack(lang).fluidRefs[ref] || ref;
}

export function localizeFluidOption(opt, lang) {
  const entry = getPack(lang).fluidOptions[opt.id];
  return {
    ...opt,
    label: entry?.label || opt.label,
    note_methodologique: entry?.note || opt.note_methodologique,
  };
}

export function localizeIndicator(ind, lang) {
  const entry = getPack(lang).indicators[ind.id];
  return {
    ...ind,
    nom: entry?.nom || ind.nom,
    nom_court: entry?.nom_court || ind.nom_court,
  };
}