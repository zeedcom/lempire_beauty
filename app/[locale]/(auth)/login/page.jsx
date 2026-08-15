"use client";

import { useAuth } from "@/contexts/AuthContext";
import { auth } from "@/lib/firebase";
import { createUser } from "@/lib/firestore/user/write";
import { Button } from "@nextui-org/react";
import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useLocale, useTranslations } from "next-intl";

export default function Page() {
  const t = useTranslations("Login");
  const locale = useLocale();

  const { user } = useAuth();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState({});

  const handleData = (key, value) => {
    setData({
      ...data,
      [key]: value,
    });
  };

  const handleLogin = async () => {
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(
        auth,
        data?.email,
        data?.password
      );

      toast.success(t("success"));
    } catch (error) {
      toast.error(error?.message || t("error"));
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (user) {
      router.push(`/${locale}/account`);
    }
  }, [user, locale, router]);

  return (
    <main className="w-full flex justify-center items-center bg-gray-300 md:p-24 p-10 min-h-screen">
      <section className="flex flex-col gap-3">

        <div className="flex justify-center">
          <img
            className="h-16"
            src="/logo.png"
            alt="Logo"
          />
        </div>

        <div className="flex flex-col gap-3 bg-white md:p-10 p-5 rounded-xl md:min-w-[440px] w-full">

          <h1 className="font-bold text-xl">
            {t("title")}
          </h1>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
            className="flex flex-col gap-3"
          >
            <input
              placeholder={t("emailPlaceholder")}
              type="email"
              name="user-email"
              id="user-email"
              value={data?.email || ""}
              onChange={(e) => {
                handleData("email", e.target.value);
              }}
              className="px-3 py-2 rounded-xl border focus:outline-none w-full"
            />

            <input
              placeholder={t("passwordPlaceholder")}
              type="password"
              name="user-password"
              id="user-password"
              value={data?.password || ""}
              onChange={(e) => {
                handleData("password", e.target.value);
              }}
              className="px-3 py-2 rounded-xl border focus:outline-none w-full"
            />

            <Button
              isLoading={isLoading}
              isDisabled={isLoading}
              type="submit"
              color="primary"
            >
              {t("login")}
            </Button>
          </form>

          <div className="flex justify-between gap-3">

            <Link href={`/${locale}/sign-up`}>
              <button className="font-semibold text-sm text-blue-700">
                {t("createAccount")}
              </button>
            </Link>

            <Link href={`/${locale}/forget-password`}>
              <button className="font-semibold text-sm text-blue-700">
                {t("forgotPassword")}
              </button>
            </Link>

          </div>

          <hr />

          <SignInWithGoogleComponent />

        </div>
      </section>
    </main>
  );
}

function SignInWithGoogleComponent() {
  const t = useTranslations("Login");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);

    try {
      const credential = await signInWithPopup(
        auth,
        new GoogleAuthProvider()
      );

      const user = credential.user;

      await createUser({
        uid: user?.uid,
        displayName: user?.displayName,
        photoURL: user?.photoURL,
      });
    } catch (error) {
      toast.error(error?.message || t("error"));
    }

    setIsLoading(false);
  };

  return (
    <Button
      isLoading={isLoading}
      isDisabled={isLoading}
      onClick={handleLogin}
      startContent={
        !isLoading && (
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path
              fill="#FFC107"
              d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12S17.4 12 24 12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C33.9 6.1 29.2 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"
            />
            <path
              fill="#FF3D00"
              d="M6.3 14.7l6.6 4.8C14.7 15.2 19 12 24 12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C33.9 6.1 29.2 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
            />
            <path
              fill="#4CAF50"
              d="M24 44c5.1 0 9.8-2 13.3-5.2l-6.1-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.2-7.9l-6.5 5C9.6 39.6 16.3 44 24 44z"
            />
            <path
              fill="#1976D2"
              d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.2-3.4 5.7-6.2 7.3l6.1 5.2C38.6 37.4 44 31.4 44 24c0-1.3-.1-2.3-.4-3.5z"
            />
          </svg>
        )
      }
    >
      {t("google")}
    </Button>
  );
}