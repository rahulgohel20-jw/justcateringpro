import { makeStyles } from "@mui/styles";

const useStyles = makeStyles(() => ({
  /** your local classes (optional) */
  customStyle: {},

  /** global styles for react-datepicker */
  "@global": {
    /* Sidebar Raw Material DatePicker Styles */
    ".react-datepicker-wrapper": {
      width: "100%",
    },

    ".react-datepicker__input-container": {
      width: "100%",
    },

    /* Calendar popup styling */
    ".react-datepicker-popper": {
      zIndex: "9999 !important",
    },

    ".react-datepicker": {
      fontSize: "0.875rem",
      border: "1px solid #d1d5db",
      borderRadius: "0.5rem",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    },

    ".react-datepicker__header": {
      backgroundColor: "#f9fafb",
      borderBottom: "1px solid #e5e7eb",
      paddingTop: "0.5rem",
    },

    ".react-datepicker__day--selected": {
      backgroundColor: "#2563eb !important",
      color: "white !important",
    },

    ".react-datepicker__day:hover": {
      backgroundColor: "#dbeafe",
    },

    ".react-datepicker__time-container": {
      borderLeft: "1px solid #e5e7eb",
    },

    ".react-datepicker__time-list-item:hover": {
      backgroundColor: "#dbeafe !important",
    },

    ".react-datepicker__time-list-item--selected": {
      backgroundColor: "#2563eb !important",
      color: "white !important",
    },
  },
}));

export default useStyles;
