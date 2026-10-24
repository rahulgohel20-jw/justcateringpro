// auth/moduleRouteMap.js
export const MODULE_ROUTES = {
  Stock: ["/stock-management", "/stock-management/purchase", "/master/rawmaterial-opb", "/stock-management/stock-type", "/stock-management/purchase-return/add", "/stock-management/store-po", "/stock-management/purchase-return", "/stock-management/purchase-return/add", "/stock-management/storepo/add", "stock-management/store-po-return", "/stock-management/storeporeturn/add", "/stock-management/automanualpo", "/stock-management/automanualpo/add", "/stock-management/chef-requisition", "/stock-management/add-chef-requisition", "/stock-management/store-requisition", "/stock-management/add-store-requisition", "/stock-management/store-ledger",],
  Account: [
    "/bank-payment", "/cash-recipet", "/journal-voucher", "/gst-report", "/payments", "/cash/cash-book", "/bank/bank-book", "/transfer",
    "/reciptManage", "/accoutbook", "/receivable", "/payable", "/super/payable",
    "/master/accountmaster", "/master/expensetype", "/super-admin/P&l", "/journal-voucher/add", "/account/expense"
  ],
  "Purchase Approve": [
    "/purchase-return-request", "/purchase/approval-request",
    "/purchase/approval-request-List", "purchase/approval-request/add"
  ],
  Banquet: [
    "/master/banquet-master", "/master/banquet-shift", "/event-remark",
    "/master/room", "/hallpackagerate",
  ],
  Decor: [
    "/master/decor-category", "/master/decorprofile", "/master/decor-item",
    "/master/decor-package", "/decor-preparation",
  ],
  "Assign Manager": [
    "/assigntask", "/managertaskmaster",
    "/event-view/managertask", "/event-view/managerspecialnotes",
    "/event-view/eventassignmember", "/event-view/eventassignmanagertask",
    "/event-view/eventassignmanagerspecialnotes", "/event-view/assginMemberview",
  ],
  "Captain Recipe": ["/captainrecipe"],
  "Food Taste Festival": ["/master/guest"],
  "labour helper": ["/master/addlabourhelper"],
  "Notes Management": ["/master/notes-management"],
  "Preparation Master": ["/master/preparation-master"],
  "Exhibition Quotation": ["/exhibition-setup", "/exhibition-quotation"],
  followup: ["/followup-calendar"],
};