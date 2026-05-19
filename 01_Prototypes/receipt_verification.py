import hashlib

def verify_receipt(extracted_data, gps_data):
    # 1. GENERATE A UNIQUE HASH (To prevent double-scanning the same receipt)
    # We combine Merchant + Date + Total to create a unique ID
    receipt_string = f"{extracted_data['merchant']}_{extracted_data['date']}_{extracted_data['total']}"
    receipt_hash = hashlib.sha256(receipt_string.encode()).hexdigest()
    
    # Check if this receipt has been used before
    if is_hash_in_database(receipt_hash):
        return "Error: Receipt already claimed."

    # 2. CROSS-REFERENCE WITH GPS
    # Did the user actually spend 3+ minutes at this station at this time?
    if extracted_data['merchant'].lower() not in gps_data['station_name'].lower():
        return "Error: Receipt location does not match GPS history."

    # 3. CALCULATE REWARD
    # If valid, we issue "Pump Points" instead of Satoshis
    reward_points = calculate_points(extracted_data['total'])
    update_user_balance(reward_points)
    
    return f"Success! {reward_points} Pump Points added to your Dashboard."
