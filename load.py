import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
import joblib

# Load the datasets
true_df = pd.read_csv('True.csv')
fake_df = pd.read_csv('Fake.csv')

# Create a 'label' column: 0 for fake, 1 for true
true_df['label'] = 1
fake_df['label'] = 0

# Combine and shuffle the dataframes
df = pd.concat([true_df, fake_df]).reset_index(drop=True).sample(frac=1).reset_index(drop=True)

# Combine 'title' and 'text' columns
df['content'] = df['title'] + ' ' + df['text']

# Split data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(
    df['content'], df['label'], test_size=0.2, random_state=42
)

# Initialize and fit TF-IDF Vectorizer
tfidf_vectorizer = TfidfVectorizer(stop_words='english', max_df=0.7)
tfidf_train = tfidf_vectorizer.fit_transform(X_train)

# Initialize and train Logistic Regression model
lr_model = LogisticRegression()
lr_model.fit(tfidf_train, y_train)

# Initialize and train SVM model
svm_model = SVC(kernel='linear')
svm_model.fit(tfidf_train, y_train)

# Save the trained models and the TF-IDF vectorizer
joblib.dump(lr_model, 'lr_model.pkl')
joblib.dump(svm_model, 'svm_model.pkl')
joblib.dump(tfidf_vectorizer, 'tfidf_vectorizer.pkl')

print("Models and vectorizer saved successfully!")