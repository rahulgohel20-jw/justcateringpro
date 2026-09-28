import React, { useState, useEffect, useRef } from "react";
import { Translateapi, deleteExhibitionSetupFeature } from "@/services/apiServices";
import Swal from "sweetalert2";
import { FormattedMessage, useIntl } from "react-intl";

const getLangConfig = () => {
  try {
    const auth = JSON.parse(localStorage.getItem("auth-storage"));
    const lang = auth?.state?.user?.lang || "Gujarati";
    const langMap = {
      Gujarati: { label: "Name (ગુજરાતી)", placeholder: "ગુજરાતી નામ", descLabel: "Gujarati", descPlaceholder: "ગુજરાતી", lng: "gu", apiKey: "gujarati" },
      Tamil: { label: "Name (தமிழ்)", placeholder: "தமிழ் பெயர்", descLabel: "Tamil", descPlaceholder: "தமிழ்", lng: "ta", apiKey: "ta" },
      Telugu: { label: "Name (తెలుగు)", placeholder: "తెలుగు పేరు", descLabel: "Telugu", descPlaceholder: "తెలుగు", lng: "te", apiKey: "te" },
      Malayalam: { label: "Name (മലയാളം)", placeholder: "മലയാളം പേര്", descLabel: "Malayalam", descPlaceholder: "മലയാളം", lng: "ml", apiKey: "ml" },
      Marathi: { label: "Name (मराठी)", placeholder: "मराठी नाव", descLabel: "Marathi", descPlaceholder: "मराठी", lng: "mr", apiKey: "mr" },
    };
    return langMap[lang] || langMap["Gujarati"];
  } catch {
    return { label: "Name (ગુજરાતી)", placeholder: "ગુજરાતી નામ", descLabel: "Gujarati", descPlaceholder: "ગુજરાતી", lng: "gu", apiKey: "gujarati" };
  }
};

// Strips out <div>, <p>, <br>, <span>, \r, \n while strictly keeping <b>...</b> tags and plain text
const sanitizeToCleanHtml = (rootEl) => {
  if (!rootEl) return "";

  const walk = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent.replace(/[\r\n]+/g, " ");
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
      const tag = node.tagName.toLowerCase();
      if (tag === "br") {
        return " ";
      }
      if (tag === "div" || tag === "p") {
        const children = Array.from(node.childNodes).map(walk).join("");
        return children ? ` ${children} ` : "";
      }
      if (tag === "b" || tag === "strong") {
        const children = Array.from(node.childNodes).map(walk).join("").trim();
        return children ? `<b>${children}</b>` : "";
      }
      return Array.from(node.childNodes).map(walk).join("");
    }
    return "";
  };

  let result = Array.from(rootEl.childNodes).map(walk).join("");
  result = result.replace(/\s\s+/g, " ").trim();
  return result;
};

const sanitizeString = (text) => {
  if (!text) return "";
  return String(text)
    .replace(/<\/?(div|p|br|span)[^>]*>/gi, " ")
    .replace(/[\r\n]+/g, " ")
    .replace(/\s\s+/g, " ")
    .trim();
};

