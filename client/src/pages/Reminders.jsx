import React, { useState, useEffect } from "react";
import { remindersAPI } from "../services/api";
import { LoadingCenter, EmptyState, Spinner, Icons } from "../components/UI";

const TODAY = new Date().toISOString().split("T")[0];

export default function Reminders() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [takenState, setTakenState] = useState({});
  const [form, setForm] = useState({
    medicineName: "",
    dosage: "",
    times: "",
    frequency: "daily",
    startDate: "",
    endDate: "",
  });

  const toast = (msg, type = "success") => {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  };

  const load = async () => {
    setLoading(true);
    try {
      const r = await remindersAPI.getAll();
      setReminders(r.data);
    } catch {
      toast("Failed to load reminders", "error");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const isTaken = (rem, time) => {
    const key = `${rem._id}_${time}`;
    if (takenState[key] !== undefined) return takenState[key];
    return (
      rem.takenLog?.find((l) => l.date === TODAY && l.time === time)
        ?.takenOrNot || false
    );
  };

  const markTaken = async (rem, time) => {
    const key = `${rem._id}_${time}`;
    const current = isTaken(rem, time);
    setTakenState((s) => ({ ...s, [key]: !current }));
    try {
      await remindersAPI.markTaken(rem._id, {
        date: TODAY,
        time,
        takenOrNot: !current,
      });
      toast(
        !current ? `✓ ${rem.medicineName} ${time} marked as taken` : "Unmarked",
      );
    } catch {
      setTakenState((s) => ({ ...s, [key]: current }));
      toast("Failed to update", "error");
    }
  };

  const toggleActive = async (rem) => {
    try {
      await remindersAPI.update(rem._id, { isActive: !rem.isActive });
      setReminders((rs) =>
        rs.map((r) =>
          r._id === rem._id ? { ...r, isActive: !r.isActive } : r,
        ),
      );
      toast(rem.isActive ? "Reminder deactivated" : "Reminder activated");
    } catch {
      toast("Failed to update", "error");
    }
  };

  const deleteReminder = async (id) => {
    if (!window.confirm("Delete this reminder?")) return;
    try {
      await remindersAPI.delete(id);
      setReminders((rs) => rs.filter((r) => r._id !== id));
      toast("Reminder deleted");
    } catch {
      toast("Failed to delete", "error");
    }
  };

  const handleAdd = async () => {
    if (!form.medicineName || !form.times || !form.startDate) {
      return toast("Medicine name, times and start date are required", "error");
    }
    const scheduleTimes = form.times
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    if (!scheduleTimes.length) return toast("Enter at least one time", "error");

    setSaving(true);
    try {
      const res = await remindersAPI.create({
        medicineName: form.medicineName,
        dosage: form.dosage,
        scheduleTimes,
        frequency: form.frequency,
        startDate: form.startDate,
        endDate: form.endDate || null,
      });
      setReminders((rs) => [res.data, ...rs]);
      setForm({
        medicineName: "",
        dosage: "",
        times: "",
        frequency: "daily",
        startDate: "",
        endDate: "",
      });
      setShowForm(false);
      toast("Reminder added! You will receive email notifications.");
    } catch (err) {
      toast(err.response?.data?.message || "Failed to add reminder", "error");
    } finally {
      setSaving(false);
    }
  };

  const active = reminders.filter((r) => r.isActive);
  const inactive = reminders.filter((r) => !r.isActive);

  const todayTotal = active.reduce((a, r) => a + r.scheduleTimes.length, 0);
  const todayTaken = active.reduce(
    (a, r) => a + r.scheduleTimes.filter((t) => isTaken(r, t)).length,
    0,
  );

  if (loading) return <LoadingCenter />;

  return (
    <div className="page-body fade-in">
      {/* Toasts */}
      <div
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            {t.msg}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-20">
        <div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>
            Medicine Reminders
          </div>
          <div style={{ fontSize: 12.5, color: "var(--text3)" }}>
            Today: {todayTaken}/{todayTotal} doses taken · Email reminders
            active
          </div>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm((s) => !s)}
        >
          + Add Reminder
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="card fade-in mb-20">
          <div className="card-title">New Medicine Reminder</div>
          <div className="grid2">
            <div className="form-group">
              <label className="form-label">Medicine Name *</label>
              <input
                className="form-input"
                placeholder="e.g. Paracetamol"
                value={form.medicineName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, medicineName: e.target.value }))
                }
              />
            </div>
            <div className="form-group">
              <label className="form-label">Dosage</label>
              <input
                className="form-input"
                placeholder="e.g. 500mg, 1 tablet"
                value={form.dosage}
                onChange={(e) =>
                  setForm((f) => ({ ...f, dosage: e.target.value }))
                }
              />
            </div>
            <div className="form-group">
              <label className="form-label">Times (comma separated) *</label>
              <input
                className="form-input"
                placeholder="08:00, 14:00, 21:00"
                value={form.times}
                onChange={(e) =>
                  setForm((f) => ({ ...f, times: e.target.value }))
                }
              />
              <span className="form-hint">
                24-hour format. Example: 08:00, 20:00
              </span>
            </div>
            <div className="form-group">
              <label className="form-label">Frequency</label>
              <select
                className="form-input"
                value={form.frequency}
                onChange={(e) =>
                  setForm((f) => ({ ...f, frequency: e.target.value }))
                }
              >
                <option value="daily">Daily</option>
                <option value="alternate">Alternate days</option>
                <option value="weekly">Weekly (Mondays)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Start Date *</label>
              <input
                type="date"
                className="form-input"
                value={form.startDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, startDate: e.target.value }))
                }
              />
            </div>
            <div className="form-group">
              <label className="form-label">End Date</label>
              <input
                type="date"
                className="form-input"
                value={form.endDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, endDate: e.target.value }))
                }
              />
              <span className="form-hint">Leave empty for ongoing</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="btn btn-primary"
              onClick={handleAdd}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Spinner /> Saving...
                </>
              ) : (
                "Save Reminder"
              )}
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Active reminders */}
      {active.length === 0 && !showForm ? (
        <div className="card">
          <EmptyState
            icon="💊"
            title="No active reminders"
            sub="Add medicine reminders to get email notifications at the scheduled time"
            action={
              <button
                className="btn btn-primary"
                onClick={() => setShowForm(true)}
              >
                Add Reminder
              </button>
            }
          />
        </div>
      ) : (
        active.length > 0 && (
          <div className="card mb-16">
            <div className="card-title">Active Reminders</div>
            {active.map((rem) => {
              const doneToday = rem.scheduleTimes.filter((t) =>
                isTaken(rem, t),
              ).length;
              return (
                <div
                  key={rem._id}
                  style={{
                    marginBottom: 16,
                    paddingBottom: 16,
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <div
                    className="flex items-center justify-between"
                    style={{ marginBottom: 10 }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        flexWrap: "wrap",
                      }}
                    >
                      <span style={{ fontWeight: 700, fontSize: 15 }}>
                        {rem.medicineName}
                      </span>
                      {rem.dosage && (
                        <span style={{ fontSize: 12.5, color: "var(--text3)" }}>
                          {rem.dosage}
                        </span>
                      )}
                      <span className="badge badge-processing">
                        {rem.frequency}
                      </span>
                      <span style={{ fontSize: 12, color: "var(--text3)" }}>
                        {doneToday}/{rem.scheduleTimes.length} today
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => toggleActive(rem)}
                      >
                        Deactivate
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => deleteReminder(rem._id)}
                      >
                        {Icons.trash}
                      </button>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      flexWrap: "wrap",
                      marginBottom: 8,
                    }}
                  >
                    {rem.scheduleTimes.map((time) => {
                      const taken = isTaken(rem, time);
                      return (
                        <button
                          key={time}
                          className={`taken-btn${taken ? " done" : ""}`}
                          onClick={() => markTaken(rem, time)}
                        >
                          {taken ? "✓" : "○"} {time}
                        </button>
                      );
                    })}
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--text3)" }}>
                    {new Date(rem.startDate).toLocaleDateString("en-IN")}
                    {rem.endDate
                      ? ` → ${new Date(rem.endDate).toLocaleDateString("en-IN")}`
                      : " · Ongoing"}
                  </div>
                  {/* Last 7 days history */}
                  {rem.takenLog && rem.takenLog.length > 0 && (
                    <div style={{ marginTop: 10 }}>
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--text3)",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: ".06em",
                          marginBottom: 6,
                        }}
                      >
                        Recent History
                      </div>
                      <div
                        style={{ display: "flex", gap: 6, flexWrap: "wrap" }}
                      >
                        {[...rem.takenLog]
                          .sort(
                            (a, b) =>
                              new Date(b.date + "T" + b.time) -
                              new Date(a.date + "T" + a.time),
                          )
                          .slice(0, 7)
                          .map((log, i) => (
                            <div
                              key={i}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                                padding: "3px 9px",
                                borderRadius: 20,
                                fontSize: 11.5,
                                fontWeight: 600,
                                background: log.takenOrNot
                                  ? "var(--green-bg)"
                                  : "var(--red-bg)",
                                color: log.takenOrNot
                                  ? "var(--green)"
                                  : "var(--red)",
                                border: `1px solid ${log.takenOrNot ? "var(--green-border)" : "var(--red-border)"}`,
                              }}
                            >
                              {log.takenOrNot ? "✓" : "✗"} {log.date} {log.time}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                  {/* Today's summary bar */}
                  {rem.scheduleTimes.length > 1 && (
                    <div
                      style={{
                        marginTop: 10,
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <div
                        style={{
                          flex: 1,
                          height: 4,
                          background: "var(--border)",
                          borderRadius: 10,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${(rem.scheduleTimes.filter((t) => isTaken(rem, t)).length / rem.scheduleTimes.length) * 100}%`,
                            background:
                              rem.scheduleTimes.filter((t) => isTaken(rem, t))
                                .length === rem.scheduleTimes.length
                                ? "var(--green)"
                                : "var(--accent)",
                            borderRadius: 10,
                            transition: "width 0.4s ease",
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: 11.5,
                          color: "var(--text3)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {
                          rem.scheduleTimes.filter((t) => isTaken(rem, t))
                            .length
                        }
                        /{rem.scheduleTimes.length} today
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Inactive reminders */}
      {inactive.length > 0 && (
        <div className="card">
          <div className="card-title">Inactive Reminders</div>
          {inactive.map((rem) => (
            <div
              key={rem._id}
              className="flex items-center justify-between"
              style={{
                padding: "11px 0",
                borderBottom: "1px solid var(--border)",
                opacity: 0.6,
              }}
            >
              <div>
                <span style={{ fontWeight: 600 }}>{rem.medicineName}</span>
                {rem.dosage && (
                  <span
                    style={{
                      fontSize: 12,
                      color: "var(--text3)",
                      marginLeft: 8,
                    }}
                  >
                    {rem.dosage}
                  </span>
                )}
                <div
                  style={{
                    fontSize: 11.5,
                    color: "var(--text3)",
                    marginTop: 2,
                  }}
                >
                  {rem.scheduleTimes.join(", ")} · {rem.frequency}
                </div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => toggleActive(rem)}
                >
                  Activate
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => deleteReminder(rem._id)}
                >
                  {Icons.trash}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
