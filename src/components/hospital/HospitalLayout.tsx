import { Outlet } from "react-router-dom";
import HospitalSidebar from "@/components/hospital/HospitalSidebar";
import HospitalTopNav from "@/components/hospital/HospitalTopNav";
import HospitalBottomNav from "@/components/hospital/HospitalBottomNav";

const HospitalLayout = () => {
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
