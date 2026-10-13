import { useState, useMemo } from "react";
import { Heart, Calendar, Clock, MapPin, ChevronLeft, ChevronRight, ArrowRight, Check } from "lucide-react";

// ─────────────────────────────────────────────
// Get a free access key at https://web3forms.com
// (just enter your email — no account needed) and
// paste it into a .env file as VITE_WEB3FORMS_KEY.
// See README.md for the full walkthrough.
// ─────────────────────────────────────────────
const WEB3FORMS_KEY = import.meta.env.VITE_WEB3FORMS_KEY || "";

const PLACE_SUGGESTIONS = [
  { emoji: "☕", label: "Coffee date" },
  { emoji: "🍷", label: "Dinner" },
  { emoji: "🎬", label: "Movie night" },
  { emoji: "🌇", label: "Sunset walk" },
  { emoji: "✨", label: "Surprise me" },
];

function ordinal(n) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

async function sendEmail({ day, time, place }) {
  if (!WEB3FORMS_KEY) {
    console.warn("VITE_WEB3FORMS_KEY is not set — skipping email send.");
    return false;
  }
  try {
    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        access_key: WEB3FORMS_KEY,
        subject: "She picked your date! 💌",
        from_name: "Date Invitation",
        Day: day?.label || "",
        Time: time || "",
        Place: place || "",
        message: `Day: ${day?.label}\nTime: ${time}\nPlace: ${place}`,
      }),
    });
    return res.ok;
  } catch (e) {
    console.error("Email send failed", e);
    return false;
  }
}

export default function DateInvitation() {
  const [step, setStep] = useState("hero");
  const [day, setDay] = useState(null);
  const [time, setTime] = useState(null);
  const [place, setPlace] = useState("");
  const [sending, setSending] = useState(false);

  async function handleConfirm() {
    setSending(true);
    await sendEmail({ day, time, place });
    setSending(false);
    setStep("done");
  }

  return (
    <div style={styles.page}>
      <FloatingHearts />

      <div style={styles.cardWrap}>
        {step === "hero" && <Hero onNext={() => setStep("day")} />}

        {step !== "hero" && (
          <div style={styles.card}>
            {step === "day" && (
              <DayStep
                selected={day}
                onBack={() => setStep("hero")}
                onSelect={(d) => {
                  setDay(d);
                  setStep("time");
                }}
              />
            )}
            {step === "time" && (
              <TimeStep
                onBack={() => setStep("day")}
                onSelect={(t) => {
                  setTime(t);
                  setStep("place");
                }}
              />
            )}
            {step === "place" && (
              <PlaceStep value={place} onChange={setPlace} onBack={() => setStep("time")} onNext={() => setStep("confirm")} />
            )}
            {step === "confirm" && (
              <ConfirmStep day={day} time={time} place={place} onBack={() => setStep("place")} onConfirm={handleConfirm} sending={sending} />
            )}
            {step === "done" && <Done />}
          </div>
        )}
      </div>

      <style>{`
        @keyframes floatUp { 0% { transform: translateY(0) rotate(0deg); opacity: 0; } 12% { opacity: 0.55; } 100% { transform: translateY(-115vh) rotate(20deg); opacity: 0; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes popIn { 0% { transform: scale(0.85); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes gentlePulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        @keyframes heartBeat { 0%, 100% { transform: scale(1); } 25% { transform: scale(1.15); } 40% { transform: scale(1); } 60% { transform: scale(1.1); } }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; transition: none !important; }
        }
      `}</style>
    </div>
  );
}

// ───────────── Hero ─────────────

function Hero({ onNext }) {
  return (
    <div style={{ ...styles.heroWrap, animation: "fadeIn 0.7s ease" }}>
      <Heart size={30} color={ROSE} style={{ animation: "heartBeat 2.2s ease-in-out infinite", marginBottom: 18 }} />
      <h1 style={styles.heroHeadline}>I'd Like To Take You Out ❤️</h1>
      <p style={styles.heroSubtext}>So… what do you say we make some time for just us?</p>
      <button style={styles.heroCta} onClick={onNext}>
        Choose Our Date <ArrowRight size={16} style={{ marginLeft: 6 }} />
      </button>
    </div>
  );
}

// ───────────── Day ─────────────

