'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

// ═══════════════════════════════════════════════════════════════════════════════
// i18n
// ═══════════════════════════════════════════════════════════════════════════════

type Lang = 'de' | 'en' | 'fr';

const translations = {
  de: {
    loadJson:        '📂 JSON laden',
    savePdf:         '⬇ Als PDF speichern',
    shareJson:       '📤 JSON teilen',
    saveJson:        '💾 JSON speichern',
    toolbarTitle:    'Material- und Teileliste · GERLIEVA Sprühtechnik GmbH',
    home:            '🏠 Home',
    pdfAlert:        'Im Druckdialog:\n1. Drucker → "Als PDF speichern"\n2. Weitere Einstellungen → "Hintergrundgrafiken" ✓ aktivieren\n→ Dann sind alle Farben im PDF enthalten.',
    toastSaved:      '✅ JSON gespeichert!',
    toastDownloaded: '✅ JSON heruntergeladen!',
    toastLoaded:     '✅ Datei erfolgreich geladen!',
    toastInvalid:    'Ungültige JSON-Datei',
    toastError:      'Fehler: ',
    toastLoadError:  'Fehler beim Laden: ',
    docTitle:        'Material- und Teileliste',
    thPos:           'Pos.',
    thBeschreibung:  'Beschreibung',
    thArtikelNr:     'Artikel-Nr.',
    thStk:           'Stk.',
    btnAddRow:       '+ Zeile hinzufügen',
    colScan:         '📷',
  },
  en: {
    loadJson:        '📂 Load JSON',
    savePdf:         '⬇ Save as PDF',
    shareJson:       '📤 Share JSON',
    saveJson:        '💾 Save JSON',
    toolbarTitle:    'Materials & Parts List · GERLIEVA Sprühtechnik GmbH',
    home:            '🏠 Home',
    pdfAlert:        'In the print dialog:\n1. Printer → "Save as PDF"\n2. More settings → enable "Background graphics" ✓\n→ This ensures all colours appear in the PDF.',
    toastSaved:      '✅ JSON saved!',
    toastDownloaded: '✅ JSON downloaded!',
    toastLoaded:     '✅ File loaded successfully!',
    toastInvalid:    'Invalid JSON file',
    toastError:      'Error: ',
    toastLoadError:  'Error loading file: ',
    docTitle:        'Materials & Parts List',
    thPos:           'Pos.',
    thBeschreibung:  'Description',
    thArtikelNr:     'Part No.',
    thStk:           'Qty.',
    btnAddRow:       '+ Add row',
    colScan:         '📷',
  },
  fr: {
    loadJson:        '📂 Charger JSON',
    savePdf:         '⬇ Enregistrer en PDF',
    shareJson:       '📤 Partager JSON',
    saveJson:        '💾 Sauvegarder JSON',
    toolbarTitle:    'Liste des matériaux · GERLIEVA Sprühtechnik GmbH',
    home:            '🏠 Accueil',
    pdfAlert:        "Dans la boîte de dialogue d'impression :\n1. Imprimante → \"Enregistrer en PDF\"\n2. Paramètres → activer \"Graphiques d'arrière-plan\" ✓",
    toastSaved:      '✅ JSON enregistré !',
    toastDownloaded: '✅ JSON téléchargé !',
    toastLoaded:     '✅ Fichier chargé avec succès !',
    toastInvalid:    'Fichier JSON invalide',
    toastError:      'Erreur : ',
    toastLoadError:  'Erreur de chargement : ',
    docTitle:        'Liste des matériaux et pièces',
    thPos:           'Pos.',
    thBeschreibung:  'Description',
    thArtikelNr:     'N° de pièce',
    thStk:           'Qté.',
    btnAddRow:       '+ Ajouter ligne',
    colScan:         '📷',
  },
} satisfies Record<Lang, Record<string, string>>;

type T = typeof translations['de'];

// ═══════════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════════

interface Teil {
  id: number;
  pos: string;
  beschreibung: string;
  artikelnr: string;
  stk: string;
}

interface SaveData {
  version: number;
  ts: string;
  teile: Teil[];
}

interface CropRect { x: number; y: number; w: number; h: number; }
interface ExtractedFields { artikelnr: string; beschreibung: string; stk: string; }
type ScanStep = 'source' | 'crop' | 'process' | 'result';

