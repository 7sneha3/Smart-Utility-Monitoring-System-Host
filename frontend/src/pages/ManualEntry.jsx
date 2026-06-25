import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const UTILITIES = {
  energy: {
    "Main Grid Supply": "U1",
    "Backup Diesel Generator": "U2",
    "Solar Panels": "U3",
  },

  water: {
    "Municipal Water Supply": "U4",
    "Groundwater Borewell": "U5",
    "Process Cooling Water": "U6",
    "Wastewater Discharge": "U7",
  },
};

export default function ManualEntry() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("energy");

  const [formData, setFormData] = useState({
    date: "",
    subUtility: "",
    consumption: "",
  });

  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setFormData({
      date: "",
      subUtility: "",
      consumption: "",
    });
  };

  const saveEntry = async (goToDashboard = false) => {
    if (
      !formData.date ||
      !formData.subUtility ||
      !formData.consumption
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    const payload = {
      utility_id:
        UTILITIES[activeTab][formData.subUtility],

      sub_utility:
        formData.subUtility,

      resource_type:
        activeTab,

      date:
        formData.date,

      month:
        new Date(formData.date).getMonth() + 1,

      year:
        new Date(formData.date).getFullYear(),

      unit:
        activeTab === "energy"
          ? "kWh"
          : "kL",

      consumption:
        Number(formData.consumption),
    };

    try {
      setSaving(true);

      await axios.post(
        "http://127.0.0.1:5000/manual-entry",
        payload
      );

      toast.success(
        "Entry saved successfully"
      );

      if (goToDashboard) {
        navigate("/dashboard", {
          state: {
            refresh: true,
          },
        });

        return;
      }

      resetForm();
    } catch (error) {
      console.error(error);

      toast.error(
        error?.response?.data?.error ||
          "Failed to save entry"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="min-h-screen p-8 text-white"
      style={{
        background:
          "linear-gradient(135deg, rgba(26,71,42,0.92) 0%, rgba(10,31,46,0.92) 50%, rgba(0,26,51,0.94) 100%)",
      }}
    >
      {/* HEADER */}
      <div className="flex justify-end mb-2">
        <button
          onClick={() => navigate("/homepage")}
          className="
            px-4 py-2 rounded-lg
            border border-white/30
            hover:bg-white/10
            transition-all
          "
        >
          ← Go to Homepage
        </button>
      </div>

      {/* TITLE */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold">
          Manual Data Entry
        </h1>

        <p className="text-gray-300 mt-2">
          Add utility consumption records manually
        </p>
      </div>

      {/* RESOURCE TABS */}
      <div className="flex gap-4 mb-6 justify-center">
        {["energy", "water"].map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);

              setFormData({
                ...formData,
                subUtility: "",
              });
            }}
            className={`
              px-6 py-2 rounded-xl
              border transition-all

              ${
                activeTab === tab
                  ? "bg-white/20 border-white/40"
                  : "bg-white/10 border-white/20 hover:bg-white/20"
              }
            `}
          >
            {tab === "energy"
              ? "⚡ Energy"
              : "💧 Water"}
          </button>
        ))}
      </div>

      {/* FORM */}
      <div
        className="
          max-w-3xl mx-auto
          bg-white/10
          backdrop-blur-xl
          border border-white/20
          rounded-2xl
          p-8
          shadow-2xl
        "
      >
        {/* DATE */}
        <div className="mb-6">
          <label className="block mb-2 font-medium">
            Date *
          </label>

          <input
            type="date"
            value={formData.date}
            onChange={(e) =>
              setFormData({
                ...formData,
                date: e.target.value,
              })
            }
            className="
              w-full p-3 rounded-xl
              bg-white/10
              border border-white/20
              outline-none
            "
          />
        </div>

        {/* SUB UTILITY */}
        <div className="mb-6">
          <label className="block mb-2 font-medium">
            Sub Utility *
          </label>

          <select
            value={formData.subUtility}
            onChange={(e) =>
              setFormData({
                ...formData,
                subUtility: e.target.value,
              })
            }
            className="
              w-full p-3 rounded-xl
              bg-white/10
              border border-white/20
              outline-none
            "
          >
            <option value="">
              Select Sub Utility
            </option>

            {Object.keys(
              UTILITIES[activeTab]
            ).map((utility) => (
              <option
                key={utility}
                value={utility}
                className="text-black"
              >
                {utility}
              </option>
            ))}
          </select>
        </div>

        {/* CONSUMPTION */}
        <div className="mb-8">
          <label className="block mb-2 font-medium">
            Consumption (
            {activeTab === "energy"
              ? "kWh"
              : "kL"}
            ) *
          </label>

          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.consumption}
            onChange={(e) =>
              setFormData({
                ...formData,
                consumption: e.target.value,
              })
            }
            placeholder={
              activeTab === "energy"
                ? "Enter energy consumption"
                : "Enter water consumption"
            }
            className="
              w-full p-3 rounded-xl
              bg-white/10
              border border-white/20
              outline-none
            "
          />
        </div>

        {/* ACTION BUTTONS */}
        <div className="grid md:grid-cols-2 gap-4">
          <button
            type="button"
            disabled={saving}
            onClick={() =>
              saveEntry(false)
            }
            className="
              py-3 rounded-xl
              bg-gradient-to-r
              from-green-400
              to-blue-500
              font-semibold
              hover:opacity-90
              transition
            "
          >
            {saving
              ? "Saving..."
              : "Save & Add Another"}
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={() =>
              saveEntry(true)
            }
            className="
              py-3 rounded-xl
              border border-white/20
              bg-white/10
              hover:bg-white/20
              transition
            "
          >
            Save & Go To Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}