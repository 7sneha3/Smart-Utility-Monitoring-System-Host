import React, { useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import toast from "react-hot-toast";

function StatBox({ title, value }) {
  return (<div className="bg-white/90 text-gray-900 p-6 rounded-lg shadow flex-1"> <div className="text-sm">{title}</div> <div className="text-2xl font-bold mt-2">
    {value} </div> </div>
  );
}

export default function Reports() {
  const [resourceType, setResourceType] = useState("all");
  const [subUtility, setSubUtility] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const ENERGY_UTILITIES = [
      "all",
      "Main Grid Supply",
      "Backup Diesel Generator",
      "Solar Panels"
  ];

  const WATER_UTILITIES = [
      "all",
      "Municipal Water Supply",
      "Groundwater Borewell",
      "Process Cooling Water",
      "Wastewater Discharge"
  ];

  const utilities =
    resourceType === "energy"
        ? ENERGY_UTILITIES
        : resourceType === "water"
        ? WATER_UTILITIES
        : [
            "all",
            ...ENERGY_UTILITIES.slice(1),
            ...WATER_UTILITIES.slice(1)
        ];

  const fetchReport = async () => {
    if (!fromDate || !toDate) {
        toast.error(
            "Please select both From Date and To Date."
        );
        return;
    }

    try {

      setLoading(true);

      const { data } =
        await axios.get(
          "http://127.0.0.1:5000/report-summary",
          {
            params: {

              type:
                resourceType,

              sub_utility:
                subUtility,

              from_date:
                fromDate || undefined,

              to_date:
                toDate || undefined
            }
          }
        );

        setSummary(data);

        if (data.records === 0) {
        
            setErrorMessage(
                "No records found for the selected date range."
            );
        
            setTimeout(() => {
        
                setErrorMessage("");
        
            }, 4000);
        
        } else {
        
            setErrorMessage("");
        }

    } catch (err) {

      console.error(err);

      alert(
        "Failed to generate report"
      );

    } finally {

      setLoading(false);
    }
  };

  const downloadReport = () => {
    const params =
      new URLSearchParams({
        type: resourceType,
        sub_utility: subUtility,
        from_date: fromDate,
        to_date: toDate
      });

    window.open(
      `http://127.0.0.1:5000/download-report?${params}`,
      "_blank"
    );
  };

  return (
  <Layout>
    <div
      className="min-h-screen p-6"
      style={{
        background:
          "linear-gradient(135deg, rgba(26,71,42,0.92) 0%, rgba(10,31,46,0.92) 50%, rgba(0,26,51,0.94) 100%)"
      }}>

      <div className="max-w-6xl mx-auto">
        <div className="text-center text-white mb-8">
          <h1 className="text-4xl font-bold">
            Reports Center
          </h1>

          <p className="text-gray-300 mt-2">
            Generate Utility Consumption Reports
          </p>
        </div>

        <div className=" bg-white/90 rounded-xl p-5 mb-8">
          <div
            className="
            grid
            md:grid-cols-5
            gap-4
          "
          >
            <select
              value={resourceType}
              onChange={(e) => {
                setResourceType(
                    e.target.value
                );
                setSubUtility("all");
            }}
              className="
              px-3
              py-2
              rounded-md
              border
            "
            >
              <option value="all">All Resources</option>
              <option value="energy">Energy</option>
              <option value="water">Water</option>
            </select>

            <select
              value={subUtility}
              onChange={(e) =>
                setSubUtility(
                  e.target.value
                )
              }
              className="
              px-3
              py-2
              rounded-md
              border
            "
            >
              {
                utilities.map(
                  (u) => (
                    <option
                      key={u}
                      value={u}
                    >
                      {u}
                    </option>
                  )
                )
              }
            </select>

            <input
              type="date"
              value={fromDate}
              onChange={(e) =>
                setFromDate(
                  e.target.value
                )
              }
              className="
              px-3
              py-2
              rounded-md
              border
            "
            />

            <input
              type="date"
              value={toDate}
              onChange={(e) =>
                setToDate(
                  e.target.value
                )
              }
              className="
              px-3
              py-2
              rounded-md
              border
            "
            />

            <button
              onClick={fetchReport}
              disabled={loading}
              className="
              bg-gradient-to-r
              from-green-400
              to-blue-500
              text-white
              rounded-md
              font-semibold
            "
            >
              {
                loading
                  ? "Generating..."
                  : "Generate Report"
              }
            </button>
          </div>
        </div>

        <div
          className="
          flex
          gap-4
          mb-8
        "
        >

          <StatBox
            title="Records Found"
            value={
              summary?.records ?? 0
            }
          />

          <StatBox
            title="Total Consumption"
            value={
              summary?.total_consumption?.toFixed?.(2) ?? "0.00"
            }
          />

          <StatBox
            title="Peak Consumption"
            value={
              summary?.peak_consumption?.toFixed?.(2) ?? "0.00"
            }
          />

          <StatBox
            title="Anomalies"
            value={
              summary?.anomalies ?? 0
            }
          />
        </div>

        {
            errorMessage && (

                <div
                    className="
                    bg-red-500/20
                    border
                    border-red-400/40
                    text-red-200
                    rounded-xl
                    p-4
                    mb-6
                    "
                >

                    ⚠ {errorMessage}

                    <br />

                    Please select another date range.

                </div>

            )
        }

        {
          summary && summary.records > 0 &&(

            <div
              className="
              bg-white
              rounded-2xl
              p-8
              shadow-lg
            "
            >

              <div
                className="
                flex
                justify-between
                items-center
                mb-6
              "
              >

                <h2
                  className="
                  text-2xl
                  font-bold
                "
                >
                  Utility Consumption Report
                </h2>

                <button
                  onClick={downloadReport}
                  disabled={summary?.records === 0}
                  className={`
                    px-5 py-2 text-white rounded-md
                    ${
                      summary?.records === 0
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-green-500"
                    }
                    `}
                >
                  Download Excel
                </button>
              </div>

              <div
                className="
                grid
                md:grid-cols-2
                gap-4
              "
              >

                <div>
                  <p>
                    <strong>
                      Resource Type:
                    </strong>
                    {" "}
                    {
                      summary.resource_type
                    }
                  </p>

                  <p>
                    <strong>
                      Sub Utility:
                    </strong>
                    {" "}
                    {
                      summary.sub_utility
                    }
                  </p>

                  <p>
                    <strong>
                      From:
                    </strong>
                    {" "}
                    {
                      summary.from_date
                    }
                  </p>

                  <p>
                    <strong>
                      To:
                    </strong>
                    {" "}
                    {
                      summary.to_date
                    }
                  </p>
                </div>

                <div>
                  <p>
                    <strong>
                      Report Type:
                    </strong>
                    {" "}
                    {
                      summary.report_type
                    }
                  </p>

                  <p>
                    <strong>
                      Records:
                    </strong>
                    {" "}
                    {
                      summary.records
                    }
                  </p>

                  <p>
                    <strong>
                      Anomalies:
                    </strong>
                    {" "}
                    {
                      summary.anomalies
                    }
                  </p>

                  <p>
                    <strong>
                    Threshold Used:
                    </strong>
                    {" "}
                    {
                      summary.threshold
                    }
                    <strong>(Computed using {summary.resource_type} historical records)</strong>
                  </p>
                </div>
              </div>

              <hr className="my-6" />

              <div
                className="
                grid
                md:grid-cols-3
                gap-4
              "
              >

                <div
                  className="
                  bg-gray-50
                  p-4
                  rounded-lg
                "
                >

                  <div>Total Consumption</div>

                  <div
                    className="
                    text-2xl
                    font-bold
                  "
                  >

                    {
                      summary.total_consumption
                    }

                  </div>
                </div>

                <div
                  className="
                  bg-gray-50
                  p-4
                  rounded-lg
                "
                >

                  <div>Average Consumption</div>
                  <div
                    className="
                    text-2xl
                    font-bold
                  "
                  >
                    {
                      summary.avg_consumption
                    }
                  </div>
                </div>

                <div
                  className="
                  bg-gray-50
                  p-4
                  rounded-lg
                "
                >
                  <div>Peak Consumption</div>
                  <div
                    className="
                    text-2xl
                    font-bold
                  "
                  >
                    {
                      summary.peak_consumption
                    }
                  </div>
                </div>
              </div>
            </div>
          )
        }
      </div>
    </div>
  </Layout>
    );
  }
