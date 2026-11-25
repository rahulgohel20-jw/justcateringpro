import { AddLogs } from "@/services/apiServices";

const getUserEmail = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem("auth-storage"));
    return parsed?.state?.user?.email || "";
  } catch {
    return "";
  }
};

// returns ["Label: old → new", ...] only for fields that changed
export const diffFields = (prev, curr, fields) =>
  fields.flatMap(([key, label]) => {
    const a = prev?.[key] ?? "-";
    const b = curr?.[key] ?? "-";
    return String(a) === String(b) ? [] : [`${label}: ${a} → ${b}`];
  });

// action: "Save" | "Update" | "Delete" | "Payout"
export const logExpense = async ({ action, expenseType, title, lines = [] }) => {
  try {
    const email = getUserEmail() || "Unknown User";
    const description = [
      `Expense ${action}`,
      `Type: ${expenseType || "N/A"}`,
      `Title: ${title || "N/A"}`,
      ...lines,
      `By: ${email}`,
    ].join("\n");

    await AddLogs({
      id: 0,
      eventId: 0,
      description,
      eventType: `Expense_${action}`,
      user: email,
    });
  } catch (err) {
    console.error("Expense log failed (non-blocking):", err);
  }
};