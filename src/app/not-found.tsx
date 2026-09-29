import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-3 py-16 text-center">
      <h1 className="text-3xl font-medium">We couldn&apos;t find that page</h1>
      <p className="mt-2 text-subtle">The link may be broken, or the product may no longer be listed.</p>
      <div className="mt-6 flex justify-center gap-2">
        <Link href="/" className="btn-cta">
          Go home
        </Link>
        <Link href="/s" className="btn-ghost">
          Browse products
        </Link>
      </div>
    </div>
  );
}
