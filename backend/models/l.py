import numpy as np
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense


# def run_lstm(df):
    
#     values = df['value'].values

#     X, y = [], []
#     window = 10

#     for i in range(len(values) - window):
#         X.append(values[i:i+window])
#         y.append(values[i+window])

#     X = np.array(X)
#     y = np.array(y)

#     X = X.reshape((X.shape[0], window, 1))

#     model = Sequential()
#     model.add(LSTM(50, input_shape=(window, 1)))
#     model.add(Dense(1))

#     model.compile(optimizer='adam', loss='mse')

#     model.fit(X, y, epochs=8, batch_size=16, verbose=0)

#     pred = model.predict(X).flatten()

#     errors = np.abs(y - pred)

#     threshold = float(np.mean(errors) + 2*np.std(errors))

#     alerts = []

#     for i in range(len(errors)):
#         if errors[i] > threshold:
#             alerts.append({
#                 "day": int(i),
#                 "actual": float(y[i]),
#                 "predicted": float(pred[i]),
#                 "message": "Abnormal consumption detected"
#             })

#     return threshold, alerts, pred.tolist()

def run_lstm(df):

    values = df['value'].values

    if len(values) < 5:
        return 0, [], []

    X, y = [], []
    window = min(5, len(values)-1)

    for i in range(len(values)-window):
        X.append(values[i:i+window])
        y.append(values[i+window])

    X = np.array(X)
    y = np.array(y)

    X = X.reshape((X.shape[0], window, 1))

    model = Sequential()
    model.add(LSTM(20, input_shape=(window,1)))
    model.add(Dense(1))

    model.compile(optimizer='adam', loss='mse')

    model.fit(X, y, epochs=5, verbose=0)

    pred = model.predict(X).flatten()

    errors = np.abs(y - pred)

    threshold = float(np.mean(errors) + 2*np.std(errors))

    alerts = []

    for i in range(len(errors)):
        if errors[i] > threshold:
            alerts.append({
                "day": i,
                "actual": float(y[i]),
                "predicted": float(pred[i]),
                "message": "Abnormal consumption detected"
            })

    return threshold, alerts, pred.tolist()