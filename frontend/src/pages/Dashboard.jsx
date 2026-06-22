import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart,
  Area,
} from "recharts";

/* ═══════════════════════════════════════
   THEME  — forest-green / navy
   ═══════════════════════════════════════ */
const C = {
  pageBg:     "linear-gradient(135deg,#1a3d28 0%,#0e2233 55%,#071a2e 100%)",
  navBg:      "rgba(12,35,22,0.97)",
  navBorder:  "rgba(34,197,94,0.20)",
  card:       "rgba(255,255,255,0.95)",
  cardBorder: "rgba(0,0,0,0.09)",
  cardShadow: "0 4px 28px rgba(0,0,0,0.20)",
  cardTitle:  "#111827",
  cardMuted:  "#6b7280",
  pageMuted:  "#86efac",
  green:      "#22c55e",
  greenDark:  "#16a34a",
  greenGlow:  "rgba(34,197,94,0.28)",
  teal:       "#14b8a6",
  blue:       "#3b82f6",
  amber:      "#f59e0b",
  red:        "#ef4444",
  redBg:      "rgba(239,68,68,0.07)",
  redBorder:  "rgba(239,68,68,0.25)",
  chartGrid:  "#e5e7eb",
  chartAxis:  "#9ca3af",
};

/* helpers */
const fmt = (v, dp = 2) => {
  if (v == null || isNaN(Number(v))) return "–";
  const n = Number(v);
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(dp) + " M";
  if (Math.abs(n) >= 1_000)     return (n / 1_000).toFixed(dp)     + " k";
  return n.toFixed(dp);
};
const safeSum = (a) => (a ?? []).reduce((s, v) => s + (v ?? 0), 0);
const safeMax = (a) => { const f = (a ?? []).filter(v => v != null); return f.length ? Math.max(...f) : 0; };
const safeMin = (a) => { const f = (a ?? []).filter(v => v != null); return f.length ? Math.min(...f) : 0; };
const unitOf  = (t) => t === "water" ? "L" : "kWh";
const MONTHS  = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

/* white card */
function Card({ children, style = {} }) {
  return (
    <div style={{
      background:   C.card,
      borderRadius: 14,
      border:       `1px solid ${C.cardBorder}`,
      boxShadow:    C.cardShadow,
      ...style,
    }}>
      {children}
    </div>
  );
}

const TIP = {
  background:   "#fff",
  border:       `1px solid ${C.cardBorder}`,
  borderRadius: 10,
  boxShadow:    "0 4px 20px rgba(0,0,0,0.12)",
  padding:      "10px 14px",
  fontSize:     13,
  color:        C.cardTitle,
};

/* ═══════════════════════════════════════
   NAVBAR
   NOTE: zIndex kept at 10 (not 40/50+).
   Higher values create a stacking context
   that would trap the sidebar behind it.
   The sidebar in Layout uses z-[90] (fixed,
   document-level) so it always wins over
   any stacking context inside page content.
   ═══════════════════════════════════════ */
