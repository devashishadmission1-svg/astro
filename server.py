from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

EXCEL_FILE = 'consultations.xlsx'

@app.route('/submit', methods=['POST'])
def submit():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No data received"}), 400

        # Prepare formatting for appending
        new_row = {
            'Date': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            'Name': data.get('name'),
            'Phone': data.get('phone'),
            'DOB': data.get('dob'),
            'TOB': data.get('tob'),
            'POB': data.get('pob'),
            'Service': data.get('service'),
            'Message': data.get('message')
        }

        # Read existing or create new
        if os.path.exists(EXCEL_FILE):
            df = pd.read_excel(EXCEL_FILE)
            df = pd.concat([df, pd.DataFrame([new_row])], ignore_index=True)
        else:
            df = pd.DataFrame([new_row])

        # Write to Excel
        df.to_excel(EXCEL_FILE, index=False)
        
        print(f"✅ Saved entry for {new_row['Name']} to {EXCEL_FILE}")
        return jsonify({"message": "Successfully saved to Excel!"}), 200

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("🚀 Astrology Server running on http://localhost:5000")
    app.run(port=5000, debug=True)
