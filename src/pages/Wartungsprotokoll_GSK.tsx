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

const LOGO_B64 = '';

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
