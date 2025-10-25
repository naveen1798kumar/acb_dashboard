// dashboard/src/pages/Products.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  Search,
  Package,
  PlusCircle,
  Trash2,
  Edit,
  Filter,
  CheckCircle,
  XCircle,
  Layers,
} from "lucide-react";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [subcategoryFilter, setSubcategoryFilter] = useState("");

  const API_PRODUCTS = import.meta.env.VITE_API_URL + "/products";
  const API_CATEGORIES = import.meta.env.VITE_API_URL + "/categories";

  // Fetch products
  const fetchProducts = async () => {
    try {
      const { data } = await axios.get(API_PRODUCTS);
      if (Array.isArray(data)) setProducts(data);
      else if (Array.isArray(data.products)) setProducts(data.products);
      else setProducts([]);
    } catch (err) {
      console.error("❌ Error fetching products:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(API_CATEGORIES);
      if (Array.isArray(data)) setCategories(data);
      else if (Array.isArray(data.categories)) setCategories(data.categories);
      else setCategories([]);
    } catch (err) {
      console.error("❌ Error fetching categories:", err);
      setCategories([]);
    }
  };

  // Delete product
  const deleteProduct = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(`${API_PRODUCTS}/${id}`);
        fetchProducts();
      } catch (err) {
        console.error("❌ Delete failed:", err);
      }
    }
  };

  // Toggle Top Selling
  const toggleTopSelling = async (id, current) => {
    try {
      await axios.put(`${API_PRODUCTS}/${id}`, { isTopSelling: !current });
      fetchProducts();
    } catch (err) {
      console.error("❌ Toggle failed:", err);
    }
  };

  // Filtered results
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) &&
      (categoryFilter === "" || p.category === categoryFilter) &&
      (subcategoryFilter === "" || p.subcategory === subcategoryFilter)
  );

  // Dynamic subcategories based on selected category
  const currentSubcategories =
    categories.find((c) => c.name === categoryFilter)?.subcategories || [];

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-500">
        <Package size={40} className="animate-pulse mb-3" />
        <p className="text-lg">Loading products...</p>
      </div>
    );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Layers className="text-blue-600" /> Products Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage all products, variants, top-selling items, and subcategories
          </p>
        </div>

        <Link
          to="/add"
          className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-all"
        >
          <PlusCircle size={18} /> Add New Product
        </Link>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex items-center gap-2 w-full md:w-1/2">
          <Search size={18} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-1/3">
          <Filter size={18} className="text-gray-400" />
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setSubcategoryFilter(""); // Reset subcategory filter
            }}
            className="flex-1 border p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c.name}>
                {c.name.charAt(0).toUpperCase() + c.name.slice(1)}
              </option>
            ))}
          </select>

          {/* Subcategory filter */}
          <select
            value={subcategoryFilter}
            onChange={(e) => setSubcategoryFilter(e.target.value)}
            disabled={currentSubcategories.length === 0}
            className="flex-1 border p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">All Subcategories</option>
            {currentSubcategories.map((s, idx) => (
              <option key={idx} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg shadow">
          <Package size={50} className="mx-auto mb-3 text-gray-400" />
          <p className="text-gray-500 text-lg">No products found</p>
          <Link
            to="/add"
            className="mt-4 inline-flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <PlusCircle size={18} /> Add First Product
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow border border-gray-100">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr className="text-left text-sm text-gray-600">
                <th className="p-3 font-semibold">Image</th>
                <th className="p-3 font-semibold">Name</th>
                <th className="p-3 font-semibold">Category</th>
                <th className="p-3 font-semibold">Subcategory</th>
                <th className="p-3 font-semibold">Variants</th>
                <th className="p-3 font-semibold text-center">Top Selling</th>
                <th className="p-3 font-semibold text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.map((p, index) => (
                <tr
                  key={p._id}
                  className={`transition hover:bg-blue-50 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  {/* Image */}
                  <td className="p-3">
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-14 h-14 object-cover rounded-md border"
                      />
                    ) : (
                      <div className="w-14 h-14 flex items-center justify-center bg-gray-100 text-gray-400 rounded-md text-sm">
                        No Image
                      </div>
                    )}
                  </td>

                  {/* Name */}
                  <td className="p-3 font-medium text-gray-800">
                    <Link
                      to={`/product/${p._id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {p.name}
                    </Link>
                  </td>

                  {/* Category */}
                  <td className="p-3 text-gray-700">{p.category}</td>

                  {/* Subcategory */}
                  <td className="p-3 text-gray-700">
                    {p.subcategory || "-"}
                  </td>

                  {/* Variants */}
                  <td className="p-3">
                    {p.variants && p.variants.length > 0 ? (
                      <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                        {p.variants.map((v, i) => (
                          <li key={i}>
                            <span className="font-semibold">{v.label}</span>: ₹
                            {v.price} ({v.stock} in stock)
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-gray-400 italic text-sm">
                        No variants
                      </span>
                    )}
                  </td>

                  {/* Top Selling */}
                  <td className="p-3 text-center">
                    <button
                      onClick={() => toggleTopSelling(p._id, p.isTopSelling)}
                      className={`inline-flex items-center gap-1 px-3 py-1 text-xs rounded-full transition-all ${
                        p.isTopSelling
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {p.isTopSelling ? (
                        <>
                          <CheckCircle size={14} /> Yes
                        </>
                      ) : (
                        <>
                          <XCircle size={14} /> No
                        </>
                      )}
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="p-3 text-center">
                    <div className="flex justify-center gap-2">
                      <Link
                        to={`/edit/${p._id}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit size={16} />
                      </Link>
                      <button
                        onClick={() => deleteProduct(p._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Products;
