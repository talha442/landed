import { PackageX } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";

export default function ProductNotFound() {
  return (
    <div className="container-page py-16">
      <EmptyState
        icon={PackageX}
        title="We couldn't find that product"
        body="The link may be broken, or the product is no longer listed. Try searching for it instead."
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Button asChild>
              <Link href="/search">Browse all products</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Go home</Link>
            </Button>
          </div>
        }
      />
    </div>
  );
}
