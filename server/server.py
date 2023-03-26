from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import pickle
from tensorflow.keras.models import load_model
from joblib import load


app = Flask(__name__)
CORS(app, resources={r"/predict": {"origins": "*"}})

# Load pre-trained models
DNN = load_model('models/DNN_35')
with open('models/XGB_35.pkl', 'rb') as f:
    XGB = pickle.load(f)
with open('models/RF_35.pkl', 'rb') as f:
    RF = pickle.load(f)
# with open('DT.pkl', 'rb') as f:
#     DT = pickle.load(f)
with open('models/SVM_35.pkl', 'rb') as f:
    SVM = pickle.load(f)


# Load scaler
scaler = load('models/scaler_35.joblib')

def prepareOutput(results, content):
	finalResult = []
	proteinNumber = 1
	resultNumber = 0
	for protein in content['FM'][0:-2]:
		for fragment in protein['fragments']:
			finalResult.append({
				'protein': proteinNumber,
				'position': fragment['position'],
				'sequence': fragment['fr'],
				'probability': float(results[resultNumber])
			})
			resultNumber += 1
		proteinNumber += 1
	return finalResult

data =  [
        {'protein': '001', 'position': 2, 'sequence': 'abcde', 'probability': 0.9}, 
        {'protein': '002', 'position': 15, 'sequence': 'abgde', 'probability': 0.8},
        {'protein': '001', 'position': 2, 'sequence': 'abcde', 'probability': 0.9}, 
        {'protein': '002', 'position': 15, 'sequence': 'abgde', 'probability': 0.8},
        {'protein': '001', 'position': 2, 'sequence': 'abcde', 'probability': 0.9}, 
        {'protein': '002', 'position': 15, 'sequence': 'abgde', 'probability': 0.8},
        {'protein': '001', 'position': 2, 'sequence': 'abcde', 'probability': 0.9}
    ]

@app.route('/predict', methods=['GET', 'POST'])
def predict():
	content = request.json
	X = pd.DataFrame(content['FM'][-1])
	print(X)
	X = scaler.transform(X)
	threshold = content['Threshold']
	model_name = content['Model']
	results = call_model(model_name, X, threshold)
	return jsonify(prepareOutput(results, content))

def call_model(model_name, X, threshold):
	if model_name == 'DNN':
		return DNN.predict(X)[:, 1]
	elif model_name == 'XGB':
		return XGB.predict_proba(X)[:, 1]
	elif model_name == 'RF':
		return RF.predict_proba(X)[:, 1]
	elif model_name == 'DT':
		return DT.predict(X)
	elif model_name == 'SVM':
		return SVM.predict_proba(X)[:, 1]
	return None

app.run(port=5000, debug=True)