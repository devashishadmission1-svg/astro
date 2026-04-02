from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import os
from datetime import datetime
import hashlib

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

EXCEL_FILE = 'astro_logs.xlsx'
ADMIN_HASH = "826477d6118b763ce0da662ab6dacf9b418e2fe13a8dd59ca0c77ddf409ed565"


def get_or_create_df():
    if os.path.exists(EXCEL_FILE):
        return pd.read_excel(EXCEL_FILE, dtype={'Phone': str, 'SessionID': str})
    return pd.DataFrame()

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy", "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")}), 200

@app.route('/watch', methods=['POST'])
def watch():
    try:
        data = request.json
        if not data:
            return jsonify({"status": "ignored"}), 200

        session_id = data.get('sessionId')
        if not session_id:
            return jsonify({"error": "No sessionId provided"}), 400

        # Prepare entry with 'Live Update' status
        new_row = {
            'Date': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            'SessionID': session_id,
            'Name': data.get('name', ''),
            'Phone': data.get('phone', ''),
            'DOB': data.get('dob', ''),
            'TOB': data.get('tob', ''),
            'POB': data.get('pob', ''),
            'Service': data.get('service', ''),
            'Message': data.get('message', ''),
            'Status': 'Live Update'
        }

        # Session tracking: Update row if ID exists, otherwise append
        df = get_or_create_df()
        if not df.empty:
            if 'SessionID' in df.columns:
                # Update existing session row
                session_idx = df[df['SessionID'] == session_id].index
                if not session_idx.empty:
                    # Keep the original Date but update everything else
                    original_date = df.loc[session_idx[0], 'Date']
                    for key, val in new_row.items():
                        df.loc[session_idx[0], key] = str(val) if val else ''
                    df.loc[session_idx[0], 'Date'] = original_date # Keep first interaction time
                else:
                    df = pd.concat([df, pd.DataFrame([new_row])], ignore_index=True)
            else:
                df = pd.concat([df, pd.DataFrame([new_row])], ignore_index=True)
        else:
            df = pd.DataFrame([new_row])

        df.to_excel(EXCEL_FILE, index=False)
        return jsonify({"status": "captured"}), 200
    except Exception as e:
        print(f"❌ Watch Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/submit', methods=['POST'])
def submit():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No data received"}), 400

        session_id = data.get('sessionId')
        # Required fields validation
        required_fields = ['name', 'phone', 'dob', 'tob', 'pob', 'service', 'message']
        missing_fields = [field for field in required_fields if not data.get(field)]
        if missing_fields:
            return jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400

        # Prepare formatting for final update
        new_row = {
            'Date': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            'SessionID': session_id if session_id else "direct_submit_" + datetime.now().strftime("%H%M%S"),
            'Name': data.get('name'),
            'Phone': data.get('phone'),
            'DOB': data.get('dob'),
            'TOB': data.get('tob'),
            'POB': data.get('pob'),
            'Service': data.get('service'),
            'Message': data.get('message'),
            'Status': 'Awaiting Payment'
        }

        # Read existing or create new
        df = get_or_create_df()
        if not df.empty:
            if 'SessionID' in df.columns and session_id:
                session_idx = df[df['SessionID'] == session_id].index
                if not session_idx.empty:
                    # Final update
                    for key, val in new_row.items():
                        df.loc[session_idx[0], key] = str(val) if val else ''
                else:
                    df = pd.concat([df, pd.DataFrame([new_row])], ignore_index=True)
            else:
                df = pd.concat([df, pd.DataFrame([new_row])], ignore_index=True)
        else:
            df = pd.DataFrame([new_row])

        # Write to Excel
        try:
            df.to_excel(EXCEL_FILE, index=False)
        except PermissionError:
            print(f"❌ Error: Could not write to {EXCEL_FILE}. Is it open in another program?")
            return jsonify({"error": "The Excel file is currently open in another program. Please close it and try again."}), 500
        
        print(f"✅ Final submission for {new_row['Name']} logged in {EXCEL_FILE}")
        return jsonify({"message": "Successfully saved to Excel!"}), 200

    except Exception as e:
        print(f"❌ Submit Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/payment_submit', methods=['POST'])
def payment_submit():
    try:
        data = request.json
        session_id = data.get('sessionId')
        tx_id = data.get('transactionId')
        
        if not session_id or not tx_id:
            return jsonify({"error": "Missing params"}), 400
            
        df = get_or_create_df()
        if df.empty or 'SessionID' not in df.columns:
            return jsonify({"error": "Session not found"}), 404
            
        session_idx = df[df['SessionID'] == session_id].index
        if not session_idx.empty:
            df.loc[session_idx[0], 'Status'] = 'Pending'
            df.loc[session_idx[0], 'TransactionID'] = tx_id
            df.to_excel(EXCEL_FILE, index=False)
            return jsonify({"success": True})
        return jsonify({"error": "Session not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/admin/login', methods=['POST'])
def admin_login():
    data = request.json
    pwd = data.get('password', '')
    if hashlib.sha256(pwd.encode()).hexdigest() == ADMIN_HASH:
        return jsonify({"success": True, "token": ADMIN_HASH})
    return jsonify({"success": False}), 401

@app.route('/admin/bookings', methods=['GET'])
def get_bookings():
    auth = request.headers.get('Authorization')
    if not auth or auth != ADMIN_HASH:
        return jsonify({"error": "Unauthorized"}), 401
        
    df = get_or_create_df()
    if df.empty:
        return jsonify({"pending": [], "confirmed": []})
        
    # Exclude full rows, just send dictionary of needed info
    pending = df[df['Status'] == 'Pending'].fillna("").to_dict('records')
    confirmed = df[df['Status'] == 'Confirmed'].fillna("").to_dict('records')
    return jsonify({"pending": pending, "confirmed": confirmed})

@app.route('/admin/update', methods=['POST'])
def admin_update():
    auth = request.headers.get('Authorization')
    if not auth or auth != ADMIN_HASH:
        return jsonify({"error": "Unauthorized"}), 401
    
    data = request.json
    session_id = data.get('sessionId')
    action = data.get('action') # 'confirm' or 'reject'
    
    df = get_or_create_df()
    if df.empty or 'SessionID' not in df.columns:
        return jsonify({"error": "No records found"}), 404
        
    session_idx = df[df['SessionID'] == session_id].index
    if session_idx.empty:
        return jsonify({"error": "Session not found"}), 404
        
    if action == 'confirm':
        df.loc[session_idx[0], 'Status'] = 'Confirmed'
        df.to_excel(EXCEL_FILE, index=False)
    elif action == 'reject':
        df = df.drop(session_idx)
        df.to_excel(EXCEL_FILE, index=False)
        
    return jsonify({"success": True})

if __name__ == '__main__':
    print("🚀 Astrology Server running on http://localhost:5001")
    app.run(port=5001, debug=True)