const DescriptionInput = ({
  value = "",
  onChange,
  label = "",
}) => {
  const editorRef = useRef(null);
  const [isBold, setIsBold] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const checkBoldState = () => {
    try {
      const active = document.queryCommandState("bold");
      setIsBold(!!active);
    } catch (e) {
      setIsBold(false);
    }
  };

  const triggerChange = () => {
    if (!editorRef.current) return;
    const cleanHtml = sanitizeToCleanHtml(editorRef.current);
    onChange(cleanHtml);
  };

  const handleToggleBold = (e) => {
    if (e) e.preventDefault();
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand("bold", false, null);
    checkBoldState();
    triggerChange();
  };

  const handleKeyDown = (e) => {
    // 1. Block Shift+Enter and Enter completely: no new lines, no <br>, no <div>
    if (e.key === "Enter" || (e.shiftKey && e.key === "Enter")) {
      e.preventDefault();
      return;
    }

    // 2. Ctrl + B / Cmd + B to toggle bold and update indicator
    if ((e.ctrlKey || e.metaKey) && (e.key === "b" || e.key === "B")) {
      setTimeout(() => {
        checkBoldState();
        triggerChange();
      }, 0);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = (e.clipboardData || window.clipboardData).getData("text/plain");
    const clean = pasted.replace(/[\r\n]+/g, " ");
    document.execCommand("insertText", false, clean);
    triggerChange();
  };

  // Sync incoming value to contentEditable only when external value differs
  useEffect(() => {
    if (editorRef.current) {
      const currentClean = sanitizeToCleanHtml(editorRef.current);
      const incomingClean = sanitizeString(value || "");
      if (currentClean !== incomingClean) {
        editorRef.current.innerHTML = incomingClean;
      }
    }
  }, [value]);

  const isEmpty = !value || value.trim() === "" || value === "<br>";

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        {label ? (
          <label className="block text-xs font-medium text-gray-600">
            {label}
          </label>
        ) : <div />}

        <button
          type="button"
          onMouseDown={handleToggleBold}
          title="Bold (Ctrl+B)"
          className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold rounded border transition-all cursor-pointer select-none ${
            isBold
              ? "bg-primary text-white border-primary shadow-xs ring-1 ring-primary"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300"
          }`}
        >
          <span className="font-black text-[13px] leading-none">B</span>
          <span className={`text-[10px] font-normal ${isBold ? "text-white/90" : "text-gray-400"}`}>
            Ctrl+B
          </span>
          {isBold && (
            <span className="flex items-center gap-1 text-[9px] bg-white/20 px-1 py-0.2 rounded font-bold uppercase tracking-wider text-emerald-200 ml-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
              ON
            </span>
          )}
        </button>
      </div>

      <style>{`
        .rich-desc-editor b, .rich-desc-editor strong {
          display: inline !important;
          font-weight: 700 !important;
        }
      `}</style>
      <div className="relative">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          className="rich-desc-editor block w-full min-h-[46px] max-h-[140px] p-2.5 text-sm leading-relaxed overflow-y-auto outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white cursor-text select-text rounded-md border border-gray-300 transition-colors"
          style={{ display: "block", whiteSpace: "normal", wordBreak: "break-word" }}
          onFocus={() => {
            setIsFocused(true);
            checkBoldState();
          }}
          onBlur={() => {
            setIsFocused(false);
            setIsBold(false);
            triggerChange();
          }}
          onInput={triggerChange}
          onKeyDown={handleKeyDown}
          onKeyUp={checkBoldState}
          onMouseUp={checkBoldState}
          onSelect={checkBoldState}
          onPaste={handlePaste}
        />


      </div>
    </div>
  );
};

const initialFormState = {
  headingNameEnglish: "",
  headingNameGujarati: "",
  headingNameHindi: "",
  items: [
    { descriptionEnglish: "", descriptionGujarati: "", descriptionHindi: "" },
  ],
};

const AddExhibitionSetup = ({
  isModalOpen,
  setIsModalOpen,
  onSaveCategory,
  selectedItem,
  onFeatureDeleted,
}) => {
  const intl = useIntl();
  const langConfig = getLangConfig();

  const [formData, setFormData] = useState(initialFormState);
  const [showRegionalLangs, setShowRegionalLangs] = useState(false);
  const [translatingCount, setTranslatingCount] = useState(0);
  const debounceTimersRef = useRef({});
  const nameDebounceTimerRef = useRef(null);

  useEffect(() => {
    if (selectedItem) {
      const itemsList = Array.isArray(selectedItem.features)
        ? selectedItem.features
        : Array.isArray(selectedItem.description)
        ? selectedItem.description
        : Array.isArray(selectedItem.items)
        ? selectedItem.items
        : Array.isArray(selectedItem.exhibitionSetupFeatures)
        ? selectedItem.exhibitionSetupFeatures
        : Array.isArray(selectedItem.raw?.features)
        ? selectedItem.raw.features
        : [];

      setFormData({
        headingNameEnglish:
          selectedItem.nameEnglish || selectedItem.headingNameEnglish || selectedItem.name || "",
        headingNameGujarati:
          selectedItem.nameGujarati || selectedItem.headingNameGujarati || "",
        headingNameHindi:
          selectedItem.nameHindi || selectedItem.headingNameHindi || "",
        items:
          itemsList.length > 0
            ? itemsList.map((it) =>
                typeof it === "object"
                  ? {
                      id: it.id || null,
                      descriptionEnglish: it.descriptionEnglish || it.description || "",
                      descriptionGujarati: it.descriptionGujarati || it.description_gujarati || "",
                      descriptionHindi: it.descriptionHindi || it.description_hindi || "",
                      sortorder: it.sortorder || 1,
                    }
                  : {
                      id: null,
                      descriptionEnglish: it,
                      descriptionGujarati: "",
                      descriptionHindi: "",
                      sortorder: 1,
                    }
              )
            : [{ descriptionEnglish: "", descriptionGujarati: "", descriptionHindi: "" }],
      });
    } else {
      setFormData(initialFormState);
    }
  }, [selectedItem, isModalOpen]);

  if (!isModalOpen) return null;

  const handleNameChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (field === "headingNameEnglish") {
      if (!value?.trim()) return;
      if (nameDebounceTimerRef.current) clearTimeout(nameDebounceTimerRef.current);
      nameDebounceTimerRef.current = setTimeout(() => {
        setTranslatingCount((c) => c + 1);
        Translateapi(value)
          .then((res) => {
            setFormData((prev) => ({
              ...prev,
              headingNameGujarati: res.data[langConfig.apiKey] || "",
              headingNameHindi: res.data.hindi || "",
            }));
          })
          .catch((err) => console.error("Translation error:", err))
          .finally(() => setTranslatingCount((c) => Math.max(0, c - 1)));
      }, 350);
    }
  };

  const triggerTranslateDesc = (text, index) => {
    const plainText = text.replace(/<[^>]+>/g, "").trim();
    if (!plainText) return;

    const isAllBold = text.trim().startsWith("<b>") && text.trim().endsWith("</b>");
    const hasBold = /<b>(.*?)<\/b>/i.test(text);

    if (debounceTimersRef.current[index]) {
      clearTimeout(debounceTimersRef.current[index]);
    }

    debounceTimersRef.current[index] = setTimeout(async () => {
      setTranslatingCount((c) => c + 1);
      try {
        if (isAllBold) {
          const res = await Translateapi(plainText);
          const gVal = res?.data?.[langConfig.apiKey] || res?.data?.gujarati || "";
          const hVal = res?.data?.hindi || "";

          setFormData((prev) => {
            const updated = [...prev.items];
            if (updated[index]) {
              updated[index] = {
                ...updated[index],
                descriptionGujarati: gVal ? `<b>${gVal}</b>` : "",
                descriptionHindi: hVal ? `<b>${hVal}</b>` : "",
              };
            }
            return { ...prev, items: updated };
          });
        } else if (hasBold) {
          const segments = [];
          const regex = /<b>(.*?)<\/b>/gi;
          let lastIdx = 0;
          let m;
          while ((m = regex.exec(text)) !== null) {
            if (m.index > lastIdx) {
              segments.push({ text: text.substring(lastIdx, m.index), bold: false });
            }
            segments.push({ text: m[1], bold: true });
            lastIdx = regex.lastIndex;
          }
          if (lastIdx < text.length) {
            segments.push({ text: text.substring(lastIdx), bold: false });
          }

          const translatedSegments = await Promise.all(
            segments.map(async (seg) => {
              const clean = seg.text.replace(/<[^>]+>/g, "").trim();
              if (!clean) return { g: seg.text, h: seg.text };

              const leadingSpace = seg.text.match(/^\s*/)[0];
              const trailingSpace = seg.text.match(/\s*$/)[0];

              try {
                const r = await Translateapi(clean);
                const g = r?.data?.[langConfig.apiKey] || r?.data?.gujarati || clean;
                const h = r?.data?.hindi || clean;
                return {
                  g: `${leadingSpace}${seg.bold ? `<b>${g}</b>` : g}${trailingSpace}`,
                  h: `${leadingSpace}${seg.bold ? `<b>${h}</b>` : h}${trailingSpace}`,
                };
              } catch (e) {
                return {
                  g: `${leadingSpace}${seg.bold ? `<b>${clean}</b>` : clean}${trailingSpace}`,
                  h: `${leadingSpace}${seg.bold ? `<b>${clean}</b>` : clean}${trailingSpace}`,
                };
              }
            })
          );

          setFormData((prev) => {
            const updated = [...prev.items];
            if (updated[index]) {
              updated[index] = {
                ...updated[index],
                descriptionGujarati: translatedSegments.map((s) => s.g).join("").trim(),
                descriptionHindi: translatedSegments.map((s) => s.h).join("").trim(),
              };
            }
            return { ...prev, items: updated };
          });
        } else {
          const res = await Translateapi(plainText);
          setFormData((prev) => {
            const updated = [...prev.items];
            if (updated[index]) {
              updated[index] = {
                ...updated[index],
                descriptionGujarati: res?.data?.[langConfig.apiKey] || res?.data?.gujarati || "",
                descriptionHindi: res?.data?.hindi || "",
              };
            }
            return { ...prev, items: updated };
          });
        }
      } catch (err) {
        console.error("Translation error:", err);
      } finally {
        setTranslatingCount((c) => Math.max(0, c - 1));
      }
    }, 450);
  };

  const handleDescriptionChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.items];
      const currentItem = updated[index];
      if (!currentItem) return prev;

      let newGujarati = currentItem.descriptionGujarati || "";
      let newHindi = currentItem.descriptionHindi || "";

      // Mirror bold state from English to existing Gujarati and Hindi in real time
      if (field === "descriptionEnglish") {
        const isNowBold = value.trim().startsWith("<b>") && value.trim().endsWith("</b>");
        const wasBold = currentItem.descriptionEnglish?.trim().startsWith("<b>") && currentItem.descriptionEnglish?.trim().endsWith("</b>");

        if (isNowBold && !wasBold) {
          if (newGujarati && !newGujarati.startsWith("<b>")) {
            newGujarati = `<b>${newGujarati}</b>`;
          }
          if (newHindi && !newHindi.startsWith("<b>")) {
            newHindi = `<b>${newHindi}</b>`;
          }
        } else if (!isNowBold && wasBold) {
          if (newGujarati && newGujarati.startsWith("<b>") && newGujarati.endsWith("</b>")) {
            newGujarati = newGujarati.slice(3, -4);
          }
          if (newHindi && newHindi.startsWith("<b>") && newHindi.endsWith("</b>")) {
            newHindi = newHindi.slice(3, -4);
          }
        }
      }

      updated[index] = {
        ...currentItem,
        [field]: value,
        descriptionGujarati: newGujarati,
        descriptionHindi: newHindi,
      };
      return { ...prev, items: updated };
    });

    if (field === "descriptionEnglish") {
      triggerTranslateDesc(value, index);
    }
  };

  const addRow = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { descriptionEnglish: "", descriptionGujarati: "", descriptionHindi: "" },
      ],
    }));
  };

  const removeRow = async (index) => {
    const item = formData.items[index];
    const featureId = item?.id;

    if (featureId && Number(featureId) > 0) {
      try {
        const res = await deleteExhibitionSetupFeature(featureId);
        Swal.fire({
          icon: "success",
          title: intl.formatMessage({ id: "COMMON.DELETED", defaultMessage: "Deleted!" }),
          text: res?.data?.msg || "Feature deleted successfully.",
          timer: 1200,
          showConfirmButton: false,
        });
        if (onFeatureDeleted) {
          onFeatureDeleted();
        }
      } catch (err) {
        console.error("Delete feature error:", err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: err?.response?.data?.message || err?.message || "Failed to delete feature.",
        });
        return;
      }
    }

    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!formData.headingNameEnglish?.trim()) {
      Swal.fire({
        title: intl.formatMessage({ id: "COMMON.REQUIRED", defaultMessage: "Required" }),
        text: "Please enter a setup name",
        icon: "warning",
      });
      return;
    }

    const validItems = formData.items.filter(
      (item) => item.descriptionEnglish?.trim() !== ""
    );

    if (validItems.length === 0) {
      Swal.fire({
        title: intl.formatMessage({ id: "COMMON.REQUIRED", defaultMessage: "Required" }),
        text: "Please add at least one description item",
        icon: "warning",
      });
      return;
    }

    const categoryData = {
      id: selectedItem?.id || null,
      sortorder: selectedItem?.sortorder || 1,
      headingNameEnglish: formData.headingNameEnglish.trim(),
      headingNameGujarati: formData.headingNameGujarati.trim(),
      headingNameHindi: formData.headingNameHindi.trim(),
      items: validItems.map((it, idx) => ({
        id: it.id || null,
        sortorder: idx + 1,
        descriptionEnglish: sanitizeString(it.descriptionEnglish),
        descriptionGujarati: sanitizeString(it.descriptionGujarati),
        descriptionHindi: sanitizeString(it.descriptionHindi),
      })),
    };

    await onSaveCategory(categoryData, selectedItem);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-[#F2F7FB] rounded-xl w-full max-w-3xl p-6 relative overflow-y-auto max-h-[90vh] shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-3">
          <h2 className="text-xl font-semibold text-black">
            {selectedItem ? (
              <FormattedMessage
                id="USER.EXHIBITION_SETUP.EDIT_TITLE"
                defaultMessage="Edit Exhibition Setup"
              />
            ) : (
              <FormattedMessage
                id="USER.EXHIBITION_SETUP.ADD_TITLE"
                defaultMessage="Create Exhibition Setup"
              />
            )}
          </h2>
          <button
            onClick={() => setIsModalOpen(false)}
            className="text-2xl text-gray-500 hover:text-gray-800 transition-colors"
          >
            &times;
          </button>
        </div>

        {/* Setup Name Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          {/* English */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Setup Name (English) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="input w-full"
              value={formData.headingNameEnglish}
              onChange={(e) => handleNameChange("headingNameEnglish", e.target.value)}
            />
          </div>

          {/* Regional */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {langConfig.label}
            </label>
            <input
              type="text"
              className="input w-full"
              value={formData.headingNameGujarati}
              onChange={(e) => handleNameChange("headingNameGujarati", e.target.value)}
            />
          </div>

          {/* Hindi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name (हिंदी)
            </label>
            <input
              type="text"
              className="input w-full"
              value={formData.headingNameHindi}
              onChange={(e) => handleNameChange("headingNameHindi", e.target.value)}
            />
          </div>
        </div>

        {/* Descriptions Section */}
        <div className="mb-5">
          <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <label className="text-black font-semibold text-sm">Descriptions</label>
              {translatingCount > 0 && (
                <span className="text-xs text-primary animate-pulse flex items-center gap-1">
                  <i className="ki-filled ki-loading animate-spin text-xs"></i> Translating...
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <span className="text-sm font-medium text-gray-700">
                  Show हिंदी &amp; {langConfig.label.replace("Name ", "")}
                </span>
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={showRegionalLangs}
                    onChange={() => setShowRegionalLangs((v) => !v)}
                  />
                  <div
                    className={`w-9 h-5 rounded-full transition-colors ${
                      showRegionalLangs ? "bg-primary" : "bg-gray-300"
                    }`}
                  />
                  <div
                    className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                      showRegionalLangs ? "translate-x-4" : ""
                    }`}
                  />
                </div>
              </label>

              <button
                type="button"
                onClick={addRow}
                className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-md text-sm font-medium transition-colors flex items-center gap-1"
              >
                <i className="ki-filled ki-plus text-xs"></i> Add Row
              </button>
            </div>
          </div>

          {showRegionalLangs ? (
            /* Multi-lang cards */
            <div className="space-y-4">
              {formData.items.map((item, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-3.5 bg-white shadow-sm relative"
                >
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Row {index + 1}
                    </span>
                    {formData.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRow(index)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <i className="ki-filled ki-trash text-danger"></i>
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <DescriptionInput
                      label="English"
                      value={item.descriptionEnglish}
                      onChange={(val) =>
                        handleDescriptionChange(index, "descriptionEnglish", val)
                      }
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <DescriptionInput
                        label={langConfig.descLabel}
                        value={item.descriptionGujarati}
                        onChange={(val) =>
                          handleDescriptionChange(index, "descriptionGujarati", val)
                        }
                      />
                      <DescriptionInput
                        label="Hindi"
                        value={item.descriptionHindi}
                        onChange={(val) =>
                          handleDescriptionChange(index, "descriptionHindi", val)
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Single English Input Rows */
            <div className="space-y-3">
              {formData.items.map((item, index) => (
                <div key={index} className="flex items-start gap-2 bg-white p-3 rounded-lg border border-gray-200 shadow-xs">
                  <span className="text-xs font-semibold text-gray-400 w-6 pt-7">
                    #{index + 1}
                  </span>
                  <div className="flex-1">
                    <DescriptionInput
                      value={item.descriptionEnglish}
                      onChange={(val) =>
                        handleDescriptionChange(index, "descriptionEnglish", val)
                      }
                    />
                  </div>
                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRow(index)}
                      className="btn btn-sm btn-icon btn-clear text-danger hover:bg-red-50 mt-6"
                    >
                      <i className="ki-filled ki-trash"></i>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end items-center gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setIsModalOpen(false)}
          >
            <FormattedMessage id="COMMON.CANCEL" defaultMessage="Cancel" />
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSubmit}
          >
            <FormattedMessage id="COMMON.SAVE" defaultMessage="Save" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddExhibitionSetup;
