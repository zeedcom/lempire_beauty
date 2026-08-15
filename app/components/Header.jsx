"use client";

import { Search, UserCircle2 } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import LogoutButton from "./LogoutButton";
import AuthContextProvider from "@/contexts/AuthContext";
import HeaderClientButtons from "./HeaderClientButtons";
import AdminButton from "./AdminButton";

export default function Header() {
  const t = useTranslations("Header");

  const menuList = [
    {
      name: t("home"),
      link: "/",
    },
    {
      name: t("contact"),
      link: "/contact",
    },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white bg-opacity-65 backdrop-blur-2xl py-3 px-4 md:py-4 md:px-16 border-b flex items-center justify-between">

      {/* Logo */}

      <Link href="/">
        <img
          className="h-10 md:h-14 w-auto"
          src="/logo.png"
          alt="Logo"
        />
      </Link>

      {/* Desktop Menu */}

      <div className="hidden md:flex gap-2 items-center font-semibold">
        {menuList?.map((item) => {
          return (
            <Link
              href={item.link}
              key={item.link}
            >
              <button className="text-sm px-4 py-2 rounded-lg hover:bg-gray-50">
                {item.name}
              </button>
            </Link>
          );
        })}
      </div>

      {/* Actions */}

      <div className="flex items-center gap-1">

        {/* Admin */}

        <AuthContextProvider>
          <AdminButton />
        </AuthContextProvider>

        {/* Search */}

        <Link href="/search">
          <button
            title={t("searchProducts")}
            aria-label={t("searchProducts")}
            className="h-8 w-8 flex justify-center items-center rounded-full hover:bg-gray-50"
          >
            <Search size={14} />
          </button>
        </Link>

        {/* Cart / Favorites */}

        <AuthContextProvider>
          <HeaderClientButtons />
        </AuthContextProvider>

        {/* Account */}

        <Link href="/account">
          <button
            title={t("myAccount")}
            aria-label={t("myAccount")}
            className="h-8 w-8 flex justify-center items-center rounded-full hover:bg-gray-50"
          >
            <UserCircle2 size={14} />
          </button>
        </Link>

        {/* Logout */}

        <AuthContextProvider>
          <LogoutButton />
        </AuthContextProvider>

      </div>
    </nav>
  );
}