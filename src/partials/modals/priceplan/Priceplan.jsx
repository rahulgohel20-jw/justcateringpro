import { useEffect, useState } from "react";
import { Spin } from "antd";
import { Check, FlameIcon, LucideAward, ThumbsUp } from "lucide-react";

// Import your actual API services
import { toAbsoluteUrl } from "@/utils";
import {
  GetAllPlans,
  AddUserPlan,
  CreatePaymentOrder,
  FetchAllUser,
  GetPlansByBillingCycle,
  GetCoupons,
  GetExtraPayment,
} from "@/services/apiServices";
import { useAutoTranslation } from "../../../utils/useAutoTranslation";
import PaymentSuccess from "../successmodal/paymentsuccess";
import Swal from "sweetalert2";
import { useLanguage } from "@/i18n";
import ThemeModal from "./ThemeModal";

const parseJwt = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Invalid token while parsing JWT:", e);
    return null;
  }
};

const Priceplan = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [translatedPlans, setTranslatedPlans] = useState([]);
  const { language } = useLanguage();
  const { translate } = useAutoTranslation(language);

  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [underVerification, setUnderVerification] = useState(false);
  const [labels, setLabels] = useState({
    quarterly: "Quarterly",
    annually: "Annually",
  });

  const [activeCycle, setActiveCycle] = useState("Quarterly");
  const [paymentData, setPaymentData] = useState({
    amount: 0,
    transactionId: "",
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [couponCode, setCouponCode] = useState("FIRST50");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [extraPayments, setExtraPayments] = useState([]);
  const [selectedExtraPayments, setSelectedExtraPayments] = useState({});
  const [themeModalOpen, setThemeModalOpen] = useState(false);
  const [couponsLoaded, setCouponsLoaded] = useState(false);
  const [approvalChecked, setApprovalChecked] = useState(false);

 
  const [cgstRate, setCgstRate] = useState(0); 
  const [sgstRate, setSgstRate] = useState(0); 

  const stored =
    typeof window !== "undefined" ? localStorage.getItem("userToken") : null;
  const token = stored;
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    if (!token) return;
    const decoded = parseJwt(token);

    const idFromToken = decoded?.userId ?? decoded?.userId ?? decoded?.userId;
    if (idFromToken) {
      setUserId(idFromToken);
    } else if (stored?.id) {
      setUserId(stored.id);
    }
  }, [token]);

  useEffect(() => {
    if (!userId) return;
    const fetchUserDetails = async () => {
      try {
        const res = await FetchAllUser(userId);
        const fetched = res?.data?.data?.userDetails?.UserDetails?.[0] ?? null;

        if (fetched) {
          
          setUser(fetched);
          if (!approvalChecked && fetched.isApprove === false) {
            setUnderVerification(true);
            setModalOpen(true);
            setApprovalChecked(true);
          }
        } else {
          console.warn("FetchAllUser returned no data:", res);
        }
      } catch (err) {
        console.error("Error fetching user details:", err);
      }
    };
    fetchUserDetails();
  }, [userId]);

  useEffect(() => {
    const loadLabels = async () => {
      setLabels({
        quarterly: await translate("Quarterly"),
        annually: await translate("Annually"),
      });
    };
    loadLabels();
  }, [language]);

  useEffect(() => {
    if (!activeCycle) return;
    setTranslatedPlans([]);
    fetchPlans();
  }, [activeCycle, language]);

  useEffect(() => {
    fetchExtraPayments();
  }, []);

  // Auto-apply FIRST50 coupon on component mount
  useEffect(() => {
    const autoApplyCoupon = async () => {
      try {
        const res = await GetCoupons();
        const coupons = res?.data?.data || [];
        setCouponsLoaded(true);

        const first50Coupon = coupons.find(
          (c) => c.coupenCode?.toUpperCase() === "FIRST50",
        );

        if (first50Coupon) {
          const today = new Date();
          const expiryDate = first50Coupon.expireDate
            ? parseDate(first50Coupon.expireDate)
            : null;

          const isExpired = expiryDate && today > expiryDate;
          const isLimitReached =
            first50Coupon.maxUser &&
            first50Coupon.usedCount >= first50Coupon.maxUser;

          if (!isExpired && !isLimitReached) {
            setAppliedCoupon(first50Coupon);
            
          } else {
            
            setCouponCode("");
          }
        } else {
          
          setCouponCode("");
        }
      } catch (error) {
        console.error("Error auto-applying FIRST50 coupon:", error);
        setCouponsLoaded(true);
      }
    };

    autoApplyCoupon();
  }, []);

  const fetchExtraPayments = async () => {
    try {
      const res = await GetExtraPayment();
      const payments = res?.data?.data?.["Extra Payment Details"] || [];
      const paymentsArray = Array.isArray(payments) ? payments : [];
      setExtraPayments(paymentsArray);

      const defaultSelected = {};
      paymentsArray.forEach((payment) => {
        if (!payment.isDelete) {
          defaultSelected[payment.id] = true;
        }
      });
      setSelectedExtraPayments(defaultSelected);
    } catch (error) {
      console.error("Error fetching extra payments:", error);
      setExtraPayments([]);
    }
  };

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await GetAllPlans();
      const result = res?.data?.data?.["Plan Details"] || [];

      const langPlans = await Promise.all(
        result.map(async (p) => ({
          ...p,
          originalName: p.name,
          name: await translate(p.name),
          originalDescription: p.description,
          description: await translate(p.description),
          originalBillingCycle: p.billingCycle,
          billingCycle: await translate(p.billingCycle),
          features: await Promise.all(
            p.features?.map(async (f) => ({
              ...f,
              originalFeatureText: f.featureText,
              featureText: await translate(f.featureText),
            })),
          ),
        })),
      );

      setTranslatedPlans(langPlans);
    } catch (error) {
      console.error("Error fetching plans:", error);
      setTranslatedPlans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!translatedPlans.length) return;

    const defaultPlan =
      translatedPlans.find((p) => p.isPopular) || translatedPlans[0];

    setSelectedPlan(defaultPlan);
  }, [translatedPlans]);

  const orderedPlans = (() => {
    if (!translatedPlans.length) return [];
    const popular = translatedPlans.filter((p) => p.isPopular);
    const others = translatedPlans.filter((p) => !p.isPopular);
    if (popular.length === 0) return translatedPlans;
    if (others.length === 2) {
      return [others[0], popular[0], others[1]];
    }
    return [...others, ...popular];
  })();

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Coupon",
        text: "Please enter a coupon code",
      });
      return;
    }

    try {
      const res = await GetCoupons();
      const coupons = res?.data?.data || [];

      const validCoupon = coupons.find(
        (c) => c.coupenCode?.toLowerCase() === couponCode.toLowerCase(),
      );

      if (!validCoupon) {
        Swal.fire({
          icon: "error",
          title: "Invalid Coupon",
          text: "The coupon code you entered is not valid",
        });
        return;
      }

      const today = new Date();
      const expiryDate = validCoupon.expireDate
        ? parseDate(validCoupon.expireDate)
        : null;

      if (expiryDate && today > expiryDate) {
        Swal.fire({
          icon: "error",
          title: "Expired Coupon",
          text: "This coupon has expired",
        });
        return;
      }

      if (validCoupon.maxUser && validCoupon.usedCount >= validCoupon.maxUser) {
        Swal.fire({
          icon: "error",
          title: "Coupon Limit Reached",
          text: "This coupon has reached its maximum usage limit",
        });
        return;
      }

      setAppliedCoupon(validCoupon);
      Swal.fire({
        icon: "success",
        title: "Coupon Applied!",
        text: `You saved ₹${validCoupon.price}`,
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error applying coupon:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to apply coupon. Please try again.",
      });
    }
  };

  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    const parts = dateStr.split("/");
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return new Date(year, month - 1, day);
    }
    return null;
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
  };

  const handlePayment = async (plan, customAmount = null) => {
    setSelectedPlan(plan);

    if (!userId) {
      Swal.fire({
        icon: "warning",
        title: "User not loaded",
        text: "Please wait while we fetch your details.",
      });
      return;
    }

    try {
      // Use the final total with GST included
      const amountToCharge = Math.max(
  customAmount !== null ? customAmount : finalTotalWithGST,
  1,
);
      // Calculate GST amounts from the amount to charge
     const totalGSTRate = cgstRate + sgstRate;
const baseAmount = amountToCharge / (1 + totalGSTRate / 100);
const cgstAmount = (baseAmount * cgstRate) / 100;
const sgstAmount = (baseAmount * sgstRate) / 100;

      // Get selected extra payment IDs that are toggled ON
      const selectedExtraPaymentIds = activeExtraPayments
        .filter((ep) => selectedExtraPayments[ep.id] === true)
        .map((ep) => ep.id);

      // Determine extraPayId value
      let extraPayIdValue = 0;
      if (selectedExtraPaymentIds.length > 0) {
        extraPayIdValue =
          selectedExtraPaymentIds.length === 1
            ? selectedExtraPaymentIds[0]
            : selectedExtraPaymentIds.join(",");
      }

      const orderPayload = {
        planId: plan.id,
        userId: userId,
        finalTotal: parseFloat(amountToCharge.toFixed(2)) ,
        cgst: `${cgstRate}%`,
        cgstAmt: parseFloat(cgstAmount.toFixed(2)),
        sgst: `${sgstRate}%`,
        sgstAmt: parseFloat(sgstAmount.toFixed(2)),
        coupenId: appliedCoupon?.id || 0,
        extraPayId: extraPayIdValue,
        paymentData: null,
      };

      const res = await CreatePaymentOrder(orderPayload);
      const backendOrder = res.data?.data;
      const orderId =
        typeof backendOrder === "string"
          ? backendOrder
          : backendOrder?.orderId || backendOrder?.paymentorderid;

      if (!orderId) {
        Swal.fire({
          icon: "error",
          title: "Order Creation Failed",
          text: "Could not create Razorpay order. Please try again.",
        });
        return;
      }

      const razorpayKey = "rzp_live_S5dgGJ3fEPa3fO";

      const options = {
        key: razorpayKey,
        amount: Math.round(amountToCharge * 100),
        currency: "INR",
        name: "Automate Business",
        description: `${plan.name} Plan Purchase`,
        order_id: orderId,
        handler: async function (response) {
          const paymentPayload = {
            planId: plan.id,
            userId: userId,
            finalTotal: parseFloat(amountToCharge.toFixed(2)),
            cgst: `${cgstRate}%`,
            cgstAmt: parseFloat(cgstAmount.toFixed(2)),
            sgst: `${sgstRate}%`,
            sgstAmt: parseFloat(sgstAmount.toFixed(2)),
            coupenId: appliedCoupon?.id || 0,
            extraPayId: extraPayIdValue,
            paymentData: {
              payid: response.razorpay_payment_id,
              paymentdone: true,
              paymentorderid: response.razorpay_order_id,
              paymentresponse: JSON.stringify(response),
              paysignature: response.razorpay_signature,
            },
          };

          try {
            await AddUserPlan(paymentPayload);

            setPaymentData({
              amount: amountToCharge,
              transactionId: response.razorpay_payment_id,
            });
            setUnderVerification(true);
            setModalOpen(true);

            try {
              const refresh = await FetchAllUser(userId);
              const refreshedUser =
                refresh?.data?.data ?? refresh?.data ?? null;
              if (refreshedUser) setUser(refreshedUser);
            } catch (err) {
              console.warn("Could not refresh user after payment:", err);
            }
          } catch (err) {
            console.error("Plan activation error:", err);
            Swal.fire({
              icon: "error",
              title: "Activation Failed",
              text:
                err.response?.data?.message ||
                "Payment completed but failed to activate plan. Please contact support.",
            });
          }
        },
        prefill: {
          name:
            `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() ||
            "Guest",
          email: user?.email ?? stored?.email ?? "test@example.com",
          contact: user?.contactNo ?? "9999999999",
        },
        theme: {
          color: "#3399cc",
        },
        modal: {
          ondismiss: function () {
            console.log("Payment modal dismissed by user");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

      rzp.on("payment.failed", function (response) {
        console.error("Payment failed:", response.error);
        Swal.fire({
          icon: "error",
          title: "Payment Failed",
          text:
            response.error?.description ||
            "Something went wrong. Please try again.",
        });
      });
    } catch (error) {
      console.error("Payment initiation error:", error);
      Swal.fire({
        icon: "error",
        title: "Unexpected Error",
        text:
          error.response?.data?.message ||
          "Something went wrong while initiating payment. Please try again.",
      });
    }
  };

  const userHasPlan = !!user?.plan;
  const displayedFeatures = selectedPlan?.features || [];

  const planPrice = selectedPlan?.price || 1;

  const activeExtraPayments = Array.isArray(extraPayments)
    ? extraPayments.filter((ep) => !ep.isDelete)
    : [];

  const couponDiscount = appliedCoupon?.price || 0;

  const extraPaymentsTotal = activeExtraPayments
    .filter((ep) => selectedExtraPayments[ep.id])
    .reduce((sum, ep) => sum + (ep.price || 0), 0);

  const subtotal = planPrice + extraPaymentsTotal;

const amountAfterDiscount = Math.max(subtotal - couponDiscount, 0);
  const totalGSTRate = cgstRate + sgstRate;
  // const cgstAmount = (amountAfterDiscount * cgstRate) / 100;
  // const sgstAmount = (amountAfterDiscount * sgstRate) / 100;

const cgstAmount = 0;
const sgstAmount = 0;
  const totalGSTAmount = cgstAmount + sgstAmount;

  // const finalTotalWithGST = amountAfterDiscount + totalGSTAmount ;
const finalTotalWithGST = amountAfterDiscount ;
  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
  };

  const handleExtraPaymentToggle = (paymentId) => {
    setSelectedExtraPayments((prev) => ({
      ...prev,
      [paymentId]: !prev[paymentId],
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Choose Your Right Plan
          </h1>
          <p className="text-gray-600">
            Select from the best plans, ensuring a perfect match for your
            catering business
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Features */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 shadow-sm sticky top-4">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Features Included
              </h3>
              <ul className="space-y-3">
                {displayedFeatures.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-green-100 rounded flex items-center justify-center">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-sm text-gray-700">
                      {feature.featureText}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Content - Plans & Payment */}
          <div className="lg:col-span-2 space-y-6">
            {loading ? (
              <div className="flex justify-center py-20">
                <Spin size="large" />
              </div>
            ) : (
              <>
                {/* Plans Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                  {orderedPlans
                    .filter((plan) => plan.id !== 5)
                    .map((plan) => {
                      const isPopular = plan.isPopular;
                      const disabledBecauseSamePlan =
                        user?.plan?.id === plan.id;

                      const displayPrice = planPrice + extraPaymentsTotal;

                      return (
                        <div key={plan.id} className="relative">
                          {isPopular && (
                            <div className="w-auto absolute -top-5 left-2/3 -translate-x-1/7 z-1 text-lg">
                              <div className="flex gap-1 justify-center align-center bg-green-700 text-white text-xs px-3 py-2 rounded-full font-medium shadow-md border-2 border-green-600">
                                <LucideAward className="text-white font-bold" />{" "}
                                <p className="flex align-center mt-1">
                                  Best choice
                                </p>
                              </div>
                            </div>
                          )}

                          <div
                            className={`relative rounded-2xl p-8 cursor-pointer shadow-xl ${
                              isPopular
                                ? "bg-white text-gray-900"
                                : "bg-white text-gray-900 border border-gray-200"
                            } ${selectedPlan?.id === plan.id && isPopular ? "ring-4 ring-green-800" : "border-2 border-gray-400"} ${selectedPlan?.id === plan.id ? "ring-4 ring-blue-600" : ""}`}
                            onClick={() => handlePlanSelect(plan)}
                          >
                            <h3 className="text-base font-semibold mb-4">
                              {plan.billingCycle} Plan
                            </h3>

                            {/* <div
                              className={`text-3xl font-bold mb-1 ${isPopular ? "text-gray-900" : "text-gray-900"} line-through`}
                            >
                              {(plan.billingCycle === "Quarterly"
                                ? 35000
                                : 50000
                              ).toLocaleString("en-IN")}
                            </div> */}

                            <div className="text-6xl font-bold mb-2">
                              ₹
                              {(selectedPlan?.id === plan.id
                                ? displayPrice
                                : plan.price
                              ).toLocaleString("en-IN")}
                              /-
                            </div>

                            {/* <div className="flex items-center justify-between mb-6">
                              <span
                                className={`text-lg font-semibold ${isPopular ? "text-gray-900" : "text-gray-700"}`}
                              >
                                ₹ 9000/- AMC
                              </span>
                              <div
                                className={`text-right ${isPopular ? "text-gray/90" : "text-gray-600"}`}
                              >
                                <div className="text-xs font-medium">
                                  {isPopular ? "Annually" : "Per 3 month"}
                                </div>
                                <div className="text-xs">
                                  For Next Year On-ward
                                </div>
                              </div>
                            </div> */}

                            {/* <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePayment(
                                  plan,
                                  selectedPlan?.id === plan.id
                                    ? finalTotalWithGST
                                    : plan.price,
                                );
                              }}
                              disabled={!userId || disabledBecauseSamePlan}
                              className={`w-full py-3 rounded-full font-semibold transition-all text-sm ${
                                isPopular
                                  ? "bg-white text-gray-900 hover:bg-gray-50"
                                  : "border-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                              } ${!userId || disabledBecauseSamePlan ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                              {disabledBecauseSamePlan
                                ? "Current Plan"
                                : `Choose ${isPopular ? "Annual" : "3-Month"} Plan`}
                            </button> */}
                          </div>
                        </div>
                      );
                    })}
                </div>

                {/* Tax Configuration */}
                {/* <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Tax Configuration
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CGST Rate (%)
                      </label>
                      <input
                        type="tel"
                        min="0"
                        max="50"
                        disabled
                        step="0.1"
                        value={cgstRate}
                        onChange={(e) =>
                          setCgstRate(parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-4 py-2 border border-gray-Week Plan rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SGST Rate (%)
                      </label>
                      <input
                        type="tel"
                        min="0"
                        max="50"
                        step="0.1"
                        value={sgstRate}
                        disabled
                        onChange={(e) =>
                          setSgstRate(parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Total GST: {cgstRate + sgstRate}% ({cgstRate}% CGST +{" "}
                    {sgstRate}% SGST)
                  </p>
                </div> */}
{/* Tax Configuration */}
{/* <div className="bg-white rounded-lg p-6 shadow-sm">
  <h3 className="text-lg font-semibold text-gray-900 mb-4">
    Tax Configuration
  </h3>
  <div className="grid md:grid-cols-2 gap-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        CGST Rate (%)
      </label>
      <input
        type="tel"
        min="0"
        max="50"
        disabled
        step="0.1"
        value={cgstRate}
        onChange={(e) =>
          setCgstRate(parseFloat(e.target.value) || 0)
        }
        className="w-full px-4 py-2 border border-gray-Week Plan rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        SGST Rate (%)
      </label>
      <input
        type="tel"
        min="0"
        max="50"
        step="0.1"
        value={sgstRate}
        disabled
        onChange={(e) =>
          setSgstRate(parseFloat(e.target.value) || 0)
        }
        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  </div>
  <p className="text-sm text-gray-500 mt-2">
    Total GST: {cgstRate + sgstRate}% ({cgstRate}% CGST +{" "}
    {sgstRate}% SGST)
  </p>
</div> */}
                {/* Dynamic Extra Payments */}
                {activeExtraPayments.length > 0 &&
                  activeExtraPayments.map((payment) => {
                    const isThemePayment =
                      payment.name?.toLowerCase().includes("theme") ||
                      payment.name?.toLowerCase().includes("custom");

                    return (
                      <div
                        key={payment.id}
                        className="bg-white rounded-lg p-6 shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {payment.name}
                            </h3>
                            {payment.description && (
                              <p className="text-sm text-gray-600 mt-1">
                                {payment.description}
                              </p>
                            )}
                            {isThemePayment && (
                              <button
                                onClick={() => setThemeModalOpen(true)}
                                className="mt-3 text-sm border border-lg border-[005BA8] p-3 text-[#005BA8] hover:text-[#004a8a] font-medium "
                              >
                                View Theme Details
                              </button>
                            )}
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-xl font-bold text-gray-900">
                              + ₹{payment.price.toLocaleString()}
                            </span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={!!selectedExtraPayments[payment.id]}
                                onChange={() =>
                                  handleExtraPaymentToggle(payment.id)
                                }
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                {/* Coupon */}
                {/* <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Have a Coupon?
                  </h3>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      disabled={!!appliedCoupon}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                    {appliedCoupon ? (
                      <button
                        onClick={handleRemoveCoupon}
                        className="px-6 py-2 bg-red-500 text-white rounded font-medium hover:bg-red-600"
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        onClick={handleApplyCoupon}
                        className="px-6 py-2 bg-[#005BA8] text-white rounded font-medium hover:bg-[#004a8a]"
                      >
                        Apply
                      </button>
                    )}
                  </div>
                  {appliedCoupon && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-green-600 font-medium">
                      <Check className="w-4 h-4" />
                      <span>
                        Coupon "{appliedCoupon.coupenCode}" applied! You saved ₹
                        {appliedCoupon.price.toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="mt-3 flex items-center gap-2 text-sm text-[#005BA8]">
                    <span className="text-lg">
                      <img
                        src={toAbsoluteUrl("/media/brand-logos/coupon.png")}
                        className="dark:hidden max-h-[20px]"
                        alt=""
                      />
                    </span>
                    <span>Grab it Fast – 50% OFF for first 50!</span>
                  </div>
                </div> */}

                {/* Final Total */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="space-y-3">
                    <div className="flex justify-between text-gray-700">
                      <span>Plan Price</span>
                      <span className="font-semibold">
                        ₹{planPrice.toLocaleString()}
                      </span>
                    </div>
                    {activeExtraPayments
                      .filter((ep) => selectedExtraPayments[ep.id])
                      .map((payment) => (
                        <div
                          key={payment.id}
                          className="flex justify-between text-gray-700"
                        >
                          <span>{payment.name}</span>
                          <span className="font-semibold">
                            ₹{payment.price.toLocaleString()}
                          </span>
                        </div>
                      ))}

                    <div className="flex justify-between text-gray-700">
                      <span>Subtotal</span>
                      <span className="font-semibold">
                        ₹{subtotal.toLocaleString()}
                      </span>
                    </div>

                    {/* {appliedCoupon && (
                      <div className="flex justify-between text-green-600">
                        <span>
                          Coupon Discount ({appliedCoupon.coupenCode})
                        </span>
                        <span className="font-semibold">
                          - ₹{couponDiscount.toLocaleString()}
                        </span>
                      </div>
                    )} */}

                    {/* <div className="border-t pt-3 space-y-2">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>CGST ({cgstRate}%)</span>
                        <span>₹{cgstAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>SGST ({sgstRate}%)</span>
                        <span>₹{sgstAmount.toFixed(2)}</span>
                      </div>
                    </div> */}

                    <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-900">
                      <span>Final Total (incl. GST)</span>
                      <span>₹{finalTotalWithGST.toFixed(2)}</span>
                    </div>
                  </div>
                  <button
                    disabled={user?.isApprove === false}
                    onClick={() => {
                      if (selectedPlan)
                        handlePayment(selectedPlan, finalTotalWithGST);
                    }}
                    className="w-full mt-6 py-3 bg-[#005BA8] text-white rounded-lg font-semibold hover:bg-[#004a8a] transition-colors"
                  >
                    Pay Now
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
        <ThemeModal
          open={themeModalOpen}
          onClose={() => setThemeModalOpen(false)}
          onAddTheme={() => {
            const themePayment = activeExtraPayments.find(
              (ep) =>
                ep.name?.toLowerCase().includes("theme") ||
                ep.name?.toLowerCase().includes("custom"),
            );
            if (themePayment) {
              setSelectedExtraPayments((prev) => ({
                ...prev,
                [themePayment.id]: true,
              }));
            }
            setThemeModalOpen(false);
          }}
          onSkipTheme={() => {
            const themePayment = activeExtraPayments.find(
              (ep) =>
                ep.name?.toLowerCase().includes("theme") ||
                ep.name?.toLowerCase().includes("custom"),
            );
            if (themePayment) {
              setSelectedExtraPayments((prev) => ({
                ...prev,
                [themePayment.id]: false,
              }));
            }
            setThemeModalOpen(false);
          }}
        />

        <PaymentSuccess
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          amount={paymentData.amount}
          transactionId={paymentData.transactionId}
          approve={user?.isApprove}
        />
      </div>
    </div>
  );
};

export default Priceplan;
