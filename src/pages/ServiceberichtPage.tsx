'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

// ═══════════════════════════════════════════════════════════════════════════════
// i18n – Übersetzungen / Translations / Traductions
// ═══════════════════════════════════════════════════════════════════════════════

type Lang = 'de' | 'en' | 'fr';

const translations = {
  de: {
    loadJson:             '📂 JSON laden',
    savePdf:              '⬇ Als PDF speichern',
    shareJson:            '📤 JSON teilen',
    saveJson:             '💾 JSON speichern',
    toolbarTitle:         'Servicebericht · GERLIEVA Sprühtechnik GmbH',
    home:                 '🏠 Home',
    pdfAlert:             'Im Druckdialog:\n1. Drucker → "Als PDF speichern"\n2. Weitere Einstellungen → "Hintergrundgrafiken" ✓ aktivieren\n→ Dann sind alle Farben im PDF enthalten.',
    toastSaved:           '✅ JSON gespeichert!',
    toastDownloaded:      '✅ JSON heruntergeladen!',
    toastLoaded:          '✅ Datei erfolgreich geladen!',
    toastInvalid:         'Ungültige JSON-Datei',
    toastError:           'Fehler: ',
    toastLoadError:       'Fehler beim Laden: ',
    docTitle:             'Servicebericht',
    sectionKunde:         'Kunde',
    sectionMaschine:      'Anlage',
    sectionArbeiten:      'Durchgeführte Arbeiten',
    sectionBemerkung:     'Beschreibung / Bemerkung',
    sectionMaterial:      'Material- und Teileliste',
    sectionSign:          'BESTÄTIGUNG / UNTERSCHRIFTEN',
    labelName:            'Name:',
    labelStrasse:         'Anschrift:',
    labelTelefon:         'Telefon:',
    labelReferenz:        'Referenz:',
    labelRechnungsnummer: 'Rechnungs-Nr.:',
    labelAnsprechpartner: 'Ansprechpartner:',
    labelTechniker:       'Servicetechniker:',
    thNr:                 'Nr.',
    thTyp:                'Typ',
    thMaschinenNr:        'Maschinen-Nr.',
    thKundenNr:           'Kunden-Nr.',
    thKomNr:              'Kom.-Nr.',
    arbMontage:           'Montage',
    arbInbetrieb:         'Inbetriebnahme',
    arbSoftware:          'Softwareupdate',
    arbWartung:           'Wartung',
    arbReparatur:         'Reparatur',
    thPos:                'Pos.',
    thBeschreibung:       'Beschreibung',
    thTeilenummer:        'Teilenummer',
    thStk:                'Stk.',
    sigGerlieva:          'Unterschrift GERLIEVA',
    sigKunde:             'Unterschrift Kunde',
    sigPlaceholderTech:   'Name Techniker',
    sigPlaceholderKunde:  'Name Kunde',
    sigDelete:            '✕ Löschen',
    sigLabel:             'Hier unterschreiben',
    sigClear:             '🗑 Löschen',
    sigCancel:            'Abbrechen',
    sigOk:                '✓ Bestätigen',
    sigTap:               'Tippen zum Unterschreiben',
    labelDatum:           'Datum:',
    labelGesamtAZ:        'gesamte Arbeitszeit:',
    thDatum:              'Datum',
    thAzVon:              'Arbeitszeit von',
    thAzBis:              'bis',
    thPause:              'Pause (Min)',
    btnTagHinzu:          '+ Tag',
    btnTagEntf2:          '− Tag',
    labelMonteur:         'Monteur',
    thTagTyp:             'Tagestyp',
    tagTypNormal:         '—',
    tagTypFeiertag:       'Feiertag',
    tagTypSamstag:        'Samstag',
    tagTypSonntag:        'Sonntag',
    tagTypNacht:          'Nachtstunden',
    sectionZeiten:        'Arbeitszeiten',
    sectionReise:         'Reisezeiten',
    reiseAnreise:         'Anreise',
    reiseAbreise:         'Abreise',
    reiseKm:              'KM gesamt:',
    reisePkw:             'PKW',
    reiseZug:             'Zug',
    reiseFlugzeug:        'Flugzeug',
    reiseLeihwagen:       'Leihwagen',
    labelGesamtRZ:        'gesamte Reisezeit:',
  },
  en: {
    loadJson:             '📂 Load JSON',
    savePdf:              '⬇ Save as PDF',
    shareJson:            '📤 Share JSON',
    saveJson:             '💾 Save JSON',
    toolbarTitle:         'Service Report · GERLIEVA Sprühtechnik GmbH',
    home:                 '🏠 Home',
    pdfAlert:             'In the print dialog:\n1. Printer → "Save as PDF"\n2. More settings → enable "Background graphics" ✓\n→ This ensures all colours appear in the PDF.',
    toastSaved:           '✅ JSON saved!',
    toastDownloaded:      '✅ JSON downloaded!',
    toastLoaded:          '✅ File loaded successfully!',
    toastInvalid:         'Invalid JSON file',
    toastError:           'Error: ',
    toastLoadError:       'Error loading file: ',
    docTitle:             'Service Report',
    sectionKunde:         'Customer',
    sectionMaschine:      'Plant',
    sectionArbeiten:      'Work Performed',
    sectionBemerkung:     'Description / Remarks',
    sectionMaterial:      'Materials & Parts List',
    sectionSign:          'CONFIRMATION / SIGNATURES',
    labelName:            'Name:',
    labelStrasse:         'Address:',
    labelTelefon:         'Phone:',
    labelReferenz:        'Reference:',
    labelRechnungsnummer: 'Invoice No.:',
    labelAnsprechpartner: 'Contact Person:',
    labelTechniker:       'Service Technician:',
    thNr:                 'No.',
    thTyp:                'Type',
    thMaschinenNr:        'Machine No.',
    thKundenNr:           'Customer No.',
    thKomNr:              'Com. No.',
    arbMontage:           'Assembly',
    arbInbetrieb:         'Commissioning',
    arbSoftware:          'Software Update',
    arbWartung:           'Maintenance',
    arbReparatur:         'Repair',
    thPos:                'Pos.',
    thBeschreibung:       'Description',
    thTeilenummer:        'Part Number',
    thStk:                'Qty.',
    sigGerlieva:          'Signature GERLIEVA',
    sigKunde:             'Customer Signature',
    sigPlaceholderTech:   'Technician Name',
    sigPlaceholderKunde:  'Customer Name',
    sigDelete:            '✕ Clear',
    sigLabel:             'Sign here',
    sigClear:             '🗑 Clear',
    sigCancel:            'Cancel',
    sigOk:                '✓ Confirm',
    sigTap:               'Tap to sign',
    labelDatum:           'Date:',
    labelGesamtAZ:        'total working time:',
    thDatum:              'Date',
    thAzVon:              'Working time from',
    thAzBis:              'to',
    thPause:              'Break (min)',
    btnTagHinzu:          '+ Day',
    btnTagEntf2:          '− Day',
    labelMonteur:         'Technician',
    thTagTyp:             'Day type',
    tagTypNormal:         '—',
    tagTypFeiertag:       'Holiday',
    tagTypSamstag:        'Saturday',
    tagTypSonntag:        'Sunday',
    tagTypNacht:          'Night hours',
    sectionZeiten:        'Working Times',
    sectionReise:         'Travel Times',
    reiseAnreise:         'Arrival',
    reiseAbreise:         'Departure',
    reiseKm:              'Total km:',
    reisePkw:             'Car',
    reiseZug:             'Train',
    reiseFlugzeug:        'Plane',
    reiseLeihwagen:       'Rental car',
    labelGesamtRZ:        'total travel time:',
  },
  fr: {
    loadJson:             '📂 Charger JSON',
    savePdf:              '⬇ Enregistrer en PDF',
    shareJson:            '📤 Partager JSON',
    saveJson:             '💾 Sauvegarder JSON',
    toolbarTitle:         'Rapport de service · GERLIEVA Sprühtechnik GmbH',
    home:                 '🏠 Accueil',
    pdfAlert:             "Dans la boîte de dialogue d'impression :\n1. Imprimante → \"Enregistrer en PDF\"\n2. Paramètres → activer \"Graphiques d'arrière-plan\" ✓\n→ Toutes les couleurs apparaîtront dans le PDF.",
    toastSaved:           '✅ JSON enregistré !',
    toastDownloaded:      '✅ JSON téléchargé !',
    toastLoaded:          '✅ Fichier chargé avec succès !',
    toastInvalid:         'Fichier JSON invalide',
    toastError:           'Erreur : ',
    toastLoadError:       'Erreur de chargement : ',
    docTitle:             'Rapport de service',
    sectionKunde:         'Client',
    sectionMaschine:      'Installation',
    sectionArbeiten:      'Travaux effectués',
    sectionBemerkung:     'Description / Remarques',
    sectionMaterial:      'Liste des matériaux et pièces',
    sectionSign:          'CONFIRMATION / SIGNATURES',
    labelName:            'Nom :',
    labelStrasse:         'Adresse :',
    labelTelefon:         'Téléphone :',
    labelReferenz:        'Référence :',
    labelRechnungsnummer: 'N° de facture :',
    labelAnsprechpartner: 'Personne de contact :',
    labelTechniker:       'Technicien de service :',
    thNr:                 'N°',
    thTyp:                'Type',
    thMaschinenNr:        'N° machine',
    thKundenNr:           'N° client',
    thKomNr:              'N° com.',
    arbMontage:           'Montage',
    arbInbetrieb:         'Mise en service',
    arbSoftware:          'Mise à jour logiciel',
    arbWartung:           'Maintenance',
    arbReparatur:         'Réparation',
    thPos:                'Pos.',
    thBeschreibung:       'Description',
    thTeilenummer:        'N° de pièce',
    thStk:                'Qté.',
    sigGerlieva:          'Signature GERLIEVA',
    sigKunde:             'Signature client',
    sigPlaceholderTech:   'Nom du technicien',
    sigPlaceholderKunde:  'Nom du client',
    sigDelete:            '✕ Effacer',
    sigLabel:             'Signer ici',
    sigClear:             '🗑 Effacer',
    sigCancel:            'Annuler',
    sigOk:                '✓ Confirmer',
    sigTap:               'Appuyer pour signer',
    labelDatum:           'Date :',
    labelGesamtAZ:        'temps de travail total :',
    thDatum:              'Date',
    thAzVon:              'Temps de travail de',
    thAzBis:              'à',
    thPause:              'Pause (min)',
    btnTagHinzu:          '+ Jour',
    btnTagEntf2:          '− Jour',
    labelMonteur:         'Technicien',
    thTagTyp:             'Type de jour',
    tagTypNormal:         '—',
    tagTypFeiertag:       'Jour férié',
    tagTypSamstag:        'Samedi',
    tagTypSonntag:        'Dimanche',
    tagTypNacht:          'Heures de nuit',
    sectionZeiten:        'Temps de travail',
    sectionReise:         'Temps de trajet',
    reiseAnreise:         'Arrivée',
    reiseAbreise:         'Départ',
    reiseKm:              'KM total :',
    reisePkw:             'Voiture',
    reiseZug:             'Train',
    reiseFlugzeug:        'Avion',
    reiseLeihwagen:       'Voiture de location',
    labelGesamtRZ:        'temps de trajet total :',
  },
} satisfies Record<Lang, Record<string, string>>;

