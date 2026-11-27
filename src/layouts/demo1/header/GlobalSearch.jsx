import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useIntl } from "react-intl";
import { Search, X } from "lucide-react";
import { useAuthStore } from "../../../store/useAuthStore";
import { useModuleAccess } from "../../../hooks/useModuleAccess";
import { allMenuItems } from "@/config/menu.config"; // same import as before

// Menu titles are JSX (<FormattedMessage/>), so pull the text out of them
const textOf = (node, intl) => {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map((n) => textOf(n, intl)).join(" ");
  const p = node.props || {};
  if (p.defaultMessage) {
    return intl.formatMessage({ id: p.id, defaultMessage: p.defaultMessage });
  }
  return textOf(p.children, intl);
};

const clean = (s) => s.replace(/\s+/g, " ").trim();
const DROP_W = 320;

const GlobalSearch = ({ isSuperUser, pathToRightsKey = {} }) => {
  const navigate = useNavigate();
  const intl = useIntl();
// Pages every logged-in user may open (edit as needed)
const ALWAYS_ALLOWED = new Set(["/dashboard", "/"]);

// Read the logged-in user's rights straight from localStorage
const readAuth = () => {
  try {
    const state = JSON.parse(localStorage.getItem("auth-storage"))?.state;
    return { rights: state?.rights || {}, user: state?.user || {} };
  } catch {
    return { rights: {}, user: {} };
  }
};  const { hasModuleAccess } = useModuleAccess();

  const [focused, setFocused] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [pos, setPos] = useState(null);

  const wrapRef = useRef(null);
  const inputRef = useRef(null);
  const dropRef = useRef(null);
  const listRef = useRef(null);

  const userId = (() => {
    try {
      return localStorage.getItem("userId");
    } catch {
      return null;
    }
  })();

 const pages = useMemo(() => {
  const { rights } = readAuth();
  const out = [];
  const seen = new Set();

  const canView = (item, path, moduleName) => {
    // plan/module gate applies to everyone, including admins
    if (moduleName && !hasModuleAccess(moduleName)) return false;
    if (isSuperUser) return true;
    if (ALWAYS_ALLOWED.has(path)) return true;

    // members: must have an explicit view right for this page
    const rightsKey = pathToRightsKey[path];
    if (rightsKey) return rights[rightsKey]?.view === true;

    // pages not mapped to a right: hidden for members (default deny)
    return false;
  };

  const walk = (items, trail, inheritedModule) => {
    (items || []).forEach((item) => {
      const label = clean(textOf(item.title, intl));
      const moduleName = item.moduleName ?? inheritedModule;
      const nextTrail = label ? [...trail, label] : trail;

      if (item.children?.length) {
        walk(item.children, nextTrail, moduleName);
        return;
      }

      const path = item.path;
      if (!path || path === "#" || !label) return;
      if (item.requiresEvent) return;
      if (item.allowedUserIds && !item.allowedUserIds.includes(String(userId))) return;
      if (!canView(item, path, moduleName)) return;

      const key = `${path}|${label}`;
      if (seen.has(key)) return;
      seen.add(key);

      out.push({
        path,
        label,
        group: trail.join(" › "),
        haystack: `${label} ${trail.join(" ")} ${item.pageName || ""}`.toLowerCase(),
      });
    });
  };

  walk(allMenuItems(navigate), [], undefined);
  return out;
  // focused: re-read localStorage every time the box is opened
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [intl.locale, isSuperUser, userId, focused]);
  const results = useMemo(() => {
    const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (!tokens.length) return [];

    return pages
      .filter((p) => tokens.every((t) => p.haystack.includes(t)))
      .map((p) => ({
        ...p,
        score: p.label.toLowerCase().startsWith(tokens[0])
          ? 0
          : p.label.toLowerCase().includes(tokens[0])
            ? 1
            : 2,
      }))
      .sort((a, b) => a.score - b.score)
      .slice(0, 10);
  }, [pages, query]);

  const showDropdown = focused && query.trim().length > 0;

  const close = useCallback(() => {
    setFocused(false);
    setQuery("");
    setActive(0);
    inputRef.current?.blur();
  }, []);

  const go = useCallback(
    (p) => {
      if (!p) return;
      navigate(p.path);
      close();
    },
    [navigate, close],
  );

  // Position the dropdown under the input
  useEffect(() => {
    if (!showDropdown) {
      setPos(null);
      return;
    }
    const update = () => {
      if (!wrapRef.current) return;
      const r = wrapRef.current.getBoundingClientRect();
      const vw = window.innerWidth;
      const left = Math.max(8, Math.min(r.right - DROP_W, vw - DROP_W - 8));
      setPos({ top: r.bottom + 6, left });
    };
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [showDropdown]);

  // Click outside closes
  useEffect(() => {
    if (!focused) return;
    const onDown = (e) => {
      if (wrapRef.current?.contains(e.target)) return;
      if (dropRef.current?.contains(e.target)) return;
      setFocused(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [focused]);

  // Ctrl/Cmd + K focuses the input
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => setActive(0), [query]);

  useEffect(() => {
    listRef.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const onKeyDown = (e) => {
    if (e.key === "Escape") return close();
    if (!results.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(results[active]);
    }
  };

  const dropdown =
    showDropdown && pos ? (
      <div
        ref={dropRef}
        style={{ position: "fixed", top: pos.top, left: pos.left, width: DROP_W, zIndex: 99999 }}
        className="bg-white border border-gray-100 rounded-xl shadow-2xl overflow-hidden"
      >
        {results.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-gray-500">
            No pages found for "{query}"
          </div>
        ) : (
          <div ref={listRef} className="max-h-[60vh] overflow-y-auto py-1">
            {results.map((p, i) => (
              <button
                key={`${p.path}-${p.label}`}
                type="button"
                onMouseEnter={() => setActive(i)}
                onClick={() => go(p)}
                className={`w-full text-left px-4 py-2.5 flex flex-col ${
                  i === active ? "bg-primary/10" : "hover:bg-gray-50"
                }`}
              >
                <span
                  className={`text-xs font-medium ${
                    i === active ? "text-primary" : "text-gray-800"
                  }`}
                >
                  {p.label}
                </span>
                {p.group && p.group !== p.label && (
                  <span className="text-[11px] text-gray-400">{p.group}</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    ) : null;

  return (
    <>
      <div
        ref={wrapRef}
        className={`hidden md:flex items-center gap-2 h-9 px-3 rounded-full border bg-white transition-all duration-200 ${
          focused ? "w-64 border-primary" : "w-44 border-gray-300 hover:border-gray-400"
        }`}
      >
        <Search size={16} className="text-gray-400 shrink-0" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={onKeyDown}
          placeholder="Search pages..."
          className="w-full min-w-0 bg-transparent text-xs text-gray-800 placeholder-gray-400 outline-none"
        />
        {query ? (
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="text-gray-400 hover:text-gray-700 shrink-0"
            aria-label="Clear"
          >
            <X size={14} />
          </button>
        ) : (
          !focused && (
            <kbd className="hidden lg:inline text-[10px] text-gray-400 border border-gray-200 rounded px-1 shrink-0">
              Ctrl K
            </kbd>
          )
        )}
      </div>
      {createPortal(dropdown, document.body)}
    </>
  );
};

export default GlobalSearch;