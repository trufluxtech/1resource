import React, { useEffect, useMemo, useState } from 'react';
import brandLogo from './assets/truflux_logo.png';

const API_BASE = import.meta.env.VITE_API_BASE || '';
const APP_NAME = '1Resource';
const APP_SUBTITLE = 'by Truflux Technologies';
const APP_VERSION = 'Production 1.5';
const APP_FOOTER = '1Resource by Truflux Technologies | Version Production 1.5.5.4.3.2 | © 2026 Truflux Technologies. All rights reserved. | Internal Use Only';

const emptyCandidate = {
  full_name: '', email: '', phone: '', location: '', current_status: 'Available', availability_date: 'Immediate', available_by_date: '', notice_period_days: 0,
  employment_type: 'Contract', source: '', recruiter_owner: '', total_experience: 0, relevant_experience: 0,
  primary_skill: '', secondary_skills: '', domain_exposure: '', proficiency: 'Intermediate', certifications: '',
  portfolio_url: '', expected_rate: 0, negotiated_rate: 0, internal_level: 'L2 - Mid-level', resume_text: '', status: 'New'
};

const emptyAssessment = {
  technical_score: 0, project_score: 0, practical_score: 0, communication_score: 0,
  client_readiness_score: 0, cost_fitment_score: 0, availability_score: 0, evaluator_name: '', recommendation: 'Hold', remarks: ''
};

const emptyDemand = {
  client_name: '', project_name: '', role_title: '', role_definition: '', required_skills: '', domain: '', location: '',
  work_mode: 'Hybrid', priority: 'Medium', status: 'Open', number_of_positions: 1, target_customer_rate: 0,
  max_internal_cost: 0, start_date: 'Immediate', duration_weeks: 12
};

function authHeaders(token) { return token ? { Authorization: `Bearer ${token}` } : {}; }

async function api(path, options = {}, token) {
  const isForm = options.body instanceof FormData;
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...(isForm ? {} : { 'Content-Type': 'application/json' }), ...authHeaders(token), ...(options.headers || {}) }
  });
  if (!res.ok) {
    let detail = `Request failed: ${res.status}`;
    try { const data = await res.json(); detail = data.detail || detail; } catch (_) {}
    throw new Error(detail);
  }
  const type = res.headers.get('content-type') || '';
  if (type.includes('application/json')) return res.json();
  return res;
}

function money(value) { return `₹${Number(value || 0).toLocaleString('en-IN')}`; }
function Input({ label, value, onChange, type = 'text', placeholder = '' }) { return <label>{label}<input type={type} value={value ?? ''} placeholder={placeholder} onChange={e => onChange(e.target.value)} /></label>; }
function TextArea({ label, value, onChange, rows = 4, placeholder = '' }) { return <label>{label}<textarea rows={rows} value={value ?? ''} placeholder={placeholder} onChange={e => onChange(e.target.value)} /></label>; }
function Select({ label, value, onChange, options }) { return <label>{label}<select value={value ?? ''} onChange={e => onChange(e.target.value)}>{options.map(o => <option key={o} value={o}>{o}</option>)}</select></label>; }
function StatCard({ label, value, helper }) { return <div className="statCard"><span>{label}</span><strong>{value}</strong><small>{helper}</small></div>; }
function Info({ label, value }) { return <div className="info"><span>{label}</span><strong>{value || '-'}</strong></div>; }
function Score({ label, value, max, onChange }) { return <label className="scoreField">{label}<input type="number" min="0" max={max} value={value} onChange={e => onChange(Number(e.target.value || 0))} /></label>; }

function fakeRiskRag(score) {
  const value = Number(score || 0);
  if (value >= 75) return { rag: 'Red', label: 'Red - High Fake Risk', helper: 'Manual validation required' };
  if (value >= 45) return { rag: 'Amber', label: 'Amber - Needs Review', helper: 'Review before shortlisting' };
  return { rag: 'Green', label: 'Green - Low Signal', helper: 'Normal screening' };
}

function FakeRiskRag({ score, compact = false }) {
  const item = fakeRiskRag(score);
  return <span className={`ragBadge rag${item.rag}`} title={item.helper}>
    <b>{item.rag}</b>{!compact && <small>{item.label}</small>}
  </span>;
}



function BrandLockup({ small = false, tagline = 'Talent Supply & Demand Portal' }) {
  return <div className={`brandLockup ${small ? 'small' : ''}`}>
    <img src={brandLogo} alt="Truflux Technologies logo" className="brandLogoImage" />
    <div>
      <strong>{APP_NAME}</strong>
      <small>{APP_SUBTITLE}</small>
      <span>{tagline}</span>
    </div>
  </div>;
}

function FooterNote({ centered = false }) {
  return <footer className={`appFooter ${centered ? 'centered' : ''}`}>{APP_FOOTER}</footer>;
}

function PublicUpload() {
  const token = window.location.pathname.split('/public-upload/')[1]?.split('/')[0] || '';
  const [info, setInfo] = useState(null);
  const [form, setForm] = useState({ role_title: '', role_definition: '', full_name: '', email: '', phone: '', location: '', current_company: '', previous_companies: '', project_details: '', available_by_date: '', notice_period_days: 0 });
  const [file, setFile] = useState(null);
  const [photograph, setPhotograph] = useState(null);
  const [status, setStatus] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');
  const [mcqAnswers, setMcqAnswers] = useState({});
  const [mcqComplete, setMcqComplete] = useState(false);
  const [mcqResult, setMcqResult] = useState(null);
  const [mcqScoring, setMcqScoring] = useState(false);

  useEffect(() => {
    api(`/api/public-upload/${token}`).then(data => {
      setInfo(data);
      setForm(prev => ({ ...prev, role_title: data.role_title || '', role_definition: data.role_definition || '' }));
    }).catch(err => setError(err.message));
  }, [token]);

  async function submit(e) {
    e.preventDefault();
    if (!file) { setError('Please select a resume file.'); return; }
    if (!updateOnly && !photograph) { setError('Please upload a recent photograph.'); return; }
    setStatus('Uploading photograph, resume and analyzing profile...'); setError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v || ''));
      fd.append('mcq_answers', JSON.stringify({ answers: mcqAnswers }));
      if (photograph) fd.append('photograph', photograph);
      fd.append('file', file);
      const data = await api(`/api/public-upload/${token}`, { method: 'POST', body: fd });
      setAnalysis(data.analysis);
      setStatus(data.mode === 'updated_resume_only' ? 'Updated resume uploaded successfully. The same candidate record has been updated.' : `Resume uploaded successfully. Candidate record has been created for 1Resource review.${data.mcq_result ? ` MCQ score: ${data.mcq_result.score}/${data.mcq_result.max_score}.` : ''}`);
      const next = await api(`/api/public-upload/${token}`);
      setInfo(next);
    } catch (err) { setError(err.message); setStatus(''); }
  }

  const updateOnly = info?.mode === 'update_resume_only';
  const mcqRequired = Boolean(info?.mcq_required && !updateOnly);
  const mcqQuestions = info?.mcq_questions || [];
  async function completeMcq() {
    const missing = mcqQuestions.filter(q => !mcqAnswers[String(q.id)]);
    if (missing.length) { setError(`Please answer all ${mcqQuestions.length} MCQ questions before uploading your resume.`); return; }
    setError('');
    setMcqScoring(true);
    try {
      const result = await api(`/api/public-upload/${token}/mcq-score`, { method: 'POST', body: JSON.stringify({ answers: mcqAnswers }) });
      setMcqResult(result);
      setMcqComplete(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setMcqScoring(false);
    }
  }
  return <div className="publicShell"><div className="publicCard">
    <BrandLockup tagline="Secure Candidate Resume Upload" />
    {error && <div className="error">{error}</div>}
    {info && <>
      <h1>{updateOnly ? 'Upload updated resume' : 'Upload your resume'}</h1>
      <p>This secure upload link is valid until <strong>{new Date(info.expires_at).toLocaleString()}</strong>.</p>
      <div className={updateOnly ? 'warningBox' : 'successBox'}>{info.message}</div>
      {info.demand && <div className="miniProfile"><strong>Linked demand: {info.demand.demand_code} · {info.demand.role_title}</strong><span>{info.demand.client_name || 'Client'} · {info.demand.project_name || 'Project'} · Start {info.demand.start_date || 'TBD'}</span></div>}
      {updateOnly && info.candidate && <div className="miniProfile"><strong>{info.candidate.full_name}</strong><span>{info.candidate.candidate_code} · {info.candidate.email}</span></div>}
      {mcqRequired && !mcqComplete && !analysis && <MCQGate questions={mcqQuestions} answers={mcqAnswers} setAnswers={setMcqAnswers} onComplete={completeMcq} loading={mcqScoring} />}
      {mcqRequired && mcqComplete && !analysis && mcqResult && <div className="scoreSummary">
        <h3>Skill check completed</h3>
        <div className="statsGrid">
          <StatCard label="Final Score" value={`${mcqResult.score}/${mcqResult.max_score}`} helper={`${mcqResult.percentage}% with negative scoring`} />
          <StatCard label="Correct" value={mcqResult.correct_count} helper="+1 each" />
          <StatCard label="Wrong" value={mcqResult.wrong_count} helper={`-${mcqResult.negative_per_wrong} each`} />
          <StatCard label="Status" value={mcqResult.passed ? 'Cleared' : 'Needs Review'} helper="Stored for recruiter review" />
        </div>
        <p>{mcqResult.scoring_rule}</p>
        <strong>You can now upload your resume below.</strong>
      </div>}
      {!analysis && (!mcqRequired || mcqComplete) && <form className="candidateForm" onSubmit={submit}>
        {!updateOnly && <div className="formGrid two">
          <Input label="Full name" value={form.full_name} onChange={v => setForm({ ...form, full_name: v })} />
          <Input label="Email" value={form.email} onChange={v => setForm({ ...form, email: v })} />
          <Input label="Phone" value={form.phone} onChange={v => setForm({ ...form, phone: v })} />
          <Input label="Location" value={form.location} onChange={v => setForm({ ...form, location: v })} />
          <Input label="Current / last company" value={form.current_company} onChange={v => setForm({ ...form, current_company: v })} />
          <Input label="Previous companies" value={form.previous_companies} onChange={v => setForm({ ...form, previous_companies: v })} />
          <Input label="Available by date" type="date" value={form.available_by_date} onChange={v => setForm({ ...form, available_by_date: v })} />
          <Input label="Notice period days" type="number" value={form.notice_period_days} onChange={v => setForm({ ...form, notice_period_days: Number(v) })} />
        </div>}
        {!updateOnly && <>
          <Input label="Role title" value={form.role_title} onChange={v => setForm({ ...form, role_title: v })} />
          <TextArea label="Role description" rows={5} value={form.role_definition} onChange={v => setForm({ ...form, role_definition: v })} placeholder="Paste the role description shared by the recruiter." />
          <TextArea label="Company / project details" rows={4} value={form.project_details} onChange={v => setForm({ ...form, project_details: v })} placeholder="Mention company, project, client, role and assignment details." />
        </>}
        {!updateOnly && <label>Recent photograph<input type="file" accept=".jpg,.jpeg,.png,.webp" onChange={e => setPhotograph(e.target.files[0])} /><small>Required for first-time public upload. Allowed: JPG, PNG, WEBP.</small></label>}
        <label>Resume file<input type="file" accept=".pdf,.docx,.txt,.md" onChange={e => setFile(e.target.files[0])} /></label>
        <button className="primary">{updateOnly ? 'Upload updated resume' : 'Upload resume'}</button>
      </form>}
    </>}
    {status && <div className="successBox">{status}</div>}
    {analysis && <AnalysisSummary analysis={analysis} />}
    <FooterNote centered />
  </div></div>;
}