// ═══════════════════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════════════════

function buildFileName(ext: string): string {
  return 'Teileliste_' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '.' + ext;
}

function extractFields(text: string): ExtractedFields {
  const rawLines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  let artikelnr = '', beschreibung = '', stk = '1';
  const lines = rawLines
    .map(l => l.replace(/Lagerplatz\s*:.*$/i, '').replace(/PE-\d+[-\d]*/gi, '').trim())
    .filter(l => l.length > 0);
  for (let i = 0; i < rawLines.length; i++) {
    const m = rawLines[i].match(/Artikel[-\s]*Nr\.?\s*:?\s*([A-Z0-9][A-Z0-9\-\/\.]{3,})/i);
    if (m) { artikelnr = m[1].trim(); break; }
  }
  let descStart = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/(?:Kred|Ihre)[-\s]*Art/i.test(lines[i])) {
      const next = lines[i + 1] || '';
      descStart = /^[A-Z0-9]{4,}[-\/]/.test(next) ? i + 2 : i + 1;
      break;
    }
  }
  if (descStart >= 0) {
    const skip = /^(?:Artikel|Kred|Ihre|GERLIEVA|GmbH|Fon|Menge|QTY|Einlagerung|UL.?FILE|PE-\d)/i;
    for (let i = descStart; i < lines.length; i++) {
      const l = lines[i];
      if (!l || skip.test(l)) break;
      if (/^[-=|:\.]+$/.test(l)) continue;
      beschreibung = l; break;
    }
  }
  beschreibung = beschreibung.replace(/\s{2,}/g, ' ').replace(/^[^A-Za-zÄÖÜäöüß]+/, '').trim();
  for (const line of rawLines) {
    const m = line.match(/(?:Menge|QTY|St[uü]ck?\.?)[:.]?\s*(\d+)/i);
    if (m) { stk = m[1]; break; }
  }
  return { artikelnr: artikelnr || '', beschreibung: beschreibung || '', stk: stk || '1' };
}

function boxBlur(imageData: ImageData, w: number, h: number, r: number): Uint8ClampedArray {
  const src = new Uint8ClampedArray(imageData.data);
  const out = new Uint8ClampedArray(src.length);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let sum = 0, count = 0;
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          const nx = x + dx, ny = y + dy;
          if (nx >= 0 && nx < w && ny >= 0 && ny < h) { sum += src[(ny * w + nx) * 4]; count++; }
        }
      }
      const idx = (y * w + x) * 4;
      out[idx] = out[idx + 1] = out[idx + 2] = sum / count;
      out[idx + 3] = 255;
    }
  }
  return out;
}

function enhanceImage(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const imageData = ctx.getImageData(0, 0, w, h);
  const d = imageData.data;
  for (let i = 0; i < d.length; i += 4) {
    const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    let v = gray / 255;
    v = v < 0.5 ? 2 * v * v : 1 - Math.pow(-2 * v + 2, 2) / 2;
    v = Math.min(1, Math.max(0, (v - 0.5) * 1.8 + 0.5));
    d[i] = d[i + 1] = d[i + 2] = v * 255;
  }
  const blurred = boxBlur(imageData, w, h, 1);
  for (let i = 0; i < d.length; i += 4) {
    const diff = d[i] - blurred[i];
    d[i] = d[i + 1] = d[i + 2] = Math.min(255, Math.max(0, d[i] + diff * 1.5));
  }
  ctx.putImageData(imageData, 0, 0);
}

function pickBestBarcode(codes: Array<{ rawValue?: string; format?: string }>): string {
  if (!codes.length) return '';
  const formatScore: Record<string, number> = {
    code_128: 5,
    ean_13: 4,
    ean_8: 3,
    upc_a: 3,
    upc_e: 3,
    code_39: 2,
    code_93: 2,
    itf: 2,
    qr_code: 1,
    data_matrix: 1,
    aztec: 1,
    pdf417: 1,
  };
  const ranked = codes
    .map(c => ({ value: (c.rawValue || '').trim(), score: formatScore[(c.format || '').toLowerCase()] || 0 }))
    .filter(c => c.value.length > 2)
    .sort((a, b) => (b.score - a.score) || (b.value.length - a.value.length));
  return ranked[0]?.value || '';
}

