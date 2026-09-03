// ─── Expenseconfig.jsx ───────────────────────────────────────────────────────
import { ErrorMessage } from "formik";

// ─── Payment Methods ──────────────────────────────────────────────────────────
export const PAYMENT_METHODS = [
  {
    value: "gpay",
    label: "GPAY",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1.5 13.5v-3H9v-1.5h1.5V9.75C10.5 8.232 11.232 7.5 12.75 7.5c.728 0 1.5.075 1.5.075v1.5h-.844c-.831 0-1.031.494-1.031.997V11H14.25l-.281 1.5H12.375v3H10.5z" />
      </svg>
    ),
  },
];

// ─── Shared UI Primitives ─────────────────────────────────────────────────────
export const inputClass =
  "w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 bg-white " +
  "placeholder-gray-400 outline-none transition " +
  "focus:border-blue-400 focus:ring-2 focus:ring-blue-50 hover:border-gray-300";

export const FormLabel = ({ children, required }) => (
  <label className="block text-xs font-semibold text-black mb-1">
    {children}
    {required && <span className="text-red-500 ml-0.5">*</span>}
  </label>
);

export const ErrorMsg = ({ name }) => (
  <ErrorMessage
    name={name}
    component="p"
    className="text-red-400 text-xs mt-1 font-medium"
  />
);

export const Section = ({ title, icon, children }) => (
  <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-5">
    {title && (
      <div className="flex items-center gap-2 mb-4">
        {icon && <span className="text-blue-600">{icon}</span>}
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      </div>
    )}
    {children}
  </div>
);

export const SubmitFooter = ({ isSubmitting, label, onClose, isEditing }) => (
  <div className="flex-shrink-0 flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-white">
    <button
      type="button"
      onClick={onClose}
      className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition cursor-pointer bg-white"
    >
      Cancel
    </button>
    <button
      type="submit"
      disabled={isSubmitting}
      className="px-6 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white text-sm font-semibold border-0 cursor-pointer transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
    >
      {isSubmitting ? (
        <>
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            />
          </svg>
          Submitting...
        </>
      ) : isEditing ? (
        `Update ${label}`
      ) : (
        `Submit ${label}`
      )}
    </button>
  </div>
);
