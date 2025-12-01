import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Trash2,
  ImagePlus,
  Edit3,
  Save,
  X,
  FolderTree,
  Tag,
} from "lucide-react";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editImage, setEditImage] = useState(null);

  const [subName, setSubName] = useState({});
  const [addingSub, setAddingSub] = useState({});

  const API_BASE =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const API_URL = `${API_BASE}/categories`;

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(API_URL);
      setCategories(Array.isArray(data) ? data : data.categories || []);
    } catch (err) {
      console.error("❌ Error fetching categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    setImage(file || null);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const addCategory = async () => {
    if (!name.trim()) return alert("Please enter a category name!");

    const formData = new FormData();
    formData.append("name", name.trim());
    if (image) formData.append("image", image);

    try {
      setAdding(true);
      const { data } = await axios.post(API_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setCategories((prev) => [...prev, data]);
      setName("");
      setImage(null);
      setImagePreview(null);
    } catch (err) {
      alert(err.response?.data?.message || "Error adding category!");
    } finally {
      setAdding(false);
    }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      setCategories((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      alert("Failed to delete category!");
    }
  };

  const startEdit = (cat) => {
    setEditingId(cat._id);
    setEditName(cat.name);
    setEditImage(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditImage(null);
  };

  const saveEdit = async (id) => {
    if (!editName.trim()) return alert("Category name cannot be empty!");

    const formData = new FormData();
    formData.append("name", editName.trim());
    if (editImage) formData.append("image", editImage);

    try {
      const { data } = await axios.put(`${API_URL}/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setCategories((prev) => prev.map((c) => (c._id === id ? data : c)));
      cancelEdit();
    } catch (err) {
      alert("Failed to update category!");
    }
  };

  const addSubcategory = async (categoryId) => {
    const subcategoryName = subName[categoryId]?.trim();
    if (!subcategoryName) return alert("Enter subcategory name!");
    try {
      setAddingSub((prev) => ({ ...prev, [categoryId]: true }));
      const { data } = await axios.post(
        `${API_URL}/${categoryId}/subcategories`,
        { name: subcategoryName }
      );
      setCategories((prev) =>
        prev.map((cat) => (cat._id === categoryId ? data : cat))
      );
      setSubName((prev) => ({ ...prev, [categoryId]: "" }));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add subcategory!");
    } finally {
      setAddingSub((prev) => ({ ...prev, [categoryId]: false }));
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-blue-50 flex items-center justify-center">
            <FolderTree size={20} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-slate-900 flex items-center gap-2">
              Manage Categories
            </h1>
            <p className="text-xs md:text-sm text-slate-500">
              Create, update and organise categories with subcategories &
              images.
            </p>
          </div>
        </div>

        {loading && (
          <span className="inline-flex items-center gap-2 text-xs md:text-sm px-3 py-1.5 rounded-full bg-slate-100 text-slate-600">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Fetching categories...
          </span>
        )}
      </div>

      {/* ADD CATEGORY CARD */}
      <div className="bg-white border border-slate-200/70 rounded-2xl shadow-sm p-4 md:p-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Tag size={18} className="text-blue-600" />
            <h2 className="text-sm md:text-base font-semibold text-slate-900">
              Add New Category
            </h2>
          </div>
          {categories.length > 0 && (
            <span className="text-xs text-slate-500">
              Total:{" "}
              <span className="font-semibold text-slate-700">
                {categories.length}
              </span>
            </span>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          {/* Name input */}
          <div className="w-full lg:flex-1">
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              Category Name
            </label>
            <input
              type="text"
              placeholder="e.g., Cakes, Breads, Snacks..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50/50"
            />
          </div>

          {/* Upload + Preview */}
          <div className="flex items-center gap-4">
            <label className="cursor-pointer inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg border border-blue-100 text-xs md:text-sm text-blue-700 hover:bg-blue-100 transition">
              <ImagePlus size={16} />
              Upload Image
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
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
                  onClick={() => {
                    setImagePreview(null);
                    setImage(null);
                  }}
                  className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[10px] text-red-500 shadow-sm"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Add button */}
          <button
            onClick={addCategory}
            disabled={adding}
            className={`w-full lg:w-auto px-5 py-2.5 rounded-lg text-xs md:text-sm font-semibold text-white shadow-sm transition 
              ${
                adding
                  ? "bg-slate-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
          >
            {adding ? "Adding..." : "Add Category"}
          </button>
        </div>
      </div>

      {/* CATEGORY GRID */}
      <div className="bg-white border border-slate-200/70 rounded-2xl shadow-sm p-4 md:p-5">
        {categories.length === 0 ? (
          <div className="py-10 flex flex-col items-center justify-center text-slate-500 text-sm">
            {loading ? "Loading categories..." : "No categories created yet."}
          </div>
        ) : (
          <div className="grid gap-4 md:gap-5 md:grid-cols-2 xl:grid-cols-3">
            {categories.map((c) => (
              <div
                key={c._id}
                className="rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition shadow-sm p-4 flex flex-col gap-3"
              >
                {/* Top Row: Image + Name + Actions */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    {c.image ? (
                      <img
                        src={c.image}
                        alt={c.name}
                        className="w-14 h-14 object-cover rounded-xl border border-slate-200 shadow-sm"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl border border-dashed border-slate-300 flex items-center justify-center text-[11px] text-slate-400 bg-white">
                        No Image
                      </div>
                    )}

                    <div>
                      {editingId === c._id ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                        />
                      ) : (
                        <h3 className="text-sm md:text-base font-semibold text-slate-900">
                          {c.name}
                        </h3>
                      )}

                      {c.subcategories?.length > 0 && (
                        <p className="text-[11px] text-slate-500 mt-1">
                          {c.subcategories.length} subcategories
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 text-[11px]">
                    {editingId === c._id ? (
                      <>
                        <label className="cursor-pointer text-blue-600 flex items-center gap-1 hover:text-blue-700">
                          <ImagePlus size={14} />
                          <span>Change</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              setEditImage(e.target.files?.[0] || null)
                            }
                            className="hidden"
                          />
                        </label>
                        <div className="flex items-center gap-1 mt-1">
                          <button
                            onClick={() => saveEdit(c._id)}
                            className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700"
                          >
                            <Save size={14} />
                            <span>Save</span>
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-700"
                          >
                            <X size={14} />
                            <span>Cancel</span>
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(c)}
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700"
                        >
                          <Edit3 size={14} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => deleteCategory(c._id)}
                          className="inline-flex items-center gap-1 text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={14} />
                          <span>Remove</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Subcategories chips */}
                {c.subcategories?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {c.subcategories.map((sc, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 rounded-full bg-white border border-slate-200 text-[11px] text-slate-700"
                      >
                        {sc.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Add Subcategory inline */}
                <div className="pt-2 border-t border-slate-200 mt-2">
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="text"
                      placeholder="Add subcategory..."
                      value={subName[c._id] || ""}
                      onChange={(e) =>
                        setSubName((prev) => ({
                          ...prev,
                          [c._id]: e.target.value,
                        }))
                      }
                      className="flex-1 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                    />
                    <button
                      onClick={() => addSubcategory(c._id)}
                      disabled={addingSub[c._id]}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-medium text-white
                        ${
                          addingSub[c._id]
                            ? "bg-slate-400 cursor-not-allowed"
                            : "bg-emerald-600 hover:bg-emerald-700"
                        }`}
                    >
                      {addingSub[c._id] ? "Adding..." : "Add"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;
