import { Children } from "react";

export const menuCategoryChildren = [
  // WELCOME DRINKS AND SPRITZERS
  {
    parentId: 1,
    id: 1,
    name: "WELCOME DRINKS",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop",
    price: 100,
  },
  {
    parentId: 1,
    id: 2,
    name: "SPRITZERS",
    image:
      "https://images.unsplash.com/photo-1502741338009-cac2772e18bc?w=400&h=300&fit=crop",
    price: 120,
  },
  {
    parentId: 1,
    id: 3,
    name: "MOCKTAILS",
    image:
      "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=400&h=300&fit=crop",
    price: 150,
  },
  {
    parentId: 1,
    id: 4,
    name: "COCKTAILS",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop",
    price: 200,
  },
  {
    parentId: 1,
    id: 5,
    name: "BEER",
    image:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop",
    price: 180,
  },
  {
    parentId: 1,
    id: 6,
    name: "WINE",
    image:
      "https://images.unsplash.com/photo-1514361892635-cebbd82b8bdf?w=400&h=300&fit=crop",
    price: 250,
  },
  {
    parentId: 1,
    id: 7,
    name: "WHISKY",
    image:
      "https://images.unsplash.com/photo-1514361892635-cebbd82b8bdf?w=400&h=300&fit=crop",
    price: 300,
  },
  {
    parentId: 1,
    id: 8,
    name: "VODKA",
    image:
      "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?w=400&h=300&fit=crop",
    price: 280,
  },
  {
    parentId: 1,
    id: 9,
    name: "RUM",
    image:
      "https://images.unsplash.com/photo-1464306076886-debca5e8a6b0?w=400&h=300&fit=crop",
    price: 220,
  },
  {
    parentId: 1,
    id: 10,
    name: "GIN",
    image:
      "https://images.unsplash.com/photo-1464306076886-debca5e8a6b0?w=400&h=300&fit=crop",
    price: 210,
  },
  {
    parentId: 1,
    id: 11,
    name: "BRANDY",
    image:
      "https://images.unsplash.com/photo-1514361892635-cebbd82b8bdf?w=400&h=300&fit=crop",
    price: 230,
  },
  {
    parentId: 1,
    id: 12,
    name: "LIQUORS",
    image:
      "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?w=400&h=300&fit=crop",
    price: 260,
  },

  // FINGER FOOD STARTERS
  {
    parentId: 2,
    id: 13,
    name: "SPRING ROLLS",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop",
  },
  {
    parentId: 2,
    id: 14,
    name: "CHEESE BALLS",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop",
  },

  // HOT SOUP COUNTER
  {
    parentId: 3,
    id: 15,
    name: "TOMATO SOUP",
    image:
      "https://images.unsplash.com/photo-1502741338009-cac2772e18bc?w=400&h=300&fit=crop",
  },

  // CHAAT BAZAR
  {
    parentId: 4,
    id: 16,
    name: "PANI PURI",
    image:
      "https://images.unsplash.com/photo-1502741338009-cac2772e18bc?w=400&h=300&fit=crop",
  },

  // STYLISH BAR BE QUE
  {
    parentId: 5,
    id: 17,
    name: "GRILLED VEGGIES",
    image:
      "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop",
  },

  // MEXICAN COUNTER
  {
    parentId: 6,
    id: 18,
    name: "TACOS",
    image:
      "https://images.unsplash.com/photo-1502741338009-cac2772e18bc?w=400&h=300&fit=crop",
  },

  // EXOTIC COUNTER
  {
    parentId: 7,
    id: 19,
    name: "SUSHI",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop",
  },

  // CONTINENTAL
  {
    parentId: 8,
    id: 20,
    name: "PASTA",
    image:
      "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?w=400&h=300&fit=crop",
  },

  // OUT LANDISH SPECIALITY
  {
    parentId: 9,
    id: 21,
    name: "FUSION DISH",
    image:
      "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=400&h=300&fit=crop",
  },

  // MURADABADI SPL. COUNTER
  {
    parentId: 10,
    id: 22,
    name: "MURADABADI DAL",
    image:
      "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=400&h=300&fit=crop",
  },

  // SOUTH INDIAN
  {
    parentId: 11,
    id: 23,
    name: "IDLI",
    image:
      "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=400&h=300&fit=crop",
  },

  // ITALIAN
  {
    parentId: 12,
    id: 24,
    name: "PIZZA",
    image:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop",
  },

  // SWEET STATION
  {
    parentId: 13,
    id: 25,
    name: "GULAB JAMUN",
    image:
      "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=400&h=300&fit=crop",
  },

  // FARSHAN
  {
    parentId: 14,
    id: 26,
    name: "DHOKLA",
    image:
      "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=400&h=300&fit=crop",
  },

  // VEGETABLES
  {
    parentId: 15,
    id: 27,
    name: "MIX VEG",
    image:
      "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop",
  },

  // INDIAN BREADS
  {
    parentId: 16,
    id: 28,
    name: "NAAN",
    image:
      "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=400&h=300&fit=crop",
  },

  // DAL/KADHI
  {
    parentId: 17,
    id: 29,
    name: "DAL MAKHANI",
    image:
      "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=400&h=300&fit=crop",
  },

  // RICE/ KHICHADI / PULAO
  {
    parentId: 18,
    id: 30,
    name: "PULAO",
    image:
      "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop",
  },

  // SALAD BAR
  {
    parentId: 19,
    id: 31,
    name: "GREEK SALAD",
    image:
      "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop",
  },

  // OTHERS
  {
    parentId: 20,
    id: 32,
    name: "SPECIAL ITEM",
    image:
      "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=400&h=300&fit=crop",
  },

  // EXTRA SERVICE
  {
    parentId: 21,
    id: 33,
    name: "WAITER",
    image:
      "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=400&h=300&fit=crop",
  },

  // GOURMET DESSERTS
  {
    parentId: 22,
    id: 34,
    name: "TIRAMISU",
    image:
      "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=400&h=300&fit=crop",
  },

  // DESSERTS
  {
    parentId: 23,
    id: 35,
    name: "ICE CREAM",
    image:
      "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=400&h=300&fit=crop",
  },

  // WAFFLE COUNTER
  {
    parentId: 24,
    id: 36,
    name: "WAFFLE",
    image:
      "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=400&h=300&fit=crop",
  },

  // COFFEE SHOP
  {
    parentId: 25,
    id: 37,
    name: "CAPPUCCINO",
    image:
      "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop",
  },

  // EXOTIC FRESH FRUIT COUNTER
  {
    parentId: 26,
    id: 38,
    name: "MIX FRUIT",
    image:
      "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop",
  },

  // PAAN COUNTER
  {
    parentId: 27,
    id: 39,
    name: "MEETHA PAAN",
    image:
      "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=400&h=300&fit=crop",
  },

  // FARAL COUNTER
  {
    parentId: 28,
    id: 40,
    name: "FARAL MIX",
    image:
      "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=400&h=300&fit=crop",
  },

  // KATHIYAWADI COUNTER
  {
    parentId: 29,
    id: 41,
    name: "KATHIYAWADI SABJI",
    image:
      "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop",
  },

  // WELCOME
  {
    parentId: 30,
    id: 42,
    name: "WELCOME DRINK",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop",
  },

  // FULL DAY
  {
    parentId: 31,
    id: 43,
    name: "ALL MEALS",
    image:
      "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=400&h=300&fit=crop",
  },

  // BOMBAY COUNTER
  {
    parentId: 32,
    id: 44,
    name: "VADA PAV",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop",
  },

  // KHATTA MITHA COUNTER
  {
    parentId: 33,
    id: 45,
    name: "KHATTA MITHA MIX",
    image:
      "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=400&h=300&fit=crop",
  },

  // Appropriate Dips
  {
    parentId: 34,
    id: 46,
    name: "MINT DIP",
    image:
      "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop",
  },

  // EXOTIC ACCOMPLIMENTS
  {
    parentId: 35,
    id: 47,
    name: "OLIVES",
    image:
      "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop",
  },

  // SNACKS
  {
    parentId: 36,
    id: 48,
    name: "SAMOSA",
    image:
      "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=400&h=300&fit=crop",
  },

  // LOW CALORIES DIET
  {
    parentId: 37,
    id: 49,
    name: "SALAD",
    image:
      "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop",
  },

  // TEA - COFFEE
  {
    parentId: 38,
    id: 50,
    name: "TEA",
    image:
      "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop",
  },

  // ICECREAM
  {
    parentId: 39,
    id: 51,
    name: "VANILLA",
    image:
      "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=400&h=300&fit=crop",
  },

  // RAJASTHANI COUNTER
  {
    parentId: 40,
    id: 52,
    name: "DAL BATI",
    image:
      "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=400&h=300&fit=crop",
  },

  // CHINESE CUISINE
  {
    parentId: 41,
    id: 53,
    name: "NOODLES",
    image:
      "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop",
  },

  // BREAKFAST
  {
    parentId: 42,
    id: 54,
    name: "POHA",
    image:
      "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=400&h=300&fit=crop",
  },

  // BOMBAY STALL
  {
    parentId: 43,
    id: 55,
    name: "BHEL PURI",
    image:
      "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=400&h=300&fit=crop",
  },

  // HOT BEVERAGE
  {
    parentId: 44,
    id: 56,
    name: "HOT CHOCOLATE",
    image:
      "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=400&h=300&fit=crop",
  },

  // DRYFRUIT S
  {
    parentId: 45,
    id: 57,
    name: "CASHEW",
    image:
      "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop",
  },

  // APPETIZER
  {
    parentId: 46,
    id: 58,
    name: "SOUP",
    image:
      "https://images.unsplash.com/photo-1502741338009-cac2772e18bc?w=400&h=300&fit=crop",
  },

  // FRESH JUICE
  {
    parentId: 47,
    id: 59,
    name: "ORANGE JUICE",
    image:
      "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop",
  },

  // MAINCOURSE
  {
    parentId: 48,
    id: 60,
    name: "PANEER BUTTER MASALA",
    image:
      "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=400&h=300&fit=crop",
  },

  // MANGOLIAN STYLE COUNTER
  {
    parentId: 49,
    id: 61,
    name: "MANGOLIAN NOODLES",
    image:
      "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop",
  },

  // EXTRA COUNTER
  {
    parentId: 50,
    id: 62,
    name: "EXTRA ITEM",
    image:
      "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=400&h=300&fit=crop",
  },

  // MURADABADI COUNTER
  {
    parentId: 51,
    id: 63,
    name: "MURADABADI DAL",
    image:
      "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=400&h=300&fit=crop",
  },

  // PUNJABI DHABA
  {
    parentId: 52,
    id: 64,
    name: "MAKKI DI ROTI",
    image:
      "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=400&h=300&fit=crop",
  },
];

