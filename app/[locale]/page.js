import {
  getFeaturedProducts,
  getProducts,
} from "@/lib/firestore/products/read_server";
import Header from "../components/Header";
import FeaturedProductSlider from "../components/Sliders";
import Collections from "../components/Collections";
import { getCollections } from "@/lib/firestore/collections/read_server";
import Categories from "../components/Categories";
import { getCategories } from "@/lib/firestore/categories/read_server";
import ProductsGridView from "../components/Products";
import Brands from "../components/Brands";
import { getBrands } from "@/lib/firestore/brands/read_server";
import Footer from "../components/Footer";
import Perks from "../components/Perks";

export const dynamic = 'force-dynamic'

export default async function Home() {
  const [featuredProducts, collections, categories, products, brands] =
    await Promise.all([
      getFeaturedProducts(),
      getCollections(),
      getCategories(),
      getProducts(),
      getBrands(),
    ]);

  return (
    <main className="w-screen h-screen overflow-x-hidden overflow-y-auto">
      <Header />
      <FeaturedProductSlider featuredProducts={featuredProducts} />
      <Perks />
      <Categories categories={categories} />
      <ProductsGridView products={products} />
      <Collections collections={collections} />
      
      <Brands brands={brands} />
      <Footer />
    </main>
  );
}
