import { Fragment, useState, useEffect } from "react";
import { Container } from "@/components/container";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import ProfileForm from "@/components/profile/ProfileForm";
import Password from "@/components/profile/Password";
import Log from "@/components/profile/log";
import BankDetail from "@/components/profile/BankDetails";
import clsx from "clsx";
import { toAbsoluteUrl } from "@/utils";
import { FormattedMessage } from "react-intl";
import { getUserById, uploadProfileImage, DeleteUserById } from "@/services/apiServices"; // ✅ added DeleteUserById
import { message } from "antd";
import { useNavigate } from "react-router";
import AssignTheme from "../../../master/user-master/theme";
import { Delete, Trash } from "lucide-react";

const TABS = [
  { key: "account", title: <FormattedMessage id="PROFILE.PROFILE" defaultMessage="Profile" /> },
  { key: "security", title: <FormattedMessage id="PROFILE.SECURITY" defaultMessage="Security" /> },
  { key: "logs", title: <FormattedMessage id="PROFILE.LOGS" defaultMessage="User Log" /> },
  { key: "bankdetails", title: <FormattedMessage id="PROFILE.BANK_DETAILS" defaultMessage="Bank Details" /> },
];

const getUserIdFromLocalStorage = () => {
  try {
    return localStorage.getItem("mainId") || null;
  } catch {
    return null;
  }
};

