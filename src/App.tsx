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
import RoleSelection from "./pages/RoleSelection";
import RegisterPatient from "./pages/RegisterPatient";

import HospitalRegister from "./pages/hospital/HospitalRegister";
import HospitalLayout from "./components/hospital/HospitalLayout";
import DashboardOverview from "./pages/hospital/DashboardOverview";
import BloodRequests from "./pages/hospital/BloodRequests";
import AcceptedRequests from "./pages/hospital/AcceptedRequests";
import BloodInventory from "./pages/hospital/BloodInventory";
import EmergencyAlerts from "./pages/hospital/EmergencyAlerts";
import HospitalResources from "./pages/hospital/HospitalResources";
import HospitalProfile from "./pages/hospital/HospitalProfile";

import PatientLayout from "./components/patient/PatientLayout";
import PatientDashboard from "./pages/patient/PatientDashboard";
import RequestBlood from "./pages/patient/RequestBlood";
import MyRequests from "./pages/patient/MyRequests";
import AIAssistant from "./pages/patient/AIAssistant";
import NearbyHelp from "./pages/patient/NearbyHelp";

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
          <Routes>
            {/* ── Patient Portal (dedicated layout, no global Navbar/Footer) ── */}
            <Route
              path="/patient"
              element={
                <ProtectedRoute>
                  <PatientLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<PatientDashboard />} />
              <Route path="request" element={<RequestBlood />} />
              <Route path="requests" element={<MyRequests />} />
              <Route path="ai" element={<AIAssistant />} />
              <Route path="nearby" element={<NearbyHelp />} />
              <Route index element={<Navigate to="dashboard" replace />} />
            </Route>

            {/* ── Hospital Portal ── */}
            <Route
              path="/hospital"
              element={
                <ProtectedRoute>
                  <HospitalLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<DashboardOverview />} />
              <Route path="requests" element={<BloodRequests />} />
              <Route path="accepted" element={<AcceptedRequests />} />
              <Route path="inventory" element={<BloodInventory />} />
              <Route path="alerts" element={<EmergencyAlerts />} />
              <Route path="resources" element={<HospitalResources />} />
              <Route path="profile" element={<HospitalProfile />} />
              <Route index element={<Navigate to="dashboard" replace />} />
            </Route>

            {/* ── Public / Global Layout ── */}
            <Route
              path="*"
              element={
                <div className="flex min-h-screen flex-col">
                  <Navbar />
                  <main className="flex-1">
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/search" element={<SearchPage />} />
                      <Route path="/register-donor" element={<RegisterDonor />} />
                      <Route path="/select-role" element={<RoleSelection />} />
                      <Route path="/register-patient" element={<RegisterPatient />} />
                      <Route path="/register-hospital" element={<HospitalRegister />} />
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
              }
            />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </AuthProvider>
);

export default App;

