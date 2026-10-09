'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Bucket und Tabellen-Namen
const DOCUMENTS_BUCKET = 'documents';
const DOCUMENTS_TABLE = 'documents';

// ═══════════════════════════════════════════════════════════════════════════════
// i18n
// ═══════════════════════════════════════════════════════════════════════════════

type Lang = 'de' | 'en' | 'fr';

const translations = {
  de: {
    loadJson:       '📂 JSON laden',
    savePdf:        '⬇ Als PDF speichern',
    shareJson:      '📤 In Storage speichern',
    saveJson:       '💾 JSON speichern',
    toolbarTitle:   'Wartungsprotokoll GSZ 725 / GS 710 · GERLIEVA Sprühtechnik GmbH',
    pdfAlert:       'Im Druckdialog:\n1. Drucker → "Als PDF speichern"\n2. Weitere Einstellungen → "Hintergrundgrafiken" ✓ aktivieren\n3. Ränder auf "Minimal" setzen\n→ Dann sind alle Farben im PDF enthalten.',
    toastSaved:     '✅ JSON gespeichert!',
    toastDownloaded:'✅ JSON heruntergeladen!',
    toastLoaded:    '✅ Datei erfolgreich geladen!',
    toastInvalid:   'Ungültige JSON-Datei',
    toastError:     'Fehler: ',
    toastLoadError: 'Fehler beim Laden: ',
    docTitle:       'Wartungsprotokoll',
    labelKunde:     'Kunde',
    labelArbeitsplatz: 'Arbeitsplatz',
    labelDgm:       'DGM',
    labelPosition:  'Position',
    labelMaschinTyp:'Masch. Typ',
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
    divAllgemein:   '▶  ALLGEMEIN',
    divHorizontal:  '▶  HORIZONTAL',
    divVertikal:    '▶  VERTIKAL',
    p01: 'Erster Eindruck Abdeckungen vorhanden / Sauberkeit, usw.',
    p02: 'Probelauf Laufgeräusche / optischer Eindruck / Fixierung',
    p03: 'Befestigung an DGM Wenn möglich Schrauben kontrollieren<br/>Ansonsten Anlage hinten versuchen zu bewegen; wenn fest, dann o.k.',
    p04: 'Zentralschmierung Druckminderer vorhanden: Funktion / Dichtigkeit<br/>Richtiges Öl eingefüllt / auf Wasser prüfen / Deckel / Messanschluss',
    p05: 'Versorgungsplatte/Schrank Filter / Filterelemente / Dichtigkeit<br/>Automatikfilter / Manometer / Drücke',
    p06: 'Sprühkopf Funktion / Belegung / Dichtigkeit / Düsensitze',
    p07: 'AVS-Verschlusseinheiten Dichtigkeit / Funktion',
    p08: 'Membrane Dichtigkeit / Funktion',
    p09: 'Abstreifer Zustand horizontal und vertikal',
    p10: 'Linearführung horizontal Spiel (hinten anheben) / Rost / Laufspuren<br/>Abstreifer / Rost / Lager nachschmieren',
    p11: 'Riemenantrieb horiz. Zahnriemen / Riemenspannung / Riemenscheibe',
    p12: 'Spannsatz horiz. Drehmoment 12 Nm',
    p13: 'Riemenhaltewinkel Sind Schrauben fest',
    p14: 'Schneckengetriebe Laufgeräusch / Sichtkontrolle / Ölaustritt<br/>Axiale Sicherung der Abtriebswelle',
    p15: 'Linearführung vertikal Trägerrohr aus Fixierung fahren u. Spiel prüfen<br/>Schmierung / Rost / Laufspuren (bei Teleskop unteren Zahnriemen öffnen)',
    p16: 'Antrieb vertikal Zahnriemen / Riemenscheibe / Riemenspannung',
    p17: 'Zahnstange Befestigungsschrauben<br/>Einlaufspuren an Zahnstange und Zahnrad',
    p18: 'Motorhaltebremse vertikal Bei Notaus Haltekraft prüfen',
    p19: 'Halteplatte Zahnriemen Schrauben kontrollieren / mit Kleber sichern',
    p20: 'Endschalter mech. u. induktiv Verschleiß an der Rolle / Funktion',
    p21: 'Spannsatz vertikal Drehmoment 15 Nm',
    p22: 'Planetengetriebe Laufgeräusch / Sichtkontrolle / Ölaustritt',
    p23: 'Trägerrohr Schweißnähte / Ausrichtung / sind Schrauben fest<br/>Dichtigkeit der Anschlussplatten',
    p24: 'Trägerrohrfixierung Einstellung / Verschleißteile prüfen',
    p25: 'Ventile Funktion / Stecker / Dichtungen',
    p26: 'Schläuche Alterung / Beschädigung / Dichtigkeit<br/>Steuerluftschläuche im Verteiler',
    p27: 'Energieketten Halterungen fest / Beschädigung / alle Deckel vorhanden',
    p28: 'Kabel und Stecker Sichtkontrolle / Beschädigung / Zugentlastung',
    p29: 'Lampentest Bedienteil Schlösser Funktion',
    p30: '<strong>Bemerkungen</strong><br/><strong>Wartung Vorjahr</strong>',
    p31: '<strong>Maßnahmen/<br/>Empfehlungen</strong>',
  },
  en: {
    loadJson:       '📂 Load JSON',
    savePdf:        '⬇ Save as PDF',
    shareJson:      '📤 In Storage speichern',
    saveJson:       '💾 Save JSON',
    toolbarTitle:   'Maintenance Log GSZ 725 / GS 710 · GERLIEVA Sprühtechnik GmbH',
    pdfAlert:       'In the print dialog:\n1. Printer → "Save as PDF"\n2. More settings → enable "Background graphics" ✓\n→ This ensures all colours appear in the PDF.',
    toastSaved:     '✅ JSON saved!',
    toastDownloaded:'✅ JSON downloaded!',
    toastLoaded:    '✅ File loaded successfully!',
    toastInvalid:   'Invalid JSON file',
    toastError:     'Error: ',
    toastLoadError: 'Error loading file: ',
    docTitle:       'Maintenance Log',
    labelKunde:     'Customer',
    labelArbeitsplatz: 'Workplace',
    labelDgm:       'DGM',
    labelPosition:  'Position',
    labelMaschinTyp:'Machine Type',
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
    p02: 'Test run – running noise / visual impression / fixation',
    p03: 'Mounting on DGM – check screws if possible<br/>Otherwise try moving machine from behind; if firm, o.k.',
    p04: 'Central lubrication – pressure reducer: function / tightness<br/>Correct oil filled / check for water / cap / measuring connection',
    p05: 'Supply plate/cabinet – filters / filter elements / tightness<br/>Automatic filter / manometer / pressures',
    p06: 'Spray head – function / assignment / tightness / nozzle seats',
    p07: 'AVS closing units – tightness / function',
    p08: 'Diaphragm – tightness / function',
    p09: 'Wiper – condition horizontal and vertical',
    p10: 'Linear guide horizontal – play (lift rear) / rust / wear marks<br/>Wipers / rust / re-grease bearings',
    p11: 'Belt drive horiz. – toothed belt / belt tension / belt pulley',
    p12: 'Clamping set horiz. – torque 12 Nm',
    p13: 'Belt retaining bracket – screws tight',
    p14: 'Worm gear – running noise / visual check / oil leakage<br/>Axial securing of output shaft',
    p15: 'Linear guide vertical – move support tube out of fixture and check play<br/>Lubrication / rust / wear marks (for telescope open lower toothed belt)',
    p16: 'Drive vertical – toothed belt / belt pulley / belt tension',
    p17: 'Rack – mounting screws<br/>Wear marks on rack and pinion',
    p18: 'Motor holding brake vertical – check holding force at emergency stop',
    p19: 'Belt retaining plate – check screws / secure with adhesive',
    p20: 'Limit switch mech. and inductive – roller wear / function',
    p21: 'Clamping set vertical – torque 15 Nm',
    p22: 'Planetary gear – running noise / visual check / oil leakage',
    p23: 'Support tube – welds / alignment / screws tight<br/>Tightness of connection plates',
    p24: 'Support tube fixing – adjustment / check wear parts',
    p25: 'Valves – function / connectors / seals',
    p26: 'Hoses – ageing / damage / tightness<br/>Control air hoses in distributor',
    p27: 'Cable drag chains – brackets secure / damage / all covers present',
    p28: 'Cables and connectors – visual check / damage / strain relief',
    p29: 'Lamp test – control panel locks function',
    p30: '<strong>Remarks</strong><br/><strong>Previous maintenance</strong>',
    p31: '<strong>Measures/<br/>Recommendations</strong>',
  },
  fr: {
    loadJson:       '📂 Charger JSON',
    savePdf:        '⬇ Enregistrer en PDF',
    shareJson:      '📤 In Storage speichern',
    saveJson:       '💾 Sauvegarder JSON',
    toolbarTitle:   'Protocole de maintenance GSZ 725 / GS 710 · GERLIEVA Sprühtechnik GmbH',
    pdfAlert:       "Dans la boîte de dialogue d'impression :\n1. Imprimante → \"Enregistrer en PDF\"\n2. Paramètres → activer \"Graphiques d'arrière-plan\" ✓\n→ Toutes les couleurs apparaîtront dans le PDF.",
    toastSaved:     '✅ JSON enregistré !',
    toastDownloaded:'✅ JSON téléchargé !',
    toastLoaded:    '✅ Fichier chargé avec succès !',
    toastInvalid:   'Fichier JSON invalide',
    toastError:     'Erreur : ',
    toastLoadError: 'Erreur de chargement : ',
    docTitle:       'Protocole de maintenance',
    labelKunde:     'Client',
    labelArbeitsplatz: 'Poste de travail',
    labelDgm:       'DGM',
    labelPosition:  'Position',
    labelMaschinTyp:'Type de machine',
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
    p02: "Essai de marche – bruits / impression visuelle / fixation",
    p03: "Fixation sur DGM – vérifier vis si possible<br/>Sinon essayer de bouger la machine par l'arrière ; si fixe, o.k.",
    p04: "Graissage central – réducteur de pression : fonction / étanchéité<br/>Huile correcte / vérifier eau / bouchon / raccord de mesure",
    p05: "Plaque/armoire d'alimentation – filtres / éléments filtrants / étanchéité<br/>Filtre automatique / manomètre / pressions",
    p06: 'Tête de pulvérisation – fonction / affectation / étanchéité / sièges buses',
    p07: 'Unités de fermeture AVS – étanchéité / fonction',
    p08: 'Membrane – étanchéité / fonction',
    p09: 'Racleur – état horizontal et vertical',
    p10: "Guidage linéaire horizontal – jeu (soulever à l'arrière) / rouille / traces<br/>Racleurs / rouille / re-graisser paliers",
    p11: 'Entraînement par courroie horiz. – courroie crantée / tension / poulie',
    p12: 'Serrage horiz. – couple 12 Nm',
    p13: 'Équerre de maintien courroie – vis serrées',
    p14: "Réducteur à vis sans fin – bruit / contrôle visuel / fuite huile<br/>Sécurité axiale de l'arbre de sortie",
    p15: "Guidage linéaire vertical – sortir le tube porteur et vérifier le jeu<br/>Lubrification / rouille / traces (pour télescope ouvrir courroie inférieure)",
    p16: 'Entraînement vertical – courroie crantée / poulie / tension',
    p17: "Crémaillère – vis de fixation<br/>Traces d'usure sur crémaillère et pignon",
    p18: "Frein de maintien moteur vertical – vérifier force de maintien à l'arrêt d'urgence",
    p19: 'Plaque de maintien courroie – vérifier vis / sécuriser avec colle',
    p20: 'Fin de course méc. et inductif – usure du galet / fonction',
    p21: 'Serrage vertical – couple 15 Nm',
    p22: 'Réducteur planétaire – bruit / contrôle visuel / fuite huile',
    p23: 'Tube porteur – soudures / alignement / vis serrées<br/>Étanchéité des plaques de connexion',
    p24: "Fixation tube porteur – réglage / vérifier pièces d'usure",
    p25: 'Vannes – fonction / connecteurs / joints',
    p26: 'Flexibles – vieillissement / dommages / étanchéité<br/>Flexibles air de commande dans le distributeur',
    p27: 'Chaînes porte-câbles – fixations / dommages / tous couvercles présents',
    p28: 'Câbles et connecteurs – contrôle visuel / dommages / serre-câbles',
    p29: 'Test lampes – serrures panneau de commande fonctionnent',
    p30: '<strong>Remarques</strong><br/><strong>Maintenance année précédente</strong>',
    p31: '<strong>Mesures/<br/>Recommandations</strong>',
  },
} satisfies Record<Lang, Record<string, string>>;

