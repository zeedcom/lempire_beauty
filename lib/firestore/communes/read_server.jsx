import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";

/**
 * Get one commune by ID
 */
export const getCommune = async ({ id }) => {
  if (!id) {
    throw new Error("Commune ID is required");
  }

  try {
    const docRef = doc(db, "communes", String(id));
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return {
      id: docSnap.id,
      ...docSnap.data(),
    };
  } catch (error) {
    console.error("Error getting commune:", error);
    throw new Error(error?.message || "Failed to get commune");
  }
};

/**
 * Get all communes
 */
export const getCommunes = async () => {
  try {
    const communesRef = collection(db, "communes");

    const q = query(
      communesRef,
      orderBy("wilaya_code", "asc")
    );

    const querySnapshot = await getDocs(q);

    const communes = [];

    querySnapshot.forEach((docSnap) => {
      communes.push({
        id: docSnap.id,
        ...docSnap.data(),
      });
    });

    return communes;
  } catch (error) {
    console.error("Error getting communes:", error);
    throw new Error(error?.message || "Failed to get communes");
  }
};