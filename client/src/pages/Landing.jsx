import React, { useEffect, useRef } from "react";

const FEATURES = [
  {
    icon: "🔬",
    title: "AI Report Analysis",
    desc: "Upload any medical report — blood test, X-ray, ECG. AI extracts every value, flags abnormals, and explains in plain language.",
    tag: "Powered by Groq AI",
    color: "#dbeafe",
    tagColor: "#1a56db",
  },
  {
    icon: "💬",
    title: "MediBot — Your AI Doctor",
    desc: "Ask anything about your health in Hindi or English. MediBot understands your reports and gives personalised answers 24/7.",
    tag: "Hindi + English",
    color: "#ccfbf1",
    tagColor: "#0d9488",
  },
  {
    icon: "💊",
    title: "Medicine Reminders",
    desc: "Set reminders for any medicine. Get email alerts at the right time. Track daily, alternate, or weekly schedules effortlessly.",
    tag: "Email alerts",
    color: "#fef3c7",
    tagColor: "#d97706",
  },
  {
    icon: "📸",
    title: "Scan & Understand",
    desc: "Point your camera at a medicine strip, insurance document, or hospital bill. Get instant AI explanation in seconds.",
    tag: "Any document",
    color: "#dbeafe",
    tagColor: "#1a56db",
  },
  {
    icon: "🏛️",
    title: "Government Schemes",
    desc: "Discover Ayushman Bharat, PM-JAY, and state schemes you qualify for. Filter by state, category, and eligibility.",
    tag: "Central + State",
    color: "#ccfbf1",
    tagColor: "#0d9488",
  },
  {
    icon: "☁️",
    title: "Secure Health Vault",
    desc: "All your reports stored securely in the cloud. Access anytime, share with your doctor, never lose a report again.",
    tag: "Encrypted storage",
    color: "#fef3c7",
    tagColor: "#d97706",
  },
];

const STEPS = [
  {
    icon: "📝",
    title: "Register Free",
    desc: "Create your account in 2 minutes. Get your unique MediSetu health ID instantly.",
  },
  {
    icon: "📤",
    title: "Upload Report",
    desc: "Upload any PDF or image of your medical report. Our OCR reads every detail.",
  },
  {
    icon: "🤖",
    title: "AI Analyses",
    desc: "AI extracts values, flags abnormals, identifies medicines and gives a full summary.",
  },
  {
    icon: "💬",
    title: "Ask Questions",
    desc: "Chat with MediBot about your results in Hindi or English. Get answers instantly.",
  },
];

const TESTIMONIALS = [
  {
    text: '"Pehle kabhi samajh nahi aata tha ki report mein kya likha hai. Ab MediBot sab Hindi mein explain kar deta hai. Meri maa ke liye bahut helpful hai."',
    name: "Suresh Yadav",
    loc: "Lucknow, Uttar Pradesh",
    initials: "SY",
  },
  {
    text: '"The medicine reminder emails are a lifesaver. My father has 4 medicines daily and he never misses one now. The Scan feature explained his insurance document perfectly."',
    name: "Priya Desai",
    loc: "Pune, Maharashtra",
    initials: "PD",
  },
  {
    text: '"Mujhe pata hi nahi tha ki Ayushman Bharat ke liye eligible hun. MediSetu ke schemes section se pata chala. Ab free mein treatment mil raha hai!"',
    name: "Ramesh Meena",
    loc: "Jaipur, Rajasthan",
    initials: "RM",
  },
];

const MARQUEE_ITEMS = [
  "AI Report Analysis",
  "Hindi & English",
  "Medicine Reminders",
  "Govt Schemes",
  "OCR Technology",
  "Scan & Understand",
  "Health Score",
  "Secure Cloud",
  "MediBot AI",
];