type TKeys = keyof typeof translations['de'];
type T = Record<TKeys, string>;

type CheckState = 0 | 1 | 2;
type Ck2State   = 0 | 1;

interface Zeile { divider?: TKeys; textKey?: TKeys; bem?: string | null; }
interface ZeilenState { ck: CheckState; name: string; bem: string; }
interface MaterialRow { pos: string; beschreibung: string; teilenummer: string; stk: string; }
interface MontagTag { datum: string; vonZeit: string; bisZeit: string; pauseMin: string; tagTyp: '' | 'feiertag' | 'samstag' | 'sonntag'; }
interface Monteur { name: string; tage: MontagTag[]; }

interface FormData {
  version: number; ts: string; kunde: string; arbeitsplatz: string; dgm: string; position: string;
  maschinTyp: string; maschineNr: string; kom: string; baujahr: string; wartungDatum: string;
  monteure: Monteur[]; nameGerlieva: string; nameKunde: string; signatureDate: string;
  signatures: { 'sig-gerlieva'?: string; 'sig-kunde'?: string };
  bemerkungen: string; massnahmen: string; zeilenState: ZeilenState[]; material: MaterialRow[];
  nullPunkt: { horVorh: Ck2State; horGet: Ck2State; vertVorh: Ck2State; vertGet: Ck2State };
  batt: { b1: Ck2State; b2: Ck2State };
  druck: { tmAktiv: Ck2State; luftAktiv: Ck2State; tmBar: string; luftBar: string };
}

