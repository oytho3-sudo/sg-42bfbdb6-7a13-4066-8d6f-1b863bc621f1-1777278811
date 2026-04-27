'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

// ═══════════════════════════════════════════════════════════════════════════════
// i18n
// ═══════════════════════════════════════════════════════════════════════════════

type Lang = 'de' | 'en' | 'fr';

const translations = {
  de: {
    loadJson:       '📂 JSON laden',
    savePdf:        '⬇ Als PDF speichern',
    shareJson:      '📤 JSON teilen',
    saveJson:       '💾 JSON speichern',
    toolbarTitle:   'Wartungsprotokoll GSK · GERLIEVA Sprühtechnik GmbH',
    pdfAlert:       'Im Druckdialog:\n1. Drucker → "Als PDF speichern"\n2. Weitere Einstellungen → "Hintergrundgrafiken" ✓ aktivieren\n3. Ränder auf "Minimal" setzen\n→ Dann sind alle Farben im PDF enthalten.',
    toastSaved:     '✅ JSON gespeichert!',
    toastDownloaded:'✅ JSON heruntergeladen!',
    toastLoaded:    '✅ Datei erfolgreich geladen!',
    toastInvalid:   'Ungültige JSON-Datei',
    toastError:     'Fehler: ',
    toastLoadError: 'Fehler beim Laden: ',
    docTitle:       'Wartungsprotokoll',
    labelKunde:     'Kunde',
    labelArbeitsplatz: 'Betr.St.',
    labelDgm:       'DGM',
    labelPosition:  'Position',
    labelMaschinTyp:'Presse',
    labelMaschineNr:'Maschine Nr.',
    labelKom:       'Kom.',
    labelBaujahr:   'Baujahr',
    colPruefpunkt:  'Prüfpunkt / Kontrollieren auf',
    colOk:          'o.k.',
    colName:        'Name',
    colBemerkung:   'Bemerkung – Stückzahl und Bezeichnung getauschter Teile eintragen, möglichst mit Artikel Nr.',
    sectionGerlieva:'GERLIEVA',
    labelDatum:     'Datum:',
    sectionSign:    'BESTÄTIGUNG / UNTERSCHRIFTEN',
    sigGerlieva:    'Unterschrift GERLIEVA',
    sigKunde:       'Unterschrift Kunde',
    sigPlaceholderTech:  'Name Techniker',
    sigPlaceholderKunde: 'Name Kunde',
    sigDelete:      '✕ Löschen',
    sigLabel:       'Hier unterschreiben',
    sigClear:       '🗑 Löschen',
    sigCancel:      'Abbrechen',
    sigOk:          '✓ Bestätigen',
    sigTap:         'Tippen zum Unterschreiben',
    labelGesamtAZ:  'gesamte Arbeitszeit:',
    labelVon:       'von',
    labelBis:       'bis',
    labelWartung:   'Wartung',
    thDatum:        'Datum',
    thTechniker:    'Techniker',
    thAzVon:        'Arbeitszeit von',
    thAzBis:        'bis',
    thPause:        'Pause (Min)',
    btnTagHinzu:    '+ Tag',
    btnTagEntf:     '−',
    btnTagEntf2:    '− Tag',
    btnMonteurHinzu: '+ Monteur',
    btnMonteurEntf:  '− Monteur',
    labelMonteur:   'Monteur',
    thTagTyp:       'Tagestyp',
    tagTypNormal:   '—',
    tagTypFeiertag: 'Feiertag',
    tagTypSamstag:  'Samstag',
    tagTypSonntag:  'Sonntag',
    tagTypNacht:    'Nachtstunden',
    nullPunktTitle: '0-Punkt Markierung:',
    nullHor:        'Hor.',
    nullVert:       'Vert.',
    nullVorhanden:  'Vorhanden',
    nullGetauscht:  'Getauscht',
    battTitle:      'Batterieeinschub mit Lüfter:',
    battGetauscht:  'getauscht',
    druckTitle:     'Drucküberwachung:',
    druckAktiv:     'aktiv',
    druckBar:       'Bar',
    druckTrennmittel: 'Trennmittel:',
    druckLuft:      'Luft:',
    techPlaceholder:'________________',
    home:           '🏠 Home',
    labelWartungShare: 'Wartungsprotokoll GERLIEVA',
    sectionMaterial:'Material- und Teileliste',
    thPos:          'Pos.',
    thBeschreibung: 'Beschreibung',
    thTeilenummer:  'Teilenummer',
    thStk:          'Stk.',
    // Divider
    divAllgemein:   '▶  ALLGEMEIN',
    divHorizontal:  '▶  HORIZONTAL',
    divVertikal:    '▶  VERTIKAL',
    // Prüfpunkte
    p01: 'Erster Eindruck Abdeckungen vorhanden / Sauberkeit, usw.',
    p02: 'Probelauf Laufgeräusche / optischer Eindruck / Bodenfixierung',
    p03: 'Zentralschmierung Druckminderer vorhanden / Funktion, Dichtigkeit /<br/>Richtiges Öl eingefüllt / Deckel / Messanschluss',
    p04: 'Versorgungsplatte Öl in Zentralschmier-Pumpe auf Wasser testen (umrühren) / Öler / Filter / Manometer / Drücke',
    p05: 'Funktion Sprühen Funktion / Belegung / Dichtigkeit',
    p06: 'AVS-Verschlusseinheiten Dichtigkeit / Funktion',
    p07: 'Abstreifer Zustand horizontal',
    p08: 'Linearführung Spiel (Trägerrohr anheben) / Rost / Laufspuren /<br/>Abstreifer / Lager nachschmieren',
    p09: 'Riemenantrieb Zahnriemen / Riemenspannung / Riemenscheibe',
    p10: 'Spannsatz Drehmoment 12 Nm',
    p11: 'Riemenhalter sind Schrauben fest',
    p12: 'Getriebe Laufgeräusch / Sichtkontrolle / Ölaustritt<br/>Bei Schneckengetriebe axiale Sicherung der Abtriebswelle!!',
    p13: 'Endschalter mech. u. induktiv Verschleiß an der Rolle / Funktion',
    p14: 'Trägerrohr Schweißnähte / Ausrichtung; sind Schrauben fest<br/>Dichtigkeit der Anschlussplatten',
    p15: 'Fahrrahmen',
    p16: 'Höhenverstellung Festigkeit Wagenheber / Schrauben',
    p17: 'Sicherheitsschalter Grundstellung',
    p18: 'Bodenbefestigung heben Rollen ab',
    p19: 'Spanner Funktion / Festigkeit',
    p20: 'Ventile Funktion / Stecker; Dichtungen',
    p21: 'Schläuche Alterung / Beschädigung; Dichtigkeit<br/>Steuerluftschläuche im Verteiler',
    p22: 'Motorhaltebremse vert. Bei Notaus Haltekraft prüfen',
    p23: 'Energieketten Halterungen fest / Beschädigung; alle Deckel vorhanden',
    p24: 'Kabel und Stecker Sichtkontrolle / Beschädigung',
    p25: 'Lampentest Bedienteil Schlösser Funktion',
    p26: '<strong>Bemerkungen</strong><br/><strong>Wartung Vorjahr</strong>',
    p27: '<strong>Maßnahmen/<br/>Empfehlungen</strong>',
  },
  en: {
    loadJson:       '📂 Load JSON',
    savePdf:        '⬇ Save as PDF',
    shareJson:      '📤 Share JSON',
    saveJson:       '💾 Save JSON',
    toolbarTitle:   'Maintenance Log GSK · GERLIEVA Sprühtechnik GmbH',
    pdfAlert:       'In the print dialog:\n1. Printer → "Save as PDF"\n2. More settings → enable "Background graphics" ✓\n→ This ensures all colours appear in the PDF.',
    toastSaved:     '✅ JSON saved!',
    toastDownloaded:'✅ JSON downloaded!',
    toastLoaded:    '✅ File loaded successfully!',
    toastInvalid:   'Invalid JSON file',
    toastError:     'Error: ',
    toastLoadError: 'Error loading file: ',
    docTitle:       'Maintenance Log',
    labelKunde:     'Customer',
    labelArbeitsplatz: 'Workplace / Op.St.',
    labelDgm:       'DGM',
    labelPosition:  'Position',
    labelMaschinTyp:'Press',
    labelMaschineNr:'Machine No.',
    labelKom:       'Com.',
    labelBaujahr:   'Year',
    colPruefpunkt:  'Inspection Point / Check for',
    colOk:          'o.k.',
    colName:        'Name',
    colBemerkung:   'Remarks – quantity and description of replaced parts, preferably with article no.',
    sectionGerlieva:'GERLIEVA',
    labelDatum:     'Date:',
    sectionSign:    'CONFIRMATION / SIGNATURES',
    sigGerlieva:    'Signature GERLIEVA',
    sigKunde:       'Customer Signature',
    sigPlaceholderTech:  'Technician Name',
    sigPlaceholderKunde: 'Customer Name',
    sigDelete:      '✕ Clear',
    sigLabel:       'Sign here',
    sigClear:       '🗑 Clear',
    sigCancel:      'Cancel',
    sigOk:          '✓ Confirm',
    sigTap:         'Tap to sign',
    labelGesamtAZ:  'total working time:',
    labelVon:       'from',
    labelBis:       'to',
    labelWartung:   'Maintenance',
    thDatum:        'Date',
    thTechniker:    'Technician',
    thAzVon:        'Working time from',
    thAzBis:        'to',
    thPause:        'Break (min)',
    btnTagHinzu:    '+ Day',
    btnTagEntf:     '−',
    btnTagEntf2:    '− Day',
    btnMonteurHinzu: '+ Technician',
    btnMonteurEntf:  '− Technician',
    labelMonteur:   'Technician',
    thTagTyp:       'Day type',
    tagTypNormal:   '—',
    tagTypFeiertag: 'Holiday',
    tagTypSamstag:  'Saturday',
    tagTypSonntag:  'Sunday',
    tagTypNacht:    'Night hours',
    nullPunktTitle: 'Zero-Point Marking:',
    nullHor:        'Hor.',
    nullVert:       'Vert.',
    nullVorhanden:  'Present',
    nullGetauscht:  'Replaced',
    battTitle:      'Battery unit with fan:',
    battGetauscht:  'replaced',
    druckTitle:     'Pressure monitoring:',
    druckAktiv:     'active',
    druckBar:       'Bar',
    druckTrennmittel: 'Release agent:',
    druckLuft:      'Air:',
    techPlaceholder:'________________',
    home:           '🏠 Home',
    labelWartungShare: 'Maintenance Log GERLIEVA',
    sectionMaterial:'Materials & Parts List',
    thPos:          'Pos.',
    thBeschreibung: 'Description',
    thTeilenummer:  'Part Number',
    thStk:          'Qty.',
    divAllgemein:   '▶  GENERAL',
    divHorizontal:  '▶  HORIZONTAL',
    divVertikal:    '▶  VERTICAL',
    p01: 'First impression – covers present / cleanliness, etc.',
    p02: 'Test run – running noise / visual impression / floor fixation',
    p03: 'Central lubrication – pressure reducer: function / tightness<br/>Correct oil / cap / measuring connection',
    p04: 'Supply plate – oil in central lubrication pump, check for water (stir) / oiler / filter / manometer / pressures',
    p05: 'Spray function – function / assignment / tightness',
    p06: 'AVS closing units – tightness / function',
    p07: 'Wiper – condition horizontal',
    p08: 'Linear guide – play (lift support tube) / rust / wear marks<br/>Wipers / re-grease bearings',
    p09: 'Belt drive – toothed belt / belt tension / belt pulley',
    p10: 'Clamping set – torque 12 Nm',
    p11: 'Belt holder – screws tight',
    p12: 'Gearbox – running noise / visual check / oil leakage<br/>Worm gear: axial securing of output shaft!!',
    p13: 'Limit switch mech. and inductive – roller wear / function',
    p14: 'Support tube – welds / alignment / screws tight<br/>Tightness of connection plates',
    p15: 'Travel frame',
    p16: 'Height adjustment – rigidity, jack / screws',
    p17: 'Safety switch – home position',
    p18: 'Floor fixing – lift rollers off',
    p19: 'Tensioner – function / rigidity',
    p20: 'Valves – function / connectors / seals',
    p21: 'Hoses – ageing / damage / tightness<br/>Control air hoses in distributor',
    p22: 'Motor holding brake vert. – check holding force at emergency stop',
    p23: 'Cable drag chains – brackets secure / damage / all covers present',
    p24: 'Cables and connectors – visual check / damage',
    p25: 'Lamp test – control panel locks function',
    p26: '<strong>Remarks</strong><br/><strong>Previous maintenance</strong>',
    p27: '<strong>Measures/<br/>Recommendations</strong>',
  },
  fr: {
    loadJson:       '📂 Charger JSON',
    savePdf:        '⬇ Enregistrer en PDF',
    shareJson:      '📤 Partager JSON',
    saveJson:       '💾 Sauvegarder JSON',
    toolbarTitle:   'Protocole de maintenance GSK · GERLIEVA Sprühtechnik GmbH',
    pdfAlert:       "Dans la boîte de dialogue d'impression :\n1. Imprimante → \"Enregistrer en PDF\"\n2. Paramètres → activer \"Graphiques d'arrière-plan\" ✓\n→ Toutes les couleurs apparaîtront dans le PDF.",
    toastSaved:     '✅ JSON enregistré !',
    toastDownloaded:'✅ JSON téléchargé !',
    toastLoaded:    '✅ Fichier chargé avec succès !',
    toastInvalid:   'Fichier JSON invalide',
    toastError:     'Erreur : ',
    toastLoadError: 'Erreur de chargement : ',
    docTitle:       'Protocole de maintenance',
    labelKunde:     'Client',
    labelArbeitsplatz: 'Poste d\'op.',
    labelDgm:       'DGM',
    labelPosition:  'Position',
    labelMaschinTyp:'Presse',
    labelMaschineNr:'N° machine',
    labelKom:       'Com.',
    labelBaujahr:   'Année',
    colPruefpunkt:  'Point de contrôle / Vérifier',
    colOk:          'o.k.',
    colName:        'Nom',
    colBemerkung:   'Remarques – quantité et désignation des pièces remplacées, de préférence avec n° article.',
    sectionGerlieva:'GERLIEVA',
    labelDatum:     'Date :',
    sectionSign:    'CONFIRMATION / SIGNATURES',
    sigGerlieva:    'Signature GERLIEVA',
    sigKunde:       'Signature client',
    sigPlaceholderTech:  'Nom du technicien',
    sigPlaceholderKunde: 'Nom du client',
    sigDelete:      '✕ Effacer',
    sigLabel:       'Signer ici',
    sigClear:       '🗑 Effacer',
    sigCancel:      'Annuler',
    sigOk:          '✓ Confirmer',
    sigTap:         'Appuyer pour signer',
    labelGesamtAZ:  'temps de travail total :',
    labelVon:       'de',
    labelBis:       'à',
    labelWartung:   'Maintenance',
    thDatum:        'Date',
    thTechniker:    'Technicien',
    thAzVon:        'Temps de travail de',
    thAzBis:        'à',
    thPause:        'Pause (min)',
    btnTagHinzu:    '+ Jour',
    btnTagEntf:     '−',
    btnTagEntf2:    '− Jour',
    btnMonteurHinzu: '+ Technicien',
    btnMonteurEntf:  '− Technicien',
    labelMonteur:   'Technicien',
    thTagTyp:       'Type de jour',
    tagTypNormal:   '—',
    tagTypFeiertag: 'Jour férié',
    tagTypSamstag:  'Samedi',
    tagTypSonntag:  'Dimanche',
    tagTypNacht:    'Heures de nuit',
    nullPunktTitle: 'Marquage point zéro :',
    nullHor:        'Hor.',
    nullVert:       'Vert.',
    nullVorhanden:  'Présent',
    nullGetauscht:  'Remplacé',
    battTitle:      'Module batterie avec ventilateur :',
    battGetauscht:  'remplacé',
    druckTitle:     'Surveillance pression :',
    druckAktiv:     'actif',
    druckBar:       'Bar',
    druckTrennmittel: 'Agent de démoulage :',
    druckLuft:      'Air :',
    techPlaceholder:'________________',
    home:           '🏠 Accueil',
    labelWartungShare: 'Protocole de maintenance GERLIEVA',
    sectionMaterial:'Liste des matériaux et pièces',
    thPos:          'Pos.',
    thBeschreibung: 'Description',
    thTeilenummer:  'N° de pièce',
    thStk:          'Qté.',
    divAllgemein:   '▶  GÉNÉRAL',
    divHorizontal:  '▶  HORIZONTAL',
    divVertikal:    '▶  VERTICAL',
    p01: "Première impression – capots présents / propreté, etc.",
    p02: "Essai de marche – bruits / impression visuelle / fixation au sol",
    p03: "Graissage central – réducteur de pression : fonction / étanchéité<br/>Huile correcte / bouchon / raccord de mesure",
    p04: "Plaque d'alimentation – huile dans la pompe de graissage central, vérifier eau (agiter) / huileur / filtre / manomètre / pressions",
    p05: 'Fonction pulvérisation – fonction / affectation / étanchéité',
    p06: 'Unités de fermeture AVS – étanchéité / fonction',
    p07: 'Racleur – état horizontal',
    p08: "Guidage linéaire – jeu (soulever tube porteur) / rouille / traces<br/>Racleurs / re-graisser paliers",
    p09: 'Entraînement par courroie – courroie crantée / tension / poulie',
    p10: 'Serrage – couple 12 Nm',
    p11: 'Support courroie – vis serrées',
    p12: "Réducteur – bruit / contrôle visuel / fuite huile<br/>Vis sans fin : sécurité axiale de l'arbre de sortie !!",
    p13: 'Fin de course méc. et inductif – usure du galet / fonction',
    p14: 'Tube porteur – soudures / alignement / vis serrées<br/>Étanchéité des plaques de connexion',
    p15: 'Châssis de déplacement',
    p16: 'Réglage en hauteur – solidité, cric / vis',
    p17: 'Interrupteur de sécurité – position de base',
    p18: 'Fixation au sol – lever les roues',
    p19: 'Tendeur – fonction / solidité',
    p20: 'Vannes – fonction / connecteurs / joints',
    p21: 'Flexibles – vieillissement / dommages / étanchéité<br/>Flexibles air de commande dans le distributeur',
    p22: "Frein de maintien moteur vert. – vérifier force de maintien à l'arrêt d'urgence",
    p23: 'Chaînes porte-câbles – fixations / dommages / tous couvercles présents',
    p24: 'Câbles et connecteurs – contrôle visuel / dommages',
    p25: 'Test lampes – serrures panneau de commande fonctionnent',
    p26: '<strong>Remarques</strong><br/><strong>Maintenance année précédente</strong>',
    p27: '<strong>Mesures/<br/>Recommandations</strong>',
  },
} satisfies Record<Lang, Record<string, string>>;

