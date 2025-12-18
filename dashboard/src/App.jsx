import React, { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'vibescore.dashboard.auth.v1';

function getInsforgeBaseUrl() {
  return import.meta.env.VITE_VIBESCORE_INSFORGE_BASE_URL || 'https://5tmappuk.us-east.insforge.app';
}

function loadAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.accessToken !== 'string' || parsed.accessToken.length === 0) return null;
    return parsed;
  } catch (_e) {
    return null;
  }
}

function saveAuth(auth) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
}

function clearAuth() {
  localStorage.removeItem(STORAGE_KEY);
}

function formatDateUTC(d) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())).toISOString().slice(0, 10);
}

function getDefaultRange() {
  const today = new Date();
  const to = formatDateUTC(today);
  const from = formatDateUTC(new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - 29)));
  return { from, to };
}

function buildAuthUrl({ baseUrl, path, redirectUrl }) {
  const u = new URL(path, baseUrl);
  u.searchParams.set('redirect', redirectUrl);
  return u.toString();
}

async function fetchJson(url, { method, headers } = {}) {
  const res = await fetch(url, {
    method: method || 'GET',
    headers: {
      ...(headers || {})
    }
  });

  const text = await res.text();
  let data = null;
  try {
    data = JSON.parse(text);
  } catch (_e) {}

  if (!res.ok) {
    const msg = data?.error || data?.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return data;
}

function toDisplayNumber(value) {
  if (value == null) return '-';
  try {
    if (typeof value === 'bigint') return new Intl.NumberFormat().format(value);
    if (typeof value === 'number') return new Intl.NumberFormat().format(value);
    const s = String(value).trim();
    if (/^[0-9]+$/.test(s)) return new Intl.NumberFormat().format(BigInt(s));
    return s;
  } catch (_e) {
    return String(value);
  }
}

function toFiniteNumber(value) {
  const n = Number(String(value));
  return Number.isFinite(n) ? n : null;
}

function Sparkline({ rows }) {
  const values = (rows || []).map((r) => toFiniteNumber(r?.total_tokens)).filter((n) => typeof n === 'number');
  if (values.length < 2) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;

  const w = 720;
  const h = 120;
  const padX = 8;
  const padY = 10;

  const pts = values.map((v, i) => {
    const x = padX + (i * (w - padX * 2)) / (values.length - 1);
    const y = padY + (1 - (v - min) / span) * (h - padY * 2);
    return { x, y };
  });

  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ');

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="120" aria-label="Daily token usage sparkline">
      <path d={d} fill="none" stroke="rgba(0,255,136,0.9)" strokeWidth="2.5" />
    </svg>
  );
}

