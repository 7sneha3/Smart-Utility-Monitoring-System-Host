from flask import Blueprint, request, jsonify
from database.mongodb import collection
import pandas as pd
from models.svr_model import prepare_features, run_svr
from models.lstm_model import run_lstm

dashboard_bp = Blueprint("dashboard", __name__)

@dashboard_bp.route("/consumption", methods=["GET"])
def get_consumption():

    resource_type = request.args.get("type")
    month = int(request.args.get("month"))
    sub_utility = request.args.get("sub_utility")

    query = {"resource_type": resource_type}

    if sub_utility:
        query["sub_utility"] = sub_utility.lower()

    data = list(collection.find(query))

    df = pd.DataFrame(data)

    if df.empty:
        return jsonify([])

    df["timestamp"] = pd.to_datetime(df["timestamp"])

    df = df[df["timestamp"].dt.month == month]

    df["day"] = df["timestamp"].dt.day

    grouped = df.groupby("day")["value"].sum().reset_index()

    return jsonify(grouped.to_dict(orient="records"))

# @dashboard_bp.route("/analyze", methods=["GET"])
# def analyze():

#     resource_type = request.args.get("type")
#     month = int(request.args.get("month"))
#     sub_utility = request.args.get("sub_utility")

#     query = {"resource_type": resource_type}

#     if sub_utility and sub_utility.strip() != "":
#         query["sub_utility"] = sub_utility.lower()

#     data = list(collection.find(query))

#     df = pd.DataFrame(data)

#     if df.empty or "timestamp" not in df.columns:
#         return jsonify({
#             "error": "No valid data found",
#             "data": []
#         }), 400

#     df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce")

#     # filter month
#     df = df[df["timestamp"].dt.month == month]

#     if len(df) < 50:
#         return jsonify({"error": "Not enough data"})

#     # group daily
#     df["day"] = df["timestamp"].dt.day
#     df = df.groupby("day")["value"].sum().reset_index()

#     df["timestamp"] = pd.to_datetime(df["timestamp"])

#     # ---------------- ML ----------------
#     # DO NOT FILTER BEFORE TRAINING

#     df_full = df.copy()

#     # TRAIN MODEL ON FULL DATA
#     df_ml = prepare_features(df_full)

#     predictions = run_svr(df_ml)
#     threshold, alerts, _ = run_lstm(df_ml)

#     # NOW FILTER FOR DISPLAY
#     df_display = df[df["timestamp"].dt.month == month]

#     df_display["day"] = df_display["timestamp"].dt.day
#     df_display = df_display.groupby("day")["value"].sum().reset_index()

#     if df_ml.empty:
#         return jsonify({
#             "message": "Not enough data for ML, showing raw consumption",
#             "actual": df["value"].tolist(),
#             "predictions": [],
#             "alerts": []
#         })

#     predictions = run_svr(df_ml)

#     threshold, alerts, lstm_pred = run_lstm(df_ml)

#     return jsonify({
#         "days": df_ml["day"].tolist(),
#         "actual": df_ml["value"].tolist(),
#         "predictions": predictions[:len(df_ml)],
#         "threshold": threshold,
#         "alerts": alerts
#     })

@dashboard_bp.route("/analyze", methods=["GET"])
def analyze():
    try:
        resource_type = request.args.get("type")
        # default forecast to 30 if not provided
        forecast_days = int(request.args.get("forecast_days", 30))
        sub_utility = request.args.get("sub_utility")

        query = {"resource_type": resource_type}
        if sub_utility and sub_utility.strip() != "":
            query["sub_utility"] = sub_utility.lower()

        data = list(collection.find(query))

        if not data:
            return jsonify({"error": "No data found in database"}), 400

        data = [d for d in data if "timestamp" in d and "value" in d]
        if not data:
            return jsonify({"error": "No valid records"}), 400

        df = pd.DataFrame(data)
        df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce")
        df = df.dropna(subset=["timestamp", "value"])

        # Fix Time series squashing by grouping by DATE
        df["date"] = df["timestamp"].dt.date
        df = df.groupby("date")["value"].sum().reset_index()
        df["timestamp"] = pd.to_datetime(df["date"])
        # Format the day label for graphs
        df["day"] = df["timestamp"].dt.strftime("%b %d")

        df = df.sort_values("timestamp").reset_index(drop=True)

        # ----------------------------
        # ✅ TRAIN ON FULL DATA
        # ----------------------------
        df_ml = prepare_features(df)
        if df_ml.empty:
            return jsonify({"error": "Not enough data for ML"}), 400

        # SVR Forecasting
        historical_preds, future_preds, hist_days, fut_days = run_svr(df_ml, forecast_days)

        # LSTM Anomaly Detection (Historical only)
        threshold, alerts, _ = run_lstm(df_ml)

        # Combine arrays for the graph
        # actuals array: historical values + [null, null...] for future dates
        all_days = hist_days + fut_days
        actual_vals = df_ml["value"].tolist() + [None] * len(future_preds)
        all_predictions = historical_preds + future_preds

        response_data = {
            "days": all_days,
            "actual": actual_vals,
            "predictions": all_predictions,
            "threshold": threshold,
            "alerts": alerts,
            "model_trained_on": len(df_ml)
        }

        # Save generated predictions implicitly into Mongo
        db_reports = collection.database["reports"]
        db_reports.update_one(
            {"resource_type": resource_type, "sub_utility": sub_utility},
            {"$set": response_data},
            upsert=True
        )

        return jsonify(response_data)

    except Exception as e:
        print("❌ ANALYZE ERROR:", str(e))
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500