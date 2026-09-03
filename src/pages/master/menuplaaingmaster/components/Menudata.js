export const PACKAGES = ["Gujarati Thali", "North Indian", "Continental", "Chinese"];

export const CATEGORIES = ["All Items", "Starter", "Main Course", "Dessert", "Juice", "Hot Beverage"];

export const MENU_ITEMS = [
  { id: 1,  name: "Dhokla",                    category: "Starter",      popular: true,  image: "https://placehold.co/56x56/3b82f6/fff?text=D"  },
  { id: 2,  name: "Handvo",                    category: "Starter",      popular: true,  image: "https://placehold.co/56x56/3b82f6/fff?text=H"  },
  { id: 3,  name: "Khaman",                    category: "Starter",      popular: false, image: "https://placehold.co/56x56/3b82f6/fff?text=K"  },
  { id: 4,  name: "Patra",                     category: "Starter",      popular: false, image: "https://placehold.co/56x56/3b82f6/fff?text=P"  },
  { id: 5,  name: "Papdi No Lot",              category: "Main Course",  popular: false, image: "https://placehold.co/56x56/3b82f6/fff?text=PL" },
  { id: 6,  name: "Dal Baati",                 category: "Main Course",  popular: true,  image: "https://placehold.co/56x56/3b82f6/fff?text=DB" },
  { id: 7,  name: "Undhiyu",                   category: "Main Course",  popular: true,  image: "https://placehold.co/56x56/3b82f6/fff?text=U"  },
  { id: 8,  name: "Shrikhand",                 category: "Dessert",      popular: false, image: "https://placehold.co/56x56/3b82f6/fff?text=S"  },
  { id: 9,  name: "Litchi Pineapple Juice",    category: "Juice",        popular: false, image: "https://placehold.co/56x56/3b82f6/fff?text=LJ" },
  { id: 10, name: "World Vision Juice",        category: "Juice",        popular: false, image: "https://placehold.co/56x56/3b82f6/fff?text=WJ" },
  { id: 11, name: "Chinese Wanton Soup",       category: "Hot Beverage", popular: false, image: "https://placehold.co/56x56/3b82f6/fff?text=CS" },
  { id: 12, name: "Roasted Tomato Basil Soup", category: "Hot Beverage", popular: false, image: "https://placehold.co/56x56/3b82f6/fff?text=RT" },
  { id: 13, name: "Banana Orange Blossom",     category: "Juice",        popular: false, image: "https://placehold.co/56x56/f97316/fff?text=BO" },
  { id: 14, name: "Strawberry Crane Blossom",  category: "Juice",        popular: false, image: "https://placehold.co/56x56/f97316/fff?text=SC" },
  { id: 15, name: "Exotic Fruit Punch",        category: "Juice",        popular: false, image: "https://placehold.co/56x56/f97316/fff?text=EF" },
  { id: 16, name: "Paan Shots",                category: "Starter",      popular: false, image: "https://placehold.co/56x56/f97316/fff?text=PS" },
];

export const INITIAL_BASIC_SELECTED   = [1, 2, 3, 5, 9, 10, 11, 12];
export const INITIAL_PREMIUM_SELECTED = [1, 2, 6, 7, 13, 14];

export const BASIC_PREVIEW_CATS = [
  { name: "Juice",        itemIds: [9, 10]  },
  { name: "Hot Beverage", itemIds: [11, 12] },
];

export const PREMIUM_PREVIEW_CATS = [
  { name: "Juice",       itemIds: [13, 14] },
  { name: "Main Course", itemIds: [6, 7]   },
];