'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// ═══════════════════════════════════════════════════════════════════════════════
// Supabase
// ═══════════════════════════════════════════════════════════════════════════════
const DOCUMENTS_BUCKET = 'documents';
const DOCUMENTS_TABLE  = 'documents';

// ═══════════════════════════════════════════════════════════════════════════════
// Dokumenttyp – eindeutiges Kennzeichen in der JSON (zur Unterscheidung von z. B.
// Servicebericht-JSONs), wird beim Laden geprüft
// ═══════════════════════════════════════════════════════════════════════════════
const DOKUMENT_TYP = 'spruehkopfwartung' as const;

// ═══════════════════════════════════════════════════════════════════════════════
// i18n
// ═══════════════════════════════════════════════════════════════════════════════

type Lang = 'de' | 'en' | 'fr';

const translations = {
  de: {
    loadJson:       '📂 JSON laden',
    savePdf:        '⬇ Als PDF speichern',
    uploadJson:     '📤 In Storage speichern',
    uploadingJson:  '📤 Speichere …',
    saveJson:       '💾 JSON speichern',
    toolbarTitle:   'Wartungsprotokoll Sprühköpfe · GERLIEVA Sprühtechnik GmbH',
    pdfAlert:       'Im Druckdialog:\n1. Drucker → "Als PDF speichern"\n2. Weitere Einstellungen → "Hintergrundgrafiken" ✓ aktivieren\n3. Ränder auf "Minimal" setzen\n→ Dann sind alle Farben im PDF enthalten.',
    toastSaved:     '✅ JSON gespeichert!',
    toastDownloaded:'✅ JSON heruntergeladen!',
    toastLoaded:    '✅ Datei erfolgreich geladen!',
    toastInvalid:   'Ungültige JSON-Datei',
    toastWrongType: 'Diese JSON-Datei gehört zu einem anderen Protokolltyp (kein Sprühkopf-Wartungsprotokoll).',
    toastError:     'Fehler: ',
    toastLoadError: 'Fehler beim Laden: ',
    toastUploaded:  '✅ In Storage gespeichert!',
    toastUploadError: 'Fehler beim Hochladen: ',
    toastNotLoggedIn: 'Bitte zuerst anmelden.',
    docTitle:       'Wartungsprotokoll für Sprühköpfe',
    labelKunde:     'Kunde',
    labelKundenNr:  'Nr. vom Kunden',
    labelDgm:       'DGM',
    labelProtokollNr: 'Protokoll-Nr.',
    labelArtikelNr: 'Artikel-Nr. Sprühkopf',
    labelRegNr:     'Registrier-Nr.',
    labelKom:       'Kom.',
    labelWartungDatumHead: 'Wartungsdatum',
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
    sectionMaterial:'Ersatzteile + Zubehör (beim Kunden verblieben)',
    thPos:          'Pos.',
    thBeschreibung: 'Beschreibung',
    thTeilenummer:  'Teilenummer',
    thStk:          'Stk.',
    // Teile- und Registriernummern (Seite 1)
    sectionTeile:   'Teilenummern und Registriernummern',
    sectionMembrane:'Membrane und Flachdichtungen',
    thBezeichnung:  'Bezeichnung',
    thRegNr:        'Registrier-Nr.',
    btnZeileHinzu:  '+ Zeile',
    btnZeileEntf:   '− Zeile',
    // Spezialzeile 0: Medium-Versorgung / Filter
    versorgTitle:   'Medium-Versorgung:',
    versorgRingleitung: 'Ringleitung',
    versorgDosieranlage: 'Dosieranlage',
    versorgUnbekannt: 'Unbekannt',
    filterTitle:    'Medium-Filter:',
    filterVorhanden: 'vorhanden',
    filterManuell:  'manuell',
    filterAutomatisch: 'automatisch',
    // Spezialzeile 1: Ausgetauschte Teile
    tauschTitle:    'Ausgetauschte Teile:',
    tauschGetauscht: 'getauscht',
    tauschMembrane: 'Membrane (bei MMS: Membrane der Steuerventile)',
    tauschDichtungen: 'Dichtungen',
    tauschAvs:      'AVS / Steuerschläuche',
    tauschORinge:   'O-Ringe',
    // Spezialzeile 2: Dichtigkeitsprüfung
    dichtTitle:     'Dichtigkeitsprüfung:',
    dichtDicht:     'dicht',
    dichtBar:       'Bar',
    dichtSteuerluft: 'Steuerluft:',
    dichtSpruehluft: 'Sprühluft / Medium:',
    // Prüfpunkte
    p01: 'Erster Eindruck Sauberkeit / äußerer Zustand / Beschädigungen',
    p02: 'Wenn möglich manuell testen – kommen alle Kreise ?',
    p03: 'Alle Düsen schalten das Medium sofort u. gleichmäßig zu/ab<br/>Kein Nachsprühen',
    p04: 'Alle Düsen schalten die Luft sofort u. gleichmäßig zu/ab',
    p05: 'O-Ring- / Düsen-Sitze in Ordnung',
    p06: 'Sind die Steuerlufttaschen in Ordnung (ausgewaschen, Übergänge)',
    p07: 'Wechselkappen angezogen',
    p08: 'Kontermutter WK-Halter angezogen',
    p09: 'Rohr-in-Rohr-System geprüft',
    p10: 'O-Ringe – Überstand geprüft',
    p11: 'Sprühkopf, wenn möglich, auf Maschine getestet',
    pBem2: '<strong>Bemerkungen / Maßnahmen / Empfehlungen</strong>',
  },
  en: {
    loadJson:       '📂 Load JSON',
    savePdf:        '⬇ Save as PDF',
    uploadJson:     '📤 Save to storage',
    uploadingJson:  '📤 Saving …',
    saveJson:       '💾 Save JSON',
    toolbarTitle:   'Spray Head Maintenance Log · GERLIEVA Sprühtechnik GmbH',
    pdfAlert:       'In the print dialog:\n1. Printer → "Save as PDF"\n2. More settings → enable "Background graphics" ✓\n→ This ensures all colours appear in the PDF.',
    toastSaved:     '✅ JSON saved!',
    toastDownloaded:'✅ JSON downloaded!',
    toastLoaded:    '✅ File loaded successfully!',
    toastInvalid:   'Invalid JSON file',
    toastWrongType: 'This JSON file belongs to a different document type (not a spray head maintenance report).',
    toastError:     'Error: ',
    toastLoadError: 'Error loading file: ',
    toastUploaded:  '✅ Saved to storage!',
    toastUploadError: 'Error uploading: ',
    toastNotLoggedIn: 'Please sign in first.',
    docTitle:       'Spray Head Maintenance Log',
    labelKunde:     'Customer',
    labelKundenNr:  'Customer No.',
    labelDgm:       'DGM',
    labelProtokollNr: 'Protocol No.',
    labelArtikelNr: 'Spray Head Article No.',
    labelRegNr:     'Registration No.',
    labelKom:       'Com.',
    labelWartungDatumHead: 'Maintenance Date',
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
    sectionMaterial:'Spare Parts + Accessories (left with customer)',
    thPos:          'Pos.',
    thBeschreibung: 'Description',
    thTeilenummer:  'Part Number',
    thStk:          'Qty.',
    sectionTeile:   'Part Numbers and Registration Numbers',
    sectionMembrane:'Diaphragms and Flat Gaskets',
    thBezeichnung:  'Description',
    thRegNr:        'Reg. No.',
    btnZeileHinzu:  '+ Row',
    btnZeileEntf:   '− Row',
    versorgTitle:   'Medium supply:',
    versorgRingleitung: 'Ring line',
    versorgDosieranlage: 'Dosing unit',
    versorgUnbekannt: 'Unknown',
    filterTitle:    'Medium filter:',
    filterVorhanden: 'present',
    filterManuell:  'manual',
    filterAutomatisch: 'automatic',
    tauschTitle:    'Parts replaced:',
    tauschGetauscht: 'replaced',
    tauschMembrane: 'Diaphragm (MMS: control valve diaphragm)',
    tauschDichtungen: 'Seals',
    tauschAvs:      'AVS / control hoses',
    tauschORinge:   'O-rings',
    dichtTitle:     'Tightness test:',
    dichtDicht:     'tight',
    dichtBar:       'Bar',
    dichtSteuerluft: 'Control air:',
    dichtSpruehluft: 'Spray air / medium:',
    p01: 'First impression – cleanliness / external condition / damage',
    p02: 'If possible, test manually – do all circuits respond?',
    p03: 'All nozzles switch the medium on/off immediately and evenly<br/>No after-spray',
    p04: 'All nozzles switch the air on/off immediately and evenly',
    p05: 'O-ring / nozzle seats in order',
    p06: 'Are the control-air pockets in order (flushed, transitions)',
    p07: 'Interchangeable caps tightened',
    p08: 'Lock nut of cap holder tightened',
    p09: 'Pipe-in-pipe system checked',
    p10: 'O-rings – protrusion checked',
    p11: 'Spray head tested on machine, if possible',
    pBem2: '<strong>Remarks / Measures / Recommendations</strong>',
  },
  fr: {
    loadJson:       '📂 Charger JSON',
    savePdf:        '⬇ Enregistrer en PDF',
    uploadJson:     '📤 Enregistrer dans le stockage',
    uploadingJson:  '📤 Enregistrement …',
    saveJson:       '💾 Sauvegarder JSON',
    toolbarTitle:   'Protocole de maintenance têtes de pulvérisation · GERLIEVA Sprühtechnik GmbH',
    pdfAlert:       "Dans la boîte de dialogue d'impression :\n1. Imprimante → \"Enregistrer en PDF\"\n2. Paramètres → activer \"Graphiques d'arrière-plan\" ✓\n→ Toutes les couleurs apparaîtront dans le PDF.",
    toastSaved:     '✅ JSON enregistré !',
    toastDownloaded:'✅ JSON téléchargé !',
    toastLoaded:    '✅ Fichier chargé avec succès !',
    toastInvalid:   'Fichier JSON invalide',
    toastWrongType: "Ce fichier JSON appartient à un autre type de document (pas un protocole de maintenance de tête de pulvérisation).",
    toastError:     'Erreur : ',
    toastLoadError: 'Erreur de chargement : ',
    toastUploaded:  '✅ Enregistré dans le stockage !',
    toastUploadError: "Erreur lors de l'envoi : ",
    toastNotLoggedIn: "Merci de vous connecter d'abord.",
    docTitle:       'Protocole de maintenance des têtes de pulvérisation',
    labelKunde:     'Client',
    labelKundenNr:  'N° client',
    labelDgm:       'DGM',
    labelProtokollNr: 'N° protocole',
    labelArtikelNr: 'N° article tête de pulvérisation',
    labelRegNr:     "N° d'enregistrement",
    labelKom:       'Com.',
    labelWartungDatumHead: 'Date de maintenance',
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
    sectionMaterial:'Pièces de rechange + accessoires (restés chez le client)',
    thPos:          'Pos.',
    thBeschreibung: 'Description',
    thTeilenummer:  'N° de pièce',
    thStk:          'Qté.',
    sectionTeile:   "Numéros de pièces et numéros d'enregistrement",
    sectionMembrane:'Membranes et joints plats',
    thBezeichnung:  'Désignation',
    thRegNr:        "N° d'enr.",
    btnZeileHinzu:  '+ Ligne',
    btnZeileEntf:   '− Ligne',
    versorgTitle:   'Alimentation en produit :',
    versorgRingleitung: 'Conduite annulaire',
    versorgDosieranlage: 'Unité de dosage',
    versorgUnbekannt: 'Inconnu',
    filterTitle:    'Filtre produit :',
    filterVorhanden: 'présent',
    filterManuell:  'manuel',
    filterAutomatisch: 'automatique',
    tauschTitle:    'Pièces remplacées :',
    tauschGetauscht: 'remplacé',
    tauschMembrane: 'Membrane (MMS : membrane des vannes de commande)',
    tauschDichtungen: 'Joints',
    tauschAvs:      'AVS / flexibles de commande',
    tauschORinge:   'Joints toriques',
    dichtTitle:     "Contrôle d'étanchéité :",
    dichtDicht:     'étanche',
    dichtBar:       'Bar',
    dichtSteuerluft: 'Air de commande :',
    dichtSpruehluft: 'Air de pulvérisation / produit :',
    p01: 'Première impression – propreté / état extérieur / dommages',
    p02: 'Si possible, tester manuellement – tous les circuits réagissent-ils ?',
    p03: 'Toutes les buses coupent le produit immédiatement et uniformément<br/>Pas de post-pulvérisation',
    p04: "Toutes les buses coupent l'air immédiatement et uniformément",
    p05: 'Sièges de buses / joints toriques en bon état',
    p06: "Les poches d'air de commande sont-elles en bon état (rincées, transitions)",
    p07: 'Capuchons interchangeables serrés',
    p08: 'Contre-écrou du porte-capuchon serré',
    p09: 'Système tube-dans-tube vérifié',
    p10: 'Joints toriques – débordement vérifié',
    p11: 'Tête de pulvérisation testée sur machine, si possible',
    pBem2: '<strong>Remarques / Mesures / Recommandations</strong>',
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

interface TeilRow {
  pos: string; bezeichnung: string; teilenummer: string; registriernummer: string;
}

interface MembranRow {
  pos: string; stk: string; bezeichnung: string; teilenummer: string;
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
  dokumentTyp:   typeof DOKUMENT_TYP;
  version:       number;
  ts:            string;
  kunde:         string;
  kundenNr:      string;
  dgm:           string;
  protokollNr:   string;
  artikelNr:     string;
  regNr:         string;
  kom:           string;
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
  teile:         TeilRow[];
  membrane:      MembranRow[];
  versorgung:    { ringleitung: Ck2State; dosieranlage: Ck2State; unbekannt: Ck2State; filterVorhanden: Ck2State; filterManuell: Ck2State; filterAutomatisch: Ck2State };
  tausch:        { membrane: Ck2State; dichtungen: Ck2State; avs: Ck2State; oringe: Ck2State };
  dicht:         { steuerluftAktiv: Ck2State; steuerluftBar: string; spruehluftAktiv: Ck2State; spruehluftBar: string };
}

// ═══════════════════════════════════════════════════════════════════════════════
// Zeilen-Daten
// ═══════════════════════════════════════════════════════════════════════════════

// Seite 1: ALLE Prüfpunkte (p01–p11), ohne Unterteilung, + Spezialzeilen
const alleZeilen: Zeile[] = [
  { textKey: 'p01', bem: '' },
  { textKey: 'p02', bem: '' },
  { textKey: 'p03', bem: '' },
  { textKey: 'p04', bem: '' },
  { textKey: 'p05', bem: '' },
  { textKey: 'p06', bem: '' },
  { textKey: 'p07', bem: '' },
  { textKey: 'p08', bem: '' },
  { textKey: 'p09', bem: '' },
  { textKey: 'p10', bem: '' },
  { textKey: 'p11', bem: '' },
  // pBem2 = bem=null Zeile (nach den 3 Spezialzeilen gerendert), 4-zeiliges Textfeld
  { textKey: 'pBem2', bem: null },
];

// Seite 2: leer (Fuß + Unterschriften werden separat gerendert)
const seite2Zeilen: Zeile[] = [];

// Gesamtanzahl Zeilen für zeilenState-Array:
// alleZeilen.length + seite2Zeilen.length (inkl. null-Zeilen) + 3 Spezialzeilen
const TOTAL_ZEILEN_COUNT = alleZeilen.length + 3; // +3 für Spezialzeilen

const emptyTag      = (): MontagTag => ({ datum: '', vonZeit: '', bisZeit: '', pauseMin: '', tagTyp: '' });
const emptyMonteur  = (): Monteur  => ({ name: '', tage: [emptyTag()] });
const emptyMaterial = (): MaterialRow => ({ pos: '', beschreibung: '', teilenummer: '', stk: '' });
const emptyTeil     = (): TeilRow => ({ pos: '', bezeichnung: '', teilenummer: '', registriernummer: '' });
const emptyMembran  = (): MembranRow => ({ pos: '', stk: '', bezeichnung: '', teilenummer: '' });

const initialForm = (): FormData => ({
  dokumentTyp:   DOKUMENT_TYP,
  version:       1,
  ts:            '',
  kunde:         '',
  kundenNr:      '',
  dgm:           '',
  protokollNr:   '',
  artikelNr:     '',
  regNr:         '',
  kom:           '',
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
  teile:         Array.from({ length: 1 }, emptyTeil),
  membrane:      Array.from({ length: 1 }, emptyMembran),
  versorgung:    { ringleitung: 0, dosieranlage: 0, unbekannt: 0, filterVorhanden: 0, filterManuell: 0, filterAutomatisch: 0 },
  tausch:        { membrane: 0, dichtungen: 0, avs: 0, oringe: 0 },
  dicht:         { steuerluftAktiv: 0, steuerluftBar: '', spruehluftAktiv: 0, spruehluftBar: '' },
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

function buildFileName(ext: string, kennung: string): string {
  const nr = kennung.trim().replace(/[^a-zA-Z0-9_\-]/g, '_');
  const d  = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return (nr ? `Wartungsprotokoll_Spruehkopf_${nr}_${d}` : `Wartungsprotokoll_Spruehkopf_${d}`) + '.' + ext;
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
      {state === 1 ? '✓' : ' '}
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
        <td colSpan={4} style={{ ...cell }}>
          <span dangerouslySetInnerHTML={{ __html: text }} />
          <textarea value={state.bem} onChange={e => onChange({ bem: e.target.value })}
            rows={4}
            style={{ display: 'block', width: '100%', marginTop: 3, border: '1px solid #bbb', outline: 'none',
              fontFamily: 'Arial', fontSize: 8, background: 'transparent', padding: 3, boxSizing: 'border-box',
              resize: 'vertical' }} />
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