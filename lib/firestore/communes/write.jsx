import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
} from "firebase/firestore";

/**
 * Create a new commune
 */
export const createNewCommune = async ({ data }) => {
  if (!data) {
    throw new Error("Commune data is required");
  }

  try {
    // Get all communes to find the next ID
    const communesRef = collection(db, "communes");
    const snapshot = await getDocs(communesRef);

    let maxId = 0;

    snapshot.forEach((docSnap) => {
      const commune = docSnap.data();
      const currentId = Number(commune.id) || 0;

      if (currentId > maxId) {
        maxId = currentId;
      }
    });

    const newId = maxId + 1;

    // Use the generated ID as Firestore document ID
    const communeRef = doc(
      db,
      "communes",
      String(newId)
    );

    const communeData = {
      id: newId,

      commune_name_ascii:
        data.commune_name_ascii?.trim() || "",

      commune_name:
        data.commune_name?.trim() || "",

      daira_name_ascii:
        data.daira_name_ascii?.trim() || "",

      daira_name:
        data.daira_name?.trim() || "",

      wilaya_code:
        data.wilaya_code?.trim() || "",

      wilaya_name_ascii:
        data.wilaya_name_ascii?.trim() || "",

      wilaya_name:
        data.wilaya_name?.trim() || "",

      price:
        Number(data.price) || 0,
    };

    await setDoc(communeRef, communeData);

    return {
      success: true,
      id: newId,
      data: communeData,
    };
  } catch (error) {
    console.error("Error creating commune:", error);

    throw new Error(
      error?.message || "Failed to create commune"
    );
  }
};


/**
 * Update an existing commune
 */
export const updateCommune = async ({ data }) => {
  if (!data?.id) {
    throw new Error("Commune ID is required");
  }

  try {
    const communeRef = doc(
      db,
      "communes",
      String(data.id)
    );

    const communeData = {
      id: Number(data.id),

      commune_name_ascii:
        data.commune_name_ascii?.trim() || "",

      commune_name:
        data.commune_name?.trim() || "",

      daira_name_ascii:
        data.daira_name_ascii?.trim() || "",

      daira_name:
        data.daira_name?.trim() || "",

      wilaya_code:
        data.wilaya_code?.trim() || "",

      wilaya_name_ascii:
        data.wilaya_name_ascii?.trim() || "",

      wilaya_name:
        data.wilaya_name?.trim() || "",

      price:
        Number(data.price) || 0,
    };

    await updateDoc(
      communeRef,
      communeData
    );

    return {
      success: true,
      id: data.id,
      data: communeData,
    };
  } catch (error) {
    console.error("Error updating commune:", error);

    throw new Error(
      error?.message || "Failed to update commune"
    );
  }
};


/**
 * Delete commune
 */
export const deleteCommune = async ({ id }) => {
  if (!id) {
    throw new Error("Commune ID is required");
  }

  try {
    const communeRef = doc(
      db,
      "communes",
      String(id)
    );

    await deleteDoc(communeRef);

    return {
      success: true,
      id: Number(id),
    };
  } catch (error) {
    console.error("Error deleting commune:", error);

    throw new Error(
      error?.message || "Failed to delete commune"
    );
  }
};