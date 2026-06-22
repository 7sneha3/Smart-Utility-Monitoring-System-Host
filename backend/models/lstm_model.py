import numpy as np
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from tensorflow.keras.callbacks import EarlyStopping


def run_lstm(df):
    """
    LSTM-based anomaly detector for time-series consumption data.

    Args:
        df: DataFrame with columns ['day', 'value'] — already grouped & sorted by day.

    Returns:
        threshold (float)   — anomaly cutoff level
        alerts    (list)    — list of dicts for each anomalous day
        pred_full (list)    — LSTM predictions aligned to df rows (NaN-padded for window gap)
    """

    values = df["value"].values.astype(float)
    days   = df["day"].values
    n      = len(values)

    # ── Minimum data guard ───────────────────────────────────────────────────
    if n < 10:
        return 0.0, [], [None] * n

    # ── 1. Normalize to [0, 1] ───────────────────────────────────────────────
    scaler = MinMaxScaler()
    values_scaled = scaler.fit_transform(values.reshape(-1, 1)).flatten()

    # ── 2. Choose window size ────────────────────────────────────────────────
    # Rule: ~20 % of data, minimum 5, maximum 14
    window = max(5, min(14, int(n * 0.20)))

    # ── 3. Build sliding-window sequences ───────────────────────────────────
    X, y = [], []
    for i in range(n - window):
        X.append(values_scaled[i : i + window])
        y.append(values_scaled[i + window])

    X = np.array(X).reshape(-1, window, 1)   # (samples, timesteps, features)
    y = np.array(y)

    # ── 4. Train / test split (80 / 20, minimum 1 test sample) ──────────────
    split = max(1, int(len(X) * 0.80))
    X_train, X_test = X[:split], X[split:]
    y_train, y_test = y[:split], y[split:]

    # ── 5. Build LSTM ────────────────────────────────────────────────────────
    model = Sequential([
        LSTM(64, input_shape=(window, 1), return_sequences=True),
        Dropout(0.2),
        LSTM(32),
        Dropout(0.2),
        Dense(1)
    ])
    model.compile(optimizer="adam", loss="mse")

    early_stop = EarlyStopping(
        monitor="val_loss", patience=5, restore_best_weights=True
    )

    model.fit(
        X_train, y_train,
        epochs=60,
        batch_size=max(4, min(16, split // 4)),
        validation_data=(X_test, y_test) if len(X_test) > 0 else None,
        callbacks=[early_stop] if len(X_test) > 0 else [],
        verbose=0
    )

    # ── 6. Predict on ALL sequences ──────────────────────────────────────────
    pred_scaled = model.predict(X, verbose=0).flatten()

    # Inverse-transform back to original scale
    pred_values = scaler.inverse_transform(
        pred_scaled.reshape(-1, 1)
    ).flatten()
    actual_values = scaler.inverse_transform(
        y.reshape(-1, 1)
    ).flatten()

    # ── 7. Compute errors & threshold ────────────────────────────────────────
    # Changed threshold to be absolute consumption mean + 2 std, 
    # instead of prediction error threshold, for front-end graph alignment.
    errors    = np.abs(actual_values - pred_values)
    mean_val  = np.mean(actual_values)
    std_val   = np.std(actual_values)
    threshold = float(mean_val + 2 * std_val)

    # ── 8. Collect alerts (use real day labels) ───────────────────────────────
    alerts = []
    for i in range(len(actual_values)):
        if actual_values[i] > threshold:
            real_day = str(days[i + window])   # +window = the target day index
            alerts.append({
                "day":       real_day,
                "actual":    round(float(actual_values[i]), 4),
                "predicted": round(float(pred_values[i]),  4),
                "error":     round(float(errors[i]),       4),
                "message":   "Abnormal consumption detected"
            })

    # ── 9. Build a full-length prediction list (None for first `window` days) ─
    pred_full = [None] * window + [round(float(v), 4) for v in pred_values]

    return threshold, alerts, pred_full
