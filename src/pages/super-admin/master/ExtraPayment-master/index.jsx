import { Fragment, useEffect, useState } from "react";
import { Container } from "@/components/container";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import { TableComponent } from "@/components/table/TableComponent";
import { columns } from "./constant";
import { GetExtraPayment, DeleteExtraPayment } from "@/services/apiServices";
import Swal from "sweetalert2";
import { FormattedMessage, useIntl } from "react-intl";
import AddExtraPayment from "../../../../partials/modals/add-extrapayment/AddExtraPayment";
import { usePermission } from "../../../../hooks/usePermission";

const ExtraPaymentMaster = () => {
  const permissions = usePermission("Extra Payments");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const intl = useIntl();

  useEffect(() => {
    FetchExtraPayments();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (!searchQuery.trim()) {
        FetchExtraPayments();
        return;
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  const FetchExtraPayments = () => {
    GetExtraPayment()
      .then((res) => {
        const payments = res?.data?.data?.["Extra Payment Details"];

        if (payments && Array.isArray(payments)) {
          const formatted = payments.map((payment, index) => ({
            sr_no: index + 1,
            id: payment.id,
            description: payment.description || "-",
            name: payment.name || "-",
            price: payment.price || 0,
          }));

          setTableData(formatted);
        } else {
          setTableData([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching payments:", error);
        setTableData([]);
      });
  };

  const DeletePayment = (id) => {
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
        DeleteExtraPayment(id)
          .then((response) => {
            if (
              response &&
              (response.success || response.data.success === true)
            ) {
              FetchExtraPayments();
              Swal.fire({
                title: "Removed!",
                text: "Extra payment removed successfully.",
                icon: "success",
                timer: 1500,
                showConfirmButton: false,
              });
            }
          })
          .catch((error) => {
            console.error("Error deleting payment:", error);
            Swal.fire({
              title: "Error!",
              text: "Failed to delete extra payment.",
              icon: "error",
            });
          });
      }
    });
  };

  const handleEdit = (payment) => {
    setSelectedPayment(payment);
    setIsPaymentModalOpen(true);
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
                    id="USER.MASTER.EXTRA_PAYMENT_MASTER"
                    defaultMessage="Extra Payment Master"
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
                  id: "USER.MASTER.SEARCH_PAYMENT",
                  defaultMessage: "Search Payment",
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
                  setIsPaymentModalOpen(true);
                  setSelectedPayment(null);
                }}
              >
                <i className="ki-filled ki-plus"></i>{" "}
                <FormattedMessage
                  id="USER.MASTER.ADD_EXTRA_PAYMENT"
                  defaultMessage="Add Extra Payment"
                />
              </button>
            </div>
          )}
        </div>

        <AddExtraPayment
          isOpen={isPaymentModalOpen}
          onClose={setIsPaymentModalOpen}
          refreshData={FetchExtraPayments}
          payment={selectedPayment}
        />

        <TableComponent
          columns={columns(handleEdit, DeletePayment, permissions)}
          data={tableData}
          paginationSize={10}
        />
      </Container>
    </Fragment>
  );
};

export default ExtraPaymentMaster;
