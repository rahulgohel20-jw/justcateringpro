/**
 * planningConfig.js
 *
 * Single source of truth for every difference between Menu Planning
 * and Decor Planning.  Import getPlanningConfig(mode) in any component
 * that needs to behave differently based on mode.
 *
 * Usage:
 *   const cfg = getPlanningConfig("menu");   // or "decor"
 *   await cfg.api.getItems(fnId, search, catId, page, size, userId);
 *   const payload = cfg.buildPayload({ ... });
 */

import {
  // ── Menu Planning ────────────────────────────────────────────
  Getmenuprep,
  AddMenuprep,
  GetAllCategoryformenu,
  SearchCategoryformenu,

  // ── Decor Planning ───────────────────────────────────────────
  GetDecorPrep,
  DecorePrep,
  GetAllDecorCategory,
  // SearchCategoryforDecor,   // add when available; falls back to GetAllDecorCategory
} from "@/services/apiServices";

// ─────────────────────────────────────────────────────────────────────────────
// FIELD-NAME MAPS
// Keys are the generic names used throughout the shared components.
// Values are the actual API field names for each mode.
// ─────────────────────────────────────────────────────────────────────────────

const MENU_FIELDS = {
  // ── Category ──────────────────────────────────────────────
  categoryId:              "menuCategoryId",
  categoryName:            "menuCategoryName",
  categoryNameHindi:       "menuCategoryNameHindi",
  categoryNameGujarati:    "menuCategoryNameGujarati",
  categoryNotes:           "menuNotes",
  categoryNotesHindi:      "menuNotesHindi",
  categoryNotesGujarati:   "menuNotesGujarati",
  categorySlogan:          "menuSlogan",
  categorySortOrder:       "menuSortOrder",
  isCategoryAddon:         "isMenuCatAddons",
  categoryNicknameEnglish:  "catNickNameEnglish",
categoryNicknameHindi:    "catNickNameHindi",
categoryNicknameGujarati: "catNickNameGujarati",

  // ── Item ──────────────────────────────────────────────────
  itemId:                  "menuItemId",
  itemName:                "menuItemName",
  itemNameHindi:           "menuItemNameHindi",
  itemNameGujarati:        "menuItemNameGujarati",
  itemNotes:               "itemNotes",
  itemNotesHindi:          "itemNotesHindi",
  itemNotesGujarati:       "itemNotesGujarati",
  itemSlogan:              "itemSlogan",
  itemPrice:               "itemPrice",
  itemSortOrder:           "itemSortOrder",
  isItemAddon:             "isItemAddons",
  selectedItemsKey:        "selectedMenuPreparationItems",
  itemNicknameEnglish:      "itemNickNameEnglish",
itemNicknameHindi:        "itemNickNameHindi",
itemNicknameGujarati:     "itemNickNameGujarati",

  // ── Response shapes ────────────────────────────────────────
  /** key inside getItems response that holds the flat item list */
  responseItemsKey:        "menuPreparationItems",
  /** key inside getItems response that holds the selected/grouped list */
  responseSelectedKey:     "selectedMenuPreparationItems",
  /** key inside getItems response that holds the prep header */
  responsePrepKey:         "menuPreparation",
};

const DECOR_FIELDS = {
  // ── Category ──────────────────────────────────────────────
  categoryId:              "decoreCategoryId",
  categoryName:            "decoreCategoryName",
  categoryNameHindi:       "decoreCategoryNameHindi",
  categoryNameGujarati:    "decoreCategoryNameGujarati",
  categoryNotes:           "decoreCatNotes",
  categoryNotesHindi:      "decoreCatNotesHindi",
  categoryNotesGujarati:   "decoreCatNotesGujarati",
  categorySlogan:          "decoreCatSlogan",
  categorySortOrder:       "decoreCatSortOrder",
  isCategoryAddon:         "isDecoreCatAddons",

  // ── Item ──────────────────────────────────────────────────
  itemId:                  "decoreItemId",
  itemName:                "decoreItemName",
  itemNameHindi:           "decoreItemNameHindi",
  itemNameGujarati:        "decoreItemNameGujarati",
  itemNotes:               "decoreItemNotes",
  itemNotesHindi:          "decoreItemNotesHindi",
  itemNotesGujarati:       "decoreItemNotesGujarati", 
  itemSlogan:              "decoreItemSlogan",

  // ⚠️ CONFIRMED FROM REAL API: unlike every other decor field, the flat
  // item list does NOT prefix these two — see decorePreparationItems[0]:
  // { "itemPrice": 744, "itemSortOrder": null, ... }  (not decoreItemPrice / decoreItemSortOrder)
  itemPrice:               "itemPrice",
  itemSortOrder:           "itemSortOrder",

  isItemAddon:             "isDecoreItemAddons",
  selectedItemsKey:        "selectedDecoreItems",

  // ── Response shapes ────────────────────────────────────────
  // Confirmed from real decor-preparation response:
  // { decorePreparation: {...}, decorePreparationItems: [...flat...],
  //   selectedDecorePreparationItems: [...nested cats, empty when nothing saved...],
  //   customPackageDetails: [...] }
  responseItemsKey:        "decorePreparationItems",
  responseSelectedKey:     "selectedDecorePreparationItems",   // was "selectedItems" — wrong, never matched real API
  responsePrepKey:         "decorePreparation",
};

