import React from "react";
import Layout from "../components/Layout";
// import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Homepage() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // const handleFileUpload = async (event) => {
  //     const file = event.target.files[0];

  //     if (!file) return;

  //     const formData = new FormData();
  //     formData.append("file", file);

  //     try {
  //       const res = await axios.post("http://127.0.0.1:8000/upload-csv/", formData, {
  //         headers: {
  //           "Content-Type": "multipart/form-data",
  //         },
  //       });

  //       console.log("Received processed data:", res.data);

  //       // Navigate to dashboard later
  //       // navigate("/dashboard", { state: { data: res.data } });

  //     } catch (error) {
  //       console.error("File upload failed:", error);
  //     }
  //   };


  return (
    <Layout>
      <div
        className="min-h-screen w-full text-white flex flex-col"
        style={{
          background: "linear-gradient(135deg, rgba(26, 71, 42, 0.92) 0%, rgba(10, 31, 46, 0.92) 50%, rgba(0, 26, 51, 0.94) 100%)",
          margin: 0,
          padding: 0,
        }}
      >

        <div
          className="min-h-screen w-full text-white"
          style={{
            background: "linear-gradient(135deg, rgba(26, 71, 42, 0.92) 0%, rgba(10, 31, 46, 0.92) 50%, rgba(0, 26, 51, 0.94) 100%)"
          }}
        >

          {/* ---------------- HAMBURGER BUTTON ---------------- */}
          {/* <button
  className="absolute top-4 left-4 z-[60] p-3 rounded-xl bg-white/10 
             backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all flex items-center justify-center"
  onClick={() => setIsOpen(!isOpen)}
>
  <div className="relative w-6 h-6 flex items-center justify-center"> */}
          {/* Top Line */}
          {/* <span
      className={`absolute h-[3px] w-6 bg-white rounded transition-all duration-300 
        ${isOpen ? "rotate-45" : "-translate-y-2"}
      `}
    ></span> */}

          {/* Middle Line */}
          {/* <span
      className={`absolute h-[3px] w-6 bg-white rounded transition-all duration-300 
        ${isOpen ? "opacity-0" : "opacity-100"}
      `}
    ></span> */}

          {/* Bottom Line */}
          {/* <span
      className={`absolute h-[3px] w-6 bg-white rounded transition-all duration-300 
        ${isOpen ? "-rotate-45" : "translate-y-2"}
      `}
    ></span>
  </div>
</button> */}



          {/* ---------------- SIDEBAR ---------------- */}
          {/* <div
        className={`fixed top-0 left-0 h-full w-64 bg-black/90 backdrop-blur-xl border-r border-white/20 transform transition-all duration-300 z-40
          ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-6 space-y-6"> */}

          {/* Logo */}
          {/* <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center shadow-lg">
  <span className="text-white text-xl font-bold">⚡</span>
</div> */}

          {/* <div>
              <h1 className="text-lg font-semibold">Energy Portal</h1>
              <p className="text-xs text-gray-300">Admin Panel</p>
            </div>
          </div> */}

          {/* <hr className="border-white/20" /> */}

          {/* Menu Items */}
          {/* <nav className="space-y-4">
            <a href="/dashboard" className="block text-white hover:text-green-300 text-lg">🏠 Homepage</a>
            <a href="/dashboard" className="block text-white hover:text-green-300 text-lg">📊 Dashboard</a>
            <a href="#" className="block text-white hover:text-green-300 text-lg">📁 History</a>
            <a href="#" className="block text-white hover:text-green-300 text-lg">❓ FAQs</a>
          </nav>
        </div>
      </div> */}

          {/* ---------------- BACKDROP (click to close sidebar) ---------------- */}
          {/* {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30"
          onClick={() => setIsOpen(false)}
        ></div>
      )} */}






















          {/* Top Navbar */}
          {/* <div className="max-w-6xl mx-auto flex justify-between items-center px-6 py-4 bg-white/10 backdrop-blur-md rounded-xl mt-4 border border-white/20 shadow-lg"> */}

          {/* Left Logo Section */}
          {/* <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center shadow-lg">
            <span className="text-white text-xl font-bold">⚡</span>
          </div>
          <div>
            <h1 className="text-xl font-semibold">Energy & Water Portal</h1>
            <p className="text-sm text-gray-200 -mt-1">Data Management System</p>
          </div>
        </div> */}

          {/* Right Profile Section */}
          {/* <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="font-semibold">Welcome, Admin</p>
            <p className="text-xs text-gray-200">Last login: Today, 10:30 AM</p>
          </div>
          <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg border border-white/20 transition">
            Logout
          </button>
        </div>
      </div> */}

          {/* Heading */}
          <div className="text-center mt-12">
            <h2 className="text-4xl font-bold">Choose Your Data Input Method</h2>
            <p className="text-gray-300 mt-2">
              Select how you'd like to manage your energy and water consumption data
            </p>
          </div>

          {/* Cards Section */}
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 px-6">

            {/* Card 1 – Import from Device */}
            <div className="bg-white text-gray-800 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition border border-gray-200">
              <div className="flex justify-center">
                <div className="h-16 w-16 rounded-2xl flex items-center justify-center
                bg-gradient-to-b from-green-200 to-green-100 shadow-md">
                  <svg xmlns="http://www.w3.org/2000/svg"
                    fill="none" viewBox="0 0 24 24" stroke="#1bb169" strokeWidth="2.2"
                    className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12" />
                  </svg>
                </div>

              </div>
              <h3 className="text-2xl font-semibold text-center mt-4">Import from Device</h3>
              <p className="text-center text-gray-600 mt-2">
                Upload your existing data files directly from your computer. Supports CSV format.
              </p>
              <div className="flex justify-center mt-6">
                <div>
                  {/* <input
    type="file"
    accept=".csv"
    onChange={handleFileUpload}
    className="hidden"
    id="fileInput"
  />

  <label
    htmlFor="fileInput"
    className="px-6 py-2 bg-gradient-to-r from-green-400 to-blue-500
               text-white rounded-lg hover:opacity-90 cursor-pointer block text-center"
  >
    Choose File
  </label> */}

                  <button
                    onClick={() => navigate("/upload")}
                    className="px-6 py-2 
    rounded-lg 
    text-white 
    bg-gradient-to-r from-green-400 to-blue-500 
    transition-all duration-300

    hover:opacity-80 
    hover:text-black"
                  >
                    Select File
                  </button>

                </div>

              </div>
            </div>

            {/* Card 2 – Insert Data Manually */}
            <div className="bg-white text-gray-800 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition border border-gray-200">
              <div className="flex justify-center">
                <div className="h-16 w-16 rounded-2xl flex items-center justify-center shadow-md
    bg-gradient-to-br from-[#e6f1ff] to-[#cfe4ff] relative overflow-hidden">

                  {/* subtle diagonal texture */}
                  <div className="absolute inset-0 opacity-[0.15]
        bg-[linear-gradient(135deg,#ffffff40_1px,transparent_1px)]
        bg-[size:22px_22px]"></div>

                  {/* ORIGINAL-SIZE pencil icon */}
                  <svg xmlns="http://www.w3.org/2000/svg"
                    fill="#1E88E5"
                    viewBox="0 0 24 24"
                    className="w-8 h-8 relative z-10">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                  </svg>

                </div>


              </div>
              <h3 className="text-2xl font-semibold text-center mt-4">Insert Data Manually</h3>
              <p className="text-center text-gray-600 mt-2">
                Enter your consumption data manually through our intuitive entry interface with real-time validation.
              </p>
              <div className="flex justify-center mt-6">
                <button onClick={() => navigate("/manual")}
                  className="px-6 py-2 
    rounded-lg 
    text-white 
    bg-gradient-to-r from-green-400 to-blue-500 
    transition-all duration-300

    hover:opacity-80 
    hover:text-black">
                  Start Entry
                </button>
              </div>
            </div>

            {/* Card 3 – Excel Template */}
            <div className="bg-white text-gray-800 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition border border-gray-200">
              <div className="flex justify-center">
                <div className="h-16 w-16 rounded-2xl flex items-center justify-center
                bg-gradient-to-b from-purple-200 to-purple-100 shadow-md">
                  <svg xmlns="http://www.w3.org/2000/svg"
                    fill="none" viewBox="0 0 24 24" stroke="#a16de0" strokeWidth="2.3"
                    className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M5 13l4 4L19 7" />
                  </svg>
                </div>

              </div>
              <h3 className="text-2xl font-semibold text-center mt-4">Use Our Excel Template</h3>
              <p className="text-center text-gray-600 mt-2">
                Download our standardized Excel template, fill it offline, and upload it for seamless integration.
              </p>
              <div className="flex justify-center mt-6">
                <button className="px-6 py-2 
    rounded-lg 
    text-white 
    bg-gradient-to-r from-green-400 to-blue-500 
    transition-all duration-300

    hover:opacity-80 
    hover:text-black">
                  Download Template
                </button>
              </div>
            </div>

          </div>

          {/* Footer */}
          {/* <div className="text-center text-gray-400 text-sm mt-16 pb-6">
        © 2026 Energy & Water Management Portal. All rights reserved.
      </div> */}

        </div>
      </div>
    </Layout>
  );
}
