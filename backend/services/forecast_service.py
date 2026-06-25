from services.dashboard_service import (
    get_consumption_trend
)

import pandas as pd
import numpy as np

from database.mongodb import utility_collection
from sklearn.svm import SVR
from sklearn.preprocessing import StandardScaler

# Confidence Function
def get_confidence(record_count):

    if record_count < 120:
        return "Low"

    elif record_count <= 250:
        return "Medium"

    return "High"

# Main Function Skeleton
def get_forecast(resource_type, sub_utility, forecast_days):
    print(
        utility_collection.find_one()
    )

    print("RESOURCE TYPE =", resource_type)
    print("SUB UTILITY =", sub_utility)

    # Fetch trend
    trend = get_consumption_trend(
        resource_type,
        sub_utility
    )

    print("TREND =", trend[:5])
    print("TREND COUNT =", len(trend))

    # Convert to dataframe
    df = pd.DataFrame(trend)

    # if no data for respective utility
    if df.empty:

        return {

            "forecast_available": False,

            "records_used": 0,

            "message":
                f"No data available for {resource_type}"
        }
    
    # sort
    df["date"] = pd.to_datetime(
        df["date"]
    )

    df = df.sort_values(
        "date"
    )

    # Record Validation
    record_count = len(df)

    if record_count < 60:

        return {

            "forecast_available": False,

            "records_used":
                record_count,

            "message":
                "Minimum 60 records required"
        }
    
    record_count = len(trend)

    # Feature Engineering
    df["lag1"] = (
        df["consumption"]
        .shift(1)
    )

    df["lag2"] = (
        df["consumption"]
        .shift(2)
    )

    df["lag3"] = (
        df["consumption"]
        .shift(3)
    )

    df["lag7"] = (
        df["consumption"]
        .shift(7)
    )

    # Calendar features
    df["month"] = (
        df["date"]
        .dt.month
    )

    df["dayofweek"] = (
        df["date"]
        .dt.dayofweek
    )

    # Remove nulls
    df = df.dropna()

    # Training Data
    X = df[[
        "lag1",
        "lag2",
        "lag3",
        "lag7",
        "month",
        "dayofweek"
    ]]

    y = df["consumption"]

    # Time Series Split
    split_index = int(
        len(df) * 0.8
    )

    X_train = X.iloc[:split_index]
    X_test = X.iloc[split_index:]

    y_train = y.iloc[:split_index]
    y_test = y.iloc[split_index:]

    # Scaling
    scaler = StandardScaler()

    X_train_scaled = (
        scaler.fit_transform(
            X_train
        )
    )

    X_test_scaled = (
        scaler.transform(
            X_test
        )
    )

    # Train SVR
    model = SVR(

        kernel="rbf",

        C=100,

        epsilon=0.1,

        gamma="scale"
    )

    model.fit(
        X_train_scaled,
        y_train
    )

    # Future Prediction
    future_dates = []
    future_predictions = []

    last_date = df["date"].iloc[-1]

    history = list(df["consumption"].values)

    for step in range(forecast_days):

        next_date = last_date + pd.Timedelta(days=step + 1)

        lag1 = history[-1]
        lag2 = history[-2]
        lag3 = history[-3]
        lag7 = history[-7]

        month = next_date.month
        dayofweek = next_date.dayofweek

        feature_row = pd.DataFrame([{
            "lag1": lag1,
            "lag2": lag2,
            "lag3": lag3,
            "lag7": lag7,
            "month": month,
            "dayofweek": dayofweek
        }])

        feature_scaled = scaler.transform(
            feature_row
        )

        prediction = model.predict(
            feature_scaled
        )[0]

        prediction = round(
            float(prediction),
            2
        )

        future_dates.append(
            next_date.strftime("%Y-%m-%d")
        )

        future_predictions.append(
            prediction
        )

        history.append(
            prediction
        )   

    # Confidence
    confidence = get_confidence(
        record_count
    ) 

    if forecast_days == 7:
        display_window = 40
    else:
        display_window = 70   


    # Build Graph Arrays: Historical arrays:
    historical_dates = (
        df["date"]
        .dt.strftime("%Y-%m-%d")
        .tolist()
    )

    historical_values = (
        df["consumption"]
        .round(2)
        .tolist()
    )

    historical_dates = historical_dates[-display_window:]
    historical_values = historical_values[-display_window:]

    # Bridge Point
    bridge_date = historical_dates[-1]

    bridge_value = historical_values[-1]

    # forecast arrays
    forecast_dates = [
        bridge_date
    ] + future_dates

    forecast_values = [
        bridge_value
    ] + future_predictions

    # Combined Arrays For Frontend
    all_dates = []
    actual_values = []
    predicted_values = []

    # Historical portion
    for idx, (d, v) in enumerate(
        zip(
            historical_dates,
            historical_values
        )
    ):

        all_dates.append(d)

        actual_values.append(v)

        if idx == len(historical_dates) - 1:
            predicted_values.append(v)   # bridge point
        else:
            predicted_values.append(None)

    # Forecast portion
    for d, pred in zip(
        future_dates,
        future_predictions
    ):

        all_dates.append(d)

        actual_values.append(None)

        predicted_values.append(pred)

    # Optional Bridge Connection
    # for idx, (d, v) in enumerate(
    #     zip(
    #         historical_dates,
    #         historical_values
    #     )
    # ):

    #     all_dates.append(d)

    #     actual_values.append(v)

    #     if idx == len(historical_dates) - 1:
    #         predicted_values.append(v)
    #     else:
    #         predicted_values.append(None)

    print("len of all_dates", len(all_dates))
    print("len of actual dates", len(actual_values))
    print("len of predicted values", len(predicted_values))
    print("len of actual values", actual_values[-10:])
    print("-10 predicted values", predicted_values[-10:])
    print("future_predictions values", future_predictions)

    print("historical_dates values", len(historical_dates))
    print("future_dates values", len(future_dates))
    print("forecast_dates values", len(forecast_dates))
    print("all_dates 3 values", all_dates[:3])
    print("all_dates -10 values", all_dates[-10:])
    print("-20 predicted values", predicted_values[-20:])
    print("-35 predicted values", predicted_values[-35:])

    #return 
    return {

        "forecast_available": True,
        "forecast_start_date": future_dates[0],

        "model": "SVR",

        "confidence": confidence,

        "records_used": record_count,

        "days": all_dates,

        "actual": actual_values,

        "predicted": predicted_values
    }