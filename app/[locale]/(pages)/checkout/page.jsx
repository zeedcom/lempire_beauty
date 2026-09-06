"use client";

import { useEffect, useState } from "react";
import { useProductsByIds } from "@/lib/firestore/products/read";
import { CircularProgress } from "@nextui-org/react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import Checkout from "./components/Checkout";

export default function Page() {
  const t = useTranslations("CheckoutPage");

  const searchParams = useSearchParams();

  const type = searchParams.get("type");
  const productId = searchParams.get("productId");

  const [cartItems, setCartItems] = useState([]);
  const [cartLoaded, setCartLoaded] = useState(false);

  /*
   * Get cart from localStorage
   */
  useEffect(() => {
    if (type !== "buynow") {
      try {
        const savedCart = localStorage.getItem("cart");

        if (savedCart) {
          setCartItems(JSON.parse(savedCart));
        }
      } catch (error) {
        console.error("Error loading cart:", error);
        setCartItems([]);
      }
    }

    setCartLoaded(true);
  }, [type]);

  /*
   * Build product IDs list
   */
  const productIdsList =
    type === "buynow"
      ? productId
        ? [productId]
        : []
      : cartItems.map((item) => item.id);

  const {
    data: products,
    error,
    isLoading,
  } = useProductsByIds({
    idsList: productIdsList,
  });

  /*
   * Wait for localStorage cart
   */
  if (!cartLoaded) {
    return (
      <div className="w-full min-h-[50vh] flex justify-center items-center">
        <CircularProgress />
      </div>
    );
  }

  /*
   * No products
   */
  if (!productIdsList || productIdsList.length === 0) {
    return (
      <div className="w-full min-h-[50vh] flex justify-center items-center">
        <h1 className="text-xl font-semibold">
          {t("productsNotFound")}
        </h1>
      </div>
    );
  }

  /*
   * Loading products
   */
  if (isLoading) {
    return (
      <div className="w-full min-h-[50vh] flex justify-center items-center">
        <CircularProgress />
      </div>
    );
  }

  /*
   * Error
   */
  if (error) {
    return (
      <div className="w-full min-h-[50vh] flex justify-center items-center">
        <p className="text-red-500">
          {error?.message || t("error")}
        </p>
      </div>
    );
  }

  /*
   * Build checkout product list
   */
  const productList =
    type === "buynow"
      ? [
          {
            id: productId,
            quantity: 1,
            product: products?.[0],
          },
        ]
      : cartItems
          .map((item) => ({
            ...item,
            product: products?.find(
              (product) => product?.id === item?.id
            ),
          }))
          .filter((item) => item.product);
          console.log(productList)
  return (
    <main className="p-5 flex flex-col gap-4">
      <h1 className="text-xl font-semibold">
        {t("title")}
      </h1>

      <Checkout productList={productList} />
    </main>
  );
}