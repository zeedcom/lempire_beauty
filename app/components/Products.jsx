"use client";

import Link from "next/link";
import FavoriteButton from "./FavoriteButton";
import AuthContextProvider from "@/contexts/AuthContext";
import AddToCartButton from "./AddToCartButton";
import { getProductReviewCounts } from "@/lib/firestore/products/count/read";
import { Suspense } from "react";
import MyRating from "./MyRating";
import { useTranslations } from "next-intl";

export default function ProductsGridView({ products }) {
  const t = useTranslations("Products");

  return (
    <section className="w-full flex justify-center">
      <div className="flex flex-col gap-5 max-w-[900px] p-5">

        <h1 className="text-center font-semibold text-lg">
          {t("title")}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          {products?.map((item) => {
            return (
              <ProductCard
                product={item}
                key={item?.id}
              />
            );
          })}
        </div>

      </div>
    </section>
  );
}

export function ProductCard({ product }) {
  const t = useTranslations("Products");

  return (
    <div className="flex flex-col gap-3 border p-4 rounded-lg">

      {/* Product Image */}

      <div className="relative w-full">
        <img
          src={product?.featureImageURL}
          className="rounded-lg h-48 w-full object-cover"
          alt={product?.title}
        />

        <div className="absolute top-1 right-1">
          <AuthContextProvider>
            <FavoriteButton
              productId={product?.id}
            />
          </AuthContextProvider>
        </div>
      </div>

      {/* Product Title */}

      <Link href={`/products/${product?.id}`}>
        <h1 className="font-semibold line-clamp-2 text-sm">
          {product?.title}
        </h1>
      </Link>

      {/* Price */}

      <div>
        <h2 className="text-green-500 text-sm font-semibold">
          DZD {product?.salePrice}{" "}

          <span className="line-through text-xs text-gray-600">
            DZD {product?.price}
          </span>
        </h2>
      </div>

      {/* Description */}

      <p className="text-xs text-gray-500 line-clamp-2">
        {product?.shortDescription}
      </p>

      {/* Rating */}

      <Suspense>
        <RatingReview product={product} />
      </Suspense>

      {/* Out Of Stock */}

      {product?.stock <= (product?.orders ?? 0) && (
        <div className="flex">
          <h3 className="text-red-500 rounded-lg text-xs font-semibold">
            {t("outOfStock")}
          </h3>
        </div>
      )}

      {/* Actions */}

      <div className="flex items-center gap-4 w-full">

        <div className="w-full">
          <Link
            href={`/checkout?type=buynow&productId=${product?.id}`}
          >
            <button className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg text-xs w-full">
              {t("buyNow")}
            </button>
          </Link>
        </div>

        <AuthContextProvider>
          <AddToCartButton
            productId={product?.id}
          />
        </AuthContextProvider>

      </div>

    </div>
  );
}

async function RatingReview({ product }) {
  const counts = await getProductReviewCounts({
    productId: product?.id,
  });

  return (
    <div className="flex gap-3 items-center">

      <MyRating
        value={counts?.averageRating ?? 0}
      />

      <h1 className="text-xs text-gray-400">
        <span>
          {counts?.averageRating?.toFixed(1)}
        </span>{" "}
        ({counts?.totalReviews})
      </h1>

    </div>
  );
}