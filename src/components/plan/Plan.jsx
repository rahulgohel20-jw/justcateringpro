import { useEffect, useState } from "react";
import { message, Spin, Input } from "antd";
import Swal from "sweetalert2";
import { Container } from "@/components/container";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import { TableComponent } from "@/components/table/TableComponent";
import { getColumns } from "./constant";
import {
  GetAllPlansForSuperAdmin,
  DeletePlanById,
} from "@/services/apiServices";
import AddPlan from "@/partials/modals/add-plan/Addplan.jsx";
import PlanDetailSidebar from "@/partials/modals/add-plan/PlanDetailSidebar";
import { usePermission } from "../../hooks/usePermission.js";

const Plan = () => {
  const permissions = usePermission("Plans");

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editPlanData, setEditPlanData] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // ✅ Fetch all plans
  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await GetAllPlansForSuperAdmin();

      const planArray =
        res?.data?.["Plan Details"] ||
        res?.data?.data?.["Plan Details"] ||
        res?.["Plan Details"] ||
        [];

      if (Array.isArray(planArray) && planArray.length > 0) {
        const formatted = planArray.map((plan, index) => ({
          sr_no: index + 1,
          plan_name: plan.name,
          billingCycle: plan.billingCycle,
          isPopular: plan.isPopular ? "Yes" : "No",
          price: plan.price,
          id: plan.id,
          description: plan.description || "",
          features: plan.features || [],
        }));
        setPlans(formatted);
      } else {
        message.warning("No plans found");
      }
    } catch (error) {
      console.error(error);
      message.error("Failed to fetch plans");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  // 🗑️ Delete Plan
  const handleDelete = async (id) => {
    const confirmResult = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (!confirmResult.isConfirmed) return;

    try {
      const res = await DeletePlanById(id);

      const data = res?.data || res;
      if (data?.success === true) {
        Swal.fire(
          "Deleted!",
          data?.msg || "Plan deleted successfully!",
          "success",
        );
        fetchPlans();
      } else {
        Swal.fire("Error!", data?.msg || "Failed to delete plan", "error");
      }
    } catch (error) {
      console.error("❌ Delete plan error:", error);
      Swal.fire("Error!", "Something went wrong while deleting plan", "error");
    }
  };

  const filteredPlans = plans.filter((plan) =>
    plan.plan_name.toLowerCase().includes(searchText.toLowerCase()),
  );

  const handleEdit = (plan) => {
    setEditPlanData(plan);
    setIsModalOpen(true);
  };

  const handleView = (plan) => {
    setSelectedPlan(plan);
    setIsSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setSelectedPlan(null);
    setIsSidebarOpen(false);
  };

  const columns = getColumns(handleDelete, handleEdit, handleView);

  return (
    <Container>
      <div className="gap-2 pb-2 mb-3">
        <Breadcrumbs items={[{ title: "Plan" }]} />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
        <Input.Search
          placeholder="Search plans..."
          allowClear
          className="w-full sm:w-64"
          onChange={(e) => setSearchText(e.target.value)}
        />

        {permissions.add && (
          <button
            className="btn btn-primary flex items-center justify-center gap-1 w-full sm:w-auto"
            onClick={() => {
              setIsModalOpen(true);
              setEditPlanData(null);
            }}
          >
            <i className="ki-filled ki-plus"></i> Add Plan
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Spin size="large" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <TableComponent
            columns={columns}
            data={filteredPlans}
            paginationSize={10}
          />
        </div>
      )}

      <AddPlan
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditPlanData(null);
        }}
        editPlan={editPlanData}
        onSuccess={() => {
          message.success(
            editPlanData
              ? "Plan updated successfully!"
              : "Plan added successfully!",
          );
          setIsModalOpen(false);
          setEditPlanData(null);
          fetchPlans();
        }}
      />

      <PlanDetailSidebar
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        plan={selectedPlan}
      />
    </Container>
  );
};

export default Plan;
