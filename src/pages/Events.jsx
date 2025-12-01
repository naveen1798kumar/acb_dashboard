import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  CalendarDays,
  Edit3,
  Trash2,
  ArrowRight,
  PlusCircle,
  Loader2,
  CheckCircle2,
  XCircle,
  ImagePlus,
} from "lucide-react";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  const navigate = useNavigate();
  const API_BASE =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const API_URL = `${API_BASE}/events`;

  // ✅ Fetch events
  const fetchEvents = async () => {
    try {
      setInitialLoading(true);
      const { data } = await axios.get(API_URL);
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Error fetching events:", err);
      setEvents([]);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ Create / Update Event
  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    const { name, description, startDate, endDate, image } = formData;
    if (!name.trim()) return alert("Event name is required!");

    const form = new FormData();
    form.append("name", name.trim());
    form.append("description", description || "");
    if (startDate) form.append("startDate", startDate);
    if (endDate) form.append("endDate", endDate);
    if (image) form.append("image", image);

    try {
      setLoading(true);
      if (editingEvent) {
        await axios.put(`${API_URL}/${editingEvent._id}`, form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("✅ Event updated successfully!");
      } else {
        await axios.post(API_URL, form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("✅ Event added successfully!");
      }
      resetForm();
      fetchEvents();
    } catch (err) {
      console.error("❌ Error saving event:", err);
      alert("Failed to save event.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      startDate: "",
      endDate: "",
      image: null,
    });
    setImagePreview(null);
    setEditingEvent(null);
  };

  // ✅ Delete Event
  const deleteEvent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      setEvents((prev) => prev.filter((e) => e._id !== id));
    } catch (err) {
      console.error("❌ Error deleting event:", err);
      alert("Failed to delete event.");
    }
  };

  // ✅ Toggle Event Activation
  const toggleActive = async (event) => {
    try {
      const updated = { ...event, isActive: !event.isActive };
      await axios.put(`${API_URL}/${event._id}`, {
        isActive: updated.isActive,
      });
      setEvents((prev) =>
        prev.map((e) => (e._id === event._id ? updated : e))
      );
    } catch (err) {
      console.error("❌ Error toggling event:", err);
    }
  };

  // ✅ Edit Event
  const startEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      name: event.name || "",
      description: event.description || "",
      startDate: event.startDate?.split("T")[0] || "",
      endDate: event.endDate?.split("T")[0] || "",
      image: null,
    });
    setImagePreview(event.image || null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ✅ Cancel Editing
  const cancelEdit = () => {
    resetForm();
  };

  const handleImageChange = (file) => {
    setFormData((prev) => ({ ...prev, image: file || null }));
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-blue-50 flex items-center justify-center">
            <CalendarDays className="text-blue-600" size={20} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
              Events & Campaigns
            </h1>
            <p className="text-xs md:text-sm text-slate-500">
              Create seasonal offers and link products to highlight on the
              storefront.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs md:text-sm text-slate-500">
          <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200">
            Total events:{" "}
            <span className="font-semibold text-slate-800">
              {events.length}
            </span>
          </span>
          {initialLoading && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100">
              <Loader2 size={14} className="animate-spin" />
              Loading
            </span>
          )}
        </div>
      </div>

      {/* CREATE / EDIT EVENT FORM */}
      <div className="bg-white border border-slate-200/70 rounded-2xl shadow-sm p-5 md:p-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm md:text-base font-semibold text-slate-900 flex items-center gap-2">
              {editingEvent ? (
                <>
                  <Edit3 size={16} /> Edit Event
                </>
              ) : (
                <>
                  <PlusCircle size={16} /> Add New Event
                </>
              )}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Set up banners and time-limited offers to boost conversions.
            </p>
          </div>

          {editingEvent && (
            <button
              onClick={cancelEdit}
              className="text-xs md:text-sm text-slate-500 hover:text-red-600"
            >
              Cancel edit
            </button>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-600">
              Event Name
            </label>
            <input
              type="text"
              placeholder="e.g., Diwali Offers, Weekend Sale..."
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50/60"
            />
          </div>

          <div className="flex flex-col gap-1.5 md:col-span-1 lg:col-span-1">
            <label className="text-xs font-medium text-slate-600">
              Short Description
            </label>
            <input
              type="text"
              placeholder="Describe the offer in one line"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50/60"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-600">
              Start Date
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  startDate: e.target.value,
                }))
              }
              className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50/60"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-600">
              End Date
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  endDate: e.target.value,
                }))
              }
              className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50/60"
            />
          </div>

          {/* Image + preview */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-600">
              Event Banner
            </label>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-blue-100 bg-blue-50 text-xs text-blue-700 hover:bg-blue-100 transition">
                <ImagePlus size={16} />
                Upload Image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageChange(e.target.files?.[0])}
                />
              </label>

              {imagePreview && (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="preview"
                    className="w-14 h-14 object-cover rounded-xl border border-slate-200 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => handleImageChange(null)}
                    className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[10px] text-red-500 shadow-sm"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Submit button */}
          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className={`w-full md:w-auto px-5 py-2.5 rounded-lg text-xs md:text-sm font-semibold text-white shadow-sm mt-2 md:mt-0
                ${
                  loading
                    ? "bg-slate-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" /> Saving...
                </span>
              ) : editingEvent ? (
                "Update Event"
              ) : (
                "Add Event"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* EVENTS GRID */}
      {events.length === 0 ? (
        <div className="bg-white border border-slate-200/70 rounded-2xl shadow-sm py-14 flex flex-col items-center justify-center text-slate-500 text-sm">
          <PlusCircle size={32} className="mb-2 text-slate-300" />
          <p>
            {initialLoading
              ? "Loading events..."
              : "No events yet. Create one using the form above."}
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {events.map((event) => {
            const starts =
              event.startDate &&
              new Date(event.startDate).toLocaleDateString();
            const ends =
              event.endDate &&
              new Date(event.endDate).toLocaleDateString();

            return (
              <div
                key={event._id}
                className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col hover:shadow-md hover:-translate-y-[2px] transition-all duration-200"
              >
                {event.image && (
                  <div className="h-40 w-full overflow-hidden bg-slate-100">
                    <img
                      src={event.image}
                      alt={event.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                )}

                <div className="p-4 flex-1 flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm md:text-base font-semibold text-slate-900">
                        {event.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {event.description || "No description"}
                      </p>
                    </div>

                    {/* Active toggle */}
                    <button
                      onClick={() => toggleActive(event)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition
                        ${
                          event.isActive ? "bg-emerald-500" : "bg-slate-300"
                        }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition
                          ${
                            event.isActive
                              ? "translate-x-[18px]"
                              : "translate-x-[2px]"
                          }`}
                      />
                    </button>
                  </div>

                  {(starts || ends) && (
                    <div className="flex flex-wrap items-center gap-1 text-[11px] text-slate-500 mt-1">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100">
                        <CalendarDays size={12} />
                        {starts || "Ongoing"}{" "}
                        <span className="mx-1">→</span>
                        {ends || "No end date"}
                      </span>
                    </div>
                  )}

                  <p className="text-[11px] text-slate-500 mt-1">
                    Products linked:{" "}
                    <span className="font-semibold text-slate-700">
                      {event.products?.length || 0}
                    </span>
                  </p>

                  <div className="flex items-center justify-between mt-3">
                    <button
                      onClick={() =>
                        navigate(`/events/${event._id}/manage`)
                      }
                      className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
                    >
                      Manage
                      <ArrowRight size={14} />
                    </button>
                    <div className="flex items-center gap-3 text-slate-500">
                      <button
                        onClick={() => startEdit(event)}
                        className="hover:text-blue-600"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button
                        onClick={() => deleteEvent(event._id)}
                        className="hover:text-red-600"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Footer status bar */}
                <div
                  className={`text-center py-1.5 text-[11px] font-medium border-t border-slate-100
                    ${
                      event.isActive
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                >
                  {event.isActive ? (
                    <span className="inline-flex items-center justify-center gap-1">
                      <CheckCircle2 size={12} /> Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center justify-center gap-1">
                      <XCircle size={12} /> Inactive
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Events;
