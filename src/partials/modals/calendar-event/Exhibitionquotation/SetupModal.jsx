import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Plus,
  Trash2,
  Sparkles,
  RotateCw,
  Loader2,
  Pencil,
  Check,
  LayoutGrid,
  Truck,
} from "lucide-react";
import Swal from "sweetalert2";
import {
  getExhibitionSetupByEventUser,
  saveExhibitionSetup,
  deleteExhibitionSetupDetail,
  deleteExhibitionSetupItemDetail,
  Translateapi,
} from "@/services/apiServices";

const DEFAULT_ROWS = [
  {
    id: null,
    headingNameEnglish: "Setups and Other Requirements",
    headingNameGujarati: "સેટઅપ અને અન્ય આવશ્યકતાઓ",
    headingNameHindi: "सेटअप और अन्य आवश्यकताएं",
    sortorder: 1,
    items: [
      {
        id: null,
        descriptionEnglish:
          "<b>Octanorm modular stall setup</b> with 8 units (3m x 3m). 3-phase 32A power supply required for main distribution board. Fascia lettering with high-bond vinyl lettering for all stall fronts. Ground leveling and protective underlay before stall erection on 08 September 2026.",
        descriptionGujarati:
          "<b>ઓક્ટનોર્મ મોડ્યુલર સ્ટોલ સેટઅપ</b> 8 એકમો (3m x 3m) સાથે. મુખ્ય વિતરણ બોર્ડ માટે 3-ફેઝ 32A પાવર સપ્લાય જરૂરી છે. બધા સ્ટોલ મોરચા માટે હાઇ-બોન્ડ વિનાઇલ લેટરિંગ સાથે ફાસિયા લેટરિંગ. 08 સપ્ટેમ્બર 2026 ના રોજ સ્ટોલ ઊભો કરતા પહેલા ગ્રાઉન્ડ લેવલિંગ અને રક્ષણાત્મક અંડરલે.",
        descriptionHindi:
          "<b>ऑक्टानॉर्म मॉड्यूलर स्टॉल सेटअप</b> 8 इकाइयों (3m x 3m) के साथ। मुख्य वितरण बोर्ड के लिए 3-फेज 32A बिजली आपूर्ति आवश्यक है। सभी स्टॉल मोर्चों के लिए हाई-बॉन्ड विनाइल लेटरिंग के साथ प्रावरणी लेटरिंग। 08 सितंबर 2026 को स्टॉल लगाने से पहले ग्राउंड लेवलिंग और सुरक्षात्मक अंडरले।",
        sortorder: 1,
      },
    ],
  },
  {
    id: null,
    headingNameEnglish: "Electrical & Lighting Specifications",
    headingNameGujarati: "ઇલેક્ટ્રિકલ અને લાઇટિંગ વિશિષ્ટતાઓ",
    headingNameHindi: "વિદ્યુત અને પ્રકાશ વિશિષ્ટતાઓ",
    sortorder: 2,
    items: [
      {
        id: null,
        descriptionEnglish:
          "12 units 50W warm-white LED spotlights positioned on front cross-truss. Dedicated 16A multi-plug sockets per counter block. Backup generator line connected for continuous illumination during exhibition hours (10:00 AM - 08:00 PM).",
        descriptionGujarati:
          "આગળના ક્રોસ-ટ્રસ પર 12 એકમો 50W વોર્મ-વ્હાઇટ LED સ્પોટલાઇટ્સ ગોઠવેલ છે. કાઉન્ટર બ્લોક દીઠ સમર્પિત 16A મલ્ટી-પ્લગ સોકેટ્સ. પ્રદર્શનના કલાકો (10:00 AM - 08:00 PM) દરમિયાન સતત રોશની માટે બેકઅપ જનરેટર લાઇન જોડાયેલ છે.",
        descriptionHindi:
          "सामने के क्रॉस-ट्रस पर 12 इकाइयां 50W वार्म-व्हाइट एलईडी स्पॉटलाइट्स स्थित हैं। प्रति काउंटर ब्लॉक समर्पित 16A मल्टी-प्लग सॉकेट। प्रदर्शनी के घंटों (10:00 AM - 08:00 PM) के दौरान निरंतर रोशनी के लिए बैकअप जनरेटर लाइन जुड़ी हुई है।",
        sortorder: 2,
      },
    ],
  },
  {
    id: null,
    headingNameEnglish: "Display & Furniture Fabrication",
    headingNameGujarati: "ડિસ્પ્લે અને ફર્નિચર ફેબ્રિકેશન",
    headingNameHindi: "प्रदर्शन और फर्नीचर निर्माण",
    sortorder: 3,
    items: [
      {
        id: null,
        descriptionEnglish:
          "6 tiers modular display shelving (powder-coated matte white finish). 2 executive discussion tables with 8 cushioned visitor chairs. 1 lockable reception counter with custom brand graphics laminated fascia.",
        descriptionGujarati:
          "6 સ્તરો મોડ્યુલર ડિસ્પ્લે શેલ્વિંગ (પાઉડર-કોટેડ મેટ વ્હાઇટ ફિનિશ). 8 કુશનવાળી મુલાકાતી ખુરશીઓ સાથે 2 એક્ઝિક્યુટિવ ચર્ચા ટેબલ. કસ્ટમ બ્રાન્ડ ગ્રાફિક્સ લેમિનેટેડ ફાસિયા સાથે 1 લૉકેબલ રિસેપ્શન કાઉન્ટર.",
        descriptionHindi:
          "6 स्तरों का मॉड्यूलर डिस्प्ले शेल्विंग (पाउडर-कोटेड मैट व्हाइट फिनिश)। 8 कुशन वाली आगंतुक कुर्सियों के साथ 2 कार्यकारी चर्चा टेबल। कस्टम ब्रांड ग्राफिक्स लैमिनेटेड प्रावरणी के साथ 1 लॉक करने योग्य स्वागत काउंटर।",
        sortorder: 3,
      },
    ],
  },
  {
    id: null,
    headingNameEnglish: "Dismantling & Logistics Guidelines",
    headingNameGujarati: "ડિસમેન્ટલિંગ અને લોજિસ્ટિક્સ માર્ગદર્શિકા",
    headingNameHindi: "विघटन और रसद दिशानिर्देश",
    sortorder: 4,
    items: [
      {
        id: null,
        descriptionEnglish:
          "Handover inspection scheduled for 10 September 2026 at 09:30 PM post event closure. De-rigging and transport clearance to be completed within 6 hours. Gate passes and security clearance to be pre-authorized.",
        descriptionGujarati:
          "ઇવેન્ટ બંધ થયા પછી 10 સપ્ટેમ્બર 2026 ના રોજ રાત્રે 09:30 વાગ્યે હેન્ડઓવર નિરીક્ષણ સુનિશ્ચિત થયેલ છે. ડી-રિગિંગ અને પરિવહન મંજૂરી 6 કલાકની અંદર પૂર્ણ કરવાની રહેશે. ગેટ પાસ અને સુરક્ષા મંજૂરી પૂર્વ-અધિકૃત હોવી આવશ્યક છે.",
        descriptionHindi:
          "कार्यक्रम समाप्त होने के बाद 10 सितंबर 2026 को रात 09:30 बजे हैंडओवर निरीक्षण निर्धारित है। डी-रिगिंग और परिवहन निकासी 6 घंटे के भीतर पूरी की जानी चाहिए। गेट पास और सुरक्षा मंजूरी पूर्व-अधिकृत होनी चाहिए।",
        sortorder: 4,
      },
    ],
  },
];

