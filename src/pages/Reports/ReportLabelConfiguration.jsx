"use client";
import { Fragment, useState, useEffect } from "react";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import { Container } from "@/components/container";
import InputToTextLang from "@/components/form-inputs/InputToTextLang";
import { Translateapi } from "@/services/apiServices";
import Swal from "sweetalert2";
import { FormattedMessage, useIntl } from "react-intl";
import { getLangConfig, extractTranslations } from "@/utils/langConfig";

const ReportLabelConfiguration = () => {
  const intl = useIntl();
  const [debounceTimers, setDebounceTimers] = useState({});
  const langConfig = getLangConfig();

  const { regional, hindi } = extractTranslations(data);
form.setFieldsValue({ nameGujarati: regional, nameHindi: hindi });

  const [formData, setFormData] = useState({
    reportHeader: {
      english: "Customer Name",
      gujarati: "ગ્રાહક નામ",
      hindi: "ग्राहक नाम",
    },
    customerName: {
      english: "Customer Name",
      gujarati: "ગ્રાહક નામ",
      hindi: "ग्राहक नाम",
    },
    filepartyNo: {
      english: "Customer Name",
      gujarati: "ફાઇલપાર્ટી નં.",
      hindi: "Customer Name",
    },
    managerName: {
      english: "Manager Name",
      gujarati: "મેનેજર નામ",
      hindi: "Manager Name",
    },
    venue: {
      english: "Customer Name",
      gujarati: "સ્થળ નામ",
      hindi: "Customer Name",
    },
    homeAddress: {
      english: "Manager Name",
      gujarati: "ઘરનું સરનામું",
      hindi: "Manager Name",
    },
  });

  const handleInputChange = (section, language, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [language]: value,
      },
    }));
  };

  const triggerTranslate = (section, text) => {
    if (!text?.trim()) return;

    const timerKey = section;

    // Clear existing timer for this section
    if (debounceTimers[timerKey]) {
      clearTimeout(debounceTimers[timerKey]);
    }

    const timer = setTimeout(() => {
      Translateapi(text)
  .then((res) => {
    const { regional, hindi } = extractTranslations(res.data);
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        gujarati: regional,
        hindi,
      },
    }));
  })
        .catch((err) => {
          console.error("Translation error:", err);
        });
    }, 500);

    setDebounceTimers((prev) => ({
      ...prev,
      [timerKey]: timer,
    }));
  };

  const handleEnglishChange = (section, value) => {
    handleInputChange(section, "english", value);
    if (value) {
      triggerTranslate(section, value);
    }
  };

  const handleReset = (section, language) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [language]: "",
      },
    }));
  };

  const handleCancel = () => {
    // Reset to default values or previous saved state
  };

  const handleSave = () => {
    Swal.fire("Success", "Changes saved successfully!", "success");
  };

  const renderInputField = (section, language, label, placeholder, lng) => {
  // Override label/placeholder/lng dynamically for the regional language field
  const resolvedLabel       = language === "gujarati" ? langConfig.label       : label;
  const resolvedPlaceholder = language === "gujarati" ? langConfig.placeholder : placeholder;
  const resolvedLng         = language === "gujarati" ? langConfig.lng         : lng;

  return (
    <div className="relative">
      <InputToTextLang
        label={resolvedLabel}
        placeholder={resolvedPlaceholder}
        value={formData[section][language]}
        onChange={(e) => {
          if (language === "gujarati") {
            handleInputChange(section, language, e.target.value);
          } else if (language === "english") {
            handleEnglishChange(section, e.target.value);
          } else {
            handleInputChange(section, language, e.target.value);
          }
        }}
        lng={resolvedLng}
        required={language === "english"}
      />
    </div>
  );
};

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      Object.values(debounceTimers).forEach((timer) => clearTimeout(timer));
    };
  }, []);

  return (
    <Fragment>
      <Container>
        <div className="w-full pb-2 mb-3">
          <Breadcrumbs items={[{ title: "Report Label Configuration" }]} />
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Report Header Section */}
            <div className="bg-white rounded-lg p-5 shadow-sm">
              <h3 className="text-base font-semibold text-gray-900 mb-4">
                <FormattedMessage
                  id="REPORT.LABEL.REPORT_HEADER"
                  defaultMessage="Report Header"
                />
              </h3>
              <div className="space-y-4">
                {renderInputField(
                  "reportHeader",
                  "english",
                  <FormattedMessage
                    id="COMMON.NAME_ENGLISH"
                    defaultMessage="Report Header (English)"
                  />,
                  intl.formatMessage({
                    id: "COMMON.NAME_ENGLISH",
                    defaultMessage: "Report Header (English)",
                  }),
                  "en-US"
                )}
                {renderInputField(
                  "reportHeader",
                  "gujarati",
                  <FormattedMessage
                    id="COMMON.NAME_GUJARATI"
                    defaultMessage="Report Header (ગુજરાતી)"
                  />,
                  intl.formatMessage({
                    id: "COMMON.NAME_GUJARATI",
                    defaultMessage: "Report Header (ગુજરાતી)",
                  }),
                  "gu"
                )}
                {renderInputField(
                  "reportHeader",
                  "hindi",
                  <FormattedMessage
                    id="COMMON.NAME_HINDI"
                    defaultMessage="Report Header (हिंदी)"
                  />,
                  intl.formatMessage({
                    id: "COMMON.NAME_HINDI",
                    defaultMessage: "Report Header (हिंदी)",
                  }),
                  "hi"
                )}
              </div>
            </div>

            {/* Customer Name Section */}
            <div className="bg-white rounded-lg p-5 shadow-sm">
              <h3 className="text-base font-semibold text-gray-900 mb-4">
                <FormattedMessage
                  id="REPORT.LABEL.CUSTOMER_NAME"
                  defaultMessage="Customer Name"
                />
              </h3>
              <div className="space-y-4">
                {renderInputField(
                  "customerName",
                  "english",
                  <FormattedMessage
                    id="COMMON.NAME_ENGLISH"
                    defaultMessage="Customer Name (English)"
                  />,
                  intl.formatMessage({
                    id: "COMMON.NAME_ENGLISH",
                    defaultMessage: "Customer Name (English)",
                  }),
                  "en-US"
                )}
                {renderInputField(
                  "customerName",
                  "gujarati",
                  <FormattedMessage
                    id="COMMON.NAME_GUJARATI"
                    defaultMessage="Customer Name (ગુજરાતી)"
                  />,
                  intl.formatMessage({
                    id: "COMMON.NAME_GUJARATI",
                    defaultMessage: "Customer Name (ગુજરાતી)",
                  }),
                  "gu"
                )}
                {renderInputField(
                  "customerName",
                  "hindi",
                  <FormattedMessage
                    id="COMMON.NAME_HINDI"
                    defaultMessage="Customer Name (हिंदी)"
                  />,
                  intl.formatMessage({
                    id: "COMMON.NAME_HINDI",
                    defaultMessage: "Customer Name (हिंदी)",
                  }),
                  "hi"
                )}
              </div>
            </div>

            {/* Fileparty No. Section */}
            <div className="bg-white rounded-lg p-5 shadow-sm">
              <h3 className="text-base font-semibold text-gray-900 mb-4">
                <FormattedMessage
                  id="REPORT.LABEL.FILEPARTY_NO"
                  defaultMessage="Fileparty No."
                />
              </h3>
              <div className="space-y-4">
                {renderInputField(
                  "filepartyNo",
                  "english",
                  <FormattedMessage
                    id="COMMON.NAME_ENGLISH"
                    defaultMessage="Fileparty No. (English)"
                  />,
                  intl.formatMessage({
                    id: "COMMON.NAME_ENGLISH",
                    defaultMessage: "Fileparty No. (English)",
                  }),
                  "en-US"
                )}
                {renderInputField(
                  "filepartyNo",
                  "gujarati",
                  <FormattedMessage
                    id="COMMON.NAME_GUJARATI"
                    defaultMessage="Fileparty No. (ગુજરાતી)"
                  />,
                  intl.formatMessage({
                    id: "COMMON.NAME_GUJARATI",
                    defaultMessage: "Fileparty No. (ગુજરાતી)",
                  }),
                  "gu"
                )}
                {renderInputField(
                  "filepartyNo",
                  "hindi",
                  <FormattedMessage
                    id="COMMON.NAME_HINDI"
                    defaultMessage="Fileparty No. (हिंदी)"
                  />,
                  intl.formatMessage({
                    id: "COMMON.NAME_HINDI",
                    defaultMessage: "Fileparty No. (हिंदी)",
                  }),
                  "hi"
                )}
              </div>
            </div>

            {/* Manager Name Section */}
            <div className="bg-white rounded-lg p-5 shadow-sm">
              <h3 className="text-base font-semibold text-gray-900 mb-4">
                <FormattedMessage
                  id="REPORT.LABEL.MANAGER_NAME"
                  defaultMessage="Manager Name"
                />
              </h3>
              <div className="space-y-4">
                {renderInputField(
                  "managerName",
                  "english",
                  <FormattedMessage
                    id="COMMON.NAME_ENGLISH"
                    defaultMessage="Manager Name (English)"
                  />,
                  intl.formatMessage({
                    id: "COMMON.NAME_ENGLISH",
                    defaultMessage: "Manager Name (English)",
                  }),
                  "en-US"
                )}
                {renderInputField(
                  "managerName",
                  "gujarati",
                  <FormattedMessage
                    id="COMMON.NAME_GUJARATI"
                    defaultMessage="Manager Name (ગુજરાતી)"
                  />,
                  intl.formatMessage({
                    id: "COMMON.NAME_GUJARATI",
                    defaultMessage: "Manager Name (ગુજરાતી)",
                  }),
                  "gu"
                )}
                {renderInputField(
                  "managerName",
                  "hindi",
                  <FormattedMessage
                    id="COMMON.NAME_HINDI"
                    defaultMessage="Manager Name (हिंदी)"
                  />,
                  intl.formatMessage({
                    id: "COMMON.NAME_HINDI",
                    defaultMessage: "Manager Name (हिंदी)",
                  }),
                  "hi"
                )}
              </div>
            </div>

            {/* Venue Section */}
            <div className="bg-white rounded-lg p-5 shadow-sm">
              <h3 className="text-base font-semibold text-gray-900 mb-4">
                <FormattedMessage
                  id="REPORT.LABEL.VENUE"
                  defaultMessage="Venue"
                />
              </h3>
              <div className="space-y-4">
                {renderInputField(
                  "venue",
                  "english",
                  <FormattedMessage
                    id="COMMON.NAME_ENGLISH"
                    defaultMessage="Venue Name (English)"
                  />,
                  intl.formatMessage({
                    id: "COMMON.NAME_ENGLISH",
                    defaultMessage: "Venue Name (English)",
                  }),
                  "en-US"
                )}
                {renderInputField(
                  "venue",
                  "gujarati",
                  <FormattedMessage
                    id="COMMON.NAME_GUJARATI"
                    defaultMessage="Venue Name (ગુજરાતી)"
                  />,
                  intl.formatMessage({
                    id: "COMMON.NAME_GUJARATI",
                    defaultMessage: "Venue Name (ગુજરાતી)",
                  }),
                  "gu"
                )}
                {renderInputField(
                  "venue",
                  "hindi",
                  <FormattedMessage
                    id="COMMON.NAME_HINDI"
                    defaultMessage="Venue Name (हिंदी)"
                  />,
                  intl.formatMessage({
                    id: "COMMON.NAME_HINDI",
                    defaultMessage: "Venue Name (हिंदी)",
                  }),
                  "hi"
                )}
              </div>
            </div>

            {/* Home Address Section */}
            <div className="bg-white rounded-lg p-5 shadow-sm">
              <h3 className="text-base font-semibold text-gray-900 mb-4">
                <FormattedMessage
                  id="REPORT.LABEL.HOME_ADDRESS"
                  defaultMessage="Home Address"
                />
              </h3>
              <div className="space-y-4">
                {renderInputField(
                  "homeAddress",
                  "english",
                  <FormattedMessage
                    id="COMMON.NAME_ENGLISH"
                    defaultMessage="Home Address (English)"
                  />,
                  intl.formatMessage({
                    id: "COMMON.NAME_ENGLISH",
                    defaultMessage: "Home Address (English)",
                  }),
                  "en-US"
                )}
                {renderInputField(
                  "homeAddress",
                  "gujarati",
                  <FormattedMessage
                    id="COMMON.NAME_GUJARATI"
                    defaultMessage="Home Address (ગુજરાતી)"
                  />,
                  intl.formatMessage({
                    id: "COMMON.NAME_GUJARATI",
                    defaultMessage: "Home Address (ગુજરાતી)",
                  }),
                  "gu"
                )}
                {renderInputField(
                  "homeAddress",
                  "hindi",
                  <FormattedMessage
                    id="COMMON.NAME_HINDI"
                    defaultMessage="Home Address (हिंदी)"
                  />,
                  intl.formatMessage({
                    id: "COMMON.NAME_HINDI",
                    defaultMessage: "Home Address (हिंदी)",
                  }),
                  "hi"
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={handleCancel}
              className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
            >
              <FormattedMessage id="COMMON.CANCEL" defaultMessage="Cancel" />
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2.5 text-sm font-medium text-white bg-[#005BA8] border border-transparent rounded-lg hover:bg-[#004a8f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
              </svg>
              <FormattedMessage
                id="COMMON.SAVE_CHANGES"
                defaultMessage="Save Changes"
              />
            </button>
          </div>
        </div>
      </Container>
    </Fragment>
  );
};

export default ReportLabelConfiguration;
