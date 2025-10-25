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

  // ✅ Fetch Related Products
  const fetchRelated = async (category, currentId) => {
    try {
      const { data } = await axios.get(API_URL);
      const filtered = data.filter(
        (item) =>
          item._id !== currentId &&
          item.category?.toLowerCase() === category.toLowerCase()
      );
      setRelated(filtered);
    } catch (err) {
      console.error("❌ Error fetching related products:", err);
    }
  };

  // ✅ Loading State
  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-500">
        <Package size={42} className="animate-pulse mb-3" />
        <p className="text-lg">Loading product details...</p>
      </div>
    );

  // ✅ Product Not Found
  if (!product)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-600">
        <XCircle size={42} className="text-red-500 mb-2" />
        <h2 className="text-xl font-semibold mb-2">Product not found</h2>
        <Link
          to="/"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Back to Products
        </Link>
      </div>
    );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header Actions */}
      <div className="flex justify-between items-center mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
        >
          <ArrowLeft size={16} /> Back to Products
        </Link>

        <Link
          to={`/edit/${product._id}`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          <Edit size={16} /> Edit Product
        </Link>
      </div>

      {/* Main Product Card */}
      <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col md:flex-row gap-8 border border-gray-100">
        {/* Image Section */}
        <div className="flex-shrink-0 w-full md:w-1/3 flex justify-center items-center">
          {product.image ? (
            <div className="relative group">
              <img
                src={product.image}
                alt={product.name}
                className="w-72 h-72 object-cover rounded-lg shadow-md border border-gray-200 group-hover:scale-105 transition-transform duration-300"
              />
              {product.isTopSelling && (
                <span className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
                  <CheckCircle size={12} /> Top Selling
                </span>
              )}
            </div>
          ) : (
            <div className="w-72 h-72 flex items-center justify-center bg-gray-100 text-gray-400 rounded-lg">
              No Image
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Layers className="text-blue-600" /> {product.name}
          </h1>

          <div className="flex flex-wrap gap-3 mb-4">
            <span className="inline-flex items-center gap-1 text-sm text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
              <Tag size={14} /> {product.category}
            </span>
            <span className="inline-flex items-center gap-1 text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
              ₹{product.price}
            </span>
            <span className="inline-flex items-center gap-1 text-sm bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full">
              Stock: {product.stock || "N/A"}
            </span>
          </div>

          <p className="text-gray-700 mb-5 leading-relaxed">
            {product.description || "No description available."}
          </p>

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold text-gray-800 mb-2">Variants</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {product.variants.map((v, i) => (
                  <li
                    key={i}
                    className="p-3 border border-gray-200 rounded-md bg-gray-50"
                  >
                    <div className="font-medium text-gray-800">{v.label}</div>
                    <div className="text-gray-600 text-sm">
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
        <div className="mt-10">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Package className="text-blue-600" /> Related Products
          </h2>

          <div className="flex overflow-x-auto gap-6 pb-3 scrollbar-hide">
            {related.map((item) => (
              <Link
                key={item._id}
                to={`/product/${item._id}`}
                className="flex-shrink-0 w-56 bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-40 object-cover rounded-t-lg"
                />
                <div className="p-3">
                  <h3 className="font-semibold text-gray-800 truncate">
                    {item.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-1">₹{item.price}</p>
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
