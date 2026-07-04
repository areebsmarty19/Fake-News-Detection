import random
import pandas as pd
import os
import xml.etree.ElementTree as ET
import re
from html import unescape
from urllib.parse import quote_plus
from urllib.request import Request, urlopen
from flask import Flask, request, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
from flask_cors import CORS

# --- ML IMPORTS ---
import torch
import torch.nn as nn
import numpy as np
from transformers import AutoModel, BertTokenizerFast

# =========================
# 1. LOAD BERT MODEL
# =========================

device = torch.device("cpu")

try:
    tokenizer = BertTokenizerFast.from_pretrained("tokenizer")
    bert = AutoModel.from_pretrained("bert-base-uncased")

    class BERT_Arch(nn.Module):
        def __init__(self, bert):
            super(BERT_Arch, self).__init__()
            self.bert = bert
            self.dropout = nn.Dropout(0.1)
            self.relu = nn.ReLU()
            self.fc1 = nn.Linear(768, 512)
            self.fc2 = nn.Linear(512, 2)
            self.softmax = nn.LogSoftmax(dim=1)

        def forward(self, sent_id, mask):
            cls_hs = self.bert(sent_id, attention_mask=mask)['pooler_output']
            x = self.fc1(cls_hs)
            x = self.relu(x)
            x = self.dropout(x)
            x = self.fc2(x)
            x = self.softmax(x)
            return x

    model = BERT_Arch(bert)
    model.load_state_dict(torch.load("model.pth", map_location=device))
    model.to(device)
    model.eval()

    print("✅ BERT model loaded successfully!")

except Exception as e:
    print("❌ Error loading model:", e)
    model = None

# =========================
# 2. LOAD DATASETS
# =========================

try:
    true_news_df = pd.read_csv("True.csv")
    fake_news_df = pd.read_csv("Fake.csv")
    print("✅ News datasets loaded!")
except Exception as e:
    print("❌ Dataset load error:", e)
    true_news_df, fake_news_df = None, None

# =========================
# 3. FLASK CONFIG
# =========================

app = Flask(__name__)

CORS(app, supports_credentials=True, origins=["http://localhost:5173"])

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'super_secret_key')

app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SECURE'] = False

db = SQLAlchemy(app)

TRUSTED_NEWS_SOURCES = {
    "Reuters",
    "The Hindu",
    "NDTV News",
    "The Indian Express",
    "Economic Times",
    "Hindustan Times",
    "Livemint",
    "Times of India",
    "Business Standard",
    "Deccan Herald",
}


def extract_image_url_from_item(item):
    """Extract best-effort image URL from a Google News RSS item."""
    media_namespace = "{http://search.yahoo.com/mrss/}"

    thumbnail = item.find(f"{media_namespace}thumbnail")
    if thumbnail is not None and thumbnail.get("url"):
        return thumbnail.get("url")

    media_content = item.find(f"{media_namespace}content")
    if media_content is not None and media_content.get("url"):
        return media_content.get("url")

    description = unescape(item.findtext("description") or "")
    match = re.search(r'<img[^>]+src=["\']([^"\']+)["\']', description, flags=re.IGNORECASE)
    if match:
        return match.group(1)

    return ""


def predict_news_text(text):
    """Classify short news text and return normalized prediction fields."""
    if model is None:
        return {
            "prediction": "Unknown",
            "confidence": 0.0,
            "isFake": False,
        }

    MAX_LENGTH = 15
    tokens = tokenizer(
        [text],
        max_length=MAX_LENGTH,
        padding="max_length",
        truncation=True,
        return_tensors="pt"
    )

    seq = tokens['input_ids'].to(device)
    mask = tokens['attention_mask'].to(device)

    with torch.no_grad():
        preds = model(seq, mask)
        log_probs = preds.cpu().numpy()[0]

    pred_idx = int(np.argmax(log_probs))
    prediction = "Fake" if pred_idx == 1 else "True"
    confidence = float(np.exp(np.max(log_probs)))

    return {
        "prediction": prediction,
        "confidence": round(confidence, 4),
        "isFake": prediction == "Fake",
    }


