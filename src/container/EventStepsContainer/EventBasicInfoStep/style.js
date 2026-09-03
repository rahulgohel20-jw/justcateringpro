import { makeStyles } from "@mui/styles";
const useStyles = makeStyles({
  basicInfo: {

    // Add these new styles
    '& .react-datepicker-wrapper': {
      width: '100%',
    },
    '& .react-datepicker__input-container input': {
      width: '100%',
      padding: '0.5rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.375rem',
      '&:disabled': {
        backgroundColor: '#f3f4f6',
        cursor: 'not-allowed',
      },
    },
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