const alleZeilen: Zeile[] = [
  { divider: 'divAllgemein' }, { textKey: 'p01', bem: '' }, { textKey: 'p02', bem: '' }, { textKey: 'p03', bem: '' },
  { textKey: 'p04', bem: '' }, { textKey: 'p05', bem: '' }, { textKey: 'p06', bem: '' }, { textKey: 'p07', bem: '' },
  { textKey: 'p08', bem: '' }, { textKey: 'p09', bem: '' }, { divider: 'divHorizontal' }, { textKey: 'p10', bem: '' },
  { textKey: 'p11', bem: '' }, { textKey: 'p12', bem: '' }, { textKey: 'p13', bem: '' }, { textKey: 'p14', bem: '' },
  { divider: 'divVertikal' }, { textKey: 'p15', bem: '' }, { textKey: 'p16', bem: '' }, { textKey: 'p17', bem: '' },
  { textKey: 'p18', bem: '' }, { textKey: 'p19', bem: '' }, { textKey: 'p20', bem: '' }, { textKey: 'p21', bem: '' },
  { textKey: 'p22', bem: '' }, { textKey: 'p23', bem: '' }, { textKey: 'p24', bem: '' }, { divider: 'divAllgemein' },
  { textKey: 'p25', bem: '' }, { textKey: 'p26', bem: '' }, { textKey: 'p27', bem: '' }, { textKey: 'p28', bem: '' },
  { textKey: 'p29', bem: '' }, { textKey: 'p30', bem: null }, { textKey: 'p31', bem: null },
];

const TOTAL_ZEILEN_COUNT = alleZeilen.length + 3;
const emptyTag = (): MontagTag => ({ datum: '', vonZeit: '', bisZeit: '', pauseMin: '', tagTyp: '' });
const emptyMonteur = (): Monteur => ({ name: '', tage: [emptyTag()] });
const emptyMaterial = (): MaterialRow => ({ pos: '', beschreibung: '', teilenummer: '', stk: '' });

const initialForm = (): FormData => ({
  version: 1, ts: '', kunde: '', arbeitsplatz: '', dgm: '', position: '', maschinTyp: '', maschineNr: '', kom: '', baujahr: '',
  wartungDatum: '', monteure: [emptyMonteur()], nameGerlieva: '', nameKunde: '', signatureDate: '', signatures: {},
  bemerkungen: '', massnahmen: '', zeilenState: Array.from({ length: TOTAL_ZEILEN_COUNT }, () => ({ ck: 0 as CheckState, name: '', bem: '' })),
  material: Array.from({ length: 15 }, emptyMaterial), nullPunkt: { horVorh: 0, horGet: 0, vertVorh: 0, vertGet: 0 },
  batt: { b1: 0, b2: 0 }, druck: { tmAktiv: 0, luftAktiv: 0, tmBar: '', luftBar: '' },
});

function calcNettoMin(tag: MontagTag): number {
  if (!tag.vonZeit || !tag.bisZeit) return 0;
  const [vh, vm] = tag.vonZeit.split(':').map(Number);
  const [bh, bm] = tag.bisZeit.split(':').map(Number);
  const diff = (bh * 60 + bm) - (vh * 60 + vm);
  const pause = parseInt(tag.pauseMin) || 0;
  return diff > 0 ? diff - pause : 0;
}

function calcNachtMin(tag: MontagTag): number {
  if (!tag.vonZeit || !tag.bisZeit) return 0;
  const [vh, vm] = tag.vonZeit.split(':').map(Number);
  const [bh, bm] = tag.bisZeit.split(':').map(Number);
  const von = vh * 60 + vm, bis = bh * 60 + bm;
  if (bis <= von) return 0;
  const NACHT_START = 20 * 60, NACHT_ENDE = 6 * 60;
  const vorSechs = von < NACHT_ENDE ? Math.min(bis, NACHT_ENDE) - von : 0;
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
    if (tag.tagTyp === 'samstag') samstag += min;
    if (tag.tagTyp === 'sonntag') sonntag += min;
    if (tag.tagTyp === 'feiertag') feiertag += min;
    nacht += calcNachtMin(tag);
  }));
  return { total, samstag, sonntag, feiertag, nacht };
}

function buildFileName(ext: string, maschineNr: string): string {
  const nr = maschineNr.trim().replace(/[^a-zA-Z0-9_\-]/g, '_');
  const d = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return (nr ? `Wartungsprotokoll_${nr}_${d}` : `Wartungsprotokoll_${d}`) + '.' + ext;
}