type TKeys = keyof typeof translations['de'];
type T = Record<TKeys, string>;

// ═══════════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════════

type CheckState = 0 | 1 | 2;
type Ck2State   = 0 | 1;

interface Zeile {
  divider?: TKeys;
  textKey?: TKeys;
  bem?: string | null;
}

interface ZeilenState {
  ck:   CheckState;
  name: string;
  bem:  string;
}

interface MaterialRow {
  pos: string; beschreibung: string; teilenummer: string; stk: string;
}

interface MontagTag {
  datum:    string;
  vonZeit:  string;
  bisZeit:  string;
  pauseMin: string;
  tagTyp:   '' | 'feiertag' | 'samstag' | 'sonntag';
}

interface Monteur {
  name: string;
  tage: MontagTag[];
}

interface FormData {
  version:       number;
  ts:            string;
  kunde:         string;
  arbeitsplatz:  string;
  dgm:           string;
  position:      string;
  maschinTyp:    string;
  maschineNr:    string;
  kom:           string;
  baujahr:       string;
  wartungDatum:  string;
  monteure:      Monteur[];
  nameGerlieva:  string;
  nameKunde:     string;
  signatureDate: string;
  signatures:    { 'sig-gerlieva'?: string; 'sig-kunde'?: string };
  bemerkungen:   string;
  massnahmen:    string;
  zeilenState:   ZeilenState[];
  material:      MaterialRow[];
  nullPunkt:     { horVorh: Ck2State; horGet: Ck2State; vertVorh: Ck2State; vertGet: Ck2State };
  batt:          { b1: Ck2State; b2: Ck2State };
  druck:         { tmAktiv: Ck2State; luftAktiv: Ck2State; tmBar: string; luftBar: string };
}

