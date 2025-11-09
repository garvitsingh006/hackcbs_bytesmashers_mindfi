import google.generativeai as genai
import requests
import sys
import json
import io

genai.configure(api_key="AIzaSyDA589BrC5O1-U_i3a4hC31kIz6G0pbC-8")
model = genai.GenerativeModel("models/gemini-2.0-flash-lite")

def get_user_finance(user_id="U001"):
    try:
        print(f"Fetching data for user: {user_id}")
        response = requests.get(f"http://localhost:8000/api/v1/users/caps/{user_id}")
        print(f"Response status: {response.status_code}")
        print(f"Response content: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"User data received: {data}")
            return data["data"]
            
        print(f"Error: Received status code {response.status_code}")
        return {"savings": 0, "monthly_income": 0, "total_spent": 0}
        
    except Exception as e:
        print(f"Exception in get_user_finance: {str(e)}")
        return {"savings": 0, "monthly_income": 0, "total_spent": 0}

def get_chat_response(user_input, user_id="U001"):
    try:
        user_data = get_user_finance(user_id)
        
        
        prompt = f"""
        You are MindFi, a fintech AI coach. Be encouraging, simple, and insightful.
        The user has ₹{user_data.get('savings', 0)} in savings, 
        ₹{user_data.get('monthly_income', 0)} income, and 
        ₹{user_data.get('total_spent', 0)} expenses.
        
        If their savings are decent, gently suggest investing part in MindFi's Fractional PMS.
        Don't push; start with appreciation, then curiosity ("what if we made your savings work harder?"), then explain PMS benefits slowly.

        Fractional PMS (by MindFi):
        - Pooled investment model (collective investing)
        - No ₹50L barrier
        - ~18–22% average returns historically
        - Safer diversification than random mutual funds
        - FDs give only 5–7%

        Prioritize emotional tone: calm, helpful, slightly conversational.
        End each response with an encouraging line to open the MindFi app.

        User said: "{user_input}"
        """

        print("savings:", user_data['savings'])
        response = model.generate_content(prompt)
        return response.text.strip()
        
    except Exception as e:
        return f"I'm having trouble processing your request. Please try again later. Error: {str(e)}"

def main():
    # Set console output encoding to UTF-8 for Windows
    if sys.platform == 'win32':
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    
    # If run directly, use command line interface
    if len(sys.argv) > 1 and sys.argv[1] == '--message':
        user_input = sys.argv[2] if len(sys.argv) > 2 else ""
        user_id = sys.argv[4] if len(sys.argv) > 4 else "U001"
        print(f"Using user ID: {user_id}")
        response = get_chat_response(user_input, user_id)
        # Ensure response is a string and handle any remaining encoding issues
        response = str(response).encode('utf-8', errors='replace').decode('utf-8')
        print(f"MindFi: {response}")
    else:
        # Interactive mode
        user_data = get_user_finance()
        print(f"👋 Hi! I'm MindFi – your AI financial coach (powered by Gemini).")
        print(f"You've saved ₹{user_data.get('savings', 0)} so far — awesome progress! 💰")
        print("Type 'exit' anytime to quit.\n")

        while True:
            try:
                user_input = input("You: ").strip()
                if user_input.lower() == "exit":
                    print("\nMindFi: Keep growing! Based on your savings, our Fractional PMS could help multiply it smartly. See you in the app! 💼")
                    break
                
                response = get_chat_response(user_input, "U001")
                print(f"MindFi: {response}\n")
            except Exception as e:
                print(f"Error: {str(e)}")
                continue

if __name__ == "__main__":
    main()
