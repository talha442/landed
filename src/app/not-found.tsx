import { Compass } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container-page py-16">
      <EmptyState
        icon={Compass}
        title="This page doesn't exist"
        body="The link may be broken or the page has moved. Search for what you need, or head back home."
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Button asChild>
              <Link href="/">Go home</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/search">Browse products</Link>
            </Button>
          </div>
        }
      />
    </div>
  );
}