// ═══════════════════════════════════════════════════════════════════════════════
// Zeilen-Daten
// ═══════════════════════════════════════════════════════════════════════════════

// Seite 1: ALLE Prüfpunkte (p01–p27) + Spezialzeilen
const alleZeilen: Zeile[] = [
  { divider: 'divAllgemein' },
  { textKey: 'p01', bem: '' },
  { textKey: 'p02', bem: '' },
  { textKey: 'p03', bem: '' },
  { textKey: 'p04', bem: '' },
  { textKey: 'p05', bem: '' },
  { textKey: 'p06', bem: '' },
  { textKey: 'p07', bem: '' },
  { divider: 'divHorizontal' },
  { textKey: 'p08', bem: '' },
  { textKey: 'p09', bem: '' },
  { textKey: 'p10', bem: '' },
  { textKey: 'p11', bem: '' },
  { textKey: 'p12', bem: '' },
  { textKey: 'p13', bem: '' },
  { textKey: 'p14', bem: '' },
  { textKey: 'p15', bem: '' },
  { textKey: 'p16', bem: '' },
  { textKey: 'p17', bem: '' },
  { textKey: 'p18', bem: '' },
  { textKey: 'p19', bem: '' },
  { divider: 'divAllgemein' },
  { textKey: 'p20', bem: '' },
  { textKey: 'p21', bem: '' },
  { textKey: 'p22', bem: '' },
  { textKey: 'p23', bem: '' },
  { textKey: 'p24', bem: '' },
  { textKey: 'p25', bem: '' },
  // p26/p27 = bem=null Zeilen (nach den 3 Spezialzeilen gerendert)
  { textKey: 'p26', bem: null },
  { textKey: 'p27', bem: null },
];

// Seite 2: leer (Fuß + Unterschriften werden separat gerendert)
const seite2Zeilen: Zeile[] = [];

// Gesamtanzahl Zeilen für zeilenState-Array:
// alleZeilen.length + seite2Zeilen.length (inkl. null-Zeilen) + 3 Spezialzeilen
const TOTAL_ZEILEN_COUNT = alleZeilen.length + 3; // +3 für Spezialzeilen

const emptyTag      = (): MontagTag => ({ datum: '', vonZeit: '', bisZeit: '', pauseMin: '', tagTyp: '' });
const emptyMonteur  = (): Monteur  => ({ name: '', tage: [emptyTag()] });
const emptyMaterial = (): MaterialRow => ({ pos: '', beschreibung: '', teilenummer: '', stk: '' });

const initialForm = (): FormData => ({
  version:       1,
  ts:            '',
  kunde:         '',
  arbeitsplatz:  '',
  dgm:           '',
  position:      '',
  maschinTyp:    '',
  maschineNr:    '',
  kom:           '',
  baujahr:       '',
  wartungDatum:  '',
  monteure:      [emptyMonteur()],
  nameGerlieva:  '',
  nameKunde:     '',
  signatureDate: '',
  signatures:    {},
  bemerkungen:   '',
  massnahmen:    '',
  zeilenState:   Array.from({ length: TOTAL_ZEILEN_COUNT }, () => ({ ck: 0 as CheckState, name: '', bem: '' })),
  material:      Array.from({ length: 15 }, emptyMaterial),
  nullPunkt:     { horVorh: 0, horGet: 0, vertVorh: 0, vertGet: 0 },
  batt:          { b1: 0, b2: 0 },
  druck:         { tmAktiv: 0, luftAktiv: 0, tmBar: '', luftBar: '' },
});

// ═══════════════════════════════════════════════════════════════════════════════
// Hilfsfunktionen
// ═══════════════════════════════════════════════════════════════════════════════

function calcNettoMin(tag: MontagTag): number {
  if (!tag.vonZeit || !tag.bisZeit) return 0;
  const [vh, vm] = tag.vonZeit.split(':').map(Number);
  const [bh, bm] = tag.bisZeit.split(':').map(Number);
  const diff = (bh * 60 + bm) - (vh * 60 + vm);
  const pause = parseInt(tag.pauseMin) || 0;
  return diff > 0 ? diff - pause : 0;
}

// Nachtstunden: Minuten vor 06:00 und nach 20:00 (ohne Pause-Anteil)
function calcNachtMin(tag: MontagTag): number {
  if (!tag.vonZeit || !tag.bisZeit) return 0;
  const [vh, vm] = tag.vonZeit.split(':').map(Number);
  const [bh, bm] = tag.bisZeit.split(':').map(Number);
  const von  = vh * 60 + vm;
  const bis  = bh * 60 + bm;
  if (bis <= von) return 0;
  const NACHT_START = 20 * 60; // 20:00
  const NACHT_ENDE  =  6 * 60; //  6:00
  // Minuten vor 06:00
  const vorSechs = von < NACHT_ENDE ? Math.min(bis, NACHT_ENDE) - von : 0;
  // Minuten nach 20:00
  const nachZwanzig = bis > NACHT_START ? bis - Math.max(von, NACHT_START) : 0;
  return Math.max(0, vorSechs + nachZwanzig);
}

function formatMin(min: number): string {
  if (min <= 0) return '';
  return `${String(Math.floor(min / 60)).padStart(2, '0')} h ${String(min % 60).padStart(2, '0')} min`;
}

function calcGesamtMinutes(monteure: Monteur[]): string {
  let total = 0;
  monteure.forEach(m => m.tage.forEach(tag => { total += calcNettoMin(tag); }));
  return formatMin(total);
}

function calcGesamtBreakdown(monteure: Monteur[]): { total: number; samstag: number; sonntag: number; feiertag: number; nacht: number } {
  let total = 0, samstag = 0, sonntag = 0, feiertag = 0, nacht = 0;
  monteure.forEach(m => m.tage.forEach(tag => {
    const min = calcNettoMin(tag);
    total += min;
    if (tag.tagTyp === 'samstag')  samstag  += min;
    if (tag.tagTyp === 'sonntag')  sonntag  += min;
    if (tag.tagTyp === 'feiertag') feiertag += min;
    nacht += calcNachtMin(tag);
  }));
  return { total, samstag, sonntag, feiertag, nacht };
}

function buildFileName(ext: string, maschineNr: string): string {
  const nr = maschineNr.trim().replace(/[^a-zA-Z0-9_\-]/g, '_');
  const d  = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return (nr ? `Wartungsprotokoll_${nr}_${d}` : `Wartungsprotokoll_${d}`) + '.' + ext;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Language Switcher
// ═══════════════════════════════════════════════════════════════════════════════

function FlagDE() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 20" width="30" height="20" style={{ display: 'block', borderRadius: 2 }}>
      <rect width="30" height="20" fill="#000"/>
      <rect y="6.67" width="30" height="6.67" fill="#D00"/>
      <rect y="13.33" width="30" height="6.67" fill="#FFCE00"/>
    </svg>
  );
}

function FlagEN() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 20" width="30" height="20" style={{ display: 'block', borderRadius: 2 }}>
      <rect width="30" height="20" fill="#012169"/>
      <line x1="0" y1="0" x2="30" y2="20" stroke="#fff" strokeWidth="4"/>
      <line x1="30" y1="0" x2="0" y2="20" stroke="#fff" strokeWidth="4"/>
      <line x1="0" y1="0" x2="30" y2="20" stroke="#C8102E" strokeWidth="2.4"/>
      <line x1="30" y1="0" x2="0" y2="20" stroke="#C8102E" strokeWidth="2.4"/>
      <rect x="12" y="0" width="6" height="20" fill="#fff"/>
      <rect y="7" width="30" height="6" fill="#fff"/>
      <rect x="13" y="0" width="4" height="20" fill="#C8102E"/>
      <rect y="8" width="30" height="4" fill="#C8102E"/>
    </svg>
  );
}

function FlagFR() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 20" width="30" height="20" style={{ display: 'block', borderRadius: 2 }}>
      <rect width="30" height="20" fill="#ED2939"/>
      <rect width="20" height="20" fill="#fff"/>
      <rect width="10" height="20" fill="#002395"/>
    </svg>
  );
}

const FLAG_COMPONENTS: Record<Lang, () => JSX.Element> = { de: FlagDE, en: FlagEN, fr: FlagFR };

