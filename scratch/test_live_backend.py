import requests

try:
    print("Testing GET /metadata on running server...")
    meta_resp = requests.get("http://localhost:8000/metadata")
    print("Status Code:", meta_resp.status_code)
    metadata = meta_resp.json()
    print("Countries count:", len(metadata.get("countries", [])))
    print("Platforms:", metadata.get("platforms"))

    print("\nTesting POST /predict on running server...")
    payload = {
        "Age": 18.0,
        "Gender": "Male",
        "Academic_Level": "High School",
        "Avg_Daily_Usage_Hours": 4.3,
        "Daily_Unlocks": 157.0,
        "Study_Hours": 3.7,
        "Physical_Activity_Hours": 2.5,
        "Sleep_Hours_Per_Night": 6.1,
        "Stress_Level": "High",
        "Country": "Australia",
        "Most_Used_Platform": "Instagram",
        "Purpose_Of_Use": "Education"
    }
    pred_resp = requests.post("http://localhost:8000/predict", json=payload)
    print("Status Code:", pred_resp.status_code)
    print("Response JSON:\n", pred_resp.json())

except Exception as e:
    print("Request failed:", e)
