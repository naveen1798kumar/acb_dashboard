// dashboard/src/pages/Products.jsx
import React, { useEffect, useState, useMemo } from "react";
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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [subcategoryFilter, setSubcategoryFilter] = useState("");

  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

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

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Reset to page 1 when filters/search change
  useEffect(() => {
    setPage(1);
  }, [search, categoryFilter, subcategoryFilter]);

  // Dynamic subcategories based on selected category
  const currentSubcategories =
    categories.find((c) => c.name === categoryFilter)?.subcategories || [];

  // Filtered products (search + filters)
  const filteredProducts = useMemo(
    () =>
      products.filter((p) => {
        const matchesSearch = p.name
          ?.toLowerCase()
          .includes(search.toLowerCase());
        const matchesCategory =
          categoryFilter === "" || p.category === categoryFilter;
        const matchesSubcategory =
          subcategoryFilter === "" || p.subcategory === subcategoryFilter;
        return matchesSearch && matchesCategory && matchesSubcategory;
      }),
    [products, search, categoryFilter, subcategoryFilter]
  );

  // Pagination
  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / PAGE_SIZE)
  );
  const startIndex = (page - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500">
        <Package size={40} className="animate-pulse mb-3" />
        <p className="text-lg">Loading products...</p>
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Layers className="text-blue-600" /> Products Management
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage all products, variants, top-selling items, and subcategories
          </p>
        </div>

        <Link
          to="/add"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 hover:shadow-md transition-all text-sm font-medium"
        >
          <PlusCircle size={18} /> Add New Product
        </Link>
      </div>

      {/* Toolbar */}
      <div className="bg-white/90 backdrop-blur rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Search */}
        <div className="flex items-center gap-2 w-full md:w-1/2">
          <div className="flex items-center gap-2 flex-1 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50/60">
            <Search size={18} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search by product name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-1/2">
          <div className="flex items-center gap-2 flex-1">
            <Filter size={18} className="text-slate-400 shrink-0" />
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setSubcategoryFilter("");
              }}
              className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500/60 focus:outline-none"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c.name}>
                  {c.name.charAt(0).toUpperCase() + c.name.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <select
            value={subcategoryFilter}
            onChange={(e) => setSubcategoryFilter(e.target.value)}
            disabled={currentSubcategories.length === 0}
            className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500/60 focus:outline-none disabled:bg-slate-50 disabled:text-slate-400"
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

      {/* Stats Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs md:text-sm text-slate-500">
        <div>
          Total products:{" "}
          <span className="font-semibold text-slate-800">
            {products.length}
          </span>{" "}
          • Showing:{" "}
          <span className="font-semibold text-slate-800">
            {filteredProducts.length}
          </span>
        </div>
        {filteredProducts.length > 0 && (
          <div>
            Page{" "}
            <span className="font-semibold text-slate-800">{page}</span> of{" "}
            <span className="font-semibold text-slate-800">
              {totalPages}
            </span>
          </div>
        )}
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-slate-200">
          <Package size={50} className="mx-auto mb-3 text-slate-300" />
          <p className="text-slate-600 text-lg font-medium">
            No products found
          </p>
          <p className="text-slate-400 text-sm mt-1">
            Try changing filters or add a new product.
          </p>
          <Link
            to="/add"
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm hover:shadow-md transition text-sm font-medium"
          >
            <PlusCircle size={18} /> Add First Product
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                <tr className="text-left text-slate-600">
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
                {paginatedProducts.map((p, index) => (
                  <tr
                    key={p._id}
                    className={`transition hover:bg-blue-50/40 ${
                      index % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                    }`}
                  >
                    {/* Image */}
                    <td className="p-3">
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-14 h-14 object-cover rounded-md border border-slate-200 shadow-sm"
                        />
                      ) : (
                        <div className="w-14 h-14 flex items-center justify-center bg-slate-100 text-slate-400 rounded-md text-[11px] border border-slate-200">
                          No Image
                        </div>
                      )}
                    </td>

                    {/* Name */}
                    <td className="p-3 font-medium text-slate-900">
                      <Link
                        to={`/product/${p._id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {p.name}
                      </Link>
                    </td>

                    {/* Category */}
                    <td className="p-3 text-slate-700">{p.category}</td>

                    {/* Subcategory */}
                    <td className="p-3 text-slate-700">
                      {p.subcategory || "-"}
                    </td>

                    {/* Variants */}
                    <td className="p-3 align-top">
                      {p.variants && p.variants.length > 0 ? (
                        <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
                          {p.variants.map((v, i) => (
                            <li key={i}>
                              <span className="font-semibold">
                                {v.label}
                              </span>
                              : ₹{v.price} ({v.stock} in stock)
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-slate-400 italic text-xs">
                          No variants
                        </span>
                      )}
                    </td>

                    {/* Top Selling */}
                    <td className="p-3 text-center">
                      <button
                        onClick={() =>
                          toggleTopSelling(p._id, p.isTopSelling)
                        }
                        className={`inline-flex items-center gap-1 px-3 py-1 text-[11px] rounded-full transition-all ${
                          p.isTopSelling
                            ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                            : "bg-slate-200 text-slate-600 border border-slate-300"
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
                          className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-blue-100 text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition"
                        >
                          <Edit size={16} />
                        </Link>
                        <button
                          onClick={() => deleteProduct(p._id)}
                          className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200 transition"
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

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-200 bg-slate-50/70 text-xs md:text-sm">
            <div className="text-slate-500">
              Showing{" "}
              <span className="font-semibold text-slate-800">
                {filteredProducts.length === 0 ? 0 : startIndex + 1}
              </span>{" "}
              –{" "}
              <span className="font-semibold text-slate-800">
                {Math.min(endIndex, filteredProducts.length)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-800">
                {filteredProducts.length}
              </span>{" "}
              products
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-slate-200 bg-white disabled:opacity-50 disabled:cursor-default hover:bg-slate-100 transition"
              >
                <ChevronLeft size={16} />
              </button>

              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                const isActive = pageNum === page;
                // For many pages, you might want to compress; for now keep simple
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`h-8 min-w-[2rem] px-2 rounded-md border text-xs font-medium transition ${
                      isActive
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(page - 1 + 2)} // page + 1
                disabled={page === totalPages}
                className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-slate-200 bg-white disabled:opacity-50 disabled:cursor-default hover:bg-slate-100 transition"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
