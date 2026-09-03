import { useEffect, useState, useRef } from "react";
import { CustomModal } from "@/components/custom-modal/CustomModal";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import AddGodown from "@/partials/modals/add-godown/AddGodown";
import PlaceSelect from "../../../../components/PlaceSelect/PlaceSelect";
import { FormattedMessage } from "react-intl";
import { GETallGodown, Translateapi } from "../../../../services/apiServices";
import AddContactName from "../../../../pages/master/MenuItemMaster/components/AddContactName";
import MultiLangInputBox from "../../../../components/form-inputs/MultiLangInputbox";
import { extractTranslations } from "../../../../utils/langConfig";

const AddGrossary = ({
  isModalOpen,
  setIsModalOpen,
  modalData,
  onAllocateAgency,
  onAllocatePlace,
  onAllocateDate,
  onAllocateRemarks,
  agencies = [],
  loading,
  FetchSuplier,
}) => {
  const [selectedAgency, setSelectedAgency] = useState("");
  const [selectedPlace, setSelectedPlace] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [isGodownOpen, setIsGodownOpen] = useState(false);
  const [options, setOptions] = useState([
    { value: "venue", label: "At venue", id: "venue" },
  ]);

  // ── Remarks state ──
const [remarksForm, setRemarksForm] = useState({
  remarksEnglish: "",
  remarksHindi: "",
  remarksGujarati: "",
});
const translateTimerRef = useRef(null);



useEffect(() => {
  if (translateTimerRef.current) clearTimeout(translateTimerRef.current);

  if (!remarksForm.remarksEnglish?.trim()) {
    setRemarksForm((prev) => ({ ...prev, remarksHindi: "", remarksGujarati: "" }));
    return;
  }

  translateTimerRef.current = setTimeout(async () => {
    try {
      const res = await Translateapi(remarksForm.remarksEnglish);
      const { regional, hindi } = extractTranslations(res?.data?.data || res?.data || {});
      setRemarksForm((prev) => ({ ...prev, remarksHindi: hindi, remarksGujarati: regional }));
    } catch (err) {
      console.error("Translation error:", err);
    }
  }, 700);

  return () => clearTimeout(translateTimerRef.current);
}, [remarksForm.remarksEnglish]);

  const handleModalClose = () => setIsModalOpen(false);

  let userId = localStorage.getItem("userId");

  // ── Allocation handlers ──
  const handleAllocateAgency = () => {
    if (selectedAgency) onAllocateAgency(selectedAgency);
  };

  const handleAllocatePlace = () => {
    if (selectedPlace) onAllocatePlace(selectedPlace);
  };

  const handleAllocateDate = () => {
    if (selectedDate) onAllocateDate(selectedDate);
  };

  const handleAllocateRemarks = () => {
  if (remarksForm.remarksEnglish || remarksForm.remarksHindi || remarksForm.remarksGujarati) {
    onAllocateRemarks && onAllocateRemarks(remarksForm);
  }
};

  // ── Auto-translate English → Hindi & Gujarati ──
  const handleEnglishRemarksChange = (value) => {
    setRemarksEnglish(value);

    if (translateTimerRef.current) clearTimeout(translateTimerRef.current);

    if (!value.trim()) {
      setRemarksHindi("");
      setRemarksGujarati("");
      return;
    }

    translateTimerRef.current = setTimeout(async () => {
      setIsTranslating(true);
      try {
        const [hindiRes, gujaratiRes] = await Promise.all([
          Translateapi(encodeURIComponent(value)),
          Translateapi(encodeURIComponent(value)),
        ]);

        // Adjust based on what Translateapi returns
        // Assuming it returns { data: { data: "translated text" } } or similar
        const hindiText =
          hindiRes?.data?.data?.hindi ||
          hindiRes?.data?.hindi ||
          hindiRes?.data?.data ||
          "";
        const gujaratiText =
          gujaratiRes?.data?.data?.gujarati ||
          gujaratiRes?.data?.gujarati ||
          gujaratiRes?.data?.data ||
          "";

        if (hindiText) setRemarksHindi(hindiText);
        if (gujaratiText) setRemarksGujarati(gujaratiText);
      } catch (err) {
        console.error("Translation error:", err);
      } finally {
        setIsTranslating(false);
      }
    }, 700);
  };

  useEffect(() => {
    fetchGodowns();
    return () => {
      if (translateTimerRef.current) clearTimeout(translateTimerRef.current);
    };
  }, []);

  const fetchGodowns = async () => {
    try {
      if (!userId || userId === "undefined" || userId === "null") {
        console.warn("No valid userId found, skipping godown fetch");
        return;
      }

      const res = await GETallGodown(userId);

      if (res?.data?.data?.length) {
        const godownOptions = res.data.data.map((g) => ({
          value: g.nameEnglish,
          label: g.nameEnglish,
          id: g.id,
        }));

        setOptions([
          { value: "At venue", label: "At venue", id: "venue" },
          ...godownOptions,
        ]);
      }
    } catch (err) {
      console.error("Error fetching godowns:", err);
    }
  };

  return (
    <>
      {/* SUPPLIER MODAL */}
      {isModalOpen && (
        <CustomModal
          open={isModalOpen}
          onClose={handleModalClose}
          title={
            <FormattedMessage
              id="GROSSARY.AGENCY_PLACE_DATE_ALLOCATION"
              defaultMessage="Supplier Allocation"
            />
          }
          width={1100}
          footer={[
            <div className="flex justify-between w-full" key="footer">
              <button className="btn btn-light" onClick={handleModalClose}>
                <FormattedMessage id="COMMON.CANCEL" defaultMessage="Cancel" />
              </button>
              <button className="btn btn-primary" onClick={handleModalClose}>
                <FormattedMessage id="COMMON.SAVE" defaultMessage="Save" />
              </button>
            </div>,
          ]}
        >
          {/* ── Allocation Filters ── */}
          <div className="filters flex flex-wrap items-end justify-between gap-3 mb-4">

            {/* Agency */}
            <div className="flex items-end gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  <FormattedMessage id="SIDEBAR_MODAL.SELECT_AGENCY" defaultMessage="Agency" />
                </label>
                <select
                  className="select w-[150px]"
                  value={selectedAgency}
                  onChange={(e) => setSelectedAgency(e.target.value)}
                >
                  <option value="">
                    <FormattedMessage
                      id="SIDEBAR_MODAL.SELECT_AGENCY"
                      defaultMessage="Select Agency"
                    />
                  </option>
                  {loading && <option>Loading...</option>}
                  {!loading && agencies.length > 0
                    ? agencies.map((agency) => (
                        <option
                          key={agency.id}
                          value={agency.nameEnglish || agency.name}
                        >
                          {agency.nameEnglish || agency.name}
                        </option>
                      ))
                    : null}
                </select>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsVendorModalOpen(true);
                  setIsModalOpen(false);
                }}
                className="w-8 h-8 flex items-center justify-center bg-primary text-white rounded-full"
                title="Add Vendor"
              >
                <i className="ki-filled ki-plus"></i>
              </button>

              <button
                className="btn btn-primary"
                onClick={handleAllocateAgency}
                disabled={!selectedAgency}
              >
                <FormattedMessage id="COMMON.ALLOCATE" defaultMessage="Allocate" />
              </button>
            </div>

            {/* Place */}
            <div className="flex items-end gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  <FormattedMessage id="COMMON.PLACE" defaultMessage="Place" />
                </label>
                <div className="w-[200px]">
                  <PlaceSelect
                    value={selectedPlace}
                    onChange={(value) => setSelectedPlace(value)}
                    options={options}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsGodownOpen(true);
                  setIsModalOpen(false);
                }}
                className="w-8 h-8 flex items-center justify-center bg-primary text-white rounded-full"
                title="Add Godown"
              >
                <i className="ki-filled ki-plus"></i>
              </button>

              <button
                className="btn btn-primary"
                onClick={handleAllocatePlace}
                disabled={!selectedPlace}
              >
                <FormattedMessage id="COMMON.ALLOCATE" defaultMessage="Allocate" />
              </button>
            </div>

            {/* Date */}
            <div className="flex items-end gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  <FormattedMessage id="COMMON.DATE" defaultMessage="Date & Time" />
                </label>
                <DatePicker
                  className="input"
                  selected={selectedDate}
                  onChange={(date) => setSelectedDate(date)}
                  showTimeSelect
                  timeFormat="hh:mm aa"
                  timeIntervals={15}
                  dateFormat="MM/dd/yyyy hh:mm aa"
                  placeholderText="Select date and time"
                />
              </div>

              <button
                className="btn btn-primary"
                onClick={handleAllocateDate}
                disabled={!selectedDate}
              >
                <FormattedMessage id="COMMON.ALLOCATE" defaultMessage="Allocate" />
              </button>
            </div>

            {/* ── Remarks Section ── */}
           {/* ── Remarks Section ── */}