function ConnectCliPage({ defaultInsforgeBaseUrl }) {
  const url = useMemo(() => new URL(window.location.href), []);
  const redirect = url.searchParams.get('redirect') || '';
  const baseUrlOverride = url.searchParams.get('base_url') || '';

  let redirectUrl = null;
  try {
    redirectUrl = new URL(redirect);
  } catch (_e) {}

  const safeRedirect =
    redirectUrl && redirectUrl.protocol === 'http:' && (redirectUrl.hostname === '127.0.0.1' || redirectUrl.hostname === 'localhost')
      ? redirectUrl.toString()
      : null;

  const insforgeBaseUrl = baseUrlOverride || defaultInsforgeBaseUrl;

  const signInUrl = useMemo(() => {
    if (!safeRedirect) return null;
    return buildAuthUrl({ baseUrl: insforgeBaseUrl, path: '/auth/sign-in', redirectUrl: safeRedirect });
  }, [insforgeBaseUrl, safeRedirect]);

  const signUpUrl = useMemo(() => {
    if (!safeRedirect) return null;
    return buildAuthUrl({ baseUrl: insforgeBaseUrl, path: '/auth/sign-up', redirectUrl: safeRedirect });
  }, [insforgeBaseUrl, safeRedirect]);

  return (
    <div className="container">
      <div className="row" style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 18, fontWeight: 900 }}>VibeScore</div>
        <div className="spacer" />
        <span className="muted">Connect CLI</span>
      </div>

      <div className="card">
        <div style={{ fontSize: 16, fontWeight: 800 }}>Link your CLI</div>
        <p className="muted" style={{ marginTop: 8 }}>
          Sign in or sign up. When finished, the browser will return to your local CLI to complete setup.
        </p>

        {!safeRedirect ? (
          <div className="muted" style={{ marginTop: 12, color: '#ffb4b4' }}>
            Invalid or missing <code>redirect</code> URL. This page must be opened from the CLI.
          </div>
        ) : (
          <div className="row" style={{ marginTop: 12 }}>
            <a className="btn primary" href={signInUrl}>
              $ sign-in
            </a>
            <a className="btn" href={signUpUrl}>
              $ sign-up
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const baseUrl = useMemo(() => getInsforgeBaseUrl(), []);
  const [auth, setAuth] = useState(() => loadAuth());
  const isLocalhost = useMemo(() => {
    const h = window.location.hostname;
    return h === 'localhost' || h === '127.0.0.1';
  }, []);
  const installInitCmd = isLocalhost ? 'node bin/tracker.js init' : 'npx --yes @vibescore/tracker init';
  const installSyncCmd = isLocalhost ? 'node bin/tracker.js sync' : 'npx --yes @vibescore/tracker sync';

  const routePath = useMemo(() => window.location.pathname.replace(/\/+$/, '') || '/', []);
  if (routePath === '/connect') {
    return <ConnectCliPage defaultInsforgeBaseUrl={baseUrl} />;
  }

  const range = useMemo(() => getDefaultRange(), []);
  const [from, setFrom] = useState(range.from);
  const [to, setTo] = useState(range.to);

  const [daily, setDaily] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const redirectUrl = useMemo(() => `${window.location.origin}/auth/callback`, []);
  const signInUrl = useMemo(
    () => buildAuthUrl({ baseUrl, path: '/auth/sign-in', redirectUrl }),
    [baseUrl, redirectUrl]
  );
  const signUpUrl = useMemo(
    () => buildAuthUrl({ baseUrl, path: '/auth/sign-up', redirectUrl }),
    [baseUrl, redirectUrl]
  );

  useEffect(() => {
    const path = window.location.pathname.replace(/\/+$/, '');
    if (path !== '/auth/callback') return;

    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('access_token') || '';
    if (!accessToken) return;

    const next = {
      accessToken,
      userId: params.get('user_id') || null,
      email: params.get('email') || null,
      name: params.get('name') || null,
      savedAt: new Date().toISOString()
    };
    saveAuth(next);
    setAuth(next);
    window.history.replaceState({}, '', '/');
  }, []);

  async function refresh() {
    if (!auth?.accessToken) return;
    setLoading(true);
    setError(null);
    try {
      const headers = { Authorization: `Bearer ${auth.accessToken}` };
      const dailyUrl = new URL('/functions/vibescore-usage-daily', baseUrl);
      dailyUrl.searchParams.set('from', from);
      dailyUrl.searchParams.set('to', to);

      const summaryUrl = new URL('/functions/vibescore-usage-summary', baseUrl);
      summaryUrl.searchParams.set('from', from);
      summaryUrl.searchParams.set('to', to);

      const [dailyRes, summaryRes] = await Promise.all([
        fetchJson(dailyUrl.toString(), { headers }),
        fetchJson(summaryUrl.toString(), { headers })
      ]);

      setDaily(Array.isArray(dailyRes?.data) ? dailyRes.data : []);
      setSummary(summaryRes?.totals || null);
    } catch (e) {
      setError(e?.message || String(e));
      setDaily([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!auth?.accessToken) return;
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.accessToken, from, to]);

  const signedIn = Boolean(auth?.accessToken);
  const title = 'VibeScore';

  return (
    <div className="container">
      <div className="row" style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 18, fontWeight: 900 }}>{title}</div>
        <div className="spacer" />
        {signedIn ? (
          <button
            className="btn"
            onClick={() => {
              clearAuth();
              setAuth(null);
              setDaily([]);
              setSummary(null);
            }}
          >
            Sign out
          </button>
        ) : (
          <span className="muted">Not signed in</span>
        )}
      </div>

      {!signedIn ? (
        <div className="card">
          <div style={{ fontSize: 16, fontWeight: 800 }}>auth required</div>
          <p className="muted" style={{ marginTop: 8 }}>
            sign in / sign up to view your daily token usage (UTC).
          </p>

          <div className="row" style={{ marginTop: 12 }}>
            <a className="btn primary" href={signInUrl}>
              $ sign-in
            </a>
            <a className="btn" href={signUpUrl}>
              $ sign-up
            </a>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="row">
            <div style={{ fontSize: 16, fontWeight: 800 }}>Dashboard</div>
            <div className="spacer" />
            <div className="muted">{auth?.email ? auth.email : 'Signed in'}</div>
          </div>

          <div className="card" style={{ marginTop: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 800 }}>install</div>
            <p className="muted" style={{ marginTop: 8 }}>
              1) run <code>{installInitCmd}</code>
              <br />
              2) use Codex CLI normally
              <br />
              3) run <code>{installSyncCmd}</code> (or wait for auto sync)
            </p>
          </div>

          <div className="row" style={{ marginTop: 12 }}>
            <label className="muted">
              From (UTC)&nbsp;
              <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </label>
            <label className="muted">
              To (UTC)&nbsp;
              <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </label>
            <button className="btn primary" disabled={loading} onClick={refresh}>
              {loading ? 'Loading…' : 'Refresh'}
            </button>
            <div className="spacer" />
            <span className="muted">UTC aggregates</span>
          </div>

          {error ? (
            <div className="muted" style={{ marginTop: 12, color: '#ffb4b4' }}>
              Error: {error}
            </div>
          ) : null}

          <div style={{ marginTop: 16 }}>
            <div className="grid">
              <div className="card metric">
                <div className="label">Total</div>
                <div className="value">{toDisplayNumber(summary?.total_tokens)}</div>
              </div>
              <div className="card metric">
                <div className="label">Input</div>
                <div className="value">{toDisplayNumber(summary?.input_tokens)}</div>
              </div>
              <div className="card metric">
                <div className="label">Output</div>
                <div className="value">{toDisplayNumber(summary?.output_tokens)}</div>
              </div>
              <div className="card metric">
                <div className="label">Cached input</div>
                <div className="value">{toDisplayNumber(summary?.cached_input_tokens)}</div>
              </div>
              <div className="card metric">
                <div className="label">Reasoning output</div>
                <div className="value">{toDisplayNumber(summary?.reasoning_output_tokens)}</div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            <Sparkline rows={daily} />
          </div>

          <div style={{ marginTop: 8 }}>
            <div className="muted" style={{ marginBottom: 8 }}>
              Daily totals
            </div>
            {daily.length === 0 ? (
              <div className="muted">
                No data yet. Use Codex CLI then run <code>{installSyncCmd}</code>.
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Input</th>
                    <th>Output</th>
                    <th>Cached</th>
                    <th>Reasoning</th>
                  </tr>
                </thead>
                <tbody>
                  {daily.map((r) => (
                    <tr key={String(r.day)}>
                      <td>{String(r.day)}</td>
                      <td>{toDisplayNumber(r.total_tokens)}</td>
                      <td>{toDisplayNumber(r.input_tokens)}</td>
                      <td>{toDisplayNumber(r.output_tokens)}</td>
                      <td>{toDisplayNumber(r.cached_input_tokens)}</td>
                      <td>{toDisplayNumber(r.reasoning_output_tokens)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
