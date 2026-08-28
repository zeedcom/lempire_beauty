"use client";

import {
  Search,
  UserCircle2,
  Languages,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";
import {
  useLocale,
  useTranslations,
} from "next-intl";
import { usePathname, useRouter } from "next/navigation";

import LogoutButton from "./LogoutButton";
import AuthContextProvider from "@/contexts/AuthContext";
import HeaderClientButtons from "./HeaderClientButtons";
import AdminButton from "./AdminButton";

export default function Header() {
  const t = useTranslations("Header");

  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

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

  const languages = [
    {
      code: "en",
      name: "English",
      short: "EN",
    },
    {
      code: "fr",
      name: "Français",
      short: "FR",
    },
    {
      code: "ar",
      name: "العربية",
      short: "AR",
    },
  ];

  const changeLanguage = (newLocale) => {
    if (newLocale === locale) return;

    // Remove current locale from pathname
    const pathnameWithoutLocale = pathname.replace(
      new RegExp(`^/${locale}`),
      ""
    );

    // Make sure we have "/"
    const newPath = pathnameWithoutLocale || "/";

    router.push(`/${newLocale}${newPath}`);
  };

  return (
   
    <nav className="sticky top-0 z-50 bg-white bg-opacity-65 backdrop-blur-2xl py-3 px-4 md:py-4 md:px-16 border-b flex items-center justify-between">

      {/* Logo */}

      <Link href={`/${locale}`}>
        <img
          className="h-10 md:h-14 w-auto"
          src="/logo.png"
          alt="Logo"
        />
      </Link>

      {/* Navigation */}

      <div className="flex gap-2 items-center font-semibold">
        {menuList.map((item) => (
          <Link
            href={`/${locale}${item.link}`}
            key={item.link}
          >
            <button
              title={item.name}
              aria-label={item.name}
              className="text-sm px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center justify-center"
            >
              {/* Desktop */}

              <span className="hidden md:inline">
                {item.name}
              </span>

              {/* Mobile - Contact icon */}

              {item.link === "/contact" && (
                <MessageCircle
                  size={16}
                  className="md:hidden"
                />
              )}

              {/* Mobile - Home text */}

              {item.link !== "/contact" && (
                <span className="md:hidden">
                  {item.name}
                </span>
              )}
            </button>
          </Link>
        ))}
      </div>

      {/* Actions */}

      <div className="flex items-center gap-1">

        {/* Language Switcher */}

        <div className="relative group">
          <button
            type="button"
            title={t("language")}
            aria-label={t("language")}
            className="h-8 px-2 flex items-center gap-1 rounded-full hover:bg-gray-50"
          >
            <Languages size={15} />

            <span className="text-xs font-semibold uppercase">
              {locale}
            </span>
          </button>

          {/* Language Dropdown */}

          <div
            className="
              absolute
              right-0
              top-full
              pt-2
              hidden
              group-hover:block
              z-50
            "
          >
            <div className="w-36 rounded-lg border bg-white shadow-lg p-1">

              {languages.map((language) => (
                <button
                  key={language.code}
                  type="button"
                  onClick={() =>
                    changeLanguage(language.code)
                  }
                  className={`
                    w-full
                    flex
                    items-center
                    justify-between
                    px-3
                    py-2
                    rounded-md
                    text-sm
                    transition
                    ${
                      locale === language.code
                        ? "bg-gray-100 font-semibold"
                        : "hover:bg-gray-50"
                    }
                  `}
                >
                  <span>{language.name}</span>

                  <span className="text-xs text-gray-400 uppercase">
                    {language.short}
                  </span>
                </button>
              ))}

            </div>
          </div>
        </div>

        {/* Admin */}

        <AuthContextProvider>
          <AdminButton />
        </AuthContextProvider>

        {/* Search */}

        <Link href={`/${locale}/search`}>
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

        <Link href={`/${locale}/account`}>
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