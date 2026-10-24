import { useEffect, useState } from "react";
import BaseSelect from "../ui/BaseSelect";
import BaseInput from "../ui/BaseInput";
import Swal from "sweetalert2";
import dayjs from "dayjs";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { OutsideContactName, GetUnitData } from "@/services/apiServices";


const getFunctionTime24 = (functionStartDateTime) => {
  if (!functionStartDateTime || !/\d{1,2}:\d{2}/.test(functionStartDateTime)) return "";
  const parsed = dayjs(functionStartDateTime, "DD/MM/YYYY hh:mm A");
  return parsed.isValid() ? parsed.format("HH:mm") : "";
};

const parseDMY = (dateStr) => {
  if (!dateStr || dateStr === "-") return null;
  const parsed = dayjs(dateStr, [
    "DD/MM/YYYY",
    "YYYY-MM-DD",
    "DD/MM/YYYY hh:mm A",
    "YYYY-MM-DD HH:mm:ss",
  ]);
  return parsed.isValid() ? parsed.toDate() : null;
};

const getFunctionDateDMY = (functionStartDateTime) => {
  if (!functionStartDateTime || functionStartDateTime === "-") return "";
  const parsed = dayjs(functionStartDateTime, [
    "DD/MM/YYYY hh:mm A",
    "DD/MM/YYYY",
    "YYYY-MM-DD",
    "YYYY-MM-DD HH:mm:ss",
  ]);
  return parsed.isValid() ? parsed.format("DD/MM/YYYY") : "";
};

export default function AllocateRowOutside({
  onAllocate,
  vendorRefreshTrigger = 0,
  selectedCount,
  functionStartDateTime,
}) {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState("");
  const [quantity, setQuantity] = useState("");
  const [shiftTransPrice, setShiftTransPrice] = useState("");
  const [reportingTime, setReportingTime] = useState(() =>
    getFunctionTime24(functionStartDateTime),
  );
  const [reportingDate, setReportingDate] = useState(() =>
    getFunctionDateDMY(functionStartDateTime),
  );
  const userid = localStorage.getItem("userId");
  const [units, setUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState("");

  useEffect(() => {
    setReportingTime(getFunctionTime24(functionStartDateTime));
    setReportingDate(getFunctionDateDMY(functionStartDateTime));
  }, [functionStartDateTime]);

  useEffect(() => {
    fetchdata();
    fetchUnits();
  }, [vendorRefreshTrigger]);

  const fetchUnits = async () => {
    try {
      const data = await GetUnitData(localStorage.getItem("userId"));
      setUnits(data?.data?.data["Unit Details"] || []);
    } catch (error) {
      console.error("Error fetching units:", error);
    }
  };

  const fetchdata = async () => {
    try {
      setLoading(true);
      const partyMasters = await OutsideContactName(6, userid);
      const data = partyMasters.data.data["Party Details"] || [];
      setVendors(data);
    } catch (error) {
      console.error("Error fetching vendors:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAllocate = () => {
    const hasVendor = !!selectedVendor;
    const hasQuantity = quantity !== "" && Number(quantity) > 0;
    const hasPrice = shiftTransPrice !== "" && Number(shiftTransPrice) >= 0;
    const hasUnit = !!selectedUnit;
    const hasTime = !!reportingTime;
    const hasDate = !!reportingDate;

    if (!hasVendor && !hasQuantity && !hasPrice && !hasUnit && !hasTime && !hasDate) {
      Swal.fire({
        title: "Missing Information",
        text: "Please fill at least one field (Vendor, Quantity, Shift/Trans Price, Unit, Date, or Time)",
        icon: "warning",
      });
      return;
    }

    if (!selectedCount || selectedCount === 0) {
      Swal.fire({
        title: "No Items Selected",
        text: "Please select at least one item to allocate",
        icon: "warning",
      });
      return;
    }

    const allocationData = {};

    if (selectedVendor) {
      const selectedVendorData = vendors.find(
        (v) => String(v.id) === String(selectedVendor)
      );
      if (selectedVendorData) {
        allocationData.partyId = selectedVendor;
        allocationData.partyName = selectedVendorData.nameEnglish || "";
      }
    }

    if (selectedUnit) allocationData.unitId = selectedUnit;

    if (quantity !== "" && Number(quantity) > 0) allocationData.quantity = quantity;

    if (shiftTransPrice !== "" && Number(shiftTransPrice) >= 0)
      allocationData.shiftTransPrice = shiftTransPrice;

    if (reportingDate) allocationData.reportingDate = reportingDate;
    if (reportingTime) allocationData.reportingTime = reportingTime;

    onAllocate(allocationData);

    setSelectedVendor("");
    setQuantity("");
    setShiftTransPrice("");
    setSelectedUnit("");
    setReportingDate(getFunctionDateDMY(functionStartDateTime));
    setReportingTime(getFunctionTime24(functionStartDateTime));
  };

  return (
    <div className="px-6 py-4 border-b bg-gray-50">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-sm font-medium text-gray-700">
          Bulk Allocate {selectedCount > 0 && `(${selectedCount} selected)`}
        </span>
      </div>
      <div className="grid grid-cols-12 gap-3 items-center">
        <div className="col-span-3">
          <BaseSelect
            value={selectedVendor}
            onChange={(e) => setSelectedVendor(e.target.value)}
            disabled={loading}
          >
            <option value="">{loading ? "Loading..." : "Select Vendor"}</option>
            {vendors.map((vendor) => (
              <option key={vendor.id} value={vendor.id}>{vendor.nameEnglish}</option>
            ))}
          </BaseSelect>
        </div>

        <div className="col-span-1">
          <BaseInput
            type="tel"
            placeholder="Qty"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            min="0"
          />
        </div>

        <div className="col-span-2">
          <BaseSelect
            value={selectedUnit || ""}
            onChange={(e) => setSelectedUnit(e.target.value)}
          >
            <option value="">Select Unit</option>
            {selectedUnit &&
              !units.some((u) => String(u.id) === String(selectedUnit)) && (
                <option value={selectedUnit}>Selected Unit</option>
              )}
            {units.map((u) => (
              <option key={u.id} value={u.id}>{u.nameEnglish}</option>
            ))}
          </BaseSelect>
        </div>

        <div className="col-span-2">
          <BaseInput
            type="tel"
            placeholder="Shift/Trans Price"
            value={shiftTransPrice}
            onChange={(e) => setShiftTransPrice(e.target.value)}
            min="0"
          />
        </div>

        <div className="col-span-2">
          <DatePicker
            selected={parseDMY(reportingDate)}
            onChange={(date) =>
              setReportingDate(date ? dayjs(date).format("DD/MM/YYYY") : "")
            }
            dateFormat="dd/MM/yyyy"
            placeholderText="DD/MM/YYYY"
            className="w-full h-9 rounded-md border border-gray-300 bg-white px-2 text-sm focus:ring-2 focus:ring-blue-500/40"
            wrapperClassName="w-full"
          />
        </div>

        <div className="col-span-1">
          <input
            type="time"
            className="input w-full h-9 rounded-md border border-gray-300 bg-white px-2 text-sm focus:ring-2 focus:ring-blue-500/40"
            value={reportingTime}
            onChange={(e) => setReportingTime(e.target.value)}
            placeholder="Reporting Time"
          />
        </div>

        <div className="col-span-1">
          <button className="btn-primary w-full h-9 text-sm" onClick={handleAllocate}>
            Allocate
          </button>
        </div>
      </div>
    </div>
  );
}