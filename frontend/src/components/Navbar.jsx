import { NavLink, useNavigate } from "react-router-dom";
import {
  FileCheck,
  FileClock,
  FilePlus,
  Files,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  Share2,
  Settings
} from "lucide-react";

function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    onLogout();
    navigate("/login");
  };

  return (
    <header className="topbar">
      <div className="brand" onClick={() => navigate("/dashboard")} role="button" tabIndex={0}>
        <ShieldCheck size={24} />
        <span>SecureShare</span>
      </div>

      <nav className="nav-links">
        <NavLink to="/dashboard">
          <LayoutDashboard size={17} />
          Dashboard
        </NavLink>
        {user.role !== "VERIFIER" && (
          <>
            <NavLink to="/upload">
              <FilePlus size={17} />
              Upload
            </NavLink>
            <NavLink to="/documents">
              <Files size={17} />
              My Documents
            </NavLink>
          </>
        )}
        <NavLink to="/shared">
          <Share2 size={17} />
          Shared
        </NavLink>
        <NavLink to="/verify">
          <FileCheck size={17} />
          Verify
        </NavLink>
        <NavLink to="/history">
          <FileClock size={17} />
          History
        </NavLink>
        {user.role === "ADMIN" && (
          <NavLink to="/admin">
            <Settings size={17} />
            Admin
          </NavLink>
        )}
      </nav>

      <div className="user-chip">
        <span>{user.name}</span>
        <small>{user.role}</small>
        <button className="icon-button" onClick={handleLogout} title="Log out">
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}

export default Navbar;
