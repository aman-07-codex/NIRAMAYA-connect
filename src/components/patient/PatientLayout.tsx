import { Outlet } from "react-router-dom";
import PatientSidebar from "@/components/patient/PatientSidebar";
import PatientTopNav from "@/components/patient/PatientTopNav";
import PatientBottomNav from "@/components/patient/PatientBottomNav";

const PatientLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <PatientSidebar />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Nav */}
        <PatientTopNav />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <Outlet />
        </main>

        {/* Mobile Bottom Nav */}
        <PatientBottomNav />
      </div>
    </div>
  );
};

export default PatientLayout;
