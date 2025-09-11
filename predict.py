
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split
import pandas as pd
import joblib

# Load the test data (required for evaluation)
df = pd.concat([pd.read_csv('True.csv'), pd.read_csv('Fake.csv')])
df['content'] = df['title'] + ' ' + df['text']
df['label'] = [1] * len(pd.read_csv('True.csv')) + [0] * len(pd.read_csv('Fake.csv'))
_, X_test, _, y_test = train_test_split(
    df['content'], df['label'], test_size=0.2, random_state=42
)

# Load the saved models and vectorizer
lr_model = joblib.load('lr_model.pkl')
svm_model = joblib.load('svm_model.pkl')
tfidf_vectorizer = joblib.load('tfidf_vectorizer.pkl')

# --- EVALUATION ---
# Transform the test data using the loaded vectorizer
tfidf_test = tfidf_vectorizer.transform(X_test)

# Evaluate Logistic Regression
lr_predictions = lr_model.predict(tfidf_test)
print("--- Logistic Regression Evaluation ---")
print(f"Accuracy: {accuracy_score(y_test, lr_predictions):.4f}")
print("Classification Report:")
print(classification_report(y_test, lr_predictions))

# Evaluate SVM
svm_predictions = svm_model.predict(tfidf_test)
print("\n--- SVM Evaluation ---")
print(f"Accuracy: {accuracy_score(y_test, svm_predictions):.4f}")
print("Classification Report:")
print(classification_report(y_test, svm_predictions))

# --- REAL-TIME PREDICTION ---
print("\n--- New Text Prediction ---")
new_texts = [
    "Nepal is witnessing its most turbulent political crisis in years after Prime Minister KP Sharma Oli resigned on Tuesday, a day after violent student-led protests left 21 people dead and forced the government to revoke a controversial social media ban.The unrest has now turned into a wider movement against corruption and political elites, shaking the foundations of the Himalayan nation’s fragile democracy.Oli bows out under pressureOli, 72, announced his resignation on Tuesday afternoon, saying he was “deeply saddened” by the loss of lives but blamed “vested interest groups” for infiltrating peaceful demonstrations. His statement offered compensation to victims’ families and free treatment for the injured, but it failed to stem public anger.Home minister Ramesh Lekhak and agriculture minister Ramnath Adhikari resigned earlier, taking “moral responsibility” for Monday’s bloodshed.Nepal's parliament building set on fireBy Tuesday, protesters had stormed and set fire to the parliament building, Oli’s residence in Balkot, and homes of several senior leaders including President Ram Chandra Poudel, former PM Sher Bahadur Deuba, Maoist leader Pushpa Kamal Dahal, and foreign minister Arzu Rana Deuba.",
    "The government has announced a new plan.",
    "Big nails hammered into Nagpur-Mumbai Expressway, several cars punctured Several cars got punctured after big nails were hammered into Nagpur-Mumbai Expressway (Samruddhi Mahamarg) late on Tuesday night. A video has surfaced on social media showing scenes from the expressway where nails can be seen fixed in rows on the bridge. According to reports, the nails were fixed by a road construction company working on repairs in the area."
]

# Transform new text using the loaded vectorizer
new_texts_vectorized = tfidf_vectorizer.transform(new_texts)

# Make predictions
lr_new_predictions = lr_model.predict(new_texts_vectorized)
svm_new_predictions = svm_model.predict(new_texts_vectorized)

for i, text in enumerate(new_texts):
    lr_pred_label = "True" if lr_new_predictions[i] == 1 else "Fake"
    svm_pred_label = "True" if svm_new_predictions[i] == 1 else "Fake"
    print(f"\nText: '{text}'")
    print(f"LR Prediction: {lr_pred_label}")
    print(f"SVM Prediction: {svm_pred_label}")