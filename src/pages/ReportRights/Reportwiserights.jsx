import { useState } from "react";

const modulesData = [
  {
    id: "menu-planning",
    name: "Menu Planning",

    groups: [
      {
        name: "Exclusive",
        reports: [
          "Exclusive Report 1",
          "Exclusive Report 2",
          "Exclusive Report 3",
        ],
      },
      {
        name: "Backoffice",
        reports: [
          "Backoffice Theme 1",
          "Backoffice Theme 2",
          "Backoffice Theme 3",
        ],
      },
    ],
  },
  {
    id: "menu-allocation",
    name: "Menu Allocation",

    groups: [
      {
        name: "Menu Allocation Theme",
        reports: ["Menu Report With Or Without Quantity", "Dish Counting"],
      },
      {
        name: "Chef Agency Theme",
        reports: ["Chef Chithhi", "Chef Labour Report"],
      },
    ],
  },
  {
    id: "inventory",
    name: "Inventory",

    groups: [
      {
        name: "Exclusive",
        reports: [
          "Stock Summary Report",
          "Item Wise Stock",
          "Closing Stock Report",
        ],
      },
      {
        name: "Backoffice",
        reports: ["Purchase Register", "Consumption Report"],
      },
      { name: "Other", reports: ["Audit Trail", "Variance Report"] },
    ],
  },
  {
    id: "billing",
    name: "Billing",

    groups: [
      {
        name: "Exclusive",
        reports: ["Invoice Report", "Payment Summary", "GST Report"],
      },
      {
        name: "Backoffice",
        reports: ["Daily Collection", "Outstanding Report"],
      },
    ],
  },
];

const groupStyles = {
  Exclusive: {
    color: "#1565c0",
    bg: "#e3f2fd",
    border: "#90caf9",
    dot: "#1976d2",
  },
  Backoffice: {
    color: "#b45309",
    bg: "#fef3c7",
    border: "#fcd34d",
    dot: "#f59e0b",
  },
  "Menu Allocation Theme": {
    color: "#166534",
    bg: "#dcfce7",
    border: "#86efac",
    dot: "#22c55e",
  },
  "Chef Agency Theme": {
    color: "#6b21a8",
    bg: "#f3e8ff",
    border: "#d8b4fe",
    dot: "#a855f7",
  },
  Other: { color: "#334155", bg: "#f1f5f9", border: "#cbd5e1", dot: "#64748b" },
};

function getStyle(name) {
  return groupStyles[name] || groupStyles["Other"];
}

function Toggle({ on, onToggle }) {
  return (
    <div
      onClick={onToggle}
      style={{
        width: 44,
        height: 24,
        borderRadius: 12,
        background: on ? "#1976d2" : "#cbd5e1",
        position: "relative",
        cursor: "pointer",
        transition: "background 0.2s",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 3,
          left: on ? 23 : 3,
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
          transition: "left 0.2s",
        }}
      />
    </div>
  );
}

