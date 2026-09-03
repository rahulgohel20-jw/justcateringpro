import { makeStyles } from "@mui/styles";
const useStyles = makeStyles({
  basicInfo: {
    "& .select__grp": {
      "& > .form-label": {},
      "& .sg__inner": {
        border: "1px solid var(--tw-gray-400)",
        borderRadius: "6px",
        "& .ant-select": {
          height: "38px",
          "& .ant-select-selector": {
            border: "0",
          },
        },
        "& > .input ": {
          border: "0",
          height: "38px",
        },
        "& .formGrpCommon": {
          flex: "1",
          "& .ant-select": {
            height: "38px",
            "& .ant-select-selector": {
              border: "0",
            },
          },
        },
        "& > .sga__btn": {
          maxWidth: "32px",
          flex: "0 0 32px",
          height: "32px",
        },
      },
    },
  },
});
export default useStyles;
