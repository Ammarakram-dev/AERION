import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API = "http://127.0.0.1:8000";

const INITIAL_FORM = {
  latitude: "37.7749",
  longitude: "-122.4194",
  date: "2026-08-31",
  time: "11:00",
  granularity: "100m",
};

function App() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [system, setSystem] = useState("CONNECTING");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [activityId, setActivityId] = useState("");
  const [lastRun, setLastRun] = useState(null);

  useEffect(() => {
    checkHealth();
  }, []);

  async function checkHealth() {
    try {
      const response = await fetch(`${API}/api/health`);
      if (!response.ok) throw new Error();
      setSystem("ONLINE");
    } catch {
      setSystem("OFFLINE");
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
    setActivityId("");

    try {
      const response = await fetch(`${API}/api/intelligence`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          latitude: Number(form.latitude),
          longitude: Number(form.longitude),
          date: form.date,
          time: form.time,
          granularity: form.granularity,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : data.detail?.message || "Analysis request failed.",
        );
      }

      setResult(data);

      const id = data.activity_id || data.fortyguard?.data?.activity_id || "";

      setActivityId(id);
      setLastRun(new Date());
    } catch (err) {
      setError(err.message || "Unable to reach AERION.");
    } finally {
      setLoading(false);
    }
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
    const base = Number(average ?? 15);

    return Array.from({ length: 32 }, (_, index) => {
      const wave = Math.sin(index * 0.85) * 2.1 + Math.cos(index * 0.41) * 1.3;

      return Math.max(8, base + wave);
    });
  }, [average]);

  return (
    <div className="aerion-app">
      <div className="noise" />
      <div className="top-glow" />

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
              ENVIRONMENTAL INTELLIGENCE / 01
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
          <span>API 1.0.0</span>
        </div>
      </header>

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
              AERION converts environmental observations into a spatial
              intelligence layer for faster, clearer decisions.
            </p>
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
          </div>
        </section>

        <section className="command-grid">
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

              <Pipeline number="02" title="Thermal Acquisition" active />

              <Pipeline
                number="03"
                title="AERION Inference"
                active={Boolean(result)}
              />

              <Pipeline
                number="04"
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

              <div className="map-coordinate top-left">37°46′29.6″ N</div>

              <div className="map-coordinate bottom-right">122°25′10.0″ W</div>

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

              <div className="scan-line" />
            </div>

            <div className="field-footer">
              <Metric label="SOURCE" value="FORTYGUARD" />
              <Metric
                label="ACTIVITY"
                value={activityId ? activityId.slice(0, 8).toUpperCase() : "—"}
              />
              <Metric
                label="STATUS"
                value={result?.fortyguard?.data?.status || "STANDBY"}
              />
              <Metric label="RESOLUTION" value={form.granularity} />
            </div>
          </section>
        </section>

        {error && (
          <div className="error-box">
            <div className="error-symbol">!</div>
            <div>
              <strong>PIPELINE FAILURE</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

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
                      height: `${Math.max(12, Math.min(100, point * 4))}%`,
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
            <strong>FORTYGUARD</strong>
          </div>

          <button onClick={checkHealth}>
            REFRESH SYSTEM
            <span>↻</span>
          </button>
        </section>
      </main>
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

export default App;
