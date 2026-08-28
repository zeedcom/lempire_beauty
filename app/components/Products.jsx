"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import FavoriteButton from "./FavoriteButton";
import AuthContextProvider from "@/contexts/AuthContext";
import AddToCartButton from "./AddToCartButton";
import { getProductReviewCounts } from "@/lib/firestore/products/count/read";
import MyRating from "./MyRating";
import { useTranslations } from "next-intl";

export default function ProductsGridView({ products = [] }) {
  return (
    <section className="flex w-full justify-center">
      <div className="flex max-w-[900px] flex-col gap-5 p-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
          {products.map((item) => (
            <ProductCard
              product={item}
              key={item.id}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export function ProductCard({ product }) {
  const t = useTranslations("Products");

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-4">

      {/* Product Image */}
      <Link href={`/products/${product?.id}`}>
        <div className="relative w-full">
          <img
            src={product?.featureImageURL}
            className="h-48 w-full rounded-lg bg-cover bg-center bg-no-repeat object-cover"
            style={{
              backgroundImage: "url('/slider-bg.png')",
            }}
            alt={product?.title || "Product"}
          />

          <div className="absolute right-1 top-1">
            <AuthContextProvider>
              <FavoriteButton productId={product?.id} />
            </AuthContextProvider>
          </div>
        </div>
      </Link>

      {/* Product Title */}
      <Link href={`/products/${product?.id}`}>
        <h1 className="line-clamp-2 text-sm font-semibold">
          {product?.title}
        </h1>
      </Link>

      {/* Price */}
      <div>
        <h2 className="text-sm font-semibold text-green-500">
          DZD {product?.salePrice}

          <span className="ml-2 text-xs text-gray-600 line-through">
            DZD {product?.price}
          </span>
        </h2>
      </div>

      {/* Description */}
      <p className="line-clamp-2 text-xs text-gray-500">
        {product?.shortDescription}
      </p>

      {/* Rating */}
      <RatingReview productId={product?.id} />

      {/* Out Of Stock */}
      {product?.stock <= (product?.orders ?? 0) && (
        <div className="flex">
          <h3 className="rounded-lg text-xs font-semibold text-red-500">
            {t("outOfStock")}
          </h3>
        </div>
      )}

      {/* Actions */}
      <div className="flex w-full items-center gap-4">
        <div className="w-full">
          <Link
            href={`/checkout?type=buynow&productId=${product?.id}`}
          >
            <button className="w-full flex-1 rounded-lg bg-[var(--color-brand-dark)] px-4 py-2 text-xs text-white">
              {t("buyNow")}
            </button>
          </Link>
        </div>

        <AuthContextProvider>
          <AddToCartButton productId={product?.id} />
        </AuthContextProvider>
      </div>

    </div>
  );
}

function RatingReview({ productId }) {
  const [counts, setCounts] = useState({
    averageRating: 0,
    totalReviews: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Don't fetch if there is no product ID
    if (!productId) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function loadReviews() {
      try {
        setLoading(true);

        const data = await getProductReviewCounts({
          productId,
        });

        if (isMounted) {
          setCounts({
            averageRating: Number(data?.averageRating ?? 0),
            totalReviews: Number(data?.totalReviews ?? 0),
          });
        }
      } catch (error) {
        console.error("Error loading product reviews:", error);

        if (isMounted) {
          setCounts({
            averageRating: 0,
            totalReviews: 0,
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadReviews();

    return () => {
      isMounted = false;
    };
  }, [productId]);

  if (loading) {
    return (
      <div className="flex items-center gap-3">
        <MyRating value={0} />

        <span className="text-xs text-gray-400">
          Loading...
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <MyRating value={counts.averageRating} />

      <h1 className="text-xs text-gray-400">
        <span>
          {counts.averageRating.toFixed(1)}
        </span>{" "}
        ({counts.totalReviews})
      </h1>
    </div>
  );
}