"use client";

import { useAuth } from "@/contexts/AuthContext";
import { auth } from "@/lib/firebase";
import { createUser } from "@/lib/firestore/user/write";
import { Button } from "@nextui-org/react";
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function Page() {
  const t = useTranslations("SignUp");
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

  const handleSignUp = async () => {
    setIsLoading(true);

    try {
      const credential =
        await createUserWithEmailAndPassword(
          auth,
          data?.email,
          data?.password
        );

      await updateProfile(credential.user, {
        displayName: data?.name,
      });

      const user = credential.user;

      await createUser({
        uid: user?.uid,
        displayName: data?.name,
        photoURL: user?.photoURL,
      });

      toast.success(t("success"));

      router.push(`/${locale}/account`);
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
              handleSignUp();
            }}
            className="flex flex-col gap-3"
          >

            <input
              placeholder={t("namePlaceholder")}
              type="text"
              name="user-name"
              id="user-name"
              value={data?.name || ""}
              onChange={(e) => {
                handleData("name", e.target.value);
              }}
              className="px-3 py-2 rounded-xl border focus:outline-none w-full"
            />

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
              {t("signUp")}
            </Button>

          </form>

          <div className="flex justify-between">

            <Link href={`/${locale}/login`}>
              <button className="font-semibold text-sm text-blue-700">
                {t("alreadyUser")}
              </button>
            </Link>

          </div>

        </div>
      </section>
    </main>
  );
}