import { makeStyles } from "@mui/styles";
import { toAbsoluteUrl } from "@/utils/Assets";
const useStyles = makeStyles({
  customSteps: {
    borderRadius: "12px",
    boxShadow: "0px 3px 4px 0px rgba(0, 0, 0, 0.03)",
    "& .ant-steps": {
      display: "flex",
      alignItems: "center",
      padding: "20px 30px 40px 30px !important",
      borderTopLeftRadius: "12px",
      borderTopRightRadius: "12px",
      background: "var(--tw-gray-100)",
      border: "1px solid var(--tw-gray-200)",
      position: "relative",
      "& .ant-steps-item": {
        padding: "0 !important",
        "&:before": {
          width: "20px !important",
          height: "20px",
          left: "0",
          right: "0",
          zIndex: "1",
          bottom: "-20px",
          margin: "0 auto",
          borderRadius: "50rem",
          backgroundColor: "var(--tw-gray-100)",
          border: "1px solid rgba(5,5,5,0.06)",
        },
        "&:after": {
          top: "unset",
          left: "0",
          right: "0",
          zIndex: "1",
          margin: "0 auto",
          transform: "unset",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "auto",
        },
        "& .ant-steps-item-container": {
          paddingBottom: "0",
          margin: "0",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          "& .ant-steps-item-tail": {
            display: "block",
            visibility: "visible !important",
            top: "unset",
            bottom: "-10px",
            "&:after": {
              height: "2px",
            },
          },
          "& .ant-steps-item-icon": {
            lineHeight: "1",
            margin: "0",
            "& .ant-steps-icon": {
              "& > i": {},
            },
          },
          "& .ant-steps-item-content": {
            textAlign: "center",
            "& .ant-steps-item-title": {
              fontWeight: "600",
            },
          },
        },
        // ant-steps-item-wait
        "&.ant-steps-item-wait": {
          "&:after": {
            border: "0",
          },
          "& .ant-steps-item-container": {
            "& .ant-steps-item-tail": {},
            "& .ant-steps-item-icon": {
              "& .ant-steps-icon": {
                "& > i": {},
              },
            },
            "& .ant-steps-item-content": {
              "& .ant-steps-item-title": {},
            },
          },
        },
        // ant-steps-item-process
        "&.ant-steps-item-process": {
          "&:before": {
            borderRadius: "50rem",
            border: "1px solid var(--tw-primary)",
            background: "var(--tw-primary)",
          },
          "&:after": {
            height: "10px",
            bottom: "-15px",
            borderRadius: "50rem",
            width: "10px !important",
            backgroundColor: "var(--tw-gray-100)",
            border: "1px solid var(--tw-primary)",
          },
          "& .ant-steps-item-container": {
            "& .ant-steps-item-tail": {
              "&:after": {
                backgroundColor: "var(--tw-primary)",
              },
            },
            "& .ant-steps-item-icon": {
              "& .ant-steps-icon": {
                "& > i": {
                  color: "var(--tw-primary)",
                },
              },
            },
            "& .ant-steps-item-content": {
              "& .ant-steps-item-title": {
                color: "var(--tw-primary)",
              },
            },
          },
        },
        // ant-steps-item-finish
        "&.ant-steps-item-finish": {
          "&:after": {
            border: "0",
            backgroundImage: `url(${toAbsoluteUrl(`/images/check_icn.svg`)})`,
            bottom: "-16px",
          },
          "&:before": {
            border: "1px solid var(--tw-success)",
            background: "var(--tw-success)",
          },
          "& .ant-steps-item-container": {
            "& .ant-steps-item-tail": {
              "&:after": {
                backgroundColor: "var(--tw-success)",
              },
            },
            "& .ant-steps-item-icon": {
              "& .ant-steps-icon": {
                "& > i": {
                  color: "var(--tw-success)",
                },
              },
            },
            "& .ant-steps-item-content": {
              "& .ant-steps-item-title": {
                color: "var(--tw-success)",
              },
            },
          },
        },
      },
    },
    "& .ant-content": {
      borderStyle: "solid",
      borderWidth: "0 1px 1px 1px",
      borderBottomLeftRadius: "12px",
      borderBottomRightRadius: "12px",
      borderColor: "var(--tw-gray-200)",
      "& .ant-body": {
        padding: "20px",
      },
      "& .ant-foot": {
        padding: "20px",
        borderTop: "1px solid var(--tw-gray-200)",
      },
    },
  },
});
export default useStyles;
