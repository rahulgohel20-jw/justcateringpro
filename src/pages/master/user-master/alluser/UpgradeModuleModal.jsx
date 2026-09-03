import { Modal, Switch, message, Spin } from "antd";
import { useState, useEffect } from "react";
import {
  GetAllUpgradeModule,
  LoginWithOtp,
  SaveUpgradeModule,
  paymentIntegration,
} from "@/services/apiServices";
import ApproveOtp from "../approveotp";

const UpgradeModuleModal = ({ isModalOpen, setIsModalOpen, userId }) => {
  const [modules, setModules] = useState([]);
  const [moduleStates, setModuleStates] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [upgradePayload, setUpgradePayload] = useState(null);
  const [commonIsActive, setCommonIsActive] = useState(false);
  const [isConfig, setIsConfig] = useState([]);

  useEffect(() => {
    if (isModalOpen && userId) {
      fetchModules();
    }
  }, [isModalOpen, userId]);

  const fetchModules = async () => {
    try {
      setLoading(true);
      const res = await GetAllUpgradeModule(userId);
      if (res?.data?.success) {
        const list = res.data.data?.UpgradedModule || [];
        const formattedData = list.map((item) => ({
          isConfig: item.isConfig,
        }));
        setModules(list);
        setIsConfig(formattedData);
        const defaults = {};
        list.forEach(
          (m) => (defaults[m.id] = { selected: false, isActive: false }),
        );
        setModuleStates(defaults);
      } else {
        message.error(res?.data?.msg || "Failed to load modules");
      }
    } catch {
      message.error("Failed to load modules");
    } finally {
      setLoading(false);
    }
  };

  const handleIsActiveToggle = (moduleId, value) => {
    setModuleStates((prev) => ({
      ...prev,
      [moduleId]: {
        ...prev[moduleId],
        isActive: value,
        selected: value ? true : prev[moduleId].selected,
      },
    }));
  };

  const handleSaveClick = async () => {
    const selectedModules = Object.entries(moduleStates)
      .filter(([, state]) => state.isActive)
      .map(([id]) => ({
        moduleId: Number(id),
        price: modules.find((m) => m.id === Number(id))?.price || 0,
      }));

    if (selectedModules.length === 0) {
      message.warning("Please enable at least one module");
      return;
    }

    try {
      setSaving(true);

      if (!commonIsActive) {
        let hasConfig = selectedModules.some(({ moduleId }) => {
          const mod = modules.find((m) => m.id === moduleId);
          return mod?.isConfig === true;
        });

        if (hasConfig) {
          const payload = {
            userId: userId,
            userUpgradedModulePayments: selectedModules.map(
              ({ moduleId, price }) => ({
                isOnline: false,
                payAmnt: price,
                paymentData: {
                  payid: "",
                  paymentdone: true,
                  paymentorderid: "",
                  paymentresponse: "",
                  paysignature: "",
                },
                upgradeModuleId: moduleId,
              }),
            ),
          };

          const res = await paymentIntegration(payload);

          if (res?.data?.success) {
            message.success("Modules saved successfully");
            handleReset();
          } else {
            message.error(res?.data?.msg || "Failed to process payment");
          }
        } else {
          const paymentData = {
            payid: "",
            paymentdone: true,
            paymentorderid: "",
            paymentresponse: "",
            paysignature: "",
          };

          const saveRes = await SaveUpgradeModule({
            userId: userId,
            userUpgradedModulePayments: selectedModules.map(
              ({ moduleId, price }) => ({
                isOnline: false,
                payAmnt: price,
                paymentData: paymentData,
                upgradeModuleId: moduleId,
              }),
            ),
          });

          if (!saveRes?.data?.success) {
            message.error(saveRes?.data?.msg || "Failed to save module");
            return;
          }

          message.success("Modules saved successfully");
          handleReset();
        }
      } else {
        const otpRes = await LoginWithOtp(8866889580);

        if (otpRes?.data?.success) {
          message.success("OTP sent for activation");
          setUpgradePayload(
  selectedModules.map((m) => {
    const mod = modules.find((mm) => mm.id === m.moduleId);
    return {
      moduleId: m.moduleId,
      isActive: true,
      isConfig: mod?.isConfig === true, 
    };
  }),
);
          setIsOtpModalOpen(true);
        } else {
          message.error(otpRes?.data?.msg || "Failed to send OTP");
        }
      }
    } catch {
      message.error("Failed to save modules");
    } finally {
      setSaving(false);
    }
  };
  const handleReset = () => {
    setIsModalOpen(false);
    setModuleStates({});
    setModules([]);
    setUpgradePayload(null);
    setCommonIsActive(false);
  };

  const selectedCount = Object.entries(moduleStates).filter(([id, s]) => {
    const mod = modules.find((m) => m.id === Number(id));
    return !mod?.isPurchase && (s.selected || s.isActive);
  }).length;

  return (
    <>
      <Modal
        title={
          <div className="flex items-center gap-2">
            <span>Upgrade Modules</span>
            {selectedCount > 0 && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                {selectedCount} selected
              </span>
            )}
          </div>
        }
        open={isModalOpen}
        onCancel={handleReset}
        onOk={handleSaveClick}
        okText="Save"
        cancelText="Cancel"
        confirmLoading={saving}
        okButtonProps={{
          className: "bg-primary hover:bg-blue-700 border-blue-600",
          disabled: selectedCount === 0,
        }}
        width={560}
      >
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Spin size="large" />
          </div>
        ) : modules.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            No modules available
          </div>
        ) : (
          <>
            {/* Single Common IsActive Toggle */}
            <div className="flex items-center justify-between px-2 py-3 mb-2 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <p className="text-sm font-semibold text-gray-800 mb-0">
                  Activate All Selected Modules
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {commonIsActive
                    ? "OTP verification will be required to activate"
                    : "Modules will be saved without activation"}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Switch
                  checked={commonIsActive}
                  onChange={(val) => setCommonIsActive(val)}
                  className={commonIsActive ? "bg-green-500" : ""}
                />
                <span className="text-xs text-gray-400">
                  {commonIsActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            {/* Individual module rows */}
            <div className="divide-y divide-gray-100 max-h-[360px] overflow-y-auto pr-1">
              {modules.map((mod) => {
                const state = moduleStates[mod.id] || {
                  selected: false,
                  isActive: false,
                };
                const isPurchased = mod.isPurchase === true;

                return (
                  <div
                    key={mod.id}
                    className={`flex items-start justify-between py-3 px-2 rounded transition-colors ${
                      isPurchased
                        ? "bg-gray-50 opacity-75"
                        : state.isActive
                          ? "bg-green-50"
                          : state.selected
                            ? "bg-blue-50"
                            : ""
                    }`}
                  >
                    <div className="flex-1 mr-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-gray-800 mb-0">
                          {mod.moduleName}
                        </p>
                        <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                          ₹{mod.price?.toLocaleString()}
                        </span>

                        {/* Already Assigned Badge */}
                        {isPurchased && (
                          <span className="text-xs font-semibold text-white bg-blue-500 px-2 py-0.5 rounded-full flex items-center gap-1">
                            ✓ Already Assigned
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 mb-1">
                        {mod.description}
                      </p>
                      {mod.upgradedModuleFeatures?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {mod.upgradedModuleFeatures.map((f) => (
                            <span
                              key={f.id}
                              className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                            >
                              {f.featureText}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Individual isActive toggle — disabled if already purchased */}
                    <div className="flex flex-col items-end justify-center gap-1">
                      <Switch
                        checked={isPurchased ? true : state.isActive}
                        onChange={(val) => handleIsActiveToggle(mod.id, val)}
                        disabled={isPurchased}
                        className={
                          isPurchased
                            ? "bg-blue-400 cursor-not-allowed"
                            : state.isActive
                              ? "bg-green-500"
                              : ""
                        }
                      />
                      <span className="text-xs text-gray-400">
                        {isPurchased
                          ? "Assigned"
                          : state.isActive
                            ? "Active"
                            : "Inactive"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Modal>

      <ApproveOtp
        isModalOpen={isOtpModalOpen}
        setIsModalOpen={setIsOtpModalOpen}
        userId={userId}
        action="toggleModuleActive"
        toggleActivePayload={upgradePayload}
        refreshData={() => {
          setIsOtpModalOpen(false);
          handleReset();
        }}
      />
    </>
  );
};

export default UpgradeModuleModal;
