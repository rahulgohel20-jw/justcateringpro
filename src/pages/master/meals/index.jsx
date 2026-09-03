import { Fragment, useEffect, useState } from "react";
import { Container } from "@/components/container";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import { TableComponent } from "@/components/table/TableComponent";
import { columns } from "./constant";
import useStyle from "./style";
import {
  GetMealType,
  DeleteMealType,
  SearchMealtype,
} from "@/services/apiServices";
import Swal from "sweetalert2";
import AddMeal from "@/partials/modals/add-meal/AddMeal";
import { FormattedMessage } from "react-intl";
import { useIntl } from "react-intl";
import { usePermission } from "../../../hooks/usePermission";

const MealMaster = () => {
  const permissions = usePermission("Food Prefrence");
  const classes = useStyle();
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const intl = useIntl();
  const Id = localStorage.getItem("userId");

  const getTranslatedName = (item) => {
    switch (intl.locale) {
      case "hi":
        return item.nameHindi || item.nameEnglish || "-";
      case "gu":
        return item.nameGujarati || item.nameEnglish || "-";
      default:
        return item.nameEnglish || "-";
    }
  };

  const FetchMealType = () => {
    GetMealType(Id)
      .then((res) => {
        const mealData = res.data?.data?.["MealType Details"] || [];

        const formatted = mealData.map((item, index) => ({
          sr_no: index + 1,
          meal_type: getTranslatedName(item),
          mealid: item.id,
        }));

        setTableData(formatted);
      })
      .catch((error) => {
        console.error("Error fetching meal types:", error);
      });
  };

  useEffect(() => {
    FetchMealType();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (!searchQuery.trim()) {
        FetchMealType();
        return;
      }

      SearchMealtype(searchQuery, Id)
        .then(({ data: { data } }) => {
          const mealData = data?.["MealType Details"] || [];

          const formatted = mealData.map((item, index) => ({
            sr_no: index + 1,
            meal_type: getTranslatedName(item),
            mealid: item.id,
          }));

          setTableData(formatted);
        })
        .catch((error) => {
          console.error("Error searching meal:", error);
        });
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  const DeleteMealtype = (mealid) => {
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
        DeleteMealType(mealid)
          .then((response) => {
            if (
              response &&
              (response.success || response.data.success === true)
            ) {
              FetchMealType();
              Swal.fire({
                title: "Removed!",
                text: "Meal has been removed successfully.",
                icon: "success",
                timer: 1500,
                showConfirmButton: false,
              });
            } else {
              throw new Error(response?.message || "API call failed");
            }
          })
          .catch((error) => {
            console.error("Error deleting meal:", error);
          });
      }
    });
  };

  const handleEdit = (meal) => {
    setSelectedMeal(meal);
    setIsMemberModalOpen(true);
  };

  return (
    <Fragment>
      <Container>
        {/* Breadcrumbs */}
        <div className="gpb-2 mb-3">
          <h1 className="text-xl text-gray-900">
            <FormattedMessage
              id="COMMON.MEALSIDEBAR_TYPE"
              defaultMessage="Food Prefrence"
            />
          </h1>
        </div>

        {/* Filters */}
        <div className="filters flex flex-wrap items-center justify-between gap-2 mb-3">
          <div
            className={`flex flex-wrap items-center gap-2 ${classes.customStyle}`}
          >
            <div className="filItems relative">
              <i className="ki-filled ki-magnifier leading-none text-md text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-3"></i>
              <input
                className="input pl-8"
                placeholder={intl.formatMessage({
                  id: "USER.MASTER.SEARCH_MEAL",
                  defaultMessage: "Search Meal",
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
                  setSelectedMeal(null);
                  setIsMemberModalOpen(true);
                }}
              >
                <i className="ki-filled ki-plus"></i>
                <FormattedMessage
                  id="USER.MASTER.ADD_CONTACT_CATEGORY"
                  defaultMessage="Create New "
                />
              </button>
            </div>
          )}
        </div>

        {/* Add/Edit Modal */}
        <AddMeal
          isOpen={isMemberModalOpen}
          onClose={setIsMemberModalOpen}
          refreshData={FetchMealType}
          selectedMeal={selectedMeal}
        />

        {/* Table */}
        <TableComponent
          columns={columns(handleEdit, DeleteMealtype, permissions)}
          data={tableData}
          paginationSize={10}
        />
      </Container>
    </Fragment>
  );
};

export default MealMaster;
