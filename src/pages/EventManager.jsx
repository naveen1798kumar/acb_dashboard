import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import AddProduct from "./AddProduct";

const EventManager = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [products, setProducts] = useState([]);
  const [linkedProducts, setLinkedProducts] = useState([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [categories, setCategories] = useState([]);

  const API_BASE = import.meta.env.VITE_API_URL;

  // Fetch event, products, categories
  const fetchEventAndProducts = async () => {
    try {
      setLoading(true);
      const [eventRes, productsRes, categoriesRes] = await Promise.all([
        axios.get(`${API_BASE}/events/${id}`),
        axios.get(`${API_BASE}/products`),
        axios.get(`${API_BASE}/categories`)
      ]);

      const eventData = eventRes.data;
      const allProducts = Array.isArray(productsRes.data)
        ? productsRes.data
        : productsRes.data.products || [];
      const allCategories = Array.isArray(categoriesRes.data)
        ? categoriesRes.data
        : categoriesRes.data.categories || [];

      setEvent(eventData);

      // Get IDs of products linked to this event
      const eventProductIds = eventData.products ? eventData.products.map((p) => p._id) : [];
      setLinkedProducts(eventProductIds);

      setProducts(allProducts);
      setCategories(["All", ...allCategories.map(c => c.name)]);
    } catch (err) {
      console.error("❌ Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventAndProducts();
  }, [id]);

  // Toggle link/unlink product for this event
  const handleProductToggle = (productId) => {
    setLinkedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((pid) => pid !== productId)
        : [...prev, productId]
    );
  };

  // Save linked products to event
  const handleSaveLinks = async () => {
    try {
      await axios.put(`${API_BASE}/events/${id}`, { products: linkedProducts });
      alert("✅ Event updated successfully!");
      setDropdownOpen(false);
      fetchEventAndProducts();
    } catch (err) {
      console.error("❌ Error saving linked products:", err);
      alert("Failed to update event products.");
    }
  };

  // Products already linked to this event
  const eventProducts = products.filter((p) => linkedProducts.includes(p._id));
  // Products not yet linked (for dropdown)
  const selectableProducts = products.filter((p) => !linkedProducts.includes(p._id));

  // Filter by category and search
  const filterProducts = (list) =>
    list.filter((p) =>
      (category === "All" || p.category === category) &&
      p.name.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">
        Manage Event: {event?.name || "Loading..."}
      </h1>

      {/* Add / Edit Product */}
      <button
        onClick={() => {
          setShowAddProduct(!showAddProduct);
          setEditProduct(null);
        }}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        {showAddProduct ? "Hide Form" : "Add New Product"}
      </button>

      {showAddProduct && (
        <AddProduct
          onProductAdded={fetchEventAndProducts}
          isInlineAdd={true}
          eventId={id}
          editProduct={editProduct}
          onCancelEdit={() => {
            setEditProduct(null);
            setShowAddProduct(false);
          }}
        />
      )}

      {/* Dropdown for selecting products */}
      <div className="mb-6">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          {dropdownOpen ? "Close Product List" : "Select Products to Add"}
        </button>
        {dropdownOpen && (
          <div className="mt-2 border rounded bg-white shadow p-4 max-h-[32rem] overflow-y-auto">
            {/* Search and Category Filter */}
            <div className="flex gap-4 mb-4">
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="border p-2 rounded w-full"
              />
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="border p-2 rounded"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            {/* Already added products */}
            <h3 className="font-semibold mb-2 text-blue-700">Already Added to Event</h3>
            {filterProducts(eventProducts).length === 0 ? (
              <p className="text-gray-400 mb-4">No products added yet.</p>
            ) : (
              filterProducts(eventProducts).map((p) => (
                <div key={p._id} className="flex items-center gap-3 mb-2 border-b pb-2">
                  <input
                    type="checkbox"
                    checked={linkedProducts.includes(p._id)}
                    onChange={() => handleProductToggle(p._id)}
                  />
                  {p.image && (
                    <img src={p.image} alt={p.name} className="h-10 w-10 object-cover rounded" />
                  )}
                  <span className="font-medium">{p.name}</span>
                  <span className="text-xs text-gray-400">({p.category})</span>
                </div>
              ))
            )}
            {/* Products not yet added */}
            <h3 className="font-semibold mt-4 mb-2 text-green-700">Available Products</h3>
            {filterProducts(selectableProducts).length === 0 ? (
              <p className="text-gray-400">No products available to add.</p>
            ) : (
              filterProducts(selectableProducts).map((p) => (
                <div key={p._id} className="flex items-center gap-3 mb-2 border-b pb-2">
                  <input
                    type="checkbox"
                    checked={linkedProducts.includes(p._id)}
                    onChange={() => handleProductToggle(p._id)}
                  />
                  {p.image && (
                    <img src={p.image} alt={p.name} className="h-10 w-10 object-cover rounded" />
                  )}
                  <span className="font-medium">{p.name}</span>
                  <span className="text-xs text-gray-400">({p.category})</span>
                </div>
              ))
            )}
            <button
              onClick={handleSaveLinks}
              className="mt-4 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              💾 Save Selected Products
            </button>
          </div>
        )}
      </div>

      {/* Products already added to this event */}
      <h2 className="text-lg font-semibold mb-3 mt-6">
        🛍️ Products Added to This Event
      </h2>
      {eventProducts.length === 0 ? (
        <p className="text-gray-500">No products added to this event yet.</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {eventProducts.map((p) => (
            <div
              key={p._id}
              className="bg-white border rounded-lg shadow p-3 flex flex-col"
            >
              {p.image && (
                <img
                  src={p.image}
                  alt={p.name}
                  className="h-32 w-full object-cover rounded mb-2"
                />
              )}
              <h3 className="font-semibold text-gray-800">{p.name}</h3>
              <p className="text-sm text-gray-500 mb-2">
                ₹{p.price} • {p.stock || 0} in stock
              </p>
              <p className="text-xs text-gray-400 mb-2">
                Category: {p.category}
              </p>
              <div className="flex justify-between items-center mt-auto">
                <label className="flex items-center gap-1 text-sm">
                  <input
                    type="checkbox"
                    checked={linkedProducts.includes(p._id)}
                    onChange={() => handleProductToggle(p._id)}
                  />
                  Linked
                </label>
                <button
                  onClick={() => {
                    setEditProduct(p);
                    setShowAddProduct(true);
                  }}
                  className="text-blue-600 text-sm hover:underline"
                >
                  ✏️ Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventManager;