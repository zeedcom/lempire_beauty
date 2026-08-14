"use client";

import { useOrder } from "@/lib/firestore/orders/read";
import { CircularProgress } from "@nextui-org/react";
import { useParams } from "next/navigation";
import ChangeOrderStatus from "./components/ChangeStatus";

export default function Page() {
  const { orderId } = useParams();

  const {
    data: order,
    error,
    isLoading,
  } = useOrder({ id: orderId });

  if (isLoading) {
    return (
      <div className="flex justify-center py-48">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return <>{error}</>;
  }

  // New payment structure
  const productTotal =
    Number(order?.payment?.productTotal) || 0;

  const shippingPrice =
    Number(order?.payment?.shippingPrice) || 0;

  const totalAmount =
    Number(order?.payment?.totalPrice) ||
    Number(order?.payment?.amount) ||
    productTotal + shippingPrice;

  // New address structure
  let address = order?.checkout?.address ?? null;

  // Fallback for old orders
  if (!address) {
    try {
      address = JSON.parse(
        order?.checkout?.metadata?.address ?? "null"
      );
    } catch {
      address = null;
    }
  }

  return (
    <main className="flex flex-col gap-4 p-5">

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">
          Order Details
        </h1>

        <ChangeOrderStatus order={order} />
      </div>


      <div className="flex flex-col gap-2 border rounded-lg p-4 bg-white">

        <div className="flex flex-col gap-2">

          <div className="flex gap-3">

            <h3 className="bg-blue-100 text-blue-500 text-xs rounded-lg px-2 py-1 uppercase">
              {order?.paymentMode}
            </h3>

            <h3 className="bg-green-100 text-green-500 text-xs rounded-lg px-2 py-1 uppercase">
              {order?.status ?? "pending"}
            </h3>

            <h3 className="text-green-600">
              {totalAmount.toLocaleString("fr-DZ")} DZD
            </h3>

          </div>

          <h4 className="text-gray-600 text-xs">
            {order?.timestampCreate
              ?.toDate()
              ?.toString()}
          </h4>

        </div>


        <div className="flex flex-col gap-3">

          {order?.checkout?.line_items?.map(
            (product, index) => {

              const price =
                Number(product?.price) || 0;

              const quantity =
                Number(product?.quantity) || 1;

              return (
                <div
                  key={
                    product?.productId ??
                    index
                  }
                  className="flex gap-2 items-center"
                >

                  <img
                    className="h-10 w-10 rounded-lg object-cover"
                    src={
                      product?.image ??
                      "/logo.png"
                    }
                    alt="Product Image"
                  />

                  <div>

                    <h1 className="">
                      {product?.name}
                    </h1>

                    <h1 className="text-gray-500 text-xs">
                      {price.toLocaleString("fr-DZ")} DZD{" "}
                      <span>X</span>{" "}
                      <span>
                        {quantity.toString()}
                      </span>
                    </h1>

                  </div>

                </div>
              );
            }
          )}

        </div>


        {/* Price Summary */}

        <div className="flex flex-col gap-2 border-t pt-3">

          <div className="flex justify-between text-sm">
            <span>Products</span>

            <span>
              {productTotal.toLocaleString("fr-DZ")} DZD
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span>Shipping</span>

            <span>
              {shippingPrice.toLocaleString("fr-DZ")} DZD
            </span>
          </div>

          <div className="flex justify-between font-semibold">
            <span>Total</span>

            <span className="text-green-600">
              {totalAmount.toLocaleString("fr-DZ")} DZD
            </span>
          </div>

        </div>

      </div>


      <h1 className="text-2xl font-semibold">
        Address
      </h1>


      <div className="flex flex-col gap-2 border rounded-lg p-4 bg-white">

        <table>

          <tbody>

            <tr>
              <td>Full Name</td>
              <td>{address?.fullName}</td>
            </tr>

            <tr>
              <td>Mobile</td>
              <td>{address?.mobile}</td>
            </tr>

            <tr> <td>Wilaya</td> <td>{address?.wilaya}</td> </tr> 
            <tr> <td>Daira</td> <td>{address?.daira}</td> </tr> 
            <tr> <td>Commune</td> <td>{address?.commune}</td> </tr>
    

            <tr>
              <td>Notes</td>
              <td>
                {address?.note ??
                  address?.orderNote}
              </td>
            </tr>

          </tbody>

        </table>

      </div>

    </main>
  );
}