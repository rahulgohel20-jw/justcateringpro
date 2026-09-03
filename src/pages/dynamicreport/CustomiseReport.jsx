import { useState, useRef } from "react";

const FONTS = [
  "Georgia",
  "Playfair Display",
  "Arial",
  "Verdana",
  "Times New Roman",
  "Trebuchet MS",
  "Courier New",
];
const FONT_WEIGHTS = ["300", "400", "500", "600", "700", "800"];

const defaultState = {
  heading: {
    text: "Heading",
    fontFamily: "Georgia",
    fontWeight: "700",
    fontSize: 32,
    lineHeight: 1.2,
    color: "#1a1a1a",
    alignment: "left",
  },
  subHeading: {
    text: "Sub Heading",
    fontFamily: "Georgia",
    fontWeight: "600",
    fontSize: 20,
    lineHeight: 1.4,
    color: "#4a7c59",
    alignment: "left",
  },
  body: {
    text: "Body",
    fontFamily: "Arial",
    fontWeight: "400",
    fontSize: 14,
    lineHeight: 1.6,
    color: "#6b8fa3",
    alignment: "left",
  },
  watermark: {
    text: "Watermark",
    color: "#c9a84c",
    fontSize: 14,
  },
  backgroundColor: "#f5ede0",
  backgroundImage: null,
  logo: null,
  logoSize: 60,
  logoAlignment: "center",
  imageRadius: 8,
  imageSize: 80,
};

const tabs = ["Heading", "Sub-Heading", "Body"];
const tabKeys = ["heading", "subHeading", "body"];

