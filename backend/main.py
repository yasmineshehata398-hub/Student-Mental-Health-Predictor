import os
import joblib
import pandas as pd
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any

app = FastAPI(
    title="Student Mental Health Classification API",
    description="FastAPI backend for predicting student mental health levels using a trained Random Forest model.",
    version="1.0.0"
)

# Enable CORS for Next.js frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Paths to the model files
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "..", "Student_Mental_Health")

MODEL_PATH = os.path.join(MODEL_DIR, "random_forest_mental_health_model.pkl")
ENCODER_PATH = os.path.join(MODEL_DIR, "label_encoder.pkl")
FEATURES_PATH = os.path.join(MODEL_DIR, "feature_columns.pkl")

# Load model, features and label encoder
try:
    model = joblib.load(MODEL_PATH)
    label_encoder = joblib.load(ENCODER_PATH)
    feature_columns = joblib.load(FEATURES_PATH)
    print("Models loaded successfully!")
except Exception as e:
    print(f"Error loading models: {str(e)}")
    raise RuntimeError(f"Failed to load models: {str(e)}")

# Hardcoded scaler parameters calculated from train-test split random_state 42
SCALER_PARAMS = {
    "Age": {"mean": 20.83866933, "std": 1.7416234},
    "Avg_Daily_Usage_Hours": {"mean": 5.08729365, "std": 1.6559362},
    "Daily_Unlocks": {"mean": 171.68809405, "std": 42.80510077},
    "Study_Hours": {"mean": 2.99572286, "std": 1.64412311},
    "Physical_Activity_Hours": {"mean": 1.75990495, "std": 0.66409051},
    "Sleep_Hours_Per_Night": {"mean": 6.63944472, "std": 1.21422797}
}

# Supported lists for validation and metadata API
COUNTRIES = [
    "Afghanistan", "Albania", "Andorra", "Argentina", "Armenia", "Australia", 
    "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Belarus", 
    "Belgium", "Bhutan", "Bolivia", "Bosnia", "Brazil", "Bulgaria", "Canada", 
    "Chile", "China", "Colombia", "Costa Rica", "Croatia", "Cyprus", 
    "Czech Republic", "Denmark", "Ecuador", "Egypt", "Estonia", "Finland", 
    "France", "Georgia", "Germany", "Ghana", "Greece", "Hong Kong", "Hungary", 
    "Iceland", "India", "Indonesia", "Iraq", "Ireland", "Israel", "Italy", 
    "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kosovo", "Kuwait", 
    "Kyrgyzstan", "Latvia", "Lebanon", "Liechtenstein", "Lithuania", 
    "Luxembourg", "Malaysia", "Maldives", "Malta", "Mexico", "Moldova", 
    "Monaco", "Montenegro", "Morocco", "Nepal", "Netherlands", "New Zealand", 
    "Nigeria", "North Macedonia", "Norway", "Oman", "Other", "Pakistan", 
    "Panama", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", 
    "Romania", "Russia", "San Marino", "Serbia", "Singapore", "Slovakia", 
    "Slovenia", "South Africa", "South Korea", "Spain", "Sri Lanka", "Sweden", 
    "Switzerland", "Syria", "Taiwan", "Tajikistan", "Thailand", "Trinidad", 
    "Turkey", "UAE", "UK", "USA", "Ukraine", "Uruguay", "Uzbekistan", 
    "Vatican City", "Venezuela", "Vietnam", "Yemen"
]

PLATFORMS = [
    "Facebook", "Instagram", "KakaoTalk", "LINE", "LinkedIn", "Snapchat", 
    "TikTok", "Twitter", "VKontakte", "WeChat", "WhatsApp", "YouTube"
]

PURPOSES = [
    "Education", "Entertainment", "Networking", "News"
]

class PredictionRequest(BaseModel):
    Age: float = Field(..., ge=10, le=100, description="Age of the student")
    Gender: str = Field(..., description="Gender: Male or Female")
    Academic_Level: str = Field(..., description="Academic Level: High School, Undergraduate, Graduate")
    Avg_Daily_Usage_Hours: float = Field(..., ge=0, le=24, description="Average daily social media usage in hours")
    Daily_Unlocks: float = Field(..., ge=0, description="Number of daily device unlocks")
    Study_Hours: float = Field(..., ge=0, le=24, description="Daily study hours")
    Physical_Activity_Hours: float = Field(..., ge=0, le=24, description="Daily physical activity in hours")
    Sleep_Hours_Per_Night: float = Field(..., ge=0, le=24, description="Sleep hours per night")
    Stress_Level: str = Field(..., description="Self-reported stress level: Low, Moderate, High")
    Country: str = Field("Other", description="Country of residence")
    Most_Used_Platform: str = Field(..., description="Most used social media platform")
    Purpose_Of_Use: str = Field(..., description="Primary purpose of social media use")

