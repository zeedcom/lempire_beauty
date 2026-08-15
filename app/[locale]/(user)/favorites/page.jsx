"use client";

import { ProductCard } from "@/app/components/Products";
import { useAuth } from "@/contexts/AuthContext";
import { useProduct } from "@/lib/firestore/products/read";
import { useUser } from "@/lib/firestore/user/read";
import { CircularProgress } from "@nextui-org/react";
import { useTranslations } from "next-intl";

export default function Page() {
  const t = useTranslations("Favorites");

  const { user } = useAuth();
  const { data, isLoading } = useUser({
    uid: user?.uid,
  });

  if (isLoading) {
    return (
      <div className="p-10 flex w-full justify-center">
        <CircularProgress />
      </div>
    );
  }

  return (
    <main className="flex flex-col gap-3 justify-center items-center p-5">

      <h1 className="text-2xl font-semibold">
        {t("title")}
      </h1>

      {(!data?.favorites ||
        data?.favorites?.length === 0) && (
        <div className="flex flex-col gap-5 justify-center items-center h-full w-full py-20">

          <div className="flex justify-center">
            <img
              className="h-[200px]"
              src="/svgs/Empty-pana.svg"
              alt={t("emptyImageAlt")}
            />
          </div>

          <h1 className="text-gray-600 font-semibold">
            {t("empty")}
          </h1>

        </div>
      )}

      <div className="p-5 w-full md:max-w-[900px] gap-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
        {data?.favorites?.map((productId) => {
          return (
            <ProductItem
              productId={productId}
              key={productId}
            />
          );
        })}
      </div>

    </main>
  );
}

function ProductItem({ productId }) {
  const { data: product } = useProduct({
    productId: productId,
  });

  return <ProductCard product={product} />;
}