"use client";

import { AlertCircle, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { cloneElement, isValidElement, useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { DEMO_EMAIL, DEMO_PASSWORD } from "@/lib/demo";
import { hashPassword, useStore } from "@/lib/store";

/** Only same-site relative redirects. */
function useNext() {
  const n = useSearchParams().get("next");
  return n && n.startsWith("/") && !n.startsWith("//") ? n : "/account";
}

function Shell({ title, description, children, footer }: { title: string; description: string; children: React.ReactNode; footer: React.ReactNode }) {
  return (
    <div className="container-page flex justify-center py-12 sm:py-16">
      <Card className="w-full max-w-md gap-6 rounded-3xl py-8 shadow-xl shadow-black/5 ring-border">
        <CardHeader className="px-7 sm:px-8">
          <CardTitle>
            <h1 className="font-heading text-2xl font-extrabold">{title}</h1>
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="px-7 sm:px-8">{children}</CardContent>
        <CardFooter className="justify-center border-t px-7 pt-6 text-sm text-muted-foreground sm:px-8">{footer}</CardFooter>
      </Card>
    </div>
  );
}

function DemoButton({ next }: { next: string }) {
  const router = useRouter();
  const signIn = useStore((s) => s.signIn);
  const users = useStore((s) => s.users);
  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full"
        onClick={() => {
          // The demo account is seeded on first visit; restore it if someone deleted their data.
          if (!users.some((u) => u.email === DEMO_EMAIL)) useStore.getState().resetDemo();
          signIn(DEMO_EMAIL);
          toast.success("Signed in to the demo account", { description: "Sam has a few orders in different states to explore." });
          router.push(next);
        }}
      >
        <Sparkles /> Continue with demo account
      </Button>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        Or use {DEMO_EMAIL} / {DEMO_PASSWORD}
      </p>
      <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
        <Separator className="flex-1" /> or <Separator className="flex-1" />
      </div>
    </>
  );
}

export function SignInForm() {
  const router = useRouter();
  const next = useNext();
  const users = useStore((s) => s.users);
  const signIn = useStore((s) => s.signIn);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const clean = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(clean)) return setError("Enter a valid email address.");
    if (!password) return setError("Enter your password.");
    setBusy(true);
    setError(null);
    const hash = await hashPassword(password);
    await new Promise((r) => setTimeout(r, 400));
    const user = users.find((u) => u.email === clean);
    setBusy(false);
    // Same message either way, so the form doesn't reveal which emails have accounts.
    if (!user || user.passwordHash !== hash) return setError("That email and password don't match an account on this device.");
    signIn(clean);
    toast.success(`Welcome back, ${user.name.split(" ")[0]}`);
    router.push(next);
  }

  return (
    <Shell
      title="Sign in"
      description="Track orders, save addresses and keep your wishlist."
      footer={
        <>
          New to Landed?&nbsp;
          <Link href={`/signup?next=${encodeURIComponent(next)}`} className="font-semibold text-foreground hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <DemoButton next={next} />
      <form onSubmit={submit} noValidate className="space-y-4">
        {error && (
          <Alert variant="destructive" id="signin-error">
            <AlertCircle />
            <AlertTitle>Couldn&apos;t sign you in</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!error || undefined} aria-describedby={error ? "signin-error" : undefined} className="h-11 rounded-xl" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-11 rounded-xl" />
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy && <Loader2 className="animate-spin" />} Sign in
        </Button>
      </form>
    </Shell>
  );
}

export function SignUpForm() {
  const router = useRouter();
  const next = useNext();
  const users = useStore((s) => s.users);
  const register = useStore((s) => s.register);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const clean = email.trim().toLowerCase();
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(clean)) errs.email = "Enter a valid email address.";
    else if (users.some((u) => u.email === clean)) errs.email = "There's already an account with this email. Sign in instead.";
    if (password.length < 8) errs.password = "Use at least 8 characters.";
    setErrors(errs);
    if (Object.keys(errs).length) return document.getElementById(Object.keys(errs)[0])?.focus();
    setBusy(true);
    const passwordHash = await hashPassword(password);
    await new Promise((r) => setTimeout(r, 400));
    register({ email: clean, name: name.trim(), passwordHash });
    toast.success(`Welcome to Landed, ${name.trim().split(" ")[0]}`, { description: "Any guest orders on this device are now in your account." });
    router.push(next);
  }

  return (
    <Shell
      title="Create your account"
      description="Takes 20 seconds. Any guest orders on this device come with you."
      footer={
        <>
          Already have an account?&nbsp;
          <Link href={`/signin?next=${encodeURIComponent(next)}`} className="font-semibold text-foreground hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="space-y-4">
        <FieldRow id="name" label="Full name" error={errors.name}>
          <Input id="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={!!errors.name || undefined} className="h-11 rounded-xl" />
        </FieldRow>
        <FieldRow id="email" label="Email" error={errors.email}>
          <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!errors.email || undefined} className="h-11 rounded-xl" />
        </FieldRow>
        <FieldRow id="password" label="Password" error={errors.password} hint="At least 8 characters.">
          <Input id="password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} aria-invalid={!!errors.password || undefined} className="h-11 rounded-xl" />
        </FieldRow>
        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy && <Loader2 className="animate-spin" />} Create account
        </Button>
        <p className="text-center text-xs leading-relaxed text-muted-foreground">Demo accounts are stored in this browser only. Nothing is sent to a server.</p>
      </form>
    </Shell>
  );
}

function FieldRow({ id, label, error, hint, children }: { id: string; label: string; error?: string; hint?: string; children: React.ReactNode }) {
  const msgId = error || hint ? `${id}-msg` : undefined;
  const control =
    msgId && isValidElement<{ "aria-describedby"?: string }>(children) ? cloneElement(children, { "aria-describedby": msgId }) : children;
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {control}
      {error ? (
        <p id={msgId} className="text-xs font-medium text-destructive" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={msgId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
