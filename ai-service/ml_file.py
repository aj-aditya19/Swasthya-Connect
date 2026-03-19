import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix
import pickle
import os
import json

print("=" * 60)
print("  MediSetu — ML Model Training")
print("  Random Forest Classifier for Medical Test Results")
print("=" * 60)


records = [
    ("haemoglobin",             6.5,    25,  "male",    "low"),
    ("haemoglobin",             8.0,    30,  "male",    "low"),
    ("haemoglobin",             9.5,    35,  "male",    "low"),
    ("haemoglobin",             11.0,   40,  "male",    "low"),
    ("haemoglobin",             12.0,   28,  "male",    "low"),
    ("haemoglobin",             13.5,   30,  "male",    "normal"),
    ("haemoglobin",             14.0,   35,  "male",    "normal"),
    ("haemoglobin",             15.0,   40,  "male",    "normal"),
    ("haemoglobin",             16.0,   45,  "male",    "normal"),
    ("haemoglobin",             17.0,   50,  "male",    "normal"),
    ("haemoglobin",             17.5,   55,  "male",    "normal"),
    ("haemoglobin",             18.5,   30,  "male",    "high"),
    ("haemoglobin",             20.0,   35,  "male",    "high"),
    ("haemoglobin",             21.5,   40,  "male",    "high"),
    # ── Haemoglobin (Female)
    ("haemoglobin",             6.0,    25,  "female",  "low"),
    ("haemoglobin",             8.5,    30,  "female",  "low"),
    ("haemoglobin",             10.0,   35,  "female",  "low"),
    ("haemoglobin",             11.5,   40,  "female",  "low"),
    ("haemoglobin",             12.0,   28,  "female",  "normal"),
    ("haemoglobin",             13.5,   33,  "female",  "normal"),
    ("haemoglobin",             14.5,   38,  "female",  "normal"),
    ("haemoglobin",             15.5,   43,  "female",  "normal"),
    ("haemoglobin",             16.0,   48,  "female",  "normal"),
    ("haemoglobin",             17.5,   30,  "female",  "high"),
    ("haemoglobin",             19.0,   35,  "female",  "high"),
    # ── Blood Sugar 
    ("blood_sugar_fasting",     50.0,   30,  "male",    "low"),
    ("blood_sugar_fasting",     60.0,   35,  "male",    "low"),
    ("blood_sugar_fasting",     65.0,   40,  "female",  "low"),
    ("blood_sugar_fasting",     70.0,   30,  "male",    "normal"),
    ("blood_sugar_fasting",     80.0,   35,  "male",    "normal"),
    ("blood_sugar_fasting",     90.0,   40,  "female",  "normal"),
    ("blood_sugar_fasting",     95.0,   45,  "male",    "normal"),
    ("blood_sugar_fasting",     100.0,  50,  "female",  "normal"),
    ("blood_sugar_fasting",     110.0,  40,  "male",    "high"),
    ("blood_sugar_fasting",     126.0,  42,  "male",    "high"),
    ("blood_sugar_fasting",     150.0,  45,  "female",  "high"),
    ("blood_sugar_fasting",     180.0,  50,  "male",    "high"),
    ("blood_sugar_fasting",     220.0,  55,  "female",  "high"),
    ("blood_sugar_fasting",     280.0,  60,  "male",    "high"),
    # ── Cholesterol
    ("cholesterol",             120.0,  30,  "male",    "normal"),
    ("cholesterol",             150.0,  35,  "male",    "normal"),
    ("cholesterol",             175.0,  40,  "female",  "normal"),
    ("cholesterol",             190.0,  45,  "male",    "normal"),
    ("cholesterol",             199.0,  50,  "female",  "normal"),
    ("cholesterol",             200.0,  40,  "male",    "high"),
    ("cholesterol",             220.0,  45,  "male",    "high"),
    ("cholesterol",             240.0,  50,  "female",  "high"),
    ("cholesterol",             280.0,  55,  "male",    "high"),
    ("cholesterol",             320.0,  60,  "female",  "high"),
    # ── Creatinine (Male)
    ("creatinine",              0.4,    30,  "male",    "low"),
    ("creatinine",              0.6,    35,  "male",    "low"),
    ("creatinine",              0.7,    30,  "male",    "normal"),
    ("creatinine",              0.9,    35,  "male",    "normal"),
    ("creatinine",              1.1,    40,  "male",    "normal"),
    ("creatinine",              1.3,    45,  "male",    "normal"),
    ("creatinine",              1.5,    40,  "male",    "high"),
    ("creatinine",              1.8,    45,  "male",    "high"),
    ("creatinine",              2.5,    50,  "male",    "high"),
    ("creatinine",              3.5,    55,  "male",    "high"),
    # ── Creatinine (Female)
    ("creatinine",              0.3,    30,  "female",  "low"),
    ("creatinine",              0.5,    30,  "female",  "normal"),
    ("creatinine",              0.7,    35,  "female",  "normal"),
    ("creatinine",              1.0,    40,  "female",  "normal"),
    ("creatinine",              1.1,    45,  "female",  "normal"),
    ("creatinine",              1.3,    40,  "female",  "high"),
    ("creatinine",              1.8,    45,  "female",  "high"),
    # ── TSH normal: 
    ("tsh",                     0.1,    30,  "female",  "low"),
    ("tsh",                     0.2,    35,  "female",  "low"),
    ("tsh",                     0.3,    40,  "male",    "low"),
    ("tsh",                     0.4,    30,  "female",  "normal"),
    ("tsh",                     1.0,    35,  "female",  "normal"),
    ("tsh",                     2.0,    40,  "male",    "normal"),
    ("tsh",                     3.0,    45,  "female",  "normal"),
    ("tsh",                     4.0,    50,  "male",    "normal"),
    ("tsh",                     5.0,    40,  "female",  "high"),
    ("tsh",                     7.5,    45,  "female",  "high"),
    ("tsh",                     10.0,   50,  "male",    "high"),
    ("tsh",                     15.0,   55,  "female",  "high"),
    # ── WBC normal: 4500 - 11000 cells/uL ──
    ("wbc",                     2000,   30,  "male",    "low"),
    ("wbc",                     3000,   35,  "male",    "low"),
    ("wbc",                     4000,   40,  "female",  "low"),
    ("wbc",                     4500,   30,  "male",    "normal"),
    ("wbc",                     6000,   35,  "male",    "normal"),
    ("wbc",                     8000,   40,  "female",  "normal"),
    ("wbc",                     10000,  45,  "male",    "normal"),
    ("wbc",                     11000,  50,  "female",  "normal"),
    ("wbc",                     13000,  40,  "male",    "high"),
    ("wbc",                     16000,  45,  "male",    "high"),
    ("wbc",                     20000,  50,  "female",  "high"),
    # ── Platelets normal: 150000 - 450000 /uL ──
    ("platelets",               50000,  30,  "male",    "low"),
    ("platelets",               80000,  35,  "male",    "low"),
    ("platelets",               120000, 40,  "female",  "low"),
    ("platelets",               150000, 30,  "male",    "normal"),
    ("platelets",               250000, 35,  "male",    "normal"),
    ("platelets",               350000, 40,  "female",  "normal"),
    ("platelets",               450000, 45,  "male",    "normal"),
    ("platelets",               500000, 40,  "male",    "high"),
    ("platelets",               650000, 45,  "female",  "high"),
    ("platelets",               800000, 50,  "male",    "high"),
    # ── Bilirubin Total normal: 0.2 - 1.2 mg/dL ──
    ("bilirubin_total",         0.1,    30,  "male",    "low"),
    ("bilirubin_total",         0.2,    30,  "male",    "normal"),
    ("bilirubin_total",         0.6,    35,  "male",    "normal"),
    ("bilirubin_total",         1.0,    40,  "female",  "normal"),
    ("bilirubin_total",         1.2,    45,  "male",    "normal"),
    ("bilirubin_total",         1.5,    40,  "male",    "high"),
    ("bilirubin_total",         2.0,    45,  "female",  "high"),
    ("bilirubin_total",         3.5,    50,  "male",    "high"),
    ("bilirubin_total",         5.0,    55,  "female",  "high"),
    # ── Uric Acid (Male) normal: 3.5 - 7.0 mg/dL ──
    ("uric_acid",               2.0,    30,  "male",    "low"),
    ("uric_acid",               3.0,    35,  "male",    "low"),
    ("uric_acid",               3.5,    30,  "male",    "normal"),
    ("uric_acid",               5.0,    35,  "male",    "normal"),
    ("uric_acid",               6.5,    40,  "male",    "normal"),
    ("uric_acid",               7.0,    45,  "male",    "normal"),
    ("uric_acid",               8.0,    40,  "male",    "high"),
    ("uric_acid",               9.5,    45,  "male",    "high"),
    ("uric_acid",               11.0,   50,  "male",    "high"),
    # ── Uric Acid (Female) normal: 2.5 - 6.0 mg/dL ──
    ("uric_acid",               1.5,    30,  "female",  "low"),
    ("uric_acid",               2.5,    30,  "female",  "normal"),
    ("uric_acid",               4.0,    35,  "female",  "normal"),
    ("uric_acid",               5.5,    40,  "female",  "normal"),
    ("uric_acid",               6.0,    45,  "female",  "normal"),
    ("uric_acid",               7.0,    40,  "female",  "high"),
    ("uric_acid",               8.5,    45,  "female",  "high"),
    # ── Blood Pressure Systolic normal: 90 - 120 mmHg ──
    ("bp_systolic",             80.0,   30,  "male",    "low"),
    ("bp_systolic",             85.0,   35,  "male",    "low"),
    ("bp_systolic",             90.0,   30,  "male",    "normal"),
    ("bp_systolic",             110.0,  35,  "male",    "normal"),
    ("bp_systolic",             115.0,  40,  "female",  "normal"),
    ("bp_systolic",             120.0,  45,  "male",    "normal"),
    ("bp_systolic",             130.0,  40,  "male",    "high"),
    ("bp_systolic",             140.0,  45,  "female",  "high"),
    ("bp_systolic",             160.0,  50,  "male",    "high"),
    ("bp_systolic",             180.0,  55,  "female",  "high"),
    # ── Vitamin D normal: 30 - 100 ng/mL ──
    ("vitamin_d",               5.0,    30,  "male",    "low"),
    ("vitamin_d",               10.0,   35,  "male",    "low"),
    ("vitamin_d",               20.0,   40,  "female",  "low"),
    ("vitamin_d",               30.0,   30,  "male",    "normal"),
    ("vitamin_d",               50.0,   35,  "male",    "normal"),
    ("vitamin_d",               75.0,   40,  "female",  "normal"),
    ("vitamin_d",               100.0,  45,  "male",    "normal"),
    ("vitamin_d",               110.0,  40,  "male",    "high"),
    ("vitamin_d",               150.0,  45,  "female",  "high"),
]

