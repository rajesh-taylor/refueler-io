import requests
from datetime import datetime, timedelta

def get_duffel_rental_context(order_id):
    url = f"https://duffel.com{order_id}"
    headers = {
        "Authorization": "Bearer DUFFEL_API_KEY",
        "Duffel-Version": "v2"
    }
    
    response = requests.get(url, headers=headers).json()
    
    # We extract the return location coordinates and the return time
    drop_off_location = response['data']['drop_off_location']
    return_time = response['data']['drop_off_datetime']
    
    return {
        "lat": drop_off_location['latitude'],
        "lon": drop_off_location['longitude'],
        "hub_name": drop_off_location['name'],
        "deadline": return_time
    }

# 2. TRIGGER THE "PUMP" GEOFENCE
def activate_fuel_watch(rental_data):
    # Calculate the "Alert Window" (2 hours before return)
    deadline_dt = datetime.fromisoformat(rental_data['deadline'].replace("Z", ""))
    alert_window_start = deadline_dt - timedelta(hours=2)
    
    print(f"System: Monitoring fuel for return to {rental_data['hub_name']}")
    print(f"System: Geofence active for coordinates {rental_data['lat']}, {rental_data['lon']}")
    
    # This data is now pushed to the User's Apple Watch/CarPlay
    # so the "Chronograph" dial knows which airport it is 'watching'.
    return "Monitoring Active"

# --- EXECUTION ---
# When a user logs in with their Duffel Booking Reference:
context = get_duffel_rental_context("ord_0000A123")
activate_fuel_watch(context)
