import React, { useState, useEffect } from 'react';
import { schemesAPI } from '../services/api';
import { LoadingCenter, EmptyState } from '../components/UI';

const CATEGORIES = ['all', 'insurance', 'medicine', 'maternal', 'disability', 'general'];
const STATES     = ['all', 'central', 'Uttar Pradesh', 'Maharashtra', 'Assam'];

export default function Schemes() {
  const [schemes, setSchemes]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [category, setCategory] = useState('all');
  const [state, setState]       = useState('all');
  const [search, setSearch]     = useState('');

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (category !== 'all') params.category = category;
    if (state !== 'all')    params.state     = state;
    if (search)             params.search    = search;
    schemesAPI.getAll(params)
      .then(r => setSchemes(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [category, state, search]);

  return (
    <div className="page-body fade-in">
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 18, fontWeight: 700 }}>Government Health Schemes</div>
        <div style={{ fontSize: 12.5, color: 'var(--text3)' }}>Latest central and state health schemes for Indian citizens</div>
      </div>

      <div className="card mb-20">
        <div className="grid3" style={{ gap: 12, alignItems: 'end' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Search</label>
            <input className="form-input" placeholder="Search schemes..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Category</label>
            <select className="form-input" value={category} onChange={e => setCategory(e.target.value)}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">State / Level</label>
            <select className="form-input" value={state} onChange={e => setState(e.target.value)}>
              {STATES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingCenter />
      ) : schemes.length === 0 ? (
        <div className="card">
          <EmptyState icon="🏛️" title="No schemes found" sub="Try adjusting your filters or search term" />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {schemes.map(s => (
            <div key={s._id} className="scheme-card fade-in">
              <div className="flex items-center justify-between" style={{ gap: 12 }}>
                <div className="scheme-title">{s.title}</div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <span className={`badge badge-${s.category}`}>{s.category}</span>
                  <span className={`badge ${s.state === 'central' ? 'badge-central' : 'badge-normal'}`}>
                    {s.state === 'central' ? 'Central Govt' : s.state}
                  </span>
                </div>
              </div>

              <div className="scheme-desc">{s.description}</div>

              <div style={{ padding: '10px 14px', background: 'var(--surface2)', borderRadius: 8, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>Eligibility</div>
                <div style={{ fontSize: 13, color: 'var(--text2)' }}>{s.eligibility}</div>
              </div>

              <div className="flex items-center" style={{ gap: 12 }}>
                {s.launchedAt && (
                  <span style={{ fontSize: 11.5, color: 'var(--text3)' }}>
                    Launched: {new Date(s.launchedAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                  </span>
                )}
                {s.sourceUrl && (
                  <a href={s.sourceUrl} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{ marginLeft: 'auto' }}>
                    Official site →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
