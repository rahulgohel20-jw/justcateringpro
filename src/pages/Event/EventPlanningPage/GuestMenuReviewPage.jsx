import { useState, useEffect, useRef } from "react";
import {
  Soup, UtensilsCrossed, Flame, Cookie, Phone, Mail,
  ShieldCheck, ChevronRight, Check, Loader2, Sparkles, ArrowLeft,
} from "lucide-react";
import { toAbsoluteUrl } from "@/utils";
import { useSearchParams } from "react-router-dom";
import { GetFoodTestingMenu, SaveTesterMenu } from "../../../services/apiServices";
import { Translateapi } from "../../../services/apiServices";
import { extractTranslations } from "@/utils/langConfig";
import Swal from "sweetalert2";

const COLOR = {
  paper: "#FFF8F8", card: "#FFFFFF", cardAlt: "#FFFAFA",
  line: "#F0DADA", linePale: "#F7EDED", ink: "#2B1010",
  inkMute: "#7A5050", inkFaint: "#A87878",
  primary: "#B20A0A", primaryDark: "#8A0707", primaryDeep: "#5E0404",
  primaryLight: "#F9E8E8", teal: "#1F5C57", tealDeep: "#173F3B",
  chili: "#B20A0A", leaf: "#2E7D32",
};

const RATINGS = [
  { id: "delicious", emoji: "😍", label: "Delicious", color: COLOR.chili },
  { id: "good", emoji: "😊", label: "Good", color: COLOR.primary },
  { id: "okay", emoji: "😐", label: "Okay", color: COLOR.inkMute },
];

// ─── Icon lookup ──────────────────────────────────────────────────────────
// IMPORTANT: React components (functions) cannot be JSON.stringify'd into
// sessionStorage and survive a refresh — they come back as plain `{}`
// objects, which is exactly what caused:
//   "Element type is invalid: expected a string ... but got: object"
// So we NEVER store the component itself on category data. Instead we
// store a plain string key (or nothing at all) and resolve the actual
// icon component here, at render time, every render.
const CATEGORY_ICONS = {
  default: UtensilsCrossed,
  soup: Soup,
  flame: Flame,
  cookie: Cookie,
};

const getCategoryIcon = (iconKey) => CATEGORY_ICONS[iconKey] || CATEGORY_ICONS.default;

// ─── Logo mark ────────────────────────────────────────────────────────────
const LogoMark = ({ size = 56, showName = false }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
    <img
      src={toAbsoluteUrl("/media/logos/sai_logo.png")}
      alt="Logo"
      style={{
        width: size + 50,
        height: size,
      }}
    />
  </div>
);

const LoaderScreen = () => (
  <div
    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-5"
    style={{ background: COLOR.paper }}
  >
    <style>{`
      @keyframes heartbeat {
        0%   { transform: scale(1); }
        14%  { transform: scale(1.18); }
        28%  { transform: scale(1); }
        42%  { transform: scale(1.12); }
        70%  { transform: scale(1); }
        100% { transform: scale(1); }
      }
      @keyframes pulseRing1 {
        0%   { transform: scale(0.8); opacity: 0.6; }
        100% { transform: scale(1.8); opacity: 0; }
      }
      @keyframes pulseRing2 {
        0%   { transform: scale(0.8); opacity: 0.4; }
        100% { transform: scale(2.2); opacity: 0; }
      }
      @keyframes rotateDots {
        to { transform: rotate(360deg); }
      }
    `}</style>

    <div style={{ position: "relative", width: 110, height: 110, display: "flex", alignItems: "center", justifyContent: "center" }}>

      {/* Pulse ring 1 */}
      <div style={{
        position: "absolute", width: 70, height: 70, borderRadius: "50%",
        background: COLOR.primary, opacity: 0.15,
        animation: "pulseRing1 1.6s ease-out infinite",
      }} />

      {/* Pulse ring 2 — delayed */}
      <div style={{
        position: "absolute", width: 70, height: 70, borderRadius: "50%",
        background: COLOR.primary, opacity: 0.1,
        animation: "pulseRing2 1.6s ease-out infinite 0.4s",
      }} />

      {/* Rotating dashed border */}
      <svg width="90" height="90" style={{ position: "absolute", animation: "rotateDots 3s linear infinite" }}>
        <circle cx="45" cy="45" r="40" fill="none"
          stroke={COLOR.primary} strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="8 10"
          opacity="0.5"
        />
      </svg>

      {/* Logo with heartbeat */}
      <img
        src={toAbsoluteUrl("/media/logos/sai_logo2.png")}
        alt="Logo"
        style={{
          width: 60, height: 60,
          borderRadius: "50%",
          objectFit: "cover",
          position: "relative", zIndex: 1,
          animation: "heartbeat 1.6s ease-in-out infinite",
          boxShadow: `0 4px 20px -4px ${COLOR.primary}66`,
        }}
      />
    </div>

    <div style={{ textAlign: "center" }}>
      <p style={{ fontSize: 15, fontWeight: 600, color: COLOR.ink }}>Verifying your identity...</p>
      <p style={{ fontSize: 12, color: COLOR.inkMute, marginTop: 4 }}>Setting up your tasting session</p>
    </div>
  </div>
);