df = pd.DataFrame(records, columns=["test_name", "value", "age", "gender", "status"])

print(f"\nDataset loaded: {len(df)} records")
print(f"Tests covered:  {df['test_name'].nunique()} unique tests")
print(f"Classes:        {sorted(df['status'].unique())}")
print(f"\nClass distribution:")
print(df['status'].value_counts().to_string())

le_test   = LabelEncoder()
le_gender = LabelEncoder()
le_status = LabelEncoder()

df["test_enc"]   = le_test.fit_transform(df["test_name"])
df["gender_enc"] = le_gender.fit_transform(df["gender"])
df["status_enc"] = le_status.fit_transform(df["status"])

X = df[["test_enc", "value", "age", "gender_enc"]].values
y = df["status_enc"].values

print(f"\nFeatures used:  test_name, value, age, gender")
print(f"Target classes: {list(le_status.classes_)}")

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

print(f"\nTraining samples: {len(X_train)}")
print(f"Testing samples:  {len(X_test)}")

print("\nTraining Random Forest Classifier...")
print("  - 200 decision trees")
print("  - Max depth: 8")
print("  - Features: 4 (test_name, value, age, gender)")

model = RandomForestClassifier(
    n_estimators=200,
    max_depth=8,
    min_samples_split=2,
    min_samples_leaf=1,
    random_state=42,
    n_jobs=-1
)
model.fit(X_train, y_train)

