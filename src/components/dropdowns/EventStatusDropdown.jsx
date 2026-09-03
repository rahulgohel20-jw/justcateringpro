import { SelectDropdown } from "@/components/form-components/SelectDropdown";
import { FormattedMessage, useIntl } from "react-intl";



const EventStatusDropdown = ({ value, onChange, ...rest }) => {

  const intl = useIntl();


  const STATUS_OPTIONS = [
    {
      label: intl.formatMessage({
        id: "USER.DASHBOARD.DASHBOARD_CALENDAR_FILTER_INQUIRY",
        defaultMessage: "Inquiry",
      }),
      value: "0",
    },
    {
      label: intl.formatMessage({
        id: "USER.DASHBOARD.DASHBOARD_CALENDAR_FILTER_TENTATIVE",
        defaultMessage: "Tentative",
      }),
      value: "3",
    },
    {
      label: intl.formatMessage({
        id: "USER.DASHBOARD.DASHBOARD_CALENDAR_FILTER_CONFIRM",
        defaultMessage: "Confirm",
      }),
      value: "1",
    },
    {
      label: intl.formatMessage({
        id: "USER.DASHBOARD.DASHBOARD_CALENDAR_FILTER_CANCEL",
        defaultMessage: "Cancel",
      }),
      value: "2",
    },
    
  ];
  
  const handleChange = (eOrVal) => {
    // support both shapes: native event or direct value
    const val = eOrVal?.target ? eOrVal.target.value : eOrVal;
    onChange({
      target: {
        name: "status",
        value: String(val),
      },
    });
  };

  return (
    <SelectDropdown
      value={value} // "0" | "1" | "2" | "3"
      onChange={handleChange}
      staticOptions={STATUS_OPTIONS}
      placeholder="Please select"
      {...rest}
    />
  );
};

export default EventStatusDropdown;