// ─────────────────────────────────────────────────────────────────────────────
// NORMALISATION HELPERS
// Convert raw API items into the flat shape the shared components expect.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Normalise a single raw item from the getItems API into the generic shape:
 * { id, nameEnglish, nameHindi, nameGujarati, imagePath, rate,
 *   menuCategoryName, menuCategoryNameHindi, menuCategoryNameGujarati,
 *   catId, itemSlogan, itemNotes, itemInstruction, itemSpace, isPackageItem, ... }
 */

function resolveName(nickname, original) {
  const trimmed = (nickname ?? "").toString().trim();
  return trimmed ? nickname : (original || "");
}
function normaliseItem(rawItem, fields, isPackage = false) {
  return {
    id:                   Number(rawItem[fields.itemId] ?? rawItem.id ?? 0),
//   nameEnglish:  resolveName(rawItem[fields.itemNicknameEnglish],  rawItem[fields.itemName] || rawItem.menuItemName || ""),
// nameHindi:    resolveName(rawItem[fields.itemNicknameHindi],    rawItem[fields.itemNameHindi] || rawItem[fields.itemName] || ""),
// nameGujarati: resolveName(rawItem[fields.itemNicknameGujarati], rawItem[fields.itemNameGujarati] || rawItem[fields.itemName] || ""),
nameEnglish:  rawItem[fields.itemName] || rawItem.menuItemName || "",
    nameHindi:    rawItem[fields.itemNameHindi] || rawItem[fields.itemName] || "",
    nameGujarati: rawItem[fields.itemNameGujarati] || rawItem[fields.itemName] || "",
nicknames: {
  english:  rawItem[fields.itemNicknameEnglish]  || "",
  hindi:    rawItem[fields.itemNicknameHindi]    || "",
  gujarati: rawItem[fields.itemNicknameGujarati] || "",
},
    imagePath:            rawItem.imagePath                || "",
     images:               Array.isArray(rawItem.images) ? rawItem.images : [], 
    rate:                 Number(rawItem[fields.itemPrice] ?? rawItem.itemPrice ?? rawItem.rate ?? 0),

    // keep a stable "menuCategory*" shape internally so CategoryList /
    // SelectedItems / MenuItemGrid never need to know the mode
    menuCategoryName:         rawItem[fields.categoryName]          || rawItem.menuCategoryName         || "Uncategorized",
    menuCategoryNameHindi:    rawItem[fields.categoryNameHindi]     || rawItem.menuCategoryNameHindi    || "",
    menuCategoryNameGujarati: rawItem[fields.categoryNameGujarati]  || rawItem.menuCategoryNameGujarati || "",
    catId:                Number(rawItem[fields.categoryId] ?? rawItem.menuCategoryId ?? 0),

    itemSlogan:           rawItem[fields.itemSlogan]       || "",
    itemNotes: {
      english:  rawItem[fields.itemNotes]          || "",
      hindi:    rawItem[fields.itemNotesHindi]     || "",
      gujarati: rawItem[fields.itemNotesGujarati]  || "",
    },
    itemInstruction: {
      english:  rawItem[fields.itemNotes]          || "",
      hindi:    rawItem[fields.itemNotesHindi]     || "",
      gujarati: rawItem[fields.itemNotesGujarati]  || "",
    },

    subItem:        rawItem.subItem        || "",
    subItemHindi:   rawItem.subItemHindi   || "",
    subItemGujarati:rawItem.subItemGujarati|| "",
    itemHeading:          rawItem.itemHeading          || "",
itemHeadingHindi:     rawItem.itemHeadingHindi     || "",
itemHeadingGujarati:  rawItem.itemHeadingGujarati  || "",
    itemSpace:      Number(rawItem.itemSpace ?? 0),
    isPackageItem:  isPackage || !!rawItem.isPackage,
     isCatImage:     !!rawItem.isCatImage,
  };
}

/**
 * Normalise a category group from the selectedItems API response
 * into the generic { catName, items, notes, slogan, images, space } shape.
 */
