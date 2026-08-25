import { useState } from "react";
import "./App.css";
import { createTestNotification } from "./lib/supabase";

const navigationItems = [
  { label: "Overview", icon: "⌘" },
  { label: "Architecture", icon: "◇" },
  { label: "Delivery flow", icon: "↗" },
  { label: "Data model", icon: "▦" },
  { label: "Reliability", icon: "◌" },
];

const activity = [
  ["Password reset", "Email", "Delivered", "12:42:08"],
  ["Order #38429 shipped", "Push", "Delivered", "12:41:51"],
  ["Your verification code", "SMS", "Sent", "12:41:30"],
  ["Weekly product digest", "Email", "Queued", "12:40:12"],
];

const architectureDetails = {
  gateway: [
    "Notification API",
    "Authenticates internal services",
    "Creates a stable idempotency key per request.",
  ],
  orchestrator: [
    "Orchestrator",
    "Evaluates preferences, templates, and routing",
    "Writes an outbox event in the same transaction as the notification record.",
  ],
  queue: [
    "Priority queues",
    "Isolates real-time from bulk traffic",
    "Retries are scheduled with exponential backoff and jitter.",
  ],
  workers: [
    "Channel workers",
    "Provider adapters for Email, SMS & Push",
    "Each adapter is independently rate-limited and failover-aware.",
  ],
};

// The overview is the operational landing page.
function Overview({
  userName,
  onCompose,
  onNotify,
  onQueue,
  onActivity,
  onStatus,
}) {
  return (
    <div className="dashboard">
      <section className="dash-title">
        <div>
          <p className="eyebrow">OPERATIONS OVERVIEW</p>
          <h1>
            Hello, <em>{userName}.</em>
          </h1>
          <p>Here’s how your notification service is performing today.</p>
        </div>
        <div className="dash-actions">
          <button
            className="period"
            onClick={() => onNotify("Showing today’s operating window")}
          >
            Today <span>⌄</span>
          </button>
          <button className="new-notification" onClick={onCompose}>
            ＋ New notification
          </button>
        </div>
      </section>
      <section className="health-banner">
        <div className="pulse">
          <span />
          <span />
        </div>
        <div>
          <b>All systems operational</b>
          <p>
            All channels are delivering within their expected service level
            objectives.
          </p>
        </div>
        <button onClick={onStatus}>View status →</button>
      </section>
      <section className="stats-grid">
        {[
          ["Notifications sent", "1,284,590", "↑ 12.8%", "metric-green"],
          ["Delivery rate", "99.72%", "↑ 0.04%", "metric-green"],
          ["Avg. delivery time", "1.8s", "↓ 0.3s", "metric-green"],
          ["In retry queue", "284", "Requires attention", "metric-amber"],
        ].map(([label, value, change, kind]) => (
          <article className="stat-card" key={label}>
            <div className="stat-label">
              {label}
              <span className={`mini-dot ${kind}`} />
            </div>
            <strong>{value}</strong>
            <small className={kind}>{change}</small>
          </article>
        ))}
      </section>
      <section className="dashboard-main">
        <article className="delivery-chart card">
          <div className="card-heading">
            <div>
              <p className="eyebrow">THROUGHPUT</p>
              <h2>Delivery volume</h2>
            </div>
            <div className="legend">
              <span>
                <i className="legend-email" />
                Email
              </span>
              <span>
                <i className="legend-sms" />
                SMS
              </span>
              <span>
                <i className="legend-push" />
                Push
              </span>
            </div>
          </div>
          <div className="chart-scale">
            <span>100k</span>
            <span>75k</span>
            <span>50k</span>
            <span>25k</span>
            <span>0</span>
          </div>
          <div className="line-chart">
            <svg viewBox="0 0 690 170" preserveAspectRatio="none">
              <path
                className="grid"
                d="M0 12H690M0 53H690M0 94H690M0 135H690M0 169H690"
              />
              <path
                className="email-line"
                d="M0 130 C30 113,45 125,70 107 S115 115,140 86 S185 95,210 75 S255 89,280 57 S325 70,350 54 S395 73,420 39 S465 55,490 26 S535 49,560 43 S605 22,630 31 S665 16,690 19"
              />
              <path
                className="sms-line"
                d="M0 145 C30 141,45 149,70 135 S115 140,140 119 S185 132,210 110 S255 125,280 103 S325 113,350 96 S395 109,420 84 S465 95,490 75 S535 91,560 79 S605 64,630 72 S665 57,690 52"
              />
              <path
                className="push-line"
                d="M0 155 C35 147,42 157,70 143 S115 150,140 132 S185 144,210 119 S255 135,280 116 S325 130,350 104 S395 115,420 97 S465 109,490 90 S535 102,560 84 S605 94,630 70 S665 83,690 63"
              />
            </svg>
          </div>
          <div className="chart-labels">
            {["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "Now"].map(
              (x) => (
                <span key={x}>{x}</span>
              ),
            )}
          </div>
        </article>
        <article className="channel-card card">
          <div className="card-heading">
            <div>
              <p className="eyebrow">BY CHANNEL</p>
              <h2>Delivery health</h2>
            </div>
            <button className="dots">•••</button>
          </div>
          {[
            ["Email", "72.4%", "930,734", "99.8%", "email"],
            ["Push", "19.6%", "251,763", "99.5%", "push"],
            ["SMS", "8.0%", "102,093", "98.9%", "sms"],
          ].map(([name, share, count, rate, type]) => (
            <div className="channel-row" key={name}>
              <span className={`channel-icon ${type}`}>
                {type === "email" ? "✉" : type === "push" ? "♧" : "⌁"}
              </span>
              <div className="channel-meta">
                <b>{name}</b>
                <small>{count} sent</small>
              </div>
              <div className="channel-rate">
                <b>{rate}</b>
                <small>delivered</small>
              </div>
              <i style={{ "--p": share }} />
            </div>
          ))}
        </article>
      </section>
      <section className="dashboard-lower">
        <article className="activity card">
          <div className="card-heading">
            <div>
              <p className="eyebrow">LIVE ACTIVITY</p>
              <h2>Recent notifications</h2>
            </div>
            <button className="link-button" onClick={onActivity}>
              View all →
            </button>
          </div>
          <div className="table-head">
            <span>NOTIFICATION</span>
            <span>CHANNEL</span>
            <span>STATUS</span>
            <span>TIME</span>
          </div>
          {activity.map(([name, channel, status, time]) => (
            <div className="activity-row" key={name}>
              <b>{name}</b>
              <span>{channel}</span>
              <span className={`status ${status.toLowerCase()}`}>{status}</span>
              <time>{time}</time>
            </div>
          ))}
        </article>
        <article className="queue-card">
          <div>
            <p className="eyebrow">QUEUE PRESSURE</p>
            <h2>
              284 <span>pending retries</span>
            </h2>
            <p>Retry queue is below the 1,000 message alert threshold.</p>
          </div>
          <div className="queue-graphic">
            <div className="queue-ring">
              <b>28%</b>
              <span>capacity</span>
            </div>
          </div>
          <button onClick={onQueue}>
            Inspect queue <span>→</span>
          </button>
        </article>
      </section>
    </div>
  );
}

