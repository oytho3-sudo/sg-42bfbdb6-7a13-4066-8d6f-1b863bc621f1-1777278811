'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

// ═══════════════════════════════════════════════════════════════════════════════
// i18n – Übersetzungen / Translations / Traductions
// ═══════════════════════════════════════════════════════════════════════════════

type Lang = 'de' | 'en' | 'fr';

const translations = {
  de: {
    loadJson:       '📂 JSON laden',
    savePdf:        '⬇ Als PDF speichern',
    shareJson:      '📤 JSON teilen',
    saveJson:       '💾 JSON speichern',
    toolbarTitle:   'Servicebericht · GERLIEVA Sprühtechnik GmbH',
    home:           '🏠 Home',
    pdfAlert:       'Im Druckdialog:\n1. Drucker → "Als PDF speichern"\n2. Weitere Einstellungen → "Hintergrundgrafiken" ✓ aktivieren\n→ Dann sind alle Farben im PDF enthalten.',
    toastSaved:     '✅ JSON gespeichert!',
    toastDownloaded:'✅ JSON heruntergeladen!',
    toastLoaded:    '✅ Datei erfolgreich geladen!',
    toastInvalid:   'Ungültige JSON-Datei',
    toastError:     'Fehler: ',
    toastLoadError: 'Fehler beim Laden: ',
    docTitle:       'Servicebericht',
    sectionKunde:   'Kunde',
    sectionMaschine:'Maschine',
    sectionArbeiten:'Durchgeführte Arbeiten',
    sectionReise:   'Arbeits- und Reisezeiten',
    sectionMaterial:'Material- und Teileliste',
    sectionBemerk:  'Bemerkungen / Fehlerbeschreibung',
    sectionSign:    'BESTÄTIGUNG / UNTERSCHRIFTEN',
    labelName:      'Name:',
    labelStrasse:   'Straße:',
    labelTelefon:   'Telefon:',
    labelReferenz:  'Referenz:',
    labelAnsprechpartner: 'Ansprechpartner:',
    labelTechniker:       'Servicetechniker:',
    thNr:           'Nr.',
    thTyp:          'Typ',
    thMaschinenNr:  'Maschinen-Nr.',
    thKundenNr:     'Kunden-Nr.',
    thKomNr:        'Kom.-Nr.',
    arbMontage:     'Montage',
    arbInbetrieb:   'Inbetriebnahme',
    arbSoftware:    'Softwareupdate',
    arbWartung:     'Wartung',
    arbReparatur:   'Reparatur',
    reisePkw:       'PKW',
    reiseFlugzeug:  'Flugzeug',
    reiseZug:       'Zug',
    reiseHotel:     'Hotel',
    reiseSonstiges: 'Sonstiges',
    thTag:          'Tag',
    thDatum:        'Datum',
    thAnreise:      'Anreise',
    thArbeitszeit:  'Arbeitszeit',
    thRueckreise:   'Rückreise',
    thKm:           'km',
    thPause:        'Pause (Min)',
    thVon:          'von',
    thBis:          'bis',
    thPos:          'Pos.',
    thBeschreibung: 'Beschreibung',
    thTeilenummer:  'Teilenummer',
    thStk:          'Stk.',
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
    labelDatum:     'Datum:',
  },
  en: {
    loadJson:       '📂 Load JSON',
    savePdf:        '⬇ Save as PDF',
    shareJson:      '📤 Share JSON',
    saveJson:       '💾 Save JSON',
    toolbarTitle:   'Service Report · GERLIEVA Sprühtechnik GmbH',
    home:           '🏠 Home',
    pdfAlert:       'In the print dialog:\n1. Printer → "Save as PDF"\n2. More settings → enable "Background graphics" ✓\n→ This ensures all colours appear in the PDF.',
    toastSaved:     '✅ JSON saved!',
    toastDownloaded:'✅ JSON downloaded!',
    toastLoaded:    '✅ File loaded successfully!',
    toastInvalid:   'Invalid JSON file',
    toastError:     'Error: ',
    toastLoadError: 'Error loading file: ',
    docTitle:       'Service Report',
    sectionKunde:   'Customer',
    sectionMaschine:'Machine',
    sectionArbeiten:'Work Performed',
    sectionReise:   'Working & Travel Times',
    sectionMaterial:'Materials & Parts List',
    sectionBemerk:  'Remarks / Fault Description',
    sectionSign:    'CONFIRMATION / SIGNATURES',
    labelName:      'Name:',
    labelStrasse:   'Street:',
    labelTelefon:   'Phone:',
    labelReferenz:  'Reference:',
    labelAnsprechpartner: 'Contact Person:',
    labelTechniker: 'Service Technician:',
    thNr:           'No.',
    thTyp:          'Type',
    thMaschinenNr:  'Machine No.',
    thKundenNr:     'Customer No.',
    thKomNr:        'Com. No.',
    arbMontage:     'Assembly',
    arbInbetrieb:   'Commissioning',
    arbSoftware:    'Software Update',
    arbWartung:     'Maintenance',
    arbReparatur:   'Repair',
    reisePkw:       'Car',
    reiseFlugzeug:  'Plane',
    reiseZug:       'Train',
    reiseHotel:     'Hotel',
    reiseSonstiges: 'Other',
    thTag:          'Day',
    thDatum:        'Date',
    thAnreise:      'Outbound',
    thArbeitszeit:  'Working Time',
    thRueckreise:   'Return',
    thKm:           'km',
    thPause:        'Break (min)',
    thVon:          'from',
    thBis:          'to',
    thPos:          'Pos.',
    thBeschreibung: 'Description',
    thTeilenummer:  'Part Number',
    thStk:          'Qty.',
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
    labelDatum:     'Date:',
  },
  fr: {
    loadJson:       '📂 Charger JSON',
    savePdf:        '⬇ Enregistrer en PDF',
    shareJson:      '📤 Partager JSON',
    saveJson:       '💾 Sauvegarder JSON',
    toolbarTitle:   'Rapport de service · GERLIEVA Sprühtechnik GmbH',
    home:           '🏠 Accueil',
    pdfAlert:       "Dans la boîte de dialogue d'impression :\n1. Imprimante → \"Enregistrer en PDF\"\n2. Paramètres → activer \"Graphiques d'arrière-plan\" ✓\n→ Toutes les couleurs apparaîtront dans le PDF.",
    toastSaved:     '✅ JSON enregistré !',
    toastDownloaded:'✅ JSON téléchargé !',
    toastLoaded:    '✅ Fichier chargé avec succès !',
    toastInvalid:   'Fichier JSON invalide',
    toastError:     'Erreur : ',
    toastLoadError: 'Erreur de chargement : ',
    docTitle:       'Rapport de service',
    sectionKunde:   'Client',
    sectionMaschine:'Machine',
    sectionArbeiten:'Travaux effectués',
    sectionReise:   'Temps de travail et de déplacement',
    sectionMaterial:'Liste des matériaux et pièces',
    sectionBemerk:  'Remarques / Description de la panne',
    sectionSign:    'CONFIRMATION / SIGNATURES',
    labelName:      'Nom :',
    labelStrasse:   'Rue :',
    labelTelefon:   'Téléphone :',
    labelReferenz:  'Référence :',
    labelAnsprechpartner: 'Personne de contact :',
    labelTechniker: 'Technicien de service :',
    thNr:           'N°',
    thTyp:          'Type',
    thMaschinenNr:  'N° machine',
    thKundenNr:     'N° client',
    thKomNr:        'N° com.',
    arbMontage:     'Montage',
    arbInbetrieb:   'Mise en service',
    arbSoftware:    'Mise à jour logiciel',
    arbWartung:     'Maintenance',
    arbReparatur:   'Réparation',
    reisePkw:       'Voiture',
    reiseFlugzeug:  'Avion',
    reiseZug:       'Train',
    reiseHotel:     'Hôtel',
    reiseSonstiges: 'Autre',
    thTag:          'Jour',
    thDatum:        'Date',
    thAnreise:      'Aller',
    thArbeitszeit:  'Temps de travail',
    thRueckreise:   'Retour',
    thKm:           'km',
    thPause:        'Pause (min)',
    thVon:          'de',
    thBis:          'à',
    thPos:          'Pos.',
    thBeschreibung: 'Description',
    thTeilenummer:  'N° de pièce',
    thStk:          'Qté.',
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
    labelDatum:     'Date :',
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
interface ZeitRow {
  datum: string;
  anreiseVon: string; anreiseBis: string; anreiseKm: string;
  arbeitVon: string; arbeitBis: string;
  rueckreiseVon: string; rueckreiseBis: string; rueckreiseKm: string;
  pauseMin: string;
}
interface MaterialRow {
  pos: string; beschreibung: string; teilenummer: string; stk: string;
}
interface FormData {
  version: number; ts: string;
  kundeName: string; kundeStrasse: string; kundeTelefon: string; kundeReferenz: string;
  ansprechpartner: string;
  servicetechniker: string;
  maschinen: MaschineRow[];
  arbeitenChecks: Record<string, boolean>;
  arbeitenSonstiges: string;
  reiseChecks: Record<string, boolean>;
  zeiten: ZeitRow[];
  material: MaterialRow[];
  bemerkungen: string;
  nameGerlieva: string; nameKunde: string; signatureDate: string;
  signatures: { 'sig-gerlieva'?: string; 'sig-kunde'?: string };
}

// ═══════════════════════════════════════════════════════════════════════════════
// Initial state
// ═══════════════════════════════════════════════════════════════════════════════

const emptyMaschine  = (): MaschineRow  => ({ nr: '', typ: '', maschinenNr: '', kundenNr: '', komNr: '' });
const emptyZeit      = (): ZeitRow      => ({ datum: '', anreiseVon: '', anreiseBis: '', anreiseKm: '', arbeitVon: '', arbeitBis: '', rueckreiseVon: '', rueckreiseBis: '', rueckreiseKm: '', pauseMin: '' });
const emptyMaterial  = (): MaterialRow  => ({ pos: '', beschreibung: '', teilenummer: '', stk: '' });

const initialForm = (): FormData => ({
  version: 1, ts: '',
  kundeName: '', kundeStrasse: '', kundeTelefon: '', kundeReferenz: '',
  ansprechpartner: '',
  servicetechniker: '',
  maschinen: Array.from({ length: 4 }, emptyMaschine),
  arbeitenChecks: { Montage: false, Inbetriebnahme: false, Softwareupdate: false, Wartung: false, Reparatur: false },
  arbeitenSonstiges: '',
  reiseChecks: { PKW: false, Flugzeug: false, Zug: false, Hotel: false, Sonstiges: false },
  zeiten: Array.from({ length: 7 }, emptyZeit),
  material: Array.from({ length: 15 }, emptyMaterial),
  bemerkungen: '',
  nameGerlieva: '', nameKunde: '', signatureDate: '',
  signatures: {},
});

// Checkbox keys are stored in German (stable internal keys), display label is derived from t[]
const ARBEITEN_KEYS = ['Montage', 'Inbetriebnahme', 'Softwareupdate', 'Wartung', 'Reparatur'] as const;
const ARBEITEN_TK: Record<string, TKeys> = { Montage: 'arbMontage', Inbetriebnahme: 'arbInbetrieb', Softwareupdate: 'arbSoftware', Wartung: 'arbWartung', Reparatur: 'arbReparatur' };
const REISE_KEYS   = ['PKW', 'Flugzeug', 'Zug', 'Hotel', 'Sonstiges'] as const;
const REISE_TK: Record<string, TKeys>    = { PKW: 'reisePkw', Flugzeug: 'reiseFlugzeug', Zug: 'reiseZug', Hotel: 'reiseHotel', Sonstiges: 'reiseSonstiges' };

// ═══════════════════════════════════════════════════════════════════════════════
// Language Switcher
// ═══════════════════════════════════════════════════════════════════════════════

const FLAG: Record<Lang, string> = { de: '🇩🇪', en: '🇬🇧', fr: '🇫🇷' };

function LangSwitcher({ current, onChange }: { current: Lang; onChange: (l: Lang) => void }) {
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      {(['de', 'en', 'fr'] as Lang[]).map(l => (
        <button key={l} onClick={() => onChange(l)} title={l.toUpperCase()} style={{
          border: current === l ? '2px solid #fff' : '2px solid transparent',
          background: current === l ? 'rgba(255,255,255,0.18)' : 'transparent',
          borderRadius: 4, cursor: 'pointer', padding: '2px 7px', fontSize: 17, lineHeight: 1,
          transition: 'all 0.15s',
        }}>
          {FLAG[l]}
        </button>
      ))}
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
      const w = container.clientWidth - 16, h = container.clientHeight - 16;
      const tmp = document.createElement('canvas');
      tmp.width = canvas.width; tmp.height = canvas.height;
      tmp.getContext('2d')!.drawImage(canvas, 0, 0);
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
      const ctx = canvas.getContext('2d')!; ctx.scale(dpr, dpr); ctx.drawImage(tmp, 0, 0, w, h);
    };
    setTimeout(resize, 150);
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
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

  const pos = (e: React.MouseEvent | React.TouchEvent, c: HTMLCanvasElement) => {
    const r = c.getBoundingClientRect(), src = 'touches' in e ? e.touches[0] : e;
    return { x: src.clientX - r.left, y: src.clientY - r.top };
  };
  const onStart = (e: React.MouseEvent | React.TouchEvent) => { e.preventDefault(); drawing.current = true; const c = canvasRef.current!; const ctx = c.getContext('2d')!; const p = pos(e, c); ctx.beginPath(); ctx.moveTo(p.x, p.y); };
  const onMove  = (e: React.MouseEvent | React.TouchEvent) => { e.preventDefault(); if (!drawing.current) return; const c = canvasRef.current!; const ctx = c.getContext('2d')!; const p = pos(e, c); ctx.lineTo(p.x, p.y); ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(); };
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
    const rect = canvas.getBoundingClientRect();
    const w = rect.width || 300, h = rect.height || 90;
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
  useEffect(() => { setTimeout(redraw, 50); window.addEventListener('resize', redraw); return () => window.removeEventListener('resize', redraw); }, [redraw]);
  return <canvas ref={canvasRef} width={400} height={100} onClick={onClick}
    style={{ border: '2px dashed #999', background: 'white', cursor: 'pointer', width: '100%', aspectRatio: '4/1', borderRadius: 3, display: 'block', touchAction: 'none' }} />;
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

  const [form, setForm]       = useState<FormData>(initialForm);
  const [sigModal, setSigModal] = useState<{ id: 'sig-gerlieva' | 'sig-kunde'; label: string } | null>(null);
  const [toast, setToast]     = useState<{ msg: string; type: 'success' | 'error' | ''; visible: boolean }>({ msg: '', type: '', visible: false });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type, visible: true });
    setTimeout(() => setToast(p => ({ ...p, visible: false })), 2500);
  };

  // ── Field helpers ──────────────────────────────────────────────────────────
  const setField     = <K extends keyof FormData>(key: K, val: FormData[K]) => setForm(f => ({ ...f, [key]: val }));
  const setMaschine  = (i: number, f: keyof MaschineRow, v: string) => setForm(s => { const m = [...s.maschinen]; m[i] = { ...m[i], [f]: v }; return { ...s, maschinen: m }; });
  const setZeit      = (i: number, f: keyof ZeitRow, v: string)     => setForm(s => { const z = [...s.zeiten];   z[i] = { ...z[i], [f]: v }; return { ...s, zeiten: z };    });
  const setMaterial  = (i: number, f: keyof MaterialRow, v: string) => setForm(s => { const m = [...s.material]; m[i] = { ...m[i], [f]: v }; return { ...s, material: m };  });
  const toggleCheck  = (group: 'arbeitenChecks' | 'reiseChecks', key: string) => setForm(s => ({ ...s, [group]: { ...s[group], [key]: !s[group][key] } }));

  // ── File name ──────────────────────────────────────────────────────────────
  const getFileName = (ext: string) => {
    const kunde = (form.kundeName || '').trim().replace(/[^a-zA-Z0-9_\-]/g, '_');
    const datum = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    return (kunde ? `Servicebericht_${kunde}_${datum}` : `Servicebericht_${datum}`) + '.' + ext;
  };

  // ── JSON I/O ───────────────────────────────────────────────────────────────
  const collectFormData = () => ({ ...form, ts: new Date().toISOString() });
  const applyFormData   = (data: FormData) => {
    if (!data || data.version !== 1) { showToast(t.toastInvalid, 'error'); return; }
    setForm(data);
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
    try {
      const blob = new Blob([JSON.stringify(collectFormData(), null, 2)], { type: 'application/json' });
      const file = new File([blob], getFileName('json'), { type: 'application/json' });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: 'Servicebericht GERLIEVA', files: [file] });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = getFileName('json');
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 2000);
        showToast(t.toastDownloaded, 'success');
      }
    } catch (err: unknown) {
      if ((err as Error).name !== 'AbortError') showToast(t.toastError + (err as Error).message, 'error');
    }
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
      <div style={s.toolbar} className="no-print">
        <button onClick={() => fileInputRef.current?.click()} style={{ ...s.tbtn, background: '#8e24aa' }}>{t.loadJson}</button>
        <button onClick={handlePdf}   style={{ ...s.tbtn, background: '#e8460a' }}>{t.savePdf}</button>
        <button onClick={handleShare} style={{ ...s.tbtn, background: '#1a7a3a' }}>{t.shareJson}</button>
        <button onClick={handleSave}  style={{ ...s.tbtn, background: '#1a5fa8' }}>{t.saveJson}</button>
        <span style={{ color: '#a8b8d8', fontSize: 9 }}>{t.toolbarTitle}</span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <LangSwitcher current={lang} onChange={setLang} />
          <a href="/" style={{ ...s.tbtn, background: '#1a5fa8', textDecoration: 'none' }}>{t.home}</a>
        </div>
        <input ref={fileInputRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleLoad} />
      </div>

      {/* ── Page body ── */}
      <div style={s.body}>
        <div style={s.container}>

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
              ['kundeReferenz', t.labelReferenz],
            ] as [keyof FormData, string][]).map(([key, label]) => (
              <div key={key} style={s.gridRow}>
                <span style={s.label}>{label}</span>
                <input type="text" value={form[key] as string} onChange={e => setField(key, e.target.value)} style={s.gridInput} />
              </div>
            ))}
          </div>

          {/* ── Ansprechpartner + Servicetechniker ── */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 10 }}>
            <div style={s.inlineField}>
              <label style={s.label}>{t.labelAnsprechpartner}</label>
              <input type="text" value={form.ansprechpartner} onChange={e => setField('ansprechpartner', e.target.value)} style={s.gridInput} />
            </div>
            <div style={s.inlineField}>
              <label style={s.label}>{t.labelTechniker}</label>
              <input type="text" value={form.servicetechniker} onChange={e => setField('servicetechniker', e.target.value)} style={s.gridInput} />
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
                  <input type="checkbox" checked={form.arbeitenChecks[k]} onChange={() => toggleCheck('arbeitenChecks', k)} />
                  {' '}{t[ARBEITEN_TK[k]]}
                </label>
              ))}
            </div>
            <input type="text" value={form.arbeitenSonstiges} onChange={e => setField('arbeitenSonstiges', e.target.value)}
              style={{ width: '100%', border: '1px solid #ddd', padding: 6, borderRadius: 4, marginTop: 8, fontSize: 11, fontFamily: 'Arial, sans-serif', boxSizing: 'border-box' }} />
          </div>

          {/* ── Reisezeiten ── */}
          <div style={s.section}>
            <h2 style={s.sectionTitle}>{t.sectionReise}</h2>
            <div style={s.checkboxList}>
              {REISE_KEYS.map(k => (
                <label key={k} style={s.checkboxItem}>
                  <input type="checkbox" checked={form.reiseChecks[k]} onChange={() => toggleCheck('reiseChecks', k)} />
                  {' '}{t[REISE_TK[k]]}
                </label>
              ))}
            </div>
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table style={{ ...s.table, marginTop: 10 }}>
                <colgroup>
                  <col style={{ width: 30 }} /><col style={{ width: 90 }} /><col style={{ width: 70 }} /><col style={{ width: 70 }} />
                  <col style={{ width: 50 }} /><col style={{ width: 70 }} /><col style={{ width: 70 }} /><col style={{ width: 70 }} />
                  <col style={{ width: 70 }} /><col style={{ width: 50 }} /><col style={{ width: 65 }} />
                </colgroup>
                <thead>
                  <tr>
                    <th rowSpan={2} style={s.th}>{t.thTag}</th>
                    <th rowSpan={2} style={s.th}>{t.thDatum}</th>
                    <th colSpan={2} style={{ ...s.th, background: '#d0d0d0' }}>{t.thAnreise}</th>
                    <th rowSpan={2} style={s.th}>{t.thKm}</th>
                    <th colSpan={2} style={{ ...s.th, background: '#d0d0d0' }}>{t.thArbeitszeit}</th>
                    <th colSpan={2} style={{ ...s.th, background: '#d0d0d0' }}>{t.thRueckreise}</th>
                    <th rowSpan={2} style={s.th}>{t.thKm}</th>
                    <th rowSpan={2} style={s.th}>{t.thPause}</th>
                  </tr>
                  <tr>
                    {[t.thVon, t.thBis, t.thVon, t.thBis, t.thVon, t.thBis].map((h, i) => <th key={i} style={s.th}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {form.zeiten.map((row, i) => (
                    <tr key={i}>
                      <td style={{ ...s.td, textAlign: 'center' }}>{i + 1}</td>
                      <td style={s.td}><input type="date"   value={row.datum}         onChange={e => setZeit(i, 'datum', e.target.value)}         style={s.cellInput} /></td>
                      <td style={s.td}><input type="time"   value={row.anreiseVon}    onChange={e => setZeit(i, 'anreiseVon', e.target.value)}    style={{ ...s.cellInput, width: 80 }} /></td>
                      <td style={s.td}><input type="time"   value={row.anreiseBis}    onChange={e => setZeit(i, 'anreiseBis', e.target.value)}    style={{ ...s.cellInput, width: 80 }} /></td>
                      <td style={s.td}><input type="number" value={row.anreiseKm}     onChange={e => setZeit(i, 'anreiseKm', e.target.value)}     max={9999} style={{ ...s.cellInput, width: 60 }} /></td>
                      <td style={s.td}><input type="time"   value={row.arbeitVon}     onChange={e => setZeit(i, 'arbeitVon', e.target.value)}     style={{ ...s.cellInput, width: 80 }} /></td>
                      <td style={s.td}><input type="time"   value={row.arbeitBis}     onChange={e => setZeit(i, 'arbeitBis', e.target.value)}     style={{ ...s.cellInput, width: 80 }} /></td>
                      <td style={s.td}><input type="time"   value={row.rueckreiseVon} onChange={e => setZeit(i, 'rueckreiseVon', e.target.value)} style={{ ...s.cellInput, width: 80 }} /></td>
                      <td style={s.td}><input type="time"   value={row.rueckreiseBis} onChange={e => setZeit(i, 'rueckreiseBis', e.target.value)} style={{ ...s.cellInput, width: 80 }} /></td>
                      <td style={s.td}><input type="number" value={row.rueckreiseKm}  onChange={e => setZeit(i, 'rueckreiseKm', e.target.value)}  max={9999} style={{ ...s.cellInput, width: 60 }} /></td>
                      <td style={s.td}><input type="number" value={row.pauseMin}      onChange={e => setZeit(i, 'pauseMin', e.target.value)}      max={99999999} placeholder="Min" style={{ ...s.cellInput, width: 80 }} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Material ── */}
          <div style={{ pageBreakBefore: 'always' }}>
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

          {/* ── Bemerkungen ── */}
          <div style={s.section}>
            <h2 style={s.sectionTitle}>{t.sectionBemerk}</h2>
            <textarea value={form.bemerkungen} onChange={e => setField('bemerkungen', e.target.value)}
              style={{ width: '100%', height: 80, border: '1px solid #ddd', padding: 6, borderRadius: 4, fontSize: 11, fontFamily: 'Arial, sans-serif', resize: 'vertical', boxSizing: 'border-box' }} />
          </div>

          {/* ── Unterschriften ── */}
          <div style={{ ...s.section, marginTop: 20 }}>
            <h2 style={{ fontSize: 14, background: '#f0f0f0', padding: 8, borderRadius: 4, borderBottom: '3px solid #000', marginBottom: 15 }}>
              {t.sectionSign}
            </h2>
            <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
              {(['sig-gerlieva', 'sig-kunde'] as const).map(id => {
                const isGerlieva  = id === 'sig-gerlieva';
                const label       = isGerlieva ? t.sigGerlieva : t.sigKunde;
                const nameKey     = isGerlieva ? 'nameGerlieva' : 'nameKunde';
                const placeholder = isGerlieva ? t.sigPlaceholderTech : t.sigPlaceholderKunde;
                return (
                  <div key={id} style={{ flex: 1, border: '1px solid #ccc', borderRadius: 4, padding: 8, background: '#fafafa' }}>
                    <div style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 4 }}>{label}</div>
                    <SigPreview dataUrl={form.signatures[id]} onClick={() => setSigModal({ id, label })} tapLabel={t.sigTap} />
                    <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <input type="text" placeholder={placeholder} value={form[nameKey]} onChange={e => setField(nameKey, e.target.value)}
                        style={{ flex: 1, border: 'none', borderBottom: '1px solid #aaa', outline: 'none', fontSize: 11, background: 'transparent' }} />
                      <button onClick={() => clearSig(id)}
                        style={{ fontSize: 9, padding: '2px 6px', background: '#eee', border: '1px solid #bbb', borderRadius: 3, cursor: 'pointer' }}>
                        {t.sigDelete}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ textAlign: 'center', marginTop: 15, fontWeight: 'bold', fontSize: 12 }}>
              {t.labelDatum}{' '}
              <input type="date" value={form.signatureDate} onChange={e => setField('signatureDate', e.target.value)}
                style={{ border: '1px solid #ccc', padding: '4px 8px', borderRadius: 4, fontSize: 11 }} />
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
  toolbar:      { position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999, background: '#1a2744', padding: '7px 18px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  tbtn:         { border: 'none', padding: '6px 16px', fontSize: 9, fontWeight: 'bold', borderRadius: 3, cursor: 'pointer', fontFamily: 'Arial, sans-serif', color: '#fff' },
  body:         { fontFamily: 'Arial, sans-serif', fontSize: 11, padding: 20, maxWidth: 1000, margin: '0 auto', background: '#f5f5f5' },
  container:    { background: 'white', padding: 20, borderRadius: 8, boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginTop: 50 },
  header:       { borderBottom: '2px solid #000', marginBottom: 15, paddingBottom: 8 },
  section:      { marginBottom: 15, border: '1px solid #ccc', padding: 10, borderRadius: 4, background: 'white' },
  sectionTitle: { fontSize: 14, marginBottom: 10, background: '#f0f0f0', padding: 8, borderRadius: 4 },
  table:        { width: '100%', borderCollapse: 'collapse' as const, marginTop: 8 },
  th:           { border: '1px solid #000', padding: 4, textAlign: 'center' as const, background: '#e0e0e0', fontWeight: 'bold', fontSize: 10 },
  td:           { border: '1px solid #000', padding: 4, textAlign: 'left' as const, fontSize: 10 },
  cellInput:    { width: '100%', border: 'none', padding: 2, background: 'transparent', fontSize: 10, fontFamily: 'Arial, sans-serif', boxSizing: 'border-box' as const },
  gridRow:      { display: 'grid', gridTemplateColumns: '140px 1fr', gap: 8, marginBottom: 5, alignItems: 'center' },
  label:        { fontWeight: 'bold' },
  gridInput:    { border: '1px solid #ddd', padding: 4, borderRadius: 3, fontSize: 11, fontFamily: 'Arial, sans-serif' },
  inlineField:  { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 },
  checkboxList: { display: 'flex', flexWrap: 'wrap' as const, gap: 15, marginBottom: 8 },
  checkboxItem: { display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer' },
};

const printStyles = `
  @media print {
    .no-print { display: none !important; }
    body { padding: 10px; font-size: 10.5px; background: white; }
    .section { page-break-inside: avoid; }
  }
`;
