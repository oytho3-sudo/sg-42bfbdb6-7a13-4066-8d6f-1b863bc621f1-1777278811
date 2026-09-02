'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

// ═══════════════════════════════════════════════════════════════════════════════
// Supabase
// ═══════════════════════════════════════════════════════════════════════════════
import { supabase } from '@/integrations/supabase/client';

// ═══════════════════════════════════════════════════════════════════════════════
// Toast
// ═══════════════════════════════════════════════════════════════════════════════
import { useToast } from "@/hooks/use-toast";

// ═══════════════════════════════════════════════════════════════════════════════
// Deutsch / English
// ═══════════════════════════════════════════════════════════════════════════════
const labels = {
  de: {
    title: 'Wartungsprotokoll Sprühkopf',
    toolbarTitle: 'Wartungsprotokoll Sprühkopf',
    loadJson: 'Laden',
    savePdf: 'PDF',
    shareJson: 'Teilen',
    saveJson: 'Speichern',
    uploadCloud: '☁️ Upload',
    home: 'Home',
    labelWartungShare: 'Wartungsprotokoll Sprühkopf teilen',
    toastDownloaded: 'Als JSON heruntergeladen!',
    toastLoaded: 'JSON geladen!',
    toastError: 'Fehler: ',
    toastUploaded: '✅ In Supabase gespeichert!',
    toastLoginRequired: 'Bitte melden Sie sich an',
    labelKundenNr: 'Kunden-Nr.',
    labelKundenName: 'Kunde',
    labelOrt: 'Ort',
    labelMaschineTyp: 'Maschine/Typ',
    labelSerienNr: 'Serien-Nr.',
    labelBetriebsstunden: 'Betriebsstunden',
    labelDatum: 'Datum',
    labelTechniker: 'Techniker',
    sectionAllgemein: '1. Allgemeine Kontrolle',
    labelVerschmutzungen: 'Verschmutzungen',
    labelOrdnung: 'Ordnung & Sauberkeit',
    labelSchmierstellen: 'Schmierstellen',
    sectionSprühkopf: '2. Sprühkopf',
    labelDichtungen: 'Dichtungen',
    labelVerschleiß: 'Verschleiß',
    labelFunktion: 'Funktion',
    sectionElektrik: '3. Elektrik & Steuerung',
    labelSicherungen: 'Sicherungen',
    labelVerkabelung: 'Verkabelung',
    labelSteuerung: 'Steuerung',
    sectionAbschluss: '4. Abschluss',
    labelProbelauf: 'Probelauf',
    labelBemerkungen: 'Bemerkungen',
    labelUnterschrift: 'Unterschrift Techniker',
    placeholderKundenNr: 'z.B. K12345',
    placeholderKundenName: 'Firmenname',
    placeholderOrt: 'Stadt',
    placeholderMaschineTyp: 'Modell/Typ',
    placeholderSerienNr: 'S/N',
    placeholderBetriebsstunden: 'Stunden',
    placeholderTechniker: 'Name',
    placeholderBemerkungen: 'Zusätzliche Notizen...',
    checkIO: 'i.O.',
    checkNIO: 'n.i.O.',
    checkErledigt: 'erledigt',
  },
  en: {
    title: 'Maintenance Protocol Spray Head',
    toolbarTitle: 'Maintenance Protocol Spray Head',
    loadJson: 'Load',
    savePdf: 'PDF',
    shareJson: 'Share',
    saveJson: 'Save',
    uploadCloud: '☁️ Upload',
    home: 'Home',
    labelWartungShare: 'Share Maintenance Protocol',
    toastDownloaded: 'Downloaded as JSON!',
    toastLoaded: 'JSON loaded!',
    toastError: 'Error: ',
    toastUploaded: '✅ Saved to Supabase!',
    toastLoginRequired: 'Please sign in',
    labelKundenNr: 'Customer No.',
    labelKundenName: 'Customer',
    labelOrt: 'Location',
    labelMaschineTyp: 'Machine/Type',
    labelSerienNr: 'Serial No.',
    labelBetriebsstunden: 'Operating Hours',
    labelDatum: 'Date',
    labelTechniker: 'Technician',
    sectionAllgemein: '1. General Inspection',
    labelVerschmutzungen: 'Contamination',
    labelOrdnung: 'Order & Cleanliness',
    labelSchmierstellen: 'Lubrication Points',
    sectionSprühkopf: '2. Spray Head',
    labelDichtungen: 'Seals',
    labelVerschleiß: 'Wear',
    labelFunktion: 'Function',
    sectionElektrik: '3. Electrical & Control',
    labelSicherungen: 'Fuses',
    labelVerkabelung: 'Wiring',
    labelSteuerung: 'Control',
    sectionAbschluss: '4. Completion',
    labelProbelauf: 'Test Run',
    labelBemerkungen: 'Remarks',
    labelUnterschrift: 'Technician Signature',
    placeholderKundenNr: 'e.g. K12345',
    placeholderKundenName: 'Company name',
    placeholderOrt: 'City',
    placeholderMaschineTyp: 'Model/Type',
    placeholderSerienNr: 'S/N',
    placeholderBetriebsstunden: 'Hours',
    placeholderTechniker: 'Name',
    placeholderBemerkungen: 'Additional notes...',
    checkIO: 'OK',
    checkNIO: 'Not OK',
    checkErledigt: 'done',
  }
};

