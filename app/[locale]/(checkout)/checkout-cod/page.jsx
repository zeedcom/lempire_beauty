export const dynamic = "force-dynamic";

import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";
import { admin, adminDB } from "@/lib/firebase_admin";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

/**
 * Get COD checkout
 * NOTE: checkout_sessions_cod is a TOP-LEVEL collection now (guest checkout),
 * not a subcollection — so query it directly instead of via collectionGroup.
 */
const fetchCheckout = async (checkoutId) => {
  const ref = adminDB.doc(`checkout_sessions_cod/${checkoutId}`);
  const snap = await ref.get();

  if (!snap.exists) {
    throw new Error("Invalid Checkout ID");
  }

  return snap.data();
};

/**
 * Process COD order
 * Supports both guest orders (uid = null) and authenticated orders.
 */
const processOrder = async ({ checkout }) => {
  const checkoutId = checkout?.id;

  if (!checkoutId) {
    throw new Error("Invalid Checkout");
  }

  const orderRef = adminDB.doc(`orders/${checkoutId}`);

  const order = await orderRef.get();

  if (order.exists) {
    return false;
  }

  // Guest checkout: uid may legitimately be null/undefined
  const uid = checkout?.metadata?.uid || checkout?.uid || null;

  /*
   * Get totals from checkout
   *
   * SECURITY NOTE: these values come from the checkout document as
   * written by the client. Until server-side price revalidation is
   * added (recomputing from products/ and communes/ at write time),
   * this trusts client-submitted totals.
   */
  const productTotal = Number(checkout?.productTotal) || 0;
  const shippingPrice = Number(checkout?.shippingPrice) || 0;
  const totalPrice =
    Number(checkout?.totalPrice) || productTotal + shippingPrice;

  /*
   * Save order
   */
  await orderRef.set({
    checkout: checkout,

    payment: {
      amount: totalPrice,
      productTotal: productTotal,
      shippingPrice: shippingPrice,
      totalPrice: totalPrice,
      currency: "DZD",
    },

    uid: uid,
    isGuest: !uid,

    id: checkoutId,

    paymentMode: "cod",
    status: "pending",

    timestampCreate: admin.firestore.Timestamp.now(),
  });

  /*
   * Get ordered products
   */
  const productList =
    checkout?.line_items?.map((item) => ({
      productId: item?.productId,
      quantity: Number(item?.quantity) || 1,
    })) ?? [];

  /*
   * Remove products from cart — only for authenticated users.
   * Guest carts live in localStorage on the client; this server page
   * can't touch them. The client should clear localStorage on success.
   */
  if (uid) {
    const userRef = adminDB.doc(`users/${uid}`);
    const user = await userRef.get();

    const productIdsList = productList
      .map((item) => item.productId)
      .filter(Boolean);

    const newCartList = (user?.data()?.carts ?? []).filter(
      (cartItem) => !productIdsList.includes(cartItem?.id)
    );

    await userRef.set(
      { carts: newCartList },
      { merge: true }
    );
  }

  /*
   * Update product orders count
   */
  const validProducts = productList.filter((item) => item?.productId);

  if (validProducts.length > 0) {
    const batch = adminDB.batch();

    validProducts.forEach((item) => {
      const productRef = adminDB.doc(`products/${item.productId}`);

      batch.update(productRef, {
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

  const checkout_id = searchParams?.checkout_id;

  if (!checkout_id) {
    return (
      <>
        <Header />
        <main className="min-h-[60vh] flex items-center justify-center">
          <h1 className="text-xl font-semibold">
            {t("invalidCheckout")}
          </h1>
        </main>
        <Footer />
      </>
    );
  }

  try {
    const checkout = await fetchCheckout(checkout_id);
    await processOrder({ checkout });
  } catch (error) {
    console.error("COD checkout error:", error);

    return (
      <>
        <Header />
        <main className="min-h-[60vh] flex items-center justify-center">
          <h1 className="text-xl font-semibold">
            {t("invalidCheckout")}
          </h1>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      <main className="min-h-[60vh] flex flex-col items-center justify-center gap-5 text-center px-5">
        <h1 className="text-3xl font-bold">
          {t("orderPlaced")}{" "}
          <span className="text-green-600">
            {t("successfully")}
          </span>
        </h1>

        <p className="text-gray-500">{t("thankYou")}</p>

        <Link
          href={`/${locale}`}
          className="bg-black text-white px-6 py-3 rounded-lg"
        >
          {t("goToOrders")}
        </Link>
      </main>

      <Footer />
    </>
  );
}