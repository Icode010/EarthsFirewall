# NASA NEO API integration for Asteroid Impact Simulator
# Import requests, os for environment variables
# Function: fetch_neo_data(asteroid_id=None, date_range=None)
#   - Build NASA NEO API request
#   - Handle API authentication
#   - Parse JSON response
#   - Error handling for API failures
#   - Return formatted asteroid data
# Function: get_asteroid_details(asteroid_id)
#   - Fetch specific asteroid parameters
#   - Extract orbital elements (semi-major axis, eccentricity, etc.)
#   - Extract physical properties (diameter, velocity)

# import requests
# import os
# from datetime import datetime, timedelta
# from config import NASA_API_KEY, NASA_NEO_API_BASE
# 
# class NASAAPIClient:
#     def __init__(self):
#         self.api_key = NASA_API_KEY
#         self.base_url = NASA_NEO_API_BASE
#         self.session = requests.Session()
#     
#     def fetch_neo_data(self, asteroid_id=None, date_range=None):
#         """
#         Fetch near-Earth object data from NASA API
#         """
#         try:
#             if asteroid_id:
#                 # Fetch specific asteroid
#                 url = f"{self.base_url}/neo/{asteroid_id}"
#                 params = {'api_key': self.api_key}
#             else:
#                 # Fetch asteroids for date range
#                 if not date_range:
#                     # Default to next 7 days
#                     start_date = datetime.now().strftime('%Y-%m-%d')
#                     end_date = (datetime.now() + timedelta(days=7)).strftime('%Y-%m-%d')
#                 else:
#                     start_date, end_date = date_range
#                 
#                 url = f"{self.base_url}/feed"
#                 params = {
#                     'api_key': self.api_key,
#                     'start_date': start_date,
#                     'end_date': end_date
#                 }
#             
#             response = self.session.get(url, params=params)
#             response.raise_for_status()
#             
#             return response.json()
#             
#         except requests.exceptions.RequestException as e:
#             print(f"NASA API Error: {e}")
#             return None
#     
#     def get_asteroid_details(self, asteroid_id):
#         """
#         Get detailed information about a specific asteroid
#         """
#         try:
#             url = f"{self.base_url}/neo/{asteroid_id}"
#             params = {'api_key': self.api_key}
#             
#             response = self.session.get(url, params=params)
#             response.raise_for_status()
#             
#             data = response.json()
#             
#             # Extract orbital elements
#             orbital_data = data.get('orbital_data', {})
#             orbital_elements = {
#                 'semi_major_axis': orbital_data.get('semi_major_axis'),
#                 'eccentricity': orbital_data.get('eccentricity'),
#                 'inclination': orbital_data.get('inclination'),
#                 'perihelion_distance': orbital_data.get('perihelion_distance'),
#                 'aphelion_distance': orbital_data.get('aphelion_distance'),
#                 'orbital_period': orbital_data.get('orbital_period')
#             }
#             
#             # Extract physical properties
#             estimated_diameter = data.get('estimated_diameter', {})
#             diameter_km = estimated_diameter.get('kilometers', {})
#             
#             physical_properties = {
#                 'diameter_min': diameter_km.get('estimated_diameter_min'),
#                 'diameter_max': diameter_km.get('estimated_diameter_max'),
#                 'diameter_avg': (diameter_km.get('estimated_diameter_min', 0) + 
#                               diameter_km.get('estimated_diameter_max', 0)) / 2
#             }
#             
#             return {
#                 'id': data.get('id'),
#                 'name': data.get('name'),
#                 'orbital_elements': orbital_elements,
#                 'physical_properties': physical_properties,
#                 'is_potentially_hazardous': data.get('is_potentially_hazardous_asteroid', False)
#             }
#             
#         except requests.exceptions.RequestException as e:
#             print(f"NASA API Error: {e}")
#             return None
#     
#     def get_close_approaches(self, asteroid_id, days_ahead=30):
#         """
#         Get close approach data for an asteroid
#         """
#         try:
#             url = f"{self.base_url}/neo/{asteroid_id}"
#             params = {'api_key': self.api_key}
#             
#             response = self.session.get(url, params=params)
#             response.raise_for_status()
#             
#             data = response.json()
#             close_approaches = data.get('close_approach_data', [])
#             
#             # Filter for future approaches
#             future_approaches = []
#             for approach in close_approaches:
#                 approach_date = datetime.strptime(
#                     approach['close_approach_date'], '%Y-%m-%d'
#                 )
#                 if approach_date > datetime.now():
#                     future_approaches.append(approach)
#             
#             return future_approaches[:days_ahead]
#             
#         except requests.exceptions.RequestException as e:
#             print(f"NASA API Error: {e}")
#             return []
