import { Fragment, useEffect, useState } from "react";
import { Container } from "@/components/container";
import {
  GetAllIntegration,
  CreatePayOrderForintegration,
  paymentIntegration,
} from "@/services/apiServices";
import IntegrationsKeyModal from "./IntegrationKeyModal";

const getIntegrationIcon = (name) => {
  const lower = name?.toLowerCase();

  if (lower.includes("whatsapp")) {
    return (
      <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </div>
    );
  }

  if (lower.includes("mail") || lower.includes("smtp")) {
    return (
      <div className="w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center">
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="white">
          <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="w-10 h-10 rounded-lg bg-gray-400 flex items-center justify-center text-white text-xs">
      N/A
    </div>
  );
};

const IntegrationCard = ({ integration, onConnectClick }) => {
  return (
    <div className="rounded-xl border border-gray-200 p-3 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">{integration.icon}</div>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className="font-semibold text-gray-900 text-sm leading-tight ">
              {integration.name}
            </span>
            {integration.isPurchase ? (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-primary">
                Paid
              </span>
            ) : (
              <div>
                {integration.price ? (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-primary">
                    ₹{integration.price}/month
                  </span>
                ) : (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                    Free
                  </span>
                )}
              </div>
            )}
          </div>
          <p className="text-gray-500 text-xs mt-0.5 leading-snug mb-2">
            {integration.description}
          </p>
        </div>
      </div>

      <button
        onClick={() => onConnectClick(integration)}
        disabled={
          integration.isPurchase &&
          (integration.key1 != null || integration.key2 != null)
        }
        className={`w-full py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
          integration.isPurchase &&
          (integration.key1 != null || integration.key2 != null)
            ? "bg-gray-900  text-white"
            : "bg-gray-200 text-black hover:bg-primary hover:text-white"
        }`}
      >
        {integration.isPurchase &&
        (integration.key1 != null || integration.key2 != null)
          ? "Connected"
          : integration.isPurchase === false
            ? "Connect"
            : "Add Keys"}
      </button>
    </div>
  );
};

const Integration = () => {
  const [integrations, setIntegrations] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [keyId, setKeyId] = useState();
  const fetchAllIntegration = async () => {
    try {
      const isConfig = true;
      const userId = localStorage.getItem("userId");
      const res = await GetAllIntegration(isConfig, userId);
      const resdata = res.data.data.UpgradedModule || [];
      const data = resdata.map((item) => ({
        id: item.id,
        name: item.moduleName,
        description: item.description,
        connected: item.isisActive,
        isPurchase: item.isPurchase,
        price: item.price,
        key1: item.key1,
        key2: item.key2,
        icon: getIntegrationIcon(item.moduleName),
        uncId: item.uncId,
      }));
      setIntegrations(data);
    } catch (err) {
      console.error("error from fetch", err);
    }
  };

  useEffect(() => {
    fetchAllIntegration();
  }, []);

  const handleConnectClick = async (integration) => {
    if (
      integration.isPurchase &&
      integration.key1 === null &&
      integration.key2 === null
    ) {
      setSelectedIntegration(integration);
      setIsOpen(true);
      setKeyId(integration.uncId);
    } else {
      let userId = localStorage.getItem("userId");
      const orderPayload = {
        userId: Number(userId),
        userUpgradedModulePayments: [
          {
            isOnline: true,
            payAmnt: integration.price,
            paymentData: {
              payid: "",
              paymentdone: true,
              paymentorderid: "",
              paymentresponse: "",
              paysignature: "",
            },
            upgradeModuleId: integration.id,
          },
        ],
      };

      const res = await CreatePayOrderForintegration(orderPayload);

      const backendOrderId = res.data?.data[0].orderId;

      const options = {
        key: "rzp_live_S5dgGJ3fEPa3fO",
        amount: integration.price * 100,
        currency: "INR",
        name: "JCX",
        description: `Purchase ${integration.name}`,
        order_id: backendOrderId,
        handler: async function (response) {
         

          const payload = {
            userId: Number(userId),
            userUpgradedModulePayments: [
              {
                isOnline: true,
                payAmnt: integration.price,
                paymentData: {
                  payid: response.razorpay_payment_id,
                  paymentdone: true,
                  paymentorderid: response.razorpay_order_id,
                  paymentresponse: JSON.stringify(response),
                  paysignature: response.razorpay_signature,
                },
                upgradeModuleId: integration.id,
              },
            ],
          };
          const data = await paymentIntegration(payload);
          
          fetchAllIntegration();
        },
        prefill: {
          // optional: pre-fill user details
          // name: "User Name",
          // email: "user@example.com",
        },
        theme: {
          color: "rgba(0, 91, 168, 1)",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        console.error("Payment failed:", response.error);
      });
      rzp.open();
    }
  };

  return (
    <Fragment>
      <Container>
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Custom Integrations
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {integrations.map((integration) => (
            <IntegrationCard
              key={integration.id}
              integration={integration}
              onConnectClick={handleConnectClick}
            />
          ))}
        </div>

        <IntegrationsKeyModal
          isModalOpen={isOpen}
          setIsModalOpen={() => {
            setIsOpen(false);
            setSelectedIntegration(null);
          }}
          integration={selectedIntegration}
          keyId={keyId}
          refreshData={fetchAllIntegration} 
        />
      </Container>
    </Fragment>
  );
};

export { Integration };
