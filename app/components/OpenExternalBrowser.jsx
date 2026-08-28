"use client";

import { useEffect, useState } from "react";

export default function OpenExternalBrowser() {
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);

  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || "";

    const isInstagram = userAgent.includes("Instagram");
    const isFacebook =
      userAgent.includes("FBAN") ||
      userAgent.includes("FBAV");

    setIsInAppBrowser(isInstagram || isFacebook);
  }, []);

  if (!isInAppBrowser) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-5">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-xl">
        <h2 className="text-xl font-bold">
          Open in your browser
        </h2>

        <p className="mt-3 text-sm text-gray-600">
          Google Sign-In may not work inside Instagram or Facebook.
          Please open this website in your browser to continue.
        </p>

        <div className="mt-5 rounded-lg bg-gray-100 p-4 text-left text-sm">
          <b>Instagram / Facebook:</b>
          <br />
          Tap <b>⋮</b> and choose <b>Open in Browser</b>.
        </div>
      </div>
    </div>
  );
}