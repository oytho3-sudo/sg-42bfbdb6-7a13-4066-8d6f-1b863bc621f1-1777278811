import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

type Props = {
  fileName: string                       // z.B. "Wartungsprotokoll_GS_Mueller_GmbH_M-77.json"
  loadContent: () => Promise<string>     // liefert den JSON-Text FRISCH aus Supabase (z.B. über fetchFreshFile → res.text())
  kunde?: string                         // optional – der Kunde wird normalerweise aus dem Dateinamen gelesen (Typ_Kunde_Nummer.json)
  compact?: boolean
  plain?: boolean                        // normaler <button> mit eigenem style (für die Toolbar der Protokollseiten)
  style?: React.CSSProperties
  disabled?: boolean
}

type ArchiveResult = { ok?: boolean; pfad?: string; abgebrochen?: boolean; error?: string }
type ElectronApi = { archiveJson?: (fileName: string, content: string, meta?: { kunde?: string }) => Promise<ArchiveResult> }
// Kein globales d.ts nötig: lokal typisierter Zugriff auf window.electronAPI
const holeApi = (): ElectronApi | undefined =>
  typeof window === 'undefined' ? undefined : (window as unknown as { electronAPI?: ElectronApi }).electronAPI

// Sichtbar nur in der Electron-App. Im Browser/Tablet rendert die Komponente nichts.
export default function ArchivButton({ fileName, loadContent, kunde, compact, plain, style, disabled }: Props) {
  const [verfuegbar, setVerfuegbar] = useState(false)
  const [busy, setBusy] = useState(false)
  useEffect(() => { setVerfuegbar(typeof holeApi()?.archiveJson === 'function') }, [])
  if (!verfuegbar) return null

  const archivieren = async () => {
    setBusy(true)
    try {
      const content = await loadContent()
      const api = holeApi()
      if (!api?.archiveJson) throw new Error('Archivieren ist nur in der GERLIEVA-Electron-App möglich')
      const r = await api.archiveJson(fileName, content, { kunde })
      if (r?.ok) alert('✅ Archiviert:\n' + r.pfad)
      else if (r?.abgebrochen) { /* Benutzer hat abgebrochen */ }
      else alert('❌ ' + (r?.error || 'Archivieren fehlgeschlagen'))
    } catch (e) {
      alert('❌ ' + (e instanceof Error ? e.message : String(e)))
    } finally { setBusy(false) }
  }
  const label = <>{busy ? '…' : '📦'}{compact ? '' : ' Archivieren'}</>
  if (plain) return <button type="button" onClick={archivieren} disabled={busy || disabled} style={{ ...style, opacity: (busy || disabled) ? 0.6 : 1 }} title="JSON im Server-Archiv ablegen (Kunde + Nr. müssen ausgefüllt sein)">{label}</button>
  return (
    <Button variant="outline" size="sm" onClick={archivieren} disabled={busy || disabled} title="JSON im Server-Archiv ablegen">{label}</Button>
  )
}
