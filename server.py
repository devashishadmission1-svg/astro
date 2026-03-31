from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

EXCEL_FILE = 'astro_logs.xlsx'

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy", "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")}), 200

@app.route('/watch', methods=['POST'])
def watch():
    try:
        data = request.json
        if not data:
            return jsonify({"status": "ignored"}), 200

        # Prepare entry with 'Live Update' status
        new_row = {
            'Date': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            'Name': data.get('name', ''),
            'Phone': data.get('phone', ''),
            'DOB': data.get('dob', ''),
            'TOB': data.get('tob', ''),
            'POB': data.get('pob', ''),
            'Service': data.get('service', ''),
            'Message': data.get('message', ''),
            'Status': 'Live Update'
        }

        # For live updates, we can either append or just log to a temporary entry
        # Here we'll append to keep a full history of interactions
        if os.path.exists(EXCEL_FILE):
            df = pd.read_excel(EXCEL_FILE)
            df = pd.concat([df, pd.DataFrame([new_row])], ignore_index=True)
        else:
            df = pd.DataFrame([new_row])

        df.to_excel(EXCEL_FILE, index=False)
        return jsonify({"status": "captured"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/submit', methods=['POST'])
def submit():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No data received"}), 400

        # Required fields validation
        required_fields = ['name', 'phone', 'dob', 'tob', 'pob', 'service', 'message']
        missing_fields = [field for field in required_fields if not data.get(field)]
        if missing_fields:
            return jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400

        # Prepare formatting for appending
        new_row = {
            'Date': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            'Name': data.get('name'),
            'Phone': data.get('phone'),
            'DOB': data.get('dob'),
            'TOB': data.get('tob'),
            'POB': data.get('pob'),
            'Service': data.get('service'),
            'Message': data.get('message'),
            'Status': 'Submitted'
        }

        # Read existing or create new
        if os.path.exists(EXCEL_FILE):
            df = pd.read_excel(EXCEL_FILE)
            df = pd.concat([df, pd.DataFrame([new_row])], ignore_index=True)
        else:
            df = pd.DataFrame([new_row])

        # Write to Excel
        try:
            df.to_excel(EXCEL_FILE, index=False)
        except PermissionError:
            print(f"❌ Error: Could not write to {EXCEL_FILE}. Is it open in another program?")
            return jsonify({"error": "The Excel file is currently open in another program. Please close it and try again."}), 500
        
        print(f"✅ Saved submission for {new_row['Name']} to {EXCEL_FILE}")
        return jsonify({"message": "Successfully saved to Excel!"}), 200

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("🚀 Astrology Server running on http://localhost:5001")
    app.run(port=5001, debug=True)
