import numpy as np
from sklearn.svm import SVR
from sklearn.preprocessing import StandardScaler


# def prepare_features(df):

#     df = df.copy()

#     # lag features
#     for i in range(1, 13):
#         df[f'lag{i}'] = df['value'].shift(i)

#     # rolling
#     df['rolling_mean_7'] = df['value'].rolling(7).mean()
#     df['rolling_mean_30'] = df['value'].rolling(30).mean()
#     df['rolling_std_7'] = df['value'].rolling(7).std()

#     # time features
#     df['month'] = df['timestamp'].dt.month
#     df['dayofweek'] = df['timestamp'].dt.dayofweek

#     df['month_sin'] = np.sin(2*np.pi*df['month']/12)
#     df['month_cos'] = np.cos(2*np.pi*df['month']/12)

#     df = df.dropna()

#     return df

def prepare_features(df):

    df = df.copy()

    n = len(df)

    # -----------------------------
    # ADAPTIVE LAG
    # -----------------------------
    if n >= 20:
        max_lag = 12
    elif n >= 10:
        max_lag = 5
    elif n >= 5:
        max_lag = 2
    else:
        max_lag = 1

    # create lag features
    for i in range(1, max_lag + 1):
        df[f'lag{i}'] = df['value'].shift(i)

    # rolling (only if enough data)
    if n >= 7:
        df['rolling_mean_7'] = df['value'].rolling(7).mean()
        df['rolling_std_7'] = df['value'].rolling(7).std()

    if n >= 10:
        df['rolling_mean_30'] = df['value'].rolling(10).mean()

    # time features
    df['month'] = df['timestamp'].dt.month
    df['dayofweek'] = df['timestamp'].dt.dayofweek

    df['month_sin'] = np.sin(2*np.pi*df['month']/12)
    df['month_cos'] = np.cos(2*np.pi*df['month']/12)

    df = df.dropna()

    return df

# def run_svr(df):

    feature_cols = (
        [f'lag{i}' for i in range(1, 13)] +
        [
            'rolling_mean_7',
            'rolling_mean_30',
            'rolling_std_7',
            'month_sin',
            'month_cos',
            'dayofweek'
        ]
    )

    X = df[feature_cols]
    y = df['value']

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    model = SVR(kernel='rbf', C=700, gamma=0.03, epsilon=0.05)
    model.fit(X_scaled, y)

    predictions = model.predict(X_scaled)

    return predictions.tolist()

def run_svr(df):

    # dynamically pick lag columns
    lag_cols = [col for col in df.columns if "lag" in col]

    feature_cols = lag_cols + [
        col for col in [
            'rolling_mean_7',
            'rolling_mean_30',
            'rolling_std_7',
            'month_sin',
            'month_cos',
            'dayofweek'
        ] if col in df.columns
    ]

    X = df[feature_cols]
    y = df['value']

    if len(X) == 0:
        return []

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    model = SVR(kernel='rbf', C=100, gamma=0.1)
    model.fit(X_scaled, y)

    predictions = model.predict(X_scaled)

    return predictions.tolist()