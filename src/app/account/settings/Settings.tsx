"use client";

import { LogOut, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { destinations } from "@/lib/shipping";
import { useCurrentUser, useStore } from "@/lib/store";
import { useDestination } from "@/lib/useDestination";

export function Settings() {
  const user = useCurrentUser()!;
  const dest = useDestination();
  const router = useRouter();
  const { updateProfile, setShipTo, signOut, resetDemo } = useStore.getState();
  const [name, setName] = useState(user.name);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Settings</h2>

      <Card className="rounded-3xl ring-border">
        <CardHeader>
          <CardTitle className="font-heading text-base font-bold">Profile</CardTitle>
          <CardDescription>How we greet you and label your orders.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="flex flex-wrap items-end gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!name.trim()) return toast.error("Your name can't be empty");
              updateProfile(user.email, { name: name.trim() });
              toast.success("Profile updated");
            }}
          >
            <div className="min-w-56 flex-1 space-y-1.5">
              <Label htmlFor="s-name">Full name</Label>
              <Input id="s-name" value={name} onChange={(e) => setName(e.target.value)} className="h-11 rounded-xl" />
            </div>
            <div className="min-w-56 flex-1 space-y-1.5">
              <Label htmlFor="s-email">Email</Label>
              <Input id="s-email" value={user.email} disabled className="h-11 rounded-xl" />
            </div>
            <Button type="submit" disabled={name.trim() === user.name}>
              Save
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="rounded-3xl ring-border">
        <CardHeader>
          <CardTitle className="font-heading text-base font-bold">Shopping from</CardTitle>
          <CardDescription>Sets the currency, shipping and import charges on every price.</CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={dest.code}
            onValueChange={(v) => {
              setShipTo(v);
              toast.success("Prices updated", { description: `Now showing delivered prices for ${destinations.find((d) => d.code === v)?.name}.` });
            }}
          >
            <SelectTrigger className="h-11 w-full max-w-xs rounded-xl" aria-label="Country">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {destinations.map((d) => (
                <SelectItem key={d.code} value={d.code}>
                  {d.name} ({d.currency})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="rounded-3xl ring-border">
        <CardHeader>
          <CardTitle className="font-heading text-base font-bold">Display</CardTitle>
          <CardDescription>Text size, reduced motion, underlined links and higher contrast.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
            <Link href="/accessibility">Accessibility settings</Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="rounded-3xl ring-border">
        <CardHeader>
          <CardTitle className="font-heading text-base font-bold">Session</CardTitle>
          <CardDescription>Everything is stored in this browser. Resetting brings back the original demo data.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => {
              signOut();
              toast("You're signed out");
              router.push("/");
            }}
          >
            <LogOut /> Sign out
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" className="text-muted-foreground hover:text-destructive">
                <RotateCcw /> Reset demo data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset everything on this device?</AlertDialogTitle>
                <AlertDialogDescription>Your cart, wishlist, orders and any accounts you created here will be cleared. The demo account comes back as new.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-white hover:bg-destructive/90"
                  onClick={() => {
                    resetDemo();
                    toast("Demo data reset");
                    router.push("/");
                  }}
                >
                  Reset
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
