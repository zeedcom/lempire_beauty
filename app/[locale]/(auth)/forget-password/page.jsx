"use client";

import { useAuth } from "@/contexts/AuthContext";
import { auth } from "@/lib/firebase";
import { Button } from "@nextui-org/react";
import {
  sendPasswordResetEmail,
} from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

export default function Page() {
  const t = useTranslations("ForgotPassword");

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

  const handleSendEmail = async () => {
    setIsLoading(true);

    try {
      await sendPasswordResetEmail(auth, data?.email);

      toast.success(t("success"));
    } catch (error) {
      toast.error(error?.message || t("error"));
    }

    setIsLoading(false);
  };

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
              handleSendEmail();
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

            <Button
              isLoading={isLoading}
              isDisabled={isLoading}
              type="submit"
              color="primary"
            >
              {t("sendButton")}
            </Button>
          </form>

          <div className="flex justify-between">
            <Link href="/login">
              <button className="font-semibold text-sm text-blue-700">
                {t("signIn")}
              </button>
            </Link>
          </div>

        </div>
      </section>
    </main>
  );
}