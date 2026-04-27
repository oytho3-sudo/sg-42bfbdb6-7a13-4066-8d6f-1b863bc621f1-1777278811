import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import Link from "next/link";

export default function ProtokollePage() {
  return (
    <>
      <SEO
        title="Protokolle - Lokale APK"
        description="Verwalten Sie Ihre Wartungsprotokolle"
      />
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Link href="/">
              <Button variant="outline" className="mb-4">
                ← Zurück zur Startseite
              </Button>
            </Link>
            <h1 className="text-4xl font-bold mb-2">Protokolle</h1>
            <p className="text-muted-foreground">
              Verwalten und öffnen Sie Ihre Wartungsprotokolle
            </p>
          </div>

          <div className="grid gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle>Wartungsprotokoll_GS</CardTitle>
                    
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Link href="/Wartungsprotokoll_GS">
                  <Button className="w-full">
                    Protokoll öffnen
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}