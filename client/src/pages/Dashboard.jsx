import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { reportsAPI, remindersAPI } from '../services/api';
import { LoadingCenter, StatusBadge } from '../components/UI';

const TODAY = new Date().toISOString().split('T')[0];

function getSnapClass(status) {
  return status === 'normal' ? 'snap-normal' : status === 'high' ? 'snap-high' : status === 'low' ? 'snap-low' : '';
}

export default function Dashboard({ setPage }) {
  const { user } = useAuth();
  const [reports, setReports]     = useState({});
  const [reminders, setReminders] = useState([]);
  const [takenState, setTakenState] = useState({});
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([reportsAPI.getAll(), remindersAPI.getAll()])
      .then(([rRes, mRes]) => { setReports(rRes.data.data || {}); setReminders(mRes.data || []); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const activeReminders = reminders.filter(r => r.isActive);
  const allReports      = Object.entries(reports);
  const doneReports     = allReports.filter(([, r]) => r.status === 'done').sort((a, b) => new Date(b[1].uploadedAt) - new Date(a[1].uploadedAt));
  const latestReport    = doneReports[0]?.[1];

  const todayMeds = activeReminders.flatMap(r =>
    r.scheduleTimes.map(time => {
      const key     = `${r._id}_${time}`;
      const log     = r.takenLog?.find(l => l.date === TODAY && l.time === time);
      const taken   = takenState[key] !== undefined ? takenState[key] : (log?.takenOrNot || false);
      return { ...r, time, taken, key };
    })
  ).sort((a, b) => a.time.localeCompare(b.time));

  const takenCount   = todayMeds.filter(m => m.taken).length;
  const nextReminder = todayMeds.find(m => !m.taken);

  const markTaken = async (rem, key, time, currentTaken) => {
    setTakenState(s => ({ ...s, [key]: !currentTaken }));
    try {
      await remindersAPI.markTaken(rem._id, { date: TODAY, time, takenOrNot: !currentTaken });
    } catch { setTakenState(s => ({ ...s, [key]: currentTaken })); }
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const dateStr = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  if (loading) return <LoadingCenter />;

  return (
    <div className="page-body fade-in">
      <div className="dash-topbar">
        <div>
          <div className="dash-greeting">{greeting()}, {user?.name?.split(' ')[0]} 👋</div>
          <div className="dash-date">{dateStr}</div>
        </div>
        <div className="dash-medid">{user?.medicalId}</div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Reports Uploaded</div>
          <div className="stat-value">{allReports.length}</div>
          <div className="stat-sub">{latestReport ? `Latest: ${latestReport.reportName}` : 'No reports yet'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Reminders</div>
          <div className="stat-value">{activeReminders.length}</div>
          <div className="stat-sub">{nextReminder ? `Next at ${nextReminder.time}` : 'All done for today!'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Medicines Today</div>
          <div className="stat-value" style={{ color: todayMeds.length && takenCount === todayMeds.length ? 'var(--green)' : takenCount > 0 ? 'var(--orange)' : 'var(--text)' }}>
            {takenCount}/{todayMeds.length}
          </div>
          <div className="stat-sub">{todayMeds.length - takenCount} pending today</div>
        </div>
      </div>

      <div className="grid2" style={{ gap: 16, marginBottom: 16 }}>
        <div className="card">
          <div className="card-title">Recent Reports</div>
          {allReports.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text3)', fontSize: 13 }}>
              No reports yet.<br />
              <span style={{ color: 'var(--accent)', cursor: 'pointer' }} onClick={() => setPage('reports')}>Upload your first report →</span>
            </div>
          ) : (
            allReports.slice(0, 4).map(([key, report]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13.5 }}>{report.reportName}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--text3)', marginTop: 2 }}>
                    {new Date(report.uploadedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                </div>
                <StatusBadge status={report.status} testResults={report.extractedData?.testResults} />
              </div>
            ))
          )}
          {allReports.length > 0 && (
            <button className="btn btn-ghost btn-sm" style={{ marginTop: 10, width: '100%' }} onClick={() => setPage('reports')}>
              View all reports →
            </button>
          )}
        </div>

        <div className="card">
          <div className="card-title">Today's Medicines</div>
          {todayMeds.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text3)', fontSize: 13 }}>
              No medicines scheduled.<br />
              <span style={{ color: 'var(--accent)', cursor: 'pointer' }} onClick={() => setPage('reminders')}>Add a reminder →</span>
            </div>
          ) : (
            todayMeds.map(med => (
              <div key={med.key} className={`med-row${med.taken ? ' taken' : ''}`}>
                <div>
                  <div className="med-name">{med.medicineName} <span style={{ fontWeight: 400, fontSize: 12, color: 'var(--text3)' }}>{med.dosage}</span></div>
                  <div className="med-detail">{med.time} · {med.frequency}</div>
                </div>
                <button className={`taken-btn${med.taken ? ' done' : ''}`} onClick={() => markTaken(med, med.key, med.time, med.taken)}>
                  {med.taken ? '✓ Taken' : 'Mark taken'}
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="chat-teaser mb-16" onClick={() => setPage('chat')}>
        <div className="chat-teaser-dot" />
        <div className="chat-teaser-text">
          Ask MediBot anything — "What does my report mean?" or "Metformin ke side effects kya hain?"
        </div>
        <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>Chat →</span>
      </div>

      {latestReport && latestReport.extractedData?.testResults?.length > 0 && (
        <div className="card">
          <div className="card-title">
            Latest Report Snapshot — {latestReport.reportName} ({latestReport.extractedData.reportDate || new Date(latestReport.uploadedAt).toLocaleDateString('en-IN')})
          </div>
          <div className="snap-grid">
            {latestReport.extractedData.testResults.slice(0, 4).map((t, i) => (
              <div key={i} className={`snap-tile ${getSnapClass(t.status)}`}>
                <div className="snap-test">{t.testName}</div>
                <div className="snap-val">{t.value}</div>
                <div className="snap-unit">{t.unit} · {t.status.charAt(0).toUpperCase() + t.status.slice(1)}</div>
              </div>
            ))}
          </div>
          {latestReport.extractedData.doctorName && (
            <div style={{ marginTop: 12, fontSize: 12.5, color: 'var(--text3)', display: 'flex', gap: 12, alignItems: 'center' }}>
              <span>Dr: {latestReport.extractedData.doctorName}</span>
              {latestReport.extractedData.hospitalName && <span>· {latestReport.extractedData.hospitalName}</span>}
              {latestReport.extractedData.followUpDate && (
                <span className="badge badge-processing" style={{ marginLeft: 'auto' }}>
                  Follow-up: {latestReport.extractedData.followUpDate}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
