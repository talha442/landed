import Link from "next/link";
import { departments } from "@/lib/catalog-meta";
import { LogoMark } from "./Logo";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t bg-card">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="max-w-xs">
          <div className="flex items-center gap-2">
            <LogoMark className="size-6" />
            <span className="font-heading text-lg font-extrabold tracking-[-0.04em]">landed</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            The price you see is the price that lands at your door. Shipping and import charges included, in your currency, before you add to cart.
          </p>
        </div>
        <FooterCol title="Shop">
          {departments.slice(0, 5).map((d) => (
            <FooterLink key={d.slug} href={`/search?category=${d.slug}`}>
              {d.name}
            </FooterLink>
          ))}
        </FooterCol>
        <FooterCol title="Your account">
          <FooterLink href="/account/orders">Orders</FooterLink>
          <FooterLink href="/wishlist">Wishlist</FooterLink>
          <FooterLink href="/account/addresses">Addresses</FooterLink>
          <FooterLink href="/cart">Cart</FooterLink>
        </FooterCol>
        <FooterCol title="How Landed works">
          <FooterLink href="/search?sort=total">Sort by total cost</FooterLink>
          <FooterLink href="/search?sort=fastest">Fastest delivery</FooterLink>
          <FooterLink href="/search?sort=discount">Deals</FooterLink>
          <FooterLink href="/accessibility">Accessibility</FooterLink>
        </FooterCol>
      </div>
      <div className="border-t">
        <p className="container-page py-5 text-xs leading-relaxed text-muted-foreground">
          Landed is a demo storefront built for a product exercise. Product data from DummyJSON. Shipping, import charges and exchange rates are
          estimates from a fixed table. Payments are simulated: nothing is charged or shipped.
        </p>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-sm font-semibold">{title}</p>
      <ul className="mt-3 space-y-2">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-sm text-muted-foreground hover:text-foreground">
        {children}
      </Link>
    </li>
  );
}
