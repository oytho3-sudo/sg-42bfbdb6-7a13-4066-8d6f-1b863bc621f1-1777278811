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
    toolbarTitle:   'Wartungsprotokoll Dosieranlagen · GERLIEVA Sprühtechnik GmbH',
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
    techPlaceholder:'________________',
    home:           '🏠 Home',
    labelWartungShare: 'Wartungsprotokoll Dosieranlagen GERLIEVA',
    sectionMaterial:'Material- und Teileliste',
    thPos:          'Pos.',
    thBeschreibung: 'Beschreibung',
    thTeilenummer:  'Teilenummer',
    thStk:          'Stk.',
    istZustandTitle:    'Aktueller Zustand',
    labelMengeHub:      'Menge pro Hub',
    labelMengeHubUnit:  'ml',
    labelBemerkungen:   'Bemerkungen',
    unitBar:            'bar',
    unitLiter:          'l',
    labelGewechselt:    'gewechselt',
    divAllgemein:        '▶  DOSIERANLAGE',
    divAktZustand:       '▶  AKTUELLER ZUSTAND',
    divDosierpumpe:      '▶  DOSIERPUMPE',
    divFassdeckel:       '▶  FASSDECKEL / SAUGLANZE',
    divWasserversorgung: '▶  WASSERVERSORGUNG',
    p01: 'Funktion in Automatik: Funktion',
    p02: 'Funktionen im Handbetrieb: Wasserzulauf / Dosierpumpe',
    p06: 'Pufferbehaelter: Zustand und Funktion der Fuellstandschalter',
    p07: 'Membranpumpe: Drehmoment Schrauben, Funktion, Dichtigkeit',
    p09: 'Mediumleitungen: Kontrolldurchgang Schlaeuche, Verschraubungen',
    p10: 'Druckluft: Dichtigkeit, Schlaeuche, Armaturen, Filter, Oeler',
    p12: 'Funktion',
    p13: 'Dichtigkeit',
    p14: 'ermittelte Menge',
    p15: 'Saugleitung',
    p16: 'Fasswechsel',
    p17: 'Fuellstandschalter',
    p18: 'Rückschlagventil',
    p19: 'Druck',
    p20: 'Dichtigkeit',
    p21: 'Filtereinsatz',
    p22: 'Wasserzaehler ausgelittert',
    p23: 'Funktion Durchflussbegrenzer',
    p24: 'Funktion Wasserventil',
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
    techPlaceholder:'________________',
    home:           '🏠 Home',
    labelWartungShare: 'Maintenance Log GERLIEVA',
    sectionMaterial:'Materials & Parts List',
    thPos:          'Pos.',
    thBeschreibung: 'Description',
    thTeilenummer:  'Part Number',
    thStk:          'Qty.',
    istZustandTitle:    'Current condition',
    labelMengeHub:      'Volume per stroke',
    labelMengeHubUnit:  'ml',
    labelBemerkungen:   'Remarks',
    unitBar:            'bar',
    unitLiter:          'l',
    labelGewechselt:    'replaced',
    divAllgemein:   '▶  DOSING SYSTEM',
    divAktZustand:  '▶  CURRENT CONDITION',
    divDosierpumpe:      '▶  DOSING PUMP',
    divFassdeckel:       '▶  DRUM LID / SUCTION LANCE',
    divWasserversorgung: '▶  WATER SUPPLY',
    p01: 'Function in automatic mode: function',
    p02: 'Functions in manual mode: water feed / dosing pump',
    p06: 'Buffer tank: status and function of the level switches',
    p07: 'Diaphragm pump: torque screws, function, tightness',
    p09: 'Medium lines: control passage hoses, fittings',
    p10: 'Compressed air: tightness, hoses, fittings, filters, oilers',
    p12: 'Function',
    p13: 'Tightness',
    p14: 'measured quantity',
    p15: 'Suction line',
    p16: 'Drum change',
    p17: 'Level switch',
    p18: 'Check valve',
    p19: 'Pressure',
    p20: 'Tightness',
    p21: 'Filter cartridge',
    p22: 'Water meter reading recorded',
    p23: 'Flow limiter function',
    p24: 'Water valve function',
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
    techPlaceholder:'________________',
    home:           '🏠 Accueil',
    labelWartungShare: 'Protocole de maintenance GERLIEVA',
    sectionMaterial:'Liste des matériaux et pièces',
    thPos:          'Pos.',
    thBeschreibung: 'Description',
    thTeilenummer:  'N° de pièce',
    thStk:          'Qté.',
    istZustandTitle:    'État actuel',
    labelMengeHub:      'Volume par course',
    labelMengeHubUnit:  'ml',
    labelBemerkungen:   'Remarques',
    unitBar:            'bar',
    unitLiter:          'l',
    labelGewechselt:    'remplacé',
    divAllgemein:   '▶  SYSTÈME DE DOSAGE',
    divAktZustand:  '▶  ÉTAT ACTUEL',
    divDosierpumpe:      '▶  POMPE DOSEUSE',
    divFassdeckel:       "▶  COUVERCLE DE FÛT / LANCE D'ASPIRATION",
    divWasserversorgung: '▶  ALIMENTATION EN EAU',
    p01: 'Fonction en mode automatique : fonction',
    p02: "Fonctions en mode manuel : arrivée d'eau / pompe doseuse",
    p06: 'Réservoir tampon : état et fonction des interrupteurs de niveau',
    p07: 'Pompe à membrane : couple des vis, fonction, étanchéité',
    p09: 'Conduites de produit : contrôle du passage, flexibles, raccords',
    p10: 'Air comprimé : étanchéité, flexibles, raccords, filtres, huileurs',
    p12: 'Fonction',
    p13: 'Étanchéité',
    p14: 'quantité mesurée',
    p15: "Conduite d'aspiration",
    p16: 'Changement de fût',
    p17: 'Interrupteur de niveau',
    p18: 'Vanne anti-retour',
    p19: 'Pression',
    p20: 'Étanchéité',
    p21: 'Cartouche filtrante',
    p22: "Relevé du compteur d'eau effectué",
    p23: 'Fonction limiteur de débit',
    p24: "Fonction vanne d'eau",
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
  hasInput?: boolean;
  inputUnit?: TKeys;
  extraCheck?: TKeys;
}

