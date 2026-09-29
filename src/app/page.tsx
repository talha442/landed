import { BundlePromo, CategoryGrid, Promises } from "@/components/home/HomeSections";
import { Hero } from "@/components/home/Hero";
import { PersonalRails } from "@/components/home/PersonalRails";
import { ProductRail } from "@/components/product/ProductRail";
import { deals, departments, getProduct, products, summarize, trending } from "@/lib/catalog";

// Hand-picked showcase and department covers: the catalog's first item isn't always its best photo.
const SHOWCASE = ["apple-airpods-max-silver", "iphone-13-pro", "calvin-klein-ck-one"];
const COVERS: Record<string, string> = {
  electronics: "apple-macbook-pro-14-inch-space-grey",
  accessories: "apple-airpods-max-silver",
  fashion: "nike-air-jordan-1-red-and-black",
  beauty: "red-lipstick",
  home: "annibale-colombo-sofa",
  sports: "baseball-glove",
  pantry: "green-bell-pepper",
};

export default function Home() {
  const showcase = SHOWCASE.map(getProduct).filter((p) => !!p).map(summarize);
  const categories = departments.map((dept) => {
    const items = products.filter((p) => p.category === dept.slug);
    const cover = getProduct(COVERS[dept.slug]) ?? items[0];
    return { dept, image: cover.images[0], count: items.length };
  });
  const byDepartment = Object.fromEntries(
    departments.map((d) => [d.slug, products.filter((p) => p.category === d.slug && p.stock > 0).sort((a, b) => b.rating - a.rating).slice(0, 8).map(summarize)]),
  );

  return (
    <>
      <Hero showcase={showcase} />
      <Promises />
      <CategoryGrid items={categories} />
      <div className="container-page mt-16">
        <ProductRail title="Trending now" subtitle="Top rated and in stock" href="/search?sort=rating" products={trending(4).map(summarize)} />
      </div>
      <BundlePromo />
      <PersonalRails byDepartment={byDepartment} fallback={deals(4).map(summarize)} />
    </>
  );
}
