import React, { useState, useRef } from "react";
import Layout from "../components/Layout";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

export default function UploadPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [uploadResult, setUploadResult] = useState(null);

  const handleFileSelect = (e) => {
    const selected = e.target.files[0];

    if (!selected) return;

    // Validate file type
    const allowed = ["csv", "xls", "xlsx"];
    const ext = selected.name.split(".").pop().toLowerCase();

    if (!allowed.includes(ext)) {
      setError("Invalid file type. Upload .csv, .xls, or .xlsx only.");
      return;
    }

    // Validate file size
    if (selected.size > 10 * 1024 * 1024) {
      setError("File too large. Maximum 10MB allowed.");
      return;
    }

    setError("");
    setFile(selected);
    setSuccess(false);
  };

  const startUpload = async () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    setUploading(true);
    setSuccess(false);
    setProgress(0);

    let current = 0;

    const timer = setInterval(() => {
      current += 10;
      setProgress(current);

      if (current >= 90) {
        clearInterval(timer);
      }
    }, 200);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
        "http://127.0.0.1:5000/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Backend response:", response.data);

      setProgress(100);
      setUploading(false);
      setSuccess(true);

      toast.success(
        `Upload Completed
        Valid Rows: ${response.data.valid_rows}
        Invalid Rows: ${response.data.invalid_rows}
        Saved Records: ${response.data.records}`
      );

      setUploadResult(
        response.data
      );

      setTimeout(() => {
        navigate("/dashboard", {
          state: {
            refresh: true
          }
        });
      }, 800);

    } catch (error) {
      console.error(error);

      setError(
        error?.response?.data?.error ||
        "Upload failed. Please try again."
      );

      setUploading(false);

      setFile(null);

      setProgress(0);

      setSuccess(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeFile = () => {
    setFile(null);
    setProgress(0);
    setSuccess(false);
  };

  // const startUpload = () => {
  //   setUploading(true);
  //   setSuccess(false);

  //   // Simulated upload progression
  //   let current = 0;
  //   const timer = setInterval(() => {
  //     current += 12;
  //     setProgress(current);

  //     if (current >= 100) {
  //       clearInterval(timer);
  //       setUploading(false);
  //       setSuccess(true);
  //     }
  //   }, 200);
  // };

  return (
    <div
      className="min-h-screen p-8 text-white"
      style={{
        background:
          "linear-gradient(135deg, rgba(26,71,42,0.92) 0%, rgba(10,31,46,0.92) 50%, rgba(0,26,51,0.94) 100%)",
      }}
    >
      <div className="flex justify-end mb-1">
        <button
          onClick={() => navigate("/homepage")}
          className="px-4 py-2 rounded-lg text-white border border-white/30 
               hover:bg-white/10 transition-all backdrop-blur-md flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="white"
            strokeWidth="2"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>


          Go to Homepage
        </button>
      </div>

      {/* PAGE TITLE */}
      <div className="text-center mb-6 mt-2">
        <h1 className="text-4xl font-bold text-white tracking-wide">
          Upload Your Consumption Data
        </h1>
        <p className="text-gray-300 mt-2 text-lg">
          Import your Excel or CSV files for processing and analytics
        </p>
      </div>

      <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-xl border border-white/30 rounded-2xl p-8 shadow-xl">

        {/* TITLE */}
        <h1 className="text-3xl font-semibold mb-2 text-white flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg"
            fill="none" viewBox="0 0 24 24"
            stroke="white" strokeWidth="2"
            className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M12 12V4m0 0l4 4m-4-4L8 8" />
          </svg>
          Upload Data File
        </h1>
        <p className="text-gray-300 mb-6">Upload filled Excel or CSV file</p>

        {/* UPLOAD BOX */}
        <div className="border-2 border-dashed border-white/40 rounded-xl p-10 text-center relative">

          <div className="mb-4 flex justify-center">
            <svg xmlns="http://www.w3.org/2000/svg"
              fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="1.5"
              className="w-16 h-16">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M19 7l-5-5H7a2 2 0 00-2 2v16a2 2 0 002 2h10a2 2 0 002-2V7z" />
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M13 3v4h4" />
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M9 13h6M9 17h6M9 9h2" />
            </svg>
          </div>

          <p className="text-gray-200">
            Click to browse or drag and drop your file here
          </p>

          <p className="text-gray-400 text-sm mt-1">Supported formats: .xlsx, .xls, .csv</p>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xls,.xlsx"
            onChange={handleFileSelect}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </div>

        {/* ERROR ALERT */}
        {error && (
          <div className="mt-4 bg-red-500/20 text-red-300 border border-red-400/40 px-4 py-3 rounded-lg">
            ⚠️ {error}
          </div>
        )}

        {/* FILE PREVIEW */}
        {file && (
          <div className="mt-4 bg-white/10 border border-white/30 rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="text-white font-semibold">{file.name}</p>
              <p className="text-gray-300 text-sm">
                {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type || "unknown"}
              </p>
            </div>
            <button
              onClick={() => {
                setFile(null);

                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
              className="text-red-300 hover:text-red-400 text-sm"
            >
              ❌
            </button>
          </div>
        )}
        {/* PROGRESS BAR */}
        {uploading && (
          <div className="mt-4">
            <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-green-400 to-blue-500 h-3"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-gray-300 text-sm mt-1">{progress}% Uploading...</p>
          </div>
        )}

        {/* SUCCESS ALERT */}
        {success && (

          <div
            className="mt-4 bg-green-500/20 text-green-300 border
border-green-400/40
px-4
py-3
rounded-lg
">✅ Upload Completed

            <br />

            Valid Rows :
            {uploadResult?.valid_rows}

            <br />

            Invalid Rows :
            {uploadResult?.invalid_rows}

            <br />

            Saved Records :
            {uploadResult?.records}

          </div>

        )}
        

        {/* UPLOAD BUTTON */}
        <button
          disabled={!file || uploading}
          onClick={startUpload}
          className={`w-full mt-6 py-3 rounded-xl transition-all font-medium
              ${file && !uploading
              ? "bg-gradient-to-r from-green-400 to-blue-500 hover:opacity-90"
              : "bg-white/20 cursor-not-allowed text-gray-400"
            }`}
        >
          {uploading ? "Processing..." : "Upload and Process"}
        </button>
      </div>

      {/* GUIDELINES CARD */}
      <div className="max-w-4xl mx-auto mt-10 bg-white/10 backdrop-blur-xl border border-white/30 rounded-2xl p-8 shadow-xl">

        <h2 className="text-2xl font-semibold mb-4 text-white">
          Upload Guidelines
        </h2>

        <ul className="text-gray-300 space-y-2">
          <li>• Ensure timestamps are in ISO format (YYYY-MM-DD)</li>
          <li>• Energy values should be in kWh, water in Liters</li>
          <li>• Maximum file size: 10MB</li>
          <li>• Data will be automatically validated before storage</li>
        </ul>
      </div>

      {/* FOOTER */}
      {/* <footer className="text-center text-gray-400 text-sm mt-16 mb-6">
  © 2026 Smart Utility Management System. All rights reserved.
</footer> */}
    </div>

  );
}
