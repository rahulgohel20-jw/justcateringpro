import { Fragment, useEffect, useState } from "react";
import { Container } from "@/components/container";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import { TableComponent } from "@/components/table/TableComponent";
import { columns } from "./constant";
import {
  GetCoupons,
  DeleteCoupon as DeleteCouponAPI,
} from "@/services/apiServices";
import Swal from "sweetalert2";
import { FormattedMessage, useIntl } from "react-intl";
import AddCoupon from "../../../../partials/modals/add-coupon/AddCoupon";
import { usePermission } from "../../../../hooks/usePermission";

const CouponMaster = () => {
  const permissions = usePermission("Coupons");
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const intl = useIntl();

  useEffect(() => {
    FetchCoupons();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (!searchQuery.trim()) {
        FetchCoupons();
        return;
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  const FetchCoupons = () => {
    GetCoupons()
      .then((res) => {
        const coupons = res?.data?.data;

        if (coupons && Array.isArray(coupons)) {
          const formatted = coupons.map((coupon, index) => ({
            sr_no: index + 1,
            id: coupon.id,
            coupenCode: coupon.coupenCode || "-",
            coupenName: coupon.coupenName || "-",
            expireDate: coupon.expireDate || "-",
            maxUser: coupon.maxUser || 0,
            price: coupon.price || 0,
          }));

          setTableData(formatted);
        } else {
          setTableData([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching coupons:", error);
        setTableData([]);
      });
  };

  const DeleteCoupon = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        DeleteCouponAPI(id)
          .then((response) => {
            if (
              response &&
              (response.success || response.data.success === true)
            ) {
              FetchCoupons();
              Swal.fire({
                title: "Removed!",
                text: "Coupon removed successfully.",
                icon: "success",
                timer: 1500,
                showConfirmButton: false,
              });
            }
          })
          .catch((error) => {
            console.error("Error deleting coupon:", error);
            Swal.fire({
              title: "Error!",
              text: "Failed to delete coupon.",
              icon: "error",
            });
          });
      }
    });
  };

  const handleEdit = (coupon) => {
    setSelectedCoupon(coupon);
    setIsCouponModalOpen(true);
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
                    defaultMessage="Coupon Master"
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
                placeholder={intl.formatMessage({
                  id: "USER.MASTER.SEARCH_COUPON",
                  defaultMessage: "Search Coupon",
                })}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {permissions.add && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                className="btn btn-primary"
                onClick={() => {
                  setIsCouponModalOpen(true);
                  setSelectedCoupon(null);
                }}
              >
                <i className="ki-filled ki-plus"></i>{" "}
                <FormattedMessage
                  id="USER.MASTER.ADD_COUPON"
                  defaultMessage="Add Coupon"
                />
              </button>
            </div>
          )}
        </div>

        <AddCoupon
          isOpen={isCouponModalOpen}
          onClose={setIsCouponModalOpen}
          refreshData={FetchCoupons}
          payment={selectedCoupon}
        />

        <TableComponent
          columns={columns(handleEdit, DeleteCoupon, permissions)}
          data={tableData}
          paginationSize={10}
        />
      </Container>
    </Fragment>
  );
};

export default CouponMaster;
