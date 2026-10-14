import { useEffect, useState, useCallback } from "react";
import Swal from "sweetalert2";
import { Modal } from "antd";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { CustomModal } from "@/components/custom-modal/CustomModal";
import {
  getfunctioneventpartywiselabourhelper,
  EventLaborHelperPdf,
} from "@/services/apiServices";

const DOC_FIELDS = [
  { key: "photo", label: "Photo" },
  { key: "aadharcarddocpathfront", label: "Aadhar Card (Front)" },
  { key: "aadharcarddocpathback", label: "Aadhar Card (Back)" },
  { key: "pancarddocpath", label: "PAN Card" },
  { key: "drivinglicense", label: "Driving License" },
];

// The API returns "https://justcatering.innull" when a document is missing
const isValidDocUrl = (url) =>
  typeof url === "string" && /^https?:\/\//i.test(url) && !url.endsWith("null");

const isImageUrl = (url) => /\.(jpe?g|png|gif|webp|bmp)(\?.*)?$/i.test(url);

const ViewLabourKyc = ({
  isOpen,
  onClose,
  partyId,
  partyName,
  eventFunctionId,
  eventId,
  onAssign,
}) => {
  const pdfPlugin = defaultLayoutPlugin();

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [assigning, setAssigning] = useState(false);

  const [docItem, setDocItem] = useState(null); // helper whose docs are shown
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isPdfOpen, setIsPdfOpen] = useState(false);
  const [pdfLoadingId, setPdfLoadingId] = useState(null);

  const fetchList = useCallback(() => {
    if (!eventFunctionId || !partyId || !eventId) return Promise.resolve();

    setLoading(true);
    return getfunctioneventpartywiselabourhelper(eventFunctionId, partyId, eventId)
      .then((res) => {
        const data = res?.data?.data?.["Labor Helper Details"] || [];
        const helpers = Array.isArray(data) ? data : [];
        setList(helpers);
        // isSelected from the API tells us which rows are already checked
        setSelectedIds(
          helpers.filter((item) => item.isSelected).map((item) => item.id),
        );
      })
      .catch((error) => {
        console.error("Error fetching labour helper KYC list:", error);
        setList([]);
        setSelectedIds([]);
      })
      .finally(() => setLoading(false));
  }, [eventFunctionId, partyId, eventId]);

  useEffect(() => {
    if (!isOpen || !partyId) return;
    fetchList();
  }, [isOpen, partyId, fetchList]);

  const toggleOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const toggleAll = () => {
    if (selectedIds.length === list.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(list.map((item) => item.id));
    }
  };

  const handleAssign = async () => {
    if (selectedIds.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Select at least one labour helper",
      });
      return;
    }

    const selectedItems = list.filter((item) => selectedIds.includes(item.id));

    try {
      setAssigning(true);
      if (onAssign) {
        await onAssign(selectedItems, partyId);
      }
      // refresh the list after save so isSelected/checked state reflects the server
      await fetchList();
      onClose();
    } catch (error) {
      console.error("Error assigning labour helpers:", error);
      Swal.fire({
        icon: "error",
        title: "Failed to assign",
        text: error?.response?.data?.msg || "Something went wrong",
      });
    } finally {
      setAssigning(false);
    }
  };

  const handleViewPdf = async (item) => {
    try {
      setPdfLoadingId(item.id);
      const res = await EventLaborHelperPdf(eventFunctionId, eventId, partyId);
      const pdfLink =
        res?.data?.fileUrl ||
        res?.data?.data?.fileUrl ||
        (typeof res?.data?.data === "string" ? res.data.data : null);

      if (!pdfLink) {
        Swal.fire({ icon: "error", title: "PDF not available" });
        return;
      }
      setPdfUrl(`${pdfLink}?t=${Date.now()}`); // bust cache
      setIsPdfOpen(true);
    } catch (error) {
      console.error("PDF load error:", error);
      Swal.fire({
        icon: "error",
        title: "Failed to load PDF",
        text: error?.response?.data?.msg || "Something went wrong",
      });
    } finally {
      setPdfLoadingId(null);
    }
  };

  const docsForItem = docItem
    ? DOC_FIELDS.filter((f) => isValidDocUrl(docItem[f.key])).map((f) => ({
        ...f,
        url: docItem[f.key],
      }))
    : [];

  return (
    <CustomModal
      open={isOpen}
      onClose={onClose}
      title={`KYC — Labour Helpers${partyName ? ` (${partyName})` : ""}`}
      width={800}
      footer={
        <div className="flex justify-between items-center w-full">
          <span className="text-sm text-gray-500">
            {selectedIds.length} selected
          </span>
          <div className="flex gap-2">
            <button
              className="btn btn-light"
              onClick={onClose}
              disabled={assigning}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleAssign}
              disabled={assigning || loading || list.length === 0}
            >
              {assigning ? "Assigning..." : "Assign"}
            </button>
          </div>
        </div>
      }
    >
      <div className="border border-gray-200 rounded-md max-h-[55vh] overflow-y-auto">
        {loading ? (
          <div className="p-6 text-center text-gray-500 text-sm">
            Loading...
          </div>
        ) : list.length === 0 ? (
          <div className="p-6 text-center text-gray-500 text-sm">
            No labour helpers found for this party.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="p-3 text-left w-10">
                  <input
                    type="checkbox"
                    checked={
                      list.length > 0 && selectedIds.length === list.length
                    }
                    onChange={toggleAll}
                  />
                </th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Phone No.</th>
                <th className="p-3 text-left">Aadhar No.</th>
                <th className="p-3 text-left">Pan No.</th>
                <th className="p-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {list.map((item) => (
                <tr
                  key={item.id}
                  className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer"
                  onClick={() => toggleOne(item.id)}
                >
                  <td className="p-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => toggleOne(item.id)}
                    />
                  </td>
                  <td className="p-3">{item.name || "-"}</td>
                  <td className="p-3">{item.phonenumber || "-"}</td>
                  <td className="p-3">{item.aadharcard || "-"}</td>
                  <td className="p-3">{item.pancard || "-"}</td>
                  <td className="p-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="btn btn-sm btn-light"
                        onClick={() => setDocItem(item)}
                      >
                        View Doc
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-primary"
                        disabled={pdfLoadingId === item.id}
                        onClick={() => handleViewPdf(item)}
                      >
                        {pdfLoadingId === item.id ? "Loading..." : "View PDF"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Documents modal */}
      <CustomModal
        open={!!docItem}
        onClose={() => setDocItem(null)}
        title={`Documents${docItem?.name ? ` — ${docItem.name}` : ""}`}
        width={700}
        footer={
          <div className="flex justify-end">
            <button className="btn btn-light" onClick={() => setDocItem(null)}>
              Close
            </button>
          </div>
        }
      >
        {docsForItem.length === 0 ? (
          <div className="p-6 text-center text-gray-500 text-sm">
            No documents uploaded.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {docsForItem.map((doc) => (
              <div
                key={doc.key}
                className="border border-gray-200 rounded-md p-3"
              >
                <p className="text-sm font-medium text-gray-700 mb-2">
                  {doc.label}
                </p>
                {isImageUrl(doc.url) && (
                  <a href={doc.url} target="_blank" rel="noreferrer">
                    <img
                      src={doc.url}
                      alt={doc.label}
                      className="w-full h-40 object-contain bg-gray-50 rounded mb-2"
                    />
                  </a>
                )}
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary text-xs underline break-all"
                >
                  Open in new tab
                </a>
              </div>
            ))}
          </div>
        )}
      </CustomModal>

      {/* PDF modal */}
      <Modal
        title="Labour Helper PDF"
        open={isPdfOpen}
        onCancel={() => setIsPdfOpen(false)}
        width="70%"
        zIndex={2000}
        footer={null}
        destroyOnClose
      >
        <div style={{ height: "80vh" }}>
          {pdfUrl && (
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
              <Viewer fileUrl={pdfUrl} plugins={[pdfPlugin]} />
            </Worker>
          )}
        </div>
      </Modal>
    </CustomModal>
  );
};

export default ViewLabourKyc;