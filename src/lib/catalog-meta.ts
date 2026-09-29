// Client-safe catalog metadata: no product data, so importing it costs nothing.

/** Seven departments instead of Amazon's forty-odd. Each maps to the catalog's categories. */
export const departments = [
  { slug: "electronics", name: "Electronics", blurb: "Phones, laptops, tablets", categories: ["smartphones", "laptops", "tablets"] },
  {
    slug: "accessories",
    name: "Accessories",
    blurb: "Audio, watches, bags, jewellery",
    categories: ["mobile-accessories", "sunglasses", "mens-watches", "womens-watches", "womens-bags", "womens-jewellery"],
  },
  { slug: "fashion", name: "Fashion", blurb: "Shirts, dresses, shoes", categories: ["mens-shirts", "tops", "womens-dresses", "mens-shoes", "womens-shoes"] },
  { slug: "beauty", name: "Beauty", blurb: "Makeup, fragrance, skin care", categories: ["beauty", "fragrances", "skin-care"] },
  { slug: "home", name: "Home", blurb: "Furniture, decor, kitchen", categories: ["furniture", "home-decoration", "kitchen-accessories"] },
  { slug: "sports", name: "Sports", blurb: "Gear for every game", categories: ["sports-accessories"] },
  { slug: "pantry", name: "Pantry", blurb: "Groceries and essentials", categories: ["groceries"] },
] as const;

export type Department = (typeof departments)[number];

export function getDepartment(slug: string | null | undefined) {
  return departments.find((d) => d.slug === slug);
}
