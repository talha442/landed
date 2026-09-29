"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="container-page max-w-xl py-16">
      <Alert variant="destructive">
        <AlertTriangle />
        <AlertTitle>Something went wrong loading this page</AlertTitle>
        <AlertDescription>
          It&apos;s on our side, not yours. Your cart and orders are safe on this device. Try again, and if it keeps happening, head back home.
          {error.digest && <span className="mt-1 block font-mono text-xs opacity-70">Reference: {error.digest}</span>}
        </AlertDescription>
      </Alert>
      <div className="mt-6 flex gap-2">
        <Button onClick={reset}>
          <RotateCcw /> Try again
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Go home</Link>
        </Button>
      </div>
    </div>
  );
}