function Navbar({ resourceType, setResourceType, selectedMonth, setSelectedMonth,
                  selectedUtility, setSelectedUtility, loading, onRefresh }) {
  const sel = {
    background:   "rgba(255,255,255,0.10)",
    border:       "1px solid rgba(255,255,255,0.18)",
    borderRadius: 8, color:"#fff",
    padding:      "7px 14px", fontSize:13,
    fontWeight:   500, outline:"none", cursor:"pointer",
  };

  return (
    <div style={{
      background:           C.navBg,
      borderBottom:         `1px solid ${C.navBorder}`,
      backdropFilter:       "blur(18px)",
      WebkitBackdropFilter: "blur(18px)",
      padding:              "0 28px",
      height:               64,
      display:              "flex",
      alignItems:           "center",
      justifyContent:       "space-between",
      position:             "sticky",
      top:                  0,
      /*
       * ── KEY FIX ──────────────────────────────────────────────────
       * DO NOT set zIndex higher than the sidebar (z-[90] = 90).
       * A sticky element with zIndex creates a stacking context —
       * any fixed children of Layout that have z-index < this value
       * will appear BEHIND this navbar.
       *
       * The sidebar is fixed at the document root level (not a child
       * of this navbar), so z-index: 10 here is safe: the navbar
       * stays above page scroll content but never beats the sidebar.
       * ─────────────────────────────────────────────────────────────
       */
      zIndex: 10,
      /* leave space for hamburger button (fixed, top-left, 60px wide) */
      paddingLeft: 80,
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:14 }}>
        <div style={{
          width:44, height:44, borderRadius:12, flexShrink:0,
          background:`linear-gradient(135deg,${C.green},${C.teal})`,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:20, boxShadow:`0 0 16px ${C.greenGlow}`,
        }}>⚡</div>
        <div>
          <div style={{ color:"#fff", fontWeight:700, fontSize:15 }}>Analytics Dashboard</div>
          <div style={{ color:C.pageMuted, fontSize:11 }}>Real-time Energy &amp; Water Monitoring</div>
        </div>
      </div>

      <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
        <div style={{ display:"flex", background:"rgba(255,255,255,0.08)", borderRadius:10, padding:3, gap:3 }}>
          {["energy","water"].map(t => (
            <button key={t} onClick={() => setResourceType(t)} style={{
              padding:"6px 16px", borderRadius:8, border:"none",
              fontSize:12, fontWeight:600, cursor:"pointer", transition:"all 0.18s",
              background: resourceType===t ? C.green : "transparent",
              color:       resourceType===t ? "#052e0a" : "#aaa",
            }}>
              {t === "energy" ? "⚡ Energy" : "💧 Water"}
            </button>
          ))}
        </div>

        <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))} style={sel}>
          <option value={0}>All Months</option>
          {MONTHS.map((m,i) => <option key={m} value={i+1}>{m}</option>)}
        </select>

        <select value={selectedUtility} onChange={e => setSelectedUtility(e.target.value)} style={sel}>
          <option value="">All Utilities</option>
          <option value="solar panels">Solar Panels</option>
          <option value="backup diesel generator">Backup Diesel Generator</option>
          <option value="borewell pump">Borewell Pump</option>
        </select>

        <button onClick={onRefresh} style={{
          background: C.green, color:"#052e0a", border:"none",
          borderRadius:8, padding:"8px 18px", fontSize:13, fontWeight:700,
          cursor:"pointer", boxShadow:`0 0 12px ${C.greenGlow}`,
          opacity: loading ? 0.65 : 1, transition:"opacity 0.2s", flexShrink:0,
        }}>
          {loading ? "Loading…" : "Refresh Data"}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   SUMMARY CARDS
   ═══════════════════════════════════════ */
