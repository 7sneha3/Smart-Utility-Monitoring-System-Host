from services.dashboard_service import (
    get_anomalies
)

result = get_anomalies(
    "energy"
)

print(
    "Threshold:",
    result["threshold"]
)

print(
    "Anomaly Count:",
    result["anomaly_count"]
)

print(
    "\nAnomalies:"
)

for anomaly in result["anomalies"]:

    print(anomaly)