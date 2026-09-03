import { Fragment, useState, useEffect } from "react";
import { Container } from "@/components/container";
import { TableComponent } from "@/components/table/TableComponent";
import { columns } from "./constant";
import { GetUnitMismatched, AddMissmatched } from "@/services/apiServices";
import Swal from "sweetalert2";
import { useIntl, FormattedMessage } from "react-intl";
const UnitChange = () => {
  const [tableData, setTableData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [modifiedRows, setModifiedRows] = useState(new Set());
  const [selectedRows, setSelectedRows] = useState(new Set());
const intl = useIntl();
  const handleRowSelect = (srNo, checked) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      checked ? next.add(srNo) : next.delete(srNo);
      return next;
    });
  };

  // ✅ Select / deselect all (based on filteredData so search is respected)
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedRows(new Set(filteredData.map((row) => row.sr_no)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const fetchUnitMismatched = async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem("userId");
      const response = await GetUnitMismatched(userId);
      const data = response?.data.data["ItemRawMaterialUnit"] ?? [];

      const mappeddata = data.map((item, index) => ({
        sr_no: index + 1,
        rawmaterialname: item.rawMaterialName,
        item_name: item.itemName,
        quantity: item.weight,
        itemraw_unit: item.itemRawMaterialUnitName,
        raw_unit: item.rawMaterialUnitName,
        final_qyt: item.finalWeight,
        final_unit: item.rawMaterialUnitName,
        unit: item.unit,
        final_unit_id: item.rawMaterialUnitId,
        rawMaterialUnitId: item.rawMaterialUnitId,
        itemRawMaterialUnitId: item.itemRawMaterialUnitId,
        itemRawMaterialId: item.itemRawMaterialId,
        supplierRate: item.supplierRate,
        itemId: item.itemId,
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

  useEffect(() => {
    fetchUnitMismatched();
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

  const handleFieldChange = (srNo, fieldOrObject, value) => {
    setTableData((prev) =>
      prev.map((row) => {
        if (row.sr_no !== srNo) return row;
        const updated =
          typeof fieldOrObject === "object"
            ? { ...row, ...fieldOrObject }
            : { ...row, [fieldOrObject]: value };
        setModifiedRows((prev) => new Set(prev).add(srNo));
        return updated;
      }),
    );
  };

  const handleUpdate = async () => {
    const changedRows = tableData.filter((row) => selectedRows.has(row.sr_no));

    const payload = changedRows.map((row) => ({
      itemRawMaterialId: row.itemRawMaterialId,
      finalWeight: Number(row.final_qyt),
      itemRawMaterialUnitId: row.final_unit_id,
      rawMaterialUnitId: row.rawMaterialUnitId,
      supplierRate: row.supplierRate,
      itemId: row.itemId,
    }));

    try {
      const response = await AddMissmatched(payload);

      if (response?.data?.success) {
        Swal.fire({
          icon: "success",
title: intl.formatMessage({
  id: "COMMON.UPDATED",
  defaultMessage: "Updated!",
}),   
       text: response?.data?.msg || "Units updated successfully.",
          confirmButtonColor: "#3085d6",
        }).then(() => {
          fetchUnitMismatched();
          setSelectedRows(new Set());
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Update Failed",
          text:
            response?.data?.msg || "Something went wrong. Please try again.",
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
    id="COMMON.ITEMRAWMATERIALUNITCHANGE"
    defaultMessage="Item Raw Material Unit Change"
  />
</h1>        </div>

        <div className="filters flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="filItems relative">
              <i className="ki-filled ki-magnifier leading-none text-md text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-3"></i>
              <input
                className="input pl-8"
placeholder={intl.formatMessage({
  id: "COMMON.SEARCHUNIT",
  defaultMessage: "Search Unit",
})}                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button className="btn btn-primary" onClick={handleUpdate}>
         <FormattedMessage
  id="COMMON.UPDATE"
  defaultMessage="Update"
/>
            </button>
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

export default UnitChange;
