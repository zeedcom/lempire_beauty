import { db, storage } from "@/lib/firebase";
import {
  collection,
  deleteDoc,
  doc,
  setDoc,
  Timestamp,
} from "firebase/firestore";

export const createNewProduct = async ({ data, featureImage, imageList }) => {
  if (!data?.title) {
    throw new Error("Title is required");
  }
  if (!featureImage) {
    throw new Error("Feature Image is required");
  }

   /*  ===========================*/
const formData = new FormData();

formData.append("file", featureImage);
formData.append(
  "upload_preset",
  process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
);
formData.append("folder", `products/${featureImage?.name}`);

const response = await fetch(
  `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
  {
    method: "POST",
    body: formData,
  }
);

if (!response.ok) {
  throw new Error("Failed to upload image to Cloudinary"+response);
}

const dataimg = await response.json();

const featureImageURL = dataimg.secure_url;

/*=================================== */
  let imageURLList = [];

  for (let i = 0; i < imageList?.length; i++) {
    const image = imageList[i];

   /*  ===========================*/
const formData = new FormData();

formData.append("file", image);
formData.append(
  "upload_preset",
  process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
);
formData.append("folder", `products/${image?.name}`);

const response = await fetch(
  `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
  {
    method: "POST",
    body: formData,
  }
);

if (!response.ok) {
  throw new Error("Failed to upload image to Cloudinary"+response);
}

const dataimg = await response.json();

const url = dataimg.secure_url;

/*=================================== */
    imageURLList.push(url);
  }

  const newId = doc(collection(db, `ids`)).id;

  await setDoc(doc(db, `products/${newId}`), {
    ...data,
    featureImageURL: featureImageURL,
    imageList: imageURLList,
    id: newId,
    timestampCreate: Timestamp.now(),
  });
};

export const updateProduct = async ({ data, featureImage, imageList }) => {
  if (!data?.title) {
    throw new Error("Title is required");
  }
  if (!data?.id) {
    throw new Error("ID is required");
  }

  let featureImageURL = data?.featureImageURL ?? "";

  if (featureImage) {
    
   /*  ===========================*/
const formData = new FormData();

formData.append("file", featureImage);
formData.append(
  "upload_preset",
  process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
);
formData.append("folder", `products/${featureImage?.name}`);

const response = await fetch(
  `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
  {
    method: "POST",
    body: formData,
  }
);

if (!response.ok) {
  throw new Error("Failed to upload image to Cloudinary"+response);
}

const dataimg = await response.json();

const featureImageURL = dataimg.secure_url;

/*=================================== */
  }

  let imageURLList = imageList?.length === 0 ? data?.imageList : [];

  for (let i = 0; i < imageList?.length; i++) {
    const image = imageList[i];
    
   /*  ===========================*/
const formData = new FormData();

formData.append("file", image);
formData.append(
  "upload_preset",
  process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
);
formData.append("folder", `products/${image?.name}`);

const response = await fetch(
  `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
  {
    method: "POST",
    body: formData,
  }
);

if (!response.ok) {
  throw new Error("Failed to upload image to Cloudinary"+response);
}

const dataimg = await response.json();

const url = dataimg.secure_url;

/*=================================== */
    imageURLList.push(url);
  }

  await setDoc(doc(db, `products/${data?.id}`), {
    ...data,
    featureImageURL: featureImageURL,
    imageList: imageURLList,
    timestampUpdate: Timestamp.now(),
  });
};

export const deleteProduct = async ({ id }) => {
  if (!id) {
    throw new Error("ID is required");
  }
  await deleteDoc(doc(db, `products/${id}`));
};
