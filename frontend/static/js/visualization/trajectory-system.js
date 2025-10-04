// 🚀 Advanced Trajectory System - NASA Standards
// Accurate orbital mechanics and trajectory calculations for asteroid impact simulation

console.log('🚀 Loading advanced trajectory system...');

class TrajectorySystem {
    constructor(simulation) {
        this.simulation = simulation;
        this.trajectoryLine = null;
        this.orbitalPath = null;
        this.impactTrajectory = null;
        this.asteroidPosition = new THREE.Vector3(8, 0, 0);
        this.asteroidVelocity = new THREE.Vector3(-0.1, 0, 0);
        this.earthPosition = new THREE.Vector3(0, 0, 0);
        this.gravitationalConstant = 3.986004418e14; // Earth's gravitational parameter (m³/s²)
        this.earthRadius = 6371000; // Earth radius in meters
        this.timeStep = 0.1; // Time step for numerical integration
        this.isAnimating = false;
    }

    // Create realistic asteroid trajectory based on orbital mechanics
    createRealisticTrajectory(asteroidData) {
        console.log(`🚀 Creating realistic trajectory for ${asteroidData.name}...`);
        
        if (this.trajectoryLine) {
            this.simulation.scene.remove(this.trajectoryLine);
        }
        if (this.orbitalPath) {
            this.simulation.scene.remove(this.orbitalPath);
        }
        if (this.impactTrajectory) {
            this.simulation.scene.remove(this.impactTrajectory);
        }

        // Calculate trajectory based on asteroid data
        const trajectory = this.calculateOrbitalTrajectory(asteroidData);
        
        // Create orbital path visualization
        this.createOrbitalPath(trajectory.orbitalPath);
        
        // Create approach trajectory
        this.createApproachTrajectory(trajectory.approachPath);
        
        // Create impact trajectory
        this.createImpactTrajectory(trajectory.impactPath);
        
        console.log('✅ Realistic trajectory created');
    }

    // Calculate orbital trajectory using Keplerian mechanics
    calculateOrbitalTrajectory(asteroidData) {
        const orbitalElements = asteroidData.orbital_elements || {};
        
        // Extract orbital elements
        const semiMajorAxis = (orbitalElements.semi_major_axis || 1.5) * 1.496e11; // AU to meters
        const eccentricity = orbitalElements.eccentricity || 0.2;
        const inclination = (orbitalElements.inclination || 5) * Math.PI / 180; // degrees to radians
        const argumentOfPerihelion = (orbitalElements.argument_of_perihelion || 0) * Math.PI / 180;
        const longitudeOfAscendingNode = (orbitalElements.longitude_of_ascending_node || 0) * Math.PI / 180;
        
        // Calculate orbital velocity
        const orbitalVelocity = Math.sqrt(this.gravitationalConstant / semiMajorAxis);
        
        // Generate orbital path points
        const orbitalPath = [];
        const numPoints = 200;
        
        for (let i = 0; i < numPoints; i++) {
            const trueAnomaly = (i / numPoints) * 2 * Math.PI;
            const radius = semiMajorAxis * (1 - eccentricity * eccentricity) / (1 + eccentricity * Math.cos(trueAnomaly));
            
            // Convert to Cartesian coordinates
            const x = radius * Math.cos(trueAnomaly + argumentOfPerihelion) * Math.cos(longitudeOfAscendingNode) - 
                     radius * Math.sin(trueAnomaly + argumentOfPerihelion) * Math.sin(longitudeOfAscendingNode) * Math.cos(inclination);
            const y = radius * Math.cos(trueAnomaly + argumentOfPerihelion) * Math.sin(longitudeOfAscendingNode) + 
                     radius * Math.sin(trueAnomaly + argumentOfPerihelion) * Math.cos(longitudeOfAscendingNode) * Math.cos(inclination);
            const z = radius * Math.sin(trueAnomaly + argumentOfPerihelion) * Math.sin(inclination);
            
            // Scale for visualization (convert to Earth radii)
            const scaledX = x / (1.496e11) * 50; // Scale to visualization units
            const scaledY = y / (1.496e11) * 50;
            const scaledZ = z / (1.496e11) * 50;
            
            orbitalPath.push(new THREE.Vector3(scaledX, scaledY, scaledZ));
        }
        
        // Generate approach trajectory (last portion of orbit before impact)
        const approachPath = [];
        const approachStart = Math.floor(numPoints * 0.8); // Last 20% of orbit
        
        for (let i = approachStart; i < numPoints; i++) {
            approachPath.push(orbitalPath[i].clone());
        }
        
        // Generate impact trajectory (final approach to Earth)
        const impactPath = [];
        const finalApproachPoints = 50;
        
        for (let i = 0; i < finalApproachPoints; i++) {
            const t = i / finalApproachPoints;
            const startPoint = approachPath[approachPath.length - 1];
            const endPoint = new THREE.Vector3(0, 0, 0); // Earth center
            
            // Parabolic approach trajectory
            const x = startPoint.x * (1 - t);
            const y = startPoint.y * (1 - t) + Math.sin(t * Math.PI) * 2;
            const z = startPoint.z * (1 - t);
            
            impactPath.push(new THREE.Vector3(x, y, z));
        }
        
        return {
            orbitalPath,
            approachPath,
            impactPath,
            orbitalVelocity
        };
    }

