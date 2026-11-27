/**
 * js/i18n.js
 * Dictionnaire complet FR / DE / IT / EN (terminologie suisse KBOB 2027, SIA 390/1 et EF 3.1).
 */

export const SUPPORTED_LANGS = ["fr", "de", "it", "en"];
export const DEFAULT_LANG = "fr";
const STORAGE_KEY = "kbob_pac_lang";

export const TRANSLATIONS = {
  fr: {
    locale: "fr-CH",
    docs: {
      methodo: "docs/rapport_methodologique_pac_kbob2027.pdf",
      cdc: "docs/cahier_des_charges_calculateur_pac.pdf",
    },
    ui: {
      pageTitle: "Calculateur KBOB Pompe à chaleur",
      headerKicker: "Données des écobilans dans la construction (Technique du bâtiment) : Pour les planificateurs",
      headerTitle: "Calculateur KBOB Pompe à chaleur",
      headerSubtitle: "Domaine d'utilisation : PAC de puissance jusqu'à 100 kW environ",

      panelInputsTitle: "Paramètres de la PAC",
      labelTech: "Technologie (source froide)",
      labelPower: "Puissance nominale",
      powerBounds: "1 – 100 kW",
      labelFluid: "Fluide frigorigène",
      labelMass: "Masse de la pompe à chaleur",
      massEstimated: "Estimée (LCA-PAC)",
      massKnown: "Connue (saisie)",
      labelMassReal: "Masse réelle de l'appareil",
      massUsedPrefix: "Masse utilisée :",
      massExamplePrefix: "Ex.",
      labelUnit: "Unité de référence",

      scopeBoxTitle: "Périmètre et données de référence",
      scopeTerm: "Périmètre de calcul (KBOB 2027)",
      scopeDesc: "Fabrication¹ et élimination",
      dbTerm: "Données de référence des calculs",
      dbLabel: "KBOB 2027 — BAFU:2026v1 (IPCC 2021 / EF 3.1)",
      downloadDocsHeading: "Télécharger :",
      downloadMethodo: "Rapport méthodologique (PDF)",
      downloadCdc: "Cahier des charges du calculateur (PDF)",

      resultsTitle: "Résultats — Indicateurs KBOB",
      hpFullName: "Pompe à chaleur",
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
      exportSubtitle: "Téléchargez la fiche complète au format souhaité (Excel KBOB 2027, CSV, HTML ou PDF).",
      btnExcel: "Excel KBOB 2027 (.xlsx)",
      btnCsv: "CSV",
      btnHtml: "Fiche HTML",
      btnPdf: "PDF",

      footnoteHtml:
        "<strong>¹ Fabrication :</strong> inclut les fuites annuelles de fluide frigorigène en phase d'utilisation (2 %/an sur 20 ans selon hypothèse KBOB Kägi et al., 2021, pour le calcul de l'écobilan du domaine « Construction » de la SIA 390/1).",
      footnoteText:
        "¹ Fabrication : inclut les fuites annuelles de fluide frigorigène en phase d'utilisation (2 %/an sur 20 ans selon hypothèse KBOB Kägi et al., 2021, pour le calcul de l'écobilan du domaine « Construction » de la SIA 390/1).",
      footerHtml:
        "Développé par la <strong>Haute École d'Ingénierie et de Gestion du canton de Vaud (HEIG-VD — Institut des Énergies)</strong> et co-financé par l'<strong>Office fédéral de l'énergie (OFEN)</strong>, le <strong>Canton de Vaud (DIREN)</strong> et les <strong>Services Industriels de Genève (SIG)</strong>, dans le cadre du projet <strong>LCA-PAC</strong>.",
      footerPlain:
        "Développé par la HEIG-VD (Institut des Énergies) et co-financé par l'OFEN, le Canton de Vaud (DIREN) et les SIG Genève, dans le cadre du projet LCA-PAC.",

      warnPowerClamped: "La puissance nominale a été bornée dans la plage étalonnée [{min} ; {max} kW].",
      warnMassInvalid: "La masse saisie doit être strictement positive : masse estimée utilisée par défaut.",
      errLoadCsv: "Erreur lors du chargement des données CSV : {msg}",
      errNoXlsx: "La bibliothèque Excel (SheetJS) n'est pas chargée.",

      // Exports
      reportGenerated: "Généré le {date}",
      metaConfig: "Donnée configurée",
      metaDb: "Données de référence des calculs",
      metaScope: "Périmètre de calcul (KBOB 2027)",
      metaScopeValue: "Fabrication¹ et élimination",
      metaTechPower: "Technologie & Puissance",
      metaFluid: "Fluide frigorigène",
      metaFluidRef: "Donnée de référence appliquée",
      metaMass: "Masse de la pompe à chaleur",
      metaUnit: "Unité de référence",
      massManualDesc: "{val} kg (saisie manuelle)",
      massEstDesc: "{val} kg (estimée LCA-PAC)",
      excelHeaderTitle: "Calculateur KBOB Pompe à chaleur",
      excelHeaderSub: "Domaine d'utilisation : PAC de puissance jusqu'à 100 kW environ | Généré le {date} | HEIG-VD / OFEN / DIREN / SIG (LCA-PAC)",
      excelSecParams: "1. Paramètres de calcul",
      excelSecAll: "2. Indicateurs d'écobilan (KBOB 2027 & EF 3.1)",
      excelBioCarbon: "Teneur en carbone biogénique contenu dans le produit",
      csvHeaderComment: "# Calculateur KBOB Pompe à chaleur (HEIG-VD / OFEN / DIREN / SIG, projet LCA-PAC)",
      csvPowerLabel: "Puissance nominale [kW]",
      filePrefixHtml: "Fiche_KBOB_",
      filePrefixXlsx: "KBOB_2027_",
      filePrefixCsv: "KBOB_",
    },
    technologies: {
      "Air-Eau": "Air-Eau",
      "Saumure-Eau": "Saumure-Eau",
    },
    unites: {
      appareil: { short: "Par appareil", full: "Par appareil (unité pompe à chaleur)" },
      kw: { short: "Par kW", full: "Par kW de puissance nominale" },
      kg: { short: "Par kg", full: "Par kg de pompe à chaleur" },
    },
    fluidRefs: {
      "HFC (R410A)": "HFC (R410A)",
      "HFC (R32)": "HFC (R32)",
      "Naturel (R290)": "Naturel (R290)",
    },
    fluidOptions: {
      inconnu: { label: "Inconnu" },
      r410a: { label: "HFC R410A" },
      r32: { label: "HFC R32" },
      r290: { label: "Naturel R290 (propane)" },
      autres_hfc: { label: "Autres HFC" },
      hfo: { label: "HFO et mélange HFO/HFC" },
      autres_naturels: { label: "Autres réfrigérants naturels" },
    },
    indicators: {
      ubp: { nom: "Écopoints (UBP'21)", nom_court: "Écopoints (UBP'21)" },
      ges: { nom: "Émissions de GES fossiles", nom_court: "Émissions de GES fossiles" },
      nre: { nom: "Énergie Primaire (NRE)", nom_court: "Énergie Primaire (NRE)" },
      re: { nom: "Énergie Primaire (RE)", nom_court: "Énergie Primaire (RE)" },
      ef_cc_total: { nom: "Changement climatique — total (EF 3.1)", nom_court: "CC total" },
      ef_cc_biogene: { nom: "Changement climatique — biogénique (EF 3.1)", nom_court: "CC biogène" },
      ef_cc_fossile: { nom: "Changement climatique — fossile (EF 3.1)", nom_court: "CC fossile" },
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
    docs: {
      methodo: "docs/rapport_methodologique_pac_kbob2027.pdf",
      cdc: "docs/cahier_des_charges_calculateur_pac.pdf",
    },
    ui: {
      pageTitle: "KBOB-Rechner Wärmepumpe",
      headerKicker: "Ökobilanzdaten im Baubereich (Gebäudetechnik): Für Planerinnen und Planer",
      headerTitle: "KBOB-Rechner Wärmepumpe",
      headerSubtitle: "Anwendungsbereich: Wärmepumpen bis ca. 100 kW Leistung",

      panelInputsTitle: "Parameter der Wärmepumpe",
      labelTech: "Technologie (Wärmequelle)",
      labelPower: "Nennleistung",
      powerBounds: "1 – 100 kW",
      labelFluid: "Kältemittel",
      labelMass: "Masse der Wärmepumpe",
      massEstimated: "Geschätzt (LCA-PAC)",
      massKnown: "Bekannt (Eingabe)",
      labelMassReal: "Effektive Gerätemasse",
      massUsedPrefix: "Verwendete Masse:",
      massExamplePrefix: "z. B.",
      labelUnit: "Bezugseinheit",

      scopeBoxTitle: "Systemgrenze und Datengrundlage",
      scopeTerm: "Systemgrenze (KBOB 2027)",
      scopeDesc: "Herstellung¹ und Entsorgung",
      dbTerm: "Referenzdaten der Berechnungen",
      dbLabel: "KBOB 2027 — BAFU:2026v1 (IPCC 2021 / EF 3.1)",
      downloadDocsHeading: "Herunterladen:",
      downloadMethodo: "Methodikbericht (PDF)",
      downloadCdc: "Pflichtenheft des Rechners (PDF)",

      resultsTitle: "Ergebnisse — KBOB-Indikatoren",
      hpFullName: "Wärmepumpe",
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
      exportSubtitle: "Laden Sie das vollständige Datenblatt im gewünschten Format herunter (Excel KBOB 2027, CSV, HTML oder PDF).",
      btnExcel: "Excel KBOB 2027 (.xlsx)",
      btnCsv: "CSV",
      btnHtml: "HTML-Datenblatt",
      btnPdf: "PDF",

      footnoteHtml:
        "<strong>¹ Herstellung:</strong> beinhaltet die jährlichen Kältemittelleckagen während der Nutzungsphase (2 %/Jahr über 20 Jahre gemäss KBOB-Annahme Kägi et al., 2021, für die Ökobilanzberechnung im Bereich «Erstellung» der SIA 390/1).",
      footnoteText:
        "¹ Herstellung: beinhaltet die jährlichen Kältemittelleckagen während der Nutzungsphase (2 %/Jahr über 20 Jahre gemäss KBOB-Annahme Kägi et al., 2021, für die Ökobilanzberechnung im Bereich «Erstellung» der SIA 390/1).",
      footerHtml:
        "Entwickelt von der <strong>Haute École d'Ingénierie et de Gestion du canton de Vaud (HEIG-VD — Institut des Énergies)</strong> und mitfinanziert vom <strong>Bundesamt für Energie (BFE)</strong>, dem <strong>Kanton Waadt (DIREN)</strong> und den <strong>Services Industriels de Genève (SIG)</strong> im Rahmen des Projekts <strong>LCA-PAC</strong>.",
      footerPlain:
        "Entwickelt von der HEIG-VD (Institut des Énergies) und mitfinanziert von BFE, Kanton Waadt (DIREN) und SIG Genf im Rahmen des Projekts LCA-PAC.",

      warnPowerClamped: "Die Nennleistung wurde auf den kalibrierten Bereich [{min} ; {max} kW] begrenzt.",
      warnMassInvalid: "Die eingegebene Masse muss positiv sein: Es wird standardmässig die geschätzte Masse verwendet.",
      errLoadCsv: "Fehler beim Laden der CSV-Daten: {msg}",
      errNoXlsx: "Die Excel-Bibliothek (SheetJS) ist nicht geladen.",

      // Exports
      reportGenerated: "Erstellt am {date}",
      metaConfig: "Konfigurierter Datensatz",
      metaDb: "Referenzdaten der Berechnungen",
      metaScope: "Systemgrenze (KBOB 2027)",
      metaScopeValue: "Herstellung¹ und Entsorgung",
      metaTechPower: "Technologie & Leistung",
      metaFluid: "Kältemittel",
      metaFluidRef: "Verwendeter Referenzdatensatz",
      metaMass: "Masse der Wärmepumpe",
      metaUnit: "Bezugseinheit",
      massManualDesc: "{val} kg (manuelle Eingabe)",
      massEstDesc: "{val} kg (geschätzt LCA-PAC)",
      excelHeaderTitle: "KBOB-Rechner Wärmepumpe",
      excelHeaderSub: "Anwendungsbereich: Wärmepumpen bis ca. 100 kW | Erstellt am {date} | HEIG-VD / BFE / DIREN / SIG (LCA-PAC)",
      excelSecParams: "1. Berechnungsparameter",
      excelSecAll: "2. Ökobilanz-Indikatoren (KBOB 2027 & EF 3.1)",
      excelBioCarbon: "Biogener Kohlenstoffgehalt im Produkt",
      csvHeaderComment: "# KBOB-Rechner Wärmepumpe (HEIG-VD / BFE / DIREN / SIG, Projekt LCA-PAC)",
      csvPowerLabel: "Nennleistung [kW]",
      filePrefixHtml: "KBOB_Datenblatt_",
      filePrefixXlsx: "KBOB_2027_",
      filePrefixCsv: "KBOB_",
    },
    technologies: {
      "Air-Eau": "Luft-Wasser",
      "Saumure-Eau": "Sole-Wasser",
    },
    unites: {
      appareil: { short: "Pro Gerät", full: "Pro Gerät (Einheit Wärmepumpe)" },
      kw: { short: "Pro kW", full: "Pro kW Nennleistung" },
      kg: { short: "Pro kg", full: "Pro kg Wärmepumpe" },
    },
    fluidRefs: {
      "HFC (R410A)": "HFKW (R410A)",
      "HFC (R32)": "HFKW (R32)",
      "Naturel (R290)": "Natürlich (R290)",
    },
    fluidOptions: {
      inconnu: { label: "Unbekannt" },
      r410a: { label: "HFKW R410A" },
      r32: { label: "HFKW R32" },
      r290: { label: "Natürlich R290 (Propan)" },
      autres_hfc: { label: "Andere HFKW" },
      hfo: { label: "HFO und HFO/HFKW-Gemische" },
      autres_naturels: { label: "Andere natürliche Kältemittel" },
    },
    indicators: {
      ubp: { nom: "Umweltbelastungspunkte (UBP'21)", nom_court: "Umweltbelastungspunkte (UBP'21)" },
      ges: { nom: "Treibhausgasemissionen fossil", nom_court: "Treibhausgasemissionen fossil" },
      nre: { nom: "Primärenergie (NRE)", nom_court: "Primärenergie (NRE)" },
      re: { nom: "Primärenergie (RE)", nom_court: "Primärenergie (RE)" },
      ef_cc_total: { nom: "Klimawandel — total (EF 3.1)", nom_court: "Klima total" },
      ef_cc_biogene: { nom: "Klimawandel — biogen (EF 3.1)", nom_court: "Klima biogen" },
      ef_cc_fossile: { nom: "Klimawandel — fossil (EF 3.1)", nom_court: "Klima fossil" },
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
    docs: {
      methodo: "docs/rapport_methodologique_pac_kbob2027.pdf",
      cdc: "docs/cahier_des_charges_calculateur_pac.pdf",
    },
    ui: {
      pageTitle: "Calcolatore KBOB Pompa di calore",
      headerKicker: "Dati degli ecobilanci nel settore della costruzione (Tecnica della costruzione): Per i progettisti",
      headerTitle: "Calcolatore KBOB Pompa di calore",
      headerSubtitle: "Campo di applicazione: PdC di potenza fino a circa 100 kW",

      panelInputsTitle: "Parametri della pompa di calore",
      labelTech: "Tecnologia (sorgente fredda)",
      labelPower: "Potenza nominale",
      powerBounds: "1 – 100 kW",
      labelFluid: "Fluido refrigerante",
      labelMass: "Massa della pompa di calore",
      massEstimated: "Stimata (LCA-PAC)",
      massKnown: "Nota (inserimento)",
      labelMassReal: "Massa reale dell'apparecchio",
      massUsedPrefix: "Massa utilizzata:",
      massExamplePrefix: "Es.",
      labelUnit: "Unità di riferimento",

      scopeBoxTitle: "Perimetro e dati di riferimento",
      scopeTerm: "Perimetro di calcolo (KBOB 2027)",
      scopeDesc: "Produzione¹ e smaltimento",
      dbTerm: "Dati di riferimento dei calcoli",
      dbLabel: "KBOB 2027 — BAFU:2026v1 (IPCC 2021 / EF 3.1)",
      downloadDocsHeading: "Scaricare:",
      downloadMethodo: "Rapporto metodologico (PDF)",
      downloadCdc: "Capitolato d'oneri del calcolatore (PDF)",

      resultsTitle: "Risultati — Indicatori KBOB",
      hpFullName: "Pompa di calore",
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
      exportSubtitle: "Scarica la scheda completa nel formato desiderato (Excel KBOB 2027, CSV, HTML o PDF).",
      btnExcel: "Excel KBOB 2027 (.xlsx)",
      btnCsv: "CSV",
      btnHtml: "Scheda HTML",
      btnPdf: "PDF",

      footnoteHtml:
        "<strong>¹ Produzione:</strong> include le perdite annuali di fluido refrigerante durante la fase di esercizio (2 %/anno su 20 anni secondo l'ipotesi KBOB Kägi et al., 2021, per il calcolo dell'ecobilancio del settore «Costruzione» della SIA 390/1).",
      footnoteText:
        "¹ Produzione: include le perdite annuali di fluido refrigerante durante la fase di esercizio (2 %/anno su 20 anni secondo l'ipotesi KBOB Kägi et al., 2021, per il calcolo dell'ecobilancio del settore «Costruzione» della SIA 390/1).",
      footerHtml:
        "Sviluppato dalla <strong>Haute École d'Ingénierie et de Gestion du canton de Vaud (HEIG-VD — Institut des Énergies)</strong> e cofinanziato dall'<strong>Ufficio federale dell'energia (UFE)</strong>, dal <strong>Canton Vaud (DIREN)</strong> e dai <strong>Services Industriels de Genève (SIG)</strong> nell'ambito del progetto <strong>LCA-PAC</strong>.",
      footerPlain:
        "Sviluppato dalla HEIG-VD (Institut des Énergies) e cofinanziato da UFE, Canton Vaud (DIREN) e SIG Ginevra nell'ambito del progetto LCA-PAC.",

      warnPowerClamped: "La potenza nominale è stata limitata all'intervallo calibrato [{min} ; {max} kW].",
      warnMassInvalid: "La massa inserita deve essere positiva: viene utilizzata la massa stimata per impostazione predefinita.",
      errLoadCsv: "Errore durante il caricamento dei dati CSV: {msg}",
      errNoXlsx: "La libreria Excel (SheetJS) non è caricata.",

      // Exports
      reportGenerated: "Generato il {date}",
      metaConfig: "Dato configurato",
      metaDb: "Dati di riferimento dei calcoli",
      metaScope: "Perimetro di calcolo (KBOB 2027)",
      metaScopeValue: "Produzione¹ e smaltimento",
      metaTechPower: "Tecnologia e potenza",
      metaFluid: "Fluido refrigerante",
      metaFluidRef: "Dato di riferimento applicato",
      metaMass: "Massa della pompa di calore",
      metaUnit: "Unità di riferimento",
      massManualDesc: "{val} kg (inserimento manuale)",
      massEstDesc: "{val} kg (stimata LCA-PAC)",
      excelHeaderTitle: "Calcolatore KBOB Pompa di calore",
      excelHeaderSub: "Campo di applicazione: pompe di calore fino a circa 100 kW | Generato il {date} | HEIG-VD / UFE / DIREN / SIG (LCA-PAC)",
      excelSecParams: "1. Parametri di calcolo",
      excelSecAll: "2. Indicatori di ecobilancio (KBOB 2027 & EF 3.1)",
      excelBioCarbon: "Contenuto di carbonio biogenico nel prodotto",
      csvHeaderComment: "# Calcolatore KBOB Pompa di calore (HEIG-VD / UFE / DIREN / SIG, progetto LCA-PAC)",
      csvPowerLabel: "Potenza nominale [kW]",
      filePrefixHtml: "Scheda_KBOB_",
      filePrefixXlsx: "KBOB_2027_",
      filePrefixCsv: "KBOB_",
    },
    technologies: {
      "Air-Eau": "Aria-Acqua",
      "Saumure-Eau": "Salamoia-Acqua",
    },
    unites: {
      appareil: { short: "Per apparecchio", full: "Per apparecchio (unità pompa di calore)" },
      kw: { short: "Per kW", full: "Per kW di potenza nominale" },
      kg: { short: "Per kg", full: "Per kg di pompa di calore" },
    },
    fluidRefs: {
      "HFC (R410A)": "HFC (R410A)",
      "HFC (R32)": "HFC (R32)",
      "Naturel (R290)": "Naturale (R290)",
    },
    fluidOptions: {
      inconnu: { label: "Sconosciuto" },
      r410a: { label: "HFC R410A" },
      r32: { label: "HFC R32" },
      r290: { label: "Naturale R290 (propano)" },
      autres_hfc: { label: "Altri HFC" },
      hfo: { label: "HFO e miscele HFO/HFC" },
      autres_naturels: { label: "Altri refrigeranti naturali" },
    },
    indicators: {
      ubp: { nom: "Punti d'impatto ambientale (UBP'21)", nom_court: "Punti d'impatto ambientale (UBP'21)" },
      ges: { nom: "Emissioni di gas serra fossili", nom_court: "Emissioni di gas serra fossili" },
      nre: { nom: "Energia Primaria (NRE)", nom_court: "Energia Primaria (NRE)" },
      re: { nom: "Energia Primaria (RE)", nom_court: "Energia Primaria (RE)" },
      ef_cc_total: { nom: "Cambiamento climatico — totale (EF 3.1)", nom_court: "Clima totale" },
      ef_cc_biogene: { nom: "Cambiamento climatico — biogenico (EF 3.1)", nom_court: "Clima biogenico" },
      ef_cc_fossile: { nom: "Cambiamento climatico — fossile (EF 3.1)", nom_court: "Clima fossile" },
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
    docs: {
      methodo: "docs/rapport_methodologique_pac_kbob2027.pdf",
      cdc: "docs/cahier_des_charges_calculateur_pac.pdf",
    },
    ui: {
      pageTitle: "KBOB Heat Pump Calculator",
      headerKicker: "Life cycle assessment data in construction (Building services): For planners",
      headerTitle: "KBOB Heat Pump Calculator",
      headerSubtitle: "Scope of application: Heat pumps up to approx. 100 kW",

      panelInputsTitle: "Heat Pump Parameters",
      labelTech: "Technology (heat source)",
      labelPower: "Rated thermal power",
      powerBounds: "1 – 100 kW",
      labelFluid: "Refrigerant",
      labelMass: "Heat pump mass",
      massEstimated: "Estimated (LCA-PAC)",
      massKnown: "Known (manual)",
      labelMassReal: "Actual unit mass",
      massUsedPrefix: "Mass used:",
      massExamplePrefix: "e.g.",
      labelUnit: "Reference unit",

      scopeBoxTitle: "Scope and reference data",
      scopeTerm: "Calculation scope (KBOB 2027)",
      scopeDesc: "Manufacturing¹ and disposal",
      dbTerm: "Calculation reference data",
      dbLabel: "KBOB 2027 — BAFU:2026v1 (IPCC 2021 / EF 3.1)",
      downloadDocsHeading: "Download:",
      downloadMethodo: "Methodology report (PDF)",
      downloadCdc: "Calculator technical specifications (PDF)",

      resultsTitle: "Results — KBOB Indicators",
      hpFullName: "Heat pump",
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
      exportSubtitle: "Download the complete datasheet in your preferred format (KBOB 2027 Excel, CSV, HTML or PDF).",
      btnExcel: "Excel KBOB 2027 (.xlsx)",
      btnCsv: "CSV",
      btnHtml: "HTML Report",
      btnPdf: "PDF",

      footnoteHtml:
        "<strong>¹ Manufacturing:</strong> includes annual refrigerant leakage during the use phase (2%/year over 20 years according to the KBOB assumption by Kägi et al., 2021, for the SIA 390/1 Construction domain LCA).",
      footnoteText:
        "¹ Manufacturing: includes annual refrigerant leakage during the use phase (2%/year over 20 years according to the KBOB assumption by Kägi et al., 2021, for the SIA 390/1 Construction domain LCA).",
      footerHtml:
        "Developed by the <strong>School of Engineering and Management Vaud (HEIG-VD — Institute of Energies)</strong> and co-funded by the <strong>Swiss Federal Office of Energy (SFOE)</strong>, the <strong>Canton of Vaud (DIREN)</strong> and <strong>SIG Geneva</strong>, within the <strong>LCA-PAC</strong> project.",
      footerPlain:
        "Developed by HEIG-VD (Institute of Energies) and co-funded by SFOE, Canton of Vaud (DIREN) and SIG Geneva within the LCA-PAC project.",

      warnPowerClamped: "Rated power has been clamped to the calibrated range [{min}; {max} kW].",
      warnMassInvalid: "Entered mass must be strictly positive: estimated mass is used by default.",
      errLoadCsv: "Error loading CSV data: {msg}",
      errNoXlsx: "The Excel library (SheetJS) is not loaded.",

      // Exports
      reportGenerated: "Generated on {date}",
      metaConfig: "Configured dataset",
      metaDb: "Calculation reference data",
      metaScope: "Calculation scope (KBOB 2027)",
      metaScopeValue: "Manufacturing¹ and disposal",
      metaTechPower: "Technology & Rated power",
      metaFluid: "Refrigerant",
      metaFluidRef: "Applied reference dataset",
      metaMass: "Heat pump mass",
      metaUnit: "Reference unit",
      massManualDesc: "{val} kg (manual input)",
      massEstDesc: "{val} kg (estimated LCA-PAC)",
      excelHeaderTitle: "KBOB Heat Pump Calculator",
      excelHeaderSub: "Scope: Heat pumps up to approx. 100 kW | Generated on {date} | HEIG-VD / SFOE / DIREN / SIG (LCA-PAC)",
      excelSecParams: "1. Calculation parameters",
      excelSecAll: "2. LCA indicators (KBOB 2027 & EF 3.1)",
      excelBioCarbon: "Biogenic carbon content in product",
      csvHeaderComment: "# KBOB Heat Pump Calculator (HEIG-VD / SFOE / DIREN / SIG, LCA-PAC project)",
      csvPowerLabel: "Rated power [kW]",
      filePrefixHtml: "KBOB_Report_",
      filePrefixXlsx: "KBOB_2027_",
      filePrefixCsv: "KBOB_",
    },
    technologies: {
      "Air-Eau": "Air-to-Water",
      "Saumure-Eau": "Brine-to-Water",
    },
    unites: {
      appareil: { short: "Per unit", full: "Per unit (heat pump appliance)" },
      kw: { short: "Per kW", full: "Per kW of rated power" },
      kg: { short: "Per kg", full: "Per kg of heat pump" },
    },
    fluidRefs: {
      "HFC (R410A)": "HFC (R410A)",
      "HFC (R32)": "HFC (R32)",
      "Naturel (R290)": "Natural (R290)",
    },
    fluidOptions: {
      inconnu: { label: "Unknown" },
      r410a: { label: "HFC R410A" },
      r32: { label: "HFC R32" },
      r290: { label: "Natural R290 (propane)" },
      autres_hfc: { label: "Other HFC" },
      hfo: { label: "HFO and HFO/HFC blends" },
      autres_naturels: { label: "Other natural refrigerants" },
    },
    indicators: {
      ubp: { nom: "Eco-points (UBP'21)", nom_court: "Eco-points (UBP'21)" },
      ges: { nom: "Fossil GHG emissions", nom_court: "Fossil GHG emissions" },
      nre: { nom: "Primary Energy (NRE)", nom_court: "Primary Energy (NRE)" },
      re: { nom: "Primary Energy (RE)", nom_court: "Primary Energy (RE)" },
      ef_cc_total: { nom: "Climate change — total (EF 3.1)", nom_court: "CC total" },
      ef_cc_biogene: { nom: "Climate change — biogenic (EF 3.1)", nom_court: "CC biogenic" },
      ef_cc_fossile: { nom: "Climate change — fossil (EF 3.1)", nom_court: "CC fossil" },
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

export function buildConfiguredTitle(res, lang, includeUnit = true) {
  const hp = t(lang, "hpFullName");
  const tech = localizeTech(res.technologie, lang);
  const fluidRef = localizeFluidRef(res.fluideReference, lang);
  const massStr = `${res.massInfo.masseUtiliseeKg.toFixed(1)} kg`;
  const parts = [`${hp} ${tech}`, `${res.puissanceKw} kW`, fluidRef, massStr];
  if (includeUnit) {
    parts.push(localizeUnite(res.uniteReference, lang, "full"));
  }
  return parts.join(" · ");
}