function createInitialTeile(): Teil[] {
  return Array.from({ length: 20 }, (_, i) => ({ id: i + 1, pos: String(i + 1), beschreibung: '', artikelnr: '', stk: '' }));
}

// ═══════════════════════════════════════════════════════════════════════════════
// Flags & Language Switcher
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
// Scanner
// ═══════════════════════════════════════════════════════════════════════════════

interface ScannerProps {
  onClose: () => void;
  targetRowId: number | null;
  teile: Teil[];
  onInsertIntoRow: (id: number, fields: ExtractedFields) => void;
  onAddAndInsert: (fields: ExtractedFields) => void;
}

function Scanner({ onClose, targetRowId, teile, onInsertIntoRow, onAddAndInsert }: ScannerProps) {
  const [step, setStep]           = useState<ScanStep>('source');
  const [status, setStatus]       = useState('');
  const [extracted, setExtracted] = useState<ExtractedFields | null>(null);
  const [rawText, setRawText]     = useState('');

  const cropCanvasRef = useRef<HTMLCanvasElement>(null);
  const procCanvasRef = useRef<HTMLCanvasElement>(null);
  const cameraInputRef  = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const origImageRef  = useRef<HTMLImageElement | null>(null);
  const cropRectRef   = useRef<CropRect | null>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef  = useRef<{ x: number; y: number } | null>(null);

  const drawCrop = useCallback(() => {
    const canvas = cropCanvasRef.current, img = origImageRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const cr = cropRectRef.current;
    if (cr) {
      const scale = (canvas as any)._scale || 1;
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, cr.x / scale, cr.y / scale, cr.w / scale, cr.h / scale, cr.x, cr.y, cr.w, cr.h);
      ctx.strokeStyle = '#8e24aa'; ctx.lineWidth = 2;
      ctx.strokeRect(cr.x, cr.y, cr.w, cr.h);
      ctx.fillStyle = '#8e24aa';
      [[cr.x, cr.y], [cr.x + cr.w, cr.y], [cr.x, cr.y + cr.h], [cr.x + cr.w, cr.y + cr.h]].forEach(([cx, cy]) => ctx.fillRect(cx - 5, cy - 5, 10, 10));
    }
  }, []);

  const setupCropCanvas = useCallback(() => {
    const img = origImageRef.current, canvas = cropCanvasRef.current;
    if (!img || !canvas) return;
    const maxW = Math.min(window.innerWidth - 32, 600);
    const scale = maxW / img.naturalWidth;
    canvas.width = img.naturalWidth * scale;
    canvas.height = img.naturalHeight * scale;
    (canvas as any)._scale = scale;
    drawCrop();
  }, [drawCrop]);

  const loadImage = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      origImageRef.current = img;
      cropRectRef.current = null;
      URL.revokeObjectURL(url);
      setStep('crop');
      requestAnimationFrame(() => setupCropCanvas());
    };
    img.onerror = () => URL.revokeObjectURL(url);
    img.src = url;
  }, [setupCropCanvas]);

  useEffect(() => {
    if (step !== 'crop') return;
    const onResize = () => setupCropCanvas();
    setupCropCanvas();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [step, setupCropCanvas]);

  const getCanvasPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = cropCanvasRef.current!;
    const r = canvas.getBoundingClientRect();
    const src = 'touches' in e ? e.touches[0] : e;
    return { x: src.clientX - r.left, y: src.clientY - r.top };
  };

  const updateCrop = (pos: { x: number; y: number }) => {
    const start = dragStartRef.current; if (!start) return;
    const x = Math.min(start.x, pos.x), y = Math.min(start.y, pos.y);
    const w = Math.abs(pos.x - start.x), h = Math.abs(pos.y - start.y);
    if (w > 10 && h > 10) cropRectRef.current = { x, y, w, h };
    drawCrop();
  };

  const processImage = async (img: HTMLImageElement, cr: CropRect | null) => {
    setStep('process'); setStatus('⏳ Bild wird vorbereitet…');

    const sx = cr ? cr.x : 0, sy = cr ? cr.y : 0;
    const sw = cr ? cr.w : img.naturalWidth, sh = cr ? cr.h : img.naturalHeight;
    const sc = sw > 1200 ? 1200 / sw : 1;
    const targetW = Math.round(sw * sc), targetH = Math.round(sh * sc);

    const rawCanvas = document.createElement('canvas');
    rawCanvas.width = targetW; rawCanvas.height = targetH;
    rawCanvas.getContext('2d')!.drawImage(img, sx, sy, sw, sh, 0, 0, targetW, targetH);

    // Vorschau anzeigen
    const pc = procCanvasRef.current;
    if (pc) {
      const maxPW = Math.min(window.innerWidth - 32, 500);
      pc.width = maxPW; pc.height = Math.round(targetH * maxPW / targetW);
      pc.getContext('2d')!.drawImage(rawCanvas, 0, 0, pc.width, pc.height);
    }

    // Barcode-Erkennung
    let barcodeNr = '';
    if ('BarcodeDetector' in window) {
      try {
        const det = new (window as any).BarcodeDetector({ formats: ['qr_code','ean_13','ean_8','code_128','code_39','code_93','itf','upc_a','upc_e','data_matrix','aztec','pdf417'] });
        const codes = await det.detect(rawCanvas);
        barcodeNr = pickBestBarcode(codes);
      } catch (_) {}
    }

    // ── OCR/Barcode Verarbeitung (offline) ────────────────────────────────────
    if (barcodeNr) {
      setExtracted({ artikelnr: barcodeNr, beschreibung: '', stk: '1' });
      setRawText(''); setStep('result'); return;
    }

    setStatus('⏳ Offline-Texterkennung…');
    await new Promise(r => setTimeout(r, 30));

    const work = document.createElement('canvas');
    work.width = targetW; work.height = targetH;
    const wctx = work.getContext('2d')!;
    wctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetW, targetH);
    enhanceImage(wctx, targetW, targetH);

    const Tesseract = (window as any).Tesseract;
    if (!Tesseract) {
      setStatus('⚠️ Keine Internetverbindung und Tesseract nicht geladen.'); return;
    }
    try {
      const opts = { tessedit_pageseg_mode: '6', preserve_interword_spaces: '1' };
      const [res1, res2] = await Promise.all([
        Tesseract.recognize(rawCanvas, 'deu+eng', { logger: (m: any) => { if (m.status === 'recognizing text') setStatus(`⏳ OCR: ${Math.round(m.progress * 100)}%`); }, ...opts }),
        Tesseract.recognize(work, 'deu+eng', { logger: () => {}, ...opts }),
      ]);
      const raw1 = res1.data.text.trim(), raw2 = res2.data.text.trim();
      const raw = raw1.length >= raw2.length ? raw1 : raw2;
      if (!raw) { setStatus('⚠️ Kein Text erkannt.'); return; }
      const fields = extractFields(raw);
      setExtracted(fields); setRawText(raw); setStep('result');
    } catch (err: any) {
      setStatus('⚠️ OCR Fehler: ' + err.message);
    }
  };

  const handleConfirm = async () => {
    const img = origImageRef.current!;
    await processImage(img, cropRectRef.current);
  };

  const sbtn = (bg: string): React.CSSProperties => ({ background: bg, color: '#fff', border: 'none', padding: '6px 14px', borderRadius: 4, fontSize: 11, cursor: 'pointer', fontWeight: 'bold', minHeight: 36, touchAction: 'manipulation' });

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.9)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: '#1a2744', color: '#fff', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <span style={{ flex: 1, fontSize: 14, fontWeight: 'bold' }}>📷 Scanner</span>
        <button onClick={onClose} style={sbtn('#555')}>✕ Schließen</button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>

        {step === 'source' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { icon: '📷', title: 'Foto aufnehmen', sub: 'Kamera öffnen und Etikett fotografieren', camera: true },
              { icon: '🖼', title: 'Bild aus Galerie', sub: 'Vorhandenes Foto verwenden', camera: false },
            ].map((opt, i) => (
              <div key={i}
                onClick={() => { if (opt.camera) cameraInputRef.current?.click(); else galleryInputRef.current?.click(); }}
                style={{ background: '#2a2a4e', border: '2px solid #444', borderRadius: 8, padding: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, color: '#fff' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#8e24aa')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#444')}
              >
                <span style={{ fontSize: 26 }}>{opt.icon}</span>
                <div><strong style={{ display: 'block', fontSize: 12, marginBottom: 2 }}>{opt.title}</strong><span style={{ fontSize: 10, color: '#aaa' }}>{opt.sub}</span></div>
              </div>
            ))}
            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }}
              onChange={e => { const f = e.target.files?.[0]; if (f) loadImage(f); e.target.value = ''; }} />
            <input ref={galleryInputRef} type="file" accept="image/*" style={{ display: 'none' }}
              onChange={e => { const f = e.target.files?.[0]; if (f) loadImage(f); e.target.value = ''; }} />
          </div>
        )}

        {step === 'crop' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
            <div style={{ color: '#aaa', fontSize: 10, textAlign: 'center' }}>📐 Etikett markieren: Bereich mit dem Finger / der Maus ziehen</div>
            <canvas ref={cropCanvasRef}
              style={{ border: '2px solid #8e24aa', borderRadius: 6, cursor: 'crosshair', maxWidth: '100%', touchAction: 'none' }}
              onMouseDown={e => { isDraggingRef.current = true; dragStartRef.current = getCanvasPos(e); cropRectRef.current = null; }}
              onMouseMove={e => { if (!isDraggingRef.current) return; updateCrop(getCanvasPos(e)); }}
              onMouseUp={() => { isDraggingRef.current = false; }}
              onTouchStart={e => { e.preventDefault(); isDraggingRef.current = true; dragStartRef.current = getCanvasPos(e); cropRectRef.current = null; }}
              onTouchMove={e => { e.preventDefault(); if (!isDraggingRef.current) return; updateCrop(getCanvasPos(e)); }}
              onTouchEnd={() => { isDraggingRef.current = false; }}
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { cropRectRef.current = null; drawCrop(); }} style={sbtn('#555')}>↺ Zurücksetzen</button>
              <button onClick={handleConfirm} style={{ ...sbtn('#8e24aa'), padding: '10px 24px', fontSize: 12 }}>✓ Erkennen</button>
            </div>
          </div>
        )}

        {step === 'process' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
            <div style={{ color: '#ccc', fontSize: 11, textAlign: 'center' }}>{status}</div>
            <canvas ref={procCanvasRef} style={{ maxWidth: '100%', borderRadius: 6, border: '1px solid #555' }} />
          </div>
        )}

        {step === 'result' && extracted && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ background: '#2a2a4e', border: '1px solid #8e24aa', borderRadius: 6, padding: 10, display: 'grid', gridTemplateColumns: '110px 1fr', gap: '4px 10px' }}>
              {[['Beschreibung:', extracted.beschreibung || '—', '#fff'], ['Artikel-Nr.:', extracted.artikelnr || '—', '#c084fc'], ['Stk.:', extracted.stk || '—', '#fff']].map(([lbl, val, color]) => (
                <><span key={lbl + 'l'} style={{ color: '#aaa', fontSize: 10, alignSelf: 'center' }}>{lbl}</span><span key={lbl + 'v'} style={{ color, fontSize: 11, fontWeight: 'bold', wordBreak: 'break-all' }}>{val}</span></>
              ))}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {targetRowId != null ? (
                <>
                  <button onClick={() => { onInsertIntoRow(targetRowId, extracted); onClose(); }} style={{ ...sbtn('#2a7a2a'), padding: '10px 20px', fontSize: 13 }}>✓ Eintragen</button>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {(['beschreibung', 'artikelnr', 'stk'] as const).map((f, i) => (
                      <button key={f} onClick={() => onInsertIntoRow(targetRowId, { ...extracted, [f]: extracted[f] })} style={sbtn('#444')}>
                        ✎ Nur {['Beschreibung', 'Artikel-Nr.', 'Stk.'][i]}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <button
                  onClick={() => { const free = teile.find(t => !t.beschreibung && !t.artikelnr); if (free) onInsertIntoRow(free.id, extracted); else onAddAndInsert(extracted); onClose(); }}
                  style={{ ...sbtn('#2a7a2a'), padding: '10px 20px', fontSize: 13 }}
                >
                  {teile.find(t => !t.beschreibung && !t.artikelnr) ? '✓ In nächste freie Zeile' : '✓ Neue Zeile hinzufügen'}
                </button>
              )}
              <button onClick={() => { navigator.clipboard?.writeText(rawText); }} style={sbtn('#444')}>📋 Rohtext</button>
            </div>
            <button onClick={() => setStep('source')} style={sbtn('#8e24aa')}>🔄 Erneut scannen</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Print Styles
// ═══════════════════════════════════════════════════════════════════════════════

const printStyles = `
  html { overflow-x: hidden; -webkit-overflow-scrolling: touch; }
  body { overflow-x: hidden; overflow-y: auto; -webkit-overflow-scrolling: touch; }
  @media (prefers-color-scheme: dark) {
    input, textarea, select {
      background-color: white !important; color: #000 !important;
      -webkit-text-fill-color: #000 !important; color-scheme: light !important;
    }
  }
  @media screen and (max-width: 600px) {
    input[type="text"] { font-size: 16px !important; }
  }
  @media screen and (max-width: 900px) and (orientation: landscape) {
    .toolbar-title { display: none !important; }
  }
  @media print {
    .no-print { display: none !important; }
    @page { margin: 8mm 10mm; }
    body { padding: 0 !important; font-size: 9px !important; background: white; }
    .print-body { padding: 0 !important; background: white !important; }
    .print-container { box-shadow: none !important; padding: 8px !important; margin-top: 0 !important; border-radius: 0 !important; }
    h1 { font-size: 13px !important; margin: 0 0 2px !important; }
    h2 { font-size: 10px !important; margin: 0 0 4px !important; padding: 4px 6px !important; }
    p  { font-size: 8px !important; margin: 0 !important; }
    th, td { padding: 2px 3px !important; font-size: 8.5px !important; }
    input[type="text"] { padding: 1px 2px !important; font-size: 8.5px !important; }
    tr { page-break-inside: avoid !important; break-inside: avoid !important; }
    thead { display: table-header-group; }
  }
`;

// ═══════════════════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════════════════

export default function Teileliste() {
  const [lang, setLang]     = useState<Lang>('de');
  const t: T                 = translations[lang];
  const [teile, setTeile]   = useState<Teil[]>(createInitialTeile);
  const [scannerOpen, setScannerOpen]     = useState(false);
  const [scanTargetId, setScanTargetId]   = useState<number | null>(null);
  const [toast, setToast]   = useState<{ msg: string; type: 'success' | 'error' | ''; visible: boolean }>({ msg: '', type: '', visible: false });
  const [toolbarH, setToolbarH] = useState(52);
  const toolbarRef   = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nextIdRef    = useRef(21);

  // Dynamisches marginTop
  useEffect(() => {
    const toolbar = toolbarRef.current; if (!toolbar) return;
    const ro = new ResizeObserver(() => setToolbarH(toolbar.offsetHeight));
    ro.observe(toolbar);
    return () => ro.disconnect();
  }, []);

  // Tesseract laden
  useEffect(() => {
    if (!(window as any).Tesseract) {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/tesseract.js/4.1.1/tesseract.min.js';
      document.head.appendChild(s);
    }
  }, []);

  // ── Toast ──────────────────────────────────────────────────────────────────
  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type, visible: true });
    setTimeout(() => setToast(p => ({ ...p, visible: false })), 2500);
  };

  // ── Table helpers ──────────────────────────────────────────────────────────
  const updateTeil = (id: number, field: keyof Teil, value: string) =>
    setTeile(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));

  const addRow = () => {
    const pos = teile.length + 1;
    setTeile(prev => [...prev, { id: nextIdRef.current++, pos: String(pos), beschreibung: '', artikelnr: '', stk: '' }]);
  };

  const insertIntoRow = (id: number, fields: ExtractedFields) =>
    setTeile(prev => prev.map(t => t.id !== id ? t : {
      ...t,
      beschreibung: fields.beschreibung || t.beschreibung,
      artikelnr:    fields.artikelnr    || t.artikelnr,
      stk:          fields.stk          || t.stk,
    }));

  const addAndInsert = (fields: ExtractedFields) => {
    const id = nextIdRef.current++;
    setTeile(prev => [...prev, { id, pos: String(prev.length + 1), beschreibung: fields.beschreibung || '', artikelnr: fields.artikelnr || '', stk: fields.stk || '' }]);
  };

  // ── JSON I/O ───────────────────────────────────────────────────────────────
  const collectData = (): SaveData => ({ version: 1, ts: new Date().toISOString(), teile });

  const applyData = (data: SaveData) => {
    if (!data || data.version !== 1 || !Array.isArray(data.teile)) { showToast(t.toastInvalid, 'error'); return; }
    setTeile(data.teile);
    nextIdRef.current = Math.max(...data.teile.map(te => te.id), 0) + 1;
    showToast(t.toastLoaded, 'success');
  };

  // ── Toolbar actions ────────────────────────────────────────────────────────
  const handlePdf = () => { alert(t.pdfAlert); window.print(); };

  const handleSaveJson = () => {
    try {
      const blob = new Blob([JSON.stringify(collectData(), null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = buildFileName('json');
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      showToast(t.toastSaved, 'success');
    } catch (err: unknown) { showToast(t.toastError + (err as Error).message, 'error'); }
  };

  const handleShareJson = async () => {
    const jsonStr = JSON.stringify(collectData(), null, 2);
    const fileName = buildFileName('json').replace(/\.json$/, '.txt');
    const blob = new Blob([jsonStr], { type: 'text/plain' });
    const file = new File([blob], fileName, { type: 'text/plain' });
    try {
      if (typeof navigator.share === 'function' && typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
        await navigator.share({ title: 'Teileliste GERLIEVA', files: [file] });
        return;
      }
    } catch (e) { if ((e as Error).name === 'AbortError') return; }
    const url = URL.createObjectURL(new Blob([jsonStr], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = buildFileName('json');
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    showToast(t.toastDownloaded, 'success');
  };

  const handleLoadJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try { applyData(JSON.parse(ev.target?.result as string)); }
      catch (err: unknown) { showToast(t.toastLoadError + (err as Error).message, 'error'); }
    };
    reader.readAsText(file); e.target.value = '';
  };

  // ── Styles ─────────────────────────────────────────────────────────────────
  const tbtn = (bg: string): React.CSSProperties => ({
    border: 'none', padding: '8px 12px', fontSize: 11, fontWeight: 'bold', borderRadius: 4,
    cursor: 'pointer', fontFamily: 'Arial, sans-serif', color: '#fff', background: bg,
    minHeight: 36, touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent',
  });

  const thStyle: React.CSSProperties = { border: '1px solid #000', padding: 4, textAlign: 'left', fontSize: 10, background: '#e0e0e0', fontWeight: 'bold' };
  const tdStyle = (even: boolean): React.CSSProperties => ({ border: '1px solid #000', padding: 4, fontSize: 10, background: even ? '#f9f9f9' : 'white' });

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{printStyles}</style>

      {/* ── Toolbar ── */}
      <div ref={toolbarRef} className="no-print" style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999, background: '#1a2744',
        padding: '8px 12px',
        paddingLeft: 'max(12px, env(safe-area-inset-left))',
        paddingRight: 'max(12px, env(safe-area-inset-right))',
        display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap',
      }}>
        <button onClick={() => fileInputRef.current?.click()} style={tbtn('#8e24aa')}>{t.loadJson}</button>
        <button onClick={handlePdf}        style={tbtn('#e8460a')}>{t.savePdf}</button>
        <button onClick={handleShareJson}  style={tbtn('#1a7a3a')}>{t.shareJson}</button>
        <button onClick={handleSaveJson}   style={tbtn('#1a5fa8')}>{t.saveJson}</button>
        <span style={{ color: '#a8b8d8', fontSize: 9 }} className="toolbar-title">{t.toolbarTitle}</span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <LangSwitcher current={lang} onChange={setLang} />
          <a href="/" style={{ ...tbtn('#1a5fa8'), textDecoration: 'none' }}>{t.home}</a>
        </div>
        <input ref={fileInputRef} type="file" accept=".json,.txt" style={{ display: 'none' }} onChange={handleLoadJson} />
      </div>

      {/* ── Scanner Overlay ── */}
      {scannerOpen && (
        <Scanner
          onClose={() => { setScannerOpen(false); setScanTargetId(null); }}
          targetRowId={scanTargetId}
          teile={teile}
          onInsertIntoRow={insertIntoRow}
          onAddAndInsert={addAndInsert}
        />
      )}

      {/* ── Page body ── */}
      <div style={{
        fontFamily: 'Arial, sans-serif', fontSize: 13, background: '#f5f5f5', minHeight: '100vh',
        padding: '12px 12px 32px',
        paddingLeft: 'max(12px, env(safe-area-inset-left))',
        paddingRight: 'max(12px, env(safe-area-inset-right))',
        paddingBottom: 'max(32px, env(safe-area-inset-bottom))',
        paddingTop: toolbarH + 12,
        maxWidth: 1000, margin: '0 auto', boxSizing: 'border-box',
      }} className="print-body">
        <div style={{ background: 'white', padding: 16, borderRadius: 8, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }} className="print-container">

          {/* Header */}
          <div style={{ borderBottom: '2px solid #000', marginBottom: 15, paddingBottom: 8 }}>
            <h1 style={{ fontSize: 16, fontWeight: 'bold', margin: 0 }}>GERLIEVA Sprühtechnik GmbH</h1>
            <p style={{ fontSize: 9, color: '#666', margin: '4px 0 0' }}>Tiergartenstraße 8 · 79423 Heitersheim · Tel. +49 7634 56912-0</p>
          </div>
          <h2 style={{ fontSize: 18, marginBottom: 15, background: 'transparent', padding: 0, fontWeight: 'bold' }}>{t.docTitle}</h2>

          {/* Teile-Tabelle */}
          <div style={{ marginBottom: 15, border: '1px solid #ccc', padding: 10, borderRadius: 4, background: 'white' }}>
            <h2 style={{ fontSize: 14, marginBottom: 10, background: '#f0f0f0', padding: 8, borderRadius: 4 }}>Teile</h2>
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
                <thead>
                  <tr>
                    <th style={{ ...thStyle, width: 50 }}>{t.thPos}</th>
                    <th style={thStyle}>{t.thBeschreibung}</th>
                    <th style={{ ...thStyle, width: 140 }}>{t.thArtikelNr}</th>
                    <th style={{ ...thStyle, width: 50 }}>{t.thStk}</th>
                    <th style={{ ...thStyle, width: 38, textAlign: 'center' }} className="no-print">{t.colScan}</th>
                  </tr>
                </thead>
                <tbody>
                  {teile.map((teil, idx) => (
                    <tr key={teil.id}>
                      {(['pos', 'beschreibung', 'artikelnr', 'stk'] as const).map(field => (
                        <td key={field} style={tdStyle(idx % 2 === 1)}>
                          <input
                            type="text"
                            value={teil[field]}
                            onChange={e => updateTeil(teil.id, field, e.target.value)}
                            style={{ width: '100%', border: 'none', padding: 2, background: 'transparent', fontSize: 10, outline: 'none', fontFamily: 'Arial, sans-serif', boxSizing: 'border-box' }}
                            onFocus={e => { e.target.style.outline = '1px solid #4CAF50'; e.target.style.background = '#fffef0'; }}
                            onBlur={e => { e.target.style.outline = 'none'; e.target.style.background = 'transparent'; }}
                          />
                        </td>
                      ))}
                      <td style={{ ...tdStyle(idx % 2 === 1), textAlign: 'center', padding: 2 }} className="no-print">
                        <button
                          onClick={() => { setScanTargetId(teil.id); setScannerOpen(true); }}
                          title="Scannen"
                          style={{ background: '#8e24aa', border: 'none', padding: '3px 7px', fontSize: 9, fontWeight: 'bold', borderRadius: 3, cursor: 'pointer', color: '#fff', touchAction: 'manipulation' }}
                        >📷</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button onClick={addRow} className="no-print"
              style={{ marginTop: 10, padding: '5px 14px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: 4, fontSize: 11, cursor: 'pointer' }}
            >{t.btnAddRow}</button>
          </div>

        </div>
      </div>

      <Toast msg={toast.msg} type={toast.type} visible={toast.visible} />
    </>
  );
}
