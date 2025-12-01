import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  CalendarDays,
  Sparkles,
  Search,
  Filter,
  Link2,
  Link2Off,
  ChevronDown,
  ChevronUp,
  Edit3,
} from "lucide-react";
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

  const API_BASE =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  // Fetch event, products, categories
  const fetchEventAndProducts = async () => {
    try {
      setLoading(true);
      const [eventRes, productsRes, categoriesRes] = await Promise.all([
        axios.get(`${API_BASE}/events/${id}`),
        axios.get(`${API_BASE}/products`),
        axios.get(`${API_BASE}/categories`),
      ]);

      const eventData = eventRes.data;
      const allProducts = Array.isArray(productsRes.data)
        ? productsRes.data
        : productsRes.data.products || [];
      const allCategories = Array.isArray(categoriesRes.data)
        ? categoriesRes.data
        : categoriesRes.data.categories || [];

      setEvent(eventData);

      // IDs of products linked to this event
      const eventProductIds = eventData.products
        ? eventData.products.map((p) => p._id)
        : [];
      setLinkedProducts(eventProductIds);

      setProducts(allProducts);
      setCategories(["All", ...allCategories.map((c) => c.name)]);
    } catch (err) {
      console.error("❌ Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventAndProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      await axios.put(`${API_BASE}/events/${id}`, {
        products: linkedProducts,
      });
      alert("✅ Event updated successfully!");
      setDropdownOpen(false);
      fetchEventAndProducts();
    } catch (err) {
      console.error("❌ Error saving linked products:", err);
      alert("Failed to update event products.");
    }
  };

  // Products already linked to this event
  const eventProducts = products.filter((p) =>
    linkedProducts.includes(p._id)
  );
  // Products not yet linked (for dropdown)
  const selectableProducts = products.filter(
    (p) => !linkedProducts.includes(p._id)
  );

  // Filter by category and search
  const filterProducts = (list) =>
    list.filter(
      (p) =>
        (category === "All" || p.category === category) &&
        p.name.toLowerCase().includes(search.toLowerCase())
    );

  const starts =
    event?.startDate &&
    new Date(event.startDate).toLocaleDateString();
  const ends =
    event?.endDate && new Date(event.endDate).toLocaleDateString();

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-indigo-50 flex items-center justify-center">
            <Sparkles size={20} className="text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-slate-900 flex items-center gap-2 flex-wrap">
              Manage Event
              {event?.name && (
                <span className="px-2.5 py-1 rounded-full text-[11px] bg-slate-100 text-slate-700 border border-slate-200">
                  {event.name}
                </span>
              )}
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-0.5">
              Link or unlink products for this campaign and create
              event-only items.
            </p>
            {(starts || ends) && (
              <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200">
                  <CalendarDays size={12} />
                  {starts || "Ongoing"} <span className="mx-1">→</span>
                  {ends || "No end date"}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs md:text-sm text-slate-500">
          <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200">
            Linked products:{" "}
            <span className="font-semibold text-slate-800">
              {eventProducts.length}
            </span>
          </span>
          {loading && (
            <span className="px-2.5 py-1 rounded-full bg-slate-100">
              Loading...
            </span>
          )}
        </div>
      </div>

      {/* INLINE ADD / EDIT PRODUCT */}
      <div className="bg-white border border-slate-200/70 rounded-2xl shadow-sm p-4 md:p-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Edit3 size={16} className="text-blue-600" />
            <h2 className="text-sm md:text-base font-semibold text-slate-900">
              {showAddProduct
                ? "Add / Edit Event Product"
                : "Create Product for this Event"}
            </h2>
          </div>
          <button
            onClick={() => {
              setShowAddProduct((prev) => !prev);
              setEditProduct(null);
            }}
            className="text-xs md:text-sm px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700"
          >
            {showAddProduct ? "Hide form" : "Add new product"}
          </button>
        </div>

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
      </div>

      {/* PRODUCT SELECTION DROPDOWN */}
      <div className="bg-white border border-slate-200/70 rounded-2xl shadow-sm p-4 md:p-5 space-y-4">
        <button
          onClick={() => setDropdownOpen((prev) => !prev)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs md:text-sm text-slate-700"
        >
          <span className="inline-flex items-center gap-2">
            {dropdownOpen ? <Link2Off size={16} /> : <Link2 size={16} />}
            {dropdownOpen
              ? "Close product selector"
              : "Select products to link with this event"}
          </span>
          {dropdownOpen ? (
            <ChevronUp size={16} />
          ) : (
            <ChevronDown size={16} />
          )}
        </button>

        {dropdownOpen && (
          <div className="mt-2 border border-slate-200 rounded-2xl bg-white shadow-sm p-4 max-h-[32rem] overflow-y-auto space-y-4">
            {/* Search and Category Filter */}
            <div className="flex flex-col md:flex-row gap-3 md:items-center">
              <div className="flex items-center gap-2 flex-1">
                <div className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center">
                  <Search size={16} className="text-slate-500" />
                </div>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50/60"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-slate-500" />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50/60 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Already added products */}
            <div>
              <h3 className="text-xs md:text-sm font-semibold text-blue-700 mb-2 flex items-center gap-1">
                <Link2 size={14} /> Already linked to event
              </h3>
              {filterProducts(eventProducts).length === 0 ? (
                <p className="text-[11px] text-slate-400 mb-4">
                  No products linked yet.
                </p>
              ) : (
                <div className="space-y-2 mb-4">
                  {filterProducts(eventProducts).map((p) => (
                    <div
                      key={p._id}
                      className="flex items-center gap-3 border-b border-slate-100 pb-2 last:border-b-0"
                    >
                      <input
                        type="checkbox"
                        checked={linkedProducts.includes(p._id)}
                        onChange={() => handleProductToggle(p._id)}
                      />
                      {p.image && (
                        <img
                          src={p.image}
                          alt={p.name}
                          className="h-9 w-9 object-cover rounded-lg border border-slate-200"
                        />
                      )}
                      <div className="flex-1">
                        <div className="text-xs font-medium text-slate-800">
                          {p.name}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {p.category}
                        </div>
                      </div>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                        Linked
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Products not yet added */}
              <h3 className="text-xs md:text-sm font-semibold text-emerald-700 mb-2 flex items-center gap-1">
                <Link2Off size={14} /> Available to link
              </h3>
              {filterProducts(selectableProducts).length === 0 ? (
                <p className="text-[11px] text-slate-400">
                  No more products available for this filter.
                </p>
              ) : (
                <div className="space-y-2">
                  {filterProducts(selectableProducts).map((p) => (
                    <div
                      key={p._id}
                      className="flex items-center gap-3 border-b border-slate-100 pb-2 last:border-b-0"
                    >
                      <input
                        type="checkbox"
                        checked={linkedProducts.includes(p._id)}
                        onChange={() => handleProductToggle(p._id)}
                      />
                      {p.image && (
                        <img
                          src={p.image}
                          alt={p.name}
                          className="h-9 w-9 object-cover rounded-lg border border-slate-200"
                        />
                      )}
                      <div className="flex-1">
                        <div className="text-xs font-medium text-slate-800">
                          {p.name}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {p.category}
                        </div>
                      </div>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        Not linked
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleSaveLinks}
              className="mt-4 px-5 py-2 rounded-lg bg-emerald-600 text-white text-xs md:text-sm font-semibold hover:bg-emerald-700"
            >
              💾 Save selected products
            </button>
          </div>
        )}
      </div>

      {/* PRODUCTS ALREADY ADDED TO THIS EVENT */}
      <div className="space-y-2">
        <h2 className="text-sm md:text-base font-semibold text-slate-900 flex items-center gap-2">
          🛍️ Products linked to this event
        </h2>
        {eventProducts.length === 0 ? (
          <p className="text-xs md:text-sm text-slate-500">
            No products linked yet. Use the selector above to add products.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {eventProducts.map((p) => (
              <div
                key={p._id}
                className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-3 flex flex-col gap-2"
              >
                {p.image && (
                  <img
                    src={p.image}
                    alt={p.name}
                    className="h-32 w-full object-cover rounded-xl border border-slate-200 mb-1"
                  />
                )}
                <h3 className="text-sm font-semibold text-slate-900">
                  {p.name}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Category: {p.category}
                </p>
                <p className="text-[11px] text-slate-500 mb-1">
                  ₹{p.price} • {p.stock || 0} in stock
                </p>

                <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100">
                  <label className="flex items-center gap-1 text-[11px] text-slate-600">
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
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="text-[11px] text-blue-600 hover:underline inline-flex items-center gap-1"
                  >
                    <Edit3 size={12} />
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventManager;
