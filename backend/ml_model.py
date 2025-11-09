import sys
import json
import joblib
import pandas as pd

# Load model, scaler, and df once
df = pd.read_csv("transactions_labeled_100users_super_noisy.csv")
model = joblib.load("reckless_user_model.pkl")
scaler = joblib.load("reckless_user_scaler.pkl")

def predict_new_transaction(user_id, new_txn, df, model=model, scaler=scaler):
    # Add new txn to dataset
    df_expanded = pd.concat([df, pd.DataFrame([new_txn])], ignore_index=True)

    # Get this user's transactions
    user_txns = df_expanded[df_expanded["user_id"] == user_id]

    # Compute features
    features = {
        "total_spent": user_txns["amount"].sum(),
        "avg_spent": user_txns["amount"].mean(),
        "std_spent": user_txns["amount"].std(),
        "transaction_count": len(user_txns),
        "food_ratio": (user_txns["category"] == "Food").mean(),
        "shopping_ratio": (user_txns["category"] == "Shopping").mean(),
        "bills_ratio": (user_txns["category"] == "Bills").mean(),
        "entertainment_ratio": (user_txns["category"] == "Entertainment").mean(),
        "medical_ratio": (user_txns["category"] == "Medical").mean(),
        "travel_ratio": (user_txns["category"] == "Travel").mean()
    }

    X_user = pd.DataFrame([features])
    X_scaled = scaler.transform(X_user)
    pred = model.predict(X_scaled)[0]

    return "Reckless" if pred == 1 else "Not Reckless"


if __name__ == "__main__":
    # Read input JSON string (via arg[1] or fallback to stdin)
    if len(sys.argv) > 1:
        input_json = sys.argv[1]
    else:
        input_json = sys.stdin.read()

    try:
        data = json.loads(input_json)
        user_id = data.get("user_id")
        new_txn = data

        if not user_id:
            raise ValueError("user_id not provided in input")

        result = predict_new_transaction(user_id, new_txn, df)
        print(result)  # Only output prediction string

    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)
