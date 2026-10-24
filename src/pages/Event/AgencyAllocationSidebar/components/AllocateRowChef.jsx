import { useState, useEffect } from "react";
import dayjs from "dayjs";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import BaseSelect from "../ui/BaseSelect";
import BaseInput from "../ui/BaseInput";
import Swal from "sweetalert2";
import { OutsideContactName } from "@/services/apiServices";

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

export default function AllocateRowChef({
  onAllocate,
  vendorRefreshTrigger = 0,
  selectedCount,
  functionStartDateTime,
}) {
  const userid = localStorage.getItem("userId");
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState("");
  const [pax, setPax] = useState("");
  const [quantity, setQuantity] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [shiftTransPrice, setShiftTransPrice] = useState("");
  const [reportingTime, setReportingTime] = useState(() =>
    getFunctionTime24(functionStartDateTime),
  );
  const [reportingDate, setReportingDate] = useState(() =>
    getFunctionDateDMY(functionStartDateTime),
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchdata();
  }, [vendorRefreshTrigger]);

  useEffect(() => {
    setReportingTime(getFunctionTime24(functionStartDateTime));
    setReportingDate(getFunctionDateDMY(functionStartDateTime));
  }, [functionStartDateTime]);

  const fetchdata = async () => {
    try {
      setLoading(true);
      const partyMasters = await OutsideContactName(5, userid);
      const data = partyMasters.data.data["Party Details"] || [];
      setVendors(data);
    } catch (error) {
      console.error("Error fetching vendors:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAllocate = () => {
    if (
      !selectedVendor &&
      !serviceType &&
      (!pax || pax <= 0) &&
      (!quantity || quantity <= 0) &&
      (!shiftTransPrice || shiftTransPrice <= 0) &&
      !reportingTime &&
      !reportingDate
    ) {
      Swal.fire({
        title: "Missing Information",
        text: "Please fill at least one field",
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
      const vendor = vendors.find((v) => String(v.id) === String(selectedVendor));
      if (vendor) {
        allocationData.partyId = vendor.id;
        allocationData.partyName = vendor.nameEnglish || "";
        allocationData.number = vendor.mobileno || "";
      }
    }

    if (serviceType) allocationData.serviceType = serviceType;
    if (pax && pax > 0) allocationData.pax = pax;
    if (quantity && quantity > 0) allocationData.quantity = quantity;
    if (shiftTransPrice && shiftTransPrice >= 0)
      allocationData.shiftTransPrice = shiftTransPrice;
    if (reportingDate) allocationData.reportingDate = reportingDate;
    if (reportingTime) allocationData.reportingTime = reportingTime;

    const success = onAllocate(allocationData);

    if (success) {
      setSelectedVendor("");
      setPax("");
      setQuantity("");
      setServiceType("");
      setShiftTransPrice("");
      setReportingDate(getFunctionDateDMY(functionStartDateTime));
      setReportingTime(getFunctionTime24(functionStartDateTime));
    }
  };

  return (
    <div className="px-6 py-4 border-b bg-gray-50">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-sm font-medium text-gray-700">
          Bulk Allocate {selectedCount > 0 && `(${selectedCount} selected)`}
        </span>
      </div>
      <div className="grid grid-cols-12 gap-3 items-center">
        <div className="col-span-2">
          <BaseSelect
            value={selectedVendor}
            onChange={(e) => setSelectedVendor(e.target.value)}
            disabled={loading}
          >
            <option value="">
              {loading ? "Loading vendors..." : "Select Agency"}
            </option>
            {vendors.map((vendor) => (
              <option key={vendor.id} value={vendor.id}>
                {vendor.nameEnglish || ""}
              </option>
            ))}
          </BaseSelect>
        </div>

        <div className="col-span-2">
          <BaseSelect
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value)}
          >
            <option value="">Select Type</option>
            <option value="counter_wise">Counter Wise</option>
            <option value="plate_wise">Plate Wise</option>
          </BaseSelect>
        </div>

        <div className="col-span-1">
          <BaseInput
            placeholder="Enter pax"
            value={pax}
            onChange={(e) => setPax(e.target.value)}
            type="tel"
            min="0"
          />
        </div>

        <div className="col-span-1">
          <BaseInput
            placeholder="Enter quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            type="tel"
            min="0"
          />
        </div>

        <div className="col-span-2">
          <BaseInput
            placeholder="Shift/Trans Price"
            value={shiftTransPrice}
            onChange={(e) => setShiftTransPrice(e.target.value)}
            type="tel"
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