const AccountUserProfilePage = () => {
  const [activeTab, setActiveTab] = useState("account");
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: "", lastName: "", companyAddress: "", companyName: "",
    planName: "", accountId: "", language: "English", gstNo: "", image: "",
  });
  const [refreshKey, setRefreshKey] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  // ✅ NEW: delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const userMasterId = getUserIdFromLocalStorage();
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const isSuperAdmin = localStorage.getItem("userId") == 1;

  const fetchUserProfile = async () => {
    if (!userMasterId) return;
    try {
      const res = await getUserById(userMasterId);
      const user = res?.data?.data?.["User Details"]?.[0];
      if (user) {
        setProfileData({
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          companyAddress: user.userBasicDetails?.address || "",
          companyName: user.userBasicDetails?.companyName || "",
          planName: user.plan?.name || "Lite",
          accountId: user.userCode || "ID-45453423",
          language: "English",
          roleName: user.userBasicDetails?.role?.name || "",
          image: user.logo || profileData.image,
        });
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      message.error("Failed to load profile data");
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, [userMasterId, refreshKey]);

  const handleSave = () => {
    setIsSaving(true);
    const submitButton = document.getElementById("profile-form-submit");
    if (submitButton) submitButton.click();
  };

  const handleSaveSuccess = () => {
    setIsSaving(false);
    setIsEditing(false);
    setRefreshKey((prev) => prev + 1);
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file, file.name);
      formData.append("fileType", "IMAGE");
      formData.append("moduleRecordId", userMasterId);
      formData.append("moduleName", "userlogo");
      formData.append("userId", userMasterId);
      const response = await uploadProfileImage(formData);
      if (response?.data?.success) {
        const uploadedImageUrl =
          response.data.fullPath || response.data.data?.fileUrl || response.data.data?.url;
        setProfileData((prev) => ({ ...prev, image: uploadedImageUrl }));
        message.success("Profile image uploaded successfully!");
        setRefreshKey((prev) => prev + 1);
      } else {
        throw new Error("Upload failed");
      }
    } catch {
      message.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  // ✅ NEW: delete handler
  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const isAdmin = localStorage.getItem("userId") == 1;
      await DeleteUserById(userMasterId, "", isAdmin);
      message.success("Account deleted successfully");
      localStorage.clear();
      navigate("/auth/login");
    } catch (error) {
      message.error(error?.response?.data?.message || "Failed to delete account");
    } finally {
      setIsDeleting(false);
    }
  };

  const content = {
    account: <ProfileForm isEditing={isEditing} onSaveSuccess={handleSaveSuccess} />,
    security: <Password isEditing={isEditing} />,
    logs: <Log isEditing={isEditing} />,
    bankdetails: <BankDetail isEditing={isEditing} />,
  }[activeTab];

  return (
    <Fragment>
      {isSaving && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 bg-white px-6 py-5 rounded-xl shadow-lg">
            <span className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></span>
            <span className="text-sm font-medium text-gray-700">
              <FormattedMessage id="COMMON.SAVING" defaultMessage="Saving..." />
            </span>
          </div>
        </div>
      )}

      <Container>
        <div className="mb-3">
          <Breadcrumbs items={[{ title: <FormattedMessage id="PROFILE.USER_PROFILE" defaultMessage="User Profile" /> }]} />
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <aside className="col-span-12 lg:col-span-4">
            <div className="rounded-2xl bg-white shadow-[0_12px_30px_rgba(0,0,0,0.06)] p-6">
              <div className="flex flex-col items-center relative group">
                <div className="relative">
                  <img
                    className="w-24 h-24 rounded-full object-cover ring-4 ring-white shadow"
                    src={
                      profileData?.image &&
                      typeof profileData.image === "string" &&
                      profileData.image.trim() !== "" &&
                      profileData.image !== "null" &&
                      profileData.image !== "undefined" &&
                      !profileData.image.toLowerCase().includes("/null") &&
                      /\.(jpg|jpeg|png|webp|gif)$/i.test(profileData.image)
                        ? profileData.image
                        : toAbsoluteUrl("/media/menu/noImage.jpg")
                    }
                    alt="profile"
                  />
                  <div
                    className={`absolute inset-0 rounded-full bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isUploading ? "cursor-wait" : "cursor-pointer"}`}
                    onClick={() => !isUploading && document.getElementById("upload-image-input").click()}
                  >
                    {isUploading ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    ) : !profileData.image ? (
                      <img src={toAbsoluteUrl("/media/icons/camera.png")} alt="upload" className="w-6 h-6" />
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setProfileData({ ...profileData, image: "" }); }}
                        className="bg-white p-1 rounded-full"
                      >
                        <img src={toAbsoluteUrl("/media/icons/delete.png")} alt="delete" className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <input
                    id="upload-image-input"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif"
                    className="hidden"
                    disabled={isUploading}
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => setProfileData({ ...profileData, image: reader.result });
                        reader.readAsDataURL(file);
                        handleFileUpload(file);
                      }
                    }}
                  />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-[#1E293B] mb-2">{profileData.companyName || "—"}</h3>
                <p className="text-sm text-[#B5B5C3]">{profileData.roleName || "—"}</p>
              </div>

              <hr className="border-2 border-dotted" />
              <div className="mt-1 rounded-2xl bg-white">
                <button className="w-full flex items-center justify-between px-3 py-2">
                  <span className="text-base text-[#0F172A]">
                    <FormattedMessage id="PROFILE.DETAILS" defaultMessage="Details" />
                  </span>
                </button>
                <div className="px-2 pb-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-[200px]">
                      <span className="text-sm bg-primary text-white p-2 rounded-2xl">{profileData.planName} Plan</span>
                    </div>
                    {userId != 73 && (
                      <div className="flex flex-col w-[400px] gap-1 bg-[#EFF6FF] p-2 rounded-2xl">
                        <span className="text-xs text-center text-[#005BA8]">
                          <FormattedMessage id="PROFILE.UPGRADE_YOUR_PLAN" defaultMessage="Upgrade Your Plan" />
                        </span>
                        <span className="text-xs text-center">
                          <FormattedMessage id="PROFILE.GO_PRO_DESCRIPTION" defaultMessage="Go Pro for more Features and better support." />
                        </span>
                        <button className="rounded-full bg-primary text-white text-xs px-3 py-1" onClick={() => navigate("/price")}>
                          <FormattedMessage id="PROFILE.UPGRADE_NOW" defaultMessage="Upgrade Now" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <hr className="border-2 border-dotted mb-4" />
                <div className="px-5 pb-5 space-y-4">
                  <div>
                    <div className="text-base text-black">
                      <FormattedMessage id="PROFILE.ACCOUNT_ID" defaultMessage="Account ID" />
                    </div>
                    <div className="text-sm text-[#B5B5C3]">{profileData.accountId}</div>
                  </div>
                  <div>
                    <div className="text-base text-black">
                      <FormattedMessage id="PROFILE.COMPANY_ADDRESS" defaultMessage="Company Address" />
                    </div>
                    <div className="text-sm text-[#B5B5C3]">{profileData.companyAddress || "—"}</div>
                  </div>
                  <div>
                    <div className="text-base text-black">
                      <FormattedMessage id="PROFILE.LANGUAGE" defaultMessage="Language" />
                    </div>
                    <div className="text-sm text-[#B5B5C3]">{profileData.language}</div>
                  </div>
                </div>

             
                <div className="px-5 pb-5">
                  <hr className="border-2 border-dotted mb-4" />
                  <button
                    className="flex gap-2 justify-center align-items-center w-full rounded-md bg-red-50 text-red-600 border border-red-200 text-sm px-4 py-2 hover:bg-red-100 transition-colors"
                    onClick={() => setIsDeleteModalOpen(true)}
                  >
                   <Trash size={15} /> <FormattedMessage id="PROFILE.DELETE_ACCOUNT" defaultMessage="Delete Account" />
                  </button>
                </div>

              </div>
            </div>
          </aside>

          {/* Main Section */}
          <section className="col-span-12 lg:col-span-8">
            <div className="rounded-2xl bg-white shadow-[0_12px_30px_rgba(0,0,0,0.06)]">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-8 pt-6 gap-4">
                <div className="flex gap-4 sm:gap-8 overflow-x-auto w-full sm:w-auto">
                  {TABS.map((t) => {
                    const active = t.key === activeTab;
                    return (
                      <button
                        key={t.key}
                        onClick={() => setActiveTab(t.key)}
                        className={clsx(
                          "pb-3 text-sm font-medium transition-colors",
                          active ? "text-primary border-b-2 border-[#2563EB]" : "text-[#94A3B8] hover:text-[#2563EB]"
                        )}
                      >
                        {t.title}
                      </button>
                    );
                  })}
                  {isSuperAdmin && (
                    <button className="rounded-md bg-primary text-white text-sm px-4 py-2" onClick={() => setIsThemeModalOpen(true)}>
                      Assign Theme
                    </button>
                  )}
                </div>

                {activeTab === "account" && (
                  isEditing ? (
                    <button
                      className="rounded-md bg-primary text-white text-sm px-4 py-2 flex items-center gap-2"
                      onClick={handleSave}
                      disabled={isSaving}
                    >
                      {isSaving && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                      <FormattedMessage id={isSaving ? "COMMON.SAVING" : "COMMON.SAVE"} defaultMessage={isSaving ? "Saving..." : "Save"} />
                    </button>
                  ) : (
                    <button className="rounded-md bg-[#EDF2F7] text-primary text-sm px-4 py-2" onClick={() => setIsEditing(true)}>
                      <FormattedMessage id="COMMON.EDIT" defaultMessage="Edit" />
                    </button>
                  )
                )}
              </div>
              <div className="p-3">{content}</div>
            </div>
          </section>
        </div>

        <AssignTheme isModalOpen={isThemeModalOpen} setIsModalOpen={setIsThemeModalOpen} userId={userMasterId} />
      </Container>

      {/* ✅ NEW: Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">

            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4h6v3M3 7h18" />
                </svg>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-center text-lg font-semibold text-gray-900 mb-1">
              <FormattedMessage id="PROFILE.DELETE_ACCOUNT" defaultMessage="Delete Account" />
            </h2>
            <p className="text-center text-sm text-gray-500 mb-4">
              <FormattedMessage id="PROFILE.DELETE_ACCOUNT_SUBTITLE" defaultMessage="Are you sure you want to delete your account?" />
            </p>

            {/* Warning bullets */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5 space-y-2">
              {[
                { id: "PROFILE.DELETE_WARN_1", msg: "All your data will be permanently deleted" },
                { id: "PROFILE.DELETE_WARN_2", msg: "Your subscription and billing history will be lost" },
                { id: "PROFILE.DELETE_WARN_3", msg: "This action cannot be undone" },
              ].map(({ id, msg }) => (
                <div key={id} className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                  <span className="text-xs text-red-700 leading-relaxed">
                    <FormattedMessage id={id} defaultMessage={msg} />
                  </span>
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                className="flex-1 rounded-md bg-gray-100 text-gray-600 text-sm px-4 py-2 hover:bg-gray-200 transition-colors"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
              >
                <FormattedMessage id="COMMON.CANCEL" defaultMessage="Cancel" />
              </button>
              <button
                className="flex-1 rounded-md bg-red-600 text-white text-sm px-4 py-2 hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
              >
                {isDeleting && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                <FormattedMessage
                  id={isDeleting ? "COMMON.DELETING" : "PROFILE.DELETE_ACCOUNT"}
                  defaultMessage={isDeleting ? "Deleting..." : "Delete Account"}
                />
              </button>
            </div>

          </div>
        </div>
      )}

    </Fragment>
  );
};

export { AccountUserProfilePage };