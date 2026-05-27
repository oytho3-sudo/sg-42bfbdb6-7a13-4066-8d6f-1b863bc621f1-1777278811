import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { useEffect, useState } from "react";
import { UpdateToast } from "@/components/UpdateToast";
import { registerSW } from "@/lib/swUpdate";
import { useRouter } from "next/router";
import { AuthGuard } from "@/components/AuthGuard";
import { NavBar } from "@/components/NavBar";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    registerSW((reg) => {
      setRegistration(reg);
    });
  }, []);

  useEffect(() => {
    (window as any).__GEMINI_API_KEY__ = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
  }, []);

  const handleDismiss = () => {
    setRegistration(null);
  };

  // Öffentliche Routen (kein Login erforderlich)
  const publicRoutes = ["/login", "/404"];
  const isPublicRoute = publicRoutes.includes(router.pathname);

  return (
    <ThemeProvider>
      {isPublicRoute ? (
        <Component {...pageProps} />
      ) : (
        <AuthGuard>
          <NavBar />
          <Component {...pageProps} />
        </AuthGuard>
      )}
      <Toaster />
      <UpdateToast 
        registration={registration} 
        onDismiss={handleDismiss}
      />
    </ThemeProvider>
  );
}