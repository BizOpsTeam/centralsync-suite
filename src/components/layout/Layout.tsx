import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export function Layout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleMobileSidebarToggle = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  const handleMobileSidebarClose = () => {
    setMobileSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar 
          collapsed={sidebarCollapsed} 
          onToggle={handleSidebarToggle}
          mobileOpen={false}
          onMobileClose={handleMobileSidebarClose}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={handleMobileSidebarClose} />
          <div className="fixed inset-y-0 left-0 z-50">
            <Sidebar 
              collapsed={false} 
              onToggle={handleSidebarToggle}
              mobileOpen={mobileSidebarOpen}
              onMobileClose={handleMobileSidebarClose}
            />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col">
        <Header onMobileMenuClick={handleMobileSidebarToggle} />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}