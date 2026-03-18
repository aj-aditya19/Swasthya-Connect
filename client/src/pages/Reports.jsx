import React, { useState, useEffect, useRef } from 'react';
import { reportsAPI } from '../services/api';
import { LoadingCenter, EmptyState, StatusBadge, Icons, Spinner } from '../components/UI';

function TestItem({ test }) {
  const cls = test.status === 'normal' ? 'test-normal' : test.status === 'high' ? 'test-high' : test.status === 'low' ? 'test-low' : '';
  return (
    <div className={`test-item ${cls}`}>
      <div className="test-name">{test.testName}</div>
      <div className="test-value">{test.value} <span className="test-unit">{test.unit}</span></div>
      <div className="test-range">Normal: {test.normalRange}</div>
    </div>
  );
}

function ReportDetail({ report, onBack, onDelete }) {
  const d = report.extractedData;
  if (report.status === 'processing') return (
    <div className="page-body fade-in">
      <button className="btn btn-secondary btn-sm mb-16" onClick={onBack}>← Back</button>
      <div className="card" style={{ textAlign: 'center', padding: 56 }}>
        <div style={{ fontSize: 42, marginBottom: 16 }}>⏳</div>
        <div style={{ fontSize: 18, fontWeight: 700 }}>Analysing your report</div>
        <div style={{ fontSize: 13.5, color: 'var(--text3)', marginTop: 8 }}>AI is reading and extracting data. Usually takes 1–2 minutes. Refresh to check.</div>
      </div>
    </div>
  );
  if (report.status === 'failed') return (
    <div className="page-body fade-in">
      <button className="btn btn-secondary btn-sm mb-16" onClick={onBack}>← Back</button>
      <div className="card" style={{ textAlign: 'center', padding: 56 }}>
        <div style={{ fontSize: 42, marginBottom: 16 }}>❌</div>
        <div style={{ fontSize: 18, fontWeight: 700 }}>Analysis failed</div>
        <div style={{ fontSize: 13.5, color: 'var(--text3)', marginTop: 8 }}>Could not extract data from this file. Please try uploading a clearer image or PDF.</div>
      </div>
    </div>
  );

  return (
    <div className="page-body fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <button className="btn btn-secondary btn-sm" onClick={onBack}>← Back to reports</button>
        <button className="btn btn-danger btn-sm" onClick={onDelete}>{Icons.trash} Delete</button>
      </div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: 2, minWidth: 280, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="card-title">Report Overview</div>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>{report.reportName}</div>
            {[['Doctor', d.doctorName], ['Hospital', d.hospitalName], ['Report Date', d.reportDate], ['Diagnosis', d.diagnosis], ['Follow-up', d.followUpDate]].filter(([, v]) => v).map(([label, val]) => (
              <div key={label} className="profile-info-row">
                <span className="profile-field">{label}</span>
                <span className="profile-val">{val}</span>
              </div>
            ))}
          </div>

          {d.summary && (
            <div className="card">
              <div className="card-title">AI Summary</div>
              <p style={{ fontSize: 13.5, color: 'var(--text2)', lineHeight: 1.7 }}>{d.summary}</p>
              {d.advice && (
                <div style={{ marginTop: 14, padding: '12px 14px', background: 'var(--accent-light)', borderRadius: 8, borderLeft: '3px solid var(--accent)' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>Doctor's Advice</div>
                  <div style={{ fontSize: 13, color: 'var(--text2)' }}>{d.advice}</div>
                </div>
              )}
            </div>
          )}

          {d.testResults?.length > 0 && (
            <div className="card">
              <div className="card-title">Test Results</div>
              <div className="test-grid">{d.testResults.map((t, i) => <TestItem key={i} test={t} />)}</div>
            </div>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 240, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {d.medicines?.length > 0 && (
            <div className="card">
              <div className="card-title">Prescribed Medicines</div>
              {d.medicines.map((m, i) => (
                <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ fontWeight: 600, fontSize: 13.5 }}>{m.name} <span style={{ fontWeight: 400, color: 'var(--text3)' }}>{m.dosage}</span></div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{m.frequency} · {m.duration}</div>
                </div>
              ))}
            </div>
          )}
          <div className="card">
            <div className="card-title">File Details</div>
            <div className="profile-info-row"><span className="profile-field">File type</span><span className="profile-val" style={{ textTransform: 'uppercase' }}>{report.fileType}</span></div>
            <div className="profile-info-row"><span className="profile-field">Uploaded</span><span className="profile-val">{new Date(report.uploadedAt).toLocaleDateString('en-IN')}</span></div>
            <div className="profile-info-row"><span className="profile-field">Status</span><StatusBadge status={report.status} testResults={d.testResults} /></div>
            <a href={report.link} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{ marginTop: 12, width: '100%', justifyContent: 'center' }}>
              Open file
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Reports() {
  const [reports, setReports]   = useState({});
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading]   = useState(false);
  const [uploadName, setUploadName] = useState('');
  const [file, setFile]         = useState(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError]       = useState('');
  const fileRef = useRef();

  const load = () => {
    setLoading(true);
    reportsAPI.getAll().then(r => setReports(r.data.data || {})).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleUpload = async () => {
    if (!file || !uploadName) return setError('Report name and file are required');
    setUploading(true); setError('');
    try {
      const fd = new FormData();
      fd.append('report', file);
      fd.append('reportName', uploadName);
      await reportsAPI.upload(fd);
      setShowUpload(false); setFile(null); setUploadName('');
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally { setUploading(false); }
  };

  const handleDelete = async (slug) => {
    if (!window.confirm('Delete this report?')) return;
    try { await reportsAPI.delete(slug); setSelected(null); load(); }
    catch (err) { alert(err.response?.data?.message || 'Delete failed'); }
  };

  const allReports = Object.entries(reports);

  if (selected) return (
    <ReportDetail
      report={selected[1]}
      onBack={() => setSelected(null)}
      onDelete={() => handleDelete(selected[0])}
    />
  );

  if (loading) return <LoadingCenter />;

  return (
    <div className="page-body fade-in">
      <div className="flex items-center justify-between mb-20">
        <div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Medical Reports</div>
          <div style={{ fontSize: 12.5, color: 'var(--text3)' }}>{allReports.length} report{allReports.length !== 1 ? 's' : ''} on file</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowUpload(s => !s)}>
          {Icons.upload} Upload Report
        </button>
      </div>

      {showUpload && (
        <div className="card fade-in mb-20">
          <div className="card-title">Upload New Report</div>
          <div className="form-group">
            <label className="form-label">Report Name *</label>
            <input className="form-input" placeholder="e.g. Blood Test March 2026" value={uploadName} onChange={e => setUploadName(e.target.value)} />
          </div>
          <div
            className={`upload-area${dragging ? ' drag' : ''}`}
            onClick={() => fileRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) setFile(f); }}
          >
            <div className="upload-icon">📄</div>
            <div style={{ fontWeight: 600, color: 'var(--text2)' }}>{file ? file.name : 'Drag & drop PDF or image'}</div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>or click to browse · PDF, JPG, PNG · max 10MB</div>
            <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" hidden onChange={e => setFile(e.target.files[0])} />
          </div>
          {error && <div className="form-error mt-8">{error}</div>}
          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <button className="btn btn-primary" onClick={handleUpload} disabled={uploading}>
              {uploading ? <><Spinner /> Uploading...</> : 'Upload & Analyse'}
            </button>
            <button className="btn btn-secondary" onClick={() => { setShowUpload(false); setFile(null); setError(''); }}>Cancel</button>
          </div>
        </div>
      )}

      {allReports.length === 0 ? (
        <div className="card">
          <EmptyState icon="📋" title="No reports yet" sub="Upload your first medical report to get AI-powered analysis" action={<button className="btn btn-primary" onClick={() => setShowUpload(true)}>Upload Report</button>} />
        </div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Report</th><th>Doctor</th><th>Hospital</th><th>Date</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {allReports.map(([slug, report]) => (
                  <tr key={slug}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{report.reportName}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', marginTop: 2 }}>{report.fileType}</div>
                    </td>
                    <td>{report.extractedData?.doctorName || <span style={{ color: 'var(--text3)' }}>—</span>}</td>
                    <td>{report.extractedData?.hospitalName || <span style={{ color: 'var(--text3)' }}>—</span>}</td>
                    <td>{new Date(report.uploadedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td><StatusBadge status={report.status} testResults={report.extractedData?.testResults} /></td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => setSelected([slug, report])}>View →</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
