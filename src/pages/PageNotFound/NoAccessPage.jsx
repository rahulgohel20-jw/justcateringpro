import { useLocation, useNavigate } from "react-router-dom";
import { FormattedMessage } from "react-intl";

/**
 * 403 page. One message for both cases (Module Access and Page Rights),
 * so it looks the same whichever guard sent the user here.
 *
 * Optional: <Navigate to="/403" replace state={{ reason: "module" }} />
 * also shows an "Upgrade module" button.
 */
const NoAccessPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const isModule = state?.reason === "module";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full text-center px-4">
      {/* Solid primary circle (bg-primary/10 does not render with CSS-variable colours) */}
      <div className="flex items-center justify-center size-16 rounded-full bg-primary mb-5">
        <i className="ki-filled ki-shield-cross text-white text-3xl" />
      </div>

      <div className="text-7xl font-bold text-primary mb-3">403</div>

      <h1 className="text-2xl font-semibold text-gray-800 mb-2">
        <FormattedMessage
          id="COMMON.ACCESS_DENIED_TITLE"
          defaultMessage="Access Denied"
        />
      </h1>

      <p className="text-gray-500 mb-6 max-w-md">
        <FormattedMessage
          id="COMMON.ACCESS_DENIED_MSG"
          defaultMessage="You don't have module access or page rights for this page. Contact your Administration to request access."
        />
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => navigate("/dashboard", { replace: true })}
          className="px-6 py-2 bg-primary text-white rounded-md hover:opacity-90 transition-opacity"
        >
          <FormattedMessage
            id="COMMON.BACK_TO_DASHBOARD"
            defaultMessage="Back to dashboard"
          />
        </button>

        
      </div>
    </div>
  );
};

export default NoAccessPage;