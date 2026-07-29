import { ProductCard } from "@/app/components/Products";
import SearchBox from "./components/SearchBox";

import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";

const getProducts = async (text) => {
  if (!text || text.trim() === "") {
    return [];
  }

  const searchText = text.toLowerCase().trim();

  const snapshot = await getDocs(
    query(
      collection(db, "products"),
      orderBy("timestampCreate", "desc")
    )
  );

  return snapshot.docs
    .map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    .filter((product) => {
      const title = product.title?.toLowerCase() || "";
      const shortDescription =
        product.shortDescription?.toLowerCase() || "";
      const description =
        product.description?.toLowerCase() || "";

      return (
        title.includes(searchText) ||
        shortDescription.includes(searchText) ||
        description.includes(searchText)
      );
    });
};

export default async function Page({ searchParams }) {
  const { q } = searchParams;

  const products = await getProducts(q);

  return (
    <main className="flex flex-col gap-5 min-h-screen p-5">
      <SearchBox />

      {q && (
        <div className="text-center">
          <h1 className="text-2xl font-semibold">
            Search Results
          </h1>
          <p className="text-gray-500">
            {products.length} product(s) found for "{q}"
          </p>
        </div>
      )}

      {products.length > 0 ? (
        <div className="flex justify-center">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5 max-w-7xl">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        </div>
      ) : (
        q && (
          <div className="text-center py-16">
            <h2 className="text-xl font-semibold">
              No products found
            </h2>
            <p className="text-gray-500 mt-2">
              Try another keyword.
            </p>
          </div>
        )
      )}
    </main>
  );
}