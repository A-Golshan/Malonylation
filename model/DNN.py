import numpy as np
import pandas as pd
from sklearn.metrics import classification_report, roc_auc_score
from sklearn.model_selection import train_test_split
from joblib import load

from keras.models import Sequential, Model, save_model, load_model
from keras.layers import Dense, Flatten, Conv1D, MaxPooling1D, Dropout, BatchNormalization
import tensorflow as tf


df_train = pd.read_csv('features/FM_train_35.csv')
df_test = pd.read_csv('features/FM_Test_35.csv')

WINDOW_SIZE = 35


X_train = df_train.iloc[:, :-1]
y_train = df_train.iloc[:, -1]

X_test = df_test.iloc[:, :-1]
y_test = df_test.iloc[:, -1]

X_train, X_valid, y_train, y_valid = train_test_split(X_train, y_train, test_size=0.2, stratify=y_train, shuffle=True)

# Load scaler
scaler = load(f'features/scaler_{WINDOW_SIZE}.joblib')


X_train = scaler.transform(X_train)
X_test = scaler.transform(X_test)
X_valid = scaler.transform(X_valid)

dnn = Sequential()
dnn.add(Dense(512, activation = 'relu', input_dim=X_train.shape[1]))
dnn.add(BatchNormalization())
dnn.add(Dropout(0.5))
dnn.add(Dense(256, activation = 'relu'))
dnn.add(BatchNormalization())
dnn.add(Dropout(0.4))
dnn.add(Dense(128, activation = 'relu'))
dnn.add(BatchNormalization())
dnn.add(Dropout(0.4))
dnn.add(Dense(64, activation = 'relu'))
dnn.add(BatchNormalization())
dnn.add(Dropout(0.4))
dnn.add(Dense(128, activation = 'relu'))
dnn.add(BatchNormalization())
dnn.add(Dropout(0.4))
dnn.add(Dense(256, activation = 'relu'))
dnn.add(BatchNormalization())
dnn.add(Dropout(0.5))
dnn.add(Dense(2, activation = 'softmax'))

dnn.compile(loss = tf.keras.losses.sparse_categorical_crossentropy, optimizer = 'Adam', metrics =['accuracy'])

dnn.fit(X_train, y_train, epochs=50, validation_data=(X_valid, y_valid))

y_pred = dnn.predict(X_test)

print(classification_report(y_test, np.argmax(y_pred, axis=1)))
print(roc_auc_score(y_test, y_pred[:, 1]))

save_model(
    dnn,
    f'DNN_{WINDOW_SIZE}',
    overwrite=True,
    include_optimizer=True
)

# model = load_model('./trained models/DNN')

# y_pred = model.predict(X_test)

# print(classification_report(y_test, np.argmax(y_pred, axis=1)))
# print(roc_auc_score(y_test, y_pred[:, 1]))



