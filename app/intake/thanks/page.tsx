import type { Metadata } from "next";
import { studio } from "@/lib/config";

export const metadata: Metadata = { title: `Thank you · ${studio.name}` };

export default function ThanksPage() {
  return (
    <main className="public">
      <header className="public-header">
        <p className="eyebrow">{studio.name}</p>
        <h1>Thank you for completing the form!</h1>
        <p className="lede">
          Your details have been received. Kat will be in touch soon to find a lesson time that works for you.
        </p>
        <p className="muted">You can close this page now.</p>
      </header>
    </main>
  );
}
