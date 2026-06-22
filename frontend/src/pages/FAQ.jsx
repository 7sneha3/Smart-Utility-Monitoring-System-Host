import React, { useState } from "react";
import Layout from "../components/Layout";

export default function FAQ() {
  const [search, setSearch] = useState("");

  // Editable FAQ list — add your own Q & A here
  const faqList = [
    {
      q: "How is utility consumption data entered into the system?",
      a: "Consumption data for energy and water is uploaded periodically via Excel spreadsheets provided by facility staff. The system processes this data for analysis and visualization.",
    },
    {
      q: "What are the system requirements?",
      a: "Any modern browser (Chrome, Firefox, Edge) with a stable internet connection is enough. No external installation needed.",
    },
    // {
    //   q: "Can I access the portal from mobile devices?",
    //   a: "Yes, our portal is fully responsive and accessible from phones, tablets, and desktops.",
    // },
    {
      q: "Do I need any special sensors or hardware?",
      a: "No additional sensors or metering hardware are required. The system is designed to work entirely with manually collected or existing data exported to Excel.",
    },
    {
      q: "What happens after I upload my utility data?",
      a: "Once an Excel file is uploaded, the system extracts, checks, and stores the data. It then analyzes daily usage, tracks trends, and compares each utility’s consumption to pre-set threshold values.",
    },
    {
      q: "How does the system alert me if usage goes above a threshold?",
      a: "If a utility’s consumption is found to exceed the defined threshold for any period, the system instantly generates a pop-up alert on the dashboard and can optionally send notifications by email.",
    },
    {
      q: " Can I customize the threshold levels for different utilities?",
      a: "Yes, threshold values for energy and water consumption can be set and adjusted according to your facility’s operational goals or regulatory requirements.",
    },
    {
      q: "Is historical data and trend analysis available?",
      a: "The system stores all uploaded data, generating historical graphs and reports so you can monitor trends, compare periods, and evaluate improvement over time.",
    },
    {
      q: "Can reports be exported for record-keeping or presentations?",
      a: "Yes summaries can be exported to common formats to facilitate reporting, compliance, or review",
    },
    {
      q: "Who receives the alerts and recommendations?",
      a: "Designated facility managers and stakeholders will see alerts and recommendations via the dashboard. Optional notification settings enable alerts by email.",
    },
  ];

  const [open, setOpen] = useState(null);

  // Filter according to search
  const filtered = faqList.filter((item) =>
    item.q.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div
        className="min-h-screen p-8 flex flex-col items-center"
        style={{
          background:
            "linear-gradient(135deg, rgba(26,71,42,0.92) 0%, rgba(10,31,46,0.92) 50%, rgba(0,26,51,0.94) 100%)",
        }}
      >
        {/* TITLE */}
        <h1 className="text-white text-4xl font-bold text-center mt-8">
          Frequently Asked Questions
        </h1>
        <p className="text-gray-300 text-center mt-2">
          Find answers to common questions about our energy and water
          management system
        </p>

        {/* SEARCH BAR */}
        <div className="mt-6 w-full max-w-xl">
          <div className="flex items-center bg-white/90 rounded-full px-4 shadow">
            <input
              type="text"
              placeholder="Search for answers..."
              className="flex-1 py-3 px-2 bg-transparent outline-none text-gray-700"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className="text-gray-500">🔍</span>
          </div>
        </div>

        {/* FAQ LIST */}
        <div className="w-full max-w-4xl mt-10 space-y-4">
          {filtered.length === 0 ? (
            <p className="text-gray-300 text-center">No results found.</p>
          ) : (
            filtered.map((item, index) => (
              <div
                key={index}
                className="bg-white/95 rounded-xl px-6 py-4 shadow border border-gray-200 cursor-pointer"
                onClick={() => setOpen(open === index ? null : index)}
              >
                {/* Question */}
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    {item.q}
                  </h3>
                  <span className="text-gray-500">
                    {open === index ? "▲" : "▼"}
                  </span>
                </div>

                {/* Answer */}
                {open === index && (
                  <p className="text-gray-700 mt-4 border-t pt-4">
                    {item.a}
                  </p>
                )}
              </div>
            ))
          )}
        </div>

        {/* FOOTER */}
        {/* <footer className="text-gray-300 text-sm mt-16 mb-6">
          © 2025 Energy & Water Management Portal. All rights reserved.
        </footer> */}
      </div>
    </Layout>
  );
}
