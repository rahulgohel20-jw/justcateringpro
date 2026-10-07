import { Fragment, useState, useEffect, useCallback } from "react";
import { Container } from "@/components/container";
import { TableComponent } from "@/components/table/TableComponent";
import { columns  , buildUnitOptions } from "./constant";
import {
  GetRawMaterialcategory,
  GetAllRawMaterials,
  GetItemRawMaterialByRawMaterialdata,
  UpdateItemRawMaterialWeight,
} from "@/services/apiServices";
import Swal from "sweetalert2";
import { Select } from "antd";
import debounce from "lodash/debounce";
import { FormattedMessage, useIntl } from "react-intl";
const RawmaterialChange = () => {
  const [tableData, setTableData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [modifiedRows, setModifiedRows] = useState(new Set());
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [rawMaterialOptions, setRawMaterialOptions] = useState([]);
  const [selectedRawMaterial, setSelectedRawMaterial] = useState(null);
  const [rawMaterialLoading, setRawMaterialLoading] = useState(false);
  const [rawMaterialPage, setRawMaterialPage] = useState(1);
  const [rawMaterialHasMore, setRawMaterialHasMore] = useState(true);
  const [bulkQty, setBulkQty] = useState("");
const [bulkUnitId, setBulkUnitId] = useState(null);
  const intl = useIntl();

  const getUnitId = (u) => u.id;
const getUnitName = (u) => u.name;

const bulkUnitOptions = (() => {
  const selected = tableData.filter((r) => selectedRows.has(r.sr_no));
  if (!selected.length) return [];

  const lists = selected.map((r) => buildUnitOptions(r.unit));
  return lists[0].filter((opt) =>
    lists.every((list) => list.some((x) => x.value === opt.value)),
  );
})();

const handleBulkApply = () => {
  if (selectedRows.size === 0) {
    Swal.fire({ icon: "warning", title: "Select items first" });
    return;
  }
  if (bulkQty === "" && !bulkUnitId) {
    Swal.fire({ icon: "warning", title: "Enter a quantity or select a unit" });
    return;
  }

  const unitOption = bulkUnitOptions.find((o) => o.value === bulkUnitId);

  setTableData((prev) =>
    prev.map((row) => {
      if (!selectedRows.has(row.sr_no)) return row;
      return {
        ...row,
        ...(bulkQty !== "" && { final_qyt: bulkQty }),
        ...(bulkUnitId && {
          final_unit_id: bulkUnitId,
          final_unit: unitOption?.label,
        }),
      };
    }),
  );

  setModifiedRows((prev) => {
    const next = new Set(prev);
    selectedRows.forEach((id) => next.add(id));
    return next;
  });
};

const handleFieldChange = (srNo, fieldOrObject, value) => {
  setTableData((prev) =>
    prev.map((row) =>
      row.sr_no !== srNo
        ? row
        : typeof fieldOrObject === "object"
          ? { ...row, ...fieldOrObject }
          : { ...row, [fieldOrObject]: value },
    ),
  );
  setModifiedRows((prev) => new Set(prev).add(srNo));
};

  const handleRowSelect = (srNo, checked) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      checked ? next.add(srNo) : next.delete(srNo);
      return next;
    });
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedRows(new Set(filteredData.map((row) => row.sr_no)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const fetchRawMaterialData = async (selectedRawMaterial) => {
    setLoading(true);
    setTableData([]);
    setFilteredData([]);

    try {
      const userId = localStorage.getItem("userId");
      const response = await GetItemRawMaterialByRawMaterialdata(
        selectedRawMaterial,
        userId,
      );
      const data = response?.data.data.rawMaterialDetails ?? [];

      const mappeddata = data.map((item, index) => ({
        sr_no: index + 1,
        id: item.id,
        itemId: item.itemId,
        item_name: item.itemName,
        quantity: item.weight,
        itemraw_unit: item.itemRawMatUnitName,
        final_qyt: item.weight,
        final_unit: item.itemRawMatUnitName,
        final_unit_id: item.itemRawMatUnitId,
        unit: item.unitHierarchy,
        rawMatUnitId: item.rawMatUnitId,
        supplierRate: item.supplierRate,
      }));

      setTableData(mappeddata);
      setFilteredData(mappeddata);
      setModifiedRows(new Set());
    } catch (error) {
      console.error("Failed to fetch unit mismatched data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchrawcategory = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const response = await GetRawMaterialcategory(userId);
      const data = response?.data.data["Raw Material Category Details"] ?? [];

      const options = data.map((item) => ({
        label: item.nameEnglish,
        value: item.id,
      }));

      setCategoryOptions([{ label: "All Category", value: 0 }, ...options]);
    } catch (error) {
      console.error("Failed to fetch raw material category:", error);
    }
  };
  const fetchRawMaterial = async (
    catId,
    page = 1,
    append = false,
    searchText = "",
  ) => {
    if (rawMaterialLoading) return;
    setRawMaterialLoading(true);
    try {
      const userId = localStorage.getItem("userId");
      const ITEMS_PER_PAGE = 100;

      const response = await GetAllRawMaterials(
        page,
        ITEMS_PER_PAGE,
        catId,
        searchText,
        userId,
      );
      const data = response?.data.data["Raw Material Details"] ?? [];
      const totalPages = response?.data.data["totalPages"] ?? 1;

      const options = data.map((item) => ({
        label: item.nameEnglish,
        value: item.id,
      }));

      setRawMaterialOptions((prev) =>
        append ? [...prev, ...options] : options,
      );
      setRawMaterialPage(page);
      setRawMaterialHasMore(page < totalPages);
    } catch (error) {
      console.error("Failed to fetch raw materials:", error);
    } finally {
      setRawMaterialLoading(false);
    }
  };
  const debouncedSearch = useCallback(
    debounce((searchText) => {
      if (!selectedCategory) return;
      setRawMaterialOptions([]);
      setRawMaterialPage(1);
      setRawMaterialHasMore(true);
      fetchRawMaterial(selectedCategory, 1, false, searchText);
    }, 400),
    [selectedCategory],
  );

  useEffect(() => {
    if (selectedCategory !== null && selectedCategory !== undefined) {
      setSelectedRawMaterial(null);
      setRawMaterialOptions([]);
      setRawMaterialPage(1);
      setRawMaterialHasMore(true);
      fetchRawMaterial(selectedCategory, 1, false);
    } else {
      setSelectedRawMaterial(null);
      setRawMaterialOptions([]);
      setRawMaterialPage(1);
      setRawMaterialHasMore(true);
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (selectedRawMaterial) {
      fetchRawMaterialData(selectedRawMaterial);
    } else {
      setTableData([]);
      setFilteredData([]);
    }
  }, [selectedRawMaterial]);
  useEffect(() => {
    fetchrawcategory();
  }, []);

  useEffect(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      setFilteredData(tableData);
      return;
    }
    const filtered = tableData.filter((row) =>
      [
        row.rawmaterialname,
        row.item_name,
        row.itemraw_unit,
        row.raw_unit,
        row.final_unit,
      ].some((field) => field?.toLowerCase().includes(query)),
    );
    setFilteredData(filtered);
  }, [searchQuery, tableData]);

  const handleRawMaterialPopupScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 20;

    if (isNearBottom && rawMaterialHasMore && !rawMaterialLoading) {
      fetchRawMaterial(selectedCategory, rawMaterialPage + 1, true);
    }
  };
 
const handleUpdate = async () => {
  if (selectedRows.size === 0) {
    Swal.fire({ icon: "warning", title: "Please select at least one item" });
    return;
  }

  const changedRows = tableData.filter((row) => selectedRows.has(row.sr_no));

  const invalid = changedRows.find(
    (r) =>
      r.final_qyt === "" ||
      isNaN(Number(r.final_qyt)) ||
      Number(r.final_qyt) < 0,
  );
  if (invalid) {
    Swal.fire({
      icon: "error",
      title: "Invalid quantity",
      text: `Check quantity for "${invalid.item_name}"`,
    });
    return;
  }

  const payload = changedRows.map((row) => ({
    id: row.id,
    itemId: row.itemId,
    finalWeight: Number(row.final_qyt),
    finalUnitId: row.final_unit_id,
    rawMaterialUnitId: row.rawMatUnitId,
    supplierRate: row.supplierRate,
  }));

  try {
    const response = await UpdateItemRawMaterialWeight(payload);

    if (response?.data?.success) {
      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: response?.data?.msg || "Units updated successfully.",
        confirmButtonColor: "#3085d6",
      }).then(() => {
        fetchRawMaterialData(selectedRawMaterial);
        setSelectedRows(new Set());
        setBulkQty("");
        setBulkUnitId(null);
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: response?.data?.msg || "Something went wrong. Please try again.",
        confirmButtonColor: "#d33",
      });
    }
  } catch (error) {
    console.error("Update failed:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "An unexpected error occurred. Please try again.",
      confirmButtonColor: "#d33",
    });
  }
};

  return (
    <Fragment>
      <Container>
        <div className="pb-2 mb-3">
        <h1 className="text-xl text-gray-900">
  <FormattedMessage
    id="COMMON.RAWMATERIALQUANTITYCHANGE"
    defaultMessage="Raw Material Quantity Change"
  />
</h1>
        </div>

        <div className="filters flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <div>
              <Select
                placeholder="Select Category"
                className="min-w-[220px]"
                options={categoryOptions}
                value={selectedCategory}
                allowClear
                showSearch
                onChange={(value) => setSelectedCategory(value)}
                filterOption={(input, option) =>
                  option?.label?.toLowerCase().includes(input.toLowerCase())
                }
              />
            </div>

            <div>
              <Select
                placeholder="Select Raw Material"
                className="min-w-[220px]"
                options={rawMaterialOptions}
                value={selectedRawMaterial}
                onChange={(value) => setSelectedRawMaterial(value)}
                loading={rawMaterialLoading}
                disabled={
                  selectedCategory === null || selectedCategory === undefined
                }
                onPopupScroll={handleRawMaterialPopupScroll}
                allowClear
                showSearch
                filterOption={false}
                onSearch={debouncedSearch}
                dropdownRender={(menu) => (
                  <>
                    {menu}
                    {rawMaterialLoading && (
                      <div className="flex justify-center py-2 text-gray-400 text-sm">
                        Loading...
                      </div>
                    )}
                  </>
                )}
              />
            </div>
          </div>


          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap items-center gap-2 mb-3 p-3 border rounded bg-gray-50">
  <span className="text-sm text-gray-600">
    {selectedRows.size} selected
  </span>

  <input
    type="number"
    min="0"
    className="input w-[140px]"
    placeholder="Quantity"
    value={bulkQty}
    onChange={(e) => setBulkQty(e.target.value)}
    disabled={selectedRows.size === 0}
  />

  <Select
    placeholder="Select Unit"
    className="min-w-[160px]"
    options={bulkUnitOptions}
    value={bulkUnitId}
    onChange={setBulkUnitId}
    allowClear
    disabled={selectedRows.size === 0}
    notFoundContent="No common unit for selected items"
  />

  <button
    className="btn btn-light"
    onClick={handleBulkApply}
    disabled={selectedRows.size === 0}
  >
    Apply to selected
  </button>
</div>
            <button className="btn btn-primary" onClick={handleUpdate}>
Update            </button>
          </div>
        </div>

        <TableComponent
          columns={columns(
            handleFieldChange,
            selectedRows,
            handleRowSelect,
            handleSelectAll,
            filteredData,
          )}
          data={filteredData}
          paginationSize={25}
          loading={loading}
        />
      </Container>
    </Fragment>
  );
};

export default RawmaterialChange;
