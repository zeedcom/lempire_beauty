"use client";

import { useTranslations } from "next-intl";
import {
  Truck,
  ShieldCheck,
  PackageCheck,
  Sparkles,
} from "lucide-react";

export default function Perks() {
  const t = useTranslations("Perks");

  const perks = [
    {
      icon: Truck,
      title: t("freeShipping.title"),
      description: t("freeShipping.description"),
    },
    {
      icon: ShieldCheck,
      title: t("authentic.title"),
      description: t("authentic.description"),
    },
    {
      icon: PackageCheck,
      title: t("packed.title"),
      description: t("packed.description"),
    },
    {
      icon: Sparkles,
      title: t("beautySelection.title"),
      description: t("beautySelection.description"),
    },
  ];
20
  return (
    <section className="bg-white py-2 sm:py-4">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mt-1 grid max-w-5xl grid-cols-1 md:grid-cols-4">
          {perks.map((perk) => {
            const Icon = perk.icon;

            return (
              <div
                key={perk.title}
                className="flex items-center gap-4 mt-2 bg-[var(--color-brand)] p-6 transition hover:-translate-y-1 hover:shadow-md"
              >
                {/* Icon */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[var(--color-brand-dark)] bg-white">
                  <Icon
                    size={24}
                    strokeWidth={1.5}
                    className="text-[var(--color-brand-dark)]"
                  />
                </div>

                {/* Text */}
                <div className="flex flex-col">
                  <h3 className="text-sm font-semibold text-gray-900">
                    {perk.title}
                  </h3>

                  {/* Optional: display description */}
                  <p className="mt-1 text-xs text-gray-600">
                    {perk.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}