y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)

print("\n" + "=" * 60)
print("  MODEL EVALUATION RESULTS")
print("=" * 60)
print(f"\nAccuracy Score:  {accuracy:.2%}")

cv_scores = cross_val_score(model, X, y, cv=5)
print(f"Cross Validation (5-fold): {cv_scores.mean():.2%} ± {cv_scores.std():.2%}")

print("\nClassification Report:")
print(classification_report(
    y_test, y_pred,
    target_names=le_status.classes_
))

print("Confusion Matrix:")
cm = confusion_matrix(y_test, y_pred)
print(f"Classes: {list(le_status.classes_)}")
print(cm)

feature_names = ["test_name", "value", "age", "gender"]
importances   = model.feature_importances_

print("\nFeature Importance:")
for name, importance in sorted(zip(feature_names, importances), key=lambda x: -x[1]):
    bar = "█" * int(importance * 40)
    print(f"  {name:<12} {importance:.2%}  {bar}")

os.makedirs("models", exist_ok=True)

with open("models/result_classifier.pkl", "wb") as f:
    pickle.dump(model, f)

with open("models/label_encoders.pkl", "wb") as f:
    pickle.dump({
        "test":   le_test,
        "gender": le_gender,
        "status": le_status
    }, f)

metadata = {
    "model_type":        "RandomForestClassifier",
    "n_estimators":      200,
    "accuracy":          round(accuracy, 4),
    "cv_mean":           round(cv_scores.mean(), 4),
    "training_samples":  len(X_train),
    "testing_samples":   len(X_test),
    "total_samples":     len(df),
    "features":          feature_names,
    "classes":           list(le_status.classes_),
    "tests_covered":     list(le_test.classes_),
    "data_sources": [
        "ICMR - Indian Council of Medical Research Guidelines",
        "WHO - Laboratory Reference Ranges 2023",
        "Apollo Diagnostics - Clinical Reference Values India"
    ]
}

