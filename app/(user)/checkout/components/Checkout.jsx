"use client";

import { useAuth } from "@/contexts/AuthContext";
import {
  createCheckoutAndGetURL,
  createCheckoutCODAndGetId,
} from "@/lib/firestore/checkout/write";
import { useCommune } from "@/lib/firestore/communes/read";
import { Button } from "@nextui-org/react";
import confetti from "canvas-confetti";
import { CheckSquare2Icon, Square } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

export default function Checkout({ productList }) {
  const [isLoading, setIsLoading] = useState(false);

  const [paymentMode, setPaymentMode] = useState("cod");

  const [address, setAddress] = useState(null);

  // All communes from public/communes.json
  const [communes, setCommunes] = useState([]);

  const [communesLoading, setCommunesLoading] = useState(true);
  const [communesError, setCommunesError] = useState(null);

  // Selected IDs/codes are only used internally
  const [selectedWilayaCode, setSelectedWilayaCode] = useState("");
  const [selectedDaira, setSelectedDaira] = useState("");
  const [selectedCommuneId, setSelectedCommuneId] = useState("");

  const router = useRouter();
  const { user } = useAuth();

  /*
   * Load communes from:
   *
   * public/communes.json
   */
  useEffect(() => {
    const loadCommunes = async () => {
      try {
        setCommunesLoading(true);

        const response = await fetch("/communes.json");

        if (!response.ok) {
          throw new Error("Failed to load communes");
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Invalid communes.json format");
        }

        setCommunes(data);
      } catch (error) {
        console.error(error);
        setCommunesError(error);
      } finally {
        setCommunesLoading(false);
      }
    };

    loadCommunes();
  }, []);

  /*
   * Wilaya list
   *
   * Taken from the JSON file.
   */
  const wilayas = useMemo(() => {
    const map = new Map();

    communes.forEach((item) => {
      if (!map.has(item.wilaya_code)) {
        map.set(item.wilaya_code, {
          code: item.wilaya_code,
          name: item.wilaya_name,
          nameAscii: item.wilaya_name_ascii,
        });
      }
    });

    return Array.from(map.values()).sort((a, b) =>
      String(a.code).localeCompare(String(b.code))
    );
  }, [communes]);

  /*
   * Dairas for selected Wilaya
   */
  const dairas = useMemo(() => {
    if (!selectedWilayaCode) {
      return [];
    }

    const map = new Map();

    communes
      .filter(
        (item) =>
          String(item.wilaya_code) ===
          String(selectedWilayaCode)
      )
      .forEach((item) => {
        const key = item.daira_name;

        if (!map.has(key)) {
          map.set(key, {
            name: item.daira_name,
            nameAscii: item.daira_name_ascii,
          });
        }
      });

    return Array.from(map.values()).sort((a, b) =>
      String(a.name).localeCompare(String(b.name))
    );
  }, [communes, selectedWilayaCode]);

  /*
   * Communes for selected Wilaya + Daira
   */
  const availableCommunes = useMemo(() => {
    if (!selectedWilayaCode || !selectedDaira) {
      return [];
    }

    return communes
      .filter(
        (item) =>
          String(item.wilaya_code) ===
            String(selectedWilayaCode) &&
          item.daira_name === selectedDaira
      )
      .sort((a, b) =>
        String(a.commune_name).localeCompare(
          String(b.commune_name)
        )
      );
  }, [
    communes,
    selectedWilayaCode,
    selectedDaira,
  ]);

  /*
   * Selected commune from JSON
   */
  const selectedCommune = useMemo(() => {
    if (!selectedCommuneId) {
      return null;
    }

    return (
      communes.find(
        (item) =>
          String(item.id) ===
          String(selectedCommuneId)
      ) ?? null
    );
  }, [communes, selectedCommuneId]);

  /*
   * IMPORTANT:
   *
   * Firestore is used ONLY to get the shipping price.
   *
   * The ID sent to useCommune is the Wilaya code.
   *
   * Example:
   * wilaya_code = "01"
   * useCommune({ id: "01" })
   */
  const {
    data: communePriceData,
    error: communePriceError,
    isLoading: communePriceLoading,
  } = useCommune({
    id: selectedCommune?.wilaya_code ?? "",
  });

  /*
   * Shipping price
   */
  const shippingPrice =
    Number(communePriceData?.price) || 0;

  /*
   * Product total
   */
  const productTotal = productList?.reduce(
    (prev, curr) => {
      return (
        prev +
        Number(curr?.quantity ?? 0) *
          Number(curr?.product?.salePrice ?? 0)
      );
    },
    0
  );

  /*
   * Final total
   */
  const totalPrice =
    Number(productTotal) + Number(shippingPrice);

  /*
   * Handle address
   */
  const handleAddress = (key, value) => {
    setAddress((prev) => ({
      ...(prev ?? {}),
      [key]: value,
    }));
  };

  /*
   * Wilaya change
   */
  const handleWilayaChange = (e) => {
    const code = e.target.value;

    const wilaya = wilayas.find(
      (item) =>
        String(item.code) === String(code)
    );

    setSelectedWilayaCode(code);

    // Reset dependent fields
    setSelectedDaira("");
    setSelectedCommuneId("");

    setAddress((prev) => ({
      ...(prev ?? {}),
      wilaya: wilaya?.name ?? "",
      daira: "",
      commune: "",
      shippingPrice: 0,
    }));
  };

  /*
   * Daira change
   */
  const handleDairaChange = (e) => {
    const value = e.target.value;

    setSelectedDaira(value);

    // Reset commune
    setSelectedCommuneId("");

    setAddress((prev) => ({
      ...(prev ?? {}),
      daira: value,
      commune: "",
      shippingPrice: 0,
    }));
  };

  /*
   * Commune change
   */
  const handleCommuneChange = (e) => {
    const value = e.target.value;

    const commune = communes.find(
      (item) =>
        String(item.id) === String(value)
    );

    setSelectedCommuneId(value);

    setAddress((prev) => ({
      ...(prev ?? {}),
      wilaya: commune?.wilaya_name ?? "",
      daira: commune?.daira_name ?? "",
      commune:
        commune?.commune_name ?? "",
    }));
  };

  /*
   * Place order
   */
  const handlePlaceOrder = async () => {
    setIsLoading(true);

    try {
      if (productTotal <= 0) {
        throw new Error(
          "Product price should be greater than 0"
        );
      }

      if (!productList || productList.length === 0) {
        throw new Error(
          "Product List Is Empty"
        );
      }

      if (
        !address?.fullName ||
        !address?.mobile ||
        !address?.wilaya ||
        !address?.daira ||
        !address?.commune
      ) {
        throw new Error(
          "Please Fill All Address Details"
        );
      }

      if (!selectedCommune) {
        throw new Error(
          "Please Select A Commune"
        );
      }

      if (shippingPrice <= 0) {
        throw new Error(
          "Shipping price is not available for this Wilaya"
        );
      }

      /*
       * Save shipping price into the address.
       *
       * Names are stored instead of codes.
       */
      const finalAddress = {
        ...address,
        shippingPrice: shippingPrice,
      };

      /*
       * PREPAID
       */
      if (paymentMode === "prepaid") {
        const url =
          await createCheckoutAndGetURL({
            uid: user?.uid,
            products: productList,
            address: finalAddress,
            productTotal: productTotal,
            shippingPrice: shippingPrice,
            totalPrice: totalPrice,
          });

        router.push(url);
      }

      /*
       * CASH ON DELIVERY
       */
      else {
        const checkoutId =
          await createCheckoutCODAndGetId({
            uid: user?.uid,
            products: productList,
            address: finalAddress,
            productTotal: productTotal,
            shippingPrice: shippingPrice,
            totalPrice: totalPrice,
          });

        router.push(
          `/checkout-cod?checkout_id=${checkoutId}`
        );

        toast.success(
          "Successfully Placed!"
        );

        confetti();
      }
    } catch (error) {
      console.error(error);

      toast.error(
        error?.message ??
          "Something went wrong"
      );
    }

    setIsLoading(false);
  };

  if (communesLoading) {
    return (
      <div className="flex justify-center py-20">
        Loading...
      </div>
    );
  }

  if (communesError) {
    return (
      <div className="p-5 text-red-500">
        {communesError?.message}
      </div>
    );
  }

  return (
    <section className="flex flex-col md:flex-row gap-5">

      {/* =========================
          SHIPPING ADDRESS
      ========================== */}

      <section className="flex-1 flex flex-col gap-3">
        <section className="flex flex-col gap-3 border rounded-xl p-4">

          <h1 className="text-xl">
            Shipping Address
          </h1>

          <input
            type="text"
            id="full-name"
            name="full-name"
            placeholder="Full Name"
            value={
              address?.fullName ?? ""
            }
            onChange={(e) => {
              handleAddress(
                "fullName",
                e.target.value
              );
            }}
            className="border px-4 py-2 rounded-lg w-full focus:outline-none"
          />

          <input
            type="tel"
            id="mobile"
            name="mobile"
            placeholder="Mobile Number"
            value={
              address?.mobile ?? ""
            }
            onChange={(e) => {
              handleAddress(
                "mobile",
                e.target.value
              );
            }}
            className="border px-4 py-2 rounded-lg w-full focus:outline-none"
          />

          {/* Wilaya */}

          <select
            value={selectedWilayaCode}
            onChange={handleWilayaChange}
            className="border px-4 py-2 rounded-lg w-full bg-white focus:outline-none"
          >
            <option value="">
              Select Wilaya
            </option>

            {wilayas.map((wilaya) => (
              <option
                key={wilaya.code}
                value={wilaya.code}
              >
                {wilaya.code} -{" "}
                {wilaya.name}
              </option>
            ))}
          </select>

          {/* Daira */}

          <select
            value={selectedDaira}
            onChange={handleDairaChange}
            disabled={!selectedWilayaCode}
            className="border px-4 py-2 rounded-lg w-full bg-white focus:outline-none disabled:bg-gray-100"
          >
            <option value="">
              Select Daira
            </option>

            {dairas.map((daira) => (
              <option
                key={daira.name}
                value={daira.name}
              >
                {daira.name}
              </option>
            ))}
          </select>

          {/* Commune */}

          <select
            value={selectedCommuneId}
            onChange={handleCommuneChange}
            disabled={
              !selectedDaira
            }
            className="border px-4 py-2 rounded-lg w-full bg-white focus:outline-none disabled:bg-gray-100"
          >
            <option value="">
              Select Commune
            </option>

            {availableCommunes.map(
              (commune) => (
                <option
                  key={commune.id}
                  value={commune.id}
                >
                  {commune.commune_name}
                </option>
              )
            )}
          </select>

          {/* Shipping price */}

          {selectedCommune && (
            <div className="flex justify-between items-center bg-gray-50 border rounded-lg px-4 py-3">
              <span className="text-sm text-gray-600">
                Shipping Price
              </span>

              <span className="font-semibold">
                DZD {shippingPrice}
              </span>
            </div>
          )}

          <textarea
            id="delivery-notes"
            name="delivery-notes"
            placeholder="Notes about your order, e.g. special notes for delivery"
            value={
              address?.orderNote ?? ""
            }
            onChange={(e) => {
              handleAddress(
                "orderNote",
                e.target.value
              );
            }}
            className="border px-4 py-2 rounded-lg w-full focus:outline-none"
          />
        </section>
      </section>

      {/* =========================
          ORDER SUMMARY
      ========================== */}

      <div className="flex-1 flex flex-col gap-3">

        <section className="flex flex-col gap-3 border rounded-xl p-4">

          <h1 className="text-xl">
            Products
          </h1>

          <div className="flex flex-col gap-2">

            {productList?.map(
              (item, index) => (
                <div
                  key={
                    item?.id ??
                    index
                  }
                  className="flex gap-3 items-center"
                >
                  <img
                    className="w-10 h-10 object-cover rounded-lg"
                    src={
                      item?.product
                        ?.featureImageURL
                    }
                    alt=""
                  />

                  <div className="flex-1 flex flex-col">

                    <h1 className="text-sm">
                      {
                        item?.product
                          ?.title
                      }
                    </h1>

                    <h3 className="text-green-600 font-semibold text-[10px]">
                      DZD{" "}
                      {
                        item?.product
                          ?.salePrice
                      }{" "}
                      <span className="text-black">
                        X
                      </span>{" "}
                      <span className="text-gray-600">
                        {
                          item?.quantity
                        }
                      </span>
                    </h3>

                  </div>

                  <div>
                    <h3 className="text-sm">
                      DZD{" "}
                      {Number(
                        item?.product
                          ?.salePrice ??
                          0
                      ) *
                        Number(
                          item?.quantity ??
                            0
                        )}
                    </h3>
                  </div>
                </div>
              )
            )}

          </div>

          {/* Product Total */}

          <div className="flex justify-between w-full items-center p-2">
            <h1>
              Product Total
            </h1>

            <h1>
              DZD {productTotal}
            </h1>
          </div>

          {/* Shipping */}

          <div className="flex justify-between w-full items-center p-2">
            <h1>
              Shipping
            </h1>

            <h1>
              DZD {shippingPrice}
            </h1>
          </div>

          {/* Final Total */}

          <div className="flex justify-between w-full items-center p-2 font-semibold border-t">
            <h1>
              Total
            </h1>

            <h1>
              DZD {totalPrice}
            </h1>
          </div>

        </section>

        {/* =========================
            PAYMENT
        ========================== */}

        <section className="flex flex-col gap-3 border rounded-xl p-4">

          <div className="flex flex-col md:flex-row items-center justify-between">

            <h2 className="text-xl">
              Payment Mode
            </h2>

            <div className="flex items-center gap-3">

              <button
                disabled={true}
                onClick={() => {
                  setPaymentMode(
                    "prepaid"
                  );
                }}
                className="flex items-center gap-1 text-xs"
              >
                {paymentMode ===
                  "prepaid" && (
                  <CheckSquare2Icon
                    className="text-blue-500"
                    size={13}
                  />
                )}

                {paymentMode ===
                  "cod" && (
                  <Square
                    size={13}
                  />
                )}

                Prepaid
              </button>

              <button
                onClick={() => {
                  setPaymentMode(
                    "cod"
                  );
                }}
                className="flex items-center gap-1 text-xs"
              >
                {paymentMode ===
                  "prepaid" && (
                  <Square
                    size={13}
                  />
                )}

                {paymentMode ===
                  "cod" && (
                  <CheckSquare2Icon
                    className="text-blue-500"
                    size={13}
                  />
                )}

                Cash On Delivery
              </button>

            </div>
          </div>

          <div className="flex gap-1 items-center">

            <CheckSquare2Icon
              className="text-blue-500"
              size={13}
            />

            <h4 className="text-xs text-gray-600">
              I agree with the{" "}
              <span className="text-blue-700">
                terms & conditions
              </span>
            </h4>

          </div>

          <Button
            isLoading={
              isLoading ||
              communePriceLoading
            }
            isDisabled={
              isLoading ||
              communePriceLoading
            }
            onClick={
              handlePlaceOrder
            }
            className="bg-black text-white"
          >
            Place Order
          </Button>

        </section>
      </div>
    </section>
  );
}
