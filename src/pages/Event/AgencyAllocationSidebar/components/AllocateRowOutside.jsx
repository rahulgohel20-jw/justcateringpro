  import { useEffect, useState } from "react";
  import BaseSelect from "../ui/BaseSelect";
  import BaseInput from "../ui/BaseInput";
  import Swal from "sweetalert2";
  import { OutsideContactName, GetUnitData } from "@/services/apiServices";

  export default function AllocateRowOutside({
    onAllocate,
    vendorRefreshTrigger = 0,
    selectedCount,
  }) {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState("");
    const [quantity, setQuantity] = useState("");
    const [shiftTransPrice, setShiftTransPrice] = useState("");
    const userid = localStorage.getItem("userId");
    const [units, setUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState("");

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

  if (!hasVendor && !hasQuantity && !hasPrice && !hasUnit) {
    Swal.fire({
      title: "Missing Information",
     text: "Please fill at least one field (Vendor, Quantity, Shift/Trans Price, or Unit)",
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

  // ✅ Don't depend on return value — just call and reset
  onAllocate(allocationData);

  setSelectedVendor("");
 setQuantity("");
  setShiftTransPrice("");
  setSelectedUnit("");
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
    <option value="">{loading ? "Loading..." : "Select Vendor"}</option>
    {vendors.map((vendor) => (
      <option key={vendor.id} value={vendor.id}>{vendor.nameEnglish}</option>
    ))}
  </BaseSelect>

  <BaseInput
    type="tel"
    placeholder="Enter quantity"
    value={quantity}
    onChange={(e) => setQuantity(e.target.value)}
    min="0"
  />

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

  <BaseInput
    type="tel"
    placeholder="Shift/Trans Price"
    value={shiftTransPrice}
    onChange={(e) => setShiftTransPrice(e.target.value)}
    min="0"
  />

  {/* ✅ Explicitly set col-span-3 as separate div to avoid layout collapse */}
  <div className="col-span-3">
    <button className="btn-primary w-full h-full" onClick={handleAllocate}>
      Allocate
    </button>
  </div>
</div>
      </div>
    );
  }