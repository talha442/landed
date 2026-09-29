import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-10 bg-nav-2 text-sm text-[#ddd]">
      <div className="mx-auto grid max-w-[1150px] gap-6 px-4 py-8 sm:grid-cols-3">
        <div>
          <p className="font-bold text-white">Shop</p>
          <ul className="mt-2 space-y-1">
            <li><Link href="/s" className="hover:underline">All products</Link></li>
            <li><Link href="/s?sort=discount" className="hover:underline">Today&apos;s deals</Link></li>
            <li><Link href="/s?sort=total" className="hover:underline">Lowest total cost</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-bold text-white">Your account</p>
          <ul className="mt-2 space-y-1">
            <li><Link href="/signin" className="hover:underline">Sign in</Link></li>
            <li><Link href="/orders" className="hover:underline">Your orders</Link></li>
            <li><Link href="/cart" className="hover:underline">Cart</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-bold text-white">About this rebuild</p>
          <p className="mt-2 text-xs leading-relaxed text-[#bbb]">
            Not affiliated with Amazon. Built for a hiring assignment. Product data comes from DummyJSON. Shipping, import charges and exchange
            rates are estimates from a fixed table. Payments are simulated, and nothing is charged or shipped.
          </p>
        </div>
      </div>
      <div className="bg-nav py-4 text-center text-xs text-[#999]">A rebuild of amazon.com: every price is the delivered price.</div>
    </footer>
  );
}
