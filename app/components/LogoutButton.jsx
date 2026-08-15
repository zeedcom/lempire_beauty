"use client";

import { useAuth } from "@/contexts/AuthContext";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { LogOut } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import toast from "react-hot-toast";

export default function LogoutButton() {
  const t = useTranslations("Logout");

  const { user } = useAuth();

  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    setIsLoading(true);

    try {
      await toast.promise(signOut(auth), {
        loading: t("loading"),
        success: t("success"),
        error: (e) => e?.message || t("error"),
      });

      setShowConfirm(false);
    } catch (error) {
      toast.error(error?.message || t("error"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Logout Button */}

      <button
        onClick={() => setShowConfirm(true)}
        title={t("button")}
        aria-label={t("button")}
        className="h-8 w-8 flex justify-center items-center rounded-full hover:bg-gray-50"
      >
        <LogOut size={14} />
      </button>

      {/* Confirmation Modal */}

      {showConfirm && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center px-4">
          {/* Overlay */}

          <button
            type="button"
            aria-label="Close"
            onClick={() => !isLoading && setShowConfirm(false)}
            className="absolute inset-0 bg-gray-900/70 cursor-default"
          />

          {/* Modal */}

          <div
            className="
              relative
              z-10
              w-full
              max-w-lg
              rounded-lg
              bg-white
              shadow-xl
            "
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-modal-title"
          >
            <div className="text-center px-6 py-12 sm:px-10">

              {/* Icon */}

              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <LogOut
                  size={28}
                  className="text-red-600"
                />
              </div>

              {/* Title */}

              <h2
                id="logout-modal-title"
                className="
                  text-2xl
                  font-bold
                  text-gray-900
                  sm:text-3xl
                "
              >
                {t("confirmTitle")}
              </h2>

              {/* Message */}

              <p className="mt-3 text-gray-500">
                {t("confirm")}
              </p>

              {/* Buttons */}

              <div className="mt-8 flex flex-col-reverse sm:flex-row justify-center gap-3">

                {/* Cancel */}

                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => setShowConfirm(false)}
                  className="
                    py-3
                    px-6
                    rounded-lg
                    border
                    border-gray-200
                    bg-white
                    text-gray-700
                    font-semibold
                    hover:bg-gray-50
                    transition
                    duration-200
                    disabled:opacity-50
                  "
                >
                  {t("cancel")}
                </button>

                {/* Logout */}

                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handleLogout}
                  className="
                    py-3
                    px-6
                    rounded-lg
                    bg-red-600
                    hover:bg-red-700
                    text-white
                    font-semibold
                    shadow-md
                    transition
                    duration-200
                    disabled:opacity-50
                  "
                >
                  {isLoading
                    ? t("loading")
                    : t("button")}
                </button>

              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}