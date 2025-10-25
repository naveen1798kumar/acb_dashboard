// src/pages/AddProduct.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const AddProduct = ({ onProductAdded, isInlineAdd = false, eventId = null, onCancelEdit = null }) => {
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
  const [variants, setVariants] = useState([{ label: "", price: "", stock: "" }]);

  const API_BASE = import.meta.env.VITE_API_URL;

  // Fetch categories
  useEffect(() => {
    const fetchCategoriesData = async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/categories`);
        if (Array.isArray(data)) setCategories(data);
        else if (Array.isArray(data.categories)) setCategories(data.categories);
      } catch (err) {
        console.error("❌ Error fetching categories:", err);
      }
    };
    fetchCategoriesData();
  }, []);

  // Fetch product in edit mode
  useEffect(() => {
    if (id) {
      const fetchProduct = async () => {
        try {
          const { data } = await axios.get(`${API_BASE}/products/${id}`);
          setEditProduct(data);
        } catch (err) {
          console.error("❌ Error fetching product:", err);
        }
      };
      fetchProduct();
    }
  }, [id]);

  // Prefill form if editing
  useEffect(() => {
    if (editProduct && categories.length > 0) {
      const categoryObj = categories.find(cat => cat.name === editProduct.category);

      setForm({
        name: editProduct.name || "",
        category: editProduct.category || "",
        subcategory: categoryObj?.subcategories?.some(sub => sub.name === editProduct.subcategory)
          ? editProduct.subcategory
          : "",
        newSubcategory: "",
        description: editProduct.description || "",
        image: null,
        isTopSelling: editProduct.isTopSelling || false,
      });

      setVariants(editProduct.variants?.length ? editProduct.variants : [{ label: "", price: "", stock: "" }]);
      setImagePreview(editProduct.image || null);
    } else if (isInlineAdd) {
      setForm((f) => ({ ...f, category: "Special Events" }));
    }
  }, [editProduct, categories, isInlineAdd]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "file" && files[0]) {
      setForm({ ...form, image: files[0] });
      setImagePreview(URL.createObjectURL(files[0]));
    } else {
      setForm({ ...form, [name]: type === "checkbox" ? checked : value });
    }
  };

  const handleVariantChange = (i, field, value) => {
    setVariants(prev => prev.map((v, idx) => (idx === i ? { ...v, [field]: value } : v)));
  };
  const addVariant = () => setVariants([...variants, { label: "", price: "", stock: "" }]);
  const removeVariant = (i) => setVariants(variants.filter((_, idx) => idx !== i));

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return alert("Enter a valid category name");
    try {
      const { data } = await axios.post(`${API_BASE}/categories`, { name: newCategory.trim() });
      setCategories(prev => [...prev, data]);
      setNewCategory("");
      alert("✅ Category added successfully!");
    } catch (error) {
      console.error("❌ Error adding category:", error);
      alert("Failed to add category. It might already exist.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== null && v !== undefined && k !== "newSubcategory") formData.append(k, v);
      });
      formData.append("variants", JSON.stringify(variants));
      if (eventId) formData.append("eventId", eventId);

      let response;
      if (editProduct?._id) {
        response = await axios.put(`${API_BASE}/products/${editProduct._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("✅ Product updated successfully!");
      } else {
        response = await axios.post(`${API_BASE}/products`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("✅ Product added successfully!");
      }

      if (isInlineAdd && eventId && response?.data?._id && !editProduct?._id) {
        await axios.put(`${API_BASE}/events/${eventId}`, {
          $push: { products: response.data._id },
        });
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
      if (id) navigate("/");
    } catch (error) {
      console.error("❌ Error saving product:", error);
      alert("❌ Failed to save product");
    }
  };

  return (
    <div className={`p-6 rounded-xl shadow-lg border ${isInlineAdd ? "bg-white" : "bg-gray-50 max-w-2xl mx-auto mt-6"}`}>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-bold text-gray-800">
          {editProduct ? "✏️ Edit Product" : "➕ Add New Product"}
        </h2>
        {editProduct && onCancelEdit && (
          <button type="button" onClick={onCancelEdit} className="text-sm text-gray-600 hover:text-red-500">
            Cancel
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Product Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter product name"
            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Category & Subcategory */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          {isInlineAdd ? (
            <input
              type="text"
              name="category"
              value="Special Events"
              readOnly
              className="w-full border p-3 rounded-lg bg-gray-100 text-gray-600"
            />
          ) : (
            <>
              {/* Select Category */}
              <select
                name="category"
                value={form.category || ""}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value, subcategory: "" })
                }
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">-- Select Category --</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.name}>
                    {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}
                  </option>
                ))}
              </select>

              {/* Select Subcategory */}
              {form.category && (
                <select
                  name="subcategory"
                  value={form.subcategory || ""}
                  onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
                  className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 mt-2"
                  required
                >
                  <option value="">-- Select Subcategory --</option>
                  {categories
                    .find((cat) => cat.name === form.category)
                    ?.subcategories?.map((subcat, idx) => (
                      <option key={idx} value={subcat.name}>{subcat.name}</option>
                    ))}
                </select>
              )}

              {/* Add New Subcategory */}
              {form.category && (
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="text"
                    value={form.newSubcategory || ""}
                    onChange={(e) =>
                      setForm({ ...form, newSubcategory: e.target.value })
                    }
                    placeholder="Add new subcategory..."
                    className="flex-1 border p-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      if (!form.newSubcategory?.trim()) return alert("Enter subcategory name!");

                      try {
                        const { data } = await axios.post(
                          `${API_BASE}/categories/${
                            categories.find((cat) => cat.name === form.category)._id
                          }/subcategories`,
                          { name: form.newSubcategory.trim() }
                        );

                        // Update categories state
                        setCategories(prev =>
                          prev.map((cat) =>
                            cat.name === form.category ? data : cat
                          )
                        );

                        // Auto-select new subcategory
                        setForm({
                          ...form,
                          subcategory: form.newSubcategory.trim(),
                          newSubcategory: "",
                        });

                        alert("✅ Subcategory added successfully!");
                      } catch (err) {
                        alert(err.response?.data?.message || "Failed to add subcategory!");
                      }
                    }}
                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                  >
                    + Add
                  </button>
                </div>
              )}

              {/* Add New Category Inline */}
              <div className="flex items-center gap-2 mt-3">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Add new category..."
                  className="flex-1 border p-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  + Add
                </button>
              </div>
            </>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Write a short description..."
            rows="3"
            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
          <div className="flex items-center gap-4">
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
              className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {imagePreview && (
              <div className="relative">
                <img src={imagePreview} alt="preview" className="w-16 h-16 object-cover rounded-md border" />
                <button
                  type="button"
                  onClick={() => setImagePreview(null)}
                  className="absolute top-0 right-0 text-red-600 bg-white rounded-full px-1 text-xs"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Top Selling */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isTopSelling"
            checked={form.isTopSelling}
            onChange={handleChange}
            className="h-5 w-5 text-blue-600 rounded"
          />
          <span className="text-gray-700">Mark as Top Selling</span>
        </div>

        {/* Variants */}
        <div className="border-t pt-4 mt-4">
          <h3 className="font-semibold text-gray-800 mb-3">Product Variants</h3>
          {variants.map((v, idx) => (
            <div key={idx} className="grid grid-cols-3 gap-3 mb-3 items-center">
              <input
                type="text"
                placeholder="Label (e.g., 500g, 1kg)"
                value={v.label}
                onChange={(e) => handleVariantChange(idx, "label", e.target.value)}
                className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="number"
                placeholder="Price (₹)"
                value={v.price}
                onChange={(e) => handleVariantChange(idx, "price", e.target.value)}
                className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Stock"
                  value={v.stock}
                  onChange={(e) => handleVariantChange(idx, "stock", e.target.value)}
                  className="border p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-500"
                  required
                />
                {variants.length > 1 && (
                  <button type="button" onClick={() => removeVariant(idx)} className="text-red-600 text-sm hover:underline">
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))}
          <button type="button" onClick={addVariant} className="text-blue-600 text-sm mt-1 hover:underline">
            + Add Another Variant
          </button>
        </div>

        {/* Submit */}
        <div className="pt-4">
          <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
            {editProduct ? "Update Product" : "Add Product"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
