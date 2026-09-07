import { da } from "@faker-js/faker";
import { POST, GET, PUT, DELETE, UPLOAD } from "./axiosInstance";
import axios from "./axiosInstance";

export const GetMenuCategoryByUserId = (Id) => {
  return GET(`/menucategory/getallbyuserid?userid=${Id}`);
};

export const GetMenuCategoryByUserIdmenuitem = (userId) => {
  return GET(`/menucategory/getallbyuserid?userid=${userId}`);
};

export const GetQuotation = (id, isCopyToInvoice, isDecor) => {
  return GET(
    `/quotation/getbyeventid?eventId=${id}&isCopyToInvoice=${isCopyToInvoice}&isDecore=${isDecor}`,
  );
};

export const UpdateQuotation = (id, data) => {
  return PUT(`/quotation/update?id=${id}`, data);
};

export const DeleteQuotation = (id) => {
  return DELETE(`/quotation/deletebyquotationitemid?quotationItemId=${id}`);
};


export const DeleteQuotationAdvancePayment = (id) => {
  return DELETE(`/quotation/deletequotationpayment?id=${id}`);
};

//Country APIs
export const fetchCountries = (countryName = "") =>
  GET(`/countrymaster/getall?countryName=${countryName}`);

export const fetchCountryById = (id) => GET(`/countrymaster/getbyid?id=${id}`);

// State APIs
export const fetchStatesByCountry = (countryId, stateName = "") =>
  GET(
    `/statemaster/getbycountryid?countryId=${countryId}&stateName=${stateName}`,
  );

export const fetchStateById = (id) => GET(`/statemaster/getbyid?id=${id}`);

//City APIs
export const fetchCitiesByState = (stateId, cityName = "") =>
  GET(`/citymaster/getbystateid?stateId=${stateId}&cityName=${cityName}`);

//Login api
export const LoginUser = (data) => {
  return POST("/auth/login", data);
};

export const LoginOutUser = (email, eventtype) => {
  return GET(
    `/user-logs/logout-notification?email=${email}&eventType=${eventtype}`,
  );
};

// Fetch single month close date
export const Closedate = (month, year , userId) => {
  return GET(`/employeeexpense?month=${month}&year=${year}&userId=${userId}`);
};

export const saveclosedate = (startDate, closeDate ,userId) => {
  return POST(
    `/employeeexpense/addCloseDate?startDate=${startDate}&closeDate=${closeDate}&userId=${userId}`,
  );
};

//GET All customer
export const GetAllCustomer = (Id) => {
  return GET(`/partymaster/getallbyuserid?userId=${Id}`);
};

//get customer by id by cat id
export const GetPartyMasterByCatId = (catTypeId, userId) => {
  return GET(
    `/partymaster/getallbycontcatid?contCatId=${catTypeId}&userId=${userId}`,
  );
};

