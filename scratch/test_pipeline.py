import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import accuracy_score

# 1. Load the cleaned csv
csv_path = r"c:\Users\Yasmine Shehata\Downloads\Machine Learning Creativa Mansoura\Tasks\Student_Mental_Health\student_mental_health_cleaned.csv"
df = pd.read_csv(csv_path)

# 2. Categorize score (same as notebook)
def categorize_score(score):
    if score <= 5.1:
        return "Low"
    elif score <= 7.1:
        return "Moderate"
    else:
        return "Good"

df["Mental_Health_Class"] = df["Mental_Health_Score"].apply(categorize_score)

# 3. Encode binary and ordinal categorical features
df["Gender"] = df["Gender"].map({
    "Male": 0,
    "Female": 1
})

df["Academic_Level"] = df["Academic_Level"].map({
    "High School": 0,
    "Undergraduate": 1,
    "Graduate": 2
})

df["Stress_Level"] = df["Stress_Level"].map({
    "Low": 0,
    "Moderate": 1,
    "High": 2
})

# 4. One-hot encode nominal categorical features
df = pd.get_dummies(
    df,
    columns=["Country", "Most_Used_Platform", "Purpose_Of_Use"],
    dtype=int
)

# 5. Label Encode target
label_encoder = joblib.load(r"c:\Users\Yasmine Shehata\Downloads\Machine Learning Creativa Mansoura\Tasks\Student_Mental_Health\label_encoder.pkl")
df["Mental_Health_Class"] = label_encoder.transform(df["Mental_Health_Class"])

# 6. Split features and target
X = df.drop(["Mental_Health_Score", "Mental_Health_Class"], axis=1)
y = df["Mental_Health_Class"]

# Ensure columns align with feature_columns.pkl
feature_cols = joblib.load(r"c:\Users\Yasmine Shehata\Downloads\Machine Learning Creativa Mansoura\Tasks\Student_Mental_Health\feature_columns.pkl")
# Reorder X columns to match feature_cols
X = X[feature_cols]

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

# 7. Scale numerical features
numerical_features = [
    "Age",
    "Avg_Daily_Usage_Hours",
    "Daily_Unlocks",
    "Study_Hours",
    "Physical_Activity_Hours",
    "Sleep_Hours_Per_Night"
]

scaler = StandardScaler()
X_train_scaled = X_train.copy()
X_test_scaled = X_test.copy()

X_train_scaled[numerical_features] = scaler.fit_transform(X_train[numerical_features])
X_test_scaled[numerical_features] = scaler.transform(X_test[numerical_features])

# Print scaler mean and std
print("Scaler Mean:", scaler.mean_)
print("Scaler Scale (std):", scaler.scale_)

# 8. Load trained model and evaluate
model = joblib.load(r"c:\Users\Yasmine Shehata\Downloads\Machine Learning Creativa Mansoura\Tasks\Student_Mental_Health\random_forest_mental_health_model.pkl")
y_pred = model.predict(X_test_scaled)
acc = accuracy_score(y_test, y_pred)
print(f"Accuracy of loaded model on scaled test data: {acc:.4f}")

# Let's also print what the features look like for one test sample
sample = X_test.iloc[0].to_dict()
print("\nSample unscaled feature dict:")
for k, v in list(sample.items())[:15]:
    print(f"  {k}: {v}")