function MCQGate({ questions, answers, setAnswers, onComplete, loading }) {
  const [step, setStep] = useState(0);
  const current = questions[step];
  const selected = current ? answers[String(current.id)] : '';
  const isLast = step === questions.length - 1;

  function choose(optionKey) {
    if (!current) return;
    setAnswers({ ...answers, [String(current.id)]: optionKey });
  }

  function forward() {
    if (!selected) return;
    if (isLast) {
      onComplete();
    } else {
      setStep(step + 1);
    }
  }

  if (!questions.length) {
    return <div className="panel compact mcqPanel"><p className="muted">No skill-check questions are available for this demand.</p></div>;
  }

  return <div className="panel compact mcqPanel wizard">
    <div className="sectionHeader small">
      <div>
        <h3>Demand Skill Check</h3>
        <p>Answer one question at a time. You can only move forward. Scoring uses negative marking: +1 for correct and -0.25 for wrong.</p>
      </div>
      <mark className="warning">Required before resume upload</mark>
    </div>
    <div className="wizardProgress">
      <span>Question {step + 1} of {questions.length}</span>
      <div><b style={{ width: `${((step + 1) / questions.length) * 100}%` }} /></div>
    </div>
    <div className="mcqQuestionCard">
      <small>{current.skill}</small>
      <h2>{current.question_text}</h2>
      <div className="mcqOptions wizardOptions">
        {current.options.map(opt => <button
          type="button"
          key={opt.key}
          className={selected === opt.key ? 'mcqChoice selected' : 'mcqChoice'}
          onClick={() => choose(opt.key)}
        >
          <strong>{opt.key}</strong>
          <span>{opt.text}</span>
        </button>)}
      </div>
    </div>
    <div className="wizardActions">
      <span>{selected ? 'Answer locked for this step when you move forward.' : 'Select one option to continue.'}</span>
      <button className="primary" disabled={!selected || loading} onClick={forward}>{loading ? 'Scoring...' : isLast ? 'Submit and view score' : 'Next question →'}</button>
    </div>
  </div>;
}


function Login({ onLogin }) {
  const [username, setUsername] = useState('Admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  async function submit(e) {
    e.preventDefault(); setLoading(true); setError('');
    try { onLogin(await api('/api/login', { method: 'POST', body: JSON.stringify({ username, password }) })); }
    catch (err) { setError(err.message); } finally { setLoading(false); }
  }
  return <div className="loginShell"><div className="loginCard">
    <BrandLockup tagline="Supply, demand, resume intelligence and shortlist management" />
    <h1>{APP_NAME}</h1>
    <p>{APP_SUBTITLE} · Talent supply, demand, resume intelligence and shortlist management in one controlled resource platform.</p>
    <form onSubmit={submit}>
      <label>Username</label><input value={username} onChange={e => setUsername(e.target.value)} />
      <label>Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} />
      {error && <div className="error">{error}</div>}
      <button className="primary" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
    </form><small>Default: Admin / admin123 · Version {APP_VERSION}</small>
    <FooterNote centered />
  </div></div>;
}

function Dashboard({ dashboard, onExport }) {
  return <section className="pageBlock">
    <div className="sectionHeader"><div><h2>Dashboard</h2><p>Resource supply, client demand, bench readiness, resume fit and fake-resume risk.</p></div><div className="actions"><button onClick={onExport}>Export CSV</button></div></div>
    <div className="statsGrid">
      <StatCard label="Candidates" value={dashboard.total_candidates ?? 0} helper="Profiles in repository" />
      <StatCard label="Ready Supply" value={dashboard.ready_candidates ?? 0} helper="A1 and A2 candidates" />
      <StatCard label="Available Bench" value={dashboard.available_bench ?? 0} helper="Available, bench or freelance" />
      <StatCard label="Open Demand" value={dashboard.open_demand ?? 0} helper={`${dashboard.total_demand ?? 0} total requests`} />
      <StatCard label="Shortlisted" value={dashboard.shortlisted ?? 0} helper="Demand-candidate mappings" />
      <StatCard label="ML Resume Avg" value={dashboard.average_ml_rating ?? 0} helper="Role-fit rating" />
      <StatCard label="Fake Risk Avg" value={dashboard.average_fake_risk ?? 0} helper="Lower is better" />
      <StatCard label="Manual Avg" value={dashboard.average_score ?? 0} helper="Screening assessment" />
    </div>
    <div className="twoCol">
      <div className="panel"><h3>Supply Skill Mix</h3>{(dashboard.skills || []).map(row => <div className="barRow" key={row.skill}><span>{row.skill || 'Unspecified'}</span><div><b style={{ width: `${Math.min(100, row.count * 14)}%` }} /></div><em>{row.count}</em></div>)}{(dashboard.skills || []).length === 0 && <p className="muted">No skills yet.</p>}</div>
      <div className="panel"><h3>Demand Skill Mix</h3>{(dashboard.demand_skills || []).map(row => <div className="barRow" key={row.skill}><span>{row.skill}</span><div><b style={{ width: `${Math.min(100, row.count * 18)}%` }} /></div><em>{row.count}</em></div>)}{(dashboard.demand_skills || []).length === 0 && <p className="muted">No demand created yet.</p>}</div>
    </div>
    <div className="twoCol">
      <div className="panel"><h3>Recent Candidates</h3>{(dashboard.recent_candidates || []).map(c => <div className="recentItem" key={c.id}><div><strong>{c.full_name}</strong><span>{c.candidate_code} · {c.primary_skill}</span><small>ML {c.ml_rating_score || 0}/100 · {c.fake_risk_level || 'No risk score'}</small></div><mark>{c.status}</mark></div>)}{(dashboard.recent_candidates || []).length === 0 && <p className="muted">No candidates yet.</p>}</div>
      <div className="panel"><h3>Recent Demand</h3>{(dashboard.recent_demand || []).map(d => <div className="recentItem" key={d.id}><div><strong>{d.role_title}</strong><span>{d.client_name || 'Client'} · {d.project_name}</span><small>{d.demand_code}</small></div><mark>{d.priority} · {d.status}</mark></div>)}{(dashboard.recent_demand || []).length === 0 && <p className="muted">No demand requests yet.</p>}</div>
    </div>
  </section>;
}

function Candidates({ candidates, filters, setFilters, onCreate, onSelect, onDownloadStandard }) {
  return <section className="pageBlock">
    <div className="sectionHeader"><div><h2>Resume Bank</h2><p>Supply-side candidate repository with role-wise resume versions and ML screening.</p></div><button className="primary" onClick={onCreate}>Add candidate</button></div>
    <div className="filters"><input placeholder="Search candidate, code, domain..." value={filters.q} onChange={e => setFilters({ ...filters, q: e.target.value })} /><input placeholder="Skill filter" value={filters.skill} onChange={e => setFilters({ ...filters, skill: e.target.value })} /><select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}><option value="">All status</option><option>A1 - Ready to Deploy</option><option>A2 - Deployable in 15 Days</option><option>B - Keep Warm</option><option>Screening</option><option>New</option><option>Rejected / Archive</option></select><select value={filters.availability} onChange={e => setFilters({ ...filters, availability: e.target.value })}><option value="">All availability</option><option>Available</option><option>Bench</option><option>Notice Period</option><option>Employed</option><option>Freelance</option><option>Not Available</option><option>Screening</option></select></div>
    <div className="tableWrap"><table><thead><tr><th>Code</th><th>Name</th><th>Skill</th><th>Experience</th><th>Availability</th><th>Available By</th><th>Notice</th><th>Status</th><th>ML Rating</th><th>Fake Risk</th><th>Photo</th><th>Rate</th><th>Standard Resume</th></tr></thead><tbody>{candidates.map(c => <tr key={c.id} onClick={() => onSelect(c.id)}><td>{c.candidate_code}</td><td><strong>{c.full_name}</strong><br /><small>{c.email}</small></td><td>{c.primary_skill}<br /><small>{c.secondary_skills}</small></td><td>{c.total_experience} yrs</td><td>{c.current_status}<br /><small>{c.availability_date}</small></td><td>{c.available_by_date || '-'}</td><td>{c.notice_period_days || 0} days</td><td><span className="pill">{c.status}</span></td><td><strong>{c.ml_rating_score || 0}/100</strong><br /><small>{c.ml_rating_level || 'Not rated'}</small></td><td><strong>{c.fake_risk_score || 0}/100</strong><br /><FakeRiskRag score={c.fake_risk_score} /><br /><small>{c.fake_risk_level || 'Not checked'}</small></td><td>{c.photo_file_name ? <span className="pill">Available</span> : <small>-</small>}</td><td>{money(c.negotiated_rate || c.expected_rate)}</td><td><button type="button" className="linkButton asButton" onClick={e => { e.stopPropagation(); onDownloadStandard(c.id, c.candidate_code); }}>Create Resume</button></td></tr>)}</tbody></table>{candidates.length === 0 && <p className="empty">No candidate matches the current filters.</p>}</div>
  </section>;
}

function CandidateForm({ initial, onCancel, onSave }) {
  const [form, setForm] = useState(initial || emptyCandidate);
  return <form className="candidateForm" onSubmit={e => { e.preventDefault(); onSave(form); }}>
    <div className="formGrid"><Input label="Full name" value={form.full_name} onChange={v => setForm({ ...form, full_name: v })} /><Input label="Email" value={form.email} onChange={v => setForm({ ...form, email: v })} /><Input label="Phone" value={form.phone} onChange={v => setForm({ ...form, phone: v })} /><Input label="Location" value={form.location} onChange={v => setForm({ ...form, location: v })} /><Select label="Current status" value={form.current_status} onChange={v => setForm({ ...form, current_status: v })} options={['Available','Bench','Notice Period','Employed','Freelance','Not Available','Screening']} /><Input label="Availability note" value={form.availability_date} onChange={v => setForm({ ...form, availability_date: v })} /><Input label="Available by date" type="date" value={form.available_by_date} onChange={v => setForm({ ...form, available_by_date: v })} /><Input label="Notice period days" type="number" value={form.notice_period_days} onChange={v => setForm({ ...form, notice_period_days: Number(v) })} /><Input label="Primary skill" value={form.primary_skill} onChange={v => setForm({ ...form, primary_skill: v })} /><Input label="Secondary skills" value={form.secondary_skills} onChange={v => setForm({ ...form, secondary_skills: v })} /><Input label="Domain exposure" value={form.domain_exposure} onChange={v => setForm({ ...form, domain_exposure: v })} /><Input label="Current / last company" value={form.current_company || ''} onChange={v => setForm({ ...form, current_company: v })} /><Input label="Previous companies" value={form.previous_companies || ''} onChange={v => setForm({ ...form, previous_companies: v })} /><Input label="Total exp" type="number" value={form.total_experience} onChange={v => setForm({ ...form, total_experience: Number(v) })} /><Input label="Relevant exp" type="number" value={form.relevant_experience} onChange={v => setForm({ ...form, relevant_experience: Number(v) })} /><Input label="Negotiated rate" type="number" value={form.negotiated_rate} onChange={v => setForm({ ...form, negotiated_rate: Number(v) })} /></div>
    <TextArea label="Company / project details" value={form.project_details || ''} onChange={v => setForm({ ...form, project_details: v })} rows={4} />
    <TextArea label="Resume summary" value={form.resume_text} onChange={v => setForm({ ...form, resume_text: v })} rows={6} />
    <div className="formActions"><button type="button" onClick={onCancel}>Cancel</button><button className="primary">Save candidate</button></div>
  </form>;
}

