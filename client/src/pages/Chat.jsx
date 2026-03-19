import React, { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { chatAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Spinner } from "../components/UI";

const QUICK = [
  "What does my latest report mean?",
  "Metformin ke side effects kya hain?",
  "Iron badhane ke liye kya khayein?",
  "When is my next follow-up?",
  "Blood sugar normal kaise karein?",
];

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function speak(text, lang = "hi-IN") {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang;
  utter.rate = 0.95;
  utter.pitch = 1;
  window.speechSynthesis.speak(utter);
}

function stopSpeaking() {
  window.speechSynthesis?.cancel();
}

export default function Chat() {
  const { user } = useAuth();

  const [sessionId] = useState(
    () =>
      localStorage.getItem("chatSessionId") ||
      (() => {
        const id = uuidv4();
        localStorage.setItem("chatSessionId", id);
        return id;
      })(),
  );

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [listening, setListening] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const listeningRef = useRef(false); // sync flag — state updates async hoti hain

  useEffect(() => {
    chatAPI
      .getSession(sessionId)
      .then((r) => {
        const msgs = r.data.messages || [];
        if (msgs.length === 0) {
          setMessages([
            {
              role: "assistant",
              content: `Namaste ${user?.name?.split(" ")[0]}! 🙏 I am MediBot, your AI health assistant.\n\nMujhse apni sehat ke baare mein poochein — Hindi ya English mein. I can explain your medical reports, medicines, and give health advice based on your records.\n\nHow can I help you today?`,
              timestamp: new Date().toISOString(),
            },
          ]);
        } else {
          setMessages(msgs);
        }
      })
      .catch(() => {
        setMessages([
          {
            role: "assistant",
            content:
              "Namaste! I am MediBot. How can I help you with your health today?",
            timestamp: new Date().toISOString(),
          },
        ]);
      });
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  // ── KEY FIX: har press pe bilkul naya SpeechRecognition instance ──────
  // Ek hi instance ko reuse karne se onresult silently fail ho jaata hai
  // kyunki browser us instance ko "already used" mark kar leta hai.
  const toggleMic = () => {
    if (listeningRef.current) {
      listeningRef.current = false;
      setListening(false);
      return;
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert("Aapka browser mic support nahi karta. Chrome ya Edge use karein.");
      return;
    }

    stopSpeaking();

    const rec = new SR(); // fresh instance every time
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = user?.preferredLanguage === "en" ? "en-IN" : "hi-IN";

    rec.onstart = () => {
      console.log("[MediBot Mic] Started, lang:", rec.lang);
    };

    rec.onresult = (e) => {
      console.log("[MediBot Mic] Result received:", e.results);
      const transcript = e.results[0]?.[0]?.transcript?.trim();
      console.log("[MediBot Mic] Transcript:", transcript);
      if (transcript) {
        setInput(transcript);
      }
      listeningRef.current = false;
      setListening(false);
    };

    rec.onspeechend = () => {
      console.log("[MediBot Mic] Speech ended, stopping...");
      rec.stop();
    };

    rec.onerror = (e) => {
      console.error("[MediBot Mic] Error:", e.error);
      if (e.error === "not-allowed") {
        alert(
          "Mic permission deny hai. Browser address bar mein lock icon click karke mic allow karein.",
        );
      } else if (e.error === "no-speech") {
        alert("Koi awaaz nahi aayi. Thoda aur kareeb bolke try karein.");
      } else {
        alert("Mic error aaya: " + e.error);
      }
      listeningRef.current = false;
      setListening(false);
    };

    rec.onend = () => {
      console.log("[MediBot Mic] Ended");
      listeningRef.current = false;
      setListening(false);
    };

    listeningRef.current = true;
    setListening(true);
    rec.start();
  };
  // ─────────────────────────────────────────────────────────────────────

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg || typing) return;

    setInput("");
    stopSpeaking();

    const userMsg = {
      role: "user",
      content: msg,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setTyping(true);

    try {
      const res = await chatAPI.sendMessage({
        message: msg,
        sessionId,
        language: user?.preferredLanguage || "en",
      });
      const reply = res.data.reply;

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: reply,
          timestamp: new Date().toISOString(),
        },
      ]);

      if (ttsEnabled) {
        const lang = user?.preferredLanguage === "en" ? "en-IN" : "hi-IN";
        speak(reply, lang);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I could not process that right now. Please try again.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setTyping(false);
      inputRef.current?.focus();
    }
  };

  const newChat = async () => {
    if (
      !window.confirm("Start a new chat? Current conversation will be cleared.")
    )
      return;
    stopSpeaking();
    try {
      await chatAPI.clearSession(sessionId);
    } catch {}
    localStorage.removeItem("chatSessionId");
    window.location.reload();
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("") || "U";

  return (
    <div className="chat-wrap">
      <div className="chat-topbar">
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "var(--green)",
            flexShrink: 0,
          }}
        />
        <span style={{ fontWeight: 600, fontSize: 13 }}>MediBot</span>
        <span style={{ fontSize: 12, color: "var(--text3)" }}>
          Powered by LLaMA AI · Hindi & English
        </span>

        <button
          className="btn btn-ghost btn-sm"
          title={ttsEnabled ? "Mute MediBot voice" : "Unmute MediBot voice"}
          onClick={() => {
            setTtsEnabled((v) => !v);
            if (ttsEnabled) stopSpeaking();
          }}
          style={{ marginLeft: "auto" }}
        >
          {ttsEnabled ? "🔊" : "🔇"}
        </button>

        <button className="btn btn-ghost btn-sm" onClick={newChat}>
          New chat
        </button>
      </div>

      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`msg msg-${msg.role} fade-in`}>
            <div className="msg-avatar">
              {msg.role === "assistant" ? "MB" : initials}
            </div>
            <div>
              <div className="msg-bubble">
                {msg.content}
                {msg.role === "assistant" && (
                  <button
                    onClick={() =>
                      speak(
                        msg.content,
                        user?.preferredLanguage === "en" ? "en-IN" : "hi-IN",
                      )
                    }
                    title="Replay voice"
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 13,
                      marginLeft: 6,
                      opacity: 0.55,
                      verticalAlign: "middle",
                    }}
                  >
                    🔉
                  </button>
                )}
              </div>
              <div className="msg-time">{formatTime(msg.timestamp)}</div>
            </div>
          </div>
        ))}

        {typing && (
          <div className="msg msg-assistant fade-in">
            <div className="msg-avatar">MB</div>
            <div>
              <div
                className="msg-bubble"
                style={{
                  color: "var(--text3)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Spinner /> Typing...
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="chat-suggestions">
        {QUICK.map((q, i) => (
          <button
            key={i}
            className="btn btn-secondary btn-sm"
            style={{ borderRadius: 20, fontSize: 11.5 }}
            onClick={() => send(q)}
            disabled={typing}
          >
            {q}
          </button>
        ))}
      </div>

      <div className="chat-input-bar">
        <button
          className="btn btn-ghost btn-sm"
          onClick={toggleMic}
          disabled={typing}
          title={listening ? "Stop listening" : "Speak your question"}
          style={{
            borderRadius: "50%",
            width: 36,
            height: 36,
            padding: 0,
            flexShrink: 0,
            background: listening ? "var(--red, #fee2e2)" : undefined,
          }}
        >
          {listening ? "⏹" : "🎤"}
        </button>

        <textarea
          ref={inputRef}
          className="chat-input"
          placeholder={
            listening
              ? "Listening... bol rahe hain..."
              : "Apna sawaal yahan likhein (Hindi or English)..."
          }
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          rows={1}
          disabled={typing}
        />

        <button
          className="chat-send"
          onClick={() => send()}
          disabled={!input.trim() || typing}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            width="16"
            height="16"
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
