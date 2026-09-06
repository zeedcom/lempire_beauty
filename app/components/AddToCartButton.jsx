"use client";

import { Button } from "@nextui-org/react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { useTranslations } from "next-intl";

const CART_KEY = "cart";

/*
 * Read cart from localStorage safely
 */
const readCart = () => {
  try {
    const saved = localStorage.getItem(CART_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Error reading cart:", error);
    return [];
  }
};

/*
 * Write cart to localStorage safely
 */
const writeCart = (list) => {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(list));
    return true;
  } catch (error) {
    console.error("Error saving cart:", error);
    return false;
  }
};

export default function AddToCartButton({ productId, type }) {
  const t = useTranslations("Cart");

  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Load initial cart state from localStorage on mount
  useEffect(() => {
    setCart(readCart());
    setHydrated(true);
  }, []);

  // Keep in sync if cart changes in another tab, or via other components
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === CART_KEY) {
        setCart(readCart());
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const isAdded = cart?.find((item) => item?.id === productId);

  const handlClick = async () => {
    setIsLoading(true);

    try {
      let newList;

      if (isAdded) {
        newList = cart.filter((item) => item?.id !== productId);
      } else {
        newList = [...cart, { id: productId, quantity: 1 }];
      }

      const success = writeCart(newList);

      if (!success) {
        throw new Error(t("updateError"));
      }

      setCart(newList);

      // Let other components (e.g. cart icon badge) know the cart changed,
      // since same-tab updates don't fire the native "storage" event.
      window.dispatchEvent(new Event("cart-updated"));
    } catch (error) {
      toast.error(error?.message || t("updateError"));
    }

    setIsLoading(false);
  };

  // Avoid a mismatch between server-rendered "not added" state and the
  // real localStorage state on first client render
  const disabled = isLoading || !hydrated;

  if (type === "cute") {
    return (
      <Button
        isLoading={isLoading}
        isDisabled={disabled}
        onClick={handlClick}
        variant="bordered"
      >
        {!isAdded && t("addToCart")}
        {isAdded && t("removeFromCart")}
      </Button>
    );
  }

  if (type === "large") {
    return (
      <Button
        isLoading={isLoading}
        isDisabled={disabled}
        onClick={handlClick}
        variant="bordered"
        color="#e24c7a"
        size="sm"
      >
        {!isAdded && <AddShoppingCartIcon className="text-xs" />}
        {isAdded && <ShoppingCartIcon className="text-xs" />}

        {!isAdded && t("addToCart")}
        {isAdded && t("removeFromCart")}
      </Button>
    );
  }

  return (
    <Button
      isLoading={isLoading}
      isDisabled={disabled}
      onClick={handlClick}
      variant="flat"
      isIconOnly
      size="sm"
      aria-label={isAdded ? t("removeFromCart") : t("addToCart")}
    >
      {!isAdded && <AddShoppingCartIcon className="text-xs" />}
      {isAdded && <ShoppingCartIcon className="text-xs" />}
    </Button>
  );
}