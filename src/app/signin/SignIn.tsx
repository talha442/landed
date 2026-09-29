"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { hashPassword, useStore } from "@/lib/store";

/**
 * Amazon's email-first flow, kept because it's good: one field, then the app decides
 * whether you're signing in or signing up. Nobody has to pick the right door first.
 */
export function SignIn() {
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  const users = useStore((s) => s.users);
  const { register, signIn } = useStore.getState();

  const [step, setStep] = useState<"email" | "password" | "create">("email");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const existing = users.find((u) => u.email === email.trim().toLowerCase());

  function onEmail(e: React.FormEvent) {
    e.preventDefault();
    const clean = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(clean)) return setError("Enter a valid email address.");
    setEmail(clean);
    setError("");
    setStep(users.some((u) => u.email === clean) ? "password" : "create");
  }

  async function onPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!existing) return;
    setBusy(true);
    const ok = (await hashPassword(password)) === existing.passwordHash;
    setBusy(false);
    if (!ok) return setError("That password is incorrect.");
    signIn(existing.email);
    router.push(next);
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setError("Enter your name.");
    if (password.length < 6) return setError("Passwords need at least 6 characters.");
    setBusy(true);
    register({ email, name: name.trim(), passwordHash: await hashPassword(password) });
    setBusy(false);
    router.push(next);
  }

  const back = (
    <p className="text-sm">
      {email}{" "}
      <button
        type="button"
        className="link"
        onClick={() => {
          setStep("email");
          setPassword("");
          setError("");
        }}
      >
        Change
      </button>
    </p>
  );

  return (
    <div className="flex justify-center bg-white px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="rounded-lg border border-line p-6">
          {step === "email" && (
            <form onSubmit={onEmail} noValidate>
              <h1 className="text-[28px] leading-tight font-normal">Sign in or create account</h1>
              <label className="mt-4 block text-sm font-bold" htmlFor="email">
                Email
              </label>
              <input id="email" type="email" autoComplete="email" autoFocus className="field mt-1" value={email} onChange={(e) => setEmail(e.target.value)} />
              <ErrorLine error={error} />
              <button className="btn-cta mt-4 w-full">Continue</button>
            </form>
          )}

          {step === "password" && existing && (
            <form onSubmit={onPassword}>
              <h1 className="text-[28px] leading-tight font-normal">Welcome back, {existing.name.split(" ")[0]}</h1>
              {back}
              <label className="mt-4 block text-sm font-bold" htmlFor="password">
                Password
              </label>
              <input id="password" type="password" autoComplete="current-password" autoFocus className="field mt-1" value={password} onChange={(e) => setPassword(e.target.value)} />
              <ErrorLine error={error} />
              <button className="btn-cta mt-4 w-full" disabled={busy}>
                Sign in
              </button>
            </form>
          )}

          {step === "create" && (
            <form onSubmit={onCreate}>
              <h1 className="text-[28px] leading-tight font-normal">Create your account</h1>
              <p className="mt-1 text-sm text-subtle">Looks like you&apos;re new here.</p>
              {back}
              <label className="mt-4 block text-sm font-bold" htmlFor="name">
                Your name
              </label>
              <input id="name" autoComplete="name" autoFocus className="field mt-1" value={name} onChange={(e) => setName(e.target.value)} />
              <label className="mt-3 block text-sm font-bold" htmlFor="new-password">
                Password
              </label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                className="field mt-1"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <ErrorLine error={error} />
              <button className="btn-cta mt-4 w-full" disabled={busy}>
                Create account
              </button>
            </form>
          )}
        </div>
        <p className="mt-4 text-center text-xs text-subtle">
          Demo accounts live in this browser only. You don&apos;t need one to shop or check out.{" "}
          <Link href={next} className="link">
            Continue as guest
          </Link>
        </p>
      </div>
    </div>
  );
}

function ErrorLine({ error }: { error: string }) {
  return error ? (
    <p className="mt-2 text-sm text-deal" role="alert">
      {error}
    </p>
  ) : null;
}

/** Only allow same-site relative redirects. */
function safeNext(n: string | null) {
  return n && n.startsWith("/") && !n.startsWith("//") ? n : "/";
}
