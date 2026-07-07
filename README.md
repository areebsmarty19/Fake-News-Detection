
# 📄 Fake News Detection System (BERT + Flask + React)

## 📌 Overview

This project is a **Fake News Detection Web Application** that uses a **BERT-based deep learning model** to classify news as **Real or Fake**.

It includes:

* 🔐 User authentication (Login/Signup)
* 🤖 Machine Learning prediction (BERT model)
* 🌐 Full-stack integration (Flask + React)
* 📊 Random news testing feature

---

## 🧠 Tech Stack

* **Frontend:** React (Vite)
* **Backend:** Flask
* **Database:** SQLite (SQLAlchemy)
* **Machine Learning:** BERT (PyTorch + Transformers)

---

## 🚀 Features

* ✅ Detect Fake vs Real news using BERT
* ✅ User Authentication (Signup/Login/Logout)
* ✅ Session-based authentication
* ✅ Random news generator for testing
* ✅ Clean UI with React

---


## ⚙️ Setup Instructions

---

### 🐍 Option 1: Using Conda (Recommended)

```bash
# Create environment
conda create -n fake-news-env python=3.10

# Activate environment
conda activate fake-news-env

# Install dependencies
pip install -r requirements.txt

# Run backend
python app.py

# Run frontend (new terminal)
cd frontend
npm install
npm run dev
```

---

### 💻 Option 2: Without Conda (Using venv)

```bash
# Create virtual environment
python -m venv venv

# Activate environment

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run backend
python app.py

# Run frontend (new terminal)
cd frontend
npm install
npm run dev
```

Got it 👍 — here’s the **updated README section** clearly mentioning the **backend folder**.

You can paste this directly 👇

---

# 📦 Model Download Instructions

## ⚠️ Model File Not Included

Due to GitHub file size limitations, the trained model file (`model.pth`) is not included in this repository.

---

## 🔽 Download Model

Download the trained model from the link below:

👉 [Download model.pth](https://drive.google.com/file/d/1Uw3aCpqN3NzvepBHigRG7pZxj1CBILrm/view?usp=drive_link)

---

## 📁 Placement Instructions

After downloading:

1. Ensure the file name is:

```plaintext
model.pth
```

2. Place it inside the **backend folder** (the folder where `app.py` is located)

---

### 📂 Example Project Structure:

```plaintext
project/
│
├── backend/
│   ├── app.py
│   ├── model.pth   ← place here ✅
│   ├── tokenizer/
│
├── frontend/
│   ├── src/
│   └── package.json
│
└── requirements.txt
```

## ⚠️ Important Notes

* Make sure the file is inside the **backend folder**
* Do NOT place it inside the `frontend` folder
* Backend will not work if `model.pth` is missing

---

## 🌐 Application URLs
* 🔹Live Working Url : https://areebpatel-fake-news-backend.hf.space  (It Might Take 2 - 3 Mins to load If Site is not visited for a long time !)
* 🔹 Frontend: [http://localhost:5173](http://localhost:5173)
* 🔹 Backend API: [http://127.0.0.1:5000](http://127.0.0.1:5000)

---

## 📡 API Endpoints

### 🔹 Authentication

* `POST /api/signup` → Register user
* `POST /api/login` → Login user
* `POST /api/logout` → Logout user

### 🔹 Prediction

* `POST /predict`

```json
{
  "text": "News article text here"
}
```

**Response:**

```json
{
  "prediction": "Fake"
}
```

---

### 🔹 Random News

* `GET /api/random-news`

---

## ⚠️ Important Notes

* Ensure `model.pth` and `tokenizer/` folder exist in root directory
* Backend must be running before frontend
* Do NOT retrain model inside API
* Keep `MAX_LENGTH` same as training

---

## 📦 Install Dependencies Manually

```bash
pip install flask flask-cors flask-sqlalchemy pandas numpy torch transformers joblib scikit-learn
```

---

## 🧪 How to Test

1. Signup/Login
2. Enter news text
3. Click verify
4. View prediction result

💡 You can also use **"Show News"** button to test sample data.

---

## 📸 Screenshots (Optional)

*Add screenshots here for better presentation*

---

## 🚀 Future Improvements

* 🔹 Increase model accuracy (larger sequence length)
* 🔹 Add confidence score
* 🔹 Deploy using AWS / Render
* 🔹 Add history tracking per user

---

## 👩‍💻 Author

* Developed as a **Full Stack + Machine Learning Project**
* Suitable for **college project / hackathon / portfolio**

---

## ⭐ If you like this project

Give it a ⭐ on GitHub!