interface ZeilenState {
  ck:    CheckState;
  name:  string;
  bem:   string;
  value: string;
  extra: Ck2State;
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
  istZustand:    { mengeHub: string; mischung: string; bemerkung: string };
}

// ═══════════════════════════════════════════════════════════════════════════════
// Zeilen-Daten
// ═══════════════════════════════════════════════════════════════════════════════

const alleZeilen: Zeile[] = [
  { divider: 'divAllgemein' },
  { textKey: 'p01', bem: '' },
  { textKey: 'p02', bem: '' },
  { textKey: 'p06', bem: '' },
  { textKey: 'p07', bem: '' },
  { textKey: 'p09', bem: '' },
  { textKey: 'p10', bem: '' },
  { divider: 'divDosierpumpe' },
  { textKey: 'p12', bem: '' },
  { textKey: 'p13', bem: '' },
  { textKey: 'p14', bem: '', hasInput: true, inputUnit: 'labelMengeHubUnit' },
  { divider: 'divFassdeckel' },
  { textKey: 'p15', bem: '' },
  { textKey: 'p16', bem: '' },
  { textKey: 'p17', bem: '' },
  { textKey: 'p18', bem: '' },
  { divider: 'divWasserversorgung' },
  { textKey: 'p19', bem: '', hasInput: true, inputUnit: 'unitBar' },
  { textKey: 'p20', bem: '' },
  { textKey: 'p21', bem: '', extraCheck: 'labelGewechselt' },
  { textKey: 'p22', bem: '' },
  { textKey: 'p24', bem: '' },
  { textKey: 'p23', bem: '' },
];

const seite2Zeilen: Zeile[] = [];

