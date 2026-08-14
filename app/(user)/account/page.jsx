"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useOrders } from "@/lib/firestore/orders/read";
import { CircularProgress } from "@nextui-org/react";


export default function Page() {
  const { user } = useAuth();

  const {
    data: orders,
    error,
    isLoading,
  } = useOrders({
    uid: user?.uid,
  });


  if (isLoading) {
    return (
      <div className="flex justify-center py-48">
        <CircularProgress />
      </div>
    );
  }


  if (error) {
    return (
      <div className="p-5 text-red-500">
        {error?.message ?? error}
      </div>
    );
  }


  return (
    <main className="flex flex-col gap-4 p-5">

      <h1 className="text-2xl font-semibold">
        My Orders
      </h1>


      {/* Empty Orders */}

      {(!orders || orders.length === 0) && (
        <div className="flex flex-col items-center justify-center gap-3 py-11">

          <div className="flex justify-center">
            <img
              className="h-44"
              src="/svgs/Empty-pana.svg"
              alt="No orders"
            />
          </div>

          <h1>
            You have no order
          </h1>

        </div>
      )}


      {/* Orders */}

      <div className="flex flex-col gap-3">

        {orders?.map((item, orderIndex) => {

          /*
           * New order totals
           */
          const productTotal =
            Number(
              item?.payment?.productTotal ??
              item?.checkout?.productTotal ??
              0
            );

          const shippingPrice =
            Number(
              item?.payment?.shippingPrice ??
              item?.checkout?.shippingPrice ??
              0
            );

          const totalAmount =
            Number(
              item?.payment?.totalPrice ??
              item?.checkout?.totalPrice ??
              productTotal + shippingPrice
            );


          return (

            <div
              key={item?.id ?? orderIndex}
              className="flex flex-col gap-3 border rounded-lg p-4"
            >

              {/* Order Header */}

              <div className="flex flex-col gap-2">

                <div className="flex gap-3 items-center flex-wrap">

                  <h3>
                    {orderIndex + 1}
                  </h3>


                  {/* Payment Mode */}

                  <h3 className="bg-blue-100 text-blue-500 text-xs rounded-lg px-2 py-1 uppercase">

                    {item?.paymentMode ?? "COD"}

                  </h3>


                  {/* Status */}

                  <h3 className="bg-green-100 text-green-500 text-xs rounded-lg px-2 py-1 uppercase">

                    {item?.status ?? "pending"}

                  </h3>


                  {/* Total */}

                  <h3 className="text-green-600 font-semibold">

                    {totalAmount.toLocaleString(
                      "fr-DZ"
                    )}{" "}
                    DZD

                  </h3>

                </div>


                {/* Date */}

                <h4 className="text-gray-600 text-xs">

                  {item?.timestampCreate
                    ?.toDate()
                    ?.toLocaleString(
                      "fr-DZ"
                    )}

                </h4>

              </div>


              {/* Products */}

              <div className="flex flex-col gap-2">

                {item?.checkout?.line_items?.map(
                  (product, productIndex) => {

                    const price =
                      Number(
                        product?.price
                      ) || 0;

                    const quantity =
                      Number(
                        product?.quantity
                      ) || 1;

                    const subtotal =
                      Number(
                        product?.subtotal
                      ) ||
                      price * quantity;


                    return (

                      <div
                        key={
                          product?.productId ??
                          productIndex
                        }
                        className="flex gap-2 items-center"
                      >

                        {/* Image */}

                        <img
                          className="h-10 w-10 rounded-lg object-cover"
                          src={
                            product?.image ??
                            "/logo.png"
                          }
                          alt={
                            product?.name ??
                            "Product Image"
                          }
                        />


                        {/* Product Info */}

                        <div className="flex-1">

                          <h1>
                            {product?.name}
                          </h1>


                          <h1 className="text-gray-500 text-xs">

                            {price.toLocaleString(
                              "fr-DZ"
                            )}{" "}
                            DZD

                            <span>
                              {" "}X{" "}
                            </span>

                            <span>
                              {quantity}
                            </span>

                          </h1>

                        </div>


                        {/* Subtotal */}

                        <div>

                          <h1 className="text-sm font-medium">

                            {subtotal.toLocaleString(
                              "fr-DZ"
                            )}{" "}
                            DZD

                          </h1>

                        </div>

                      </div>

                    );

                  }
                )}

              </div>


              {/* Price Summary */}

              <div className="border-t pt-3 flex flex-col gap-2">

                {/* Products */}

                <div className="flex justify-between text-sm">

                  <span>
                    Products
                  </span>

                  <span>
                    {productTotal.toLocaleString(
                      "fr-DZ"
                    )}{" "}
                    DZD
                  </span>

                </div>


                {/* Shipping */}

                <div className="flex justify-between text-sm">

                  <span>
                    Shipping
                  </span>

                  <span>
                    {shippingPrice.toLocaleString(
                      "fr-DZ"
                    )}{" "}
                    DZD
                  </span>

                </div>


                {/* Total */}

                <div className="flex justify-between font-semibold border-t pt-2">

                  <span>
                    Total
                  </span>

                  <span className="text-green-600">

                    {totalAmount.toLocaleString(
                      "fr-DZ"
                    )}{" "}
                    DZD

                  </span>

                </div>

              </div>


              {/* Shipping Address */}

              {item?.checkout?.address && (

                <div className="border-t pt-3">

                  <h3 className="font-semibold text-sm mb-1">
                    Shipping Address
                  </h3>

                  <p className="text-xs text-gray-600">

                    {item?.checkout?.address?.fullName}

                    {" - "}

                    {item?.checkout?.address?.mobile}

                  </p>

                  <p className="text-xs text-gray-600">

                    {item?.checkout?.address?.wilaya}

                    {" / "}

                    {item?.checkout?.address?.daira}

                    {" / "}

                    {item?.checkout?.address?.commune}

                  </p>

                  {item?.checkout?.address?.orderNote && (
                    <p className="text-xs text-gray-500 mt-1">

                      Note:{" "}
                      {
                        item?.checkout
                          ?.address
                          ?.orderNote
                      }

                    </p>
                  )}

                </div>

              )}

            </div>

          );

        })}

      </div>

    </main>
  );
}