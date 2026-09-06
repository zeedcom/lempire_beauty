import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";
import { adminDB } from "@/lib/firebase_admin";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

/**
 * Get checkout session
 * NOTE: checkout_sessions is a TOP-LEVEL collection (guest checkout),
 * not a subcollection — query it directly instead of via collectionGroup.
 */
const fetchCheckout = async (checkoutId) => {
  const ref = adminDB.doc(`checkout_sessions/${checkoutId}`);
  const snap = await ref.get();

  if (!snap.exists) {
    throw new Error("Invalid Checkout ID");
  }

  return snap.data();
};

export default async function Page({ params, searchParams }) {
  const { locale } = await params;

  const t = await getTranslations({
    locale,
    namespace: "PaymentFailed",
  });

  const { checkout_id } = await searchParams;

  let checkout = null;

  if (checkout_id) {
    try {
      checkout = await fetchCheckout(checkout_id);
    } catch (error) {
      console.error("Payment failed page error:", error);
      // checkout stays null — retry button will be hidden below
    }
  }

  return (
    <main>
      <Header />

      <section className="min-h-screen flex flex-col gap-3 justify-center items-center px-5 text-center">
        <div className="flex justify-center w-full">
          <img
            src="/svgs/Mobile payments-rafiki.svg"
            className="h-48"
            alt={t("imageAlt")}
          />
        </div>

        <h1 className="text-2xl font-semibold">{t("title")}</h1>

        <div className="flex items-center gap-4 text-sm">
          <Link href={`/${locale}`}>
            <button className="text-blue-600 border border-blue-600 px-5 py-2 rounded-lg bg-white">
              {t("shop")}
            </button>
          </Link>

          {checkout?.url && (
            <Link href={checkout.url}>
              <button className="bg-blue-600 border px-5 py-2 rounded-lg text-white">
                {t("retry")}
              </button>
            </Link>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}