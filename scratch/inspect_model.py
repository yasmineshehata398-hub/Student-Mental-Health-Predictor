import pandas as pd

csv_path = r"c:\Users\Yasmine Shehata\Downloads\Machine Learning Creativa Mansoura\Tasks\Student_Mental_Health\student_mental_health_cleaned.csv"
df = pd.read_csv(csv_path)

print("--- Unique countries ---")
countries = sorted(df["Country"].unique())
print("Total count:", len(countries))
print(countries)

print("\n--- Unique platforms ---")
platforms = sorted(df["Most_Used_Platform"].unique())
print(platforms)

print("\n--- Unique purposes ---")
purposes = sorted(df["Purpose_Of_Use"].unique())
print(purposes)