//Add customer
export const AddCustomerapi = (formData) => {
  return POST("/partymaster/add", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

//Edit customer
export const EditCustomerApi = (Id, data) => {
  return PUT(`/partymaster/update?id=${Id}`, data);
};

export const FetchCalc = (data) => {
  return PUT(`/menuallocation/calculations`, data);
};

//Delete customer
export const DeleteCustomerApi = (Id) => {
  return DELETE(`/partymaster/deletebyid?id=${Id}`);
};

//search customer
export const SearchCustomerApi = (data, Id) => {
  return GET(`/partymaster/getallbyuserid?partyName=${data}&userId=${Id}`);
};
//GET All ContactCategory
export const GetAllContactCategory = (Id) => {
  return GET(`/contactcategory/getallbyuserid?userId=${Id}`);
};

export const GetAllContactCategorybycontacttype = (concatId, Id) => {
  return GET(
    `/contactcategory/getallbycatid?conCatId=${concatId}&userId=${Id}`,
  );
};

//search ContactCategory
export const SearchContactCategory = (data, Id) => {
  return GET(
    `/contactcategory/getallbyuserid?categoryName=${data}&userId=${Id}`,
  );
};

//Add ContactCategory
export const Addcontactcategory = (data) => {
  return POST(`/contactcategory/add`, data);
};
//Edit ContactCategory
export const EditContactCategory = (Id, data) => {
  return PUT(`/contactcategory/update?id=${Id}`, data);
};
//Delete ContactCategory
export const DeleteContactCategory = (Id) => {
  return DELETE(`/contactcategory/deletebyid?id=${Id}`);
};

//Contact Type
export const GetAllContactType = (Id) => {
  return GET(`/contacttype/getallbyuserid?userId=${Id}`);
};

export const GetAllContactTypeById = (Id) => {
  return GET(`contacttype/getbyid?id=${Id}`);
};

// Add Contact Type
export const AddContactMasterType = (data) => {
  return POST("/contacttype/add", data);
};

// Delete Contact Type
export const DeleteContactTypeMaster = (Id) => {
  return DELETE(`/contacttype/delete?id=${Id}`);
};

//Edit Contact Type
export const EditContactType = (Id, data) => {
  return PUT(`/contacttype/update?id=${Id}`, data);
};

// Update Status of Contact Type
export const updateContactTypeStatus = (Id, statusId) => {
  return PUT(`/contacttype/updatestatus?id=${Id}&isActive=${statusId}`);
};

// Get All Raw Material
export const GetAllRawMaterials = (page, pageSize, catId, rawName, Id) => {
  return GET(
    `rawmaterial/getallbyuserid?pageNo=${page}&pageSize=${pageSize}&rawMateriaCatlId=${catId}&rawMaterialName=${rawName}&unitid=0&userid=${Id}`,
  );
};


export const GetAllRawMaterial = (isAsc, page, pageSize, catId, Id, signal) => {
  return GET(
    `rawmaterial/getallbyuserid?isAsc=${isAsc}&pageNo=${page}&pageSize=${pageSize}&rawMateriaCatlId=${catId}&unitid=0&userid=${Id}`,
    signal,
  );
};

// complete parameter of raw material all 
export const getallrawmaterial = (isActive  , isAsc , pageNo , pageSize  , rawMateriaCatlId , rawMaterialName, unitid , userid) => {
  return GET(`rawmaterial/getallbyuserid?isActive=${isActive}&isAsc=${isAsc}&pageNo=${pageNo}&pageSize=${pageSize}&rawMateriaCatlId=${rawMateriaCatlId}&rawMaterialName=${rawMaterialName}&unitid=${unitid}&userid=${userid}`);
};

export const GetItemRawMaterialByRawMaterialdata = (catId, userId) => {
  return GET(
    `/menuitems/getitemrawmaterialbyrawmaterial?rawMaterialId=${catId}&userId=${userId}`,
  );
};
export const UpdateItemRawMaterialWeight = (data) => {
  return PUT(`/menuitems/updateitemrawmaterialweight`, data);
};

export const SearchRawMaterial = (
  isAsc,
  Id,
  page,
  pageSize,
  itemName,
  signal,
) => {
  return GET(
    `rawmaterial/getallbyuserid?isAsc=${isAsc}&pageNo=${page}&pageSize=${pageSize}&rawMaterialName=${itemName}&rawMateriaCatlId=0&unitid=0&userid=${Id}`,
    signal,
  );
};

export const DeleteRole = (Id) => {
  return DELETE(`/rolemaster/deletebyid?id=${Id}`);
};

export const GetUnitData = (Id) => {
  return GET(`/unit/getallbyuserid?isActive=true&userid=${Id}`);
};

export const GetUnitById = (Id) => {
  return GET(`/unit/getbyid?id=${Id}`);
};

export const GetSuplier = (id) => {
  return GET(
    `/partymaster/getallbyuserid?partyName=Supplier%20(Vendor)&userId=${id}`,
  );
};
export const GetAllQuotation = (id) => {
  return GET(`/quotation/getallbyfilter?userid=${id}`);
};

export const GetUnitMismatched = (userId) => {
  return GET(`/menuitems/getmismatchedunitsbyuserid?userId=${userId}`);
};

export const GetAllIntegration = (config, userId) => {
  return GET(`/upgradedmodule/getall?isConfig=${config}&userId=${userId}`);
};

export const GetQuotationReport = (
  adminTemplateModuleId,
  eventId,
  language,
  userId,
  isInvoice,
  isQrCode,
  isTermsCond,
  isAdvance,
  isWithPrice,
  isCompanyDetails,
  isDecor,
  isOnePage,
  isCombo,
  isNotes,
  exclusiveThemeId,
  backOfficeId,
  showLastPage,
) => {
  return POST(
    `/quotationreport/generatequotation?adminTemplateModuleId=${adminTemplateModuleId}&eventId=${eventId}&lang=${language}&userId=${userId}&isInvoice=${isInvoice}&isQrCode=${isQrCode}&isTermsCond=${isTermsCond}&isAdvance=${isAdvance}&isWithPrice=${isWithPrice}&isCompanyDetails=${isCompanyDetails}&isDecore=${isDecor}&isOnePage=${isOnePage}&isCombo=${isCombo}&isNotes=${isNotes}&exclusiveThemeId=${exclusiveThemeId}&backOfficeId=${backOfficeId}&showLastPage=${showLastPage}`,
  );
};

export const GetAllQuotationByFilter = (enddate, startdate,userid, id ,isVenue  ) => {
  return GET(
    `/quotation/getallbyfilter?endDate=${enddate}&startDate=${startdate}&userid=${userid}&id=${id}&isVenue=${isVenue}`,
  );
};

export const AddFunctionQuotation = (data) => {
  return POST(`/extraquotationfunction/addorupdate`, data);
};

export const Getallquotationfunction = (userId) => {
  return GET(`/extraquotationfunction/getall?userId=${userId}`);
};

export const GetRawmaterialwithcatID = (catID, id) => {
  return GET(
    `/rawmaterial/getallbyuserid?rawMateriaCatlId=${catID}&unitid=0&userid=${id}`,
  );
};

export const GetAllFonts = () => {
  return GET(`/font-master/getallfonts`);
};
export const DeleteFont = (fontId) => {
  return DELETE(`/font-master/deletebyid?fontId=${fontId}`);
};

export const AddFont = (data) => {
  return POST(`/font-master/add`, data);
};

export const GetActiveFonts = () => {
  return GET(`/font-master/getallactivefonts`);
};

export const EditFont = (fontId, data) => {
  return PUT(`/font-master/update?fontId=${fontId}`, data);
};

export const SelectedRawMenuallocation = (data) => {
  return POST(`/menuallocation/addorupdatemenuitemrawmat`, data);
};

export const GetRawmaterialforitem = (userid) => {
  return GET(`/rawmaterial/getbyuserid?isActive=true&userid=${userid}`);
};

// Get All Supllier Vendors

export const GetAllSupllierVendors = (Id) => {
  return GET(
    `/partymaster/getallbyuserid?partyName=supplier (Vendor)&userId=${Id}`,
  );
};

//Raw Material Allocation
export const GetAllRawMaterialAllocationCategory = (eventId) => {
  return GET(`/rawmaterialcategory/getbyeventid?eventId=${eventId}`);
};

export const GetAllRawMaterialAllocationItems = (eventId, categoryId) => {
  return GET(
    `event-raw-material/getbyevent?eventId=${eventId}&rawMateriaCatlId=${categoryId}`,
  );
};

export const RawMaterialallocation = (data) => {
  return POST("/event-raw-material/add-update", data);
};

//Add Meal Type
export const AddMealType = (data) => {
  return POST("/mealtype/add", data);
};

export const PayvendorEdit = (data) => {
  return POST("/vendorpayment/updatevendorpaymentinvoice", data);
};

export const Getallgeneralfix = (userId, signal) => {
  return GET(
    `/rawmaterial/getallgeneralfix?isGeneralFix=true&page=1&size=999&userId=${userId}`,
    signal,
  );
};

export const AddMissmatched = (data) => {
  return PUT("/menuitems/updatemismatchedunits", data);
};

//Get Meal Type
export const GetMealType = (Id) => {
  return GET(`/mealtype/getallbyuserid?userId=${Id}`);
};
//search Mealtype
export const SearchMealtype = (data, Id) => {
  return GET(`/mealtype/getallbyuserid?mealTypeName=${data}&userId=${Id}`);
};
//Edit Meal Type
export const EditMealType = (Id, data) => {
  return PUT(`/mealtype/update?id=${Id}`, data);
};

export const RawMaterialName = (Id, name) => {
  return GET(
    `/contactcategory/getallbyuserid?categoryName=${name}&userId=${Id}`,
  );
};

export const SelectedItemNameMenuAllocation = (eventfunctionid, menuitemid) => {
  return GET(
    `/menuallocation/getrawmaterialbyitem?eventFunctionId=${eventfunctionid}&menuItemId=${menuitemid}`,
  );
};

export const CreatePaymentTheme = (data) => {
  return POST("exclusivethemeoayment/createThemePayment", data);
};

export const ContactNameItem = (Id, name) => {
  return GET(`/partymaster/getallbyuserid?partyName=${name}&userId=${Id}`);
};
export const OutsideContactName = (cattypeid, userid) => {
  return GET(
    `/partymaster/getallbycattypeid?catTypeId=${cattypeid}&userId=${userid}`,
  );
};

export const StatusChange = (Id, name) => {
  return PUT(`/eventmaster/changeeventstatus?eventId=${Id}&status=${name}`);
};

//Delete Meal Type
export const DeleteMealType = (Id) => {
  return DELETE(`/mealtype/deletebyid?id=${Id}`);
};
//Get Event Type
export const GetEventType = (Id) => {
  return GET(`/eventtype/getallbyuserid?userId=${Id}`);
};
//search Event Type
export const SearchEventType = (data, Id) => {
  return GET(`/eventtype/getallbyuserid?eventTypeName=${data}&userId=${Id}`);
};
//Add Event Type
export const Addeventtype = (data) => {
  return POST(`/eventtype/add`, data);
};
export const MenuAllocationSave = (data) => {
  return POST(`/menuallocation/add-update`, data);
};

//Edit Event Type
export const EditEventType = (Id, data) => {
  return PUT(`/eventtype/update?id=${Id}`, data);
};

//Delete Event Type
export const DeleteEventType = (Id) => {
  return DELETE(`/eventtype/deletebyid?id=${Id}`);
};

export const DeleteQuotationFunction = (Id) => {
  return DELETE(`/extraquotationfunction/deletebyid?id=${Id}`);
};

//Create Event master
export const CreateEventMaster = (data) => {
  return POST(`/eventmaster/add`, data);
};
//Get all event


const getIsVisible = () => {
  try {
    const authStorage = localStorage.getItem("auth-storage");
    const parsed = JSON.parse(authStorage);
    return parsed?.state?.user?.isVisible ?? true; 
  } catch {
    return true;
  }
};

export const GetEventMaster = (Id, isChildUser, month, year, status) => {
  const isVisible = getIsVisible();   
  if (isVisible === false) {
    month = -1;
    year = -1;
  }
  const statusParam = status === null || status === undefined || status === -1 ? "" : `&status=${status}`;
  return GET(`/eventmaster/getallbyuserid?userId=${Id}&isChildUser=${isChildUser}&month=${month || -1}&year=${year || -1}&isVisible=${isVisible}${statusParam}`);
};

export const UpdateEventMaster = (Id, data) => {
  return PUT(`/eventmaster/update?id=${Id}`, data);
};
//get event by id
export const GetEventMasterById = (Id) => {
  return GET(`/eventmaster/getbyid?eventId=${Id}`);
};

export const GetMenuAllocation = (eventid, Id) => {
  return GET(
    `/menuallocation/getmenuallocation?eventFunctionId=${Id}&eventId=${eventid}`,
  );
};
//Delete event
export const DeleteEventMaster = (Id) => {
  return DELETE(`/eventmaster/deleteeventbyid?eventId=${Id}`);
};

// Update Status of Event
export const UpdateEventStatus = (Id, statusId) => {
  return PUT(`/eventmaster/updatestatus?id=${Id}&statusId=${statusId}`);
};

//get all manager and admin
export const Fetchmanager = (Id) => {
  return GET(`/user/getmanagerandadminusersbyclient?clientUserId=${Id}`);
};

export const FetchAccountparty = (userId) => {
  return GET(
    `/vendorpayment/getallaccountladgerparty?isAllStatus=true&userId=${userId}`,
  );
};

export const Fetchacoountledger = (endDate, partyId, startDate, userId , vendorCat, type ) => {
  return GET(
    `/vendorpayment/getaccountladger?endDate=${endDate}&partyId=${partyId}&startDate=${startDate}&userId=${userId}&vendorCat=${vendorCat}&type=${type}`,
  );
};

export const DeletePayments = (Id) => {
  return DELETE(`/vendorpayment/deletevendorpaymentinvoicebyid?id=${Id}`);
};

export const Ftechpartydata = (isallstatus, isbooking, userId) => {
  return GET(
    `/vendorpayment/getallaccountladgerparty?isAllStatus=${isallstatus}&isBookingParty=${isbooking}&userId=${userId}`,
  );
};

export const Ftecheventdata = (partyId, userId) => {
  return GET(
    `/vendorpayment/getalleventbyparty?partyId=${partyId}&userId=${userId}`,
  );
};

export const GetAllPlans = () => {
  return GET(`/plans/getall`);
};

export const GeteventQuoataiondata = (id, isChildUser) => {
  return GET(`/eventmaster/getallbypartyid?partyId=${id}&isChildUser=${isChildUser}`);
};

export const GetAllRole = (id) => {
  return GET(`/rolemaster/getallbyuserid?userId=${id}`);
};

export const GetUsersByRoleId = (roleId = 2) => {
  return GET(`/user/getallbyroleid?roleId=${roleId}`);
};

export const GetNamePlatedata = (eventFunctionId, eventId, lang, userID) => {
  return GET(
    `/nameplate/get?eventFunctionId=${eventFunctionId}&eventId=${eventId}&lang=${lang}&userId=${userID}`,
  );
};

export const GenerateNamePlateReport = (fromData) => {
  return POST(`/report/generate-name-plate/`, fromData);
};

export const Tableexeculisivepost = (fromData) => {
  return POST(`/nameplate/tablemenuwithbg/addorupdate`, fromData);
};

export const AddNamePlate = (data) => {
  return POST(`/nameplate/addorupdate`, data);
};

// Add Role

export const Addrole = (data) => {
  return POST(`/rolemaster/add`, data);
};
export const GetPages = (isadmin, iscombo) => {
  return GET(
    `/user-rights/getPages?isAdminRights=${isadmin}&isCombine=${iscombo}`,
  );
};

export const GetRightsBYroleId = (roleId) => {
  return GET(`/user-rights/getByRole?roleId=${roleId}`);
};

export const AddRights = (data) => {
  return POST(`/user-rights/addRights`, data);
};

// GetRolebyId

export const GetRoleById = (id) => {
  return GET(`/rolemaster/getbyid?id=${id}`);
};

export const AddFunction = (data) => {
  return POST(`/functionmaster/add`, data);
};

export const GetAllFunctionsByUserId = (id) => {
  return GET(`/functionmaster/getallbyuserid?userId=${id}`);
};

export const DeleteEventFunctionById = (id) => {
  return DELETE(`/eventfunction/deleteeventfunction?id=${id}`);
};

export const GetFunctionsByFunctionName = (functionName) => {
  return GET(
    `/functionmaster/getallbyuserid?userId=1&functionName=${functionName}`,
  );
};

export const DeleteFunctionType = (Id) => {
  return DELETE(`/functionmaster/deletebyid?id=${Id}`);
};

export const EditFunctionById = (id, data) => {
  return PUT(`/functionmaster/update?id=${id}`, data);
};

// master
export const fetchAllUsers = () => GET("/user/getall");

// profile userbyid

export const getUserById = (id) => {
  return GET(`/user/getbyid?id=${id}`);
};

// ALL Member
export const GetAllMemberByUserId = (id) => {
  return GET(`/user/getallbyuserid?userId=${id}`);
};

// Add Member

export const AddMember = (data) => {
  return POST(`/auth/add`, data);
};

// Delete Member
export const DeleteMember = (Id) => {
  return DELETE(`/user/deletebyid?id=${Id}`);
};

// Edit Member

export const UpdateMember = (id, data) => {
  return PUT(`/auth/update?id=${id}`, data);
};

//Get category Type
export const GetAllCategory = (data) => {
  return GET(`/menucategory/getallbyuserid`, data);
};
//Get category Type
export const GetAllCategoryformenu = (id) => {
  return GET(`/menucategory/getallbyuserid?isActive=true&userid=${id}`);
};

export const SearchCategoryformenu = (id, name) => {
  return GET(`/menucategory/getallbyuserid?isActive=true&userid=${id}&menuCategoryName=${name}`);
};

export const Getmenusubcategory = (menucategoryid, userId) => {
  return GET(
    `/menusubcategory/getallbyuserid?isActive=true&menuCategoryId=${menucategoryid}&userid=${userId}`,
  );
};

export const Getmenuprep = (
  eventFunId,
  itemname,
  menuCatId,
  pageNo,
  TotalRecord,
  UserId,
) => {
  return GET(
    `/menupreparation/getmenupreparationitems?eventFunctionId=${eventFunId}&itemName=${encodeURIComponent(itemname)}&menuCategoryId=${menuCatId}&pageNo=${pageNo}&totalRecord=${TotalRecord}&userId=${UserId}`,
  );
};

export const Getmenuitems = (pageno, size, UserId) => {
  return GET(
    `/menuitems/getallbyuserid?page=${pageno}&size=${size}&userId=${UserId}`,
  );
};

export const Getmenuitemsusingcatid = (pageno, size, UserId, catid) => {
  return GET(
    `/menuitems/getallbyuserid?menuCatId=${catid}&page=${pageno}&size=${size}&userId=${UserId}`,
  );
};
export const Getmenuitemsusingcatidanditemname = ({
  itemName = "",
  menuCatId = "",
  menuSubCatId = "",
  page = 1,
  size = 10,
  userId,
}) => {
  return GET(
    `/menuitems/getallbyuserid?itemName=${encodeURIComponent(
      itemName
    )}&menuCatId=${menuCatId}&menuSubCatId=${menuSubCatId}&page=${page}&size=${size}&userId=${userId}`
  );
};

//Get menu preparation items
export const Deleteiteminmenu = (itemId, menuCatId, MenuprepId) => {
  return DELETE(
    `/menupreparation/deletemenupreparationitem?itemId=${itemId}&menuCategoryId=${menuCatId}&menuPreparationId=${MenuprepId}`,
  );
};
//Get menu preparation items
export const AddMenuprep = (data) => {
  return POST(`/menupreparation/addOrUpdate`, data);
};

export const UpdateEventPax = (eventId, data) => {
  return PUT(`/eventmaster/updatealleventfunction?id=${eventId}`, data);
};

//Add category Type
export const AddCategory = (data) => {
  return POST(`/menucategory/add`, data);
};

//Add category Type
export const MenuReportData = (
  eventFunctionId,
  eventId,
  catImg,
  catIns,
  catSlogan,
  itemSlogan,
  itemIns,
  lang,
) => {
  return GET(
    `/menupreparation/generateexclusivereport2?eventFunctionId=${eventFunctionId}&eventId=${eventId}&isCategoryImage=${catImg}&isCategoryInstruction=${catIns}&isCategorySlogan=${catSlogan}&isItemInstruction=${itemIns}&isItemSlogan=${itemSlogan}&lang=${lang}`,
  );
};

//Edit category Type
export const editCategory = (Id, data) => {
  return PUT(`/menucategory/update?id=${Id}`, data);
};

//delete category Type
export const DeleteCategoryId = (Id) => {
  return DELETE(`/menucategory/deletebyid?id=${Id}`);
};

//status category Type
export const UpdateStatus = (Id, status = true) => {
  return PUT(`/menucategory/updatestatus?id=${Id}&isActive=${status}`);
};

// Get Sub category Type
export const GetAllSubCategory = (data) => {
  return GET(`/menusubcategory/getallbyuserid`, data);
};
//for menu item
export const GetAllSubCategorymenuitem = (userId) => {
  return GET(`/menusubcategory/getallbyuserid?userid=${userId}`); // 👈 'userid' (all lowercase)
};

//Add category Type
export const AddSubCategory = (data) => {
  return POST(`/menusubcategory/add`, data);
};

//Edit category Type
export const editSubCategory = (Id, data) => {
  return PUT(`/menusubcategory/update?id=${Id}`, data);
};

//delete category Type
export const DeleteSubCategoryId = (Id) => {
  return DELETE(`/menusubcategory/deletebyid?id=${Id}`);
};

//status category Type
export const UpdateSubStatus = (Id, status = true) => {
  return PUT(`/menusubcategory/updatestatus?id=${Id}&isActive=${status}`);
};

// Registration
export const registerUser = (data) => {
  return POST(`/auth/add`, data);
};

// profile data
export const FetchAllUser = (id) => {
  return GET(`/user/getallbyuserid?userId=${id}`);
};

//update usermaster // also in profile
export const updateusermaster = (id, data) => {
  return PUT(`/auth/update?id=${id}`, data);
};
// all user
export const getAllByRoleId = (roleId, type) => {
  return GET(`/user/getallbyroleid?roleId=${roleId}&type=${type}`);
};
export const transfermember = (otp, type, userId) => {
  return PUT(`/user/convertUserType?otp=${otp}&type=${type}&userId=${userId}`);
};

export const getAllByRoleIdData = (role, type) => {
  return GET(`/user/getallbyroleid?roleId=${role}&type=${type}`);
};
export const updateStatusApprove = (otp, id) => {
  return PUT(`/auth/isapproved?isApprove=true&otp=${otp}&userId=${id}`);
};

// Kitchen Area
export const GetAllKitchenAreaById = (id) => {
  return GET(`/kitchenarea/getallbyuserid?userId=${id}`);
};

// addkitechenarea
export const AddKitchenArea = (data) => {
  return POST(`/kitchenarea/add`, data);
};

//updatekitchenarea
export const UpdateKitchenArea = (id, data) => {
  return PUT(`/kitchenarea/update?id=${id}`, data);
};

// deletekitchenarea
export const DeleteKitchenArea = (id) => {
  return DELETE(`/kitchenarea/deletebyid?id=${id}`);
};

//upadtestatuskitecharea
// ✅ services/apiServices.js
export const UpdateStatusKitchenArea = (id, isActive = true) => {
  return PUT(`/kitchenarea/updatestatus?id=${id}&isActive=${isActive}`);
};

// file upload
export const uploadFile = (data) => {
  return UPLOAD(`/file/uploadfile`, data);
};

export const uploadFileformenu = (formData) => {
  return PUT("/fileupload/upload-file", formData);
};

//upload Image
export const uploadProfileImage = (data) => {
  return PUT(`/fileupload/upload-file`, data);
};

//getmenuitem
export const GetAllMenuItems = ({
  isAsc,
  userId,
  itemName = "",
  menuCatId,
  subCategoryId,
  isWithRecipe,
  page,
  size,
}) => {
  const query = `?isAcs=${isAsc}&userId=${userId}&itemName=${itemName}&menuCatId=${menuCatId}&menuSubCatId=${subCategoryId}&isWithRecipe=${isWithRecipe}&page=${page}&size=${size}`;
  return GET(`/menuitems/getallbyuserid${query}`);
};

//addmenuitem
export const AddMenuItems = (data) => {
  return POST(`/menuitems/add`, data);
};

//delete menu item
export const DeleteMenuItem = (id) => {
  return DELETE(`/menuitems/deletebyid?id=${id}`);
};

//edit menu item
export const UpdateMenuItem = (id, data) => {
  return PUT(`/menuitems/update?id=${id}`, data);
};

//stautsmeniitem
export const updatestatusmneuitem = (id, isActive = true) => {
  return PUT(`/menuitems/updatestatus?id=${id}&isActive=${isActive}`);
};

export const SyncRawmaterialMenuallocation = (id, eventId) => {
  return DELETE(`
menuallocation/syncrawmaterialitems?eventFunctionid=${id}&eventId=${eventId}`);
};

// Change Password

// export const ChangePassword = (data) => {
//   return axios.post(`/auth/changepassword`, null, {
//     params: {
//       oldPassword: data.oldPassword,
//       newPassword: data.newPassword,
//       conPassword: data.conPassword,
//       userId: data.userId,
//     },
//   });
// };

export const ChangePassword = (data) => {
  return axios.post(`/auth/changepassword`, data)
}

// Forgot Password - Request Reset Link

export const requestPasswordResetLink = async (email) => {
  return axios.post(`/auth/forgotpassword`, null, {
    params: { email }, // query param
  });
};

//Otp Verification

// Email OTP verification
export const verifyOtp = async ({ email, otp }) => {
  return axios.post(`/auth/verifyotp`, null, {
    params: { email, otp },
  });
};


export const verifyMobileOtp = async ({ phone, otp, uniqueCode }) => {
  return axios.post(`/auth/verifyotpformobile`, null, {
    params: { mobileNo: phone, otp, uniqueCode },
  });
};

// reset password API
export const resetPassword = async (emailId, newPassword, conPassword) => {
  return axios.post(`/auth/resetpassword`, null, {
    params: { emailId, newPassword, conPassword },
  });
};

export const LoginWithOtp = async (phone) => {
  return axios.post("/auth/loginwithotp", null, {
    params: { mobileNo: phone },
  });
};

//raw material type
export const GetRawType = (id) => {
  return GET(`/rawmaterialcattype/getallbyuserid?userId=${id}`);
};
export const DeleteRawType = (id) => {
  return DELETE(`/rawmaterialcattype/delete?id=${id}`);
};

export const AddRawType = (data) => {
  return POST(`/rawmaterialcattype/add`, data);
};
export const EditRawType = (id, data) => {
  return PUT(`/rawmaterialcattype/update?id=${id}`, data);
};
export const updatestatusrawmaterialtype = (id, currentStatus) => {
  return PUT(
    `/rawmaterialcattype/updatestatus?id=${id}&isActive=${currentStatus}`,
  );
};
//raw material category

export const GetRawMaterialcategory = (id) => {
  return GET(
    `/rawmaterialcategory/getallbyuserid?categoryTypeId=0&userid=${id}`,
  );
};

export const UpdateSequence = (data) => {
  return PUT(`/rawmaterial/updatesequence`, data);
};

export const DeleteRawMaterialcategory = (id) => {
  return DELETE(`/rawmaterialcategory/delete?id=${id}`);
};

export const AddRawMaterialCat = (data) => {
  return POST(`/rawmaterialcategory/add`, data);
};
export const EditRawMaterialCat = (id, data) => {
  return PUT(`/rawmaterialcategory/update?id=${id}`, data);
};
export const updatestatusrawmatrialcat = (id, currentStatus) => {
  return PUT(
    `/rawmaterialcategory/updatestatus?id=${id}&isActive=${currentStatus}`,
  );
};

export const DeleteSuplier = (id) => {
  return DELETE(`/rawmaterialsupplier/deletebyid?id=${id}`);
};

export const Addrawmaterial = (data) => {
  return POST(`/rawmaterial/add`, data);
};

export const Deleterawmaterial = (id) => {
  return DELETE(`/rawmaterial/delete?id=${id}`);
};
export const EditRawMaterial = (id, data) => {
  return PUT(`/rawmaterial/update?id=${id}`, data);
};
export const updateRawMaterialStatus = (id, data) => {
  return PUT(`/rawmaterial/updatestatus?id=${id}&isActive=${data}`);
};

export const Getunit = (id) => {
  return GET(`/unit/getallbyuserid?userid=${id}`);
};

export const SearchUnit = (data, id) => {
  return GET(`/unit/getallbyuserid?unitName=${data}&userid=${id}`);
};

export const DeleteUnit = (id) => {
  return DELETE(`/unit/deletebyid?id=${id}`);
};
export const AddUnitdata = (data) => {
  return POST(`/unit/add`, data);
};

export const EditUnit = (id, data) => {
  return PUT(`/unit/update?id=${id}`, data);
};
export const updateunit = (id, data) => {
  return PUT(`unit/updatestatusbyid?id=${id}&isActive=${data}`);
};

export const Translateapi = (data) => {
  return GET(`/transliterate?text=${data}`);
};

export const GetCustomPackageapi = (id) => {
  return GET(`/custompackage/getallbyuserid?userid=${id}`);
};

export const GetCustomPackageById = (id) => {
  return GET(`/custompackage/getbyid?id=${id}`);
};

export const UpdateCustomPackage = (id, data) => {
  return PUT(`/custompackage/update?id=${id}`, data);
};

export const GetCustomPackageapibyID = (id) => {
  return GET(`/custompackage/getbyid?id=${id}`);
};
export const AddCustomPackageapi = (data) => {
  return POST(`/custompackage/add`, data);
};

export const UpdateCustomPackageapi = (id, data) => {
  return PUT(`/custompackage/update?id=${id}`, data);
};

export const DeleteCustomPackageapi = (id) => {
  return DELETE(`/custompackage/deletebyid?id=${id}`);
};

export const UpdateCustomPackageStatusapi = (id, isActive) => {
  return PUT(`/custompackage/updatestatus?id=${id}&isActive=${isActive}`);
};

export const GetInvoiceByEventId = (eventId) => {
  return GET(`/invoice/getbyeventid?eventId=${eventId}`);
};

export const GetSendInvoice = (eventId, lang, userId) => {
  return GET(
    `/sendFile/sendQuotation?eventId=${eventId}&lang=${lang}&userId=${userId}`,
  );
};

export const GetInvoiceByUserId = (id) => {
  return GET(`/invoice/getalluserid?userid=${id}`);
};

export const AddInvoice = (data) => {
  return POST(`/invoice/add`, data);
};

//add labour
export const AddUpdateLabor = (payload) => {
  return POST("/labor/add-update", payload);
};

//get labour by event id
export const GetEventLaborDetails = (eventFunctionId, eventId) => {
  return GET(
    `/labor/get?eventFunctionId=${eventFunctionId}&eventId=${eventId}`,
  );
};

export const UpdateInvoice = (id, data) => {
  return PUT(`/invoice/update?id=${id}`, data);
};

export const GetAllInvoice = (id) => {
  return GET(`/invoice/getallbyfilter?userid=${id}`);
};
export const GetAllInvoicedatabyfilter = (
  endDate,
  startDate,
  id,
  isVenue,
  userId
) => {
  return GET(
    `/invoice/getallbyfilter?endDate=${endDate}&id=${id}&isVenue=${isVenue}&startDate=${startDate}&userid=${userId}`
  );
};

export const GetAllVendorPayment = (eventId, isLabour) => {
  return GET(
    `/vendorpayment/getallvendorpaymentbyeventid?eventId=${eventId}&isLabour=${isLabour}`,
  );
};

export const GeteventInvoicedata = (id) => {
  return GET(`/eventmaster/getallbypartyid?partyId=${id}`);
};
export const Getallsyncitems = (userId) => {
  return GET(`/menuitems/syncallitemrawmaterialrate?userId=${userId}`);
};

export const GetInvoice = (id) => {
  return GET(`/invoice/getbyeventid?eventId=${id}`);
};

export const GetEventLabourBySupplier = (eventFunctionId, eventId, partyId) => {
  return GET(
    `/labor/getBySupplier?eventFunctionId=${eventFunctionId}&eventId=${eventId}&partyId=${partyId}`,
  );
};

export const AddExtraExpenseApi = (data) => {
  return POST(`/extra-expense/add`, data);
};

export const GetExtraExpenseByEvent = (eventFunctionId, eventId) => {
  return GET(
    `/extra-expense/getallbyeventId?eventFunctionId=${eventFunctionId}&eventId=${eventId}`,
  );
};

export const DeleteExtraExpense = (id) => {
  return DELETE(`/extra-expense/delete?id=${id}`);
};

export const UpdateExtraExpense = (id, payload) => {
  return PUT(`/extra-expense/update?id=${id}`, payload);
};

export const GetAllPlansForSuperAdmin = () => {
  return GET(`/plans/getall`);
};

export const AddNewPlan = (data) => {
  return POST(`/plans/add`, data);
};

export const DeletePlanById = (id) => {
  return DELETE(`/plans/deletebyid?id=${id}`);
};

export const UpdatePlanById = (id, data) => {
  return PUT(`/plans/update?id=${id}`, data);
};

export const GetPlansByBillingCycle = (cycle) => {
  return GET(`/plans/getallbybillingcycle?billingCycle=${cycle}`);
};

export const GetAllLabourShift = (Id) => {
  return GET(`/shift/getallbyuserid?userId=${Id}`);
};

export const AddLabourShift = (data) => {
  return POST(`/shift/add`, data);
};

export const deleteLabourShiftById = (id) => {
  return DELETE(`/shift/deletebyid?id=${id}`);
};
export const EditLabourShiftAPI = (id, data) => {
  return PUT(`/shift/update?id=${id}`, data);
};

export const GetShiftsByUser = (userId) => {
  return GET(`/shift/getallbyuserid?userId=${userId}`);
};

export const AddUserPlan = (data) => {
  return POST(`/userplanshistory/adduserplan`, data);
};

export const CreatePaymentOrder = (data) => {
  return POST(`/userplanshistory/createPaymentOrder`, data);
};

export const CreatePayOrderForintegration = (data) => {
  return POST(`/upgradedmodule/createPayOrder`, data);
};

export const paymentIntegration = (data) => {
  return POST(`/usernotificationconfig/addusernotification`, data);
};

export const ThemePurchase = (data) => {
  return POST(`/exclusivethemeoayment`, data);
};

export const GetDishCostingByEventFunction = (eventId, eventFunctionId) => {
  return GET(
    `/dish-costing/get?eventId=${eventId}&eventFunctionId=${eventFunctionId}`,
  );
};

export const GetDishCostingbyRawmaterial = (eventId, eventFunctionId) => {
  return GET(
    `/dish-costing/raw-material-category-wise?eventId=${eventId}&eventFunctionId=${eventFunctionId}`,
  );
};

export const GetRenewalCustomer = (startDate, endDate, isActive = true) => {
  return GET(
    `/userplanshistory/renewal-customer-info?startDate=${startDate}&endDate=${endDate}&isActive=${isActive}`,
  );
};

export const DatabaseReadExcle = (formData) => {
  return POST("/excel-parsing/readExcel", formData);
};

export const GetAllDb = () => {
  return GET(`/excel-parsing/getAll`);
};

export const GetDbAssignedDetails = (dbPlanningId) => {
  return GET(`/excel-parsing/getById?db_planning_id=${dbPlanningId}`);
};

export const GetUserlogs = (data, endDate, startDate, eventId) => {
  return GET(`/user-logs/getUserLogs?user=${data}&endDate=${endDate}&startDate=${startDate}&eventId=${eventId}`);
};

export const AssignDb = (payload) => {
  // payload = { databaseName, customerId, instructions }
  return POST(`/excel-parsing/assignDb`, payload);
};

// Super Admin Invoice

export const SuperAdminAddInvoice = (data) => {
  return POST(`/invoice-operations/addInvoice`, data);
};

export const updateSuperAdminInvoice = (data) => {
  return PUT(`/invoice-operations/updateInvoice`, data);
};

export const UpdateFonts = (data) => {
  return PUT(`/admintemplatemodule/updatefontandfontsizebyid`, data);
};

export const AddKeys = (data) => {
  return PUT(`/usernotificationconfig/updateusernotification`, data);
};

export const GETSuperadmininvoicebyid = (invoiceId) => {
  return GET(`/invoice-operations/getadmininvoicebyid`, { invoiceId });
};

export const DELETEsuperadmininvoicenyid = (invoiceId) => {
  return DELETE(
    `/invoice-operations/deleteadmininvoicebyid?invoiceId=${invoiceId}`,
  );
};

export const getsuperadmingenerateInvoiceCode = () => {
  return GET(`/invoice-operations/generateInvoiceCode`);
};

export const GetSuperalladmininvoice = (startDate, endDate, planId , customerId) => {
  return GET(
    `/invoice-operations/getAllAdminInvoice?startDate=${startDate}&endDate=${endDate}&planId=${planId}&customerId=${customerId}`,
  );
};

// export const GetAdminInvoiceById = (id) => {
//   return GET(`/invoice-operations/getadmininvoicebyid?id=${id}`);
// };

// Subscription API

export const SubscriptionByUser = (id) => {
  return GET(`userplanshistory/getplanhistorybyuser?userId=${id}`);
};

//Update Member
export const UpdateMemberById = (id, formData) => {
  return PUT(`/user/updatemember?id=${id}`, formData, {});
};

export const GetALLMemberDetailsByID = (id) => {
  return GET(`/user/getmemberbyid?id=${id}`);
};

export const GetVenueType = (isActive, id) => {
  return GET(`/venuemaster/getallbyuser?isActive=${isActive}&userId=${id}`);
};

export const GetClientwisedashboardata = (id) => {
  return GET(`/dashboard/admin/userWiseDashboardData?userId=${id}`);
};
export const GetClientdashboardpiechart1 = (date, useriD) => {
  return GET(
    `/dashboard/admin/userWiseDashboardPieChart1?dateString=${date}&userId=${useriD}`,
  );
};

export const GetClientdashboardpiechart3 = (date, useriD) => {
  return GET(
    `/dashboard/admin/userWiseEventQuotationPieChart3?dateString=${date}&userId=${useriD}`,
  );
};
export const GetClientdashboardpiechart2 = (date, useriD) => {
  return GET(
    `/dashboard/admin/userWiseSalesInvoicePieChart2?dateString=${date}&userId=${useriD}`,
  );
};

export const GetClienteventdata = (startdate, enddate, useriD) => {
  return GET(
    `/dashboard/admin/getEventsByUserAndDate?endDate=${enddate}&startDate=${startdate}&userId=${useriD}`,
  );
};

export const Getmostsellingitems = (enddate, startdate, userId) => {
  return GET(
    `/dashboard/admin/getMostSellingItems?endDate=${enddate}&startDate=${startdate}&userId=${userId}`,
  );
};



export const DeleteVenueTypeApi = (venueId) => {
  return DELETE(`/venuemaster/deletebyid?id=${venueId}`);
};

// services/apiServices.js
export const UpdateVenueTypeApi = (id, data) => {
  return PUT(`/venuemaster/update?id=${id}`, data);
};

export const AddVenueTypeApi = (id, data) => {
  return POST(`/venuemaster/add?id=${id}`, data);
};
export const UpdateVenueStatusApi = (id, status) => {
  return PUT(`/venuemaster/updatestatus?id=${id}&isActive=${status}`);
};

export const TranslateGujarati = (data) => {
  return POST(`/transliterate/to-gujarati`, data);
};

export const TranslateHindi = (data) => {
  return POST(`/transliterate/to-hindi`, data);
};

export const deleteRawmatrialcatidInmenuitem = (data) => {
  return DELETE(`/menuitems/deleteitemrawmaterialbyid `, {
    data: data,
  });
};

export const deleteFunction = (id) => {
  return DELETE(`/eventfunction/deleteeventfunction?id=${id}`);
};

export const SuperAdminDashboardPlanWiseTotal = () => {
  return GET(`/dashboard/superadmin/planWiseTotal`);
};

export const SuperAdminDashboardTotalUserAndPlan = () => {
  return GET(`/dashboard/superadmin/getTotalUserAndPlanData`);
};

export const SuperAdmingetChartData = (startDate, endDate, planId) => {
  return GET(
    `/dashboard/superadmin/getChartData?startDate=${startDate}&endDate=${endDate}&planId=${planId}`,
  );
};

export const GetRawmaterialItemByRecipe = (menuId, id, isSync) => {
  return GET(
    `/menuitems/getmenuitemrawmaterialbymenuid?isSync=${isSync}&menuItemId=${menuId}&userId=${id}`,
  );
};

export const SuperAdminDashboardMonthWiseData = (
  endDate,
  planId,
  startDate,
) => {
  return GET(
    `/dashboard/superadmin/getMonthWisePlanTotal?endDate=${endDate}&planId=${planId}&startDate=${startDate}`,
  );
};

export const DeleteRawMaterialItem = (functionID, eventid, Id, menuitemId) => {
  return DELETE(
    `/menuallocation/deletemenuitemrawmaterial?eventFunctionId=${functionID}&eventId=${eventid}&id=${Id}&menuItemId=${menuitemId}`,
  );
};

export const deleteMenuItemRawMaterial = (id) => {
  return DELETE(`/menuallocation/deletemenuitemrawmaterial?id=${id}`);
};

export const deleteDownPayment = (id) => {
  return DELETE(`/user/deleteuserdownpaymentbyid?id=${id}`);
};

export const Addtemplate = (data) => {
  return POST(`/templatemodulemaster/add`, data);
};

export const GettemplatebyuserId = () => {
  return GET(`templatemodulemaster/getall`);
};

export const Deletetemplatebyid = (id) => {
  return DELETE(`/templatemodulemaster/deletebyid?id=${id}`);
};

export const DeleteModuleRights = (id) => {
  return DELETE(`/modulerights/deletebyid?id=${id}`);
};

export const Edittemplatebyid = (id, data) => {
  return PUT(`/templatemodulemaster/update?id=${id}`, data);
};

export const GetAllTicketsByUserId = (id) => {
  return GET(`/ticket/getallbyuserid?userId=${id}`);
};

export const GetAllInteraction = () => {
  return GET(`/interaction/getall`);
};

export const AddInteraction = (data) => {
  return POST(`/interaction/add`, data);
};

export const EditInteraction = (id, data) => {
  return PUT(`/interaction/update?id=${id}`, data);
};

export const DeleteTicket = (Id) => {
  return DELETE(`/ticket/delete?id=${Id}`);
};

export const AddTickets = (formData) => {
  return POST(`/ticket/add`, formData);
};

export const GetOutsideSummary = (eventfunID, eventId, type) => {
  return GET(
    `/menuallocation/getagencywithitemsbytype?eventFunctionId=${eventfunID}&eventId=${eventId}&type=${type}`,
  );
};

export const AddComments = (data) => {
  return POST(`/ticketcomment/add`, data);
};

export const GetCommentsByTicketId = (id) => {
  return GET(`/ticketcomment/getallbyticketid?ticketId=${id}`);
};

export const DeleteComment = (Id) => {
  return DELETE(`/ticketcomment/delete?id=${Id}`);
};

export const EditComment = (id, data) => {
  return POST(`/ticketcomment/update?id=${id}`, data);
};

export const EditTicket = (id, data) => {
  return PUT(`/ticket/update?id=${id}`, data);
};

export const MenuAllocationTypeSummary = (event_func_id, event_id, type) => {
  return GET(
    `menuallocation/getagencywithitemsbytype?eventFunctionId=${event_func_id}&eventId=${event_id}&type=${type}`,
  );
};
export const AddLead = (data) => {
  return POST(`/leadmaster/add`, data);
};

export const GetAllleadmaster = (lead, userId) => {
  return GET(`/leadmaster/getAll?AssignId=${lead}&userId=${userId}`);
};

export const GetLeadCode = (userId ) => {
  return GET(`/leadmaster/generateLeadCode?userId=${userId}`);
};

export const DeleteLeadbyID = (id) => {
  return DELETE(`/leadmaster/deleteById?id=${id}`);
};
export const DeleteTemplate = (id) => {
  return DELETE(`/templatemaster/deletebyid?id=${id}`);
};

export const UpdateleadbyID = (id, payload) => {
  return PUT(`/leadmaster/update?id=${id}`, payload);
};
export const GetLeadByID = (id) => {
  return GET(`/leadmaster/getById?id=${id}`);
};

export const GetFilteredFollowUps = ({
  startDate,
  endDate,
  isCreated,
  leadId,
}) => {
  return GET(
    `/leadmaster/getFolloupDetails?startDate=${startDate}&endDate=${endDate}&isCreated=${isCreated}&leadId=${leadId}`,
  );
};
export const AddExpensemanagement = (data) => {
  return POST("/expensemanagement/add", data);
};

export const GETExpenseBYUserType = ({ eventId, userId, userType }) => {
  return GET(
    `/expensemanagement/getexpensebyusertype?eventId=${eventId}&userId=${userId}&userType=${userType}`,
  );
};

export const DeleteByExpenseID = (id) => {
  return DELETE(`/expensemanagement/deletebyid?expenseId=${id}`);
};

export const GETExpenseBYId = (id) => {
  return GET(`/expensemanagement/getbyid?expenseId=${id}`);
};

export const AddExpenseItem = (data) => {
  return POST("/expenseitem/add", data);
};

export const GetExpenseItemsByExpenseAndEvent = (eventId, expenseId) =>
  GET(
    `/expenseitem/getbyexpenseandevent?eventId=${eventId}&expenseId=${expenseId}`,
  );

export const Getrawmaterialitembycat = (
  cat_id_list = [],
  user_id,
  page = 0,
  size = 10,
) => {
  if (!cat_id_list || cat_id_list.length === 0) {
    return Promise.resolve({ data: { data: [] } });
  }
  const catIdParams = cat_id_list.map((id) => `cat_id_list=${id}`).join("&");
  return GET(
    `/rawmaterial/getrawmaterialbycategory?${catIdParams}&user_id=${user_id}&page=${page}&size=${size}`,
  );
};

export const GetRawMaterialByCategoryWithPagination = (
  cat_id_list = [],
  user_id,
  page,
  size,
) => {
  if (!cat_id_list || cat_id_list.length === 0) {
    return Promise.resolve({ data: { data: [] } });
  }
  const catIdParams = cat_id_list.map((id) => `cat_id_list=${id}`).join("&");
  return GET(
    `/rawmaterial/getrawmaterialbycategory?${catIdParams}&user_id=${user_id}&page=${page}&size=${size}`,
  );
};

export const UpdateRawMaterialCategory = (queryString) => {
  return PUT(`/rawmaterial/updaterawmaterialitemcategory?${queryString}`);
};

export const Getmenuitemsusingcatidconfig = (
  menu_cat_ids = [],
  userId,
  type,
) => {
  if (!menu_cat_ids || menu_cat_ids.length === 0) {
    return Promise.resolve({ data: { data: [] } });
  }

  const catIdParams = menu_cat_ids.map((id) => `menu_cat_ids=${id}`).join("&");
  const typeParam = type ? `&type=${encodeURIComponent(type)}` : "";
  return GET(
    `/menuitems/getmenubycatorsubcat?${catIdParams}&userId=${userId}${typeParam}`,
  );
};

export const UpdtaemenuItemcatergoryconfig = (queryString) => {
  return PUT(`/menuitems/updatemenuitemcategory?${queryString}`);
};

export const Updateallocatesupplier = (queryString) => {
  return PUT(`/rawmaterial/updaterawmaterialsupplier?${queryString}`);
};

export const GetAllItemByType = (eventFunctionId, eventId, type) => {
  return GET(
    `/menuallocation/getitembytype?eventFunctionId=${eventFunctionId}&eventId=${eventId}&type=${type}`,
  );
};

export const GetAllCustomTheme = () => {
  return GET(`/templatemaster/getall`);
};

export const GetAllExclusiveThemes = (isExclusive, userId) => {
  return GET(
    `/admintemplatemodule/getall?isExclusive=${isExclusive}&userId=${userId}`,
  );
};

export const GetAllCustomThemeByUserId = (Id) => {
  return GET(`/admintemplatemodule/getall?userId=${Id}`);
};

export const GetAllCustomThemeByUserIdAndModuleId = (Id, moduleId) => {
  return GET(
    `/admintemplatemodule/getall?templateModuleId=${moduleId}&userId=${Id}`,
  );
};

export const AddCustomTheme = (data) => {
  return POST("/templatemaster/add", data);
};

export const UpdateCustomTheme = (formData) => {
  return PUT(`/templatemaster/update`, formData);
};

export const DeleteAssignedTheme = (id) => {
  return DELETE(`/admintemplatemodule/deletebyid?adminTemplateModuleid=${id}`);
};

export const DeleteKyc = (id) => {
  return DELETE(`/user/deleteuserdocumentbyid?id=${id}`);
};

export const DeleteAmc = (id) => {
  return DELETE(`/user/deleteuseramcbyid?id=${id}`);
};
export const GetAllExeculisveTheme = (Id) => {
  return GET(`/templatemaster/getallbymoduleid?moduleId=${Id}`);
};
export const AddThemeType = (data) => {
  return POST("/templatemapping/addorupdate", data);
};
export const GetAllThemeType = (Id) => {
  return GET(`/templatemapping/getall?template_module_id=${Id}`);
};

export const DeleteThemeType = (Id) => {
  return DELETE(`/templatemapping/deletebyid?id=${Id}`);
};

export const DeleteRefund = (id) => {
  return DELETE(`/user/deleteuserrefundbyid?id=${id}`);
};

export const GetAllThemeByModuleId = (namePlate, Id, userId) => {
  return GET(
    `/templatemaster/getallbymoduleid?isNameplate=${namePlate}&moduleId=${Id}&userId=${userId}`,
  );
};

export const AssignThemeAdmin = (data) => {
  return POST("/admintemplatemodule/add", data);
};

export const Updatemenuitemallocationconfig = (data) => {
  return PUT(`/menuitems/updatemenuallocation`, data);
};

export const AddExclusiveReport = (formData) => {
  return POST("/report/menu-planning-exclusive/", formData);
};

export const GetReportConfiguration = (mappingId, moduleId) => {
  return GET(
    `/report/configuration/get?mappingId=${mappingId}&moduleId=${moduleId}`,
  );
};

export const AddReportConfiguration = (data) => {
  return POST("report/configuration/addorupdate", data);
};

export const GETAllreportconfiguration = () => {
  return GET(`report/configuration/get`);
};

export const DeleteReportConfiguration = (id) => {
  return DELETE(`/report/configuration/delete?id=${id}`);
};

export const GetReportConfigurationById = (id) => {
  return GET(`/report/configuration/getbyid?id=${id}`);
};

export const AddorUpdategodown = (data) => {
  return POST(`/godown/addorupdate`, data);
};

export const GETallGodown = (userId) => {
  return GET(`/godown/getall?userId=${userId}`);
};

export const GetGodownbyid = (id) => {
  return GET(`/godown/getbyid?id=${id}`);
};

export const DeleteGoDown = (id) => {
  return DELETE(`/godown/deleteById?id=${id}`);
};

export const AddUserRightsPage = (data) => {
  return POST(`/user-rights/addPage`, data);
};

export const GetAllPages = (isadmin, iscombo) => {
  return GET(
    `/user-rights/getPages?isAdminRights=${isadmin}&isCombine=${iscombo}`,
  );
};

export const GetModuleRights = () => {
  return GET(`/modulerights/getall`);
};

export const GetMemberByIdD = (userID) => {
  return GET(`/user/getallclientbyreportingmanager?managerId=${userID}`);
};

export const GetAllAssignLead = (userID) => {
  return GET(`/leadmaster/getleadbyleadassigned?leadAssignedId=${userID}`);
};

export const AddUtility = (data) => {
  return POST(`/user-config/saveUserConfig`, data);
};

export const GetUtility = (userId) => {
  return GET(`/user-config/getUserConfig/${userId}`);
};

export const AddExtraPayment = (data) => {
  return POST(`/extrapayment/add-update`, data);
};

export const GetExtraPayment = () => {
  return GET(`/extrapayment/getall`);
};

export const DeleteExtraPayment = (id) => {
  return DELETE(`/extrapayment/deletebyid?id=${id}`);
};

export const AddCoupon = (data) => {
  return POST(`/coupenmaster/addorupdate`, data);
};

export const GetCoupons = () => {
  return GET(`/coupenmaster/getall`);
};

export const DeleteCoupon = (id) => {
  return DELETE(`/coupenmaster/delete?id=${id}`);
};

export const GetAgenciesForReportFilter = (
  event_func_id,
  event_id,
  type,
  userId,
) => {
  return GET(
    `/menupreparation/getagencybyeventandeventfunctionid?eventFunctionId=${event_func_id}&eventId=${event_id}&type=${type}&userId=${userId}`,
  );
};

export const GetSelectedItemsForReportFilter = (
  event_func_id,
  event_id,
  partyIds = [],
) => {
  const partyQuery = partyIds.map((id) => `partyIds=${id}`).join("&");

  return GET(
    `/menupreparation/getselectedmenuitembyeventandeventfunctionid` +
      `?eventFunctionId=${event_func_id}` +
      `&eventId=${event_id}` +
      (partyQuery ? `&${partyQuery}` : ""),
  );
};

export const GetNamePlateByNamePlateType = (
  eventFunctionId,
  eventId,
  isCounterItem,
  isStandyItem,
  isTableMenuItem,
  lang,
  userId,
) => {
  return GET(
    `/nameplate/getbynameplatetype` +
      `?eventFunctionId=${eventFunctionId}` +
      `&eventId=${eventId}` +
      `&isCounterItem=${isCounterItem}` +
      `&isStandyItem=${isStandyItem}` +
      `&isTableMenuItem=${isTableMenuItem}` +
      `&lang=${lang}` +
      `&userId=${userId}`,
  );
};

export const getTableExeculisive = (event_func_id, event_id, lang, userId) => {
  return GET(
    `/nameplate/tablemenuwithbg/get?eventFunctionId=${event_func_id}&eventId=${event_id}&lang=${lang}&userId=${userId}`,
  );
};

export const AddModuleRights = (data) => {
  return POST(`/modulerights/add`, data);
};
export const AddVendorPayment = (data) => {
  return POST(`/vendorpayment/addorupdatevendorpaymentinvoice`, data);
};

export const UpdateModuleRights = (id, data) => {
  return PUT(`/modulerights/update?id=${id}`, data);
};

// Add or Update
export const AddorUpdatebankdetails = (userId, data) => {
  return POST(`bankdetails/add`, data);
};

export const GetbankdetailsbyuserId = (userId) => {
  return GET(`bankdetails/getbyuserid?userId=${userId}`);
};

export const GetCopyItem = (userId, isCaptainRecipe ) => {
  return GET(`/menuitems/getallexistingrawitems?userId=${userId}&isCaptainRecipe=${isCaptainRecipe}`);
};

export const Getpaymentvendordata = (eventId, isPayable, userId, vendorId) => {
  return GET(
    `/vendorpayment/getvendorpaymentbyeventidandvendorid?eventId=${eventId}&isPayable=${isPayable}&userId=${userId}&vendorId=${vendorId}`,
  );
};

export const EmployeePerformance = (
  userId,
  employeeId,
  endDate,
  lang,
  pipelineId,
  startDate,
) => {
  return POST(
    `/report/generate-employee-report?userId=${userId}&employeeId=${employeeId}&endDate=${endDate}&lang=${lang}&pipelineId=${pipelineId}&startDate=${startDate}`,
  );
};

export const GetrawMaterialCatIdbytypeid = (id, userid) => {
  return GET(
    `rawmaterialcategory/getbyrawmaterialcategorytypeid?rawMaterialCategoryTypeId=${id}&userId=${userid}`,
  );
};

export const Addupdatecrockerycutlery = (data) => {
  return POST(`crockerycutlery/addupdatecrockerycutlery`, data);
};

export const GETcrockerycutlerygetByRawMaterialCat = (
  rawMaterialCatId,
  userId,
) => {
  return GET(
    `crockerycutlery/getByRawMaterialCat?rawMaterialCatId=${rawMaterialCatId}&userId=${userId}`,
  );
};

export const assignMultipleLeadToMember = (
  leadId_list,
  memberId,
  closeDate = "",
  description = "",
  expirationDate,
) => {
  const leadIds = Array.isArray(leadId_list) ? leadId_list : [];
  if (leadIds.length === 0) {
    console.error("❌ No lead IDs provided");
    return Promise.reject({
      message: "No lead IDs provided",
      receivedValue: leadId_list,
    });
  }

  if (!memberId) {
    return Promise.reject({
      message: "Member ID is required",
    });
  }

  // Create query parameters: leadId=3&leadId=4&memberId=15&closeDate=...&description=...
  const leadIdParams = leadIds.map((id) => `leadId=${id}`).join("&");
  const finalUrl = `/leadmaster/assignMultipleLeadToMember?${leadIdParams}&memberId=${memberId}&closeDate=${encodeURIComponent(closeDate)}&expirationDate=${encodeURIComponent(expirationDate)}&description=${encodeURIComponent(description)}`;

  

  return PUT(finalUrl);
};
export const getLeadsByLeadAssigned = (leadAssignedId, userId) => {
  return GET(
    `leadmaster/getleadbyleadassigned?leadAssignedId=${leadAssignedId}&userId=${userId}`,
  );
};

export const getLeadsByLeadStatus = (leadStatus, userId) => {
  return GET(`leadmaster/getbyleadstatus?leadStatus=${leadStatus}&userId=${userId}`);
};

export const getleadbyleattype = (leadType, userId) => {
  return GET(`leadmaster/getbyleadtype?leadType=${leadType}&userId=${userId}`);
};

export const Deletebyfollowupid = (id) => {
  return DELETE(`leadmaster/deletefollowupbyid?id=${id}`);
};

export const GetAllfunctioneventbyid = (eventId) => {
  return GET(`eventfunction/getalleventfunctionByeventid?eventId=${eventId}`);
};

export const GetAllEventFunction = (userId) => {
  return GET(
    `eventfunction/getalleventfunction?page=1&size=1000&userId=${userId}`,
  );
};

export const GetCopyMenuPlanning = (
  activeEventFunctionId,
  oldEventFunctionId,
) => {
  return GET(
    `menupreparation/copyeventfunctionmenu?activeEventFunctionId=${activeEventFunctionId}&oldEventFunctionId=${oldEventFunctionId}`,
  );
};

export const AddBankDetails = (data) => {
  return POST(`bankdetails/add`, data);
};

export const GetBankDetails = (id) => {
  return GET(`bankdetails/getbyuserid?userId=${id}`);
};

export const AddRecordPayment = (data) => {
  return POST(`salesinvoice/add`, data);
};

export const AddRecordPaymentforInvoice = (invoicePaymentId, data) => {
  return POST(
    `/invoice-operations/recordpayment?invoicePaymentId=${invoicePaymentId}`,
    data,
  );
};

export const GETgetPaymentHistoryByInvoiceId = (invoiceId) => {
  return GET(
    `/invoice-operations/getPaymentHistoryByInvoiceId?invoiceId=${invoiceId}`,
  );
};

export const DeleteRecordpaymentbyid = (invoicePaymentHistoryId , invoiceId) => {
  return DELETE(
    `/invoice-operations/deletePaymentDetailByInvoicePaymentHistoryId?invoicePaymentHistoryId=${invoicePaymentHistoryId}&invoiceId=${invoiceId}`,
  );
};

export const GetRecordPayments = (id, eventId) => {
  return GET(
    `salesinvoice/getbyeventidanduserid?userId=${id}&eventId=${eventId}`,
  );
};

export const DeleteRecordPayment = (id) => {
  return DELETE(`salesinvoice/delete?salesInvoiceid=${id}`);
};

export const CreatePipeline = (payload) => {
  return POST(`/pipeline/add`, payload);
};

export const deletepipeline = (pipelineId) => {
  return DELETE(`/pipeline/delete?pipelineId=${pipelineId}`);
};

export const GETallpipeline = (userId ) => {
  return GET(`pipeline/getall?userId=${userId}`);
};

export const GETstagesleaddatabypipeline = (pipelineId, userId , memberId) => {
  return GET(
    `pipeline/getstageleaddatabypipelineid?pipelineId=${pipelineId}&userId=${userId}&memberId=${memberId}`,
  );
};

export const Getstagesbypipeline = (pipelineId, userId) => {
  return GET(
    `pipeline/getstagebypipelineid?pipelineId=${pipelineId}&userId=${userId}`,
  );
};

export const MoveLeadToStage = (
  leadId,
  stageId,
  stageType,
  assignId,
  remark,
  requestDto,
) => {
  let url = `leadmaster/changeleadstage?leadId=${leadId}&stageId=${stageId}&stageType=${stageType}&assignId=${assignId}`;

  if (remark && remark.trim()) {
    url += `&remark=${encodeURIComponent(remark.trim())}`;
  }

  return PUT(url, requestDto);
};

export const Getstageleaddatabypipelineidandstage = (
  pipelineId,
  stage,
  userId,
  memberId,
) => {
  return GET(
    `pipeline/getstageleaddatabypipelineidandstage?pipelineId=${pipelineId}&stage=${stage}&userId=${userId}&memberId=${memberId}`,
  );
};

export const GetEmployeeDashBoard = (startDate, endDate, userId) => {
  return GET(
    `pipeline/getperformance?userId=${userId}&startDate=${startDate}&endDate=${endDate}`,
  );
};

export const GetEmployeeperformnace = (
  startDate,
  endDate,
  userId,
  pipelineId,
) => {
  return GET(
    `pipeline/getEmployeePerformance?userId=${userId}&startDate=${startDate}&endDate=${endDate}&pipelineId=${pipelineId}`,
  );
};

export const GETAllCity = () => {
  return GET(`citymaster/getall`);
};
export const Addupdateemployeeexpense = (data) => {
  return POST(`employeeexpense/addOrUpdateTripExpense`, data);
};

export const GEtEmployeeExpensebytype = (
  accountContactId , 
  userId,
  expenseType,
  startDate,
  endDate,
) => {
  return GET(
    `employeeexpense/getTripExpenseByExpenseType?accountContactId=${accountContactId}&userId=${userId}&expenseType=${expenseType}&startDate=${startDate}&endDate=${endDate}`,
  );
};

export const GEtEmpofficeExpensebytype = (
  userId,
  incomeExpenseTypeId ,
  startDate,
  endDate,
  accountContactId,
) => {
  return GET(
    `employeeexpense/getOfficeExpenseByExpenseType?userId=${userId}&incomeExpenseTypeId=${incomeExpenseTypeId}&startDate=${startDate}&endDate=${endDate}&accountContactId=${accountContactId}`,
  );
};

export const AddOrUpdateOfficeExpense = (data) => {
  return POST(`employeeexpense/addOrUpdateOfficeExpense`, data);
};

export const DeleteEmployeeExpenseoffice = (expenseId) => {
  return DELETE(`employeeexpense/deleteOfficeExpense?expenseId=${expenseId}`);
};

export const DeleteEmployeeExpenseTrip = (expenseId) => {
  return DELETE(`employeeexpense/deleteTripExpense?expenseId=${expenseId}`);
};

export const GETtripexpenseById = (expenseId) => {
  return GET(
    `employeeexpense/getTripExpenseByExpenseId?expenseId=${expenseId}`,
  );
};

export const GETofficeexpenseById = (expenseId) => {
  return GET(
    `employeeexpense/getOfficeExpenseByExpenseId?expenseId=${expenseId}`,
  );
};

// export const updatepayoutforoffice = (expenseId, payoutType, payoutAmount) => {
//   return PUT(
//     `employeeexpense/payoutOfficeExpense?expenseId=${expenseId}&payoutType=${payoutType}&payoutAmount=${payoutAmount}`,
//   );
// };

// export const updatepayoutforTrip = (expenseId, payoutType, payoutAmount) => {
//   return PUT(
//     `employeeexpense/payoutTripExpense?expenseId=${expenseId}&payoutType=${payoutType}&payoutAmount=${payoutAmount}`,
//   );
// };

// payoutoffice

export const updatepayoutforoffice = (data) => {
  return PUT(`/employeeexpense/payoutOfficeExpense`, data);
};
export const getOfficePayoutByPayoutId = (payoutId) => {
  return GET(`/employeeexpense/getofficepayoutbypayoutid?payoutId=${payoutId}`);
};

export const getAllOfficePayoutHistoryByExpenseId = (expenseId) => {
  return GET(`/employeeexpense/getallofficepayouthistorybyexpenseid?expenseId=${expenseId}`);
};

export const deleteOfficePayout = (payoutid) => {
  return DELETE(`employeeexpense/deleteOfficepayout?payoutId=${payoutid}`);
};

// trippayout
 export const updatepayoutforTrip = (data) => {
   return PUT(
     `employeeexpense/payoutTripExpense` , data);
 };

export const getAllTripPayoutHistoryByExpenseId = (expenseId) => {
  return GET(`employeeexpense/getalltrippayouthistorybyexpenseid?expenseId=${expenseId}`);
};
export const getTripPayoutByPayoutId = (payoutId) => {
  return GET(`employeeexpense/gettrippayoutbypayoutid?payoutId=${payoutId}`);
};
export const deleteTripPayout = (payoutId) => {
  return DELETE(`/employeeexpense/deletetrippayout?payoutId=${payoutId}`);
}

export const GETALLexpense = (endDate, startDate, userId , accountContactId) => {
  return GET(
    `employeeexpense/getAllExpenses?endDate=${encodeURIComponent(endDate)}&startDate=${encodeURIComponent(startDate)}&userId=${userId}&accountContactId=${accountContactId}`,
  );
};

export const AddStockType = (data) => {
  return POST(`/stocktype/add`, data);
};

export const GetStockTypeByUserId = (userId , mainType) => {
  return GET(`/stocktype/getallbyuserid?userId=${userId}&mainType=${mainType}`);
};

export const DeleteStockType = (id) => {
  return DELETE(`stocktype/delete?id=${id}`);
};

export const UpdateStockType = (id, data) => {
  return PUT(`stocktype/update?id=${id}`, data);
};

export const AddPuchase = (data) => {
  return POST(`purchaseorder/add-update`, data);
};

export const AddAutoManualPOApi = (data) => {
  return POST(`sot/manual-po/add-update`, data);
};


export const GetAllPurchase = (userId) => {
  return GET(`/purchaseorder/getbyuser?userId=${userId}`);
};

export const AddStorePO = (data) => {
  return POST(`/storepo/add`, data);
};

export const StatusStorePO = (poid, status) => {
  return POST(`/storepo/updatestatus/${poid}?status=${status}`);
};


export const GetAllStorePO = (userId) => {
  return GET(`/storepo/getbyuser?userId=${userId}`);
};

export const UpdateUserPlan = (date, id, otp) => {
  return PUT(
    `/userplanshistory/updateuserplandate?date=${date}&userId=${id}&otp=${otp}`,
  );
};

export const DeleteUserById = (id, otp , isAdmin) => {
  return DELETE(`/user/deleteuserbyid?userId=${id}&otp=${otp}&isAdmin=${isAdmin}`);
};

export const UserBlock = (id, otp) => {
  return PUT(`user/userblock?otp=${otp}&userId=${id}`);
};

export const DeletePurchase = (id) => {
  return DELETE(`/purchaseorder/delete/${id}`);
};

export const DeleteIssue = (id) => {
  return DELETE(`/storepo/delete/${id}`);
};

export const GetAllStorePOCode = (id) => {
  return GET(`/purchaseorderreturn/getallpocodes?userId=${id}`);
};

export const GetDetailbyPOCode = (pocode, id) => {
  return GET(`/purchaseorderreturn/getpodetails?pocode=${pocode}&userId=${id}`);
};

export const AddStorePOReturn = (data) => {
  return POST(`/purchaseorderreturn/add-update`, data);
};

export const GetAllPOReturn = (id) => {
  return GET(`/purchaseorderreturn/getbyuser?userId=${id}`);
};

export const GetPORById = (id) => {
  return GET(`/purchaseorderreturn/getbyporid?porId=${id}`);
};

export const DeletePOReturn = (id) => {
  return DELETE(`/purchaseorderreturn/delete/${id}`);
};

export const AddStoreIssueReturn = (data) => {
  return POST(`/storeissuereturn/add-update`, data);
};

export const DeleteIssueReturn = (id) => {
  return DELETE(`/storeissuereturn/delete/${id}`);
};

export const GetAllStoreIssueReturnPOCode = (id) => {
  return GET(`/storeissuereturn/getallpocodes?userId=${id}`);
};

export const GetSIRById = (id) => {
  return GET(`/storeissuereturn/getbysir?sirId=${id}`);
};

export const GetAllIssueReturn = (id) => {
  return GET(`/storeissuereturn/getbyuser?userId=${id}`);
};

export const GetIssueDetailbyPOCode = (pocode, id) => {
  return GET(
    `/storeissuereturn/getstoreissuedetails?pocode=${pocode}&userId=${id}`,
  );
};

export const GetOPBItems = (id, pageNo, size, userid , itemName) => {
  return GET(
    `/rawmaterialopb/getbycategory?categoryId=${id}&pageNo=${pageNo}&pageSize=${size}&userId=${userid}&itemName=${itemName}`,
  );
};

export const AddOPB = (data) => {
  return POST(
    `/rawmaterialopb/save
`,
    data,
  );
};

export const GetStockLedger = (fromDate, id, toDate, userId) => {
  return GET(
    `/stockledger/get?fromDate=${fromDate}&rawMaterialId=${id}&toDate=${toDate}&userId=${userId}`,
  );
};

export const GetStockReport = (itemName, id, catId, stockId, fromDate, toDate, pageNo = 1, pageSize = 20, kitchenTypeId = 0) => {
  return GET(
    `/datewisestockreport/get?categoryId=${catId}&pageNo=${pageNo}&pageSize=${pageSize}&stockTypeId=${stockId}&userId=${id}&fromDate=${fromDate}&toDate=${toDate}&itemName=${itemName}&kitchenTypeId=${kitchenTypeId}`,
  );
};

export const GetStockPdfReport2 = (id, catId, stockId, isCompanyDetails, itemName , kitchenTypeId = 0) => {
  return GET(
    `datewisestockreport/pdf?categoryId=${catId}&stockTypeId=${stockId}&userId=${id}&isCompanyDetails=${isCompanyDetails}&itemName=${itemName}&kitchenTypeId=${kitchenTypeId}`,
  );
};

export const GetStockExcelReport = (id, catId, stockId, fromDate, toDate, itemName, kitchenTypeId = 0) => {
  return GET(
    `datewisestockreport/excel?categoryId=${catId}&pageNo=1&pageSize=500&stockTypeId=${stockId}&userId=${id}&fromDate=${fromDate}&toDate=${toDate}&itemName=${itemName}&kitchenTypeId=${kitchenTypeId}`,
  );
};

export const GetStockPdfReport = (id, catId, stockId, fromDate, toDate, isCompanyDetails, itemName, kitchenTypeId = 0) => {
  return GET(
    `datewisestockreport/pdf?categoryId=${catId}&stockTypeId=${stockId}&userId=${id}&fromDate=${fromDate}&toDate=${toDate}&isCompanyDetails=${isCompanyDetails}&itemName=${itemName}&kitchenTypeId=${kitchenTypeId}`,
  );
};

export const GetStockLedgerPdfReport = (id, rawMaterialId, fromDate, toDate,isCompanyDetails) => {
  return GET(
    `stockledger/pdf?rawMaterialId=${rawMaterialId}&userId=${id}&fromDate=${fromDate}&toDate=${toDate}&isCompanyDetails=${isCompanyDetails}`,
  );
};


export const GetPurchasePdfReport2 = (id, poId, isCompanyDetails, isPrice) => {
  return GET(
    `purchaseorder/pdf?poId=${poId}&userId=${id}&isCompanyDetails=${isCompanyDetails}&isPrice=${isPrice}`,
  );
};


export const AddUpgrademodule = (data) => {
  return POST(
    `upgradedmodule/addorupdateupgradedmodule
`,
    data,
  );
};

export const GetAllUpgradeModule = (userId) => {
  return GET(`upgradedmodule/getall?userId=${userId}`);
};

export const SaveUpgradeModule = (data) => {
  return POST(`/upgradedmodule/adduserupgrademodule`, data);
};

export const isActiveUpgradeModule = (isActive, otp, userId, moduleId) => {
  return PUT(
    `upgradedmodule/isActive?isActive=${isActive}&otp=${otp}&userId=${userId}&moduleId=${moduleId}`,
  );
};

export const GetAllChefReq = (id) => {
  return GET(`/chefrequisition/getbyuser?userId=${id}`);
};

export const UpdateChefReqStatus = (crId, status) => {
  return PUT(`/chefrequisition/updatestatus/${crId}?status=${status}`);
};

export const AddChefReq = (data) => {
  return POST(`/chefrequisition/add-update`, data);
};

export const DeleteChefReq = (crId) => {
  return DELETE(`/chefrequisition/delete/${crId}`);
};
export const GetAllStoreReq = (id) => {
  return GET(`/storerequisition/getbyuser?userId=${id}`);
};
export const UpdateStoreReqStatus = (crId, status) => {
  return PUT(`/storerequisition/updatestatus/${crId}?status=${status}`);
};
export const AddStoreReq = (data) => {
  return POST(`/storerequisition/add-update`, data);
};
export const DeleteStoreReq = (crId) => {
  return DELETE(`/storerequisition/delete/${crId}`);
};

export const GenerateSOT = (data) => {
  return POST(`/sot/generate`, data);
};

export const Addleadsource = (name, userId) => {
  return POST(`/lead-source/add?name=${encodeURIComponent(name)}&userId=${userId}`);
};

export const GetAllLeadSource = (userId ) => {
  return GET(`/lead-source/getall?userId=${userId}`);
};

export const DeleteLeadSource = (leadSourceId) => {
  return DELETE(`/lead-source/deletebyid?leadSourceId=${leadSourceId}`);
};

export const updateLeadSource = (leadSourceId, name  , userId) => {
  return PUT(
    `/lead-source/update?leadSourceId=${leadSourceId}&name=${encodeURIComponent(name)}&userId=${userId}`,
  );
};

export const UpdateFontSizeReport = (data) => {
  return PUT(`/admintemplatemodule/updatefontandfontsizebyid`, data);
};

export const GetAllSOT = (userId) => {
  return GET(`/sot/getall?userId=${userId}`);
};

export const AddAcceptSOT = (data) => {
  return POST(`/sot/accept`, data);
};

export const AddAcceptCrockerySOT = (data) => {
  return POST(`/sotcrockery/accept`, data);
};

export const getMultipleSotData = (sotIds, userId) => {
  return GET(`/sot/get-multiple-sot-data?sotIds=${sotIds}&userId=${userId}`);
};

export const addUpdateMultipleSotData = (data) => {
  return POST(`/sot/add-update-multiple-sot-data`, data);
};

export const AddGenerateAutoManualSOT = (data) => {
  return POST(`/sot/update-details`, data);
};

export const AddGenerateAutoManualCrockerySOT = (data) => {
  return POST(`/sotcrockery/update-details`, data);
};

export const GenerateManualPO = (sotId, userId) => {
  return POST(`sot/generate-manual-po/${sotId}?userId=${userId}`);
};

export const GenerateCrockeryManualPO = (sotId, userId) => {
  return POST(`sotcrockery/generate-manual-po/${sotId}?userId=${userId}`);
};

export const GetAllAutoManualPO = (userId) => {
  return GET(`/sot/manual-po/?userId=${userId}`);
};

export const AddReturnSOT = (data) => {
  return POST(`/sot/return`, data);
};

export const AddReturnCrockerySOT = (data) => {
  return POST(`/sotcrockery/return`, data);
};

export const AddGenerateInvoice = (data) => {
  return POST(`/sot/generate-invoice`, data);
};

export const addleadsubsource = (data) => {
  return POST(`/lead-subsource/add`, data);
};

export const Getallsubsource = (userId) => {
  return GET(`/lead-subsource/getall?userId=${userId}`);
};

export const DeleteLeadsubsource = (leadSourceId) => {
  return DELETE(`/lead-subsource/deletebyid?leadSourceId=${leadSourceId}`);
};

export const updateLeadSubSource = (leadSourceId, data) => {
  return PUT(`/lead-subsource/update?leadSourceId=${leadSourceId}`, data);
};

export const GetLeadSubSourceBysubSourceId = (leadSourceId) => {
  return GET(`lead-subsource/getallbysourceid?leadSourceId=${leadSourceId}`);
};

export const GetAllIncome = ({
  bankAccountId,
  cashAccountId,
  startDate,
  endDate,
  paymentMode,
  typeId,
  userId,
  accountType ,
}) => {
  return GET(
    `income/get?bankAccountId=${bankAccountId}&cashAccountId=${cashAccountId}&startDate=${startDate}&endDate=${endDate}&paymentMode=${paymentMode}&userId=${userId}&accountType=${accountType}&typeId=${typeId}`,
  );
};
export const GetAllProfitandloss = ({ startDate, endDate, userId }) => {
  return GET(
    `profit-and-loss/get?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}&userId=${userId}`,
  );
};

export const AddCheckList = (data) => {
  return POST(`/eventlabourchecklist/addorupdate`, data);
};

export const GetCheckList = (eventFunctionId, eventId, userId) => {
  return GET(
    `eventlabourchecklist/getallchecklist?eventFunctionId=${eventFunctionId}&eventId=${eventId}&userId=${userId}`,
  );
};

export const GenratsupereexpenseReport = ({
  startDate,
  endDate,
  expenseId,
  type,
  userId,
  incomeExpenseTypeId,
  accountContactId,
}) => {
  const params = new URLSearchParams({
    startDate: (startDate),
    endDate: (endDate),
    expenseId,
    type,
    userId,
  });

  if (incomeExpenseTypeId != null && incomeExpenseTypeId !== "") {
    params.append("incomeExpenseTypeId", incomeExpenseTypeId);
  }
  if (accountContactId != null && accountContactId !== "") {
    params.append("accountContactId", accountContactId);
  }

  return POST(`report/generate-expense-report?${params.toString()}`);
};

export const GenrateSuperInvoiceReport = ({ invoiceId }) => {
  return POST(`report/generate-invoice-report?invoiceId=${invoiceId}`);
};

export const GenrateSuperIncomeReport = ({
  startDate,
  endDate,
  bankAccountId,
  cashAccountId,
  paymentMode,
  accountType,
  typeId,
  userId,
}) => {
  return POST(
    `report/generate-income-report?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}&bankAccountId=${bankAccountId}&cashAccountId=${cashAccountId}&paymentMode=${paymentMode}&accountType=${accountType}&typeId=${typeId}&userId=${userId}`,
  );
};

export const AddCashAccount = (id, payload) => {
  return POST(`/cash-opb/addUpdate?id=${id}`, payload);
};

export const DeleteCashAccount = (id) => {
  return DELETE(`/cash-opb/deletebyid?id=${id}`);
}

export const GetAllTermsCondition = (userId) => {
  return GET(`/termscondition/getall?userId=${userId}`);
};

export const DeleteTerms = (Id) => {
  return DELETE(`/termscondition/delete?id=${Id}`);
};

export const AddandUpdateTerms = (data) => {
  return POST(`/termscondition/add-update`, data);
};

export const Deletebank = (Id) => {
  return DELETE(`/bankdetails/deletebyid?bankAccountId=${Id}`);
};

export const CashAccountGetAll = (userId, isPrimary = "") => {
  return GET(
    `/cash-opb/getallbyuserid?userId=${userId}&isPrimary=${
      isPrimary === true ? true : ""
    }`,
  );
};

export const CashAccountOPBGetByid = (id) => {
  return GET(`/cash-opb/getbyid?id=${id}`);
};

export const AddReciptpayment = (id, payload) => {
  return POST(`/account-entry/add-update?id=${id}`, payload);
};

export const DeleteReciptPayment = (accountEntryId) => {
  return DELETE(`/account-entry/deletebyid?accountEntryId=${accountEntryId}`);
};

export const GenerateVoucherNoForPaymentReceipt = ({
  accountType,
  entryType,
  userId,
}) => {
  return GET(
    `/account-entry/generateVoucherNo?accountType=${accountType}&entryType=${entryType}&userId=${userId}`,
  );
};

export const GETallbytypereciptpayment = ({
  accountType,
  bankAccountId,
  cashTypeId,
  endDate,
  entryType,
  paymentMode,
  startDate,
  userId,
}) => {
  return GET(
    `/account-entry/getallbytype?accountType=${accountType}&bankAccountId=${bankAccountId}&cashTypeId=${cashTypeId}&endDate=${endDate}&entryType=${entryType}&paymentMode=${paymentMode}&startDate=${startDate}&userId=${userId}`,
  );
};

export const Getbyidreciptpayment = (accountEntryId) => {
  return GET (`/account-entry/getbyid?accountEntryId=${accountEntryId}`)
} 

export const AddExtraCharges = ( payload) => {
  return POST(`/extracharges/saveOrUpdate`, payload);
};


export const GetExtraCharges = (eventFunctionId, userId, eventId) => {
  return GET (`/extracharges/get?eventFunctionId=${eventFunctionId}&userId=${userId}&eventId=${eventId}`)
} 

export const GetPurchaseReturnPdf = (isCompanyDetails , porId , userId, isPrice ) => {
  return GET (`/purchaseorderreturn/pdf?isCompanyDetails=${isCompanyDetails}&porId=${porId}&userId=${userId}&isPrice=${isPrice}`)
} 


export const GetStoreIssuePdf = (isCompanyDetails , porId , userId ) => {
  return GET (`/storepo/pdf?isCompanyDetails=${isCompanyDetails}&poId=${porId}&userId=${userId}`)
}

export const GetStoreIssueReturnPdf = (isCompanyDetails , porId , userId ) => {
  return GET (`/storeissuereturn/pdf?isCompanyDetails=${isCompanyDetails}&sirId=${porId}&userId=${userId}`)
}

export const GetChefRequisitionPdf = (isCompanyDetails, lang, porId, userId) => {
  return GET (`/chefrequisition/pdf?isCompanyDetails=${isCompanyDetails}&lang=${lang}&crId=${porId}&userId=${userId}`)
}
export const GetStoreRequisitionPdf = (isCompanyDetails, lang, porId, userId) => {
  return GET(`/storerequisition/pdf?isCompanyDetails=${isCompanyDetails}&lang=${lang}&crId=${porId}&userId=${userId}`);
};


export const AddCategoryImages = (payload) => {
  return POST(`/catbgselection/add-update`, payload);
};


export const GetCategoryImg = (userId , isCatImg ) => {
  return GET (`/catbgselection/getall?isCatImg=${isCatImg}&userId=${userId}`)
}

export const DeleteCategoryImg = (id) => {
  return DELETE(`/catbgselection/delete/${id}`);
};


export const AddAccountTranfer = (payload) => {
  return POST(`/amount-transfer/add-update`, payload);
};

export const GETalltransfer = (endDate, startDate , userId) => {
  return GET(`/amount-transfer/getall?endDate=${endDate}&startDate=${startDate}&userId=${userId}`);
};

export const GETById = (id , userId) => {
  return GET(`/amount-transfer/getbyid?id=${id}&userId=${userId}`);
};

export const Deletetranferbyid = (id) => {
  return DELETE(`/amount-transfer/deletebyid?id=${id}`);
};

export const getbankcashbook = (userId, startDate, paymentMode, endDate, cashAccountId, bankAccountId, accountType) => {
  return GET(`account-ledger/?accountType=${accountType}&cashAccountId=${cashAccountId || ''}&endDate=${endDate}&paymentMode=${paymentMode}&startDate=${startDate}&userId=${userId}&bankAccountId=${bankAccountId || ''}`);
};

export const AddLogs = (payload) => {
  return POST(`/user-logs/saveLog`, payload);
};

export const bankcashbookreport = (userId, startDate, endDate, paymentMode, cashAccountId, bankAccountId, accountType) => {
  return POST(`/report/generate-account-ledger-report?userId=${userId}&startDate=${startDate}&endDate=${endDate}&paymentMode=${paymentMode}&cashAccountId=${cashAccountId}&bankAccountId=${bankAccountId || ''}&accountType=${accountType}`);
};

export const getreceivablepayable = (userId, startDate, endDate, entryType) => {
  const params = new URLSearchParams();
  params.append("userId", userId);
  params.append("entryType", entryType);
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  
  return GET(`/recievale-payable/getallmonthwise?${params.toString()}`);
};

export const DeleteExtraChargeRow = (id) => {
  return DELETE(`/extracharges/deleteRow?rowId=${id}`);
};

export const DeleteExtraChargeHeading = (id) => {
  return DELETE(`/extracharges/deleteHeading?headingId=${id}`);
};

export const AddAccountcontactmaster = (data) => {
  return POST('/account-contact/add-update', data);
};

export const GetAllAccountContactMaster = (userId) => {
  return GET(`account-contact/getall?userId=${userId}`);
};

export const deleteAccountconstactMaster = (accountContactId) => {
  return DELETE(`/account-contact/deletebyid?accountContactId=${accountContactId}`);
  
};
export const GETbyidaccountcontactmaster = (accountContactId) => {
  return GET(`/account-contact/getbyid?accountContactId=${accountContactId}`);
};

export const AddUpdateIncomeExpenseType = (data) => {
  return POST(`/income-expense-type/add-update`, data);
};

export const GETAllByuserIdincomeExpensetype = (userId, type) => {
  return GET(`/income-expense-type/getall?userId=${userId}&type=${type}`);
};

export const DeleteIncomeexpenseType = (id) => {
  return DELETE(`/income-expense-type/deletebyid?id=${id}`);
};

export const getbyidincomeexpensettype = (id) => {
  return GET(`/income-expense-type/getbyid?id=${id}`);
};

export const Deletesyncmenuallocationandrawmaterial = (eventId) => {
  return DELETE(`/eventmaster/syncmenuallocationandrawmaterial?eventId=${eventId}`);
};

export const AddupadteAItemplate = (data) => {
  return POST(`/ai-template/add-update`, data);
};
export const GETALLaiteplate = (isActive = "") => {
  return GET(
    isActive === "" || isActive === null || isActive === undefined
      ? `/ai-template/getall`
      : `/ai-template/getall?isActive=${isActive}`
  );
};

export const Deleteaitemplate = (id) => {
  return DELETE(`/ai-template/delete?id=${id}`);
};


export const AddInfoAutoManualPO = (data) => {
  return POST(`/sot/manual-po/info`, data);
};


export const PrintAutoManualPO = (sotPoId, userId) => {
  return GET(`/sot/manual-po/pdf/${sotPoId}?isCompanyDetails=1&userId=${userId}`);
};


export const GetInfoAutoManualPO = (sotPoId) => {
  return GET(`/sot/manual-po/info/${sotPoId}`);
};

export const GetGstReportData = (fromDate, toDate, userId, type , gstType) => {
  return GET(`/gst-report/data?fromDate=${fromDate}&toDate=${toDate}&userId=${userId}&type=${type}&gstType=${gstType}`);
};


export const GetGstReportPdf = (fromDate, toDate, userId, type , gstType) => {
  return GET(`/gst-report/pdf?fromDate=${fromDate}&toDate=${toDate}&userId=${userId}&type=${type}&gstType=${gstType}`);
};

export const getAllMemberData = (userId) => {
  return GET(`/employeeexpense/getallmemberdata?userId=${userId}`);
};

export const Getsummaryforclientinsightdashboard = (userId) => {
  return GET(`/dashboard/admin/summery?userId=${userId}`);
};

export const GETuserloglist = (isActive) => {
  return GET(`/user/getalllogsuser?isActive=${isActive}`);
};

export const AddReportRights = (data) => {
  return POST(`/role-report-rights/save`, data);
};


export const GetReportRights = (roleId, userId) => {
  return GET(`role-report-rights/${roleId}?userId=${userId}`);
};


export const isactiveforAimodule = (id, isActive) => {
  return PUT(`/ai-template/isactive?id=${id}&isActive=${isActive}`);
};

export const reportpdfforvendorparty = (type, userId) => {
  return GET(`/partymaster/report/pdf?type=${type}&userId=${userId}`);
};

export const reporteexcelforvendorparty = (type, userId) => {
  return GET(`/partymaster/report/excel?type=${type}&userId=${userId}`);
};




export const Getgenerateusermenuitemrawmaterialexcel = (userId) => {
  return POST(`/report/generate-user-menuitem-rawmaterial-excel?userId=${userId}`);
};

export const GetAllCrCodes = ( userId) => {
  return GET(`/storepo/getallcrcodes?userId=${userId}`);
};

export const GetMaterialByCrcode = ( crcode, userId ) => {
  return GET(`/storepo/getbycrcode?crcode=${crcode }&userId=${userId}`);
};

export const AddEventfunctionmanagerassign = (data) => {
  return POST(`/eventmaster/addfunctionmanagerassign`, data);
};

export const getallassignfunctionbyevent = (eventId) => {
  return GET(`/eventmaster/getallassignfunctionbyevent?eventId=${eventId}`);
};

export const geteventrmDisposable = (
  eventId,
  rawMatCatId,
  userId,
) => {
  return GET(
    `/event-rm-Disposable/get?eventId=${eventId}&rawMatCatId=${rawMatCatId}&userId=${userId}`,
  );
};

export const addeventrmDisposable = (data) => {
  return POST(`/event-rm-Disposable/save`, data);
};

export const reportpdfforrmdisposable = (
  eventId,
  isCompanyDetails,
  isWithPrice,
  userId,
  lang,
  rawCategoryId,
  isAllItems,
  isWithImage
) => {
  return GET(
    `/event-rm-Disposable/pdf?eventId=${eventId}&isAllItems=${isAllItems}&isCompanyDetails=${isCompanyDetails}&isWithPrice=${isWithPrice}&lang=${lang}&rawCategoryId=${rawCategoryId}&userId=${userId}&isWithImage=${isWithImage}`,
  );
};

export const getallcaptainrecipe = (userId , status) => {
  return GET(`/captain-receipe-master/getallbyuserid?userId=${userId}&status=${status}`);
};

export const getCaptainReceipeById = (id ,isSync) => {
  return GET(`/captain-receipe-master/getbyid?id=${id}&isSync=${isSync}`); 
};

export const addupdatecaptainreceipe = (data) => {
  return POST(`/captain-receipe-master/add-update`, data);
};

export const deletecaptainreceipe = (id) => {
  return DELETE(`/captain-receipe-master/deletebyid?id=${id}`);
};

export const updateCaptainReceipeStatusById = (id, status) => {
  return PUT(`/captain-receipe-master/updatestatusbyid?id=${id}&status=${status}`);
};
export const getsynccaptainrecipe = (userId) =>{
  return GET(`captain-receipe-master/syncallcaptainreceiperawmaterial?userId=${userId}`);
}


export const purchasorderexcel = (poId, userId) => {
  return GET(`/purchaseorder/excel?poId=${poId}&userId=${userId}`);
};

export const purchaseorderreturnexcel = (porId, userId) => {
  return GET(`/purchaseorderreturn/excel?porId=${porId}&userId=${userId}`);
}

export const storeissueexcel = (poId, userId) => {
  return GET(`/storepo/excel?poId=${poId}&userId=${userId}`);
};

export const storeissuereturnexcel = (sirId, userId) => {
  return GET(`/storeissuereturn/excel?sirId=${sirId}&userId=${userId}`);
};

export const addupadtemenuplanningmaster = (data) => {
  return POST(`/category-wise-package/add-update`, data);
};

export const getmenuplanningmaster = (userId) => {
  return GET(`/category-wise-package/getall?userId=${userId}`);
};

export const getbymenucategorywithtype = (menuCategoryId, type, userId) => {
  return GET(`/category-wise-package/getbytype?menuCategoryId=${menuCategoryId}&type=${type}&userId=${userId}`);
}


export const GetAllAiTemplates = (userId) => {
  return GET(`/ai-template/getall?isActive=true&userId=${userId}`);
};

export const GenerateMenuAi = (data) => {
  return POST(`/ai-template/generateaidata`, data);
};

export const AddBanquet = (data) => {
  return POST(`/banquethall/add-update`, data);
};


export const DeleteBanquet = (id,userId) => {
  return DELETE(`/banquethall/delete/${id}?userId=${userId}`);
};


export const GetAllBanquet = (userId) => {
  return GET(`/banquethall/getall?userId=${userId}`);
};


export const ChangeStatusBanquet = (id) => {
  return POST(`banquethall/toggle-status/${id}`);
};


export const DeleteAutoManual = (sotPoId) => {
  return DELETE(`/sot/manual-po/delete/${sotPoId}`);
};


export const DeleteSOT = (sotId) => {
  return DELETE(`/sot/delete/${sotId}`);
};

export const DeleteCrockerySOT = (sotId) => {
  return DELETE(`/sotcrockery/delete/${sotId}`);
};

export const GetStorePoPdf = (userId, storePoId , isCompanyDetails ) => {
  return GET(`/storeissuereturn/pdf-by-storepo?userId=${userId}&storePoId=${storePoId}&isCompanyDetails=${isCompanyDetails}`);
};

export const GenerateMenuLink = (payload) => {
  return POST(`/menu-share/generate`,payload);
};


export const VerifyMenuLink = (payload) => {
  return POST(`/menu-share/verify`,payload);
}



export const StorePoPricePdf = (payload, userId) => {
  return POST(`/storepo/pdfwithprice?userId=${userId}`,payload);
}

export const CustomPackagePdf = (payload) => {
  const {
    userId,
    adminTemplateId,
    customPackageId,
    catFontId,
    catFontSize,
    itemFontId,
    itemFontSize,
    lang,
    sloganFontId,
    sloganFontSize,
  } = payload;

  const params = new URLSearchParams({
    userId,
    adminTemplateId,
    customPackageId,
    catFontId,
    catFontSize,
    itemFontId,
    itemFontSize,
    lang,
    sloganFontId,
    sloganFontSize,
  });

  return GET(`/custompackage/report/pdf?${params.toString()}`);
};

// export const CustomPackagePdf = (data) => {
//   return GET(`/custompackage/report/pdf`, data);
// };

export const addupdatefollowupmodal = (data) => {
  return PUT(`/leadmaster/addorupdatefollowup`, data);
};

export const AddBanquetShiftApi = (payload) => {
  return POST(`/banquetshift/add-update`,payload);
}


export const GetAllBanquetShift = (userId) => {
  return GET(`/banquetshift/getall?userId=${userId}`);
};


export const DeleteBanquetShift = (id) => {
  return DELETE(`/banquetshift/delete/${id}`);
};

export const BanquetShiftStatus = (id) => {
  return POST(`/banquetshift/toggle-status/${id}`);
}

export const AssignEventsToChild = (payload) => {
  return POST(`/eventmaster/assigneventstochild`,payload);
}

export const IsChildUserExist = (userId) => {
  return GET(`/user/isChildUserExist?userId=${userId}`);
};

export const AvailabilityCheck = (userId, bookingDate, hallIds, eventId) => {
  const hallIdParams = Array.isArray(hallIds)
    ? hallIds.map((id) => `hallIds=${id}`).join("&")
    : `hallIds=${hallIds}`;
  return GET(`/banquetshift/availability?userId=${userId}&bookingDate=${bookingDate}&${hallIdParams}&eventId=${eventId}`);
};

export const OverAllAvailabilityCheck = (userId, endDate , startDate) => {
  return GET(`/banquetshift/datewise-availability?userId=${userId}&startDate=${startDate}&endDate=${endDate}`);
};

export const  addeventremrk = (data) => {
  return POST(`eventremark/add`, data);
};

export const deleteeventremark = (id) => {
  return DELETE(`eventremark/deletebyid?id=${id}`);
};

export const GetAllEventRemarks = (remarkTypeName , userId) =>{
return GET(`/eventremark/getallbyuserid?remarkTypeName=${remarkTypeName}&userId=${userId}`);
}

export const geteventremarkbyid = (id) => {
  return GET(`eventremark/getbyid?id=${id}`);
}
 
export const  updateeventremark = ( id , data) => {
  return PUT(`eventremark/update?id=${id}`, data);
};
export const AvailabilityCheckByFunction = (userId, bookingDate, hallId, eventFunctionId) => {
  return GET(`/banquetshift/availability-by-function?userId=${userId}&bookingDate=${bookingDate}&hallId=${hallId}&eventFunctionId=${eventFunctionId}`);
};


export const AddRoom = (payload) => {
  return POST(`/room/add`,payload);
}



export const DeleteRoom = (id) => {
  return DELETE(`/room/delete?roomId=${id}`);
};

export const GetAllRooms = (userId) => {
  return GET(`/room/getallactivebyuserid?userId=${userId}`);
};

export const UpdateRoom = (id, payload) => {
  return PUT(`/room/update?id=${id}`, payload);
}

export const Addupadtejournalvoucher = (data) => {
  return POST(`/journalvoucher/add-update`, data);
};

export const deletejournalvoucher = (id) => {
  return DELETE(`/journalvoucher/delete/${id}`);
};

export const getbyjournalvoucherbyuserid = (userId) => {
  return GET(`/journalvoucher/getbyuser?userId=${userId}`);
};

export const Visible = (id, isVisible) => {
  return PUT(`/user/isVisible?userId=${id}&isVisible=${isVisible}`);
}


export const genaratepdfjounalvoucher = (isCompanyDetails, userId, voucherId) => {
  return GET(`/journalvoucher/pdf?isCompanyDetails=${isCompanyDetails}&userId=${userId}&voucherId=${voucherId}`);
};



export const getMenuItemCaptainReceipeByMenuId = (menuItemId, userId, isSync) => {
  return GET(`/menuitems/getmenuitemcaptainreceipebymenuid?menuItemId=${menuItemId}&userId=${userId}&isSync=${isSync}`);
};

export const syncallcaptainreceiperate = (userId) => {
  return GET(`/menuitems/syncallcaptainreceiperate?userId=${userId}`);
};

export const getDefaultExtraFunctionquotation = (isOn, quotationId) => {
  return GET(`/quotation/getdefaultextrafunction?isOn=${isOn}&quotationId=${quotationId}`);
};

export const AddDailyStockManage = (data) => {
  return POST(`/store-manage/save`, data);
};

export const GetAllDailyStockManage = (userId) => {
  return GET(`/store-manage/getall?userId=${userId}`);
};

export const ViewDailyStock = (id) => {
  return GET(`/store-manage/getbyid/${id}`);
};



export const GetDailyStockManage = (
  userId,
  categoryId,
  stockTypeId,
  page = 0,
  size = 20
) => {
  return GET(
    `/store-manage/load-today?userId=${userId}&categoryId=${categoryId}&stockTypeId=${stockTypeId}&page=${page}&size=${size}`
  );
};

export const SearchItemDailyStockManage = (
  userId,
  itemName,
  categoryId,
  stockTypeId,
  page = 0,
  size = 20
) => {
  return GET(
    `/store-manage/load-today?userId=${userId}&itemName=${itemName}&categoryId=${categoryId}&stockTypeId=${stockTypeId}&page=${page}&size=${size}`
  );
};


export const upadtelockinquotation = (quotationId) => {
  return PUT(`/quotation/lock-quotation?quotationId=${quotationId}`);
};

export const getEventVendorDatainviewmanger = (eventFunctionId , eventId , type) =>{
  return GET (`/eventmaster/geteventvendordata?eventFunctionId=${eventFunctionId}&eventId=${eventId}&type=${type}`);
};

export const getexcelforqutation = (startDate, endDate, userid , id , isVenue) => {
  return GET(`/quotation/quotationexcel?userid=${userid}&startDate=${startDate}&endDate=${endDate}&id=${id}&isVenue=${isVenue}`);
};

export const getexcelforinvoice = (startDate , endDate , userid , id , isVenue) => {
  return GET(`/invoice/invoiceexcel?userid=${userid}&startDate=${startDate}&endDate=${endDate}&id=${id}&isVenue=${isVenue}`);
};

export const AccountLedgerExcel = (startDate , endDate , userid,partyId , vendorCat, ledgerType ) => {
  return GET(`/vendorpayment/account-ledger-excel?userId=${userid}&partyId=${partyId}&startDate=${startDate}&endDate=${endDate}&vendorCat=${vendorCat}&type=${ledgerType}`);
};

export const AccountLedgerPdf = (startDate , endDate , userid,partyId  , vendorCat, ledgerType ) => {
  return GET(`/vendorpayment/account-ledger-pdf?userId=${userid}&partyId=${partyId}&startDate=${startDate}&endDate=${endDate}&vendorCat=${vendorCat}&type=${ledgerType} `);
};


export const invoicecodeforadmin = () => {
  return GET(`/invoice/getinvoicecode`);
};



export const AddBanquetRights = (data,userId) => {
  return POST(`/banquet-rights/add?userId=${userId}`, data);
};

export const GetBanquetRightsByUserId = (userId ,memberId) => {
  return GET(`/banquet-rights/getbyuser?userId=${memberId}&memberId=${userId}`);
};


export const StoreReportSot = (sotId ) => {
  return GET(`/sot/storereport/${sotId}`);
};

export const SotReportPdf = (sotId, isCompanyDetails, userId  ) => {
  return GET(`/sot/pdf/${sotId}?isCompanyDetails=${isCompanyDetails}&userId=${userId}`);
};

export const CrockerySotReportPdf = (sotId, isCompanyDetails, userId  ) => {
  return GET(`/sotcrockery/pdf/${sotId}?isCompanyDetails=${isCompanyDetails}&userId=${userId}`);
};


export const AddGuest = (data) => {
  return POST(`/tester-master/add-update`, data);
};

export const DeleteGuestById = (id) => {
  return DELETE(`/tester-master/deletebyid?id=${id}`);
};

export const GetAllGuest = (userId ) => {
  return GET(`/tester-master/getall?userId=${userId}`);
};


export const Addupdategroundtask = (data) =>{
  return POST (`/eventgroundtask/addorupdate` , data) ;
};

export const GETALLAssignaskmanager = (isActive , resourceType , userId) => {
  return GET (`/eventgroundtask/getall?isActive=${isActive}&resourceType=${resourceType}&userId=${userId}`);
};

export const Deleteassignmanger = (id) =>{
  return DELETE(`/eventgroundtask/delete?id=${id}`);
};

export const updateStatusassignmanger = (id , isActive) => {
  return PUT (`/eventgroundtask/update-status?id=${id}&isActive=${isActive}`);
};
export const GenerateTesterLink = (payload ) => {
  return POST(`/event-food-testing/generate-link`,payload);
};



export const GetFoodTestingMenu = (payload ) => {
  return POST(`/event-food-testing/getMenu`,payload);
};


export const SaveTesterMenu = (payload ) => {
  return POST(`/event-food-testing/add-update`,payload);
};


export const GetAllGeneratedLinkGuest = (eventId , eventFunctionId  ) => {
  return GET(`/event-food-testing/getall?eventId=${eventId}&eventFunctionId=${eventFunctionId}`);
};


export const addupdateeventvendordata = (data) =>{
  return POST(`/eventmaster/addupdateeventvendordata`, data);
};

export const ChangePreparationStatus = (eventId, status) => {
  return POST(`/menupreparation/updatePreparationStatus?eventId=${eventId}&status=${status}`);
};

export const GetPreparationStatus = (eventId ) => {
  return GET(`/menupreparation/getPrepStatus?eventId=${eventId}`);
};


export const AddChildRole = (payload ) => {
  return POST(`/role-hierarchy/addorupdate`,payload);
};


export const GetChildRolesByParentId = (roleId ,userId ) => {
  return GET(`/role-hierarchy/getchildren?userId=${userId}&roleId=${roleId}`);
};


export const DeleteChildRole = (id) =>{
  return DELETE(`/role-hierarchy/deletebyid?hierarchyId=${id}`);
};

export const GetRoleTree = (roleId ,userId  ) => {
  return GET(`/role-hierarchy/gettree?userId=${userId}&roleId=${roleId}`);
};


export const GetParentUser = (roleId ,userId  ) => {
  return GET(`/user/parentuser?userId=${userId}&roleId=${roleId}`);
};


export const AddRevisionHistory = (payload ) => {
  return POST(`/revision-history/addorupdate`,payload);
};


export const GetAllRevisionHistory = (eventId ,userId ) => {
  return GET(`/revision-history/getall?userId=${userId}&eventId=${eventId}`);
};

export const DeleteRevisionHistory = (id) =>{
  return DELETE(`/revision-history/delete?id=${id}`);
};


export const AddDecorCategory = (payload ) => {
  return POST(`/decoremaincategory/addorupdate`,payload);
};


export const DeleteDecorCategory = (id) =>{
  return DELETE(`/decoremaincategory/deletebyid?id=${id}`);
};


export const GetAllDecorCategory = (userId ) => {
  return GET(`/decoremaincategory/getallbyuserid?userid=${userId}&isActive=true`);
};


export const UpdateDecorCategoryStatus = (id, isActive ) => {
  return PUT(`/decoremaincategory/updatestatus?id=${id}&isActive=${isActive}`);
};


export const AddDecorItem = (payload ) => {
  return POST(`/decoreitem/addorupdate`,payload);
};



export const DeleteDecorItem = (id) =>{
  return DELETE(`/decoreitem/deletebyid?id=${id}`);
};

export const GetAllDecorItem = (userId ) => {
  return GET(`/decoreitem/getallbyuserid?userId=${userId}`);
};


export const UpdateDecorItemStatus = (id, isActive ) => {
  return PUT(`/decoreitem/updatestatus?id=${id}&isActive=${isActive}`);
};


export const AddDecorPackage = (payload ) => {
  return POST(`/decorepackage/addorupdate`,payload);
};

export const GetDecorPackageById = (id ) => {
  return GET(`/decorepackage/getbyid?id=${id}`);
};

export const DeleteDecorPackage = (id) =>{
  return DELETE(`/decorepackage/delete?id=${id}`);
};

export const GetAllDecorPackage = (id) => {
  return GET(`/decorepackage/getallbyuserid?userid=${id}`);
};

export const UpdateDecorPackageStatus = (id, isActive ) => {
  return PUT(`/decorepackage/status?id=${id}&isActive=${isActive}`);
};

export const DecorePrep = (payload ) => {
  return POST(`/decorepreparation/addOrUpdate`,payload);
};


export const GetDecorPrep = (
  eventFunId,
  itemname,
  menuCatId,
  pageNo,
  TotalRecord,
  UserId,
) => {
  return GET(
    `/decorepreparation/getdecorepreparationitems?eventFunctionId=${eventFunId}&itemName=${encodeURIComponent(itemname)}&decoreCategoryId=${menuCatId}&pageNo=${pageNo}&totalRecord=${TotalRecord}&userId=${UserId}`,
  );
};


export const GetCopyDecorPlanning = (
  activeEventFunctionId,
  oldEventFunctionId,
) => {
  return GET(
    `/decorepreparation/copyeventfunctiondecore?activeEventFunctionId=${activeEventFunctionId}&oldEventFunctionId=${oldEventFunctionId}`,
  );
};

export const AddEventAdvancePayment = (data) => {
  return POST(`/event-adv-payment/add-update`, data);
};

export const DeleteEventAdvancePayment = (id) =>{
  return DELETE(`/event-adv-payment/deletebyid?id=${id}`);
};

export const GetAllEventAdvancePayment = (id) => {
  return GET(`/event-adv-payment/getall?eventId=${id}`);
};

export const getreportpdfforadvancepayment = (advancePaymentId , eventId , userId , isTermsCond  , eventFunctionId) => {
  return GET(`/event-adv-payment/getreport?advancePaymentId=${advancePaymentId}&eventId=${eventId}&userId=${userId}&isTermsCond=${isTermsCond}&eventFunctionId=${eventFunctionId}`);
};

export const ADDupadteeventwisetermscondition = ( data ) => {
  return POST (`/event-terms-and-condition/add-update` , data) ;

};

export const GETALleventwisetermcondition = (eventId ) =>{
  return GET (`/event-terms-and-condition/getbyeventId?eventId=${eventId}`);
};

export const termrsconditionstatuts =   (id , isActive) =>{
  return PUT (`/termscondition/isActive?id=${id}&isActive=${isActive}`);
};

export const Addupdtaehallpackagerate = (data) => {
  return POST(`/hallpackage/addorupdate`, data);
};

export const Getallhallpackagerate = (hallId, isActive, packageId, userId) => {
  return GET(`/hallpackage/getall?hallId=${hallId}&isActive=${isActive}&packageId=${packageId}&userId=${userId}`);
};

export const Deletehallpackagerate = (id) => {
  return DELETE(`/hallpackage/delete?id=${id}`);
};

export const Updatestatus = (id, isActive) => {
  return PUT(`/hallpackage/updatestatus?id=${id}&isActive=${isActive}`);
};

export const getpriceininfunctionadd = (functionPax , hallId , packageId) => {
return GET(`/hallpackage/getprice?functionPax=${functionPax}&hallId=${hallId}&packageId=${packageId}`);
};

export const updateeventmaster = (data) => {
  return PUT(`/eventmaster/updateremarks`, data);
};

export const CheckSOT = (eventId, userId) => {
  return GET(`/sot/check-sot?eventId=${eventId}&userId=${userId}`)
}

export const IsInquiryVisible = (isVisible , userId) => {
  return PUT(`/user/isinquiryvisible?isVisible=${isVisible}&userId=${userId}`);
};

export const GeneratePurchaseDateWiseReport = (endDate, startDate, isCompanyDetails, isPrice, userId) => {
  return POST(`/purchasereport/generate-datewise-puchase-report?endDate=${endDate}&startDate=${startDate}&isCompanyDetails=${isCompanyDetails}&isPrice=${isPrice}&userId=${userId}`);
};

export const pdffordebitpaymentinaccount = ( isCompanyDetails , isPayable  , userId) =>{
  return POST(`/vendorpayment/generate-vendor-payment-report?isCompanyDetails=${isCompanyDetails}&isPayable=${isPayable}&userId=${userId}`);
};


export const GenerateCrockerySOT = (data) => {
  return POST(`/sotcrockery/generate`, data);
};

export const CheckCrockerySOT = (eventId, userId) => {
  return GET(`/sotcrockery/check-sot?eventId=${eventId}&userId=${userId}`);
};


export const GetAllCrockerySOT = (userId) => {
  return GET(`/sotcrockery/getall?userId=${userId}`);
};


export const  getpartywitheventforstock = (userId) =>{
 return GET(`/storepo/getallparties?userId=${userId}`);
};


export const GeneratePaymentReceipt = (isCompanyDetails, userId, vendorPayId ) => {
  return POST(`/vendorpayment/generate-payment-receipt?isCompanyDetails=${isCompanyDetails}&userId=${userId}&vendorPayId=${vendorPayId}`);
};


export const SyncItemWiseRawMaterial = (eventFunctionid , eventId , menuItemId) => {
  return DELETE(`/menuallocation/syncitemwiserawmaterial?eventFunctionid=${eventFunctionid}&eventId=${eventId}&menuItemId=${menuItemId}`);
};


export const getRawMaterialPriceforpurchase = ( supplierId  , rawMaterialId , userId) =>{
  return GET(`/purchaseorder/get-raw-material-price?supplierId=${supplierId}&rawMaterialId=${rawMaterialId}&userId=${userId}`);
};


export const AddManagerTask = (data) => {
  return POST(`/managertask/add-update`, data);
};


export const DeleteManagerTask = (id) => {
  return DELETE(`/managertask/delete?id=${id}`);
};


export const  GetAllManagerTask = (userId) =>{
 return GET(`/managertask/getall?userId=${userId}`);
};


export const  GetSummaryManagerTask = (eventFunctionId, managerId ) =>{
 return GET(`/eventfunction-managertask/getmanagertasksummary?eventFunctionId=${eventFunctionId}&managerId=${managerId}`);
};


export const  GetEventFunctionManagerTask = (eventFunctionId, managerId, type ) =>{
 return GET(`/eventfunction-managertask/geteventfunctionmanagertask?eventFunctionId=${eventFunctionId}&managerId=${managerId}&type=${type}`);
};

export const  GetFunctionWiseManagerTask = (eventFunctionId, managerId ) =>{
 return GET(`/eventfunction-managertask/geteventfunctionmanagertask?eventFunctionId=${eventFunctionId}&managerId=${managerId}`);
};


export const AssignEventFunctionManagerTask = (data) => {
  return POST(`/eventfunction-managertask/add-update`, data);
};

export const  GetEventFunctionWiseManagerTask = (eventId ) =>{
 return GET(`/eventfunction-managertask/getallfunctionwisemanagertask?eventId=${eventId}`);
};

export const CreateLabourHelper = (data) =>{
  return POST(`/laborhelper/add`,data);
};

export const UpdateLabourHelper = (data) =>{
return PUT(`/laborhelper/update`, data);
};

export const getAllLaborHelperByContactCategoryId = ( contactCategoryId) => {
  return GET(`/laborhelper/getallbycontactcategoryid?contactCategoryId=${contactCategoryId}`);
};

export const getalllabourhelperbyuserid = (userId ) => {
  return GET(`/laborhelper/getallbyuserid?userId=${userId}`);
};

export const deletelabourhelperbyid = (id) =>{
  return DELETE(`/laborhelper/delete?id=${id}`);
};


export const getAllLaborHelperByPartyId = (partyId) => {
  return GET(`/laborhelper/getallbypartyid?partyId=${partyId}`);
};


export const saveEventLaborHelpers = (data) => {
  return POST(`/eventlaborhelper/save`,data);
};


export const getByEventIdlabourhleper = (eventId) => {
  return GET(`/eventlaborhelper/getbyeventid?eventId=${eventId}`);
};

export const getfunctioneventpartywiselabourhelper = (  eventFunctionId , partyId , eventId ) => {
  return GET( `/laborhelper/getallbypartyandeventdetails?eventFunctionId=${eventFunctionId}&partyId=${partyId}&eventId=${eventId}`);
};

export const generateGrnNumber = (userId) => {
  return GET(`/purchaseorder/generateGrnNumber?userId=${userId}`);
};

export const AddSpecialNotes = (data) => {
  return POST(`/specialnotes/add-update`,data);
};

export const GetSpecialNotes = (eventFunctionId,managerId,userId) => {
  return GET(`/specialnotes/getspecialnotes?eventFunctionId=${eventFunctionId}&managerId=${managerId}&userId=${userId}`);
};


export const GetPermissableNonPermissable = (eventFunctionId, eventId , userId) => {
  return GET(`/menupreparation/geteventfunctionpermissionrawmaterial?eventFunctionId=${eventFunctionId}&eventId=${eventId}&userId=${userId}`);
};


export const sotidbygetbyid = (sotId) => { 
  return GET(`/sot/getbyid/${sotId}`);
};

export const deleteSotDetails = (sotDetailIds) =>{
  return DELETE (`/sot/delete-sot-details?sotDetailIds=${sotDetailIds}`);
};

export const GetByPoCode = (pocode,userId) => { 
  return GET(`/storepo/getbypocode?pocode=${pocode}&userId=${userId}`);
};


export const UploadDecorImagePlanning = (data) => {
  return POST(`/decorepreparation/decorimage`,data);
};


export const getAllInquiryfortapregister = () =>{
  return GET (`/tap-inquiry/getall` , );
};

export const generateDatewiseStoreIssueReport = (startDate, endDate, userId, isCompanyDetails, isWithPrice, priceType  , kitchenTypeId) => {
  return POST(`storepo/datewiseStoreIssueReport?startDate=${startDate}&endDate=${endDate}&userId=${userId}&isCompanyDetails=${isCompanyDetails}&isWithPrice=${isWithPrice}&priceType=${priceType}&kitchenTypeId=${kitchenTypeId}`);
}


export const isActiveUserNotification = (data) => {
  return PUT(`/usernotificationconfig/isActive`,data);
};


export const GetSloganByMenuId = (menuId, userId) =>{
  return GET (`/menupreparation/sync-slogan?menuItemId=${menuId}&userId=${userId}`);
};

export const WhatsAppPdf = (data) => {
  return POST(`/whatsappconfig/sendpdf`,data);
};



export const StockTypeRights = (data) => {
  return POST(`/stocktype/stocktyperights`, data);
};

  
export const GetStockTypeRights = ( userId) =>{
  return GET (`/stocktype/getallstocktyperights?userId=${userId}`);
};

export const UploadMenuItemImage = (menuItemId, userId, data) => {
  return PUT(`/menupreparation/update-item-image?menuItemId=${menuItemId}&userId=${userId}`, data);
};


export const AddEventFollowUp = (dto ) => {
  return POST(`/eventfollowup/add-update`, dto );
};


export const DeleteEventFollowUp = (id) =>{
  return DELETE (`/eventfollowup/delete?id=${id}`);
};


export const GetEventFollowUp = ( eventId, userId, endDate, startDate) =>{
  return GET (`/eventfollowup/getall?userId=${userId}&eventId=${eventId}&startDate=${startDate}&endDate=${endDate}`);
};


export const GetAllFollowUp = (userId) =>{
  return GET (`/eventfollowup/getall?userId=${userId}`);
};


export const followupnotiy = (endDate, eventId, isDone, managerId, startDate, userId) => {
  return GET(`/eventfollowup/getall?endDate=${endDate}&eventId=${eventId}&isDone=${isDone}&managerId=${managerId}&startDate=${startDate}&userId=${userId}`);
};

export const AddInquiry = (data ) => {
  return POST(`/inquiry/add`, data );
};

export const DeleteInquiry = (id,userId) =>{
  return DELETE (`/inquiry/deleteinquirybyid?id=${id}&userId=${userId}`);
}

export const GetAllInquiry = (userId, endDate,startDate) =>{
  return GET (`/inquiry/getallinquiry?userId=${userId}&endDate=${endDate}&startDate=${startDate}`);
};



export const addupdateSecurityDeposit = (data) => {
  return POST(`/quotation/add-security-deposit`, data);
};

export const deleteSecurityDeposit = (securityDepositId) => {
  return DELETE(`/quotation/delete-security-deposit?securityDepositId=${securityDepositId}`);
};


export const GetGeneralFix = (rawCatIds , eventFunctionIds ,eventId ) =>{
  return GET (`/eventfunctiongeneral/getallgeneralfixraw?rawCatIds=${rawCatIds}&eventFunctionIds=${eventFunctionIds}&eventId=${eventId}`);
};

export const AddUpdateGeneralFix = (data) => {
  return POST(`/eventfunctiongeneral/add-update`, data);
};

export const getAllSecurityDepositByEventId = (eventId) => {
  return GET(`/quotation/getAllSecurityDepositByEventId?eventId=${eventId}`);
};  
