import { Fragment, useState, useEffect } from "react";
import { Container } from "@/components/container";
import {
  deletepipeline,
  GETallpipeline,
  Getstagesbypipeline,
} from "@/services/apiServices";
import Addpipeline from "./Addpipeline";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";
import { usePermission } from "../../hooks/usePermission";

const SortableItem = ({ item, onDelete, onView, onEdit }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.id });

  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex flex-col sm:flex-row sm:items-center justify-between bg-[#EFF6FF] rounded-lg px-5 py-4 gap-4 shadow-sm"
    >
      {/* Left Content */}
      <div>
        <h4 className="font-semibold text-gray-800">{item.pipelineName}</h4>
        <p className="text-sm text-gray-500 mt-1">
          Created At: {item.createdAt} | Created by: {item.userName}
        </p>
      </div>

      {/* Right Section */}
      <div className="flex gap-3 items-center">
        {/* View Button */}
        <button
          onClick={() => onView(item)}
          className="px-2 py-1 text-xl font-medium text-primary rounded-lg"
        >
          <i className="ki-filled ki-eye"></i>
        </button>

        {/* Edit Button — NEW */}
        <button
          onClick={() => onEdit(item)}
          className="px-2 py-1 text-xl font-medium text-amber-500 hover:text-amber-700 rounded-lg"
        >
          <i className="ki-filled ki-pencil"></i>
        </button>

        {/* Delete Button */}
        <button
          onClick={() => onDelete(item.id)}
          className="px-2 py-1 text-xl font-medium text-red-500 hover:text-red-700 rounded-lg"
        >
          <i className="ki-filled ki-trash"></i>
        </button>

        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab px-3 py-2 border rounded-lg bg-white hover:bg-gray-100"
        >
          ☰
        </button>
      </div>
    </div>
  );
};

const Pipeline = () => {
  const permissions = usePermission("Pipelines");

  const [ismodalopen, setIsModalOpen] = useState(false);
  const [pipelines, setPipelines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editData, setEditData] = useState(null); // ← NEW
  const [editLoading, setEditLoading] = useState(false);
  const navigate = useNavigate();

  const sensors = useSensors(useSensor(PointerSensor));

  const userId = localStorage.getItem("userId");

  // ✅ Fetch all pipelines on mount
  useEffect(() => {
    fetchPipelines();
  }, []);

  const fetchPipelines = () => {
    setLoading(true);
    GETallpipeline(userId)
      .then((res) => {
        const data = res?.data?.data || [];
        setPipelines(data);
      })
      .catch((err) => {
        console.error("Failed to fetch pipelines:", err);
        setPipelines([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setPipelines((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        deletepipeline(id)
          .then((res) => {
            // ✅ CHECK BACKEND SUCCESS FLAG
            if (res?.data?.success) {
              Swal.fire({
                icon: "success",
                title: "Deleted!",
                text: res?.data?.msg || "Pipeline deleted successfully",
              });

              fetchPipelines(); // safer refresh
            } else {
              // ❌ BACKEND FAILED BUT HTTP 200
              Swal.fire({
                icon: "error",
                title: "Error",
                text: res?.data?.msg || "Delete failed",
              });
            }
          })
          .catch((err) => {
            Swal.fire({
              icon: "error",
              title: "Error",
              text: err?.response?.data?.msg || "Failed to delete pipeline",
            });
          });
      }
    });
  };

  const handleView = (pipeline) => {
    navigate("/super-leads", {
      state: {
        pipelineId: pipeline.id,
        pipelineName: pipeline.pipelineName,
      },
    });
  };

  const handleEdit = async (pipeline) => {
    try {
      setEditLoading(true);
      const userId = localStorage.getItem("userId") || "1";

      const res = await Getstagesbypipeline(pipeline.id, userId);
      const stagesData = res?.data?.data || {};

      // ✅ Keep full objects { stageId, stageName } instead of just stageName strings
      const openStages = (stagesData["open_stage"] || []).map((s) => ({
        stageId: s.stageId,
        stageName: s.stageName,
      }));

      const closeStages = (
        stagesData["close_close"] ||
        stagesData["close_stage"] ||
        []
      ).map((s) => ({
        stageId: s.stageId,
        stageName: s.stageName,
      }));

      setEditData({
        id: pipeline.id, // ✅ real pipeline id, never -1
        pipelineName: pipeline.pipelineName,
        userId: pipeline.userId ?? pipeline.createdBy ?? "",
        openStages:
          openStages.length > 0 ? openStages : [{ stageId: -1, stageName: "" }],
        closeStages:
          closeStages.length > 0
            ? closeStages
            : [{ stageId: -1, stageName: "" }],
      });

      setIsModalOpen(true);
    } catch (err) {
      console.error("handleEdit error:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load pipeline details.",
      });
    } finally {
      setEditLoading(false);
    }
  };
  return (
    <Fragment>
      <Container>
        <h2 className="text-2xl font-semibold mb-6 text-black">
          Create Pipeline
        </h2>

        <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between">
          <input
            type="text"
            placeholder="Search Pipeline"
            className="w-full sm:w-72 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {permissions.add && (
            <button
              className="px-4 py-2 bg-primary text-white rounded-lg"
              onClick={() => {
                setEditData(null); // ← ensure create mode
                setIsModalOpen(true);
              }}
            >
              + Create Pipeline
            </button>
          )}
        </div>

        {/* Edit loading overlay */}
        {editLoading && (
          <div className="flex justify-center items-center py-4">
            <div className="w-6 h-6 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mr-2" />
            <span className="text-sm text-gray-500">Loading pipeline...</span>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : pipelines.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            No pipelines found. Create one!
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={pipelines.map((i) => i.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {pipelines.map((item) => (
                  <SortableItem
                    key={item.id}
                    item={item}
                    onDelete={handleDelete}
                    onView={handleView}
                    onEdit={handleEdit}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        <Addpipeline
          isModalOpen={ismodalopen}
          setIsModalOpen={(v) => {
            setIsModalOpen(v);
            if (!v) setEditData(null); // clear edit data on close
          }}
          onSuccess={fetchPipelines}
          editData={editData}
        />
      </Container>
    </Fragment>
  );
};

export default Pipeline;