function FlagDE() { return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 20" width="30" height="20" style={{ display: 'block', borderRadius: 2 }}><rect width="30" height="20" fill="#000"/><rect y="6.67" width="30" height="6.67" fill="#D00"/><rect y="13.33" width="30" height="6.67" fill="#FFCE00"/></svg>; }
function FlagEN() { return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 20" width="30" height="20" style={{ display: 'block', borderRadius: 2 }}><rect width="30" height="20" fill="#012169"/><line x1="0" y1="0" x2="30" y2="20" stroke="#fff" strokeWidth="4"/><line x1="30" y1="0" x2="0" y2="20" stroke="#fff" strokeWidth="4"/><line x1="0" y1="0" x2="30" y2="20" stroke="#C8102E" strokeWidth="2.4"/><line x1="30" y1="0" x2="0" y2="20" stroke="#C8102E" strokeWidth="2.4"/><rect x="12" y="0" width="6" height="20" fill="#fff"/><rect y="7" width="30" height="6" fill="#fff"/><rect x="13" y="0" width="4" height="20" fill="#C8102E"/><rect y="8" width="30" height="4" fill="#C8102E"/></svg>; }
function FlagFR() { return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 20" width="30" height="20" style={{ display: 'block', borderRadius: 2 }}><rect width="30" height="20" fill="#ED2939"/><rect width="20" height="20" fill="#fff"/><rect width="10" height="20" fill="#002395"/></svg>; }

const FLAG_COMPONENTS: Record<Lang, () => JSX.Element> = { de: FlagDE, en: FlagEN, fr: FlagFR };

function LangSwitcher({ current, onChange }: { current: Lang; onChange: (l: Lang) => void }) {
  return <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>{(['de', 'en', 'fr'] as Lang[]).map(l => { const FlagComp = FLAG_COMPONENTS[l]; return <button key={l} onClick={() => onChange(l)} title={l.toUpperCase()} style={{ border: current === l ? '2px solid #fff' : '2px solid transparent', background: current === l ? 'rgba(255,255,255,0.18)' : 'transparent', borderRadius: 4, cursor: 'pointer', padding: '2px 4px', lineHeight: 1, transition: 'all 0.15s', display: 'flex', alignItems: 'center' }}><FlagComp /></button>; })}</div>;
}

function Toast({ msg, type, visible }: { msg: string; type: 'success' | 'error' | ''; visible: boolean }) {
  return <div style={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', background: type === 'success' ? '#1a7a3a' : type === 'error' ? '#c53a08' : '#333', color: 'white', padding: '12px 24px', borderRadius: 8, fontSize: 14, zIndex: 10000, opacity: visible ? 1 : 0, transition: 'opacity 0.3s ease', pointerEvents: 'none', maxWidth: '90%', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>{msg}</div>;
}

interface SigModalProps { label: string; existing?: string; onClose: (dataUrl?: string) => void; t: T; }

function SignatureModal({ label, existing, onClose, t }: SigModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const resize = () => {
      const container = canvas.parentElement!;
      const dpr = window.devicePixelRatio || 1;
      const w = Math.max(container.clientWidth - 16, 100), h = Math.max(container.clientHeight - 16, 80);
      const tmp = document.createElement('canvas');
      tmp.width = canvas.width; tmp.height = canvas.height;
      tmp.getContext('2d')!.drawImage(canvas, 0, 0);
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
      const ctx = canvas.getContext('2d')!;
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.scale(dpr, dpr);
      const oldW = tmp.width / dpr, oldH = tmp.height / dpr;
      ctx.drawImage(tmp, 0, 0, oldW, oldH, 0, 0, w, h);
    };
    setTimeout(resize, 50);
    const observer = new ResizeObserver(() => resize());
    if (canvas.parentElement) observer.observe(canvas.parentElement);
    window.addEventListener('resize', resize);
    return () => { observer.disconnect(); window.removeEventListener('resize', resize); };
  }, []);

  useEffect(() => { if (!existing || !canvasRef.current) return; setTimeout(() => { const canvas = canvasRef.current!; const img = new Image(); img.onload = () => canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height); img.src = existing; }, 200); }, [existing]);

  const getPos = (e: React.MouseEvent | React.TouchEvent, c: HTMLCanvasElement) => { const r = c.getBoundingClientRect(), src = 'touches' in e ? e.touches[0] : e; const scaleX = c.width / (window.devicePixelRatio || 1) / r.width, scaleY = c.height / (window.devicePixelRatio || 1) / r.height; return { x: (src.clientX - r.left) * scaleX, y: (src.clientY - r.top) * scaleY }; };
  const onStart = (e: React.MouseEvent | React.TouchEvent) => { e.preventDefault(); drawing.current = true; const c = canvasRef.current!; const ctx = c.getContext('2d')!; const p = getPos(e, c); ctx.beginPath(); ctx.moveTo(p.x, p.y); };
  const onMove = (e: React.MouseEvent | React.TouchEvent) => { e.preventDefault(); if (!drawing.current) return; const c = canvasRef.current!; const ctx = c.getContext('2d')!; const p = getPos(e, c); ctx.lineTo(p.x, p.y); ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(); };
  const onStop = () => { drawing.current = false; canvasRef.current?.getContext('2d')?.closePath(); };
  const tbtn = (bg: string): React.CSSProperties => ({ background: bg, color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 4, fontSize: 11, cursor: 'pointer', marginRight: 4, fontFamily: 'Arial, sans-serif' });

  return <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: '#fff', display: 'flex', flexDirection: 'column' }}><div style={{ background: '#1a2744', color: '#fff', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10 }}><span style={{ fontSize: 13, fontWeight: 'bold', flex: 1 }}>✍️ {label}</span><button onClick={() => { const c = canvasRef.current!; c.getContext('2d')!.clearRect(0, 0, c.width, c.height); }} style={tbtn('#e8460a')}>{t.sigClear}</button><button onClick={() => onClose()} style={tbtn('#888')}>{t.sigCancel}</button><button onClick={() => onClose(canvasRef.current?.toDataURL('image/png'))} style={tbtn('#2a7a2a')}>{t.sigOk}</button></div><div style={{ flex: 1, padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f0f0' }}><canvas ref={canvasRef} width={400} height={200} style={{ background: 'white', border: '2px solid #aaa', borderRadius: 4, touchAction: 'none', cursor: 'crosshair', maxWidth: '100%', maxHeight: '100%' }} onMouseDown={onStart} onMouseMove={onMove} onMouseUp={onStop} onMouseLeave={onStop} onTouchStart={onStart} onTouchMove={onMove} onTouchEnd={onStop} /></div><div style={{ textAlign: 'center', padding: 6, fontSize: 8, color: '#666' }}>{t.sigLabel}</div></div>;
}

function SigPreview({ dataUrl, onClick, tapLabel }: { dataUrl?: string; onClick: () => void; tapLabel: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const redraw = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const parent = canvas.parentElement;
    const w = (parent ? parent.clientWidth : canvas.offsetWidth) || 300, h = (parent ? parent.clientHeight : canvas.offsetHeight) || 75;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    const ctx = canvas.getContext('2d')!;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.scale(dpr, dpr);
    if (dataUrl) { const img = new Image(); img.onload = () => ctx.drawImage(img, 0, 0, w, h); img.src = dataUrl; } else { ctx.fillStyle = '#bbb'; ctx.font = '11px Arial'; ctx.textAlign = 'center'; ctx.fillText(tapLabel, w / 2, h / 2); }
  }, [dataUrl, tapLabel]);

  useEffect(() => { const t1 = setTimeout(redraw, 50); const t2 = setTimeout(redraw, 300); const observer = new ResizeObserver(() => redraw()); if (canvasRef.current?.parentElement) observer.observe(canvasRef.current.parentElement); window.addEventListener('resize', redraw); return () => { clearTimeout(t1); clearTimeout(t2); observer.disconnect(); window.removeEventListener('resize', redraw); }; }, [redraw]);

  return <div style={{ position: 'relative', width: '100%', aspectRatio: '4/1' }}><canvas ref={canvasRef} width={400} height={100} onClick={onClick} className="sig-canvas" style={{ border: '2px dashed #999', background: 'white', cursor: 'pointer', width: '100%', height: '100%', borderRadius: 3, display: 'block', touchAction: 'none' }} />{dataUrl ? <img src={dataUrl} alt="Unterschrift" className="sig-print-img" style={{ display: 'none', width: '100%', height: '100%', objectFit: 'contain', border: '1px solid #000' }} /> : <div className="sig-print-empty" style={{ display: 'none', width: '100%', height: '100%', border: '1px solid #000', background: 'white' }} />}</div>;
}

