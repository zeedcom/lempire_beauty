"use client";

import useSWR from "swr";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

/**
 * Get all communes
 */
const getCommunes = async () => {
  const snapshot = await getDocs(
    collection(db, "communes")
  );

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export function useCommunes() {
  const { data, error, isLoading } = useSWR(
    "communes",
    getCommunes,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    data,
    error,
    isLoading,
  };
}

/**
 * Get shipping price using Wilaya code
 *
 * Example:
 * wilaya_code = "09"
 *
 * Finds:
 * communes/*
 *   wilaya_code = "09"
 *
 * and returns its price.
 */
const getCommunePrice = async ({ wilayaCode }) => {
  if (!wilayaCode) {
    return null;
  }

  const q = query(
    collection(db, "communes"),
    where("wilaya_code", "==", String(wilayaCode))
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  // Get the first commune for this Wilaya
  const data = snapshot.docs[0].data();

  return {
    price: Number(data.price) || 0,
    wilaya_code: data.wilaya_code,
    wilaya_name: data.wilaya_name,
  };
};

export function useCommune({ id }) {
  const shouldFetch =
    id !== undefined &&
    id !== null &&
    id !== "";

  const { data, error, isLoading } = useSWR(
    shouldFetch
      ? ["shipping-price", String(id)]
      : null,
    () =>
      getCommunePrice({
        wilayaCode: String(id),
      }),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    data,
    error,
    isLoading,
  };
}