function CandidateDetail({ candidate, onClose, onEdit, onDelete, onAddAssessment, onRoleResumeUpload, onDownload, onDownloadVersion, onDownloadStandard, user }) {
  const [assessment, setAssessment] = useState(emptyAssessment);
  const [file, setFile] = useState(null);
  const [roleTitle, setRoleTitle] = useState('');
  const [roleDefinition, setRoleDefinition] = useState(candidate.last_role_definition || '');
  const total = Object.entries(assessment).filter(([k]) => k.endsWith('_score')).reduce((sum, [, v]) => sum + Number(v || 0), 0);
  return <div className="drawerBackdrop"><aside className="drawer">
    <div className="drawerHeader"><div><h2>{candidate.full_name}</h2><p>{candidate.candidate_code} · {candidate.primary_skill} · {candidate.status}</p></div><button onClick={onClose}>×</button></div>
    <div className="detailGrid"><Info label="Email" value={candidate.email} /><Info label="Phone" value={candidate.phone} /><Info label="Location" value={candidate.location} /><Info label="Availability" value={`${candidate.current_status} / ${candidate.availability_date || ''}`} /><Info label="Available by" value={candidate.available_by_date || '-'} /><Info label="Notice period" value={`${candidate.notice_period_days || 0} days`} /><Info label="Experience" value={`${candidate.total_experience} yrs total, ${candidate.relevant_experience} yrs relevant`} /><Info label="Current company" value={candidate.current_company || '-'} /><Info label="Previous companies" value={candidate.previous_companies || '-'} /><Info label="Photograph" value={candidate.photo_file_name ? 'Available' : '-'} /><Info label="Rate" value={`${money(candidate.negotiated_rate || candidate.expected_rate)}`} /></div>
    <div className="mlCards"><div><span>ML Resume Rating</span><strong>{candidate.ml_rating_score || 0}/100</strong><small>{candidate.ml_rating_level || 'Not rated'}</small></div><div><span>Fake Resume Risk</span><strong>{candidate.fake_risk_score || 0}/100</strong><small>{candidate.fake_risk_level || 'Not checked'}</small></div><div><span>Fake Risk RAG</span><strong><FakeRiskRag score={candidate.fake_risk_score} /></strong><small>{candidate.fake_risk_rag_action || fakeRiskRag(candidate.fake_risk_score).helper}</small></div><div><span>Skill Matches</span><strong>{candidate.skill_matches || '-'}</strong></div><div><span>Skill Gaps</span><strong>{candidate.skill_gaps || '-'}</strong></div></div>
    <div className="panel compact"><h3>Standardized Resume Summary</h3><p className="resumeText">{candidate.resume_text || 'No standardized resume summary added yet.'}</p>{candidate.project_details && <p className="resumeText"><strong>Company / project details:</strong><br />{candidate.project_details}</p>}{candidate.fake_risk_reasons && <p className="riskText"><strong>Risk reasons:</strong> {candidate.fake_risk_reasons}</p>}<div className="actions"><button className="linkButton asButton" onClick={() => onDownloadStandard(candidate.id, candidate.candidate_code)}>Create standardized company resume</button>{candidate.resume_file_name && <button className="linkButton asButton" onClick={() => onDownload(candidate.id, candidate.resume_file_name)}>Download latest resume: {candidate.resume_file_name}</button>}</div></div>
    {(user.role === 'Admin' || user.role === 'Recruiter') && <div className="panel compact"><h3>Upload Role-Based Resume</h3><p className="muted noPad">Each candidate can have multiple resumes for different roles. The latest upload updates the candidate record.</p><div className="formGrid two"><Input label="Role title" value={roleTitle} onChange={setRoleTitle} /><label>Resume file<input type="file" accept=".pdf,.docx,.txt,.md" onChange={e => setFile(e.target.files[0])} /></label></div><TextArea label="Role definition" rows={5} value={roleDefinition} onChange={setRoleDefinition} placeholder="Paste role description / client JD here." /><button className="primary" onClick={() => file && onRoleResumeUpload(candidate.id, file, roleTitle, roleDefinition)}>Upload, analyze and update candidate</button></div>}
    <div className="panel compact"><h3>Resume Versions</h3><div className="assessmentList">{(candidate.resumes || []).map(r => <div className="assessmentItem" key={r.id}><strong>{r.role_title || 'Resume'} · Fit {r.fit_score}/100 · Risk {r.fake_risk_score}/100</strong><span>{r.rating_level} · {r.fake_risk_level} · {new Date(r.created_at).toLocaleString()}</span><p><b>Matches:</b> {r.skill_matches || '-'}<br /><b>Gaps:</b> {r.skill_gaps || '-'}<br /><b>Risk:</b> {r.fake_risk_reasons || '-'}</p>{r.resume_file_name && <button onClick={() => onDownloadVersion(r.id, r.resume_file_name)}>Download this version</button>}</div>)}{(candidate.resumes || []).length === 0 && <p className="muted">No resume versions uploaded.</p>}</div></div>
    <div className="panel compact"><h3>Demand MCQ Results</h3><div className="assessmentList">{(candidate.mcq_results || []).map(m => <div className="assessmentItem" key={m.id}><strong>{m.demand_code || 'Demand'} · {m.role_title || 'Skill Check'} · Score {m.score}/{m.total}</strong><span>{m.correct_count || 0} correct · {m.wrong_count || 0} wrong · -{m.negative_per_wrong || 0.25} per wrong · {m.percentage || 0}% · {m.passed ? 'Cleared' : 'Needs review'}</span><p>{m.client_name || 'Client'} · {m.project_name || 'Project'} · {new Date(m.created_at).toLocaleString()}</p></div>)}{(candidate.mcq_results || []).length === 0 && <p className="muted">No demand-linked MCQ score captured yet.</p>}</div></div>
    <div className="panel compact"><div className="subHeader"><h3>Assessments</h3><strong>Total: {total}/100</strong></div>{(user.role === 'Admin' || user.role === 'Evaluator') && <div className="scoreGrid"><Score label="Technical /30" max="30" value={assessment.technical_score} onChange={v => setAssessment({ ...assessment, technical_score: v })} /><Score label="Project /15" max="15" value={assessment.project_score} onChange={v => setAssessment({ ...assessment, project_score: v })} /><Score label="Practical /20" max="20" value={assessment.practical_score} onChange={v => setAssessment({ ...assessment, practical_score: v })} /><Score label="Communication /10" max="10" value={assessment.communication_score} onChange={v => setAssessment({ ...assessment, communication_score: v })} /><Score label="Client Ready /10" max="10" value={assessment.client_readiness_score} onChange={v => setAssessment({ ...assessment, client_readiness_score: v })} /><Score label="Cost Fit /10" max="10" value={assessment.cost_fitment_score} onChange={v => setAssessment({ ...assessment, cost_fitment_score: v })} /><Score label="Availability /5" max="5" value={assessment.availability_score} onChange={v => setAssessment({ ...assessment, availability_score: v })} /><input placeholder="Evaluator" value={assessment.evaluator_name} onChange={e => setAssessment({ ...assessment, evaluator_name: e.target.value })} /><textarea placeholder="Remarks" value={assessment.remarks} onChange={e => setAssessment({ ...assessment, remarks: e.target.value })} /><button className="primary" onClick={() => onAddAssessment(candidate.id, assessment).then(() => setAssessment(emptyAssessment))}>Save assessment</button></div>}<div className="assessmentList">{(candidate.assessments || []).map(a => <div className="assessmentItem" key={a.id}><strong>{a.total_score}/100 · {a.recommendation}</strong><span>{a.evaluator_name} · {new Date(a.created_at).toLocaleString()}</span><p>{a.remarks}</p></div>)}</div></div>
    <div className="drawerActions">{(user.role === 'Admin' || user.role === 'Recruiter') && <button onClick={onEdit}>Edit</button>}{user.role === 'Admin' && <button className="danger" onClick={onDelete}>Delete</button>}</div>
  </aside></div>;
}

function DemandPage({ demand, filters, setFilters, onCreate, onSelect }) {
  return <section className="pageBlock"><div className="sectionHeader"><div><h2>Demand Requests</h2><p>Demand-side role repository used to match Truflux supply against client needs and rate-card targets.</p></div><button className="primary" onClick={onCreate}>Add demand</button></div>
    <div className="filters three"><input placeholder="Search client, project, role..." value={filters.q} onChange={e => setFilters({ ...filters, q: e.target.value })} /><input placeholder="Skill filter" value={filters.skill} onChange={e => setFilters({ ...filters, skill: e.target.value })} /><select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}><option value="">All demand status</option><option>Open</option><option>Hot</option><option>In Progress</option><option>On Hold</option><option>Closed</option><option>Cancelled</option></select></div>
    <div className="tableWrap"><table><thead><tr><th>Demand</th><th>Client / Project</th><th>Role</th><th>Skills</th><th>Positions</th><th>Rate Target</th><th>Priority</th><th>Status</th></tr></thead><tbody>{demand.map(d => <tr key={d.id} onClick={() => onSelect(d.id)}><td>{d.demand_code}</td><td><strong>{d.client_name || '-'}</strong><br /><small>{d.project_name}</small></td><td>{d.role_title}<br /><small>{d.domain}</small></td><td>{d.required_skills}</td><td>{d.number_of_positions}</td><td>{money(d.target_customer_rate)}<br /><small>Max cost {money(d.max_internal_cost)}</small></td><td><span className="pill">{d.priority}</span></td><td>{d.status}</td></tr>)}</tbody></table>{demand.length === 0 && <p className="empty">No demand requests found.</p>}</div>
  </section>;
}

function DemandForm({ initial, onCancel, onSave }) {
  const [form, setForm] = useState(initial || emptyDemand);
  const isEdit = Boolean(form?.id);
  const clientSummary = [
    ['Client Name', form.client_name || '-'],
    ['Project Name', form.project_name || '-'],
    ['Domain', form.domain || '-'],
    ['Location', form.location || '-'],
    ['Work Mode', form.work_mode || '-'],
    ['Customer Rate', money(form.target_customer_rate || 0)],
    ['Max Internal Cost', money(form.max_internal_cost || 0)],
    ['Start / Duration', `${form.start_date || '-'} / ${form.duration_weeks || 0} weeks`],
  ];

  return <form className="candidateForm" onSubmit={e => { e.preventDefault(); onSave(form); }}>
    {isEdit && <div className="readonlyPanel">
      <div className="subHeader"><div><h3>Read-only Client Details</h3><p>Client, project, location and commercial details are locked during demand edit.</p></div><mark className="neutral">Read only</mark></div>
      <div className="detailGrid">{clientSummary.map(([label, value]) => <Info key={label} label={label} value={value} />)}</div>
    </div>}

    {!isEdit ? <div className="formGrid">
      <Input label="Client name" value={form.client_name} onChange={v => setForm({ ...form, client_name: v })} />
      <Input label="Project name" value={form.project_name} onChange={v => setForm({ ...form, project_name: v })} />
      <Input label="Role title" value={form.role_title} onChange={v => setForm({ ...form, role_title: v })} />
      <Input label="Required skills" value={form.required_skills} onChange={v => setForm({ ...form, required_skills: v })} />
      <Input label="Domain" value={form.domain} onChange={v => setForm({ ...form, domain: v })} />
      <Input label="Location" value={form.location} onChange={v => setForm({ ...form, location: v })} />
      <Select label="Work mode" value={form.work_mode} onChange={v => setForm({ ...form, work_mode: v })} options={['Remote','Hybrid','Onsite']} />
      <Select label="Priority" value={form.priority} onChange={v => setForm({ ...form, priority: v })} options={['Hot','High','Medium','Low']} />
      <Select label="Status" value={form.status} onChange={v => setForm({ ...form, status: v })} options={['Open','Hot','In Progress','On Hold','Closed','Cancelled']} />
      <Input label="Positions" type="number" value={form.number_of_positions} onChange={v => setForm({ ...form, number_of_positions: Number(v) })} />
      <Input label="Customer rate" type="number" value={form.target_customer_rate} onChange={v => setForm({ ...form, target_customer_rate: Number(v) })} />
      <Input label="Max internal cost" type="number" value={form.max_internal_cost} onChange={v => setForm({ ...form, max_internal_cost: Number(v) })} />
      <Input label="Start date" value={form.start_date} onChange={v => setForm({ ...form, start_date: v })} />
      <Input label="Duration weeks" type="number" value={form.duration_weeks} onChange={v => setForm({ ...form, duration_weeks: Number(v) })} />
    </div> : <div className="formGrid">
      <Input label="Role title" value={form.role_title} onChange={v => setForm({ ...form, role_title: v })} />
      <Input label="Required skills" value={form.required_skills} onChange={v => setForm({ ...form, required_skills: v })} />
      <Select label="Priority" value={form.priority} onChange={v => setForm({ ...form, priority: v })} options={['Hot','High','Medium','Low']} />
      <Select label="Status" value={form.status} onChange={v => setForm({ ...form, status: v })} options={['Open','Hot','In Progress','On Hold','Closed','Cancelled']} />
      <Input label="Positions" type="number" value={form.number_of_positions} onChange={v => setForm({ ...form, number_of_positions: Number(v) })} />
    </div>}

    {isEdit && <div className="hintBox"><strong>Locked fields</strong><span>Client name, project, domain, location, work mode, rate, cost, start date and duration are displayed as read-only above. Only demand operating details can be edited here.</span></div>}

    <TextArea label="Role definition" value={form.role_definition} rows={7} onChange={v => setForm({ ...form, role_definition: v })} />
    <div className="formActions"><button type="button" onClick={onCancel}>Cancel</button><button className="primary">Save demand</button></div>
  </form>;
}


