import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ThemeSwitch } from "@/components/ThemeSwitch";
import { LogOut, Shield, User as UserIcon, Users, FileText } from "lucide-react";
import type { User } from "@supabase/supabase-js";

export function NavBar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);
    if (session?.user) {
      await fetchUserProfile(session.user.id);
    }
  };

  const fetchUserProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("role, full_name")
      .eq("id", userId)
      .single();

    console.log("🔍 DEBUG - User Profile Data:", data);
    console.log("🔍 DEBUG - User Role:", data?.role);
    
    if (data) {
      setUserRole(data.role);
      setUserName(data.full_name);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (!user) return null;

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-6">
            <Link href="/protokolle" className="text-sm font-medium hover:text-primary transition-colors">
              Protokolle
            </Link>
            <Link href="/dokumente" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Dokumente
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {userRole === "Admin" && (
              <Button 
                onClick={() => router.push("/admin/users")} 
                variant="outline"
                className="flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                Benutzerverwaltung
              </Button>
            )}

            <Button 
              onClick={() => router.push("/profil")} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <UserIcon className="h-4 w-4" />
              {userName || "Profil"}
            </Button>

            <ThemeSwitch />

            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Abmelden
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}