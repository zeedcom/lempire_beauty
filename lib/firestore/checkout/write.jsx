import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  Timestamp,
} from "firebase/firestore";

/**
 * Calculate products total
 */
const calculateProductsTotal = (products) => {
  return products?.reduce((total, item) => {
    const price = Number(item?.product?.salePrice) || 0;
    const quantity = Number(item?.quantity) || 1;

    return total + price * quantity;
  }, 0);
};

/**
 * Create Stripe Checkout Session
 */
export const createCheckoutAndGetURL = async ({
  uid,
  products,
  address,
  shippingPrice = 0,
  totalPrice,
}) => {
  if (!uid) {
    throw new Error("User is not authenticated");
  }

  if (!products || products.length === 0) {
    throw new Error("Product List Is Empty");
  }

  const checkoutId = doc(collection(db, "ids")).id;

  const ref = doc(
    db,
    `users/${uid}/checkout_sessions/${checkoutId}`
  );

  const productTotal = calculateProductsTotal(products);

  const shipping = Number(shippingPrice) || 0;

  const finalTotal =
    Number(totalPrice) || productTotal + shipping;

  /*
   * Products line items
   */
  const line_items = [];

  products.forEach((item) => {
    const product = item?.product;

    const salePrice = Number(product?.salePrice) || 0;

    line_items.push({
      price_data: {
        currency: "inr",

        product_data: {
          name: product?.title ?? "",

          description:
            product?.shortDescription ?? "",

          images: [
            product?.featureImageURL ??
              `${process.env.NEXT_PUBLIC_DOMAIN}/logo.png`,
          ],

          metadata: {
            productId:
              item?.id ??
              product?.id ??
              "",
          },
        },

        unit_amount: Math.round(salePrice * 100),
      },

      quantity: Number(item?.quantity) || 1,
    });
  });

  /*
   * Add shipping as a line item
   */
  if (shipping > 0) {
    line_items.push({
      price_data: {
        currency: "inr",

        product_data: {
          name: "Shipping",

          description: "Shipping Fee",

          metadata: {
            type: "shipping",
          },
        },

        unit_amount: Math.round(shipping * 100),
      },

      quantity: 1,
    });
  }

  /*
   * Save checkout session
   */
  await setDoc(ref, {
    id: checkoutId,

    payment_method_types: ["card"],

    mode: "payment",

    line_items,

    productTotal,

    shippingPrice: shipping,

    totalPrice: finalTotal,

    metadata: {
      checkoutId,
      uid,

      address: JSON.stringify(address),

      productTotal: String(productTotal),

      shippingPrice: String(shipping),

      totalPrice: String(finalTotal),
    },

    success_url:
      `${process.env.NEXT_PUBLIC_DOMAIN}/checkout-success?checkout_id=${checkoutId}`,

    cancel_url:
      `${process.env.NEXT_PUBLIC_DOMAIN}/checkout-failed?checkout_id=${checkoutId}`,

    createdAt: Timestamp.now(),
  });

  /*
   * Wait for Firebase Stripe extension
   */
  await new Promise((resolve) =>
    setTimeout(resolve, 2000)
  );

  let checkoutSession = await getDoc(ref);

  if (!checkoutSession.exists()) {
    throw new Error("Checkout Session Not Found");
  }

  /*
   * Check error
   */
  if (checkoutSession.data()?.error?.message) {
    throw new Error(
      checkoutSession.data().error.message
    );
  }

  /*
   * Return URL
   */
  if (checkoutSession.data()?.url) {
    return checkoutSession.data().url;
  }

  /*
   * Second attempt
   */
  await new Promise((resolve) =>
    setTimeout(resolve, 3000)
  );

  checkoutSession = await getDoc(ref);

  if (checkoutSession.data()?.error?.message) {
    throw new Error(
      checkoutSession.data().error.message
    );
  }

  if (checkoutSession.data()?.url) {
    return checkoutSession.data().url;
  }

  /*
   * Third attempt
   */
  await new Promise((resolve) =>
    setTimeout(resolve, 5000)
  );

  checkoutSession = await getDoc(ref);

  if (checkoutSession.data()?.error?.message) {
    throw new Error(
      checkoutSession.data().error.message
    );
  }

  if (checkoutSession.data()?.url) {
    return checkoutSession.data().url;
  }

  throw new Error(
    "Something went wrong! Please Try Again"
  );
};


/**
 * Create Cash On Delivery Checkout
 */
export const createCheckoutCODAndGetId = async ({
  uid,
  products,
  address,
  shippingPrice = 0,
  totalPrice,
}) => {
  if (!uid) {
    throw new Error("User is not authenticated");
  }

  if (!products || products.length === 0) {
    throw new Error("Product List Is Empty");
  }

  /*
   * Generate COD checkout ID
   */
  const checkoutId =
    `cod_${doc(collection(db, "ids")).id}`;

  const ref = doc(
    db,
    `users/${uid}/checkout_sessions_cod/${checkoutId}`
  );

  /*
   * Calculate product total
   */
  const productTotal = calculateProductsTotal(products);

  /*
   * Shipping price
   */
  const shipping = Number(shippingPrice) || 0;

  /*
   * Final total
   */
  const finalTotal =
    Number(totalPrice) ||
    productTotal + shipping;

  /*
   * Products
   */
  const line_items = [];

  products.forEach((item) => {
    line_items.push({
      productId:
        item?.id ??
        item?.product?.id ??
        "",

      name:
        item?.product?.title ?? "",

      description:
        item?.product?.shortDescription ?? "",

      image:
        item?.product?.featureImageURL ??
        `${process.env.NEXT_PUBLIC_DOMAIN}/logo.png`,

      price:
        Number(item?.product?.salePrice) || 0,

      quantity:
        Number(item?.quantity) || 1,

      subtotal:
        (Number(item?.product?.salePrice) || 0) *
        (Number(item?.quantity) || 1),
    });
  });

  /*
   * Save COD checkout
   */
  await setDoc(ref, {
    id: checkoutId,

    line_items,

    productTotal,

    shippingPrice: shipping,

    totalPrice: finalTotal,

    address,

    metadata: {
      checkoutId,

      uid,

      address: JSON.stringify(address),

      productTotal: String(productTotal),

      shippingPrice: String(shipping),

      totalPrice: String(finalTotal),
    },

    paymentMethod: "cash_on_delivery",

    status: "pending",

    createdAt: Timestamp.now(),
  });

  return checkoutId;
};