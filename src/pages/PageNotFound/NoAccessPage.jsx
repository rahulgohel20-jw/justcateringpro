import { useNavigate } from "react-router-dom";

const NoAccessPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <div className="text-8xl font-bold text-primary mb-4">403</div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-2">
        Access Denied
      </h1>
      <p className="text-gray-500 mb-6">
        You don't have permission to view this page. Contact your admin to
        request access.
      </p>
      <button
        onClick={() => navigate("/")}
        className="px-6 py-2 bg-primary text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Back to Dashboard
      </button>
    </div>
  );
};

export default NoAccessPage;
