"use client";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function AuthGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem("token"); // Ya jo bhi aapka login check hai

    // Agar token nahi hai, aur user login ya register page par NAHI hai, tabhi login par bhejo
    if (!token && pathname !== "/login" && pathname !== "/register") {
      router.push("/login");
    }
  }, [pathname, router]);

  return <>{children}</>;
}