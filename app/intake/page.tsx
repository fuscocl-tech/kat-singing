import type { Metadata } from "next";
import { StudentForm } from "@/components/StudentForm";
import { studio, todayInStudio } from "@/lib/config";
import { INTAKE_INTRO } from "@/lib/student-form";
import { submitIntake } from "./actions";

export const metadata: Metadata = { title: `New singing student intake form · ${studio.name}` };
// Render per request so the signature date defaults to today.
export const dynamic = "force-dynamic";

export default function IntakePage() {
  return (
    <main className="public">
      <header className="public-header">
        <p className="eyebrow">{studio.name}</p>
        <h1>New singing student intake form</h1>
        <p className="lede">{INTAKE_INTRO}</p>
      </header>
      <StudentForm
        action={submitIntake}
        mode="intake"
        submitLabel="Send my details"
        initialValues={{ signature_date: todayInStudio() }}
      />
    </main>
  );
}
