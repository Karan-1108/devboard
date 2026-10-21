"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";

type User = {
  email: string;
};

function BrandMark() {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" className="h-9 w-9">
      <path
        d="M9 35h7V25H9v10Zm12 0h7V19h-7v16Zm12 0h7V12h-7v23Z"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="m10 19 9-7 7 4 12-10m0 0h-8m8 0v8"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
      <rect x="4" y="10" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8 10V7a4 4 0 1 1 8 0v3m-4 4v3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function EyeIcon({ visible }: { visible: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
      <path d="M2.5 12s3.3-6 9.5-6 9.5 6 9.5 6-3.3 6-9.5 6-9.5-6-9.5-6Z" stroke="currentColor" strokeWidth="1.7" />
      {visible ? (
        <>
          <path d="M4 4 20 20" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          <path d="M12 9a3 3 0 0 0-3 3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </>
      ) : (
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
      )}
    </svg>
  );
}

export default function Home() {
  const [mode, setMode] = useState<"login" | "register">("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const emailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("mode") === "login") {
      setMode("login");
    }

    fetch("/api/auth/me")
      .then(async (response) => {
        if (!response.ok) return;
        const data = await response.json();
        setUser(data.user);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) emailInputRef.current?.focus();
  }, [mode, user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }

      setUser(data.user);
      setPassword("");
    } catch {
      setError("Could not reach the API. Check that its server is running.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  }

  const backgroundStyle = {
    backgroundColor: "#031536",
    backgroundImage:
      "radial-gradient(ellipse 30rem 24rem at 0% 0%, rgba(0, 105, 255, .82), transparent 72%), radial-gradient(ellipse 22rem 18rem at 52% 24%, rgba(0, 83, 255, .72), transparent 76%), radial-gradient(ellipse 23rem 19rem at 7% 72%, rgba(0, 89, 255, .75), transparent 74%), radial-gradient(ellipse 30rem 22rem at 88% 100%, rgba(0, 79, 255, .72), transparent 76%)",
  };

  return (
    <main
      className="relative isolate min-h-screen overflow-hidden text-white"
      style={backgroundStyle}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-[min(18vw,180px)] top-[8%] -z-10 h-[min(76vw,780px)] w-[min(76vw,780px)] rounded-full border border-blue-500/30"
      />

      <div className="mx-auto grid min-h-screen w-full max-w-7xl items-center gap-12 px-6 py-12 sm:px-10 lg:grid-cols-[1.08fr_.92fr] lg:px-16">
        <section className="flex min-h-[180px] items-center justify-center lg:min-h-[540px]">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-[0_0_34px_rgba(0,104,255,.38)] sm:h-[72px] sm:w-[72px]">
              <BrandMark />
            </div>
            <div>
              <div className="text-4xl font-bold tracking-tight sm:text-5xl">
                DevBoard
              </div>
              <p className="mt-1.5 text-base text-blue-100/85">
                Job Search Organized
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[410px] rounded-2xl border border-white/50 bg-[#061a3b]/80 px-7 py-8 shadow-[0_24px_80px_rgba(0,0,0,.28)] backdrop-blur-sm sm:px-10 sm:py-9">
          {user ? (
            <div>
              <h1 className="text-3xl font-bold">You’re signed in</h1>
              <p className="mt-2 text-blue-100/75">
                Signed in as <strong className="text-white">{user.email}</strong>.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/applications"
                  className="rounded-lg bg-blue-600 px-4 py-2.5 font-semibold transition hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  Open my applications
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-lg border border-white/35 px-4 py-2.5 font-medium transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  Log out
                </button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-[2rem] font-bold tracking-tight">
                {mode === "login" ? "Welcome back" : "Create your account"}
              </h1>
              <p className="mt-1.5 text-base text-blue-100/80">
                {mode === "login"
                  ? "Sign in to your account"
                  : "Start organizing your applications"}
              </p>

              <form onSubmit={handleSubmit} className="mt-7 space-y-5">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-blue-50">
                    Email address
                  </span>
                  <span className="relative block">
                    <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-blue-200">
                      <MailIcon />
                    </span>
                    <input
                      ref={emailInputRef}
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="h-[52px] w-full rounded-xl border border-white/70 bg-[#031536]/70 pl-12 pr-4 text-white placeholder:text-blue-100/60 focus:border-white focus:outline-none focus:ring-2 focus:ring-blue-300/40"
                    />
                  </span>
                </label>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium text-blue-50"
                  >
                    Password
                    {mode === "register" && (
                      <span className="ml-1 text-blue-100/65">
                        (at least 12 characters)
                      </span>
                    )}
                  </label>
                  <span className="relative block">
                    <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-blue-200">
                      <LockIcon />
                    </span>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={mode === "register" ? 12 : undefined}
                      autoComplete={
                        mode === "register" ? "new-password" : "current-password"
                      }
                      placeholder="Enter your password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="h-[52px] w-full rounded-xl border border-white/70 bg-[#031536]/70 pl-12 pr-12 text-white placeholder:text-blue-100/60 focus:border-white focus:outline-none focus:ring-2 focus:ring-blue-300/40"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((visible) => !visible)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      aria-pressed={showPassword}
                      className="absolute inset-y-0 right-3 flex items-center px-1 text-blue-100 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                    >
                      <EyeIcon visible={showPassword} />
                    </button>
                  </span>
                </div>

                {error && (
                  <p role="alert" className="text-sm text-red-300">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="h-[54px] w-full rounded-xl bg-blue-600 px-4 font-semibold shadow-[0_8px_24px_rgba(0,97,255,.2)] transition hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:cursor-wait disabled:opacity-60"
                >
                  {loading
                    ? "Please wait..."
                    : mode === "register"
                      ? "Create account"
                      : "Log in"}
                </button>
              </form>

              <div className="mt-7 flex items-center gap-3 text-sm text-blue-100/80">
                <span className="h-px flex-1 bg-blue-300/45" />
                <span className="whitespace-nowrap">
                  {mode === "login" ? "New to DevBoard?" : "Already have an account?"}{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setError("");
                      setMode(mode === "login" ? "register" : "login");
                    }}
                    className="font-semibold text-blue-300 transition hover:text-white focus-visible:outline-none focus-visible:underline"
                  >
                    {mode === "login" ? "Create account" : "Log in"}
                  </button>
                </span>
                <span className="h-px flex-1 bg-blue-300/45" />
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
