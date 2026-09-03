import { Fragment, useState, useEffect } from "react";
import { Input, Select, DatePicker, Button, message, Spin } from "antd";
import {
  EyeOutlined,
  DownloadOutlined,
  FileOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  PlusOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { Container } from "@/components/container";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import Swal from "sweetalert2";

import {
  deleteDownPayment,
  UpdateMemberById,
  GetALLMemberDetailsByID,
  fetchCountries,
  fetchStatesByCountry,
  fetchCitiesByState,
  GetAllPlans,
  Fetchmanager,
  DeleteAmc,
  GetExtraPayment,
} from "@/services/apiServices";
import { DeleteKyc, DeleteRefund } from "../../services/apiServices";

const SuperAdminMemberEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [updateResponse, setUpdateResponse] = useState(null);
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [plans, setPlans] = useState([]);
  const [managers, setManagers] = useState([]);
  const [amcDetails, setAmcDetails] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [selectedPlanDetails, setSelectedPlanDetails] = useState(null);
  const [extraPaymentOptions, setExtraPaymentOptions] = useState([]);
  const [tableData, setTableData] = useState([]);

  const [offers, setOffers] = useState([
    {
      id: "",
      offerId: "",
      // offerName: "",
      price: "",
      validityDate: "",
    },
  ]);
  const [remarks, setRemarks] = useState({
    managerReq: "",
    salesReq: "",
    managerFiles: [], // array for manager files
    salesFiles: [], // array for sales files
    callFiles: [], // array for call files if needed
  });

  const [planDetails, setPlanDetails] = useState({
    planId: "",
    price: "",
    basePrice: "",
    validDate: "",
    remarks: "",
  });
  const [userAmcs, setUserAmcs] = useState([
    {
      amcAmount: "",
      amcDate: "",
      amcRecivableAmount: "",
      amcRecivableDate: "",
      amcRemarks: "",
      amcType: "",
      status: "",
      file: null,
      existingDocPath: null,
    },
  ]);

  const [refundDetails, setRefundDetails] = useState([
    {
      amount: "",
      refundDate: "",
      refundDetails: "",
      refundPaymentMode: "",
      refundType: "",
      remarks: "",
      file: null,
      existingDocPath: null,
    },
  ]);
  const [memberDetails, setMemberDetails] = useState({
    firstName: "",
    lastName: "",
    contactNo: "",
    address: "",
    cityId: "",
    memberType: "",
    profile: "",
    planId: "",
    isFile: "true",
    preFix: "",
    reportingManagerId: "",
    SalesId: "",
    services: "",
    type: "",
    lang: "",
    softType:"",
     followupDay: "",
  });

  const [downPayments, setDownPayments] = useState([
    {
      paymentType: "",
      amount: "",
      paidAmount: "",
      payid: "",
      transactionDate: "",
      remarks: "",
      docPath: null,
      existingDocPath: null,
    },
  ]);

  const [kycDetails, setKycDetails] = useState([
    { kycType: "", kycNo: "", docPath: null, existingDocPath: null },
  ]);

  const [callFile, setCallFile] = useState(null);

  const FetchExtraPayments = () => {
    GetExtraPayment()
      .then((res) => {
        const payments = res?.data?.data?.["Extra Payment Details"];

        if (payments && Array.isArray(payments)) {
          // For Table
          const formattedTable = payments.map((payment, index) => ({
            sr_no: index + 1,
            id: payment.id,
            description: payment.description || "-",
            name: payment.name || "-",
            price: payment.price || 0,
          }));

          setTableData(formattedTable);

          // 🔥 For Dropdown - Include price in the option
          const formattedDropdown = payments.map((payment) => ({
            label: payment.name,
            value: payment.id,
            price: payment.price, // ✅ Add price here
          }));

          setExtraPaymentOptions(formattedDropdown);
        } else {
          setTableData([]);
          setExtraPaymentOptions([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching payments:", error);
        setTableData([]);
        setExtraPaymentOptions([]);
      });
  };
  useEffect(() => {
    FetchExtraPayments();
  }, []);

  const getFileNameFromUrl = (url) => {
    if (!url) return "";
    const parts = url.split("/");
    return parts[parts.length - 1];
  };

  const handleViewDocument = (url) => {
    window.open(url, "_blank");
  };

  const handleDownloadDocument = (url, fileName) => {
    if (!url) {
      message.warning("No document available");
      return;
    }

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName || "document";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    const initialize = async () => {
      await loadStatesForDefaultCountry();
      await loadPlans();
      await loadManagers();
      if (id) await fetchUserData();
    };

    initialize();
  }, [id]);

  const loadStatesForDefaultCountry = async () => {
    try {
      const response = await fetchStatesByCountry(1);
      if (response.data.success) {
        const stateOptions = response?.data?.data?.["state Details"].map(
          (state) => ({
            label: state.name,
            value: state.id,
          }),
        );
        setStates(stateOptions);
      }
    } catch (err) {
      console.error("Error loading states:", err);
    }
  };

  const loadCities = async (stateId) => {
    try {
      const response = await fetchCitiesByState(stateId);
      if (response.data.success) {
        const cityOptions = response?.data?.data?.["City Details"].map(
          (city) => ({
            label: city.name,
            value: city.id,
          }),
        );
        setCities(cityOptions);
        return cityOptions;
      }
      return [];
    } catch (err) {
      console.error("Error loading cities:", err);
      return [];
    }
  };

  const loadPlans = async () => {
    try {
      const response = await GetAllPlans();
      if (response.data.success) {
        const planOptions = response?.data?.data?.["Plan Details"].map(
          (plan) => ({
            label: plan.name,
            value: plan.id,
            price: plan.price,
            // basePrice: plan.description, // Assuming description holds base price
          }),
        );
        setPlans(planOptions);
      }
    } catch (err) {
      console.error("Error loading plans:", err);
    }
  };
  const loadManagers = async () => {
    try {
      const clientUserId = 1;
      const response = await Fetchmanager(clientUserId);
      if (response.data.success) {
        const managerOptions = response?.data?.data?.["userDetails"].map(
          (manager) => ({
            label: `${manager.firstName} ${manager.lastName}`,
            value: manager.id,
          }),
        );
        setManagers(managerOptions);
      }
    } catch (err) {
      console.error("Error loading managers:", err);
    }
  };

  const handleStateChange = (stateId) => {
    setSelectedState(stateId);
    setMemberDetails((prev) => ({ ...prev, cityId: "" }));
    setCities([]);
    if (stateId) {
      loadCities(stateId);
    }
  };

  const handleCityChange = (cityId) => {
    setMemberDetails((prev) => ({ ...prev, cityId }));
  };

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await GetALLMemberDetailsByID(id);

      if (response.data.success) {
        const users =
          response.data.data?.["User Details"] || response.data.data || [];
        const user = users.find((u) => u.id === parseInt(id));

        if (user) {
          if (user.stateId) {
            setSelectedState(user.stateId);
            const cities = await loadCities(user.stateId);
            const matchedCity = cities.find((c) => c.label === user.cityName);

            setMemberDetails((prev) => ({
              ...prev,

              cityId: matchedCity?.value || "",
            }));
          }
       

          setMemberDetails((prev) => ({
            ...prev,
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            contactNo: user.contactNo || "",
            address: user.address || "",
            memberType: user.memberType || "",
            profile: user.profile || "",
            planId: user.userPlan?.plan?.id || "",
            isFile: user.isFile || "true",
            preFix: user.preFix || "Mr.",
            reportingManagerId: user.reportingManagerId || "",
            SalesId: user.SalesId || "",
            services: user.services || "",
            type: user.type || "",
            uniqueCode: user.uniqueCode || "",
            lang: user.lang || "",  
            softType: user.softType || "",
           followupDay: user.followUpDay || ""
          }));
          // Remarks
          setRemarks({
            managerReq: user.managerReq || "",
            managerFile: null,
            salesReq: user.salesReq || "",
            salesFile: null,
          });
          if (user.userPlan?.plan) {
            const planData = {
              label: user.userPlan.plan.name,
              value: user.userPlan.plan.id,
              price: user.userPlan.plan.price,
            };

            setSelectedPlanDetails(planData);

            setPlanDetails({
              planId: user.userPlan.plan.id,
              basePrice: user.userPlan.planBaseAmount || "",
              price: user.userPlan.planAmount || "",
              validDate: user.userPlan.validDate
                ? user.userPlan.validDate.split("/").reverse().join("-")
                : "",
              remarks: user.userPlan.remarks || "",
            });

            setPlans((prev) => {
              const exists = prev.some(
                (p) => p.value === user.userPlan.plan.id,
              );
              if (!exists) {
                return [...prev, planData];
              }
              return prev;
            });
          }

          if (user.userDocument && user.userDocument.length > 0) {
            setKycDetails(
              user.userDocument.map((doc) => ({
                id: doc.id,
                kycType: doc.kycType || "",
                kycNo: doc.kycNo || "",
                docPath: null,
                existingDocPath: doc.docPath || null,
              })),
            );
          }

          if (user.downPayment && user.downPayment.length > 0) {
            setDownPayments(
              user.downPayment.map((dp) => ({
                id: dp.id,
                paymentType: dp.paymentType || "",
                amount: dp.amount || "",
                paidAmount: dp.paidAmount || "",
                payid: dp.payid || "",
                transactionDate: dp.transactionDateTime
                  ? dp.transactionDateTime
                      .split(" ")[0]
                      .split("/")
                      .reverse()
                      .join("-")
                  : "",
                remarks: dp.remarks || "",
                docPath: null,
                existingDocPath: dp.docPath || null,
              })),
            );
          }

          if (user.userAmc && user.userAmc.length > 0) {
            setUserAmcs(
              user.userAmc.map((amc) => ({
                id: amc.id,
                amcType: amc.amcType || "",
                amcAmount: amc.amcAmount || "",
                amcRemarks: amc.amcRemarks || "",
                amcDate: amc.amcDate
                  ? amc.amcDate.split("/").reverse().join("-")
                  : "",
                amcRecivableAmount: amc.amcRecivableAmount || "",
                amcRecivableDate: amc.amcRecivableDate
                  ? amc.amcRecivableDate.split("/").reverse().join("-")
                  : "",
                status: amc.status || "",
                file: null,
                existingDocPath: amc.file || null,
              })),
            );
          }

          if (user.refundDetails && user.refundDetails.length > 0) {
            setRefundDetails(
              user.refundDetails.map((refund) => ({
                id: refund.id,
                refundPaymentMode: refund.refundPaymentMode || "",
                amount: refund.amount || "",
                refundDate: refund.refundDate
                  ? refund.refundDate.split("/").reverse().join("-")
                  : "",
                remarks: refund.remarks || "",
                refundType: refund.refundType || "",
                refundDetails: refund.refundDetails || "",
                file: null,
                existingDocPath: refund.file || null,
              })),
            );
          }

          // ✅ User Offers (NEW)
          if (user.userOffers && user.userOffers.length > 0) {
            setOffers(
              user.userOffers.map((offer) => {
                let formattedDateTime = "";

                if (offer.offerExpireDate) {
                  const [datePart, timePart] = offer.offerExpireDate.split(" ");
                  const [day, month, year] = datePart.split("/");
                  const [hours, minutes] = timePart.split(":"); // only take first 2

                  formattedDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
                }

                return {
                  id: offer.id || "",
                  offerId: offer.offerId || "",
                  validityDate: formattedDateTime,
                };
              }),
            );
          } else {
            // Reset to default if no offers
            setOffers([
              {
                id: "",
                offerId: "",
                price: "",
                validityDate: "",
              },
            ]);
          }
        } else {
          message.error("User not found");
        }
      } else {
        message.error("Failed to fetch user data");
      }
    } catch (err) {
      console.error(err);
      message.error("Error fetching user data");
    } finally {
      setLoading(false);
    }
  };

  const handleMemberChange = (field, value) => {
    if (field === "planId") {
      const plan = plans.find((p) => p.value === value);
      if (plan) {
        setSelectedPlanDetails(plan);
        setPlanDetails((prev) => ({
          ...prev,
          planId: value,
          basePrice: plan.price || "", // Set base price from plan (read-only)
          price: plan.price || "", // Set initial editable price same as base
        }));
      }
    }
    setMemberDetails((prev) => ({ ...prev, [field]: value }));
  };
  const handlePlanDetailsChange = (field, value) => {
    setPlanDetails((prev) => ({ ...prev, [field]: value }));
  };
  const addDownPayment = () => {
    setDownPayments([
      ...downPayments,
      {
        paymentType: "",
        amount: "",
        payid: "",
        paidAmount: "",
        transactionDate: "",
        remarks: "",
        docPath: null,
        existingDocPath: null,
      },
    ]);
  };

  const removeDownPayment = (index) => {
    if (downPayments.length === 1)
      return message.warning("At least one entry is required!");
    setDownPayments(downPayments.filter((_, i) => i !== index));
  };

  const handleDownPaymentChange = (index, field, value) => {
    const updated = [...downPayments];
    updated[index][field] = value;
    setDownPayments(updated);
  };

  const handleDownPaymentFile = (index, file) => {
    const updated = [...downPayments];
    updated[index].docPath = file;
    setDownPayments(updated);
  };

  const addUserAmc = () => {
    setUserAmcs([
      ...userAmcs,
      {
        amcAmount: "",
        amcDate: "",
        amcRecivableAmount: "",
        amcRecivableDate: "",
        amcRemarks: "",
        amcType: "",
        status: "",
        file: null,
        existingDocPath: null,
      },
    ]);
  };

  const removeamcDetails = (index) => {
    if (userAmcs.length === 1)
      return message.warning("At least one entry is required!");
    setUserAmcs(userAmcs.filter((_, i) => i !== index));
  };

  const removeUserAmc = async (index, amcId) => {
    if (!amcId) {
      removeamcDetails(index);
      return;
    }

    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this Amc deletion!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel",
      });

      if (result.isConfirmed) {
        const response = await DeleteAmc(amcId);

        if (response?.data?.success) {
          message.success("Amc deleted successfully!");
          removeUserAmc(index);
          await fetchUserData();
        } else {
          message.error(response?.data?.msg || "Failed to delete amc.");
        }
      }
    } catch (error) {
      console.error("Error deleting amc:", error);
      message.error(
        error.response?.data?.msg || error.message || "Failed to delete amc.",
      );
    }
  };

  const handleUserAmcChange = (index, field, value) => {
    const updated = [...userAmcs];
    updated[index][field] = value;
    setUserAmcs(updated);
  };

  const handleUserAmcFile = (index, file) => {
    const updated = [...userAmcs];
    updated[index].file = file;
    setUserAmcs(updated);
  };

  const addRefund = () => {
    setRefundDetails([
      ...refundDetails,
      {
        amount: "",
        refundDate: "",
        refundDetails: "",
        refundPaymentMode: "",
        refundType: "",
        remarks: "",
        file: null,
        existingDocPath: null,
      },
    ]);
  };

  const removeRefund = async (index, refundId) => {
    if (!refundId) {
      removerefundDetails(index);
      return;
    }

    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this Refund deletion!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel",
      });

      if (result.isConfirmed) {
        const response = await DeleteRefund(refundId);

        if (response?.data?.success) {
          message.success("Refund deleted successfully!");
          removeRefund(index);
          await fetchUserData();
        } else {
          message.error(response?.data?.msg || "Failed to delete amc.");
        }
      }
    } catch (error) {
      console.error("Error deleting amc:", error);
      message.error(
        error.response?.data?.msg || error.message || "Failed to delete amc.",
      );
    }
  };

  const removerefundDetails = (index) => {
    if (refundDetails.length === 1)
      return message.warning("At least one entry is required!");
    setRefundDetails(refundDetails.filter((_, i) => i !== index));
  };

  const handleRefundChange = (index, field, value) => {
    const updated = [...refundDetails];
    updated[index][field] = value;
    setRefundDetails(updated);
  };

  const handleRefundFile = (index, file) => {
    const updated = [...refundDetails];
    updated[index].file = file;
    setRefundDetails(updated);
  };

  const convertDateFormat = (dateString) => {
    if (!dateString || dateString.trim() === "") return "";
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  const convertDateTimeLocalFormat = (dateTimeString) => {
    if (!dateTimeString || dateTimeString.trim() === "") return "";

    const [datePart, timePart] = dateTimeString.split("T");
    const [year, month, day] = datePart.split("-");
    const time = timePart || "00:00";
    const [hours24, minutes] = time.split(":");

    const hoursNum = parseInt(hours24, 10);
    const period = hoursNum >= 12 ? "PM" : "AM";
    const hours12 = hoursNum % 12 || 12;
    const formattedHours = String(hours12).padStart(2, "0");

    return `${day}/${month}/${year} ${formattedHours}:${minutes} ${period}`;
  };
  const handleKycChange = (index, field, value) => {
    const updated = [...kycDetails];
    updated[index][field] = value;
    setKycDetails(updated);
  };

  const handleKycFile = (index, file) => {
    const updated = [...kycDetails];
    updated[index].docPath = file;
    setKycDetails(updated);
  };

  const addKyc = () => {
    setKycDetails([
      ...kycDetails,
      { kycType: "", kycNo: "", docPath: null, existingDocPath: null },
    ]);
  };

  const removekycDetails = (index) => {
    if (kycDetails.length === 1)
      return message.warning("At least one entry is required!");
    setKycDetails(kycDetails.filter((_, i) => i !== index));
  };

  const removeKyc = async (index, kycId) => {
    if (!kycId) {
      removekycDetails(index);
      return;
    }

    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this Kyc deletion!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel",
      });

      if (result.isConfirmed) {
        const response = await DeleteKyc(kycId);

        if (response?.data?.success) {
          message.success("Kyc deleted successfully!");
          removeKyc(index);
          await fetchUserData();
        } else {
          message.error(
            response?.data?.msg || "Failed to delete down payment.",
          );
        }
      }
    } catch (error) {
      console.error("Error deleting down payment:", error);
      message.error(
        error.response?.data?.msg ||
          error.message ||
          "Failed to delete down payment.",
      );
    }
  };

  const handleDeleteDownPayment = async (index, paymentId) => {
    if (!paymentId) {
      removeDownPayment(index);
      return;
    }

    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this down payment deletion!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel",
      });

      if (result.isConfirmed) {
        const response = await deleteDownPayment(paymentId);

        if (response?.data?.success) {
          message.success("Down payment deleted successfully!");
          removeDownPayment(index);
          await fetchUserData();
        } else {
          message.error(
            response?.data?.msg || "Failed to delete down payment.",
          );
        }
      }
    } catch (error) {
      console.error("Error deleting down payment:", error);
      message.error(
        error.response?.data?.msg ||
          error.message ||
          "Failed to delete down payment.",
      );
    }
  };

  const handleRemarksChange = (field, value) => {
    setRemarks((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addOffer = () => {
    setOffers([
      ...offers,
      {
        id: "",
        offerId: "",
        // offerName: "",
        price: "",
        validityDate: "",
      },
    ]);
  };

  const removeOffer = (index) => {
    if (offers.length === 1)
      return message.warning("At least one entry is required!");
    setOffers(offers.filter((_, i) => i !== index));
  };

  const handleOfferChange = (index, field, value) => {
    const updated = [...offers];

    if (field === "offerId") {
      const selectedOffer = extraPaymentOptions.find(
        (opt) => opt.value === value,
      );
      if (selectedOffer) {
        updated[index].offerId = value;
        updated[index].offerName = selectedOffer.label;
        updated[index].price = selectedOffer.price || "";
      }
    } else {
      updated[index][field] = value;
    }

    setOffers(updated);
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!memberDetails.firstName || !memberDetails.lastName) {
      message.error("First name and last name are required!");
      return;
    }
    if (!memberDetails.cityId) {
      message.error("Please select a city!");
      return;
    }

    // Confirmation dialog
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You want to update this member's details?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, update it!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) {
      Swal.fire("Cancelled", "Update was cancelled", "info");
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();

      // Basic member details
      formData.append("userId", id);
      formData.append("firstName", memberDetails.firstName);
      formData.append("lastName", memberDetails.lastName);
      formData.append("contactNo", memberDetails.contactNo || "");
      formData.append("address", memberDetails.address || "");
      formData.append("cityId", memberDetails.cityId);
      formData.append("memberType", memberDetails.memberType || "");
      formData.append("profile", memberDetails.profile || "");
      formData.append("planId", memberDetails.planId || "");
      formData.append("preFix", memberDetails.preFix || "");
      formData.append("managerId", memberDetails.reportingManagerId || "");
      formData.append("SalesId", memberDetails.SalesId || "");
      formData.append("services", memberDetails.services || "");
      formData.append("type", memberDetails.type || "");
      formData.append("lang", memberDetails.lang || "");
      formData.append("softType", memberDetails.softType || "");
     formData.append("followupDay", memberDetails.followupDay || "");
      formData.append("managerReq", remarks.managerReq);
      formData.append("salesReq", remarks.salesReq);

      // Manager Files
      (remarks.managerFiles || []).forEach((file, i) => {
        formData.append(`files[${i}].file`, file);
        formData.append(`files[${i}].fileType`, "MANAGERFILE");
        formData.append(`files[${i}].fileId`, file.fileId || 0);
      });

      // Sales Files
      (remarks.salesFiles || []).forEach((file, i) => {
        const index = (remarks.managerFiles || []).length + i;
        formData.append(`files[${index}].file`, file);
        formData.append(`files[${index}].fileType`, "SALEFILE");
        formData.append(`files[${index}].fileId`, file.fileId || 0);
      });

      // Call Files
      (remarks.callFiles || []).forEach((file, i) => {
        const offset =
          (remarks.managerFiles || []).length +
          (remarks.salesFiles || []).length;
        formData.append(`files[${offset + i}].file`, file);
        formData.append(`files[${offset + i}].fileType`, "CALLFILE");
        formData.append(`files[${offset + i}].fileId`, file.fileId || 0);
      });

      // DownPayments
      downPayments
        .filter((p) => p.paymentType && p.amount)
        .forEach((p, i) => {
          formData.append(`userDownPayments[${i}].id`, p.id || 0);
          formData.append(`userDownPayments[${i}].paymentType`, p.paymentType);
          formData.append(`userDownPayments[${i}].amount`, p.amount);
          formData.append(
            `userDownPayments[${i}].paidAmount`,
            p.paidAmount || 0,
          );
          formData.append(`userDownPayments[${i}].payid`, p.payid || "");
          formData.append(
            `userDownPayments[${i}].transactionDate`,
            convertDateFormat(p.transactionDate),
          );
          formData.append(`userDownPayments[${i}].remarks`, p.remarks || "");
          if (p.docPath instanceof File)
            formData.append(`userDownPayments[${i}].docPath`, p.docPath);
        });

      // KYC
      kycDetails
        .filter((k) => k.kycType && k.kycNo)
        .forEach((k, i) => {
          formData.append(`userDocuments[${i}].id`, k.id || 0);
          formData.append(`userDocuments[${i}].kycType`, k.kycType);
          formData.append(`userDocuments[${i}].kycNo`, k.kycNo);
          if (k.docPath instanceof File)
            formData.append(`userDocuments[${i}].docPath`, k.docPath);
        });

      // AMC
      userAmcs
        .filter((a) => Number(a.amcAmount) > 0 || a.amcDate)
        .forEach((a, i) => {
          formData.append(`userAmcs[${i}].id`, a.id || 0);
          formData.append(`userAmcs[${i}].amcAmount`, a.amcAmount || 0);
          formData.append(
            `userAmcs[${i}].amcDate`,
            convertDateFormat(a.amcDate),
          );
          formData.append(
            `userAmcs[${i}].amcRecivableAmount`,
            a.amcRecivableAmount || 0,
          );
          formData.append(
            `userAmcs[${i}].amcRecivableDate`,
            convertDateFormat(a.amcRecivableDate),
          );
          formData.append(`userAmcs[${i}].amcRemarks`, a.amcRemarks || "");
          formData.append(`userAmcs[${i}].amcType`, a.amcType || "");
          formData.append(`userAmcs[${i}].status`, a.status || "");
          if (a.file instanceof File)
            formData.append(`userAmcs[${i}].file`, a.file);
        });

      // Refund Details
      refundDetails
        .filter((r) => Number(r.amount) > 0 || r.refundDate)
        .forEach((r, i) => {
          formData.append(`refundDetails[${i}].id`, r.id || 0);
          formData.append(`refundDetails[${i}].amount`, r.amount || 0);
          formData.append(
            `refundDetails[${i}].refundDate`,
            convertDateFormat(r.refundDate),
          );
          formData.append(
            `refundDetails[${i}].refundDetails`,
            r.refundDetails || "",
          );
          formData.append(
            `refundDetails[${i}].refundPaymentMode`,
            r.refundPaymentMode || "",
          );
          formData.append(`refundDetails[${i}].refundType`, r.refundType || "");
          formData.append(`refundDetails[${i}].remarks`, r.remarks || "");
          if (r.file instanceof File)
            formData.append(`refundDetails[${i}].file`, r.file);
        });

      // ✅ User Offers
      (offers || [])
        .filter((o) => o.offerId && o.validityDate)
        .forEach((o, i) => {
          formData.append(`userOffer[${i}].id`, o.id || -1);
          formData.append(`userOffer[${i}].offerId`, o.offerId);
          formData.append(
            `userOffer[${i}].offerExpireDate`,
            convertDateTimeLocalFormat(o.validityDate),
          );
        });

      if (planDetails.planId) {
        formData.append("planId", planDetails.planId);
        formData.append("planAmount", planDetails.price || 0); // Editable price
        formData.append("planBaseAmount", planDetails.basePrice || 0); // Read-only base amount
      }

      // Submit
      const response = await UpdateMemberById(id, formData);

      if (response?.data?.success || response?.status === 200) {
        await Swal.fire("Success!", "Member updated successfully!", "success");
        await fetchUserData();
      } else {
        await Swal.fire(
          "Error!",
          response?.data?.msg || "Update failed",
          "error",
        );
      }
    } catch (error) {
      console.error(error);
      await Swal.fire(
        "Error!",
        error?.response?.data?.msg || "Update failed",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <div className="flex justify-center items-center h-96">
          <Spin size="large" tip="Loading user data..." />
        </div>
      </Container>
    );
  }

  return (
    <Fragment>
      <Container>
        <div className="gap-2 mb-3">
          <Breadcrumbs items={[{ title: "Member Edit" }]} />
        </div>

        <div className="bg-white shadow rounded-md p-4 space-y-6">
          {/* MEMBER DETAILS */}
          <section className="border rounded-md">
            <div className="bg-gray-100 px-4 py-2 font-semibold text-gray-700 border-b">
              Member Details
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
              <div>
                <label className="block mb-1 text-sm">Unique Code *</label>
                <Input
                  value={memberDetails.uniqueCode}
                 disabled
                />
              </div>
              
              <div>
                <label className="block mb-1 text-sm">Prefix</label>
                <Select
                  value={memberDetails.preFix}
                  onChange={(v) => handleMemberChange("preFix", v)}
                  options={[
                    { label: "Mr.", value: "Mr." },
                    { label: "Mrs.", value: "Mrs." },
                    { label: "Ms.", value: "Ms." },
                  ]}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm">First Name *</label>
                <Input
                  value={memberDetails.firstName}
                  onChange={(e) =>
                    handleMemberChange("firstName", e.target.value)
                  }
                />
              </div>

              <div>
                <label className="block mb-1 text-sm">Last Name *</label>
                <Input
                  value={memberDetails.lastName}
                  onChange={(e) =>
                    handleMemberChange("lastName", e.target.value)
                  }
                />
              </div>

              <div>
                <label className="block mb-1 text-sm">Contact Number</label>
                <Input
                  value={memberDetails.contactNo}
                  onChange={(e) =>
                    handleMemberChange("contactNo", e.target.value)
                  }
                />
              </div>

              <div className="sm:col-span-2 md:col-span-2 lg:col-span-1">
                <label className="block mb-1 text-sm">Address</label>
                <Input
                  value={memberDetails.address}
                  onChange={(e) =>
                    handleMemberChange("address", e.target.value)
                  }
                />
              </div>

              <div>
                <label className="block mb-1 text-sm">State</label>
                <Select
                  value={selectedState}
                  onChange={handleStateChange}
                  options={states}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm">City *</label>
                <Select
                  value={memberDetails.cityId}
                  onChange={handleCityChange}
                  options={cities}
                  disabled={!selectedState}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm">Member Type</label>
                <Select
                  className="w-full"
                  value={memberDetails.memberType}
                  options={[
                    { label: "Normal", value: "Normal" },
                    { label: "Handle with care", value: "Handle with care" },
                  ]}
                  onChange={(v) => handleMemberChange("memberType", v)}
                />
              </div>
              <div>
                <label className="block mb-1 text-sm">Profile Type</label>
                <Select
                  className="w-full"
                  options={[
                    { label: "Lead", value: "Lead" },
                    { label: "Refrence", value: "Refrence" },
                  ]}
                  value={memberDetails.profile}
                  onChange={(v) => handleMemberChange("profile", v)}
                />
              </div>

              <div>
                <label className="block mb-1 text-sm">Services</label>
                <Select
                  className="w-full"
                  value={memberDetails.services}
                  onChange={(v) => handleMemberChange("services", v)}
                  placeholder="Select service"
                  options={[
                    { label: "Good", value: "Good" },
                    { label: "Average", value: "Average" },
                    { label: "Bad", value: "Bad" },
                  ]}
                />
              </div>

              <div>
                <label className="block mb-1 text-sm">Type</label>
                <Select
                  className="w-full"
                  value={memberDetails.type}
                  onChange={(v) => handleMemberChange("type", v)}
                  placeholder="Select type"
                  options={[
                    { label: "Member", value: "member" },
                    { label: "Demo", value: "demo" },
                    { label: "Lead", value: "lead" },
                  ]}
                />
              </div>

              <div>
  <label className="block mb-1 text-sm">Language</label>
  <Select
    className="w-full"
    value={memberDetails.lang}
    onChange={(v) => handleMemberChange("lang", v)}
    placeholder="Select language"
    options={[
      { label: "Gujarati", value: "Gujarati" },
      { label: "Tamil",    value: "Tamil"    },
      { label: "Telugu",   value: "Telugu"   },
      { label: "Malayalam",value: "Malayalam" },
      { label: "Marathi",  value: "Marathi"  },
    ]}
  />
</div>

<div>
  <label className="block mb-1 text-sm">Soft Type</label>
  <Select
    className="w-full"
    value={memberDetails.softType}
    onChange={(v) => handleMemberChange("softType", v)}
    placeholder="Select soft type"
    options={[
      { label: "Jcx", value: "jcx" },
      { label: "Jcx Pro", value: "jcxpro" },
    ]}
  />
</div>
<div>
  <label className="block mb-1 text-sm">Followup Day</label>
  <Input
    type="tel"
    value={memberDetails.followupDay}
    onChange={(e) => handleMemberChange("followupDay", e.target.value)}
    placeholder="Enter followup day"
  />
</div>
            </div>
          </section>
          {/* plandetai */}
          <section className="border rounded-md">
            <div className="flex justify-between items-center bg-gray-100 px-4 py-2 font-semibold text-gray-700 border-b">
              <span>Plan Details</span>
            </div>

            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* Plan */}
              <div>
                <label className="block mb-1 text-sm">Plan</label>
                <Select
                  value={planDetails.planId}
                  onChange={(v) => handleMemberChange("planId", v)}
                  options={plans}
                  className="w-full"
                />
              </div>

              {/* Base Amount (Read-only) */}

              {/* Price (Editable) */}
              <div>
                <label className="text-sm">Plan Amount</label>
                <Input
                  type="tel"
                  value={planDetails.price}
                  onChange={(e) =>
                    handlePlanDetailsChange("price", e.target.value)
                  }
                  placeholder="Enter plan price"
                  readOnly
                />
              </div>

              <div>
                <label className="text-sm">Plan Base Amount</label>
                <Input
                  type="tel"
                  value={planDetails.basePrice}
                  onChange={(e) =>
                    handlePlanDetailsChange("basePrice", e.target.value)
                  }
                  placeholder="Plan base amount"
                  className="bg-gray-50"
                />
              </div>
            </div>
          </section>
          {/* other */}
          <section className="border rounded-md">
            <div className="flex justify-between items-center bg-gray-100 px-4 py-2 font-semibold text-gray-700 border-b">
              <span>Other Details</span>
            </div>

            <div className="flex p-4 w-full gap-3">
              <div className="w-full md:w-1/2">
                <label className="block mb-1 text-sm">Sales </label>
                <Select
                  value={memberDetails.SalesId}
                  onChange={(v) => handleMemberChange("SalesId", v)}
                  options={managers}
                  className="w-full"
                />
              </div>
              <div className="w-full md:w-1/2">
                <label className="block mb-1 text-sm">Reporting Manager</label>
                <Select
                  value={memberDetails.reportingManagerId}
                  onChange={(v) => handleMemberChange("reportingManagerId", v)}
                  options={managers}
                  className="w-full"
                />
              </div>
            </div>
          </section>

          {/* offer */}
          <section className="border rounded-md">
            <div className="flex justify-between items-center bg-gray-100 px-4 py-2 font-semibold text-gray-700 border-b">
              <span>Offers</span>
              <Button
                icon={<PlusOutlined />}
                type="primary"
                size="small"
                onClick={addOffer}
              >
                Add New
              </Button>
            </div>

            {offers.map((row, index) => (
              <div
                key={index}
                className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 "
              >
                {/* Offer Name Dropdown */}
                <div>
                  <label className="block mb-1 text-sm font-medium">
                    Offer Name *
                  </label>
                  <Select
                    value={row.offerId}
                    onChange={(v) => handleOfferChange(index, "offerId", v)}
                    options={extraPaymentOptions}
                    placeholder="Select Offer"
                    className="w-full"
                    showSearch
                    filterOption={(input, option) =>
                      (option?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  />
                </div>

                {/* Validity Date */}
                {/* Validity Date */}
                <div>
                  <label className="block mb-1 text-sm font-medium">
                    Validity Date *
                  </label>
                  <Input
                    type="datetime-local" // ✅ Changed from "date" to "datetime-local"
                    value={row.validityDate}
                    onChange={(e) =>
                      handleOfferChange(index, "validityDate", e.target.value)
                    }
                  />
                </div>

                {/* Delete Button */}
                <div className="flex items-end justify-end sm:col-span-2 md:col-span-3 lg:col-span-4">
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => removeOffer(index)}
                  ></Button>
                </div>
              </div>
            ))}

            {offers.length === 0 && (
              <div className="p-4 text-center text-gray-500">
                No offers added. Click "Add New" to add an offer.
              </div>
            )}
          </section>
          {/* Remark */}
          <section className="border rounded-md">
            <div className="flex justify-between items-center bg-gray-100 px-4 py-2 font-semibold text-gray-700 border-b">
              <span>Remarks</span>
            </div>

            <div className="flex p-4 w-full gap-3">
              {/* Manager Remarks */}
              <div className="w-full md:w-1/2">
                <label className="block mb-1 text-sm">Manager Remarks</label>
                <textarea
                  rows={3}
                  className="textarea w-full mb-3"
                  placeholder="Add Remarks here"
                  value={remarks.managerReq}
                  onChange={(e) =>
                    handleRemarksChange("managerReq", e.target.value)
                  }
                />
                <Input
                  type="file"
                  multiple
                  onChange={(e) =>
                    handleRemarksChange("managerFiles", [
                      ...(remarks.managerFiles || []),
                      ...Array.from(e.target.files),
                    ])
                  }
                />
                {remarks.managerFiles?.map((file, index) => (
                  <span
                    key={index}
                    className="text-xs text-gray-500 mt-1 block"
                  >
                    {file.name}
                  </span>
                ))}
              </div>

              {/* Sales Remarks */}
              <div className="w-full md:w-1/2">
                <label className="block mb-1 text-sm">Sales Remarks</label>
                <textarea
                  rows={3}
                  className="textarea w-full mb-3"
                  placeholder="Add Remarks here"
                  value={remarks.salesReq}
                  onChange={(e) =>
                    handleRemarksChange("salesReq", e.target.value)
                  }
                />
                <Input
                  type="file"
                  multiple
                  onChange={(e) =>
                    handleRemarksChange("salesFiles", [
                      ...(remarks.salesFiles || []),
                      ...Array.from(e.target.files),
                    ])
                  }
                />
                {remarks.salesFiles?.map((file, index) => (
                  <span
                    key={index}
                    className="text-xs text-gray-500 mt-1 block"
                  >
                    {file.name}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* DOWN PAYMENT DETAILS */}
          <section className="border rounded-md">
            <div className="flex justify-between items-center bg-gray-100 px-4 py-2 font-semibold text-gray-700 border-b">
              <span>Down Payment Details</span>
              <Button
                icon={<PlusOutlined />}
                type="primary"
                size="small"
                onClick={addDownPayment}
              >
                Add New
              </Button>
            </div>

            {downPayments.map((row, index) => (
              <div
                key={index}
                className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
              >
                {/* Payment Type */}
                <div>
                  <label className="text-sm">Payment Type</label>
                  <Select
                    value={row.paymentType}
                    onChange={(v) =>
                      handleDownPaymentChange(index, "paymentType", v)
                    }
                    options={[
                      { label: "Cash", value: "cash" },
                      { label: "Cheque", value: "cheque" },
                      { label: "Online", value: "online" },
                      { label: "Other", value: "other" },
                    ]}
                    className="w-full"
                  />
                </div>

                {/* Amount */}
                <div>
                  <label className="text-sm">Amount</label>
                  <Input
                    type="tel"
                    value={row.amount}
                    onChange={(e) =>
                      handleDownPaymentChange(index, "amount", e.target.value)
                    }
                  />
                </div>

                {/* Paid Amount */}
                <div>
                  <label className="text-sm">Paid Amount</label>
                  <Input
                    type="tel"
                    value={row.paidAmount}
                    onChange={(e) =>
                      handleDownPaymentChange(
                        index,
                        "paidAmount",
                        e.target.value,
                      )
                    }
                  />
                </div>

                {/* Payment ID */}
                <div>
                  <label className="text-sm">Payment ID</label>
                  <Input
                    value={row.payid}
                    onChange={(e) =>
                      handleDownPaymentChange(index, "payid", e.target.value)
                    }
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="text-sm">Transaction Date</label>
                  <Input
                    type="date"
                    value={row.transactionDate}
                    onChange={(e) =>
                      handleDownPaymentChange(
                        index,
                        "transactionDate",
                        e.target.value,
                      )
                    }
                  />
                </div>

                {/* Remarks */}
                <div>
                  <label className="text-sm">Remarks</label>
                  <Input
                    value={row.remarks}
                    onChange={(e) =>
                      handleDownPaymentChange(index, "remarks", e.target.value)
                    }
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">
                    Document
                  </label>

                  {row.existingDocPath || row.docPath ? (
                    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                      <div className="flex items-center gap-2 p-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                        <div className="text-lg text-blue-600">📄</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {
                              row.docPath
                                ? row.docPath.name // ✅ Show new file name
                                : getFileNameFromUrl(row.existingDocPath) // Show existing file
                            }
                          </p>
                          <p className="text-xs text-gray-500">
                            {row.docPath
                              ? "Selected (not uploaded yet)"
                              : "Uploaded document"}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2 p-2 bg-gray-50">
                        {!row.docPath && row.existingDocPath && (
                          <Button
                            icon={<EyeOutlined />}
                            onClick={() =>
                              handleViewDocument(row.existingDocPath)
                            }
                            size="small"
                            className="flex-1"
                          >
                            View
                          </Button>
                        )}
                        {row.docPath && (
                          <span className="text-xs text-orange-600 px-2 py-1">
                            ⚠️ Save form to upload this file
                          </span>
                        )}
                      </div>

                      <label className="cursor-pointer block bg-white hover:bg-gray-50 transition-colors border-t border-gray-200">
                        <input
                          type="file"
                          onChange={(e) =>
                            handleDownPaymentFile(index, e.target.files[0])
                          }
                          className="hidden"
                        />
                        <div className="px-3 py-2 text-center">
                          <span className="text-xs text-blue-600 font-medium">
                            📎{" "}
                            {row.docPath ? "Change file" : "Replace document"}
                          </span>
                        </div>
                      </label>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors">
                      <label className="cursor-pointer block">
                        <input
                          type="file"
                          onChange={(e) =>
                            handleDownPaymentFile(index, e.target.files[0])
                          }
                          className="hidden"
                        />
                        <div className="p-4 text-center">
                          <div className="text-3xl text-gray-400 mb-2">📁</div>
                          <p className="text-sm text-gray-600 font-medium">
                            Click to upload document
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            PDF, PNG, JPG up to 10MB
                          </p>
                        </div>
                      </label>
                    </div>
                  )}
                </div>

                {/* Delete */}
                <div className="flex justify-end">
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeleteDownPayment(index, row.id)}
                  />
                </div>
              </div>
            ))}
          </section>

          {/* KYC SECTION */}
          <section className="border rounded-md">
            <div className="flex justify-between items-center bg-gray-100 px-4 py-2 font-semibold">
              KYC Information
              <Button
                icon={<PlusOutlined />}
                type="primary"
                size="small"
                onClick={addKyc}
              >
                Add New
              </Button>
            </div>

            <div className="p-4 space-y-4">
              {kycDetails.map((kyc, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4  "
                >
                  {/* KYC TYPE */}
                  <div>
                    <label className="text-sm">KYC Type</label>
                    <Select
                      value={kyc.kycType}
                      onChange={(v) => handleKycChange(index, "kycType", v)}
                      options={[
                        { label: "Aadhar", value: "aadhar" },
                        { label: "PAN", value: "pan" },
                        { label: "Passport", value: "passport" },
                        { label: "Voter ID", value: "voter_id" },
                      ]}
                      className="w-full"
                    />
                  </div>

                  {/* KYC NUMBER */}
                  <div>
                    <label className="text-sm">KYC Document Number</label>
                    <Input
                      value={kyc.kycNo}
                      onChange={(e) =>
                        handleKycChange(index, "kycNo", e.target.value)
                      }
                    />
                  </div>

                  {/* FILE with View */}
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">
                      Upload Document
                    </label>

                    {kyc.existingDocPath || kyc.docPath ? (
                      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                        <div className="flex items-center gap-2 p-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                          <div className="text-lg text-blue-600">📄</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">
                              {kyc.docPath
                                ? kyc.docPath.name
                                : getFileNameFromUrl(kyc.existingDocPath)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {kyc.docPath
                                ? "Selected (not uploaded yet)"
                                : "Uploaded document"}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2 p-2 bg-gray-50">
                          {!kyc.docPath && kyc.existingDocPath && (
                            <Button
                              icon={<EyeOutlined />}
                              onClick={() =>
                                handleViewDocument(kyc.existingDocPath)
                              }
                              size="small"
                              className="flex-1"
                            >
                              View
                            </Button>
                          )}
                          {kyc.docPath && (
                            <span className="text-xs text-orange-600 px-2 py-1">
                              ⚠️ Save form to upload this file
                            </span>
                          )}
                        </div>

                        <label className="cursor-pointer block bg-white hover:bg-gray-50 transition-colors border-t border-gray-200">
                          <input
                            type="file"
                            onChange={(e) =>
                              handleKycFile(index, e.target.files[0])
                            }
                            className="hidden"
                          />
                          <div className="px-3 py-2 text-center">
                            <span className="text-xs text-blue-600 font-medium">
                              📎{" "}
                              {kyc.docPath ? "Change file" : "Replace document"}
                            </span>
                          </div>
                        </label>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors">
                        <label className="cursor-pointer block">
                          <input
                            type="file"
                            onChange={(e) =>
                              handleKycFile(index, e.target.files[0])
                            }
                            className="hidden"
                          />
                          <div className="p-4 text-center">
                            <div className="text-3xl text-gray-400 mb-2">
                              📁
                            </div>
                            <p className="text-sm text-gray-600 font-medium">
                              Click to upload document
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              PDF, PNG, JPG up to 10MB
                            </p>
                          </div>
                        </label>
                      </div>
                    )}
                  </div>

                  {/* DELETE */}
                  <div className="flex justify-end">
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => removeKyc(index, kyc.id)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
          {/* AMC */}
          <section className="border rounded-md">
            <div className="flex justify-between items-center bg-gray-100 px-4 py-2 font-semibold text-gray-700 border-b">
              <span>AMC Details</span>
              <Button
                icon={<PlusOutlined />}
                type="primary"
                size="small"
                onClick={addUserAmc}
              >
                Add New
              </Button>
            </div>

            <div className="p-4 space-y-6">
              {userAmcs.map((row, index) => (
                <div
                  key={index}
                  className=" rounded grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                >
                  {/* AMC Type */}
                  <div>
                    <label className="block mb-1 text-sm font-medium">
                      AMC Type
                    </label>
                    <Select
                      value={row.amcType}
                      onChange={(v) => handleUserAmcChange(index, "amcType", v)}
                      options={[
                        { label: "Cash", value: "cash" },
                        { label: "Cheque", value: "cheque" },
                        { label: "Online", value: "online" },
                        { label: "Other", value: "other" },
                      ]}
                      className="w-full"
                    />
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="block mb-1 text-sm font-medium">
                      Amount
                    </label>
                    <Input
                      type="tel"
                      value={row.amcAmount}
                      onChange={(e) =>
                        handleUserAmcChange(index, "amcAmount", e.target.value)
                      }
                    />
                  </div>

                  {/* AMC Date */}
                  <div>
                    <label className="block mb-1 text-sm font-medium">
                      AMC Date
                    </label>
                    <Input
                      type="date"
                      value={row.amcDate}
                      onChange={(e) =>
                        handleUserAmcChange(index, "amcDate", e.target.value)
                      }
                    />
                  </div>

                  {/* Receivable Amount */}
                  <div>
                    <label className="block mb-1 text-sm font-medium">
                      Receivable Amount
                    </label>
                    <Input
                      type="tel"
                      value={row.amcRecivableAmount}
                      onChange={(e) =>
                        handleUserAmcChange(
                          index,
                          "amcRecivableAmount",
                          e.target.value,
                        )
                      }
                    />
                  </div>

                  {/* Receivable Date */}
                  <div>
                    <label className="block mb-1 text-sm font-medium">
                      Receivable Date
                    </label>
                    <Input
                      type="date"
                      value={row.amcRecivableDate}
                      onChange={(e) =>
                        handleUserAmcChange(
                          index,
                          "amcRecivableDate",
                          e.target.value,
                        )
                      }
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block mb-1 text-sm font-medium">
                      Status
                    </label>
                    <Select
                      value={row.status}
                      onChange={(v) => handleUserAmcChange(index, "status", v)}
                      options={[
                        { label: "Pending", value: "pending" },
                        { label: "Completed", value: "completed" },
                        { label: "Cancelled", value: "cancelled" },
                      ]}
                      className="w-full"
                    />
                  </div>

                  {/* Remarks */}
                  <div>
                    <label className="block mb-1 text-sm font-medium">
                      Remarks
                    </label>
                    <Input
                      value={row.amcRemarks}
                      onChange={(e) =>
                        handleUserAmcChange(index, "amcRemarks", e.target.value)
                      }
                    />
                  </div>

                  {/* Upload Document with View */}
                  <div className="flex flex-col">
                    <label className="block mb-1 text-sm font-medium">
                      Upload Document
                    </label>

                    {row.existingDocPath || row.file ? (
                      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                        <div className="flex items-center gap-2 p-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                          <div className="text-lg text-blue-600">📄</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">
                              {row.file
                                ? row.file.name
                                : getFileNameFromUrl(row.existingDocPath)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {row.file
                                ? "Selected (not uploaded yet)"
                                : "Uploaded document"}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2 p-2 bg-gray-50">
                          {!row.file && row.existingDocPath && (
                            <Button
                              icon={<EyeOutlined />}
                              onClick={() =>
                                handleViewDocument(row.existingDocPath)
                              }
                              size="small"
                              className="flex-1"
                            >
                              View
                            </Button>
                          )}
                          {row.file && (
                            <span className="text-xs text-orange-600 px-2 py-1">
                              ⚠️ Save form to upload this file
                            </span>
                          )}
                        </div>

                        <label className="cursor-pointer block bg-white hover:bg-gray-50 transition-colors border-t border-gray-200">
                          <input
                            type="file"
                            onChange={(e) =>
                              handleUserAmcFile(index, e.target.files[0])
                            }
                            className="hidden"
                          />
                          <div className="px-3 py-2 text-center">
                            <span className="text-xs text-blue-600 font-medium">
                              📎 {row.file ? "Change file" : "Replace document"}
                            </span>
                          </div>
                        </label>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors">
                        <label className="cursor-pointer block">
                          <input
                            type="file"
                            onChange={(e) =>
                              handleUserAmcFile(index, e.target.files[0])
                            }
                            className="hidden"
                          />
                          <div className="p-4 text-center">
                            <div className="text-3xl text-gray-400 mb-2">
                              📁
                            </div>
                            <p className="text-sm text-gray-600 font-medium">
                              Click to upload document
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              PDF, PNG, JPG up to 10MB
                            </p>
                          </div>
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Delete Button */}
                  <div className="sm:col-span-2 md:col-span-3 lg:col-span-4 flex justify-end mt-3">
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => removeUserAmc(index, row.id)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
          {/* refund */}
          <section className="border rounded-md">
            <div className="flex justify-between items-center bg-gray-100 px-4 py-2 font-semibold text-gray-700 border-b">
              <span>Refund Details</span>
              <Button
                icon={<PlusOutlined />}
                type="primary"
                size="small"
                onClick={addRefund} // ✅ Correct function
              >
                Add New
              </Button>
            </div>

            <div className="p-4 space-y-6">
              {refundDetails.map(
                (
                  row,
                  index, // ✅ Correct array
                ) => (
                  <div
                    key={index}
                    className="rounded grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                  >
                    {/* Refund Type */}
                    <div>
                      <label className="block mb-1 text-sm font-medium">
                        Refund Type
                      </label>
                      <Select
                        value={row.refundType}
                        onChange={(v) =>
                          handleRefundChange(index, "refundType", v)
                        }
                        options={[
                          { label: "Full Refund", value: "full" },
                          { label: "Partial Refund", value: "partial" },
                          { label: "Cancellation", value: "cancellation" },
                        ]}
                        className="w-full"
                      />
                    </div>

                    {/* Amount */}
                    <div>
                      <label className="block mb-1 text-sm font-medium">
                        Amount
                      </label>
                      <Input
                        type="tel"
                        value={row.amount}
                        onChange={(e) =>
                          handleRefundChange(index, "amount", e.target.value)
                        }
                      />
                    </div>

                    {/* Refund Date */}
                    <div>
                      <label className="block mb-1 text-sm font-medium">
                        Refund Date
                      </label>
                      <Input
                        type="date"
                        value={row.refundDate}
                        onChange={(e) =>
                          handleRefundChange(
                            index,
                            "refundDate",
                            e.target.value,
                          )
                        }
                      />
                    </div>

                    {/* Refund Payment Mode */}
                    <div>
                      <label className="block mb-1 text-sm font-medium">
                        Refund Payment Mode
                      </label>
                      <Select
                        value={row.refundPaymentMode}
                        onChange={(v) =>
                          handleRefundChange(index, "refundPaymentMode", v)
                        }
                        options={[
                          { label: "Cash", value: "cash" },
                          { label: "Cheque", value: "cheque" },
                          { label: "Online Transfer", value: "online" },
                          { label: "Bank Transfer", value: "bank_transfer" },
                        ]}
                        className="w-full"
                      />
                    </div>

                    {/* Refund Details */}
                    <div>
                      <label className="block mb-1 text-sm font-medium">
                        Refund Details
                      </label>
                      <Input
                        value={row.refundDetails}
                        onChange={(e) =>
                          handleRefundChange(
                            index,
                            "refundDetails",
                            e.target.value,
                          )
                        }
                        placeholder="Enter refund details"
                      />
                    </div>

                    {/* Remarks */}
                    <div>
                      <label className="block mb-1 text-sm font-medium">
                        Remarks
                      </label>
                      <Input
                        value={row.remarks}
                        onChange={(e) =>
                          handleRefundChange(index, "remarks", e.target.value)
                        }
                        placeholder="Additional remarks"
                      />
                    </div>

                    {/* Upload Document with View */}
                    <div className="flex flex-col">
                      <label className="block mb-1 text-sm font-medium">
                        Upload Document
                      </label>

                      {row.existingDocPath || row.file ? (
                        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                          <div className="flex items-center gap-2 p-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                            <div className="text-lg text-blue-600">📄</div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">
                                {row.file
                                  ? row.file.name
                                  : getFileNameFromUrl(row.existingDocPath)}
                              </p>
                              <p className="text-xs text-gray-500">
                                {row.file
                                  ? "Selected (not uploaded yet)"
                                  : "Uploaded document"}
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-2 p-2 bg-gray-50">
                            {!row.file && row.existingDocPath && (
                              <Button
                                icon={<EyeOutlined />}
                                onClick={() =>
                                  handleViewDocument(row.existingDocPath)
                                }
                                size="small"
                                className="flex-1"
                              >
                                View
                              </Button>
                            )}
                            {row.file && (
                              <span className="text-xs text-orange-600 px-2 py-1">
                                ⚠️ Save form to upload this file
                              </span>
                            )}
                          </div>

                          <label className="cursor-pointer block bg-white hover:bg-gray-50 transition-colors border-t border-gray-200">
                            <input
                              type="file"
                              onChange={(e) =>
                                handleRefundFile(index, e.target.files[0])
                              }
                              className="hidden"
                            />
                            <div className="px-3 py-2 text-center">
                              <span className="text-xs text-blue-600 font-medium">
                                📎{" "}
                                {row.file ? "Change file" : "Replace document"}
                              </span>
                            </div>
                          </label>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors">
                          <label className="cursor-pointer block">
                            <input
                              type="file"
                              onChange={(e) =>
                                handleRefundFile(index, e.target.files[0])
                              }
                              className="hidden"
                            />
                            <div className="p-4 text-center">
                              <div className="text-3xl text-gray-400 mb-2">
                                📁
                              </div>
                              <p className="text-sm text-gray-600 font-medium">
                                Click to upload document
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                PDF, PNG, JPG up to 10MB
                              </p>
                            </div>
                          </label>
                        </div>
                      )}
                    </div>

                    {/* Delete Button */}
                    <div className="sm:col-span-2 md:col-span-3 lg:col-span-4 flex justify-end mt-3">
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => removeRefund(index, row.id)}
                      />
                    </div>
                  </div>
                ),
              )}
            </div>
          </section>

          {/* CALL FILE */}
          <section className="border rounded-md ">
            <div className="flex justify-between items-center bg-gray-100 px-4 py-2 font-semibold text-gray-700 border-b">
              <span>Import Call File</span>
            </div>
            <div className="p-3">
              <Input
                className="p-3"
                type="file"
                onChange={(e) => setCallFile(e.target.files[0])}
              />
            </div>
          </section>

          {/* FOOTER BUTTONS */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
            <Button type="primary" onClick={handleSubmit} loading={submitting}>
              Update
            </Button>
            <Button onClick={() => navigate(-1)}>Cancel</Button>
          </div>
        </div>
      </Container>
    </Fragment>
  );
};

export default SuperAdminMemberEdit;