const CK_LABELS: Record<number, string> = { 0: '', 1: '✓', 2: '✗' };
const CK_BG: Record<number, string> = { 0: '', 1: '#d4edda', 2: '#f8d7da' };

function CheckCell({ state, onChange }: { state: CheckState; onChange: (s: CheckState) => void }) {
  return <td onClick={() => onChange(((state + 1) % 3) as CheckState)} style={{ border: '1px solid #000', width: 20, textAlign: 'center', verticalAlign: 'middle', cursor: 'pointer', fontSize: 10, padding: 1, userSelect: 'none', background: CK_BG[state] }}>{CK_LABELS[state]}</td>;
}

function Ck2({ state, onChange }: { state: Ck2State; onChange: (s: Ck2State) => void }) {
  return <span onClick={() => onChange(state === 1 ? 0 : 1)} style={{ display: 'inline-block', width: 18, height: 18, border: '1.5px solid #000', cursor: 'pointer', verticalAlign: 'middle', fontSize: 11, textAlign: 'center', lineHeight: '18px', userSelect: 'none', background: state === 1 ? '#d4edda' : '', WebkitTapHighlightColor: 'transparent' }}>{state === 1 ? '✓' : '\u00a0'}</span>;
}

function PruefZeile({ zeile, state, onChange, rowIndex, t }: { zeile: Zeile; state: ZeilenState; onChange: (s: Partial<ZeilenState>) => void; rowIndex: number; t: T; }) {
  const bg = rowIndex % 2 === 0 ? '#fff' : '#f3f3f3';
  const cell: React.CSSProperties = { border: '1px solid #000', padding: '2px 3px', verticalAlign: 'top', wordBreak: 'break-word', lineHeight: 1.3, fontSize: 8.5, background: bg };
  const inp: React.CSSProperties = { border: 'none', outline: 'none', width: '100%', fontFamily: 'Arial', fontSize: 8, background: 'transparent', padding: 0 };
  const text = zeile.textKey ? t[zeile.textKey] : '';
  if (zeile.divider) return <tr><td colSpan={4} style={{ background: '#cfdff5', fontWeight: 'bold', fontSize: 8, padding: '2px 4px', letterSpacing: '.03em', border: '1px solid #000' }}>{t[zeile.divider]}</td></tr>;
  if (zeile.bem === null) return <tr><td colSpan={4} style={{ ...cell, minHeight: 26 }}><span dangerouslySetInnerHTML={{ __html: text }} />&nbsp;&nbsp;<input type="text" value={state.bem} onChange={e => onChange({ bem: e.target.value })} style={{ ...inp, width: '60%', display: 'inline-block' }} /></td></tr>;
  return <tr><td style={cell}><span dangerouslySetInnerHTML={{ __html: text }} /></td><CheckCell state={state.ck} onChange={ck => onChange({ ck })} /><td style={cell}><input type="text" value={state.name} onChange={e => onChange({ name: e.target.value })} style={inp} /></td><td style={cell}><input type="text" value={state.bem} onChange={e => onChange({ bem: e.target.value })} style={inp} /></td></tr>;
}

const printStyles = `html{overflow-x:hidden;-webkit-overflow-scrolling:touch;}body{overflow-x:hidden;overflow-y:auto;overscroll-behavior-y:auto;-webkit-overflow-scrolling:touch;}@page{size:A4 portrait;margin:10mm 11mm;}@media print{.no-print{display:none!important;}#page-wrapper{margin:0!important;padding:0!important;gap:0!important;display:block!important;}.a4{width:100%!important;padding:0!important;box-shadow:none!important;page-break-after:always!important;}tr{page-break-inside:avoid;}*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;color-adjust:exact!important;}input[type="text"],input[type="number"],input[type="time"],input[type="date"],input[type="month"]{border-bottom:1px solid #bbb!important;}.sig-canvas{display:none!important;}.sig-print-img{display:block!important;width:100%!important;height:auto!important;max-height:80px;object-fit:contain;border:1px solid #000;}.sig-print-empty{display:block!important;width:100%!important;height:60px!important;border:1px solid #000;background:white;}}input[type="date"],input[type="time"],input[type="month"]{background-color:transparent!important;color:#000!important;color-scheme:light!important;}select{color-scheme:light!important;color:#000!important;}@media screen and (max-width:600px){.toolbar-title{display:none;}#page-wrapper{padding:4px!important;}.a4{padding:4mm 4mm!important;}}@media screen and (max-width:900px) and (orientation:landscape){.toolbar-title{display:none;}#page-wrapper{padding:4px!important;padding-left:max(4px,env(safe-area-inset-left))!important;padding-right:max(4px,env(safe-area-inset-right))!important;}.a4{padding:6mm 6mm!important;font-size:90%!important;}}`;
const LOGO_B64 = '';

