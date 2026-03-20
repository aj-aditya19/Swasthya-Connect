import React, { useState, useRef } from "react";

const CATEGORIES = [
  { key: "medicine", label: "Medicine / Strip", emoji: "💊" },
  { key: "terms", label: "Terms & Conditions", emoji: "📄" },
  { key: "report", label: "Medical Report", emoji: "🏥" },
  { key: "insurance", label: "Insurance Document", emoji: "📋" },
  { key: "bill", label: "Hospital Bill", emoji: "🧾" },
  { key: "other", label: "Other Document", emoji: "📎" },
];

const POINTS_MAP = {
  medicine: 50,
  terms: 30,
  report: 80,
  insurance: 60,
  bill: 40,
  other: 20,
};

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "hi", label: "हिंदी", flag: "🇮🇳" },
  { code: "ta", label: "தமிழ்", flag: "🇮🇳" },
  { code: "bn", label: "বাংলা", flag: "🇮🇳" },
  { code: "te", label: "తెలుగు", flag: "🇮🇳" },
  { code: "mr", label: "मराठी", flag: "🇮🇳" },
];

export default function Scanner() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [category, setCategory] = useState("medicine");
  const [language, setLanguage] = useState("en");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [points, setPoints] = useState(0);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef();

  const handleFile = (file) => {
    if (!file) return;
    setImage(file);
    setResult(null);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleAnalyse = async () => {
    if (!image) return;
    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", image);
      formData.append("category", category);
      formData.append("language", language); // ← send language to backend

      const token = localStorage.getItem("token");
      const res = await fetch("/api/scanner/analyse", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      setResult(data);
      setPoints((p) => p + (POINTS_MAP[category] || 20));
    } catch (err) {
      setResult({ error: "Analysis failed. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setImage(null);
    setPreview(null);
    setResult(null);
  };

  const selectedLang = LANGUAGES.find((l) => l.code === language);

  return (
    <div className="page-body fade-in">
      {/* Points bar */}
      <div
        style={{
          background: "linear-gradient(135deg, #2b6cb0, #2c7a7b)",
          borderRadius: 12,
          padding: "14px 20px",
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          color: "white",
        }}
      >
        <div>
          <div style={{ fontSize: 13, opacity: 0.8 }}>Your scan points</div>
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -1 }}>
            {points} pts
          </div>
        </div>
        <div style={{ fontSize: 36 }}>⭐</div>
      </div>

      {/* Category selector */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-title">What are you scanning?</div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 10,
          }}
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setCategory(cat.key)}
              style={{
                padding: "12px 8px",
                borderRadius: 10,
                border: `2px solid ${category === cat.key ? "var(--accent)" : "var(--border)"}`,
                background:
                  category === cat.key
                    ? "var(--accent-light)"
                    : "var(--surface2)",
                cursor: "pointer",
                textAlign: "center",
                transition: "all .15s",
                fontFamily: "var(--font)",
              }}
            >
              <div style={{ fontSize: 22, marginBottom: 4 }}>{cat.emoji}</div>
              <div
                style={{
                  fontSize: 11.5,
                  fontWeight: 600,
                  color:
                    category === cat.key ? "var(--accent)" : "var(--text2)",
                }}
              >
                {cat.label}
              </div>
              <div
                style={{ fontSize: 10, color: "var(--text3)", marginTop: 2 }}
              >
                +{POINTS_MAP[cat.key]} pts
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Language Selector ── */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-title">Analysis Language</div>
        <div
          style={{ fontSize: 12.5, color: "var(--text3)", marginBottom: 12 }}
        >
          AI will explain the results in your chosen language
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              style={{
                padding: "8px 16px",
                borderRadius: 20,
                border: `2px solid ${language === lang.code ? "var(--accent)" : "var(--border)"}`,
                background:
                  language === lang.code
                    ? "var(--accent-light)"
                    : "var(--surface2)",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: language === lang.code ? 700 : 500,
                color:
                  language === lang.code ? "var(--accent)" : "var(--text2)",
                display: "flex",
                alignItems: "center",
                gap: 6,
                transition: "all .15s",
                fontFamily: "var(--font)",
              }}
            >
              <span>{lang.flag}</span>
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main two column layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          alignItems: "start",
        }}
      >
        {/* LEFT — Image upload */}
        <div className="card">
          <div className="card-title">Upload Image</div>

          {!preview ? (
            <div
              className={`upload-area${dragging ? " drag" : ""}`}
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                handleFile(e.dataTransfer.files[0]);
              }}
              style={{
                minHeight: 280,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 12 }}>📸</div>
              <div
                style={{ fontWeight: 600, fontSize: 14, color: "var(--text2)" }}
              >
                Drop image here
              </div>
              <div
                style={{ fontSize: 12, color: "var(--text3)", marginTop: 6 }}
              >
                or click to browse · JPG, PNG
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => handleFile(e.target.files[0])}
              />
            </div>
          ) : (
            <div>
              <img
                src={preview}
                alt="uploaded"
                style={{
                  width: "100%",
                  borderRadius: 10,
                  border: "1px solid var(--border)",
                  maxHeight: 320,
                  objectFit: "contain",
                  background: "var(--surface2)",
                }}
              />

              {/* Selected language indicator */}
              <div
                style={{
                  marginTop: 10,
                  padding: "6px 12px",
                  background: "var(--surface2)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 12.5,
                  color: "var(--text2)",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span>{selectedLang?.flag}</span>
                <span>
                  Result will be in{" "}
                  <strong style={{ color: "var(--accent)" }}>
                    {selectedLang?.label}
                  </strong>
                </span>
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                <button
                  className="btn btn-primary"
                  style={{ flex: 1, justifyContent: "center" }}
                  onClick={handleAnalyse}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="spinner" />
                      Analysing...
                    </>
                  ) : (
                    `Analyse (+${POINTS_MAP[category]} pts)`
                  )}
                </button>
                <button className="btn btn-secondary" onClick={reset}>
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT — Result */}
        <div className="card" style={{ minHeight: 360 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 14,
            }}
          >
            <div className="card-title" style={{ marginBottom: 0 }}>
              Analysis Result
            </div>
            {result && !result.error && (
              <div
                style={{
                  fontSize: 11.5,
                  color: "var(--text3)",
                  background: "var(--surface2)",
                  border: "1px solid var(--border)",
                  borderRadius: 20,
                  padding: "3px 10px",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                {selectedLang?.flag} {selectedLang?.label}
              </div>
            )}
          </div>

          {!result && !loading && (
            <div
              style={{
                textAlign: "center",
                padding: "48px 20px",
                color: "var(--text3)",
              }}
            >
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
                Upload an image to get started
              </div>
              <div style={{ fontSize: 12 }}>
                AI will explain what it finds in simple language
              </div>
            </div>
          )}

          {loading && (
            <div style={{ textAlign: "center", padding: "48px 20px" }}>
              <div
                className="spinner spinner-lg"
                style={{ margin: "0 auto 16px" }}
              />
              <div
                style={{ fontSize: 14, fontWeight: 600, color: "var(--text2)" }}
              >
                Reading your image...
              </div>
              <div
                style={{ fontSize: 12, color: "var(--text3)", marginTop: 6 }}
              >
                Generating response in {selectedLang?.label}
              </div>
            </div>
          )}

          {result && !result.error && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div
                style={{
                  background: "var(--green-bg)",
                  border: "1px solid var(--green-border)",
                  borderRadius: 8,
                  padding: "10px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <span style={{ fontSize: 20 }}>⭐</span>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--green)",
                  }}
                >
                  +{POINTS_MAP[category]} points earned!
                </span>
              </div>

              {result.summary && (
                <div>
                  <div
                    style={{
                      fontSize: 11.5,
                      fontWeight: 600,
                      color: "var(--text3)",
                      textTransform: "uppercase",
                      letterSpacing: ".06em",
                      marginBottom: 6,
                    }}
                  >
                    Summary
                  </div>
                  <p
                    style={{
                      fontSize: 13.5,
                      color: "var(--text2)",
                      lineHeight: 1.7,
                    }}
                  >
                    {result.summary}
                  </p>
                </div>
              )}

              {result.keyPoints?.length > 0 && (
                <div>
                  <div
                    style={{
                      fontSize: 11.5,
                      fontWeight: 600,
                      color: "var(--text3)",
                      textTransform: "uppercase",
                      letterSpacing: ".06em",
                      marginBottom: 8,
                    }}
                  >
                    Key Points
                  </div>
                  {result.keyPoints.map((point, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        gap: 10,
                        marginBottom: 8,
                        padding: "8px 12px",
                        background: "var(--surface2)",
                        borderRadius: 8,
                        border: "1px solid var(--border)",
                      }}
                    >
                      <span
                        style={{
                          color: "var(--accent)",
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {i + 1}.
                      </span>
                      <span
                        style={{
                          fontSize: 13,
                          color: "var(--text2)",
                          lineHeight: 1.6,
                        }}
                      >
                        {point}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {result.warning && (
                <div
                  style={{
                    padding: "10px 14px",
                    background: "var(--orange-bg)",
                    border: "1px solid var(--orange-border)",
                    borderRadius: 8,
                    fontSize: 13,
                    color: "var(--orange)",
                  }}
                >
                  ⚠️ {result.warning}
                </div>
              )}

              {result.medicines?.length > 0 && (
                <div>
                  <div
                    style={{
                      fontSize: 11.5,
                      fontWeight: 600,
                      color: "var(--text3)",
                      textTransform: "uppercase",
                      letterSpacing: ".06em",
                      marginBottom: 8,
                    }}
                  >
                    Medicines Found
                  </div>
                  {result.medicines.map((m, i) => (
                    <div
                      key={i}
                      style={{
                        padding: "8px 12px",
                        borderBottom: "1px solid var(--border)",
                        fontSize: 13,
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>{m.name}</span>
                      {m.use && (
                        <span style={{ color: "var(--text3)", marginLeft: 8 }}>
                          — {m.use}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {result?.error && (
            <div
              style={{
                padding: "16px",
                background: "var(--red-bg)",
                borderRadius: 8,
                color: "var(--red)",
                fontSize: 13,
              }}
            >
              ❌ {result.error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
