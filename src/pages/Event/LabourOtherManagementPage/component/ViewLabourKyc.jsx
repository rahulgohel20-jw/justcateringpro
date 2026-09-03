import { useEffect, useState, useCallback } from "react";
import Swal from "sweetalert2";
import { CustomModal } from "@/components/custom-modal/CustomModal";
import { getfunctioneventpartywiselabourhelper } from "@/services/apiServices";

const ViewLabourKyc = ({
  isOpen,
  onClose,
  partyId,
  partyName,
  eventFunctionId,
  eventId,
  onAssign,
}) => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [assigning, setAssigning] = useState(false);

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

  return (
    <CustomModal
      open={isOpen}
      onClose={onClose}
      title={`KYC — Labour Helpers${partyName ? ` (${partyName})` : ""}`}
      width={700}
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
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </CustomModal>
  );
};

export default ViewLabourKyc;