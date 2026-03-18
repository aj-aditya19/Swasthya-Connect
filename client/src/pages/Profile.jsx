import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { Spinner } from '../components/UI';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [toast, setToast]     = useState(null);
  const [form, setForm]       = useState({ ...user });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await authAPI.updateProfile({
        name: form.name, phone: form.phone, age: Number(form.age) || undefined,
        gender: form.gender, bloodGroup: form.bloodGroup,
        address: form.address, preferredLanguage: form.preferredLanguage,
      });
      updateUser(res.data);
      setEditing(false);
      showToast('Profile updated successfully!');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally { setSaving(false); }
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('') || 'U';

  const InfoRow = ({ label, value }) => (
    <div className="profile-info-row">
      <span className="profile-field">{label}</span>
      <span className="profile-val">{value || <span style={{ color: 'var(--text3)' }}>Not set</span>}</span>
    </div>
  );

  return (
    <div className="page-body fade-in">
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999 }}>
          <div className={`toast toast-${toast.type}`}>{toast.msg}</div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        {/* Left column */}
        <div style={{ flex: 1, minWidth: 260, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: 28 }}>
            <div className="profile-avatar">{initials}</div>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 2 }}>{user?.name}</div>
            <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 12 }}>{user?.email}</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 12.5, background: 'var(--accent-light)', color: 'var(--accent)', padding: '6px 16px', borderRadius: 20, marginBottom: 4 }}>
              {user?.medicalId}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 8 }}>
              Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : '—'}
            </div>
          </div>

          <div className="card">
            <div className="card-title">Health Identity</div>
            <InfoRow label="Blood Group" value={
              <span className="badge badge-high">{user?.bloodGroup || 'Not set'}</span>
            } />
            <InfoRow label="Gender" value={user?.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : null} />
            <InfoRow label="Age" value={user?.age ? `${user.age} years` : null} />
            <InfoRow label="Language" value={
              { en: 'English', hi: 'Hindi', ta: 'Tamil', bn: 'Bengali', te: 'Telugu' }[user?.preferredLanguage] || user?.preferredLanguage
            } />
          </div>
        </div>

        {/* Right column */}
        <div style={{ flex: 2, minWidth: 300 }}>
          <div className="card">
            <div className="flex items-center justify-between mb-16">
              <div className="card-title" style={{ margin: 0 }}>Personal Details</div>
              {!editing ? (
                <button className="btn btn-secondary btn-sm" onClick={() => { setForm({ ...user }); setEditing(true); }}>
                  Edit Profile
                </button>
              ) : (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
                    {saving ? <Spinner /> : 'Save Changes'}
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => { setEditing(false); setForm({ ...user }); }}>
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {editing ? (
              <div className="grid2">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-input" value={form.phone || ''} placeholder="+91 98765 43210" onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Age</label>
                  <input className="form-input" type="number" value={form.age || ''} onChange={e => setForm(f => ({ ...f, age: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select className="form-input" value={form.gender || ''} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}>
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Blood Group</label>
                  <select className="form-input" value={form.bloodGroup || ''} onChange={e => setForm(f => ({ ...f, bloodGroup: e.target.value }))}>
                    <option value="">Select</option>
                    {['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Language</label>
                  <select className="form-input" value={form.preferredLanguage || 'en'} onChange={e => setForm(f => ({ ...f, preferredLanguage: e.target.value }))}>
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                    <option value="ta">Tamil</option>
                    <option value="bn">Bengali</option>
                    <option value="te">Telugu</option>
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Address</label>
                  <input className="form-input" value={form.address || ''} placeholder="Your city, state" onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
                </div>
              </div>
            ) : (
              <>
                <InfoRow label="Full Name"  value={user?.name} />
                <InfoRow label="Email"      value={user?.email} />
                <InfoRow label="Phone"      value={user?.phone} />
                <InfoRow label="Age"        value={user?.age ? `${user.age} years` : null} />
                <InfoRow label="Gender"     value={user?.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : null} />
                <InfoRow label="Blood Group" value={user?.bloodGroup} />
                <InfoRow label="Address"   value={user?.address} />
                <InfoRow label="Language"  value={{ en: 'English', hi: 'Hindi', ta: 'Tamil', bn: 'Bengali', te: 'Telugu' }[user?.preferredLanguage]} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