const renderSectionIcon = (index) => {
  switch (index % 4) {
    case 0:
      return <LayoutGrid className="w-4 h-4 text-blue-600 flex-shrink-0" />;
    case 1:
      return (
        <svg
          className="w-4 h-4 text-blue-600 flex-shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2v4" />
          <path d="m5.5 8.5 2.5 2.5" />
          <path d="M16 11l2.5-2.5" />
          <rect x="7" y="11" width="10" height="9" rx="2" />
          <path d="M10 20v2" />
          <path d="M14 20v2" />
        </svg>
      );
    case 2:
      return (
        <svg
          className="w-4 h-4 text-blue-600 flex-shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 9h18a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1Z" />
          <path d="M6 13v7" />
          <path d="M18 13v7" />
          <path d="M10 13v4h4v-4" />
        </svg>
      );
    case 3:
      return <Truck className="w-4 h-4 text-blue-600 flex-shrink-0" />;
    default:
      return <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0" />;
  }
};

// ── Strip ALL HTML tags completely (for Gujarati, Hindi, and pure clean text) ────
const stripAllTags = (text = "") => {
  if (!text) return "";
  let clean = String(text);
  clean = clean.replace(/<\/?(br|p|div|section|span|b|strong)\b[^>]*>/gi, " ");
  clean = clean.replace(/<[^>]*>/g, "");
  clean = clean.replace(/(?:\\r\\n|\\n|\\r)/g, " ");
  clean = clean.replace(/(?:^|\s)\/br(?:\s|$)/gi, " ");
  clean = clean.replace(/(?:^|\s)\/n(?:\s|$)/gi, " ");
  clean = clean.replace(/\/br/gi, " ");
  clean = clean.replace(/\/n/gi, " ");
  clean = clean.replace(/&nbsp;/gi, " ");
  clean = clean.replace(/[\r\n\t]+/g, " ");
  clean = clean.replace(/\s{2,}/g, " ").trim();
  return clean;
};

// ── Sanitize to allow strictly <b> and </b> tags only (no \n, /n, /br, <br>, or other HTML tags) ──
const sanitizeOnlyBTag = (text = "") => {
  if (!text) return "";
  let clean = String(text);

  // 1. Normalize strong tags to b tags so bold formatting is preserved
  clean = clean.replace(/<\/?strong\b[^>]*>/gi, (m) =>
    m.toLowerCase().includes("/") ? "</b>" : "<b>"
  );

  // 2. Replace HTML break tags (<br>, <br/>, </br>) with a space
  clean = clean.replace(/<\/?br\s*\/?>/gi, " ");

  // 3. Replace HTML block tags (<p>, <div>, etc.) with a space
  clean = clean.replace(
    /<\/?(p|div|section|article|header|footer|li|ul|ol|h[1-6]|tr|td|th)\b[^>]*>/gi,
    " "
  );

  // 4. Remove literal newline/break patterns like /n, /br, \n, \r\n, \r
  clean = clean.replace(/(?:\\r\\n|\\n|\\r)/g, " ");
  clean = clean.replace(/(?:^|\s)\/br(?:\s|$)/gi, " ");
  clean = clean.replace(/(?:^|\s)\/n(?:\s|$)/gi, " ");
  clean = clean.replace(/\/br/gi, " ");
  clean = clean.replace(/\/n/gi, " ");

  // 5. Replace non-breaking space &nbsp;
  clean = clean.replace(/&nbsp;/gi, " ");

  // 6. Strip all other HTML tags except <b> and </b>
  clean = clean.replace(/<(?!\/?b\b)[^>]*>/gi, "");

  // 7. Normalize <B> and </B> to lowercase <b> and </b>
  clean = clean.replace(/<b\b[^>]*>/gi, "<b>");
  clean = clean.replace(/<\/b>/gi, "</b>");

  // 8. Remove empty bold tags like <b></b> or <b> </b>
  clean = clean.replace(/<b>\s*<\/b>/gi, " ");

  // 9. Remove raw newlines, carriage returns, and tabs
  clean = clean.replace(/[\r\n\t]+/g, " ");

  // 10. Collapse multiple consecutive spaces into a single space and trim
  clean = clean.replace(/\s{2,}/g, " ").trim();

  return clean;
};

