import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { CustomModal } from "@/components/custom-modal/CustomModal";
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

// ✅ Fix for react-beautiful-dnd + React 18 Strict Mode
const StrictModeDroppable = ({ children, ...props }) => {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));
    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);
  if (!enabled) return null;
  return <Droppable {...props}>{children}</Droppable>;
};

const initialCounters = [];

const CounterNameplate = ({
  isModalOpen,
  setIsModalOpen,
  eventId,
  eventFunctionId,
  selectedTemplateId,
  withLogo = false,
  type=null,
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

  const [currentlang, setCurrentLang] = useState(0);
  const [counters, setCounters] = useState(initialCounters);
  let userId = localStorage.getItem("userId");
  const [pdfUrl, setPdfUrl] = useState(null);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [numberOfColumns, setNumberOfColumns] = useState(1);
  const [numberOfItemsPerPage, setNumberOfItemsPerPage] = useState(5);
const langConfig = getLangConfig();
  const col1Items = [5, 6, 7, 8, 9];
  const col2Items = [10, 12, 14, 16, 18];

  const handleColumnChange = (val) => {
    setNumberOfColumns(val);
    setNumberOfItemsPerPage(val === 2 ? 10 : 5);
  };

  useEffect(() => {
    if (isModalOpen && eventId && eventFunctionId && userId) {
      fetchItemdata();
    }
  }, [isModalOpen, eventId, eventFunctionId, currentlang]);

  const fetchItemdata = async () => {
    const data = await GetNamePlateByNamePlateType(
      eventFunctionId,
      eventId,
      1,
      0,
      0,
      0,
      userId,
    );
    try {
      const res = data?.data?.data?.data || [];

      const formattedCounters = res
        .sort((a, b) => a.sequence - b.sequence)
        .map((item) => ({
          id: item.id,
          menuItemId: item.menuItemId,
          sequence: item.sequence,
          isChecked: item.isChecked,
          copies: item.itemCount ?? 0,
          itemNameEnglish: item.itemNameEnglish || "",
          itemNameHindi: item.itemNameHindi || item.itemNameEnglish,
          itemNameGujarati: item.itemNameGujarati || item.itemNameEnglish,
        }));

      setCounters(formattedCounters);
    } catch (error) {
      console.error("Error fetching name plate data:", error);
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(counters);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);

    setCounters(items);
  };

  const handleNameChange = async (menuItemId, value) => {
    setCounters((prev) =>
      prev.map((item) => {
        if (item.menuItemId !== menuItemId) return item;
        if (currentlang === 0) return { ...item, itemNameEnglish: value };
        if (currentlang === 1) return { ...item, itemNameHindi: value };
        if (currentlang === 2) return { ...item, itemNameGujarati: value };
        return item;
      }),
    );

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

  const handleSave = async ({
    printAfterSave = false,
    twoLanugage = 0,
  } = {}) => {
    Swal.fire({
      title: "Saving...",
      text: "Please wait while we save name plate data",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const payload = {
        categoryFontSize: 0,
        itemFontSize: 0,
        eventFunctionId: Number(eventFunctionId),
        eventId: Number(eventId),
        userId: Number(userId),
        isStandyItem: 0,
        isCounterItem: 1,
        isTableMenuItem: 0,
        namePlateRequests: counters.map((item, index) => ({
          id: item.id || -1,
          menuItemId: item.menuItemId,
          isStandyChecked: 0,
          isTableMenuChecked: 0,
          isChecked: item.isChecked,
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
        await callPrintApi({ twoLanugage });
      } else {
        Swal.fire("Saved Successfully", res?.data?.msg, "success");
        setIsModalOpen(false);
      }
    } catch (error) {
      Swal.fire("Save Failed", error.message, "error");
    }
  };

  const callPrintApi = async ({ twoLanugage = 0 } = {}) => {
    try {
      const formData = new FormData();
      formData.append("numberOfColumns", numberOfColumns);
      formData.append("numberOfItemsPerPage", numberOfItemsPerPage);
      formData.append("adminTemplateModuleId", selectedTemplateId);
      formData.append("eventFunctionId", eventFunctionId);
      formData.append("eventId", eventId);
      formData.append("isCompanyDetails", 0);
      formData.append("lang", currentlang);
      formData.append("userId", userId);
      formData.append("twoLanugage", twoLanugage);

      const res = await GenerateNamePlateReport(formData);
      const url = res.data?.report_path;

      if (!url) throw new Error("PDF URL not received");

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

  return (
    <CustomModal
      open={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      title={
        withLogo ? "Counter Name Plate With Logo" : "Counter Name Plate Report"
      }
      width={1000}
      footer={
        <div className="flex justify-between items-center px-6 py-4 border-t bg-white">
          <div className="flex gap-3">
            <button
              className="btn btn-primary flex items-center gap-2"
              onClick={() =>
                handleSave({ printAfterSave: true, twoLanugage: 0 })
              }
            >
              <Printer size={16} /> Save & Print
            </button>
            <button
              className="btn btn-primary"
              onClick={() =>
                handleSave({ printAfterSave: true, twoLanugage: 1 })
              }
            >
              Two Language PDF
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

        {/* Column & Items Dropdowns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1">
              Column
            </label>
            <select
              value={numberOfColumns}
              onChange={(e) => handleColumnChange(Number(e.target.value))}
              className="w-full h-11 px-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value={1}>1 Column</option>
              <option value={2}>2 Column</option>
            </select>
          </div>
          {type !== "Type 9" && (
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1">
              Items
            </label>
            <select
              value={numberOfItemsPerPage}
              onChange={(e) => setNumberOfItemsPerPage(Number(e.target.value))}
              className="w-full h-11 px-3 rounded-lg border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {(numberOfColumns === 2 ? col2Items : col1Items).map((val) => (
                <option key={val} value={val}>
                  {val}
                </option>
              ))}
            </select>
          </div>
          )}
        </div>

        {/* ✅ DragDropContext uses StrictModeDroppable instead of Droppable */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <StrictModeDroppable droppableId="counters">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {counters.map((item, index) => (
                  <Draggable
                    key={item.menuItemId}
                    draggableId={String(item.menuItemId)}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`flex items-center justify-between gap-3 p-3 mb-3 rounded-xl border ${
                          item.copies === 0
                            ? "opacity-50 border-gray-200"
                            : "border-gray-300"
                        }`}
                      >
                        {/* Drag Handle */}
                        <div {...provided.dragHandleProps}>
                          <GripVertical className="text-gray-400" />
                        </div>

                        {/* Name */}
                        <input
                          value={
                            (currentlang === 0
                              ? item.itemNameEnglish
                              : currentlang === 1
                                ? item.itemNameHindi
                                : item.itemNameGujarati
                            )?.toUpperCase() || ""
                          }
                          onChange={(e) =>
                            handleNameChange(item.menuItemId, e.target.value)
                          }
                          className="flex-1 bg-transparent font-semibold outline-none uppercase"
                        />

                        {/* Copies */}
                        <div className="flex flex-col items-end">
                          <input
                            type="tel"
                            value={item.copies}
                            onChange={(e) =>
                              handleCopiesChange(
                                item.menuItemId,
                                e.target.value,
                              )
                            }
                            className="w-16 text-center border rounded-md"
                          />
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </StrictModeDroppable>
        </DragDropContext>

        {showPdfViewer && pdfUrl && (
          <CustomModal
            open={showPdfViewer}
            onClose={() => setShowPdfViewer(false)}
            title="Name Plate Report Preview"
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

export default CounterNameplate;
