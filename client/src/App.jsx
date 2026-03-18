import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Sidebar from "./components/Sidebar";
import { Login, Register } from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import Chat from "./pages/Chat";
import Reminders from "./pages/Reminders";
import Schemes from "./pages/Schemes";
import Profile from "./pages/Profile";
import { LoadingCenter } from "./components/UI";
import Scanner from "./pages/Scanner";
import Landing from "./pages/Landing";

const PAGE_META = {
  dashboard: { title: "Dashboard", subtitle: "Your health overview for today" },
  reports: {
    title: "Medical Reports",
    subtitle: "Upload, view and analyse your reports",
  },
  chat: {
    title: "AI Health Chat",
    subtitle: "Ask MediBot in Hindi or English",
  },
  reminders: {
    title: "Medicine Reminders",
    subtitle: "Track and manage your daily medicines",
  },
  schemes: {
    title: "Government Schemes",
    subtitle: "Health schemes available for Indian citizens",
  },
  profile: {
    title: "My Profile",
    subtitle: "Manage your personal health details",
  },
  scanner: {
    title: "Scan & Understand",
    subtitle:
      "Upload any photo — medicine, document, terms — and get instant explanation",
  },
};

function AppInner() {
  const { user, loading } = useAuth();
  const [authMode, setAuthMode] = useState("landing");
  const [page, setPage] = useState("dashboard");

  if (loading)
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <LoadingCenter />
      </div>
    );

  if (!user) {
    if (authMode === "landing")
      return (
        <Landing
          onLogin={() => setAuthMode("login")}
          onRegister={() => setAuthMode("register")}
        />
      );
    if (authMode === "login")
      return <Login goRegister={() => setAuthMode("register")} />;
    return <Register goLogin={() => setAuthMode("login")} />;
  }

  const { title, subtitle } = PAGE_META[page] || PAGE_META.dashboard;
  const isChat = page === "chat";

  return (
    <div className="app-layout">
      <Sidebar page={page} setPage={setPage} />
      <div className="main-content">
        <div className="page-header">
          <div>
            <div className="page-title">{title}</div>
            <div className="page-subtitle">{subtitle}</div>
          </div>
        </div>
        {page === "dashboard" && <Dashboard setPage={setPage} />}
        {page === "reports" && <Reports />}
        {page === "chat" && <Chat />}
        {page === "reminders" && <Reminders />}
        {page === "schemes" && <Schemes />}
        {page === "profile" && <Profile />}
        {page === "scanner" && <Scanner />}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
