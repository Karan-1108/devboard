"use client";

import { useEffect, useState, type FormEvent } from "react";

type Application = {
  id: string;
  company: string;
  role: string;
  status: "APPLIED" | "INTERVIEW" | "OFFER" | "REJECTED";
  appliedAt: string;
  notes: string | null;
};

const today = new Date();
const todayValue = new Date(
  today.getTime() - today.getTimezoneOffset() * 60_000,
)
  .toISOString()
  .slice(0, 10);

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState<Application["status"]>("APPLIED");
  const [appliedAt, setAppliedAt] = useState(todayValue);
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("Loading your applications...");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setError("");
    setLoggingOut(true);

    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error ?? "Could not log out. Please try again.");
      }

      window.location.assign("/?mode=login");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Could not reach the API.",
      );
      setLoggingOut(false);
    }
  }

  async function loadApplications() {
    const response = await fetch("/api/applications");
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error ?? "Could not load applications.");
    }

    setApplications(data.applications ?? []);
    setMessage("");
  }

  useEffect(() => {
    async function start() {
      try {
        const authResponse = await fetch("/api/auth/me");

        if (!authResponse.ok) {
          setMessage("Please log in first, then open this page again.");
          return;
        }

        await loadApplications();
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : "Could not reach the API.",
        );
      }
    }

    start();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaving(true);

    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company, role, status, appliedAt, notes }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Could not save the application.");
      }

      setCompany("");
      setRole("");
      setStatus("APPLIED");
      setAppliedAt(todayValue);
      setNotes("");
      await loadApplications();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Could not reach the API.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(
    application: Application,
    newStatus: Application["status"],
  ) {
    setError("");

    try {
      const response = await fetch(`/api/applications/${application.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: application.company,
          role: application.role,
          status: newStatus,
          appliedAt: application.appliedAt.slice(0, 10),
          notes: application.notes ?? "",
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error ?? "Could not update status.");
      }

      await loadApplications();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Could not update status.",
      );
    }
  }

  async function deleteApplication(id: string) {
    if (!window.confirm("Delete this application?")) return;

    setError("");

    try {
      const response = await fetch(`/api/applications/${id}`, {
        method: "DELETE",
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error ?? "Could not delete application.");
      }

      await loadApplications();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Could not delete application.",
      );
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white sm:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">My applications</h1>
            <p className="mt-2 text-slate-400">
              Keep your job search organized in one place.
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="rounded-lg bg-slate-800 px-4 py-2 font-medium hover:bg-slate-700 disabled:opacity-50"
          >
            {loggingOut ? "Logging out..." : "Log out"}
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 grid gap-4 rounded-xl border border-slate-800 bg-slate-900 p-5 sm:grid-cols-2"
        >
          <label>
            <span className="mb-1 block text-sm text-slate-300">Company</span>
            <input
              required
              maxLength={120}
              value={company}
              onChange={(event) => setCompany(event.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
            />
          </label>

          <label>
            <span className="mb-1 block text-sm text-slate-300">Role</span>
            <input
              required
              maxLength={120}
              value={role}
              onChange={(event) => setRole(event.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
            />
          </label>

          <label>
            <span className="mb-1 block text-sm text-slate-300">Status</span>
            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as Application["status"])
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
            >
              <option value="APPLIED">Applied</option>
              <option value="INTERVIEW">Interview</option>
              <option value="OFFER">Offer</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </label>

          <label>
            <span className="mb-1 block text-sm text-slate-300">
              Date applied
            </span>
            <input
              required
              type="date"
              value={appliedAt}
              onChange={(event) => setAppliedAt(event.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
            />
          </label>

          <label className="sm:col-span-2">
            <span className="mb-1 block text-sm text-slate-300">
              Notes (optional)
            </span>
            <textarea
              maxLength={2000}
              rows={3}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
            />
          </label>

          {error && (
            <p className="text-sm text-red-400 sm:col-span-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-cyan-600 px-4 py-2 font-medium hover:bg-cyan-500 disabled:opacity-50 sm:col-span-2"
          >
            {saving ? "Saving..." : "Add application"}
          </button>
        </form>

        {message && <p className="mt-6 text-slate-300">{message}</p>}

        <div className="mt-6 space-y-3">
          {applications.map((application) => (
            <article
              key={application.id}
              className="rounded-xl border border-slate-800 bg-slate-900 p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-xl font-semibold">{application.role}</h2>
                <span className="rounded-full bg-slate-800 px-3 py-1 text-sm">
                  {application.status}
                </span>
              </div>

              <p className="mt-1 text-slate-300">{application.company}</p>
              <p className="mt-2 text-sm text-slate-400">
                Applied {application.appliedAt.slice(0, 10)}
              </p>

              {application.notes && (
                <p className="mt-3 text-slate-300">{application.notes}</p>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <label className="text-sm text-slate-300">
                  Update status
                  <select
                    value={application.status}
                    onChange={(event) =>
                      updateStatus(
                        application,
                        event.target.value as Application["status"],
                      )
                    }
                    className="ml-2 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
                  >
                    <option value="APPLIED">Applied</option>
                    <option value="INTERVIEW">Interview</option>
                    <option value="OFFER">Offer</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </label>

                <button
                  type="button"
                  onClick={() => deleteApplication(application.id)}
                  className="rounded-lg bg-red-900 px-3 py-2 text-sm hover:bg-red-800"
                >
                  Delete
                </button>
              </div>
            </article>
          ))}

          {!message && applications.length === 0 && (
            <p className="text-slate-300">No applications yet. Add one above.</p>
          )}
        </div>
      </div>
    </main>
  );
}