function DemandDetail({ demand, matches, onClose, onEdit, onDelete, onShortlist, onRefreshMatches, onGenerateMcq }) {
  return <div className="drawerBackdrop"><aside className="drawer wide">
    <div className="drawerHeader"><div><h2>{demand.role_title}</h2><p>{demand.demand_code} · {demand.client_name || 'Client'} · {demand.priority} · {demand.status}</p></div><button onClick={onClose}>×</button></div>
    <div className="readonlyPanel">
      <div className="subHeader"><div><h3>Read-only Client Details</h3><p>These client and commercial details are shown for review before editing.</p></div><mark className="neutral">Read only</mark></div>
      <div className="detailGrid"><Info label="Client Name" value={demand.client_name || '-'} /><Info label="Project" value={demand.project_name || '-'} /><Info label="Domain" value={demand.domain || '-'} /><Info label="Location / Work Mode" value={`${demand.location || '-'} / ${demand.work_mode || '-'}`} /><Info label="Customer Rate" value={money(demand.target_customer_rate || 0)} /><Info label="Max Internal Cost" value={money(demand.max_internal_cost || 0)} /><Info label="Start / Duration" value={`${demand.start_date || '-'} / ${demand.duration_weeks || 0} weeks`} /><Info label="Priority / Status" value={`${demand.priority || '-'} / ${demand.status || '-'}`} /></div>
    </div>
    <div className="detailGrid"><Info label="Required skills" value={demand.required_skills} /><Info label="Positions" value={demand.number_of_positions} /><Info label="Rate Target" value={`${money(demand.target_customer_rate)} / max cost ${money(demand.max_internal_cost)}`} /><Info label="Location" value={`${demand.location || '-'} / ${demand.work_mode}`} /><Info label="Duration" value={`${demand.duration_weeks} weeks / ${demand.start_date}`} /></div>
    <div className="panel compact"><h3>Role Definition</h3><p className="resumeText">{demand.role_definition || 'No role definition added.'}</p></div>
    <div className="panel compact"><div className="subHeader"><div><h3>Demand MCQ Skill Check</h3><p>10 on-the-fly MCQs generated from this demand. Demand-linked public upload candidates must answer these before resume upload.</p></div><button onClick={onGenerateMcq}>Regenerate 10 MCQs</button></div><div className="mcqAdminList">{(demand.mcq_questions || []).map(q => <div className="assessmentItem" key={q.id}><strong>{q.question_no}. {q.question_text}</strong><span>{q.skill} · Correct: {q.correct_option}</span><p>{q.options.map(o => `${o.key}. ${o.text}`).join(' | ')}</p></div>)}{(demand.mcq_questions || []).length === 0 && <p className="muted">No MCQs generated yet.</p>}</div></div>
    <div className="panel compact"><div className="subHeader"><h3>AI Match Recommendations</h3><button onClick={onRefreshMatches}>Refresh matches</button></div><div className="tableWrap"><table><thead><tr><th>Candidate</th><th>Skill</th><th>Match</th><th>Commercial</th><th>Availability</th><th>Gaps</th><th>Action</th></tr></thead><tbody>{matches.map(m => <tr key={m.id}><td><strong>{m.full_name}</strong><br /><small>{m.candidate_code} · {m.current_status}</small></td><td>{m.primary_skill}<br /><small>{m.secondary_skills}</small></td><td><strong>{m.match_score}/100</strong><br /><small>{m.match_level}</small></td><td>{m.commercial_fit}<br /><small>{money(m.negotiated_rate || m.expected_rate)}</small></td><td>{m.availability_fit || '-'}<br /><small>{m.available_by_date || '-'} · {m.notice_period_days || 0} days</small></td><td>{(m.skill_gaps || []).join ? m.skill_gaps.join(', ') : m.skill_gaps}</td><td><button onClick={(e) => { e.stopPropagation(); onShortlist(demand.id, m.id); }}>Shortlist</button></td></tr>)}</tbody></table></div></div>
    <div className="panel compact"><h3>Shortlisted Candidates</h3><div className="assessmentList">{(demand.shortlists || []).map(s => <div className="assessmentItem" key={s.id}><strong>{s.full_name} · {s.match_score}/100 · {s.match_level}</strong><span>{s.candidate_code} · {s.status} · {s.commercial_fit} · {s.availability_fit || 'Availability not captured'}</span><p><b>Matches:</b> {s.skill_matches || '-'}<br /><b>Gaps:</b> {s.skill_gaps || '-'}<br /><b>Screening:</b> {s.notes || '-'}</p></div>)}{(demand.shortlists || []).length === 0 && <p className="muted">No candidates shortlisted yet.</p>}</div></div>
    <div className="drawerActions"><button onClick={onEdit}>Edit</button><button className="danger" onClick={onDelete}>Delete</button></div>
  </aside></div>;
}

function SimpleBarChart({ title, data, labelKey, valueKey, helper }) {
  const max = Math.max(1, ...data.map(d => Number(d[valueKey] || 0)));
  return <div className="panel chartPanel"><h3>{title}</h3>{helper && <p>{helper}</p>}<div className="barChart">{data.length === 0 && <p className="muted">No data available.</p>}{data.map(row => <div className="chartRow" key={row[labelKey]}>
    <span>{row[labelKey]}</span><div><b style={{ width: `${Math.max(4, (Number(row[valueKey] || 0) / max) * 100)}%` }} /></div><em>{row[valueKey]}</em>
  </div>)}</div></div>;
}

function TrendChart({ title, data, series }) {
  const max = Math.max(1, ...data.flatMap(d => series.map(s => Number(d[s.key] || 0))));
  return <div className="panel chartPanel"><h3>{title}</h3><div className="trendChart">{data.length === 0 && <p className="muted">No trend data available.</p>}{data.map(row => <div className="trendMonth" key={row.period}>
    <span>{row.period}</span>
    {series.map(s => <div className="trendBar" key={s.key}><small>{s.label}</small><b style={{ height: `${Math.max(6, (Number(row[s.key] || 0) / max) * 100)}%` }} /><em>{row[s.key] || 0}</em></div>)}
  </div>)}</div></div>;
}

function MLAnalytics({ analytics, trends, marketSignals, candidates, demand, onRefresh, onRefreshTrends, onRefreshMarket, onCandidateSuitability, onRoleCandidates, onShortlist }) {
  const [candidateId, setCandidateId] = useState('');
  const [demandId, setDemandId] = useState('');
  const [candidateFit, setCandidateFit] = useState(null);
  const [roleFit, setRoleFit] = useState(null);
  const [loading, setLoading] = useState('');

  async function checkCandidate() {
    if (!candidateId) return;
    setLoading('candidate');
    try { setCandidateFit(await onCandidateSuitability(candidateId)); }
    finally { setLoading(''); }
  }

  async function checkRole() {
    if (!demandId) return;
    setLoading('role');
    try { setRoleFit(await onRoleCandidates(demandId)); }
    finally { setLoading(''); }
  }

  return <section className="pageBlock intelligenceWorkbench">
    <div className="sectionHeader"><div><h2>Supply-Demand Intelligence</h2><p>Analytics for candidate suitability, role shortlisting, demand trends, supply trends, skill gaps and market research signals.</p></div><div className="actions"><button onClick={onRefresh}>Refresh analytics</button><button onClick={onRefreshTrends}>Refresh trends</button><button onClick={onRefreshMarket}>Refresh market signals</button></div></div>
    <div className="statsGrid"><StatCard label="Profiles" value={analytics.total_profiles ?? 0} helper="Candidate records" /><StatCard label="Resumes" value={analytics.total_resumes ?? 0} helper="Role-based resumes" /><StatCard label="Open Demand" value={analytics.open_demand_requests ?? 0} helper="Demand requests" /><StatCard label="Avg Resume Fit" value={analytics.average_resume_fit ?? 0} helper="Out of 100" /><StatCard label="High Risk" value={analytics.high_risk_resumes ?? 0} helper="Manual validation needed" /></div>

    <div className="twoCol">
      <div className="panel"><h3>1. Candidate suitability for roles</h3><p>Select one candidate and check fitment across open demand records.</p>
        <div className="formGrid two"><label>Candidate<select value={candidateId} onChange={e => setCandidateId(e.target.value)}><option value="">Select candidate</option>{candidates.map(c => <option key={c.id} value={c.id}>{c.candidate_code} · {c.full_name} · {c.primary_skill || 'Skill not set'}</option>)}</select></label><label>&nbsp;<button className="primary" onClick={checkCandidate} disabled={!candidateId || loading === 'candidate'}>{loading === 'candidate' ? 'Checking...' : 'Check suitability'}</button></label></div>
        {candidateFit && <div className="tableWrap spaceTop"><table><thead><tr><th>Role</th><th>Client</th><th>Score</th><th>Match</th><th>Commercial</th><th>Gaps</th></tr></thead><tbody>{candidateFit.matches.map(m => <tr key={m.demand_id}><td><strong>{m.role_title}</strong><br /><small>{m.demand_code} · {m.priority}</small></td><td>{m.client_name || '-'}<br /><small>{m.project_name || '-'}</small></td><td><strong>{m.match_score}/100</strong></td><td>{m.match_level}</td><td>{m.commercial_fit}</td><td>{(m.skill_gaps || []).join ? m.skill_gaps.join(', ') : m.skill_gaps}</td></tr>)}</tbody></table></div>}
      </div>

      <div className="panel"><h3>2. Role-based candidate shortlist</h3><p>Select one demand record and shortlist the best candidates directly from intelligence.</p>
        <div className="formGrid two"><label>Demand role<select value={demandId} onChange={e => setDemandId(e.target.value)}><option value="">Select demand</option>{demand.map(d => <option key={d.id} value={d.id}>{d.demand_code} · {d.client_name || 'Client'} · {d.role_title}</option>)}</select></label><label>&nbsp;<button className="primary" onClick={checkRole} disabled={!demandId || loading === 'role'}>{loading === 'role' ? 'Finding...' : 'Find candidates'}</button></label></div>
        {roleFit && <div className="tableWrap spaceTop"><table><thead><tr><th>Candidate</th><th>Skill</th><th>Score</th><th>Availability</th><th>Risk</th><th>Action</th></tr></thead><tbody>{roleFit.matches.slice(0, 15).map(m => <tr key={m.candidate_id}><td><strong>{m.full_name}</strong><br /><small>{m.candidate_code}</small></td><td>{m.primary_skill}<br /><small>{m.secondary_skills}</small></td><td><strong>{m.match_score}/100</strong><br /><small>{m.match_level}</small></td><td>{m.availability_fit || '-'}<br /><small>{m.available_by_date || '-'} · {m.notice_period_days || 0} days</small></td><td>{m.fake_risk_score || 0}/100</td><td><button onClick={() => onShortlist(roleFit.demand.id, m.candidate_id)}>Shortlist</button></td></tr>)}</tbody></table></div>}
      </div>
    </div>

    <div className="twoCol">
      <TrendChart title="3. Demand trend" data={trends.combined_trend || []} series={[{ key: 'demand', label: 'Demand' }]} />
      <TrendChart title="4. Supply trend" data={trends.combined_trend || []} series={[{ key: 'supply', label: 'Supply' }]} />
    </div>

    <div className="twoCol">
      <SimpleBarChart title="6. Top demand skills" data={trends.top_demand_skills || []} labelKey="skill" valueKey="demand" helper="Demand count is based on open role records and positions." />
      <SimpleBarChart title="6. Top supply skills" data={trends.top_supply_skills || []} labelKey="skill" valueKey="supply" helper="Supply count is based on candidates in the resume bank." />
    </div>

    <div className="panel compact"><h3>Skill demand vs supply gaps</h3><div className="tableWrap"><table><thead><tr><th>Skill</th><th>Demand</th><th>Supply</th><th>Gap</th><th>Action</th></tr></thead><tbody>{(trends.skill_gaps || []).map(g => <tr key={g.skill}><td><strong>{g.skill}</strong></td><td>{g.demand}</td><td>{g.supply}</td><td><span className={g.gap > 0 ? 'riskTextInline' : 'okTextInline'}>{g.gap}</span></td><td>{g.gap > 0 ? 'Source / build bench' : 'Balanced'}</td></tr>)}</tbody></table></div></div>

    <div className="panel compact"><div className="subHeader"><div><h3>5. Internet market research signals</h3><p>{marketSignals.summary || 'Use external search signals to validate where demand is moving and where supply may be constrained.'}</p></div></div>
      <div className="assessmentList">{(marketSignals.recommendations || []).map((r, i) => <div className="insight" key={i}>{r}</div>)}</div>
      <div className="tableWrap spaceTop"><table><thead><tr><th>Skill</th><th>Internal demand</th><th>Internal supply</th><th>Gap</th><th>Internet checks</th></tr></thead><tbody>{(marketSignals.research_links || []).map(r => <tr key={r.skill}><td><strong>{r.skill}</strong></td><td>{r.internal_demand}</td><td>{r.internal_supply}</td><td>{r.internal_gap}</td><td><a className="linkButton" href={r.google_trend_search} target="_blank">Demand trend</a><br /><a className="linkButton" href={r.talent_shortage_search} target="_blank">Supply issue</a><br /><a className="linkButton" href={r.salary_trend_search} target="_blank">Salary trend</a></td></tr>)}</tbody></table></div>
      <p className="muted">{marketSignals.note}</p>
    </div>
  </section>;
}


