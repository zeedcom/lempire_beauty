"use client";

import { useProduct } from "@/lib/firestore/products/read";
import { Button, CircularProgress } from "@nextui-org/react";
import { Minus, Plus, X } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

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

export default function Page() {
  const t = useTranslations("Cart");

  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadCart = () => {
    setCart(readCart());
    setIsLoading(false);
  };

  useEffect(() => {
    loadCart();

    // Keep in sync with changes from other tabs, and from
    // AddToCartButton's custom event in this same tab
    const handleStorage = (e) => {
      if (!e || e.key === CART_KEY) {
        loadCart();
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("cart-updated", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("cart-updated", handleStorage);
    };
  }, []);

  const updateCart = (newList) => {
    const success = writeCart(newList);

    if (!success) {
      throw new Error(t("updateError"));
    }

    setCart(newList);
    window.dispatchEvent(new Event("cart-updated"));
  };

  if (isLoading) {
    return (
      <div className="p-10 flex w-full justify-center">
        <CircularProgress />
      </div>
    );
  }

  return (
    <main className="flex flex-col gap-3 justify-center items-center p-5">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>

      {(!cart || cart.length === 0) && (
        <div className="flex flex-col gap-5 justify-center items-center h-full w-full py-20">
          <div className="flex justify-center">
            <img
              className="h-[200px]"
              src="/svgs/Empty-pana.svg"
              alt={t("emptyImageAlt")}
            />
          </div>

          <h1 className="text-gray-600 font-semibold">{t("empty")}</h1>
        </div>
      )}

      <div className="p-5 w-full md:max-w-[900px] gap-4 grid grid-cols-1 md:grid-cols-2">
        {cart?.map((item) => (
          <ProductItem
            key={item?.id}
            item={item}
            cart={cart}
            onUpdate={updateCart}
          />
        ))}
      </div>

      {cart?.length > 0 && (
        <div>
          <Link href="/checkout?type=cart">
            <button className="bg-blue-500 px-5 py-2 text-sm rounded-lg text-white">
              {t("checkout")}
            </button>
          </Link>
        </div>
      )}
    </main>
  );
}

function ProductItem({ item, cart, onUpdate }) {
  const t = useTranslations("Cart");

  const [isRemoving, setIsRemoving] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: product } = useProduct({
    productId: item?.id,
  });

  const handleRemove = async () => {
    if (!confirm(t("confirmRemove"))) {
      return;
    }

    setIsRemoving(true);

    try {
      const newList = cart.filter((d) => d?.id !== item?.id);
      onUpdate(newList);
    } catch (error) {
      toast.error(error?.message || t("removeError"));
    }

    setIsRemoving(false);
  };

  const handleUpdate = async (quantity) => {
    const parsed = parseInt(quantity);

    if (!Number.isFinite(parsed) || parsed < 1) {
      return;
    }

    setIsUpdating(true);

    try {
      const newList = cart.map((d) => {
        if (d?.id === item?.id) {
          return { ...d, quantity: parsed };
        }
        return d;
      });

      onUpdate(newList);
    } catch (error) {
      toast.error(error?.message || t("updateError"));
    }

    setIsUpdating(false);
  };

  return (
    <div className="flex gap-3 items-center border px-3 py-3 rounded-xl">
      <div className="h-14 w-14 p-1">
        <img
          className="w-full h-full object-cover rounded-lg"
          src={product?.featureImageURL}
          alt={product?.title || t("productImage")}
        />
      </div>

      <div className="flex flex-col gap-1 w-full">
        <h1 className="text-sm font-semibold">{product?.title}</h1>

        <h1 className="text-green-500 text-sm">
          DZD {product?.salePrice}{" "}
          <span className="line-through text-xs text-gray-500">
            DZD {product?.price}
          </span>
        </h1>

        <div className="flex text-xs items-center gap-2">
          <Button
            onClick={() => handleUpdate(item?.quantity - 1)}
            isDisabled={isUpdating || item?.quantity <= 1}
            isIconOnly
            size="sm"
            className="h-6 w-4"
            aria-label={t("decreaseQuantity")}
          >
            <Minus size={12} />
          </Button>

          <h2>{item?.quantity}</h2>

          <Button
            onClick={() => handleUpdate(item?.quantity + 1)}
            isDisabled={isUpdating}
            isIconOnly
            size="sm"
            className="h-6 w-4"
            aria-label={t("increaseQuantity")}
          >
            <Plus size={12} />
          </Button>
        </div>
      </div>

      <div className="flex gap-3 items-center">
        <Button
          onClick={handleRemove}
          isLoading={isRemoving}
          isDisabled={isRemoving}
          isIconOnly
          color="danger"
          size="sm"
          aria-label={t("remove")}
        >
          <X size={13} />
        </Button>
      </div>
    </div>
  );
}