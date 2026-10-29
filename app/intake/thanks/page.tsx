import { studio } from "@/lib/config";

export default function ThanksPage() {
  return (
    <main className="public">
      <header className="public-header">
        <p className="eyebrow">{studio.name}</p>
        <h1>Thank you!</h1>
        <p className="lede">
          Your details have been received. I'll be in touch soon to find a lesson time that works for you.
        </p>
      </header>
    </main>
  );
}
