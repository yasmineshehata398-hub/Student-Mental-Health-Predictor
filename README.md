git add .# Student Mental Health Classifier

An interactive, premium web interface for the Student Mental Health classification project. This application uses a trained Random Forest model to predict the level of a student's mental health class based on their demographic information, digital footprints (screen time and unlocks), and lifestyle habits.

## 🚀 Key Features
- **FastAPI Backend**: Serves predictions using an ensemble Random Forest model trained on 5,000 student records. Replicates exact preprocessing and Standard Scaling metrics.
- **Next.js 16 Frontend**: A premium, responsive interface styled with Tailwind CSS, featuring glassmorphism, loader animations, real-time validations, and a clean layout.
- **Dynamic Category Mapping**: Pulls list values dynamically from the backend and maps categorical variables on the fly.

---

## 📁 Project Structure

```text
Tasks/
├── backend/
│   ├── main.py              # FastAPI application & preprocessing logic
│   └── requirements.txt     # Python packages list
├── frontend/
│   ├── src/
│   │   └── app/
│   │       ├── globals.css  # Global Tailwind styles
│   │       ├── layout.tsx   # Base app page layout
│   │       └── page.tsx     # Student Health Form & Results UI
│   ├── package.json         # NPM script configurations
│   ├── next.config.ts       # Next.js configurations
│   └── tailwind.config.ts   # Tailwind setup
├── Student_Mental_Health/   # Machine Learning files
│   ├── random_forest_mental_health_model.pkl
│   ├── label_encoder.pkl
│   ├── feature_columns.pkl
│   └── student_mental_health_cleaned.csv
└── README.md                # Project documentation
```

---

## 🛠️ Local Setup & Run Guide

### 1. Running the FastAPI Backend

Make sure you are in the project root directory where your virtual environment `.venv` is configured:

```bash
# Verify virtual environment and install packages
.venv\Scripts\pip.exe install -r backend\requirements.txt

# Run the FastAPI server on port 8000
.venv\Scripts\python.exe -m uvicorn backend.main:app --port 8000 --reload
```

The API will be available at [http://localhost:8000](http://localhost:8000). You can inspect the interactive OpenAPI documentation at [http://localhost:8000/docs](http://localhost:8000/docs).

### 2. Running the Next.js Frontend

Open a new terminal window at the project root:

```bash
# Navigate to the frontend directory
cd frontend

# Install package dependencies
npm install

# Run the Next.js development server
npm run dev
```

The interface will be live at [http://localhost:3000](http://localhost:3000).

---

## 🌐 Deployment to Vercel

The frontend is ready for a zero-configuration deployment to **Vercel**:

1. Install the Vercel CLI globally (optional) or use the Vercel Dashboard.
2. Push your project code to GitHub.
3. Import the repository on Vercel:
   - Select the `frontend` folder as the Root Directory.
   - Keep build settings as default (Framework preset: Next.js).
   - Set environment variables if needed.
4. Click **Deploy**.

For the backend (FastAPI), you can deploy it to platforms like Render, Railway, or AWS, and configure your Vercel frontend environment variables (like `NEXT_PUBLIC_API_URL`) to point to your live backend endpoint.
