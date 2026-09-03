import { Input, Select, Button, Form, message, Spin } from "antd";
import { useState, useEffect, useCallback, useRef } from "react";
import ReactCountryFlag from "react-country-flag";
import { isEqual } from "lodash";
import {
  fetchCountries,
  fetchStatesByCountry,
  fetchCitiesByState,
  getUserById,
  updateusermaster,
} from "@/services/apiServices";
import { FormattedMessage, useIntl } from "react-intl";
import { useUser } from "../../context/UserContext";

const { TextArea } = Input;
const { Option } = Select;

const getUserIdFromLocalStorage = () => {
  try {
    const userId = localStorage.getItem("mainId");
    return userId || null;
  } catch {
    return null;
  }
};

const ProfileForm = ({ isEditing, onSaveSuccess }) => {
  const intl = useIntl();
  const { refreshUser } = useUser();

  const [form] = Form.useForm();
  const userMasterId = getUserIdFromLocalStorage();

  const [initialValues, setInitialValues] = useState(null);
  const [isChanged, setIsChanged] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState({
    country: false,
    state: false,
    city: false,
  });
  const [refreshKey, setRefreshKey] = useState(0);

  const initialValuesRef = useRef(null);

  const loadCountries = useCallback(async () => {
    setLoading((p) => ({ ...p, country: true }));
    try {
      const res = await fetchCountries();
      const list = res?.data?.data?.["Country Details"] || [];
      setCountries(list.map(({ id, name, code }) => ({ id, name, code })));
    } catch (err) {
      console.error("[loadCountries] Failed:", err);
      message.error("Failed to load countries");
    } finally {
      setLoading((p) => ({ ...p, country: false }));
    }
  }, []);

  const loadStates = useCallback(async (countryId) => {
    if (!countryId) {
      console.warn("[loadStates] Skipped: no countryId");
      return;
    }
    setLoading((p) => ({ ...p, state: true }));
    try {
      const res = await fetchStatesByCountry(countryId);
      const list = res?.data?.data?.["state Details"] || [];
      setStates(list.map(({ id, name }) => ({ id, name })));
    } catch (err) {
      console.error("[loadStates] Failed:", err);
      message.error("Failed to load states");
    } finally {
      setLoading((p) => ({ ...p, state: false }));
    }
  }, []);

  const loadCities = useCallback(async (stateId) => {
    if (!stateId) {
      console.warn("[loadCities] Skipped: no stateId");
      return;
    }
    setLoading((p) => ({ ...p, city: true }));
    try {
      const res = await fetchCitiesByState(stateId);
      const list = res?.data?.data?.["City Details"] || [];
      setCities(list.map(({ id, name }) => ({ id, name })));
    } catch (err) {
      console.error("[loadCities] Failed:", err);
      message.error("Failed to load cities");
    } finally {
      setLoading((p) => ({ ...p, city: false }));
    }
  }, []);

  const fetchUserData = useCallback(async () => {
    if (!userMasterId) {
      console.error("[fetchUserData] No userMasterId found in localStorage");
      message.error("User session not found. Please log in again.");
      setIsDataLoading(false);
      return;
    }

    setIsDataLoading(true);

    try {
      const res = await getUserById(userMasterId);
      const user = res?.data?.data?.["User Details"]?.[0];

      if (!user) {
        console.error("[fetchUserData] No user found in response:", res?.data);
        message.error("Could not load profile data.");
        return;
      }

      const values = {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.contactNo,
        companyName: user.userBasicDetails?.companyName,
        companyEmail: user.userBasicDetails?.companyEmail,
        address: user.userBasicDetails?.address,
        role: user.userBasicDetails?.role?.id ?? null,
        plan: user?.plan?.id ?? null,
        officePhone: user.userBasicDetails?.officeNo,
       gstNumber: user.gstNumber || "",
panNumber: user.panNumber || "",
cinNumber: user.cinNumber || "",
fdaLincense: user.fdaLincense || "",
fssaiNumber: user.fssaiNumber || "",
hsnNumber: user.hsnNumber || "",
followupDay: user.followupDay || user.userBasicDetails?.followupDay || "",
        country: user.userBasicDetails?.country?.id
          ? {
              value: user.userBasicDetails.country.id,
              label: user.userBasicDetails.country.name,
              code: user.userBasicDetails.country.code,
            }
          : null,
        state: user.userBasicDetails?.state?.id
          ? {
              value: user.userBasicDetails.state.id,
              label: user.userBasicDetails.state.name,
            }
          : null,
        city: user.userBasicDetails?.city?.id
          ? {
              value: user.userBasicDetails.city.id,
              label: user.userBasicDetails.city.name,
            }
          : null,
        bio: user.userBasicDetails?.bio || "",
      };

      setInitialValues(values);
      initialValuesRef.current = values;

      form.setFieldsValue(values);

      if (values.country?.value) await loadStates(values.country.value);
      if (values.state?.value) await loadCities(values.state.value);

      return values;
    } catch (err) {
      console.error("[fetchUserData] Error:", err);
      message.error("Failed to fetch user details");
    } finally {
      setIsDataLoading(false);
    }
  }, [userMasterId, form, loadStates, loadCities]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData, refreshKey]);

  const handleValuesChange = (_, allValues) => {
    const current = initialValuesRef.current;
    if (!current) return;
    setIsChanged(!isEqual(current, allValues));
  };

  const onFinish = async (values) => {
    

    if (isDataLoading) {
      message.warning("Profile data is still loading. Please wait.");
      return;
    }

    const currentInitial = initialValuesRef.current;

    if (!currentInitial) {
      console.error("[onFinish] initialValues is null — data not loaded");
      message.error("Profile data not loaded. Please refresh and try again.");
      return;
    }

    if (isSubmitting) {
      console.warn("[onFinish] Already submitting, skipping.");
      return;
    }

    const planId = currentInitial.plan;
    const roleId = currentInitial.role;

    

    if (!planId || !roleId) {
      console.error("[onFinish] Missing planId or roleId", { planId, roleId });
      message.error("Missing Plan or Role. Please contact support.");
      return;
    }

    if (!values.country?.value) {
      message.error("Please select a country");
      return;
    }

    const rawCode = values.country?.code || "91";
    const countryCode = rawCode.startsWith("+") ? rawCode : `+${rawCode}`;

    const payload = {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      password: "",
      confirmPassword: "",
      contactNo: values.phone,
      companyName: values.companyName,
      companyEmail: values.companyEmail,
      address: values.address,
      officeNo: values.officePhone,
      gstNumber: values.gstNumber || "",  
  panNumber: values.panNumber || "", 
cinNumber: values.cinNumber || "",
fdaLincense: values.fdaLincense || "",
fssaiNumber: values.fssaiNumber || "",
hsnNumber: values.hsnNumber || "",
followupDay: values.followupDay || "",
      countryId: values.country.value,
      countryCode,
      stateId: values.state?.value || 0,
      cityId: values.city?.value || 0,
      planId,
      roleId,
      remarks: values.bio || "",
      isAttendanceLeaveAccess: true,
      isTaskAccess: true,
      clientId: 0,
      reportingManagerId: 0,
    };

   

    setIsSubmitting(true);

    try {
      await updateusermaster(userMasterId, payload);
      
      message.success("Profile updated successfully");

      setIsChanged(false);

      const newInitial = { ...currentInitial, ...values };
      setInitialValues(newInitial);
      initialValuesRef.current = newInitial;

      await refreshUser();

      if (onSaveSuccess) {
        onSaveSuccess();
      }
    } catch (err) {
      console.error("[onFinish] updateusermaster error:", err);
      const response = err?.response?.data;
      if (response?.msg) {
        message.error(response.msg);
      } else if (response?.errors) {
        Object.values(response.errors)
          .flat()
          .forEach((m) => message.error(m));
      } else {
        message.error("Update failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderLocationSelect = (
    label,
    name,
    data,
    loadingKey,
    onFocus,
    onSelect,
    required = false,
  ) => (
    <Form.Item
      label={label}
      name={name}
      className="mb-8"
      rules={
        required ? [{ required: true, message: `Please select ${label}` }] : []
      }
    >
      <Select
        showSearch
        labelInValue
        placeholder={`Select ${label}`}
        loading={loading[loadingKey]}
        disabled={!isEditing || isDataLoading}
        open={isEditing && !isDataLoading ? undefined : false}
        filterOption={false}
        onFocus={onFocus}
        onSelect={onSelect}
        size="large"
        className="rounded-xl custom-select bg-[#F2F7FB]"
        dropdownStyle={{ borderRadius: 12 }}
        notFoundContent={
          loading[loadingKey] ? <Spin size="small" /> : `No ${label} found`
        }
      >
        {data.map((item) => (
          <Option
            key={item.id}
            value={item.id}
            label={item.name}
            code={item.code}
          >
            {name === "country" ? (
              <div className="flex items-center gap-2">
                <ReactCountryFlag
                  countryCode={item.code}
                  svg
                  style={{ width: 20, height: 15 }}
                />
                {item.name}
              </div>
            ) : (
              item.name
            )}
          </Option>
        ))}
      </Select>
    </Form.Item>
  );

  return (
  <Form
  form={form}
  layout="vertical"
  onFinish={onFinish}
  onFinishFailed={(errorInfo) => {
    console.error("Validation failed:", errorInfo);
    message.error("Please fill all required fields.");
  }}
  requiredMark={false}
  onValuesChange={handleValuesChange}
  className="profile-form"
>
      {isDataLoading && (
        <div className="flex justify-center items-center py-8">
          <Spin size="large" tip="Loading profile..." />
        </div>
      )}

      <div
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        style={{
          opacity: isDataLoading ? 0.4 : 1,
          pointerEvents: isDataLoading ? "none" : "auto",
        }}
      >
        <Form.Item
          label={
            <FormattedMessage
              id="COMMON.FIRST_NAME"
              defaultMessage="First Name"
            />
          }
          name="firstName"
          rules={[{ required: true }]}
        >
          <Input
            size="large"
            readOnly={!isEditing}
            placeholder={intl.formatMessage({
              id: "COMMON.ENTER_FIRST_NAME",
              defaultMessage: "Enter your first name..",
            })}
            className="rounded-xl h-11 bg-[#F2F7FB] border border-[#E6ECF1]"
          />
        </Form.Item>

        <Form.Item
          label={
            <FormattedMessage
              id="COMMON.LAST_NAME"
              defaultMessage="Last Name"
            />
          }
          name="lastName"
          rules={[{ required: true }]}
        >
          <Input
            size="large"
            readOnly={!isEditing}
            placeholder={intl.formatMessage({
              id: "COMMON.ENTER_LAST_NAME",
              defaultMessage: "Enter your last name..",
            })}
            className="rounded-xl h-11 bg-[#F2F7FB] border border-[#E6ECF1]"
          />
        </Form.Item>

        <Form.Item
          label={<FormattedMessage id="COMMON.EMAIL" defaultMessage="Email" />}
          name="email"
          rules={[{ required: true, type: "email" }]}
        >
          <Input
            size="large"
            readOnly={!isEditing}
            placeholder={intl.formatMessage({
              id: "COMMON.ENTER_EMAIL",
              defaultMessage: "Enter your email..",
            })}
            className="rounded-xl h-11 bg-[#F2F7FB] border border-[#E6ECF1]"
          />
        </Form.Item>

        <Form.Item
          label={
            <FormattedMessage
              id="COMMON.PHONE_NUMBER"
              defaultMessage="Phone Number"
            />
          }
          name="phone"
          rules={[{ required: true }]}
        >
          <Input
            size="large"
            readOnly={!isEditing}
            placeholder={intl.formatMessage({
              id: "COMMON.ENTER_PHONE_NUMBER",
              defaultMessage: "Enter your phone number..",
            })}
            className="rounded-xl h-11 bg-[#F2F7FB] border border-[#E6ECF1]"
          />
        </Form.Item>

        <Form.Item
          label={
            <FormattedMessage
              id="COMMON.COMPANY_NAME"
              defaultMessage="Company Name"
            />
          }
          name="companyName"
          rules={[{ required: true }]}
        >
          <Input
            size="large"
            readOnly={!isEditing}
            placeholder={intl.formatMessage({
              id: "COMMON.ENTER_COMPANY_NAME",
              defaultMessage: "Enter your company name..",
            })}
            className="rounded-xl h-11 bg-[#F2F7FB] border border-[#E6ECF1]"
          />
        </Form.Item>

        <Form.Item
          label={
            <FormattedMessage
              id="COMMON.COMPANY_EMAIL"
              defaultMessage="Company Email ID"
            />
          }
          name="companyEmail"
          rules={[{ required: true }]}
        >
          <Input
            size="large"
            readOnly={!isEditing}
            placeholder={intl.formatMessage({
              id: "COMMON.ENTER_COMPANY_EMAIL",
              defaultMessage: "Enter your company email..",
            })}
            className="rounded-xl h-11 bg-[#F2F7FB] border border-[#E6ECF1]"
          />
        </Form.Item>

        <Form.Item
          label={
            <FormattedMessage
              id="COMMON.OFFICE_PHONE"
              defaultMessage="Office Number"
            />
          }
          name="officePhone"
          rules={[{ required: true }]}
        >
          <Input
            size="large"
            placeholder={intl.formatMessage({
              id: "COMMON.ENTER_OFFICE_PHONE",
              defaultMessage: "Enter your office number..",
            })}
            readOnly={!isEditing}
            className="rounded-xl h-11 bg-[#F2F7FB] border border-[#E6ECF1]"
          />
        </Form.Item>
<Form.Item
  label={
    <FormattedMessage
      id="COMMON.GST_NUMBER"
      defaultMessage="GST Number"
    />
  }
  name="gstNumber"
>

  <Input
    size="large"
    placeholder={intl.formatMessage({
      id: "COMMON.ENTER_GST_NUMBER",
      defaultMessage: "Enter your GST number..",
    })}
    readOnly={!isEditing}
    className="rounded-xl h-11 bg-[#F2F7FB] border border-[#E6ECF1]"
  />
</Form.Item>
<Form.Item
  label={
    <FormattedMessage
      id="COMMON.GST_NUMBER"
      defaultMessage="PAN Number"
    />
  }
  name="panNumber"
>

  <Input
    size="large"
    placeholder={intl.formatMessage({
      id: "COMMON.ENTER_GST_NUMBER",
      defaultMessage: "Enter your Pan number..",
    })}
    readOnly={!isEditing}
    className="rounded-xl h-11 bg-[#F2F7FB] border border-[#E6ECF1]"
  />
</Form.Item>

<Form.Item
  label={
    <FormattedMessage
      id="COMMON.CIN_NUMBER"
      defaultMessage="CIN Number"
    />
  }
  name="cinNumber"
>
  <Input
    size="large"
    placeholder={intl.formatMessage({
      id: "COMMON.ENTER_CIN_NUMBER",
      defaultMessage: "Enter your CIN number..",
    })}
    readOnly={!isEditing}
    className="rounded-xl h-11 bg-[#F2F7FB] border border-[#E6ECF1]"
  />
</Form.Item>

<Form.Item
  label={
    <FormattedMessage
      id="COMMON.FDA_LICENSE"
      defaultMessage="FDA License"
    />
  }
  name="fdaLincense"
>
  <Input
    size="large"
    placeholder={intl.formatMessage({
      id: "COMMON.ENTER_FDA_LICENSE",
      defaultMessage: "Enter your FDA license number..",
    })}
    readOnly={!isEditing}
    className="rounded-xl h-11 bg-[#F2F7FB] border border-[#E6ECF1]"
  />
</Form.Item>

<Form.Item
  label={
    <FormattedMessage
      id="COMMON.FSSAI_NUMBER"
      defaultMessage="FSSAI Number"
    />
  }
  name="fssaiNumber"
>
  <Input
    size="large"
    placeholder={intl.formatMessage({
      id: "COMMON.ENTER_FSSAI_NUMBER",
      defaultMessage: "Enter your FSSAI number..",
    })}
    readOnly={!isEditing}
    className="rounded-xl h-11 bg-[#F2F7FB] border border-[#E6ECF1]"
  />
</Form.Item>

<Form.Item
  label={
    <FormattedMessage
      id="COMMON.HSN_NUMBER"
      defaultMessage="HSN Code"
    />
  }
  name="hsnNumber"
>
  <Input
    size="large"
    placeholder={intl.formatMessage({
      id: "COMMON.ENTER_HSN_NUMBER",
      defaultMessage: "Enter your HSN code..",
    })}
    readOnly={!isEditing}
    className="rounded-xl h-11 bg-[#F2F7FB] border border-[#E6ECF1]"
  />
</Form.Item>


<Form.Item
  label={
    <FormattedMessage
      id="COMMON.FOLLOWUP_DAY"
      defaultMessage="Follow Up Day"
    />
  }
  name="followupDay"
>
  <Input
    size="large"
    placeholder={intl.formatMessage({
      id: "COMMON.ENTER_FOLLOWUP_DAY",
      defaultMessage: "Enter follow up day..",
    })}
    readOnly={!isEditing}
    className="rounded-xl h-11 bg-[#F2F7FB] border border-[#E6ECF1]"
  />
</Form.Item>
        <Form.Item
          label={
            <FormattedMessage id="COMMON.ADDRESS" defaultMessage="Address" />
          }
          name="address"
         
        >
          <Input
            size="large"
            placeholder={intl.formatMessage({
              id: "COMMON.ENTER_ADDRESS",
              defaultMessage: "Enter your address",
            })}
            readOnly={!isEditing}
            className="rounded-xl h-11 bg-[#F2F7FB] border border-[#E6ECF1]"
          />
        </Form.Item>
      </div>

      <div
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        style={{
          opacity: isDataLoading ? 0.4 : 1,
          pointerEvents: isDataLoading ? "none" : "auto",
        }}
      >
        {renderLocationSelect(
          <FormattedMessage id="COMMON.COUNTRY" defaultMessage="Country" />,
          "country",
          countries,
          "country",
          loadCountries,
          (val, opt) => {
            form.setFieldsValue({
              country: { value: opt.value, label: opt.label, code: opt.code },
              state: null,
              city: null,
            });
            setStates([]);
            setCities([]);
            loadStates(opt.value);
          },
          
        )}
        {renderLocationSelect(
          <FormattedMessage id="COMMON.STATE" defaultMessage="State" />,
          "state",
          states,
          "state",
          () => loadStates(form.getFieldValue("country")?.value),
          (val, opt) => {
            form.setFieldsValue({
              state: { value: opt.value, label: opt.label },
              city: null,
            });
            setCities([]);
            loadCities(val);
          },
        )}
        {renderLocationSelect(
          <FormattedMessage id="COMMON.CITY" defaultMessage="City" />,
          "city",
          cities,
          "city",
          () => loadCities(form.getFieldValue("state")?.value),
          () => {},
        )}
      </div>

      <Form.Item
        label={
          <FormattedMessage id="COMMON.BIO" defaultMessage="Bio (optional)" />
        }
        name="bio"
        className="mb-9"
        style={{
          opacity: isDataLoading ? 0.4 : 1,
          pointerEvents: isDataLoading ? "none" : "auto",
        }}
      >
        <TextArea
          rows={4}
          readOnly={!isEditing}
          className="rounded-xl bg-[#F2F7FB] border border-[#E6ECF1]"
          placeholder={intl.formatMessage({
            id: "COMMON.ENTER_BIO",
            defaultMessage: "Enter your bio...",
          })}
        />
      </Form.Item>

      <button
        type="submit"
        style={{ display: "none" }}
        id="profile-form-submit"
        disabled={isSubmitting || isDataLoading}
      />
    </Form>
  );
};

export default ProfileForm;