function SummaryCards({ data, resourceType, dynamicAlerts }) {
  const u         = unitOf(resourceType);
  const actual    = data?.actual      ?? [];
  const predicted = (data?.predictions ?? []).filter(Boolean);
  const anomalies = dynamicAlerts?.length ?? 0;

  const cards = [
    {
      label: "TOTAL PREDICTED",
      value: `${fmt(safeSum(predicted))} ${u}`,
      icon: "📈",
      iconBg: "rgba(59,130,246,0.15)",
      iconColor: C.blue
    },
    {
      label: "MAX CONSUMPTION",
      value: `${fmt(safeMax(actual))} ${u}`,
      icon: "↑",
      iconBg: "rgba(34,197,94,0.15)",
      iconColor: C.greenDark
    },
    {
      label: "MIN CONSUMPTION",
      value: `${fmt(safeMin(actual))} ${u}`,
      icon: "↓",
      iconBg: "rgba(59,130,246,0.15)",
      iconColor: C.blue
    },
    {
      label: "ANOMALIES DETECTED",
      value: `${anomalies} alerts`,
      icon: "⚠",
      iconBg: "rgba(239,68,68,0.15)",
      iconColor: C.red
    },
  ];

  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16 }}>
      {cards.map(c => (
        <Card key={c.label} style={{ padding:"18px 24px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
            <div style={{
              width: 24, height: 24, borderRadius: 6, background: c.iconBg, color: c.iconColor,
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:"bold"
            }}>
              {c.icon}
            </div>
            <div style={{ color:C.cardMuted, fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em" }}>
              {c.label}
            </div>
          </div>
          <div style={{ color:C.cardTitle, fontSize:26, fontWeight:800, letterSpacing:"-0.02em" }}>
            {c.value.split(" ")[0]} <span style={{ fontSize:14, color:C.cardMuted, fontWeight:600 }}>{c.value.split(" ")[1] ?? ""}</span>
          </div>
        </Card>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════
   GRAPH 1 — Forecast (SVR)
   ═══════════════════════════════════════ */
function PredictionGraph({ data, resourceType, selectedMonth, forecastDays, setForecastDays }) {
  const [svrDisplayMode, setSvrDisplayMode] = useState("both"); // both, prediction, consumption
  const u = unitOf(resourceType);

  if (!data) return (
    <Card style={{ height:380, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ textAlign:"center", color:C.cardMuted }}>
        <div style={{ fontSize:36, marginBottom:12 }}>⏳</div>
        <div style={{ color:C.cardTitle, fontWeight:600 }}>Loading forecast…</div>
        <div style={{ fontSize:12, marginTop:4 }}>Fetching from backend</div>
      </div>
    </Card>
  );
  if (!data.days?.length) return (
    <Card style={{ height:380, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ textAlign:"center", color:C.cardMuted }}>
        <div style={{ fontSize:36, marginBottom:12 }}>📉</div>
        <div style={{ color:C.cardTitle, fontWeight:600 }}>No forecast data</div>
        <div style={{ fontSize:12, marginTop:4 }}>Upload data or adjust filters</div>
      </div>
    </Card>
  );

  const isAllMonths = selectedMonth === 0;
  const monthPrefix = isAllMonths ? "" : MONTHS[selectedMonth - 1];
  
  let chartData = [];

  if (svrDisplayMode === "prediction") {
    // Just show forecast horizon
    const horizon = forecastDays;
    const predData = (data.predictions || []).filter((p, i) => data.actual?.[i] === null);
    
    chartData = Array.from({ length: horizon }, (_, i) => {
      const pred = predData[i] ?? null;
      let label = `Day ${i + 1}`;
      if (horizon === 7) label = `${i + 1} day`;
      if (horizon === 90) label = `Week ${Math.ceil((i + 1) / 7)}`;
      
      return {
        displayLabel: label,
        predicted: pred,
        sortKey: i + 1
      };
    });
  } else if (svrDisplayMode === "consumption") {
    // Similar to ThresholdGraph
    if (isAllMonths) {
      chartData = MONTHS.map(m => {
        let sum = 0;
        let count = 0;
        (data.days || []).forEach((d, i) => {
          if (d.startsWith(m)) {
            sum += (data.actual?.[i] ?? 0);
            count++;
          }
        });
        return { displayLabel: m, actual: count > 0 ? sum : null };
      });
    } else {
      chartData = Array.from({ length: 31 }, (_, i) => i + 1).map(day => {
        const dStr = `${monthPrefix} ${day}`;
        const idx = (data.days || []).indexOf(dStr);
        return { displayLabel: day, actual: idx !== -1 ? (data.actual?.[idx] ?? null) : null };
      });
    }
  } else {
    // Both mode: combine historical for selected month + forecast
    let historical = [];
    if (isAllMonths) {
       historical = MONTHS.map(m => {
          let sum = 0, count = 0;
          (data.days || []).forEach((d, i) => {
            if (d.startsWith(m)) {
              sum += (data.actual?.[i] ?? 0);
              count++;
            }
          });
          return { displayLabel: m, actual: count > 0 ? sum : null };
       });
    } else {
       historical = Array.from({ length: 31 }, (_, i) => i + 1).map(day => {
          const dStr = `${monthPrefix} ${day}`;
          const idx = (data.days || []).indexOf(dStr);
          return { displayLabel: day, actual: idx !== -1 ? (data.actual?.[idx] ?? null) : null };
       });
    }
    
    // Add prediction as a separate line at the end or overlapping
    // Recharts handles this better if they shared the same X-axis.
    // In "Both" mode, searching for predictions in the same month...
    const predData = [];
    const pPoints = (data.predictions || []).length;
    for (let i = 0; i < pPoints; i++) {
        const d = data.days[i];
        if (!isAllMonths && !d.startsWith(monthPrefix)) continue;
        const act = data.actual[i];
        const pred = data.predictions[i];
        if (act === null && pred !== null) {
           // This is a future point in the CURRENTLY SELECTED month
           const dayNum = parseInt(d.split(" ")[1], 10);
           predData.push({ day: dayNum, val: pred });
        }
    }
    
    // Merge pred into historical
    predData.forEach(p => {
       const target = historical.find(h => h.displayLabel === p.day);
       if (target) target.predicted = p.val;
    });
    
    chartData = historical;
  }

  const formatModeTick = (v) => {
    if (svrDisplayMode === "prediction") return v;
    if (!isAllMonths) return `Day ${v}`;
    return v;
  };


  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={TIP}>
        <div style={{ color:C.cardMuted, fontSize:11, marginBottom:6 }}>Day {label}</div>
        {payload.map(p => p.value != null && (
          <div key={p.dataKey} style={{ color:p.color, fontWeight:600, marginBottom:2 }}>
            {p.dataKey === "actual" ? "Actual" : "SVR Predicted"}:{" "}
            <span style={{ color:C.cardTitle }}>{fmt(p.value)} {u}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card style={{ padding:"22px 24px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <div>
          <div style={{ color:C.cardTitle, fontWeight:700, fontSize:16 }}>Consumption Forecast</div>
          <div style={{ color:C.cardMuted, fontSize:12, marginTop:2 }}>Hybrid SVR Model</div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <select value={svrDisplayMode} onChange={e => setSvrDisplayMode(e.target.value)} style={{
            background:"rgba(34,197,94,0.10)", border:"1px solid rgba(34,197,94,0.28)",
            borderRadius:8, padding:"4px 12px", color:C.greenDark, fontSize:12, fontWeight:600, outline:"none", cursor:"pointer"
          }}>
            <option value="both">Both (Default)</option>
            <option value="prediction">Prediction Only</option>
            <option value="consumption">Consumption Only</option>
          </select>
          {svrDisplayMode !== "consumption" && (
            <select value={forecastDays} onChange={e => setForecastDays(Number(e.target.value))} style={{
              background:"rgba(59,130,246,0.10)", border:"1px solid rgba(59,130,246,0.28)",
              borderRadius:8, padding:"4px 12px", color:C.blue, fontSize:12, fontWeight:600, outline:"none", cursor:"pointer"
            }}>
              <option value={7}>Next 7 Days</option>
              <option value={30}>Next 1 Month</option>
              <option value={90}>Next 3 Months</option>
            </select>
          )}

        </div>
      </div>

      {/*
        ★ GRAPH FIX: explicit px height via style (NOT Tailwind h-[]).
          Recharts ResponsiveContainer measures parent offsetHeight.
          If Tailwind's JIT hasn't compiled h-[300px], height = 0 → blank graph.
          Using style="height:300px" is always reliable.
      */}
      <div style={{ width:"100%", height:"300px", minHeight:"300px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top:6, right:14, left:0, bottom:0 }}>
            <defs>
              <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={C.blue} stopOpacity={0.25}/>
                <stop offset="95%" stopColor={C.blue} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={C.chartGrid} vertical={false} />
            <XAxis dataKey="displayLabel" tick={{ fill:C.chartAxis, fontSize:11 }}
                   axisLine={{ stroke:C.chartGrid }} tickLine={false}
                   tickFormatter={formatModeTick}
                   minTickGap={25} interval="preserveStartEnd" />
            <YAxis tick={{ fill:C.chartAxis, fontSize:11 }} axisLine={false}
                   tickLine={false} tickFormatter={v => fmt(v,0)} width={58} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize:12, paddingTop:10 }}
                    formatter={v => v === "actual" ? "Actual Consumption" : "Predicted Consumption"} />
            <Area type="monotone" dataKey="actual" stroke={C.blue} fill="url(#colorActual)" strokeWidth={3}
                  dot={false} connectNulls={false}
                  activeDot={{ r:5, fill:C.blue, stroke:"#fff", strokeWidth:2 }} />
            <Line type="monotone" dataKey="predicted" stroke={C.green} strokeWidth={3}
                  dot={false} connectNulls={false}
                  activeDot={{ r:5, fill:C.green, stroke:"#fff", strokeWidth:2 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

/* ═══════════════════════════════════════
   GRAPH 2 — Anomaly Detection (LSTM)
   ═══════════════════════════════════════ */
function ThresholdGraph({ data, resourceType, selectedMonth, thresholdMode, setThresholdMode, customThreshold, setCustomThreshold, activeThreshold, dynamicAlerts }) {
  const u = unitOf(resourceType);

  if (!data) return (
    <Card style={{ height:330, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ textAlign:"center", color:C.cardMuted }}>
        <div style={{ fontSize:36, marginBottom:12 }}>⏳</div>
        <div style={{ color:C.cardTitle, fontWeight:600 }}>Loading anomaly data…</div>
      </div>
    </Card>
  );
  if (!data.days?.length || !data.actual?.length) return (
    <Card style={{ height:330, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ textAlign:"center", color:C.cardMuted }}>
        <div style={{ fontSize:36, marginBottom:12 }}>🔍</div>
        <div style={{ color:C.cardTitle, fontWeight:600 }}>No anomaly data</div>
        <div style={{ fontSize:12, marginTop:4 }}>Check filters or upload data</div>
      </div>
    </Card>
  );

  const isAllMonths = selectedMonth === 0;
  const monthPrefix = isAllMonths ? "" : MONTHS[selectedMonth - 1];
  const anomalyDays = new Set((dynamicAlerts ?? []).map(a => String(a.day)));

  const chartData = isAllMonths
    ? MONTHS.map(m => {
        let sum = 0;
        let count = 0;
        (data.days || []).forEach((d, i) => {
          if (d.startsWith(m)) {
            sum += (data.actual?.[i] ?? 0);
            count++;
          }
        });
        return {
          displayLabel: m,
          value: count > 0 ? sum : null,
          threshold: activeThreshold,
          isAnomaly: false,
        };
      })
    : Array.from({ length: 31 }, (_, i) => i + 1).map(day => {
        const dStr = `${monthPrefix} ${day}`;
        const idx = (data.days || []).indexOf(dStr);
        const act = idx !== -1 ? (data.actual?.[idx] ?? null) : null;
        return {
          displayLabel: day,
          value: act,
          threshold: activeThreshold,
          isAnomaly: anomalyDays.has(dStr),
        };
      });

  const formatModeTick = (v) => {
    if (!isAllMonths) return `Day ${v}`;
    return v;
  };

  const AnomalyDot = ({ cx, cy, payload }) => {
    if (!payload?.isAnomaly || cx == null || cy == null) return null;
    return (
      <circle cx={cx} cy={cy} r={6} fill={C.red} stroke="none" />
    );
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const isAnom = payload[0]?.payload?.isAnomaly;
    const valPt  = payload.find(p => p.dataKey === "value");
    return (
      <div style={TIP}>
        <div style={{ color:C.cardMuted, fontSize:11, marginBottom:6 }}>Day {label}</div>
        {valPt?.value != null && (
          <div style={{ color: isAnom ? C.red : C.cardTitle, fontWeight:600, marginBottom:3 }}>
            Consumption: {fmt(valPt.value)} {u}
            {isAnom && <span style={{ marginLeft:8, color:C.red, fontSize:11, fontWeight:700 }}>⚠ ANOMALY</span>}
          </div>
        )}
        {data.threshold != null && (
          <div style={{ color:C.amber, fontSize:12 }}>Threshold: {fmt(data.threshold)} {u}</div>
        )}
      </div>
    );
  };

  const yMax = Math.max(safeMax(data.actual), activeThreshold ?? 0) * 1.16;
  
  let thresholdPct = 0;
  if (yMax > 0 && activeThreshold > 0) {
    thresholdPct = Math.max(0, Math.min(100, 100 - (activeThreshold / yMax) * 100));
  } else if (activeThreshold <= 0) {
    thresholdPct = 100;
  }

  return (
    <Card style={{ padding:"22px 24px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <div>
          <div style={{ color:C.cardTitle, fontWeight:700, fontSize:16 }}>Abnormal Consumption Detection</div>
          <div style={{ color:C.cardMuted, fontSize:12, marginTop:2 }}>Dynamic Threshold Analysis · LSTM</div>
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <select value={thresholdMode} onChange={e => setThresholdMode(e.target.value)} style={{
            background:"none", border:`1px solid ${C.cardBorder}`,
            borderRadius:8, padding:"4px 8px", color:C.cardTitle, fontSize:12, fontWeight:600, outline:"none", cursor:"pointer"
          }}>
            <option value="auto">Auto Threshold</option>
            <option value="custom">Custom Threshold</option>
          </select>
          {thresholdMode === "custom" && (
            <input 
              type="number"
              value={customThreshold}
              onChange={e => setCustomThreshold(Number(e.target.value))}
              style={{
                width:80, padding:"4px 8px", borderRadius:8, border:`1px solid ${C.blue}`,
                outline:"none", fontSize:12, fontWeight:600, color:C.cardTitle
              }}
            />
          )}
          <div style={{ background:C.redBg, border:`1px solid ${C.redBorder}`,
                        borderRadius:8, padding:"4px 12px", color:C.red, fontSize:12, fontWeight:600 }}>
            {dynamicAlerts?.length ?? 0} Anomalies
          </div>
        </div>
      </div>

      <div style={{ width:"100%", height:"280px", minHeight:"280px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top:6, right:14, left:0, bottom:0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.chartGrid} vertical={false} />
            <XAxis dataKey="displayLabel" tick={{ fill:C.chartAxis, fontSize:11 }}
                   axisLine={{ stroke:C.chartGrid }} tickLine={false}
                   tickFormatter={formatModeTick} minTickGap={25} interval="preserveStartEnd" />
            <YAxis tick={{ fill:C.chartAxis, fontSize:11 }} axisLine={false}
                   tickLine={false} tickFormatter={v => fmt(v,0)}
                   domain={[0, (v) => Math.max(v, activeThreshold || 0) * 1.1]} width={58} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize:12, paddingTop:10 }}
                    formatter={v => v === "value" ? "Actual Consumption" : "Threshold Limit"} />
            <Line type="monotone" dataKey="value" stroke={C.blue} strokeWidth={3}
                  dot={<AnomalyDot />} connectNulls={false}
                  activeDot={{ r:5, fill:C.blue, stroke:"#fff", strokeWidth:2 }} />
            <Line type="monotone" dataKey="threshold" stroke={C.red} strokeWidth={2}
                  strokeDasharray="6 4" strokeOpacity={0.80} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

/* ═══════════════════════════════════════
   ALERTS PANEL
   ═══════════════════════════════════════ */
function AlertsPanel({ dynamicAlerts, activeThreshold }) {
  const alerts    = dynamicAlerts    ?? [];
  const threshold = activeThreshold ?? 0;
  const u         = "kWh";
  const CAUSES    = [
    "Possible leakage detected","HVAC system overload",
    "Irregular usage pattern","Equipment malfunction","Sensor spike detected",
  ];

  return (
    <Card style={{ padding:"22px 20px", display:"flex", flexDirection:"column", minHeight:400 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16,
                    paddingBottom:14, borderBottom:`1px solid ${C.cardBorder}` }}>
        <div style={{ width:36, height:36, borderRadius:10, fontSize:16, flexShrink:0,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      background: alerts.length ? C.redBg : "rgba(34,197,94,0.10)" }}>
          {alerts.length ? "🚨" : "✅"}
        </div>
        <div>
          <div style={{ color:C.cardTitle, fontWeight:700, fontSize:15 }}>System Alerts</div>
          <div style={{ fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em",
                        color: alerts.length ? C.red : C.greenDark }}>
            {alerts.length} {alerts.length === 1 ? "anomaly" : "anomalies"} detected
          </div>
        </div>
      </div>

      {alerts.length === 0 && (
        <div style={{ flex:1, display:"flex", flexDirection:"column",
                      alignItems:"center", justifyContent:"center", gap:10, textAlign:"center" }}>
          <div style={{ fontSize:38 }}>🌿</div>
          <div style={{ color:C.cardTitle, fontWeight:600 }}>All Clear</div>
          <div style={{ color:C.cardMuted, fontSize:13 }}>No anomalies this period</div>
        </div>
      )}

      <div style={{ display:"flex", flexDirection:"column", gap:10, overflowY:"auto", flex:1, maxHeight:"280px" }}>
        {alerts.map((a, i) => (
          <div key={i} style={{
            borderLeft:`4px solid ${C.red}`, borderRadius:"0 10px 10px 0",
            background:C.redBg, border:`1px solid ${C.redBorder}`,
            borderLeftWidth:4, padding:"12px 14px",
          }}>
            <div style={{ color:C.red, fontSize:11, fontWeight:800, letterSpacing:"0.06em", marginBottom:5 }}>
              ⚠ ALERT
            </div>
            <div style={{ color:C.cardTitle, fontSize:13, marginBottom:6 }}>
              Day <strong>{a.day}</strong> consumption exceeded threshold.
            </div>
            <div style={{ display:"flex", gap:16, fontSize:12, flexWrap:"wrap" }}>
              <span>ACTUAL: <strong style={{ color:C.cardTitle }}>{fmt(a.actual)} {u}</strong></span>
              <span>LIMIT: <strong style={{ color:C.amber }}>{fmt(threshold)} {u}</strong></span>
            </div>
            <div style={{ marginTop:7, fontSize:11, color:C.red, fontStyle:"italic" }}>
              Cause: {CAUSES[i % CAUSES.length]}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ═══════════════════════════════════════
   MODEL INFO BAR
   ═══════════════════════════════════════ */
function ModelInfoBar({ trainedOn }) {
  const items = [
    { icon:"⚙️", label:"MODEL USED",        value:"Hybrid SVR + LSTM Forecasting"          },
    { icon:"🧩", label:"FEATURES USED",     value:"Lag, rolling stats, seasonality encoding" },
    { icon:"🎯", label:"ANOMALY DETECTION", value:"Dynamic threshold · mean + 2σ"            },
    { icon:"📦", label:"TRAINED ON",        value: trainedOn ? `${trainedOn} records` : "–"  },
  ];
  return (
    <Card style={{ padding:"18px 24px" }}>
      <div style={{ color:C.cardMuted, fontSize:10, fontWeight:700,
                    textTransform:"uppercase", letterSpacing:"0.10em", marginBottom:14 }}>
        Model Information
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16 }}>
        {items.map(it => (
          <div key={it.label} style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
            <span style={{ fontSize:18, lineHeight:"1.4", flexShrink:0 }}>{it.icon}</span>
            <div>
              <div style={{ color:C.cardMuted, fontSize:10, fontWeight:700,
                            textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:3 }}>
                {it.label}
              </div>
              <div style={{ color:C.cardTitle, fontSize:12, fontWeight:600, lineHeight:"1.5" }}>
                {it.value}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ═══════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════ */
export default function DashboardPage() {
  const [resourceType,    setResourceType]    = useState("energy");
  const [selectedMonth,   setSelectedMonth]   = useState(new Date().getMonth() + 1);
  const [selectedUtility, setSelectedUtility] = useState("");
  const [analysisData,    setAnalysisData]    = useState(null);
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState(null);

  const [thresholdMode,   setThresholdMode]   = useState("auto");
  const [customThreshold, setCustomThreshold] = useState(0);

  const [forecastDays,    setForecastDays]    = useState(30);

  useEffect(() => {
    if (analysisData?.threshold && customThreshold === 0) {
      setCustomThreshold(Math.ceil(analysisData.threshold));
    }
  }, [analysisData?.threshold]);

  const activeThreshold = thresholdMode === "custom" ? customThreshold : (analysisData?.threshold ?? 0);

  const isAllMonths = selectedMonth === 0;
  const monthPrefix = isAllMonths ? "" : MONTHS[selectedMonth - 1];
  const dynamicAlerts = [];
  (analysisData?.days || []).forEach((d, i) => {
    if (!isAllMonths && !String(d).startsWith(monthPrefix)) return;
    const act = analysisData.actual?.[i];
    if (act != null && act > activeThreshold) {
      dynamicAlerts.push({
        day: String(d),
        actual: act,
        error: act - activeThreshold,
      });
    }
  });

  const fetchAnalysis = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get("http://127.0.0.1:5000/analyze", {
        params: {
          type:          resourceType,
          forecast_days: forecastDays,
          sub_utility:   selectedUtility || undefined,
        },
      });
      setAnalysisData(data);
    } catch (err) {
      console.error("Analyze error:", err);
      setError(err?.response?.data?.error ?? "Failed to fetch data from backend.");
      setAnalysisData(null);
    } finally {
      setLoading(false);
    }
  }, [resourceType, selectedUtility, forecastDays]);

  useEffect(() => { fetchAnalysis(); }, [fetchAnalysis]);

  return (
    <Layout>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; }
        ::-webkit-scrollbar       { width: 5px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.18); border-radius: 4px; }
        select option             { background: #1a3d28; color: #fff; }
      `}</style>

      <div style={{
        minHeight:  "100vh",
        background: C.pageBg,
        fontFamily: "'DM Sans','Segoe UI',sans-serif",
      }}>
        <Navbar
          resourceType={resourceType}       setResourceType={setResourceType}
          selectedMonth={selectedMonth}     setSelectedMonth={setSelectedMonth}
          selectedUtility={selectedUtility} setSelectedUtility={setSelectedUtility}
          loading={loading}
          onRefresh={fetchAnalysis}
        />

        <div style={{ maxWidth:1400, margin:"0 auto", padding:"26px 24px 48px",
                      display:"flex", flexDirection:"column", gap:20 }}>

          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end",
                        flexWrap:"wrap", gap:8 }}>
            <div>
              <h1 style={{ margin:0, color:"#fff", fontSize:26, fontWeight:800, letterSpacing:"-0.02em" }}>
                Overview of {resourceType} &amp; water consumption
              </h1>
              <p style={{ margin:"5px 0 0", color:C.pageMuted, fontSize:13 }}>
                {isAllMonths ? "All Months" : MONTHS[selectedMonth - 1]} · {selectedUtility || "All Utilities"} · SVR + LSTM
              </p>
            </div>
            {analysisData?.model_trained_on != null && (
              <div style={{ color:C.pageMuted, fontSize:12 }}>
                Trained on{" "}
                <strong style={{ color:"#fff" }}>{analysisData.model_trained_on}</strong> records
              </div>
            )}
          </div>

          {error && (
            <div style={{ background:C.redBg, border:`1px solid ${C.redBorder}`,
                          borderRadius:10, padding:"12px 18px", color:C.red, fontSize:13, fontWeight:500 }}>
              ⚠ {error}
            </div>
          )}

          <SummaryCards data={analysisData} resourceType={resourceType} dynamicAlerts={dynamicAlerts} />

          <div style={{ display:"grid", gridTemplateColumns:"1fr 330px", gap:18, alignItems:"start" }}>
            <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
              <PredictionGraph data={analysisData} resourceType={resourceType} selectedMonth={selectedMonth} forecastDays={forecastDays} setForecastDays={setForecastDays} />
              <ThresholdGraph  
                data={analysisData} resourceType={resourceType} selectedMonth={selectedMonth}
                thresholdMode={thresholdMode} setThresholdMode={setThresholdMode}
                customThreshold={customThreshold} setCustomThreshold={setCustomThreshold}
                activeThreshold={activeThreshold} dynamicAlerts={dynamicAlerts}
              />
            </div>
            <AlertsPanel dynamicAlerts={dynamicAlerts} activeThreshold={activeThreshold} />
          </div>

          <ModelInfoBar trainedOn={analysisData?.model_trained_on} />
        </div>
      </div>
    </Layout>
  );
}
