import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";
import { admin, adminDB } from "@/lib/firebase_admin";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import SuccessMessage from "./components/SuccessMessage";

/**
 * NOTE: checkout_sessions is a TOP-LEVEL collection now (guest checkout).
 */
const fetchCheckout = async (checkoutId) => {
  const ref = adminDB.doc(`checkout_sessions/${checkoutId}`);
  const snap = await ref.get();

  if (!snap.exists) {
    throw new Error("Invalid Checkout ID");
  }

  return snap.data();
};

/**
 * WARNING: this queries payments as a subcollection (almost certainly
 * users/{uid}/payments via the Stripe extension), which is uid-scoped.
 * Guest checkouts have no uid, so there is no natural path for a guest's
 * payment doc to land here. This needs an architecture decision:
 *   - create an anonymous Firebase Auth user per guest session so the
 *     extension has somewhere to write, or
 *   - stop relying on the extension's per-customer path and instead
 *     verify payment status via your own Stripe webhook into a
 *     top-level collection.
 * Until that's resolved, guest prepaid checkout will likely fail here.
 */
const fetchPayment = async (checkoutId) => {
  const list = await adminDB
    .collectionGroup("payments")
    .where("metadata.checkoutId", "==", checkoutId)
    .where("status", "==", "succeeded")
    .get();

  if (list.docs.length === 0) {
    throw new Error("Invalid Checkout ID");
  }

  return list.docs[0].data();
};

const processOrder = async ({ payment, checkout }) => {
  const orderRef = adminDB.doc(`orders/${payment?.id}`);
  const order = await orderRef.get();

  if (order.exists) {
    return false;
  }

  // Guest checkout: uid may legitimately be null/undefined
  const uid = payment?.metadata?.uid || checkout?.metadata?.uid || null;

  await orderRef.set({
    checkout: checkout,
    payment: payment,
    uid: uid,
    isGuest: !uid,
    id: payment?.id,
    paymentMode: "prepaid",
    status: "pending",
    timestampCreate: admin.firestore.Timestamp.now(),
  });

  const productList =
    checkout?.line_items?.map((item) => ({
      productId: item?.price_data?.product_data?.metadata?.productId,
      quantity: item?.quantity,
    })) ?? [];

  // Cart cleanup only applies to authenticated users
  if (uid) {
    const userRef = adminDB.doc(`users/${uid}`);
    const user = await userRef.get();

    const productIdsList = productList.map((item) => item?.productId);

    const newCartList = (user?.data()?.carts ?? []).filter(
      (cartItem) => !productIdsList.includes(cartItem?.id)
    );

    await userRef.set({ carts: newCartList }, { merge: true });
  }

  const validProducts = productList.filter((item) => item?.productId);

  if (validProducts.length > 0) {
    const batch = adminDB.batch();

    validProducts.forEach((item) => {
      batch.update(adminDB.doc(`products/${item.productId}`), {
        orders: admin.firestore.FieldValue.increment(item.quantity),
      });
    });

    await batch.commit();
  }

  return true;
};

export default async function Page({ params, searchParams }) {
  const { locale } = await params;

  const t = await getTranslations({
    locale,
    namespace: "OrderSuccess",
  });

  const { checkout_id } = await searchParams;

  if (!checkout_id) {
    return (
      <main>
        <Header />
        <section className="min-h-screen flex flex-col gap-3 justify-center items-center px-5 text-center">
          <h1 className="text-xl font-semibold">{t("invalidCheckout")}</h1>
        </section>
        <Footer />
      </main>
    );
  }

  try {
    const checkout = await fetchCheckout(checkout_id);
    const payment = await fetchPayment(checkout_id);
    await processOrder({ checkout, payment });
  } catch (error) {
    console.error("Prepaid checkout error:", error);

    return (
      <main>
        <Header />
        <section className="min-h-screen flex flex-col gap-3 justify-center items-center px-5 text-center">
          <h1 className="text-xl font-semibold">{t("invalidCheckout")}</h1>
        </section>
        <Footer />
      </main>
    );
  }

  return (
    <main>
      <Header />

      <SuccessMessage />

      <section className="min-h-screen flex flex-col gap-3 justify-center items-center px-5 text-center">
        <div className="flex justify-center w-full">
          <img
            src="/svgs/Mobile payments-rafiki.svg"
            className="h-48"
            alt={t("imageAlt")}
          />
        </div>

        <h1 className="text-2xl font-semibold text-green">
          {t("orderPlaced")}{" "}
          <span className="font-bold text-green-600">
            {t("successfully")}
          </span>{" "}
          {t("placed")}
        </h1>

        <div className="flex items-center gap-4 text-sm">
          <Link href={`/${locale}`}>
            <button className="text-blue-600 border border-blue-600 px-5 py-2 rounded-lg bg-white">
              {t("goToOrders")}
            </button>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}