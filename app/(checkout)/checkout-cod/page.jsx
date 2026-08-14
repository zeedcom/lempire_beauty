export const dynamic = "force-dynamic";

import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";
import { admin, adminDB } from "@/lib/firebase_admin";
import Link from "next/link";


/**
 * Get COD checkout
 */
const fetchCheckout = async (checkoutId) => {
  const list = await adminDB
    .collectionGroup("checkout_sessions_cod")
    .where("id", "==", checkoutId)
    .get();

  if (list.docs.length === 0) {
    throw new Error("Invalid Checkout ID");
  }

  return list.docs[0].data();
};


/**
 * Process COD order
 */
const processOrder = async ({ checkout }) => {
  const orderRef = adminDB.doc(
    `orders/${checkout?.id}`
  );

  const order = await orderRef.get();

  if (order.exists) {
    return false;
  }

  const uid = checkout?.metadata?.uid;

  if (!uid) {
    throw new Error("User ID not found");
  }

  /*
   * Get totals from checkout
   */
  const productTotal =
    Number(checkout?.productTotal) || 0;

  const shippingPrice =
    Number(checkout?.shippingPrice) || 0;

  const totalPrice =
    Number(checkout?.totalPrice) ||
    productTotal + shippingPrice;


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

    id: checkout?.id,

    paymentMode: "cod",

    timestampCreate:
      admin.firestore.Timestamp.now(),
  });


  /*
   * Get ordered products
   */
  const productList =
    checkout?.line_items?.map((item) => ({
      productId: item?.productId,
      quantity:
        Number(item?.quantity) || 1,
    })) ?? [];


  /*
   * Get user
   */
  const userRef = adminDB.doc(
    `users/${uid}`
  );

  const user = await userRef.get();


  /*
   * Remove products from cart
   */
  const productIdsList =
    productList
      .map((item) => item.productId)
      .filter(Boolean);


  const newCartList =
    (user?.data()?.carts ?? []).filter(
      (cartItem) =>
        !productIdsList.includes(
          cartItem?.id
        )
    );


  await userRef.set(
    {
      carts: newCartList,
    },
    {
      merge: true,
    }
  );


  /*
   * Update product orders
   */
  const validProducts =
    productList.filter(
      (item) => item?.productId
    );


  if (validProducts.length > 0) {

    const batch = adminDB.batch();

    validProducts.forEach((item) => {

      const productRef = adminDB.doc(
        `products/${item.productId}`
      );

      batch.update(productRef, {
        orders:
          admin.firestore.FieldValue.increment(
            item.quantity
          ),
      });

    });

    await batch.commit();
  }

  return true;
};


export default async function Page({
  searchParams,
}) {

  const checkout_id =
    searchParams?.checkout_id;


  /*
   * Check checkout ID
   */
  if (!checkout_id) {

    return (
      <>

        <Header />

        <main className="min-h-[60vh] flex items-center justify-center">

          <h1 className="text-xl font-semibold">
            Invalid checkout request.
          </h1>

        </main>

        <Footer />

      </>
    );
  }


  /*
   * Fetch checkout
   */
  const checkout =
    await fetchCheckout(
      checkout_id
    );


  /*
   * Process order
   */
  await processOrder({
    checkout,
  });


  return (
    <>

      <Header />

      <main className="min-h-[60vh] flex flex-col items-center justify-center gap-5">

        <h1 className="text-3xl font-bold">

          Your Order Is{" "}

          <span className="text-green-600">
            Successfully Placed
          </span>

        </h1>


        <p className="text-gray-500">
          Thank you for your order.
        </p>


        <Link
          href="/account"
          className="bg-black text-white px-6 py-3 rounded-lg"
        >
          Go To Orders Page
        </Link>

      </main>

      <Footer />

    </>
  );
}