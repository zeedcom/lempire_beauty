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
  return products.reduce((total, item) => {
    const price =
      Number(item?.product?.salePrice) || 0;

    const quantity =
      Number(item?.quantity) || 1;

    return total + price * quantity;
  }, 0);
};

/**
 * Create Stripe Checkout Session
 * Guest checkout - no authentication required
 */
export const createCheckoutAndGetURL = async ({
  products,
  address,
  shippingPrice = 0,
  totalPrice,
}) => {
  /*
   * Validate products
   */
  if (!products || products.length === 0) {
    throw new Error("Product List Is Empty");
  }

  /*
   * Generate checkout ID
   */
  const checkoutId = doc(
    collection(db, "checkout_sessions")
  ).id;

  /*
   * Checkout document reference
   */
  const ref = doc(
    db,
    "checkout_sessions",
    checkoutId
  );

  /*
   * Calculate totals
   */
  const productTotal =
    calculateProductsTotal(products);

  const shipping =
    Number(shippingPrice) || 0;

  const finalTotal =
    Number(totalPrice) ||
    productTotal + shipping;

  /*
   * Stripe line items
   */
  const line_items = products.map((item) => {
    const product = item?.product;

    const salePrice =
      Number(product?.salePrice) || 0;

    return {
      price_data: {
        currency: "dzd",

        product_data: {
          name: product?.title ?? "",

          description:
            product?.shortDescription ?? "",

          images: [
            product?.featureImageURL ||
              `${process.env.NEXT_PUBLIC_DOMAIN}/logo.png`,
          ],

          metadata: {
            productId:
              item?.id ??
              product?.id ??
              "",
          },
        },

        unit_amount:
          Math.round(salePrice * 100),
      },

      quantity:
        Number(item?.quantity) || 1,
    };
  });

  /*
   * Add shipping as Stripe line item
   */
  if (shipping > 0) {
    line_items.push({
      price_data: {
        currency: "dzd",

        product_data: {
          name: "Shipping",

          description: "Shipping Fee",

          metadata: {
            type: "shipping",
          },
        },

        unit_amount:
          Math.round(shipping * 100),
      },

      quantity: 1,
    });
  }

  /*
   * Save checkout session
   */
  await setDoc(ref, {
    id: checkoutId,

    isGuest: true,

    payment_method_types: ["card"],

    mode: "payment",

    line_items,

    productTotal,

    shippingPrice: shipping,

    totalPrice: finalTotal,

    metadata: {
      checkoutId,

      isGuest: "true",

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
   * Wait for checkout URL
   */
  const delays = [2000, 3000, 5000];

  for (const delay of delays) {
    await new Promise((resolve) =>
      setTimeout(resolve, delay)
    );

    const checkoutSession =
      await getDoc(ref);

    if (!checkoutSession.exists()) {
      continue;
    }

    const sessionData =
      checkoutSession.data();

    /*
     * Stripe extension error
     */
    if (sessionData?.error?.message) {
      throw new Error(
        sessionData.error.message
      );
    }

    /*
     * Checkout URL generated
     */
    if (sessionData?.url) {
      return sessionData.url;
    }
  }

  throw new Error(
    "Something went wrong! Please Try Again"
  );
};


/**
 * Create Cash On Delivery Checkout
 * Guest checkout - no authentication required
 */
export const createCheckoutCODAndGetId = async ({
  products,
  address,
  shippingPrice = 0,
  totalPrice,
}) => {
  /*
   * Validate products
   */
  if (!products || products.length === 0) {
    throw new Error("Product List Is Empty");
  }

  /*
   * Generate COD checkout ID
   */
  const checkoutId =
    `cod_${doc(
      collection(db, "checkout_sessions_cod")
    ).id}`;

  /*
   * COD checkout document reference
   */
  const ref = doc(
    db,
    "checkout_sessions_cod",
    checkoutId
  );

  /*
   * Calculate totals
   */
  const productTotal =
    calculateProductsTotal(products);

  const shipping =
    Number(shippingPrice) || 0;

  const finalTotal =
    Number(totalPrice) ||
    productTotal + shipping;

  /*
   * Build order products
   */
  const line_items = products.map((item) => {
    const price =
      Number(item?.product?.salePrice) || 0;

    const quantity =
      Number(item?.quantity) || 1;

    return {
      productId:
        item?.id ??
        item?.product?.id ??
        "",

      name:
        item?.product?.title ?? "",

      description:
        item?.product?.shortDescription ?? "",

      image:
        item?.product?.featureImageURL ||
        `${process.env.NEXT_PUBLIC_DOMAIN}/logo.png`,

      price,

      quantity,

      subtotal:
        price * quantity,
    };
  });

  /*
   * Save COD checkout
   */
  await setDoc(ref, {
    id: checkoutId,

    isGuest: true,

    line_items,

    productTotal,

    shippingPrice: shipping,

    totalPrice: finalTotal,

    address: address ?? {},

    metadata: {
      checkoutId,

      isGuest: "true",

      address: JSON.stringify(
        address ?? {}
      ),

      productTotal:
        String(productTotal),

      shippingPrice:
        String(shipping),

      totalPrice:
        String(finalTotal),
    },

    paymentMethod: "cash_on_delivery",

    status: "pending",

    createdAt: Timestamp.now(),
  });

  return checkoutId;
};