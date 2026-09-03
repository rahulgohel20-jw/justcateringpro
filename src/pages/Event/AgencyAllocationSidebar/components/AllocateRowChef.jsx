import { useState, useEffect } from "react";
import BaseSelect from "../ui/BaseSelect";
import BaseInput from "../ui/BaseInput";
import Swal from "sweetalert2";
import { OutsideContactName } from "@/services/apiServices";

export default function AllocateRowChef({
  onAllocate,
  vendorRefreshTrigger = 0,
  selectedCount,
}) {
  const userid = localStorage.getItem("userId");
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState("");
  const [pax, setPax] = useState("");
  const [quantity, setQuantity] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [shiftTransPrice, setShiftTransPrice] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchdata();
  }, [vendorRefreshTrigger]);

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
      (!shiftTransPrice || shiftTransPrice <= 0)
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

    const success = onAllocate(allocationData);

    if (success) {
      setSelectedVendor("");
      setPax("");
      setQuantity("");
      setServiceType("");
      setShiftTransPrice("");
    }
  };

  return (
    <div className="px-6 py-4 border-b bg-gray-50">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-sm font-medium text-gray-700">
          Bulk Allocate {selectedCount > 0 && `(${selectedCount} selected)`}
        </span>
      </div>
      <div className="grid grid-cols-7 gap-4">
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

        <BaseSelect
          value={serviceType}
          onChange={(e) => setServiceType(e.target.value)}
        >
          <option value="">Select Type</option>
          <option value="counter_wise">Counter Wise</option>
          <option value="plate_wise">Plate Wise</option>
        </BaseSelect>

        <BaseInput
          placeholder="Enter pax"
          value={pax}
          onChange={(e) => setPax(e.target.value)}
          type="tel"
          min="0"
        />

        <BaseInput
          placeholder="Enter quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          type="tel"
          min="0"
        />

        <BaseInput
          placeholder="Shift/Trans Price"
          value={shiftTransPrice}
          onChange={(e) => setShiftTransPrice(e.target.value)}
          type="tel"
          min="0"
        />

        <button className="btn-primary col-span-2" onClick={handleAllocate}>
          Allocate
        </button>
      </div>
    </div>
  );
}