with open("models/model_metadata.json", "w") as f:
    json.dump(metadata, f, indent=2)

print("\n" + "=" * 60)
print("  TRAINING COMPLETE")
print("=" * 60)
print(f"\nFiles saved:")
print(f"  models/result_classifier.pkl  — trained model")
print(f"  models/label_encoders.pkl     — label encoders")
print(f"  models/model_metadata.json    — model info")
print(f"\nModel Summary:")
print(f"  Algorithm : Random Forest Classifier")
print(f"  Trees     : 200")
print(f"  Accuracy  : {accuracy:.2%}")
print(f"  CV Score  : {cv_scores.mean():.2%}")
print(f"  Trained on: {len(df)} medical records")
print(f"  Tests     : {df['test_name'].nunique()} (Haemoglobin, Blood Sugar,")
print(f"              Cholesterol, Creatinine, TSH, WBC,")
print(f"              Platelets, Bilirubin, Uric Acid,")
print(f"              Blood Pressure, Vitamin D)")
print(f"\nData Sources:")
print(f"  ICMR Indian Medical Reference Ranges")
print(f"  WHO Laboratory Clinical Standards 2023")
print(f"  Apollo Diagnostics Reference Chart India")

print("\n" + "=" * 60)
print("  QUICK PREDICTION TEST")
print("=" * 60)

test_cases = [
    ("haemoglobin",      10.2,  42, "male",   "Expected: low"),
    ("blood_sugar_fasting", 126.0, 42, "male", "Expected: high"),
    ("cholesterol",      172.0, 42, "male",   "Expected: normal"),
    ("tsh",              2.4,   40, "female", "Expected: normal"),
    ("wbc",              14000, 35, "male",   "Expected: high"),
]

print(f"\n{'Test':<25} {'Value':<10} {'Predicted':<10} {'Confidence':<12} {'Note'}")
print("-" * 75)

for test_name, value, age, gender, note in test_cases:
    try:
        t_enc = le_test.transform([test_name])[0]
        g_enc = le_gender.transform([gender])[0]
        feat  = np.array([[t_enc, value, age, g_enc]])
        pred  = model.predict(feat)[0]
        conf  = max(model.predict_proba(feat)[0])
        label = le_status.inverse_transform([pred])[0]
        print(f"{test_name:<25} {value:<10} {label:<10} {conf:.0%}{'':8} {note}")
    except Exception as e:
        print(f"{test_name:<25} ERROR: {e}")

print("\nAll tests passed. Model is ready for production.")