function normaliseCategory(rawCat, fields, flatItems = [], prepMeta = {}) {
  const categoryStatus = rawCat.categoryStatus || "NORMAL"; 

const savedItems = rawCat[fields.selectedItemsKey] || rawCat.selectedMenuPreparationItems || rawCat.selectedItems || [];

const firstFlatItem = flatItems.find(
  (f) => Number(f[fields.categoryId] ?? f.menuCategoryId ?? 0) === Number(rawCat[fields.categoryId] ?? 0)
);


const nameSource = savedItems.length > 0 ? rawCat : firstFlatItem;
const anyItem = Number(rawCat.anyItem ?? 0);
// const isPackageCategory = prepMeta.isPackage && anyItem > 0;
const isPackageCategory = !!prepMeta.isPackage;

const originalCatName =
  rawCat?.reportNameEnglish?.trim() ||
  rawCat?.[fields.categoryName]?.trim() ||
  rawCat?.menuCategoryName?.trim() ||
  firstFlatItem?.reportNameEnglish?.trim() ||
  firstFlatItem?.[fields.categoryName]?.trim() ||
  firstFlatItem?.menuCategoryName?.trim() ||
  "Uncategorized";

const originalCatNameHindi =
  rawCat?.reportNameHindi?.trim() ||
  rawCat?.[fields.categoryNameHindi]?.trim() ||
  rawCat?.menuCategoryNameHindi?.trim() ||
  firstFlatItem?.reportNameHindi?.trim() ||
  firstFlatItem?.[fields.categoryNameHindi]?.trim() ||
  firstFlatItem?.menuCategoryNameHindi?.trim() ||
  originalCatName;

const originalCatNameGujarati =
  rawCat?.reportNameGujarati?.trim() ||
  rawCat?.[fields.categoryNameGujarati]?.trim() ||
  rawCat?.menuCategoryNameGujarati?.trim() ||
  firstFlatItem?.reportNameGujarati?.trim() ||
  firstFlatItem?.[fields.categoryNameGujarati]?.trim() ||
  firstFlatItem?.menuCategoryNameGujarati?.trim() ||
  originalCatName;

// const catName         = resolveName(rawCat[fields.categoryNicknameEnglish],  originalCatName);
//   const catNameHindi    = resolveName(rawCat[fields.categoryNicknameHindi],    originalCatNameHindi);
//   const catNameGujarati = resolveName(rawCat[fields.categoryNicknameGujarati], originalCatNameGujarati);
const catName         = originalCatName;
  const catNameHindi    = originalCatNameHindi;
  const catNameGujarati = originalCatNameGujarati;
  const catId           = Number(rawCat[fields.categoryId]     ?? 0);

  const rawEnglish  = rawCat[fields.categoryNotes]          || "";
  const rawHindi    = rawCat[fields.categoryNotesHindi]      || "";
  const rawGujarati = rawCat[fields.categoryNotesGujarati]   || "";

  const isPollutedHindi    = !rawEnglish || rawHindi    === catName || rawHindi    === catNameHindi    || rawHindi    === catNameGujarati;
  const isPollutedGujarati = !rawEnglish || rawGujarati === catName || rawGujarati === catNameHindi    || rawGujarati === catNameGujarati;

  const notes = {
    english:  rawEnglish,
    hindi:    isPollutedHindi    ? "" : rawHindi,
    gujarati: isPollutedGujarati ? "" : rawGujarati,
  };

  const slogan = rawCat[fields.categorySlogan] || rawCat.menuSlogan || "";

  const images = {
    bgImgId:  Number(rawCat.bgImgId  ?? 0),
    catImgId: Number(rawCat.catImgId ?? 0),
  };

  const space = Number(rawCat.catSpace ?? 0);

  const subCat = {
    english:  rawCat.subCat        || "",
    hindi:    rawCat.subCatHindi   || "",
    gujarati: rawCat.subCatGujarati|| "",
  };
  const catHeading = {  
  english:  rawCat.catHeadingEnglish  || "",
  hindi:    rawCat.catHeadingHindi    || "",
  gujarati: rawCat.catHeadingGujarati || "",
};

const sourceItems = savedItems.length > 0
  ? savedItems
  : isPackageCategory
    ? []   
    : flatItems.filter(
        (f) => Number(f[fields.categoryId] ?? f.menuCategoryId ?? 0) === Number(rawCat[fields.categoryId] ?? 0)
      );

// const sourceItems = savedItems;

        const isPackage   = prepMeta.isPackage || false;

  const hasSavedItems = sourceItems.length > 0;

 const dedupedMap = new Map();
sourceItems.forEach((it) => {
  const rawId = Number(it[fields.itemId] ?? it.menuItemId ?? it.id ?? 0);
  const existing = dedupedMap.get(rawId);
  if (!existing) { dedupedMap.set(rawId, it); return; }
  if (existing.itemStatus === "CANCELLED" && it.itemStatus !== "CANCELLED") {
    dedupedMap.set(rawId, it);
  }
});
const dedupedSourceItems = [...dedupedMap.values()];

const items = dedupedSourceItems.map((it) => {
    const rawId    = Number(it[fields.itemId]  ?? it.menuItemId ?? it.id ?? 0);
    const flatById = flatItems.find((f) => Number(f[fields.itemId] ?? f.menuItemId ?? f.id) === rawId);
    const flat     = flatById || it;

    // const resolvedSlogan = (it[fields.itemSlogan]?.trim() || flat[fields.itemSlogan]?.trim() || "");
  const resolvedSlogan = !hasSavedItems
  ? (it[fields.itemSlogan]?.trim() || flat[fields.itemSlogan]?.trim() || "")
  : (it[fields.itemSlogan] ?? "");
    const resolvedInstruction = !hasSavedItems
      ? {
          english:  flat.instructionEnglish || "",
          hindi:    flat.instructionHindi    || "",
          gujarati: flat.instructionGujarati || "",
        }
      : {
          english:  it[fields.itemNotes]         != null ? it[fields.itemNotes]         : (flat.instructionEnglish || ""),
          hindi:    it[fields.itemNotesHindi]    != null ? it[fields.itemNotesHindi]    : (flat.instructionHindi    || ""),
          gujarati: it[fields.itemNotesGujarati] != null ? it[fields.itemNotesGujarati] : (flat.instructionGujarati || ""),
        };

    return {
      id: rawId,
      nameEnglish:          it[fields.itemName] || flat[fields.itemName] || "",
      nameHindi:            it[fields.itemNameHindi] || flat[fields.itemNameHindi] || it[fields.itemName] || "",
      nameGujarati:         it[fields.itemNameGujarati] || flat[fields.itemNameGujarati] || it[fields.itemName] || "",
 nicknames: {
    english:  it[fields.itemNicknameEnglish]  || flat[fields.itemNicknameEnglish]  || "",
    hindi:    it[fields.itemNicknameHindi]    || flat[fields.itemNicknameHindi]    || "",
    gujarati: it[fields.itemNicknameGujarati] || flat[fields.itemNicknameGujarati] || "",
  },
      imagePath:            it.imagePath                 || flat.imagePath                 || "",
rate: (() => {
  const savedPrice =
    it[fields.itemPrice] ?? it["decoreItemPrice"] ?? null;

  const isFallback =
    savedPrice === null ||
    savedPrice === undefined ||
    savedPrice === "" ||
    Number(savedPrice) === 0;

  if (!isFallback) return Number(savedPrice);

  // flat item from menuPreparationItems has itemPrice directly
  const flatPrice =
    flat[fields.itemPrice] ??   // "itemPrice" — works for both menu & decor flat lists
    flat["itemPrice"]      ??   // explicit fallback in case fields.itemPrice resolved differently
    flat["decoreItemPrice"] ??
    0;

  console.log("[rate fallback]", { id: rawId, savedPrice, flatPrice, flat });

  return Number(flatPrice);
})(),   menuCategoryName:     catName,
      menuCategoryNameHindi:    catNameHindi,
      menuCategoryNameGujarati: catNameGujarati,
      reportNameEnglish:  it.reportNameEnglish  || flat.reportNameEnglish  || firstFlatItem?.reportNameEnglish  || originalCatName,
      reportNameHindi:    it.reportNameHindi    || flat.reportNameHindi    || firstFlatItem?.reportNameHindi     || originalCatNameHindi,
      reportNameGujarati: it.reportNameGujarati || flat.reportNameGujarati || firstFlatItem?.reportNameGujarati  || originalCatNameGujarati,
      catId,
      itemSlogan:    resolvedSlogan,
      itemNotes: {
        english:  it[fields.itemNotes]         || "",
        hindi:    it[fields.itemNotesHindi]    || "",
        gujarati: it[fields.itemNotesGujarati] || "",
      },
      itemInstruction: resolvedInstruction,
      subItem:         it.subItem         || "",
      subItemHindi:    it.subItemHindi    || "",
      subItemGujarati: it.subItemGujarati || "",
      itemHeading:          it.itemHeading          || "",
itemHeadingHindi:     it.itemHeadingHindi     || "",
itemHeadingGujarati:  it.itemHeadingGujarati  || "",
      itemSpace:       Number(it.itemSpace ?? 0),
       images:          Array.isArray(it.images) ? it.images : (Array.isArray(flat.images) ? flat.images : []),
      isPackageItem:   isPackage,
      packageId:       prepMeta.packageId   || 0,
      packageName:     prepMeta.packageName || "",
      packagePrice:    prepMeta.packagePrice|| 0,
      itemQty: it.itemQty ?? null, 
        isCatImage:      !!(it.isCatImage || flat.isCatImage), 
        itemStatus:      it.itemStatus || flat.itemStatus || "NORMAL",
categoryStatus:  rawCat.categoryStatus || "NORMAL",
changedAfterCompletion: it.changedAfterCompletion ?? null,
  vendorId:   it.vendorId != null ? Number(it.vendorId) : (flat.vendorId != null ? Number(flat.vendorId) : 0),
      vendorName: it.vendorName || flat.vendorName || "",
    };
  });

return { 
  catName, catNameHindi, catNameGujarati, 
  catId, notes, slogan, images, space, subCat,catHeading, items, 
  isAddon: !!rawCat[fields.isCategoryAddon],
  categoryStatus,
  reportNameEnglish:  rawCat.reportNameEnglish  || originalCatName,
  reportNameHindi:    rawCat.reportNameHindi     || originalCatNameHindi,
  reportNameGujarati: rawCat.reportNameGujarati  || originalCatNameGujarati,
  nicknames: {
    english:  rawCat[fields.categoryNicknameEnglish]  || "",
    hindi:    rawCat[fields.categoryNicknameHindi]    || "",
    gujarati: rawCat[fields.categoryNicknameGujarati] || "",
  },
};}

