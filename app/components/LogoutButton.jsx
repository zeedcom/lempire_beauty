"use client";

import { useAuth } from "@/contexts/AuthContext";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { LogOut } from "lucide-react";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";

export default function LogoutButton() {
  const t = useTranslations("Logout");

  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    if (!confirm(t("confirm"))) return;

    try {
      await toast.promise(signOut(auth), {
        loading: t("loading"),
        success: t("success"),
        error: (e) => e?.message || t("error"),
      });
    } catch (error) {
      toast.error(error?.message || t("error"));
    }
  };

  return (
    <button
      onClick={handleLogout}
      title={t("button")}
      aria-label={t("button")}
      className="h-8 w-8 flex justify-center items-center rounded-full hover:bg-gray-50"
    >
      <LogOut size={14} />
    </button>
  );
}