export default function CustomiseReport() {
  const [state, setState] = useState(defaultState);
  const [activeTab, setActiveTab] = useState("Heading");
  const [activeSection, setActiveSection] = useState("typography");
  const bgInputRef = useRef();
  const logoInputRef = useRef();

  const activeKey = tabKeys[tabs.indexOf(activeTab)];
  const activeTypo = state[activeKey];

  const updateTypo = (key, value) => {
    setState((s) => ({ ...s, [activeKey]: { ...s[activeKey], [key]: value } }));
  };

  const handleBgImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setState((s) => ({ ...s, backgroundImage: url }));
  };

  const handleLogo = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setState((s) => ({ ...s, logo: url }));
  };

  const alignIcon = (type) => {
    if (type === "left")
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <rect x="1" y="3" width="14" height="2" rx="1" />
          <rect x="1" y="7" width="10" height="2" rx="1" />
          <rect x="1" y="11" width="12" height="2" rx="1" />
        </svg>
      );
    if (type === "center")
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <rect x="1" y="3" width="14" height="2" rx="1" />
          <rect x="3" y="7" width="10" height="2" rx="1" />
          <rect x="2" y="11" width="12" height="2" rx="1" />
        </svg>
      );
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <rect x="1" y="3" width="14" height="2" rx="1" />
        <rect x="5" y="7" width="10" height="2" rx="1" />
        <rect x="3" y="11" width="12" height="2" rx="1" />
      </svg>
    );
  };

  const SectionHeader = ({ id, icon, label }) => (
    <button
      onClick={() => setActiveSection(activeSection === id ? null : id)}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "10px 0",
        marginBottom: 4,
        color: "#1a1a2e",
        fontWeight: 600,
        fontSize: 13,
        borderBottom: "1px solid #e8e0d8",
      }}
    >
      <span style={{ fontSize: 15 }}>{icon}</span>
      <span>{label}</span>
      <span style={{ marginLeft: "auto", fontSize: 11, color: "#999" }}>
        {activeSection === id ? "▲" : "▼"}
      </span>
    </button>
  );

  const previewTextAlign = (align) => {
    if (align === "left") return "left";
    if (align === "center") return "center";
    return "right";
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        background: "#f0ebe4",
      }}
    >
      {/* Top Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 24px",
          background: "#fff",
          borderBottom: "1px solid #e8e0d8",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        }}
      >
        <div>
          <div style={{ fontWeight: 700, fontSize: 16, color: "#1a1a2e" }}>
            Report Design Template Editor
          </div>
          <div style={{ fontSize: 12, color: "#888", marginTop: 1 }}>
            Customize your event report design effortlessly.
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setState(defaultState)}
            style={{
              padding: "7px 18px",
              borderRadius: 7,
              border: "1px solid #ddd",
              background: "#fff",
              color: "#555",
              fontSize: 13,
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            Cancel
          </button>
          <button
            style={{
              padding: "7px 20px",
              borderRadius: 7,
              border: "none",
              background: "#2563eb",
              color: "#fff",
              fontSize: 13,
              cursor: "pointer",
              fontWeight: 600,
              boxShadow: "0 2px 8px rgba(37,99,235,0.18)",
            }}
          >
            Save Changes
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Preview */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 32,
            background: "#ede8e0",
            overflow: "auto",
          }}
        >
          <div
            style={{
              width: 320,
              minHeight: 480,
              background: state.backgroundColor,
              backgroundImage: state.backgroundImage
                ? `url(${state.backgroundImage})`
                : "none",
              backgroundSize: "cover",
              backgroundPosition: "center",
              borderRadius: 16,
              boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
              padding: 28,
              position: "relative",
              overflow: "hidden",
              border: "2px solid #c9a84c33",
            }}
          >
            {/* Gold frame decoration */}
            <div
              style={{
                position: "absolute",
                inset: 10,
                border: "1.5px solid #c9a84c88",
                borderRadius: 10,
                pointerEvents: "none",
                zIndex: 0,
              }}
            />

            <div style={{ position: "relative", zIndex: 1 }}>
              {/* Logo */}
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    state.logoAlignment === "left"
                      ? "flex-start"
                      : state.logoAlignment === "right"
                        ? "flex-end"
                        : "center",
                  marginBottom: 14,
                }}
              >
                {state.logo ? (
                  <img
                    src={state.logo}
                    alt="Logo"
                    style={{
                      width: state.logoSize,
                      height: state.logoSize,
                      objectFit: "contain",
                      borderRadius: 6,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: state.logoSize * 1.6,
                      height: state.logoSize * 0.5,
                      background: "#fff",
                      border: "1px solid #ddd",
                      borderRadius: 6,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#999",
                      fontSize: 12,
                      fontWeight: 500,
                      minWidth: 80,
                    }}
                  >
                    LOGO
                  </div>
                )}
              </div>

              {/* Heading */}
              <div
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) =>
                  setState((s) => ({
                    ...s,
                    heading: { ...s.heading, text: e.target.innerText },
                  }))
                }
                style={{
                  fontSize: state.heading.fontSize,
                  fontFamily: state.heading.fontFamily,
                  fontWeight: state.heading.fontWeight,
                  lineHeight: state.heading.lineHeight,
                  color: state.heading.color,
                  textAlign: previewTextAlign(state.heading.alignment),
                  marginBottom: 6,
                  outline: "none",
                  cursor: "text",
                }}
              >
                {state.heading.text}
              </div>

              {/* Sub Heading */}
              <div
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) =>
                  setState((s) => ({
                    ...s,
                    subHeading: { ...s.subHeading, text: e.target.innerText },
                  }))
                }
                style={{
                  fontSize: state.subHeading.fontSize,
                  fontFamily: state.subHeading.fontFamily,
                  fontWeight: state.subHeading.fontWeight,
                  lineHeight: state.subHeading.lineHeight,
                  color: state.subHeading.color,
                  textAlign: previewTextAlign(state.subHeading.alignment),
                  marginBottom: 6,
                  outline: "none",
                  cursor: "text",
                }}
              >
                {state.subHeading.text}
              </div>

              {/* Body */}
              <div
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) =>
                  setState((s) => ({
                    ...s,
                    body: { ...s.body, text: e.target.innerText },
                  }))
                }
                style={{
                  fontSize: state.body.fontSize,
                  fontFamily: state.body.fontFamily,
                  fontWeight: state.body.fontWeight,
                  lineHeight: state.body.lineHeight,
                  color: state.body.color,
                  textAlign: previewTextAlign(state.body.alignment),
                  marginBottom: 16,
                  outline: "none",
                  cursor: "text",
                }}
              >
                {state.body.text}
              </div>

              {/* Watermark */}
              <div
                style={{
                  margin: "12px 0",
                  padding: "8px 16px",
                  border: `1.5px solid ${state.watermark.color}`,
                  borderRadius: 6,
                  textAlign: "center",
                  color: state.watermark.color,
                  fontSize: state.watermark.fontSize,
                  fontWeight: 500,
                  letterSpacing: 1,
                  background: "rgba(255,255,255,0.3)",
                }}
              >
                <span
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) =>
                    setState((s) => ({
                      ...s,
                      watermark: { ...s.watermark, text: e.target.innerText },
                    }))
                  }
                  style={{ outline: "none", cursor: "text" }}
                >
                  {state.watermark.text}
                </span>
              </div>

              {/* Image placeholder */}
              <div
                style={{
                  marginTop: 14,
                  width: `${state.imageSize}%`,
                  paddingBottom: `${state.imageSize * 0.6}%`,
                  background: "rgba(255,255,255,0.7)",
                  border: "1.5px dashed #c9a84c88",
                  borderRadius: state.imageRadius,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#b0a090",
                  fontSize: 13,
                  position: "relative",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%,-50%)",
                    whiteSpace: "nowrap",
                  }}
                >
                  Image
                </span>
              </div>
            </div>
          </div>

          {/* Upload BG button */}
          <div
            style={{
              position: "absolute",
              bottom: 36,
              left: "50%",
              transform: "translateX(-50%)",
            }}
          >
            <button
              onClick={() => bgInputRef.current.click()}
              style={{
                padding: "7px 18px",
                borderRadius: 20,
                background: "rgba(255,255,255,0.85)",
                border: "1px solid #ddd",
                fontSize: 12,
                color: "#555",
                cursor: "pointer",
                fontWeight: 500,
                backdropFilter: "blur(4px)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
            >
              🖼 Change Background
            </button>
            <input
              ref={bgInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleBgImage}
            />
          </div>
        </div>

        {/* Right Panel */}
        <div
          style={{
            width: 300,
            background: "#fff",
            overflowY: "auto",
            borderLeft: "1px solid #e8e0d8",
            padding: "16px 18px",
            boxShadow: "-2px 0 12px rgba(0,0,0,0.04)",
          }}
        >
          {/* Typography Section */}
          <SectionHeader id="typography" icon="𝐓" label="Typography" />
          {activeSection === "typography" && (
            <div style={{ marginBottom: 16 }}>
              {/* Tabs */}
              <div
                style={{
                  display: "flex",
                  gap: 4,
                  marginBottom: 14,
                  background: "#f5f5f7",
                  borderRadius: 8,
                  padding: 3,
                }}
              >
                {tabs.map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveTab(t)}
                    style={{
                      flex: 1,
                      padding: "5px 0",
                      borderRadius: 6,
                      border: "none",
                      background: activeTab === t ? "#fff" : "transparent",
                      color: activeTab === t ? "#2563eb" : "#666",
                      fontWeight: activeTab === t ? 700 : 400,
                      fontSize: 11,
                      cursor: "pointer",
                      boxShadow:
                        activeTab === t ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Font Family */}
              <div style={{ marginBottom: 10 }}>
                <label
                  style={{
                    fontSize: 11,
                    color: "#777",
                    display: "block",
                    marginBottom: 4,
                  }}
                >
                  Font Family
                </label>
                <select
                  value={activeTypo.fontFamily}
                  onChange={(e) => updateTypo("fontFamily", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "6px 8px",
                    borderRadius: 6,
                    border: "1px solid #e0dbd4",
                    fontSize: 12,
                    background: "#fafafa",
                  }}
                >
                  {FONTS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              {/* Font Weight */}
              <div style={{ marginBottom: 10 }}>
                <label
                  style={{
                    fontSize: 11,
                    color: "#777",
                    display: "block",
                    marginBottom: 4,
                  }}
                >
                  Font Weight
                </label>
                <select
                  value={activeTypo.fontWeight}
                  onChange={(e) => updateTypo("fontWeight", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "6px 8px",
                    borderRadius: 6,
                    border: "1px solid #e0dbd4",
                    fontSize: 12,
                    background: "#fafafa",
                  }}
                >
                  {FONT_WEIGHTS.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </div>

              {/* Font Size & Line Height */}
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      fontSize: 11,
                      color: "#777",
                      display: "block",
                      marginBottom: 4,
                    }}
                  >
                    Font Size
                  </label>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 4 }}
                  >
                    <button
                      onClick={() =>
                        updateTypo(
                          "fontSize",
                          Math.max(8, activeTypo.fontSize - 1),
                        )
                      }
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 4,
                        border: "1px solid #e0dbd4",
                        background: "#fafafa",
                        cursor: "pointer",
                        fontSize: 14,
                      }}
                    >
                      -
                    </button>
                    <span
                      style={{
                        minWidth: 28,
                        textAlign: "center",
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      {activeTypo.fontSize}
                    </span>
                    <button
                      onClick={() =>
                        updateTypo(
                          "fontSize",
                          Math.min(80, activeTypo.fontSize + 1),
                        )
                      }
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 4,
                        border: "1px solid #e0dbd4",
                        background: "#fafafa",
                        cursor: "pointer",
                        fontSize: 14,
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      fontSize: 11,
                      color: "#777",
                      display: "block",
                      marginBottom: 4,
                    }}
                  >
                    Line Height
                  </label>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 4 }}
                  >
                    <button
                      onClick={() =>
                        updateTypo(
                          "lineHeight",
                          Math.max(
                            0.8,
                            +(activeTypo.lineHeight - 0.1).toFixed(1),
                          ),
                        )
                      }
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 4,
                        border: "1px solid #e0dbd4",
                        background: "#fafafa",
                        cursor: "pointer",
                        fontSize: 14,
                      }}
                    >
                      -
                    </button>
                    <span
                      style={{
                        minWidth: 28,
                        textAlign: "center",
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      {activeTypo.lineHeight}
                    </span>
                    <button
                      onClick={() =>
                        updateTypo(
                          "lineHeight",
                          Math.min(
                            3,
                            +(activeTypo.lineHeight + 0.1).toFixed(1),
                          ),
                        )
                      }
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 4,
                        border: "1px solid #e0dbd4",
                        background: "#fafafa",
                        cursor: "pointer",
                        fontSize: 14,
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Text Alignment */}
              <div style={{ marginBottom: 4 }}>
                <label
                  style={{
                    fontSize: 11,
                    color: "#777",
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Text Alignment
                </label>
                <div style={{ display: "flex", gap: 6 }}>
                  {["left", "center", "right"].map((a) => (
                    <button
                      key={a}
                      onClick={() => updateTypo("alignment", a)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 6,
                        cursor: "pointer",
                        border:
                          activeTypo.alignment === a
                            ? "1.5px solid #2563eb"
                            : "1px solid #e0dbd4",
                        background:
                          activeTypo.alignment === a ? "#eff6ff" : "#fafafa",
                        color: activeTypo.alignment === a ? "#2563eb" : "#666",
                      }}
                    >
                      {alignIcon(a)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Colors Section */}
          <SectionHeader id="colors" icon="🎨" label="Colors" />
          {activeSection === "colors" && (
            <div style={{ marginBottom: 16 }}>
              {[
                { label: "Heading Text Color", key: "heading", field: "color" },
                {
                  label: "Sub-Heading Text Color",
                  key: "subHeading",
                  field: "color",
                },
                { label: "Body Text Color", key: "body", field: "color" },
              ].map(({ label, key, field }) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 10,
                  }}
                >
                  <span style={{ fontSize: 12, color: "#555" }}>{label}</span>
                  <input
                    type="color"
                    value={state[key][field]}
                    onChange={(e) =>
                      setState((s) => ({
                        ...s,
                        [key]: { ...s[key], [field]: e.target.value },
                      }))
                    }
                    style={{
                      width: 36,
                      height: 26,
                      border: "1.5px solid #e0dbd4",
                      borderRadius: 6,
                      cursor: "pointer",
                      padding: 1,
                    }}
                  />
                </div>
              ))}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 10,
                }}
              >
                <span style={{ fontSize: 12, color: "#555" }}>
                  Background Color
                </span>
                <input
                  type="color"
                  value={state.backgroundColor}
                  onChange={(e) =>
                    setState((s) => ({ ...s, backgroundColor: e.target.value }))
                  }
                  style={{
                    width: 36,
                    height: 26,
                    border: "1.5px solid #e0dbd4",
                    borderRadius: 6,
                    cursor: "pointer",
                    padding: 1,
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontSize: 12, color: "#555" }}>
                  Watermark Color
                </span>
                <input
                  type="color"
                  value={state.watermark.color}
                  onChange={(e) =>
                    setState((s) => ({
                      ...s,
                      watermark: { ...s.watermark, color: e.target.value },
                    }))
                  }
                  style={{
                    width: 36,
                    height: 26,
                    border: "1.5px solid #e0dbd4",
                    borderRadius: 6,
                    cursor: "pointer",
                    padding: 1,
                  }}
                />
              </div>
            </div>
          )}

          {/* Images Setting */}
          <SectionHeader id="images" icon="🖼" label="Images Setting" />
          {activeSection === "images" && (
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  fontSize: 11,
                  color: "#777",
                  display: "block",
                  marginBottom: 4,
                }}
              >
                Image Radius
              </label>
              <input
                type="range"
                min={0}
                max={40}
                value={state.imageRadius}
                onChange={(e) =>
                  setState((s) => ({ ...s, imageRadius: +e.target.value }))
                }
                style={{
                  width: "100%",
                  accentColor: "#2563eb",
                  marginBottom: 12,
                }}
              />
              <label
                style={{
                  fontSize: 11,
                  color: "#777",
                  display: "block",
                  marginBottom: 4,
                }}
              >
                Image Size
              </label>
              <input
                type="range"
                min={30}
                max={100}
                value={state.imageSize}
                onChange={(e) =>
                  setState((s) => ({ ...s, imageSize: +e.target.value }))
                }
                style={{ width: "100%", accentColor: "#2563eb" }}
              />
            </div>
          )}

          {/* Branding */}
          <SectionHeader id="branding" icon="✦" label="Branding" />
          {activeSection === "branding" && (
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  fontSize: 11,
                  color: "#777",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Upload Logo
              </label>
              <div
                style={{
                  border: "1.5px dashed #c9a84c88",
                  borderRadius: 8,
                  padding: "12px",
                  textAlign: "center",
                  marginBottom: 8,
                  background: "#fffef9",
                }}
              >
                {state.logo ? (
                  <img
                    src={state.logo}
                    alt="logo"
                    style={{ maxHeight: 60, maxWidth: "100%", borderRadius: 4 }}
                  />
                ) : (
                  <div style={{ color: "#bbb", fontSize: 12 }}>
                    🖼 No logo uploaded
                  </div>
                )}
              </div>
              <button
                onClick={() => logoInputRef.current.click()}
                style={{
                  width: "100%",
                  padding: "7px 0",
                  borderRadius: 6,
                  border: "none",
                  background: "#2563eb",
                  color: "#fff",
                  fontSize: 12,
                  cursor: "pointer",
                  fontWeight: 600,
                  marginBottom: 10,
                }}
              >
                Replace
              </button>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleLogo}
              />

              <label
                style={{
                  fontSize: 11,
                  color: "#777",
                  display: "block",
                  marginBottom: 4,
                }}
              >
                Logo Size
              </label>
              <input
                type="range"
                min={30}
                max={160}
                value={state.logoSize}
                onChange={(e) =>
                  setState((s) => ({ ...s, logoSize: +e.target.value }))
                }
                style={{
                  width: "100%",
                  accentColor: "#2563eb",
                  marginBottom: 12,
                }}
              />

              <label
                style={{
                  fontSize: 11,
                  color: "#777",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Logo Alignment
              </label>
              <div style={{ display: "flex", gap: 6 }}>
                {["left", "center", "right"].map((a) => (
                  <button
                    key={a}
                    onClick={() =>
                      setState((s) => ({ ...s, logoAlignment: a }))
                    }
                    style={{
                      flex: 1,
                      padding: "6px 0",
                      borderRadius: 6,
                      cursor: "pointer",
                      border:
                        state.logoAlignment === a
                          ? "1.5px solid #2563eb"
                          : "1px solid #e0dbd4",
                      background:
                        state.logoAlignment === a ? "#eff6ff" : "#fafafa",
                      color: state.logoAlignment === a ? "#2563eb" : "#666",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {alignIcon(a)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Save/Cancel */}
          <div
            style={{
              display: "flex",
              gap: 8,
              marginTop: 8,
              paddingTop: 12,
              borderTop: "1px solid #e8e0d8",
            }}
          >
            <button
              onClick={() => setState(defaultState)}
              style={{
                flex: 1,
                padding: "8px 0",
                borderRadius: 7,
                border: "1px solid #ddd",
                background: "#fff",
                color: "#555",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              style={{
                flex: 1,
                padding: "8px 0",
                borderRadius: 7,
                border: "none",
                background: "#2563eb",
                color: "#fff",
                fontSize: 13,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
