import numpy as np
import pandas as pd
from sklearn.svm import SVR
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import GridSearchCV


# ──────────────────────────────────────────────────────────────────────────────
# Feature Engineering
# ──────────────────────────────────────────────────────────────────────────────

def prepare_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Build ML-ready features from a cleaned daily-aggregated DataFrame.

    Required input columns: ['day', 'timestamp', 'value']
    Returns: df with lag/rolling/time features, NaN rows dropped.
    """

    df = df.copy().sort_values("timestamp").reset_index(drop=True)
    n  = len(df)

    # ── Adaptive lag depth ────────────────────────────────────────────────────
    # Use up to 12 lags but never more than half the dataset
    max_lag = min(12, max(1, n // 2))

    for i in range(1, max_lag + 1):
        df[f"lag{i}"] = df["value"].shift(i)

    # ── Rolling statistics (only when enough history exists) ─────────────────
    if n >= 7:
        df["rolling_mean_7"] = df["value"].rolling(7, min_periods=3).mean()
        df["rolling_std_7"]  = df["value"].rolling(7, min_periods=3).std()
    if n >= 14:
        df["rolling_mean_14"] = df["value"].rolling(14, min_periods=5).mean()
    if n >= 30:
        df["rolling_mean_30"] = df["value"].rolling(30, min_periods=10).mean()

    # ── Time / seasonality features ───────────────────────────────────────────
    df["month"]      = df["timestamp"].dt.month
    df["dayofweek"]  = df["timestamp"].dt.dayofweek
    df["month_sin"]  = np.sin(2 * np.pi * df["month"] / 12)
    df["month_cos"]  = np.cos(2 * np.pi * df["month"] / 12)
    df["dow_sin"]    = np.sin(2 * np.pi * df["dayofweek"] / 7)
    df["dow_cos"]    = np.cos(2 * np.pi * df["dayofweek"] / 7)

    # Drop rows that still have NaN (from early lags / rolling)
    df = df.dropna().reset_index(drop=True)

    return df


# ──────────────────────────────────────────────────────────────────────────────
# SVR Training & Prediction
# ──────────────────────────────────────────────────────────────────────────────

def run_svr(df: pd.DataFrame, forecast_days: int = 30):
    """
    Train an SVR on engineered features and return predictions
    aligned to the ORIGINAL df rows, plus future predictions.

    Args:
        df: Output of prepare_features() — contains feature columns + 'value' + 'timestamp'.
        forecast_days: Number of days to forecast into the future.

    Returns:
        historical_preds (list): Predictions corresponding to the historical input days.
        future_preds (list): Predictions for the future days.
        historical_days (list): Date strings for historical data.
        future_days (list): Date strings for future data.
    """
    if df.empty or "timestamp" not in df.columns:
        return [], [], [], []

    lag_cols     = sorted([c for c in df.columns if c.startswith("lag")])
    rolling_cols = [c for c in df.columns if "rolling" in c]
    time_cols    = [c for c in ["month_sin", "month_cos", "dow_sin", "dow_cos",
                                "dayofweek"] if c in df.columns]

    feature_cols = lag_cols + rolling_cols + time_cols

    X = df[feature_cols].values
    y = df["value"].values

    historical_days = df["timestamp"].dt.strftime("%b %d").tolist()

    if len(X) < 3:
        # Not enough samples
        return df["value"].tolist(), [], historical_days, []

    # ── Scale ─────────────────────────────────────────────────────────────────
    scaler   = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # ── Train SVR ─────────────────────────────────────────────────────────────
    if len(X) >= 30:
        param_grid = {
            "C":       [10, 100, 500],
            "gamma":   ["scale", 0.01, 0.1],
            "epsilon": [0.01, 0.05, 0.1],
        }
        cv_folds = min(5, len(X) // 5)
        grid = GridSearchCV(
            SVR(kernel="rbf"),
            param_grid,
            cv=cv_folds,
            scoring="neg_mean_squared_error",
            n_jobs=-1,
            verbose=0,
        )
        grid.fit(X_scaled, y)
        model = grid.best_estimator_
    else:
        model = SVR(kernel="rbf", C=100, gamma="scale", epsilon=0.05)
        model.fit(X_scaled, y)

    # historical predictions
    raw_preds = model.predict(X_scaled)
    historical_preds = [round(float(p), 4) for p in raw_preds]

    # ── Predict Future Auto-regressively ──────────────────────────────────────
    future_preds = []
    future_days = []
    
    # We maintain a mock 'value' history to compute lags and rolling stats.
    # Start with the actual historical values appended with our new predictions.
    val_history = list(y)
    
    last_timestamp = df["timestamp"].iloc[-1]
    
    max_lag = len(lag_cols)
    
    for i in range(forecast_days):
        next_time = last_timestamp + pd.DateOffset(days=i+1)
        future_days.append(next_time.strftime("%b %d"))
        
        # Build features dictionary
        feat_dict = {}
        
        # Time features
        m = next_time.month
        d = next_time.dayofweek
        if "month_sin" in feature_cols: feat_dict["month_sin"] = np.sin(2 * np.pi * m / 12)
        if "month_cos" in feature_cols: feat_dict["month_cos"] = np.cos(2 * np.pi * m / 12)
        if "dow_sin" in feature_cols:   feat_dict["dow_sin"]   = np.sin(2 * np.pi * d / 7)
        if "dow_cos" in feature_cols:   feat_dict["dow_cos"]   = np.cos(2 * np.pi * d / 7)
        if "dayofweek" in feature_cols: feat_dict["dayofweek"] = d
        
        # Lags
        # lag1 is the most recent value, lag2 is the one before that, etc.
        for lag in range(1, max_lag + 1):
            if f"lag{lag}" in feature_cols:
                feat_dict[f"lag{lag}"] = val_history[-lag]
                
        # Rolling stats
        if "rolling_mean_7" in feature_cols:  feat_dict["rolling_mean_7"] = np.mean(val_history[-7:])
        if "rolling_std_7" in feature_cols:   feat_dict["rolling_std_7"]  = np.std(val_history[-7:]) if len(val_history) >= 7 else 0
        if "rolling_mean_14" in feature_cols: feat_dict["rolling_mean_14"] = np.mean(val_history[-14:])
        if "rolling_mean_30" in feature_cols: feat_dict["rolling_mean_30"] = np.mean(val_history[-30:])
            
        # Construct feature array
        X_next = [feat_dict.get(c, 0) for c in feature_cols]
        X_next_scaled = scaler.transform([X_next])
        
        # Predict
        pred = float(model.predict(X_next_scaled)[0])
        future_preds.append(round(pred, 4))
        
        # Append predicted value to history for the next iteration's lags/rolling stats
        val_history.append(pred)

    return historical_preds, future_preds, historical_days, future_days
