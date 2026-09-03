import { useState, useEffect } from "react";
import dayjs from "dayjs";
import Swal from "sweetalert2";
import { useParams } from "react-router-dom";
import { useIntl } from "react-intl";
import {
  GetEventMasterById,
  GetAllContactCategory,
  GetPartyMasterByCatId,
  AddUpdateLabor,
  GetEventLaborDetails,
  GetExtraExpenseByEvent,
  DeleteExtraExpense,
} from "@/services/apiServices";

const useLabourManagement = () => {
  const { eventId } = useParams();
  const intl = useIntl();

  const [eventData, setEventData] = useState(null);
  const [activeTab, setActiveTab] = useState("Dinner");
  const [activeCategory, setActiveCategory] = useState("Labour");
  const [selectedFunctionPax, setSelectedFunctionPax] = useState(0);
  const [labourData, setLabourData] = useState([]);
  const [labourCategories, setLabourCategories] = useState([]);
  const [allContacts, setAllContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [extraexpenseData, setExtraExpenseData] = useState([]);

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userId = storedUser?.id || 0;

  // fetch event data
  useEffect(() => {
    const fetchEvent = async () => {
      const res = await GetEventMasterById(eventId);
      const event = res?.data?.data?.["Event Details"]?.[0];
      if (event) {
        setEventData(event);
        setActiveTab(
          event.eventFunctions?.[0]?.function?.nameEnglish || "Dinner"
        );
        setSelectedFunctionPax(event.eventFunctions?.[0]?.pax || 0);
      }
    };
    if (eventId) fetchEvent();
  }, [eventId]);

  // fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      const res = await GetAllContactCategory(userId);
      const all = res?.data?.data?.["Contact Category Details"] || [];
      const filtered = all.filter(
        (cat) => cat?.contactType?.nameEnglish?.toLowerCase() === "labour"
      );
      setLabourCategories(filtered);
    };
    if (userId) fetchCategories();
  }, [userId]);

  // fetch contacts
  useEffect(() => {
    const fetchContacts = async () => {
      const map = {};
      for (const cat of labourCategories) {
        const res = await GetPartyMasterByCatId(cat.id, userId);
        map[cat.id] = res?.data?.data?.["Party Details"] || [];
      }
      setAllContacts(map);
    };
    if (labourCategories.length) fetchContacts();
  }, [labourCategories]);

  // Save handler
  const handleSave = async () => {
    const activeFunction = eventData?.eventFunctions?.find(
      (fn) => fn.function?.nameEnglish === activeTab
    );
    if (!activeFunction) return;

    const payload = {
      eventFunctionId: activeFunction.id,
      eventId: eventData.id,
      eventLaborDetails: labourData.map((row) => ({
        labordatetime: row.dateTime,
        laborshift: row.shift || "Morning",
        labortypeid:
          labourCategories.find((c) => c.nameEnglish === row.labourType)?.id ||
          0,
        price: parseFloat(row.price || 0),
        qty: parseFloat(row.quantity || 0),
        totalprice: parseFloat(row.total || 0),
      })),
    };

    Swal.fire({ title: "Saving...", didOpen: () => Swal.showLoading() });
    const res = await AddUpdateLabor(payload);
    if (res?.data?.success) {
      Swal.fire({ icon: "success", title: "Saved!" });
      setTimeout(() => window.location.reload(), 1000);
    } else {
      Swal.fire({ icon: "error", title: "Failed to save" });
    }
  };

  const openMenuReport = () => {
  };

  return {
    intl,
    eventData,
    activeTab,
    setActiveTab,
    selectedFunctionPax,
    activeCategory,
    setActiveCategory,
    searchTerm,
    setSearchTerm,
    handleSave,
    openMenuReport,
    labourData,
    setLabourData,
    allContacts,
    filteredContacts,
    setFilteredContacts,
    labourCategories,
    extraexpenseData,
  };
};

export default useLabourManagement;
