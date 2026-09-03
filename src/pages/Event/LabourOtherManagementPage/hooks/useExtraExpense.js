import { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import {
  GetExtraExpenseByEvent,
  DeleteExtraExpense,
} from "@/services/apiServices";

/**
 * Custom hook to manage extra expenses
 * @param {number} eventFunctionId - The event function ID
 * @param {number} eventId - The event ID
 */
export const useExtraExpense = (eventFunctionId, eventId) => {
  const [extraExpenseData, setExtraExpenseData] = useState([]);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch extra expenses
  const fetchExtraExpense = useCallback(async () => {
    if (!eventFunctionId || !eventId) {
      setExtraExpenseData([]);
      return;
    }

    try {
      setLoading(true);
      const res = await GetExtraExpenseByEvent(eventFunctionId, eventId);

      const expenseData =
        res?.data?.data?.["Contact Type Details"] ||
        res?.data?.data?.eveneExtraExpense ||
        [];

      if (!Array.isArray(expenseData) || !expenseData.length) {
        setExtraExpenseData([]);
        return;
      }

      const formatted = expenseData.map((item, index) => ({
        id: item.id || index + 1,
        name: item.nameEnglish || "",
        nameEnglish: item.nameEnglish || "",
        nameGujarati: item.nameGujarati || "",
        nameHindi: item.nameHindi || "",
        qty: item.qty || item.quantity || "",
        rate: item.price || 0,
        price: item.price || 0,
        total: item.totalprice || item.total || 0,
        totalprice: item.totalprice || item.total || 0,
        place: item.place || "",
      }));

      setExtraExpenseData(formatted);
    } catch (err) {
      console.error("Error fetching extra expense data:", err);
      setExtraExpenseData([]);
    } finally {
      setLoading(false);
    }
  }, [eventFunctionId, eventId]);

  // Delete expense
  const deleteExpense = useCallback(
    async (id) => {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      });

      if (!result.isConfirmed) return;

      try {
        const res = await DeleteExtraExpense(id);

        if (res?.data?.success) {
          Swal.fire({
            icon: "success",
            title: "Expense deleted successfully",
            timer: 1200,
            showConfirmButton: false,
          });

          // Refetch expenses after deletion
          await fetchExtraExpense();
        }
      } catch (error) {
        console.error("Error deleting expense:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Unable to delete expense",
        });
      }
    },
    [fetchExtraExpense]
  );

  // Edit expense
  const editExpense = useCallback((expense) => {
    setSelectedExpense(expense);
    setIsModalOpen(true);
  }, []);

  // Add new expense
  const addExpense = useCallback(() => {
    setSelectedExpense(null);
    setIsModalOpen(true);
  }, []);

  // Close modal and refresh data
  const closeModal = useCallback(async () => {
    setIsModalOpen(false);
    setSelectedExpense(null);
    await fetchExtraExpense();
  }, [fetchExtraExpense]);

  // Fetch expenses on mount and when dependencies change
  useEffect(() => {
    fetchExtraExpense();
  }, [fetchExtraExpense]);

  return {
    extraExpenseData,
    selectedExpense,
    isModalOpen,
    loading,
    fetchExtraExpense,
    deleteExpense,
    editExpense,
    addExpense,
    closeModal,
    refetchExpenses: fetchExtraExpense, // Added this for consistency
  };
};