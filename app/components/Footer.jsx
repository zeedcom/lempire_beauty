"use client";

import { Mail, MapPin, Phone } from "lucide-react";
import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations("Footer");

  return (
    <footer
      className="flex flex-col gap-3 w-full  border-t p-5 md:p-10"
    >
      <div className="border-b w-full flex flex-col md:flex-row md:justify-between gap-3">

        {/* Logo */}
        <div className="flex">
          <img
            className="h-32"
            src="/logo.png"
            alt="Logo"
          />
        </div>

        {/* Contact */}
        <div className="flex-1 flex flex-col md:flex-row justify-end gap-4">

          <div className="flex gap-2 items-center">
            <Phone
              size={12}
              className="text-blue-500"
            />
            <h2 className="text-sm text-gray-600">
              +213 XXXXXXXXX
            </h2>
          </div>

          <div className="flex gap-2 items-center">
            <MapPin
              size={12}
              className="text-blue-500"
            />
            <h2 className="text-sm text-gray-600">
              Baraki, Algiers, Algeria
            </h2>
          </div>

        </div>
      </div>

      {/* Copyright */}
      <div className="flex justify-center w-full">
        <h3 className="text-xs text-gray-700">
          © 2026 . {t("rights")}
        </h3>
      </div>
    </footer>
  );
}