export default function Reportwiserights() {
  const [selectedModule, setSelectedModule] = useState(modulesData[0].id);
  const [rights, setRights] = useState({});
  const [expanded, setExpanded] = useState({});

  const activeModule = modulesData.find((m) => m.id === selectedModule);

  const toggleRight = (moduleId, groupName) => {
    const key = `${moduleId}__${groupName}`;
    setRights((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isOn = (moduleId, groupName) => !!rights[`${moduleId}__${groupName}`];

  const toggleExpand = (moduleId, groupName) => {
    const key = `${moduleId}__${groupName}`;
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isExpanded = (moduleId, groupName) =>
    !!expanded[`${moduleId}__${groupName}`];

  const getModuleOnCount = (moduleId) => {
    const mod = modulesData.find((m) => m.id === moduleId);
    if (!mod) return 0;
    return mod.groups.filter((g) => isOn(moduleId, g.name)).length;
  };

  const totalGroupsGranted = Object.values(rights).filter(Boolean).length;

  return (
    <div
      style={{
        background: "white",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          flex: 1,
          overflow: "hidden",
          height: "100vh",
        }}
      >
        {/* Sidebar */}
        <div
          style={{
            width: 230,
            background: "white",
            overflowY: "auto",
            flexShrink: 0,
            borderRight: "1px solid #e2e8f0",
            height: "100vh",
          }}
        >
          <div
            style={{
              padding: "0px 16px 12px",
              color: "black",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            <div>
              <div style={{ color: "black", fontWeight: 700, fontSize: 14 }}>
                <i class="ki-filled ki-lock"></i> Report Permissions
              </div>
            </div>
          </div>
          {modulesData.map((mod) => {
            const active = mod.id === selectedModule;
            const on = getModuleOnCount(mod.id);
            const total = mod.groups.length;
            return (
              <div
                key={mod.id}
                onClick={() => setSelectedModule(mod.id)}
                style={{
                  padding: "8px 3px 12px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: active ? "rgba(33,150,243,0.18)" : "transparent",
                  borderLeft: active
                    ? "3px solid #42a5f5"
                    : "3px solid transparent",
                  transition: "all 0.15s",
                  marginBottom: 1,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <span style={{ fontSize: 16 }}>{mod.icon}</span>
                  <span
                    style={{
                      color: active ? "black" : "black",
                      fontSize: 13,
                      fontWeight: active ? 600 : 400,
                    }}
                  >
                    {mod.name}
                  </span>
                </div>
                {on > 0 && (
                  <span
                    style={{
                      background: "#1976d2",
                      color: "#fff",
                      borderRadius: 10,
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "1px 7px",
                    }}
                  >
                    {on}/{total}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Main Panel */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0px 32px" }}>
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 4,
              }}
            >
              <span style={{ fontSize: 24 }}>{activeModule?.icon}</span>
              <h2
                style={{
                  margin: 0,
                  color: "#0f2d52",
                  fontSize: 22,
                  fontWeight: 700,
                }}
              >
                {activeModule?.name}
              </h2>
            </div>
            <p style={{ color: "#64748b", fontSize: 13 }}>
              Toggle a report group to grant <strong>View</strong> access to all
              its reports
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {activeModule?.groups.map((group) => {
              const s = getStyle(group.name);
              const on = isOn(activeModule.id, group.name);
              const open = isExpanded(activeModule.id, group.name);

              return (
                <div
                  key={group.name}
                  style={{
                    background: "#fff",
                    borderRadius: 12,
                    border: `1.5px solid ${on ? s.border : "#e2e8f0"}`,
                    boxShadow: on
                      ? "0 2px 12px rgba(0,0,0,0.07)"
                      : "0 1px 4px rgba(0,0,0,0.04)",
                    overflow: "hidden",
                    transition: "border 0.2s, box-shadow 0.2s",
                  }}
                >
                  {/* Card Row */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "18px 22px",
                      background: on ? s.bg : "#fff",
                      transition: "background 0.2s",
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background: on ? s.dot : "#cbd5e1",
                          transition: "background 0.2s",
                          flexShrink: 0,
                        }}
                      />
                      <div>
                        <div
                          style={{
                            fontSize: 15,
                            fontWeight: 700,
                            color: on ? s.color : "#334155",
                            transition: "color 0.2s",
                          }}
                        >
                          {group.name}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: "#94a3b8",
                            marginTop: 2,
                          }}
                        >
                          {group.reports.length} report
                          {group.reports.length !== 1 ? "s" : ""} inside
                        </div>
                      </div>
                    </div>

                    <div
                      style={{ display: "flex", alignItems: "center", gap: 14 }}
                    >
                      {on && (
                        <span
                          style={{
                            background: s.bg,
                            color: s.color,
                            border: `1px solid ${s.border}`,
                            borderRadius: 6,
                            fontSize: 11,
                            fontWeight: 700,
                            padding: "2px 10px",
                            letterSpacing: 0.3,
                          }}
                        >
                          VIEW ACCESS
                        </span>
                      )}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 12,
                            color: on ? s.color : "#94a3b8",
                            fontWeight: 600,
                            minWidth: 22,
                          }}
                        >
                          {on ? "On" : "Off"}
                        </span>
                        <Toggle
                          on={on}
                          onToggle={() =>
                            toggleRight(activeModule.id, group.name)
                          }
                        />
                      </div>
                      <div
                        onClick={() =>
                          toggleExpand(activeModule.id, group.name)
                        }
                        title="Preview reports"
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 6,
                          border: "1.5px solid #e2e8f0",
                          background: "#f8fafc",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          fontSize: 11,
                          color: "#64748b",
                          transition: "transform 0.2s",
                          transform: open ? "rotate(180deg)" : "rotate(0deg)",
                          userSelect: "none",
                        }}
                      >
                        ▼
                      </div>
                    </div>
                  </div>

                  {/* Expandable report preview */}
                  {open && (
                    <div
                      style={{
                        borderTop: `1px solid ${on ? s.border : "#f1f5f9"}`,
                        padding: "14px 22px",
                        background: "#fafbfc",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: "#94a3b8",
                          letterSpacing: 0.8,
                          textTransform: "uppercase",
                          marginBottom: 10,
                        }}
                      >
                        Reports in this group
                      </div>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fill, minmax(220px, 1fr))",
                          gap: 8,
                        }}
                      >
                        {group.reports.map((report) => (
                          <div
                            key={report}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              padding: "8px 12px",
                              borderRadius: 7,
                              background: on ? s.bg : "#f1f5f9",
                              border: `1px solid ${on ? s.border : "#e2e8f0"}`,
                            }}
                          >
                            <span
                              style={{
                                fontSize: 13,
                                color: on ? s.dot : "#94a3b8",
                              }}
                            >
                              {on ? "✓" : "○"}
                            </span>
                            <span
                              style={{
                                fontSize: 13,
                                color: on ? s.color : "#64748b",
                                fontWeight: on ? 500 : 400,
                              }}
                            >
                              {report}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
