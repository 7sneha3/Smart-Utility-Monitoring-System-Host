import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === "loginAdmin" && password === "loginAdmin") {
      toast.success("Login successful!");
      navigate("/homepage");
    } else {
      toast.error("Invalid credentials!");
      setError("Invalid credentials! Please try again.");
    }
  };

  return (
    <div
      className="absolute inset-0 min-h-screen flex items-center justify-center bg-cover bg-center px-4"
      style={{
        backgroundImage:
          "url('https://wallpapers.com/images/hd/industry-pictures-2000-x-985-hgko8zsjzitb76li.jpg')",
      }}
    >
      {/* Black Transparent Overlay */}
      <div className="absolute inset-0 bg-black/40"></div>
      {/*            ↑          ↑
      black with 40% opacity
  */}
      <div
        className="min-h-screen flex items-center justify-center bg-cover bg-center px-4"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1581092334465-1f3a8e7d9b4e?auto=format&fit=crop&w=2000&q=80')",
        }}
      >
        {/* --- Smaller Card --- */}
        <div className="bg-white/80 backdrop-blur-xl shadow-xl rounded-2xl w-full max-w-sm p-6">

          {/* Icon */}
          <div className="flex justify-center mb-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center shadow-lg">
            <img src="/mainlogo.png" alt="logo" className="w-9 h-9 object-contain" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-semibold text-center text-gray-800">
            Admin Login
          </h2>
          <p className="text-center text-gray-500 text-sm mt-1">
            Secure Access Panel
          </p>

          {/* Form */}
          <form onSubmit={handleLogin} className="mt-5 space-y-4">

            {/* Username */}
            <div>
              <label className="text-gray-700 text-sm font-medium">Username</label>
              <input
                type="text"
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-xl
                        focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                placeholder="Enter username"
                required
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-gray-700 text-sm font-medium">Password</label>
              <input
                type="password"
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-xl
                        focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                placeholder="Enter password"
                required
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Button */}
            <button 
              type="submit"
              className="w-full py-2 text-white text-base font-semibold rounded-xl
                        bg-gradient-to-r from-green-400 to-blue-500 shadow-md
                        hover:opacity-90 transition-all"
            >
              Sign In
            </button>
            
            {error && (
              <p className="text-red-600 text-sm text-center mt-2">{error}</p>
            )}
            
          </form>

          <div className="text-center mt-4 text-gray-500 text-xs">
            © 2026 Smart Utility Monitoring
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
