import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import Products from "./pages/Products";
import AddProduct from "./pages/AddProduct";
import ProductDetails from "./pages/ProductDetails";
import Categories from "./pages/Categories";
import Events from "./pages/Events";
import EventManager from "./pages/EventManager";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import Users from "./pages/users";
import Login from "./pages/Login";
import PrivateRoute from "./components/PrivateRoute";
import UserOrders from "./pages/UserOrders";

export default function App() {
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <Router>
      <Routes>
        {/* 🟢 Public Route */}
        <Route path="/login" element={<Login />} />

        {/* 🔒 Protected Routes */}
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <div className="flex min-h-screen bg-gray-100">
                {/* Sidebar */}
                <aside className="w-64 bg-white shadow-md">
                  <div className="p-6 border-b border-gray-200">
                    <h1 className="text-2xl font-bold text-red-600">ACB Dashboard</h1>
                  </div>

                  <nav className="mt-6 space-y-1">
                    <NavLink
                      to="/"
                      end
                      className={({ isActive }) =>
                        `block px-6 py-3 text-sm font-medium rounded-lg ${
                          isActive
                            ? "bg-red-600 text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }`
                      }
                    >
                      📦 Products
                    </NavLink>

                    <NavLink
                      to="/add"
                      className={({ isActive }) =>
                        `block px-6 py-3 text-sm font-medium rounded-lg ${
                          isActive
                            ? "bg-red-600 text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }`
                      }
                    >
                      ➕ Add Product
                    </NavLink>

                    <NavLink
                      to="/categories"
                      className={({ isActive }) =>
                        `block px-6 py-3 text-sm font-medium rounded-lg ${
                          isActive
                            ? "bg-red-600 text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }`
                      }
                    >
                      🏷️ Categories
                    </NavLink>

                    <NavLink
                      to="/events"
                      className={({ isActive }) =>
                        `block px-6 py-3 text-sm font-medium rounded-lg ${
                          isActive
                            ? "bg-red-600 text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }`
                      }
                    >
                      🎉 Events
                    </NavLink>

                    <NavLink
                      to="/orders"
                      className={({ isActive }) =>
                        `block px-6 py-3 text-sm font-medium rounded-lg ${
                          isActive
                            ? "bg-red-600 text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }`
                      }
                    >
                      🧾 Orders
                    </NavLink>

                    <NavLink
                      to="/users"
                      className={({ isActive }) =>
                        `block px-6 py-3 text-sm font-medium rounded-lg ${
                          isActive
                            ? "bg-red-600 text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }`
                      }
                    >
                      👤 Users
                    </NavLink>
                  </nav>
                </aside>

                {/* Main Content */}
                <div className="flex-1 flex flex-col">
                  <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-800">Admin Panel</h2>
                    <div className="flex items-center space-x-4">
                      <span className="text-gray-600">Admin</span>
                      <button
                        onClick={handleLogout}
                        className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700"
                      >
                        Logout
                      </button>
                    </div>
                  </header>

                  <main className="flex-1 p-6">
                    <Routes>
                      <Route path="/" element={<Products />} />
                      <Route path="/add" element={<AddProduct />} />
                      <Route path="/product/:id" element={<ProductDetails />} />
                      <Route path="/edit/:id" element={<AddProduct />} />
                      <Route path="/categories" element={<Categories />} />
                      <Route path="/events" element={<Events />} />
                      <Route path="/events/:id/manage" element={<EventManager />} />
                      <Route path="/orders" element={<Orders />} />
                      <Route path="/orders/:id" element={<OrderDetails />} />
                      <Route path="/users" element={<Users />} />
                      <Route path="/users/:id/orders" element={<UserOrders />} />
                    </Routes>
                  </main>
                </div>
              </div>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}