// ─────────────────────────────────────────────────────────────────────────────
// PAYLOAD BUILDERS
// Build the API request body from the generic internal state.
// ─────────────────────────────────────────────────────────────────────────────

function buildMenuPayload(state) {
  const {
    menuPrepId, eventFunctionId, personCount, defaultRate,
    categoriesOrder, categories, categoryNotes, categorySlogans,
categoryRenames, primaryItems, itemRenames,
    categorySubTexts, categoryHeadings, categoryImages, categorySpaces,
    addonState, packageApplied, packageInfo, packageItems,categoryIds,
    permissionRawMaterials,
    userId, 
  } = state;

  const isPackageApplied = packageApplied || false;
  const pkgInfo = packageInfo || { packageId: 0, packageName: "", packagePrice: 0 };

const activeCategoriesOrder = categoriesOrder.filter((catName) => {
  const allItems = categories[catName] || [];
  return (allItems[0]?.categoryStatus || "NORMAL") !== "CANCELLED";
});

const selectedMenuPreparation = activeCategoriesOrder.map((catName, catIndex) => {
  const allItems    = categories[catName] || [];
  const items       = allItems.filter((item) => item.itemStatus !== "CANCELLED");
  const first       = allItems[0] || {};
    const noteObj     = categoryNotes?.[catName]    || {};
    const slogan      = categorySlogans?.[catName]  || "";
    const imgData     = categoryImages?.[catName]   || {};
    const catSpace    = categorySpaces?.[catName]   || 0;
    const subCatData  = categorySubTexts?.[catName] || {};
    const headingData = categoryHeadings?.[catName] || {};

    return {
      // menuCategoryId:           first.catId || 0,


      //  menuCategoryId:           (categoryIds?.[catName] ?? first.catId) || 0,

      menuCategoryId:           (() => {
  if (categoryIds?.[catName]) return categoryIds[catName];
  if (first.catId) return first.catId;
  const anyItemWithCatId = items.find(i => i.catId);
  return anyItemWithCatId?.catId || 0;
})(),
//     menuCategoryName:         first.reportNameEnglish  || first.menuCategoryName         || catName,
// menuCategoryNameHindi:    first.reportNameHindi    || first.menuCategoryNameHindi    || catName,
// menuCategoryNameGujarati: first.reportNameGujarati || first.menuCategoryNameGujarati || catName,
menuCategoryName:          first.menuCategoryName         || catName,
menuCategoryNameHindi:    first.menuCategoryNameHindi    || catName,
menuCategoryNameGujarati: first.menuCategoryNameGujarati || catName,
//       catNickNameEnglish:     resolveName(state.categoryRenames?.[catName]?.english,  first.menuCategoryName || catName),
// catNickNameHindi:       resolveName(state.categoryRenames?.[catName]?.hindi,    first.menuCategoryNameHindi || catName),
// catNickNameGujarati:    resolveName(state.categoryRenames?.[catName]?.gujarati, first.menuCategoryNameGujarati || catName),

catNickNameEnglish: (
  state.categoryRenames?.[catName]?.english
  || state.categoryReportNames?.[catName]?.english
  || first.reportNameEnglish
  || first.menuCategoryName
  || catName
  || ""
).trim(),

catNickNameHindi: (
  state.categoryRenames?.[catName]?.hindi
  || state.categoryReportNames?.[catName]?.hindi
  || first.reportNameHindi
  || first.menuCategoryNameHindi
  || first.menuCategoryName
  || catName
  || ""
).trim(),

catNickNameGujarati: (
  state.categoryRenames?.[catName]?.gujarati
  || state.categoryReportNames?.[catName]?.gujarati
  || first.reportNameGujarati
  || first.menuCategoryNameGujarati
  || first.menuCategoryName
  || catName
  || ""
).trim(),

      menuNotes:                noteObj.english  || "",
      menuNotesHindi:           noteObj.hindi    || "",
      menuNotesGujarati:        noteObj.gujarati || "",
      menuSlogan:               slogan,
      menuSortOrder:            catIndex,
      startTime:                "",
      isMenuCatAddons:          !!addonState?.[catName]?.cat,
      categoryStatus:           allItems[0]?.categoryStatus || "NORMAL",
changedAfterCompletion:   allItems[0]?.changedAfterCompletion ?? null,
      bgImgId:                  imgData.bgImgId  || 0,
      catImgId:                 imgData.catImgId || 0,
      catSpace,
      subCat:         subCatData.english  || "",
      subCatHindi:    subCatData.hindi    || "",
      subCatGujarati: subCatData.gujarati || "",
      catHeadingEnglish:  headingData.english  || "",   
  catHeadingGujarati: headingData.gujarati || "",   
  catHeadingHindi:    headingData.hindi    || "",
      selectedMenuPreparationItems: items.map((item, itemIndex) => ({
        id:                   0,
        itemNotes:            item.itemInstruction?.english  || "",
        itemNotesHindi:       item.itemInstruction?.hindi    || "",
        itemNotesGujarati:    item.itemInstruction?.gujarati || "",
        itemSlogan:           item.itemSlogan  || "",
        itemHeading:          item.itemHeading         || "",
  itemHeadingHindi:     item.itemHeadingHindi    || "",
  itemHeadingGujarati:  item.itemHeadingGujarati || "",
        itemSortOrder:        itemIndex,
        itemPrice:            Number(item.rate),
        menuItemId:           Number(item.id),
        menuItemName:         item.nameEnglish || "",
        menuItemNameHindi:    item.nameHindi   || item.nameEnglish || "",
        menuItemNameGujarati: item.nameGujarati|| item.nameEnglish || "",
//           itemNickNameEnglish:    resolveName(state.itemRenames?.[item.id]?.english,  item.nameEnglish || ""),
// itemNickNameHindi:      resolveName(state.itemRenames?.[item.id]?.hindi,    item.nameHindi   || item.nameEnglish || ""),
// itemNickNameGujarati:   resolveName(state.itemRenames?.[item.id]?.gujarati, item.nameGujarati|| item.nameEnglish || ""),
itemNickNameEnglish: resolveName(
  state.itemRenames?.[item.id]?.english,
  item.nicknames?.english || item.nameEnglish || ""
),
itemNickNameHindi: resolveName(
  state.itemRenames?.[item.id]?.hindi,
  item.nicknames?.hindi || item.nameHindi || item.nameEnglish || ""
),
itemNickNameGujarati: resolveName(
  state.itemRenames?.[item.id]?.gujarati,
  item.nicknames?.gujarati || item.nameGujarati || item.nameEnglish || ""
),
  isCatImage:             !!state.primaryItems?.[catName]?.[item.id],

        isItemAddons:         !!addonState?.[catName]?.items?.[item.id],
        itemSpace:            Number(item.itemSpace) || 0,
        subItem:              item.subItem         || "",
        subItemHindi:         item.subItemHindi    || "",
        subItemGujarati:      item.subItemGujarati || "",
        itemStatus:           item.itemStatus || "NORMAL",
changedAfterCompletion: item.changedAfterCompletion ?? null,
      })),
    };
  });

  return {
    id:           menuPrepId || 0,
    eventFunctionId,
    pax:          Number(personCount),
    defaultPrice: Number(defaultRate),
    price:        Number(defaultRate),
    sortorder:    0,
    isPackage:    isPackageApplied,
    packageId:    isPackageApplied ? Number(pkgInfo.packageId   || 0) : 0,
    packageName:  isPackageApplied ? (pkgInfo.packageName || "")      : "",
    packagePrice: isPackageApplied ? Number(pkgInfo.packagePrice || 0): 0,
    selectedMenuPreparation,
    
permissionRawMaterials: permissionRawMaterials ? {
      permissables: (permissionRawMaterials.permissables || []).map((item) => ({ rawMaterialId: item.rawMaterialId })),
      notPermissables: (permissionRawMaterials.notPermissables || []).map((item) => ({ rawMaterialId: item.rawMaterialId })),
      userId: Number(userId) || 0,  // ← Now userId is available from the destructured state
    } : {
      permissables: [],
      notPermissables: [],
      userId: Number(userId) || 0,
    },


  };
}

