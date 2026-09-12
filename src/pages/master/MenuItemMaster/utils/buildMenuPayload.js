export const buildPayload = (details, allocation = {}) => {
  const userId = Number(localStorage.getItem("userId"));

  const formData = new FormData();

  // Basic fields
  formData.append("dishCosting", details.dishCosting || 0);
  formData.append("menuCategoryId", Number(details.category) || 0);
  if (details.subCategory) {
    formData.append("menuSubCategoryId", Number(details.subCategory));
  }
  formData.append("nameEnglish", details.nameEnglish || "");
  formData.append("nameGujarati", details.nameGujarati || "");
  formData.append("nameHindi", details.nameHindi || "");
  formData.append("slogan", details.slogan || "");
  formData.append("price", details.price || 0);
  formData.append("remarks", details.remarks || "");
  formData.append("sequence", details.sequence || 0);
  formData.append("totalRate", details.totalRate || 0);
  formData.append("url", details.imageUrl || "");
  formData.append("userId", userId);
  formData.append("instructionEnglish", details.instructionEnglish || "");
formData.append("instructionGujarati", details.instructionGujarati || "");
formData.append("instructionHindi", details.instructionHindi || "");

  // File upload
  if (details.file) {
    formData.append("file", details.file);
  }

  // Menu Item Raw Materials
  const rawMaterials = (details.recipes || []).map((r) => ({
    id: r.menuRmId || 0,
    rate: r.rate || 0,
    rawMaterialId: r.rawMaterialId || 0,
    unitId: r.unitId || 0,
    weight: Number(r.weight) || 0,
    venue: r.venueId || 0, 
    isVisible: r.isVisible !== false,
  }));

// Captain Receipes
const captainReceipes = (details.captainRecipes || []).map((r) => ({
  captainReceipeId: Number(r.captainReceipeId) || 0,
id: Number(r.id || r.menuRmId) || 0,  rate: Number(r.rate) || 0,
  unitId: Number(r.unitId) || 0,
  venue: r.venueId === 0 ? 0 : Number(r.venueId) || 0,   weight: Number(r.weight) || 0,
}));

captainReceipes.forEach((cr, index) => {
  formData.append(`captainReceipes[${index}].captainReceipeId`, cr.captainReceipeId);
  formData.append(`captainReceipes[${index}].id`, cr.id);
  formData.append(`captainReceipes[${index}].rate`, cr.rate);
  formData.append(`captainReceipes[${index}].unitId`, cr.unitId);
  formData.append(`captainReceipes[${index}].venue`, cr.venue);
  formData.append(`captainReceipes[${index}].weight`, cr.weight);
});

  rawMaterials.forEach((rm, index) => {
    formData.append(`menuItemRawMaterials[${index}].id`, rm.id);
    formData.append(`menuItemRawMaterials[${index}].rate`, rm.rate);
    formData.append(
      `menuItemRawMaterials[${index}].rawMaterialId`,
      rm.rawMaterialId,
    );
    formData.append(`menuItemRawMaterials[${index}].unitId`, rm.unitId);
    formData.append(`menuItemRawMaterials[${index}].weight`, rm.weight);
formData.append(
    `menuItemRawMaterials[${index}].venue`,
    rm.venue === 0 ? 0 : Number(rm.venue) || 0,  // ✅ 0 for At Venue
  );  

  formData.append(
      `menuItemRawMaterials[${index}].isVisible`,
      rm.isVisible ? "true" : "false", 
    );


});
  

  // Menu Item Allocation Config
  if (allocation && Object.keys(allocation).length > 0) {
    formData.append("menuItemAllocationConfigRequest.id", allocation.id || 0);
    formData.append(
      "menuItemAllocationConfigRequest.godownLocation",
      allocation.godownLocation || "",
    );
    formData.append(
      "menuItemAllocationConfigRequest.remarks",
      allocation.remarks || "",
    );

    if (allocation.partyId) {
      formData.append(
        "menuItemAllocationConfigRequest.partyId",
        allocation.partyId,
      );
    }

    formData.append(
      "menuItemAllocationConfigRequest.selectChefLabourAgency",
      allocation.selectChefLabourAgency || false,
    );
    formData.append(
      "menuItemAllocationConfigRequest.selectOutsideAgency",
      allocation.selectOutsideAgency || false,
    );
    formData.append(
      "menuItemAllocationConfigRequest.selectInsideAgency",
      allocation.selectInsideAgency || false,
    );

    // Chef Labour Item
  if (allocation.chefLabourItem) {
  formData.append("menuItemAllocationConfigRequest.chefLabourItem.id",
    allocation.chefLabourItem.id || 0);
  formData.append("menuItemAllocationConfigRequest.chefLabourItem.allocation_type",
    allocation.chefLabourItem.allocation_type || "plate_wise");
  formData.append("menuItemAllocationConfigRequest.chefLabourItem.counterNo",
    allocation.chefLabourItem.counterNo || 0);
 
  formData.append("menuItemAllocationConfigRequest.chefLabourItem.pricePerLabour",
    allocation.chefLabourItem.pricePerLabour || 0);
  formData.append("menuItemAllocationConfigRequest.chefLabourItem.pricePerHelper",
    allocation.chefLabourItem.pricePerHelper || 0);
  formData.append("menuItemAllocationConfigRequest.chefLabourItem.helperNo",
    allocation.chefLabourItem.helperNo || 0);
}

    // Outside Item
    if (allocation.outsideItem) {
      formData.append(
        "menuItemAllocationConfigRequest.outsideItem.id",
        allocation.outsideItem.id || 0,
      );
      formData.append(
        "menuItemAllocationConfigRequest.outsideItem.quantityPer100Person",
        allocation.outsideItem.quantityPer100Person || 0,
      );
      formData.append(
        "menuItemAllocationConfigRequest.outsideItem.unitId",
        allocation.outsideItem.unitId || 0,
      );
      formData.append(
        "menuItemAllocationConfigRequest.outsideItem.basePrice",
        allocation.outsideItem.basePrice || 0,  
      );
      
      formData.append(
        "menuItemAllocationConfigRequest.outsideItem.contactCategoryId",
        allocation.outsideItem.contactCategoryId || 0,
      );
    }

    // Inside Item
    if (allocation.insideItem) {
      formData.append(
        "menuItemAllocationConfigRequest.insideItem.id",
        allocation.insideItem.id || 0,
      );
      formData.append(
        "menuItemAllocationConfigRequest.insideItem.number",
        allocation.insideItem.number || "",
      );
    }
  }

  return formData;
};
