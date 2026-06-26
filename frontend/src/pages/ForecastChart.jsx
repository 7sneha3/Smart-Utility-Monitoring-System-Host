import {
    ResponsiveContainer,
    ComposedChart,
    Line,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Legend,
    ReferenceLine,
    ReferenceArea
} from "recharts";
import axios from "axios";

export default function ForecastChart({
    Card,
    C,
    fmt,
    resourceType,
    forecastDays,
    setForecastDays, 
    forecastData,
    forecastLoading

    
}) {
    if (forecastLoading) {
        return (
            <Card
                style={{
                    height: 420,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }}
            >
                Loading Forecast...
            </Card>
        );
    }

    if (!forecastData) {
        return (
            <Card
                style={{
                    height: 420,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }}
            >
                No Forecast Data
            </Card>
        );
    }

    if (!forecastData.forecast_available) {

        return (
            <Card
                style={{
                    height: 420,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }}
            >
                <div style={{ textAlign: "center" }}>
    
                    <div style={{ fontSize: 42 }}>
                        ⚠️
                    </div>
    
                    <div
                        style={{
                            fontWeight: 700,
                            marginBottom: 8
                        }}
                    >
                        Forecast Unavailable
                    </div>
    
                    <div>
                        {forecastData.message}
                    </div>
    
                    <div>
                        Records:
                        {" "}
                        {forecastData.records_used}
                    </div>
    
                </div>
            </Card>
        );
    }


    const chartData =
    forecastData.days.map(
        (
            day,
            index
        ) => ({

            day:
                day.slice(5),

            actual:
                forecastData.actual[index],

            predicted:
                forecastData.predicted[index]

        })
    );

    const forecastStartIndex =
    chartData.findIndex(
        row =>
            row.actual === null &&
            row.predicted !== null
    );

    const forecastStartDate =
        forecastStartIndex >= 0
            ? chartData[forecastStartIndex].day
            : null;

    const lastForecastDate =
        chartData[
            chartData.length - 1
        ]?.day;

        const CustomTooltip = ({ active, payload, label }) => {
            if (!active || !payload?.length) return null;

            return (
                <div
                    style={{
                        background: "#fff",
                        border: "1px solid #E5E7EB",
                        borderRadius: 10,
                        padding: "12px 14px",
                        boxShadow: "0 6px 20px rgba(0,0,0,0.08)"
                    }}
                    >
                <div
                    style={{
                    color: C.cardTitle,
                    fontWeight: 600,
                    marginBottom: 8
                    }}
                >
                    {label}
                </div>

                {payload.find(p => p.dataKey === "actual")?.value != null && (
                    <div
                    style={{
                        color: C.blue,
                        fontWeight: 600,
                        marginBottom: 6
                    }}
                    >
                    Actual Consumption :{" "}
                    {fmt(payload.find(p => p.dataKey === "actual").value)}
                    </div>
                )}

                {payload.find(p => p.dataKey === "predicted")?.value != null && (
                    <div
                    style={{
                        color: "#F97316",
                        fontWeight: 600
                    }}
                    >
                    Hybrid SVR-LSTM Forecast :{" "}
                    {fmt(payload.find(p => p.dataKey === "predicted").value)}
                    </div>
                )}
                </div>
            );
            };

    return (
        <Card style={{ padding: "22px 24px" }}>

            {/* Header */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 18
                }}
            >
                <div>
                    <div
                        style={{
                            color: C.cardTitle,
                            fontWeight: 700,
                            fontSize: 16
                        }}
                    >
                        Forecast: Actual vs Hybrid SVR-LSTM Prediction
                    </div>

                    <div
                        style={{
                            color: C.cardMuted,
                            fontSize: 12,
                            marginTop: 2
                        }}
                    >
                        Based on historical utility consumption
                    </div>
                </div>

                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>

                    <select
                        value={forecastDays}
                        onChange={(e) => setForecastDays(Number(e.target.value))}
                        style={{
                            background: "none",
                            border: `1px solid ${C.cardBorder}`,
                            borderRadius: 8,
                            padding: "4px 8px",
                            color: C.cardTitle,
                            fontSize: 12,
                            fontWeight: 600,
                            outline: "none",
                            cursor: "pointer"
                        }}
                    >
                        <option value={7}>Next 7 Days</option>
                        <option value={30}>Next 30 Days</option>
                    </select>

                    {/* <div
                        style={{
                            background: "rgba(34,197,94,0.10)",
                            border: "1px solid rgba(34,197,94,0.25)",
                            borderRadius: 8,
                            padding: "4px 12px",
                            color: C.greenDark,
                            fontSize: 12,
                            fontWeight: 600
                        }}
                    >
                       Confidence:{" "}{forecastData.confidence}
                    </div> */}

                    {/* for dynamic confidence, changes color */}
                    <div
                        style={{
                            background:
                            forecastData.confidence === "High"
                                ? "rgba(34,197,94,0.10)"
                                : forecastData.confidence === "Medium"
                                ? "rgba(245,158,11,0.10)"
                                : "rgba(239,68,68,0.10)",

                            border:
                            forecastData.confidence === "High"
                                ? "1px solid rgba(34,197,94,0.25)"
                                : forecastData.confidence === "Medium"
                                ? "1px solid rgba(245,158,11,0.25)"
                                : "1px solid rgba(239,68,68,0.25)",

                            color:
                            forecastData.confidence === "High"
                                ? C.greenDark
                                : forecastData.confidence === "Medium"
                                ? C.amber
                                : C.red,
                            borderRadius: 8,
                            padding: "4px 12px",
                            fontSize: 12,
                            fontWeight: 600
                        }}
                        >
                        Confidence:{" "}{forecastData.confidence}
                    </div>

                </div>
            </div>

            {/* Stats Row */}
            <div
                style={{
                    display: "flex",
                    gap: 20,
                    marginBottom: 16,
                    flexWrap: "wrap",
                    fontSize: 12
                }}
            >
                <span>
                    <strong>Model:</strong> Hybrid SVR-LSTM
                </span>

                <span>
                    <strong>Records:</strong> {" "}{forecastData.records_used}
                </span>

                <span>
                    <strong>Features:</strong> 6
                </span>
            </div>

            {/* Graph */}
            <div
                style={{
                    width: "100%",
                    height: "270px",
                    minHeight: "270px"
                }}
            >
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                        data={chartData}
                        margin={{
                            top: 6,
                            right: 14,
                            left: 0,
                            bottom: 0
                        }}
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke={C.chartGrid}
                            vertical={false}
                        />

                        {/* <XAxis
                            dataKey="day"
                            tick={{ fill: C.chartAxis, fontSize: 11 }}
                            tickLine={false}
                        /> */}

                        {/* without year dates */}
                        {/* <XAxis
                            dataKey="day"
                            tick={{ fill: C.chartAxis, fontSize: 11 }}
                            tickLine={false}
                            tickFormatter={(value) => {
                                const date = new Date(value);

                                return date.toLocaleDateString("en-GB", {
                                    day: "numeric",
                                    month: "short"
                                });
                            }}
                        /> */}

                        {/* with year date */}
                        <XAxis
                            dataKey="day"
                            tick={{
                                fill: C.chartAxis,
                                fontSize: 11
                            }}
                            tickLine={false}
                            minTickGap={35}
                            interval="preserveStartEnd"
                            tickFormatter={(value) => {
                                const date = new Date(value);

                                return date.toLocaleDateString("en-GB", {
                                    day: "numeric",
                                    month: "short",
                                    year: "2-digit"
                                });
                            }}
                        />

                        <YAxis
                            tick={{ fill: C.chartAxis, fontSize: 11 }}
                            tickLine={false}
                            axisLine={false}
                        />

                        <Tooltip content={<CustomTooltip />} />

                        <Legend />

                        <defs>
                            <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={C.blue} stopOpacity={0.22} />
                                <stop offset="95%" stopColor={C.blue} stopOpacity={0} />
                            </linearGradient>

                            <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#F97316" stopOpacity={0.20} />
                                <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                            </linearGradient>
                        </defs>

                        {forecastStartDate && (
    <>
                            <ReferenceArea
                                x1={forecastStartDate}
                                x2={lastForecastDate}
                                fill="#F97316"
                                fillOpacity={0.04}
                            />

                            <ReferenceLine
                                x={forecastStartDate}
                                stroke="#94A3B8"
                                strokeDasharray="4 4"
                                label={{
                                    value: "Forecast Start",
                                    position: "insideTop",
                                    fill: "#64748B",
                                    fontSize: 12
                                }}
                            />
                        </>
                    )}
                        {/* Actual */}
                        <Area
                            type="monotone"
                            dataKey="actual"
                            fill="url(#colorActual)"
                            stroke="none"
                            connectNulls={false}
                            legendType="none"
                        />

                        <Line
                            type="monotone"
                            dataKey="actual"
                            stroke={C.blue}
                            strokeWidth={3}
                            dot={false}
                            connectNulls={false}
                            name="Actual Consumption"
                        />

                        {/* Forecast */}
                        <Area
                            type="monotone"
                            dataKey="predicted"
                            fill="url(#colorForecast)"
                            stroke="none"
                            connectNulls={false}
                            legendType="none"
                        />

                        <Line
                            type="monotone"
                            dataKey="predicted"
                            stroke="#F97316"
                            strokeWidth={3}
                            dot={false}
                            activeDot={{
                                r: 5,
                                fill: "#F97316",
                                stroke: "#fff",
                                strokeWidth: 2
                            }}
                            connectNulls={false}
                            name="Hybrid SVR-LSTM Forecast"
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
}