function buildDecorPayload(state) {
  const {
    menuPrepId, eventFunctionId, personCount, defaultRate,
    categoriesOrder, categories, categoryNotes, categorySlogans,
    categorySubTexts, categoryImages, categorySpaces,
    addonState, packageApplied, packageInfo,
  } = state;

  const isPackageApplied = packageApplied || false;
  const pkgInfo = packageInfo || { packageId: 0, packageName: "", packagePrice: 0 };

  const selectedItemDetails = categoriesOrder.map((catName, catIndex) => {
    const items      = categories[catName] || [];
    const first      = items[0] || {};
    const noteObj    = categoryNotes?.[catName]    || {};
    const slogan     = categorySlogans?.[catName]  || "";
    const imgData    = categoryImages?.[catName]   || {};
    const catSpace   = categorySpaces?.[catName]   || 0;
    const subCatData = categorySubTexts?.[catName] || {};

    return {
      // decoreCategoryId:            first.catId || 0,
      decoreCategoryId:            (() => {
  if (first.catId) return first.catId;
  const anyItemWithCatId = items.find(i => i.catId);
  return anyItemWithCatId?.catId || 0;
})(),
      decoreCategoryName:          first.menuCategoryName         || catName,
      decoreCategoryNameHindi:     first.menuCategoryNameHindi    || catName,
      decoreCategoryNameGujarati:  first.menuCategoryNameGujarati || catName,
      decoreCatNotes:              noteObj.english  || "",
      decoreCatNotesHindi:         noteObj.hindi    || "",
      decoreCatNotesGujarati:      noteObj.gujarati || "",
      decoreCatSlogan:             slogan,
      decoreCatSortOrder:          catIndex,
      startTime:                   "",
      isDecoreCatAddons:           !!addonState?.[catName]?.cat,
      bgImgId:                     imgData.bgImgId  || 0,
      catImgId:                    imgData.catImgId || 0,
      catSpace,
      subCat:          subCatData.english  || "",
      subCatHindi:     subCatData.hindi    || "",
      subCatGujarati:  subCatData.gujarati || "",
      anyItem:         0,
      selectedItems: items.map((item, itemIndex) => ({
        id:                      0,
        decoreItemNotes:         item.itemInstruction?.english  || "",
        decoreItemNotesHindi:    item.itemInstruction?.hindi    || "",
        decoreItemNotesGujarati: item.itemInstruction?.gujarati || "",
        decoreItemSlogan:        item.itemSlogan  || "",
        decoreItemSortOrder:     itemIndex,
        decoreItemPrice:         Number(item.rate),
        decoreItemId:            Number(item.id),
        decoreItemName:          item.nameEnglish  || "",
        decoreItemNameHindi:     item.nameHindi    || item.nameEnglish || "",
        decoreItemNameGujarati:  item.nameGujarati || item.nameEnglish || "",
        isDecoreItemAddons:      !!addonState?.[catName]?.items?.[item.id],
        itemSpace:               Number(item.itemSpace) || 0,
        subItem:                 item.subItem         || "",
        subItemHindi:            item.subItemHindi    || "",
        subItemGujarati:         item.subItemGujarati || "",
         itemQty: item.itemQty ?? null,
          vendorId:                Number(item.vendorId) || null,        
  vendorName:              item.vendorName || "",
      })),
    };
  });

  return {
    id:           menuPrepId || 0,
    eventFunctionId,
    pax:          Number(personCount),
    defaultPrice: Number(defaultRate),
    price:        Number(defaultRate),
    sortorder:    0,
    isPackage:    isPackageApplied,
    packageId:    isPackageApplied ? Number(pkgInfo.packageId   || 0) : 0,
    packageName:  isPackageApplied ? (pkgInfo.packageName || "")      : "",
    packagePrice: isPackageApplied ? Number(pkgInfo.packagePrice || 0): 0,
    selectedItemDetails,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// LABEL / UI TEXT
// All user-visible strings that differ between modes.
// ─────────────────────────────────────────────────────────────────────────────

const MENU_LABELS = {
  pageTitle:      "2. Menu Planning",
  saveLabel:      "Save Menu",
  updateLabel:    "Update Menu",
  itemsKey:       "menu items",
  categoryKey:    "menu category",
  logEventSave:   "Menu Planning Save",
  logEventUpdate: "Menu Planning Update",
  searchItemPlaceholder:     "Search items",
  searchCategoryPlaceholder: "Search categories",
};

const DECOR_LABELS = {
  pageTitle:      "Decor Planning",
  saveLabel:      "Save Decor",
  updateLabel:    "Update Decor",
  itemsKey:       "decor items",
  categoryKey:    "decor category",
  logEventSave:   "Decor Planning Save",
  logEventUpdate: "Decor Planning Update",
  searchItemPlaceholder:     "Search decor items",
  searchCategoryPlaceholder: "Search decor categories",
};

// ─────────────────────────────────────────────────────────────────────────────
// API WRAPPERS
// Uniform calling convention regardless of mode.
// All return the same generic data shape after normalisation.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Wraps getItems API call.
 * Returns { rawItems, rawSelectedCats, prepMeta, fields }
 * so the caller can choose to normalise via helpers above or do it inline.
 */
async function menuGetItems(fnId, search, catId, page, size, userId) {
  const resp = await Getmenuprep(fnId, search, catId, page, size, userId);
  const data = resp?.data?.data || {};
  return {
    rawItems:        data[MENU_FIELDS.responseItemsKey]   || [],
    rawSelectedCats: data[MENU_FIELDS.responseSelectedKey]|| [],
    prepMeta:        data[MENU_FIELDS.responsePrepKey]    || {},
    fields:          MENU_FIELDS,
  };
}

async function decorGetItems(fnId, search, catId, page, size, userId) {
  const resp = await GetDecorPrep(fnId, search, catId, page, size, userId);
  const data = resp?.data?.data || {};
  return {
    rawItems:        data[DECOR_FIELDS.responseItemsKey]   || [],
    rawSelectedCats: data[DECOR_FIELDS.responseSelectedKey]|| [],
    prepMeta:        data[DECOR_FIELDS.responsePrepKey]    || {},
    fields:          DECOR_FIELDS,
  };
}

async function menuGetAllCategories(userId) {
  const resp = await GetAllCategoryformenu(userId);
  return resp?.data?.data?.["Menu Category Details"] || [];
}

async function decorGetAllCategories(userId) {
  const resp = await GetAllDecorCategory(userId);
  // Adjust the key below to match the actual Decor API response shape
  return resp?.data?.data?.["Decore Main Category Details"]
      || resp?.data?.data?.["Menu Category Details"]
      || resp?.data?.data || [];
}

async function menuSearchCategories(userId, term) {
  const resp = await SearchCategoryformenu(userId, term);
  return resp?.data?.data?.["Menu Category Details"] || [];
}

async function decorSearchCategories(userId, term) {
  // If a dedicated search endpoint exists for decor, swap it in here.
  // Until then we fetch all and filter client-side.
  const all = await decorGetAllCategories(userId);
  if (!term?.trim()) return all;
  const lower = term.toLowerCase();
  return all.filter((c) =>
    [c.nameEnglish, c.nameHindi, c.nameGujarati, c.name]
      .filter(Boolean)
      .some((t) => t.toLowerCase().includes(lower))
  );
}


const inFlightGetItemsRequests = new Map();
const recentGetItemsResults = new Map();
const RESULT_CACHE_MS = 1000; // covers debounce delays like MenuItemGrid's 300ms

function dedupedGetItems(rawFn) {
  return async (fnId, search, catId, page, size, userId) => {
    const key = [fnId, search, catId, page, size, userId].join("|");

    if (inFlightGetItemsRequests.has(key)) {
      console.log("⏭️ Sharing in-flight getItems request:", key);
      return inFlightGetItemsRequests.get(key);
    }

    const cached = recentGetItemsResults.get(key);
    if (cached && Date.now() - cached.time < RESULT_CACHE_MS) {
      console.log("⏭️ Reusing recent getItems result:", key);
      return cached.data;
    }

    const promise = rawFn(fnId, search, catId, page, size, userId)
      .then((data) => {
        recentGetItemsResults.set(key, { data, time: Date.now() });
        return data;
      })
      .finally(() => {
        inFlightGetItemsRequests.delete(key);
      });

    inFlightGetItemsRequests.set(key, promise);
    return promise;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────────────────────

const MENU_CONFIG = {
  mode: "menu",
  fields: MENU_FIELDS,
  labels: MENU_LABELS,

  api: {
  
    // getItems:          menuGetItems,
     getItems:          dedupedGetItems(menuGetItems),
    /** saveOrUpdate(payload) → axios response */
    saveOrUpdate:      (payload) => AddMenuprep(payload),
    /** getAllCategories(userId) → raw category array */
    getAllCategories:   menuGetAllCategories,
    /** searchCategories(userId, term) → raw category array */
    searchCategories:  menuSearchCategories,
  },

  /** Normalise a raw flat item from getItems into the generic shape */
  normaliseItem: (rawItem, isPackage) => normaliseItem(rawItem, MENU_FIELDS, isPackage),

  /** Normalise a category group (with nested selectedItems) into generic shape */
  normaliseCategory: (rawCat, flatItems, prepMeta) =>
    normaliseCategory(rawCat, MENU_FIELDS, flatItems, prepMeta),

  /** Build the API payload from the current internal state */
  buildPayload: buildMenuPayload,
};

const DECOR_CONFIG = {
  mode: "decor",
  fields: DECOR_FIELDS,
  labels: DECOR_LABELS,

  api: {
    // getItems:          decorGetItems,
    getItems:          dedupedGetItems(decorGetItems),
    saveOrUpdate:      (payload) => DecorePrep(payload),
    getAllCategories:   decorGetAllCategories,
    searchCategories:  decorSearchCategories,
  },

  normaliseItem: (rawItem, isPackage) => normaliseItem(rawItem, DECOR_FIELDS, isPackage),

  normaliseCategory: (rawCat, flatItems, prepMeta) =>
    normaliseCategory(rawCat, DECOR_FIELDS, flatItems, prepMeta),

  buildPayload: buildDecorPayload,
};

/**
 * Returns the config object for the given planning mode.
 * @param {"menu"|"decor"} mode
 */
export function getPlanningConfig(mode) {
  if (mode === "decor") return DECOR_CONFIG;
  return MENU_CONFIG; // default
}

export { normaliseItem, normaliseCategory };