export default function Landing({ onLogin, onRegister }) {
  const revealRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting)
            entry.target.style.cssText += "opacity:1;transform:translateY(0)";
        });
      },
      { threshold: 0.1 },
    );
    revealRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const addRef = (el) => {
    if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el);
  };

  const revealStyle = {
    opacity: 0,
    transform: "translateY(28px)",
    transition: "opacity 0.7s ease, transform 0.7s ease",
  };

  return (
    <div
      style={{
        fontFamily: "'DM Sans', sans-serif",
        background: "#f8f6f0",
        color: "#0a0f1e",
        overflowX: "hidden",
      }}
    >
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes float0 { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        @keyframes float1 { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-14px); } }
        @keyframes pulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.5; transform:scale(0.8); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        .lp-nav-link { font-size:14px; color:#6b7280; text-decoration:none; font-weight:500; transition:color .2s; }
        .lp-nav-link:hover { color:#0a0f1e; }
        .lp-feature-card { background:white; padding:32px; transition:background .2s, transform .2s; cursor:default; position:relative; overflow:hidden; }
        .lp-feature-card::before { content:''; position:absolute; top:0; left:0; right:0; height:2px; background:linear-gradient(90deg,#1a56db,#0d9488); transform:scaleX(0); transition:transform .3s; transform-origin:left; }
        .lp-feature-card:hover::before { transform:scaleX(1); }
        .lp-feature-card:hover { background:#fefefe; transform:translateY(-2px); }
        .lp-step:hover .lp-step-icon { background:#1a56db !important; transform:scale(1.08); }
        .lp-tcard { background:white; border:1px solid #eeeae0; border-radius:16px; padding:28px; transition:all .3s; }
        .lp-tcard:hover { box-shadow:0 16px 48px rgba(0,0,0,.08); transform:translateY(-4px); }
        .lp-btn-primary { background:#1a56db; color:white; border:2px solid #1a56db; padding:13px 28px; border-radius:10px; font-family:'DM Sans',sans-serif; font-size:15px; font-weight:600; cursor:pointer; transition:all .2s; display:inline-flex; align-items:center; gap:8px; }
        .lp-btn-primary:hover { background:#1648c7; transform:translateY(-2px); box-shadow:0 12px 32px rgba(26,86,219,.3); }
        .lp-btn-secondary { background:transparent; color:#0a0f1e; border:2px solid #2d3561; padding:13px 28px; border-radius:10px; font-family:'DM Sans',sans-serif; font-size:15px; font-weight:600; cursor:pointer; transition:all .2s; }
        .lp-btn-secondary:hover { background:#0a0f1e; color:white; transform:translateY(-2px); }
        .lp-cta-input { flex:1; padding:13px 18px; border:1px solid rgba(255,255,255,.15); border-radius:10px; background:rgba(255,255,255,.08); color:white; font-family:'DM Sans',sans-serif; font-size:14px; outline:none; transition:border .2s; }
        .lp-cta-input::placeholder { color:rgba(255,255,255,.4); }
        .lp-cta-input:focus { border-color:rgba(255,255,255,.4); }
        .lp-cta-btn { padding:13px 24px; background:#1a56db; color:white; border:none; border-radius:10px; font-family:'DM Sans',sans-serif; font-size:14px; font-weight:700; cursor:pointer; transition:all .2s; white-space:nowrap; }
        .lp-cta-btn:hover { background:#1648c7; }
      `}</style>

      {/* ── NAV ── */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: "16px 48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(248,246,240,.9)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(0,0,0,.06)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              background: "#1a56db",
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              width="20"
              height="20"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span
            style={{
              fontFamily: "'Instrument Serif',serif",
              fontSize: 22,
              fontStyle: "italic",
            }}
          >
            Medi
            <span style={{ color: "#1a56db", fontStyle: "normal" }}>Setu</span>
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <a href="#lp-features" className="lp-nav-link">
            Features
          </a>
          <a href="#lp-how" className="lp-nav-link">
            How it works
          </a>
          <a href="#lp-testimonials" className="lp-nav-link">
            Stories
          </a>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onLogin}
            style={{
              padding: "8px 20px",
              border: "1.5px solid #2d3561",
              borderRadius: 8,
              fontFamily: "'DM Sans',sans-serif",
              fontSize: 13.5,
              fontWeight: 600,
              color: "#2d3561",
              background: "transparent",
              cursor: "pointer",
              transition: "all .2s",
            }}
          >
            Sign in
          </button>
          <button
            onClick={onRegister}
            style={{
              padding: "8px 20px",
              border: "1.5px solid #1a56db",
              borderRadius: 8,
              fontFamily: "'DM Sans',sans-serif",
              fontSize: 13.5,
              fontWeight: 600,
              color: "white",
              background: "#1a56db",
              cursor: "pointer",
              transition: "all .2s",
            }}
          >
            Get started free
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "120px 48px 80px",
          position: "relative",
          overflow: "hidden",
          textAlign: "center",
        }}
      >
        {/* bg elements */}
        <div
          style={{
            position: "absolute",
            top: -200,
            right: -200,
            width: 700,
            height: 700,
            borderRadius: "50%",
            background:
              "radial-gradient(circle,rgba(26,86,219,.07) 0%,transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -100,
            left: -150,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background:
              "radial-gradient(circle,rgba(13,148,136,.06) 0%,transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle,rgba(0,0,0,.05) 1px,transparent 1px)",
            backgroundSize: "32px 32px",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 860 }}>
          {/* badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 14px",
              background: "#dbeafe",
              border: "1px solid rgba(26,86,219,.2)",
              borderRadius: 20,
              fontSize: 12.5,
              fontWeight: 600,
              color: "#1a56db",
              marginBottom: 28,
              animation: "fadeUp .8s ease forwards",
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#1a56db",
                display: "inline-block",
                animation: "pulse 2s infinite",
              }}
            />
            India's first multilingual AI health companion
          </div>

          <div
            style={{
              fontFamily: "'Instrument Serif',serif",
              fontSize: "clamp(52px,7vw,92px)",
              lineHeight: 1.05,
              animation: "fadeUp .8s .1s ease both",
            }}
          >
            Your health,
          </div>
          <div
            style={{
              fontFamily: "'Instrument Serif',serif",
              fontSize: "clamp(52px,7vw,92px)",
              lineHeight: 1.05,
              fontStyle: "italic",
              color: "#1a56db",
              marginBottom: 24,
              animation: "fadeUp .8s .15s ease both",
            }}
          >
            finally understood.
          </div>

          <p
            style={{
              fontSize: 18,
              color: "#6b7280",
              lineHeight: 1.7,
              maxWidth: 540,
              margin: "0 auto 40px",
              animation: "fadeUp .8s .2s ease both",
            }}
          >
            Upload reports. Chat in{" "}
            <strong style={{ color: "#0a0f1e" }}>Hindi or English</strong>. Get
            medicine reminders. Discover government schemes. All in one place —
            for every Indian.
          </p>

          <div
            style={{
              display: "flex",
              gap: 14,
              justifyContent: "center",
              flexWrap: "wrap",
              animation: "fadeUp .8s .3s ease both",
            }}
          >
            <button className="lp-btn-primary" onClick={onRegister}>
              Start for free
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="M12 5l7 7-7 7" />
              </svg>
            </button>
            <button
              className="lp-btn-secondary"
              onClick={() =>
                document
                  .getElementById("lp-how")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              See how it works
            </button>
          </div>

          {/* trust stats */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 32,
              justifyContent: "center",
              marginTop: 56,
              flexWrap: "wrap",
              animation: "fadeUp .8s .4s ease both",
            }}
          >
            <span style={{ fontSize: 12.5, color: "#6b7280", fontWeight: 500 }}>
              Trusted across India
            </span>
            {[
              ["50K+", "Reports analysed"],
              ["12+", "Languages"],
              ["4.9★", "User rating"],
            ].map(([num, label]) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontFamily: "'Instrument Serif',serif",
                    fontSize: 26,
                    fontStyle: "italic",
                    color: "#0a0f1e",
                  }}
                >
                  {num}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#6b7280",
                    fontWeight: 500,
                    textTransform: "uppercase",
                    letterSpacing: ".05em",
                  }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div
        style={{ padding: "22px 0", background: "#0a0f1e", overflow: "hidden" }}
      >
        <div
          style={{
            display: "flex",
            gap: 48,
            animation: "marquee 22s linear infinite",
            whiteSpace: "nowrap",
            width: "max-content",
          }}
        >
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span
              key={i}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                fontSize: 14,
                fontWeight: 600,
                color: "rgba(255,255,255,.65)",
                flexShrink: 0,
              }}
            >
              {item} <span style={{ color: "rgba(255,255,255,.25)" }}>✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section
        id="lp-features"
        style={{ padding: "120px 48px", maxWidth: 1200, margin: "0 auto" }}
      >
        <div ref={addRef} style={revealStyle}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: ".12em",
              textTransform: "uppercase",
              color: "#1a56db",
              marginBottom: 14,
            }}
          >
            Everything you need
          </div>
          <div
            style={{
              fontFamily: "'Instrument Serif',serif",
              fontSize: "clamp(36px,4vw,56px)",
              lineHeight: 1.1,
              marginBottom: 16,
            }}
          >
            Healthcare in your pocket,{" "}
            <em style={{ color: "#1a56db" }}>your language.</em>
          </div>
          <p
            style={{
              fontSize: 17,
              color: "#6b7280",
              lineHeight: 1.7,
              maxWidth: 500,
            }}
          >
            Built for India's 500 million smartphone users who deserve to
            understand their own health.
          </p>
        </div>

        <div
          ref={addRef}
          style={{
            ...revealStyle,
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 2,
            marginTop: 64,
            background: "#eeeae0",
            border: "2px solid #eeeae0",
            borderRadius: 20,
            overflow: "hidden",
          }}
        >
          {FEATURES.map((f) => (
            <div key={f.title} className="lp-feature-card">
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: f.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  marginBottom: 20,
                }}
              >
                {f.icon}
              </div>
              <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 10 }}>
                {f.title}
              </div>
              <div style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.7 }}>
                {f.desc}
              </div>
              <span
                style={{
                  display: "inline-block",
                  marginTop: 14,
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "3px 10px",
                  borderRadius: 20,
                  background: f.color,
                  color: f.tagColor,
                }}
              >
                {f.tag}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section
        id="lp-how"
        style={{
          padding: "120px 48px",
          background: "#0a0f1e",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle,rgba(255,255,255,.025) 1px,transparent 1px)",
            backgroundSize: "40px 40px",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div ref={addRef} style={revealStyle}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: ".12em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,.4)",
                marginBottom: 14,
              }}
            >
              Simple as 1, 2, 3, 4
            </div>
            <div
              style={{
                fontFamily: "'Instrument Serif',serif",
                fontSize: "clamp(36px,4vw,56px)",
                color: "white",
                lineHeight: 1.1,
              }}
            >
              From report to{" "}
              <em style={{ color: "#60a5fa" }}>understanding in minutes.</em>
            </div>
          </div>

          <div
            ref={addRef}
            style={{
              ...revealStyle,
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: 0,
              marginTop: 72,
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 40,
                left: "12%",
                right: "12%",
                height: 1,
                background:
                  "linear-gradient(90deg,transparent,rgba(255,255,255,.12),rgba(255,255,255,.12),rgba(255,255,255,.12),transparent)",
                pointerEvents: "none",
              }}
            />
            {STEPS.map((s) => (
              <div
                key={s.title}
                className="lp-step"
                style={{ textAlign: "center", padding: "0 20px" }}
              >
                <div
                  className="lp-step-icon"
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    border: "1px solid rgba(255,255,255,.1)",
                    background: "rgba(255,255,255,.05)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 24px",
                    fontSize: 28,
                    position: "relative",
                    zIndex: 1,
                    transition: "all .3s",
                  }}
                >
                  {s.icon}
                </div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "white",
                    marginBottom: 10,
                  }}
                >
                  {s.title}
                </div>
                <div
                  style={{
                    fontSize: 13.5,
                    color: "rgba(255,255,255,.5)",
                    lineHeight: 1.7,
                  }}
                >
                  {s.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LANGUAGE SECTION ── */}
      <section style={{ padding: "120px 48px" }}>
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 80,
            alignItems: "center",
          }}
        >
          <div ref={addRef} style={revealStyle}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: ".12em",
                textTransform: "uppercase",
                color: "#1a56db",
                marginBottom: 14,
              }}
            >
              Multilingual AI
            </div>
            <div
              style={{
                fontFamily: "'Instrument Serif',serif",
                fontSize: "clamp(36px,4vw,56px)",
                lineHeight: 1.1,
                marginBottom: 16,
              }}
            >
              Ask in <em style={{ color: "#1a56db" }}>Hindi.</em>
              <br />
              Understand in Hindi.
            </div>
            <p
              style={{
                fontSize: 16,
                color: "#6b7280",
                lineHeight: 1.7,
                marginBottom: 28,
              }}
            >
              Most health apps only speak English. MediBot speaks your language
              — because health information should never have a language barrier.
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[
                ["हिंदी", "#dbeafe", "#1a56db"],
                ["English", "#ccfbf1", "#0d9488"],
                ["தமிழ்", "#fef3c7", "#d97706"],
                ["বাংলা", "#fee2e2", "#dc2626"],
                ["తెలుగు", "#f3e8ff", "#7c3aed"],
              ].map(([lang, bg, color]) => (
                <span
                  key={lang}
                  style={{
                    padding: "6px 14px",
                    background: bg,
                    color,
                    borderRadius: 20,
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  {lang}
                </span>
              ))}
            </div>
          </div>

          <div ref={addRef} style={revealStyle}>
            <div
              style={{
                background: "white",
                border: "1px solid #eeeae0",
                borderRadius: 20,
                padding: 24,
                boxShadow: "0 20px 60px rgba(0,0,0,.07)",
                marginBottom: 14,
                animation: "float0 4s ease-in-out infinite",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "#dbeafe",
                    color: "#1a56db",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  RK
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>
                    Rajesh Kumar
                  </div>
                  <div style={{ fontSize: 11, color: "#6b7280" }}>
                    Patient · Noida
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 15, color: "#2d3561", lineHeight: 1.6 }}>
                Mera blood sugar 198 hai — kya yeh serious hai?
              </div>
              <span
                style={{
                  display: "inline-block",
                  marginTop: 8,
                  fontSize: 10.5,
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: 10,
                  background: "#f8f6f0",
                  color: "#6b7280",
                  letterSpacing: ".04em",
                }}
              >
                Hinglish
              </span>
            </div>
            <div
              style={{
                background: "white",
                border: "1px solid #eeeae0",
                borderRadius: 20,
                padding: 24,
                boxShadow: "0 20px 60px rgba(0,0,0,.07)",
                marginLeft: 24,
                animation: "float1 4s ease-in-out infinite",
                animationDelay: ".5s",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "#1a56db",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  MB
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>MediBot</div>
                  <div style={{ fontSize: 11, color: "#6b7280" }}>
                    AI Health Assistant
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 14, color: "#2d3561", lineHeight: 1.6 }}>
                Haan Rajesh ji, 198 mg/dL fasting sugar thoda zyada hai (normal:
                70–100). Yeh pre-diabetes ka sign ho sakta hai. Aapki Metformin
                bilkul sahi hai. Meetha kam karein, roz 30 min walk karein. 🙏
              </div>
              <span
                style={{
                  display: "inline-block",
                  marginTop: 8,
                  fontSize: 10.5,
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: 10,
                  background: "#f8f6f0",
                  color: "#6b7280",
                  letterSpacing: ".04em",
                }}
              >
                Hindi + English
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ padding: "90px 48px", background: "#1a56db" }}>
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
          }}
          ref={addRef}
        >
          {[
            ["500M+", "Indians with smartphones, no easy doctor access"],
            ["₹5L", "PM-JAY coverage most people don't know about"],
            ["73%", "Patients don't understand their lab reports"],
            ["0", "Other apps doing all this in Hindi. Until now."],
          ].map(([num, label]) => (
            <div
              key={num}
              style={{ textAlign: "center", padding: "32px 16px" }}
            >
              <div
                style={{
                  fontFamily: "'Instrument Serif',serif",
                  fontSize: 60,
                  fontStyle: "italic",
                  color: "white",
                  lineHeight: 1,
                }}
              >
                {num}
              </div>
              <div
                style={{
                  fontSize: 13.5,
                  color: "rgba(255,255,255,.7)",
                  marginTop: 10,
                  fontWeight: 500,
                  lineHeight: 1.5,
                }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section
        id="lp-testimonials"
        style={{ padding: "120px 48px", maxWidth: 1200, margin: "0 auto" }}
      >
        <div ref={addRef} style={revealStyle}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: ".12em",
              textTransform: "uppercase",
              color: "#1a56db",
              marginBottom: 14,
            }}
          >
            Real stories
          </div>
          <div
            style={{
              fontFamily: "'Instrument Serif',serif",
              fontSize: "clamp(36px,4vw,56px)",
              lineHeight: 1.1,
            }}
          >
            People who took <em style={{ color: "#1a56db" }}>control</em>
            <br />
            of their health.
          </div>
        </div>
        <div
          ref={addRef}
          style={{
            ...revealStyle,
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 20,
            marginTop: 64,
          }}
        >
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="lp-tcard">
              <div
                style={{
                  color: "#d97706",
                  fontSize: 14,
                  marginBottom: 14,
                  letterSpacing: 2,
                }}
              >
                ★★★★★
              </div>
              <div
                style={{
                  fontSize: 14.5,
                  color: "#2d3561",
                  lineHeight: 1.75,
                  marginBottom: 20,
                  fontStyle: "italic",
                }}
              >
                {t.text}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "#1a56db",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {t.initials}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>{t.loc}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section
        style={{
          padding: "120px 48px",
          background: "#0a0f1e",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -200,
            left: -200,
            width: 600,
            height: 600,
            borderRadius: "50%",
            background:
              "radial-gradient(circle,rgba(26,86,219,.15) 0%,transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -150,
            right: -150,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background:
              "radial-gradient(circle,rgba(13,148,136,.12) 0%,transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          ref={addRef}
          style={{
            ...revealStyle,
            position: "relative",
            zIndex: 1,
            maxWidth: 680,
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: "'Instrument Serif',serif",
              fontSize: "clamp(40px,5vw,68px)",
              color: "white",
              lineHeight: 1.1,
              marginBottom: 18,
            }}
          >
            Start understanding
            <br />
            your health <em style={{ color: "#60a5fa" }}>today.</em>
          </div>
          <p
            style={{
              fontSize: 17,
              color: "rgba(255,255,255,.6)",
              lineHeight: 1.7,
              marginBottom: 40,
            }}
          >
            Free forever for basic features. No credit card needed. Start in 2
            minutes.
          </p>
          <div
            style={{
              display: "flex",
              gap: 10,
              maxWidth: 440,
              margin: "0 auto 16px",
            }}
          >
            <input
              className="lp-cta-input"
              type="email"
              placeholder="Enter your email address"
            />
            <button className="lp-cta-btn" onClick={onRegister}>
              Get started →
            </button>
          </div>
          <div style={{ fontSize: 12.5, color: "rgba(255,255,255,.3)" }}>
            No spam. No credit card. Just your health, understood.
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        style={{
          background: "#0a0f1e",
          borderTop: "1px solid rgba(255,255,255,.06)",
          padding: "36px 48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div
          style={{
            fontFamily: "'Instrument Serif',serif",
            fontSize: 20,
            color: "rgba(255,255,255,.6)",
            fontStyle: "italic",
          }}
        >
          Medi
          <span style={{ color: "#60a5fa", fontStyle: "normal" }}>Setu</span>
        </div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,.3)" }}>
          © 2026 MediSetu. Made with ❤️ for India.
        </div>
        <div style={{ display: "flex", gap: 24 }}>
          {["Privacy", "Terms", "Contact"].map((link) => (
            <a
              key={link}
              href="#"
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,.3)",
                textDecoration: "none",
                transition: "color .2s",
              }}
              onMouseEnter={(e) =>
                (e.target.style.color = "rgba(255,255,255,.7)")
              }
              onMouseLeave={(e) =>
                (e.target.style.color = "rgba(255,255,255,.3)")
              }
            >
              {link}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
}
