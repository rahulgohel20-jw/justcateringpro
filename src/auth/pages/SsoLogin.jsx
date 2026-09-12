import { useEffect, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthContext } from "../providers/JWTProvider";

const SsoLogin = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginWithToken } = useContext(AuthContext);

  useEffect(() => {
    const run = async () => {
      const token = searchParams.get("token");
      const userId = searchParams.get("userId");

      if (!token || !userId) {
        navigate("/auth/login", { replace: true });
        return;
      }

      try {
        await loginWithToken(token, userId);

        const partyId = searchParams.get("partyId");
        const redirectTo = searchParams.get("redirectTo");

        if (redirectTo === "add-event" && partyId) {
          navigate("/add-event", {
            replace: true,
            state: {
              fromLeadConvert: true,
              partyId,
              leadId: searchParams.get("leadId") || "",
              clientName: searchParams.get("clientName") || "",
              contactNumber: searchParams.get("contactNumber") || "",
              emailId: searchParams.get("emailId") || "",
              cityName: searchParams.get("cityName") || "",
              eventTypeId: searchParams.get("eventTypeId") || "",
              eventTypeName: searchParams.get("eventTypeName") || "",
              inquiryDate: searchParams.get("inquiryDate") || "",
              leadCode: searchParams.get("leadCode") || "",
            },
          });
        } else {
          navigate("/add-event", { replace: true });
        }
      } catch (err) {
        console.error("SSO login failed:", err);
        navigate("/auth/login", { replace: true });
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-gray-500 text-sm">Signing you in...</p>
    </div>
  );
};

export default SsoLogin;