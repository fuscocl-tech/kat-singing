// Writes the admin email list and the intake field names into firestore.rules.
// Usage: node scripts/sync-rules.mts           (update the file)
//        node scripts/sync-rules.mts --check   (fail if it's out of date; runs before every build)
import { readFileSync, writeFileSync } from "node:fs";
import { ADMIN_EMAILS } from "../lib/admins.ts";
import { ALL_FIELDS } from "../lib/student-form.ts";

const file = new URL("../firestore.rules", import.meta.url);
const list = (items: string[]) => `[${items.map((i) => `'${i}'`).join(", ")}]`;

function block(name: string, fn: string, items: string[]) {
  return `// GENERATED:${name}:start\n    function ${fn}() {\n      return ${list(items)};\n    }\n    // GENERATED:${name}:end`;
}

const current = readFileSync(file, "utf8");
const next = current
  .replace(/\/\/ GENERATED:admins:start[\s\S]*?\/\/ GENERATED:admins:end/, block("admins", "adminEmails", ADMIN_EMAILS.map((e) => e.toLowerCase())))
  .replace(/\/\/ GENERATED:fields:start[\s\S]*?\/\/ GENERATED:fields:end/, block("fields", "intakeFields", ALL_FIELDS.map((f) => f.name)));

if (process.argv.includes("--check")) {
  if (next !== current) {
    console.error("firestore.rules is out of date with lib/admins.ts or lib/student-form.ts. Run: npm run rules");
    process.exit(1);
  }
} else {
  writeFileSync(file, next);
  console.log("Updated firestore.rules");
}
