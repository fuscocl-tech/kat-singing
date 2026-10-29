import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { studio } from "@/lib/config";
import { logout } from "../actions";

export default async function CrmLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="crm">
      <header className="crm-header">
        <Link href="/admin" className="brand">
          {studio.name}
        </Link>
        <nav>
          <Link href="/admin">Students</Link>
          <Link href="/admin/students/new">Add student</Link>
          <a href="/admin/export">Export CSV</a>
          <a href="/intake" target="_blank">
            Intake form ↗
          </a>
          <form action={logout}>
            <button type="submit" className="link-button">
              Log out
            </button>
          </form>
        </nav>
      </header>
      <main className="crm-main">{children}</main>
    </div>
  );
}
