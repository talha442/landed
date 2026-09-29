import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BuyBox } from "@/components/product/BuyBox";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductRail } from "@/components/product/ProductRail";
import { ProductRating } from "@/components/product/ProductRating";
import { ProductTabs } from "@/components/product/ProductTabs";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { getDepartment, getProduct, products, related, summarize } from "@/lib/catalog";

export function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: PageProps<"/product/[id]">): Promise<Metadata> {
  const p = getProduct((await params).id);
  return p ? { title: p.name, description: p.description } : { title: "Product not found" };
}

export default async function ProductPage({ params }: PageProps<"/product/[id]">) {
  const p = getProduct((await params).id);
  if (!p) notFound();
  const dept = getDepartment(p.category);

  return (
    <div className="container-page py-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          {dept && (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={`/search?category=${dept.slug}`}>{dept.name}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </>
          )}
          <BreadcrumbItem className="min-w-0">
            <BreadcrumbPage className="truncate">{p.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mt-5 grid gap-8 md:grid-cols-2 lg:gap-14">
        <ProductGallery images={p.images} name={p.name} />
        <div className="min-w-0">
          {p.brand ? (
            <Link href={`/search?q=${encodeURIComponent(p.brand)}`} className="text-sm font-semibold text-muted-foreground hover:text-foreground">
              {p.brand}
            </Link>
          ) : (
            <p className="text-sm font-semibold text-muted-foreground">{p.subcategory}</p>
          )}
          <h1 className="mt-1 text-3xl leading-tight font-extrabold sm:text-[34px]">{p.name}</h1>
          <a href="#details" className="mt-2 inline-block hover:opacity-80">
            <ProductRating rating={p.rating} count={p.reviewCount} size="md" />
          </a>
          <div className="mt-6">
            <BuyBox product={summarize(p)} />
          </div>
        </div>
      </div>

      <div className="mt-16">
        <ProductTabs product={p} />
      </div>

      <div className="mt-16">
        <ProductRail title="You might also like" subtitle={`More in ${p.subcategory}`} href={`/search?category=${p.category}`} products={related(p, 4).map(summarize)} />
      </div>
    </div>
  );
}
