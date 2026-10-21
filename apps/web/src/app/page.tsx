"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";

type User = {
  email: string;
};

export default function Home() {
  const [mode, setMode] = useState<"login" | "register">("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
      <section className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
        <h1 className="text-3xl font-bold">DevBoard</h1>
        <p className="mt-2 text-slate-400">
          Keep your job applications organized.
        </p>

        {user ? (
          <div className="mt-8">
            <p>
              You’re signed in as <strong>{user.email}</strong>.
            </p>

            <div className="mt-6 flex gap-3">
              <Link
                href="/applications"
                className="rounded-lg bg-cyan-600 px-4 py-2 font-medium hover:bg-cyan-500"
              >
                Open my applications
              </Link>

              <button
                onClick={handleLogout}
                className="rounded-lg bg-slate-700 px-4 py-2 hover:bg-slate-600"
              >
                Log out
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setMode("register")}
                className={`rounded-lg px-4 py-2 ${
                  mode === "register" ? "bg-cyan-600" : "bg-slate-800"
                }`}
              >
                Create account
              </button>

              <button
                onClick={() => setMode("login")}
                className={`rounded-lg px-4 py-2 ${
                  mode === "login" ? "bg-cyan-600" : "bg-slate-800"
                }`}
              >
                Log in
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-1 block text-sm text-slate-300">Email</span>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm text-slate-300">
                  Password (at least 12 characters)
                </span>
                <input
                  type="password"
                  required
                  minLength={12}
                  autoComplete={
                    mode === "register" ? "new-password" : "current-password"
                  }
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
                />
              </label>

              {error && <p className="text-sm text-red-400">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-cyan-600 px-4 py-2 font-medium hover:bg-cyan-500 disabled:opacity-50"
              >
                {loading
                  ? "Please wait..."
                  : mode === "register"
                    ? "Create account"
                    : "Log in"}
              </button>
            </form>
          </>
        )}
      </section>
    </main>
  );
}