type TKeys = keyof typeof translations['de'];
type T = Record<TKeys, string>;

// ═══════════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════════

interface MaschineRow {
  nr: string; typ: string; maschinenNr: string; kundenNr: string; komNr: string;
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
interface MaterialRow {
  pos: string; beschreibung: string; teilenummer: string; stk: string;
}
interface ReiseZeile {
  datum:    string;
  vonZeit:  string;
  bisZeit:  string;
  pauseMin: string;
  tagTyp:   '' | 'feiertag' | 'samstag' | 'sonntag';
}
interface FormData {
  version: number; ts: string;
  kundeName: string; kundeStrasse: string; kundeTelefon: string; kundeReferenz: string;
  kundeRechnungsnummer: string;
  ansprechpartner: string;
  servicetechniker: string;
  maschinen: MaschineRow[];
  arbeitenChecks: Record<string, boolean>;
  arbeitenSonstiges: string;
  monteure: Monteur[];
  material: MaterialRow[];
  // Reise (seit Version 2 – wird beim Laden älterer JSONs automatisch ergänzt)
  reiseAnreise:   ReiseZeile;
  reiseAbreise:   ReiseZeile;
  reiseKmGesamt:  string;
  reiseMittel:    Record<'pkw' | 'zug' | 'flugzeug' | 'leihwagen', boolean>;
  nameGerlieva: string; nameKunde: string; signatureDate: string;
  bemerkung: string;
  signatures: { 'sig-gerlieva'?: string; 'sig-kunde'?: string };
}

// ═══════════════════════════════════════════════════════════════════════════════
// Initial state
// ═══════════════════════════════════════════════════════════════════════════════

const emptyMaschine  = (): MaschineRow  => ({ nr: '', typ: '', maschinenNr: '', kundenNr: '', komNr: '' });
const emptyTag       = (): MontagTag    => ({ datum: '', vonZeit: '', bisZeit: '', pauseMin: '', tagTyp: '' });
const emptyMonteur   = (): Monteur      => ({ name: '', tage: [emptyTag()] });
const emptyMaterial  = (): MaterialRow  => ({ pos: '', beschreibung: '', teilenummer: '', stk: '' });
const emptyReise     = (): ReiseZeile   => ({ datum: '', vonZeit: '', bisZeit: '', pauseMin: '', tagTyp: '' });

const initialForm = (): FormData => ({
  version: 2, ts: '',
  kundeName: '', kundeStrasse: '', kundeTelefon: '', kundeReferenz: '',
  kundeRechnungsnummer: '',
  ansprechpartner: '',
  servicetechniker: '',
  maschinen: Array.from({ length: 6 }, emptyMaschine),
  arbeitenChecks: { Montage: false, Inbetriebnahme: false, Softwareupdate: false, Wartung: false, Reparatur: false },
  arbeitenSonstiges: '',
  monteure: [emptyMonteur()],
  material: Array.from({ length: 15 }, emptyMaterial),
  reiseAnreise:  emptyReise(),
  reiseAbreise:  emptyReise(),
  reiseKmGesamt: '',
  reiseMittel:   { pkw: false, zug: false, flugzeug: false, leihwagen: false },
  nameGerlieva: '', nameKunde: '', signatureDate: '',
  bemerkung: '',
  signatures: {},
});

// Checkbox keys are stored in German (stable internal keys), display label is derived from t[]
const ARBEITEN_KEYS = ['Montage', 'Inbetriebnahme', 'Softwareupdate', 'Wartung', 'Reparatur'] as const;
const ARBEITEN_TK: Record<string, TKeys> = { Montage: 'arbMontage', Inbetriebnahme: 'arbInbetrieb', Softwareupdate: 'arbSoftware', Wartung: 'arbWartung', Reparatur: 'arbReparatur' };

// ═══════════════════════════════════════════════════════════════════════════════
// Hilfsfunktionen Zeitberechnung
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

function calcReiseBreakdown(anreise: ReiseZeile, abreise: ReiseZeile, monteurAnzahl: number): { total: number; samstag: number; sonntag: number; feiertag: number; nacht: number } {
  const faktor = Math.max(1, monteurAnzahl || 1);
  let total = 0, samstag = 0, sonntag = 0, feiertag = 0, nacht = 0;
  [anreise, abreise].forEach(zeile => {
    const min = (() => {
      if (!zeile.vonZeit || !zeile.bisZeit) return 0;
      const [vh, vm] = zeile.vonZeit.split(':').map(Number);
      const [bh, bm] = zeile.bisZeit.split(':').map(Number);
      const diff = (bh * 60 + bm) - (vh * 60 + vm);
      const pause = parseInt(zeile.pauseMin) || 0;
      return diff > 0 ? diff - pause : 0;
    })();
    const gewichtet = min * faktor;
    total += gewichtet;
    if (zeile.tagTyp === 'samstag')  samstag  += gewichtet;
    if (zeile.tagTyp === 'sonntag')  sonntag  += gewichtet;
    if (zeile.tagTyp === 'feiertag') feiertag += gewichtet;
    nacht += calcNachtMin(zeile as unknown as MontagTag) * faktor;
  });
  return { total, samstag, sonntag, feiertag, nacht };
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
      {/* White diagonals */}
      <line x1="0" y1="0" x2="30" y2="20" stroke="#fff" strokeWidth="4"/>
      <line x1="30" y1="0" x2="0" y2="20" stroke="#fff" strokeWidth="4"/>
      {/* Red diagonals */}
      <line x1="0" y1="0" x2="30" y2="20" stroke="#C8102E" strokeWidth="2.4"/>
      <line x1="30" y1="0" x2="0" y2="20" stroke="#C8102E" strokeWidth="2.4"/>
      {/* White cross */}
      <rect x="12" y="0" width="6" height="20" fill="#fff"/>
      <rect y="7" width="30" height="6" fill="#fff"/>
      {/* Red cross */}
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
    const dpr = window.devicePixelRatio || 1;
    const scaleX = (c.width / dpr) / r.width;
    const scaleY = (c.height / dpr) / r.height;
    return { x: (src.clientX - r.left) * scaleX, y: (src.clientY - r.top) * scaleY };
  };
  const onStart = (e: React.MouseEvent | React.TouchEvent) => { e.preventDefault(); drawing.current = true; const c = canvasRef.current!; const ctx = c.getContext('2d')!; const p = getPos(e, c); ctx.beginPath(); ctx.moveTo(p.x, p.y); };
  const onMove  = (e: React.MouseEvent | React.TouchEvent) => { e.preventDefault(); if (!drawing.current) return; const c = canvasRef.current!; const ctx = c.getContext('2d')!; const p = getPos(e, c); ctx.lineTo(p.x, p.y); ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(); };
  const onStop  = () => { drawing.current = false; canvasRef.current?.getContext('2d')?.closePath(); };