function AnalysisSummary({ analysis }) {
  return <div className="analysisBox"><h3>Resume Intelligence Result</h3><div className="statsGrid"><StatCard label="Fit Score" value={`${analysis.fit_score}/100`} helper={analysis.rating_level} /><StatCard label="Fake Risk" value={`${analysis.fake_risk_score}/100`} helper={analysis.fake_risk_level} /><StatCard label="Experience" value={`${analysis.experience_years || 0} yrs`} helper="Detected from resume" /><StatCard label="Skills" value={(analysis.skills || []).length} helper={(analysis.skills || []).slice(0, 3).join(', ') || 'Not detected'} /></div><p><strong>Matches:</strong> {(analysis.skill_matches || []).join(', ') || '-'}</p><p><strong>Gaps:</strong> {(analysis.skill_gaps || []).join(', ') || '-'}</p><p><strong>Risk reasons:</strong> {(analysis.fake_risk_reasons || []).join(' | ')}</p></div>;
}

function PublicLinks({ links, candidates, demand, onCreateLink, onRevokeLink, onRefresh }) {
  const [form, setForm] = useState({ role_title: '', role_definition: '', candidate_id: '', demand_id: '', include_mcq: true });
  const [created, setCreated] = useState(null);
  const [copyStatus, setCopyStatus] = useState('');
  const base = window.location.origin;

  function applyDemand(id) {
    const selected = (demand || []).find(d => String(d.id) === String(id));
    setForm(prev => ({
      ...prev,
      demand_id: id,
      role_title: selected && !prev.role_title ? selected.role_title : prev.role_title,
      role_definition: selected && !prev.role_definition ? selected.role_definition : prev.role_definition,
      include_mcq: id ? prev.include_mcq : false,
    }));
  }

  async function copyUrl(url) {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const el = document.createElement('textarea');
        el.value = url;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      }
      setCopyStatus('URL copied');
      setTimeout(() => setCopyStatus(''), 2500);
    } catch (_) {
      setCopyStatus('Copy failed. Select and copy the URL manually.');
      setTimeout(() => setCopyStatus(''), 3500);
    }
  }

  async function create() {
    const payload = {
      ...form,
      candidate_id: form.candidate_id ? Number(form.candidate_id) : null,
      demand_id: form.demand_id ? Number(form.demand_id) : null,
      include_mcq: Boolean(form.demand_id && form.include_mcq),
    };
    const data = await onCreateLink(payload);
    const url = `${base}${data.upload_path}`;
    setCreated(url);
    setForm({ role_title: '', role_definition: '', candidate_id: '', demand_id: '', include_mcq: true });
  }

  return <section className="pageBlock"><div className="sectionHeader"><div><h2>Public Upload Links</h2><p>48-hour candidate resume upload links. Optionally connect a link to a demand record and decide whether MCQ screening is required.</p></div><button onClick={onRefresh}>Refresh</button></div>
    <div className="panel"><div className="formGrid two">
      <label>Demand record optional<select value={form.demand_id} onChange={e => applyDemand(e.target.value)}><option value="">No demand link</option>{(demand || []).map(d => <option key={d.id} value={d.id}>{d.demand_code} · {d.client_name || 'Client'} · {d.role_title}</option>)}</select></label>
      <label>Existing candidate optional<select value={form.candidate_id} onChange={e => setForm({ ...form, candidate_id: e.target.value })}><option value="">Create candidate on first upload</option>{candidates.map(c => <option key={c.id} value={c.id}>{c.candidate_code} · {c.full_name}</option>)}</select></label>
      <Input label="Role title" value={form.role_title} onChange={v => setForm({ ...form, role_title: v })} />
      <div className="hintBox"><strong>How demand linking works</strong><span>Selecting a demand is optional. If selected, this link inherits the demand role if the role fields are blank, scores the resume against that demand, and creates/updates a shortlist entry after upload.</span></div>
    </div>
    <label className={`checkRow ${!form.demand_id ? 'disabled' : ''}`}><input type="checkbox" checked={Boolean(form.include_mcq && form.demand_id)} disabled={!form.demand_id} onChange={e => setForm({ ...form, include_mcq: e.target.checked })} /><span><strong>Include skill-based MCQ before resume upload</strong><small>{form.demand_id ? 'Candidate must complete the demand MCQ wizard before upload when selected.' : 'Select a demand record to enable MCQ screening.'}</small></span></label>
    <TextArea label="Role definition" value={form.role_definition} onChange={v => setForm({ ...form, role_definition: v })} rows={5} />
    <button className="primary" onClick={create}>Create 48-hour public link</button>
    {created && <div className="successBox copyBox"><span>Copy link: <code>{created}</code></span><button type="button" onClick={() => copyUrl(created)}>Copy URL</button></div>}
    {copyStatus && <div className="hintBox copyStatus"><strong>{copyStatus}</strong></div>}
    </div>
    <div className="tableWrap spaceTop"><table><thead><tr><th>Role</th><th>Demand</th><th>MCQ</th><th>Expiry</th><th>Usage</th><th>Mode</th><th>Status</th><th>Link</th><th>Action</th></tr></thead><tbody>{links.map(l => { const url = `${base}${l.upload_path}`; const used = Boolean(l.used_at && l.candidate_id); const active = l.is_active && !l.is_expired && !l.revoked_at; const mcqOn = Boolean(l.include_mcq && l.demand_id); return <tr key={l.id}><td>{l.role_title || '-'}</td><td>{l.demand_label || 'Not linked'}</td><td><mark className={mcqOn ? 'ok' : 'neutral'}>{mcqOn ? 'Included' : 'Not included'}</mark></td><td>{new Date(l.expires_at).toLocaleString()}<br /><small>{l.is_expired ? 'Expired' : 'Valid until expiry'}</small></td><td>{l.use_count || 0} upload(s)<br /><small>{l.last_uploaded_at ? new Date(l.last_uploaded_at).toLocaleString() : 'Not used yet'}</small></td><td>{used ? 'Update resume only' : 'First upload creates candidate'}</td><td><mark className={active ? 'ok' : 'risk'}>{active ? 'Active' : 'Closed'}</mark><br /><small>{l.revoked_at ? `Revoked by ${l.revoked_by || '-'}` : ''}</small></td><td><code>{url}</code><br /><button type="button" className="linkButton asButton" onClick={() => copyUrl(url)}>Copy URL</button></td><td>{active ? <button className="danger" onClick={() => onRevokeLink(l.id)}>Revoke</button> : '-'}</td></tr>; })}</tbody></table></div>
  </section>;
}



