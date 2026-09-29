"use client";

import { MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AddressForm, emptyAddress } from "@/components/checkout/AddressForm";
import { EmptyState } from "@/components/common/EmptyState";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Address } from "@/lib/orders";
import { getDestination } from "@/lib/shipping";
import { useCurrentUser, useStore } from "@/lib/store";
import { useDestination } from "@/lib/useDestination";

export function Addresses() {
  const user = useCurrentUser()!;
  const dest = useDestination();
  const { upsertAddress, deleteAddress } = useStore.getState();
  const [editing, setEditing] = useState<Address | null>(null);

  const addNew = () => setEditing(emptyAddress(dest.code, user.name));

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold">Addresses</h2>
        {user.addresses.length > 0 && (
          <Button onClick={addNew}>
            <Plus /> Add address
          </Button>
        )}
      </div>

      {user.addresses.length === 0 ? (
        <EmptyState
          className="mt-5"
          icon={MapPin}
          title="No saved addresses"
          body="Save an address once and checkout skips straight to delivery."
          action={
            <Button onClick={addNew}>
              <Plus /> Add an address
            </Button>
          }
        />
      ) : (
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {user.addresses.map((a) => {
            const isDefault = a.id === user.defaultAddressId;
            return (
              <li key={a.id} className="flex flex-col rounded-3xl border bg-card p-5">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{a.label || "Address"}</p>
                  {isDefault && <Badge className="rounded-full bg-brand-soft text-brand">Default</Badge>}
                </div>
                <address className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground not-italic">
                  {a.name}
                  <br />
                  {a.line1}
                  <br />
                  {a.city} {a.postcode}
                  <br />
                  {getDestination(a.country).name} · {a.phone}
                </address>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  <Button variant="outline" size="sm" onClick={() => setEditing(a)}>
                    <Pencil /> Edit
                  </Button>
                  {!isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        upsertAddress(user.email, a, true);
                        toast.success(`${a.label || "Address"} is now your default`);
                      }}
                    >
                      Make default
                    </Button>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive" aria-label={`Delete ${a.label}`}>
                        <Trash2 /> Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete this address?</AlertDialogTitle>
                        <AlertDialogDescription>
                          {a.line1}, {a.city}. Past orders keep their address; this only removes it from checkout.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Keep it</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-white hover:bg-destructive/90"
                          onClick={() => {
                            deleteAddress(user.email, a.id);
                            toast("Address deleted");
                          }}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">{editing && user.addresses.some((x) => x.id === editing.id) ? "Edit address" : "New address"}</DialogTitle>
            <DialogDescription>Used at checkout. Choosing it also sets the currency and delivery costs.</DialogDescription>
          </DialogHeader>
          {editing && (
            <AddressForm
              key={editing.id}
              initial={editing}
              showLabel
              submitLabel="Save address"
              onCancel={() => setEditing(null)}
              onSubmit={(a) => {
                upsertAddress(user.email, a);
                setEditing(null);
                toast.success("Address saved");
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