// ─── Progress ring ────────────────────────────────────────────────────────
const ProgressRing = ({ pct, size = 40, stroke = 4 }) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={COLOR.line} strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={COLOR.leaf} strokeWidth={stroke}
        strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 400ms ease" }} />
    </svg>
  );
};

const LoginGate = ({ token, onVerified }) => {
  const [accessCode, setAccessCode] = useState("");
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [focused, setFocused] = useState(false);

  const handleVerify = async () => {
    if (!accessCode.trim()) {
      setError("Please enter the access code");
      return;
    }
    setError("");
    setVerifying(true);
    try {
      const res = await GetFoodTestingMenu({ token, accessCode });
      if (res?.data?.success) {
        onVerified(res.data.data);
      } else {
        setError(res?.data?.msg || "Invalid code or expired link");
      }
    } catch (err) {
      setError(err?.response?.data?.msg || "Verification failed");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 overflow-y-auto" style={{ background: COLOR.paper }}>

      {/* ── Curved red header ── */}
      <div
        style={{
          background: COLOR.primary,
          borderBottomLeftRadius: "50% 20px",
          borderBottomRightRadius: "50% 20px",
        }}
        className="flex flex-col items-center justify-center pt-10 pb-14 px-4"
      >
        <img
          src={toAbsoluteUrl("/media/logos/sai_logo.png")}
          alt="Logo"
          style={{ width: 150, height: 90, objectFit: "contain" }}
        />
      </div>

      {/* ── Card ── */}
      <div className="flex flex-col items-center px-4 -mt-6">
        <div
          className="w-full max-w-sm rounded-3xl p-6 md:p-8"
          style={{
            background: COLOR.card,
            boxShadow: "0 8px 40px rgba(178,10,10,0.10)",
            border: `1px solid ${COLOR.line}`,
          }}
        >
          {/* Title */}
          <div className="text-center my-6">
            <div
              className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
              style={{ background: COLOR.primaryLight, border: `1.5px solid ${COLOR.line}` }}
            >
              <ShieldCheck size={26} color={COLOR.primary} />
            </div>
            <h1 className="text-xl md:text-2xl font-bold m-0" style={{ color: COLOR.ink }}>
              Your Digital Menu Manager
            </h1>
            <p className="text-sm mt-2 m-0 leading-relaxed" style={{ color: COLOR.inkMute }}>
              Enter the access code shared with you to begin your tasting session
            </p>
          </div>

          {/* Input */}
          <label
            className="text-[11px] font-mono uppercase tracking-widest block mb-1.5"
            style={{ color: COLOR.inkMute }}
          >
            Access Code <span style={{ color: COLOR.chili }}>*</span>
          </label>
          <input
            type="text"
            className="w-full h-12 px-4 rounded-xl text-[15px] font-bold font-mono tracking-widest outline-none"
            style={{
              border: error
                ? `1.5px solid ${COLOR.chili}`
                : focused
                ? `1.5px solid ${COLOR.primary}`
                : `1.5px solid ${COLOR.line}`,
              color: COLOR.primary,
              background: COLOR.paper,
              transition: "border-color 0.2s",
            }}
            placeholder="e.g. MKC145D260027"
            value={accessCode}
            onChange={(e) => { setAccessCode(e.target.value.toUpperCase()); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleVerify()}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            autoFocus
          />

          {/* Error */}
          {error && (
            <div
              className="flex items-center gap-2 mt-2 px-3 py-2 rounded-xl"
              style={{ background: `${COLOR.chili}10`, border: `1px solid ${COLOR.chili}30` }}
            >
              <span style={{ color: COLOR.chili, fontSize: 14 }}>⚠</span>
              <p className="text-xs font-semibold m-0" style={{ color: COLOR.chili }}>
                {error}
              </p>
            </div>
          )}

          {/* Button */}
          <button
            onClick={handleVerify}
            disabled={verifying}
            className="w-full h-12 rounded-xl text-sm font-bold flex items-center justify-center gap-2 mt-4"
            style={{
              background: verifying ? COLOR.line : COLOR.primary,
              color: verifying ? COLOR.inkFaint : "#FFF8EC",
              cursor: verifying ? "not-allowed" : "pointer",
              transition: "background 0.2s",
              border: "none",
            }}
          >
            {verifying
              ? <><Loader2 size={15} className="animate-spin" /> Verifying...</>
              : <><ShieldCheck size={15} /> Access Menu →</>
            }
          </button>

          {/* Helper note */}
          <p className="text-center text-xs mt-4 m-0" style={{ color: COLOR.inkFaint }}>
            The access code was shared with you by the event organizer
          </p>
        </div>

        {/* Bottom branding */}
        <p className="text-xs mt-6 mb-8" style={{ color: COLOR.inkFaint }}>
          Powered by <span style={{ color: COLOR.primary, fontWeight: 700 }}>Sai Caterers</span>
        </p>
      </div>
    </div>
  );
};

// ─── Category rail (mobile) ───────────────────────────────────────────────
// NOTE: categories no longer carry an `icon` component reference.
// We resolve the icon via getCategoryIcon(cat.iconKey) at render time.
const CategoryRail = ({ categories, items, activeId, onSelect, reviews }) => (
  <div className="flex gap-2 overflow-x-auto px-3 py-2.5" style={{ scrollbarWidth: "none" }}>
    {categories.map((cat) => {
      const catItems = items.filter((i) => i.categoryId === cat.id);
      const done = catItems.filter((i) => reviews[i.id]).length;
      const active = cat.id === activeId;
      const Icon = getCategoryIcon(cat.iconKey);
      return (
        <button key={cat.id} onClick={() => onSelect(cat.id)}
          className="shrink-0 flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all"
          style={{ background: active ? COLOR.primary : COLOR.card, color: active ? "#FFF8EC" : COLOR.ink, border: active ? "none" : `1px solid ${COLOR.line}` }}>
          <Icon size={15} />
          {cat.name}
          <span className="text-[11px] font-mono rounded-full px-1.5"
            style={{ background: active ? "rgba(255,255,255,0.18)" : COLOR.linePale, color: active ? "#FFF8EC" : COLOR.inkMute }}>
            {done}/{catItems.length}
          </span>
        </button>
      );
    })}
  </div>
);

// ─── Category sidebar (desktop) ───────────────────────────────────────────
const CategorySidebar = ({ categories, items, activeId, onSelect, reviews }) => (
  <div className="w-72 shrink-0 overflow-y-auto py-3 px-3" style={{ borderRight: `1px solid ${COLOR.line}`, background: COLOR.cardAlt }}>
    <p className="text-[11px] font-mono uppercase tracking-widest px-2 mb-2" style={{ color: COLOR.inkMute }}>Menu Sections</p>
    <div className="flex flex-col gap-1.5">
      {categories.map((cat) => {
        const catItems = items.filter((i) => i.categoryId === cat.id);
        const done = catItems.filter((i) => reviews[i.id]).length;
        const active = cat.id === activeId;
        const Icon = getCategoryIcon(cat.iconKey);
        return (
          <button key={cat.id} onClick={() => onSelect(cat.id)}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-all"
            style={{ background: active ? COLOR.primary : "transparent" }}>
            <Icon size={16} color={active ? "#FFF8EC" : COLOR.inkMute} />
            <span className="flex-1 text-sm font-semibold" style={{ color: active ? "#FFF8EC" : COLOR.ink }}>{cat.name}</span>
            <span className="text-[10.5px] font-mono px-1.5 py-0.5 rounded-full"
              style={{ background: active ? "rgba(255,255,255,0.18)" : COLOR.linePale, color: active ? "#FFF8EC" : COLOR.inkMute }}>
              {done}/{catItems.length}
            </span>
          </button>
        );
      })}
    </div>
  </div>
);

// ─── Item row ─────────────────────────────────────────────────────────────
const ItemRow = ({ item, review, selected, onToggleSelect, onOpen }) => {
  const rating = review && RATINGS.find((r) => r.id === review.rating);
  return (
    <div className="w-full flex items-center gap-3 text-left px-4 py-3.5 rounded-2xl transition-all"
      style={{ background: COLOR.card, border: selected ? `1.5px solid ${COLOR.primary}44` : `1.5px solid ${COLOR.line}` }}>
      <button onClick={() => onToggleSelect(item.id)}
        className="shrink-0 flex items-center justify-center rounded-md transition-all"
        style={{ width: 22, height: 22, border: selected ? `2px solid ${COLOR.primary}` : `2px solid ${COLOR.line}`, background: selected ? COLOR.primary : "transparent" }}>
        {selected && <Check size={13} color="#fff" strokeWidth={3} />}
      </button>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[15px] m-0" style={{ color: COLOR.ink }}>{item.name}</p>
        <p className="text-[12.5px] mt-0.5 m-0 truncate" style={{ color: COLOR.inkMute }}>{item.desc}</p>
        {review?.remark && (
          <p className="text-[11.5px] mt-1 m-0 italic truncate" style={{ color: COLOR.inkFaint }}>"{review.remark}"</p>
        )}
      </div>
      {selected && (
        rating ? (
          <button onClick={() => onOpen(item)}
            className="shrink-0 flex items-center justify-center rounded-full"
            style={{ width: 40, height: 40, background: COLOR.paper, border: `1.5px dashed ${rating.color}`, transform: "rotate(-6deg)" }}>
            <span style={{ fontSize: 18 }}>{rating.emoji}</span>
          </button>
        ) : (
          <button onClick={() => onOpen(item)}
            className="shrink-0 flex items-center gap-1 text-xs font-semibold"
            style={{ color: COLOR.inkMute, border: `1px dashed ${COLOR.line}`, borderRadius: 8, padding: "4px 8px" }}>
            Rate <ChevronRight size={13} />
          </button>
        )
      )}
    </div>
  );
};

// ─── Review sheet ─────────────────────────────────────────────────────────
const ReviewSheet = ({ item, draftRating, setDraftRating, draftRemark, setDraftRemark, onSave, onRemove, onClose, hasExisting, translating }) => {
  if (!item) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center md:justify-center"
      style={{ background: "rgba(43,16,16,0.45)" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}
        className="w-full md:max-w-md rounded-t-3xl md:rounded-3xl p-5 md:p-6"
        style={{ background: COLOR.card, boxShadow: "0 -10px 40px rgba(0,0,0,0.18)" }}>
        <div className="md:hidden w-10 h-1.5 rounded-full mx-auto mb-4" style={{ background: COLOR.line }} />
        <p className="text-[11px] font-mono uppercase tracking-widest m-0" style={{ color: COLOR.inkMute }}>Tasting note</p>
        <h3 className="text-xl font-bold mt-1 mb-4" style={{ color: COLOR.ink }}>{item.name}</h3>
        <p className="text-sm font-semibold mb-2.5" style={{ color: COLOR.ink }}>How was it?</p>
        <div className="grid grid-cols-3 gap-2.5 mb-5">
          {RATINGS.map((r) => {
            const sel = draftRating === r.id;
            return (
              <button key={r.id} onClick={() => setDraftRating(r.id)}
                className="flex flex-col items-center gap-1.5 rounded-2xl py-3.5 transition-all"
                style={{ border: sel ? `2px solid ${r.color}` : `2px solid ${COLOR.line}`, background: sel ? `color-mix(in srgb, ${r.color} 14%, white)` : COLOR.cardAlt, transform: sel ? "scale(1.04)" : "scale(1)" }}>
                <span style={{ fontSize: 26 }}>{r.emoji}</span>
                <span className="text-[11.5px] font-bold" style={{ color: sel ? r.color : COLOR.inkMute }}>{r.label}</span>
              </button>
            );
          })}
        </div>
        <p className="text-sm font-semibold mb-2" style={{ color: COLOR.ink }}>
          Anything to add? <span className="font-normal" style={{ color: COLOR.inkMute }}>(optional)</span>
        </p>
        <textarea value={draftRemark} onChange={(e) => setDraftRemark(e.target.value)} rows={3}
          placeholder="Too spicy, perfect portion, needs more salt..."
          className="w-full rounded-xl px-3.5 py-2.5 text-sm resize-none outline-none mb-5"
          style={{ border: `1.5px solid ${COLOR.line}`, color: COLOR.ink }} />
        <div className="flex gap-2.5">
          {hasExisting && (
            <button onClick={onRemove} className="h-12 px-4 rounded-xl text-sm font-bold"
              style={{ border: `1.5px solid ${COLOR.line}`, color: COLOR.chili, background: COLOR.card }}>
              Remove
            </button>
          )}
          <button
            onClick={onSave}
            disabled={translating}
            className="flex-1 h-12 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
            style={{
              background: translating ? COLOR.line : COLOR.primary,
              color: translating ? COLOR.inkFaint : "#FFF8EC",
              cursor: translating ? "not-allowed" : "pointer",
            }}
          >
            {translating
              ? <><Loader2 size={15} className="animate-spin" /> Saving...</>
              : <><Check size={16} /> Save</>
            }
          </button>
        </div>
      </div>
    </div>
  );
};

const MenuHeader = ({ eventName, reviewedCount, totalItems }) => {
  const pct = totalItems ? Math.round((reviewedCount / totalItems) * 100) : 0;
  return (
    <div className="shrink-0" style={{ position: "sticky", top: 0, zIndex: 100 }}>
      <div style={{
        background: COLOR.primary,
        padding: "18px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderBottomLeftRadius: "20%",
        borderBottomRightRadius: "20%",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <img
              src={toAbsoluteUrl("/media/logos/sai_logo.png")}
              alt="Logo"
              style={{ width: 100, height: 60 }}
            />
          </div>
        </div>
      </div>

      {/* ── Existing info bar (event name + progress ring) — no logo ── */}
      <div className="px-4 py-3 flex items-center justify-between"
        style={{ background: COLOR.cardAlt, borderBottom: `1px solid ${COLOR.line}` }}>
        <div className="min-w-0">
          <p className="text-sm font-serif  uppercase tracking-widest m-0" style={{ color: COLOR.primary }}>
            Guest Tasting Review
          </p>
          <p className="text-sm font-bold truncate m-0" style={{ color: COLOR.ink }}>
            {eventName}
          </p>
        </div>
        <div className="relative shrink-0" style={{ width: 44, height: 44 }}>
          <ProgressRing pct={pct} size={44} stroke={4} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[11px]  font-bold" style={{ color: COLOR.ink }}>
              {reviewedCount}/{totalItems}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Submit bar ───────────────────────────────────────────────────────────
const SubmitBar = ({ selectedCount, reviewedCount, submitting, onSubmit }) => (
  <div className="shrink-0 px-4 py-3 flex items-center gap-3"
    style={{ background: COLOR.cardAlt, borderTop: `1px solid ${COLOR.line}` }}>
    <div className="flex-1">
      <p className="text-xs font-semibold m-0" style={{ color: COLOR.ink }}>
        {selectedCount} item{selectedCount === 1 ? "" : "s"} selected
        {reviewedCount > 0 && ` · ${reviewedCount} rated`}
      </p>
      <p className="text-[11px] m-0" style={{ color: COLOR.inkMute }}>Tap any dish to rate it</p>
    </div>
    <button onClick={onSubmit} disabled={selectedCount === 0 || submitting}
      className="h-11 px-5 rounded-xl text-sm font-bold flex items-center gap-2"
      style={{ background: selectedCount > 0 ? COLOR.primary : COLOR.line, color: selectedCount > 0 ? "#FFF8EC" : COLOR.inkFaint, cursor: selectedCount > 0 ? "pointer" : "not-allowed" }}>
      {submitting ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
      {submitting ? "Submitting..." : "Submit My Reviews"}
    </button>
  </div>
);

// ─── Done screen ──────────────────────────────────────────────────────────
const DoneScreen = ({ items, reviews, selections }) => {
  const selected = items.filter((i) => selections[i.id]);

  return (
    <div className="fixed inset-0 overflow-y-auto" style={{ background: COLOR.paper }}>

      {/* ── Header ── */}
      <div style={{ background: COLOR.primary, borderBottomLeftRadius: "50% 20px", borderBottomRightRadius: "50% 20px" }}
        className="flex flex-col items-center justify-center pt-8 pb-10 px-4 mb-6">
        <img
          src={toAbsoluteUrl("/media/logos/sai_logo.png")}
          alt="Logo"
          style={{ width: 150, height: 90, objectFit: "contain" }}
        />
      </div>

      {/* ── Title ── */}
      <div className="text-center px-4 mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-4"
          style={{ background: COLOR.leaf + "18", border: `2px solid ${COLOR.leaf}` }}>
          <span style={{ fontSize: 28 }}>✓</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold m-0" style={{ color: COLOR.ink }}>
          Reviews Submitted
        </h2>
        <p className="text-sm md:text-base mt-2 m-0" style={{ color: COLOR.inkMute }}>
          Thank you for tasting! Here's what you shared.
        </p>

        {/* Summary pill */}
        <div className="inline-flex items-center gap-3 mt-4 px-5 py-2 rounded-full"
          style={{ background: COLOR.primaryLight, border: `1px solid ${COLOR.line}` }}>
          <span className="text-sm font-bold" style={{ color: COLOR.primary }}>
            {selected.length} item{selected.length !== 1 ? "s" : ""} tasted
          </span>
          <span style={{ color: COLOR.line }}>·</span>
          <span className="text-sm font-bold" style={{ color: COLOR.leaf }}>
            {selected.filter((i) => reviews[i.id]?.rating).length} rated
          </span>
        </div>
      </div>

      {/* ── Cards grid — 1 col mobile, 2 col tablet, 3 col desktop ── */}
      <div className="px-4 md:px-8 lg:px-12 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-5xl mx-auto">
          {selected.map((item) => {
            const rev = reviews[item.id];
            const r = rev?.rating ? RATINGS.find((x) => x.id === rev.rating) : null;
            return (
              <div key={item.id}
                className="rounded-2xl p-4 flex gap-3 items-start"
                style={{
                  background: COLOR.card,
                  border: r ? `1.5px solid ${r.color}22` : `1px solid ${COLOR.line}`,
                  boxShadow: r ? `0 2px 12px ${r.color}10` : "none",
                }}>

                {/* Emoji badge */}
                <div className="shrink-0 flex items-center justify-center rounded-full"
                  style={{
                    width: 44, height: 44,
                    background: r ? `${r.color}10` : COLOR.paper,
                    border: `1.5px dashed ${r ? r.color : COLOR.line}`,
                    transform: "rotate(-6deg)",
                    flexShrink: 0,
                  }}>
                  <span style={{ fontSize: 20 }}>{r ? r.emoji : "·"}</span>
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-sm md:text-[15px] m-0 leading-snug"
                    style={{ color: COLOR.ink }}>
                    {item.name}
                  </p>
                  {item.nameHindi && item.nameHindi !== item.name && (
                    <p className="text-xs m-0 mt-0.5" style={{ color: COLOR.inkFaint }}>
                      {item.nameHindi}
                    </p>
                  )}
                  <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                    {r ? (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ background: `${r.color}15`, color: r.color }}>
                        {r.emoji} {r.label}
                      </span>
                    ) : (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: COLOR.linePale, color: COLOR.inkFaint }}>
                        Not rated
                      </span>
                    )}
                  </div>
                  {rev?.remark && (
                    <p className="text-xs mt-1.5 m-0 italic leading-snug"
                      style={{ color: COLOR.inkMute }}>
                      "{rev.remark}"
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Google Review CTA ── */}
        <div className="max-w-5xl mx-auto mt-8">
          <div
            className="rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left"
            style={{
              background: COLOR.card,
              border: `1.5px solid ${COLOR.line}`,
              boxShadow: "0 2px 16px rgba(178,10,10,0.06)",
            }}
          >
            {/* Google icon */}
            <div
              className="shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: "#f8f9fa", border: "1.5px solid #e8eaed" }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-base m-0" style={{ color: COLOR.ink }}>
                Enjoyed the tasting?
              </p>
              <p className="text-sm mt-0.5 m-0" style={{ color: COLOR.inkMute }}>
                Share your experience on Google — it means the world to us!
              </p>
            </div>

            <a
              href="https://g.page/r/CXvupOHSRXFIEAE/review"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all"
              style={{
                background: COLOR.primary,
                color: "#fff",
                textDecoration: "none",
                boxShadow: "0 2px 8px rgba(66,133,244,0.3)",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = COLOR.primaryDark}
              onMouseLeave={(e) => e.currentTarget.style.background = COLOR.primary}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              Write a Review
            </a>
          </div>
        </div>

        {/* ── Footer note ── */}
        <p className="text-center text-xs mt-10" style={{ color: COLOR.inkFaint }}>
          You can safely close this page now.
        </p>
      </div>
    </div>
  );
};

const SESSION_KEY = "tasting_session";

const GuestMenuReviewPage = () => {

  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [step, setStep] = useState("login");
  const [menuData, setMenuData] = useState(null);
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [reviews, setReviews] = useState({});
  const [sheetItem, setSheetItem] = useState(null);
  const [draftRating, setDraftRating] = useState(null);
  const [draftRemark, setDraftRemark] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [selections, setSelections] = useState({});
  const selectedCount = Object.keys(selections).length;
  const [dynamicCategories, setDynamicCategories] = useState([]);
  const [dynamicItems, setDynamicItems] = useState([]);
  const [translating, setTranslating] = useState(false);
  const [existingRecordId, setExistingRecordId] = useState(0);
  const [rehydrated, setRehydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Only restore if it matches the current token (avoid leaking across links)
        if (parsed.token === token) {
          setMenuData(parsed.menuData);
          setDynamicCategories(parsed.dynamicCategories);
          setDynamicItems(parsed.dynamicItems);
          setSelections(parsed.selections);
          setReviews(parsed.reviews);
          setExistingRecordId(parsed.existingRecordId ?? 0);
          setActiveCategoryId(parsed.activeCategoryId);
          setStep(parsed.step === "loading" ? "menu" : parsed.step); // skip loader on restore
        }
      }
    } catch (err) {
      console.error("Session restore failed:", err);
    } finally {
      setRehydrated(true);
    }
  }, [token]);

  useEffect(() => {
    if (!menuData) return; // nothing to persist before login
    try {
      // NOTE: dynamicCategories/dynamicItems are plain JSON-safe objects
      // (no component references inside them) — safe to persist.
      sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify({
          token,
          menuData,
          dynamicCategories,
          dynamicItems,
          selections,
          reviews,
          existingRecordId,
          activeCategoryId,
          step,
        })
      );
    } catch (err) {
      console.error("Session save failed:", err);
    }
  }, [token, menuData, dynamicCategories, dynamicItems, selections, reviews, existingRecordId, activeCategoryId, step]);

  useEffect(() => {
    const selectors = ["[class*='sidebar']", "[id*='sidebar']", "aside", "nav", "[class*='Layout']", "[class*='drawer']"];
    const hidden = [];
    selectors.forEach((sel) => {
      document.querySelectorAll(sel).forEach((el) => {
        if (!el.closest("#guest-review-page")) {
          hidden.push({ el, prev: el.style.display });
          el.style.display = "none";
        }
      });
    });
    document.body.style.overflow = "hidden";
    return () => {
      hidden.forEach(({ el, prev }) => (el.style.display = prev));
      document.body.style.overflow = "";
    };
  }, []);

  const totalItems = dynamicItems.length;
  const reviewedCount = Object.keys(reviews).length;

  const openItem = (item) => {
    const existing = reviews[item.id];
    setDraftRating(existing ? existing.rating : null);
    setDraftRemark(existing ? existing.remark : "");
    setSheetItem(item);
  };
  const closeSheet = () => setSheetItem(null);

  const saveReview = async () => {
    const remark = draftRemark.trim();
    setTranslating(true);
    let notesEnglish = remark;
    let notesHindi = "";
    let notesGujarati = "";

    if (remark) {
      try {
        const res = await Translateapi(remark);
        const { regional, hindi } = extractTranslations(res.data);
        notesHindi = hindi;
        notesGujarati = regional;
      } catch (err) {
        console.error("Translation error:", err);
      }
    }

    setReviews((prev) => ({
      ...prev,
      [sheetItem.id]: {
        rating: draftRating || null,
        remark,
        notesEnglish,
        notesHindi,
        notesGujarati,
      },
    }));
    setTranslating(false);
    setSheetItem(null);
  };

  const removeReview = () => {
    setReviews((prev) => { const next = { ...prev }; delete next[sheetItem.id]; return next; });
    setSheetItem(null);
  };

  const toggleSelect = (itemId) => {
    setSelections((prev) => {
      const next = { ...prev };
      if (next[itemId]) {
        delete next[itemId];
        setReviews((r) => { const rn = { ...r }; delete rn[itemId]; return rn; });
      } else {
        next[itemId] = true;
      }
      return next;
    });
  };

  // Builds the save payload from current state. Shared by manual submit
  // and the silent idle auto-save below, so the shape never drifts apart.
  const buildPayload = () => ({
    eventFunctionId: Number(menuData.eventFunctionId || 0),
    eventId: Number(menuData.eventId || 0),
    id: existingRecordId,
    testerId: Number(menuData.testerId || 0),
    userId: Number(menuData.userId || 0),
    selectedCat: dynamicCategories.map((cat, catIndex) => {
      const catItems = dynamicItems.filter((i) => i.categoryId === cat.id);
      const selectedCatItems = catItems.filter((i) => selections[i.id]);

      return {
        menuCatId: Number(cat.id),
        menuCatNameEnglish: cat.name || "",
        menuCatNameHindi: cat.nameHindi || cat.name || "",
        menuCatNameGujarati: cat.nameGujarati || cat.name || "",
        catNotesEnglish: "",
        catNotesHindi: "",
        catNotesGujarati: "",
        catSortOrder: catIndex,
        selectedMenuDetails: selectedCatItems.map((item, itemIndex) => {
          const rev = reviews[item.id];
          return {
            menuItemId: Number(item.id),
            menuItemNameEnglish: item.name || "",
            menuItemNameHindi: item.nameHindi || item.name || "",
            menuItemNameGujarati: item.nameGujarati || item.name || "",
            itemSlogan: item.desc || "",
            itemSortOrder: itemIndex,
            review: rev?.rating || "",
            clientNotes: rev?.remark || "",
            clientNotesHindi: rev?.notesHindi || "",
            clientNotesGujarati: rev?.notesGujarati || "",
            itemNotesEnglish: "",
            itemNotesHindi: "",
            itemNotesGujarati: "",
          };
        }),
      };
    }).filter((cat) => cat.selectedMenuDetails.length > 0), // only cats with selections
  });

  const handleSubmitAll = async () => {
    setSubmitting(true);
    try {
      const payload = buildPayload();
      const res = await SaveTesterMenu(payload);
      if (res?.data?.success) {
        setSubmitting(false);
        setStep("done");
        sessionStorage.removeItem(SESSION_KEY);
      } else {
        Swal.fire({
          icon: "error",
          title: res?.data?.msg || "Failed to submit reviews",
        });
        setSubmitting(false);
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: err?.response?.data?.msg || "Something went wrong",
      });
      setSubmitting(false);
    }
  };

  // ─── Idle auto-save ──────────────────────────────────────────────────
  // If the guest goes inactive (no click/tap/keypress/scroll) for
  // IDLE_AUTOSAVE_MS while mid-review, silently persist their progress
  // to the server (no toast, no Swal — just a background save). Doesn't
  // touch `submitting` state or navigate anywhere, so it's invisible.
  const idleTimerRef = useRef(null);
  const autoSavingRef = useRef(false);
  const lastAutoSavedSnapshotRef = useRef("");

  const runIdleAutoSave = async () => {
    // Only meaningful once menu data is loaded and we're on the review screen
    if (step !== "menu" || !menuData) return;
    // Nothing selected yet — nothing worth saving
    if (Object.keys(selections).length === 0) return;
    // Don't overlap with a manual submit or another auto-save in flight
    if (submitting || autoSavingRef.current) return;

    const payload = buildPayload();
    if (payload.selectedCat.length === 0) return;

    // Skip if nothing changed since the last auto-save
    const snapshot = JSON.stringify(payload);
    if (snapshot === lastAutoSavedSnapshotRef.current) return;

    autoSavingRef.current = true;
    try {
      const res = await SaveTesterMenu(payload);
      if (res?.data?.success) {
        lastAutoSavedSnapshotRef.current = snapshot;
        // Keep existingRecordId in sync so subsequent saves (manual or
        // auto) update the same record instead of creating duplicates.
        const newId = res?.data?.data?.id ?? res?.data?.id;
        if (newId) setExistingRecordId(newId);
      }
    } catch (err) {
      // Silent by design — don't interrupt the guest's flow.
      console.error("Idle auto-save failed:", err);
    } finally {
      autoSavingRef.current = false;
    }
  };

  useEffect(() => {
    if (step !== "menu") return;

    const IDLE_AUTOSAVE_MS = 60 * 1000; // 1 minute of inactivity

    const resetIdleTimer = () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => {
        runIdleAutoSave();
      }, IDLE_AUTOSAVE_MS);
    };

    const activityEvents = ["click", "touchstart", "keydown", "scroll", "mousemove"];
    activityEvents.forEach((evt) => window.addEventListener(evt, resetIdleTimer, { passive: true }));

    resetIdleTimer(); // start the timer as soon as we land on the menu

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      activityEvents.forEach((evt) => window.removeEventListener(evt, resetIdleTimer));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, menuData, dynamicCategories, dynamicItems, selections, reviews, existingRecordId, submitting]);

  const handleVerified = (data) => {
    setMenuData(data);

    // IMPORTANT: do NOT put a component reference (e.g. `icon: UtensilsCrossed`)
    // on these objects. They get JSON.stringify'd into sessionStorage on every
    // change, and JSON.stringify silently turns a function/component into `{}`.
    // On refresh, that `{}` gets passed to <Icon .../> as the element type,
    // which is exactly the "Element type is invalid ... but got: object" crash.
    // Instead we store a plain string key and resolve the real icon component
    // at render time via getCategoryIcon().
    const apiCategories = (data.menuPreparationItems || []).map((cat) => ({
      id: cat.menuCategoryId,
      name: cat.menuCategoryName,
      nameHindi: cat.menuCategoryNameHindi || cat.menuCategoryName,
      nameGujarati: cat.menuCategoryNameGujarati || cat.menuCategoryName,
      tagline: cat.menuSlogan || "",
      iconKey: "default", // plain string, JSON-safe — swap per-category if needed
    }));

    const apiItems = (data.menuPreparationItems || []).flatMap((cat) =>
      (cat.selectedMenuPreparationItems || []).map((item) => ({
        id: item.menuItemId,
        categoryId: cat.menuCategoryId,
        name: item.menuItemName,
        nameHindi: item.menuItemNameHindi || item.menuItemName,
        nameGujarati: item.menuItemNameGujarati || item.menuItemName,
        desc: item.itemSlogan || "",
        itemDbId: item.id,
      }))
    );

    setDynamicCategories(apiCategories);
    setDynamicItems(apiItems);

    // ── Pre-fill selections & reviews from previously saved data ──────────
    const existing = data.selectedMenuPreparation?.[0];

    if (existing?.selectedCat?.length) {
      const prefilledSelections = {};
      const prefilledReviews = {};

      existing.selectedCat.forEach((cat) => {
        (cat.selectedMenuDetails || []).forEach((detail) => {
          const itemId = detail.menuItemId;
          prefilledSelections[itemId] = true;
          prefilledReviews[itemId] = {
            rating: detail.review || null,
            remark: detail.clientNotes || "",
            notesEnglish: detail.clientNotes || "",
            notesHindi: detail.clientNotesHindi || "",
            notesGujarati: detail.clientNotesGujarati || "",
          };
        });
      });

      setSelections(prefilledSelections);
      setReviews(prefilledReviews);
    } else {
      setSelections({});
      setReviews({});
    }

    // ── Capture existing record id (for update instead of insert) ────────
    setExistingRecordId(existing?.id ?? 0);

    if (apiCategories.length > 0) {
      setActiveCategoryId(apiCategories[0].id);
    }

    setStep("loading");
    setTimeout(() => setStep("menu"), 1800);
  };

  if (step === "login") {
    return <LoginGate token={token} onVerified={handleVerified} />;
  }

  if (step === "loading") {
    return <LoaderScreen />;
  }

  if (!rehydrated) {
    return <LoaderScreen />;
  }

  if (step === "done") {
    return (
      <DoneScreen
        items={dynamicItems}
        reviews={reviews}
        selections={selections}
      />
    );
  }

  const activeCategory = dynamicCategories.find((c) => c.id === activeCategoryId);
  const catItems = dynamicItems.filter((i) => i.categoryId === activeCategoryId);

  return (
    <div id="guest-review-page" className="fixed inset-0 z-[9999] flex flex-col"
      style={{ background: COLOR.paper, fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <MenuHeader
        eventName={
          menuData
            ? `Event #${menuData.eventId} · Function #${menuData.eventFunctionId}`
            : "Tasting Session"
        }
        reviewedCount={reviewedCount}
        totalItems={totalItems}
      />

      {/* Mobile */}
      <div className="flex md:hidden flex-col flex-1 overflow-hidden">
        <CategoryRail
          categories={dynamicCategories}
          items={dynamicItems}
          activeId={activeCategoryId}
          onSelect={setActiveCategoryId}
          reviews={reviews}
        />
        <div className="flex-1 overflow-y-auto px-3.5 pb-3">
          {activeCategory?.tagline && (
            <p className="text-xs italic mb-2.5 mt-1" style={{ color: COLOR.inkMute }}>"{activeCategory.tagline}"</p>
          )}
          <div className="flex flex-col gap-2.5">
            {catItems.map((item) => (
              <ItemRow key={item.id} item={item} review={reviews[item.id]}
                selected={!!selections[item.id]} onToggleSelect={toggleSelect} onOpen={openItem} />
            ))}
          </div>
        </div>
        <SubmitBar selectedCount={selectedCount} reviewedCount={reviewedCount} submitting={submitting} onSubmit={handleSubmitAll} />
      </div>

      {/* Desktop */}
      <div className="hidden md:flex flex-1 overflow-hidden">
        <CategorySidebar
          categories={dynamicCategories}
          items={dynamicItems}
          activeId={activeCategoryId}
          onSelect={setActiveCategoryId}
          reviews={reviews}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 pt-5 pb-3 shrink-0">
            <h2 className="text-lg font-bold m-0" style={{ color: COLOR.ink }}>{activeCategory?.name}</h2>
            {activeCategory?.tagline && (
              <p className="text-sm italic mt-1 m-0" style={{ color: COLOR.inkMute }}>"{activeCategory.tagline}"</p>
            )}
          </div>
          <div className="flex-1 overflow-y-auto px-6 pb-4">
            <div className="grid grid-cols-2 gap-3">
              {catItems.map((item) => (
                <ItemRow key={item.id} item={item} review={reviews[item.id]}
                  selected={!!selections[item.id]} onToggleSelect={toggleSelect} onOpen={openItem} />
              ))}
            </div>
          </div>
          <SubmitBar selectedCount={selectedCount} reviewedCount={reviewedCount} submitting={submitting} onSubmit={handleSubmitAll} />
        </div>
      </div>

      <ReviewSheet item={sheetItem} draftRating={draftRating} setDraftRating={setDraftRating}
        draftRemark={draftRemark} setDraftRemark={setDraftRemark}
        onSave={saveReview} translating={translating} onRemove={removeReview} onClose={closeSheet}
        hasExisting={!!(sheetItem && reviews[sheetItem.id])} />
    </div>
  );
};

export default GuestMenuReviewPage;