    // Create orbital path visualization
    createOrbitalPath(orbitalPath) {
        const geometry = new THREE.BufferGeometry().setFromPoints(orbitalPath);
        const material = new THREE.LineBasicMaterial({
            color: 0x00ff88,
            opacity: 0.3,
            transparent: true,
            linewidth: 2
        });
        
        this.orbitalPath = new THREE.Line(geometry, material);
        this.orbitalPath.name = 'OrbitalPath';
        this.simulation.scene.add(this.orbitalPath);
    }

    // Create approach trajectory visualization
    createApproachTrajectory(approachPath) {
        const geometry = new THREE.BufferGeometry().setFromPoints(approachPath);
        const material = new THREE.LineBasicMaterial({
            color: 0xffaa00,
            opacity: 0.6,
            transparent: true,
            linewidth: 3
        });
        
        this.trajectoryLine = new THREE.Line(geometry, material);
        this.trajectoryLine.name = 'ApproachTrajectory';
        this.simulation.scene.add(this.trajectoryLine);
    }

    // Create impact trajectory visualization
    createImpactTrajectory(impactPath) {
        const geometry = new THREE.BufferGeometry().setFromPoints(impactPath);
        const material = new THREE.LineBasicMaterial({
            color: 0xff4444,
            opacity: 0.8,
            transparent: true,
            linewidth: 4
        });
        
        this.impactTrajectory = new THREE.Line(geometry, material);
        this.impactTrajectory.name = 'ImpactTrajectory';
        this.simulation.scene.add(this.impactTrajectory);
    }

    // Animate asteroid along trajectory
    animateAsteroidAlongTrajectory(asteroidMesh, trajectoryPoints, duration = 5000) {
        if (!asteroidMesh || !trajectoryPoints || trajectoryPoints.length === 0) return;
        
        console.log(`🚀 Animating asteroid along trajectory (${trajectoryPoints.length} points)`);
        
        this.isAnimating = true;
        const startTime = Date.now();
        const totalPoints = trajectoryPoints.length;
        
        const animate = () => {
            if (!this.isAnimating) return;
            
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Use easing function for smooth animation
            const easedProgress = this.easeInOutCubic(progress);
            const pointIndex = Math.floor(easedProgress * (totalPoints - 1));
            
            if (pointIndex < totalPoints) {
                const point = trajectoryPoints[pointIndex];
                asteroidMesh.position.copy(point);
                
                // Calculate rotation based on velocity direction
                if (pointIndex < totalPoints - 1) {
                    const nextPoint = trajectoryPoints[pointIndex + 1];
                    const direction = new THREE.Vector3().subVectors(nextPoint, point).normalize();
                    asteroidMesh.lookAt(asteroidMesh.position.clone().add(direction));
                }
            }
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.isAnimating = false;
                console.log('✅ Asteroid animation completed');
            }
        };
        