// Each stage represents the path a notification takes from request to provider delivery.
function DeliveryFlow({ onCompose, onNotify }) {
  const stages = [
    ["01", "REQUEST ACCEPTED", "Notification API", "12:42:08.014", "✓"],
    ["02", "PREFERENCES", "Consent & quiet hours", "12:42:08.019", "✓"],
    ["03", "ROUTED", "P0 transactional lane", "12:42:08.026", "✓"],
    ["04", "DELIVERED", "Email provider", "12:42:09.842", "✓"],
  ];
  return (
    <div className="dashboard">
      <section className="dash-title">
        <div>
          <p className="eyebrow">DELIVERY FLOW</p>
          <h1>
            Message <em>journey.</em>
          </h1>
          <p>Inspect every decision from acceptance to final delivery.</p>
        </div>
        <div className="dash-actions">
          <button
            className="period"
            onClick={() => onNotify("Showing last 24 hours")}
          >
            Last 24 hours <span>⌄</span>
          </button>
          <button className="new-notification" onClick={onCompose}>
            ＋ Send test
          </button>
        </div>
      </section>
      <section className="flow-kpis">
        <article>
          <span>ACCEPTED</span>
          <b>1,284,590</b>
          <small>100% of requests</small>
        </article>
        <i>→</i>
        <article>
          <span>FILTERED</span>
          <b>24,320</b>
          <small>1.89% preferences applied</small>
        </article>
        <i>→</i>
        <article>
          <span>DELIVERED</span>
          <b>1,256,963</b>
          <small>99.72% delivery rate</small>
        </article>
      </section>
      <section className="journey-card">
        <div className="journey-head">
          <div>
            <p className="eyebrow">TRACE # NT-9Q2M-4K7D</p>
            <h2>Password reset request</h2>
            <p>user_82f0a · Transactional · Email</p>
          </div>
          <span className="status delivered">DELIVERED</span>
        </div>
        <div className="journey-stages">
          {stages.map(([number, label, title, time, status], i) => (
            <div className="journey-stage" key={label}>
              <div className="stage-number">{number}</div>
              <div className="stage-line">{i < 3 && <i />}</div>
              <div>
                <small>{label}</small>
                <h3>{title}</h3>
                <p>{time}</p>
              </div>
              <b className="check">{status}</b>
            </div>
          ))}
        </div>
      </section>
      <section className="flow-bottom">
        <article className="card">
          <p className="eyebrow">PRIORITY LANES</p>
          <h2>Queue health</h2>
          {[
            ["P0", "Transactional", "0.4s", "9"],
            ["P1", "Standard", "4.2s", "71"],
            ["P2", "Bulk", "38.8s", "204"],
          ].map(([p, name, delay, count]) => (
            <div className="lane-row" key={p}>
              <span className={`priority ${p.toLowerCase()}`}>{p}</span>
              <b>{name}</b>
              <small>{delay} avg wait</small>
              <span>{count} pending</span>
            </div>
          ))}
        </article>
        <article className="card">
          <p className="eyebrow">FILTERED TODAY</p>
          <h2>Respecting choices</h2>
          <div className="filter-list">
            <div>
              <span>Quiet hours</span>
              <b>14,892</b>
              <i style={{ width: "72%" }} />
            </div>
            <div>
              <span>Channel opt-out</span>
              <b>7,316</b>
              <i style={{ width: "36%" }} />
            </div>
            <div>
              <span>Duplicate request</span>
              <b>2,112</b>
              <i style={{ width: "12%" }} />
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}
function Architecture({ onNotify }) {
  return (
    <div className="dashboard">
      <section className="dash-title">
        <div>
          <p className="eyebrow">ARCHITECTURE</p>
          <h1>System Architecture Overview</h1>
          <p>
            Explore the high‑level components and data flows of the notification
            service.
          </p>
        </div>
        <div className="dash-actions">
          <button
            className="period"
            onClick={() => onNotify("Viewing architecture")}
          >
            Architecture diagram
          </button>
        </div>
      </section>
      {/* Placeholder for diagram – in a real app this would be an SVG or canvas */}
      <div
        className="architecture-diagram"
        style={{
          height: "300px",
          background: "#f0f0f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span>Architecture diagram goes here</span>
      </div>
    </div>
  );
}

// Documents the persisted notification and delivery-attempt data model.
function DataModel({ onNotify }) {
  const fields = [
    ["notification_id", "UUID · PK", "Globally unique event identity"],
    ["idempotency_key", "TEXT · UNIQUE", "Caller-defined de-duplication scope"],
    ["user_id", "UUID · INDEX", "Preference & recipient lookup"],
    ["channel", "ENUM", "email | sms | push"],
    ["status", "ENUM", "accepted → delivered / failed"],
    ["scheduled_at", "TIMESTAMPTZ", "Quiet-hours aware delivery"],
  ];
  return (
    <div className="dashboard">
      <section className="dash-title">
        <div>
          <p className="eyebrow">DATA MODEL</p>
          <h1>
            Truth, made <em>durable.</em>
          </h1>
          <p>Every notification is an auditable, idempotent record.</p>
        </div>
        <div className="dash-actions">
          <button
            className="period"
            onClick={() => onNotify("Showing production schema")}
          >
            Production schema <span>⌄</span>
          </button>
        </div>
      </section>
      <section className="model-stats">
        {[
          ["14.2M", "notification records"],
          ["3", "regional shards"],
          ["30 days", "hot retention"],
          ["7 years", "event archive"],
        ].map(([a, b]) => (
          <div key={b}>
            <b>{a}</b>
            <span>{b}</span>
          </div>
        ))}
      </section>
      <section className="model-layout">
        <article className="table-card">
          <div className="table-title">
            <div>
              <span className="table-symbol">▦</span>
              <div>
                <p className="eyebrow">PRIMARY TABLE</p>
                <h2>notifications</h2>
              </div>
            </div>
          </div>
          <span className="table-pill">PostgreSQL</span>
          {fields.map(([field, type, desc]) => (
            <div className="field-row" key={field}>
              <div>
                <b>{field}</b>
                <span>{desc}</span>
              </div>
              <code>{type}</code>
            </div>
          ))}
        </article>
        <article className="model-side">
          <div className="card">
            <p className="eyebrow">RELATIONSHIPS</p>
            <h2>
              One record,
              <br />
              complete context.
            </h2>
            <div className="relationship">
              <span>notifications</span>
              <i>1 : N</i>
              <span>delivery_attempts</span>
              <i>1 : N</i>
              <span>status_events</span>
            </div>
          </div>
          <div className="card">
            <p className="eyebrow">DATA SAFETY</p>
            <div className="safety-item">
              <b>Idempotency constraint</b>
              <span>user + key + 24h window</span>
            </div>
            <div className="safety-item">
              <b>PII envelope encryption</b>
              <span>AES-256 at rest</span>
            </div>
            <div className="safety-item">
              <b>Event history</b>
              <span>Append-only stream</span>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}
function Reliability() {
  return (
    <div className="dashboard">
      <section className="dash-title">
        <div>
          <p className="eyebrow">RELIABILITY</p>
          <h1>
            Prepared for <em>failure.</em>
          </h1>
          <p>Reliability controls that keep every important message moving.</p>
        </div>
        <div className="dash-actions">
          <button className="period">
            Last 30 days <span>⌄</span>
          </button>
        </div>
      </section>
      <section className="slo-grid">
        {[
          ["99.99%", "Availability SLO", "✓ On target"],
          ["1.8s", "P95 delivery time", "✓ Under 5s target"],
          ["0", "Lost notifications", "✓ Guaranteed"],
          ["99.72%", "Provider success rate", "! Watch SMS"],
        ].map(([value, label, state]) => (
          <article key={label}>
            <b>{value}</b>
            <span>{label}</span>
            <small>{state}</small>
          </article>
        ))}
      </section>
      <section className="reliability-layout">
        <article className="card controls">
          <p className="eyebrow">RESILIENCE CONTROLS</p>
          <h2>Every failure has a path.</h2>
          {[
            [
              "01",
              "Transactional outbox",
              "Safely replays events that were committed but not published.",
              "healthy",
            ],
            [
              "02",
              "Idempotent workers",
              "Duplicate queue deliveries result in a single provider request.",
              "healthy",
            ],
            [
              "03",
              "Circuit breakers",
              "Isolates failing providers before they cascade.",
              "healthy",
            ],
            [
              "04",
              "Provider failover",
              "Routes to a secondary vendor after timeout or 5xx.",
              "watch",
            ],
          ].map(([n, title, text, state]) => (
            <div className="control-row" key={n}>
              <span>{n}</span>
              <div>
                <b>{title}</b>
                <p>{text}</p>
              </div>
              <i className={state} />
            </div>
          ))}
        </article>
        <article className="incident-card">
          <p className="eyebrow">RECOVERY READINESS</p>
          <h2>4m 12s</h2>
          <span>last failover recovery</span>
          <div className="recovery-bars">
            {[50, 65, 42, 72, 56, 93, 68, 54, 61, 77, 43, 70].map((h, i) => (
              <i key={i} style={{ height: `${h}%` }} />
            ))}
          </div>
          <div className="recovery-foot">
            <span>Target RTO: &lt; 5 min</span>
            <b>Met</b>
          </div>
        </article>
      </section>
      <section className="provider-card card">
        <div>
          <p className="eyebrow">PROVIDER STATUS</p>
          <h2>Active delivery partners</h2>
        </div>
        {[
          ["Email", "Mailgrid", "99.98%", "normal"],
          ["SMS", "Telco Connect", "98.91%", "warning"],
          ["Push", "Cloud Notify", "99.99%", "normal"],
        ].map(([channel, vendor, rate, state]) => (
          <div className="provider-row" key={channel}>
            <span className={`provider-light ${state}`} />
            <b>{channel}</b>
            <span>{vendor}</span>
            <strong>{rate}</strong>
            <small>success rate</small>
          </div>
        ))}
      </section>
    </div>
  );
}
function ExportBrief({ close }) {
  const [scope, setScope] = useState("Full system design");
  const [format, setFormat] = useState("Markdown");
  const exportBrief = () => {
    const brief = `# Notification Service — System Design Brief\n\nGenerated: ${new Date().toLocaleDateString()}\nScope: ${scope}\n\n## Objective\nReliable multi-channel notification delivery for millions of users across email, SMS and push.\n\n## Scale & service levels\n- 10M notifications/day; expected peak: 15K notifications/second\n- Transactional P0 target: accepted-to-provider under 5 seconds\n- Availability SLO: 99.99%; P95 delivery time: 1.8 seconds\n\n## Architecture\nInternal services call the Notification API with an idempotency key. The orchestrator evaluates preferences and quiet hours, persists a notification and transactional-outbox event, then routes work to P0/P1/P2 priority queues. Channel workers rate-limit calls and fail over across email, SMS, and push providers. Provider webhooks append final delivery status.\n\n## Delivery guarantees\n- At-least-once processing, safe through unique idempotency keys and provider request IDs\n- Transactional outbox prevents loss between database commit and queue publication\n- Preference, opt-out, and quiet-hour checks execute before send\n- Circuit breakers, exponential backoff, jitter, DLQ, and provider failover handle vendor failure\n\n## Data model\nnotifications(notification_id, idempotency_key, user_id, channel, status, scheduled_at); delivery_attempts and status_events preserve append-only history.\n\n## Current operational snapshot\n- 1,284,590 notifications sent today\n- 99.72% delivery rate\n- 284 retry-queue messages; below alert threshold\n`;
    const blob = new Blob([brief], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "notification-service-brief.md";
    link.click();
    URL.revokeObjectURL(url);
    close();
  };
  return (
    <div className="export-backdrop" role="dialog" aria-modal="true">
      <div className="export-modal">
        <button className="close-export" onClick={close}>
          ×
        </button>
        <div className="export-title">
          <p className="eyebrow">SHAREABLE DOCUMENT</p>
          <h2>Export system brief</h2>
          <p>Package the current notification service design for your team.</p>
        </div>
        <div className="export-options">
          <div>
            <span>INCLUDE</span>
            {[
              "Full system design",
              "Architecture only",
              "Operations snapshot",
            ].map((item) => (
              <button
                key={item}
                onClick={() => setScope(item)}
                className={
                  scope === item
                    ? "export-choice active-choice"
                    : "export-choice"
                }
              >
                <i>{scope === item ? "✓" : ""}</i>
                {item}
              </button>
            ))}
          </div>
          <div>
            <span>FORMAT</span>
            {["Markdown", "Print-ready PDF"].map((item) => (
              <button
                key={item}
                onClick={() => setFormat(item)}
                className={
                  format === item
                    ? "export-choice active-choice"
                    : "export-choice"
                }
              >
                <i>{format === item ? "✓" : ""}</i>
                {item}
              </button>
            ))}
          </div>
        </div>
        <div className="brief-preview">
          <div>
            <span className="preview-doc">▤</span>
            <b>
              notification-service-brief.{format === "Markdown" ? "md" : "pdf"}
            </b>
          </div>
          <small>
            Includes objectives, scale assumptions, architecture, guarantees,
            and data model.
          </small>
        </div>
        <div className="export-footer">
          <button onClick={close} className="cancel-export">
            Cancel
          </button>
          <button onClick={exportBrief} className="download-export">
            ↓ Download brief
          </button>
        </div>
      </div>
    </div>
  );
}
function DetailPanel({ type, close }) {
  const isQueue = type === "queue";
  const isStatus = type === "status";
  const title = isQueue
    ? "Retry queue inspector"
    : isStatus
      ? "Service status"
      : "Notification activity";
  const queueRows = [
    ["retry.email", "184", "4m 12s", "Healthy"],
    ["retry.sms", "91", "2m 48s", "Watching"],
    ["retry.push", "9", "0m 31s", "Healthy"],
  ];
  return (
    <div className="export-backdrop" role="dialog" aria-modal="true">
      <div className="detail-modal">
        <button className="close-export" onClick={close}>
          ×
        </button>
        <div className="export-title">
          <p className="eyebrow">
            {isQueue
              ? "LIVE QUEUE TELEMETRY"
              : isStatus
                ? "PLATFORM STATUS"
                : "EVENT STREAM"}
          </p>
          <h2>{title}</h2>
          <p>
            {isQueue
              ? "Current retry work by channel, refreshed just now."
              : isStatus
                ? "All service dependencies are reporting normally."
                : "Most recent delivery decisions across all channels."}
          </p>
        </div>
        {isQueue ? (
          <div className="detail-content">
            <div className="queue-summary">
              <b>284</b>
              <span>messages awaiting retry</span>
              <small>28% of alert threshold</small>
            </div>
            <div className="detail-table">
              <div className="detail-head">
                <span>QUEUE</span>
                <span>PENDING</span>
                <span>OLDEST</span>
                <span>STATE</span>
              </div>
              {queueRows.map(([name, pending, age, state]) => (
                <div className="detail-row" key={name}>
                  <b>{name}</b>
                  <span>{pending}</span>
                  <span>{age}</span>
                  <span
                    className={`status ${state === "Watching" ? "sent" : "delivered"}`}
                  >
                    {state}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : isStatus ? (
          <div className="detail-content status-list">
            {[
              ["Notification API", "Operational", "12ms"],
              ["Queue cluster", "Operational", "18ms"],
              ["Email provider", "Operational", "420ms"],
              ["SMS provider", "Degraded", "1.2s"],
              ["Push provider", "Operational", "110ms"],
            ].map(([name, state, latency]) => (
              <div key={name}>
                <span
                  className={
                    state === "Degraded" ? "warning-light" : "ok-light"
                  }
                />
                <b>{name}</b>
                <span
                  className={
                    state === "Degraded" ? "status sent" : "status delivered"
                  }
                >
                  {state}
                </span>
                <small>{latency}</small>
              </div>
            ))}
          </div>
        ) : (
          <div className="detail-content activity-full">
            {[
              ...activity,
              ["Payment receipt", "Email", "Delivered", "12:39:44"],
              ["Security alert", "Push", "Delivered", "12:38:09"],
            ].map(([name, channel, status, time]) => (
              <div className="activity-row" key={name}>
                <b>{name}</b>
                <span>{channel}</span>
                <span className={`status ${status.toLowerCase()}`}>
                  {status}
                </span>
                <time>{time}</time>
              </div>
            ))}
          </div>
        )}
        <div className="export-footer">
          <button onClick={close} className="download-export">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
function Composer({ close, onNotify }) {
  const [channel, setChannel] = useState("Email");
  const [trafficClass, setTrafficClass] = useState("transactional");
  const [message, setMessage] = useState("Your verification code is 482913.");
  const [recipient, setRecipient] = useState("test.user@example.com");
  const [sending, setSending] = useState(false);
  const send = async () => {
    setSending(true);
    const { error } = await createTestNotification({
      channel: channel.toLowerCase(),
      recipient,
      body: message,
      trafficClass,
    });
    setSending(false);
    if (error && !error.message.includes("not configured")) {
      onNotify(`Unable to queue test: ${error.message}`);
      return;
    }
    onNotify(
      error
        ? `Demo ${channel.toLowerCase()} queued — connect Supabase to persist it`
        : `Test ${channel.toLowerCase()} saved to Supabase and queued`,
    );
    close();
  };
  return (
    <div className="export-backdrop" role="dialog" aria-modal="true">
      <div className="composer-modal">
        <button className="close-export" onClick={close}>
          ×
        </button>
        <div className="export-title">
          <p className="eyebrow">TEST NOTIFICATION</p>
          <h2>Create a notification</h2>
          <p>Send a test message through the selected delivery channel.</p>
        </div>
        <div className="composer-fields">
          <label>
            TRAFFIC CLASS
            <select
              value={trafficClass}
              onChange={(e) => setTrafficClass(e.target.value)}
            >
              <option value="transactional">
                Transactional — high priority
              </option>
              <option value="bulk">Bulk — lower priority</option>
            </select>
          </label>
          <label>
            CHANNEL
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
            >
              <option>Email</option>
              <option>SMS</option>
              <option>Push</option>
            </select>
          </label>
          <label>
            RECIPIENT
            <input
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
          </label>
          <label>
            MESSAGE
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </label>
        </div>
        <div className="export-footer">
          <button onClick={close} className="cancel-export">
            Cancel
          </button>
          <button onClick={send} className="download-export" disabled={sending}>
            {sending ? "Queueing…" : "Send test →"}
          </button>
        </div>
      </div>
    </div>
  );
}
function App() {
  const [active, setActive] = useState("Overview");
  const [lane, setLane] = useState("Transactional");
  const [selected, setSelected] = useState("orchestrator");
  const [exportOpen, setExportOpen] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [detailPanel, setDetailPanel] = useState("");
  const [toast, setToast] = useState("");
  const notify = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3200);
  };
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">N</div>
          <span>
            notify<span className="brand-dot">.</span>
          </span>
        </div>
        <p className="eyebrow sidebar-label">SYSTEM DESIGN</p>
        <nav>
          {navigationItems.map(({ label, icon }) => (
            <button
              key={label}
              onClick={() => setActive(label)}
              className={active === label ? "nav-item active" : "nav-item"}
            >
              <span>{icon}</span>
              {label}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="availability">
            <span className="status-dot" />
            All systems operational
          </div>
          <p>v1.0 · August 2026</p>
        </div>
      </aside>
      <main>
        <header className="topbar">
          <div className="crumbs">
            Platform <span>/</span> System designs <span>/</span>{" "}
            <b>Notification service</b>
          </div>
          <button className="export" onClick={() => setExportOpen(true)}>
            ↧ &nbsp; Export brief
          </button>
        </header>
        {active === "Overview" ? (
          <Overview
            userName="there"
            onCompose={() => setComposerOpen(true)}
            onNotify={notify}
            onQueue={() => setDetailPanel("queue")}
            onActivity={() => setDetailPanel("activity")}
            onStatus={() => setDetailPanel("status")}
          />
        ) : active === "Delivery flow" ? (
          <DeliveryFlow
            onCompose={() => setComposerOpen(true)}
            onNotify={notify}
          />
        ) : active === "Data model" ? (
          <DataModel onNotify={notify} />
        ) : active === "Reliability" ? (
          <Reliability />
        ) : active === "Architecture" ? (
          <Architecture onNotify={notify} />
        ) : (
          <div className="content">
            <section className="hero">
              <div>
                <p className="eyebrow">SYSTEM DESIGN · 01</p>
                <h1>
                  Notification
                  <br />
                  <em>Service.</em>
                </h1>
                <p className="hero-copy">
                  A dependable communications layer for every customer moment —
                  from password resets to campaigns at planetary scale.
                </p>
              </div>
              <div className="hero-card">
                <div className="card-head">
                  <span>Daily throughput</span>
                  <span className="trend">↑ 99.99% target</span>
                </div>
                <div className="metric">
                  10M<span>/day</span>
                </div>
                <div className="bars">
                  {[25, 39, 31, 62, 46, 78, 59, 92, 72, 88, 68, 48].map(
                    (n, i) => (
                      <i key={i} style={{ height: `${n}%` }} />
                    ),
                  )}
                </div>
                <div className="card-foot">
                  <span>Avg. 116/sec</span>
                  <span>Peak 15K/sec</span>
                </div>
              </div>
            </section>
            <section className="principles">
              <div>
                <p className="eyebrow">DESIGN PRINCIPLES</p>
                <h2>
                  Built for the message
                  <br />
                  that can’t be missed.
                </h2>
              </div>
              <div className="principle-grid">
                {[
                  [
                    "◎",
                    "Once, exactly",
                    "At-least-once processing, made safe by idempotency keys at every boundary.",
                  ],
                  [
                    "↯",
                    "Urgency wins",
                    "Dedicated priority lanes keep transactional messages near real-time.",
                  ],
                  [
                    "♧",
                    "Choice first",
                    "Preference checks and quiet hours are evaluated before each send.",
                  ],
                ].map(([icon, title, text]) => (
                  <article key={title}>
                    <span className="icon">{icon}</span>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </article>
                ))}
              </div>
            </section>
            <section className="architecture">
              <div className="section-row">
                <div>
                  <p className="eyebrow">THE SYSTEM</p>
                  <h2>
                    One event. The right
                    <br />
                    message. Every time.
                  </h2>
                </div>
                <p className="section-copy">
                  A durable event pipeline separates acceptance from delivery,
                  protecting callers from provider latency while preserving a
                  full audit trail.
                </p>
              </div>
              <div className="diagram-wrap">
                <div className="diagram-label">
                  CLICK A COMPONENT TO INSPECT
                </div>
                <div className="diagram">
                  <button
                    className={`node ${selected === "gateway" ? "chosen" : ""}`}
                    onClick={() => setSelected("gateway")}
                  >
                    <b>Internal services</b>
                    <span>Orders · Identity · Billing</span>
                  </button>
                  <div className="arrow">→</div>
                  {[
                    [
                      "orchestrator",
                      "✦",
                      "Notification API",
                      "Idempotency + outbox",
                    ],
                    [
                      "orchestrator",
                      "◈",
                      "Orchestrator",
                      "Preference + routing",
                    ],
                    ["queue", "≋", "Priority queues", "Txn · Standard · Bulk"],
                    ["workers", "↗", "Channel workers", "Email · SMS · Push"],
                  ].map(([id, icon, title, small], i) => (
                    <div className="node-unit" key={title}>
                      <button
                        className={`node ${i < 2 ? "primary" : ""} ${selected === id ? "chosen" : ""}`}
                        onClick={() => setSelected(id)}
                      >
                        <span className="node-icon">{icon}</span>
                        <b>{title}</b>
                        <small>{small}</small>
                      </button>
                      {i < 3 && <div className="arrow">→</div>}
                    </div>
                  ))}
                </div>
                <div className="inspect">
                  <span className="inspect-dot" />
                  <div>
                    <b>{architectureDetails[selected][0]}</b>
                    <p>
                      {architectureDetails[selected][1]}{" "}
                      <span>— {architectureDetails[selected][2]}</span>
                    </p>
                  </div>
                </div>
              </div>
            </section>
            <section className="flow-section">
              <div className="section-row">
                <div>
                  <p className="eyebrow">DELIVERY FLOW</p>
                  <h2>
                    Prioritize what
                    <br />
                    matters most.
                  </h2>
                </div>
                <div className="tabs">
                  <button
                    onClick={() => setLane("Transactional")}
                    className={
                      lane === "Transactional" ? "tab active-tab" : "tab"
                    }
                  >
                    Transactional
                  </button>
                  <button
                    onClick={() => setLane("Bulk")}
                    className={lane === "Bulk" ? "tab active-tab" : "tab"}
                  >
                    Bulk campaign
                  </button>
                </div>
              </div>
              <div className="flow-card">
                <div className="lane-head">
                  <span
                    className={lane === "Transactional" ? "tag pink" : "tag"}
                  >
                    {lane === "Transactional"
                      ? "P0 · NEAR REAL-TIME"
                      : "P2 · BEST EFFORT"}
                  </span>
                  <h3>
                    {lane === "Transactional"
                      ? "Password reset request"
                      : "Summer collection announcement"}
                  </h3>
                  <p>
                    {lane === "Transactional"
                      ? "Target: accepted-to-provider in under 5 seconds."
                      : "Target: complete within campaign send window; rate-limited per provider."}
                  </p>
                </div>
                <div className="flow-steps">
                  {(lane === "Transactional"
                    ? [
                        ["01", "API accepts", "Idempotency key"],
                        ["02", "Preference check", "Transactional allowed"],
                        ["03", "P0 queue", "Reserved capacity"],
                        ["04", "Provider send", "Failover on error"],
                      ]
                    : [
                        ["01", "API accepts", "Audience reference"],
                        ["02", "Audience expansion", "Preference filtering"],
                        ["03", "P2 queue", "Throttle aware"],
                        ["04", "Provider send", "Batched delivery"],
                      ]
                  ).map(([num, title, text], i) => (
                    <div className="flow-step" key={title}>
                      <span>{num}</span>
                      <div>
                        <b>{title}</b>
                        <small>{text}</small>
                      </div>
                      {i < 3 && <i>→</i>}
                    </div>
                  ))}
                </div>
              </div>
            </section>
            <section className="reliability">
              <div>
                <p className="eyebrow">RELIABILITY BY DESIGN</p>
                <h2>
                  Failure is a<br />
                  first-class input.
                </h2>
                <p className="section-copy left">
                  The system never assumes providers are available, responsive,
                  or correct.
                </p>
              </div>
              <div className="reliability-list">
                {[
                  [
                    "01",
                    "Transactional outbox",
                    "Notification record and queue event commit atomically. A relay safely replays unpublished events.",
                  ],
                  [
                    "02",
                    "Idempotent delivery",
                    "Unique notification key + provider request ID prevents duplicate sends across retries and crashes.",
                  ],
                  [
                    "03",
                    "Adaptive provider control",
                    "Per-provider circuit breakers, quotas, retries and automatic secondary-provider failover.",
                  ],
                ].map(([n, t, p]) => (
                  <article key={n}>
                    <span>{n}</span>
                    <div>
                      <h3>{t}</h3>
                      <p>{p}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
            <section className="data-section">
              <p className="eyebrow">STATE & OBSERVABILITY</p>
              <h2>The record of truth.</h2>
              <div className="data-grid">
                <div className="schema">
                  <div className="schema-title">
                    <b>notifications</b>
                    <span>PostgreSQL / sharded</span>
                  </div>
                  {[
                    "notification_id  UUID  PK",
                    "idempotency_key  TEXT  UNIQUE",
                    "user_id  UUID",
                    "channel  ENUM",
                    "status  ENUM",
                    "scheduled_at  TIMESTAMP",
                  ].map((v) => (
                    <code key={v}>{v}</code>
                  ))}
                </div>
                <div className="statuses">
                  <h3>Delivery lifecycle</h3>
                  <div>
                    <span className="state accepted">ACCEPTED</span>
                    <i>→</i>
                    <span className="state queued">QUEUED</span>
                    <i>→</i>
                    <span className="state sent">SENT</span>
                    <i>→</i>
                    <span className="state delivered">DELIVERED</span>
                  </div>
                  <p>
                    Provider webhooks update final state. Every transition is
                    appended to an immutable event history.
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}
        {exportOpen && <ExportBrief close={() => setExportOpen(false)} />}{" "}
        {composerOpen && (
          <Composer close={() => setComposerOpen(false)} onNotify={notify} />
        )}{" "}
        {detailPanel && (
          <DetailPanel type={detailPanel} close={() => setDetailPanel("")} />
        )}{" "}
        {toast && (
          <div className="toast">
            <span>✓</span>
            {toast}
          </div>
        )}
        <footer>
          NOTIFICATION SERVICE &nbsp;·&nbsp; INTERNAL PLATFORM DESIGN
          &nbsp;·&nbsp; CONFIDENTIAL
        </footer>
      </main>
    </div>
  );
}
export default App;
