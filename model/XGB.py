import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import classification_report, roc_auc_score
from sklearn.preprocessing import StandardScaler
from joblib import load, dump
import pickle

df_train = pd.read_csv('features/FM_train_35.csv')
df_test = pd.read_csv('features/FM_Test_35.csv')

WINDOW_SIZE = 35


X_train = df_train.iloc[:, :-1]
y_train = df_train.iloc[:, -1]

X_test = df_test.iloc[:, :-1]
y_test = df_test.iloc[:, -1]


# Load scaler
scaler = load(f'features/scaler_{WINDOW_SIZE}.joblib')
X_train = scaler.transform(X_train)
X_test = scaler.transform(X_test)

xgb = GradientBoostingClassifier(n_estimators=1000, max_depth=6, verbose=1)

xgb.fit(X_train, y_train)

y_pred = xgb.predict(X_test)

print(classification_report(y_test, y_pred))
print(roc_auc_score(y_test, xgb.predict_proba(X_test)[:, 1]))

# Save the model
with open(f'XGB_{WINDOW_SIZE}.pkl', 'wb') as f:
    pickle.dump(xgb, f)



