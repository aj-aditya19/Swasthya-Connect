import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Icons } from "./UI";
import "./Navbar.css";

const NAV = [
  { key: "dashboard", label: "Dashboard", icon: "dashboard" },
  { key: "reports", label: "Reports", icon: "reports" },
  { key: "chat", label: "AI Chat", icon: "chat" },
  { key: "reminders", label: "Reminders", icon: "reminder" },
  { key: "scanner", label: "Scanner", icon: "scanner" },
  { key: "schemes", label: "Schemes", icon: "schemes" },
];

export default function Navbar({ page, setPage }) {
  const { user, logout } = useAuth();

  const [open, setOpen] = useState(false);
  const ref = useRef();

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("") || "U";

  // close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="navbar">
      {/* LEFT */}
      <div className="nav-left">
        <div className="logo">
          <span className="logo-icon">{Icons.logo}</span>
          <span className="logo-text">
            Medi<span>Setu</span>
          </span>
        </div>
      </div>

      {/* CENTER */}
      <div className="nav-center">
        {NAV.map((item) => (
          <button
            key={item.key}
            className={`nav-link ${page === item.key ? "active" : ""}`}
            onClick={() => setPage(item.key)}
          >
            {Icons[item.icon]}
            {item.label}
          </button>
        ))}
      </div>

      {/* RIGHT */}
      <div className="nav-right" ref={ref}>
        <div className="profile-box">
          <div className="avatar" onClick={() => setOpen(!open)}>
            {initials}
          </div>

          {open && (
            <div className="dropdown">
              <button
                className="dropdown-item"
                onClick={() => {
                  setPage("profile");
                  setOpen(false);
                }}
              >
                {Icons.profile} Profile
              </button>

              <button
                className="dropdown-item danger"
                onClick={() => {
                  logout();
                  setOpen(false);
                }}
              >
                {Icons.logout} Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