def fetch_top_india_news(limit=10, query="India"): 
    """Fetch top India news headlines from Google News RSS and prefer trusted sources."""
    rss_url = (
        "https://news.google.com/rss/search?q="
        f"{quote_plus(query + ' when:1d')}"
        "&hl=en-IN&gl=IN&ceid=IN:en"
    )

    req = Request(rss_url, headers={"User-Agent": "Mozilla/5.0"})
    with urlopen(req, timeout=10) as response:
        rss_bytes = response.read()

    root = ET.fromstring(rss_bytes)
    channel = root.find("channel")
    if channel is None:
        return []

    items = channel.findall("item")
    trusted_items = []
    fallback_items = []

    for item in items:
        title = (item.findtext("title") or "").strip()
        link = (item.findtext("link") or "").strip()
        source = (item.findtext("source") or "").strip()
        published_at = (item.findtext("pubDate") or "").strip()
        image_url = extract_image_url_from_item(item)

        if not title or not link:
            continue

        news_item = {
            "title": title,
            "link": link,
            "source": source or "Google News",
            "publishedAt": published_at,
            "imageUrl": image_url,
        }

        if source in TRUSTED_NEWS_SOURCES:
            trusted_items.append(news_item)
        else:
            fallback_items.append(news_item)

    selected = trusted_items[:limit]
    if len(selected) < limit:
        selected.extend(fallback_items[: limit - len(selected)])

    return selected[:limit]

# =========================
# 4. USER MODEL
# =========================

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

# =========================
# 5. LOGIN DECORATOR
# =========================

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'message': 'Authentication required'}), 401
        return f(*args, **kwargs)
    return decorated_function

# =========================
# 6. AUTH ROUTES
# =========================

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'message': 'Missing email or password'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'message': 'User already exists'}), 409

    user = User(email=email)
    user.set_password(password)

    db.session.add(user)
    db.session.commit()

    return jsonify({'message': 'User created successfully'}), 201


@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()

    if user and user.check_password(password):
        session['user_id'] = user.id
        return jsonify({'message': 'Login successful', 'user_id': user.id}), 200

    return jsonify({'message': 'Invalid credentials'}), 401


@app.route('/api/logout', methods=['POST'])
@login_required
def logout():
    session.pop('user_id', None)
    return jsonify({'message': 'Logged out'}), 200

# =========================
# 7. PREDICTION ROUTE
# =========================

@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({'error': 'Model not loaded'}), 500

    data = request.get_json()
    text = data.get('text', '')

    if not text:
        return jsonify({'error': 'No text provided'}), 400

    MAX_LENGTH = 15   # same as training

    tokens = tokenizer(
        [text],
        max_length=MAX_LENGTH,
        padding="max_length",
        truncation=True,
        return_tensors="pt"
    )

    seq = tokens['input_ids'].to(device)
    mask = tokens['attention_mask'].to(device)

    with torch.no_grad():
        preds = model(seq, mask)
        preds = preds.cpu().numpy()
        pred = np.argmax(preds, axis=1)[0]
        confidence = float(np.max(preds))

    label = "Fake" if pred == 1 else "True"

    return jsonify({
        "prediction": label,
        "confidence": confidence
    })

# =========================
# 8. RANDOM NEWS ROUTE
# =========================

@app.route('/api/random-news', methods=['GET'])
def random_news():

    if true_news_df is None or fake_news_df is None:
        return jsonify({'error': 'Dataset not loaded'}), 500

    true_news = true_news_df.sample(3)
    fake_news = fake_news_df.sample(3)

    news_list = []

    for _, row in true_news.iterrows():
        news_list.append({
            "title": row["title"],
            "label": "Real"
        })

    for _, row in fake_news.iterrows():
        news_list.append({
            "title": row["title"],
            "label": "Fake"
        })

    random.shuffle(news_list)

    return jsonify(news_list)


@app.route('/api/top-news-analysis', methods=['GET'])
def top_news_analysis():
    limit = request.args.get('limit', default=10, type=int)
    query = request.args.get('query', default='India', type=str)
    limit = max(1, min(limit, 10))

    try:
        top_news = fetch_top_india_news(limit=limit, query=query)
    except Exception as e:
        return jsonify({'error': f'Failed to fetch top news: {str(e)}'}), 502

    analyzed_news = []
    for article in top_news:
        prediction_result = predict_news_text(article['title'])
        analyzed_news.append({
            **article,
            **prediction_result,
        })

    return jsonify({
        'count': len(analyzed_news),
        'items': analyzed_news,
    })

# =========================
# 9. RUN APP
# =========================

if __name__ == '__main__':
    with app.app_context():
        db.create_all()

    app.run(debug=True, port=5000, host='0.0.0.0', use_reloader=False)