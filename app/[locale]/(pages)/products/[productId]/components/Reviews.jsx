"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useReviews } from "@/lib/firestore/reviews/read";
import { deleteReview } from "@/lib/firestore/reviews/write";
import { useUser } from "@/lib/firestore/user/read";
import { Rating } from "@mui/material";
import { Avatar, Button } from "@nextui-org/react";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

export default function Reviews({ productId }) {
  const t = useTranslations("Product.Reviews");

  const { data } = useReviews({ productId: productId });
  const [isLoading, setIsLoading] = useState(false);

  const { user } = useAuth();
  const { data: userData } = useUser({ uid: user?.uid });

  const handleDelete = async () => {
    if (!confirm(t("confirmDelete"))) return;

    setIsLoading(true);

    try {
      if (!user) {
        throw new Error(t("loginRequired"));
      }

      await deleteReview({
        uid: user?.uid,
        productId: productId,
      });

      toast.success(t("success"));
    } catch (error) {
      toast.error(error?.message || t("error"));
    }

    setIsLoading(false);
  };

  return (
    <div className="flex flex-col gap-3 p-3 rounded-xl border w-full">
      <h1 className="text-lg font-semibold">
        {t("title")}
      </h1>

      <div className="flex flex-col gap-4">
        {data?.map((item) => {
          return (
            <div
              key={item?.uid}
              className="flex gap-3"
            >
              <div>
                <Avatar src={item?.photoURL} />
              </div>

              <div className="flex-1 flex flex-col">
                <div className="flex justify-between">
                  <div>
                    <h1 className="font-semibold">
                      {item?.displayName}
                    </h1>

                    <Rating
                      value={item?.rating}
                      readOnly
                      size="small"
                    />
                  </div>

                  {user?.uid === item?.uid && (
                    <Button
                      isIconOnly
                      size="sm"
                      color="danger"
                      variant="flat"
                      isDisabled={isLoading}
                      isLoading={isLoading}
                      onClick={handleDelete}
                      aria-label={t("delete")}
                    >
                      <Trash2 size={12} />
                    </Button>
                  )}
                </div>

                <p className="text-sm text-gray-700 pt-1">
                  {item?.message}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}