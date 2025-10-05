import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { InvoiceList } from "@/components/InvoiceList";
import { Button } from "@/components/ui/button";
import { FileText, LogOut, Loader2 } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, logout, user } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-primary rounded-lg shadow-glow">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Invoice Manager</h1>
                <p className="text-sm text-muted-foreground">
                  Welcome back, {user?.username}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={logout} className="gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-80 py-8">
        <InvoiceList />
      </main>

      {/* Footer */}
      <footer className="border-t bg-card mt-20">
        <div className="container mx-auto px-4 py-6 text-right text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Jayed</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
