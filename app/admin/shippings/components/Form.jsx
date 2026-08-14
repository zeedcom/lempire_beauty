"use client";

import { getCommune } from "@/lib/firestore/communes/read_server";
import {
  createNewCommune,
  updateCommune,
} from "@/lib/firestore/communes/write";

import { Button } from "@nextui-org/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function Form() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  const id = searchParams.get("id");

  // Fetch commune when editing
  const fetchData = async () => {
    try {
      const res = await getCommune({ id: id });

      if (!res) {
        toast.error("Commune Not Found!");
      } else {
        setData(res);
      }
    } catch (error) {
      toast.error(error?.message || "Something went wrong");
    }
  };

  useEffect(() => {
    if (id) {
      fetchData();
    } else {
      // Default data for creating
      setData({
        commune_name_ascii: "",
        commune_name: "",
        daira_name_ascii: "",
        daira_name: "",
        wilaya_code: "",
        wilaya_name_ascii: "",
        wilaya_name: "",
      });
    }
  }, [id]);

  // Update one field
  const handleData = (key, value) => {
    setData((prevData) => ({
      ...(prevData ?? {}),
      [key]: value,
    }));
  };

  // Create
  const handleCreate = async () => {
    setIsLoading(true);

    try {
      await createNewCommune({
        data: data,
      });

      toast.success("Commune successfully created");

      setData({
        commune_name_ascii: "",
        commune_name: "",
        daira_name_ascii: "",
        daira_name: "",
        wilaya_code: "",
        wilaya_name_ascii: "",
        wilaya_name: "",
      });
    } catch (error) {
      toast.error(error?.message || "Failed to create commune");
    }

    setIsLoading(false);
  };

  // Update
  const handleUpdate = async () => {
    setIsLoading(true);

    try {
      await updateCommune({
        data: data,
      });

      toast.success("Commune successfully updated");

      setData(null);

      router.push("/admin/communes");
    } catch (error) {
      toast.error(error?.message || "Failed to update commune");
    }

    setIsLoading(false);
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">
          {id ? "Update Commune" : "Create Commune"}
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          {id
            ? "Update the commune information"
            : "Add a new Algerian commune"}
        </p>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();

          if (id) {
            handleUpdate();
          } else {
            handleCreate();
          }
        }}
        className="flex flex-col gap-5"
      >
        
        {/* Wilaya Code */}
        <div>
          <label
            htmlFor="wilaya-code"
            className="block text-sm font-medium mb-2"
          >
            Wilaya Code
          </label>

          <input
            id="wilaya-code"
            name="wilaya-code"
            type="text"
            placeholder="Example: 01"
            value={data?.wilaya_code ?? ""}
            onChange={(e) =>
              handleData("wilaya_code", e.target.value)
            }
            className="border px-4 py-2 rounded-lg w-full focus:outline-none"
            required
          />
        </div>

        {/* Wilaya Name ASCII */}
        <div>
          <label
            htmlFor="wilaya-name-ascii"
            className="block text-sm font-medium mb-2"
          >
            Wilaya Name ASCII
          </label>

          <input
            id="wilaya-name-ascii"
            name="wilaya-name-ascii"
            type="text"
            placeholder="Example: Adrar"
            value={data?.wilaya_name_ascii ?? ""}
            onChange={(e) =>
              handleData("wilaya_name_ascii", e.target.value)
            }
            className="border px-4 py-2 rounded-lg w-full focus:outline-none"
            required
          />
        </div>

        {/* Wilaya Name Arabic */}
        <div>
          <label
            htmlFor="wilaya-name"
            className="block text-sm font-medium mb-2"
          >
            Wilaya Name
          </label>

          <input
            id="wilaya-name"
            name="wilaya-name"
            type="text"
            dir="rtl"
            placeholder="مثال: أدرار"
            value={data?.wilaya_name ?? ""}
            onChange={(e) =>
              handleData("wilaya_name", e.target.value)
            }
            className="border px-4 py-2 rounded-lg w-full focus:outline-none"
            required
          />
        </div>
           {/*Price */}
 
        <div>
          <label
            htmlFor="price"
            className="block text-sm font-medium mb-2"
          >
            Price
          </label>

          <input
            id="price"
            name="price"
            type="number"
            min="0"
            step="0.01"
            placeholder="Example: 500"
            value={data?.price ?? ""}
            onChange={(e) =>
              handleData("price", Number(e.target.value))
            }
            className="border px-4 py-2 rounded-lg w-full focus:outline-none"
            required
          />
        </div>
        {/* Submit */}
        <Button
          type="submit"
          color="primary"
          isLoading={isLoading}
          className="w-full"
        >
          {id ? "Update Commune" : "Create Commune"}
        </Button>
      </form>
    </div>
  );
}