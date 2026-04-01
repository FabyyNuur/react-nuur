import { Outlet } from "react-router-dom";
import { Navbar } from "../../components/base/NavBar";
import { LayoutBackground } from "../../components/base/LayoutBackground";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground relative font-sans selection:bg-primary/30 overflow-x-hidden">
      <LayoutBackground />
      <Navbar />
      <main className="relative z-10 pt-28 pb-12 transition-all duration-500 min-h-screen">
        <div className="max-w-[1300px] mx-auto px-4 lg:px-8">
          <div className="glass-card border border-border rounded-[24px] min-h-[calc(100vh-12rem)] p-4 md:p-5 lg:p-6">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