<div className="w-full border-t border-gray-200 pt-3 mt-1">
  <div className="flex items-center gap-2 mb-2">
    <i className="ki-filled ki-message-text text-primary text-sm"></i>
    <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">
      <FormattedMessage id="COMMON.REMARKS" defaultMessage="Remarks" />
    </span>
  </div>

  <div className="flex items-end gap-3">
    <div className="flex-1">
      <MultiLangInputBox
        formData={remarksForm}
        setFormData={setRemarksForm}
        label="Remarks"
        cols={3}
        type="text"
        keys={{
          english: "remarksEnglish",
          regional: "remarksGujarati",
          hindi: "remarksHindi",
        }}
      />
    </div>
    <div className="flex flex-col justify-end pb-1">
      <button
        className="btn btn-primary"
        onClick={handleAllocateRemarks}
        disabled={!remarksForm.remarksEnglish && !remarksForm.remarksHindi && !remarksForm.remarksGujarati}
      >
        <FormattedMessage id="COMMON.ALLOCATE" defaultMessage="Allocate" />
      </button>
    </div>
  </div>
</div>
          </div>

          {/* ── Table Section ── */}
          <div className="mt-4">{modalData && modalData()}</div>
        </CustomModal>
      )}

      {/* ADD VENDOR MODAL */}
      <AddContactName
        isModalOpen={isVendorModalOpen}
        setIsModalOpen={(val) => {
          setIsVendorModalOpen(val);
          if (!val) {
            setIsModalOpen(true);
            FetchSuplier && FetchSuplier();
          }
        }}
        refreshData={FetchSuplier}
        contactTypeId={3}
        concatId={3}
      />

      <AddGodown
        isModalOpen={isGodownOpen}
        setIsModalOpen={(val) => {
          setIsGodownOpen(val);
          if (!val) {
            setIsModalOpen(true);
            fetchGodowns && fetchGodowns();
          }
        }}
        refreshData={fetchGodowns}
      />
    </>
  );
};

export default AddGrossary;