function LangSwitcher({ current, onChange }: { current: Lang; onChange: (l: Lang) => void }) {
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      {(['de', 'en', 'fr'] as Lang[]).map(l => {
        const FlagComp = FLAG_COMPONENTS[l];
        return (
          <button key={l} onClick={() => onChange(l)} title={l.toUpperCase()} style={{
            border: current === l ? '2px solid #fff' : '2px solid transparent',
            background: current === l ? 'rgba(255,255,255,0.18)' : 'transparent',
            borderRadius: 4, cursor: 'pointer', padding: '2px 4px', lineHeight: 1,
            transition: 'all 0.15s', display: 'flex', alignItems: 'center',
          }}>
            <FlagComp />
          </button>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Toast
// ═══════════════════════════════════════════════════════════════════════════════

function Toast({ msg, type, visible }: { msg: string; type: 'success' | 'error' | ''; visible: boolean }) {
  return (
    <div style={{
      position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)',
      background: type === 'success' ? '#1a7a3a' : type === 'error' ? '#c53a08' : '#333',
      color: 'white', padding: '12px 24px', borderRadius: 8, fontSize: 14, zIndex: 10000,
      opacity: visible ? 1 : 0, transition: 'opacity 0.3s ease', pointerEvents: 'none',
      maxWidth: '90%', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    }}>{msg}</div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Signature Modal
// ═══════════════════════════════════════════════════════════════════════════════

interface SigModalProps { label: string; existing?: string; onClose: (dataUrl?: string) => void; t: T; }

function SignatureModal({ label, existing, onClose, t }: SigModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing   = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const resize = () => {
      const container = canvas.parentElement!;
      const dpr = window.devicePixelRatio || 1;
      const w = Math.max(container.clientWidth - 16, 100);
      const h = Math.max(container.clientHeight - 16, 80);
      // Aktuellen Inhalt retten bevor Canvas-Größe geändert wird
      const tmp = document.createElement('canvas');
      tmp.width = canvas.width; tmp.height = canvas.height;
      tmp.getContext('2d')!.drawImage(canvas, 0, 0);
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
      const ctx = canvas.getContext('2d')!;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      // Alten Inhalt maßstabsgerecht zurückzeichnen
      const oldW = tmp.width / dpr, oldH = tmp.height / dpr;
      ctx.drawImage(tmp, 0, 0, oldW, oldH, 0, 0, w, h);
    };
    setTimeout(resize, 50);
    const observer = new ResizeObserver(() => resize());
    if (canvas.parentElement) observer.observe(canvas.parentElement);
    window.addEventListener('resize', resize);
    return () => { observer.disconnect(); window.removeEventListener('resize', resize); };
  }, []);

  useEffect(() => {
    if (!existing || !canvasRef.current) return;
    setTimeout(() => {
      const canvas = canvasRef.current!;
      const img = new Image();
      img.onload = () => canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
      img.src = existing;
    }, 200);
  }, [existing]);

  const getPos = (e: React.MouseEvent | React.TouchEvent, c: HTMLCanvasElement) => {
    const r = c.getBoundingClientRect(), src = 'touches' in e ? e.touches[0] : e;
    // Skalierung berücksichtigen: canvas kann via CSS kleiner dargestellt sein als intern
    const scaleX = c.width  / (window.devicePixelRatio || 1) / r.width;
    const scaleY = c.height / (window.devicePixelRatio || 1) / r.height;
    return { x: (src.clientX - r.left) * scaleX, y: (src.clientY - r.top) * scaleY };
  };
  const onStart = (e: React.MouseEvent | React.TouchEvent) => { e.preventDefault(); drawing.current = true; const c = canvasRef.current!; const ctx = c.getContext('2d')!; const p = getPos(e, c); ctx.beginPath(); ctx.moveTo(p.x, p.y); };
  const onMove  = (e: React.MouseEvent | React.TouchEvent) => { e.preventDefault(); if (!drawing.current) return; const c = canvasRef.current!; const ctx = c.getContext('2d')!; const p = getPos(e, c); ctx.lineTo(p.x, p.y); ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(); };
  const onStop  = () => { drawing.current = false; canvasRef.current?.getContext('2d')?.closePath(); };

  const tbtn = (bg: string): React.CSSProperties => ({ background: bg, color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 4, fontSize: 11, cursor: 'pointer', marginRight: 4, fontFamily: 'Arial, sans-serif' });

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: '#fff', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: '#1a2744', color: '#fff', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 'bold', flex: 1 }}>✍️ {label}</span>
        <button onClick={() => { const c = canvasRef.current!; c.getContext('2d')!.clearRect(0, 0, c.width, c.height); }} style={tbtn('#e8460a')}>{t.sigClear}</button>
        <button onClick={() => onClose()} style={tbtn('#888')}>{t.sigCancel}</button>
        <button onClick={() => onClose(canvasRef.current?.toDataURL('image/png'))} style={tbtn('#2a7a2a')}>{t.sigOk}</button>
      </div>
      <div style={{ flex: 1, padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f0f0' }}>
        <canvas ref={canvasRef} width={400} height={200}
          style={{ background: 'white', border: '2px solid #aaa', borderRadius: 4, touchAction: 'none', cursor: 'crosshair', maxWidth: '100%', maxHeight: '100%' }}
          onMouseDown={onStart} onMouseMove={onMove} onMouseUp={onStop} onMouseLeave={onStop}
          onTouchStart={onStart} onTouchMove={onMove} onTouchEnd={onStop} />
      </div>
      <div style={{ textAlign: 'center', padding: 6, fontSize: 8, color: '#666' }}>{t.sigLabel}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Signature Preview
// ═══════════════════════════════════════════════════════════════════════════════

function SigPreview({ dataUrl, onClick, tapLabel }: { dataUrl?: string; onClick: () => void; tapLabel: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const redraw = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    // parentElement-Breite als zuverlässigere Quelle – getBoundingClientRect kann 0 liefern wenn noch nicht gerendert
    const parent = canvas.parentElement;
    const w = (parent ? parent.clientWidth : canvas.offsetWidth) || 300;
    const h = (parent ? parent.clientHeight : canvas.offsetHeight) || 75;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    const ctx = canvas.getContext('2d')!;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.scale(dpr, dpr);
    if (dataUrl) {
      const img = new Image(); img.onload = () => ctx.drawImage(img, 0, 0, w, h); img.src = dataUrl;
    } else {
      ctx.fillStyle = '#bbb'; ctx.font = '11px Arial'; ctx.textAlign = 'center';
      ctx.fillText(tapLabel, w / 2, h / 2);
    }
  }, [dataUrl, tapLabel]);

  useEffect(() => {
    // Mehrfach versuchen – Layout kann beim ersten Render noch nicht stabil sein
    const t1 = setTimeout(redraw, 50);
    const t2 = setTimeout(redraw, 300);
    const observer = new ResizeObserver(() => redraw());
    if (canvasRef.current?.parentElement) observer.observe(canvasRef.current.parentElement);
    window.addEventListener('resize', redraw);
    return () => { clearTimeout(t1); clearTimeout(t2); observer.disconnect(); window.removeEventListener('resize', redraw); };
  }, [redraw]);

  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: '4/1' }}>
      <canvas ref={canvasRef} width={400} height={100} onClick={onClick}
        className="sig-canvas"
        style={{ border: '2px dashed #999', background: 'white', cursor: 'pointer', width: '100%', height: '100%', borderRadius: 3, display: 'block', touchAction: 'none' }} />
      {dataUrl
        ? <img src={dataUrl} alt="Unterschrift" className="sig-print-img"
            style={{ display: 'none', width: '100%', height: '100%', objectFit: 'contain', border: '1px solid #000' }} />
        : <div className="sig-print-empty"
            style={{ display: 'none', width: '100%', height: '100%', border: '1px solid #000', background: 'white' }} />
      }
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Checkbox-Komponenten
// ═══════════════════════════════════════════════════════════════════════════════

const CK_LABELS: Record<number, string> = { 0: '', 1: '✓', 2: '✗' };
const CK_BG:     Record<number, string> = { 0: '',          1: '#d4edda', 2: '#f8d7da' };

function CheckCell({ state, onChange }: { state: CheckState; onChange: (s: CheckState) => void }) {
  return (
    <td onClick={() => onChange(((state + 1) % 3) as CheckState)}
      style={{ border: '1px solid #000', width: 20, textAlign: 'center', verticalAlign: 'middle',
        cursor: 'pointer', fontSize: 10, padding: 1, userSelect: 'none', background: CK_BG[state] }}>
      {CK_LABELS[state]}
    </td>
  );
}

function Ck2({ state, onChange }: { state: Ck2State; onChange: (s: Ck2State) => void }) {
  return (
    <span onClick={() => onChange(state === 1 ? 0 : 1)}
      style={{ display: 'inline-block', width: 18, height: 18, border: '1.5px solid #000',
        cursor: 'pointer', verticalAlign: 'middle', fontSize: 11, textAlign: 'center',
        lineHeight: '18px', userSelect: 'none', background: state === 1 ? '#d4edda' : '',
        WebkitTapHighlightColor: 'transparent' }}>
      {state === 1 ? '✓' : '\u00a0'}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PruefZeile
// ═══════════════════════════════════════════════════════════════════════════════

function PruefZeile({ zeile, state, onChange, rowIndex, t }: {
  zeile: Zeile; state: ZeilenState;
  onChange: (s: Partial<ZeilenState>) => void;
  rowIndex: number;
  t: T;
}) {
  const bg   = rowIndex % 2 === 0 ? '#fff' : '#f3f3f3';
  const cell: React.CSSProperties = { border: '1px solid #000', padding: '2px 3px', verticalAlign: 'top', wordBreak: 'break-word', lineHeight: 1.3, fontSize: 8.5, background: bg };
  const inp:  React.CSSProperties = { border: 'none', outline: 'none', width: '100%', fontFamily: 'Arial', fontSize: 8, background: 'transparent', padding: 0 };
  const text = zeile.textKey ? t[zeile.textKey] : '';

  if (zeile.divider) {
    return (
      <tr>
        <td colSpan={4} style={{ background: '#cfdff5', fontWeight: 'bold', fontSize: 8, padding: '2px 4px', letterSpacing: '.03em', border: '1px solid #000' }}>
          {t[zeile.divider]}
        </td>
      </tr>
    );
  }
  if (zeile.bem === null) {
    return (
      <tr>
        <td colSpan={4} style={{ ...cell, minHeight: 26 }}>
          <span dangerouslySetInnerHTML={{ __html: text }} />
          &nbsp;&nbsp;
          <input type="text" value={state.bem} onChange={e => onChange({ bem: e.target.value })}
            style={{ ...inp, width: '60%', display: 'inline-block' }} />
        </td>
      </tr>
    );
  }
  return (
    <tr>
      <td style={cell}><span dangerouslySetInnerHTML={{ __html: text }} /></td>
      <CheckCell state={state.ck} onChange={ck => onChange({ ck })} />
      <td style={cell}><input type="text" value={state.name} onChange={e => onChange({ name: e.target.value })} style={inp} /></td>
      <td style={cell}><input type="text" value={state.bem}  onChange={e => onChange({ bem: e.target.value })}  style={inp} /></td>
    </tr>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Print Styles
// ═══════════════════════════════════════════════════════════════════════════════

const printStyles = `
  /* ── Globaler Reset ── */
  html {
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
  }
  body {
    overflow-x: hidden;
    overflow-y: auto;
    overscroll-behavior-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  @page { size: A4 portrait; margin: 10mm 11mm; }
  @media print {
    .no-print { display: none !important; }
    #page-wrapper { margin: 0 !important; padding: 0 !important; gap: 0 !important; display: block !important; }
    .a4 { width: 100% !important; padding: 0 !important; box-shadow: none !important; page-break-after: always !important; }
    tr { page-break-inside: avoid; }
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
    input[type="text"], input[type="number"], input[type="time"], input[type="date"], input[type="month"] {
      border-bottom: 1px solid #bbb !important;
    }
    .sig-canvas      { display: none !important; }
    .sig-print-img   { display: block !important; width: 100% !important; height: auto !important; max-height: 80px; object-fit: contain; border: 1px solid #000; }
    .sig-print-empty { display: block !important; width: 100% !important; height: 60px !important; border: 1px solid #000; background: white; }
  }

  /* ── Schwarze Felder verhindern (Dark Mode / Android Chrome) ── */
  input[type="date"],
  input[type="time"],
  input[type="month"] {
    background-color: transparent !important;
    color: #000 !important;
    color-scheme: light !important;
  }
  select {
    color-scheme: light !important;
    color: #000 !important;
  }

  /* ── Kleine Screens (Handy Hochformat) ── */
  @media screen and (max-width: 600px) {
    .toolbar-title { display: none; }
    #page-wrapper  { padding: 4px !important; }
    .a4            { padding: 4mm 4mm !important; }
  }

  /* ── Handy Querformat ── */
  @media screen and (max-width: 900px) and (orientation: landscape) {
    .toolbar-title { display: none; }
    #page-wrapper  { padding: 4px !important; padding-left: max(4px, env(safe-area-inset-left)) !important; padding-right: max(4px, env(safe-area-inset-right)) !important; }
    .a4            { padding: 6mm 6mm !important; font-size: 90% !important; }
  }
`;

// ═══════════════════════════════════════════════════════════════════════════════
// Logo
// ═══════════════════════════════════════════════════════════════════════════════

const LOGO_B64 = '/9j/4AAQSkZJRgABAQEAYABgAAD/4SWIRXhpZgAATU0AKgAAAAgABgALAAIAAAAmAAAIYgESAAMAAAABAAEAAAExAAIAAAAmAAAIiAEyAAIAAAAUAAAIrodpAAQAAAABAAAIwuocAAcAAAgMAAAAVgAAEUYc6gAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFdpbmRvd3MgUGhvdG8gRWRpdG9yIDEwLjAuMTAwMTEuMTYzODQAV2luZG93cyBQaG90byBFZGl0b3IgMTAuMC4xMDAxMS4xNjM4NAAyMDIxOjAzOjE5IDE2OjUzOjExAAAGkAMAAgAAABQAABEckAQAAgAAABQAABEwkpEAAgAAAAMxMwAAkpIAAgAAAAMxMwAAoAEAAwAAAAEAAQAA6hwABwAACAwAAAkQAAAAABzqAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAxOToxMDoxNyAwODozNzo0OAAyMDE5OjEwOjE3IDA4OjM3OjQ4AAAAAAYBAwADAAAAAQAGAAABGgAFAAAAAQAAEZQBGwAFAAAAAQAAEZwBKAADAAAAAQAC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Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iPjx4bXA6Q3JlYXRvclRvb2w+V2luZG93cyBQaG90byBFZGl0b3IgMTAuMC4xMDAxMS4xNjM4NDwveG1wOkNyZWF0b3JUb29sPjx4bXA6Q3JlYXRlRGF0ZT4yMDE5LTEwLTE3VDA4OjM3OjQ4LjEzNDwveG1wOkNyZWF0ZURhdGU+PC9yZGY6RGVzY3JpcHRpb24+PC9yZGY6UkRGPjwveDp4bXBtZXRhPg0KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPD94cGFja2V0IGVuZD0ndyc/Pv/bAEMAAwICAwICAwMDAwQDAwQFCAUFBAQFCgcHBggMCgwMCwoLCw0OEhANDhEOCwsQFhARExQVFRUMDxcYFhQYEhQVFP/bAEMBAwQEBQQFCQUFCRQNCw0UFBQU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';

// ═══════════════════════════════════════════════════════════════════════════════
// Haupt-Komponente
// ═══════════════════════════════════════════════════════════════════════════════

export default function WartungsprotokollPage() {
  const [lang, setLang]         = useState<Lang>('de');
  const t = translations[lang] as T;

  const [form, setForm]         = useState<FormData>(initialForm);
  const [sigModal, setSigModal] = useState<{ id: 'sig-gerlieva' | 'sig-kunde'; label: string } | null>(null);
  const [toast, setToast]       = useState<{ msg: string; type: 'success' | 'error' | ''; visible: boolean }>({ msg: '', type: '', visible: false });
  const fileInputRef  = useRef<HTMLInputElement>(null);
  const toolbarRef    = useRef<HTMLDivElement>(null);

  // Dynamisches marginTop: passt sich an wenn Toolbar durch Wrap höher wird
  useEffect(() => {
    const toolbar = document.getElementById('toolbar');
    const wrapper = document.getElementById('page-wrapper');
    if (!toolbar || !wrapper) return;
    const observer = new ResizeObserver(() => {
      wrapper.style.marginTop = toolbar.offsetHeight + 8 + 'px';
    });
    observer.observe(toolbar);
    return () => observer.disconnect();
  }, []);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type, visible: true });
    setTimeout(() => setToast(p => ({ ...p, visible: false })), 2500);
  };

  // ── Field helpers ──────────────────────────────────────────────────────────
  const setField = <K extends keyof FormData>(key: K, val: FormData[K]) =>
    setForm(f => ({ ...f, [key]: val }));

  const setZeile = (idx: number, partial: Partial<ZeilenState>) =>
    setForm(f => { const z = [...f.zeilenState]; z[idx] = { ...z[idx], ...partial }; return { ...f, zeilenState: z }; });

  const setMonteurName = (mi: number, val: string) =>
    setForm(f => { const m = f.monteure.map((mo, i) => i === mi ? { ...mo, name: val } : mo); return { ...f, monteure: m }; });

  const setMontagTag = (mi: number, ti: number, key: keyof MontagTag, val: string) =>
    setForm(f => {
      const m = f.monteure.map((mo, i) => {
        if (i !== mi) return mo;
        const tage = mo.tage.map((tag, j) => {
          if (j !== ti) return tag;
          const updated = { ...tag, [key]: val };
          if (key === 'datum' && val) {
            const dow = new Date(val).getDay();
            const autoTyp = dow === 6 ? 'samstag' : dow === 0 ? 'sonntag' : '';
            if (tag.tagTyp !== 'feiertag') {
              updated.tagTyp = autoTyp as MontagTag['tagTyp'];
            }
          }
          return updated;
        });
        return { ...mo, tage };
      });
      return { ...f, monteure: m };
    });

  const addMonteur = () =>
    setForm(f => ({ ...f, monteure: [...f.monteure, emptyMonteur()] }));

  const removeMonteur = () =>
    setForm(f => f.monteure.length <= 1 ? f : { ...f, monteure: f.monteure.slice(0, -1) });

  const addTag = (mi: number) =>
    setForm(f => {
      const m = f.monteure.map((mo, i) => i === mi ? { ...mo, tage: [...mo.tage, emptyTag()] } : mo);
      return { ...f, monteure: m };
    });

  const removeTag = (mi: number, ti: number) =>
    setForm(f => {
      const m = f.monteure.map((mo, i) => {
        if (i !== mi || mo.tage.length <= 1) return mo;
        return { ...mo, tage: mo.tage.filter((_, j) => j !== ti) };
      });
      return { ...f, monteure: m };
    });

  const setMaterial = (i: number, key: keyof MaterialRow, val: string) =>
    setForm(f => { const mat = [...f.material]; mat[i] = { ...mat[i], [key]: val }; return { ...f, material: mat }; });

  // ── File name ──────────────────────────────────────────────────────────────
  const getFileNameFn = (ext: string) => buildFileName(ext, form.maschineNr);

  // ── JSON I/O ───────────────────────────────────────────────────────────────
  const collectFormData = () => ({ ...form, ts: new Date().toISOString() });

  const applyFormData = (data: FormData) => {
    if (!data || data.version !== 1) { showToast(t.toastInvalid, 'error'); return; }
    setForm(data);
    showToast(t.toastLoaded, 'success');
  };

  // ── Toolbar actions ────────────────────────────────────────────────────────
  const handleSave = () => {
    try {
      const blob = new Blob([JSON.stringify(collectFormData(), null, 2)], { type: 'application/json' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a'); a.href = url; a.download = getFileNameFn('json');
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      showToast(t.toastSaved, 'success');
    } catch (err: unknown) { showToast(t.toastError + (err as Error).message, 'error'); }
  };

  const handleShare = async () => {
    const jsonStr = JSON.stringify(collectFormData(), null, 2);
    const fileName = getFileNameFn('json').replace(/\.json$/, '.txt');
    const blob = new Blob([jsonStr], { type: 'text/plain' });
    const file = new File([blob], fileName, { type: 'text/plain' });
    try {
      if (typeof navigator.share === 'function' && typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
        await navigator.share({ title: t.labelWartungShare, files: [file] });
        return;
      }
    } catch (e) {
      if ((e as Error).name === 'AbortError') return;
    }
    // Fallback: Download als .json
    const url = URL.createObjectURL(new Blob([jsonStr], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = getFileNameFn('json');
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    showToast(t.toastDownloaded, 'success');
  };

  const handlePdf = () => {
    alert(t.pdfAlert);
    const restoreList: Array<() => void> = [];
    document.querySelectorAll<HTMLInputElement>(
      'input[type="text"], input[type="number"], input[type="time"], input[type="date"], input[type="month"]'
    ).forEach(el => {
      const old = el.getAttribute('value');
      el.setAttribute('value', el.value);
      restoreList.push(() => { if (old === null) el.removeAttribute('value'); else el.setAttribute('value', old); });
    });
    window.print();
    setTimeout(() => restoreList.forEach(fn => fn()), 1000);
  };

  const handleLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try { applyFormData(JSON.parse(ev.target?.result as string)); }
      catch (err: unknown) { showToast(t.toastLoadError + (err as Error).message, 'error'); }
    };
    reader.readAsText(file); e.target.value = '';
  };

  // ── Signature ──────────────────────────────────────────────────────────────
  const handleSigClose = (id: 'sig-gerlieva' | 'sig-kunde', dataUrl?: string) => {
    if (dataUrl) setForm(f => ({ ...f, signatures: { ...f.signatures, [id]: dataUrl } }));
    setSigModal(null);
  };
  const clearSig = (id: 'sig-gerlieva' | 'sig-kunde') =>
    setForm(f => { const s = { ...f.signatures }; delete s[id]; return { ...f, signatures: s }; });

  // ── Computed ───────────────────────────────────────────────────────────────
  const gesamtAZ        = calcGesamtMinutes(form.monteure);
  const gesamtBreakdown = calcGesamtBreakdown(form.monteure);

  // ── Styles ─────────────────────────────────────────────────────────────────
  const cellStyle: React.CSSProperties = { border: '1px solid #000', padding: '1px 3px', verticalAlign: 'top', wordBreak: 'break-word', lineHeight: 1.3, fontSize: 8.5 };
  const thStyle:   React.CSSProperties = { ...cellStyle, fontWeight: 'bold', textAlign: 'left' };
  const inp = (extra?: React.CSSProperties): React.CSSProperties => ({
    border: 'none', outline: 'none', width: '100%',
    fontFamily: 'Arial, sans-serif', fontSize: 8, background: 'transparent', padding: 0, ...extra,
  });
  const tbtn = (bg: string): React.CSSProperties => ({
    border: 'none', padding: '7px 12px', fontSize: 9, fontWeight: 'bold',
    borderRadius: 3, cursor: 'pointer', fontFamily: 'Arial, sans-serif', color: '#fff', background: bg,
    whiteSpace: 'nowrap', flexShrink: 0, minHeight: 32, touchAction: 'manipulation',
    WebkitTapHighlightColor: 'transparent',
  });

  // ── Spezialzeilen (0-Punkt, Batterie, Druck) kommen nach alleZeilen ──────
  const S2_OFFSET  = alleZeilen.length;      // Spezial folgen direkt nach alleZeilen
  const S2_NORMAL  = 0;                       // seite2Zeilen ist leer
  const innerInp: React.CSSProperties = { border: 'none', outline: 'none', fontFamily: 'Arial', fontSize: 8, background: 'transparent', padding: 0 };

  const renderSpecial = (specialIdx: 0 | 1 | 2, rowIndex: number) => {
    const bg     = rowIndex % 2 === 0 ? '#fff' : '#f3f3f3';
    const absIdx = S2_OFFSET + S2_NORMAL + specialIdx;
    const td: React.CSSProperties = { ...cellStyle, background: bg };
    const zs = form.zeilenState[absIdx] ?? { ck: 0 as CheckState, name: '', bem: '' };

    const ckCol = <CheckCell state={zs.ck} onChange={ck => setZeile(absIdx, { ck })} />;
    const nameCol = <td style={td}><input type="text" value={zs.name} onChange={e => setZeile(absIdx, { name: e.target.value })} style={innerInp} /></td>;
    const bemCol  = <td style={td}><input type="text" value={zs.bem}  onChange={e => setZeile(absIdx, { bem:  e.target.value })} style={innerInp} /></td>;

    if (specialIdx === 0) return (
      <tr key="sp0">
        <td style={td}>
          <table style={{ border: 'none', width: '100%', fontSize: 8, borderCollapse: 'collapse' }}><tbody>
            <tr>
              <td colSpan={3} style={{ border: 'none', padding: '1px 4px 2px 0', fontWeight: 'bold' }}>{t.nullPunktTitle}</td>
              <td style={{ border: 'none', textAlign: 'center', fontWeight: 'bold' }}>{t.nullHor}</td>
              <td style={{ border: 'none', textAlign: 'center', fontWeight: 'bold' }}>{t.nullVert}</td>
            </tr>
            <tr>
              <td colSpan={3} style={{ border: 'none', padding: '1px 0 1px 8px' }}>{t.nullVorhanden}</td>
              <td style={{ border: 'none', textAlign: 'center' }}><Ck2 state={form.nullPunkt.horVorh}  onChange={v => setForm(f => ({ ...f, nullPunkt: { ...f.nullPunkt, horVorh: v } }))} /></td>
              <td style={{ border: 'none', textAlign: 'center' }}><Ck2 state={form.nullPunkt.vertVorh} onChange={v => setForm(f => ({ ...f, nullPunkt: { ...f.nullPunkt, vertVorh: v } }))} /></td>
            </tr>
            <tr>
              <td colSpan={3} style={{ border: 'none', padding: '1px 0 1px 8px' }}>{t.nullGetauscht}</td>
              <td style={{ border: 'none', textAlign: 'center' }}><Ck2 state={form.nullPunkt.horGet}  onChange={v => setForm(f => ({ ...f, nullPunkt: { ...f.nullPunkt, horGet: v } }))} /></td>
              <td style={{ border: 'none', textAlign: 'center' }}><Ck2 state={form.nullPunkt.vertGet} onChange={v => setForm(f => ({ ...f, nullPunkt: { ...f.nullPunkt, vertGet: v } }))} /></td>
            </tr>
          </tbody></table>
        </td>
        {ckCol}{nameCol}{bemCol}
      </tr>
    );

    if (specialIdx === 1) return (
      <tr key="sp1">
        <td style={td}>
          <table style={{ border: 'none', width: '100%', fontSize: 8, borderCollapse: 'collapse' }}><tbody>
            <tr>
              <td colSpan={2} style={{ border: 'none', padding: '1px 4px 2px 0', fontWeight: 'bold' }}>{t.battTitle}</td>
              <td style={{ border: 'none', textAlign: 'center', fontWeight: 'bold' }}>{t.battGetauscht}</td>
            </tr>
            <tr>
              <td colSpan={2} style={{ border: 'none', padding: '1px 0 1px 8px' }}>604-31000403:</td>
              <td style={{ border: 'none', textAlign: 'center' }}><Ck2 state={form.batt.b1} onChange={v => setForm(f => ({ ...f, batt: { ...f.batt, b1: v } }))} /></td>
            </tr>
            <tr>
              <td colSpan={2} style={{ border: 'none', padding: '1px 0 1px 8px' }}>604-31300:</td>
              <td style={{ border: 'none', textAlign: 'center' }}><Ck2 state={form.batt.b2} onChange={v => setForm(f => ({ ...f, batt: { ...f.batt, b2: v } }))} /></td>
            </tr>
          </tbody></table>
        </td>
        {ckCol}{nameCol}{bemCol}
      </tr>
    );

    return (
      <tr key="sp2">
        <td style={td}>
          <table style={{ border: 'none', width: '100%', fontSize: 8, borderCollapse: 'collapse' }}><tbody>
            <tr>
              <td style={{ border: 'none', fontWeight: 'bold' }}>{t.druckTitle}</td>
              <td style={{ border: 'none', fontWeight: 'bold', textAlign: 'center' }}>{t.druckAktiv}</td>
              <td style={{ border: 'none', fontWeight: 'bold', textAlign: 'center' }}>{t.druckBar}</td>
            </tr>
            <tr>
              <td style={{ border: 'none', padding: '1px 0 1px 8px' }}>{t.druckTrennmittel}</td>
              <td style={{ border: 'none', textAlign: 'center' }}><Ck2 state={form.druck.tmAktiv}   onChange={v => setForm(f => ({ ...f, druck: { ...f.druck, tmAktiv: v } }))} /></td>
              <td style={{ border: 'none', textAlign: 'center' }}><input type="text" value={form.druck.tmBar}   onChange={e => setForm(f => ({ ...f, druck: { ...f.druck, tmBar: e.target.value } }))}   style={{ width: 60, border: '1px solid #000', fontSize: 8, textAlign: 'center', padding: 1 }} /></td>
            </tr>
            <tr>
              <td style={{ border: 'none', padding: '1px 0 1px 8px' }}>{t.druckLuft}</td>
              <td style={{ border: 'none', textAlign: 'center' }}><Ck2 state={form.druck.luftAktiv} onChange={v => setForm(f => ({ ...f, druck: { ...f.druck, luftAktiv: v } }))} /></td>
              <td style={{ border: 'none', textAlign: 'center' }}><input type="text" value={form.druck.luftBar} onChange={e => setForm(f => ({ ...f, druck: { ...f.druck, luftBar: e.target.value } }))} style={{ width: 60, border: '1px solid #000', fontSize: 8, textAlign: 'center', padding: 1 }} /></td>
            </tr>
          </tbody></table>
        </td>
        {ckCol}{nameCol}{bemCol}
      </tr>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // Render
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <>
      <style>{printStyles}</style>

      {/* ── Toolbar ── */}
      <div id="toolbar" className="no-print" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999, background: '#1a2744', padding: '6px 10px', paddingLeft: 'max(10px, env(safe-area-inset-left))', paddingRight: 'max(10px, env(safe-area-inset-right))', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', boxSizing: 'border-box' }}>
        <button onClick={() => fileInputRef.current?.click()} style={tbtn('#8e24aa')}>{t.loadJson}</button>
        <button onClick={handlePdf}   style={tbtn('#e8460a')}>{t.savePdf}</button>
        <button onClick={handleShare} style={tbtn('#1a7a3a')}>{t.shareJson}</button>
        <button onClick={handleSave}  style={tbtn('#1a5fa8')}>{t.saveJson}</button>
        <span className="toolbar-title" style={{ color: '#a8b8d8', fontSize: 9, flexShrink: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>{t.toolbarTitle}</span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <LangSwitcher current={lang} onChange={setLang} />
          <a href="/" style={{ ...tbtn('#1a5fa8'), textDecoration: 'none' }}>{t.home}</a>
        </div>
        <input ref={fileInputRef} type="file" accept=".json,.txt" style={{ display: 'none' }} onChange={handleLoad} />
      </div>

      {/* ── Seiten ── */}
      <div id="page-wrapper" style={{ marginTop: 56, padding: '8px', paddingLeft: 'max(8px, env(safe-area-inset-left))', paddingRight: 'max(8px, env(safe-area-inset-right))', paddingBottom: 'max(16px, env(safe-area-inset-bottom))', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, boxSizing: 'border-box', minHeight: '100vh' }}>

        {/* ══════════════ SEITE 1 ══════════════ */}
        <div className="a4" style={{ width: 'min(210mm, 100%)', background: '#fff', padding: '10mm 11mm', boxShadow: '0 3px 16px rgba(0,0,0,.25)', boxSizing: 'border-box' }}>

          {/* Überschrift */}
          <h2 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8, fontFamily: 'Arial, sans-serif', color: '#000' }}>
            {t.docTitle}
          </h2>

          {/* Kopftabelle */}
          <table style={{ marginBottom: 0, width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '13%' }} /><col style={{ width: '5%' }} /><col style={{ width: '18%' }} />
              <col style={{ width: '10%' }} /><col style={{ width: '13%' }} /><col style={{ width: '4%' }} />
              <col style={{ width: '8%' }} /><col style={{ width: '7%' }} /><col style={{ width: '6%' }} />
            </colgroup>
            <tbody>
              <tr>
                <td rowSpan={3} style={{ border: '1px solid #000', verticalAlign: 'middle', textAlign: 'center', padding: 0, overflow: 'hidden' }}>
                  <img src={`data:image/jpeg;base64,${LOGO_B64}`} alt="Logo" style={{ height: 36, display: 'block', margin: '0 auto' }} />
                </td>
                <td colSpan={6} style={{ border: '1px solid #000', padding: 1 }}></td>
                <th colSpan={2} style={{ border: '1px solid #000', textAlign: 'right', fontWeight: 'bold', fontSize: 11 }}>{t.labelWartung}</th>
              </tr>
              <tr style={{ height: 18 }}>
                <th style={thStyle}>{t.labelKunde}</th>
                <td style={cellStyle}><input type="text" value={form.kunde}        onChange={e => setField('kunde', e.target.value)}        style={inp({ height: 16 })} /></td>
                <th style={thStyle}>{t.labelArbeitsplatz}</th>
                <td style={cellStyle}><input type="text" value={form.arbeitsplatz} onChange={e => setField('arbeitsplatz', e.target.value)} style={inp({ height: 16 })} maxLength={12} /></td>
                <th style={thStyle}>{t.labelDgm}</th>
                <td style={cellStyle}><input type="text" value={form.dgm}          onChange={e => setField('dgm', e.target.value)}          style={inp({ height: 16 })} /></td>
                <th style={thStyle}>{t.labelPosition}</th>
                <td style={{ ...cellStyle, width: 55 }}><input type="text" value={form.position} onChange={e => setField('position', e.target.value)} style={inp({ width: 52, height: 16 })} maxLength={8} /></td>
              </tr>
              <tr style={{ height: 18 }}>
                <th style={thStyle}>{t.labelMaschinTyp}</th>
                <td style={cellStyle}><input type="text" value={form.maschinTyp}  onChange={e => setField('maschinTyp', e.target.value)}  style={inp({ height: 16 })} /></td>
                <th style={thStyle}>{t.labelMaschineNr}</th>
                <td style={cellStyle}><input type="text" value={form.maschineNr}  onChange={e => setField('maschineNr', e.target.value)}  style={inp({ height: 16 })} maxLength={12} /></td>
                <th style={thStyle}>{t.labelKom}</th>
                <td style={cellStyle}><input type="text" value={form.kom}          onChange={e => setField('kom', e.target.value)}          style={inp({ height: 16 })} /></td>
                <th style={thStyle}>{t.labelBaujahr}</th>
                <td style={{ ...cellStyle, width: 72 }}>
                  <input type="month" value={form.baujahr} onChange={e => setField('baujahr', e.target.value)}
                    style={{ border: 'none', outline: 'none', fontFamily: 'Arial', fontSize: 7.5, background: 'transparent', color: '#000', colorScheme: 'light', padding: 0, width: 70, height: 16, cursor: 'pointer' }} />
                </td>
              </tr>
            </tbody>
          </table>

          {/* Prüftabelle Seite 1 */}
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '47%' }} /><col style={{ width: '4%' }} />
              <col style={{ width: '5%' }} /><col style={{ width: '44%' }} />
            </colgroup>
            <thead>
              <tr>
                <th style={thStyle}><strong>{t.colPruefpunkt}</strong></th>
                <th style={{ ...thStyle, textAlign: 'center', fontSize: 7.5 }}>{t.colOk}</th>
                <th style={{ ...thStyle, textAlign: 'center', fontSize: 7.5 }}>{t.colName}</th>
                <th style={{ ...thStyle, fontSize: 7 }}>{t.colBemerkung}</th>
              </tr>
            </thead>
            <tbody>
              {alleZeilen.map((z, i) => (
                <PruefZeile key={i} zeile={z}
                  state={form.zeilenState[i] ?? { ck: 0, name: '', bem: '' }}
                  onChange={p => setZeile(i, p)} rowIndex={i} t={t} />
              ))}
              {/* Spezialzeilen direkt nach allen Prüfpunkten */}
              {renderSpecial(0, S2_OFFSET)}
              {renderSpecial(1, S2_OFFSET + 1)}
              {renderSpecial(2, S2_OFFSET + 2)}
            </tbody>
          </table>
        </div>

        {/* ══════════════ SEITE 2: Fuß + Unterschriften ══════════════ */}
        <div className="a4" style={{ width: 'min(210mm, 100%)', background: '#fff', padding: '10mm 11mm', boxShadow: '0 3px 16px rgba(0,0,0,.25)', boxSizing: 'border-box', overflow: 'hidden' }}>

          {/* Zeitenerfassung – pro Monteur ein Block */}
          <div style={{ marginBottom: 10 }}>

            {/* Monteur-Stepper */}
            <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 9, fontWeight: 'bold' }}>{t.labelMonteur}:</span>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #aaa', borderRadius: 4, overflow: 'hidden' }}>
                <button
                  onClick={removeMonteur}
                  disabled={form.monteure.length <= 1}
                  style={{
                    width: 28, height: 24, fontSize: 16, lineHeight: 1, border: 'none', borderRight: '1px solid #aaa',
                    background: form.monteure.length > 1 ? '#fdd' : '#eee',
                    color: form.monteure.length > 1 ? '#900' : '#aaa',
                    cursor: form.monteure.length > 1 ? 'pointer' : 'default', fontFamily: 'Arial',
                  }}>−</button>
                <span style={{ minWidth: 28, textAlign: 'center', fontSize: 11, fontWeight: 'bold', padding: '0 6px', userSelect: 'none' }}>
                  {form.monteure.length}
                </span>
                <button
                  onClick={addMonteur}
                  style={{
                    width: 28, height: 24, fontSize: 16, lineHeight: 1, border: 'none', borderLeft: '1px solid #aaa',
                    background: '#e8f0ff', color: '#226', cursor: 'pointer', fontFamily: 'Arial',
                  }}>+</button>
              </div>
            </div>

            {form.monteure.map((monteur, mi) => {
              const monteurTotal = monteur.tage.reduce((sum, tag) => sum + calcNettoMin(tag), 0);
              return (
                <div key={mi} style={{ marginBottom: 8, border: '1px solid #000', borderRadius: 2 }}>
                  {/* Monteur-Kopfzeile */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#cfdff5', padding: '3px 6px', borderBottom: '1px solid #000' }}>
                    <strong style={{ fontSize: 8, whiteSpace: 'nowrap' }}>{t.labelMonteur} {mi + 1}:</strong>
                    <input
                      type="text"
                      value={monteur.name}
                      onChange={e => setMonteurName(mi, e.target.value)}
                      style={{ flex: 1, border: 'none', borderBottom: '1px solid #666', outline: 'none', fontFamily: 'Arial', fontSize: 9, fontWeight: 'bold', background: 'transparent', padding: '1px 2px' }}
                    />
                    {monteurTotal > 0 && (
                      <span style={{ fontSize: 8, fontWeight: 'bold', background: '#e8f4e8', padding: '1px 6px', borderRadius: 3, border: '1px solid #aaa', whiteSpace: 'nowrap' }}>
                        Σ {formatMin(monteurTotal)}
                      </span>
                    )}
                  </div>

                  {/* Tageszeilen */}
                  <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                    <colgroup>
                      <col style={{ width: '16%' }} />
                      <col style={{ width: '14%' }} />
                      <col style={{ width: '14%' }} />
                      <col style={{ width: '11%' }} />
                      <col style={{ width: '16%' }} />
                      <col style={{ width: '25%' }} />
                    </colgroup>
                    {mi === 0 && (
                      <thead>
                        <tr>
                          <th style={{ ...thStyle, textAlign: 'center', fontSize: 7.5, background: '#e0e0e0' }}>{t.thDatum}</th>
                          <th style={{ ...thStyle, textAlign: 'center', fontSize: 7.5, background: '#e0e0e0' }}>{t.thAzVon}</th>
                          <th style={{ ...thStyle, textAlign: 'center', fontSize: 7.5, background: '#e0e0e0' }}>{t.thAzBis}</th>
                          <th style={{ ...thStyle, textAlign: 'center', fontSize: 7.5, background: '#e0e0e0' }}>{t.thPause}</th>
                          <th style={{ ...thStyle, textAlign: 'center', fontSize: 7.5, background: '#e0f0e0' }}>{t.labelGesamtAZ}</th>
                          <th style={{ ...thStyle, textAlign: 'center', fontSize: 7.5, background: '#e0e0e0' }}>{t.thTagTyp}</th>
                        </tr>
                      </thead>
                    )}
                    <tbody>
                      {monteur.tage.map((tag, ti) => {
                        const netto = calcNettoMin(tag);
                        return (
                          <tr key={ti} style={{ background: ti % 2 === 0 ? '#fff' : '#f8f8f8' }}>
                            <td style={{ ...cellStyle, fontSize: 8 }}>
                              <input type="date" value={tag.datum} onChange={e => setMontagTag(mi, ti, 'datum', e.target.value)}
                                style={{ ...inp(), fontSize: 7.5, cursor: 'pointer', colorScheme: 'light', color: '#000' }} />
                            </td>
                            <td style={{ ...cellStyle, fontSize: 8, textAlign: 'center' }}>
                              <input type="time" value={tag.vonZeit} onChange={e => setMontagTag(mi, ti, 'vonZeit', e.target.value)}
                                style={{ ...inp(), textAlign: 'center', cursor: 'pointer', colorScheme: 'light', color: '#000' }} />
                            </td>
                            <td style={{ ...cellStyle, fontSize: 8, textAlign: 'center' }}>
                              <input type="time" value={tag.bisZeit} onChange={e => setMontagTag(mi, ti, 'bisZeit', e.target.value)}
                                style={{ ...inp(), textAlign: 'center', cursor: 'pointer', colorScheme: 'light', color: '#000' }} />
                            </td>
                            <td style={{ ...cellStyle, fontSize: 8, textAlign: 'center' }}>
                              <input type="number" min={0} value={tag.pauseMin} onChange={e => setMontagTag(mi, ti, 'pauseMin', e.target.value)}
                                style={{ ...inp(), textAlign: 'center' }} />
                            </td>
                            <td style={{ ...cellStyle, fontSize: 8, textAlign: 'center', fontWeight: 'bold', background: ti % 2 === 0 ? '#e8f4e8' : '#daeeda' }}>
                              {formatMin(netto)}
                            </td>
                            <td style={{ ...cellStyle, padding: 2 }}>
                              {(() => {
                                const bgMap: Record<string, string> = {
                                  '': ti % 2 === 0 ? '#fff' : '#f8f8f8',
                                  feiertag: '#fff3cd',
                                  samstag:  '#ddeeff',
                                  sonntag:  '#fde8e8',
                                };
                                return (
                                  <select
                                    value={tag.tagTyp}
                                    onChange={e => setMontagTag(mi, ti, 'tagTyp', e.target.value)}
                                    style={{
                                      width: '100%', border: 'none', outline: 'none', fontFamily: 'Arial',
                                      fontSize: 7.5, background: bgMap[tag.tagTyp], cursor: 'pointer',
                                      padding: '1px 2px', borderRadius: 2,
                                    }}>
                                    <option value="">{t.tagTypNormal}</option>
                                    <option value="feiertag">{t.tagTypFeiertag}</option>
                                    <option value="samstag">{t.tagTypSamstag}</option>
                                    <option value="sonntag">{t.tagTypSonntag}</option>
                                  </select>
                                );
                              })()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* + Tag / - Tag Buttons */}
                  <div className="no-print" style={{ padding: '3px 6px', display: 'flex', gap: 4 }}>
                    <button onClick={() => addTag(mi)}
                      style={{ fontSize: 8, padding: '2px 10px', background: '#e8f0ff', border: '1px solid #99b', borderRadius: 3, cursor: 'pointer', fontFamily: 'Arial' }}>
                      {t.btnTagHinzu}
                    </button>
                    <button onClick={() => removeTag(mi, monteur.tage.length - 1)}
                      disabled={monteur.tage.length <= 1}
                      style={{ fontSize: 8, padding: '2px 10px', background: monteur.tage.length > 1 ? '#fdd' : '#eee', border: '1px solid #bbb', borderRadius: 3, cursor: monteur.tage.length > 1 ? 'pointer' : 'default', color: monteur.tage.length > 1 ? '#900' : '#999', fontFamily: 'Arial' }}>
                      {t.btnTagEntf2}
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Gesamt-Summe */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, marginTop: 6, padding: '5px 8px', border: '1px solid #aaa', borderRadius: 4, background: '#f7f7f7' }}>
              {/* Gesamt */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <strong style={{ fontSize: 9 }}>{t.labelGesamtAZ}</strong>
                <span style={{ fontWeight: 'bold', fontSize: 10, background: '#e8f4e8', padding: '2px 10px', borderRadius: 3, border: '1px solid #aaa' }}>
                  {gesamtAZ}
                </span>
              </div>
              {/* Samstag – nur wenn > 0 */}
              {gesamtBreakdown.samstag > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 8, color: '#555' }}>{t.tagTypSamstag}:</span>
                  <span style={{ fontWeight: 'bold', fontSize: 9, background: '#ddeeff', padding: '2px 8px', borderRadius: 3, border: '1px solid #99bbdd' }}>
                    {formatMin(gesamtBreakdown.samstag)}
                  </span>
                </div>
              )}
              {/* Sonntag – nur wenn > 0 */}
              {gesamtBreakdown.sonntag > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 8, color: '#555' }}>{t.tagTypSonntag}:</span>
                  <span style={{ fontWeight: 'bold', fontSize: 9, background: '#fde8e8', padding: '2px 8px', borderRadius: 3, border: '1px solid #ddaaaa' }}>
                    {formatMin(gesamtBreakdown.sonntag)}
                  </span>
                </div>
              )}
              {/* Feiertag – nur wenn > 0 */}
              {gesamtBreakdown.feiertag > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 8, color: '#555' }}>{t.tagTypFeiertag}:</span>
                  <span style={{ fontWeight: 'bold', fontSize: 9, background: '#fff3cd', padding: '2px 8px', borderRadius: 3, border: '1px solid #ddcc88' }}>
                    {formatMin(gesamtBreakdown.feiertag)}
                  </span>
                </div>
              )}
              {/* Nachtstunden – nur wenn > 0 */}
              {gesamtBreakdown.nacht > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 8, color: '#555' }}>{t.tagTypNacht}:</span>
                  <span style={{ fontWeight: 'bold', fontSize: 9, background: '#e8e0f8', padding: '2px 8px', borderRadius: 3, border: '1px solid #aa99cc' }}>
                    {formatMin(gesamtBreakdown.nacht)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Teileliste */}
          <div style={{ marginTop: 12, border: '1px solid #000', padding: 10 }}>
            <strong style={{ fontSize: 9, letterSpacing: '.03em' }}>{t.sectionMaterial}</strong>
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 6 }}>
                <thead>
                  <tr>
                    <th style={{ border: '1px solid #000', padding: '2px 4px', textAlign: 'center', background: '#e0e0e0', fontWeight: 'bold', fontSize: 8, width: 40 }}>{t.thPos}</th>
                    <th style={{ border: '1px solid #000', padding: '2px 4px', textAlign: 'center', background: '#e0e0e0', fontWeight: 'bold', fontSize: 8 }}>{t.thBeschreibung}</th>
                    <th style={{ border: '1px solid #000', padding: '2px 4px', textAlign: 'center', background: '#e0e0e0', fontWeight: 'bold', fontSize: 8, width: 100 }}>{t.thTeilenummer}</th>
                    <th style={{ border: '1px solid #000', padding: '2px 4px', textAlign: 'center', background: '#e0e0e0', fontWeight: 'bold', fontSize: 8, width: 40 }}>{t.thStk}</th>
                  </tr>
                </thead>
                <tbody>
                  {form.material.map((row, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f3f3f3' }}>
                      {(['pos', 'beschreibung', 'teilenummer', 'stk'] as (keyof MaterialRow)[]).map(f => (
                        <td key={f} style={{ border: '1px solid #000', padding: '1px 3px', fontSize: 8 }}>
                          <input type="text" value={row[f]} onChange={e => setMaterial(i, f, e.target.value)}
                            style={{ width: '100%', border: 'none', outline: 'none', padding: 1, background: 'transparent', color: '#000', fontSize: 8, fontFamily: 'Arial' }} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Unterschriften */}
          <div style={{ marginTop: 12, border: '1px solid #000', padding: 10, boxSizing: 'border-box' }}>
            <strong style={{ fontSize: 9, letterSpacing: '.03em' }}>{t.sectionSign}</strong>
            <div style={{ display: 'flex', gap: 12, marginTop: 10, width: '100%', boxSizing: 'border-box', overflow: 'hidden' }}>
              {(['sig-gerlieva', 'sig-kunde'] as const).map(id => {
                const isGerlieva  = id === 'sig-gerlieva';
                const label       = isGerlieva ? t.sigGerlieva : t.sigKunde;
                const nameKey     = isGerlieva ? 'nameGerlieva' : 'nameKunde';
                const placeholder = isGerlieva ? t.sigPlaceholderTech : t.sigPlaceholderKunde;
                return (
                  <div key={id} style={{ flex: '1 1 0', minWidth: 0, border: '1px solid #ccc', borderRadius: 4, padding: 8, background: '#fafafa', boxSizing: 'border-box', overflow: 'hidden' }}>
                    <div style={{ fontSize: 8, fontWeight: 'bold', marginBottom: 4 }}>{label}</div>
                    <SigPreview dataUrl={form.signatures[id]} onClick={() => setSigModal({ id, label })} tapLabel={t.sigTap} />
                    <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <input type="text" value={form[nameKey]} onChange={e => setField(nameKey, e.target.value)}
                        placeholder={placeholder}
                        style={{ flex: 1, border: 'none', borderBottom: '1px solid #aaa', outline: 'none', fontSize: 7.5, background: 'transparent', fontFamily: 'Arial' }} />
                      <button onClick={() => clearSig(id)}
                        style={{ fontSize: 7, padding: '2px 6px', background: '#eee', border: '1px solid #bbb', borderRadius: 3, cursor: 'pointer' }}>
                        {t.sigDelete}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ textAlign: 'center', marginTop: 12, fontWeight: 'bold', fontSize: 11 }}>
              {t.labelDatum}{' '}
              <input type="date" value={form.signatureDate} onChange={e => setField('signatureDate', e.target.value)}
                style={{ border: '1px solid #ccc', padding: '4px 8px', borderRadius: 4, fontSize: 11, colorScheme: 'light', color: '#000' }} />
            </div>
          </div>

        </div>
      </div>

      {/* ── Modals & Notifications ── */}
      {sigModal && (
        <SignatureModal label={sigModal.label} existing={form.signatures[sigModal.id]}
          onClose={dataUrl => handleSigClose(sigModal.id, dataUrl)} t={t} />
      )}
      <Toast msg={toast.msg} type={toast.type} visible={toast.visible} />
    </>
  );
}
