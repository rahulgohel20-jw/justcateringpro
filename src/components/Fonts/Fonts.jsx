import { Fragment, useEffect, useState } from "react";
import { Container } from "@/components/container";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import { TableComponent } from "@/components/table/TableComponent";
import { columns, defaultData } from "./constant";
import { FormattedMessage } from "react-intl";
import AddFonts from "./AddFonts";
import { GetAllFonts, DeleteFont } from "@/services/apiServices";
import Swal from "sweetalert2";

const Fonts = () => {
  const [tableData, setTableData] = useState(defaultData);
  const [isFontModalOpen, setIsFontModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const FetchAllFonts = async () => {
    try {
      const response = await GetAllFonts();
      const data = response?.data?.data || [];
      const formattedData = data.map((item, index) => ({
        sr_no: index + 1,
        fontname: item.fontName || "",
        fontId: item.fontId || "",
        fontPath: item.fontPath || "",
        isActive: item.isActive || "",
      }));
      setTableData(formattedData);
    } catch (error) {
      console.error("Error fetching fonts:", error);
    }
  };

  useEffect(() => {
    FetchAllFonts();
  }, []);

  const handleDelete = async (fontId) => {
    try {
      const response = await DeleteFont(fontId);
      if (response.data.success) {
        Swal.fire({
          icon: "success",
          title: "Deleted",
          text: response?.data?.msg || "Font deleted successfully",
          confirmButtonColor: "#2563eb",
        });
        FetchAllFonts();
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response?.data?.msg || "Failed to delete font.",
          confirmButtonColor: "#2563eb",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error?.message || "Failed to delete font. Please try again.",
        confirmButtonColor: "#2563eb",
      });
    }
  };
  const handleEdit = (rowData) => {
    setEditData(rowData);
    setIsFontModalOpen(true);
  };

  return (
    <Fragment>
      <Container>
        {/* Breadcrumbs */}
        <div className="gap-2 pb-2 mb-3">
          <Breadcrumbs
            items={[
              {
                title: (
                  <FormattedMessage
                    id="USER.MASTER.COUPON_MASTER"
                    defaultMessage="Fonts Master"
                  />
                ),
              },
            ]}
          />
        </div>

        {/* Search + Add */}
        <div className="filters flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className={`flex flex-wrap items-center gap-2`}>
            <div className="filItems relative">
              <i className="ki-filled ki-magnifier leading-none text-md text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-3"></i>
              <input
                className="input pl-8"
                placeholder="Search Fonts"
                type="text"
                value={""}
                onChange={""}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              className="btn btn-primary"
              onClick={() => {
                setEditData(null);
                setIsFontModalOpen(true);
              }}
            >
              <i className="ki-filled ki-plus"></i>{" "}
              <FormattedMessage
                id="USER.MASTER.ADD_COUPON"
                defaultMessage="Add Fonts"
              />
            </button>
          </div>
        </div>

        <TableComponent
          columns={columns(handleDelete, handleEdit)}
          data={tableData}
          paginationSize={10}
        />

        <AddFonts
          isOpen={isFontModalOpen}
          onClose={(val) => {
            setIsFontModalOpen(val);
            if (!val) setEditData(null);
          }}
          editData={editData}
          onSuccess={FetchAllFonts}
        />
      </Container>
    </Fragment>
  );
};

export default Fonts;
