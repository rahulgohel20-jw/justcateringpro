import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import AddCustomer from "@/partials/modals/add-customer/AddCustomer";
import CustomerDropdown from "@/components/dropdowns/customerDropdown";
import { GetAllCustomer, Translateapi } from "@/services/apiServices";
import useStyles from "./style";

import { FormattedMessage } from "react-intl";
import { useLanguage } from "@/i18n";
import MultiLangInputBox from "../../../components/form-inputs/MultiLangInputbox";
const getLangConfig = () => {
  try {
    const auth = JSON.parse(localStorage.getItem("auth-storage"));

    const lang = auth?.state?.user?.lang || "Gujarati";

    const langMap = {
      Gujarati: { apiKey: "gujarati", label: "Gujarati", placeholder: "ગુજરાતી નામ" },
      Tamil: { apiKey: "ta", label: "Tamil", placeholder: "தமிழ் பெயர்" },
      Telugu: { apiKey: "te", label: "Telugu", placeholder: "తెలుగు పేరు" },
      Malayalam: { apiKey: "ml", label: "Malayalam", placeholder: "മലയാളം പേര്" },
      Marathi: { apiKey: "mr", label: "Marathi", placeholder: "मराठी नाव" },
    };

    return langMap[lang] || langMap["Gujarati"];
  } catch {
    return { apiKey: "gujarati", label: "Gujarati", placeholder: "ગુજરાતી નામ" };
  }
};
const ClientDetailsStep = ({
  formData,
  setFormData,
  onInputChange,
  errors,
}) => {
  const classes = useStyles();
  const { isRTL, locale } = useLanguage();
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [customer, setCustomer] = useState([]);
  const langConfig = getLangConfig();
  
  const [lang, setLang] = useState(localStorage.getItem("lang") || "en");

  let Id = localStorage.getItem("userId");

  
  useEffect(() => {
    const storedLang = localStorage.getItem("lang") || "en";
    setLang(storedLang);
  }, [isRTL, locale]);

  
  const getLocalizedField = (item, fieldName) => {
    switch (lang) {
      case "hi":
        return item[`${fieldName}Hindi`] || item[`${fieldName}English`] || "";
      case "gu":
        return (
          item[`${fieldName}Gujarati`] || item[`${fieldName}English`] || ""
        );
      default:
        return item[`${fieldName}English`] || "";
    }
  };

  const handleCustomerChange = (selectedId) => {
    const selectedCustomer = customer.find(
      (c) => c.value === selectedId["target"].value,
    );

    if (selectedCustomer) {
      setFormData({
        ...formData,
        partyId: selectedCustomer.value,
        customer_name: selectedCustomer.customername,
        mobileno: selectedCustomer.mobile || "",
        address: selectedCustomer.address || "",
        // billingNameEnglish: formData.billingNameEnglish?.trim()
        //   ? formData.billingNameEnglish
        //   : selectedCustomer.nameEnglish || selectedCustomer.customername || "",
        // billingNameGujarati: formData.billingNameGujarati?.trim()
        //   ? formData.billingNameGujarati
        //   : selectedCustomer.nameGujarati || "",
        // billingNameHindi: formData.billingNameHindi?.trim()
        //   ? formData.billingNameHindi
        //   : selectedCustomer.nameHindi || "",
      });
    } else {
      setFormData({
        ...formData,
        partyId: "",
        customer_name: "",
        mobileno: "",
        address: "",
        reference: "",
        billingNameEnglish: "",
        billingNameGujarati: "",
        billingNameHindi: "",
        cordinatorPersonContactNo:"",
        cordinatorPersonNameEnglish: "",
        cordinatorPersonNameGujarati: "", 
        cordinatorPersonNameHindi :"" ,

      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (errors && errors[name]) {
    }
  };

  const 
  FetchCustomerName = (autoSelectLatest = false) => {
    GetAllCustomer(Id)
      .then((res) => {
        const partyDetails = res.data.data["Party Details"];

        const onlyCustomers = partyDetails.filter(
          (p) =>
            p.contact?.contactType?.nameEnglish?.trim().toLowerCase() ===
            "customer",
        );

        const customername = onlyCustomers.map((customer, index) => {
          const localizedName = getLocalizedField(customer, "name");
          const localizedAddress = getLocalizedField(customer, "address");

          return {
            sr_no: index + 1,
            value: customer.id,
            label: `${localizedName}`,
            mobile: customer.mobileno,
            address: localizedAddress,
            customername: localizedName,
            nameEnglish: customer.nameEnglish,
            nameHindi: customer.nameHindi,
            nameGujarati: customer.nameGujarati,
            addressEnglish: customer.addressEnglish,
            addressHindi: customer.addressHindi,
            addressGujarati: customer.addressGujarati,
          };
        });

        setCustomer(customername);

        if (autoSelectLatest && customername.length > 0) {
          const latestCustomer = customername[customername.length - 1];

          setFormData((prev) => ({
            ...prev,
            partyId: latestCustomer.value,
            customer_name: latestCustomer.customername,
            mobileno: latestCustomer.mobile || "",
            address: latestCustomer.address || "",
          }));
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    if (!formData.billingNameEnglish?.trim()) {
      // If English is empty, clear Gujarati and Hindi too
      setFormData((prev) => ({
        ...prev,
        billingNameGujarati: "",
        billingNameHindi: "",
      }));
      return;
    }

    const timer = setTimeout(() => {
      Translateapi(formData.billingNameEnglish)
        .then((res) => {
          setFormData((prev) => ({
            ...prev,
            billingNameGujarati: res?.data?.[langConfig.apiKey] || "",
            billingNameHindi: res?.data?.hindi || "",
          }));
        })
        .catch((err) => {
          console.error("Translation error:", err);
        });
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.billingNameEnglish]);
useEffect(() => {
  if (!formData.cordinatorPersonNameEnglish?.trim()) {
    setFormData((prev) => ({
      ...prev,
      cordinatorPersonNameGujarati: "",
      cordinatorPersonNameHindi: "",
    }));
    return;
  }

  const timer = setTimeout(() => {
    Translateapi(formData.cordinatorPersonNameEnglish)
      .then((res) => {
        setFormData((prev) => ({
          ...prev,
          cordinatorPersonNameGujarati: res?.data?.[langConfig.apiKey] || "",
          cordinatorPersonNameHindi: res?.data?.hindi || "",
        }));
      })
      .catch((err) => {
        console.error("Translation error:", err);
      });
  }, 500);

  return () => clearTimeout(timer);
}, [formData.cordinatorPersonNameEnglish]);
  const handleCustomerAdded = () => {
    FetchCustomerName(true);
  };

  useEffect(() => {
    FetchCustomerName();
  }, [lang]);

  return (
    <div className={`flex flex-col gap-y-2 gap-x-4 ${classes.basicInfo}`}>
      <div className="gap-3 lg:gap-4">
        <div className="w-full space-y-3">
          <div className="select__grp flex flex-col">
            <label className="form-label">
              <FormattedMessage
                id="USER.DASHBOARD.DASHBOARD_CALENDAR_EVENT_DETAILS_CLIENT_DETAILS_NAME"
                defaultMessage="Client Name"
              />
              <span className="mandatory ms-0.5 text-base text-red-500 font-medium">
                *
              </span>
            </label>
            <div className="flex flex-col">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <select
                  name="prefix"
                  className="w-20 px-3 select"
                  value={formData.prefix || "Mr."}
                  onChange={handleChange}
                >
                  <option value="Mr.">
                    <FormattedMessage
                      id="USER.DASHBOARD.DASHBOARD_CALENDAR_EVENT_DETAILS_CLIENT_DETAILS_PREFIX_MR"
                      defaultMessage="Mr."
                    />
                  </option>
                  <option value="Ms.">
                    <FormattedMessage
                      id="USER.DASHBOARD.DASHBOARD_CALENDAR_EVENT_DETAILS_CLIENT_DETAILS_PREFIX_MS"
                      defaultMessage="Ms."
                    />
                  </option>
                  <option value="Mrs.">
                    <FormattedMessage
                      id="USER.DASHBOARD.DASHBOARD_CALENDAR_EVENT_DETAILS_CLIENT_DETAILS_PREFIX_MS"
                      defaultMessage="Mrs."
                    />
                  </option>
                    <option value="Miss">
                    <FormattedMessage
                      id="USER.DASHBOARD.DASHBOARD_CALENDAR_EVENT_DETAILS_CLIENT_DETAILS_PREFIX_MS"
                      defaultMessage="Miss"
                    />
                  </option>
                </select>
                <div className="sg__inner flex items-center gap-1 relative w-full">
                  <i className="ki-filled ki-user ms-2.5"></i>

                  <CustomerDropdown
                    value={formData.partyId}
                    onChange={handleCustomerChange}
                    options={customer}
                  />
                  <button
                    type="button"
                    onClick={() => setIsMemberModalOpen(true)}
                    title="Add"
                    className="sga__btn me-1 btn btn-primary flex items-center justify-center rounded-full p-3 w-8 h-8"
                  >
                    <i className="ki-filled ki-plus"></i>
                  </button>
                </div>
              </div>
              {errors.customer_name && (
                <span className="text-red-600 font-normal text-sm mt-0.50">
                  {errors.customer_name}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex flex-col w-full">
              <label className="text-sm font-normal text-black mb-1 block">
                <FormattedMessage
                  id="USER.DASHBOARD.DASHBOARD_CALENDAR_EVENT_DETAILS_CLIENT_DETAILS_ADDRESS"
                  defaultMessage="Address"
                />
              </label>
              <div className="input">
                <i className="ki-filled ki-geolocation"></i>
                <Input
                  readOnly
                  name="address"
                  placeholder="Enter Order Address"
                  value={formData.address || ""}
                  onChange={handleChange}
                  className="!border-none !shadow-none focus:!outline-none focus:!ring-0"
                  bordered={false}
                />
              </div>
            </div>
            <div className="flex flex-col w-full">
              <label className="text-sm font-normal text-black mb-1 block">
                <FormattedMessage
                  id="USER.DASHBOARD.DASHBOARD_CALENDAR_EVENT_DETAILS_CLIENT_DETAILS_MOBILE"
                  defaultMessage="Mobile Number"
                />
                <span className="mandatory ms-0.5 text-base text-red-500 font-medium">
                  *
                </span>
              </label>
              <div className="input">
                <i className="ki-filled ki-phone text-[rgba(0, 91, 168, 1)]"></i>
                <Input
                  readOnly
                  name="mobileno"
                  placeholder="Enter Mobile Number"
                  value={formData.mobileno || ""}
                  onChange={handleChange}
                  className="!border-none !shadow-none focus:!outline-none focus:!ring-0 text-black font-semibold"
                  bordered={false}
                />
              </div>
              {errors.mobileno && (
                <span className="text-red-600 font-normal text-sm mt-0.50">
                  {errors.mobileno}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-normal text-black mb-1 block">
              <FormattedMessage
                id="USER.DASHBOARD.DASHBOARD_CALENDAR_EVENT_DETAILS_CLIENT_DETAILS_REFERENCE"
                defaultMessage="Reference"
              />
            </label>
            <div className="input">
              <i className="ki-filled ki-instagram"></i>
              <Input
                name="reference"
                placeholder="Reference"
                value={formData.reference || ""}
                onChange={handleChange}
                className="!border-none !shadow-none focus:!outline-none focus:!ring-0"
                bordered={false}
              />
            </div>
          </div>
     <MultiLangInputBox
  formData={formData}
  setFormData={setFormData}
  label="Billing Name"
  keys={{ english: "billingNameEnglish", regional: "billingNameGujarati", hindi: "billingNameHindi" }}
  required={false}
/>

<div className="flex flex-col md:flex-row gap-3">
  <div className="flex flex-col w-full">
    <MultiLangInputBox
      formData={formData}
      setFormData={setFormData}
      label="Cordinator Person"
    keys={{
  english: "cordinatorPersonNameEnglish",
  regional: "cordinatorPersonNameGujarati",
  hindi: "cordinatorPersonNameHindi",
}}
required={false}
    />
  </div>
  
</div>
<div className="flex flex-col w-full">
    <label className="text-sm font-normal text-black mb-1 block">
      Contact Phone No
    </label>
    <div className="input">
      <i className="ki-filled ki-phone"></i>
      <Input
        name="cordinatorPersonContactNo"
        placeholder="Enter Contact Phone No"
        value={formData.cordinatorPersonContactNo || ""}
        onChange={handleChange}
        className="!border-none !shadow-none focus:!outline-none focus:!ring-0"
        bordered={false}
      />
    </div>
  </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-normal text-black block">
              <FormattedMessage
                id="USER.DASHBOARD.DASHBOARD_CALENDAR_EVENT_DETAILS_CLIENT_DETAILS_HIGH_PRIORITY"
                defaultMessage="High Priority"
              />
            </label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1 text-sm">
                <input
                  type="radio"
                  name="isHighPriority"
                  value="Yes"
                  checked={formData.isHighPriority === "Yes"}
                  onChange={() =>
                    setFormData({ ...formData, isHighPriority: "Yes" })
                  }
                />
                <FormattedMessage
                  id="USER.DASHBOARD.DASHBOARD_CALENDAR_EVENT_DETAILS_CLIENT_DETAILS_YES"
                  defaultMessage="Yes"
                />
              </label>
              <label className="flex items-center gap-1 text-sm">
                <input
                  type="radio"
                  name="isHighPriority"
                  value="No"
                  checked={formData.isHighPriority === "No"}
                  onChange={() =>
                    setFormData({ ...formData, isHighPriority: "No" })
                  }
                />
                <FormattedMessage
                  id="USER.DASHBOARD.DASHBOARD_CALENDAR_EVENT_DETAILS_CLIENT_DETAILS_NO"
                  defaultMessage="No"
                />
              </label>
            </div>
          </div>

          <AddCustomer
            isModalOpen={isMemberModalOpen}
            setIsModalOpen={setIsMemberModalOpen}
            refreshData={handleCustomerAdded}
          />
        </div>
      </div>
    </div>
  );
};

export default ClientDetailsStep;
