import { useState, useEffect } from "react";
import { CustomModal } from "@/components/custom-modal/CustomModal";
import {
  GetEventMasterById,
  TranslateHindi,
  TranslateGujarati,
} from "@/services/apiServices";
import dayjs from "dayjs";

const ViewEventDetail = ({ isModalOpen, setIsModalOpen, eventId }) => {
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [translatedData, setTranslatedData] = useState({});
  const [currentLang, setCurrentLang] = useState("");

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const Field = ({ label, value }) => (
    <div className="flex">
      <span className="w-48 font-semibold text-gray-700">{label}:</span>
      <span className="text-gray-800">{value || "-"}</span>
    </div>
  );

  // Get current language
  const getCurrentLanguage = () => {
    const i18nConfig = localStorage.getItem("i18nConfig");
    if (i18nConfig) {
      try {
        const parsedConfig = JSON.parse(i18nConfig);
        return parsedConfig.code || "en";
      } catch (e) {
        return "en";
      }
    }
    return "en";
  };

  // Translation helper function
  const translateText = async (text) => {
    if (!text) return "";

    const selectedLang = getCurrentLanguage();

    // If English, no translation needed
    if (selectedLang === "en") {
      return text;
    }

    try {
      switch (selectedLang) {
        case "hi":
          const resHindi = await TranslateHindi({ text });
          return resHindi?.data?.text || resHindi?.data?.translatedText || text;

        case "gu":
          const resGujarati = await TranslateGujarati({ text });
          return (
            resGujarati?.data?.text || resGujarati?.data?.translatedText || text
          );

        default:
          return text;
      }
    } catch (error) {
      console.error("Translation error:", error);
      return text;
    }
  };

  // Translate all relevant fields
  const translateAllFields = async () => {
    if (!eventData) return;

    const fieldsToTranslate = [
      { key: "venue", value: eventData?.venue?.nameEnglish },
      { key: "partyName", value: eventData?.party?.nameEnglish },
      { key: "mealType", value: eventData?.mealType?.nameEnglish },
      { key: "eventType", value: eventData?.eventType?.nameEnglish },
      { key: "address", value: eventData?.address },
      {
        key: "managerName",
        value:
          `${eventData?.manager?.firstName || ""} ${eventData?.manager?.lastName || ""}`.trim(),
      },
    ];

    const translations = await Promise.all(
      fieldsToTranslate.map(async (field) => {
        const translated = await translateText(field.value);
        return { key: field.key, value: translated };
      }),
    );

    const translatedObj = {};
    translations.forEach((item) => {
      translatedObj[item.key] = item.value;
    });

    setTranslatedData(translatedObj);
  };

  // Fetch event data when modal opens
  useEffect(() => {
    if (isModalOpen && eventId) {
      setLoading(true);
      GetEventMasterById(eventId)
        .then((res) => {
          const event = res.data.data["Event Details"][0];
          const formattedEvent = {
            ...event,
            inquiryDate: event.inquiryDate
              ? dayjs(event.inquiryDate, "DD/MM/YYYY").format("DD/MM/YYYY")
              : event.inquiryDate,
          };
          setEventData(formattedEvent);

          const lang = getCurrentLanguage();
          setCurrentLang(lang);
        })
        .catch((err) => console.error("Error fetching event:", err))
        .finally(() => setLoading(false));
    }
  }, [isModalOpen, eventId]);

  // Translate when eventData loads or language changes
  useEffect(() => {
    if (eventData && isModalOpen) {
      translateAllFields();
    }
  }, [eventData, isModalOpen]);

  // Re-translate when language changes
  useEffect(() => {
    if (!isModalOpen) return;

    const checkLanguageChange = setInterval(() => {
      const newLang = getCurrentLanguage();
      if (newLang !== currentLang) {
        setCurrentLang(newLang);
        translateAllFields();
      }
    }, 500);

    return () => clearInterval(checkLanguageChange);
  }, [currentLang, isModalOpen, eventData]);

  return (
    isModalOpen && (
      <CustomModal
        open={isModalOpen}
        onClose={handleModalClose}
        title="View Event Details"
        width={800}
        footer={[
          <div className="flex items-center justify-end" key={"footer-buttons"}>
            <button
              key="cancel"
              className="btn btn-light"
              onClick={handleModalClose}
              title="Close"
            >
              Close
            </button>
          </div>,
        ]}
      >
        {eventData && !loading ? (
          <div className="flex flex-col gap-y-2 gap-x-4">
            {/* Debug info - remove in production */}
            <div className="text-xs text-gray-500 mb-2"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-y-3 gap-x-5">
              <Field label="Event No" value={eventData?.eventNo} />
              <Field label="Inquiry Date" value={eventData?.inquiryDate} />
              <Field
                label="Start Event Date"
                value={eventData?.eventStartDateTime}
              />
              <Field
                label="End Event Date"
                value={eventData?.eventEndDateTime}
              />
              <Field
                label="Venue"
                value={
                  translatedData.venue ||
                  eventData?.venue?.nameEnglish ||
                  "Loading..."
                }
              />

              <Field
                label="Address"
                value={
                  translatedData.address || eventData?.address || "Loading..."
                }
              />
              <Field
                label="Status"
                value={eventData?.status === 1 ? "Active" : "Inactive"}
              />
              <Field label="Mobile No" value={eventData?.mobileno} />
              <Field
                label="Manager"
                value={
                  translatedData.managerName ||
                  `${eventData?.manager?.firstName || ""} ${eventData?.manager?.lastName || ""}`.trim() ||
                  "Loading..."
                }
              />
              <Field
                label="Party Name"
                value={
                  translatedData.partyName ||
                  eventData?.party?.nameEnglish ||
                  "Loading..."
                }
              />
              <Field
                label="Meal Type"
                value={
                  translatedData.mealType ||
                  eventData?.mealType?.nameEnglish ||
                  "Loading..."
                }
              />
              <Field
                label="Event Type"
                value={
                  translatedData.eventType ||
                  eventData?.eventType?.nameEnglish ||
                  "Loading..."
                }
              />
              <Field label="Created At" value={eventData?.createdAt} />
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center h-40">
            <div className="text-gray-500">Loading...</div>
          </div>
        )}

        <hr className="mt-5 mb-4" />
      </CustomModal>
    )
  );
};

export default ViewEventDetail;
