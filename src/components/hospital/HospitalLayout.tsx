import { Outlet, Navigate } from "react-router-dom";
import HospitalSidebar from "@/components/hospital/HospitalSidebar";
import HospitalTopNav from "@/components/hospital/HospitalTopNav";
import HospitalBottomNav from "@/components/hospital/HospitalBottomNav";
import { useAuth } from "@/lib/AuthProvider";

const HospitalLayout = () => {
  const { session } = useAuth();
  
  // Verify user is actually a registered hospital
  if (session?.user?.user_metadata?.role !== "hospital") {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <HospitalSidebar />


      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Nav */}
        <HospitalTopNav />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0 bg-muted/10">
          <Outlet />
        </main>

        {/* Mobile Bottom Nav */}
        <HospitalBottomNav />
      </div>
    </div>
  );
};

export default HospitalLayout;
