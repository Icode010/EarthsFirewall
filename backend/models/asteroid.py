# Asteroid data model for Asteroid Impact Simulator
# Asteroid class definition
# Attributes:
#   - id, name
#   - diameter (km)
#   - velocity (km/s)
#   - orbital_elements (dict with semi_major_axis, eccentricity, etc.)
#   - position (x, y, z coordinates)
#   - mass (calculated from diameter and density)
# 
# Methods:
#   - __init__: Initialize from NASA API data
#   - calculate_mass(): Compute mass from volume and density
#   - to_dict(): Convert to JSON-serializable dictionary
#   - from_dict(): Create instance from dictionary

# import math
# from config import ASTEROID_DENSITY
# 
# class Asteroid:
#     def __init__(self, asteroid_id, name, diameter, velocity, orbital_elements, 
#                  position=None, density=ASTEROID_DENSITY):
#         """
#         Initialize asteroid with physical and orbital properties
#         
#         Args:
#             asteroid_id (str): Unique identifier
#             name (str): Asteroid name
#             diameter (float): Diameter in kilometers
#             velocity (float): Velocity in km/s
#             orbital_elements (dict): Orbital parameters
#             position (tuple): 3D position (x, y, z) in km
#             density (float): Density in kg/m³
#         """
#         self.id = asteroid_id
#         self.name = name
#         self.diameter = diameter  # km
#         self.velocity = velocity  # km/s
#         self.orbital_elements = orbital_elements
#         self.position = position or (0, 0, 0)
#         self.density = density  # kg/m³
#         self.mass = self.calculate_mass()
#     
#     def calculate_mass(self):
#         """
#         Calculate asteroid mass from diameter and density
#         Mass = Volume × Density
#         Volume = (4/3) × π × (radius)³
#         """
#         radius_m = (self.diameter * 1000) / 2  # Convert km to m, get radius
#         volume = (4/3) * math.pi * (radius_m ** 3)  # m³
#         mass = volume * self.density  # kg
#         return mass
#     
#     def get_orbital_period(self):
#         """
#         Calculate orbital period using Kepler's third law
#         T² = (4π²a³) / (GM)
#         """
#         from config import GRAVITATIONAL_CONSTANT
#         from config import EARTH_MASS
#         
#         semi_major_axis = self.orbital_elements.get('semi_major_axis', 1.0)  # AU
#         semi_major_axis_m = semi_major_axis * 1.496e11  # Convert AU to m
#         
#         period_squared = (4 * math.pi**2 * semi_major_axis_m**3) / (GRAVITATIONAL_CONSTANT * EARTH_MASS)
#         period_seconds = math.sqrt(period_squared)
#         period_days = period_seconds / (24 * 3600)
#         
#         return period_days
#     
#     def get_orbital_velocity(self):
#         """
#         Calculate orbital velocity at current position
#         v = sqrt(GM(2/r - 1/a))
#         """
#         from config import GRAVITATIONAL_CONSTANT, EARTH_MASS
#         
#         semi_major_axis = self.orbital_elements.get('semi_major_axis', 1.0)  # AU
#         semi_major_axis_m = semi_major_axis * 1.496e11  # Convert AU to m
#         
#         # Distance from Sun (simplified - using semi-major axis)
#         r = semi_major_axis_m
#         
#         velocity_squared = GRAVITATIONAL_CONSTANT * EARTH_MASS * (2/r - 1/semi_major_axis_m)
#         velocity_ms = math.sqrt(abs(velocity_squared))  # m/s
#         velocity_kms = velocity_ms / 1000  # km/s
#         
#         return velocity_kms
#     
#     def to_dict(self):
#         """
#         Convert asteroid to dictionary for JSON serialization
#         """
#         return {
#             'id': self.id,
#             'name': self.name,
#             'diameter': self.diameter,
#             'velocity': self.velocity,
#             'orbital_elements': self.orbital_elements,
#             'position': self.position,
#             'density': self.density,
#             'mass': self.mass
#         }
#     
#     @classmethod
#     def from_dict(cls, data):
#         """
#         Create asteroid instance from dictionary
#         """
#         return cls(
#             asteroid_id=data.get('id'),
#             name=data.get('name'),
#             diameter=data.get('diameter', 0),
#             velocity=data.get('velocity', 0),
#             orbital_elements=data.get('orbital_elements', {}),
#             position=data.get('position'),
#             density=data.get('density', ASTEROID_DENSITY)
#         )
#     
#     def __str__(self):
#         return f"Asteroid {self.name} (ID: {self.id}) - Diameter: {self.diameter} km"
#     
#     def __repr__(self):
#         return f"Asteroid(id='{self.id}', name='{self.name}', diameter={self.diameter})"