const TOTAL_ZEILEN_COUNT = alleZeilen.length;

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
  zeilenState:   Array.from({ length: TOTAL_ZEILEN_COUNT }, () => ({ ck: 0 as CheckState, name: '', bem: '', value: '', extra: 0 as Ck2State })),
  material:      Array.from({ length: 15 }, emptyMaterial),
  istZustand:    { mengeHub: '', mischung: '', bemerkung: '' },
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

function calcNachtMin(tag: MontagTag): number {
  if (!tag.vonZeit || !tag.bisZeit) return 0;
  const [vh, vm] = tag.vonZeit.split(':').map(Number);
  const [bh, bm] = tag.bisZeit.split(':').map(Number);
  const von  = vh * 60 + vm;
  const bis  = bh * 60 + bm;
  if (bis <= von) return 0;
  const NACHT_START = 20 * 60;
  const NACHT_ENDE  =  6 * 60;
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
      const tmp = document.createElement('canvas');
      tmp.width = canvas.width; tmp.height = canvas.height;
      tmp.getContext('2d')!.drawImage(canvas, 0, 0);
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
      const ctx = canvas.getContext('2d')!;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
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
      <td style={cell}>
        <span dangerouslySetInnerHTML={{ __html: text }} />
        {zeile.hasInput && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, marginLeft: 6 }}>
            <input type="text" inputMode="decimal" value={state.value}
              onChange={e => onChange({ value: e.target.value })}
              style={{ width: 44, border: '1px solid #999', borderRadius: 2, fontSize: 8, textAlign: 'center', padding: '1px 2px', fontFamily: 'Arial', fontWeight: 'bold', background: '#fff' }} />
            <span style={{ fontSize: 7.5, color: '#666' }}>{zeile.inputUnit ? t[zeile.inputUnit] : t.labelMengeHubUnit}</span>
          </span>
        )}
        {zeile.extraCheck && (
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginLeft: 8, cursor: 'pointer', verticalAlign: 'middle' }}>
            <Ck2 state={state.extra} onChange={s => onChange({ extra: s })} />
            <span style={{ fontSize: 7.5, color: '#333' }}>{t[zeile.extraCheck]}</span>
          </label>
        )}
      </td>
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

  @media screen and (max-width: 600px) {
    .toolbar-title { display: none; }
    #page-wrapper  { padding: 4px !important; }
    .a4            { padding: 4mm 4mm !important; }
  }

  @media screen and (max-width: 900px) and (orientation: landscape) {
    .toolbar-title { display: none; }
    #page-wrapper  { padding: 4px !important; padding-left: max(4px, env(safe-area-inset-left)) !important; padding-right: max(4px, env(safe-area-inset-right)) !important; }
    .a4            { padding: 6mm 6mm !important; font-size: 90% !important; }
  }
