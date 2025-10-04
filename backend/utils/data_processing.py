# Data processing utilities for Asteroid Impact Simulator
# Import numpy
# 
# Function: clean_nasa_data(raw_data)
#   - Extract relevant fields from NASA API response
#   - Handle missing data
#   - Convert units as needed
#   - Return cleaned dictionary
# 
# Function: format_orbital_elements(neo_data)
#   - Extract orbital element values
#   - Convert to standard format
#   - Return dictionary of elements
# 
# Function: validate_input_parameters(params_dict)
#   - Check parameter ranges (size, velocity, etc.)
#   - Ensure physically realistic values
#   - Return validation result and errors

# import numpy as np
# import math
# from utils.constants import *
# 
# def clean_nasa_data(raw_data):
#     """
#     Clean and process raw NASA API data
#     
#     Args:
#         raw_data (dict): Raw NASA API response
#     
#     Returns:
#         dict: Cleaned asteroid data
#     """
#     cleaned_data = {}
#     
#     # Extract basic information
#     cleaned_data['id'] = raw_data.get('id')
#     cleaned_data['name'] = raw_data.get('name', 'Unknown')
#     cleaned_data['is_potentially_hazardous'] = raw_data.get('is_potentially_hazardous_asteroid', False)
#     
#     # Extract diameter information
#     estimated_diameter = raw_data.get('estimated_diameter', {})
#     diameter_km = estimated_diameter.get('kilometers', {})
#     
#     if diameter_km:
#         diameter_min = diameter_km.get('estimated_diameter_min', 0)
#         diameter_max = diameter_km.get('estimated_diameter_max', 0)
#         diameter_avg = (diameter_min + diameter_max) / 2
#         
#         cleaned_data['diameter'] = {
#             'min': diameter_min,
#             'max': diameter_max,
#             'avg': diameter_avg
#         }
#     else:
#         cleaned_data['diameter'] = {'min': 0, 'max': 0, 'avg': 0}
#     
#     # Extract orbital data
#     orbital_data = raw_data.get('orbital_data', {})
#     if orbital_data:
#         cleaned_data['orbital_elements'] = format_orbital_elements(orbital_data)
#     else:
#         cleaned_data['orbital_elements'] = {}
#     
#     # Extract close approach data
#     close_approaches = raw_data.get('close_approach_data', [])
#     if close_approaches:
#         # Get the most recent close approach
#         latest_approach = close_approaches[0]
#         cleaned_data['close_approach'] = {
#             'date': latest_approach.get('close_approach_date'),
#             'velocity': float(latest_approach.get('relative_velocity', {}).get('kilometers_per_second', 0)),
#             'miss_distance': float(latest_approach.get('miss_distance', {}).get('kilometers', 0))
#         }
#     else:
#         cleaned_data['close_approach'] = {
#             'date': None,
#             'velocity': 0,
#             'miss_distance': 0
#         }
#     
#     return cleaned_data
# 
# def format_orbital_elements(neo_data):
#     """
#     Format orbital elements from NASA data
#     
#     Args:
#         neo_data (dict): NASA orbital data
#     
#     Returns:
#         dict: Formatted orbital elements
#     """
#     elements = {}
#     
#     # Semi-major axis
#     semi_major_axis = neo_data.get('semi_major_axis')
#     if semi_major_axis:
#         elements['semi_major_axis'] = float(semi_major_axis)
#     
#     # Eccentricity
#     eccentricity = neo_data.get('eccentricity')
#     if eccentricity:
#         elements['eccentricity'] = float(eccentricity)
#     
#     # Inclination
#     inclination = neo_data.get('inclination')
#     if inclination:
#         elements['inclination'] = float(inclination)
#     
#     # Argument of perihelion
#     argument_of_perihelion = neo_data.get('argument_of_perihelion')
#     if argument_of_perihelion:
#         elements['argument_of_perihelion'] = float(argument_of_perihelion)
#     
#     # Longitude of ascending node
#     longitude_of_ascending_node = neo_data.get('longitude_of_ascending_node')
#     if longitude_of_ascending_node:
#         elements['longitude_of_ascending_node'] = float(longitude_of_ascending_node)
#     
#     # Perihelion distance
#     perihelion_distance = neo_data.get('perihelion_distance')
#     if perihelion_distance:
#         elements['perihelion_distance'] = float(perihelion_distance)
#     
#     # Aphelion distance
#     aphelion_distance = neo_data.get('aphelion_distance')
#     if aphelion_distance:
#         elements['aphelion_distance'] = float(aphelion_distance)
#     
#     # Orbital period
#     orbital_period = neo_data.get('orbital_period')
#     if orbital_period:
#         elements['orbital_period'] = float(orbital_period)
#     
#     return elements
# 
# def validate_input_parameters(params_dict):
#     """
#     Validate input parameters for physical realism
#     
#     Args:
#         params_dict (dict): Input parameters
#     
#     Returns:
#         tuple: (is_valid, errors_list)
#     """
#     errors = []
#     is_valid = True
#     
#     # Validate diameter
#     diameter = params_dict.get('diameter', 0)
#     if diameter < 0:
#         errors.append("Diameter must be positive")
#         is_valid = False
#     elif diameter > 1000:  # 1000 km
#         errors.append("Diameter too large (max 1000 km)")
#         is_valid = False
#     
#     # Validate velocity
#     velocity = params_dict.get('velocity', 0)
#     if velocity < 0:
#         errors.append("Velocity must be positive")
#         is_valid = False
#     elif velocity > 100:  # 100 km/s
#         errors.append("Velocity too high (max 100 km/s)")
#         is_valid = False
#     
#     # Validate impact angle
#     impact_angle = params_dict.get('impact_angle', 45)
#     if impact_angle < 0 or impact_angle > 90:
#         errors.append("Impact angle must be between 0 and 90 degrees")
#         is_valid = False
#     
#     # Validate density
#     density = params_dict.get('density', ASTEROID_DENSITY)
#     if density < 1000 or density > 8000:  # kg/m³
#         errors.append("Density must be between 1000 and 8000 kg/m³")
#         is_valid = False
#     
#     # Validate orbital elements
#     orbital_elements = params_dict.get('orbital_elements', {})
#     if orbital_elements:
#         # Semi-major axis
#         semi_major_axis = orbital_elements.get('semi_major_axis', 1.0)
#         if semi_major_axis < 0.1 or semi_major_axis > 100:  # AU
#             errors.append("Semi-major axis must be between 0.1 and 100 AU")
#             is_valid = False
#         
#         # Eccentricity
#         eccentricity = orbital_elements.get('eccentricity', 0.0)
#         if eccentricity < 0 or eccentricity >= 1:
#             errors.append("Eccentricity must be between 0 and 1")
#             is_valid = False
#         
#         # Inclination
#         inclination = orbital_elements.get('inclination', 0.0)
#         if inclination < 0 or inclination > 180:  # degrees
#             errors.append("Inclination must be between 0 and 180 degrees")
#             is_valid = False
#     
#     return is_valid, errors
# 
# def convert_units(value, from_unit, to_unit):
#     """
#     Convert between different units
#     
#     Args:
#         value (float): Value to convert
#         from_unit (str): Source unit
#         to_unit (str): Target unit
#     
#     Returns:
#         float: Converted value
#     """
#     # Distance conversions
#     if from_unit == 'km' and to_unit == 'm':
#         return value * KM_TO_M
#     elif from_unit == 'm' and to_unit == 'km':
#         return value * M_TO_KM
#     elif from_unit == 'au' and to_unit == 'km':
#         return value * AU_TO_KM
#     elif from_unit == 'km' and to_unit == 'au':
#         return value / AU_TO_KM
#     
#     # Energy conversions
#     elif from_unit == 'joules' and to_unit == 'megatons_tnt':
#         return value * JOULES_TO_MEGATONS
#     elif from_unit == 'megatons_tnt' and to_unit == 'joules':
#         return value * MEGATONS_TO_JOULES
#     
#     # Velocity conversions
#     elif from_unit == 'km_s' and to_unit == 'm_s':
#         return value * KM_TO_M
#     elif from_unit == 'm_s' and to_unit == 'km_s':
#         return value * M_TO_KM
#     
#     else:
#         return value  # No conversion needed
# 
# def calculate_mass_from_diameter(diameter_km, density=ASTEROID_DENSITY):
#     """
#     Calculate mass from diameter and density
#     
#     Args:
#         diameter_km (float): Diameter in kilometers
#         density (float): Density in kg/m³
#     
#     Returns:
#         float: Mass in kilograms
#     """
#     radius_m = (diameter_km * KM_TO_M) / 2  # Convert to meters, get radius
#     volume = (4/3) * math.pi * (radius_m ** 3)  # m³
#     mass = volume * density  # kg
#     return mass
# 
# def calculate_volume_from_diameter(diameter_km):
#     """
#     Calculate volume from diameter
#     
#     Args:
#         diameter_km (float): Diameter in kilometers
#     
#     Returns:
#         float: Volume in cubic kilometers
#     """
#     radius_km = diameter_km / 2
#     volume = (4/3) * math.pi * (radius_km ** 3)  # km³
#     return volume
# 
# def format_scientific_notation(value, decimals=2):
#     """
#     Format number in scientific notation
#     
#     Args:
#         value (float): Number to format
#         decimals (int): Number of decimal places
#     
#     Returns:
#         str: Formatted string
#     """
#     if value == 0:
#         return "0"
#     
#     exponent = int(math.floor(math.log10(abs(value))))
#     coefficient = value / (10 ** exponent)
#     
#     return f"{coefficient:.{decimals}f} × 10^{exponent}"
# 
# def calculate_relative_velocity(asteroid_velocity, earth_velocity=30):
#     """
#     Calculate relative velocity considering Earth's motion
#     
#     Args:
#         asteroid_velocity (float): Asteroid velocity in km/s
#         earth_velocity (float): Earth's orbital velocity in km/s
#     
#     Returns:
#         float: Relative velocity in km/s
#     """
#     # Simplified calculation - in reality would need vector addition
#     relative_velocity = math.sqrt(asteroid_velocity**2 + earth_velocity**2)
#     return relative_velocity
