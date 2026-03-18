import React from "react";
import { useAuth } from "../context/AuthContext";
import { Icons } from "./UI";

const NAV = [
  { key: "dashboard", label: "Dashboard", icon: "dashboard" },
  { key: "reports", label: "Medical Reports", icon: "reports" },
  { key: "chat", label: "AI Health Chat", icon: "chat" },
  { key: "reminders", label: "Medicine Reminders", icon: "reminder" },
  { key: "scanner", label: "Scan & Understand", icon: "scanner" },
  { key: "schemes", label: "Govt Schemes", icon: "schemes" },
  { key: "profile", label: "My Profile", icon: "profile" },
];

export default function Sidebar({ page, setPage }) {
  const { user, logout } = useAuth();
  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("") || "U";

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-mark">
          <div className="logo-icon">{Icons.logo}</div>
          <span className="logo-text">
            Medi<span>Setu</span>
          </span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <span className="nav-label">Main</span>
        {NAV.slice(0, 3).map((item) => (
          <button
            key={item.key}
            className={`nav-item${page === item.key ? " active" : ""}`}
            onClick={() => setPage(item.key)}
          >
            {Icons[item.icon]}
            {item.label}
          </button>
        ))}
        <span className="nav-label">Health Tools</span>
        {NAV.slice(3).map((item) => (
          <button
            key={item.key}
            className={`nav-item${page === item.key ? " active" : ""}`}
            onClick={() => setPage(item.key)}
          >
            {Icons[item.icon]}
            {item.label}
          </button>
        ))}
        <span className="nav-label">Account</span>
        <button className="nav-item danger" onClick={logout}>
          {Icons.logout}Sign out
        </button>
      </nav>

      <div className="sidebar-user">
        <div className="avatar">{initials}</div>
        <div>
          <div className="avatar-name">{user?.name?.split(" ")[0]}</div>
          <div className="avatar-id">{user?.medicalId}</div>
        </div>
      </div>
    </aside>
  );
}
