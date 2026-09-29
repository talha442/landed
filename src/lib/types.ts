export type Review = {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
};

export type Availability = "In stock" | "Low stock" | "Out of stock";

/** The brief's product schema, plus the few fields the delivered-price model needs. */
export type Product = {
  id: string;
  name: string;
  description: string;
  /** Department slug, e.g. "electronics". */
  category: string;
  /** Finer label shown on cards, e.g. "Smartphones". */
  subcategory: string;
  brand: string | null;
  /** Seller's item price in USD, before shipping and import charges. */
  price: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
  reviewCount: number;
  images: string[];
  thumbnail: string;
  availability: Availability;
  stock: number;
  specifications: Record<string, string>;
  /** Seller dispatch time, e.g. "Ships in 3-5 business days". */
  deliveryInfo: string;
  warranty: string;
  returnPolicy: string;
  tags: string[];
  reviews: Review[];
  sizeKind: "apparel" | "shoes" | null;
};

/** What a product card, cart line or compare column needs. Keeps client payloads small. */
export type ProductSummary = Pick<
  Product,
  | "id"
  | "name"
  | "category"
  | "subcategory"
  | "brand"
  | "price"
  | "originalPrice"
  | "discount"
  | "rating"
  | "reviewCount"
  | "thumbnail"
  | "availability"
  | "stock"
  | "deliveryInfo"
  | "warranty"
  | "returnPolicy"
  | "sizeKind"
>;

/** Even smaller: what the header's search suggestions need for every product. */
export type SearchEntry = Pick<Product, "id" | "name" | "brand" | "category" | "subcategory" | "thumbnail" | "price" | "tags">;
