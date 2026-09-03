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
        navigate("/add-event", { replace: true });
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