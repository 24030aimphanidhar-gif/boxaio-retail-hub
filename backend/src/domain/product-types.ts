export interface Product {
  _id: string;
  name: string;
  brand: string;
  mainCategory: MainCategory;
  subCategory: SubCategory;
  normalPrice: number;
  bulkPrice: number;
  mrp: number;
  normalUnit: string;
  bulkUnit: string;
  bulkMinQty: number;
  rating: number;
  reviews: number;
  description: string;
  image: string;
  inStock: boolean;
  isOrganic?: boolean;
  isVegetarian?: boolean;
}

// Main Categories
export type MainCategory =
  | "Fruits & Vegetables"
  | "Foodgrains, Oil & Masala"
  | "Bakery, Cakes & Dairy"
  | "Beverages"
  | "Snacks & Branded Foods"
  | "Beauty & Hygiene"
  | "Cleaning & Household"
  | "Kitchen, Garden & Pets"
  | "Eggs, Meat & Fish"
  | "Gourmet & World Food"
  | "Baby Care"
  | "Frozen Foods"
  | "Organic Staples"
  | "Pharma & Wellness"
  | "Home & Kitchen"
  | "Instant & Ready To Eat"
  | "Breakfast & Cereals"
  | "Sauces & Spreads"
  | "Biscuits & Chocolates"
  | "Tea, Coffee & Health Drinks";

// Sub Categories
export type SubCategory =
  // Fruits & Vegetables
  | "Fresh Vegetables"
  | "Fresh Fruits"
  | "Herbs & Seasonings"
  | "Exotic Vegetables"
  | "Organic Fruits & Vegetables"
  | "Cuts & Sprouts"
  // Foodgrains, Oil & Masala
  | "Rice & Rice Products"
  | "Atta & Flour"
  | "Dals & Pulses"
  | "Edible Oils"
  | "Spices & Masalas"
  | "Dry Fruits & Nuts"
  | "Salt & Sugar"
  // Bakery, Cakes & Dairy
  | "Bread & Buns"
  | "Cakes & Pastries"
  | "Milk"
  | "Butter & Cheese"
  | "Paneer & Curd"
  | "Eggs"
  // Beverages
  | "Tea"
  | "Coffee"
  | "Soft Drinks"
  | "Fruit Juices"
  | "Energy Drinks"
  | "Health Drinks"
  // Snacks & Branded Foods
  | "Chips & Namkeen"
  | "Biscuits & Cookies"
  | "Chocolates"
  | "Noodles & Pasta"
  | "Ready To Cook"
  | "Frozen Snacks"
  // Beauty & Hygiene
  | "Skin Care"
  | "Hair Care"
  | "Bath & Body"
  | "Oral Care"
  | "Feminine Hygiene"
  | "Makeup"
  // Cleaning & Household
  | "Detergents"
  | "Floor Cleaners"
  | "Dishwash"
  | "Garbage Bags"
  | "Fresheners"
  | "Cleaning Tools"
  // Eggs, Meat & Fish
  | "Chicken"
  | "Mutton"
  | "Fish & Seafood"
  | "Eggs"
  | "Ready To Cook Meat"
  // Sauces & Spreads
  | "Spreads"
  | "Sauces"
  // Breakfast & Cereals
  | "Cereals"
  // Baby Care
  | "Baby Diapers"
  | "Baby Food"
  // Organic Staples
  | "Organic Rice"
  | "Organic Pulses"
  | "Organic Oils"
  // Frozen Foods
  | "Frozen Veg"
  | "Frozen Parathas"
  // Kitchen & Home
  | "Cookware"
  | "Storage";
