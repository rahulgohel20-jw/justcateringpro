/**
 * Builds FormData for addupdateeventvendordata API:
 * POST /v1/api/eventmaster/addupdateeventvendordata (multipart/form-data)
 *
 * @param {Object} assignment - Single assignment object
 * @param {number} [index=0] - Array index for assignments[i]
 * @param {FormData} [existingFormData] - Optional existing FormData to append to
 * @returns {FormData}
 */
export const buildVendorFormData = (assignment = {}, index = 0, existingFormData = null) => {
  const fd = existingFormData || new FormData();
  const prefix = `assignments[${index}]`;

  const appendIfPresent = (key, value) => {
    if (value === null || value === undefined || value === "") return;
    if (typeof value === "boolean") {
      fd.append(key, value ? "true" : "false");
    } else {
      fd.append(key, value);
    }
  };

  // Determine id: rawId (existing) or -1 for new record
  let resolvedId = -1;
  if (assignment.rawId != null && assignment.rawId !== "") {
    resolvedId = assignment.rawId;
  } else if (assignment.id != null && assignment.id !== "" && !assignment.isDisplayOnlyId) {
    resolvedId = assignment.id;
  }
  appendIfPresent(`${prefix}.id`, resolvedId);

  // Common required fields
  appendIfPresent(`${prefix}.eventId`, assignment.eventId);
  appendIfPresent(`${prefix}.eventFunctionId`, assignment.eventFunctionId);
  appendIfPresent(`${prefix}.vendorId`, assignment.vendorId);

  // Normalize resourceType
  const resourceType = (assignment.resourceType || "").toUpperCase();
  appendIfPresent(`${prefix}.resourceType`, resourceType);

  // Common optional fields
  appendIfPresent(`${prefix}.userId`, assignment.userId);
  appendIfPresent(`${prefix}.managerId`, assignment.managerId);
  appendIfPresent(`${prefix}.reportingTime`, assignment.reportingTime);
  appendIfPresent(`${prefix}.arrivalTime`, assignment.arrivalTime);
  appendIfPresent(`${prefix}.remarks`, assignment.remarks);
  appendIfPresent(`${prefix}.status`, assignment.status);
  appendIfPresent(`${prefix}.isPresent`, assignment.isPresent);
  appendIfPresent(`${prefix}.latitude`, assignment.latitude);
  appendIfPresent(`${prefix}.longitude`, assignment.longitude);
  appendIfPresent(`${prefix}.menuItemId`, assignment.menuItemId);
  appendIfPresent(`${prefix}.instructions`, assignment.instructions);
  appendIfPresent(`${prefix}.instructionsHindi`, assignment.instructionsHindi);
  appendIfPresent(`${prefix}.instructionsGujarati`, assignment.instructionsGujarati);

  // Append ONLY the nested block that matches resourceType
  if (resourceType === "CHEF" && assignment.chefLabour) {
    const cl = assignment.chefLabour;
    appendIfPresent(`${prefix}.chefLabour.staffCategory`, cl.staffCategory);
    appendIfPresent(`${prefix}.chefLabour.labour`, cl.labour);
    appendIfPresent(`${prefix}.chefLabour.helpers`, cl.helpers);
    appendIfPresent(`${prefix}.chefLabour.weight`, cl.weight);
    appendIfPresent(`${prefix}.chefLabour.unitId`, cl.unitId);
  } else if (resourceType === "OUTSIDE" && assignment.outside) {
    const out = assignment.outside;
    appendIfPresent(`${prefix}.outside.weight`, out.weight);
    appendIfPresent(`${prefix}.outside.unitId`, out.unitId);
  } else if (resourceType === "LABOUR" && assignment.labour) {
    const lab = assignment.labour;
    appendIfPresent(`${prefix}.labour.staffCategory`, lab.staffCategory);
    appendIfPresent(`${prefix}.labour.shift`, lab.shift);
    appendIfPresent(`${prefix}.labour.assignedQty`, lab.assignedQty);
    appendIfPresent(`${prefix}.labour.confirmedQty`, lab.confirmedQty);
  }

  // vendorImages (File objects or image descriptors)
  if (Array.isArray(assignment.vendorImages)) {
    assignment.vendorImages.forEach((img, j) => {
      const imgPrefix = `${prefix}.vendorImages[${j}]`;
      if (img instanceof File || img instanceof Blob) {
        appendIfPresent(`${imgPrefix}.uploadId`, 0);
        appendIfPresent(`${imgPrefix}.assignmentId`, resolvedId);
        appendIfPresent(`${imgPrefix}.file`, img);
      } else if (img && typeof img === "object") {
        const uploadId = img.uploadId != null && img.uploadId !== "" ? img.uploadId : 0;
        appendIfPresent(`${imgPrefix}.uploadId`, uploadId);
        appendIfPresent(`${imgPrefix}.assignmentId`, img.assignmentId ?? resolvedId);
        if (img.file) {
          appendIfPresent(`${imgPrefix}.file`, img.file);
        }
      }
    });
  }

  // vendorTasks
  if (Array.isArray(assignment.vendorTasks)) {
    assignment.vendorTasks.forEach((task, k) => {
      const taskPrefix = `${prefix}.vendorTasks[${k}]`;
      const taskId = task.taskId !== undefined ? task.taskId : task.id;
      const taskName = task.taskName !== undefined ? task.taskName : task.nameEnglish;
      const taskNameHindi = task.taskNameHindi !== undefined ? task.taskNameHindi : task.nameHindi;
      const taskNameGujarati = task.taskNameGujarati !== undefined ? task.taskNameGujarati : task.nameGujarati;

      appendIfPresent(`${taskPrefix}.taskId`, taskId);
      appendIfPresent(`${taskPrefix}.taskName`, taskName);
      appendIfPresent(`${taskPrefix}.taskNameHindi`, taskNameHindi);
      appendIfPresent(`${taskPrefix}.taskNameGujarati`, taskNameGujarati);
      appendIfPresent(`${taskPrefix}.isCompleted`, task.isCompleted);
      appendIfPresent(`${taskPrefix}.isCommonTask`, task.isCommonTask);
      appendIfPresent(`${taskPrefix}.remarks`, task.remarks);
      appendIfPresent(`${taskPrefix}.completedDate`, task.completedDate);
      if (task.assignmentId != null) {
        appendIfPresent(`${taskPrefix}.assignmentId`, task.assignmentId);
      }
      if (task.eventFunctionTaskId != null) {
        appendIfPresent(`${taskPrefix}.eventFunctionTaskId`, task.eventFunctionTaskId);
      }
    });
  }

  return fd;
};

export default buildVendorFormData;