function DayStep({ onSelect, onBack, selected }) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthLabel = viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const canGoPrev = !(year === today.getFullYear() && month === today.getMonth());

  const cells = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  function isPast(d) {
    return new Date(year, month, d) < today;
  }

  function isSelected(d) {
    if (!selected) return false;
    const dt = new Date(year, month, d);
    return dt.toDateString() === new Date(selected.value).toDateString();
  }

  function selectDay(d) {
    if (isPast(d)) return;
    const dt = new Date(year, month, d);
    const label = `${dt.toLocaleDateString("en-US", { weekday: "long" })}, ${dt.toLocaleDateString("en-US", { month: "long" })} ${ordinal(
      dt.getDate()
    )}`;
    onSelect({ label, value: dt.toISOString() });
  }

  return (
    <div style={{ ...styles.stepInner, animation: "fadeIn 0.5s ease" }}>
      <StepHeader onBack={onBack} icon={<Calendar size={16} color={ROSE} />} title="The Day" subtitle="Whenever feels right for you" />
      <div style={styles.calendarNav}>
        <button
          style={{ ...styles.calendarNavBtn, opacity: canGoPrev ? 1 : 0.3, cursor: canGoPrev ? "pointer" : "default" }}
          disabled={!canGoPrev}
          onClick={() => setViewDate(new Date(year, month - 1, 1))}
        >
          <ChevronLeft size={14} />
        </button>
        <span style={styles.calendarMonthLabel}>{monthLabel}</span>
        <button style={styles.calendarNavBtn} onClick={() => setViewDate(new Date(year, month + 1, 1))}>
          <ChevronRight size={14} />
        </button>
      </div>
      <div style={styles.calendarWeekRow}>
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i} style={styles.calendarWeekday}>
            {d}
          </div>
        ))}
      </div>
      <div style={styles.calendarGrid}>
        {cells.map((d, i) =>
          d === null ? (
            <div key={i} />
          ) : (
            <button
              key={i}
              disabled={isPast(d)}
              onClick={() => selectDay(d)}
              style={{
                ...styles.calendarDay,
                background: isSelected(d) ? ROSE : "transparent",
                color: isPast(d) ? "#EFD3DA" : isSelected(d) ? "#FFFFFF" : TEXT,
                fontWeight: isSelected(d) ? 700 : 400,
                cursor: isPast(d) ? "default" : "pointer",
              }}
            >
              {d}
            </button>
          )
        )}
      </div>
    </div>
  );
}

// ───────────── Time ─────────────

function TimeStep({ onSelect, onBack }) {
  const [hour, setHour] = useState(null);
  const [minute, setMinute] = useState(0);
  const [period, setPeriod] = useState("PM");
  const canContinue = hour !== null;

  function handleContinue() {
    onSelect(`${hour}:${minute.toString().padStart(2, "0")} ${period}`);
  }

  return (
    <div style={{ ...styles.stepInner, animation: "fadeIn 0.5s ease" }}>
      <StepHeader onBack={onBack} icon={<Clock size={16} color={ROSE} />} title="The Time" subtitle="Pick whatever suits you best" />

      <p style={styles.pickerLabel}>Hour</p>
      <div style={styles.chipRow}>
        {Array.from({ length: 12 }).map((_, i) => {
          const h = i + 1;
          return (
            <button
              key={h}
              onClick={() => setHour(h)}
              style={{ ...styles.chip, background: hour === h ? ROSE : "#FFF6F8", color: hour === h ? "#FFFFFF" : TEXT }}
            >
              {h}
            </button>
          );
        })}
      </div>

      <p style={styles.pickerLabel}>Minute</p>
      <div style={styles.chipRow}>
        {[0, 15, 30, 45].map((m) => (
          <button
            key={m}
            onClick={() => setMinute(m)}
            style={{ ...styles.chip, background: minute === m ? ROSE : "#FFF6F8", color: minute === m ? "#FFFFFF" : TEXT }}
          >
            :{m.toString().padStart(2, "0")}
          </button>
        ))}
      </div>

      <div style={styles.periodRow}>
        {["AM", "PM"].map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            style={{ ...styles.periodBtn, background: period === p ? ROSE : "#FFF6F8", color: period === p ? "#FFFFFF" : TEXT }}
          >
            {p}
          </button>
        ))}
      </div>

      <button style={{ ...styles.primaryBtn, opacity: canContinue ? 1 : 0.4 }} disabled={!canContinue} onClick={handleContinue}>
        Continue
      </button>
    </div>
  );
}

// ───────────── Place ─────────────

