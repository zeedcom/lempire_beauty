"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import Slider from "react-slick";

export default function Categories({ categories }) {
  const t = useTranslations("Categories");

  const settings = {
    dots: true,
    infinite: categories.length > 5,
    speed: 500,
    slidesToShow: Math.min(5, categories.length),
    slidesToScroll: Math.min(5, categories.length),

    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: Math.min(4, categories.length),
          slidesToScroll: Math.min(4, categories.length),
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: Math.min(3, categories.length),
          slidesToScroll: Math.min(3, categories.length),
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: Math.min(2, categories.length),
          slidesToScroll: Math.min(2, categories.length),
        },
      },
    ],
  };

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-8 justify-center overflow-hidden md:p-10 p-5">

      {/* Title */}
      <div className="flex justify-center w-full">
        <h1 className="text-lg font-semibold">
          {t("title")}
        </h1>
      </div>

      {/* Categories */}
      <Slider {...settings}>
        {categories?.map((category) => (
          <Link
            href={`/categories/${category.id}`}
            key={category.id}
          >
            <div className="px-2">
              <div className="flex flex-col gap-2 items-center justify-center">

                <div className="md:h-32 md:w-32 h-24 w-24 rounded-full md:p-5 p-2 border overflow-hidden">
                  <img
                    src={category.imageURL}
                    alt={category.name}
                    className="w-full h-full object-contain"
                  />
                </div>

                <h1 className="font-semibold">
                  {category.name}
                </h1>

              </div>
            </div>
          </Link>
        ))}
      </Slider>

    </div>
  );
}