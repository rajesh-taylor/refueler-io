import requests

def report_conversion_to_partner(user_id, station_id, transaction_data):
    # This is the data the Supermarket needs to see to pay us
    payload = {
        "partner_id": "PUMP_UK_001",
        "station_code": station_id,
        "timestamp": transaction_data['time'],
        "confirmation_type": "GPS_plus_TELEMETRY", # Our proof method
        "loyalty_linked": True, # If they used Nectar/Clubcard
        "transaction_value": transaction_data['total_gbp']
    }
    
    # We send this to the Supermarket's Affiliate/Lead-Gen endpoint
    # Note: URL is conceptual for development
    response = requests.post("https://sainsburys-partners.co.uk", json=payload)
    
    if response.status_code == 200:
        return "Lead Fee Earned: £0.50"
    else:
        return "Error: Could not verify lead with partner."
