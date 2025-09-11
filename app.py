import joblib
from flask import Flask, request, jsonify, render_template

# Load the trained models and vectorizer
# These models were saved by your load.py script
try:
    lr_model = joblib.load('lr_model.pkl')
    svm_model = joblib.load('svm_model.pkl')
    tfidf_vectorizer = joblib.load('tfidf_vectorizer.pkl')
    print("Models and vectorizer loaded successfully!")
except FileNotFoundError:
    print("Error: Model files not found. Please run load.py first.")
    lr_model, svm_model, tfidf_vectorizer = None, None, None

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('frontend.html')

@app.route('/predict', methods=['POST'])
def predict():
    if not lr_model or not svm_model or not tfidf_vectorizer:
        return jsonify({'error': 'Models not loaded. Please train them first.'}), 500

    data = request.get_json()
    text_to_predict = data.get('text', '')

    if not text_to_predict:
        return jsonify({'error': 'No text provided for prediction.'}), 400

    # Transform the input text using the loaded vectorizer
    text_vectorized = tfidf_vectorizer.transform([text_to_predict])

    # Make predictions using both models
    lr_prediction = lr_model.predict(text_vectorized)[0]
    svm_prediction = svm_model.predict(text_vectorized)[0]

    # Convert predictions to a readable label
    lr_label = "True" if lr_prediction == 1 else "Fake"
    svm_label = "True" if svm_prediction == 1 else "Fake"

    result = {
        'logistic_regression_result': lr_label,
        'svm_result': svm_label
    }

    return jsonify(result)

if __name__ == '__main__':
    # Use debug=True for development. Disable in production.
    app.run(debug=True, port=5000)