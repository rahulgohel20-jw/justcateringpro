import { Fragment, useEffect, useRef, useState, useCallback } from "react";
import { Container } from "@/components/container";
import { Button, Spin } from "antd";
import Swal from "sweetalert2";
import { FormattedMessage } from "react-intl";
import {
  getbyiddecorprofile,
  uploadlogodecorprofile,
} from "@/services/apiServices";
import { usePermission } from "../../../hooks/usePermission";
import DecorProfileModal from "./DecorProfileModal";

const extractProfile = (res) => {
  const d = res?.data;
  const p = d?.data ?? d?.["Decor Profile Details"] ?? d;
  if (Array.isArray(p)) return p[0] || null;
  return p && typeof p === "object" ? p : null;
};

const Field = ({ label, value }) => (
  <div>
    <p className="text-xs text-gray-500 mb-1">{label}</p>
    <p className="text-sm text-gray-900 font-medium break-words">
      {value || "-"}
    </p>
  </div>
);

const DecorProfile = () => {
  const permissions = usePermission("Decor Profile");
  const userId = localStorage.getItem("userId");

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getbyiddecorprofile(userId);
      setProfile(extractProfile(res));
    } catch (err) {
      console.error("Error fetching decor profile:", err);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  /* -------------------- LOGO UPLOAD -------------------- */
  const handleLogoChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      Swal.fire("Error", "Please select an image file", "error");
      return;
    }

    setUploading(true);
    try {
      const res = await uploadlogodecorprofile(file, userId);
      if (res?.data?.success === false) {
        Swal.fire("Error", res?.data?.msg || "Failed to upload", "error");
        return;
      }
      Swal.fire({
        title: "Success",
        text: res?.data?.msg || "Logo uploaded successfully",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
      fetchProfile();
    } catch (error) {
      Swal.fire(
        "Error",
        error?.response?.data?.msg || "Something went wrong",
        "error",
      );
    } finally {
      setUploading(false);
    }
  };

  const logoSrc =
    profile?.logo ||
    profile?.logoPath ||
    profile?.profilePic ||
    profile?.imagePath ||
    "";

  return (
    <Fragment>
      <Container>
        <div className="flex items-center justify-between pb-2 mb-3">
          <h1 className="text-xl text-gray-900">
            <FormattedMessage
              id="DECOR_PROFILE.TITLE"
              defaultMessage="Decor Profile"
            />
          </h1>

          {(permissions.edit || permissions.add) && (
            <Button
              type="primary"
              className="bg-primary px-5 rounded-md text-xs"
              icon={<i className="ki-filled ki-notepad-edit text-xs" />}
              onClick={() => setIsModalOpen(true)}
            >
              {profile ? (
                <FormattedMessage
                  id="COMMON.EDIT"
                  defaultMessage="Edit Profile"
                />
              ) : (
                <FormattedMessage
                  id="COMMON.CREATE_NEW"
                  defaultMessage="Create Profile"
                />
              )}
            </Button>
          )}
        </div>

        <div className="card">
          <div className="card-body p-6">
            {loading ? (
              <div className="text-center py-10">
                <Spin size="large" />
                <p className="mt-2 text-gray-600">Loading...</p>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row gap-8">
                {/* Profile picture */}
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    {logoSrc ? (
                      <img
                        src={logoSrc}
                        alt="Profile"
                        className="w-32 h-32 rounded-full object-cover border"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-gray-100 border flex items-center justify-center text-gray-400 text-sm">
                        No photo
                      </div>
                    )}

                    {uploading && (
                      <div className="absolute inset-0 rounded-full bg-white/70 flex items-center justify-center">
                        <Spin />
                      </div>
                    )}

                    {permissions.edit && (
                    <button
  type="button"
  title="Change photo"
  disabled={uploading}
  onClick={() => fileInputRef.current?.click()}
  className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center shadow disabled:opacity-50"
>
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
</button>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoChange}
                  />
                  <p className="text-sm font-semibold text-gray-900 text-center">
                    {profile?.companyName || "-"}
                  </p>
                </div>

                {/* Details */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Field label="Company Name" value={profile?.companyName} />
                  <Field label="Company Email" value={profile?.companyEmail} />
                  <Field
                    label="Office No."
                    value={
                      profile?.officeNo
                        ? `${profile?.countryCode || ""} ${profile.officeNo}`.trim()
                        : ""
                    }
                  />
                  <Field label="GST Number" value={profile?.gstNumber} />
                  <Field label="PAN Number" value={profile?.panNumber} />
                  <Field label="CIN Number" value={profile?.cinNumber} />
                  <Field label="HSN Number" value={profile?.hsnNumber} />
                  <div className="sm:col-span-2">
                    <Field label="Address" value={profile?.address} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <DecorProfileModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          refreshData={fetchProfile}
          editData={profile}
        />
      </Container>
    </Fragment>
  );
};

export default DecorProfile;