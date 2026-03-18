import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { Spinner, Icons } from '../components/UI';

function LogoBrand() {
  return (
    <div className="auth-logo">
      <div className="auth-logo-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
        </svg>
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-.5px' }}>
        Medi<span style={{ color: 'var(--accent)' }}>Setu</span>
      </div>
      <div style={{ fontSize: 12.5, color: 'var(--text3)', marginTop: 3 }}>Your personal health companion</div>
    </div>
  );
}

function OtpScreen({ email, name, onVerify, onBack, mode }) {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);
  const { login } = useAuth();

  const handleVerify = async () => {
    if (otp.length !== 6) return setError('Please enter the 6-digit OTP');
    setLoading(true); setError('');
    try {
      const endpoint = mode === 'login' ? authAPI.loginVerify : authAPI.verifyOtp;
      const res = await endpoint({ email, otp });
      login(res.data.token, res.data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    setResending(true);
    try { await authAPI.resendOtp({ email }); setError(''); }
    catch (err) { setError(err.response?.data?.message || 'Failed to resend'); }
    finally { setResending(false); }
  };

  return (
    <div className="auth-right">
      <div className="auth-card">
        <LogoBrand />
        <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Verify your email</div>
        <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 24 }}>
          We sent a 6-digit OTP to <strong style={{ color: 'var(--text)' }}>{email}</strong>.<br />
          It expires in 5 minutes.
        </div>
        <div className="form-group">
          <label className="form-label">One-time password</label>
          <input
            className="form-input"
            placeholder="000000"
            value={otp}
            maxLength={6}
            style={{ textAlign: 'center', fontSize: 24, fontFamily: 'var(--mono)', letterSpacing: 8 }}
            onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
            onKeyDown={e => e.key === 'Enter' && handleVerify()}
            autoFocus
          />
          {error && <div className="form-error">{error}</div>}
        </div>
        <button className="btn btn-primary btn-full btn-lg" onClick={handleVerify} disabled={loading || otp.length !== 6}>
          {loading ? <Spinner /> : 'Verify & Continue'}
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, fontSize: 13 }}>
          <button className="btn btn-ghost btn-sm" onClick={onBack}>← Back</button>
          <button className="btn btn-ghost btn-sm" onClick={handleResend} disabled={resending}>
            {resending ? 'Sending...' : 'Resend OTP'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function Login({ goRegister }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const handleLogin = async () => {
    if (!form.email || !form.password) return setError('Email and password are required');
    setLoading(true); setError('');
    try {
      await authAPI.login(form);
      setOtpSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally { setLoading(false); }
  };

  if (otpSent) return (
    <div className="auth-wrap">
      <AuthHero />
      <OtpScreen email={form.email} mode="login" onVerify={() => {}} onBack={() => setOtpSent(false)} />
    </div>
  );

  return (
    <div className="auth-wrap">
      <AuthHero />
      <div className="auth-right">
        <div className="auth-card">
          <LogoBrand />
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Welcome back</div>
          <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 24 }}>Sign in to your MediSetu account</div>

          <div className="form-group">
            <label className="form-label">Email address</label>
            <input className="form-input" type="email" placeholder="you@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="••••••••" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
          </div>
          {error && <div className="form-error" style={{ marginBottom: 12 }}>{error}</div>}

          <button className="btn btn-primary btn-full btn-lg" onClick={handleLogin} disabled={loading}>
            {loading ? <Spinner /> : 'Sign In — get OTP'}
          </button>
          <div className="divider" />
          <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text3)' }}>
            Don't have an account?{' '}
            <span style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }} onClick={goRegister}>Register here</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Register({ goLogin }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', age: '', gender: 'male', bloodGroup: 'B+', preferredLanguage: 'en' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const handleRegister = async () => {
    setLoading(true); setError('');
    try {
      await authAPI.register({ ...form, age: Number(form.age) || undefined });
      setOtpSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  if (otpSent) return (
    <div className="auth-wrap">
      <AuthHero />
      <OtpScreen email={form.email} name={form.name} mode="register" onVerify={() => {}} onBack={() => setOtpSent(false)} />
    </div>
  );

  return (
    <div className="auth-wrap">
      <AuthHero />
      <div className="auth-right">
        <div className="auth-card" style={{ maxWidth: 480 }}>
          <LogoBrand />
          <div className="step-bar">
            {[1,2].map(s => <div key={s} className="step-dot" style={{ background: s <= step ? 'var(--accent)' : 'var(--border)' }} />)}
          </div>

          {step === 1 && (
            <>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Create your account</div>
              <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 20 }}>Step 1 of 2 — Basic details</div>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-input" placeholder="Rajesh Kumar" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Email address *</label>
                <input className="form-input" type="email" placeholder="you@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Password *</label>
                <input className="form-input" type="password" placeholder="Minimum 8 characters" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone number</label>
                <input className="form-input" placeholder="+91 98765 43210" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <button className="btn btn-primary btn-full btn-lg" onClick={() => { if (!form.name || !form.email || !form.password) { setError('Name, email and password are required'); return; } setError(''); setStep(2); }}>
                Next →
              </button>
              {error && <div className="form-error" style={{ marginTop: 10 }}>{error}</div>}
              <div className="divider" />
              <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text3)' }}>
                Already have an account?{' '}
                <span style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }} onClick={goLogin}>Sign in</span>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Health details</div>
              <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 20 }}>Step 2 of 2 — For your health profile</div>
              <div className="grid2">
                <div className="form-group">
                  <label className="form-label">Age</label>
                  <input className="form-input" type="number" placeholder="30" value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select className="form-input" value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}>
                    <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Blood Group</label>
                  <select className="form-input" value={form.bloodGroup} onChange={e => setForm(f => ({ ...f, bloodGroup: e.target.value }))}>
                    {['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Language</label>
                  <select className="form-input" value={form.preferredLanguage} onChange={e => setForm(f => ({ ...f, preferredLanguage: e.target.value }))}>
                    <option value="en">English</option><option value="hi">Hindi</option>
                    <option value="ta">Tamil</option><option value="bn">Bengali</option><option value="te">Telugu</option>
                  </select>
                </div>
              </div>
              {error && <div className="form-error" style={{ marginBottom: 12 }}>{error}</div>}
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setStep(1)}>← Back</button>
                <button className="btn btn-primary" style={{ flex: 2, justifyContent: 'center' }} onClick={handleRegister} disabled={loading}>
                  {loading ? <Spinner /> : 'Send verification OTP'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function AuthHero() {
  return (
    <div className="auth-left">
      <div style={{ maxWidth: 380, color: 'white' }}>
        <div style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-1px', lineHeight: 1.2, marginBottom: 20 }}>
          Your health,<br />understood.
        </div>
        <div style={{ fontSize: 15, opacity: .85, lineHeight: 1.7, marginBottom: 32 }}>
          Upload medical reports, get AI-powered analysis in Hindi or English, set medicine reminders, and discover government health schemes — all in one place.
        </div>
        {['AI report analysis in your language', 'Medicine reminders via email', 'Government health schemes', 'Secure cloud storage'].map((f, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, fontSize: 14, opacity: .9 }}>
            <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, flexShrink: 0 }}>✓</div>
            {f}
          </div>
        ))}
      </div>
    </div>
  );
}
