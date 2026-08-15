"use client";

import { Button } from "@nextui-org/react";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

export default function SearchBox() {
  const t = useTranslations("Search");

  const [query, setQuery] = useState("");

  const searchParams = useSearchParams();
  const q = searchParams.get("q");

  const router = useRouter();

  useEffect(() => {
    setQuery(q || "");
  }, [q]);

  const handleSubmit = () => {
    if (!query.trim()) return;

    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    router.refresh();
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      className="flex w-full justify-center gap-3 items-center"
    >
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
        }}
        placeholder={t("inputPlaceholder")}
        type="text"
        className="border px-5 py-2 rounded-xl bg-white focus:outline-none"
        required
      />

      <Button type="submit">
        <Search size={13} />
        {t("searchButton")}
      </Button>
    </form>
  );
}