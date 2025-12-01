// dashboard/src/pages/ProductDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Edit,
  Package,
  Tag,
  CheckCircle,
  XCircle,
  Layers,
} from "lucide-react";

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const API_URL = `${API_BASE}/products`;

  // ✅ Fetch Product
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/${id}`);
        setProduct(data);
        if (data.category) fetchRelated(data.category, data._id);
      } catch (err) {
        console.error("❌ Error fetching product:", err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

// ✅ Fetch Related Products (only 3 random items)
const fetchRelated = async (category, currentId) => {
  try {
    const { data } = await axios.get(API_URL);
    const list = Array.isArray(data) ? data : data.products || [];

    const filtered = list.filter(
      (item) =>
        item._id !== currentId &&
        item.category?.toLowerCase() === category.toLowerCase()
    );

    // 🎯 Shuffle and pick any 3
    const randomThree = filtered
      .sort(() => Math.random() - 0.5) // simple shuffle
      .slice(0, 3);

    setRelated(randomThree);
  } catch (err) {
    console.error("❌ Error fetching related products:", err);
  }
};


  // ✅ Loading State
  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500">
        <Package size={42} className="animate-pulse mb-3" />
        <p className="text-lg">Loading product details...</p>
      </div>
    );

  // ✅ Product Not Found
  if (!product)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-600">
        <XCircle size={42} className="text-red-500 mb-2" />
        <h2 className="text-xl font-semibold mb-2">Product not found</h2>
        <Link
          to="/"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
        >
          Back to Products
        </Link>
      </div>
    );

  return (
    // 👇 Constrain width & center the whole page content
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Actions */}
      <div className="flex justify-between items-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition text-sm font-medium"
        >
          <ArrowLeft size={16} /> Back to Products
        </Link>

        <Link
          to={`/edit/${product._id}`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
        >
          <Edit size={16} /> Edit Product
        </Link>
      </div>

      {/* Main Product Card */}
      <div className="bg-white rounded-2xl shadow-md border border-slate-200/70 p-6 flex flex-col md:flex-row gap-8 w-full">
        {/* Image Section */}
        <div className="flex-shrink-0 w-full md:w-1/3 flex justify-center items-center">
          {product.image ? (
            <div className="relative group w-full max-w-xs">
              <img
                src={product.image}
                alt={product.name}
                className="w-full aspect-square object-cover rounded-2xl shadow-md border border-slate-200 group-hover:scale-[1.03] transition-transform duration-300"
              />
              {product.isTopSelling && (
                <span className="absolute top-3 left-3 bg-emerald-600 text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                  <CheckCircle size={12} /> Top Selling
                </span>
              )}
            </div>
          ) : (
            <div className="w-full max-w-xs aspect-square flex items-center justify-center bg-slate-100 text-slate-400 rounded-2xl border border-slate-200">
              No Image
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3 flex items-center gap-2 flex-wrap">
            <Layers className="text-blue-600" /> {product.name}
          </h1>

          <div className="flex flex-wrap gap-2 mb-4">
            <span className="inline-flex items-center gap-1 text-xs md:text-sm text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
              <Tag size={14} /> {product.category}
            </span>

            {product.subcategory && (
              <span className="inline-flex items-center gap-1 text-xs md:text-sm text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
                Sub: {product.subcategory}
              </span>
            )}

            {product.price && (
              <span className="inline-flex items-center gap-1 text-xs md:text-sm bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full">
                ₹{product.price}
              </span>
            )}

            <span className="inline-flex items-center gap-1 text-xs md:text-sm bg-amber-50 text-amber-700 px-3 py-1 rounded-full">
              Stock: {product.stock ?? "N/A"}
            </span>
          </div>

          <p className="text-slate-700 mb-5 leading-relaxed text-sm md:text-base">
            {product.description || "No description available."}
          </p>

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold text-slate-900 mb-2">Variants</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {product.variants.map((v, i) => (
                  <li
                    key={i}
                    className="p-3 border border-slate-200 rounded-lg bg-slate-50/80"
                  >
                    <div className="font-medium text-slate-900 text-sm">
                      {v.label}
                    </div>
                    <div className="text-slate-600 text-xs mt-1">
                      ₹{v.price} — {v.stock} in stock
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div className="mt-4">
          <h2 className="text-lg md:text-xl font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <Package className="text-blue-600" /> Related Products
          </h2>

          {/* 👇 Grid instead of one long row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {related.map((item) => (
              <Link
                key={item._id}
                to={`/product/${item._id}`}
                className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200"
              >
                <div className="h-40 w-full overflow-hidden rounded-t-xl bg-slate-100">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                      No Image
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-slate-900 text-sm truncate">
                    {item.name}
                  </h3>
                  {item.price && (
                    <p className="text-slate-600 text-xs mb-1">
                      ₹{item.price}
                    </p>
                  )}
                  <span className="text-blue-600 text-xs font-medium">
                    View Details →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