function LangSwitcher({ current, onChange }: { current: 'de' | 'en'; onChange: (l: 'de' | 'en') => void }) {
  return (
    <div style={{ display: 'flex', gap: 4, fontSize: 11, fontWeight: 500 }}>
      {(['de', 'en'] as const).map(l => (
        <button
          key={l}
          onClick={() => onChange(l)}
          style={{
            background: current === l ? '#1a5fa8' : '#2a3f5f',
            color: current === l ? '#fff' : '#a8b8d8',
            border: 'none',
            padding: '4px 8px',
            borderRadius: 4,
            cursor: 'pointer',
            textTransform: 'uppercase'
          }}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Form
// ═══════════════════════════════════════════════════════════════════════════════
interface FormData {
  kundenNr: string;
  kundenName: string;
  ort: string;
  maschineTyp: string;
  serienNr: string;
  betriebsstunden: string;
  datum: string;
  techniker: string;
  verschmutzungen: string;
  ordnung: string;
  schmierstellen: string;
  dichtungen: string;
  verschleiß: string;
  funktion: string;
  sicherungen: string;
  verkabelung: string;
  steuerung: string;
  probelauf: string;
  bemerkungen: string;
  unterschriftData: string;
}

export default function WartungsprotokollSpruehkopf() {
  const { toast } = useToast();
  const [lang, setLang] = useState<'de' | 'en'>('de');
  const t = labels[lang];

  const [form, setForm] = useState<FormData>({
    kundenNr: '',
    kundenName: '',
    ort: '',
    maschineTyp: '',
    serienNr: '',
    betriebsstunden: '',
    datum: '',
    techniker: '',
    verschmutzungen: '',
    ordnung: '',
    schmierstellen: '',
    dichtungen: '',
    verschleiß: '',
    funktion: '',
    sicherungen: '',
    verkabelung: '',
    steuerung: '',
    probelauf: '',
    bemerkungen: '',
    unterschriftData: ''
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isDrawing = useRef(false);

  const showToast = (msg: string, variant: 'default' | 'success' | 'error' = 'default') => {
    toast({ description: msg, variant: variant as 'default' | 'destructive', duration: 3000 });
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Persistence
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem('wartung_spruehkopf_form');
    if (saved) {
      try {
        setForm(JSON.parse(saved));
      } catch (e) {
        console.error('Parse error:', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('wartung_spruehkopf_form', JSON.stringify(form));
  }, [form]);

  // ─────────────────────────────────────────────────────────────────────────────
  // Signature Canvas
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => ctx.drawImage(img, 0, 0);
    if (form.unterschriftData) img.src = form.unterschriftData;

    const startDrawing = (e: MouseEvent | TouchEvent) => {
      isDrawing.current = true;
      const rect = canvas.getBoundingClientRect();
      const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
      const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
      ctx.beginPath();
      ctx.moveTo(x, y);
    };

    const draw = (e: MouseEvent | TouchEvent) => {
      if (!isDrawing.current) return;
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
      const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
      ctx.lineTo(x, y);
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.stroke();
    };

    const stopDrawing = () => {
      if (!isDrawing.current) return;
      isDrawing.current = false;
      setForm(prev => ({ ...prev, unterschriftData: canvas.toDataURL() }));
    };

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('touchstart', startDrawing);
    canvas.addEventListener('touchmove', draw);
    canvas.addEventListener('touchend', stopDrawing);

    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('touchstart', startDrawing);
      canvas.removeEventListener('touchmove', draw);
      canvas.removeEventListener('touchend', stopDrawing);
    };
  }, [form.unterschriftData]);

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    setForm(prev => ({ ...prev, unterschriftData: '' }));
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // File handling
  // ─────────────────────────────────────────────────────────────────────────────
  const getFileNameFn = useCallback((ext: string) => {
    const k = form.kundenNr || 'Export';
    const d = form.datum ? form.datum.replace(/\//g, '-') : new Date().toISOString().split('T')[0];
    return `Wartungsprotokoll_Spruehkopf_${k}_${d}.${ext}`;
  }, [form.kundenNr, form.datum]);

  const collectFormData = () => ({ ...form, formType: 'Wartungsprotokoll_Spruehkopf' });

  const handleLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        setForm(data);
        showToast(t.toastLoaded, 'success');
      } catch (err) {
        showToast(t.toastError + (err as Error).message, 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleSave = () => {
    const jsonStr = JSON.stringify(collectFormData(), null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = getFileNameFn('json');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    showToast(t.toastDownloaded, 'success');
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
    const url = URL.createObjectURL(new Blob([jsonStr], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = getFileNameFn('json');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    showToast(t.toastDownloaded, 'success');
  };

  const handleUploadToSupabase = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showToast(t.toastLoginRequired, 'error');
        return;
      }

      const jsonData = JSON.stringify(collectFormData(), null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const file = new File([blob], getFileNameFn('json'), { type: 'application/json' });

      const fileName = `${user.id}/${Date.now()}_${getFileNameFn('json')}`;
      
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase.from('documents').insert({
        user_id: user.id,
        file_name: `Wartungsprotokoll Sprühkopf ${form.kundenNr || 'Export'}.json`,
        file_path: fileName,
        file_size: blob.size,
        file_type: 'application/json',
        description: 'Automatischer Export - Wartungsprotokoll Sprühkopf'
      });

      if (dbError) throw dbError;

      showToast(t.toastUploaded, 'success');
    } catch (err: unknown) {
      showToast(t.toastError + (err as Error).message, 'error');
    }
  };

  const handlePdf = () => {
    window.print();
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Styles
  // ─────────────────────────────────────────────────────────────────────────────
  const inp: React.CSSProperties = {
    padding: '8px 12px',
    border: '1px solid #ccc',
    borderRadius: 6,
    fontSize: 14,
    width: '100%',
    boxSizing: 'border-box'
  };

  const tbtn = (bg: string): React.CSSProperties => ({
    background: bg,
    color: '#fff',
    border: 'none',
    padding: '6px 12px',
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    flexShrink: 0
  });

  const checkLabel: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 13,
    cursor: 'pointer',
    userSelect: 'none'
  };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', margin: 0, padding: 0, minHeight: '100vh', background: '#f5f7fa' }}>
      {/* ── Toolbar ── */}
      <div id="toolbar" className="no-print" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999, background: '#1a2744', padding: '6px 10px', paddingLeft: 'max(10px, env(safe-area-inset-left))', paddingRight: 'max(10px, env(safe-area-inset-right))', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', boxSizing: 'border-box' }}>
        <button onClick={() => fileInputRef.current?.click()} style={tbtn('#8e24aa')}>{t.loadJson}</button>
        <button onClick={handlePdf} style={tbtn('#e8460a')}>{t.savePdf}</button>
        <button onClick={handleShare} style={tbtn('#1a7a3a')}>{t.shareJson}</button>
        <button onClick={handleSave} style={tbtn('#1a5fa8')}>{t.saveJson}</button>
        <button onClick={handleUploadToSupabase} style={tbtn('#2a7a2a')}>{t.uploadCloud}</button>
        <span className="toolbar-title" style={{ color: '#a8b8d8', fontSize: 9, flexShrink: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>{t.toolbarTitle}</span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <LangSwitcher current={lang} onChange={setLang} />
          <a href="/" style={{ ...tbtn('#1a5fa8'), textDecoration: 'none' }}>{t.home}</a>
        </div>
        <input ref={fileInputRef} type="file" accept=".json,.txt" style={{ display: 'none' }} onChange={handleLoad} />
      </div>

      {/* ── Main Content ── */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '60px 16px 40px', boxSizing: 'border-box' }}>
        <div style={{ background: '#fff', borderRadius: 12, padding: 32, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <h1 style={{ textAlign: 'center', fontSize: 24, fontWeight: 700, marginBottom: 24, color: '#1a2744' }}>{t.title}</h1>

          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#555' }}>{t.labelKundenNr}</label>
              <input type="text" style={inp} placeholder={t.placeholderKundenNr} value={form.kundenNr} onChange={e => setForm({ ...form, kundenNr: e.target.value })} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#555' }}>{t.labelKundenName}</label>
              <input type="text" style={inp} placeholder={t.placeholderKundenName} value={form.kundenName} onChange={e => setForm({ ...form, kundenName: e.target.value })} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#555' }}>{t.labelOrt}</label>
              <input type="text" style={inp} placeholder={t.placeholderOrt} value={form.ort} onChange={e => setForm({ ...form, ort: e.target.value })} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#555' }}>{t.labelMaschineTyp}</label>
              <input type="text" style={inp} placeholder={t.placeholderMaschineTyp} value={form.maschineTyp} onChange={e => setForm({ ...form, maschineTyp: e.target.value })} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#555' }}>{t.labelSerienNr}</label>
              <input type="text" style={inp} placeholder={t.placeholderSerienNr} value={form.serienNr} onChange={e => setForm({ ...form, serienNr: e.target.value })} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#555' }}>{t.labelBetriebsstunden}</label>
              <input type="text" style={inp} placeholder={t.placeholderBetriebsstunden} value={form.betriebsstunden} onChange={e => setForm({ ...form, betriebsstunden: e.target.value })} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#555' }}>{t.labelDatum}</label>
              <input type="date" style={inp} value={form.datum} onChange={e => setForm({ ...form, datum: e.target.value })} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#555' }}>{t.labelTechniker}</label>
              <input type="text" style={inp} placeholder={t.placeholderTechniker} value={form.techniker} onChange={e => setForm({ ...form, techniker: e.target.value })} />
            </div>
          </div>

          {/* Section 1 */}
          <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 32, marginBottom: 16, color: '#1a2744' }}>{t.sectionAllgemein}</h2>
          <div style={{ display: 'grid', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#555' }}>{t.labelVerschmutzungen}</label>
              <div style={{ display: 'flex', gap: 16 }}>
                <label style={checkLabel}>
                  <input type="radio" checked={form.verschmutzungen === 'io'} onChange={() => setForm({ ...form, verschmutzungen: 'io' })} />
                  {t.checkIO}
                </label>
                <label style={checkLabel}>
                  <input type="radio" checked={form.verschmutzungen === 'nio'} onChange={() => setForm({ ...form, verschmutzungen: 'nio' })} />
                  {t.checkNIO}
                </label>
                <label style={checkLabel}>
                  <input type="radio" checked={form.verschmutzungen === 'erledigt'} onChange={() => setForm({ ...form, verschmutzungen: 'erledigt' })} />
                  {t.checkErledigt}
                </label>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#555' }}>{t.labelOrdnung}</label>
              <div style={{ display: 'flex', gap: 16 }}>
                <label style={checkLabel}>
                  <input type="radio" checked={form.ordnung === 'io'} onChange={() => setForm({ ...form, ordnung: 'io' })} />
                  {t.checkIO}
                </label>
                <label style={checkLabel}>
                  <input type="radio" checked={form.ordnung === 'nio'} onChange={() => setForm({ ...form, ordnung: 'nio' })} />
                  {t.checkNIO}
                </label>
                <label style={checkLabel}>
                  <input type="radio" checked={form.ordnung === 'erledigt'} onChange={() => setForm({ ...form, ordnung: 'erledigt' })} />
                  {t.checkErledigt}
                </label>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#555' }}>{t.labelSchmierstellen}</label>
              <div style={{ display: 'flex', gap: 16 }}>
                <label style={checkLabel}>
                  <input type="radio" checked={form.schmierstellen === 'io'} onChange={() => setForm({ ...form, schmierstellen: 'io' })} />
                  {t.checkIO}
                </label>
                <label style={checkLabel}>
                  <input type="radio" checked={form.schmierstellen === 'nio'} onChange={() => setForm({ ...form, schmierstellen: 'nio' })} />
                  {t.checkNIO}
                </label>
                <label style={checkLabel}>
                  <input type="radio" checked={form.schmierstellen === 'erledigt'} onChange={() => setForm({ ...form, schmierstellen: 'erledigt' })} />
                  {t.checkErledigt}
                </label>
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 32, marginBottom: 16, color: '#1a2744' }}>{t.sectionSprühkopf}</h2>
          <div style={{ display: 'grid', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#555' }}>{t.labelDichtungen}</label>
              <div style={{ display: 'flex', gap: 16 }}>
                <label style={checkLabel}>
                  <input type="radio" checked={form.dichtungen === 'io'} onChange={() => setForm({ ...form, dichtungen: 'io' })} />
                  {t.checkIO}
                </label>
                <label style={checkLabel}>
                  <input type="radio" checked={form.dichtungen === 'nio'} onChange={() => setForm({ ...form, dichtungen: 'nio' })} />
                  {t.checkNIO}
                </label>
                <label style={checkLabel}>
                  <input type="radio" checked={form.dichtungen === 'erledigt'} onChange={() => setForm({ ...form, dichtungen: 'erledigt' })} />
                  {t.checkErledigt}
                </label>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#555' }}>{t.labelVerschleiß}</label>
              <div style={{ display: 'flex', gap: 16 }}>
                <label style={checkLabel}>
                  <input type="radio" checked={form.verschleiß === 'io'} onChange={() => setForm({ ...form, verschleiß: 'io' })} />
                  {t.checkIO}
                </label>
                <label style={checkLabel}>
                  <input type="radio" checked={form.verschleiß === 'nio'} onChange={() => setForm({ ...form, verschleiß: 'nio' })} />
                  {t.checkNIO}
                </label>
                <label style={checkLabel}>
                  <input type="radio" checked={form.verschleiß === 'erledigt'} onChange={() => setForm({ ...form, verschleiß: 'erledigt' })} />
                  {t.checkErledigt}
                </label>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#555' }}>{t.labelFunktion}</label>
              <div style={{ display: 'flex', gap: 16 }}>
                <label style={checkLabel}>
                  <input type="radio" checked={form.funktion === 'io'} onChange={() => setForm({ ...form, funktion: 'io' })} />
                  {t.checkIO}
                </label>
                <label style={checkLabel}>
                  <input type="radio" checked={form.funktion === 'nio'} onChange={() => setForm({ ...form, funktion: 'nio' })} />
                  {t.checkNIO}
                </label>
                <label style={checkLabel}>
                  <input type="radio" checked={form.funktion === 'erledigt'} onChange={() => setForm({ ...form, funktion: 'erledigt' })} />
                  {t.checkErledigt}
                </label>
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 32, marginBottom: 16, color: '#1a2744' }}>{t.sectionElektrik}</h2>
          <div style={{ display: 'grid', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#555' }}>{t.labelSicherungen}</label>
              <div style={{ display: 'flex', gap: 16 }}>
                <label style={checkLabel}>
                  <input type="radio" checked={form.sicherungen === 'io'} onChange={() => setForm({ ...form, sicherungen: 'io' })} />
                  {t.checkIO}
                </label>
                <label style={checkLabel}>
                  <input type="radio" checked={form.sicherungen === 'nio'} onChange={() => setForm({ ...form, sicherungen: 'nio' })} />
                  {t.checkNIO}
                </label>
                <label style={checkLabel}>
                  <input type="radio" checked={form.sicherungen === 'erledigt'} onChange={() => setForm({ ...form, sicherungen: 'erledigt' })} />
                  {t.checkErledigt}
                </label>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#555' }}>{t.labelVerkabelung}</label>
              <div style={{ display: 'flex', gap: 16 }}>
                <label style={checkLabel}>
                  <input type="radio" checked={form.verkabelung === 'io'} onChange={() => setForm({ ...form, verkabelung: 'io' })} />
                  {t.checkIO}
                </label>
                <label style={checkLabel}>
                  <input type="radio" checked={form.verkabelung === 'nio'} onChange={() => setForm({ ...form, verkabelung: 'nio' })} />
                  {t.checkNIO}
                </label>
                <label style={checkLabel}>
                  <input type="radio" checked={form.verkabelung === 'erledigt'} onChange={() => setForm({ ...form, verkabelung: 'erledigt' })} />
                  {t.checkErledigt}
                </label>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#555' }}>{t.labelSteuerung}</label>
              <div style={{ display: 'flex', gap: 16 }}>
                <label style={checkLabel}>
                  <input type="radio" checked={form.steuerung === 'io'} onChange={() => setForm({ ...form, steuerung: 'io' })} />
                  {t.checkIO}
                </label>
                <label style={checkLabel}>
                  <input type="radio" checked={form.steuerung === 'nio'} onChange={() => setForm({ ...form, steuerung: 'nio' })} />
                  {t.checkNIO}
                </label>
                <label style={checkLabel}>
                  <input type="radio" checked={form.steuerung === 'erledigt'} onChange={() => setForm({ ...form, steuerung: 'erledigt' })} />
                  {t.checkErledigt}
                </label>
              </div>
            </div>
          </div>

          {/* Section 4 */}
          <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 32, marginBottom: 16, color: '#1a2744' }}>{t.sectionAbschluss}</h2>
          <div style={{ display: 'grid', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#555' }}>{t.labelProbelauf}</label>
              <div style={{ display: 'flex', gap: 16 }}>
                <label style={checkLabel}>
                  <input type="radio" checked={form.probelauf === 'io'} onChange={() => setForm({ ...form, probelauf: 'io' })} />
                  {t.checkIO}
                </label>
                <label style={checkLabel}>
                  <input type="radio" checked={form.probelauf === 'nio'} onChange={() => setForm({ ...form, probelauf: 'nio' })} />
                  {t.checkNIO}
                </label>
                <label style={checkLabel}>
                  <input type="radio" checked={form.probelauf === 'erledigt'} onChange={() => setForm({ ...form, probelauf: 'erledigt' })} />
                  {t.checkErledigt}
                </label>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#555' }}>{t.labelBemerkungen}</label>
              <textarea style={{ ...inp, minHeight: 100, resize: 'vertical' }} placeholder={t.placeholderBemerkungen} value={form.bemerkungen} onChange={e => setForm({ ...form, bemerkungen: e.target.value })} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#555' }}>{t.labelUnterschrift}</label>
              <canvas ref={canvasRef} width={400} height={150} style={{ border: '1px solid #ccc', borderRadius: 6, width: '100%', maxWidth: 400, touchAction: 'none', cursor: 'crosshair' }} />
              <button onClick={clearSignature} style={{ marginTop: 8, padding: '6px 12px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Löschen</button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; padding: 0; }
          @page { margin: 1cm; }
        }
      `}</style>
    </div>
  );
}