function CompanyProfile({ profile, onSave, onUploadLogo }) {
  const [form, setForm] = useState(profile || {});
  const [logo, setLogo] = useState(null);
  const [saving, setSaving] = useState(false);
  const [localStatus, setLocalStatus] = useState('');

  useEffect(() => { setForm(profile || {}); }, [profile]);

  async function save(e) {
    if (e?.preventDefault) e.preventDefault();
    setSaving(true);
    setLocalStatus('');
    try {
      const saved = await onSave({
        company_name: form.company_name || 'Truflux Technologies',
        company_number: form.company_number || '',
        tax_number: form.tax_number || '',
        address: form.address || '',
        phone: form.phone || '',
        email: form.email || '',
        website: form.website || '',
      });
      setForm(saved || {});
      setLocalStatus(`Saved at ${new Date().toLocaleTimeString()}`);
    } catch (err) {
      setLocalStatus(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  async function uploadLogo() {
    if (!logo) return;
    setSaving(true);
    setLocalStatus('');
    try {
      const saved = await onUploadLogo(logo);
      setForm(saved || {});
      setLogo(null);
      setLocalStatus(`Logo uploaded at ${new Date().toLocaleTimeString()}`);
    } catch (err) {
      setLocalStatus(`Logo upload failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  return <section className="pageBlock">
    <div className="sectionHeader">
      <div><h2>Company Profile</h2><p>These details and the logo are used in the formatted PDF resume generated from Resume Bank.</p></div>
      <button type="button" onClick={() => setForm(profile || {})}>Reload</button>
    </div>
    <form className="panel" onSubmit={save}>
      <div className="formGrid two">
        <Input label="Company name" value={form.company_name || ''} onChange={v => setForm({ ...form, company_name: v })} />
        <Input label="Company number / CIN" value={form.company_number || ''} onChange={v => setForm({ ...form, company_number: v })} />
        <Input label="Tax / GST number" value={form.tax_number || ''} onChange={v => setForm({ ...form, tax_number: v })} />
        <Input label="Company phone" value={form.phone || ''} onChange={v => setForm({ ...form, phone: v })} />
        <Input label="Company email" value={form.email || ''} onChange={v => setForm({ ...form, email: v })} />
        <Input label="Website" value={form.website || ''} onChange={v => setForm({ ...form, website: v })} />
      </div>
      <TextArea label="Registered / corporate address" value={form.address || ''} rows={3} onChange={v => setForm({ ...form, address: v })} />
      <div className="actions"><button type="submit" className="primary" disabled={saving}>{saving ? 'Saving...' : 'Save company profile'}</button>{form.updated_at && <small>Last saved: {new Date(form.updated_at).toLocaleString()}</small>}</div>
      {localStatus && <div className={localStatus.startsWith('Save failed') || localStatus.startsWith('Logo upload failed') ? 'error' : 'successBox'}>{localStatus}</div>}
      <div className="companyLogoUpload">
        <label>Company logo<input type="file" accept=".jpg,.jpeg,.png,.webp" onChange={e => setLogo(e.target.files[0])} /></label>
        <button type="button" onClick={uploadLogo} disabled={!logo || saving}>{saving ? 'Please wait...' : 'Upload logo'}</button>
        <small>{form.logo_file_name ? `Current logo: ${form.logo_file_name}` : 'No logo uploaded yet'}</small>
      </div>
    </form>
  </section>;
}


function Users({ users, onCreateUser, onUpdateUser, onToggleUser, onUnlockUser, onResetPassword, onCreateDemo }) {
  const emptyUser = { username: '', full_name: '', email: '', phone: '', role: 'Recruiter', password: 'Welcome1234' };
  const [form, setForm] = useState(emptyUser);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ username: '', full_name: '', email: '', phone: '', role: 'Recruiter' });
  const [resetTarget, setResetTarget] = useState(null);
  const [resetForm, setResetForm] = useState({ new_password: 'Welcome1234', force_change: true });
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function create(e) {
    e?.preventDefault?.();
    setBusy(true);
    setMessage('');
    try {
      await onCreateUser(form);
      setForm(emptyUser);
      setMessage('User created successfully.');
    } catch (err) {
      setMessage(`Create user failed: ${err.message}`);
    } finally {
      setBusy(false);
    }
  }

  function startEdit(u) {
    setEditingUser(u);
    setEditForm({
      username: u.username || '',
      full_name: u.full_name || '',
      email: u.email || '',
      phone: u.phone || '',
      role: u.role || 'Recruiter',
    });
    setMessage('');
  }

  async function saveEdit(e) {
    e?.preventDefault?.();
    if (!editingUser) return;
    setBusy(true);
    setMessage('');
    try {
      await onUpdateUser(editingUser.id, editForm);
      setEditingUser(null);
      setMessage('User details updated successfully.');
    } catch (err) {
      setMessage(`Update user failed: ${err.message}`);
    } finally {
      setBusy(false);
    }
  }

  async function submitReset() {
    if (!resetTarget) return;
    setBusy(true);
    setMessage('');
    try {
      await onResetPassword(resetTarget.id, resetForm);
      setResetTarget(null);
      setResetForm({ new_password: 'Welcome1234', force_change: true });
      setMessage('Password reset successfully.');
    } catch (err) {
      setMessage(`Password reset failed: ${err.message}`);
    } finally {
      setBusy(false);
    }
  }

  const isError = message.includes('failed');

  return <section className="pageBlock">
    <div className="sectionHeader">
      <div><h2>User Management</h2><p>Create users, edit login profile contact details, activate/deactivate access, unlock accounts, and reset passwords.</p></div>
      <div className="actions"><button onClick={onCreateDemo}>Create 50 test data</button></div>
    </div>

    {message && <div className={isError ? 'error' : 'successBox'}>{message}</div>}

    <form className="userCreate" onSubmit={create}>
      <input placeholder="Username" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
      <input placeholder="Full name" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} />
      <input placeholder="Login profile email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
      <input placeholder="Login profile phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
      <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}><option>Admin</option><option>Recruiter</option><option>Evaluator</option><option>Viewer</option></select>
      <input placeholder="Temporary password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
      <button className="primary" disabled={busy}>{busy ? 'Please wait...' : 'Create user'}</button>
    </form>

    {editingUser && <form className="panel compact resetPanel" onSubmit={saveEdit}>
      <div className="sectionHeader small"><div><h3>Edit user: {editingUser.username}</h3><p>Update user details and the authorized contact used in generated resume PDFs.</p></div><button type="button" onClick={() => setEditingUser(null)}>Cancel</button></div>
      <div className="formGrid two">
        <Input label="Username" value={editForm.username} onChange={v => setEditForm({ ...editForm, username: v })} />
        <Input label="Full name" value={editForm.full_name} onChange={v => setEditForm({ ...editForm, full_name: v })} />
        <Input label="Authorized email" value={editForm.email} onChange={v => setEditForm({ ...editForm, email: v })} />
        <Input label="Authorized phone" value={editForm.phone} onChange={v => setEditForm({ ...editForm, phone: v })} />
        <label>Role<select value={editForm.role} onChange={e => setEditForm({ ...editForm, role: e.target.value })}><option>Admin</option><option>Recruiter</option><option>Evaluator</option><option>Viewer</option></select></label>
      </div>
      <button className="primary" disabled={busy}>{busy ? 'Saving...' : 'Save user details'}</button>
    </form>}

    {resetTarget && <div className="panel compact resetPanel"><div className="sectionHeader small"><div><h3>Reset password for {resetTarget.username}</h3><p>The user will be logged out from active sessions after reset.</p></div><button onClick={() => setResetTarget(null)}>Cancel</button></div><div className="formGrid two"><Input label="New temporary password" type="password" value={resetForm.new_password} onChange={v => setResetForm({ ...resetForm, new_password: v })} /><label className="checkLine"><input type="checkbox" checked={resetForm.force_change} onChange={e => setResetForm({ ...resetForm, force_change: e.target.checked })} /> Force password change at next login</label></div><button className="primary" disabled={busy} onClick={submitReset}>{busy ? 'Please wait...' : 'Reset password'}</button></div>}

    <div className="hintBox"><strong>Default recruiter profile</strong><span>Username: Recruiter | Password: recruiter123 | Authorized contact can be edited from this screen or by that user from Profile.</span></div>

    <div className="tableWrap"><table><thead><tr><th>User</th><th>Name</th><th>Login Contact</th><th>Role</th><th>Status</th><th>Security</th><th>Action</th></tr></thead><tbody>{users.map(u => <tr key={u.id}><td>{u.username}</td><td>{u.full_name}</td><td>{u.email || '-'}<br /><small>{u.phone || '-'}</small></td><td>{u.role}</td><td>{u.is_active ? 'Active' : 'Inactive'}<br /><small>{u.last_login_at ? `Last login ${new Date(u.last_login_at).toLocaleString()}` : 'No login yet'}</small></td><td>{u.locked_until ? <mark className="risk">Locked</mark> : <mark className="ok">Clear</mark>} {u.force_password_change ? <mark className="warning">Reset Required</mark> : null}<br /><small>{u.failed_attempts || 0} failed attempt(s)</small></td><td><button onClick={() => startEdit(u)}>Edit</button><button onClick={() => onToggleUser(u.id, u.is_active ? 0 : 1)}>{u.is_active ? 'Deactivate' : 'Activate'}</button><button onClick={() => { setResetTarget(u); setResetForm({ new_password: 'Welcome1234', force_change: true }); }}>Reset Password</button>{u.locked_until && <button onClick={() => onUnlockUser(u.id)}>Unlock</button>}</td></tr>)}</tbody></table></div>
  </section>;
}


function ChangePassword({ onChangePassword }) {
  const [form, setForm] = useState({ current_password: '', new_password: '' });
  return <div className="panel compact"><h3>Change My Password</h3><div className="formGrid two"><Input label="Current password" type="password" value={form.current_password} onChange={v => setForm({ ...form, current_password: v })} /><Input label="New password" type="password" value={form.new_password} onChange={v => setForm({ ...form, new_password: v })} /></div><button className="primary" onClick={() => onChangePassword(form).then(() => setForm({ current_password: '', new_password: '' }))}>Change password</button></div>;
}


function MyProfile({ user, onSave }) {
  const [form, setForm] = useState({ full_name: user?.full_name || '', email: user?.email || '', phone: user?.phone || '' });
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    setForm({ full_name: user?.full_name || '', email: user?.email || '', phone: user?.phone || '' });
  }, [user?.full_name, user?.email, user?.phone]);

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setStatus('');
    try {
      await onSave(form);
      setStatus('Login profile saved. Resume PDFs will use this email and phone as the authorized contact.');
    } catch (err) {
      setStatus(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  return <section className="pageBlock">
    <div className="sectionHeader"><div><h2>My Login Profile</h2><p>This email ID and phone number will appear as the authorized contact in generated resume PDFs. Candidate contact details remain hidden.</p></div></div>
    <form className="panel" onSubmit={save}>
      <div className="formGrid two">
        <Input label="Full name" value={form.full_name} onChange={v => setForm({ ...form, full_name: v })} />
        <Input label="Authorized email ID for resume PDF" value={form.email} onChange={v => setForm({ ...form, email: v })} />
        <Input label="Authorized phone number for resume PDF" value={form.phone} onChange={v => setForm({ ...form, phone: v })} />
      </div>
      <div className="actions"><button className="primary" disabled={saving}>{saving ? 'Saving...' : 'Save login profile'}</button></div>
      {status && <div className={status.startsWith('Save failed') ? 'error' : 'successBox'}>{status}</div>}
    </form>
  </section>;
}

function SecurityPanel({ security, onRefresh, onChangePassword }) {
  const controls = security.security_controls || [];
  return <section className="pageBlock"><div className="sectionHeader"><div><h2>Security Centre</h2><p>Security posture, session controls, upload controls, and loose-end checks.</p></div><button onClick={onRefresh}>Refresh</button></div>
    <div className="statsGrid"><StatCard label="Version" value={security.version || '-'} helper="Security build" /><StatCard label="Session TTL" value={`${security.session_ttl_hours || 0} hrs`} helper="Auto-expiry" /><StatCard label="Max Upload" value={`${security.max_upload_mb || 0} MB`} helper={(security.allowed_upload_extensions || []).join(', ')} /><StatCard label="Active Sessions" value={security.active_sessions || 0} helper="Current auth sessions" /><StatCard label="Locked Users" value={security.locked_users || 0} helper="Failed login lockouts" /><StatCard label="Active Public Links" value={security.active_public_links || 0} helper="Not expired / not revoked" /><StatCard label="High-risk Candidates" value={security.high_risk_candidates || 0} helper="Fake resume risk >= 75" /></div>
    <div className="twoCol"><div className="panel"><h3>Enabled Controls</h3>{controls.map(c => <div className="recentItem" key={c}><div><strong>{c}</strong><span>Enabled</span></div><mark className="ok">ON</mark></div>)}</div><div className="panel"><h3>Allowed Origins</h3>{(security.allowed_origins || []).map(o => <p className="insight" key={o}>{o}</p>)}</div></div>
    <ChangePassword onChangePassword={onChangePassword} />
  </section>;
}


function CustomerOutreach({ clients, appUsers, logs, onRefresh, onSaveClient, onDeleteClient, onSend }) {
  const emptyClient = { company_name: '', contact_name: '', email: '', phone: '', segment: '', status: 'Prospect', notes: '' };
  const templates = {
    encourage: {
      label: 'Encourage to use',
      subject: 'Start using 1Resource for demand-supply visibility',
      body: `Hello,

We are inviting you to start using 1Resource to organize demand requests, resume supply, candidate screening, role matching and client-ready resource planning in one place.

The platform helps teams capture demand, maintain a resume bank, assess fitment, generate standardized profiles, and track shortlisting with better visibility.

Please let us know a convenient time for a short walkthrough.

Regards,
1Resource Team`
    },
    release_notes: {
      label: 'Release notes',
      subject: '1Resource release update',
      body: `Hello,

We are sharing the latest 1Resource release notes.

Key updates include improved demand management, resume bank workflows, candidate screening, public upload links, role-based matching, PostgreSQL deployment support, and production readiness improvements.

Please review the release and start using the updated version.

Regards,
1Resource Team`
    },
    shutdown: {
      label: 'Shutdown details',
      subject: 'Important: 1Resource shutdown / maintenance notice',
      body: `Hello,

This is an important notice regarding planned shutdown or maintenance activity for 1Resource.

Please complete any pending work before the advised window. Access may be temporarily unavailable during the shutdown period. We will notify you once services are restored.

Regards,
1Resource Team`
    }
  };
  const [clientForm, setClientForm] = useState(emptyClient);
  const [selectedClients, setSelectedClients] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [emailForm, setEmailForm] = useState({ email_type: 'encourage', subject: templates.encourage.subject, body: templates.encourage.body });
  const [localMsg, setLocalMsg] = useState('');
  const [busy, setBusy] = useState(false);

  function selectTemplate(type) {
    const t = templates[type] || templates.encourage;
    setEmailForm({ email_type: type, subject: t.subject, body: t.body });
  }

  function toggle(list, setList, id) {
    setList(list.includes(id) ? list.filter(x => x !== id) : [...list, id]);
  }

  function editClient(c) {
    setClientForm({
      id: c.id,
      company_name: c.company_name || '',
      contact_name: c.contact_name || '',
      email: c.email || '',
      phone: c.phone || '',
      segment: c.segment || '',
      status: c.status || 'Prospect',
      notes: c.notes || ''
    });
    setLocalMsg('');
  }

  async function saveClient(e) {
    e?.preventDefault?.();
    setBusy(true);
    setLocalMsg('');
    try {
      await onSaveClient(clientForm);
      setClientForm(emptyClient);
      setLocalMsg('Potential client saved.');
    } catch (err) {
      setLocalMsg(`Save failed: ${err.message}`);
    } finally {
      setBusy(false);
    }
  }

  async function removeClient(id) {
    if (!confirm('Delete this potential client?')) return;
    setBusy(true);
    setLocalMsg('');
    try {
      await onDeleteClient(id);
      setSelectedClients(selectedClients.filter(x => x !== id));
      setLocalMsg('Potential client deleted.');
    } catch (err) {
      setLocalMsg(`Delete failed: ${err.message}`);
    } finally {
      setBusy(false);
    }
  }

  async function sendEmail() {
    setBusy(true);
    setLocalMsg('');
    try {
      const res = await onSend({ ...emailForm, client_ids: selectedClients, user_ids: selectedUsers });
      setLocalMsg(res.message || 'Email action completed.');
    } catch (err) {
      setLocalMsg(`Email failed: ${err.message}`);
    } finally {
      setBusy(false);
    }
  }

  const isError = localMsg.includes('failed');

  return <section className="pageBlock outreachPage">
    <div className="sectionHeader">
      <div><h2>Customer Outreach</h2><p>Admin-only page to organize potential clients, user email IDs and send usage, release-note or shutdown emails.</p></div>
      <button onClick={onRefresh}>Refresh</button>
    </div>

    {localMsg && <div className={isError ? 'error' : 'successBox'}>{localMsg}</div>}

    <div className="twoCol">
      <form className="panel compact" onSubmit={saveClient}>
        <h3>{clientForm.id ? 'Edit Potential Client' : 'Add Potential Client'}</h3>
        <div className="formGrid">
          <Input label="Company / Customer" value={clientForm.company_name} onChange={v => setClientForm({ ...clientForm, company_name: v })} />
          <Input label="Contact name" value={clientForm.contact_name} onChange={v => setClientForm({ ...clientForm, contact_name: v })} />
          <Input label="Email ID" value={clientForm.email} onChange={v => setClientForm({ ...clientForm, email: v })} />
          <Input label="Phone" value={clientForm.phone} onChange={v => setClientForm({ ...clientForm, phone: v })} />
          <Input label="Segment" value={clientForm.segment} onChange={v => setClientForm({ ...clientForm, segment: v })} />
          <Select label="Status" value={clientForm.status} onChange={v => setClientForm({ ...clientForm, status: v })} options={['Prospect','Interested','Trial','Active','Dormant','Do Not Contact']} />
        </div>
        <TextArea label="Notes" value={clientForm.notes} rows={3} onChange={v => setClientForm({ ...clientForm, notes: v })} />
        <div className="formActions"><button type="button" onClick={() => setClientForm(emptyClient)}>Clear</button><button className="primary" disabled={busy}>{busy ? 'Please wait...' : 'Save client'}</button></div>
      </form>

      <div className="panel compact">
        <h3>Email Composer</h3>
        <Select label="Email type" value={emailForm.email_type} onChange={selectTemplate} options={Object.keys(templates)} />
        <Input label="Subject" value={emailForm.subject} onChange={v => setEmailForm({ ...emailForm, subject: v })} />
        <TextArea label="Email body" value={emailForm.body} rows={9} onChange={v => setEmailForm({ ...emailForm, body: v })} />
        <div className="hintBox"><strong>SMTP</strong><span>On Railway, configure SMTP_HOST, SMTP_PORT, SMTP_FROM_EMAIL, SMTP_USERNAME and SMTP_PASSWORD to send real emails. Without SMTP, emails are logged as queued.</span></div>
        <div className="formActions"><button className="primary" type="button" disabled={busy || (!selectedClients.length && !selectedUsers.length)} onClick={sendEmail}>Send / Queue Email</button></div>
      </div>
    </div>

    <div className="twoCol">
      <div className="panel">
        <div className="subHeader"><div><h3>Potential Clients</h3><p>Select one or more customers for outreach.</p></div><mark className="neutral">{clients.length} clients</mark></div>
        <div className="tableWrap"><table><thead><tr><th>Select</th><th>Customer</th><th>Email</th><th>Status</th><th>Action</th></tr></thead><tbody>{clients.map(c => <tr key={c.id}>
          <td><input type="checkbox" checked={selectedClients.includes(c.id)} onChange={() => toggle(selectedClients, setSelectedClients, c.id)} /></td>
          <td><strong>{c.company_name}</strong><br /><small>{c.contact_name || '-'} · {c.segment || '-'}</small></td>
          <td>{c.email}<br /><small>{c.phone || '-'}</small></td>
          <td><span className="pill">{c.status || 'Prospect'}</span></td>
          <td><button onClick={() => editClient(c)}>Edit</button><button className="danger" onClick={() => removeClient(c.id)}>Delete</button></td>
        </tr>)}</tbody></table>{clients.length === 0 && <p className="empty">No potential clients added yet.</p>}</div>
      </div>

      <div className="panel">
        <div className="subHeader"><div><h3>User Email IDs</h3><p>Internal app users with login-profile email IDs.</p></div><mark className="neutral">{appUsers.length} users</mark></div>
        <div className="tableWrap"><table><thead><tr><th>Select</th><th>User</th><th>Email</th><th>Role</th></tr></thead><tbody>{appUsers.map(u => <tr key={u.id}>
          <td><input type="checkbox" checked={selectedUsers.includes(u.id)} onChange={() => toggle(selectedUsers, setSelectedUsers, u.id)} /></td>
          <td><strong>{u.full_name || u.username}</strong><br /><small>{u.username}</small></td>
          <td>{u.email}</td>
          <td>{u.role}</td>
        </tr>)}</tbody></table>{appUsers.length === 0 && <p className="empty">No user email IDs configured. Add emails in Admin/User Management or Profile.</p>}</div>
      </div>
    </div>

    <div className="panel">
      <div className="subHeader"><div><h3>Email History</h3><p>Latest outreach attempts and SMTP status.</p></div><mark className="neutral">{logs.length} logs</mark></div>
      <div className="tableWrap"><table><thead><tr><th>Time</th><th>Recipient</th><th>Type</th><th>Subject</th><th>Status</th><th>Error</th></tr></thead><tbody>{logs.map(l => <tr key={l.id}>
        <td>{new Date(l.created_at).toLocaleString()}</td><td>{l.recipient_name || '-'}<br /><small>{l.recipient_email}</small></td><td>{l.email_type}</td><td>{l.subject}</td><td><span className="pill">{l.status}</span></td><td>{l.error || '-'}</td>
      </tr>)}</tbody></table>{logs.length === 0 && <p className="empty">No email history yet.</p>}</div>
    </div>
  </section>;
}

function Logs({ logs }) { return <section className="pageBlock"><h2>Activity Logs</h2><div className="tableWrap"><table><thead><tr><th>Time</th><th>Actor</th><th>Action</th><th>Entity</th><th>Details</th></tr></thead><tbody>{logs.map(l => <tr key={l.id}><td>{new Date(l.created_at).toLocaleString()}</td><td>{l.actor}</td><td>{l.action}</td><td>{l.entity_type} #{l.entity_id || ''}</td><td>{l.details}</td></tr>)}</tbody></table></div></section>; }

function App() {
  if (window.location.pathname.startsWith('/public-upload/')) return <PublicUpload />;
  const saved = useMemo(() => { try { return JSON.parse(localStorage.getItem('truflux_auth') || 'null'); } catch (_) { return null; } }, []);
  const savedCollapsed = localStorage.getItem('truflux_menu_collapsed') === '1';
  const [auth, setAuth] = useState(saved);
  const [collapsed, setCollapsed] = useState(savedCollapsed);
  const [tab, setTab] = useState('dashboard');
  const [dashboard, setDashboard] = useState({});
  const [analytics, setAnalytics] = useState({});
  const [trends, setTrends] = useState({});
  const [marketSignals, setMarketSignals] = useState({});
  const [candidates, setCandidates] = useState([]);
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [demand, setDemand] = useState([]);
  const [selectedDemand, setSelectedDemand] = useState(null);
  const [editingDemand, setEditingDemand] = useState(null);
  const [demandMatches, setDemandMatches] = useState([]);
  const [filters, setFilters] = useState({ q: '', skill: '', status: '', availability: '' });
  const [demandFilters, setDemandFilters] = useState({ q: '', skill: '', status: '' });
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [links, setLinks] = useState([]);
  const [security, setSecurity] = useState({});
  const [companyProfile, setCompanyProfile] = useState({});
  const [currentProfile, setCurrentProfile] = useState(saved?.user || {});
  const [outreachClients, setOutreachClients] = useState([]);
  const [outreachUsers, setOutreachUsers] = useState([]);
  const [outreachLogs, setOutreachLogs] = useState([]);
  const [toast, setToast] = useState('');
  const token = auth?.token; const user = auth?.user;
  function show(message) { setToast(message); setTimeout(() => setToast(''), 3500); }
  function toggleMenu() { const next = !collapsed; setCollapsed(next); localStorage.setItem('truflux_menu_collapsed', next ? '1' : '0'); }
  async function loadDashboard() { if (token) setDashboard(await api('/api/dashboard', {}, token)); }
  async function loadAnalytics() { if (token) setAnalytics(await api('/api/ml/skills-analytics', {}, token)); }
  async function loadTrends() { if (token) setTrends(await api('/api/intelligence/trends', {}, token)); }
  async function loadMarketSignals() { if (token) setMarketSignals(await api('/api/intelligence/market-signals', {}, token)); }
  async function loadCandidates() { if (!token) return; const params = new URLSearchParams(filters).toString(); setCandidates(await api(`/api/candidates?${params}`, {}, token)); }
  async function loadDemand() { if (!token) return; const params = new URLSearchParams(demandFilters).toString(); setDemand(await api(`/api/demand?${params}`, {}, token)); }
  async function loadSelected(id) { setSelected(await api(`/api/candidates/${id}`, {}, token)); }
  async function loadSelectedDemand(id) { const data = await api(`/api/demand/${id}`, {}, token); setSelectedDemand(data); setDemandMatches(await api(`/api/demand/${id}/matches`, {}, token)); }
  async function loadAdmin() { if (user?.role !== 'Admin') return; setUsers(await api('/api/users', {}, token)); setLogs(await api('/api/logs', {}, token)); }
  async function loadLinks() { if (!token) return; setLinks(await api('/api/resume-links', {}, token)); }
  async function loadSecurity() { if (user?.role === 'Admin') setSecurity(await api('/api/security/status', {}, token)); }
  async function loadCompanyProfile() { if (token) setCompanyProfile(await api('/api/company-profile', {}, token)); }
  async function loadCurrentProfile() { if (token) { const data = await api('/api/me', {}, token); setCurrentProfile(data); setAuth(prev => prev ? { ...prev, user: { ...prev.user, ...data } } : prev); } }
  async function loadOutreach() { if (user?.role !== 'Admin') return; const [clientsData, usersData, logsData] = await Promise.all([api('/api/potential-clients', {}, token), api('/api/outreach/users', {}, token), api('/api/outreach/logs', {}, token)]); setOutreachClients(clientsData); setOutreachUsers(usersData); setOutreachLogs(logsData); }
  useEffect(() => { loadDashboard(); loadAnalytics(); loadDemand(); loadTrends(); loadMarketSignals(); loadCompanyProfile(); loadCurrentProfile(); }, [token]);
  useEffect(() => { loadCandidates(); }, [token, filters.q, filters.skill, filters.status, filters.availability]);
  useEffect(() => { loadDemand(); }, [token, demandFilters.q, demandFilters.skill, demandFilters.status]);
  useEffect(() => { if (tab === 'admin') { loadAdmin(); loadSecurity(); loadCompanyProfile(); } if (tab === 'outreach') loadOutreach(); if (tab === 'security') loadSecurity(); if (tab === 'links') loadLinks(); if (tab === 'intelligence') { loadAnalytics(); loadTrends(); loadMarketSignals(); } if (tab === 'demand') loadDemand(); }, [tab, token]);
  function onLogin(data) { setAuth(data); localStorage.setItem('truflux_auth', JSON.stringify(data)); }
  async function logout() { try { await api('/api/logout', { method: 'POST' }, token); } catch (_) {} localStorage.removeItem('truflux_auth'); setAuth(null); }
  async function saveCandidate(form) { const method = form.id ? 'PUT' : 'POST'; const path = form.id ? `/api/candidates/${form.id}` : '/api/candidates'; const saved = await api(path, { method, body: JSON.stringify(form) }, token); setEditing(null); await loadCandidates(); await loadDashboard(); setSelected(saved); show('Candidate saved'); }
  async function deleteCandidate() { if (!selected || !confirm('Delete this candidate?')) return; await api(`/api/candidates/${selected.id}`, { method: 'DELETE' }, token); setSelected(null); await loadCandidates(); await loadDashboard(); show('Candidate deleted'); }
  async function addAssessment(id, assessment) { await api(`/api/candidates/${id}/assessments`, { method: 'POST', body: JSON.stringify(assessment) }, token); await loadSelected(id); await loadCandidates(); await loadDashboard(); show('Assessment saved'); }
  async function uploadRoleResume(id, file, roleTitle, roleDefinition) { const data = new FormData(); data.append('file', file); data.append('role_title', roleTitle || 'Role-based Resume'); data.append('role_definition', roleDefinition || ''); const res = await api(`/api/candidates/${id}/resumes`, { method: 'POST', body: data }, token); await loadSelected(id); await loadCandidates(); await loadDashboard(); await loadAnalytics(); show(`Resume analyzed: Fit ${res.analysis.fit_score}/100, Risk ${res.analysis.fake_risk_score}/100`); }
  async function saveDemand(form) { const method = form.id ? 'PUT' : 'POST'; const path = form.id ? `/api/demand/${form.id}` : '/api/demand'; const saved = await api(path, { method, body: JSON.stringify(form) }, token); setEditingDemand(null); await loadDemand(); await loadDashboard(); await loadAnalytics(); await loadSelectedDemand(saved.id); show('Demand saved'); }
  async function deleteDemand() { if (!selectedDemand || !confirm('Delete this demand request?')) return; await api(`/api/demand/${selectedDemand.id}`, { method: 'DELETE' }, token); setSelectedDemand(null); await loadDemand(); await loadDashboard(); show('Demand deleted'); }
  async function shortlist(demandId, candidateId) { await api(`/api/demand/${demandId}/shortlist/${candidateId}`, { method: 'POST' }, token); if (selectedDemand?.id === demandId) await loadSelectedDemand(demandId); await loadDashboard(); show('Candidate shortlisted'); }
  async function candidateSuitability(candidateId) { return api(`/api/intelligence/candidate/${candidateId}/role-suitability`, {}, token); }
  async function roleCandidates(demandId) { return api(`/api/intelligence/demand/${demandId}/candidate-shortlist`, {}, token); }
  async function downloadResume(id, fileName) { const res = await fetch(`${API_BASE}/api/candidates/${id}/download`, { headers: authHeaders(token) }); if (!res.ok) { show('Resume download failed'); return; } const blob = await res.blob(); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = fileName || 'resume'; a.click(); URL.revokeObjectURL(url); }
  async function downloadVersion(id, fileName) { const res = await fetch(`${API_BASE}/api/resumes/${id}/download`, { headers: authHeaders(token) }); if (!res.ok) { show('Resume version download failed'); return; } const blob = await res.blob(); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = fileName || 'resume'; a.click(); URL.revokeObjectURL(url); }
  async function downloadStandardResume(id, code) { const res = await fetch(`${API_BASE}/api/candidates/${id}/standard-resume`, { headers: authHeaders(token) }); if (!res.ok) { show('Standard resume download failed'); return; } const blob = await res.blob(); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `${code || 'candidate'}_standard_resume.pdf`; a.click(); URL.revokeObjectURL(url); show('Formatted PDF resume created'); }
  async function createDemo() {
    let res;
    try {
      res = await api('/api/demo-data?count=50', { method: 'POST' }, token);
    } catch (err) {
      show(`Demo data failed: ${err.message}`);
      return;
    }

    const refreshes = await Promise.allSettled([
      loadCandidates(),
      loadDemand(),
      loadDashboard(),
      loadAnalytics(),
      loadTrends(),
      loadMarketSignals(),
    ]);
    const failedRefreshes = refreshes.filter(r => r.status === 'rejected').length;
    if (failedRefreshes) {
      show(`${res.message || 'Demo data created'}; ${failedRefreshes} screen refresh(es) need manual reload.`);
      return;
    }
    show(res.message || 'Demo data created successfully');
  }
  async function generateMcq(demandId) { const res = await api(`/api/demand/${demandId}/mcq/generate`, { method: 'POST' }, token); await loadSelectedDemand(demandId); show(res.message || 'MCQs generated'); }
  async function exportCsv() { const res = await fetch(`${API_BASE}/api/export/candidates.csv`, { headers: authHeaders(token) }); const blob = await res.blob(); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = '1resource_resume_bank.csv'; a.click(); URL.revokeObjectURL(url); }
  async function createUser(payload) { await api('/api/users', { method: 'POST', body: JSON.stringify(payload) }, token); await loadAdmin(); show('User created'); }
  async function updateUser(id, payload) { await api(`/api/users/${id}`, { method: 'PUT', body: JSON.stringify(payload) }, token); await loadAdmin(); show('User details updated'); }
  async function toggleUser(id, isActive) { await api(`/api/users/${id}/status?is_active=${isActive}`, { method: 'PATCH' }, token); await loadAdmin(); show('User status updated'); }
  async function unlockUser(id) { await api(`/api/users/${id}/unlock`, { method: 'POST' }, token); await loadAdmin(); await loadSecurity(); show('User unlocked'); }
  async function resetUserPassword(id, payload) { await api(`/api/users/${id}/reset-password`, { method: 'POST', body: JSON.stringify(payload) }, token); await loadAdmin(); await loadSecurity(); show('User password reset and sessions cleared'); }
  async function createLink(payload) { const data = await api('/api/resume-links', { method: 'POST', body: JSON.stringify(payload) }, token); await loadLinks(); await loadSecurity(); show('48-hour upload link created'); return data; }
  async function revokeLink(id) { if (!confirm('Revoke this public upload link?')) return; await api(`/api/resume-links/${id}/revoke`, { method: 'POST' }, token); await loadLinks(); await loadSecurity(); show('Public upload link revoked'); }
  async function changePassword(payload) { await api('/api/change-password', { method: 'POST', body: JSON.stringify(payload) }, token); show('Password changed'); }
  async function saveMyProfile(payload) { const data = await api('/api/me/profile', { method: 'PUT', body: JSON.stringify(payload) }, token); const nextAuth = { ...auth, user: { ...auth.user, ...data } }; setAuth(nextAuth); setCurrentProfile(data); localStorage.setItem('truflux_auth', JSON.stringify(nextAuth)); show('Login profile saved'); return data; }
  async function saveCompanyProfile(payload) { const data = await api('/api/company-profile', { method: 'PUT', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } }, token); setCompanyProfile(data); await loadCompanyProfile(); show('Company profile saved'); return data; }
  async function uploadCompanyLogo(file) { const data = new FormData(); data.append('logo', file); const saved = await api('/api/company-profile/logo', { method: 'POST', body: data }, token); setCompanyProfile(saved); await loadCompanyProfile(); show('Company logo uploaded'); return saved; }
  async function savePotentialClient(payload) { const method = payload.id ? 'PUT' : 'POST'; const path = payload.id ? `/api/potential-clients/${payload.id}` : '/api/potential-clients'; const saved = await api(path, { method, body: JSON.stringify(payload) }, token); await loadOutreach(); show('Potential client saved'); return saved; }
  async function deletePotentialClient(id) { await api(`/api/potential-clients/${id}`, { method: 'DELETE' }, token); await loadOutreach(); show('Potential client deleted'); }
  async function sendOutreachEmail(payload) { const res = await api('/api/outreach/send', { method: 'POST', body: JSON.stringify(payload) }, token); await loadOutreach(); show(res.message || 'Outreach completed'); return res; }
  if (!auth) return <Login onLogin={onLogin} />;
  const nav = [
    ['dashboard', '⌂', 'Dashboard'], ['demand', '◎', 'Demand'], ['candidates', '▣', 'Resume Bank'], ['intelligence', '✦', 'Intelligence'], ['profile', '☏', 'Profile']
  ];
  if (user.role === 'Admin' || user.role === 'Recruiter') nav.push(['links', '↗', 'Public Links']);
  if (user.role === 'Admin') { nav.push(['outreach', '✉', 'Outreach']); nav.push(['security', '盾', 'Security']); nav.push(['admin', '⚙', 'Admin']); }
  return <div className={`appShell ${collapsed ? 'collapsed' : ''}`}><aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}><div className="logo"><img src={brandLogo} alt="Truflux Technologies logo" className="logoImage" /><div><strong>{APP_NAME}</strong><small>{APP_SUBTITLE}</small></div></div><button className="collapseBtn" onClick={toggleMenu}>{collapsed ? '›' : '‹ Collapse'}</button><nav>{nav.map(([key, icon, label]) => <button key={key} title={label} className={tab === key ? 'active' : ''} onClick={() => setTab(key)}><span>{icon}</span><em>{label}</em></button>)}</nav><div className="sideFooter"><strong>{user.full_name}</strong><span>{user.role}</span><span className="sideMeta">Version {APP_VERSION}</span><button onClick={logout}>Sign out</button></div></aside><main><header className="topbar"><div><h1>{APP_NAME}</h1><p>{APP_SUBTITLE} · Bench planning, demand capture, candidate screening, resume rating, fake-resume risk and shortlist matching.</p></div><div className="topbarMeta"><span className="pill">Version {APP_VERSION}</span></div></header>{tab === 'dashboard' && <Dashboard dashboard={dashboard} onExport={exportCsv} />}{tab === 'profile' && <MyProfile user={currentProfile || user} onSave={saveMyProfile} />}{tab === 'demand' && <DemandPage demand={demand} filters={demandFilters} setFilters={setDemandFilters} onCreate={() => setEditingDemand(emptyDemand)} onSelect={loadSelectedDemand} />}{tab === 'candidates' && <Candidates candidates={candidates} filters={filters} setFilters={setFilters} onCreate={() => setEditing(emptyCandidate)} onSelect={loadSelected} onDownloadStandard={downloadStandardResume} />}{tab === 'intelligence' && <MLAnalytics analytics={analytics} trends={trends} marketSignals={marketSignals} candidates={candidates} demand={demand} onRefresh={loadAnalytics} onRefreshTrends={loadTrends} onRefreshMarket={loadMarketSignals} onCandidateSuitability={candidateSuitability} onRoleCandidates={roleCandidates} onShortlist={shortlist} />}{tab === 'links' && <PublicLinks links={links} candidates={candidates} demand={demand} onCreateLink={createLink} onRevokeLink={revokeLink} onRefresh={loadLinks} />}{tab === 'outreach' && <CustomerOutreach clients={outreachClients} appUsers={outreachUsers} logs={outreachLogs} onRefresh={loadOutreach} onSaveClient={savePotentialClient} onDeleteClient={deletePotentialClient} onSend={sendOutreachEmail} />}{tab === 'security' && <SecurityPanel security={security} onRefresh={loadSecurity} onChangePassword={changePassword} />}{tab === 'admin' && <><CompanyProfile profile={companyProfile} onSave={saveCompanyProfile} onUploadLogo={uploadCompanyLogo} /><Users users={users} onCreateUser={createUser} onUpdateUser={updateUser} onToggleUser={toggleUser} onUnlockUser={unlockUser} onResetPassword={resetUserPassword} onCreateDemo={createDemo} /><Logs logs={logs} /></>}<FooterNote /></main>{editing && <div className="modalBackdrop"><div className="modal"><div className="modalHeader"><h2>{editing.id ? 'Edit Candidate' : 'Add Candidate'}</h2><button onClick={() => setEditing(null)}>×</button></div><CandidateForm initial={editing} onCancel={() => setEditing(null)} onSave={saveCandidate} /></div></div>}{editingDemand && <div className="modalBackdrop"><div className="modal"><div className="modalHeader"><h2>{editingDemand.id ? 'Edit Demand' : 'Add Demand'}</h2><button onClick={() => setEditingDemand(null)}>×</button></div><DemandForm initial={editingDemand} onCancel={() => setEditingDemand(null)} onSave={saveDemand} /></div></div>}{selected && !editing && <CandidateDetail candidate={selected} user={user} onClose={() => setSelected(null)} onEdit={() => setEditing(selected)} onDelete={deleteCandidate} onAddAssessment={addAssessment} onRoleResumeUpload={uploadRoleResume} onDownload={downloadResume} onDownloadVersion={downloadVersion} onDownloadStandard={downloadStandardResume} />}{selectedDemand && !editingDemand && <DemandDetail demand={selectedDemand} matches={demandMatches} onClose={() => setSelectedDemand(null)} onEdit={() => setEditingDemand(selectedDemand)} onDelete={deleteDemand} onShortlist={shortlist} onRefreshMatches={() => loadSelectedDemand(selectedDemand.id)} onGenerateMcq={() => generateMcq(selectedDemand.id)} />}{toast && <div className="toast">{toast}</div>}</div>;
}

export default App;
