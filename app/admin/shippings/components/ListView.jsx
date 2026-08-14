"use client";

import { useCommunes } from "@/lib/firestore/communes/read";
import { deleteCommune } from "@/lib/firestore/communes/write";

import {
  Button,
  CircularProgress,
} from "@nextui-org/react";

import {
  Edit2,
  Trash2,
} from "lucide-react";

import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export default function ListView() {
  const {
    data: communes,
    error,
    isLoading,
  } = useCommunes();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4">
        {error?.message || "Something went wrong"}
      </div>
    );
  }

  return (
    <div className="w-full">

      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl font-semibold">
          Communes
        </h1>

        <p className="text-sm text-gray-500">
          Manage Algerian communes
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded-xl">

        <table className="w-full text-sm">

          <thead>
            <tr className="border-b bg-gray-50">

              <th className="text-left px-4 py-3">
                SN
              </th>

              <th className="text-left px-4 py-3">
                ID
              </th>
              <th className="text-left px-4 py-3">
                Wilaya
              </th>

              <th className="text-left px-4 py-3">
                Code
              </th>
              <th className="text-left px-4 py-3">
                Price
              </th>

              <th className="text-center px-4 py-3">
                Actions
              </th>

            </tr>
          </thead>

          <tbody>

            {communes?.map((item, index) => (
              <Row
                key={item?.id}
                item={item}
                index={index}
              />
            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}


function Row({ item, index }) {

  const [isDeleting, setIsDeleting] = useState(false);

  const router = useRouter();


  // Delete
  const handleDelete = async () => {

    if (!confirm("Are you sure you want to delete this commune?")) {
      return;
    }

    setIsDeleting(true);

    try {

      await deleteCommune({
        id: item?.id,
      });

      toast.success("Successfully Deleted");

    } catch (error) {

      toast.error(
        error?.message || "Failed to delete commune"
      );

    }

    setIsDeleting(false);
  };


  // Update
  const handleUpdate = () => {

    router.push(
      `/admin/communes?id=${item?.id}`
    );

  };


  return (

    <tr className="border-b hover:bg-gray-50">

      {/* SN */}
      <td className="px-4 py-3">
        {index + 1}
      </td>


      {/* ID */}
      <td className="px-4 py-3 font-medium">
        {item?.id}
      </td>



      {/* Wilaya */}
      <td className="px-4 py-3">

        <div>
          <div>
            {item?.wilaya_name_ascii}
          </div>

          <div
            className="text-gray-500"
            dir="rtl"
          >
            {item?.wilaya_name}
          </div>
        </div>

      </td>


      {/* Wilaya Code */}
      <td className="px-4 py-3">
        {item?.wilaya_code}
      </td>
 {/* price */}

      <td className="px-4 py-3 font-medium">
        {item?.price?.toLocaleString("fr-DZ")} DA
      </td>

      {/* Actions */}
      <td className="px-4 py-3">

        <div className="flex justify-center gap-2">

          {/* Edit */}
          <Button
            isIconOnly
            size="sm"
            variant="light"
            color="primary"
            onPress={handleUpdate}
          >
            <Edit2 size={18} />
          </Button>


          {/* Delete */}
          <Button
            isIconOnly
            size="sm"
            variant="light"
            color="danger"
            onPress={handleDelete}
            isLoading={isDeleting}
          >
            {!isDeleting && (
              <Trash2 size={18} />
            )}
          </Button>

        </div>

      </td>

    </tr>

  );
}