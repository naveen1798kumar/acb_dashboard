// src/pages/AddProduct.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  PackagePlus,
  Tags,
  ImageUp,
  ListPlus,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";

const AddProduct = ({
  onProductAdded,
  isInlineAdd = false,
  eventId = null,
  onCancelEdit = null,
}) => {
  const { id } = useParams(); // Edit mode if id exists in URL
  const navigate = useNavigate();

  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState({
    name: "",
    category: "",
    subcategory: "",
    newSubcategory: "",
    description: "",
    image: null,
    isTopSelling: false,
  });

  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [variants, setVariants] = useState([
    { label: "", price: "", stock: "" },
  ]);

  const API_BASE =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  // 🔹 Fetch categories
  useEffect(() => {
    const fetchCategoriesData = async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/categories`);
        if (Array.isArray(data)) setCategories(data);
        else if (Array.isArray(data.categories)) setCategories(data.categories);
      } catch (err) {
        console.error("❌ Error fetching categories:", err);
        toast.error("Failed to load categories.");
      }
    };
    fetchCategoriesData();
  }, [API_BASE]);

  // 🔹 Fetch product in edit mode
  useEffect(() => {
    if (id) {
      const fetchProduct = async () => {
        try {
          const { data } = await axios.get(`${API_BASE}/products/${id}`);
          setEditProduct(data);
        } catch (err) {
          console.error("❌ Error fetching product:", err);
          toast.error("Failed to load product for editing.");
        }
      };
      fetchProduct();
    }
  }, [id, API_BASE]);

  // 🔹 Prefill form if editing / inline add
  useEffect(() => {
    if (editProduct && categories.length > 0) {
      const categoryObj = categories.find(
        (cat) => cat.name === editProduct.category
      );

      setForm({
        name: editProduct.name || "",
        category: editProduct.category || "",
        subcategory: categoryObj?.subcategories?.some(
          (sub) => sub.name === editProduct.subcategory
        )
          ? editProduct.subcategory
          : "",
        newSubcategory: "",
        description: editProduct.description || "",
        image: null,
        isTopSelling: editProduct.isTopSelling || false,
      });

      setVariants(
        editProduct.variants?.length
          ? editProduct.variants
          : [{ label: "", price: "", stock: "" }]
      );
      setImagePreview(editProduct.image || null);
    } else if (isInlineAdd) {
      setForm((f) => ({ ...f, category: "Special Events" }));
    }
  }, [editProduct, categories, isInlineAdd]);

  // 🔹 Generic change handler
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "file" && files?.[0]) {
      setForm((prev) => ({ ...prev, image: files[0] }));
      setImagePreview(URL.createObjectURL(files[0]));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // 🔹 Variant helpers
  const handleVariantChange = (i, field, value) => {
    setVariants((prev) =>
      prev.map((v, idx) => (idx === i ? { ...v, [field]: value } : v))
    );
  };

  const addVariant = () =>
    setVariants((prev) => [...prev, { label: "", price: "", stock: "" }]);

  const removeVariant = (i) =>
    setVariants((prev) => prev.filter((_, idx) => idx !== i));

  // 🔹 Add new category
  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      toast.error("Enter a valid category name.");
      return;
    }
    try {
      const { data } = await axios.post(`${API_BASE}/categories`, {
        name: newCategory.trim(),
      });
      setCategories((prev) => [...prev, data]);
      setNewCategory("");
      toast.success("Category added successfully.");
    } catch (error) {
      console.error("❌ Error adding category:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to add category. It might already exist."
      );
    }
  };

  // 🔹 Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();

      Object.entries(form).forEach(([k, v]) => {
        if (k === "newSubcategory") return; // not sent as field
        if (v !== null && v !== undefined) formData.append(k, v);
      });

      formData.append("variants", JSON.stringify(variants));
      if (eventId) formData.append("eventId", eventId);

      let response;

      if (editProduct?._id) {
        response = await axios.put(
          `${API_BASE}/products/${editProduct._id}`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        toast.success("Product updated successfully.");
      } else {
        response = await axios.post(`${API_BASE}/products`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Product added successfully.");
      }

      // Link new product to event if inline add
      if (isInlineAdd && eventId && response?.data?._id && !editProduct?._id) {
        try {
          await axios.put(`${API_BASE}/events/${eventId}`, {
            $push: { products: response.data._id },
          });
        } catch (err) {
          console.error("❌ Error linking product to event:", err);
          toast.error("Product saved, but failed to link to event.");
        }
      }

      // Reset form
      setForm({
        name: "",
        category: isInlineAdd ? "Special Events" : "",
        subcategory: "",
        newSubcategory: "",
        description: "",
        image: null,
        isTopSelling: false,
      });
      setVariants([{ label: "", price: "", stock: "" }]);
      setImagePreview(null);

      onProductAdded?.();
      onCancelEdit?.();
      if (id && !isInlineAdd) navigate("/");
    } catch (error) {
      console.error("❌ Error saving product:", error);
      toast.error(
        error.response?.data?.message || "Failed to save product. Try again."
      );
    }
  };

  // 🔹 Current category object (for subcategories)
  const currentCategoryObj = categories.find(
    (cat) => cat.name === form.category
  );

  return (
    <div
      className={`rounded-2xl border shadow-sm ${
        isInlineAdd
          ? "bg-white p-5"
          : "bg-slate-50 p-6 max-w-3xl mx-auto mt-6"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <PackagePlus className="text-blue-600" size={20} />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-semibold text-slate-900 flex items-center gap-2">
              {editProduct ? "Edit Product" : "Add New Product"}
              {!editProduct && (
                <Sparkles className="text-amber-500" size={16} />
              )}
            </h2>
            <p className="text-xs md:text-sm text-slate-500">
              {editProduct
                ? "Update details, variants and category mapping."
                : "Create a new product with variants, image and categories."}
            </p>
          </div>
        </div>

        {editProduct && onCancelEdit && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="text-xs md:text-sm text-slate-500 hover:text-red-500 font-medium"
          >
            Cancel
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Basic Info */}
        <section className="bg-white rounded-2xl border border-slate-200/70 p-4 md:p-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <ListPlus size={16} className="text-blue-600" />
            Basic Details
          </h3>

          <div className="grid md:grid-cols-1 gap-4">
            {/* Product Name */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Product Name<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter product name"
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50/50"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Write a short description..."
                rows={3}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50/50 resize-none"
              />
            </div>
          </div>
        </section>

        {/* 2. Category / Subcategory */}
        <section className="bg-white rounded-2xl border border-slate-200/70 p-4 md:p-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Tags size={16} className="text-blue-600" />
            Categories & Subcategories
          </h3>

          {isInlineAdd ? (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Category
              </label>
              <input
                type="text"
                name="category"
                value="Special Events"
                readOnly
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-100 text-slate-600"
              />
            </div>
          ) : (
            <>
              {/* Category select */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    Category<span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={form.category || ""}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        category: e.target.value,
                        subcategory: "",
                      }))
                    }
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50/50"
                    required
                  >
                    <option value="">-- Select Category --</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat.name}>
                        {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subcategory select */}
                {form.category && (
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      Subcategory<span className="text-red-500">*</span>
                    </label>
                    <select
                      name="subcategory"
                      value={form.subcategory || ""}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          subcategory: e.target.value,
                        }))
                      }
                      className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50/50"
                      required
                    >
                      <option value="">-- Select Subcategory --</option>
                      {currentCategoryObj?.subcategories?.map(
                        (subcat, idx) => (
                          <option key={idx} value={subcat.name}>
                            {subcat.name}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                )}
              </div>

              {/* Add new subcategory */}
              {form.category && (
                <div className="flex flex-col md:flex-row gap-2 mt-2">
                  <input
                    type="text"
                    value={form.newSubcategory || ""}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        newSubcategory: e.target.value,
                      }))
                    }
                    placeholder="Add new subcategory..."
                    className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50/50"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      if (!form.newSubcategory?.trim()) {
                        toast.error("Enter subcategory name.");
                        return;
                      }

                      try {
                        const categoryId = currentCategoryObj?._id;
                        if (!categoryId) {
                          toast.error("Category not found in list.");
                          return;
                        }

                        const { data } = await axios.post(
                          `${API_BASE}/categories/${categoryId}/subcategories`,
                          { name: form.newSubcategory.trim() }
                        );

                        // Update categories state
                        setCategories((prev) =>
                          prev.map((cat) =>
                            cat._id === categoryId ? data : cat
                          )
                        );

                        // Auto-select new subcategory
                        setForm((prev) => ({
                          ...prev,
                          subcategory: prev.newSubcategory.trim(),
                          newSubcategory: "",
                        }));

                        toast.success("Subcategory added successfully.");
                      } catch (err) {
                        console.error("❌ Error adding subcategory:", err);
                        toast.error(
                          err.response?.data?.message ||
                            "Failed to add subcategory."
                        );
                      }
                    }}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs md:text-sm font-medium hover:bg-emerald-700"
                  >
                    + Add Subcategory
                  </button>
                </div>
              )}

              {/* Add new category inline */}
              <div className="flex flex-col md:flex-row gap-2 mt-3">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Add new category..."
                  className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50/50"
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs md:text-sm font-medium hover:bg-blue-700"
                >
                  + Add Category
                </button>
              </div>
            </>
          )}

          {/* Top Selling toggle */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              name="isTopSelling"
              checked={form.isTopSelling}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 rounded border-slate-300"
            />
            <span className="text-xs md:text-sm text-slate-700">
              Mark as <span className="font-medium">Top Selling</span> product
            </span>
          </div>
        </section>

        {/* 3. Image Upload */}
        <section className="bg-white rounded-2xl border border-slate-200/70 p-4 md:p-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <ImageUp size={16} className="text-blue-600" />
            Product Image
          </h3>

          <div className="flex flex-col md:flex-row items-start gap-4">
            <div className="w-full md:flex-1">
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Upload Image
              </label>
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50/50 cursor-pointer"
              />
            </div>

            {imagePreview && (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="preview"
                  className="w-20 h-20 object-cover rounded-xl border border-slate-200 shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null);
                    setForm((prev) => ({ ...prev, image: null }));
                  }}
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[10px] text-red-500 shadow-sm"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </section>

        {/* 4. Variants */}
        <section className="bg-white rounded-2xl border border-slate-200/70 p-4 md:p-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <ListPlus size={16} className="text-blue-600" />
            Product Variants
          </h3>

          <div className="space-y-3">
            {variants.map((v, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center rounded-xl border border-slate-200 bg-slate-50/60 p-3"
              >
                <input
                  type="text"
                  placeholder="Label (e.g., 500g, 1kg)"
                  value={v.label}
                  onChange={(e) =>
                    handleVariantChange(idx, "label", e.target.value)
                  }
                  className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  required
                />
                <input
                  type="number"
                  placeholder="Price (₹)"
                  value={v.price}
                  onChange={(e) =>
                    handleVariantChange(idx, "price", e.target.value)
                  }
                  className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  required
                />
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Stock"
                    value={v.stock}
                    onChange={(e) =>
                      handleVariantChange(idx, "stock", e.target.value)
                    }
                    className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white flex-1"
                    required
                  />
                  {variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVariant(idx)}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addVariant}
            className="inline-flex items-center gap-2 text-xs md:text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            + Add Another Variant
          </button>
        </section>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-blue-600 text-white text-sm md:text-base font-semibold hover:bg-blue-700 active:scale-[0.99] transition-transform"
          >
            {editProduct ? "Update Product" : "Add Product"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
