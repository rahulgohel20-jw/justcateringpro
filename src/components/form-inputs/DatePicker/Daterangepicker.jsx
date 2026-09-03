import { useState, useCallback } from "react";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const DAYS = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const SHORT_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  // 0=Sun..6=Sat → convert to MO=0..SU=6
  const d = new Date(year, month, 1).getDay();
  return d === 0 ? 6 : d - 1;
}

function sameDay(a, b) {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function inRange(day, start, end) {
  if (!start || !end) return false;
  const t = day.getTime();
  const s = start.getTime();
  const e = end.getTime();
  return t > Math.min(s, e) && t < Math.max(s, e);
}

function formatDisplay(date) {
  if (!date) return "";
  return `${SHORT_MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

// ─── Single Month Calendar ────────────────────────────────────────────────────
function MonthCalendar({
  year,
  month,
  rangeStart,
  rangeEnd,
  hoverDate,
  onDayClick,
  onDayHover,
  onPrev,
  onNext,
  showPrev,
  showNext,
}) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const cells = [];

  // leading blanks
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  // trailing blanks to fill last row
  while (cells.length % 7 !== 0) cells.push(null);

  const effectiveEnd = rangeEnd || hoverDate;

  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <button
          onClick={onPrev}
          disabled={!showPrev}
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            border: "1.5px solid #e2e8f0",
            background: showPrev ? "#fff" : "transparent",
            cursor: showPrev ? "pointer" : "default",
            opacity: showPrev ? 1 : 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#64748b",
            transition: "all 0.15s",
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <span
          style={{
            fontWeight: 600,
            fontSize: 15,
            color: "#1e293b",
            letterSpacing: "-0.01em",
          }}
        >
          {MONTHS[month]} {year}
        </span>
        <button
          onClick={onNext}
          disabled={!showNext}
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            border: "1.5px solid #e2e8f0",
            background: showNext ? "#fff" : "transparent",
            cursor: showNext ? "pointer" : "default",
            opacity: showNext ? 1 : 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#64748b",
            transition: "all 0.15s",
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      {/* Day headers */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          marginBottom: 4,
        }}
      >
        {DAYS.map((d) => (
          <div
            key={d}
            style={{
              textAlign: "center",
              fontSize: 12,
              fontWeight: 600,
              color: "#94a3b8",
              paddingBottom: 8,
              letterSpacing: "0.05em",
            }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
        {cells.map((day, i) => {
          if (!day) return <div key={`blank-${i}`} />;

          const isStart = sameDay(day, rangeStart);
          const isEnd = sameDay(day, effectiveEnd);
          const isInRange = inRange(day, rangeStart, effectiveEnd);
          const isToday = sameDay(day, new Date());
          const isSelected = isStart || isEnd;

          // Range highlight logic
          const colIndex = i % 7;
          const isRangeStart =
            isStart && effectiveEnd && !sameDay(rangeStart, effectiveEnd);
          const isRangeEnd =
            isEnd && rangeStart && !sameDay(rangeStart, effectiveEnd);

          let bgColor = "transparent";
          let textColor = "#1e293b";
          let fontWeight = 400;
          let borderRadius = "50%";
          let cellBg = "transparent"; // for the row highlight

          if (isSelected) {
            bgColor = "#2563eb";
            textColor = "#fff";
            fontWeight = 600;
          } else if (isInRange) {
            textColor = "#1e40af";
            fontWeight = 500;
          }

          // Range row background
          let rowBgLeft = "transparent";
          let rowBgRight = "transparent";
          if (isInRange) {
            rowBgLeft = "#dbeafe";
            rowBgRight = "#dbeafe";
          }
          if (isRangeStart) {
            rowBgLeft = "transparent";
            rowBgRight = "#dbeafe";
          }
          if (isRangeEnd) {
            rowBgLeft = "#dbeafe";
            rowBgRight = "transparent";
          }

          return (
            <div
              key={day.toISOString()}
              style={{
                position: "relative",
                height: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onMouseEnter={() => onDayHover(day)}
              onMouseLeave={() => onDayHover(null)}
            >
              {/* Range row background */}
              {(isInRange || isRangeStart || isRangeEnd) && (
                <>
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      transform: "translateY(-50%)",
                      left: 0,
                      width: "50%",
                      height: 32,
                      background: rowBgLeft,
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      transform: "translateY(-50%)",
                      right: 0,
                      width: "50%",
                      height: 32,
                      background: rowBgRight,
                    }}
                  />
                </>
              )}

              <button
                onClick={() => onDayClick(day)}
                style={{
                  position: "relative",
                  zIndex: 1,
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  border:
                    isToday && !isSelected ? "1.5px solid #93c5fd" : "none",
                  background: bgColor,
                  color: textColor,
                  fontWeight,
                  fontSize: 14,
                  cursor: "pointer",
                  transition: "all 0.12s",
                  outline: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.background = "#f1f5f9";
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.background = bgColor;
                }}
              >
                {day.getDate()}
              </button>

              {/* Today dot */}
              {isToday && !isSelected && (
                <div
                  style={{
                    position: "absolute",
                    bottom: 3,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 4,
                    height: 4,
                    borderRadius: "50%",
                    background: "#2563eb",
                    zIndex: 2,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main DateRangePicker ─────────────────────────────────────────────────────
export default function DateRangePicker({
  startDate, // DD/MM/YYYY or null
  endDate, // DD/MM/YYYY or null
  onApply, // (dmy_start, dmy_end) => void
  onCancel, // () => void
}) {
  const parseDMY = (str) => {
    if (!str) return null;
    const [d, m, y] = str.split("/");
    return new Date(Number(y), Number(m) - 1, Number(d));
  };

  const today = new Date();
  const initLeft = startDate
    ? (() => {
        const d = parseDMY(startDate);
        return { year: d.getFullYear(), month: d.getMonth() };
      })()
    : { year: today.getFullYear(), month: today.getMonth() };

  // Right calendar = left + 1 month
  const getRight = (left) => {
    const m = left.month + 1;
    return m > 11
      ? { year: left.year + 1, month: 0 }
      : { year: left.year, month: m };
  };

  const [leftView, setLeftView] = useState(initLeft);
  const rightView = getRight(leftView);

  const [rangeStart, setRangeStart] = useState(parseDMY(startDate));
  const [rangeEnd, setRangeEnd] = useState(parseDMY(endDate));
  const [hoverDate, setHoverDate] = useState(null);
  const [selecting, setSelecting] = useState(!startDate); // true = waiting for end

  const handleDayClick = useCallback(
    (day) => {
      if (!rangeStart || !selecting) {
        // First click: set start, clear end
        setRangeStart(day);
        setRangeEnd(null);
        setSelecting(true);
      } else {
        // Second click: set end
        if (day < rangeStart) {
          setRangeEnd(rangeStart);
          setRangeStart(day);
        } else {
          setRangeEnd(day);
        }
        setSelecting(false);
      }
    },
    [rangeStart, selecting],
  );

  const handleApply = () => {
    if (!rangeStart || !rangeEnd) return;
    const fmt = (d) => {
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      return `${dd}/${mm}/${d.getFullYear()}`;
    };
    onApply(fmt(rangeStart), fmt(rangeEnd));
  };

  const prevMonth = () => {
    setLeftView((prev) => {
      if (prev.month === 0) return { year: prev.year - 1, month: 11 };
      return { year: prev.year, month: prev.month - 1 };
    });
  };

  const nextMonth = () => {
    setLeftView((prev) => {
      if (prev.month === 11) return { year: prev.year + 1, month: 0 };
      return { year: prev.year, month: prev.month + 1 };
    });
  };

  const rangeLabel = () => {
    if (!rangeStart) return "Select start date";
    if (!rangeEnd) return `${formatDisplay(rangeStart)} - select end date`;
    return `${formatDisplay(rangeStart)} - ${formatDisplay(rangeEnd)}`;
  };

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 20,
        boxShadow: "0 8px 40px rgba(0,0,0,0.13), 0 2px 8px rgba(0,0,0,0.06)",
        padding: "28px 28px 20px",
        width: "100%",
        maxWidth: 660,
        fontFamily: "'Inter', system-ui, sans-serif",
        userSelect: "none",
      }}
    >
      {/* Calendars */}
      <div style={{ display: "flex", gap: 32 }}>
        <MonthCalendar
          year={leftView.year}
          month={leftView.month}
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
          hoverDate={selecting ? hoverDate : null}
          onDayClick={handleDayClick}
          onDayHover={setHoverDate}
          onPrev={prevMonth}
          onNext={nextMonth}
          showPrev={true}
          showNext={false}
        />

        {/* Divider */}
        <div
          style={{
            width: 1,
            background: "#f1f5f9",
            flexShrink: 0,
            margin: "0 0",
          }}
        />

        <MonthCalendar
          year={rightView.year}
          month={rightView.month}
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
          hoverDate={selecting ? hoverDate : null}
          onDayClick={handleDayClick}
          onDayHover={setHoverDate}
          onPrev={prevMonth}
          onNext={nextMonth}
          showPrev={false}
          showNext={true}
        />
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: 20,
          paddingTop: 16,
          borderTop: "1px solid #f1f5f9",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <span style={{ fontSize: 14, color: "#64748b" }}>
          <span style={{ fontWeight: 500, color: "#94a3b8", marginRight: 4 }}>
            Range:
          </span>
          <span style={{ color: "#1e293b", fontWeight: 500 }}>
            {rangeLabel()}
          </span>
        </span>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              padding: "9px 22px",
              borderRadius: 10,
              border: "1.5px solid #e2e8f0",
              background: "#fff",
              color: "#475569",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={!rangeStart || !rangeEnd}
            style={{
              padding: "9px 22px",
              borderRadius: 10,
              border: "none",
              background: rangeStart && rangeEnd ? "#2563eb" : "#bfdbfe",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              cursor: rangeStart && rangeEnd ? "pointer" : "not-allowed",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              if (rangeStart && rangeEnd)
                e.currentTarget.style.background = "#1d4ed8";
            }}
            onMouseLeave={(e) => {
              if (rangeStart && rangeEnd)
                e.currentTarget.style.background = "#2563eb";
            }}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
