"use client";

import { CircularProgress } from "@nextui-org/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Layout({ children }) {
  const searchParams = useSearchParams();

  const type = searchParams.get("type");
  const productId = searchParams.get("productId");

  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (type === "cart") {
      try {
        const savedCart = localStorage.getItem("cart");

        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          setCartItems(
            Array.isArray(parsedCart) ? parsedCart : []
          );
        }
      } catch (error) {
        console.error("Error loading cart:", error);
        setCartItems([]);
      }
    }

    setIsLoading(false);
  }, [type]);

  if (isLoading) {
    return (
      <div className="w-full min-h-[50vh] flex justify-center items-center">
        <CircularProgress />
      </div>
    );
  }

  /*
   * Cart checkout
   */
  if (type === "cart" && cartItems.length === 0) {
    return (
      <div className="w-full min-h-[50vh] flex justify-center items-center">
        <h2 className="text-xl font-semibold">
          Your Cart Is Empty
        </h2>
      </div>
    );
  }

  /*
   * Buy now checkout
   */
  if (type === "buynow" && !productId) {
    return (
      <div className="w-full min-h-[50vh] flex justify-center items-center">
        <h2 className="text-xl font-semibold">
          Product Not Found!
        </h2>
      </div>
    );
  }

  /*
   * Invalid checkout type
   */
  if (type !== "cart" && type !== "buynow") {
    return (
      <div className="w-full min-h-[50vh] flex justify-center items-center">
        <h2 className="text-xl font-semibold">
          Invalid Checkout Request
        </h2>
      </div>
    );
  }

  return <>{children}</>;
}