`;

// ═══════════════════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════════════════

export default function WartungsprotokollDosieranlagen464() {
  const [lang, setLang] = useState<Lang>('de');
  const t: T = translations[lang];

  const [form, setForm] = useState<FormData>(initialForm());
  const [sigModal, setSigModal] = useState<{ show: boolean; key: 'sig-gerlieva' | 'sig-kunde'; label: string; existing?: string }>({ show: false, key: 'sig-gerlieva', label: '' });
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | ''; visible: boolean }>({ msg: '', type: '', visible: false });
  const [uploading, setUploading] = useState(false);
  const [toolbarHeight, setToolbarHeight] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const toolbarRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const importedData = localStorage.getItem('importedFormData');
    if (importedData) {
      try {
        const data = JSON.parse(importedData);
        applyFormData(data);
        localStorage.removeItem('importedFormData');
      } catch (err) {
        console.error('Fehler beim Laden importierter Daten:', err);
      }
    }
  }, []);

  useEffect(() => {
    const measure = () => { if (toolbarRef.current) setToolbarHeight(toolbarRef.current.offsetHeight); };
    measure();
    const observer = new ResizeObserver(() => measure());
    if (toolbarRef.current) observer.observe(toolbarRef.current);
    window.addEventListener('resize', measure);
    return () => { observer.disconnect(); window.removeEventListener('resize', measure); };
  }, []);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 2500);
  };

  const applyFormData = (data: Partial<FormData>) => {
    setForm(f => {
      const newState = {
        ...f,
        version:       data.version        ?? f.version,
        kunde:         data.kunde          ?? f.kunde,
        arbeitsplatz:  data.arbeitsplatz   ?? f.arbeitsplatz,
        dgm:           data.dgm            ?? f.dgm,
        position:      data.position       ?? f.position,
        maschinTyp:    data.maschinTyp     ?? f.maschinTyp,
        maschineNr:    data.maschineNr     ?? f.maschineNr,
        kom:           data.kom            ?? f.kom,
        baujahr:       data.baujahr        ?? f.baujahr,
        wartungDatum:  data.wartungDatum   ?? f.wartungDatum,
        nameGerlieva:  data.nameGerlieva   ?? f.nameGerlieva,
        nameKunde:     data.nameKunde      ?? f.nameKunde,
        signatureDate: data.signatureDate  ?? f.signatureDate,
        bemerkungen:   data.bemerkungen    ?? f.bemerkungen,
        massnahmen:    data.massnahmen     ?? f.massnahmen,
        signatures:    data.signatures     ?? f.signatures,
        monteure:      data.monteure       ?? f.monteure,
        zeilenState:   data.zeilenState    ?? f.zeilenState,
        material:      data.material       ?? f.material,
        istZustand:    data.istZustand     ?? f.istZustand,
      };
      return newState;
    });
  };

  const saveJson = () => {
    const json = JSON.stringify({ ...form, version: 1, ts: new Date().toISOString() }, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = buildFileName('json', form.maschineNr);
    a.click();
    URL.revokeObjectURL(url);
    showToast(t.toastDownloaded);
  };

  const loadJson = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string) as FormData;
        applyFormData(data);
        showToast(t.toastLoaded);
      } catch {
        showToast(t.toastInvalid, 'error');
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.onerror = () => showToast(`${t.toastLoadError}${reader.error?.message}`, 'error');
    reader.readAsText(file);
  };

  const shareJson = async () => {
    const json = JSON.stringify({ ...form, version: 1, ts: new Date().toISOString() }, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const file = new File([blob], buildFileName('json', form.maschineNr), { type: 'application/json' });
    if (navigator.share && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: t.labelWartungShare });
        showToast(t.toastSaved);
      } catch (err: unknown) {
        const error = err as Error;
        if (error.name !== 'AbortError') showToast(`${t.toastError}${error.message}`, 'error');
      }
    } else {
      saveJson();
    }
  };

  const handleUploadToStorage = async () => {
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showToast('Bitte zuerst anmelden', 'error');
        setUploading(false);
        return;
      }

      const jsonData = { ...form, version: 1, ts: new Date().toISOString() };
      const jsonStr = JSON.stringify(jsonData, null, 2);
      const fileName = buildFileName('json', form.maschineNr);
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(DOCUMENTS_BUCKET)
        .upload(filePath, new Blob([jsonStr], { type: 'application/json' }), { upsert: true });

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase
        .from(DOCUMENTS_TABLE)
        .upsert({
          file_path: filePath,
          file_name: fileName,
          file_type: 'application/json',
          user_id: user.id,
          metadata: { protocol_type: 'Wartungsprotokoll_Dosieranlagen_464', machine_nr: form.maschineNr || 'unbekannt' }
        }, { onConflict: 'file_path' });

      if (dbError) throw dbError;

      showToast('✅ In Storage gespeichert!', 'success');
    } catch (err: unknown) {
      showToast('Fehler beim Speichern: ' + (err as Error).message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const savePdf = () => {
    alert(t.pdfAlert);
    setTimeout(() => window.print(), 300);
  };

  const openSigModal = (key: 'sig-gerlieva' | 'sig-kunde', label: string) => {
    setSigModal({ show: true, key, label, existing: form.signatures[key] });
  };

  const closeSigModal = (dataUrl?: string) => {
    if (dataUrl && sigModal.key) {
      setForm(f => ({ ...f, signatures: { ...f.signatures, [sigModal.key]: dataUrl }, signatureDate: new Date().toLocaleDateString('de-DE') }));
    }
    setSigModal({ show: false, key: 'sig-gerlieva', label: '' });
  };

  const deleteSig = (key: 'sig-gerlieva' | 'sig-kunde') => {
    setForm(f => {
      const newSigs = { ...f.signatures };
      delete newSigs[key];
      return { ...f, signatures: newSigs };
    });
  };

  const tbtn = { background: '#3b5c8f', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 4, fontSize: 13, cursor: 'pointer', fontFamily: 'Arial, sans-serif', whiteSpace: 'nowrap' as const, display: 'inline-flex', alignItems: 'center', gap: 6 };
  const inp  = { fontFamily: 'Arial', fontSize: 11, padding: '2px 4px', border: '1px solid #aaa', borderRadius: 3 };

  return (
    <>
      <style>{printStyles}</style>
      <div className="no-print" ref={toolbarRef} style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999, background: '#1a2744', color: '#fff', padding: '6px 12px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
        <span className="toolbar-title" style={{ flex: '1 1 auto', fontWeight: 'bold', fontSize: 12, minWidth: 150 }}>{t.toolbarTitle}</span>
        <LangSwitcher current={lang} onChange={setLang} />
        <button onClick={() => window.location.href = '/'} style={{ ...tbtn, background: '#444' }}>{t.home}</button>
        <button onClick={loadJson}  style={tbtn}>{t.loadJson}</button>
        <button onClick={savePdf}   style={tbtn}>{t.savePdf}</button>
        <button onClick={handleUploadToStorage} disabled={uploading} style={tbtn}>{uploading ? '⏳ Lädt...' : t.shareJson}</button>
      </div>
      <input ref={fileInputRef} type="file" accept="application/json" style={{ display: 'none' }} onChange={handleFileChange} />
      <div id="page-wrapper" style={{ minHeight: '100vh', background: '#f9f9f9', padding: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, paddingTop: toolbarHeight + 12 }}>
        <div className="a4" style={{ width: 794, background: 'white', padding: '16mm', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontFamily: 'Arial, sans-serif', fontSize: 11, lineHeight: 1.4, color: '#000' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 8 }}>
            <tbody>
              <tr>
                <td style={{ textAlign: 'left', verticalAlign: 'middle' }}>
                  <div style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 2, color: '#1a2744' }}>{t.docTitle}</div>
                  <div style={{ fontSize: 9, color: '#555' }}>Dosieranlagen 464</div>
                </td>
                <td style={{ textAlign: 'right', verticalAlign: 'middle' }}>
                  <div style={{ fontWeight: 'bold', fontSize: 10, color: '#1a2744' }}>GERLIEVA Sprühtechnik GmbH</div>
                  <div style={{ fontSize: 8.5, color: '#555', lineHeight: 1.3 }}>
                    Gottfried-Schenker-Str. 1–3<br />
                    76646 Bruchsal<br />
                    +49 7251 9626-0
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <div style={{ borderTop: '2px solid #1a2744', marginBottom: 8 }} />
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 9.5, marginBottom: 8 }}>
            <tbody>
              <tr>
                <td style={{ width: '20%', fontWeight: 'bold', padding: '2px 4px' }}>{t.labelKunde}:</td>
                <td style={{ width: '30%', padding: '2px 0' }}><input type="text" value={form.kunde} onChange={e => setForm(f => ({ ...f, kunde: e.target.value }))} style={{ ...inp, width: '100%' }} /></td>
                <td style={{ width: '20%', fontWeight: 'bold', padding: '2px 4px', textAlign: 'right' }}>{t.labelMaschinTyp}:</td>
                <td style={{ width: '30%', padding: '2px 0' }}><input type="text" value={form.maschinTyp} onChange={e => setForm(f => ({ ...f, maschinTyp: e.target.value }))} style={{ ...inp, width: '100%' }} /></td>
              </tr>
              <tr>
                <td style={{ fontWeight: 'bold', padding: '2px 4px' }}>{t.labelArbeitsplatz}:</td>
                <td style={{ padding: '2px 0' }}><input type="text" value={form.arbeitsplatz} onChange={e => setForm(f => ({ ...f, arbeitsplatz: e.target.value }))} style={{ ...inp, width: '100%' }} /></td>
                <td style={{ fontWeight: 'bold', padding: '2px 4px', textAlign: 'right' }}>{t.labelMaschineNr}:</td>
                <td style={{ padding: '2px 0' }}><input type="text" value={form.maschineNr} onChange={e => setForm(f => ({ ...f, maschineNr: e.target.value }))} style={{ ...inp, width: '100%' }} /></td>
              </tr>
              <tr>
                <td style={{ fontWeight: 'bold', padding: '2px 4px' }}>{t.labelDgm}:</td>
                <td style={{ padding: '2px 0' }}><input type="text" value={form.dgm} onChange={e => setForm(f => ({ ...f, dgm: e.target.value }))} style={{ ...inp, width: '100%' }} /></td>
                <td style={{ fontWeight: 'bold', padding: '2px 4px', textAlign: 'right' }}>{t.labelKom}:</td>
                <td style={{ padding: '2px 0' }}><input type="text" value={form.kom} onChange={e => setForm(f => ({ ...f, kom: e.target.value }))} style={{ ...inp, width: '100%' }} /></td>
              </tr>
              <tr>
                <td style={{ fontWeight: 'bold', padding: '2px 4px' }}>{t.labelPosition}:</td>
                <td style={{ padding: '2px 0' }}><input type="text" value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))} style={{ ...inp, width: '100%' }} /></td>
                <td style={{ fontWeight: 'bold', padding: '2px 4px', textAlign: 'right' }}>{t.labelBaujahr}:</td>
                <td style={{ padding: '2px 0' }}><input type="text" value={form.baujahr} onChange={e => setForm(f => ({ ...f, baujahr: e.target.value }))} style={{ ...inp, width: '100%' }} /></td>
              </tr>
            </tbody>
          </table>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 9.5, marginBottom: 10 }}>
            <thead>
              <tr style={{ background: '#cfdff5' }}>
                <th style={{ border: '1px solid #000', padding: '3px 4px', textAlign: 'left', fontSize: 8.5 }}>{t.colPruefpunkt}</th>
                <th style={{ border: '1px solid #000', padding: '3px 4px', textAlign: 'center', fontSize: 8.5, width: 20 }}>{t.colOk}</th>
                <th style={{ border: '1px solid #000', padding: '3px 4px', textAlign: 'left', fontSize: 8.5, width: '16%' }}>{t.colName}</th>
                <th style={{ border: '1px solid #000', padding: '3px 4px', textAlign: 'left', fontSize: 8.5, width: '24%' }}>{t.colBemerkung}</th>
              </tr>
            </thead>
            <tbody>
              {alleZeilen.map((zeile, idx) => (
                <PruefZeile key={idx} zeile={zeile} state={form.zeilenState[idx]} onChange={upd => setForm(f => { const zs = [...f.zeilenState]; zs[idx] = { ...zs[idx], ...upd }; return { ...f, zeilenState: zs }; })} rowIndex={idx} t={t} />
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: 12, marginBottom: 8, fontWeight: 'bold', fontSize: 10, borderTop: '1px solid #999', paddingTop: 6 }}>{t.sectionMaterial}</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 8.5 }}>
            <thead>
              <tr style={{ background: '#e9ecef' }}>
                <th style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', width: '6%' }}>{t.thPos}</th>
                <th style={{ border: '1px solid #000', padding: '2px', textAlign: 'left' }}>{t.thBeschreibung}</th>
                <th style={{ border: '1px solid #000', padding: '2px', textAlign: 'left', width: '22%' }}>{t.thTeilenummer}</th>
                <th style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', width: '8%' }}>{t.thStk}</th>
              </tr>
            </thead>
            <tbody>
              {form.material.map((row, idx) => (
                <tr key={idx}>
                  <td style={{ border: '1px solid #000', padding: '1px 2px', textAlign: 'center' }}><input type="text" value={row.pos} onChange={e => setForm(f => { const mat = [...f.material]; mat[idx].pos = e.target.value; return { ...f, material: mat }; })} style={{ border: 'none', outline: 'none', width: '100%', fontSize: 8, textAlign: 'center', fontFamily: 'Arial', background: 'transparent' }} /></td>
                  <td style={{ border: '1px solid #000', padding: '1px 2px' }}><input type="text" value={row.beschreibung} onChange={e => setForm(f => { const mat = [...f.material]; mat[idx].beschreibung = e.target.value; return { ...f, material: mat }; })} style={{ border: 'none', outline: 'none', width: '100%', fontSize: 8, fontFamily: 'Arial', background: 'transparent' }} /></td>
                  <td style={{ border: '1px solid #000', padding: '1px 2px' }}><input type="text" value={row.teilenummer} onChange={e => setForm(f => { const mat = [...f.material]; mat[idx].teilenummer = e.target.value; return { ...f, material: mat }; })} style={{ border: 'none', outline: 'none', width: '100%', fontSize: 8, fontFamily: 'Arial', background: 'transparent' }} /></td>
                  <td style={{ border: '1px solid #000', padding: '1px 2px', textAlign: 'center' }}><input type="text" value={row.stk} onChange={e => setForm(f => { const mat = [...f.material]; mat[idx].stk = e.target.value; return { ...f, material: mat }; })} style={{ border: 'none', outline: 'none', width: '100%', fontSize: 8, textAlign: 'center', fontFamily: 'Arial', background: 'transparent' }} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="a4" style={{ width: 794, background: 'white', padding: '16mm', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontFamily: 'Arial, sans-serif', fontSize: 10, lineHeight: 1.4, color: '#000', paddingTop: 6 }}>
          <div style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 8, color: '#1a2744' }}>{t.sectionSign}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 9, fontWeight: 'bold', marginBottom: 4 }}>{t.sigGerlieva}</div>
              <SigPreview dataUrl={form.signatures['sig-gerlieva']} onClick={() => openSigModal('sig-gerlieva', t.sigGerlieva)} tapLabel={t.sigTap} />
              {form.signatures['sig-gerlieva'] && (
                <div style={{ marginTop: 4 }}>
                  <input type="text" placeholder={t.sigPlaceholderTech} value={form.nameGerlieva} onChange={e => setForm(f => ({ ...f, nameGerlieva: e.target.value }))} style={{ ...inp, width: 'calc(100% - 40px)', fontSize: 9 }} />
                  <button onClick={() => deleteSig('sig-gerlieva')} style={{ marginLeft: 4, padding: '2px 6px', fontSize: 9, background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 3, cursor: 'pointer' }}>{t.sigDelete}</button>
                </div>
              )}
            </div>
            <div>
              <div style={{ fontSize: 9, fontWeight: 'bold', marginBottom: 4 }}>{t.sigKunde}</div>
              <SigPreview dataUrl={form.signatures['sig-kunde']} onClick={() => openSigModal('sig-kunde', t.sigKunde)} tapLabel={t.sigTap} />
              {form.signatures['sig-kunde'] && (
                <div style={{ marginTop: 4 }}>
                  <input type="text" placeholder={t.sigPlaceholderKunde} value={form.nameKunde} onChange={e => setForm(f => ({ ...f, nameKunde: e.target.value }))} style={{ ...inp, width: 'calc(100% - 40px)', fontSize: 9 }} />
                  <button onClick={() => deleteSig('sig-kunde')} style={{ marginLeft: 4, padding: '2px 6px', fontSize: 9, background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 3, cursor: 'pointer' }}>{t.sigDelete}</button>
                </div>
              )}
            </div>
          </div>
          {form.signatureDate && (
            <div style={{ fontSize: 9, color: '#666', marginTop: 6 }}>
              {t.labelDatum} {form.signatureDate}
            </div>
          )}
        </div>
      </div>
      {sigModal.show && <SignatureModal label={sigModal.label} existing={sigModal.existing} onClose={closeSigModal} t={t} />}
      <Toast msg={toast.msg} type={toast.type} visible={toast.visible} />
    </>
  );
}