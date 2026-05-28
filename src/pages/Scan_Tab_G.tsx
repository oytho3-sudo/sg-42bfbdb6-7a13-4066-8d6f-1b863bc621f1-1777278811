import React, { useState, useEffect, useRef } from 'react';

// Da Tesseract über das Skript-Tag geladen wird, deklarieren wir es für TypeScript
declare const Tesseract: any;

interface FileEntry {
  id: string;
  name: string;
  data: string;
}

interface SavedFile {
  name: string;
  content: string;
  date: string;
  size: number;
}

interface TableEntry {
  artNr: string;
  desc: string;
}

export default function MultiScanner() {
  const [filesArray, setFilesArray] = useState<FileEntry[]>([]);
  const [savedFiles, setSavedFiles] = useState<SavedFile[]>([]);
  const [progressVisible, setProgressVisible] = useState(false);
  const [progressLabel, setProgressLabel] = useState('Lese Text…');
  const [progressWidth, setProgressWidth] = useState('0%');
  const [showResults, setShowResults] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  const [resultText, setResultText] = useState('');
  const [tableEntries, setTableEntries] = useState<TableEntry[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [scanDisabled, setScanDisabled] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('gerlieva_scanner_files');
      if (stored) setSavedFiles(JSON.parse(stored));
    } catch (e) {
      console.error(e);
    }

    if (typeof Tesseract === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/tesseract.js@4.1.4/dist/tesseract.min.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    setScanDisabled(filesArray.length === 0);
  }, [filesArray]);

  const showToast = (msg: string, color?: string) => {
    const el = document.getElementById('toast');
    if (el) {
      el.textContent = msg;
      el.style.background = color || '#2e7d32';
      el.style.display = 'block';
      setTimeout(() => { el.style.display = 'none'; }, 2400);
    }
  };

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => { setErrorMsg(''); }, 10000);
  };

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          const newFile: FileEntry = {
            id: Date.now() + Math.random().toString(36).substr(2, 5),
            name: file.name,
            data: e.target.result as string
          };
          setFilesArray(prev => [...prev, newFile]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (id: string) => {
    setFilesArray(prev => prev.filter(f => f.id !== id));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (dropZoneRef.current) {
      dropZoneRef.current.style.borderColor = '#1a2744';
      dropZoneRef.current.style.background = '#f0f3fa';
    }
  };

  const handleDragLeave = () => {
    if (dropZoneRef.current) {
      dropZoneRef.current.style.borderColor = '';
      dropZoneRef.current.style.background = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (dropZoneRef.current) {
      dropZoneRef.current.style.borderColor = '';
      dropZoneRef.current.style.background = '';
    }
    addFiles(e.dataTransfer.files);
  };

  const handleScan = async () => {
    if (!filesArray.length) return;
    setErrorMsg('');

    let att = 0;
    while (typeof Tesseract === 'undefined' && att++ < 40) {
      await new Promise(r => setTimeout(r, 300));
    }
    if (typeof Tesseract === 'undefined') {
      showError('Tesseract.js konnte nicht geladen werden. Bitte Internetverbindung prüfen und Seite neu laden.');
      return;
    }

    setScanDisabled(true);
    setProgressVisible(true);
    setProgressWidth('2%');
    let combinedText = '';

    for (let i = 0; i < filesArray.length; i++) {
      const file = filesArray[i];
      setProgressLabel(`Scanne Bild [${i + 1}/${filesArray.length}]: ${file.name}…`);
      setProgressWidth(Math.round((i / filesArray.length) * 80) + '%');
      try {
        const result = await Tesseract.recognize(file.data, 'deu', {
          logger: (m: any) => {
            if (m.status === 'recognizing text') {
              const base = Math.round((i / filesArray.length) * 80);
              const add = Math.round(m.progress * 80 / filesArray.length);
              setProgressWidth((base + add) + '%');
            }
          }
        });
        combinedText += `--- DATEI: ${file.name} ---\n${result.data.text.trim()}\n\n`;
      } catch (err) {
        combinedText += `--- DATEI: ${file.name} ---\n[Fehler bei der Texterkennung]\n\n`;
      }
    }

    setProgressWidth('100%');
    setProgressLabel('Fertig!');
    setTimeout(() => { setProgressVisible(false); }, 700);

    const finalTxt = combinedText.trim();
    setResultText(finalTxt);
    setShowResults(true);
    setShowRaw(true);

    buildTable(finalTxt);
    setScanDisabled(false);

    setTimeout(() => {
      document.getElementById('results-container')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const buildTable = (textToProcess: string) => {
    if (!textToProcess.trim()) return;

    const blocks = textToProcess.split(/--- DATEI:/i);
    let entries: TableEntry[] = [];

    blocks.forEach(block => {
      if (!block.trim()) return;
      const artikelMatch = block.match(/Artikel[-.\s]*Nr\.?:?\s*([A-Z0-9\-\.\/\_]+)/i);
      let beschreibung = '';
      const lines = block.split('\n').map(l => l.trim()).filter(l => l.length > 0);

      for (let i = 0; i < lines.length; i++) {
        if (lines[i].match(/Kred[-.\s]*Art/i)) {
          if (lines[i].match(/Kred[-.\s]*Art[-.\s]*Nr/i)) {
            if (lines[i + 1]) beschreibung = lines[i + 1];
          } else {
            let inline = lines[i].replace(/Kred[-.\s]*Art:?/i, '').trim();
            if (inline.length > 2) beschreibung = inline;
            else if (lines[i + 1]) beschreibung = lines[i + 1];
          }
          if (beschreibung.match(/Kred[-.\s]*Art[-.\s]*Nr/i)) beschreibung = '';
          beschreibung = beschreibung.replace(/(Lagerplatz|Menge|Preis|Bestand|Status).*/i, '').trim();
          break;
        }
      }
      if (artikelMatch) entries.push({ artNr: artikelMatch[1].trim(), desc: beschreibung || '-' });
    });

    setTableEntries(entries);
  };

  const handleRecalc = () => {
    buildTable(resultText);
    showToast('Tabelle neu berechnet!');
  };

  const copyTable = () => {
    if (tableEntries.length === 0) return;
    let s = 'Artikelnummer\tBeschreibung\n';
    tableEntries.forEach(e => {
      s += `${e.artNr}\t${e.desc}\n`;
    });
    navigator.clipboard.writeText(s)
      .then(() => showToast('Kopiert! In Excel einfügen: Strg+V'))
      .catch(() => { showToast('Kopieren fehlgeschlagen', '#c0392b'); });
  };

  const transferList = () => {
    showToast('Funktion "In Teileliste übertragen" ist aktuell noch nicht aktiv.', '#1a2744');
  };

  const saveJson = () => {
    if (tableEntries.length === 0) {
      showToast('Keine Tabellendaten zum Speichern vorhanden.', '#c0392b');
      return;
    }

    const dataArray = tableEntries.map(e => ({
      artikelnummer: e.artNr,
      beschreibung: e.desc
    }));

    const jsonContent = JSON.stringify(dataArray, null, 2);
    const ts = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const name = `daten_${ts.getFullYear()}${pad(ts.getMonth() + 1)}${pad(ts.getDate())}_${pad(ts.getHours())}${pad(ts.getMinutes())}.json`;

    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);

    showToast('✅ .json-Datei heruntergeladen!');
  };

  const saveTxt = () => {
    const txt = resultText.trim();
    if (!txt) { showToast('Kein Text vorhanden.', '#c0392b'); return; }
    const ts = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const name = `scan_${ts.getFullYear()}${pad(ts.getMonth() + 1)}${pad(ts.getDate())}_${pad(ts.getHours())}${pad(ts.getMinutes())}.txt`;

    const newFile: SavedFile = { name, content: txt, date: ts.toLocaleString('de-DE'), size: txt.length };
    const updatedFiles = [newFile, ...savedFiles];
    setSavedFiles(updatedFiles);
    try { localStorage.setItem('gerlieva_scanner_files', JSON.stringify(updatedFiles)); } catch (e) { console.error(e); }

    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);

    showToast('✅ Gespeichert & heruntergeladen!');
  };

  const handleClear = () => {
    setFilesArray([]);
    setResultText('');
    setShowResults(false);
    setShowRaw(false);
    setErrorMsg('');
  };

  const dlFile = (index: number) => {
    const f = savedFiles[index];
    const blob = new Blob([f.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = f.name;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Download gestartet.');
  };

  const delFile = (index: number) => {
    const updated = savedFiles.filter((_, i) => i !== index);
    setSavedFiles(updated);
    try { localStorage.setItem('gerlieva_scanner_files', JSON.stringify(updated)); } catch (e) { console.error(e); }
    showToast('Datei gelöscht.', '#888');
  };

  const openCam = async () => {
    try {
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (e: any) {
      setCameraActive(false);
      showError('Kamera nicht verfügbar: ' + e.message);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL('image/png');
        const newFile: FileEntry = { id: Date.now() + 'cam', name: 'kamera_' + Date.now() + '.png', data: dataUrl };
        setFilesArray(prev => [...prev, newFile]);
        closeCamera();
        showToast('Bild aufgenommen!');
      }
    }
  };

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  return (
    <>
      <style>{`
        body { font-family: Arial, sans-serif; font-size: 13px; background: #f5f5f5; color: #000; min-height: 100vh; padding-top: 52px; margin:0; }
        @media print { .no-print { display:none !important; } body { padding-top:0; background:#fff; } .print-container { box-shadow:none; border-radius:0; padding:8px; } .toolbar { display:none !important; } th, td { font-size:9px !important; padding:2px 4px !important; } textarea { font-size:9px !important; } }
        @media (max-width: 600px) { input, textarea, select { font-size:16px !important; } }
      `}</style>

      <div className="toolbar no-print" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999, background: '#1a2744', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
        <span className="toolbar-title" style={{ color: '#fff', fontSize: '12px', fontWeight: 'bold', marginRight: 'auto', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          MultiScanner & Tabelle · GERLIEVA Sprühtechnik GmbH
        </span>
        <button className="tbtn" id="cam-btn" style={{ border: 'none', padding: '8px 12px', fontSize: '11px', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer', fontFamily: 'Arial, sans-serif', color: '#fff', minHeight: '36px', whiteSpace: 'nowrap', background: 'rgba(255,255,255,0.15)', transition: 'background 0.15s' }} onClick={openCam}>📷 Kamera</button>
        <button className="tbtn green" id="save-btn" disabled={resultText.trim() === ''} style={{ border: 'none', padding: '8px 12px', fontSize: '11px', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer', fontFamily: 'Arial, sans-serif', color: '#fff', minHeight: '36px', whiteSpace: 'nowrap', background: resultText.trim() === '' ? 'rgba(255,255,255,0.15)' : '#2e7d32', transition: 'background 0.15s' }} onClick={saveTxt}>💾 TXT speichern</button>
      </div>

      <div className="print-body" style={{ maxWidth: '1000px', margin: '0 auto', padding: '16px 12px 40px' }}>
        <div className="print-container" style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', padding: '16px' }}>

          <div className="doc-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: '2px solid #000', marginBottom: '14px', paddingBottom: '8px' }}>
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: 'bold', fontFamily: 'Arial, sans-serif', margin: 0 }}>MultiScanner &amp; Tabelle</h1>
              <div className="sub" style={{ fontSize: '11px', color: '#555', marginTop: '2px' }}>OCR · Texterkennung · Artikelliste</div>
            </div>
            <div className="gerlieva-badge" style={{ fontSize: '11px', fontWeight: 'bold', color: '#1a2744', textAlign: 'right', lineHeight: 1.4 }}>
              GERLIEVA<br />Sprühtechnik GmbH
            </div>
          </div>

          {errorMsg && (
            <div className="error-box" id="error-box" style={{ display: 'block', background: '#fff0f0', border: '1px solid #e57373', borderRadius: '4px', padding: '10px 12px', marginBottom: '10px', fontSize: '12px', color: '#c0392b', lineHeight: 1.5 }}>
              {errorMsg}
            </div>
          )}

          <div className="section" style={{ marginBottom: '14px', border: '1px solid #ccc', borderRadius: '4px', background: '#fff', overflow: 'hidden' }}>
            <div className="section-title" style={{ fontSize: '13px', fontWeight: 'bold', background: '#f0f0f0', padding: '7px 10px', borderBottom: '1px solid #ccc' }}>
              <span className="step-nr" style={{ display: 'inline-block', background: '#1a2744', color: '#fff', borderRadius: '50%', width: '20px', height: '20px', fontSize: '11px', fontWeight: 'bold', textAlign: 'center', lineHeight: '20px', marginRight: '6px', flexShrink: 0 }}>1</span>
              Bilder hinzufügen
            </div>
            <div className="section-body" style={{ padding: '10px 12px' }}>
              <div className="btn-row" style={{ marginTop: 0, display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button className="btn" style={{ flex: 1, padding: '10px', fontSize: '13px', border: '1px solid #bbb', background: '#fff', color: '#000', cursor: 'pointer', fontFamily: 'inherit', borderRadius: '4px', minHeight: '36px', fontWeight: 'bold' }} onClick={() => fileInputRef.current?.click()}>🖼️ Galerie / Datei auswählen</button>
              </div>
              <input type="file" id="file-input" ref={fileInputRef} accept="image/*" multiple style={{ display: 'none' }} onChange={(e) => addFiles(e.target.files)} />

              <div style={{ marginTop: '10px' }}>
                <div className="upload-zone" id="drop-zone" ref={dropZoneRef} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} style={{ border: '2px dashed #bbb', borderRadius: '4px', background: '#fafafa', padding: '18px', textAlign: 'center', cursor: 'pointer', position: 'relative' }}>
                  <input type="file" id="drop-input" ref={dropInputRef} accept="image/*" multiple style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} onChange={(e) => addFiles(e.target.files)} />
                  <div style={{ fontSize: '24px', marginBottom: '4px' }}>📄</div>
                  <strong style={{ fontSize: '13px' }}>Dateien hierher ziehen</strong>
                  <p style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>oder oben auf „Galerie" tippen</p>
                </div>
              </div>

              <div className="preview-zone" id="preview-zone" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
                {filesArray.map(file => (
                  <div key={file.id} className="preview-card" style={{ position: 'relative', border: '1px solid #ccc', background: '#f0f0f0', padding: '4px', borderRadius: '3px' }}>
                    <img src={file.data} alt={file.name} style={{ width: '64px', height: '64px', objectFit: 'cover', display: 'block', borderRadius: '2px' }} />
                    <button className="remove-btn" style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#c0392b', color: '#fff', border: 'none', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', cursor: 'pointer', lineHeight: '18px', textAlign: 'center' }} onClick={() => removeFile(file.id)}>✕</button>
                  </div>
                ))}
              </div>

              {progressVisible && (
                <div id="progress-wrap" style={{ display: 'block', marginTop: '10px', background: '#f0f0f0', border: '1px solid #ccc', borderRadius: '4px', padding: '10px' }}>
                  <div id="progress-label" style={{ fontSize: '12px', color: '#555', marginBottom: '4px' }}>{progressLabel}</div>
                  <div className="bar-bg" style={{ background: '#ddd', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                    <div className="bar-fill" id="bar-fill" style={{ background: '#1a2744', height: '100%', width: progressWidth, transition: 'width 0.1s' }}></div>
                  </div>
                </div>
              )}

              <div className="btn-row" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
                <button className="btn primary" id="scan-btn" disabled={scanDisabled} onClick={handleScan} style={{ flex: 1, fontSize: '13px', padding: '10px', border: '1px solid #1a2744', background: scanDisabled ? '#aaa' : '#1a2744', color: '#fff', cursor: scanDisabled ? 'not-allowed' : 'pointer', fontFamily: 'inherit', borderRadius: '4px', minHeight: '36px', fontWeight: 'bold' }}>
                  🔍 Texte per OCR auslesen
                </button>
              </div>
            </div>
          </div>

          {showResults && (
            <div className="section" id="results-container" style={{ marginBottom: '14px', border: '1px solid #ccc', borderRadius: '4px', background: '#fff', overflow: 'hidden' }}>
              <div className="section-title" style={{ fontSize: '13px', fontWeight: 'bold', background: '#f0f0f0', padding: '7px 10px', borderBottom: '1px solid #ccc' }}>
                <span className="step-nr" style={{ display: 'inline-block', background: '#1a2744', color: '#fff', borderRadius: '50%', width: '20px', height: '20px', fontSize: '11px', fontWeight: 'bold', textAlign: 'center', lineHeight: '20px', marginRight: '6px', flexShrink: 0 }}>2</span>
                Generierte Tabelle
              </div>
              <div className="section-body" style={{ padding: '10px 12px' }}>
                <div className="tbl-wrap" style={{ overflowX: 'auto', marginBottom: '10px' }}>
                  <table id="resultTable" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <thead>
                      <tr>
                        <th style={{ width: '35%', background: '#e0e0e0', border: '1px solid #000', padding: '5px 8px', textAlign: 'center', fontSize: '11px', fontWeight: 'bold' }}>Artikelnummer</th>
                        <th style={{ background: '#e0e0e0', border: '1px solid #000', padding: '5px 8px', textAlign: 'center', fontSize: '11px', fontWeight: 'bold' }}>Beschreibung</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableEntries.length === 0 ? (
                        <tr><td colSpan={2} className="no-data" style={{ textAlign: 'center', color: '#aaa', padding: '16px', fontStyle: 'italic', border: '1px solid #ccc' }}>Keine Artikeldaten erkannt. Rohtext oben prüfen.</td></tr>
                      ) : (
                        tableEntries.map((e, idx) => (
                          <tr key={idx}>
                            <td className="artnr" style={{ border: '1px solid #ccc', padding: '6px 8px', fontSize: '12px', verticalAlign: 'top', fontWeight: 'bold', color: '#1a2744', background: idx % 2 === 1 ? '#fafafa' : '#fff' }}>{e.artNr}</td>
                            <td style={{ border: '1px solid #ccc', padding: '6px 8px', fontSize: '12px', verticalAlign: 'top', background: idx % 2 === 1 ? '#fafafa' : '#fff' }}>{e.desc}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="btn-row" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
                  <button className="btn success" id="copy-table-btn" onClick={copyTable} style={{ flex: 1, padding: '10px', fontSize: '13px', border: '1px solid #2e7d32', background: '#2e7d32', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', borderRadius: '4px', minHeight: '36px', fontWeight: 'bold' }}>
                    📋 Tabelle für Excel kopieren (Tab-getrennt)
                  </button>
                  <button className="btn" id="transfer-list-btn" onClick={transferList} style={{ flex: 1, padding: '10px', fontSize: '13px', border: '1px solid #bbb', background: '#fff', color: '#000', cursor: 'pointer', fontFamily: 'inherit', borderRadius: '4px', minHeight: '36px', fontWeight: 'bold' }}>
                    📋 In Teileliste übertragen
                  </button>
                  <button className="btn primary" id="save-json-btn" onClick={saveJson} style={{ flex: 1, padding: '10px', fontSize: '13px', border: '1px solid #1a2744', background: '#1a2744', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', borderRadius: '4px', minHeight: '36px', fontWeight: 'bold' }}>
                    💾 Speichern (.json)
                  </button>
                </div>
              </div>
            </div>
          )}

          {showRaw && (
            <div className="section" id="raw-section" style={{ marginBottom: '14px', border: '1px solid #ccc', borderRadius: '4px', background: '#fff', overflow: 'hidden' }}>
              <div className="section-title" style={{ fontSize: '13px', fontWeight: 'bold', background: '#f0f0f0', padding: '7px 10px', borderBottom: '1px solid #ccc' }}>
                <span className="step-nr" style={{ display: 'inline-block', background: '#1a2744', color: '#fff', borderRadius: '50%', width: '20px', height: '20px', fontSize: '11px', fontWeight: 'bold', textAlign: 'center', lineHeight: '20px', marginRight: '6px', flexShrink: 0 }}>3</span>
                Erkannter Rohtext (zur Kontrolle)
              </div>
              <div className="section-body" style={{ padding: '10px 12px' }}>
                <textarea id="result-text" spellCheck="false" value={resultText} onChange={(e) => setResultText(e.target.value)} style={{ width: '100%', minHeight: '150px', border: '1px solid #ccc', borderRadius: '4px', padding: '8px', fontFamily: 'Arial, sans-serif', fontSize: '12px', resize: 'vertical', outline: 'none', background: '#fff', color: '#000' }}></textarea>
                <div className="btn-row" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
                  <button className="btn" id="recalc-btn" onClick={handleRecalc} style={{ flex: 1, border: '1px solid #bbb', background: '#fff', color: '#000', padding: '8px 14px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '12px', borderRadius: '4px', minHeight: '36px', fontWeight: 'bold' }}>🔄 Tabelle aus Rohtext neu erstellen</button>
                  <button className="btn" id="clear-btn" onClick={handleClear} style={{ border: '1px solid #bbb', background: '#fff', color: '#000', padding: '8px 14px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '12px', borderRadius: '4px', minHeight: '36px', fontWeight: 'bold' }}>✕ Alles zurücksetzen</button>
                </div>
              </div>
            </div>
          )}

          {savedFiles.length > 0 && (
            <div className="section" id="files-section" style={{ marginBottom: '14px', border: '1px solid #ccc', borderRadius: '4px', background: '#fff', overflow: 'hidden' }}>
              <div className="section-title" style={{ fontSize: '13px', fontWeight: 'bold', background: '#f0f0f0', padding: '7px 10px', borderBottom: '1px solid #ccc' }}>
                <span className="step-nr" style={{ display: 'inline-block', background: '#1a2744', color: '#fff', borderRadius: '50%', width: '20px', height: '20px', fontSize: '11px', fontWeight: 'bold', textAlign: 'center', lineHeight: '20px', marginRight: '6px', flexShrink: 0 }}>4</span>
                Gespeicherte Textdateien
              </div>
              <div className="section-body" id="file-list" style={{ padding: '10px 12px' }}>
                {savedFiles.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 0', borderBottom: '1px solid #eee' }}>
                    <span style={{ fontSize: '18px' }}>📄</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 'bold', fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.name}</div>
                      <div style={{ fontSize: '11px', color: '#888' }}>{f.date} · {f.size} Zeichen</div>
                    </div>
                    <button className="btn" style={{ fontSize: '11px', padding: '5px 9px', border: '1px solid #bbb', background: '#fff', borderRadius: '4px', fontWeight: 'bold', minHeight: 'auto' }} onClick={() => dlFile(i)}>⬇</button>
                    <button className="btn" style={{ fontSize: '11px', padding: '5px 9px', color: '#c0392b', borderColor: '#c0392b', background: '#fff', borderRadius: '4px', fontWeight: 'bold', minHeight: 'auto' }} onClick={() => delFile(i)}>✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      <div id="camera-wrap" className={cameraActive ? 'active' : ''} style={{ display: cameraActive ? 'flex' : 'none', position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 8000, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '16px' }}>
        <video id="video-el" ref={videoRef} autoPlay playsInline style={{ maxWidth: '100%', maxHeight: '65vh', border: '2px solid #fff', borderRadius: '4px' }}></video>
        <canvas id="snap-canvas" ref={canvasRef} style={{ display: 'none' }}></canvas>
        <div className="cam-controls" style={{ display: 'flex', gap: '10px' }}>
          <button className="btn primary" id="capture-btn" onClick={capturePhoto} style={{ border: '1px solid #1a2744', background: '#1a2744', color: '#fff', padding: '8px 14px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '12px', borderRadius: '4px', minHeight: '36px', fontWeight: 'bold' }}>📸 Aufnehmen</button>
          <button className="btn" id="close-cam-btn" onClick={closeCamera} style={{ background: '#c0392b', color: '#fff', borderColor: '#c0392b', padding: '8px 14px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '12px', borderRadius: '4px', minHeight: '36px', fontWeight: 'bold' }}>✕ Schließen</button>
        </div>
      </div>

      <div id="toast" style={{ position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', background: '#2e7d32', color: '#fff', padding: '8px 18px', fontWeight: 'bold', fontSize: '12px', borderRadius: '4px', display: 'none', zIndex: 10000, whiteSpace: 'nowrap', boxShadow: '0 2px 8px rgba(0,0,0,0.25)' }}></div>
    </>
  );
}