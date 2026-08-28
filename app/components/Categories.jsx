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
      
    ],
  };

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
   <div className="flex flex-col gap-8 justify-center overflow-hidden py-5 px-8 md:py-10 md:px-16">

     <div className="mb-6 text-center">
      <h2 className="text-2xl font-bold">
        {t("title")}
      </h2>
    </div>

      {/* Categories */}
     <Slider {...settings}>
  {categories?.map((category) => (
    <div key={category.id}>
      <Link href={`/categories/${category.id}`}>
        <div className="py-2">
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-full sm:h-32 sm:w-32 md:h-48 md:w-48">
              <img
                src={category.imageURL}
                alt={category.name}
                className="h-full w-full object-contain"
              />
            </div>

            <h1 className="font-semibold">
              {category.name}
            </h1>
          </div>
        </div>
      </Link>
    </div>
  ))}
</Slider>
    </div>
  );
}