export const menuCategories = [
  { id: 1, name: "WELCOME DRINKS AND SPRITZERS" },
  { id: 2, name: "FINGER FOOD STARTERS" },
  { id: 3, name: "HOT SOUP COUNTER" },
  { id: 4, name: "CHAAT BAZAR" },
  { id: 5, name: "STYLISH BAR BE QUE" },
  { id: 6, name: "MEXICAN COUNTER" },
  { id: 7, name: "EXOTIC COUNTER" },
  { id: 8, name: "CONTINENTAL" },
  { id: 9, name: "OUT LANDISH SPECIALITY" },
  { id: 10, name: "MURADABADI SPL. COUNTER" },
  { id: 11, name: "SOUTH INDIAN" },
  { id: 12, name: "ITALIAN" },
  { id: 13, name: "SWEET STATION" },
  { id: 14, name: "FARSHAN" },
  { id: 15, name: "VEGETABLES" },
  { id: 16, name: "INDIAN BREADS" },
  { id: 17, name: "DAL/KADHI" },
  { id: 18, name: "RICE/ KHICHADI / PULAO" },
  { id: 19, name: "SALAD BAR" },
  { id: 20, name: "OTHERS" },
  { id: 21, name: "EXTRA SERVICE" },
  { id: 22, name: "GOURMET DESSERTS" },
  { id: 23, name: "DESSERTS" },
  { id: 24, name: "WAFFLE COUNTER" },
  { id: 25, name: "COFFEE SHOP" },
  { id: 26, name: "EXOTIC FRESH FRUIT COUNTER" },
  { id: 27, name: "PAAN COUNTER" },
  { id: 28, name: "FARAL COUNTER" },
  { id: 29, name: "KATHIYAWADI COUNTER" },
  { id: 30, name: "WELCOME" },
  { id: 31, name: "FULL DAY" },
  { id: 32, name: "BOMBAY COUNTER" },
  { id: 33, name: "KHATTA MITHA COUNTER" },
  { id: 34, name: "Appropriate Dips" },
  { id: 35, name: "EXOTIC ACCOMPLIMENTS" },
  { id: 36, name: "SNACKS" },
  { id: 37, name: "LOW CALORIES DIET" },
  { id: 38, name: "TEA - COFFEE" },
  { id: 39, name: "ICECREAM" },
  { id: 40, name: "RAJASTHANI COUNTER" },
  { id: 41, name: "CHINESE CUISINE" },
  { id: 42, name: "BREAKFAST" },
  { id: 43, name: "BOMBAY STALL" },
  { id: 44, name: "HOT BEVERAGE" },
  { id: 45, name: "DRYFRUIT S" },
  { id: 46, name: "APPETIZER" },
  { id: 47, name: "FRESH JUICE" },
  { id: 48, name: "MAINCOURSE" },
  { id: 49, name: "MANGOLIAN STYLE COUNTER" },
  { id: 50, name: "EXTRA COUNTER" },
  { id: 51, name: "MURADABADI COUNTER" },
  { id: 52, name: "PUNJABI DHABA" },
];
