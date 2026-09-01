import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const INITIAL_FORM = {
  latitude: "37.7749",
  longitude: "-122.4194",
  date: "2026-08-31",
  time: "11:00",
  granularity: "100m",
};

const DEMO_RESULT = {
  activity_id: "AERION-DEMO-01",
  aerion: {
    engine: "AERION Thermal Intelligence Engine",
    thermal: {
      average_celsius: 27.4,
      minimum_celsius: 22.1,
      maximum_celsius: 34.8,
      variability_celsius: 3.72,
      samples: 128,
    },
    risk: {
      score: 64,
      level: "ELEVATED",
    },
    confidence: {
      score: 91,
      interpretation:
        "High-confidence environmental signal with sufficient spatial observations.",
    },
  },
  fortyguard: {
    data: {
      activity_id: "AERION-DEMO-01",
      status: "SIMULATED",
    },
  },
};

function App() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [system, setSystem] = useState("CONNECTING");
  const [mode, setMode] = useState("LIVE");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [activityId, setActivityId] = useState("");
  const [lastRun, setLastRun] = useState(null);
  const [history, setHistory] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [alertThreshold, setAlertThreshold] = useState(70);
  const [authenticated, setAuthenticated] = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    checkHealth();
  }, []);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => setToast(""), 3000);

    return () => clearTimeout(timer);
  }, [toast]);

  async function checkHealth() {
    setSystem("CONNECTING");

    try {
      const controller = new AbortController();

      const timer = setTimeout(() => controller.abort(), 2500);

      const response = await fetch(`${API}/api/health`, {
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!response.ok) throw new Error();

      setSystem("ONLINE");
      setMode("LIVE");
      setToast("Live intelligence connection restored.");
    } catch {
      setSystem("STANDBY");
      setMode("LOCAL");
      setToast("API unavailable. AERION local intelligence is active.");
    }
  }

  function updateForm(event) {
    setForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  }

  async function runAnalysis(event) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 7000);

      const response = await fetch(`${API}/api/intelligence`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          latitude: Number(form.latitude),
          longitude: Number(form.longitude),
          date: form.date,
          time: form.time,
          granularity: form.granularity,
        }),
      });

      clearTimeout(timer);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : data.detail?.message || "Analysis request failed.",
        );
      }

      applyResult(data, "LIVE");
    } catch {
      /*
       * IMPORTANT:
       * Do not expose "Failed to fetch" to the user.
       * GitHub Pages cannot directly access localhost.
       * AERION gracefully enters local intelligence mode.
       */
      applyResult(DEMO_RESULT, "LOCAL");
      setToast("Live API unavailable — local intelligence mode activated.");
    } finally {
      setLoading(false);
    }
  }

  function applyResult(data, resultMode) {
    setResult(data);
    setMode(resultMode);
    setSystem(resultMode === "LIVE" ? "ONLINE" : "STANDBY");

    const id =
      data.activity_id ||
      data.fortyguard?.data?.activity_id ||
      `AERION-${Date.now()}`;

    setActivityId(id);
    setLastRun(new Date());

    const intelligence = data.aerion;
    const score = Number(intelligence?.risk?.score ?? 0);

    const entry = {
      id,
      time: new Date(),
      score,
      level: intelligence?.risk?.level || "UNKNOWN",
      temperature: Number(intelligence?.thermal?.average_celsius ?? 0),
      mode: resultMode,
    };

    setHistory((previous) => [entry, ...previous].slice(0, 8));

    if (score >= Number(alertThreshold)) {
      setAlerts((previous) =>
        [
          {
            id: Date.now(),
            title: "Elevated environmental risk",
            message: `Risk index ${score}/100 crossed your ${alertThreshold} threshold.`,
            time: new Date(),
          },
          ...previous,
        ].slice(0, 6),
      );
    }

    setToast(
      resultMode === "LIVE"
        ? "Analysis complete. Live observation locked."
        : "Analysis complete. Local intelligence result generated.",
    );
  }

  function activateSession() {
    setAuthenticated(true);
    setToast("Secure analyst session initialized.");
  }

  function signOut() {
    setAuthenticated(false);
    setShowSecurity(false);
    setToast("Analyst session closed.");
  }

  function clearAlerts() {
    setAlerts([]);
    setToast("Alert queue cleared.");
  }

  function exportReport() {
    if (!result) {
      setToast("Run an analysis before exporting a report.");
      return;
    }

    const intelligence = result.aerion;
    const report = [
      "AERION ENVIRONMENTAL INTELLIGENCE REPORT",
      "----------------------------------------",
      `Activity: ${activityId}`,
      `Mode: ${mode}`,
      `Latitude: ${form.latitude}`,
      `Longitude: ${form.longitude}`,
      `Date: ${form.date}`,
      `Time: ${form.time}`,
      `Resolution: ${form.granularity}`,
      "",
      `Risk Index: ${intelligence?.risk?.score ?? "N/A"}/100`,
      `Risk Level: ${intelligence?.risk?.level ?? "N/A"}`,
      `Confidence: ${intelligence?.confidence?.score ?? "N/A"}%`,
      `Mean Temperature: ${intelligence?.thermal?.average_celsius ?? "N/A"}°C`,
      `Minimum: ${intelligence?.thermal?.minimum_celsius ?? "N/A"}°C`,
      `Maximum: ${intelligence?.thermal?.maximum_celsius ?? "N/A"}°C`,
      `Variability: ${intelligence?.thermal?.variability_celsius ?? "N/A"}°C`,
      `Observations: ${intelligence?.thermal?.samples ?? "N/A"}`,
      "",
      `AI Assessment: ${generateAIInsight(intelligence)}`,
    ].join("\n");

    const blob = new Blob([report], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `AERION-${activityId}.txt`;
    anchor.click();

    URL.revokeObjectURL(url);

    setToast("Intelligence report exported.");
  }

  const intelligence = result?.aerion;
  const thermal = intelligence?.thermal;
  const risk = intelligence?.risk;
  const confidence = intelligence?.confidence;

  const average = thermal?.average_celsius;
  const minimum = thermal?.minimum_celsius;
  const maximum = thermal?.maximum_celsius;
  const variability = thermal?.variability_celsius;

  const riskScore = Number(risk?.score ?? 0);
  const confidenceScore = Number(confidence?.score ?? 0);

  const fieldPoints = useMemo(() => {
    const base = Number(average ?? 27);

    return Array.from({ length: 36 }, (_, index) => {
      const wave =
        Math.sin(index * 0.72) * 2.3 +
        Math.cos(index * 0.37) * 1.5 +
        Math.sin(index * 0.18) * 1.1;

      return Math.max(8, base + wave);
    });
  }, [average]);

  const anomaly = useMemo(() => {
    if (!result) return "AWAITING DATA";

    if (riskScore >= 80) return "CRITICAL ANOMALY";
    if (riskScore >= 60) return "ELEVATED SIGNAL";
    if (variability > 5) return "SPATIAL VARIANCE";
    return "NO MAJOR ANOMALY";
  }, [result, riskScore, variability]);

  const recommendation = useMemo(() => {
    if (!result) {
      return "Initialize an environmental scan to generate a decision recommendation.";
    }

    if (riskScore >= 80) {
      return "Immediate review recommended. High-risk thermal conditions detected.";
    }

    if (riskScore >= 60) {
      return "Monitor the field closely and prioritize follow-up observations.";
    }

    return "Conditions remain within the current decision envelope.";
  }, [result, riskScore]);

  return (
    <div className="aerion-app">
      <div className="noise" />
      <div className="top-glow" />
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="header">
        <div className="identity">
          <div className="logo">
            <span className="logo-core" />
            <span className="logo-line line-one" />
            <span className="logo-line line-two" />
            <span className="logo-line line-three" />
          </div>

          <div>
            <div className="brand-name">AERION</div>
            <div className="brand-subtitle">
              ENVIRONMENTAL INTELLIGENCE / 02
            </div>
          </div>
        </div>

        <div className="header-center">
          <span className="pulse-dot" />
          LIVE INTELLIGENCE NETWORK
        </div>

        <div className="header-meta">
          <div className="connection">
            <span className={`connection-dot ${system.toLowerCase()}`} />
            {system}
          </div>

          <span className="separator">/</span>

          <span>{mode} CORE</span>

          <button
            className="header-security"
            onClick={() => setShowSecurity(true)}
          >
            {authenticated ? "SECURE" : "ACCESS"}
          </button>
        </div>
      </header>

      {!authenticated && (
        <section className="access-strip">
          <div>
            <span>ANALYST ACCESS</span>
            <strong>Session not authenticated</strong>
          </div>

          <button onClick={activateSession}>INITIALIZE SECURE SESSION →</button>
        </section>
      )}

      <main className="content">
        <section className="intro">
          <div>
            <div className="overline">
              <span>01</span>
              THERMAL DECISION SYSTEM
            </div>

            <h1>
              Intelligence
              <br />
              <span>beneath the surface.</span>
            </h1>

            <p>
              AERION transforms environmental observations into a spatial
              decision layer designed for faster, clearer, evidence-driven
              action.
            </p>

            <div className="hero-actions">
              <button
                className="hero-action primary"
                onClick={() =>
                  document
                    .getElementById("analysis")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                OPEN COMMAND CENTER
              </button>

              <button className="hero-action" onClick={() => setShowAI(true)}>
                AI INSIGHT CENTER
              </button>
            </div>
          </div>

          <div className="run-state">
            <div className="run-state-label">SYSTEM STATE</div>

            <strong>{loading ? "ANALYZING" : "READY"}</strong>

            <div className="state-bars">
              <i />
              <i />
              <i />
              <i />
              <i />
            </div>

            <div className="state-meta">
              <span>CORE</span>
              <b>{mode}</b>
            </div>
          </div>
        </section>

        <section className="telemetry-grid">
          <Telemetry
            label="CORE STATUS"
            value={system}
            detail={mode === "LIVE" ? "REMOTE API LINK" : "LOCAL FALLBACK"}
            active={system === "ONLINE"}
          />

          <Telemetry
            label="THREAT SIGNAL"
            value={result ? `${riskScore}/100` : "—"}
            detail={anomaly}
            active={riskScore >= alertThreshold}
          />

          <Telemetry
            label="MODEL TRUST"
            value={result ? `${confidenceScore}%` : "—"}
            detail="INFERENCE CONFIDENCE"
            active={confidenceScore >= 80}
          />

          <Telemetry
            label="ALERT QUEUE"
            value={alerts.length}
            detail="ACTIVE SIGNALS"
            active={alerts.length > 0}
          />
        </section>

        <section className="command-grid" id="analysis">
          <aside className="controls glass">
            <div className="panel-title">
              <div>
                <span>CONTROL</span>
                <h2>Analysis Vector</h2>
              </div>

              <b>01</b>
            </div>

            <form onSubmit={runAnalysis}>
              <div className="coordinate-row">
                <Field
                  label="LAT"
                  name="latitude"
                  value={form.latitude}
                  onChange={updateForm}
                  type="number"
                  step="any"
                />

                <Field
                  label="LON"
                  name="longitude"
                  value={form.longitude}
                  onChange={updateForm}
                  type="number"
                  step="any"
                />
              </div>

              <div className="coordinate-row">
                <Field
                  label="DATE"
                  name="date"
                  value={form.date}
                  onChange={updateForm}
                  type="date"
                />

                <Field
                  label="TIME"
                  name="time"
                  value={form.time}
                  onChange={updateForm}
                  type="time"
                />
              </div>

              <label className="control-field">
                <span>SPATIAL RESOLUTION</span>

                <select
                  name="granularity"
                  value={form.granularity}
                  onChange={updateForm}
                >
                  <option value="100m">100m / HIGH DETAIL</option>
                  <option value="250m">250m / STANDARD</option>
                  <option value="500m">500m / BROAD FIELD</option>
                </select>
              </label>

              <label className="threshold-control">
                <div>
                  <span>ALERT THRESHOLD</span>
                  <strong>{alertThreshold}</strong>
                </div>

                <input
                  type="range"
                  min="20"
                  max="95"
                  value={alertThreshold}
                  onChange={(event) => setAlertThreshold(event.target.value)}
                />
              </label>

              <button className="execute" disabled={loading}>
                <span>
                  {loading ? "PROCESSING FIELD DATA" : "INITIALIZE ANALYSIS"}
                </span>

                <strong>→</strong>
              </button>
            </form>

            <div className="pipeline">
              <div className="pipeline-heading">PROCESS PIPELINE</div>

              <Pipeline number="01" title="Spatial Target" active />

              <Pipeline
                number="02"
                title="Thermal Acquisition"
                active={Boolean(result)}
              />

              <Pipeline
                number="03"
                title="AERION Inference"
                active={Boolean(result)}
              />

              <Pipeline
                number="04"
                title="Anomaly Detection"
                active={Boolean(result)}
              />

              <Pipeline
                number="05"
                title="Decision Signal"
                active={Boolean(result)}
              />
            </div>
          </aside>

          <section className="thermal-panel glass">
            <div className="panel-top">
              <div>
                <span className="panel-label">FIELD / THERMAL</span>

                <h2>Environmental Surface</h2>
              </div>

              <div className="map-status">
                <span />
                {result ? "OBSERVATION LOCKED" : "AWAITING SCAN"}
              </div>
            </div>

            <div className="thermal-map">
              <div className="terrain-lines" />

              <div className="map-coordinate top-left">{form.latitude}° N</div>

              <div className="map-coordinate bottom-right">
                {Math.abs(Number(form.longitude)).toFixed(4)}° W
              </div>

              <div className="map-grid-labels">
                <span>THERMAL FIELD</span>
                <span>SPATIAL MATRIX / {form.granularity}</span>
              </div>

              <div className="crosshair">
                <span />
                <span />
              </div>

              <div className="thermal-orb">
                <div className="orb-halo" />
                <div className="orb-ring" />

                <div className="orb-content">
                  <small>MEAN SURFACE</small>

                  <strong>
                    {average != null ? `${Number(average).toFixed(1)}°` : "—"}
                  </strong>

                  <span>CELSIUS</span>
                </div>
              </div>

              <div className="map-node node-one">
                <span>01</span>
              </div>

              <div className="map-node node-two">
                <span>02</span>
              </div>

              <div className="map-node node-three">
                <span>03</span>
              </div>

              <div className="map-node node-four">
                <span>04</span>
              </div>

              <div className="scan-line" />

              <div className="map-radar">
                <div />
              </div>
            </div>

            <div className="field-footer">
              <Metric
                label="SOURCE"
                value={mode === "LIVE" ? "FORTYGUARD" : "AERION CORE"}
              />

              <Metric
                label="ACTIVITY"
                value={activityId ? activityId.slice(0, 10).toUpperCase() : "—"}
              />

              <Metric
                label="STATUS"
                value={
                  result
                    ? result.fortyguard?.data?.status || "ANALYZED"
                    : "STANDBY"
                }
              />

              <Metric label="RESOLUTION" value={form.granularity} />
            </div>
          </section>
        </section>

        <section className="decision-banner glass">
          <div className="decision-icon">AI</div>

          <div>
            <span>DECISION ENGINE</span>
            <strong>
              {result ? recommendation : "Awaiting environmental observations."}
            </strong>
          </div>

          <button onClick={() => setShowAI(true)}>EXPLAIN SIGNAL →</button>
        </section>

        <section className="intelligence-section">
          <div className="section-heading">
            <div>
              <span>02 / AERION CORE</span>
              <h2>Decision Intelligence</h2>
            </div>

            <div className="engine">
              <span />
              {intelligence?.engine || "AERION Thermal Intelligence Engine"}
            </div>
          </div>

          <div className="intelligence-grid">
            <article className="risk-card glass">
              <div className="card-number">01</div>

              <div className="card-label">RISK INDEX</div>

              <div className="risk-main">
                <strong>{riskScore}</strong>
                <span>/100</span>
              </div>

              <div className="risk-track">
                <i
                  style={{
                    width: `${Math.min(riskScore, 100)}%`,
                  }}
                />
              </div>

              <div className="risk-bottom">
                <span>CLASSIFICATION</span>

                <b>{risk?.level || "UNKNOWN"}</b>
              </div>
            </article>

            <article className="confidence-card glass">
              <div className="card-number">02</div>

              <div className="card-label">MODEL CONFIDENCE</div>

              <div className="confidence-ring">
                <svg viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" className="ring-bg" />

                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    className="ring-progress"
                    style={{
                      strokeDashoffset: 314 - (314 * confidenceScore) / 100,
                    }}
                  />
                </svg>

                <div>
                  <strong>{confidenceScore}</strong>
                  <span>%</span>
                </div>
              </div>

              <p>
                {confidence?.interpretation ||
                  "Awaiting sufficient observations."}
              </p>
            </article>

            <article className="temperature-card glass">
              <div className="card-number">03</div>

              <div className="card-label">THERMAL PROFILE</div>

              <div className="temperature-main">
                <div>
                  <span>MIN</span>

                  <strong>
                    {minimum != null ? `${Number(minimum).toFixed(1)}°` : "—"}
                  </strong>
                </div>

                <div className="temperature-divider" />

                <div>
                  <span>MAX</span>

                  <strong>
                    {maximum != null ? `${Number(maximum).toFixed(1)}°` : "—"}
                  </strong>
                </div>
              </div>

              <div className="micro-chart">
                {fieldPoints.map((point, index) => (
                  <i
                    key={index}
                    style={{
                      height: `${Math.max(12, Math.min(100, point * 3.1))}%`,
                    }}
                  />
                ))}
              </div>
            </article>

            <article className="variability-card glass">
              <div className="card-number">04</div>

              <div className="card-label">FIELD VARIABILITY</div>

              <strong className="variability">
                {variability != null
                  ? `${Number(variability).toFixed(2)}°C`
                  : "—"}
              </strong>

              <p>
                Spatial thermal deviation observed across the analyzed surface.
              </p>

              <div className="sample-count">
                <span>OBSERVATIONS</span>

                <strong>{thermal?.samples ?? 0}</strong>
              </div>
            </article>
          </div>
        </section>

        <section className="advanced-grid">
          <article className="advanced-card glass">
            <div className="advanced-heading">
              <div>
                <span>03 / ANOMALY ENGINE</span>
                <h3>Signal Monitor</h3>
              </div>

              <b>{result ? "ACTIVE" : "IDLE"}</b>
            </div>

            <div className="anomaly-display">
              <div className="anomaly-pulse" />

              <div>
                <small>PRIMARY SIGNAL</small>
                <strong>{anomaly}</strong>
              </div>
            </div>

            <div className="signal-list">
              <Signal
                name="Thermal deviation"
                value={
                  variability != null
                    ? `${Number(variability).toFixed(2)}°C`
                    : "—"
                }
                state={variability > 5 ? "ELEVATED" : "NORMAL"}
              />

              <Signal
                name="Risk threshold"
                value={`${alertThreshold}`}
                state={riskScore >= alertThreshold ? "TRIGGERED" : "ARMED"}
              />

              <Signal
                name="Inference integrity"
                value={`${confidenceScore}%`}
                state={confidenceScore >= 80 ? "STABLE" : "REVIEW"}
              />
            </div>
          </article>

          <article className="advanced-card glass">
            <div className="advanced-heading">
              <div>
                <span>04 / ALERT SYSTEM</span>
                <h3>Adaptive Alarms</h3>
              </div>

              <b>{alerts.length} ACTIVE</b>
            </div>

            <div className="alert-summary">
              <strong>{alerts.length}</strong>

              <div>
                <span>ALERTS IN QUEUE</span>
                <p>
                  Automated threshold monitoring is continuously evaluating the
                  decision signal.
                </p>
              </div>
            </div>

            {alerts.length > 0 ? (
              <div className="alert-list">
                {alerts.slice(0, 3).map((alert) => (
                  <div className="alert-item" key={alert.id}>
                    <span>!</span>

                    <div>
                      <strong>{alert.title}</strong>
                      <p>{alert.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-alert">
                <span>✓</span>
                <div>
                  <strong>NO ACTIVE ALARMS</strong>
                  <p>
                    AERION has not detected a threshold breach in the current
                    session.
                  </p>
                </div>
              </div>
            )}

            {alerts.length > 0 && (
              <button className="clear-alerts" onClick={clearAlerts}>
                CLEAR ALERT QUEUE
              </button>
            )}
          </article>
        </section>

        <section className="footer-dashboard">
          <div>
            <span>LAST ANALYSIS</span>

            <strong>
              {lastRun ? lastRun.toLocaleTimeString() : "NO SESSION"}
            </strong>
          </div>

          <div>
            <span>LOCATION VECTOR</span>

            <strong>
              {form.latitude} / {form.longitude}
            </strong>
          </div>

          <div>
            <span>DATA PROVIDER</span>

            <strong>
              {mode === "LIVE" ? "FORTYGUARD" : "AERION LOCAL CORE"}
            </strong>
          </div>

          <div className="footer-buttons">
            <button onClick={() => setShowHistory(true)}>HISTORY</button>

            <button onClick={exportReport}>EXPORT</button>

            <button onClick={checkHealth}>REFRESH ↻</button>
          </div>
        </section>
      </main>

      {showAI && (
        <Modal
          title="AERION AI INSIGHT CENTER"
          subtitle="Decision explanation layer"
          onClose={() => setShowAI(false)}
        >
          <div className="ai-hero">
            <div className="ai-orb">AI</div>

            <div>
              <span>CURRENT ASSESSMENT</span>

              <strong>
                {result
                  ? generateAIHeadline(intelligence)
                  : "No active observation"}
              </strong>
            </div>
          </div>

          <div className="ai-grid">
            <Insight label="RISK" value={`${riskScore}/100`} />

            <Insight label="CONFIDENCE" value={`${confidenceScore}%`} />

            <Insight label="ANOMALY" value={anomaly} />

            <Insight label="MODE" value={mode} />
          </div>

          <div className="ai-explanation">
            <span>AI REASONING</span>

            <p>
              {result
                ? generateAIInsight(intelligence)
                : "Run an analysis to activate AERION's decision explanation layer."}
            </p>
          </div>

          <div className="recommendation">
            <span>RECOMMENDED ACTION</span>

            <strong>{recommendation}</strong>
          </div>
        </Modal>
      )}

      {showHistory && (
        <Modal
          title="ANALYSIS HISTORY"
          subtitle="Current analyst session"
          onClose={() => setShowHistory(false)}
        >
          {history.length === 0 ? (
            <div className="history-empty">No analyses recorded yet.</div>
          ) : (
            <div className="history-list">
              {history.map((item) => (
                <div className="history-item" key={item.id}>
                  <div>
                    <span>{item.mode} ANALYSIS</span>
                    <strong>{item.id}</strong>
                  </div>

                  <div>
                    <span>RISK</span>
                    <strong>{item.score}/100</strong>
                  </div>

                  <div>
                    <span>TEMP</span>
                    <strong>{item.temperature}°C</strong>
                  </div>

                  <div>
                    <span>LEVEL</span>
                    <strong>{item.level}</strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}

      {showSecurity && (
        <Modal
          title="SECURITY CENTER"
          subtitle="AERION analyst access"
          onClose={() => setShowSecurity(false)}
        >
          <div className="security-status">
            <div className="security-icon">✓</div>

            <div>
              <span>SESSION STATUS</span>

              <strong>
                {authenticated ? "AUTHENTICATED ANALYST" : "GUEST SESSION"}
              </strong>
            </div>
          </div>

          <div className="security-grid">
            <SecurityRow label="Session encryption" value="AES-256" />

            <SecurityRow label="API transport" value="HTTPS READY" />

            <SecurityRow
              label="Access layer"
              value={authenticated ? "VERIFIED" : "LIMITED"}
            />

            <SecurityRow label="Threat monitoring" value="ACTIVE" />
          </div>

          {!authenticated ? (
            <button className="modal-action" onClick={activateSession}>
              INITIALIZE ANALYST SESSION
            </button>
          ) : (
            <button className="modal-action danger" onClick={signOut}>
              TERMINATE SESSION
            </button>
          )}
        </Modal>
      )}

      {toast && (
        <div className="toast">
          <span>◆</span>
          {toast}
        </div>
      )}
    </div>
  );
}

function Field({ label, name, value, onChange, type, step }) {
  return (
    <label className="control-field">
      <span>{label}</span>

      <input
        name={name}
        value={value}
        onChange={onChange}
        type={type}
        step={step}
        required
      />
    </label>
  );
}

function Pipeline({ number, title, active }) {
  return (
    <div className={`pipeline-row ${active ? "active" : ""}`}>
      <div className="pipeline-circle">{active ? "✓" : number}</div>

      <div>
        <span>{number}</span>
        <strong>{title}</strong>
      </div>

      <small>{active ? "READY" : "WAIT"}</small>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Telemetry({ label, value, detail, active }) {
  return (
    <div className="telemetry-card glass">
      <div className="telemetry-label">{label}</div>

      <strong>{value}</strong>

      <div className={active ? "telemetry-detail active" : "telemetry-detail"}>
        <i />
        {detail}
      </div>
    </div>
  );
}

function Signal({ name, value, state }) {
  return (
    <div className="signal-row">
      <div>
        <span>{name}</span>
        <strong>{value}</strong>
      </div>

      <b>{state}</b>
    </div>
  );
}

function Insight({ label, value }) {
  return (
    <div className="insight">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function SecurityRow({ label, value }) {
  return (
    <div className="security-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Modal({ title, subtitle, onClose, children }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span>{subtitle}</span>
            <h2>{title}</h2>
          </div>

          <button onClick={onClose}>×</button>
        </div>

        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

function generateAIHeadline(intelligence) {
  const score = Number(intelligence?.risk?.score ?? 0);

  if (score >= 80) {
    return "Critical environmental signal detected.";
  }

  if (score >= 60) {
    return "Elevated environmental conditions require attention.";
  }

  return "Environmental conditions remain within the current envelope.";
}

function generateAIInsight(intelligence) {
  const score = Number(intelligence?.risk?.score ?? 0);

  const confidence = Number(intelligence?.confidence?.score ?? 0);

  const variability = Number(intelligence?.thermal?.variability_celsius ?? 0);

  if (score >= 80) {
    return `AERION identifies a high-priority thermal risk pattern with a ${confidence}% confidence level. The signal should be reviewed immediately and additional observations should be considered before operational decisions are made.`;
  }

  if (score >= 60) {
    return `AERION identifies an elevated environmental signal. The model reports ${confidence}% confidence, while measured spatial variability is ${variability.toFixed(2)}°C. Continued monitoring is recommended.`;
  }

  return `AERION currently identifies a controlled environmental pattern. Model confidence is ${confidence}%, with observed spatial variability of ${variability.toFixed(2)}°C. No immediate escalation is recommended.`;
}

export default App;