export default function WartungsprotokollGS() {
  const [lang, setLang] = useState<Lang>('de');
  const t = translations[lang] as T;
  const [form, setForm] = useState<FormData>(initialForm);
  const [sigModal, setSigModal] = useState<{ id: 'sig-gerlieva' | 'sig-kunde'; label: string } | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | ''; visible: boolean }>({ msg: '', type: '', visible: false });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const importedData = localStorage.getItem('importedFormData');
    if (importedData) {
      try { const data = JSON.parse(importedData); applyFormData(data); localStorage.removeItem('importedFormData'); }
      catch (err) { console.error('Fehler beim Laden importierter Daten:', err); }
    }
  }, []);

  useEffect(() => {
    const toolbar = document.getElementById('toolbar'), wrapper = document.getElementById('page-wrapper');
    if (!toolbar || !wrapper) return;
    const observer = new ResizeObserver(() => { wrapper.style.marginTop = toolbar.offsetHeight + 8 + 'px'; });
    observer.observe(toolbar);
    return () => observer.disconnect();
  }, []);

  const showToast = (msg: string, type: 'success' | 'error') => { setToast({ msg, type, visible: true }); setTimeout(() => setToast(p => ({ ...p, visible: false })), 2500); };
  const setField = <K extends keyof FormData>(key: K, val: FormData[K]) => setForm(f => ({ ...f, [key]: val }));
  const setZeile = (idx: number, partial: Partial<ZeilenState>) => setForm(f => { const z = [...f.zeilenState]; z[idx] = { ...z[idx], ...partial }; return { ...f, zeilenState: z }; });
  const setMonteurName = (mi: number, val: string) => setForm(f => { const m = f.monteure.map((mo, i) => i === mi ? { ...mo, name: val } : mo); return { ...f, monteure: m }; });
  const setMontagTag = (mi: number, ti: number, key: keyof MontagTag, val: string) => setForm(f => { const m = f.monteure.map((mo, i) => { if (i !== mi) return mo; const tage = mo.tage.map((tag, j) => { if (j !== ti) return tag; const updated = { ...tag, [key]: val }; if (key === 'datum' && val) { const dow = new Date(val).getDay(); const autoTyp = dow === 6 ? 'samstag' : dow === 0 ? 'sonntag' : ''; if (tag.tagTyp !== 'feiertag') { updated.tagTyp = autoTyp as MontagTag['tagTyp']; } } return updated; }); return { ...mo, tage }; }); return { ...f, monteure: m }; });
  const addMonteur = () => setForm(f => ({ ...f, monteure: [...f.monteure, emptyMonteur()] }));
  const removeMonteur = () => setForm(f => f.monteure.length <= 1 ? f : { ...f, monteure: f.monteure.slice(0, -1) });
  const addTag = (mi: number) => setForm(f => { const m = f.monteure.map((mo, i) => i === mi ? { ...mo, tage: [...mo.tage, emptyTag()] } : mo); return { ...f, monteure: m }; });
  const removeTag = (mi: number, ti: number) => setForm(f => { const m = f.monteure.map((mo, i) => { if (i !== mi || mo.tage.length <= 1) return mo; return { ...mo, tage: mo.tage.filter((_, j) => j !== ti) }; }); return { ...f, monteure: m }; });
  const setMaterial = (i: number, key: keyof MaterialRow, val: string) => setForm(f => { const mat = [...f.material]; mat[i] = { ...mat[i], [key]: val }; return { ...f, material: mat }; });
  const getFileNameFn = (ext: string) => {
    const maschineNr = (form.maschineNr || '').trim().replace(/[^a-zA-Z0-9_\-]/g, '_');
    const datum = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    
    let name = 'Wartungsprotokoll_GS';
    if (maschineNr) name += `_${maschineNr}`;
    name += `_${datum}`;
    
    return name + '.' + ext;
  };
  const collectFormData = () => ({ ...form, ts: new Date().toISOString(), dokumentTyp: "gswartung" });
  const applyFormData = (data: FormData) => { if (!data || data.version !== 1) { showToast(t.toastInvalid, 'error'); return; } setForm(data); showToast(t.toastLoaded, 'success'); };
  const handleSave = () => { try { const blob = new Blob([JSON.stringify(collectFormData(), null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = getFileNameFn('json'); document.body.appendChild(a); a.click(); document.body.removeChild(a); setTimeout(() => URL.revokeObjectURL(url), 2000); showToast(t.toastSaved, 'success'); } catch (err: unknown) { showToast(t.toastError + (err as Error).message, 'error'); } };

  const handleUploadToStorage = async () => {
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { showToast('Bitte zuerst anmelden', 'error'); setUploading(false); return; }
      
      const jsonData = collectFormData();
      const jsonStr = JSON.stringify(jsonData, null, 2);
      const fileName = getFileNameFn('json');

      // Prüfen ob Datei bereits existiert
      const { data: files } = await supabase.storage
        .from(DOCUMENTS_BUCKET)
        .list(user.id);
      
      const exists = files?.some(f => f.name === fileName);
      
      if (exists) {
        const confirmed = window.confirm(
          `Die Datei "${fileName}" existiert bereits.\n\nMöchten Sie sie überschreiben?`
        );
        if (!confirmed) {
          setUploading(false);
          return;
        }
      }

      const filePath = `${user.id}/${fileName}`;
      const blob = new Blob([jsonStr], { type: 'application/json' });
      
      const { error: uploadError } = await supabase.storage.from(DOCUMENTS_BUCKET).upload(filePath, blob, { upsert: true });
      if (uploadError) throw uploadError;
      
      // Prüfen ob DB-Eintrag existiert
      const { data: existingDoc } = await supabase
        .from(DOCUMENTS_TABLE)
        .select('id')
        .eq('file_path', filePath)
        .maybeSingle();

      if (existingDoc) {
        // UPDATE
        const { error: updateError } = await supabase
          .from(DOCUMENTS_TABLE)
          .update({
            file_name: fileName,
            file_type: 'application/json',
            file_size: blob.size
          })
          .eq('file_path', filePath);
        
        if (updateError) throw updateError;
      } else {
        // INSERT
        const { error: insertError } = await supabase
          .from(DOCUMENTS_TABLE)
          .insert({
            file_path: filePath,
            file_name: fileName,
            file_type: 'application/json',
            file_size: blob.size,
            user_id: user.id
          });
        
        if (insertError) throw insertError;
      }
      
      showToast('✅ In Storage gespeichert!', 'success');
    } catch (err: unknown) { showToast('Fehler beim Speichern: ' + (err as Error).message, 'error'); }
    finally { setUploading(false); }
  };

  const handlePdf = () => { alert(t.pdfAlert); const restoreList: Array<() => void> = []; document.querySelectorAll<HTMLInputElement>('input[type="text"], input[type="number"], input[type="time"], input[type="date"], input[type="month"]').forEach(el => { const old = el.getAttribute('value'); el.setAttribute('value', el.value); restoreList.push(() => { if (old === null) el.removeAttribute('value'); else el.setAttribute('value', old); }); }); window.print(); setTimeout(() => restoreList.forEach(fn => fn()), 1000); };
  const handleLoad = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = (ev) => { try { applyFormData(JSON.parse(ev.target?.result as string)); } catch (err: unknown) { showToast(t.toastLoadError + (err as Error).message, 'error'); } }; reader.readAsText(file); e.target.value = ''; };
  const handleSigClose = (id: 'sig-gerlieva' | 'sig-kunde', dataUrl?: string) => { if (dataUrl) setForm(f => ({ ...f, signatures: { ...f.signatures, [id]: dataUrl } })); setSigModal(null); };
  const clearSig = (id: 'sig-gerlieva' | 'sig-kunde') => setForm(f => { const s = { ...f.signatures }; delete s[id]; return { ...f, signatures: s }; });
  const gesamtAZ = calcGesamtMinutes(form.monteure);
  const gesamtBreakdown = calcGesamtBreakdown(form.monteure);
  const cellStyle: React.CSSProperties = { border: '1px solid #000', padding: '1px 3px', verticalAlign: 'top', wordBreak: 'break-word', lineHeight: 1.3, fontSize: 8.5 };
  const thStyle: React.CSSProperties = { ...cellStyle, fontWeight: 'bold', textAlign: 'left' };
  const inp = (extra?: React.CSSProperties): React.CSSProperties => ({ border: 'none', outline: 'none', width: '100%', fontFamily: 'Arial, sans-serif', fontSize: 8, background: 'transparent', padding: 0, ...extra });
  const tbtn = (bg: string): React.CSSProperties => ({ border: 'none', padding: '7px 12px', fontSize: 9, fontWeight: 'bold', borderRadius: 3, cursor: 'pointer', fontFamily: 'Arial, sans-serif', color: '#fff', background: bg, whiteSpace: 'nowrap', flexShrink: 0, minHeight: 32, touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' });
  const S2_OFFSET = alleZeilen.length, S2_NORMAL = 0;
  const innerInp: React.CSSProperties = { border: 'none', outline: 'none', fontFamily: 'Arial', fontSize: 8, background: 'transparent', padding: 0 };

  const renderSpecial = (specialIdx: 0 | 1 | 2, rowIndex: number) => {
    const bg = rowIndex % 2 === 0 ? '#fff' : '#f3f3f3';
    const absIdx = S2_OFFSET + S2_NORMAL + specialIdx;
    const td: React.CSSProperties = { ...cellStyle, background: bg };
    const zs = form.zeilenState[absIdx] ?? { ck: 0 as CheckState, name: '', bem: '' };
    const ckCol = <CheckCell state={zs.ck} onChange={ck => setZeile(absIdx, { ck })} />;
    const nameCol = <td style={td}><input type="text" value={zs.name} onChange={e => setZeile(absIdx, { name: e.target.value })} style={innerInp} /></td>;
    const bemCol = <td style={td}><input type="text" value={zs.bem} onChange={e => setZeile(absIdx, { bem: e.target.value })} style={innerInp} /></td>;
    if (specialIdx === 0) return <tr key="sp0"><td style={td}><table style={{ border: 'none', width: '100%', fontSize: 8, borderCollapse: 'collapse' }}><tbody><tr><td colSpan={3} style={{ border: 'none', padding: '1px 4px 2px 0', fontWeight: 'bold' }}>{t.nullPunktTitle}</td><td style={{ border: 'none', textAlign: 'center', fontWeight: 'bold' }}>{t.nullHor}</td><td style={{ border: 'none', textAlign: 'center', fontWeight: 'bold' }}>{t.nullVert}</td></tr><tr><td colSpan={3} style={{ border: 'none', padding: '1px 0 1px 8px' }}>{t.nullVorhanden}</td><td style={{ border: 'none', textAlign: 'center' }}><Ck2 state={form.nullPunkt.horVorh} onChange={v => setForm(f => ({ ...f, nullPunkt: { ...f.nullPunkt, horVorh: v } }))} /></td><td style={{ border: 'none', textAlign: 'center' }}><Ck2 state={form.nullPunkt.vertVorh} onChange={v => setForm(f => ({ ...f, nullPunkt: { ...f.nullPunkt, vertVorh: v } }))} /></td></tr><tr><td colSpan={3} style={{ border: 'none', padding: '1px 0 1px 8px' }}>{t.nullGetauscht}</td><td style={{ border: 'none', textAlign: 'center' }}><Ck2 state={form.nullPunkt.horGet} onChange={v => setForm(f => ({ ...f, nullPunkt: { ...f.nullPunkt, horGet: v } }))} /></td><td style={{ border: 'none', textAlign: 'center' }}><Ck2 state={form.nullPunkt.vertGet} onChange={v => setForm(f => ({ ...f, nullPunkt: { ...f.nullPunkt, vertGet: v } }))} /></td></tr></tbody></table></td>{ckCol}{nameCol}{bemCol}</tr>;
    if (specialIdx === 1) return <tr key="sp1"><td style={td}><table style={{ border: 'none', width: '100%', fontSize: 8, borderCollapse: 'collapse' }}><tbody><tr><td colSpan={2} style={{ border: 'none', padding: '1px 4px 2px 0', fontWeight: 'bold' }}>{t.battTitle}</td><td style={{ border: 'none', textAlign: 'center', fontWeight: 'bold' }}>{t.battGetauscht}</td></tr><tr><td colSpan={2} style={{ border: 'none', padding: '1px 0 1px 8px' }}>604-31000403:</td><td style={{ border: 'none', textAlign: 'center' }}><Ck2 state={form.batt.b1} onChange={v => setForm(f => ({ ...f, batt: { ...f.batt, b1: v } }))} /></td></tr><tr><td colSpan={2} style={{ border: 'none', padding: '1px 0 1px 8px' }}>604-31300:</td><td style={{ border: 'none', textAlign: 'center' }}><Ck2 state={form.batt.b2} onChange={v => setForm(f => ({ ...f, batt: { ...f.batt, b2: v } }))} /></td></tr></tbody></table></td>{ckCol}{nameCol}{bemCol}</tr>;
    return <tr key="sp2"><td style={td}><table style={{ border: 'none', width: '100%', fontSize: 8, borderCollapse: 'collapse' }}><tbody><tr><td style={{ border: 'none', fontWeight: 'bold' }}>{t.druckTitle}</td><td style={{ border: 'none', fontWeight: 'bold', textAlign: 'center' }}>{t.druckAktiv}</td><td style={{ border: 'none', fontWeight: 'bold', textAlign: 'center' }}>{t.druckBar}</td></tr><tr><td style={{ border: 'none', padding: '1px 0 1px 8px' }}>{t.druckTrennmittel}</td><td style={{ border: 'none', textAlign: 'center' }}><Ck2 state={form.druck.tmAktiv} onChange={v => setForm(f => ({ ...f, druck: { ...f.druck, tmAktiv: v } }))} /></td><td style={{ border: 'none', textAlign: 'center' }}><input type="text" value={form.druck.tmBar} onChange={e => setForm(f => ({ ...f, druck: { ...f.druck, tmBar: e.target.value } }))} style={{ width: 60, border: '1px solid #000', fontSize: 8, textAlign: 'center', padding: 1 }} /></td></tr><tr><td style={{ border: 'none', padding: '1px 0 1px 8px' }}>{t.druckLuft}</td><td style={{ border: 'none', textAlign: 'center' }}><Ck2 state={form.druck.luftAktiv} onChange={v => setForm(f => ({ ...f, druck: { ...f.druck, luftAktiv: v } }))} /></td><td style={{ border: 'none', textAlign: 'center' }}><input type="text" value={form.druck.luftBar} onChange={e => setForm(f => ({ ...f, druck: { ...f.druck, luftBar: e.target.value } }))} style={{ width: 60, border: '1px solid #000', fontSize: 8, textAlign: 'center', padding: 1 }} /></td></tr></tbody></table></td>{ckCol}{nameCol}{bemCol}</tr>;
  };

  return <><style>{printStyles}</style><div id="toolbar" className="no-print" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999, background: '#1a2744', padding: '6px 10px', paddingLeft: 'max(10px, env(safe-area-inset-left))', paddingRight: 'max(10px, env(safe-area-inset-right))', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', boxSizing: 'border-box' }}><button onClick={() => fileInputRef.current?.click()} style={tbtn('#8e24aa')}>{t.loadJson}</button><button onClick={handlePdf} style={tbtn('#e8460a')}>{t.savePdf}</button><button onClick={handleUploadToStorage} disabled={uploading} style={tbtn('#1a7a3a')}>{uploading ? '⏳ Lädt...' : t.shareJson}</button><button onClick={handleSave} style={tbtn('#1a5fa8')}>{t.saveJson}</button><span className="toolbar-title" style={{ color: '#a8b8d8', fontSize: 9, flexShrink: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>{t.toolbarTitle}</span><div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}><LangSwitcher current={lang} onChange={setLang} /><a href="/" style={{ ...tbtn('#1a5fa8'), textDecoration: 'none' }}>{t.home}</a></div><input ref={fileInputRef} type="file" accept=".json,.txt" style={{ display: 'none' }} onChange={handleLoad} /></div><div id="page-wrapper" style={{ marginTop: 56, padding: '8px', paddingLeft: 'max(8px, env(safe-area-inset-left))', paddingRight: 'max(8px, env(safe-area-inset-right))', paddingBottom: 'max(16px, env(safe-area-inset-bottom))', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, boxSizing: 'border-box', minHeight: '100vh' }}><div className="a4" style={{ width: 'min(210mm, 100%)', background: '#fff', padding: '10mm 11mm', boxShadow: '0 3px 16px rgba(0,0,0,.25)', boxSizing: 'border-box' }}><h2 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8, fontFamily: 'Arial, sans-serif', color: '#000' }}>{t.docTitle}</h2><table style={{ marginBottom: 0, width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}><colgroup><col style={{ width: '13%' }} /><col style={{ width: '5%' }} /><col style={{ width: '18%' }} /><col style={{ width: '10%' }} /><col style={{ width: '13%' }} /><col style={{ width: '4%' }} /><col style={{ width: '8%' }} /><col style={{ width: '7%' }} /><col style={{ width: '6%' }} /></colgroup><tbody><tr><td rowSpan={3} style={{ border: '1px solid #000', verticalAlign: 'middle', textAlign: 'center', padding: 0, overflow: 'hidden' }}></td><td colSpan={6} style={{ border: '1px solid #000', padding: 1 }}></td><th colSpan={2} style={{ border: '1px solid #000', textAlign: 'right', fontWeight: 'bold', fontSize: 11 }}>{t.labelWartung}</th></tr><tr style={{ height: 18 }}><th style={thStyle}>{t.labelKunde}</th><td style={cellStyle}><input type="text" value={form.kunde} onChange={e => setField('kunde', e.target.value)} style={inp({ height: 16 })} /></td><th style={thStyle}>{t.labelArbeitsplatz}</th><td style={cellStyle}><input type="text" value={form.arbeitsplatz} onChange={e => setField('arbeitsplatz', e.target.value)} style={inp({ height: 16 })} maxLength={12} /></td><th style={thStyle}>{t.labelDgm}</th><td style={cellStyle}><input type="text" value={form.dgm} onChange={e => setField('dgm', e.target.value)} style={inp({ height: 16 })} /></td><th style={thStyle}>{t.labelPosition}</th><td style={{ ...cellStyle, width: 55 }}><input type="text" value={form.position} onChange={e => setField('position', e.target.value)} style={inp({ width: 52, height: 16 })} maxLength={8} /></td></tr><tr style={{ height: 18 }}><th style={thStyle}>{t.labelMaschinTyp}</th><td style={cellStyle}><input type="text" value={form.maschinTyp} onChange={e => setField('maschinTyp', e.target.value)} style={inp({ height: 16 })} /></td><th style={thStyle}>{t.labelMaschineNr}</th><td style={cellStyle}><input type="text" value={form.maschineNr} onChange={e => setField('maschineNr', e.target.value)} style={inp({ height: 16 })} maxLength={12} /></td><th style={thStyle}>{t.labelKom}</th><td style={cellStyle}><input type="text" value={form.kom} onChange={e => setField('kom', e.target.value)} style={inp({ height: 16 })} /></td><th style={thStyle}>{t.labelBaujahr}</th><td style={{ ...cellStyle, width: 72 }}><input type="month" value={form.baujahr} onChange={e => setField('baujahr', e.target.value)} style={{ border: 'none', outline: 'none', fontFamily: 'Arial', fontSize: 7.5, background: 'transparent', color: '#000', colorScheme: 'light', padding: 0, width: 70, height: 16, cursor: 'pointer' }} /></td></tr></tbody></table><table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}><colgroup><col style={{ width: '47%' }} /><col style={{ width: '4%' }} /><col style={{ width: '5%' }} /><col style={{ width: '44%' }} /></colgroup><thead><tr><th style={thStyle}><strong>{t.colPruefpunkt}</strong></th><th style={{ ...thStyle, textAlign: 'center', fontSize: 7.5 }}>{t.colOk}</th><th style={{ ...thStyle, textAlign: 'center', fontSize: 7.5 }}>{t.colName}</th><th style={{ ...thStyle, fontSize: 7 }}>{t.colBemerkung}</th></tr></thead><tbody>{alleZeilen.map((z, i) => <PruefZeile key={i} zeile={z} state={form.zeilenState[i] ?? { ck: 0, name: '', bem: '' }} onChange={p => setZeile(i, p)} rowIndex={i} t={t} />)}{renderSpecial(0, S2_OFFSET)}{renderSpecial(1, S2_OFFSET + 1)}{renderSpecial(2, S2_OFFSET + 2)}</tbody></table></div></div>{sigModal && <SignatureModal label={sigModal.label} existing={form.signatures[sigModal.id]} onClose={dataUrl => handleSigClose(sigModal.id, dataUrl)} t={t} />}<Toast msg={toast.msg} type={toast.type} visible={toast.visible} /></>;
}