function PlaceStep({ value, onChange, onBack, onNext }) {
  const canContinue = value.trim().length > 0;
  return (
    <div style={{ ...styles.stepInner, animation: "fadeIn 0.5s ease" }}>
      <StepHeader onBack={onBack} icon={<MapPin size={16} color={ROSE} />} title="The Place" subtitle="Anywhere you'd like — your call" />

      <div style={styles.suggestionWrap}>
        {PLACE_SUGGESTIONS.map((s) => (
          <button
            key={s.label}
            onClick={() => onChange(s.label)}
            style={{
              ...styles.suggestionChip,
              background: value === s.label ? ROSE : "#FFF6F8",
              color: value === s.label ? "#FFFFFF" : TEXT,
            }}
          >
            <span style={{ marginRight: 6 }}>{s.emoji}</span>
            {s.label}
          </button>
        ))}
      </div>

      <input
        style={styles.input}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Or tell me exactly where you'd like to go"
      />

      <button style={{ ...styles.primaryBtn, marginTop: 18, opacity: canContinue ? 1 : 0.4 }} disabled={!canContinue} onClick={onNext}>
        Continue
      </button>
    </div>
  );
}

// ───────────── Confirm & Done ─────────────

function ConfirmStep({ day, time, place, onBack, onConfirm, sending }) {
  return (
    <div style={{ ...styles.stepInner, textAlign: "center", animation: "fadeIn 0.5s ease" }}>
      <StepHeader onBack={onBack} icon={<Heart size={16} color={ROSE} />} title="" subtitle="" hideTitle />
      <h2 style={styles.h2}>So it's a date ❤️</h2>
      <div style={styles.summaryCard}>
        <SummaryRow icon={<Calendar size={14} color={ROSE} />} text={day?.label} />
        <SummaryRow icon={<Clock size={14} color={ROSE} />} text={time} />
        <SummaryRow icon={<MapPin size={14} color={ROSE} />} text={place} />
      </div>
      <p style={styles.blurb}>Perfect. I'll take it from here.</p>
      <button style={{ ...styles.primaryBtn, opacity: sending ? 0.7 : 1 }} disabled={sending} onClick={onConfirm}>
        {sending ? "Sending…" : "Confirm Our Date"} {!sending && <Heart size={14} style={{ marginLeft: 6 }} fill="#FFFFFF" />}
      </button>
    </div>
  );
}

function Done() {
  return (
    <div style={{ ...styles.stepInner, textAlign: "center", animation: "popIn 0.6s ease" }}>
      <div style={styles.seal}>
        <Check size={22} color="#FFFFFF" />
      </div>
      <h2 style={styles.doneTitle}>It's a date.</h2>
      <p style={styles.blurb}>I'm looking forward to seeing you.</p>
    </div>
  );
}

// ───────────── Shared bits ─────────────

function StepHeader({ onBack, icon, title, subtitle, hideTitle }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <button style={styles.backBtn} onClick={onBack} aria-label="Back">
        <ChevronLeft size={16} />
      </button>
      {!hideTitle && (
        <div style={{ textAlign: "center", marginTop: -22 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 4 }}>
            {icon}
            <h3 style={styles.h3}>{title}</h3>
          </div>
          {subtitle && <p style={styles.stepSubtitle}>{subtitle}</p>}
        </div>
      )}
    </div>
  );
}

function SummaryRow({ icon, text }) {
  return (
    <div style={styles.summaryRow}>
      {icon}
      <span>{text}</span>
    </div>
  );
}

function FloatingHearts() {
  const hearts = useMemo(
    () =>
      Array.from({ length: 9 }).map((_, i) => ({
        left: `${(i * 103) % 100}%`,
        delay: `${(i * 2.1) % 14}s`,
        duration: `${16 + (i % 5) * 2}s`,
        size: 10 + (i % 3) * 5,
      })),
    []
  );
  return (
    <div style={styles.heartsLayer} aria-hidden="true">
      {hearts.map((h, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            left: h.left,
            bottom: -30,
            fontSize: h.size,
            color: "rgba(194,24,91,0.18)",
            animation: `floatUp ${h.duration} linear infinite`,
            animationDelay: h.delay,
          }}
        >
          ❤
        </span>
      ))}
    </div>
  );
}

// ───────────── Design tokens ─────────────
const BG = "#FFFDFC";
const SURFACE = "#FFFFFF";
const ROSE = "#C2185B";
const ROSE_SOFT = "#F8D9E4";
const TEXT = "#2E1620";
const MUTED = "#B98A98";