// ── Safely render <b>...</b> in UI preview without XSS risk ─────────────────
const renderFormattedText = (text = "") => {
  if (!text) return null;
  const parts = String(text).split(/(<b>.*?<\/b>)/gi);
  return parts.map((part, i) => {
    if (part.toLowerCase().startsWith("<b>") && part.toLowerCase().endsWith("</b>")) {
      const content = part.slice(3, -4);
      return (
        <b key={i} className="font-bold text-slate-900">
          {content}
        </b>
      );
    }
    return <span key={i}>{part}</span>;
  });
};

// ── Helper to escape regex special characters ───────────────────────────────
const escapeRegex = (str = "") => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// ── Smart synchronizer to apply bold tags to matching phrase in target text ──
const applyBoldToText = (targetText = "", phrase = "") => {
  if (!targetText || !phrase) return targetText;
  const cleanPhrase = phrase.replace(/<[^>]*>/g, "").trim();
  if (!cleanPhrase) return targetText;

  // 1. Exact phrase match
  const exactRegex = new RegExp("(" + escapeRegex(cleanPhrase) + ")", "i");
  if (exactRegex.test(targetText)) {
    return targetText
      .replace(exactRegex, "<b>$1</b>")
      .replace(/<b>\s*<b>/g, "<b>")
      .replace(/<\/b>\s*<\/b>/g, "</b>");
  }

  // 2. Word-sequence match for slight transliteration/spacing variations
  const words = cleanPhrase.split(/\s+/).filter((w) => w.length > 1);
  if (words.length > 0) {
    const firstWord = words[0];
    const lastWord = words[words.length - 1];
    if (words.length > 1) {
      const seqRegex = new RegExp(
        "(" + escapeRegex(firstWord) + "[\\s\\S]{1,40}?" + escapeRegex(lastWord) + ")",
        "i"
      );
      if (seqRegex.test(targetText)) {
        return targetText
          .replace(seqRegex, "<b>$1</b>")
          .replace(/<b>\s*<b>/g, "<b>")
          .replace(/<\/b>\s*<\/b>/g, "</b>");
      }
    } else {
      const singleWordRegex = new RegExp("(" + escapeRegex(firstWord) + ")", "i");
      if (singleWordRegex.test(targetText)) {
        return targetText
          .replace(singleWordRegex, "<b>$1</b>")
          .replace(/<b>\s*<b>/g, "<b>")
          .replace(/<\/b>\s*<\/b>/g, "</b>");
      }
    }
  }

  return targetText;
};

// ── Single text piece translation via active Translateapi ──────────────────
const translateSingleText = async (text) => {
  if (!text || !text.trim()) return { gujarati: "", hindi: "" };
  try {
    const res = await Translateapi(text);
    const d = res?.data?.data || res?.data || {};
    const gujarati = stripAllTags(d.gujarati || d.gu || "");
    const hindi = stripAllTags(d.hindi || d.hi || "");
    return { gujarati, hindi };
  } catch (err) {
    console.warn("Translateapi error:", err);
    return { gujarati: "", hindi: "" };
  }
};

// ── Ultra-fast multi-language translation that preserves <b>...</b> bold tags and extracts bold phrases ──
const executeTranslation = async (text) => {
  if (!text || !text.trim()) return { gujarati: "", hindi: "", boldPhrases: [] };

  const parts = String(text).split(/(<\/?(?:b|strong)\b[^>]*>)/gi);
  const hasBoldTags = parts.length > 1;

  if (!hasBoldTags) {
    const cleanText = text.replace(/<[^>]*>/g, "").trim();
    if (!cleanText) return { gujarati: "", hindi: "", boldPhrases: [] };
    const { gujarati, hindi } = await translateSingleText(cleanText);
    return { gujarati, hindi, boldPhrases: [] };
  }

  let isCurrentlyBold = false;
  const segments = [];
  const boldPhrases = [];

  for (const part of parts) {
    if (/^<(?:\/)?(?:b|strong)\b[^>]*>/i.test(part)) {
      isCurrentlyBold = !/^<\/(?:b|strong)/i.test(part);
    } else if (part) {
      segments.push({ text: part, isBold: isCurrentlyBold });
    }
  }

  const translatedSegments = await Promise.all(
    segments.map(async (seg) => {
      const leadingSpace = seg.text.match(/^\s*/)[0];
      const trailingSpace = seg.text.match(/\s*$/)[0];
      const coreText = seg.text.trim();

      if (!coreText) {
        return {
          gujarati: seg.text,
          hindi: seg.text,
        };
      }

      const { gujarati, hindi } = await translateSingleText(coreText);

      if (seg.isBold) {
        boldPhrases.push({
          english: coreText,
          gujarati,
          hindi,
        });
      }

      return {
        gujarati:
          leadingSpace +
          (seg.isBold ? `<b>${gujarati}</b>` : gujarati) +
          trailingSpace,
        hindi:
          leadingSpace +
          (seg.isBold ? `<b>${hindi}</b>` : hindi) +
          trailingSpace,
      };
    })
  );

  const gujarati = translatedSegments.map((s) => s.gujarati).join("");
  const hindi = translatedSegments.map((s) => s.hindi).join("");

  return {
    gujarati: sanitizeOnlyBTag(gujarati),
    hindi: sanitizeOnlyBTag(hindi),
    boldPhrases,
  };
};

