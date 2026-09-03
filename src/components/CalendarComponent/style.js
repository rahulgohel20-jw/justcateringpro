import { makeStyles } from "@mui/styles";
const useStyles = makeStyles({
  fullCalendar: {
    "& .fc-media-screen": {
      "& table": {
        borderColor: "var(--tw-gray-300)",
      },
      "& th, & td": {
        borderColor: "var(--tw-gray-300)",
      },

      "& .fc-day": {
        "&.fc-day-future": {
          "& .fc-daygrid-day-frame": {
            transition: ".3s ease-in-out",
            "&:hover, &:focus, &:active": {
              boxShadow: "var(--tw-default-box-shadow)",
              backgroundColor: "var(--tw-gray-200)",
            },
          },
        },
      },
      "& .fc-daygrid-day": {
        "& .fc-daygrid-day-events": {
          "& .fc-event": {
            "&.fc-event-start": {
              height: "24px",
              borderRadius: "4px",
              cursor: "pointer",
              "& .fc-event-main": {
                height: "20px",
                "& .fc-event-main-frame": {
                  height: "20px",
                  "& .fc-event-title-container": {
                    "& .fc-event-title": {
                      height: "20px",
                      lineHeight: "1.3",
                      paddingLeft: "4px",
                      fontSize: "15px",
                      textTransform: "uppercase",
                    },
                  },
                },
              },
            },
          },
        },
        "&.fc-day-today": {
          backgroundColor: "var(--tw-primary-lighter)",
          cursor: "pointer",
          "& .fc-daygrid-day-top": {
            marginBottom: "5px",
            "& .fc-daygrid-day-number": {
              color: "var(--tw-light)",
              background: "var(--tw-primary)",
              borderRadius: "50rem",
              position: "relative",
              top: "4px",
              right: "4px",
              width: "24px",
              height: "24px",
              padding: "0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            },
          },
        },
      },
      "& .fc-daygrid-day-number": {
        padding: "6px",
        lineHeight: "1",
        fontSize: "16px",
        fontWeight: "500",
        color: "var(--tw-gray-700)",
      },
      "& .fc-button": {
        borderRadius: "0.375rem",
        paddingInline: "1.25em",
        fontSize: "0.8125rem",
        height: "38px",
        "&.fc-today-button": {
          color: "var(--tw-light)",
          borderColor: "var(--tw-primary)",
          backgroundColor: "var(--tw-primary)",
          "&:not(:disabled):active:focus,&:hover, &:focus, &:active, &.active": {
            boxShadow: "var(--tw-primary-box-shadow)",
            backgroundColor: "var(--tw-primary-active)",
          },
        },
      },
      "& .fc-next-button, & .fc-prev-button": {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        "& .fc-icon": {
          fontSize: "1.25em",
        },
        "&.fc-button": {
          color: "var(--tw-gray-700)",
          borderColor: "var(--tw-gray-300)",
          backgroundColor: "var(--tw-light)",
          "&:hover, &:focus, &:active, &.active": {
            borderColor: "var(--tw-gray-300) !important",
            backgroundColor: "var(--tw-light-active)",
            boxShadow: "var(--tw-default-box-shadow) !important",
            color: "var(--tw-gray-800)",
          },
        },
      },
      "& .fc-dayGridMonth-button, & .fc-dayGridWeek-button, & .fc-timeGridDay-button, & .fc-listWeek-button": {
        "&.fc-button": {
          display: "inline-flex",
          alignItems: "center",
          cursor: "pointer",
          gap: "0.375rem",
          fontWeight: "500",
          outline: "none",
          color: "var(--tw-gray-700)",
          borderColor: "var(--tw-gray-300)",
          backgroundColor: "var(--tw-light) !important",
          "&:hover, &:focus, &:active": {
            borderColor: "var(--tw-gray-300) !important",
            backgroundColor: "var(--tw-light-active)",
            boxShadow: "var(--tw-default-box-shadow) !important",
            color: "var(--tw-gray-800)",
          },
          "&:not(:disabled).active, &:not(:disabled).fc-button-active, &.fc-button-active:hover": {
            borderColor: "var(--tw-primary) !important",
            backgroundColor: "var(--tw-primary) !important",
            color: "var(--tw-light)",
          },
        },
      },
      "& .fc-header-toolbar": {
        marginBottom: "10px",
        "& .fc-toolbar-chunk": {
          "& .fc-toolbar-title": {
            color: "var(--tw-gray-900)",
            fontSize: "22px",
            fontWeight: "600",
          },
        },
      },
      "& .fc-view-harness": {
        "& .fc-view": {
          borderColor: "var(--tw-gray-300)",
          "& > table": {
            "& > thead": {
              backgroundColor: "var(--tw-gray-100)",
              "& .fc-col-header-cell-cushion": {
                padding: "4px",
                fontSize: "16px",
                fontWeight: "600",
                color: "var(--tw-gray-900)",
                textTransform: "uppercase",
              },
            },
          },
        },
      },
      "& .fc-listWeek-view": {
        "& .fc-list-table": {
          "& .fc-list-day": {
            "& .fc-list-day-cushion": {
              background: "var(--tw-gray-100)",
              "& > a": {
                fontSize: "13px",
                fontWeight: "600",
                color: "var(--tw-gray-900)",
              },
            },
          },
          "& .fc-list-event": {
            "& .fc-list-event-time": {
              fontSize: "13px",
              fontWeight: "500",
              color: "var(--tw-gray-700)",
            },
            "& .fc-list-event-title": {
              "& > a": {
                fontSize: "13px",
                fontWeight: "500",
                color: "var(--tw-gray-700)",
              },
            },
          },
        },
      },
    },
  },

  // Mobile Specific Styles
  "@media (max-width: 767px)": {
    fullCalendar: {
      "& .fc-media-screen": {
        "& .fc-header-toolbar": {
          marginBottom: "8px",
          "& .fc-toolbar-chunk": {
            "&:nth-child(1)": {
              // Hide view buttons on mobile
              display: "none !important",
            },
            "&:nth-child(2)": {
              // Title
              width: "100%",
              justifyContent: "center",
              "& .fc-toolbar-title": {
                fontSize: "16px !important",
                textAlign: "center",
              },
            },
            "&:nth-child(3)": {
              // Navigation buttons
              display: "flex",
              gap: "6px",
              "& .fc-today-button": {
                display: "none !important", // Hide default today button
              },
              "& .fc-button": {
                minWidth: "60px",
                height: "36px !important",
                fontSize: "0.75rem !important",
              },
            },
          },
        },
        "& .fc-daygrid-day-number": {
          fontSize: "12px !important",
          padding: "4px !important",
        },
        "& .fc-col-header-cell-cushion": {
          fontSize: "11px !important",
          padding: "3px !important",
        },
        "& .fc-daygrid-day": {
          "& .fc-daygrid-day-events": {
            "& .fc-event": {
              "&.fc-event-start": {
                height: "auto !important",
                minHeight: "16px",
                "& .fc-event-main": {
                  "& .fc-event-main-frame": {
                    "& .fc-event-title-container": {
                      "& .fc-event-title": {
                        fontSize: "10px !important",
                        lineHeight: "1.2",
                        padding: "2px 3px !important",
                        height: "auto !important",
                      },
                    },
                  },
                },
              },
            },
          },
          "&.fc-day-today": {
            "& .fc-daygrid-day-top": {
              "& .fc-daygrid-day-number": {
                width: "22px !important",
                height: "22px !important",
                fontSize: "11px !important",
                top: "2px",
                right: "2px",
              },
            },
          },
        },
        // List view mobile
        "& .fc-listWeek-view": {
          "& .fc-list-table": {
            fontSize: "12px",
            "& .fc-list-day": {
              "& .fc-list-day-cushion > a": {
                fontSize: "12px !important",
              },
            },
            "& .fc-list-event": {
              "& .fc-list-event-time, & .fc-list-event-title > a": {
                fontSize: "11px !important",
              },
            },
          },
        },
      },
    },
  },

  // Tablet Specific Styles
  "@media (min-width: 768px) and (max-width: 1024px)": {
    fullCalendar: {
      "& .fc-media-screen": {
        "& .fc-header-toolbar": {
          "& .fc-toolbar-chunk": {
            "&:nth-child(2)": {
              "& .fc-toolbar-title": {
                fontSize: "17px !important",
              },
            },
          },
        },
        "& .fc-button": {
          fontSize: "0.75rem !important",
          paddingInline: "0.8em !important",
        },
        "& .fc-daygrid-day": {
          "& .fc-daygrid-day-events": {
            "& .fc-event .fc-event-title": {
              fontSize: "11px !important",
            },
          },
        },
      },
    },
  },
});

export default useStyles;