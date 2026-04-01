import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Wallet,
  Settings,
  LogOut,
  ScanLine,
  Ticket,
  Activity,
  Menu,
  X,
  MoreHorizontal,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { cn } from "../../lib/utils";
import { useState } from "react";

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: "Tableau de bord", path: "/dashboard", icon: LayoutDashboard },
    { name: "Billetterie", path: "/ticketing", icon: Ticket },
    { name: "Scanner QR", path: "/scanner", icon: ScanLine },
    { name: "Membres", path: "/clients", icon: Users },
    { name: "Activités", path: "/activities", icon: Activity, adminOnly: true },
    { name: "Trésorerie", path: "/treasury", icon: Wallet },
    { name: "Staff", path: "/users", icon: Settings, adminOnly: true },
  ];

  const filteredNavItems = navItems.filter(
    (item) =>
      !item.adminOnly ||
      String(user?.role ?? "").toUpperCase() === "ADMIN",
  );
  const mainItems = filteredNavItems.slice(0, 5);
  const dropItems = filteredNavItems.slice(5);
  const hasActiveDropdownItem = dropItems.some((item) =>
    location.pathname.startsWith(item.path),
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-20 glass-dark border-b border-[#78aaff33] px-6 md:px-12 flex items-center justify-between shadow-[0_10px_30px_rgba(8,20,48,0.55)]">
      <div className="flex items-center gap-12 flex-1 min-w-0">
        <div
          className="flex items-center gap-3 group cursor-pointer"
          onClick={() => navigate("/")}
        >
          <span className="font-bold text-2xl tracking-tight text-white">
            NUUR <span className="text-primary">GYM</span>
          </span>
        </div>

        <nav className="hidden lg:flex items-center justify-center gap-1 flex-1">
          {mainItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2.5 px-4 py-2 rounded-xl transition-all duration-300 relative group",
                  isActive
                    ? "text-[#8fd0ff]"
                    : "text-[#b4c9ee] hover:text-white",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm font-semibold">{item.name}</span>
                  {isActive && (
                    <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#8fd0ff] shadow-[0_0_8px_#8fd0ff]" />
                  )}
                </>
              )}
            </NavLink>
          ))}

          {dropItems.length > 0 && (
            <div className="relative group ml-1">
              <button
                className={cn(
                  "flex items-center gap-2.5 px-4 py-2 rounded-xl transition-all duration-300",
                  hasActiveDropdownItem
                    ? "text-[#8fd0ff]"
                    : "text-[#b4c9ee] hover:text-white",
                )}
              >
                <MoreHorizontal className="w-4 h-4" />
                <span className="text-sm font-semibold">Plus</span>
                <ChevronDown className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" />
              </button>
              <div className="absolute top-full left-0 w-full h-3"></div>
              <div className="absolute top-[calc(100%+0.35rem)] left-1/2 -translate-x-1/2 z-50 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                <div className="glass-dark rounded-xl border border-[#78aaff33] overflow-hidden p-2 space-y-1 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                  {dropItems.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm",
                          isActive
                            ? "bg-[#8fd0ff]/20 text-[#8fd0ff]"
                            : "text-[#b4c9ee] hover:bg-white/5 hover:text-white",
                        )
                      }
                    >
                      <item.icon className="w-4 h-4" />
                      <span className="font-medium">{item.name}</span>
                    </NavLink>
                  ))}
                </div>
              </div>
            </div>
          )}
        </nav>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-4 pl-6 border-l border-[#78aaff33]">
          <div className="text-right">
            <p className="text-sm font-bold text-white">{user?.name}</p>
            <p className="text-[10px] font-semibold tracking-wider text-[#8fd0ff]/85">
              {user?.role === "ADMIN" ? "Administrateur" : "Staff"}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1d3670] to-[#264a94] border border-[#78aaff44] flex items-center justify-center font-bold text-[#9ad7ff] transition-all shadow-lg">
            {user?.name?.[0].toUpperCase()}
          </div>
        </div>

        <button
          onClick={logout}
          className="w-10 h-10 rounded-xl glass hover:bg-red-500/12 hover:text-red-300 text-[#b4c9ee] flex items-center justify-center transition-all group"
          title="Déconnexion"
        >
          <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>

        <button
          className="lg:hidden w-10 h-10 flex items-center justify-center glass rounded-xl"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-background/95 backdrop-blur-xl lg:hidden pt-24 px-6 flex flex-col gap-4 animate-in fade-in duration-300">
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-4 p-4 rounded-2xl transition-all",
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/30"
                    : "text-slate-300 border border-transparent",
                )
              }
            >
              <item.icon className="w-6 h-6" />
              <span className="font-bold text-lg">{item.name}</span>
            </NavLink>
          ))}
        </div>
      )}
    </header>
  );
};
