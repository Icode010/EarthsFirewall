# Physics Calculations Documentation

## Overview

The Asteroid Impact Simulator uses scientifically accurate physics calculations for orbital mechanics, impact physics, and environmental effects modeling.

## Orbital Mechanics

### Keplerian Elements

The system uses standard Keplerian orbital elements to describe asteroid orbits:

- **Semi-major axis (a)**: Half the longest diameter of the elliptical orbit
- **Eccentricity (e)**: Measure of orbit's deviation from circular (0 = circular, 1 = parabolic)
- **Inclination (i)**: Angle between orbital plane and reference plane
- **Argument of perihelion (ω)**: Angle from ascending node to perihelion
- **Longitude of ascending node (Ω)**: Angle from reference direction to ascending node
- **True anomaly (ν)**: Angle from perihelion to current position

### Position Calculation

Asteroid positions are calculated using Kepler's equation:

```
M = E - e·sin(E)
```

Where:
- M = Mean anomaly
- E = Eccentric anomaly
- e = Eccentricity

The 3D position is then calculated as:

```
x = a·(cos(E) - e)
y = a·√(1 - e²)·sin(E)
z = 0 (in orbital plane)
```

### Trajectory Propagation

Trajectories are calculated by:
1. Solving Kepler's equation for each time step
2. Converting to 3D Cartesian coordinates
3. Applying orbital plane transformations
4. Checking for Earth intersection

## Impact Physics

### Kinetic Energy

The kinetic energy of impact is calculated as:

```
E = ½·m·v²
```

Where:
- E = Kinetic energy (Joules)
- m = Asteroid mass (kg)
- v = Impact velocity (m/s)

### Mass Calculation

Asteroid mass is calculated from diameter and density:

```
m = ρ·V = ρ·(4/3)·π·r³
```

Where:
- ρ = Density (kg/m³)
- V = Volume (m³)
- r = Radius (m)

### TNT Equivalent

Energy is converted to TNT equivalent:

```
TNT = E / (4.184 × 10¹⁵)
```

Where 4.184 × 10¹⁵ Joules = 1 megaton TNT

### Crater Scaling

Crater diameter is calculated using scaling laws:

```
D = k·E^(1/3)·sin(θ)^n
```

Where:
- D = Crater diameter (km)
- k = Scaling constant (0.1 km/J^(1/3))
- E = Impact energy (Joules)
- θ = Impact angle (radians)
- n = Angle exponent (0.3)

### Blast Radius

Blast radius is calculated using nuclear weapon scaling:

```
R = 1.2·TNT^(1/3)
```

Where:
- R = Blast radius (km)
- TNT = TNT equivalent (megatons)

## Environmental Effects

### Seismic Magnitude

Seismic magnitude is calculated from impact energy:

```
M = (log₁₀(E) - 4.8) / 1.5
```

Where:
- M = Richter scale magnitude
- E = Impact energy (Joules)

### Tsunami Risk

Tsunami wave height is calculated as:

```
H = k·E^(0.3)·D^(-0.2)
```

Where:
- H = Wave height (m)
- k = Ocean depth factor
- E = Impact energy (Joules)
- D = Ocean depth (m)

### Atmospheric Effects

Dust ejection is calculated as:

```
Dust = f·TNT
```

Where:
- Dust = Dust ejected (tons)
- f = Dust factor (1000 tons/MT)
- TNT = TNT equivalent (megatons)

## Mitigation Strategies

### Kinetic Impactor

Momentum transfer is calculated as:

```
Δp = m_impactor·v_impactor
```

Velocity change imparted to asteroid:

```
Δv = Δp / m_asteroid
```

### Gravity Tractor

Gravitational force between tractor and asteroid:

```
F = G·m_asteroid·m_tractor / r²
```

Acceleration on asteroid:

```
a = F / m_asteroid
```

Total velocity change over time:

```
Δv = a·t
```

## Physical Constants

### Fundamental Constants
- Gravitational constant: G = 6.674 × 10⁻¹¹ m³/kg/s²
- Speed of light: c = 299,792,458 m/s
- Earth radius: R_E = 6,371 km
- Earth mass: M_E = 5.972 × 10²⁴ kg
- Sun mass: M_S = 1.989 × 10³⁰ kg

### Astronomical Units
- 1 AU = 149,597,870.7 km
- 1 AU = 1.496 × 10¹¹ m

### Unit Conversions
- 1 km = 1,000 m
- 1 kg = 1,000 g
- 1 J = 1 kg·m²/s²
- 1 megaton TNT = 4.184 × 10¹⁵ J

## Scaling Laws

### Crater Scaling
- Simple crater: D = 1.25·E^(1/3.4)
- Complex crater: D = 1.2·E^(1/3.0)
- Peak-ring crater: D = 1.1·E^(1/3.0)

### Blast Scaling
- Air blast: R = 1.2·TNT^(1/3)
- Thermal radiation: R = 3.0·TNT^(1/3)
- Seismic effects: R = 0.5·TNT^(1/3)

### Tsunami Scaling
- Deep ocean: H = 0.1·E^(0.3)
- Shallow water: H = 0.2·E^(0.3)
- Coastal: H = 0.5·E^(0.3)

## Validation

### Range Checks
- Diameter: 0.001 - 1,000 km
- Velocity: 1 - 100 km/s
- Density: 1,000 - 8,000 kg/m³
- Impact angle: 0 - 90 degrees

### Physical Limits
- Maximum energy: 10³⁰ J (realistic upper limit)
- Maximum crater: 1,000 km diameter
- Maximum magnitude: 10.0 Richter scale

### Conservation Laws
- Energy conservation
- Momentum conservation
- Angular momentum conservation

## Numerical Methods

### Kepler's Equation Solver
Newton-Raphson method:
```
E_{n+1} = E_n - (E_n - e·sin(E_n) - M) / (1 - e·cos(E_n))
```

### Trajectory Integration
Runge-Kutta 4th order method for high accuracy.

### Root Finding
Bisection method for intersection detection.

## Error Handling

### Numerical Stability
- Check for division by zero
- Validate input ranges
- Handle edge cases (e = 0, i = 0)

### Convergence Criteria
- Kepler's equation: |f(E)| < 1e-6
- Trajectory integration: Δt < 1 day
- Root finding: |f(x)| < 1e-6

## Performance Optimization

### Caching
- Pre-calculate common values
- Cache orbital elements
- Store intermediate results

### Approximation
- Use simplified models for real-time display
- Full physics for final calculations
- Adaptive time steps

## References

1. Melosh, H.J. (1989). Impact Cratering: A Geologic Process
2. Collins, G.S. et al. (2005). Earth Impact Effects Program
3. Ward, S.N. & Asphaug, E. (2000). Asteroid Impact Tsunami
4. NASA Near-Earth Object Program
5. USGS Earthquake Hazards Program
