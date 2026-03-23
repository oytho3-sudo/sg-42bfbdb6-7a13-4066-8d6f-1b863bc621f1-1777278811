import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { FileText } from "lucide-react";

export default function Home() {
  return (
    <>
      <SEO
        title="GERLIEVA - Startseite"
        description="Willkommen bei der GERLIEVA App"
      />
      
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container px-4 py-16">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-primary to-magenta bg-clip-text text-transparent">
                GERLIEVA App
              </h1>
              <p className="text-xl text-muted-foreground">
                Wartungsprotokolle und Serviceberichte
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Link href="/ServiceberichtPage">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto text-lg px-8 py-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all"
                >
                  <FileText className="mr-2 h-5 w-5" />
                  Service-Bericht erstellen
                </Button>
              </Link>

              <Link href="/protokolle">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="w-full sm:w-auto text-lg px-8 py-6 border-2 hover:bg-magenta/10 hover:border-magenta shadow-lg hover:shadow-xl transition-all"
                >
                  <FileText className="mr-2 h-5 w-5" />
                  Protokolle
                </Button>
              </Link>

              <Link href="/Teileliste">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="w-full sm:w-auto text-lg px-8 py-6 border-2 hover:bg-magenta/10 hover:border-magenta shadow-lg hover:shadow-xl transition-all"
                >
                  <FileText className="mr-2 h-5 w-5" />
                  Teileliste
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}