class PredictionResponse(BaseModel):
    prediction: str
    confidence: float
    probabilities: Dict[str, float]

@app.get("/metadata", summary="Get options for categorical features")
def get_metadata():
    return {
        "countries": COUNTRIES,
        "platforms": PLATFORMS,
        "purposes": PURPOSES,
        "genders": ["Male", "Female"],
        "academic_levels": ["High School", "Undergraduate", "Graduate"],
        "stress_levels": ["Low", "Moderate", "High"]
    }

@app.post("/predict", response_model=PredictionResponse, summary="Predict Student Mental Health Class")
def predict(request: PredictionRequest):
    # Validate categorical options
    if request.Gender not in ["Male", "Female"]:
        raise HTTPException(status_code=400, detail="Gender must be 'Male' or 'Female'.")
    if request.Academic_Level not in ["High School", "Undergraduate", "Graduate"]:
        raise HTTPException(status_code=400, detail="Academic_Level must be 'High School', 'Undergraduate', or 'Graduate'.")
    if request.Stress_Level not in ["Low", "Moderate", "High"]:
        raise HTTPException(status_code=400, detail="Stress_Level must be 'Low', 'Moderate', or 'High'.")
    if request.Country not in COUNTRIES:
        raise HTTPException(status_code=400, detail=f"Country '{request.Country}' is not recognized.")
    if request.Most_Used_Platform not in PLATFORMS:
        raise HTTPException(status_code=400, detail=f"Platform '{request.Most_Used_Platform}' is not recognized.")
    if request.Purpose_Of_Use not in PURPOSES:
        raise HTTPException(status_code=400, detail=f"Purpose of use '{request.Purpose_Of_Use}' is not recognized.")

    # 1. Map binary and ordinal categories
    gender_mapped = 0 if request.Gender == "Male" else 1
    
    academic_map = {"High School": 0, "Undergraduate": 1, "Graduate": 2}
    academic_mapped = academic_map[request.Academic_Level]
    
    stress_map = {"Low": 0, "Moderate": 1, "High": 2}
    stress_mapped = stress_map[request.Stress_Level]

    # 2. Scale numerical inputs
    scaled_features = {}
    for col, val in {
        "Age": request.Age,
        "Avg_Daily_Usage_Hours": request.Avg_Daily_Usage_Hours,
        "Daily_Unlocks": request.Daily_Unlocks,
        "Study_Hours": request.Study_Hours,
        "Physical_Activity_Hours": request.Physical_Activity_Hours,
        "Sleep_Hours_Per_Night": request.Sleep_Hours_Per_Night
    }.items():
        mean = SCALER_PARAMS[col]["mean"]
        std = SCALER_PARAMS[col]["std"]
        scaled_features[col] = (val - mean) / std

    # 3. Create full feature dictionary initialized to 0
    input_dict = {col: 0 for col in feature_columns}

    # Set numerical/mapped inputs
    input_dict["Age"] = scaled_features["Age"]
    input_dict["Gender"] = gender_mapped
    input_dict["Academic_Level"] = academic_mapped
    input_dict["Avg_Daily_Usage_Hours"] = scaled_features["Avg_Daily_Usage_Hours"]
    input_dict["Daily_Unlocks"] = scaled_features["Daily_Unlocks"]
    input_dict["Study_Hours"] = scaled_features["Study_Hours"]
    input_dict["Physical_Activity_Hours"] = scaled_features["Physical_Activity_Hours"]
    input_dict["Sleep_Hours_Per_Night"] = scaled_features["Sleep_Hours_Per_Night"]
    input_dict["Stress_Level"] = stress_mapped

    # Set one-hot columns
    country_col = f"Country_{request.Country}"
    if country_col in input_dict:
        input_dict[country_col] = 1
    else:
        # Fallback to Country_Other if Country_Selected is not in columns list
        if "Country_Other" in input_dict:
            input_dict["Country_Other"] = 1
            
    platform_col = f"Most_Used_Platform_{request.Most_Used_Platform}"
    if platform_col in input_dict:
        input_dict[platform_col] = 1

    purpose_col = f"Purpose_Of_Use_{request.Purpose_Of_Use}"
    if purpose_col in input_dict:
        input_dict[purpose_col] = 1

    # 4. Construct DataFrame matching the order of training features
    input_df = pd.DataFrame([input_dict])[feature_columns]

    try:
        # Predict class
        pred_idx = model.predict(input_df)[0]
        class_name = label_encoder.classes_[pred_idx]
        
        # Get probability
        probs = model.predict_proba(input_df)[0]
        prob_dict = {label_encoder.classes_[i]: float(probs[i]) for i in range(len(probs))}
        confidence = prob_dict[class_name]
        
        return PredictionResponse(
            prediction=class_name,
            confidence=confidence,
            probabilities=prob_dict
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")
