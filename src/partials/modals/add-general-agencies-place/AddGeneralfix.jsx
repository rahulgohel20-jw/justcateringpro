import { useState } from "react";
import { CustomModal } from "@/components/custom-modal/CustomModal";
import { DatePicker, Form, Select } from "antd";
import dayjs from "dayjs";
import { FormattedMessage, useIntl } from "react-intl";
import PlaceSelect from "../../../components/PlaceSelect/PlaceSelect"; // Import PlaceSelect component

const AddGeneralfix = ({
  isModalOpen,
  setIsModalOpen,
  modalData,
  onAllocateAgency,
  onAllocatePlace,
  onAllocateDate,
  agencies = [],
  loading,
}) => {
  const [selectedAgency, setSelectedAgency] = useState("");
  const [selectedPlace, setSelectedPlace] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);

  const [data, setData] = useState([]);

  const handleModalClose = () => setIsModalOpen(false);
  const intl = useIntl();

  // Dropdown options
  const agencyOptions = agencies.map((a) => ({
    label: a.nameEnglish || a.name,
    value: a.nameEnglish || a.name,
  }));

  // Handle inline table changes
  const handleChange = (index, field, value) => {
    setData((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  // Allocation handlers
  const handleAllocateAgency = () => {
    if (selectedAgency) {
      onAllocateAgency(selectedAgency);
      setData((prev) =>
        prev.map((item) => ({ ...item, agency: selectedAgency }))
      );
    }
  };

  const handleAllocatePlace = () => {
    if (selectedPlace) {
      onAllocatePlace(selectedPlace);
      setData((prev) =>
        prev.map((item) => ({ ...item, place: selectedPlace }))
      );
    }
  };

  const handleAllocateDate = () => {
    if (selectedDate) {
      onAllocateDate(selectedDate);
      setData((prev) => prev.map((item) => ({ ...item, date: selectedDate })));
    }
  };

  return (
    isModalOpen && (
      <CustomModal
        open={isModalOpen}
        onClose={handleModalClose}
        title={intl.formatMessage({
          id: "RAW_MATERIAL_ALLOCATION.ADD_AGENCY_PLACE_DATE",
          defaultMessage: "Agency, Place & Date Allocation",
        })}
        width={900}
        footer={[
          <div className="flex justify-between" key={"footer-buttons"}>
            <button
              key="cancel"
              className="btn btn-light"
              onClick={handleModalClose}
            >
              <FormattedMessage id="COMMON.CANCEL" defaultMessage="Cancel" />
            </button>
            <button
              className="btn btn-primary save-btn"
              onClick={handleModalClose}
            >
              <FormattedMessage id="COMMON.SAVE" defaultMessage="Save" />
            </button>
          </div>,
        ]}
      >
        {/* Allocation Filters */}
        <div className="filters flex flex-wrap items-center justify-between gap-3 mb-4">
          {/* Agency Allocation */}
          <div className="flex items-end gap-2">
            <select
              className="select pe-7.5"
              value={selectedAgency}
              onChange={(e) => setSelectedAgency(e.target.value)}
            >
              <option value="">
                <FormattedMessage
                  id="SIDEBAR_MODAL.SELECT_AGENCY"
                  defaultMessage="Select Agency"
                />
              </option>
              {loading && (
                <option>
                  <FormattedMessage
                    id="SIDEBAR_MODAL.LOADING"
                    defaultMessage="Loading..."
                  />
                </option>
              )}
              {!loading && agencies.length > 0
                ? agencies.map((agency) => (
                    <option
                      key={agency.id}
                      value={agency.nameEnglish || agency.name}
                    >
                      {agency.nameEnglish || agency.name}
                    </option>
                  ))
                : !loading && (
                    <option>
                      <FormattedMessage
                        id="COMMON.NO_AGENCY_FOUND"
                        defaultMessage="no agencies found"
                      />
                    </option>
                  )}
            </select>
            <button
              className="btn btn-primary"
              onClick={handleAllocateAgency}
              disabled={!selectedAgency}
            >
              <FormattedMessage
                id="COMMON.ALLOCATE"
                defaultMessage="Allocate"
              />
            </button>
          </div>

          {/* Place Allocation - Using PlaceSelect */}
          <div className="flex items-end gap-2">
            <div className="w-[200px]">
              <PlaceSelect
                value={selectedPlace}
                onChange={(value) => setSelectedPlace(value)}
              />
            </div>
            <button
              className="btn btn-primary"
              onClick={handleAllocatePlace}
              disabled={!selectedPlace}
            >
              <FormattedMessage
                id="COMMON.ALLOCATE"
                defaultMessage="Allocate"
              />
            </button>
          </div>

          {/* Date Allocation */}
          <div className="flex items-end gap-2">
            <DatePicker
              className="input"
              showTime
              format="MM/DD/YYYY hh:mm A"
              value={selectedDate}
              onChange={(date) => setSelectedDate(date)}
            />
            <button
              className="btn btn-primary"
              onClick={handleAllocateDate}
              disabled={!selectedDate}
            >
              <FormattedMessage
                id="COMMON.ALLOCATE"
                defaultMessage="Allocate"
              />
            </button>
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-gray-700">
            <thead className="bg-gray-100 text-gray-700 uppercase text-xs font-semibold">
              <tr>
                <th className="px-4 py-3 text-left">
                  <FormattedMessage
                    id="COMMON.RAW_MATERIAL"
                    defaultMessage="Raw Material"
                  />
                </th>
                <th className="px-4 py-3 text-left">
                  <FormattedMessage
                    id="COMMON.AGENCY"
                    defaultMessage="Agency"
                  />
                </th>
                <th className="px-4 py-3 text-left">
                  <FormattedMessage id="COMMON.PLACE" defaultMessage="Place" />
                </th>
                <th className="px-4 py-3 text-left">
                  <FormattedMessage
                    id="COMMON.DATE_AND_TIME"
                    defaultMessage="Date & Time"
                  />
                </th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-gray-500">
                    <FormattedMessage
                      id="COMMON.NO_MATERIALS_FOUND"
                      defaultMessage="No materials found"
                    />
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="px-4 py-3">{item.material}</td>
                    <td className="px-4 py-3">
                      <Select
                        size="small"
                        className="w-full"
                        value={item.agency}
                        options={agencyOptions}
                        onChange={(value) =>
                          handleChange(index, "agency", value)
                        }
                      />
                    </td>
                    <td className="px-4 py-3">
                      <PlaceSelect
                        value={item.place}
                        onChange={(value) =>
                          handleChange(index, "place", value)
                        }
                      />
                    </td>
                    <td className="px-4 py-3">
                      <DatePicker
                        className="input input-sm"
                        showTime
                        format="MM/DD/YYYY hh:mm A"
                        value={
                          item.date && dayjs(item.date).isValid()
                            ? dayjs(item.date)
                            : null
                        }
                        onChange={(date) => handleChange(index, "date", date)}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Optional Custom Data Section */}
        <div className="mt-4">{modalData()}</div>
      </CustomModal>
    )
  );
};

export default AddGeneralfix;
