// hooks/useReportPermission.js
import { useMemo } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useAuthContext } from "@/auth";

export const useReportPermission = () => {
  const roleReportRights = useAuthStore((state) => state.roleReportRights);
  const { currentUser } = useAuthContext();

  const roleId = Number(currentUser?.userBasicDetails?.role?.id);
  const isSuperUser = roleId === 1 || roleId === 2;

  const allowedTemplateIds = useMemo(() => {
    if (isSuperUser) return null; // null = full access

    if (!roleReportRights) return new Set(); // no rights = show nothing

    const ids = new Set();
    roleReportRights.modules?.forEach((mod) => {
      mod.reports?.forEach((report) => {
        if (report.isAllowed) ids.add(report.templateMasterId);
      });
    });
    return ids;
  }, [roleReportRights, isSuperUser]);

  // Check if a specific templateMasterId is allowed
  const isTemplateAllowed = (templateMasterId) => {
    if (allowedTemplateIds === null) return true; // admin
    return allowedTemplateIds.has(templateMasterId);
  };

  // Filter a list of templates
  const filterTemplates = (templates) => {
    if (allowedTemplateIds === null) return templates; // admin
    return templates.filter((t) => allowedTemplateIds.has(t.id));
  };

  // Filter full reportSections structure
  const filterSections = (reportSections) => {
    if (allowedTemplateIds === null) return reportSections; // admin
    return reportSections
      .map((section) => ({
        ...section,
        modules: section.modules
          .map((mod) => ({
            ...mod,
            templates: mod.templates.filter((t) =>
              allowedTemplateIds.has(t.id)
            ),
          }))
          .filter((mod) => mod.templates.length > 0),
      }))
      .filter((section) => section.modules.length > 0);
  };

  return {
    isSuperUser,
    allowedTemplateIds,
    allowedTemplateIds,
    isTemplateAllowed,
    filterTemplates,
    filterSections,
  };
};