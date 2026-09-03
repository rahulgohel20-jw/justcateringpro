import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { CustomModal } from "@/components/custom-modal/CustomModal";
import { CheckSquare, Square } from "lucide-react";

import { GripVertical, Printer, Save } from "lucide-react";
import {
  Translateapi,
  GenerateNamePlateReport,
  AddNamePlate,
  GetNamePlateByNamePlateType,
} from "@/services/apiServices";
import Swal from "sweetalert2";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { getLangConfig, extractTranslations } from "@/utils/langConfig";


const initialCounters = [];

const MainStandyMenuReport = ({
  isModalOpen,
  setIsModalOpen,
  eventId,
  eventFunctionId,
  selectedTemplateId,
}) => {
  const pdfPlugin = defaultLayoutPlugin({
    toolbarPlugin: {
      zoomPlugin: {
        enableShortcuts: true,
      },
    },
    renderPage: (props) => (
      <>
        {props.canvasLayer.children}
        {props.textLayer.children}
        {props.annotationLayer.children}
      </>
    ),
  });
const langConfig = getLangConfig();
  const [currentlang, setCurrentLang] = useState(0);
  const [counters, setCounters] = useState(initialCounters);
  let userId = localStorage.getItem("userId");
  const [pdfUrl, setPdfUrl] = useState(null);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [mainStandyItems, setMainStandyItems] = useState([]);

  useEffect(() => {
    if (eventId && eventFunctionId && userId) {
      
      fetchItemdata();
    }
  }, [eventId, eventFunctionId, currentlang]);

  const fetchItemdata = async () => {
    if (!userId) {
      console.warn("Cannot fetch Main Standy items: missing userId", {
        eventId,
        eventFunctionId,
        userId,
      });
      setCounters([]);
      return;
    }

    try {
    

     
      const res = await GetNamePlateByNamePlateType(
        eventFunctionId, // Can be -1 for all functions
        eventId,
        0, // isCounterItem
        1, // isStandyItem
        0, // isTableMenuItem
        currentlang,
        Number(userId),
      );

      const list = res?.data?.data?.data || [];
     

      if (list.length === 0) {
        console.warn("No Main Standy items found for this event/function");
      }

      const formattedCounters = list
        .sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0))
        .map((item, index) => ({
          id: item.id ?? -1,
          menuItemId: item.menuItemId,
          sequence: item.sequence ?? index + 1,
          isChecked: item.isChecked === 1,
          copies: item.itemCount ?? 0,
          isStandyChecked: item.isStandyChecked === 1 || item.isChecked === 1,
          // all languages
          itemNameEnglish: item.itemNameEnglish || "",
          itemNameHindi: item.itemNameHindi || item.itemNameEnglish,
          itemNameGujarati: item.itemNameGujarati || item.itemNameEnglish,
        }));

      setCounters(formattedCounters);
    } catch (error) {
      console.error("Error fetching Main Standy items:", error);
      setCounters([]);
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(counters);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);

    setCounters(items);
  };

  // ✅ Updated to use menuItemId instead of id
  const handleNameChange = async (menuItemId, value) => {
    // 1️⃣ Update immediately for better UX
    setCounters((prev) =>
      prev.map((item) => {
        if (item.menuItemId !== menuItemId) return item;

        if (currentlang === 0) return { ...item, itemNameEnglish: value };
        if (currentlang === 1) return { ...item, itemNameHindi: value };
        if (currentlang === 2) return { ...item, itemNameGujarati: value };

        return item;
      }),
    );

    // 2️⃣ ONLY translate when editing English
    if (currentlang !== 0) return;

    try {
      const res = await Translateapi(value);
const { regional, hindi } = extractTranslations(res.data);

setCounters((prev) =>
  prev.map((item) =>
    item.menuItemId === menuItemId
      ? { ...item, itemNameHindi: hindi || value, itemNameGujarati: regional || value }
      : item,
  ),
);
    } catch (error) {
      console.error("Translation failed", error);
    }
  };

  // ✅ Updated to use menuItemId instead of id
  const handleCopiesChange = (menuItemId, value) => {
    const cleanedValue = value === "" ? "" : Math.max(0, parseInt(value, 10));

    setCounters((prev) =>
      prev.map((item) =>
        item.menuItemId === menuItemId
          ? { ...item, copies: cleanedValue }
          : item,
      ),
    );
  };

  const handleSave = async ({ printAfterSave = false } = {}) => {
    Swal.fire({
      title: "Saving...",
      text: "Please wait while we save main standy data",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const payload = {
        moduleType: "MAIN_STANDY",
        eventId,
        eventFunctionId,
        userId,
        isCounterItem: 0,
        isStandyItem: 1,
        isTableMenuItem: 0,

        namePlateRequests: counters.map((item, index) => ({
          id: item.id || -1,
          menuItemId: item.menuItemId,

          isStandyChecked: item.isStandyChecked ? 1 : 0,
          isTableMenuChecked: 0,

          itemCount: item.copies,
          itemNameEnglish: item.itemNameEnglish,
          itemNameHindi: item.itemNameHindi,
          itemNameGujarati: item.itemNameGujarati,

          sequence: index + 1,
        })),
      };

      const res = await AddNamePlate(payload);

      if (!res?.data?.success) {
        throw new Error(res?.data?.msg || "Save failed");
      }

      await fetchItemdata();

      Swal.close();

      if (printAfterSave) {
        await callPrintApi();
      } else {
        Swal.fire("Saved Successfully", res?.data?.msg, "success");
        setIsModalOpen(false);
      }
    } catch (error) {
      Swal.fire("Save Failed", error.message, "error");
    }
  };

  const callPrintApi = async () => {
    try {
      const formData = new FormData();
      formData.append("adminTemplateModuleId", selectedTemplateId);
      formData.append("eventFunctionId", eventFunctionId);
      formData.append("eventId", eventId);
      formData.append("isCompanyDetails", 0);
      formData.append("lang", currentlang);
      formData.append("twoLanugage", 0);
      formData.append("userId", userId);

      const res = await GenerateNamePlateReport(formData);
      const url = res.data?.report_path;

      if (!url) {
        throw new Error("PDF URL not received");
      }

      setPdfUrl(url);
      setShowPdfViewer(true);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Print Failed",
        text: error?.message || "Unable to generate report",
      });
    }
  };

  // ✅ Updated to use menuItemId instead of id
  const toggleItem = (menuItemId) => {
    setCounters((prev) =>
      prev.map((item) =>
        item.menuItemId === menuItemId
          ? { ...item, isStandyChecked: !item.isStandyChecked }
          : item,
      ),
    );
  };

   const allChecked = counters.length > 0 && counters.every((item) => item.isStandyChecked);

  const toggleSelectAll = () => {
    const nextValue = !allChecked;
    setCounters((prev) =>
      prev.map((item) => ({ ...item, isStandyChecked: nextValue })),
    );
  };


  const getItemNameByLang = (item) => {
    if (currentlang === 1) return item.itemNameHindi || item.itemNameEnglish;
    if (currentlang === 2) return item.itemNameGujarati || item.itemNameEnglish;
    return item.itemNameEnglish;
  };

  return (
    <CustomModal
      open={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      title="Main Standy"
      width={1000}
      footer={
        <div className="flex justify-between items-center px-6 py-4 border-t bg-white">
          {/* <button
            className="btn btn-light flex items-center gap-2"
            onClick={() => handleSave()}
          >
            <Save size={16} /> Save
          </button> */}

          <div className="flex gap-3">
            {/* <button className="btn btn-primary" onClick={callPrintApi}>
              Print
            </button> */}
            <button
              className="btn btn-primary flex items-center gap-2"
              onClick={() => handleSave({ printAfterSave: true })}
            >
              <Printer size={16} /> Save & Print
            </button>
          </div>
        </div>
      }
    >
      <div className="max-h-[420px] overflow-y-auto pr-2">
        {/* Language Selector */}
        <div className="p-0 pt-0 mb-4">
          <p className="text-lg font-medium mb-2">Select Language</p>

          <div className="flex border rounded-md overflow-hidden">
            <button
              onClick={() => setCurrentLang(0)}
              className={`flex-1 py-2 text-sm font-medium transition ${
                currentlang === 0
                  ? "bg-primary text-white"
                  : "bg-white text-gray-700"
              }`}
            >
              English
            </button>

            <button
              onClick={() => setCurrentLang(1)}
              className={`flex-1 py-2 text-sm font-medium border-l transition ${
                currentlang === 1
                  ? "bg-primary text-white"
                  : "bg-white text-gray-700"
              }`}
            >
              Hindi
            </button>

            <button
  onClick={() => setCurrentLang(2)}
  className={`flex-1 py-2 text-sm font-medium border-l transition ${
    currentlang === 2 ? "bg-primary text-white" : "bg-white text-gray-700"
  }`}
>
  {langConfig.script}
</button>
          </div>
        </div>


         <div className="flex items-center justify-between px-1 mb-3">
          <button
            onClick={toggleSelectAll}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-primary transition"
          >
            {allChecked ? (
              <CheckSquare className="text-blue-600" size={20} />
            ) : (
              <Square className="text-gray-400" size={20} />
            )}
            Select All
          </button>
          <span className="text-xs text-gray-500">
            {counters.filter((c) => c.isStandyChecked).length} / {counters.length} selected
          </span>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="counters">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {counters.map((item, index) => (
                  <Draggable
                    key={item.menuItemId ?? `temp-${index}`}
                    draggableId={String(item.menuItemId ?? `temp-${index}`)}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`flex items-center gap-3 p-3 mb-3 rounded-xl border transition-all
                        ${
                          item.isStandyChecked
                            ? "bg-white border-blue-200"
                            : "bg-gray-100 opacity-70"
                        }
                        ${snapshot.isDragging ? "shadow-lg bg-blue-50" : ""}`}
                      >
                        {/* Drag Handle */}
                        <div {...provided.dragHandleProps}>
                          <GripVertical className="text-gray-400 cursor-move" />
                        </div>

                        {/* Checkbox */}
                        <button onClick={() => toggleItem(item.menuItemId)}>
                          {item.isStandyChecked ? (
                            <CheckSquare className="text-blue-600" size={20} />
                          ) : (
                            <Square className="text-gray-400" size={20} />
                          )}
                        </button>

                        {/* Editable Name Input */}
                        <div className="flex-1">
                          <p className="text-xs text-gray-400 font-semibold mb-1">
                            NAME
                          </p>
                          <input
                            type="text"
                            value={getItemNameByLang(item) || ""}
                            onChange={(e) =>
                              handleNameChange(item.menuItemId, e.target.value)
                            }
                            disabled={!item.isStandyChecked}
                            className={`w-full font-semibold border rounded px-2 py-1 uppercase ${
                              item.isStandyChecked
                                ? "text-gray-800 bg-white"
                                : ""
                            }`}
                          />
                        </div>

                        {/* Copies Input */}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {showPdfViewer && pdfUrl && (
          <CustomModal
            open={showPdfViewer}
            onClose={() => setShowPdfViewer(false)}
            title="Main Standy Report Preview"
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
        )}
      </div>
    </CustomModal>
  );
};

export default MainStandyMenuReport;
