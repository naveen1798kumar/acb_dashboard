// dashboard/src/pages/OrderDetails.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  User2,
  MapPin,
  Package,
  CreditCard,
  ClipboardList,
  Truck,
  ImageOff,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:10000/api";

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      if (!token) {
        setError("Not authenticated as admin");
        setLoading(false);
        return;
      }

      const { data } = await axios.get(`${API_BASE}/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const o = data.order || data; // support { order } or plain object

      setOrder(o);
      setStatus(o.status || "created");
    } catch (err) {
      console.error("Fetch order error", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async () => {
    try {
      setSaving(true);
      setError("");

      const token = localStorage.getItem("token");
      if (!token) {
        setError("Not authenticated as admin");
        setSaving(false);
        return;
      }

      await axios.put(
        `${API_BASE}/orders/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Order status updated");
      fetchOrder();
    } catch (err) {
      console.error("Update status error", err.response?.data || err.message);
      alert(err.response?.data?.message || "Failed to update status");
    } finally {
      setSaving(false);
    }
  };

  // ---------- UI STATES ----------

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-500">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="animate-spin" size={28} />
          <p className="text-sm">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <div className="bg-red-50 border border-red-200 text-red-800 text-sm rounded-2xl px-4 py-3">
          {error}
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <p className="text-sm text-slate-600">Order not found.</p>
      </div>
    );
  }

  // ---------- DATA DERIVED FROM ORDER ----------

  const customer = order.customer || {};
  const address = customer.address || order.shippingAddress || {};
  const items = order.items || order.cartItems || [];

  const subtotal = order.subtotal ?? order.subTotal ?? 0;
  const total = order.total ?? order.totalAmount ?? 0;
  const paymentStatus = order.paymentStatus || "pending";

  const statusColorMap = {
    created: "bg-slate-100 text-slate-700 border-slate-200",
    confirmed: "bg-blue-50 text-blue-700 border-blue-200",
    packed: "bg-amber-50 text-amber-700 border-amber-200",
    shipped: "bg-indigo-50 text-indigo-700 border-indigo-200",
    delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
    cancelled: "bg-red-50 text-red-700 border-red-200",
  };

  const paymentColorMap = {
    paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    failed: "bg-red-50 text-red-700 border-red-200",
  };

  const statusChip =
    statusColorMap[order.status] || statusColorMap["created"];
  const paymentChip =
    paymentColorMap[paymentStatus] || paymentColorMap["pending"];

  return (
    <div className="space-y-6">
      {/* TOP BAR */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 w-fit"
        >
          <ArrowLeft size={16} />
          Back to orders
        </button>

        <div className="flex flex-wrap items-center gap-2 md:justify-end">
          <span className="text-xs md:text-sm text-slate-600">
            Order ID:
            <span className="font-mono ml-1 text-slate-900">
              {order._id}
            </span>
          </span>
          <span
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-medium ${statusChip}`}
          >
            <Truck size={14} />
            {order.status || "created"}
          </span>
          <span
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-medium ${paymentChip}`}
          >
            <CreditCard size={14} />
            {paymentStatus}
          </span>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* LEFT: CUSTOMER + SHIPPING */}
        <div className="space-y-4 lg:col-span-1">
          {/* Customer */}
          <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-xl bg-slate-100 flex items-center justify-center">
                <User2 size={18} className="text-slate-700" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">
                Customer
              </h3>
            </div>

            <div className="space-y-1 text-sm">
              <p className="font-medium text-slate-900">
                {customer.name || "N/A"}
              </p>
              <p className="text-slate-600">
                {customer.phone || customer.mobile || "No phone"}
              </p>
              <p className="text-slate-600">
                {customer.email || "No email"}
              </p>
            </div>
          </div>

          {/* Address */}
          <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-xl bg-slate-100 flex items-center justify-center">
                <MapPin size={18} className="text-slate-700" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">
                Shipping Address
              </h3>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed">
              {address.line1 || address.addressLine1 || "No address"}
              {address.city && `, ${address.city}`}
              {address.pincode && ` - ${address.pincode}`}
            </p>
          </div>
        </div>

        {/* RIGHT: ORDER SUMMARY / STATUS UPDATE / ITEMS */}
        <div className="space-y-4 lg:col-span-2">
          {/* Order Info */}
          <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-xl bg-slate-100 flex items-center justify-center">
                <ClipboardList size={18} className="text-slate-700" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">
                Order Summary
              </h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">
                  Subtotal
                </p>
                <p className="font-semibold text-slate-900">
                  ₹{subtotal}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">
                  Shipping
                </p>
                <p className="font-semibold text-slate-900">
                  ₹{order.shipping ?? 0}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">
                  Total
                </p>
                <p className="font-semibold text-slate-900">
                  ₹{total}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">
                  Created
                </p>
                <p className="text-slate-800">
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleString()
                    : "N/A"}
                </p>
              </div>
            </div>

            {/* Status update */}
            <div className="mt-5 border-t border-slate-100 pt-4">
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Update order status
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50/60 flex-1"
                >
                  <option value="created">created</option>
                  <option value="confirmed">confirmed</option>
                  <option value="packed">packed</option>
                  <option value="shipped">shipped</option>
                  <option value="delivered">delivered</option>
                  <option value="cancelled">cancelled</option>
                </select>
                <button
                  onClick={updateStatus}
                  disabled={saving}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2
                    ${
                      saving
                        ? "bg-slate-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                >
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>

          {/* ITEMS WITH IMAGES */}
          <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-xl bg-slate-100 flex items-center justify-center">
                <Package size={18} className="text-slate-700" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">
                Items ({items.length})
              </h3>
            </div>

            {items.length === 0 ? (
              <p className="text-xs md:text-sm text-slate-500">
                No items found for this order.
              </p>
            ) : (
              <div className="space-y-3">
                {items.map((it, idx) => {
                  const qty = it.qty || it.quantity || 1;
                  const price = it.price || 0;
                  const lineTotal = price * qty;
                  const imageSrc = it.image || it.product?.image || null;

                  return (
                    <div
                      key={it._id || it.productId || idx}
                      className="flex gap-3 border border-slate-100 rounded-xl p-3 items-center"
                    >
                      {/* THUMBNAIL */}
                      <div className="h-14 w-14 flex-shrink-0 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
                        {imageSrc ? (
                          <img
                            src={imageSrc}
                            alt={it.name || it.product?.name || "Product"}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <ImageOff size={18} className="text-slate-400" />
                        )}
                      </div>

                      {/* TEXT INFO */}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-900 truncate">
                          {it.name || it.product?.name || "Product"}
                        </div>
                        {it.variantLabel && (
                          <div className="text-[11px] text-slate-500">
                            {it.variantLabel}
                          </div>
                        )}
                      </div>

                      {/* PRICE / QTY / TOTAL */}
                      <div className="flex flex-col items-end text-xs md:text-sm gap-0.5">
                        <span className="text-slate-700">₹{price}</span>
                        <span className="text-slate-500">× {qty}</span>
                        <span className="font-semibold text-slate-900">
                          ₹{lineTotal}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
