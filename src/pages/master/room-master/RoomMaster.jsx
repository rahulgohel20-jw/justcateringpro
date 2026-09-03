import { Fragment, useEffect, useState } from "react";
import { Container } from "@/components/container";
import { TableComponent } from "@/components/table/TableComponent";
import { columns } from "./constant";
import {
  GetAllRooms,
  DeleteRoom,
} from "@/services/apiServices";
import Swal from "sweetalert2";
import { FormattedMessage, useIntl } from "react-intl";
import { usePermission } from "../../../hooks/usePermission";
import AddRoomModal from "../../../partials/modals/add-room/AddRoomModal";

const RoomMaster = () => {
  const permissions = usePermission("Room");
  const intl = useIntl();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const userId = localStorage.getItem("userId");

  // ─── Format raw API data into table rows ───────────────────────────────────
  const formatRoomData = (rooms) =>
    rooms.map((room, index) => ({
      sr_no: index + 1,
      name_english: room.nameEnglish || "-",
      name_gujarati: room.nameGujarati || "-",
      name_hindi: room.nameHindi || "-",
      price: room.price !== undefined ? room.price : "-",
      isActive: room.isActive !== undefined ? room.isActive : true,
      id: room.id,
    }));

  // ─── Fetch all rooms ───────────────────────────────────────────────────────
  const fetchRooms = () => {
    if (!userId) return;

    GetAllRooms(userId)
      .then((res) => {
        const rooms = res?.data?.data["Room Details"] || res?.data || [];
        setOriginalData(rooms);
        setTableData(formatRoomData(rooms));
      })
      .catch((error) => {
        console.error("Error fetching rooms:", error);
      });
  };

  useEffect(() => {
    fetchRooms();
  }, [userId]);

  // ─── Search with debounce ──────────────────────────────────────────────────
  useEffect(() => {
    const handler = setTimeout(() => {
      if (!searchQuery.trim()) {
        setTableData(formatRoomData(originalData));
        return;
      }

      const searchLower = searchQuery.toLowerCase();
      const filtered = originalData.filter(
        (room) =>
          (room.nameEnglish &&
            room.nameEnglish.toLowerCase().includes(searchLower)) ||
          (room.nameGujarati &&
            room.nameGujarati.toLowerCase().includes(searchLower)) ||
          (room.nameHindi &&
            room.nameHindi.toLowerCase().includes(searchLower))
      );

      setTableData(formatRoomData(filtered));
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery, originalData]);

  // ─── Delete room ───────────────────────────────────────────────────────────
 const handleDelete = (roomId) => {
  Swal.fire({
    title: intl.formatMessage({ id: "COMMON.ARE_YOU_SURE", defaultMessage: "Are you sure?" }),
    text: intl.formatMessage({ id: "COMMON.CANNOT_REVERT", defaultMessage: "You won't be able to revert this!" }),
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: intl.formatMessage({ id: "COMMON.YES_DELETE_IT", defaultMessage: "Yes, delete it!" }),
    cancelButtonText: intl.formatMessage({ id: "COMMON.CANCEL", defaultMessage: "Cancel" }),
  }).then((result) => {
    if (result.isConfirmed) {
      DeleteRoom(roomId)
        .then((response) => {
          if (
            response &&
            (response.success ||
              response.status === 200 ||
              response?.data?.success === true)
          ) {
            fetchRooms();
            Swal.fire({
              title: intl.formatMessage({ id: "COMMON.DELETED", defaultMessage: "Deleted!" }),
              text: intl.formatMessage({ id: "ROOM.DELETED_SUCCESS", defaultMessage: "Room has been deleted successfully." }),
              icon: "success",
              timer: 1500,
              showConfirmButton: false,
            });
          } else {
            throw new Error(response?.message || "Delete failed");
          }
        })
        .catch((error) => {
          console.error("Error deleting room:", error);
          Swal.fire(
            intl.formatMessage({ id: "COMMON.ERROR", defaultMessage: "Error!" }),
            intl.formatMessage({ id: "ROOM.DELETE_FAILED", defaultMessage: "Failed to delete the room." }),
            "error"
          );
        });
    }
  });
};

  // ─── Open edit modal ───────────────────────────────────────────────────────
  const handleEdit = (room) => {
    setSelectedRoom(room);
    setIsModalOpen(true);
  };

  // ─── Open add modal ────────────────────────────────────────────────────────
  const handleAddNew = () => {
    setSelectedRoom(null);
    setIsModalOpen(true);
  };

  return (
    <Fragment>
      <Container>
        {/* Page Title */}
        <div className="pb-2 mb-3">
          <h1 className="text-xl text-gray-900">
            <FormattedMessage
              id="USER.MASTER.ROOM_MASTER"
              defaultMessage="Room Master"
            />
          </h1>
        </div>

        {/* Filters & Actions */}
        <div className="filters flex flex-wrap items-center justify-between gap-2 mb-3">
          {/* Search */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="filItems relative">
              <i className="ki-filled ki-magnifier leading-none text-md text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-3"></i>
              <input
                className="input pl-8"
                placeholder={intl.formatMessage({
                  id: "USER.MASTER.SEARCH_ROOM",
                  defaultMessage: "Search Room",
                })}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Add Button */}
          {permissions.add && (
            <div className="flex flex-wrap items-center gap-2">
              <button className="btn btn-primary" onClick={handleAddNew}>
                <i className="ki-filled ki-plus"></i>
                <FormattedMessage
                  id="COMMON.CREATE_NEW"
                  defaultMessage="Create New"
                />
              </button>
            </div>
          )}
        </div>

        {/* Add / Edit Modal */}
        <AddRoomModal
          isOpen={isModalOpen}
          onClose={setIsModalOpen}
          refreshData={fetchRooms}
          roomData={selectedRoom}
        />

        {/* Data Table */}
        <TableComponent
          columns={columns(handleEdit, handleDelete, permissions)}
          data={tableData}
          paginationSize={10}
        />
      </Container>
    </Fragment>
  );
};

export default RoomMaster;