  const tbtn = (bg: string): React.CSSProperties => ({
    background: bg, color: '#fff', border: 'none', padding: '10px 18px', borderRadius: 4,
    fontSize: 13, fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Arial, sans-serif',
    minHeight: 44, touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent',
  });

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: '#fff', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: '#1a2744', color: '#fff', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <span style={{ fontSize: 13, fontWeight: 'bold', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>✍️ {label}</span>
        <button onClick={() => { const c = canvasRef.current!; c.getContext('2d')!.clearRect(0, 0, c.width, c.height); }} style={tbtn('#e8460a')}>{t.sigClear}</button>
        <button onClick={() => onClose()} style={tbtn('#888')}>{t.sigCancel}</button>
        <button onClick={() => onClose(canvasRef.current?.toDataURL('image/png'))} style={tbtn('#2a7a2a')}>{t.sigOk}</button>
      </div>
      <div style={{ flex: 1, padding: 8, display: 'flex', alignItems: 'stretch', justifyContent: 'center', background: '#f0f0f0', overflow: 'hidden' }}>
        <canvas ref={canvasRef} width={400} height={200}
          style={{ background: 'white', border: '2px solid #aaa', borderRadius: 4, touchAction: 'none', cursor: 'crosshair', width: '100%', height: '100%', display: 'block' }}
          onMouseDown={onStart} onMouseMove={onMove} onMouseUp={onStop} onMouseLeave={onStop}
          onTouchStart={onStart} onTouchMove={onMove} onTouchEnd={onStop} />
      </div>
      <div style={{ textAlign: 'center', padding: '6px 0 max(6px, env(safe-area-inset-bottom))', fontSize: 11, color: '#666', flexShrink: 0 }}>{t.sigLabel}</div>
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
    const h = (parent ? parent.clientHeight : canvas.offsetHeight) || 80;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    const ctx = canvas.getContext('2d')!;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.scale(dpr, dpr);
    if (dataUrl) {
      const img = new Image(); img.onload = () => ctx.drawImage(img, 0, 0, w, h); img.src = dataUrl;
    } else {
      const fontSize = Math.max(12, Math.round(w * 0.045));
      ctx.fillStyle = '#bbb'; ctx.font = `${fontSize}px Arial`; ctx.textAlign = 'center';
      ctx.fillText(tapLabel, w / 2, h / 2 + fontSize * 0.35);
    }
  }, [dataUrl, tapLabel]);

  useEffect(() => {
    const t1 = setTimeout(redraw, 50);
    const t2 = setTimeout(redraw, 300);
    const ro = new ResizeObserver(() => redraw());
    if (canvasRef.current?.parentElement) ro.observe(canvasRef.current.parentElement);
    window.addEventListener('resize', redraw);
    return () => { clearTimeout(t1); clearTimeout(t2); ro.disconnect(); window.removeEventListener('resize', redraw); };
  }, [redraw]);

  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: '3/1' }}>
      <canvas ref={canvasRef} width={400} height={133} onClick={onClick}
        className="sig-canvas"
        style={{ border: '2px dashed #999', background: 'white', cursor: 'pointer', width: '100%', height: '100%', borderRadius: 3, display: 'block', touchAction: 'none', WebkitTapHighlightColor: 'transparent' }} />
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
// Main Component
// ═══════════════════════════════════════════════════════════════════════════════

