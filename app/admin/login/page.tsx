import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { studio } from "@/lib/config";
import { login } from "../actions";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await isAdmin()) redirect("/admin");
  const { error } = await searchParams;

  return (
    <main className="public narrow">
      <header className="public-header">
        <p className="eyebrow">{studio.name}</p>
        <h1>Studio login</h1>
      </header>
      <form action={login} className="card stack">
        {error && <div className="alert">That password isn't right.</div>}
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" autoComplete="current-password" required autoFocus />
        </div>
        <button className="btn btn-primary" type="submit">
          Log in
        </button>
      </form>
    </main>
  );
}
