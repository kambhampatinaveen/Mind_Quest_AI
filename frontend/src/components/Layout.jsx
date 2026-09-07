import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { Home, LayoutDashboard, UserCircle, Gamepad2, LogOut, History, Brain, Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isHome = location.pathname === "/";

  const navLinks = [
    { to: "/", label: "Home", icon: Home },
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/games", label: "Games", icon: Gamepad2 },
    { to: "/profile", label: "Profile", icon: UserCircle },
    { to: "/results", label: "History", icon: History }
  ];

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  return (
    <div className="mindquest-shell">
      {/* Sidebar Navigation matching reference */}
      <aside className={`mindquest-sidebar ${mobileMenuOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand" onClick={() => navigate("/")}>
          <div className="brand-badge-glow">
            <Brain size={22} className="brand-badge-icon" />
          </div>
          <div className="brand-text-block">
            <b className="brand-text-title">MindQuest</b>
            <small className="brand-text-subtitle">AI Multi-Skill Challenge</small>
          </div>
        </div>

        <nav className="sidebar-nav-list">
          {navLinks.map((link) => {
            const IconComponent = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) => `sidebar-nav-item ${isActive ? "nav-active" : ""}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="nav-icon-wrapper">
                  <IconComponent size={20} />
                </div>
                <span className="nav-label-text">{link.label}</span>
                <div className="nav-glow-bar"></div>
              </NavLink>
            );
          })}
        </nav>

        {user && (
          <div className="sidebar-bottom-action">
            <button
              type="button"
              className="btn-sidebar-logout"
              onClick={handleLogout}
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </aside>

      {/* Main Content Pane */}
      <div className="mindquest-main-pane">
        {/* Topbar Header */}
        <header className="mindquest-topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="mobile-menu-trigger"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

          <div className="topbar-right">
            {/* Top Navigation Links on Home Page matching reference */}
            {isHome && (
              <div className="home-top-links">
                <NavLink to="/" end className={({ isActive }) => `home-top-link ${isActive ? "active" : ""}`}>
                  <Home size={16} />
                  <span>Home</span>
                </NavLink>
                <NavLink to="/dashboard" className="home-top-link">
                  <LayoutDashboard size={16} />
                  <span>Dashboard</span>
                </NavLink>
                <NavLink to="/profile" className="home-top-link">
                  <UserCircle size={16} />
                  <span>Profile</span>
                </NavLink>
              </div>
            )}

            {user ? (
              <div className="user-profile-badge" onClick={() => navigate("/profile")}>
                <div className="user-initial-avatar">
                  {user.name ? user.name[0].toUpperCase() : "U"}
                </div>
                <div className="user-badge-meta">
                  <span className="user-badge-name">{user.name}</span>
                  <span className="user-badge-level">Level {user.level || 1}</span>
                </div>
              </div>
            ) : (
              <NavLink to="/auth" className="btn-topbar-signin">
                Sign In
              </NavLink>
            )}
          </div>
        </header>

        {/* Page View */}
        <main className="mindquest-content-body">
          <Outlet />
        </main>
      </div>

      {/* Backdrop for mobile navigation */}
      {mobileMenuOpen && (
        <div className="mobile-drawer-backdrop" onClick={() => setMobileMenuOpen(false)}></div>
      )}
    </div>
  );
}
