import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Index from "./pages/Index";
import SearchPage from "./pages/SearchPage";
import RegisterDonor from "./pages/RegisterDonor";
import Dashboard from "./pages/Dashboard";
import StatsPage from "./pages/StatsPage";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";

import NgoLogin from "./pages/ngo/NgoLogin";
import NgoRegister from "./pages/ngo/NgoRegister";
import NgoDashboard from "./pages/ngo/NgoDashboard";
import NgoInventory from "./pages/ngo/NgoInventory";
import NgoRequests from "./pages/ngo/NgoRequests";
import NgoAnalytics from "./pages/ngo/NgoAnalytics";
import { AuthProvider, useAuth } from "./lib/AuthProvider";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { session, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}

const App = () => (
  <AuthProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/register-donor" element={<RegisterDonor />} />
                <Route path="/login" element={<Login />} />

                {/* NGO Routes */}
                <Route path="/ngo-login" element={<NgoLogin />} />
                <Route path="/ngo-register" element={<NgoRegister />} />
                <Route path="/ngo-dashboard" element={<ProtectedRoute><NgoDashboard /></ProtectedRoute>} />
                <Route path="/ngo-inventory" element={<ProtectedRoute><NgoInventory /></ProtectedRoute>} />
                <Route path="/ngo-requests" element={<ProtectedRoute><NgoRequests /></ProtectedRoute>} />
                <Route path="/ngo-analytics" element={<ProtectedRoute><NgoAnalytics /></ProtectedRoute>} />

                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route path="/stats" element={<StatsPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </AuthProvider>
);

export default App;
