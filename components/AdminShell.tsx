"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { isAdminEmail } from "@/lib/admins";
import { studio } from "@/lib/config";

export function AdminShell({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [error, setError] = useState("");

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  async function signIn() {
    setError("");
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (e) {
      const code = (e as { code?: string }).code;
      if (code !== "auth/popup-closed-by-user" && code !== "auth/cancelled-popup-request") {
        setError("Sign-in didn't work. Please try again.");
      }
    }
  }

  if (user === undefined) return <main className="public narrow muted">Loading…</main>;

  if (!user || !isAdminEmail(user.email)) {
    return (
      <main className="public narrow">
        <header className="public-header">
          <p className="eyebrow">{studio.name}</p>
          <h1>Studio login</h1>
        </header>
        <div className="card stack">
          {user ? (
            <>
              <div className="alert">{user.email} doesn&apos;t have access to the studio records.</div>
              <button className="btn" onClick={() => signOut(auth)}>
                Sign in with a different account
              </button>
            </>
          ) : (
            <>
              {error && <div className="alert">{error}</div>}
              <button className="btn btn-primary" onClick={signIn}>
                Sign in with Google
              </button>
            </>
          )}
        </div>
      </main>
    );
  }

  return (
    <div className="crm">
      <header className="crm-header">
        <Link href="/admin" className="brand">
          {studio.name}
        </Link>
        <nav>
          <Link href="/admin">Students</Link>
          <Link href="/admin/new">Add student</Link>
          <a href="/intake" target="_blank">
            Intake form ↗
          </a>
          <button type="button" className="link-button" onClick={() => signOut(auth)}>
            Log out
          </button>
        </nav>
      </header>
      <main className="crm-main">{children}</main>
    </div>
  );
}
