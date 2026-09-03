import { useState } from "react";
import {
  ClipboardList,
  Crown,
  ChevronDown,
  ChevronUp,
  Trash2,
  FolderOpen,
  Package,
  Sparkles,
} from "lucide-react";

const MiddlePanel = ({
  basicSelected = [],
  premiumSelected = [],
  onRemoveBasic,
  onRemovePremium,
  allMenuItems = [],
}) => {
  const [activeTab, setActiveTab] = useState("basic");
  const [expandedCats, setExpandedCats] = useState({});

  const toggleCat = (cat) =>
    setExpandedCats((prev) => ({ ...prev, [cat]: !prev[cat] }));

  const isBasic = activeTab === "basic";
  const selectedIds = isBasic ? basicSelected : premiumSelected;
  const onRemove = isBasic ? onRemoveBasic : onRemovePremium;

  const getItem = (id) => allMenuItems.find((i) => i.id === id);

  const selectedItems = selectedIds.map(getItem).filter(Boolean);

  const categoryMap = selectedItems.reduce((acc, item) => {
    const cat = item.category || "Uncategorized";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const categories = Object.entries(categoryMap);
  const totalItems = selectedIds.length;

  // Color scheme per tab
  const scheme = isBasic
    ? {
        tabBg: "bg-blue-50",
        tabText: "text-blue-700",
        tabBorder: "border-blue-200",
        badge: "bg-blue-600",
        catHeader: "bg-gradient-to-r from-blue-50 to-slate-50",
        catBorder: "border-blue-100",
        catIcon: "bg-blue-100 text-blue-600",
        dot: "bg-blue-500",
        countBadge: "bg-blue-600",
        rowHover: "hover:bg-blue-50/50",
        accent: "#2563eb",
        emptyIcon: "text-blue-300",
        headerGrad: "from-blue-600 to-blue-500",
      }
    : {
        tabBg: "bg-amber-50",
        tabText: "text-amber-700",
        tabBorder: "border-amber-200",
        badge: "bg-amber-500",
        catHeader: "bg-gradient-to-r from-amber-50 to-slate-50",
        catBorder: "border-amber-100",
        catIcon: "bg-amber-100 text-amber-600",
        dot: "bg-amber-500",
        countBadge: "bg-amber-500",
        rowHover: "hover:bg-amber-50/50",
        accent: "#d97706",
        emptyIcon: "text-amber-300",
        headerGrad: "from-amber-500 to-amber-400",
      };

  return (
    <div
      className="flex flex-col overflow-hidden h-full"
      style={{
        background: "#fff",
        borderRadius: "16px",
        boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
        border: "1px solid #e8edf3",
      }}
    >
      {/* ── Header ── */}
      <div
        className="flex-shrink-0 px-5 py-4"
        style={{
          background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
          borderBottom: "1px solid #e8edf3",
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2
              className="text-[15px] font-bold text-slate-800 tracking-tight"
              style={{ letterSpacing: "-0.01em" }}
            >
              Selected Menu Preview
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {totalItems} item{totalItems !== 1 ? "s" : ""} selected ·{" "}
              {categories.length} categor{categories.length !== 1 ? "ies" : "y"}
            </p>
          </div>
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold"
            style={{
              background: isBasic ? "#eff6ff" : "#fffbeb",
              color: isBasic ? "#2563eb" : "#d97706",
              border: `1px solid ${isBasic ? "#bfdbfe" : "#fde68a"}`,
            }}
          >
            {isBasic ? <Package size={12} /> : <Sparkles size={12} />}
            {isBasic ? "Basic" : "Premium"}
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div
        className="flex-shrink-0 flex gap-1 px-4 pt-3 pb-0"
        style={{ background: "#fff", borderBottom: "2px solid #f1f5f9" }}
      >
        {/* Basic tab */}
        <button
          onClick={() => setActiveTab("basic")}
          className="relative flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold transition-all rounded-t-lg"
          style={{
            background: isBasic ? "#eff6ff" : "transparent",
            color: isBasic ? "#2563eb" : "#94a3b8",
            borderBottom: isBasic ? "2px solid #2563eb" : "2px solid transparent",
            marginBottom: "-2px",
          }}
        >
          <ClipboardList size={14} />
          <span>Basic Package</span>
          <span
            className="text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[20px] text-center leading-none"
            style={{ background: isBasic ? "#2563eb" : "#cbd5e1", fontSize: "10px" }}
          >
            {basicSelected.length}
          </span>
        </button>

        {/* Premium tab */}
        <button
          onClick={() => setActiveTab("premium")}
          className="relative flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold transition-all rounded-t-lg"
          style={{
            background: !isBasic ? "#fffbeb" : "transparent",
            color: !isBasic ? "#d97706" : "#94a3b8",
            borderBottom: !isBasic ? "2px solid #d97706" : "2px solid transparent",
            marginBottom: "-2px",
          }}
        >
          <Crown size={14} />
          <span>Premium Package</span>
          <span
            className="text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[20px] text-center leading-none"
            style={{ background: !isBasic ? "#d97706" : "#cbd5e1", fontSize: "10px" }}
          >
            {premiumSelected.length}
          </span>
        </button>
      </div>

      {/* ── Category list ── */}
      <div
        className="flex-1 overflow-y-auto no-scrollbar"
        style={{
          padding: "12px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          background: "#f8fafc",
          minHeight: 0,
        }}
      >
        {/* Empty state */}
        {categories.length === 0 && (
          <div
            className="flex flex-col items-center justify-center"
            style={{ flex: 1, gap: "10px", opacity: 0.5, paddingTop: "40px" }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: isBasic ? "#eff6ff" : "#fffbeb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isBasic ? (
                <ClipboardList size={24} color={isBasic ? "#93c5fd" : "#fcd34d"} />
              ) : (
                <Crown size={24} color="#fcd34d" />
              )}
            </div>
            <div className="text-center">
              <p className="text-[13px] font-semibold text-slate-500">
                No items selected
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Click items from the grid to add them here
              </p>
            </div>
          </div>
        )}

        {/* Category cards */}
        {categories.map(([catName, catItems], catIdx) => {
          const isExpanded = expandedCats[catName] ?? true;

          return (
            <div
              key={catName}
              style={{
                background: "#fff",
                borderRadius: "12px",
                border: `1px solid ${isBasic ? "#dbeafe" : "#fde68a"}`,
                overflow: "hidden",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                flexShrink: 0,
              }}
            >
              {/* Category header */}
              <div
                onClick={() => toggleCat(catName)}
                className="flex items-center justify-between cursor-pointer select-none"
                style={{
                  padding: "10px 14px",
                  background: isBasic
                    ? "linear-gradient(135deg, #eff6ff 0%, #f8faff 100%)"
                    : "linear-gradient(135deg, #fffbeb 0%, #fffdf5 100%)",
                  borderBottom: isExpanded
                    ? `1px solid ${isBasic ? "#dbeafe" : "#fde68a"}`
                    : "none",
                }}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: "8px",
                      background: isBasic ? "#dbeafe" : "#fef3c7",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <FolderOpen
                      size={15}
                      color={isBasic ? "#2563eb" : "#d97706"}
                    />
                  </div>
                  <span
                    className="font-bold text-slate-800 truncate"
                    style={{ fontSize: "13px", maxWidth: "160px" }}
                    title={catName}
                  >
                    {catName}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span
                    className="text-white font-bold text-center"
                    style={{
                      fontSize: "11px",
                      background: isBasic ? "#2563eb" : "#d97706",
                      borderRadius: "20px",
                      padding: "2px 8px",
                      minWidth: "22px",
                    }}
                  >
                    {catItems.length}
                  </span>
                  <span style={{ color: "#94a3b8", lineHeight: 0 }}>
                    {isExpanded ? (
                      <ChevronUp size={15} />
                    ) : (
                      <ChevronDown size={15} />
                    )}
                  </span>
                </div>
              </div>

              {/* Items list */}
              {isExpanded && (
                <div>
                  {catItems.map((item, itemIdx) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 group"
                      style={{
                        padding: "9px 14px",
                        borderTop:
                          itemIdx === 0 ? "none" : "1px solid #f1f5f9",
                        background: "#fff",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = isBasic
                          ? "#f0f7ff"
                          : "#fffdf0")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "#fff")
                      }
                    >
                      {/* Sequence number */}
                      <span
                        className="font-bold flex-shrink-0"
                        style={{
                          fontSize: "10px",
                          color: isBasic ? "#93c5fd" : "#fcd34d",
                          width: "16px",
                          textAlign: "right",
                        }}
                      >
                        {itemIdx + 1}
                      </span>

                      {/* Dot */}
                      <span
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          background: isBasic ? "#3b82f6" : "#f59e0b",
                          flexShrink: 0,
                        }}
                      />

                      {/* Name — full display, wraps naturally */}
                      <span
                        className="flex-1 text-slate-700 font-medium"
                        style={{
                          fontSize: "12.5px",
                          lineHeight: "1.4",
                          wordBreak: "break-word",
                          minWidth: 0,
                        }}
                      >
                        {item.name}
                      </span>

                      {/* Delete */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemove(item.id);
                        }}
                        className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "7px",
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#f87171",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "#fff1f2")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                        title="Remove item"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Footer summary ── */}
      {categories.length > 0 && (
        <div
          className="flex-shrink-0 flex items-center justify-between px-4 py-3"
          style={{
            borderTop: "1px solid #f1f5f9",
            background: "#fff",
          }}
        >
          <span className="text-[11px] text-slate-400 font-medium">
            {categories.length} categor{categories.length !== 1 ? "ies" : "y"}
          </span>
          <span
            className="text-[11px] font-bold"
            style={{ color: isBasic ? "#2563eb" : "#d97706" }}
          >
            {totalItems} item{totalItems !== 1 ? "s" : ""} total
          </span>
        </div>
      )}
    </div>
  );
};

export default MiddlePanel;