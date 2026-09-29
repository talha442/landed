export type Review = {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
};

export type Product = {
  id: number;
  title: string;
  description: string;
  category: string;
  brand: string | null;
  /** Seller's price in USD, before shipping, import charges or tax. */
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  tags: string[];
  sku: string;
  weight: number;
  dimensions: { width: number; height: number; depth: number };
  warranty: string;
  shippingInformation: string;
  returnPolicy: string;
  reviews: Review[];
  thumbnail: string;
  images: string[];
};

/** The fields a search result card needs; keeps the client payload small. */
export type ProductSummary = Pick<
  Product,
  | "id"
  | "title"
  | "category"
  | "brand"
  | "price"
  | "discountPercentage"
  | "rating"
  | "stock"
  | "shippingInformation"
  | "thumbnail"
  | "warranty"
  | "returnPolicy"
> & { reviewCount: number };
