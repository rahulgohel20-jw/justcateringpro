import { makeStyles } from "@mui/styles";
const useStyles = makeStyles({
  formGrp: {
    "& .ant-select": {
      width: "100%",
      height: "2.5rem",
      "& .ant-select-selector": {
        borderColor: "var(--tw-gray-400)",
        "& .ant-select-selection-wrap": {
          "&:after": {
            lineHeight: "32px",
          },
          "& .ant-select-selection-search": {
            "& .ant-select-selection-search-input": {
              height: "36px",
            },
          },
          "& .ant-select-selection-overflow": {
            flexWrap: "nowrap",
            overflow: "auto",
            MsOverflowStyle: "none",
            scrollbarWidth: "none",
            flex: "unset",
            "&::-webkit-scrollbar": {
              display: "none",
            },
            "& .ant-select-selection-overflow-item": {},
          },
          "& .ant-select-selection-placeholder": {
            color: "var(--tw-gray-700)",
            paddingInlineEnd: "6px",
            fontSize: "0.8125rem",
            fontWeight: "500",
            lineHeight: "36px",
            position: "unset",
            transform: "unset",
          },
        },
      },
      "& .ant-select-arrow": {},
      "&:hover": {
        "& .ant-select-selector": {
          borderColor: "var(--tw-gray-400) !important",
        },
      },
      "&:active": {},
      "&.ant-select-open": {},
      "&.ant-select-select-show": {},
      "&.ant-select-focused": {
        "& .ant-select-selector": {
          borderColor: "var(--tw-gray-400) !important",
          boxShadow: "none !important",
        },
      },
    },
  },
  select: {},
});
export default useStyles;