export default function ServiceberichtPage() {
  const [lang, setLang] = useState<Lang>('de');
  const t = translations[lang] as T;

  const [form, setForm]         = useState<FormData>(initialForm);
  const [sigModal, setSigModal] = useState<{ id: 'sig-gerlieva' | 'sig-kunde'; label: string } | null>(null);
  const [toast, setToast]       = useState<{ msg: string; type: 'success' | 'error' | ''; visible: boolean }>({ msg: '', type: '', visible: false });
  const [toolbarH, setToolbarH] = useState(52);
  const fileInputRef  = useRef<HTMLInputElement>(null);
  const toolbarRef    = useRef<HTMLDivElement>(null);

  // Dynamisches marginTop: passt sich an wenn Toolbar durch Wrap höher wird
  useEffect(() => {
    const toolbar = toolbarRef.current; if (!toolbar) return;
    const ro = new ResizeObserver(() => setToolbarH(toolbar.offsetHeight));
    ro.observe(toolbar);
    return () => ro.disconnect();
  }, []);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type, visible: true });
    setTimeout(() => setToast(p => ({ ...p, visible: false })), 2500);
  };

  // ── Field helpers ──────────────────────────────────────────────────────────
  const setField     = <K extends keyof FormData>(key: K, val: FormData[K]) => setForm(f => ({ ...f, [key]: val }));
  const setMaschine  = (i: number, f: keyof MaschineRow, v: string) => setForm(s => { const m = [...s.maschinen]; m[i] = { ...m[i], [f]: v }; return { ...s, maschinen: m }; });
  const setMaterial  = (i: number, f: keyof MaterialRow, v: string) => setForm(s => { const m = [...s.material]; m[i] = { ...m[i], [f]: v }; return { ...s, material: m };  });
  const toggleCheck  = (group: 'arbeitenChecks', key: string) => setForm(s => ({ ...s, [group]: { ...s[group], [key]: !s[group][key] } }));

  // ── Reise helpers ──────────────────────────────────────────────────────────
  const setReiseZeile = (which: 'reiseAnreise' | 'reiseAbreise', key: keyof ReiseZeile, val: string) =>
    setForm(f => ({ ...f, [which]: { ...f[which], [key]: val } }));
  const toggleReiseMittel = (key: 'pkw' | 'zug' | 'flugzeug' | 'leihwagen') =>
    setForm(f => ({ ...f, reiseMittel: { ...f.reiseMittel, [key]: !f.reiseMittel[key] } }));

  // ── Monteur helpers ────────────────────────────────────────────────────────
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
            if (tag.tagTyp !== 'feiertag') updated.tagTyp = autoTyp as MontagTag['tagTyp'];
          }
          return updated;
        });
        return { ...mo, tage };
      });
      return { ...f, monteure: m };
    });

  const addMonteur    = () => setForm(f => ({ ...f, monteure: [...f.monteure, emptyMonteur()] }));
  const removeMonteur = () => setForm(f => f.monteure.length <= 1 ? f : { ...f, monteure: f.monteure.slice(0, -1) });
  const addTag        = (mi: number) => setForm(f => { const m = f.monteure.map((mo, i) => i === mi ? { ...mo, tage: [...mo.tage, emptyTag()] } : mo); return { ...f, monteure: m }; });
  const removeTag     = (mi: number, ti: number) => setForm(f => { const m = f.monteure.map((mo, i) => { if (i !== mi || mo.tage.length <= 1) return mo; return { ...mo, tage: mo.tage.filter((_, j) => j !== ti) }; }); return { ...f, monteure: m }; });

  // ── Computed ───────────────────────────────────────────────────────────────
  const gesamtBreakdown = calcGesamtBreakdown(form.monteure);
  const gesamtAZ        = formatMin(gesamtBreakdown.total);
  const monteurAnzahl   = Math.max(1, form.monteure.length);
  const reiseBreakdown  = calcReiseBreakdown(form.reiseAnreise, form.reiseAbreise, monteurAnzahl);
  const gesamtRZ        = formatMin(reiseBreakdown.total);

  // ── File name ──────────────────────────────────────────────────────────────
  const getFileName = (ext: string) => {
    const kunde = (form.kundeName || '').trim().replace(/[^a-zA-Z0-9_\-]/g, '_');
    const datum = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    return (kunde ? `Servicebericht_${kunde}_${datum}` : `Servicebericht_${datum}`) + '.' + ext;
  };

  // ── JSON I/O ───────────────────────────────────────────────────────────────
  const collectFormData = () => ({ ...form, ts: new Date().toISOString() });
  const applyFormData   = (data: FormData) => {
    if (!data || (data.version !== 1 && data.version !== 2)) { showToast(t.toastInvalid, 'error'); return; }
    // Migration: ältere Dateien (version 1) haben keine Reisefelder → mit Leerfeldern ergänzen
    const migrated: FormData = {
      reiseAnreise:  { datum: '', vonZeit: '', bisZeit: '', pauseMin: '', tagTyp: '' as const },
      reiseAbreise:  { datum: '', vonZeit: '', bisZeit: '', pauseMin: '', tagTyp: '' as const },
      reiseKmGesamt: '',
      reiseMittel:   { pkw: false, zug: false, flugzeug: false, leihwagen: false },
      kundeRechnungsnummer: '',
      ...data,
      version: 2,
    };
    setForm(migrated);
    showToast(t.toastLoaded, 'success');
  };

  // ── Toolbar actions ────────────────────────────────────────────────────────
  const handleSave = () => {
    try {
      const blob = new Blob([JSON.stringify(collectFormData(), null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = getFileName('json');
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      showToast(t.toastSaved, 'success');
    } catch (err: unknown) { showToast(t.toastError + (err as Error).message, 'error'); }
  };

  const handleShare = async () => {
    const jsonStr = JSON.stringify(collectFormData(), null, 2);
    const fileName = getFileName('json').replace(/\.json$/, '.txt');
    const blob = new Blob([jsonStr], { type: 'text/plain' });
    const file = new File([blob], fileName, { type: 'text/plain' });
    try {
      if (typeof navigator.share === 'function' && typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
        await navigator.share({ title: 'Servicebericht GERLIEVA', files: [file] });
        return;
      }
    } catch (e) {
      if ((e as Error).name === 'AbortError') return;
    }
    // Fallback: Download als .json
    const url = URL.createObjectURL(new Blob([jsonStr], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = getFileName('json');
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    showToast(t.toastDownloaded, 'success');
  };

  const handlePdf  = () => { alert(t.pdfAlert); window.print(); };

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

  const s = styles;

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{printStyles}</style>

      {/* ── Toolbar ── */}
      <div ref={toolbarRef} style={s.toolbar} className="no-print">
        <button onClick={() => fileInputRef.current?.click()} style={{ ...s.tbtn, background: '#8e24aa' }}>{t.loadJson}</button>
        <button onClick={handlePdf}   style={{ ...s.tbtn, background: '#e8460a' }}>{t.savePdf}</button>
        <button onClick={handleShare} style={{ ...s.tbtn, background: '#1a7a3a' }}>{t.shareJson}</button>
        <button onClick={handleSave}  style={{ ...s.tbtn, background: '#1a5fa8' }}>{t.saveJson}</button>
        <span style={{ color: '#a8b8d8', fontSize: 9, display: 'none' }} className="toolbar-title">{t.toolbarTitle}</span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <LangSwitcher current={lang} onChange={setLang} />
          <a href="/" style={{ ...s.tbtn, background: '#1a5fa8', textDecoration: 'none' }}>{t.home}</a>
        </div>
        <input ref={fileInputRef} type="file" accept=".json,.txt" style={{ display: 'none' }} onChange={handleLoad} />
      </div>

      {/* ── Page body ── */}
      <div style={{ ...s.body, paddingTop: toolbarH + 12 }} className="print-body">
        <div style={s.container} className="print-container">
          {/* Header */}
          <div style={s.header}>
            <h1 style={{ fontSize: 16, fontWeight: 'bold' }}>GERLIEVA Sprühtechnik GmbH</h1>
            <p style={{ fontSize: 9, color: '#666' }}>Tiergartenstraße 8 · 79423 Heitersheim · Tel. +49 7634 56912-0</p>
          </div>
          <h2 style={{ fontSize: 18, marginBottom: 15, background: 'transparent', padding: 0 }}>{t.docTitle}</h2>

          {/* ── Kunde ── */}
          <div style={s.section}>
            <h2 style={s.sectionTitle}>{t.sectionKunde}</h2>
            {([
              ['kundeName',     t.labelName],
              ['kundeStrasse',  t.labelStrasse],
              ['kundeTelefon',  t.labelTelefon],
            ] as [keyof FormData, string][]).map(([key, label]) => (
              <div key={key} style={s.gridRow}>
                <span style={s.label}>{label}</span>
                <input type="text" value={form[key] as string} onChange={e => setField(key, e.target.value)} style={s.gridInput} />
              </div>
            ))}
            {/* Referenz + Rechnungsnummer nebeneinander */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 6 }}>
              <div style={{ ...s.gridRow, flex: '1 1 180px', marginBottom: 0 }}>
                <span style={s.label}>{t.labelReferenz}</span>
                <input type="text" value={form.kundeReferenz} onChange={e => setField('kundeReferenz', e.target.value)} style={s.gridInput} />
              </div>
              <div style={{ ...s.gridRow, flex: '1 1 180px', marginBottom: 0 }}>
                <span style={s.label}>{t.labelRechnungsnummer}</span>
                <input type="text" value={form.kundeRechnungsnummer} onChange={e => setField('kundeRechnungsnummer', e.target.value)} style={s.gridInput} />
              </div>
            </div>
          </div>

          {/* ── Ansprechpartner + Servicetechniker ── */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 10, flexWrap: 'wrap' }}>
            <div style={{ ...s.inlineField, flex: '1 1 200px' }}>
              <label style={s.label}>{t.labelAnsprechpartner}</label>
              <input type="text" value={form.ansprechpartner} onChange={e => setField('ansprechpartner', e.target.value)} style={{ ...s.gridInput, flex: 1 }} />
            </div>
            <div style={{ ...s.inlineField, flex: '1 1 200px' }}>
              <label style={s.label}>{t.labelTechniker}</label>
              <input type="text" value={form.servicetechniker} onChange={e => setField('servicetechniker', e.target.value)} style={{ ...s.gridInput, flex: 1 }} />
            </div>
          </div>

          {/* ── Maschine ── */}
          <div style={s.section}>
            <h2 style={s.sectionTitle}>{t.sectionMaschine}</h2>
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table style={s.table}>
                <thead>
                  <tr>{[t.thNr, t.thTyp, t.thMaschinenNr, t.thKundenNr, t.thKomNr].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {form.maschinen.map((row, i) => (
                    <tr key={i}>
                      {(['nr', 'typ', 'maschinenNr', 'kundenNr', 'komNr'] as (keyof MaschineRow)[]).map(f => (
                        <td key={f} style={s.td}><input type="text" value={row[f]} onChange={e => setMaschine(i, f, e.target.value)} style={s.cellInput} /></td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Durchgeführte Arbeiten ── */}
          <div style={s.section}>
            <h2 style={s.sectionTitle}>{t.sectionArbeiten}</h2>
            <div style={s.checkboxList}>
              {ARBEITEN_KEYS.map(k => (
                <label key={k} style={s.checkboxItem}>
                  <input type="checkbox" checked={form.arbeitenChecks[k]} onChange={() => toggleCheck('arbeitenChecks', k)}
                    style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#1a5fa8' }} />
                  {' '}{t[ARBEITEN_TK[k]]}
                </label>
              ))}
            </div>
            <input type="text" value={form.arbeitenSonstiges} onChange={e => setField('arbeitenSonstiges', e.target.value)}
              style={{ width: '100%', border: '1px solid #ddd', padding: '8px 6px', borderRadius: 4, marginTop: 8, fontSize: 16, fontFamily: 'Arial, sans-serif', boxSizing: 'border-box', color: '#000' }} />
          </div>

          {/* ── Beschreibung / Bemerkung ── */}
          <div style={s.section}>
            <h2 style={s.sectionTitle}>{t.sectionBemerkung}</h2>
            <textarea
              value={form.bemerkung}
              onChange={e => setField('bemerkung', e.target.value)}
              rows={10}
              style={{
                width: '100%',
                resize: 'vertical',
                border: '1px solid #ddd',
                borderRadius: 4,
                padding: 8,
                fontSize: 16,
                fontFamily: 'Arial, sans-serif',
                lineHeight: 1.6,
                boxSizing: 'border-box',
                background: 'white',
                color: '#000',
              }}
            />
          </div>

          {/* ── Material ── */}
          <div className="page-break-before" style={{ pageBreakBefore: 'always', breakBefore: 'page' }}>
            <div style={s.section}>
              <h2 style={s.sectionTitle}>{t.sectionMaterial}</h2>
              <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <table style={s.table}>
                  <thead>
                    <tr>
                      <th style={{ ...s.th, width: 60 }}>{t.thPos}</th>
                      <th style={s.th}>{t.thBeschreibung}</th>
                      <th style={{ ...s.th, width: 120 }}>{t.thTeilenummer}</th>
                      <th style={{ ...s.th, width: 60 }}>{t.thStk}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.material.map((row, i) => (
                      <tr key={i}>
                        {(['pos', 'beschreibung', 'teilenummer', 'stk'] as (keyof MaterialRow)[]).map(f => (
                          <td key={f} style={s.td}><input type="text" value={row[f]} onChange={e => setMaterial(i, f, e.target.value)} style={s.cellInput} /></td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ── Zeitenerfassung ── */}
          <div style={{ ...s.section, marginTop: 20 }}>
            <h2 style={s.sectionTitle}>{t.sectionZeiten}</h2>

            {/* Monteur-Stepper */}
            <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 'bold' }}>{t.labelMonteur}:</span>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #aaa', borderRadius: 6, overflow: 'hidden' }}>
                <button onClick={removeMonteur} disabled={form.monteure.length <= 1}
                  style={{ width: 40, height: 36, fontSize: 20, lineHeight: 1, border: 'none', borderRight: '1px solid #aaa',
                    background: form.monteure.length > 1 ? '#fdd' : '#eee',
                    color: form.monteure.length > 1 ? '#900' : '#aaa',
                    cursor: form.monteure.length > 1 ? 'pointer' : 'default', fontFamily: 'Arial',
                    touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}>−</button>
                <span style={{ minWidth: 36, textAlign: 'center', fontSize: 14, fontWeight: 'bold', padding: '0 8px', userSelect: 'none' }}>
                  {form.monteure.length}
                </span>
                <button onClick={addMonteur}
                  style={{ width: 40, height: 36, fontSize: 20, lineHeight: 1, border: 'none', borderLeft: '1px solid #aaa',
                    background: '#e8f0ff', color: '#226', cursor: 'pointer', fontFamily: 'Arial',
                    touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}>+</button>
              </div>
            </div>

            {form.monteure.map((monteur, mi) => {
              const monteurTotal = monteur.tage.reduce((sum, tag) => sum + calcNettoMin(tag), 0);
              return (
                <div key={mi} style={{ marginBottom: 8, border: '1px solid #ccc', borderRadius: 4 }}>
                  {/* Monteur-Kopfzeile */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#cfdff5', padding: '4px 8px', borderBottom: '1px solid #ccc', borderRadius: '4px 4px 0 0' }}>
                    <strong style={{ fontSize: 10, whiteSpace: 'nowrap' }}>{t.labelMonteur} {mi + 1}:</strong>
                    <input type="text" value={monteur.name} onChange={e => setMonteurName(mi, e.target.value)}
                      style={{ flex: 1, border: 'none', borderBottom: '1px solid #666', outline: 'none', fontFamily: 'Arial, sans-serif', fontSize: 10, fontWeight: 'bold', background: 'transparent', padding: '1px 2px', color: '#000' }} />
                    {monteurTotal > 0 && (
                      <span style={{ fontSize: 9, fontWeight: 'bold', background: '#e8f4e8', padding: '1px 6px', borderRadius: 3, border: '1px solid #aaa', whiteSpace: 'nowrap' }}>
                        Σ {formatMin(monteurTotal)}
                      </span>
                    )}
                  </div>

                  {/* Tageszeilen – Tabelle auf Desktop, Cards auf Mobile */}
                  <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                    {/* Desktop-Tabelle (ab 600px) */}
                    <table className="zeit-table" style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' as const }}>
                      <colgroup>
                        <col style={{ width: '18%' }} />
                        <col style={{ width: '14%' }} />
                        <col style={{ width: '14%' }} />
                        <col style={{ width: '12%' }} />
                        <col style={{ width: '17%' }} />
                        <col style={{ width: '25%' }} />
                      </colgroup>
                      {mi === 0 && (
                        <thead>
                          <tr>
                            <th style={{ ...s.th, fontSize: 9 }}>{t.thDatum}</th>
                            <th style={{ ...s.th, fontSize: 9 }}>{t.thAzVon}</th>
                            <th style={{ ...s.th, fontSize: 9 }}>{t.thAzBis}</th>
                            <th style={{ ...s.th, fontSize: 9 }}>{t.thPause}</th>
                            <th style={{ ...s.th, fontSize: 9, background: '#d0ecd0' }}>{t.labelGesamtAZ}</th>
                            <th style={{ ...s.th, fontSize: 9 }}>{t.thTagTyp}</th>
                          </tr>
                        </thead>
                      )}
                      <tbody>
                        {monteur.tage.map((tag, ti) => {
                          const netto = calcNettoMin(tag);
                          const bgMap: Record<string, string> = { '': ti % 2 === 0 ? '#fff' : '#f8f8f8', feiertag: '#fff3cd', samstag: '#ddeeff', sonntag: '#fde8e8' };
                          return (
                            <tr key={ti} style={{ background: bgMap[tag.tagTyp] ?? (ti % 2 === 0 ? '#fff' : '#f8f8f8') }}>
                              <td style={s.td} data-label={t.thDatum}>
                                <input type="date" value={tag.datum} onChange={e => setMontagTag(mi, ti, 'datum', e.target.value)}
                                  style={{ ...s.cellInput, fontSize: 14, cursor: 'pointer', colorScheme: 'light', touchAction: 'manipulation' }} />
                              </td>
                              <td style={{ ...s.td, textAlign: 'center' }} data-label={t.thAzVon}>
                                <input type="time" value={tag.vonZeit} onChange={e => setMontagTag(mi, ti, 'vonZeit', e.target.value)}
                                  style={{ ...s.cellInput, textAlign: 'center', fontSize: 14, cursor: 'pointer', colorScheme: 'light', touchAction: 'manipulation' }} />
                              </td>
                              <td style={{ ...s.td, textAlign: 'center' }} data-label={t.thAzBis}>
                                <input type="time" value={tag.bisZeit} onChange={e => setMontagTag(mi, ti, 'bisZeit', e.target.value)}
                                  style={{ ...s.cellInput, textAlign: 'center', fontSize: 14, cursor: 'pointer', colorScheme: 'light', touchAction: 'manipulation' }} />
                              </td>
                              <td style={{ ...s.td, textAlign: 'center' }} data-label={t.thPause}>
                                <input type="number" min={0} value={tag.pauseMin} onChange={e => setMontagTag(mi, ti, 'pauseMin', e.target.value)}
                                  style={{ ...s.cellInput, textAlign: 'center', fontSize: 14, touchAction: 'manipulation' }} />
                              </td>
                              <td style={{ ...s.td, textAlign: 'center', fontWeight: 'bold', background: ti % 2 === 0 ? '#e8f4e8' : '#daeeda', fontSize: 11 }} data-label={t.labelGesamtAZ}>
                                {formatMin(netto)}
                              </td>
                              <td style={{ ...s.td, padding: 2 }} data-label={t.thTagTyp}>
                                <select value={tag.tagTyp} onChange={e => setMontagTag(mi, ti, 'tagTyp', e.target.value)}
                                  style={{ width: '100%', border: 'none', outline: 'none', fontFamily: 'Arial, sans-serif', fontSize: 13, background: bgMap[tag.tagTyp] ?? 'transparent', cursor: 'pointer', padding: '2px 2px', borderRadius: 2, color: '#000', touchAction: 'manipulation' }}>
                                  <option value="">{t.tagTypNormal}</option>
                                  <option value="feiertag">{t.tagTypFeiertag}</option>
                                  <option value="samstag">{t.tagTypSamstag}</option>
                                  <option value="sonntag">{t.tagTypSonntag}</option>
                                </select>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* + Tag / - Tag Buttons */}
                  <div className="no-print" style={{ padding: '6px 8px', display: 'flex', gap: 6 }}>
                    <button onClick={() => addTag(mi)}
                      style={{ fontSize: 12, padding: '6px 16px', background: '#e8f0ff', border: '1px solid #99b', borderRadius: 4, cursor: 'pointer', fontFamily: 'Arial, sans-serif', minHeight: 36, touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}>
                      {t.btnTagHinzu}
                    </button>
                    <button onClick={() => removeTag(mi, monteur.tage.length - 1)} disabled={monteur.tage.length <= 1}
                      style={{ fontSize: 12, padding: '6px 16px', background: monteur.tage.length > 1 ? '#fdd' : '#eee', border: '1px solid #bbb', borderRadius: 4, cursor: monteur.tage.length > 1 ? 'pointer' : 'default', color: monteur.tage.length > 1 ? '#900' : '#999', fontFamily: 'Arial, sans-serif', minHeight: 36, touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}>
                      {t.btnTagEntf2}
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Gesamt-Summe */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, marginTop: 6, padding: '6px 10px', border: '1px solid #aaa', borderRadius: 4, background: '#f7f7f7' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <strong style={{ fontSize: 10 }}>{t.labelGesamtAZ}</strong>
                <span style={{ fontWeight: 'bold', fontSize: 11, background: '#e8f4e8', padding: '2px 10px', borderRadius: 3, border: '1px solid #aaa' }}>
                  {gesamtAZ}
                </span>
              </div>
              {gesamtBreakdown.samstag > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 9, color: '#555' }}>{t.tagTypSamstag}:</span>
                  <span style={{ fontWeight: 'bold', fontSize: 10, background: '#ddeeff', padding: '2px 8px', borderRadius: 3, border: '1px solid #99bbdd' }}>{formatMin(gesamtBreakdown.samstag)}</span>
                </div>
              )}
              {gesamtBreakdown.sonntag > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 9, color: '#555' }}>{t.tagTypSonntag}:</span>
                  <span style={{ fontWeight: 'bold', fontSize: 10, background: '#fde8e8', padding: '2px 8px', borderRadius: 3, border: '1px solid #ddaaaa' }}>{formatMin(gesamtBreakdown.sonntag)}</span>
                </div>
              )}
              {gesamtBreakdown.feiertag > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 9, color: '#555' }}>{t.tagTypFeiertag}:</span>
                  <span style={{ fontWeight: 'bold', fontSize: 10, background: '#fff3cd', padding: '2px 8px', borderRadius: 3, border: '1px solid #ddcc88' }}>{formatMin(gesamtBreakdown.feiertag)}</span>
                </div>
              )}
              {gesamtBreakdown.nacht > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 9, color: '#555' }}>{t.tagTypNacht}:</span>
                  <span style={{ fontWeight: 'bold', fontSize: 10, background: '#e8e0f8', padding: '2px 8px', borderRadius: 3, border: '1px solid #aa99cc' }}>{formatMin(gesamtBreakdown.nacht)}</span>
                </div>
              )}
            </div>
          </div>

          {/* ── Reise / Fahrt ── */}
          <div style={{ ...s.section, marginTop: 20 }}>
            <h2 style={s.sectionTitle}>{t.sectionReise}</h2>

            {/* Reise-Tabelle: fix 2 Zeilen (Anreise / Abreise) */}
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table className="zeit-table" style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' as const }}>
                <colgroup>
                  <col style={{ width: '18%' }} />
                  <col style={{ width: '14%' }} />
                  <col style={{ width: '14%' }} />
                  <col style={{ width: '12%' }} />
                  <col style={{ width: '17%' }} />
                  <col style={{ width: '25%' }} />
                </colgroup>
                <thead>
                  <tr>
                    <th style={{ ...s.th, fontSize: 9 }}>{t.thDatum}</th>
                    <th style={{ ...s.th, fontSize: 9 }}>{t.thAzVon}</th>
                    <th style={{ ...s.th, fontSize: 9 }}>{t.thAzBis}</th>
                    <th style={{ ...s.th, fontSize: 9 }}>{t.thPause}</th>
                    <th style={{ ...s.th, fontSize: 9, background: '#d0ecd0' }}>{t.labelGesamtAZ}</th>
                    <th style={{ ...s.th, fontSize: 9 }}>{t.thTagTyp}</th>
                  </tr>
                </thead>
                <tbody>
                  {([
                    ['reiseAnreise', t.reiseAnreise],
                    ['reiseAbreise', t.reiseAbreise],
                  ] as Array<['reiseAnreise' | 'reiseAbreise', string]>).map(([which, rowLabel]) => {
                    const zeile = form[which] as ReiseZeile;
                    const bgMap: Record<string, string> = { '': '#fff', feiertag: '#fff3cd', samstag: '#ddeeff', sonntag: '#fde8e8' };
                    const bg = bgMap[zeile.tagTyp] ?? '#fff';
                    const netto = (() => {
                      if (!zeile.vonZeit || !zeile.bisZeit) return 0;
                      const [vh, vm] = zeile.vonZeit.split(':').map(Number);
                      const [bh, bm] = zeile.bisZeit.split(':').map(Number);
                      const diff = (bh * 60 + bm) - (vh * 60 + vm);
                      const pause = parseInt(zeile.pauseMin) || 0;
                      return diff > 0 ? diff - pause : 0;
                    })() * monteurAnzahl;
                    return (
                      <tr key={which} style={{ background: bg }}>
                        <td style={{ ...s.td, padding: '2px 4px' }} data-label={t.thDatum}>
                          <div style={{ fontWeight: 'bold', fontSize: 9, color: '#555', marginBottom: 1 }}>{rowLabel}</div>
                          <input type="date" value={zeile.datum}
                            onChange={e => setReiseZeile(which, 'datum', e.target.value)}
                            style={{ ...s.cellInput, fontSize: 13, cursor: 'pointer', colorScheme: 'light', touchAction: 'manipulation' }} />
                        </td>
                        <td style={{ ...s.td, textAlign: 'center' }} data-label={t.thAzVon}>
                          <input type="time" value={zeile.vonZeit}
                            onChange={e => setReiseZeile(which, 'vonZeit', e.target.value)}
                            style={{ ...s.cellInput, textAlign: 'center', fontSize: 14, cursor: 'pointer', colorScheme: 'light', touchAction: 'manipulation' }} />
                        </td>
                        <td style={{ ...s.td, textAlign: 'center' }} data-label={t.thAzBis}>
                          <input type="time" value={zeile.bisZeit}
                            onChange={e => setReiseZeile(which, 'bisZeit', e.target.value)}
                            style={{ ...s.cellInput, textAlign: 'center', fontSize: 14, cursor: 'pointer', colorScheme: 'light', touchAction: 'manipulation' }} />
                        </td>
                        <td style={{ ...s.td, textAlign: 'center' }} data-label={t.thPause}>
                          <input type="number" min={0} value={zeile.pauseMin}
                            onChange={e => setReiseZeile(which, 'pauseMin', e.target.value)}
                            style={{ ...s.cellInput, textAlign: 'center', fontSize: 14, touchAction: 'manipulation' }} />
                        </td>
                        <td style={{ ...s.td, textAlign: 'center', fontWeight: 'bold', background: zeile.tagTyp === '' ? '#e8f4e8' : bg, fontSize: 11 }} data-label={t.labelGesamtAZ}>
                          {formatMin(netto)}
                        </td>
                        <td style={{ ...s.td, padding: 2 }} data-label={t.thTagTyp}>
                          <select value={zeile.tagTyp} onChange={e => setReiseZeile(which, 'tagTyp', e.target.value)}
                            style={{ width: '100%', border: 'none', outline: 'none', fontFamily: 'Arial, sans-serif', fontSize: 13, background: bg, cursor: 'pointer', padding: '2px 2px', borderRadius: 2, color: '#000', touchAction: 'manipulation' }}>
                            <option value="">{t.tagTypNormal}</option>
                            <option value="feiertag">{t.tagTypFeiertag}</option>
                            <option value="samstag">{t.tagTypSamstag}</option>
                            <option value="sonntag">{t.tagTypSonntag}</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* KM gesamt + Verkehrsmittel-Checkboxen */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16, marginTop: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <label style={{ ...s.label, whiteSpace: 'nowrap' }}>{t.reiseKm}</label>
                <input
                  type="number" min={0} value={form.reiseKmGesamt}
                  onChange={e => setField('reiseKmGesamt', e.target.value)}
                  style={{ ...s.gridInput, width: 110, fontSize: 16 }}
                />
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                {(['pkw', 'zug', 'flugzeug', 'leihwagen'] as const).map(key => {
                  const labelMap: Record<string, string> = {
                    pkw: t.reisePkw, zug: t.reiseZug,
                    flugzeug: t.reiseFlugzeug, leihwagen: t.reiseLeihwagen,
                  };
                  return (
                    <label key={key} style={s.checkboxItem}>
                      <input type="checkbox" checked={form.reiseMittel[key]}
                        onChange={() => toggleReiseMittel(key)}
                        style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#1a5fa8' }} />
                      {' '}{labelMap[key]}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Gesamt-Reisezeit */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, marginTop: 10, padding: '6px 10px', border: '1px solid #aaa', borderRadius: 4, background: '#f7f7f7' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <strong style={{ fontSize: 10 }}>{t.labelGesamtRZ}</strong>
                <span style={{ fontWeight: 'bold', fontSize: 11, background: '#e8f4e8', padding: '2px 10px', borderRadius: 3, border: '1px solid #aaa' }}>
                  {gesamtRZ}
                </span>
              </div>
              {reiseBreakdown.samstag > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 9, color: '#555' }}>{t.tagTypSamstag}:</span>
                  <span style={{ fontWeight: 'bold', fontSize: 10, background: '#ddeeff', padding: '2px 8px', borderRadius: 3, border: '1px solid #99bbdd' }}>{formatMin(reiseBreakdown.samstag)}</span>
                </div>
              )}
              {reiseBreakdown.sonntag > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 9, color: '#555' }}>{t.tagTypSonntag}:</span>
                  <span style={{ fontWeight: 'bold', fontSize: 10, background: '#fde8e8', padding: '2px 8px', borderRadius: 3, border: '1px solid #ddaaaa' }}>{formatMin(reiseBreakdown.sonntag)}</span>
                </div>
              )}
              {reiseBreakdown.feiertag > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 9, color: '#555' }}>{t.tagTypFeiertag}:</span>
                  <span style={{ fontWeight: 'bold', fontSize: 10, background: '#fff3cd', padding: '2px 8px', borderRadius: 3, border: '1px solid #ddcc88' }}>{formatMin(reiseBreakdown.feiertag)}</span>
                </div>
              )}
              {reiseBreakdown.nacht > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 9, color: '#555' }}>{t.tagTypNacht}:</span>
                  <span style={{ fontWeight: 'bold', fontSize: 10, background: '#e8e0f8', padding: '2px 8px', borderRadius: 3, border: '1px solid #aa99cc' }}>{formatMin(reiseBreakdown.nacht)}</span>
                </div>
              )}
            </div>
          </div>

          {/* ── Unterschriften ── */}
          <div style={{ marginTop: 20, border: '1px solid #000', padding: 10, borderRadius: 4, boxSizing: 'border-box' }}>
            <strong style={{ fontSize: 11, letterSpacing: '.03em' }}>{t.sectionSign}</strong>
            <div style={{ display: 'flex', gap: 12, marginTop: 10, width: '100%', boxSizing: 'border-box', overflow: 'hidden' }}>
              {(['sig-gerlieva', 'sig-kunde'] as const).map(id => {
                const isGerlieva  = id === 'sig-gerlieva';
                const label       = isGerlieva ? t.sigGerlieva : t.sigKunde;
                const nameKey     = isGerlieva ? 'nameGerlieva' : 'nameKunde';
                const placeholder = isGerlieva ? t.sigPlaceholderTech : t.sigPlaceholderKunde;
                return (
                  <div key={id} style={{ flex: '1 1 0', minWidth: 0, border: '1px solid #ccc', borderRadius: 4, padding: 8, background: '#fafafa', boxSizing: 'border-box', overflow: 'hidden' }}>
                    <div style={{ fontSize: 9, fontWeight: 'bold', marginBottom: 4 }}>{label}</div>
                    <SigPreview dataUrl={form.signatures[id]} onClick={() => setSigModal({ id, label })} tapLabel={t.sigTap} />
                    <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <input type="text" value={form[nameKey]} onChange={e => setField(nameKey, e.target.value)}
                        placeholder={placeholder}
                        style={{ flex: 1, border: 'none', borderBottom: '1px solid #aaa', outline: 'none', fontSize: 14, background: 'transparent', fontFamily: 'Arial, sans-serif', color: '#000' }} />
                      <button onClick={() => clearSig(id)}
                        style={{ fontSize: 11, padding: '4px 10px', background: '#eee', border: '1px solid #bbb', borderRadius: 3, cursor: 'pointer', whiteSpace: 'nowrap', minHeight: 32, touchAction: 'manipulation' }}>
                        {t.sigDelete}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ textAlign: 'center', marginTop: 12, fontWeight: 'bold', fontSize: 13 }}>
              {t.labelDatum}{' '}
              <input type="date" value={form.signatureDate} onChange={e => setField('signatureDate', e.target.value)}
                style={{ border: '1px solid #ccc', padding: '6px 10px', borderRadius: 4, fontSize: 16, colorScheme: 'light', color: '#000', minHeight: 36, touchAction: 'manipulation' }} />
            </div>
          </div>

        </div>
      </div>

      {/* ── Modals & notifications ── */}
      {sigModal && (
        <SignatureModal label={sigModal.label} existing={form.signatures[sigModal.id]}
          onClose={dataUrl => handleSigClose(sigModal.id, dataUrl)} t={t} />
      )}
      <Toast msg={toast.msg} type={toast.type} visible={toast.visible} />
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Styles
// ═══════════════════════════════════════════════════════════════════════════════

const styles: Record<string, React.CSSProperties> = {
  toolbar:      { position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999, background: '#1a2744', padding: '8px 12px', paddingLeft: 'max(12px, env(safe-area-inset-left))', paddingRight: 'max(12px, env(safe-area-inset-right))', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' as const },
  tbtn:         { border: 'none', padding: '8px 12px', fontSize: 11, fontWeight: 'bold', borderRadius: 4, cursor: 'pointer', fontFamily: 'Arial, sans-serif', color: '#fff', minHeight: 36, touchAction: 'manipulation' as const, WebkitTapHighlightColor: 'transparent' },
  body:         { fontFamily: 'Arial, sans-serif', fontSize: 13, padding: '12px 12px 32px', paddingLeft: 'max(12px, env(safe-area-inset-left))', paddingRight: 'max(12px, env(safe-area-inset-right))', paddingBottom: 'max(32px, env(safe-area-inset-bottom))', maxWidth: 1000, margin: '0 auto', background: '#f5f5f5', minHeight: '100vh', boxSizing: 'border-box' as const },
  container:    { background: 'white', padding: 16, borderRadius: 8, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' },
  header:       { borderBottom: '2px solid #000', marginBottom: 15, paddingBottom: 8 },
  section:      { marginBottom: 15, border: '1px solid #ccc', padding: 10, borderRadius: 4, background: 'white' },
  sectionTitle: { fontSize: 14, marginBottom: 10, background: '#f0f0f0', padding: 8, borderRadius: 4 },
  table:        { width: '100%', borderCollapse: 'collapse' as const, marginTop: 8 },
  th:           { border: '1px solid #000', padding: 4, textAlign: 'center' as const, background: '#e0e0e0', fontWeight: 'bold', fontSize: 10 },
  td:           { border: '1px solid #000', padding: 4, textAlign: 'left' as const, fontSize: 10 },
  cellInput:    { width: '100%', border: 'none', padding: 2, background: 'white', color: '#000', fontSize: 10, fontFamily: 'Arial, sans-serif', boxSizing: 'border-box' as const },
  gridRow:      { display: 'grid', gridTemplateColumns: 'minmax(90px, 130px) 1fr', gap: 8, marginBottom: 6, alignItems: 'center' },
  label:        { fontWeight: 'bold', fontSize: 13 },
  gridInput:    { border: '1px solid #ddd', padding: '8px 6px', borderRadius: 4, fontSize: 16, fontFamily: 'Arial, sans-serif', background: 'white', color: '#000', minHeight: 36 },
  inlineField:  { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 },
  checkboxList: { display: 'flex', flexWrap: 'wrap' as const, gap: 12, marginBottom: 8 },
  checkboxItem: { display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, minHeight: 36, padding: '2px 0' },
};

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

  /* ── Mobile: Inputs >= 16px damit iOS nicht hineinzoomt ── */
  @media screen and (max-width: 600px) {
    input[type="text"], input[type="date"], input[type="time"],
    input[type="number"], select, textarea {
      font-size: 16px !important;
    }
    /* Zeiterfassung: Tabelle als Cards */
    .zeit-table thead { display: none; }
    .zeit-table, .zeit-table tbody, .zeit-table tr, .zeit-table td { display: block; width: 100%; }
    .zeit-table tr {
      border: 1px solid #ccc;
      border-radius: 4px;
      margin-bottom: 6px;
      padding: 4px 6px;
    }
    .zeit-table td {
      border: none !important;
      border-bottom: 1px solid #eee !important;
      padding: 4px 2px !important;
      display: flex;
      align-items: center;
      min-height: 36px;
    }
    .zeit-table td:last-child { border-bottom: none !important; }
    .zeit-table td::before {
      content: attr(data-label);
      font-weight: bold;
      font-size: 10px;
      color: #555;
      min-width: 90px;
      flex-shrink: 0;
    }
  }

  /* ── Dark-Mode Override: alle Inputs/Textareas immer hell ── */
  @media (prefers-color-scheme: dark) {
    input, textarea, select {
      background-color: white !important;
      color: #000 !important;
      -webkit-text-fill-color: #000 !important;
      color-scheme: light !important;
    }
    canvas {
      background-color: white !important;
    }
  }
  /* ── Handy Querformat ── */
  @media screen and (max-width: 900px) and (orientation: landscape) {
    .toolbar-title { display: none !important; }
    .print-body    { padding-left: max(8px, env(safe-area-inset-left)) !important; padding-right: max(8px, env(safe-area-inset-right)) !important; }
    .print-container { padding: 10px !important; }
  }
  @media print {
    .no-print { display: none !important; }

    /* Kompaktes 2-Seiten-Layout */
    @page { margin: 8mm 10mm; }
    body { padding: 0 !important; font-size: 9px !important; background: white; }

    .print-body { padding: 0 !important; background: white !important; }
    .print-container { box-shadow: none !important; padding: 8px !important; margin-top: 0 !important; border-radius: 0 !important; }

    /* Sektionen kompakter */
    h1 { font-size: 13px !important; margin: 0 0 2px !important; }
    h2 { font-size: 10px !important; margin: 0 0 4px !important; padding: 4px 6px !important; }
    p  { font-size: 8px !important; margin: 0 !important; }

    /* Abstände reduzieren */
    section, div[style*="marginBottom: 15"] { margin-bottom: 6px !important; }
    div[style*="border: 1px solid #ccc"]    { padding: 6px !important; margin-bottom: 6px !important; }

    /* Tabellen-Zellen kompakter */
    th, td { padding: 2px 3px !important; font-size: 8.5px !important; }

    /* Inputs im Druck: kein Rand, kompakt */
    input[type="text"], input[type="date"], input[type="time"], input[type="number"] {
      padding: 1px 2px !important;
      font-size: 8.5px !important;
    }

    /* Checkboxen + Labels */
    label { font-size: 8.5px !important; }

    /* Textarea im Druck */
    textarea { resize: none !important; font-size: 8.5px !important; padding: 4px !important; border: 1px solid #000 !important; }

    /* Seitenumbrüche */
    .page-break-before { page-break-before: always !important; break-before: page !important; }
    tr { page-break-inside: avoid !important; break-inside: avoid !important; }
    thead { display: table-header-group; }

    /* Unterschriften kompakter */
    .sig-canvas        { display: none !important; }
    .sig-print-img     { display: block !important; width: 100% !important; height: auto !important; max-height: 60px; object-fit: contain; border: 1px solid #000; }
    .sig-print-empty   { display: block !important; width: 100% !important; height: 50px !important; border: 1px solid #000; background: white; }

    /* Zeiterfassung: Card-Layout zurück zu Tabelle im Druck */
    .zeit-table thead { display: table-header-group !important; }
    .zeit-table, .zeit-table tbody, .zeit-table tr, .zeit-table td { display: revert !important; }
    .zeit-table td::before { display: none !important; }
  }
`;
