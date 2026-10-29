"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Firebase Hosting redirects "/" to the form; this covers local development.
export default function Home() {
  const router = useRouter();
  useEffect(() => router.replace("/intake"), [router]);
  return null;
}
