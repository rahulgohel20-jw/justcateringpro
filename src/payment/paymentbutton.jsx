import axios from "axios";

const PayButton = () => {
  const handlePayment = async () => {
    // 1. Create order from backend
    const { data } = await axios.post("/api/payment/create-order", { amount: 500 });

    const options = {
      key: "rzp_test_XXXXXX", // From Razorpay Dashboard
      amount: data.amount,
      currency: "INR",
      name: "Your SaaS Company",
      description: "Subscription Payment",
      order_id: data.id,
      handler: async function (response) {
        // 2. Send payment details to backend to verify
        await axios.post("/api/payment/verify", response);
        alert("Payment successful!");
      },
      prefill: {
        name: "John Doe",
        email: "john@example.com",
        contact: "9999999999"
      },
      theme: {
        color: "#3399cc"
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return <button onClick={handlePayment}>Pay ₹500</button>;
};

export default PayButton;