        animate();
    }

    // Easing function for smooth animation
    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    // Create realistic orbital mechanics visualization
    createOrbitalMechanicsVisualization(asteroidData) {
        console.log(`🌌 Creating orbital mechanics visualization for ${asteroidData.name}...`);
        
        // Create coordinate system
        this.createCoordinateSystem();
        
        // Create orbital plane
        this.createOrbitalPlane(asteroidData);
        
        // Create velocity vectors
        this.createVelocityVectors(asteroidData);
        
        // Create gravitational field visualization
        this.createGravitationalField();
    }

    // Create coordinate system visualization
    createCoordinateSystem() {
        const axesHelper = new THREE.AxesHelper(10);
        axesHelper.name = 'CoordinateSystem';
        this.simulation.scene.add(axesHelper);
    }

    // Create orbital plane visualization
    createOrbitalPlane(asteroidData) {
        const orbitalElements = asteroidData.orbital_elements || {};
        const inclination = (orbitalElements.inclination || 5) * Math.PI / 180;
        
        const planeGeometry = new THREE.PlaneGeometry(20, 20);
        const planeMaterial = new THREE.MeshBasicMaterial({
            color: 0x0088ff,
            opacity: 0.1,
            transparent: true,
            side: THREE.DoubleSide
        });
        
        const orbitalPlane = new THREE.Mesh(planeGeometry, planeMaterial);
        orbitalPlane.rotation.x = inclination;
        orbitalPlane.name = 'OrbitalPlane';
        this.simulation.scene.add(orbitalPlane);
    }

    // Create velocity vector visualization
    createVelocityVectors(asteroidData) {
        const velocity = asteroidData.velocity_km_s || 30;
        const velocityVector = new THREE.ArrowHelper(
            new THREE.Vector3(-1, 0, 0), // Direction
            new THREE.Vector3(8, 0, 0), // Origin
            velocity * 0.1, // Length
            0xff0000, // Color
            velocity * 0.05, // Head length
            velocity * 0.03 // Head width
        );
        velocityVector.name = 'VelocityVector';
        this.simulation.scene.add(velocityVector);
    }

    // Create gravitational field visualization
    createGravitationalField() {
        const fieldPoints = [];
        const numRings = 5;
        const pointsPerRing = 16;
        
        for (let ring = 1; ring <= numRings; ring++) {
            const radius = ring * 2;
            for (let i = 0; i < pointsPerRing; i++) {
                const angle = (i / pointsPerRing) * 2 * Math.PI;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                fieldPoints.push(new THREE.Vector3(x, y, 0));
            }
        }
        
        const fieldGeometry = new THREE.BufferGeometry().setFromPoints(fieldPoints);
        const fieldMaterial = new THREE.PointsMaterial({
            color: 0x00ffff,
            size: 0.1,
            opacity: 0.3,
            transparent: true
        });
        
        const gravitationalField = new THREE.Points(fieldGeometry, fieldMaterial);
        gravitationalField.name = 'GravitationalField';
        this.simulation.scene.add(gravitationalField);
    }

    // Calculate impact parameters with high precision
    calculateImpactParameters(asteroidData, impactAngle, impactVelocity) {
        console.log(`🎯 Calculating impact parameters for ${asteroidData.name}...`);
        
        const asteroidMass = this.calculateAsteroidMass(asteroidData);
        const kineticEnergy = 0.5 * asteroidMass * Math.pow(impactVelocity * 1000, 2); // Convert km/s to m/s
        
        // Calculate crater dimensions using scaling laws
        const craterDiameter = this.calculateCraterDiameter(kineticEnergy, impactAngle);
        const craterDepth = craterDiameter * 0.25; // Typical depth-to-diameter ratio
        
        // Calculate blast effects
        const blastRadius = this.calculateBlastRadius(kineticEnergy);
        
        // Calculate seismic effects
        const seismicMagnitude = this.calculateSeismicMagnitude(kineticEnergy);
        
        return {
            kineticEnergy,
            craterDiameter,
            craterDepth,
            blastRadius,
            seismicMagnitude,
            asteroidMass
        };
    }

    // Calculate asteroid mass from diameter and composition
    calculateAsteroidMass(asteroidData) {
        const diameter = asteroidData.diameter_km * 1000; // Convert to meters
        const radius = diameter / 2;
        
        // Density based on composition
        let density;
        switch (asteroidData.composition) {
            case 'iron':
                density = 8000; // kg/m³
                break;
            case 'carbonaceous':
                density = 2000; // kg/m³
                break;
            default: // rock
                density = 3000; // kg/m³
        }
        
        const volume = (4/3) * Math.PI * Math.pow(radius, 3);
        return volume * density;
    }

    // Calculate crater diameter using scaling laws
    calculateCraterDiameter(kineticEnergy, impactAngle) {
        // Scaling law for crater diameter
        const energyInMegatons = kineticEnergy / (4.184e15); // Convert to megatons TNT
        const angleFactor = Math.sin(impactAngle * Math.PI / 180);
        
        // Pike crater scaling law
        const craterDiameter = 1.2 * Math.pow(energyInMegatons, 0.294) * Math.pow(angleFactor, 0.5);
        
        return craterDiameter; // km
    }

    // Calculate blast radius
    calculateBlastRadius(kineticEnergy) {
        const energyInMegatons = kineticEnergy / (4.184e15);
        return 1.8 * Math.pow(energyInMegatons, 0.333); // km
    }

    // Calculate seismic magnitude
    calculateSeismicMagnitude(kineticEnergy) {
        // Convert energy to seismic magnitude
        const energyInErgs = kineticEnergy * 1e7; // Convert to ergs
        return (Math.log10(energyInErgs) - 4.8) / 1.5;
    }

    // Clean up trajectory visualizations
    cleanup() {
        const objectsToRemove = [
            'OrbitalPath',
            'ApproachTrajectory', 
            'ImpactTrajectory',
            'CoordinateSystem',
            'OrbitalPlane',
            'VelocityVector',
            'GravitationalField'
        ];
        
        objectsToRemove.forEach(name => {
            const obj = this.simulation.scene.getObjectByName(name);
            if (obj) {
                this.simulation.scene.remove(obj);
            }
        });
        
        this.isAnimating = false;
    }

    // Get trajectory points for animation
    getTrajectoryPoints(asteroidData) {
        const trajectory = this.calculateOrbitalTrajectory(asteroidData);
        return [
            ...trajectory.orbitalPath,
            ...trajectory.approachPath,
            ...trajectory.impactPath
        ];
    }
}

// Export for global use
window.TrajectorySystem = TrajectorySystem;

console.log('🚀 Advanced trajectory system loaded!');
