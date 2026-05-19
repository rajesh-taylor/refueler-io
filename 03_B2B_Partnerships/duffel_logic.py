import requests

# 1. DUFFEL: Search for a Rental Car in London (Heathrow LHR)
def search_duffel_cars(pickup_location):
    url = "https://duffel.com"
    headers = {"Authorization": "Bearer YOUR_DUFFEL_TOKEN", "Duffel-Version": "v2"}
    payload = {
        "data": {
            "pickup_location": pickup_location, # e.g., "LHR"
            "pickup_datetime": "2026-06-01T10:00:00Z",
            "drop_off_datetime": "2026-06-05T10:00:00Z"
        }
    }
    return {"type": "EV", "lat": 51.4700, "lon": -0.4543} 

# 2. GOV.UK: Get Live Fuel Prices
def get_uk_fuel_prices(lat, lon):
    url = f"https://service.gov.uk{lat}&long={lon}&radius=5"
    # Conceptual return of cheapest station nearby
    return {"brand": "Tesco", "price": 142.9}

# 3. ZAPMAP/THIRD PARTY: Get EV Charging Prices
def get_ev_charging_data(lat, lon):
    return {"station": "Shell Recharge London", "price_per_kwh": "0.79 GBP"}

# --- Main Logic ---
rental = search_duffel_cars("LHR")
if rental['type'] == "EV":
    prices = get_ev_charging_data(rental['lat'], rental['lon'])
    print(f"EV charging near drop-off: {prices['station']} at {prices['price_per_kwh']}")
else:
    prices = get_uk_fuel_prices(rental['lat'], rental['lon'])
    print(f"Cheapest Petrol near drop-off: {prices['brand']} at {prices['price']}p")
