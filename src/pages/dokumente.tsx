import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import { AuthGuard } from "@/components/AuthGuard";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { FileText, Upload, Trash2, Download, Loader2, Home, Share2, Users } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface Document {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  uploaded_at: string;
  description: string | null;
  user_id: string;
  shared_with_all: boolean;
  profiles?: any;
}

export default function DokumentePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setCurrentUserId(user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role === "Admin") {
        setIsAdmin(true);
      }

      await loadDocuments(user.id, profile?.role === "Admin");
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const loadDocuments = async (userId: string, adminMode: boolean) => {
    try {
      let query = supabase
        .from("documents")
        .select(`
          *,
          profiles(full_name)
        `)
        .order("uploaded_at", { ascending: false });

      // Admin sieht alle Dokumente, normale User nur eigene + freigegebene
      if (!adminMode) {
        query = query.or(`user_id.eq.${userId},shared_with_all.eq.true`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setDocuments(data as any);
    } catch (error: any) {
      toast({
        title: "Fehler beim Laden",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/jpeg",
        "image/png",
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Ungültiger Dateityp",
          description: "Nur PDF, Word-Dokumente und Bilder sind erlaubt.",
          variant: "destructive",
        });
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Datei zu groß",
          description: "Maximale Dateigröße: 10 MB",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "Keine Datei ausgewählt",
        description: "Bitte wählen Sie eine Datei aus.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Nicht angemeldet");

      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase.from("documents").insert({
        user_id: user.id,
        file_name: selectedFile.name,
        file_path: fileName,
        file_size: selectedFile.size,
        file_type: selectedFile.type,
        description: description || null,
      });

      if (dbError) throw dbError;

      toast({
        title: "Upload erfolgreich",
        description: "Dokument wurde hochgeladen.",
      });

      setSelectedFile(null);
      setDescription("");
      await loadDocuments(user.id, isAdmin);
    } catch (error: any) {
      toast({
        title: "Upload fehlgeschlagen",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleToggleShare = async (doc: Document) => {
    try {
      const { error } = await supabase
        .from("documents")
        .update({ shared_with_all: !doc.shared_with_all })
        .eq("id", doc.id);

      if (error) throw error;

      toast({
        title: doc.shared_with_all ? "Freigabe entfernt" : "Freigegeben",
        description: doc.shared_with_all 
          ? "Dokument ist jetzt privat." 
          : "Dokument ist jetzt für alle sichtbar.",
      });

      if (currentUserId) {
        await loadDocuments(currentUserId, isAdmin);
      }
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDownload = async (doc: Document) => {
    try {
      const { data, error } = await supabase.storage
        .from("documents")
        .download(doc.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      toast({
        title: "Download fehlgeschlagen",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (doc: Document) => {
    if (!confirm(`Dokument "${doc.file_name}" wirklich löschen?`)) return;

    try {
      const { error: storageError } = await supabase.storage
        .from("documents")
        .remove([doc.file_path]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from("documents")
        .delete()
        .eq("id", doc.id);

      if (dbError) throw dbError;

      toast({
        title: "Gelöscht",
        description: "Dokument wurde entfernt.",
      });

      if (currentUserId) {
        await loadDocuments(currentUserId, isAdmin);
      }
    } catch (error: any) {
      toast({
        title: "Löschen fehlgeschlagen",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const isOwnDocument = (doc: Document) => {
    return doc.user_id === currentUserId;
  };

  return (
    <AuthGuard>
      <SEO
        title="Dokumente | Wartungsprotokoll"
        description="Dokumentenverwaltung für Wartungsprotokolle"
      />
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Dokumente</h1>
                <p className="text-muted-foreground">
                  {isAdmin ? "Alle Dokumente verwalten und freigeben" : "Laden Sie PDFs und Dokumente hoch"}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => router.push("/")}
              >
                <Home className="mr-2 h-4 w-4" />
                Zur Startseite
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Neues Dokument hochladen</CardTitle>
                <CardDescription>
                  Erlaubte Formate: PDF, Word, JPG, PNG (max. 10 MB)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="file">Datei auswählen</Label>
                  <Input
                    id="file"
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleFileSelect}
                    disabled={uploading}
                  />
                  {selectedFile && (
                    <p className="text-sm text-muted-foreground">
                      Ausgewählt: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Beschreibung (optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Notizen zum Dokument..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={uploading}
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || uploading}
                  className="w-full"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Wird hochgeladen...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Hochladen
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  {isAdmin ? "Alle Dokumente" : "Dokumente"}
                </CardTitle>
                <CardDescription>
                  {documents.length} {documents.length === 1 ? "Dokument" : "Dokumente"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                  </div>
                ) : documents.length === 0 ? (
                  <Alert>
                    <FileText className="h-4 w-4" />
                    <AlertDescription>
                      Noch keine Dokumente vorhanden.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-3">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <FileText className="h-8 w-8 text-primary shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium truncate">{doc.file_name}</p>
                              {doc.shared_with_all && (
                                <Badge variant="secondary" className="shrink-0">
                                  <Users className="h-3 w-3 mr-1" />
                                  Freigegeben
                                </Badge>
                              )}
                              {!isOwnDocument(doc) && (
                                <Badge variant="outline" className="shrink-0">
                                  Von: {doc.profiles?.full_name || "Unbekannt"}
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <p>{formatFileSize(doc.file_size)} · {new Date(doc.uploaded_at).toLocaleDateString("de-DE")}</p>
                              {doc.description && (
                                <p className="truncate">{doc.description}</p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          {isAdmin && (
                            <Button
                              variant={doc.shared_with_all ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleToggleShare(doc)}
                              title={doc.shared_with_all ? "Freigabe entfernen" : "Für alle freigeben"}
                            >
                              <Share2 className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(doc)}
                            title="Herunterladen"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          {(isAdmin || isOwnDocument(doc)) && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(doc)}
                              title="Löschen"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}