const styles = {
  page: {
    minHeight: "100vh",
    background: `radial-gradient(circle at 50% 0%, #FFF1F5 0%, ${BG} 65%)`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'DM Sans', sans-serif",
    color: TEXT,
    position: "relative",
    overflow: "hidden",
    padding: "40px 16px",
  },
  heartsLayer: { position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" },
  cardWrap: { width: "100%", maxWidth: 420, display: "flex", flexDirection: "column", alignItems: "center", zIndex: 2 },
  heroWrap: { display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "20px 10px" },
  heroHeadline: {
    fontFamily: "'Cormorant Garamond', serif",
    fontStyle: "italic",
    fontSize: "clamp(30px, 8vw, 42px)",
    fontWeight: 600,
    color: TEXT,
    margin: "0 0 14px",
    lineHeight: 1.15,
  },
  heroSubtext: { fontSize: 15, color: MUTED, lineHeight: 1.6, margin: "0 0 30px", maxWidth: 320 },
  heroCta: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: ROSE,
    color: "#FFFFFF",
    border: "none",
    borderRadius: 999,
    padding: "15px 26px",
    fontSize: 15,
    fontWeight: 600,
    letterSpacing: 0.3,
    cursor: "pointer",
    boxShadow: "0 16px 30px rgba(194,24,91,0.28)",
    animation: "gentlePulse 2.8s ease-in-out infinite",
  },
  card: {
    width: "100%",
    background: SURFACE,
    border: `1px solid ${ROSE_SOFT}`,
    borderRadius: 20,
    padding: "34px 28px",
    boxShadow: "0 30px 60px rgba(194,24,91,0.12)",
    boxSizing: "border-box",
  },
  stepInner: { display: "flex", flexDirection: "column" },
  h2: { fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 600, margin: "0 0 8px", color: TEXT },
  h3: { fontFamily: "'Cormorant Garamond', serif", fontSize: 21, fontWeight: 600, margin: 0, color: TEXT },
  stepSubtitle: { fontSize: 12.5, color: MUTED, margin: "2px 0 0" },
  blurb: { fontSize: 14, lineHeight: 1.6, color: MUTED, margin: "0 0 22px" },
  backBtn: {
    background: "transparent",
    border: `1px solid ${ROSE_SOFT}`,
    color: TEXT,
    borderRadius: "50%",
    width: 28,
    height: 28,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  input: {
    width: "100%",
    background: "#FFF6F8",
    border: `1px solid ${ROSE_SOFT}`,
    borderRadius: 10,
    padding: "12px 14px",
    color: TEXT,
    fontSize: 14,
    fontFamily: "inherit",
    boxSizing: "border-box",
    outline: "none",
  },
  primaryBtn: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: ROSE,
    color: "#FFFFFF",
    border: "none",
    borderRadius: 999,
    padding: "13px 20px",
    fontSize: 14,
    fontWeight: 600,
    letterSpacing: 0.3,
    cursor: "pointer",
    marginTop: 6,
    boxSizing: "border-box",
  },
  seal: {
    width: 50,
    height: 50,
    borderRadius: "50%",
    background: ROSE,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 18px",
  },
  doneTitle: { fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 32, fontWeight: 600, margin: "0 0 10px", color: TEXT },
  summaryCard: {
    background: "#FFF3F7",
    border: `1px solid ${ROSE_SOFT}`,
    borderRadius: 12,
    padding: "16px 18px",
    display: "flex",
    flexDirection: "column",
    gap: 10,
    margin: "16px 0 20px",
    textAlign: "left",
  },
  summaryRow: { display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: TEXT },
  calendarNav: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  calendarNavBtn: {
    background: "transparent",
    border: `1px solid ${ROSE_SOFT}`,
    color: TEXT,
    borderRadius: "50%",
    width: 26,
    height: 26,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  calendarMonthLabel: { fontSize: 13, fontWeight: 600, color: TEXT },
  calendarWeekRow: { display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 4 },
  calendarWeekday: { textAlign: "center", fontSize: 11, color: MUTED },
  calendarGrid: { display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 },
  calendarDay: { aspectRatio: "1", borderRadius: "50%", border: "none", background: "transparent", fontSize: 13, fontFamily: "inherit" },
  pickerLabel: { fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: MUTED, margin: "0 0 8px" },
  chipRow: { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  chip: {
    border: `1px solid ${ROSE_SOFT}`,
    borderRadius: 999,
    padding: "8px 13px",
    fontSize: 13,
    fontFamily: "inherit",
    cursor: "pointer",
    minWidth: 40,
  },
  periodRow: { display: "flex", gap: 8, marginBottom: 22 },
  periodBtn: { flex: 1, border: `1px solid ${ROSE_SOFT}`, borderRadius: 999, padding: "10px 0", fontSize: 13, fontFamily: "inherit", cursor: "pointer" },
  suggestionWrap: { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  suggestionChip: {
    border: `1px solid ${ROSE_SOFT}`,
    borderRadius: 999,
    padding: "9px 14px",
    fontSize: 13,
    fontFamily: "inherit",
    cursor: "pointer",
  },
};
