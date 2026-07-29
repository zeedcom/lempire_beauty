"use client";

import Slider from "react-slick";

export default function Brands({ brands }) {
  if (brands.length === 0) return null;

  const settings = {
    dots: true,
    infinite: brands.length > 5,
    speed: 500,
    slidesToShow: Math.min(5, brands.length),
    slidesToScroll: Math.min(5, brands.length),
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: Math.min(4, brands.length),
          slidesToScroll: Math.min(4, brands.length),
          infinite: brands.length > 4,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: Math.min(3, brands.length),
          slidesToScroll: Math.min(3, brands.length),
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: Math.min(2, brands.length),
          slidesToScroll: Math.min(2, brands.length),
        },
      },
    ],
  };

  return (
    <div className="flex flex-col gap-8 justify-center overflow-hidden md:p-10 p-5">
      <Slider {...settings}>
        {brands.map((brand) => (
          <div key={brand.id} className="px-2">
            <div className="flex justify-center">
              <div className="h-20 rounded-lg border overflow-hidden">
                <img
                  className="h-full w-full object-contain"
                  src={brand.imageURL}
                  alt={brand.name}
                />
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
}