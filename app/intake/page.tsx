import type { Metadata } from "next";
import { IntakeForm } from "@/components/IntakeForm";
import { studio } from "@/lib/config";
import { INTAKE_INTRO } from "@/lib/student-form";

export const metadata: Metadata = { title: `New singing student intake form · ${studio.name}` };

export default function IntakePage() {
  return (
    <main className="public">
      <header className="public-header">
        <p className="eyebrow">{studio.name}</p>
        <h1>New singing student intake form</h1>
        <p className="lede">{INTAKE_INTRO}</p>
      </header>
      <IntakeForm />
    </main>
  );
}
