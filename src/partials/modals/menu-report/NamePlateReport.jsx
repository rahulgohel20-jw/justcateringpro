import { useState, useEffect, useCallback } from "react";
import { CheckSquare, Square, Printer } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { CustomModal } from "@/components/custom-modal/CustomModal";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { getLangConfig, extractTranslations } from "@/utils/langConfig";
import RichTextEditor from "./RichTextEditor";
import Swal from "sweetalert2";
import {
  AddNamePlate,
  Translateapi,
  GenerateNamePlateReport,
  GetNamePlateByNamePlateType,
  getTableExeculisive,
  Tableexeculisivepost,
} from "@/services/apiServices";

// ─────────────────────────────────────────────────────────────────────────────
// NotesEditor — defined OUTSIDE NamePlateReport so it never re-mounts on
// parent re-render (which would kill editor focus on every keystroke).
// ─────────────────────────────────────────────────────────────────────────────
const NotesEditor = ({
  notes,
  title,
  onEnglishChange,
  onHindiChange,
  onGujaratiChange,
  langConfig,
}) => (
  <div className="space-y-6">
    {/* English — editable, triggers auto-translation */}
    <div>
      <p className="text-xs font-semibold text-gray-500 mb-2">
        {title} (English)
      </p>
      <RichTextEditor value={notes.english} onChange={onEnglishChange} />
    </div>

    {/* Hindi — editable manually, auto-filled by translation */}
    <div>
      <p className="text-xs font-semibold text-gray-500 mb-2">
        {title} (Hindi)
      </p>
      <RichTextEditor value={notes.hindi} onChange={onHindiChange} />
    </div>

    {/* Gujarati — editable manually, auto-filled by translation */}
    <div>
      <p className="text-xs font-semibold text-gray-500 mb-2">
        {title} ({langConfig.script})
      </p>
      <RichTextEditor value={notes.gujarati} onChange={onGujaratiChange} />
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// NamePlateReport
// ─────────────────────────────────────────────────────────────────────────────
export default function NamePlateReport({
  onClose,
  eventId,
  eventFunctionId,
  selectedTemplateId,
  isTableMenuExclusive,
}) {
  const pdfPlugin = defaultLayoutPlugin();
  const stripHtml = (html) => html.replace(/<[^>]*>/g, "").trim();
const langConfig = getLangConfig();
  // ── State ──────────────────────────────────────────────────────────────────
  const [pdfUrl, setPdfUrl] = useState(null);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [menuFontSize, setMenuFontSize] = useState(10);
  const [itemFontSize, setItemFontSize] = useState(15);
  const [activeTab, setActiveTab] = useState("menu");
  const [selectedLanguage, setSelectedLanguage] = useState("english");
  const [currentlang, setCurrentLang] = useState(0);
  const [items, setItems] = useState([]);

  const [headerNotes, setHeaderNotes] = useState({
    english: "",
    hindi: "",
    gujarati: "",
  });
  const [footerNotes, setFooterNotes] = useState({
    english: "",
    hindi: "",
    gujarati: "",
  });

  const storedUserId = localStorage.getItem("userId");
  const userId =
    storedUserId && Number(storedUserId) > 0 ? Number(storedUserId) : null;

  const langMap = { english: 0, hindi: 1, gujarati: 2 };

  // ── Fetch menu items ───────────────────────────────────────────────────────
  const fetchItemData = useCallback(
    async (efId) => {
      if (!userId) return;
      try {
        let res;
        if (isTableMenuExclusive) {
          res = await getTableExeculisive(
            efId ?? -1,
            eventId,
            currentlang,
            userId,
          );
        } else {
          res = await GetNamePlateByNamePlateType(
            efId ?? -1,
            eventId,
            0,
            0,
            1,
            currentlang,
            userId,
          );
        }

        const apiData = res?.data?.data;
        const list = apiData?.data || [];

        setMenuFontSize(apiData?.category_font_size ?? 10);
        setItemFontSize(apiData?.item_font_size ?? 15);

        setItems(
          list
            .sort((a, b) => a.sequence - b.sequence)
            .map((item, index) => ({
              id: item.id,
              menuid: item.menuItemId,
              itemNameEnglish: item.itemNameEnglish || "",
              itemNameHindi: item.itemNameHindi || "",
              itemNameGujarati: item.itemNameGujarati || "",
              isTableMenuChecked: item.isTableMenuChecked === 1,
              is_checked: item.is_checked === 1,
              isStandyChecked: item.isStandyChecked === 1,
              sequence: item.sequence ?? index + 1,
            })),
        );
      } catch (err) {
        console.error("Failed to fetch name plate data:", err);
      }
    },
    [userId, eventId, currentlang, isTableMenuExclusive],
  );

  useEffect(() => {
    fetchItemData(eventFunctionId);
  }, [fetchItemData, eventFunctionId]);

  // ── Translation helper ─────────────────────────────────────────────────────
  // Strips HTML tags, sends plain text to Translateapi, returns { hindi, gujarati }
  const translateText = async (html) => {
    const plainText = html.replace(/<[^>]*>/g, "").trim();
    if (!plainText) return { hindi: "", gujarati: "" };
    try {
      const res = await Translateapi(plainText);
      return {
        hindi: res?.data?.hindi || "",
        gujarati: res?.data?.gujarati || "",
      };
    } catch {
      return { hindi: "", gujarati: "" };
    }
  };

  // ── Header notes handlers ──────────────────────────────────────────────────
  const handleHeaderEnglishChange = useCallback(async (val) => {
    const plain = stripHtml(val); // ← strip <p> tags
    setHeaderNotes((prev) => ({ ...prev, english: plain }));

    if (!plain) {
      setHeaderNotes((prev) => ({ ...prev, hindi: "", gujarati: "" }));
      return;
    }
    try {
      const res = await Translateapi(plain);
const { regional, hindi } = extractTranslations(res.data);
setHeaderNotes({
  english: plain,
  hindi,
  gujarati: regional,
});
    } catch {
      setHeaderNotes((prev) => ({ ...prev, hindi: "", gujarati: "" }));
    }
  }, []);

  const handleHeaderHindiChange = useCallback(
    (val) => setHeaderNotes((prev) => ({ ...prev, hindi: stripHtml(val) })),
    [],
  );

  const handleHeaderGujaratiChange = useCallback(
    (val) => setHeaderNotes((prev) => ({ ...prev, gujarati: stripHtml(val) })),
    [],
  );

  // ── Footer notes handlers ──────────────────────────────────────────────────
  const handleFooterEnglishChange = useCallback(async (val) => {
    const plain = stripHtml(val); // ← strip <p> tags
    setFooterNotes((prev) => ({ ...prev, english: plain }));

    if (!plain) {
      setFooterNotes((prev) => ({ ...prev, hindi: "", gujarati: "" }));
      return;
    }
    try {
     const res = await Translateapi(plain);
const { regional, hindi } = extractTranslations(res.data);
setFooterNotes({
  english: plain,
  hindi,
  gujarati: regional,
});
    } catch {
      setFooterNotes((prev) => ({ ...prev, hindi: "", gujarati: "" }));
    }
  }, []);

  const handleFooterHindiChange = useCallback(
    (val) => setFooterNotes((prev) => ({ ...prev, hindi: stripHtml(val) })),
    [],
  );

  const handleFooterGujaratiChange = useCallback(
    (val) => setFooterNotes((prev) => ({ ...prev, gujarati: stripHtml(val) })),
    [],
  );

  // ── Menu item name change (with translation) ───────────────────────────────
  const handleNameChange = async (menuItemId, value) => {
    setItems((prev) =>
      prev.map((item) =>
        item.menuid === menuItemId ? { ...item, itemNameEnglish: value } : item,
      ),
    );

    if (currentlang === 0) {
      try {
        const res = await Translateapi(value);
const { regional, hindi } = extractTranslations(res.data);
setItems((prev) =>
  prev.map((item) =>
    item.menuid === menuItemId
      ? { ...item, itemNameHindi: hindi || value, itemNameGujarati: regional || value }
      : item,
  ),
);
      } catch (err) {
        console.error("Transliteration failed", err);
      }
    }
  };

  // ── Toggle item checked ────────────────────────────────────────────────────
  const toggleItem = (menuid) => {
    setItems((prev) =>
      prev.map((item) =>
        item.menuid === menuid
          ? isTableMenuExclusive
            ? { ...item, is_checked: !item.is_checked }
            : { ...item, isTableMenuChecked: !item.isTableMenuChecked }
          : item,
      ),
    );
  };

  // ── Drag & drop reorder ────────────────────────────────────────────────────
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(items);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setItems(reordered);
  };

  // ── Get item name for current language ────────────────────────────────────
  const getItemNameByLang = (item) => {
    if (currentlang === 1) return item.itemNameHindi || item.itemNameEnglish;
    if (currentlang === 2) return item.itemNameGujarati || item.itemNameEnglish;
    return item.itemNameEnglish;
  };

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async ({ printAfterSave = false } = {}) => {
    Swal.fire({
      title: "Saving...",
      text: "Please wait",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
     
      let res;

      if (isTableMenuExclusive) {
        const TablePayload = {
          categoryFontSize: menuFontSize,
          itemFontSize: itemFontSize,
          eventFunctionId: Number(eventFunctionId),
          eventId: Number(eventId),
          userId: Number(userId),
          // ── Notes — all 6 fields ──────────────────────────────────────────
          headerNotesEnglish: headerNotes.english,
          headerNotesHindi: headerNotes.hindi,
          headerNotesGujarati: headerNotes.gujarati,
          footerNotesEnglish: footerNotes.english,
          footerNotesHindi: footerNotes.hindi,
          footerNotesGujarati: footerNotes.gujarati,
          // ── Items ─────────────────────────────────────────────────────────
          items: items.map((item, index) => ({
            id: item.id || -1,
            menuItemId: item.menuid,
            is_checked: item.is_checked ? 1 : 0,
            itemCount: 1,
            itemNameEnglish: item.itemNameEnglish,
            itemNameHindi: item.itemNameHindi,
            itemNameGujarati: item.itemNameGujarati,
            sequence: index + 1,
          })),
        };
        res = await Tableexeculisivepost(TablePayload);
      } else {
        const payload = {
          headerNotesEnglish: headerNotes.english,
          headerNotesHindi: headerNotes.hindi,
          headerNotesGujarati: headerNotes.gujarati,
          footerNotesEnglish: footerNotes.english,
          footerNotesHindi: footerNotes.hindi,
          footerNotesGujarati: footerNotes.gujarati,
          categoryFontSize: menuFontSize,
          itemFontSize: itemFontSize,
          eventFunctionId: Number(eventFunctionId),
          eventId: Number(eventId),
          userId: Number(userId),
          isCounterItem: 0,
          isStandyItem: 0,
          isTableMenuItem: 1,
          namePlateRequests: items.map((item, index) => ({
            id: item.id || -1,
            menuItemId: item.menuid,
            isTableMenuChecked: item.isTableMenuChecked ? 1 : 0,
            isStandyChecked: 0,
            itemCount: 1,
            itemNameEnglish: item.itemNameEnglish,
            itemNameHindi: item.itemNameHindi,
            itemNameGujarati: item.itemNameGujarati,
            sequence: index + 1,
          })),
        };
        res = await AddNamePlate(payload);
      }

      if (!res?.data?.success) throw new Error(res?.data?.msg || "Save failed");

      await fetchItemData(eventFunctionId);
      Swal.close();

      if (printAfterSave) {
        await handlePrint();
      } else {
        Swal.fire("Saved Successfully", res?.data?.msg, "success");
        onClose();
      }
    } catch (err) {
      Swal.fire("Save Failed", err.message, "error");
    }
  };

  // ── Print ──────────────────────────────────────────────────────────────────
  const handlePrint = async () => {
    try {
      const formData = new FormData();
      formData.append("adminTemplateModuleId", selectedTemplateId);
      formData.append("eventFunctionId", eventFunctionId);
      formData.append("eventId", eventId);
      formData.append("isCompanyDetails", 0);
      formData.append("lang", langMap[selectedLanguage]);
      formData.append("twoLanugage", 0);
      formData.append("userId", userId);

      const res = await GenerateNamePlateReport(formData);
      const url = res?.data?.report_path;
      if (!url) throw new Error("PDF not generated");

      setPdfUrl(url);
      setShowPdfViewer(true);
    } catch (err) {
      Swal.fire("Print Failed", err.message, "error");
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="rounded-xl border shadow-md mx-auto max-w-5xl">
      {/* ── Header ── */}
      <div className="flex justify-between items-center px-6 py-4 border-b">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Table Menu Report</h2>
          <p className="text-sm text-gray-500">
            Customize your menu layout and notes
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-xl"
        >
          ✕
        </button>
      </div>

      {/* ── Language Selector ── */}
      <div className="border-b p-4">
        <label className="block text-sm font-semibold mb-2 text-gray-700">
          Select Language
        </label>
        <div className="flex border rounded-lg overflow-hidden">
          {["english", "hindi", "gujarati"].map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => {
                setSelectedLanguage(lang);
                setCurrentLang(langMap[lang]);
              }}
              className={`flex-1 py-2 text-sm font-semibold transition ${
                selectedLanguage === lang
                  ? "btn btn-primary text-white"
                  : "bg-white"
              }`}
            >
              {lang === "gujarati"
      ? langConfig.script
      : lang.charAt(0).toUpperCase() + lang.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex bg-gray-100 rounded-xl p-1 mx-6 mt-4">
        {[
          { key: "menu", label: "Menu Item List" },
          { key: "header", label: "Header Notes" },
          { key: "footer", label: "Footer Notes" },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 text-sm font-semibold py-2 rounded-xl transition-colors ${
              activeTab === tab.key
                ? "btn btn-primary text-white"
                : "text-gray-500 hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      <div className="p-6 space-y-6">
        {/* MENU TAB */}
        {activeTab === "menu" && (
          <>
            {/* Font size inputs */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-semibold text-gray-500">
                  MENU CATEGORY FONT SIZE
                </label>
                <input
                  type="tel"
                  min={8}
                  max={20}
                  value={menuFontSize}
                  onChange={(e) => setMenuFontSize(Number(e.target.value))}
                  className="w-full mt-2 border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500">
                  MENU ITEM FONT SIZE
                </label>
                <input
                  type="tel"
                  min={8}
                  max={20}
                  value={itemFontSize}
                  onChange={(e) => setItemFontSize(Number(e.target.value))}
                  className="w-full mt-2 border rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            {/* Selected count */}
            <div className="flex justify-between">
              <span className="text-xs font-semibold text-gray-500">
                ACTIVE MENU ITEMS
              </span>
              <span className="text-xs text-blue-600 font-semibold">
                {
                  items.filter((i) =>
                    isTableMenuExclusive ? i.is_checked : i.isTableMenuChecked,
                  ).length
                }{" "}
                Items Selected
              </span>
            </div>

            {/* Drag & drop list */}
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="menu-items">
                {(provided) => (
                  <div
                    className="space-y-3 max-h-[300px] overflow-y-auto pr-2"
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    {items.map((item, index) => {
                      const isChecked = isTableMenuExclusive
                        ? item.is_checked
                        : item.isTableMenuChecked;
                      return (
                        <Draggable
                          key={item.menuid ?? `temp-${index}`}
                          draggableId={(
                            item.menuid ?? `temp-${index}`
                          ).toString()}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`flex items-center gap-4 p-4 rounded-lg border transition-all
                                ${isChecked ? "bg-white" : "bg-gray-100 opacity-70"}
                                ${snapshot.isDragging ? "shadow-lg bg-blue-50" : ""}
                              `}
                            >
                              {/* Drag handle */}
                              <span
                                {...provided.dragHandleProps}
                                className="cursor-move text-gray-400 text-lg"
                              >
                                ⋮⋮
                              </span>

                              {/* Checkbox */}
                              <button
                                type="button"
                                onClick={() => toggleItem(item.menuid)}
                              >
                                {isChecked ? (
                                  <CheckSquare className="text-blue-600" />
                                ) : (
                                  <Square className="text-gray-400" />
                                )}
                              </button>

                              {/* Name input */}
                              <div className="flex-1">
                                <p className="text-xs text-gray-400 font-semibold mb-1">
                                  NAME
                                </p>
                                <input
                                  type="text"
                                  value={getItemNameByLang(item)}
                                  onChange={(e) =>
                                    handleNameChange(
                                      item.menuid,
                                      e.target.value,
                                    )
                                  }
                                  disabled={!isChecked}
                                  className={`w-full font-semibold border rounded px-2 py-1 ${
                                    isChecked
                                      ? "text-gray-800 bg-white"
                                      : "text-gray-400 bg-gray-50"
                                  }`}
                                />
                              </div>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </>
        )}

        {/* HEADER NOTES TAB */}
        {activeTab === "header" && (
          <NotesEditor
            notes={headerNotes}
            title="Header Notes"
            onEnglishChange={handleHeaderEnglishChange}
            onHindiChange={handleHeaderHindiChange}
            onGujaratiChange={handleHeaderGujaratiChange}
            langConfig={langConfig}
          />
        )}

        {/* FOOTER NOTES TAB */}
        {activeTab === "footer" && (
          <NotesEditor
            notes={footerNotes}
            title="Footer Notes"
            onEnglishChange={handleFooterEnglishChange}
            onHindiChange={handleFooterHindiChange}
            onGujaratiChange={handleFooterGujaratiChange}
            langConfig={langConfig}
          />
        )}
      </div>

      {/* ── Footer Buttons ── */}
      <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
        <button
          type="button"
          className="btn btn-primary flex items-center gap-2"
          onClick={() => handleSave({ printAfterSave: true })}
        >
          <Printer size={16} /> Save & Print
        </button>
      </div>

      {/* ── PDF Viewer Modal ── */}
      {/* {showPdfViewer && pdfUrl && (
        <CustomModal
          open={showPdfViewer}
          onClose={() => setShowPdfViewer(false)}
          title="Table Menu Report"
          width={1000}
        >
          <div style={{ height: "80vh" }}>
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
              <Viewer
                fileUrl={pdfUrl}
                plugins={[pdfPlugin]}
                defaultScale={1.0}
              />
            </Worker>
          </div>
        </CustomModal>
      )} */}

      {/* ── PDF Viewer Modal ── */}
{showPdfViewer && pdfUrl && (
  <CustomModal
    open={showPdfViewer}
    onClose={() => setShowPdfViewer(false)}
    title="Table Menu Report"
    width={1000}
  >
    <div style={{ height: "80vh" }}>
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
        <Viewer
          fileUrl={pdfUrl}
          plugins={[pdfPlugin]}
          defaultScale={1.0}
          renderLoader={(percentages) => (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>

              <p className="mt-4 text-gray-600 font-medium">
                Loading PDF... {Math.round(percentages)}%
              </p>
            </div>
          )}
        />
      </Worker>
    </div>
  </CustomModal>
)}
    </div>
  );
}