// ── RichTextEditor: ContentEditable area with strict bold control and no newlines ──
const RichTextEditor = ({
  value = "",
  onChange,
  onBlur,
  placeholder = "",
  id,
  minHeight = "72px",
  singleLine = false,
  allowBold = true,
  className = "",
}) => {
  const editorRef = useRef(null);
  const [isBold, setIsBold] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Sync value from outside only when not focused or value changed externally
  useEffect(() => {
    if (editorRef.current && document.activeElement !== editorRef.current) {
      const sanitized = allowBold ? (value || "") : stripAllTags(value || "");
      if (editorRef.current.innerHTML !== sanitized) {
        editorRef.current.innerHTML = sanitized;
      }
    }
  }, [value, allowBold]);

  const checkBoldState = () => {
    if (!allowBold) {
      if (isBold) setIsBold(false);
      return;
    }
    try {
      const boldState = document.queryCommandState("bold");
      setIsBold(Boolean(boldState));
    } catch {
      setIsBold(false);
    }
  };

  const handleKeyDown = (e) => {
    // 1. Strictly prevent both Enter and Shift+Enter in all fields
    if (e.key === "Enter") {
      e.preventDefault();
      return;
    }

    // 2. If bolding is not allowed (Gujarati, Hindi), completely block Ctrl+B
    if (!allowBold) {
      if ((e.ctrlKey || e.metaKey) && (e.key === "b" || e.key === "B")) {
        e.preventDefault();
      }
      return;
    }

    // 3. Ctrl+B: ONLY apply bold to explicitly selected/highlighted text
    if ((e.ctrlKey || e.metaKey) && (e.key === "b" || e.key === "B")) {
      e.preventDefault();
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !sel.toString().trim()) {
        // No text highlighted: force bold state OFF so new typing does NOT become bold
        if (document.queryCommandState("bold")) {
          document.execCommand("bold", false, null);
        }
        checkBoldState();
        return;
      }

      // Highlighted text exists: toggle bold on the selection
      document.execCommand("bold", false, null);
      checkBoldState();
      if (editorRef.current && onChange) {
        onChange(editorRef.current.innerHTML);
      }
      return;
    }

    // 4. When caret is at the end of a bold element, typing characters or space must NOT continue bold
    if (!e.ctrlKey && !e.metaKey && !e.altKey && e.key.length === 1) {
      const sel = window.getSelection();
      if (sel && sel.isCollapsed && sel.rangeCount > 0) {
        let node = sel.anchorNode;
        let boldAncestor = null;
        let curr = node;
        while (curr && curr !== editorRef.current) {
          if (curr.nodeType === 1 && (curr.tagName === "B" || curr.tagName === "STRONG")) {
            boldAncestor = curr;
            break;
          }
          curr = curr.parentNode;
        }

        if (boldAncestor) {
          const isAtEnd =
            node.nodeType === 3
              ? sel.anchorOffset === node.textContent.length && !node.nextSibling
              : sel.anchorOffset === boldAncestor.childNodes.length;

          if (isAtEnd) {
            e.preventDefault();
            const char = e.key === " " ? "\u00A0" : e.key;
            const textNode = document.createTextNode(char);
            if (boldAncestor.nextSibling) {
              boldAncestor.parentNode.insertBefore(textNode, boldAncestor.nextSibling);
            } else {
              boldAncestor.parentNode.appendChild(textNode);
            }

            // Move caret to after the newly inserted character
            const newRange = document.createRange();
            newRange.setStart(textNode, 1);
            newRange.collapse(true);
            sel.removeAllRanges();
            sel.addRange(newRange);

            // Turn bold mode off for all subsequent typing
            if (document.queryCommandState("bold")) {
              document.execCommand("bold", false, null);
            }

            if (editorRef.current && onChange) {
              onChange(editorRef.current.innerHTML);
            }
            checkBoldState();
            return;
          }
        }
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain") || "";
    // Clean all newlines/tabs to spaces
    const flat = text.replace(/[\r\n\t]+/g, " ");
    document.execCommand("insertText", false, flat);
    if (editorRef.current && onChange) {
      const raw = editorRef.current.innerHTML;
      onChange(allowBold ? raw : stripAllTags(raw));
    }
  };

  const handleInput = () => {
    if (editorRef.current && onChange) {
      const raw = editorRef.current.innerHTML;
      onChange(allowBold ? raw : stripAllTags(raw));
    }
    if (allowBold) {
      checkBoldState();
    }
  };

  const hasContent = Boolean(
    value && String(value).replace(/<[^>]*>/g, "").trim().length > 0
  );

  return (
    <div className="relative group">
      <div
        id={id}
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onKeyUp={checkBoldState}
        onMouseUp={checkBoldState}
        onFocus={() => {
          setIsFocused(true);
          checkBoldState();
        }}
        onBlur={(e) => {
          setIsFocused(false);
          setIsBold(false);
          if (onBlur) {
            const raw = e.currentTarget.innerHTML;
            onBlur(allowBold ? raw : stripAllTags(raw));
          }
        }}
        style={{ minHeight }}
        className={`w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 transition-all focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 leading-relaxed overflow-y-auto ${className}`}
      />

      {/* Placeholder overlay when empty */}
      {!hasContent && !isFocused && (
        <div
          onClick={() => editorRef.current?.focus()}
          className="absolute left-3.5 top-2.5 text-xs text-slate-300 pointer-events-none select-none"
        >
          {placeholder}
        </div>
      )}

      {/* Bold Indicator (only when allowBold is true) */}
      {allowBold && isFocused && (
        <div className="absolute top-2 right-2.5 flex items-center pointer-events-none select-none transition-opacity duration-150">
          {isBold ? (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-blue-100 text-blue-700 shadow-sm border border-blue-200/60 animate-in fade-in zoom-in-95">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
              Bold ON
            </span>
          ) : (
            <span className="text-[10px] text-slate-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              Select text + Ctrl+B to bold
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default function SetupModal({
  open,
  onClose,
  eventId,
  userId: propUserId,
  onSave,
}) {
  const [showRegional, setShowRegional] = useState(true);
  const [rows, setRows] = useState([]);
  const [editingRows, setEditingRows] = useState({}); // { [rowIdx]: boolean }
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [translatingKey, setTranslatingKey] = useState(null);
  const debounceTimersRef = useRef({});

  const resolveUserId = () => {
    if (propUserId) return Number(propUserId);
    try {
      const raw = localStorage.getItem("userId");
      if (raw && !isNaN(Number(raw))) return Number(raw);
      const userObj = JSON.parse(localStorage.getItem("user") || "{}");
      if (userObj?.id) return Number(userObj.id);
    } catch (e) {
      console.warn("Could not read userId:", e);
    }
    return 233;
  };

  const activeUserId = resolveUserId();

  // ── Fetch Setup from API on open ─────────────────────────────────────────────
  const loadSetupData = async () => {
    setLoading(true);
    try {
      if (eventId) {
        const res = await getExhibitionSetupByEventUser(eventId, activeUserId);
        const data = res?.data?.data || res?.data;
        if (data && Array.isArray(data.details) && data.details.length > 0) {
          const mapped = data.details.map((d, dIdx) => ({
            id: d.id || null,
            headingNameEnglish: d.headingNameEnglish || "",
            headingNameGujarati: sanitizeOnlyBTag(d.headingNameGujarati || ""),
            headingNameHindi: sanitizeOnlyBTag(d.headingNameHindi || ""),
            sortorder: d.sortorder || dIdx + 1,
            items:
              Array.isArray(d.exhibitionSetupItemDetails) &&
              d.exhibitionSetupItemDetails.length > 0
                ? d.exhibitionSetupItemDetails.map((it, itIdx) => ({
                    id: it.id || null,
                    descriptionEnglish: it.descriptionEnglish || "",
                    descriptionGujarati: sanitizeOnlyBTag(it.descriptionGujarati || ""),
                    descriptionHindi: sanitizeOnlyBTag(it.descriptionHindi || ""),
                    sortorder: it.sortorder || itIdx + 1,
                  }))
                : [
                    {
                      id: null,
                      descriptionEnglish: "",
                      descriptionGujarati: "",
                      descriptionHindi: "",
                      sortorder: 1,
                    },
                  ],
          }));
          setRows(mapped);
          setEditingRows({});
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      console.info("No saved setup found from backend, loading defaults:", err);
    }

    setRows(JSON.parse(JSON.stringify(DEFAULT_ROWS)));
    setEditingRows({});
    setLoading(false);
  };

  useEffect(() => {
    if (open) {
      loadSetupData();
    }
  }, [open, eventId, activeUserId]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const toggleEditRow = (rowIdx) => {
    setEditingRows((prev) => ({
      ...prev,
      [rowIdx]: !prev[rowIdx],
    }));
  };

  // ── Auto-translation helper ──────────────────────────────────────────────────
  const triggerAutoTranslate = (key, englishText, updateCallback) => {
    if (!englishText || !englishText.trim()) return;

    if (debounceTimersRef.current[key]) {
      clearTimeout(debounceTimersRef.current[key]);
    }

    setTranslatingKey(key);

    debounceTimersRef.current[key] = setTimeout(async () => {
      try {
        const { gujarati, hindi, boldPhrases } = await executeTranslation(englishText);
        updateCallback(gujarati, hindi, boldPhrases);
      } catch (err) {
        console.error("Auto translation error:", err);
      } finally {
        setTranslatingKey(null);
      }
    }, 180);
  };

  // ── Update Heading in a Row ──────────────────────────────────────────────────
  const updateRowHeading = (rowIdx, field, value) => {
    setRows((prev) =>
      prev.map((r, i) => {
        if (i !== rowIdx) return r;
        return { ...r, [field]: value };
      })
    );

    if (field === "headingNameEnglish") {
      triggerAutoTranslate(`heading_${rowIdx}`, value, (gujarati, hindi, boldPhrases) => {
        setRows((prev) =>
          prev.map((r, i) => {
            if (i !== rowIdx) return r;

            let updatedGu = r.headingNameGujarati || gujarati;
            let updatedHi = r.headingNameHindi || hindi;

            // Automatically bold matching phrases in Gujarati and Hindi
            if (boldPhrases && boldPhrases.length > 0) {
              for (const bp of boldPhrases) {
                if (bp.gujarati) updatedGu = applyBoldToText(updatedGu, bp.gujarati);
                if (bp.hindi) updatedHi = applyBoldToText(updatedHi, bp.hindi);
              }
            } else if (!value.includes("<b>")) {
              // If English has no bold tags, strip bold from Gujarati and Hindi
              updatedGu = updatedGu.replace(/<\/?b>/gi, "");
              updatedHi = updatedHi.replace(/<\/?b>/gi, "");
            }

            if (!r.headingNameGujarati) updatedGu = gujarati;
            if (!r.headingNameHindi) updatedHi = hindi;

            return {
              ...r,
              headingNameGujarati: sanitizeOnlyBTag(updatedGu),
              headingNameHindi: sanitizeOnlyBTag(updatedHi),
            };
          })
        );
      });
    }
  };

  // ── Update Description Item in a Row ─────────────────────────────────────────
  const updateRowItem = (rowIdx, itemIdx, field, value) => {
    setRows((prev) =>
      prev.map((r, i) => {
        if (i !== rowIdx) return r;
        const newItems = r.items.map((it, idx) => {
          if (idx !== itemIdx) return it;
          return { ...it, [field]: value };
        });
        return { ...r, items: newItems };
      })
    );

    if (field === "descriptionEnglish") {
      triggerAutoTranslate(
        `item_${rowIdx}_${itemIdx}`,
        value,
        (gujarati, hindi, boldPhrases) => {
          setRows((prev) =>
            prev.map((r, i) => {
              if (i !== rowIdx) return r;
              const newItems = r.items.map((it, idx) => {
                if (idx !== itemIdx) return it;

                let updatedGu = it.descriptionGujarati || gujarati;
                let updatedHi = it.descriptionHindi || hindi;

                // Automatically bold matching phrases in Gujarati and Hindi
                if (boldPhrases && boldPhrases.length > 0) {
                  for (const bp of boldPhrases) {
                    if (bp.gujarati) updatedGu = applyBoldToText(updatedGu, bp.gujarati);
                    if (bp.hindi) updatedHi = applyBoldToText(updatedHi, bp.hindi);
                  }
                } else if (!value.includes("<b>")) {
                  // If English has no bold tags, strip bold from Gujarati and Hindi
                  updatedGu = updatedGu.replace(/<\/?b>/gi, "");
                  updatedHi = updatedHi.replace(/<\/?b>/gi, "");
                }

                if (!it.descriptionGujarati) updatedGu = gujarati;
                if (!it.descriptionHindi) updatedHi = hindi;

                return {
                  ...it,
                  descriptionGujarati: sanitizeOnlyBTag(updatedGu),
                  descriptionHindi: sanitizeOnlyBTag(updatedHi),
                };
              });
              return { ...r, items: newItems };
            })
          );
        }
      );
    }
  };



  // ── Add Row ──────────────────────────────────────────────────────────────────
  const handleAddRow = () => {
    const newRowIdx = rows.length + 1;
    const newRow = {
      id: null,
      headingNameEnglish: `Specification ${newRowIdx}`,
      headingNameGujarati: `વિશિષ્ટતા ${newRowIdx}`,
      headingNameHindi: `विनिर्देश ${newRowIdx}`,
      sortorder: newRowIdx,
      items: [
        {
          id: null,
          descriptionEnglish: "",
          descriptionGujarati: "",
          descriptionHindi: "",
          sortorder: 1,
        },
      ],
    };
    setRows((prev) => [...prev, newRow]);
    setEditingRows((prev) => ({
      ...prev,
      [rows.length]: true,
    }));
  };

  // ── Delete Row (Detail) ──────────────────────────────────────────────────────
  const handleDeleteRow = async (rowIdx) => {
    const row = rows[rowIdx];
    if (row.id) {
      const result = await Swal.fire({
        title: "Delete Row?",
        text: `ROW ${rowIdx + 1} will be permanently removed.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#64748b",
        confirmButtonText: "Yes, delete",
      });

      if (!result.isConfirmed) return;

      try {
        const res = await deleteExhibitionSetupDetail(row.id);
        const msg = res?.data?.msg || "Detail deleted successfully.";
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: msg,
          showConfirmButton: false,
          timer: 1500,
        });
      } catch (err) {
        console.error("Backend detail delete error:", err);
        Swal.fire({
          icon: "error",
          title: "Delete Failed",
          text: err?.response?.data?.msg || err?.message || "Failed to delete detail.",
        });
        return;
      }
    }

    setRows((prev) => prev.filter((_, i) => i !== rowIdx));
  };

  // ── Delete Sub-Item within a Row (Item Detail) ───────────────────────────────
  const handleDeleteSubItem = async (rowIdx, itemIdx) => {
    const row = rows[rowIdx];
    const item = row.items[itemIdx];

    if (item?.id) {
      const result = await Swal.fire({
        title: "Delete Detail Item?",
        text: "This detail item will be permanently removed.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#64748b",
        confirmButtonText: "Yes, delete",
      });

      if (!result.isConfirmed) return;

      try {
        const res = await deleteExhibitionSetupItemDetail(item.id);
        const msg = res?.data?.msg || "Item detail deleted successfully.";
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: msg,
          showConfirmButton: false,
          timer: 1500,
        });
      } catch (err) {
        console.error("Backend item delete error:", err);
        Swal.fire({
          icon: "error",
          title: "Delete Failed",
          text: err?.response?.data?.msg || err?.message || "Failed to delete item detail.",
        });
        return;
      }
    }

    setRows((prev) =>
      prev.map((r, i) => {
        if (i !== rowIdx) return r;
        return {
          ...r,
          items: r.items.filter((_, idx) => idx !== itemIdx),
        };
      })
    );
  };

  // ── Add Sub-Item to a Row ────────────────────────────────────────────────────
  const handleAddSubItem = (rowIdx) => {
    setRows((prev) =>
      prev.map((r, i) => {
        if (i !== rowIdx) return r;
        return {
          ...r,
          items: [
            ...r.items,
            {
              id: null,
              descriptionEnglish: "",
              descriptionGujarati: "",
              descriptionHindi: "",
              sortorder: r.items.length + 1,
            },
          ],
        };
      })
    );
  };

  // ── Save Handler (Strictly sanitizes to only <b> and </b> tags) ───────────────
  const handleSave = async () => {
    setSaving(true);

    const payload = {
      eventId: Number(eventId) || 0,
      userId: Number(activeUserId) || 0,
      details: rows.map((r, rIdx) => ({
        id: r.id && Number(r.id) > 0 ? Number(r.id) : null,
        sortorder: r.sortorder ? Number(r.sortorder) : rIdx + 1,
        headingNameEnglish: sanitizeOnlyBTag(r.headingNameEnglish),
        headingNameGujarati: sanitizeOnlyBTag(r.headingNameGujarati),
        headingNameHindi: sanitizeOnlyBTag(r.headingNameHindi),
        exhibitionSetupItemDetails: (r.items || []).map((it, itIdx) => ({
          id: it.id && Number(it.id) > 0 ? Number(it.id) : null,
          sortorder: it.sortorder ? Number(it.sortorder) : itIdx + 1,
          descriptionEnglish: sanitizeOnlyBTag(it.descriptionEnglish),
          descriptionGujarati: sanitizeOnlyBTag(it.descriptionGujarati),
          descriptionHindi: sanitizeOnlyBTag(it.descriptionHindi),
        })),
      })),
    };

    try {
      const res = await saveExhibitionSetup(payload);
      const success = res?.data?.success ?? res?.success;
      const msg =
        res?.data?.msg || res?.msg || "Exhibition setup saved successfully.";

      if (success) {
        Swal.fire({
          icon: "success",
          title: "Saved!",
          text: msg,
          timer: 1500,
          showConfirmButton: false,
        });

        if (onSave) onSave(payload);
        onClose();
      } else {
        Swal.fire({
          icon: "error",
          title: "Save Failed",
          text: msg,
        });
      }
    } catch (err) {
      console.error("Save exhibition setup error:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          err?.response?.data?.msg ||
          err?.message ||
          "Failed to save exhibition setup.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 p-3 sm:p-6 backdrop-blur-[2px] transition-opacity"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="setup-modal-title"
        className="relative flex flex-col w-full max-w-[760px] max-h-[92vh] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
          <div>
            <h2
              id="setup-modal-title"
              className="text-lg font-bold text-slate-800 leading-tight"
            >
              Setup
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 font-medium">
              Exhibition Module • Event Setup &amp; Technical Specifications
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Toggle: Show हिंदी & (ગુજરાતી) */}
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-[13px] font-medium text-slate-600 select-none">
                Show हिंदी &amp; (ગુજરાતી)
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={showRegional}
                onClick={() => setShowRegional(!showRegional)}
                className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  showRegional ? "bg-[#185adb]" : "bg-slate-300"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    showRegional ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* + Add Row Button */}
            <button
              type="button"
              onClick={handleAddRow}
              className="inline-flex items-center gap-1 bg-[#22c55e] hover:bg-[#16a34a] text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-colors"
            >
              <Plus size={14} className="stroke-[2.5]" />
              Add Row
            </button>

            {/* Close Button */}
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors ml-1"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/30">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-2 text-slate-400">
              <Loader2 size={28} className="animate-spin text-blue-600" />
              <span className="text-xs">Loading specifications...</span>
            </div>
          ) : rows.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center text-xs text-slate-400">
              No specifications added yet. Click &quot;+ Add Row&quot; above to add one.
            </div>
          ) : (
            rows.map((row, rowIdx) => {
              const isEditing = !!editingRows[rowIdx];
              const isTranslating =
                translatingKey === `row_${rowIdx}` ||
                translatingKey === `heading_${rowIdx}` ||
                translatingKey?.startsWith(`item_${rowIdx}_`);

              // ── EDIT MODE: Inputs open when pencil was clicked ──
              if (isEditing) {
                return (
                  <div
                    key={row.id || rowIdx}
                    className="rounded-xl border-2 border-blue-400/60 bg-white p-4 sm:p-5 shadow-md space-y-4 transition-all"
                  >
                    {/* Row Action Header (Done & Delete) */}
                    <div className="flex items-center justify-between">
                      <div>
                        {isTranslating && (
                          <span className="flex items-center gap-1 text-[11px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium">
                            <Loader2 size={11} className="animate-spin" /> Translating...
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleEditRow(rowIdx)}
                          className="inline-flex items-center gap-1 bg-blue-600 text-white hover:bg-blue-700 px-3 py-1 rounded-lg text-xs font-semibold shadow-sm transition-colors"
                        >
                          <Check size={13} className="stroke-[2.5]" />
                          Done
                        </button>

                        {rows.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteRow(rowIdx)}
                            title="Delete this row"
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-1"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Heading Inputs */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Heading (English) <span className="text-red-500">*</span>
                        </label>
                        <RichTextEditor
                          id={`heading_input_${rowIdx}_english`}
                          singleLine={true}
                          minHeight="38px"
                          value={row.headingNameEnglish || ""}
                          onChange={(val) =>
                            updateRowHeading(rowIdx, "headingNameEnglish", val)
                          }
                          onBlur={(val) => {
                            if (val && (!row.headingNameGujarati || !row.headingNameHindi)) {
                              executeTranslation(val).then(({ gujarati, hindi }) => {
                                setRows((prev) =>
                                  prev.map((r, i) =>
                                    i === rowIdx
                                      ? {
                                          ...r,
                                          headingNameGujarati: gujarati || r.headingNameGujarati,
                                          headingNameHindi: hindi || r.headingNameHindi,
                                        }
                                      : r
                                  )
                                );
                              });
                            }
                          }}
                          placeholder="Heading (Select text and press Ctrl+B to bold)"
                        />
                      </div>

                      {showRegional && (
                        <>
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Heading (Name (ગુજરાતી))
                            </label>
                            <RichTextEditor
                              id={`heading_input_${rowIdx}_gujarati`}
                              singleLine={true}
                              allowBold={true}
                              minHeight="38px"
                              value={row.headingNameGujarati || ""}
                              onChange={(val) =>
                                updateRowHeading(rowIdx, "headingNameGujarati", val)
                              }
                              placeholder="Heading (Select text and press Ctrl+B to bold)"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Heading (Hindi)
                            </label>
                            <RichTextEditor
                              id={`heading_input_${rowIdx}_hindi`}
                              singleLine={true}
                              allowBold={true}
                              minHeight="38px"
                              value={row.headingNameHindi || ""}
                              onChange={(val) =>
                                updateRowHeading(rowIdx, "headingNameHindi", val)
                              }
                              placeholder="Heading (Select text and press Ctrl+B to bold)"
                            />
                          </div>
                        </>
                      )}
                    </div>

                    {/* Description Inputs */}
                    <div className="space-y-4 pt-2 border-t border-slate-100">
                      {row.items.map((item, itemIdx) => (
                        <div key={item.id || itemIdx} className="space-y-3">
                          {row.items.length > 1 && (
                            <div className="flex items-center justify-between pt-1">
                              <span className="text-[10px] font-semibold text-slate-400">
                                Detail Item {itemIdx + 1}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteSubItem(rowIdx, itemIdx)
                                }
                                className="text-[11px] text-rose-500 hover:text-rose-700 flex items-center gap-0.5"
                              >
                                <Trash2 size={11} /> Remove Detail
                              </button>
                            </div>
                          )}

                          {/* English Description */}
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              <span>Description (English)</span> <span className="text-red-500">*</span>
                            </label>
                            <RichTextEditor
                              id={`desc_textarea_${rowIdx}_${itemIdx}_english`}
                              minHeight="72px"
                              value={item.descriptionEnglish || ""}
                              onChange={(val) =>
                                updateRowItem(
                                  rowIdx,
                                  itemIdx,
                                  "descriptionEnglish",
                                  val
                                )
                              }
                              onBlur={(val) => {
                                if (val && (!item.descriptionGujarati || !item.descriptionHindi)) {
                                  executeTranslation(val).then(({ gujarati, hindi }) => {
                                    setRows((prev) =>
                                      prev.map((r, i) => {
                                        if (i !== rowIdx) return r;
                                        return {
                                          ...r,
                                          items: r.items.map((it, idx) =>
                                            idx === itemIdx
                                              ? {
                                                  ...it,
                                                  descriptionGujarati: gujarati || it.descriptionGujarati,
                                                  descriptionHindi: hindi || it.descriptionHindi,
                                                }
                                              : it
                                          ),
                                        };
                                      })
                                    );
                                  });
                                }
                              }}
                              placeholder="Description (Select text and press Ctrl+B to bold)"
                            />
                          </div>

                          {showRegional && (
                            <>
                              {/* Gujarati Description */}
                              <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                  Description (Name (ગુજરાતી))
                                </label>
                                <RichTextEditor
                                  id={`desc_textarea_${rowIdx}_${itemIdx}_gujarati`}
                                  allowBold={true}
                                  minHeight="72px"
                                  value={item.descriptionGujarati || ""}
                                  onChange={(val) =>
                                    updateRowItem(
                                      rowIdx,
                                      itemIdx,
                                      "descriptionGujarati",
                                      val
                                    )
                                  }
                                  placeholder="Description (Select text and press Ctrl+B to bold)"
                                />
                              </div>

                              {/* Hindi Description */}
                              <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                  Description (Hindi)
                                </label>
                                <RichTextEditor
                                  id={`desc_textarea_${rowIdx}_${itemIdx}_hindi`}
                                  allowBold={true}
                                  minHeight="72px"
                                  value={item.descriptionHindi || ""}
                                  onChange={(val) =>
                                    updateRowItem(
                                      rowIdx,
                                      itemIdx,
                                      "descriptionHindi",
                                      val
                                    )
                                  }
                                  placeholder="Description (Select text and press Ctrl+B to bold)"
                                />
                              </div>
                            </>
                          )}
                        </div>
                      ))}

                      <div className="flex items-center justify-between pt-1">
                        <button
                          type="button"
                          onClick={() => handleAddSubItem(rowIdx)}
                          className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          <Plus size={12} className="stroke-[2.5]" /> Add Another Detail
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleEditRow(rowIdx)}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          <Check size={13} /> Done Editing
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }

              // ── CLEAN DISPLAY VIEW (Matching Image 2): Pencil icon opens edit mode ──
              return (
                <div
                  key={row.id || rowIdx}
                  className="space-y-1.5 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center p-1 rounded-lg bg-blue-50">
                        {renderSectionIcon(rowIdx)}
                      </span>
                      <span className="text-[13px] font-semibold text-slate-800 tracking-tight">
                        {renderFormattedText(row.headingNameEnglish) || `Specification ${rowIdx + 1}`}
                      </span>

                      {/* Pencil Icon Button -> Opens inputs */}
                      <button
                        type="button"
                        onClick={() => toggleEditRow(rowIdx)}
                        title="Click to edit heading & description"
                        className="p-1 rounded text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors ml-0.5"
                      >
                        <Pencil size={13} className="stroke-[2.2]" />
                      </button>
                    </div>

                    {rows.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteRow(rowIdx)}
                        title="Delete specification"
                        className="p-1 rounded text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors opacity-60 group-hover:opacity-100"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>

                  {/* Clean Description Box with <b> rendered as bold */}
                  <div
                    onClick={() => toggleEditRow(rowIdx)}
                    title="Click to edit"
                    className="rounded-xl border border-slate-200 bg-white p-3.5 text-[12.5px] leading-relaxed text-slate-600 shadow-sm cursor-pointer hover:border-blue-400 hover:shadow transition-all space-y-2"
                  >
                    {row.items?.map((it, itIdx) => (
                      <div key={it.id || itIdx}>
                        {it.descriptionEnglish ? (
                          <div>{renderFormattedText(it.descriptionEnglish)}</div>
                        ) : (
                          <div className="text-slate-400 italic">
                            No description entered. Click pencil to edit.
                          </div>
                        )}
                        {showRegional && (it.descriptionGujarati || it.descriptionHindi) && (
                          <div className="mt-1 pt-1 border-t border-slate-100 text-[11.5px] text-slate-500 space-y-0.5">
                            {it.descriptionGujarati && (
                              <div>
                                <span className="font-medium text-slate-600">ગુજરાતી:</span>{" "}
                                <span>{renderFormattedText(it.descriptionGujarati)}</span>
                              </div>
                            )}
                            {it.descriptionHindi && (
                              <div>
                                <span className="font-medium text-slate-600">हिंदी:</span>{" "}
                                <span>{renderFormattedText(it.descriptionHindi)}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 bg-white">
          <div className="flex items-center gap-1.5 text-slate-400">
            <RotateCw
              size={12}
              className={`stroke-[2] ${saving || loading ? "animate-spin" : ""}`}
            />
            <span className="text-[11.5px] text-slate-400 font-normal">
              Data synced from backend specifications
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="rounded-lg bg-[#0066cc] hover:bg-[#0055b3] px-5 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors disabled:opacity-60 flex items-center gap-1.5"
            >
              <Check size={14} className="stroke-[2.5]" />
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
