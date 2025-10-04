// Utility helper functions for Asteroid Impact Simulator
// 
// Function: formatScientificNotation(number, decimals)
//   - Convert number to readable scientific notation
//   - Return formatted string
// 
// Function: convertLatLonToCartesian(lat, lon, radius)
//   - Convert geographic coordinates to 3D Cartesian
//   - Used for placing impact markers on Earth
// 
// Function: formatDistance(km)
//   - Format distance with appropriate units (km, AU)
// 
// Function: debounce(func, delay)
//   - Debounce function for slider inputs
//   - Prevent excessive API calls
// 
// Function: showNotification(message, type)
//   - Display toast notification (success, error, info)
// 
// Function: validateNumericInput(value, min, max)
//   - Ensure input is within acceptable range

// Format number in scientific notation
function formatScientificNotation(number, decimals = 2) {
    if (number === 0) return "0";
    
    const exponent = Math.floor(Math.log10(Math.abs(number)));
    const coefficient = number / Math.pow(10, exponent);
    
    return `${coefficient.toFixed(decimals)} × 10^${exponent}`;
}

// Convert latitude/longitude to 3D Cartesian coordinates
function convertLatLonToCartesian(lat, lon, radius = EARTH_RADIUS) {
    const latRad = lat * Math.PI / 180;
    const lonRad = lon * Math.PI / 180;
    
    const x = radius * Math.cos(latRad) * Math.cos(lonRad);
    const y = radius * Math.sin(latRad);
    const z = radius * Math.cos(latRad) * Math.sin(lonRad);
    
    return { x, y, z };
}

// Convert 3D Cartesian coordinates to latitude/longitude
function convertCartesianToLatLon(x, y, z) {
    const radius = Math.sqrt(x*x + y*y + z*z);
    
    const lat = Math.asin(y / radius) * 180 / Math.PI;
    const lon = Math.atan2(z, x) * 180 / Math.PI;
    
    return { lat, lon };
}

// Format distance with appropriate units
function formatDistance(km) {
    if (km < 1) {
        return `${(km * 1000).toFixed(0)} m`;
    } else if (km < 1000) {
        return `${km.toFixed(1)} km`;
    } else if (km < AU_TO_KM) {
        return `${(km / 1000).toFixed(1)} Mm`;
    } else {
        return `${(km / AU_TO_KM).toFixed(3)} AU`;
    }
}

// Format time with appropriate units
function formatTime(seconds) {
    if (seconds < 60) {
        return `${seconds.toFixed(1)}s`;
    } else if (seconds < 3600) {
        return `${(seconds / 60).toFixed(1)}m`;
    } else if (seconds < 86400) {
        return `${(seconds / 3600).toFixed(1)}h`;
    } else {
        return `${(seconds / 86400).toFixed(1)}d`;
    }
}

// Format energy with appropriate units
function formatEnergy(joules) {
    if (joules < 1e6) {
        return `${(joules / 1000).toFixed(1)} kJ`;
    } else if (joules < 1e9) {
        return `${(joules / 1e6).toFixed(1)} MJ`;
    } else if (joules < 1e12) {
        return `${(joules / 1e9).toFixed(1)} GJ`;
    } else if (joules < 1e15) {
        return `${(joules / 1e12).toFixed(1)} TJ`;
    } else {
        const megatons = joules * JOULES_TO_MEGATONS;
        return `${megatons.toFixed(1)} MT`;
    }
}

// Format mass with appropriate units
function formatMass(kg) {
    if (kg < 1000) {
        return `${kg.toFixed(1)} kg`;
    } else if (kg < 1e6) {
        return `${(kg / 1000).toFixed(1)} t`;
    } else if (kg < 1e9) {
        return `${(kg / 1e6).toFixed(1)} kt`;
    } else if (kg < 1e12) {
        return `${(kg / 1e9).toFixed(1)} Mt`;
    } else {
        return `${(kg / 1e12).toFixed(1)} Gt`;
    }
}

// Format velocity with appropriate units
function formatVelocity(km_s) {
    if (km_s < 1) {
        return `${(km_s * 1000).toFixed(1)} m/s`;
    } else if (km_s < 100) {
        return `${km_s.toFixed(1)} km/s`;
    } else {
        return `${(km_s / 1000).toFixed(1)} Mm/s`;
    }
}

// Debounce function for performance optimization
function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

// Throttle function for performance optimization
function throttle(func, limit) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Show notification with different types
function showNotification(message, type = 'info', duration = NOTIFICATION_DURATION) {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style notification
    const colors = {
        success: '#00ff88',
        error: '#ff4444',
        warning: '#ffaa00',
        info: '#00d4ff'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 6px;
        color: white;
        font-weight: 600;
        z-index: 1000;
        background-color: ${colors[type] || colors.info};
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        animation: slideIn 0.3s ease-out;
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Remove after duration
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }
    }, duration);
}

// Validate numeric input
function validateNumericInput(value, min, max) {
    const num = parseFloat(value);
    
    if (isNaN(num)) {
        return { valid: false, error: 'Invalid number' };
    }
    
    if (num < min) {
        return { valid: false, error: `Value must be at least ${min}` };
    }
    
    if (num > max) {
        return { valid: false, error: `Value must be at most ${max}` };
    }
    
    return { valid: true, value: num };
}

// Calculate distance between two points
function calculateDistance(point1, point2) {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    const dz = point2.z - point1.z;
    
    return Math.sqrt(dx*dx + dy*dy + dz*dz);
}

// Calculate angle between two vectors
function calculateAngle(vector1, vector2) {
    const dot = vector1.x * vector2.x + vector1.y * vector2.y + vector1.z * vector2.z;
    const mag1 = Math.sqrt(vector1.x*vector1.x + vector1.y*vector1.y + vector1.z*vector1.z);
    const mag2 = Math.sqrt(vector2.x*vector2.x + vector2.y*vector2.y + vector2.z*vector2.z);
    
    return Math.acos(dot / (mag1 * mag2)) * 180 / Math.PI;
}

// Linear interpolation
function lerp(start, end, factor) {
    return start + (end - start) * factor;
}

// Clamp value between min and max
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

// Generate random number between min and max
function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
}

// Generate random integer between min and max (inclusive)
function randomIntBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Check if point is inside sphere
function isPointInsideSphere(point, center, radius) {
    const distance = calculateDistance(point, center);
    return distance <= radius;
}

// Check if two spheres intersect
function doSpheresIntersect(center1, radius1, center2, radius2) {
    const distance = calculateDistance(center1, center2);
    return distance <= (radius1 + radius2);
}

// Calculate intersection of line and sphere
function lineSphereIntersection(lineStart, lineEnd, sphereCenter, sphereRadius) {
    const direction = {
        x: lineEnd.x - lineStart.x,
        y: lineEnd.y - lineStart.y,
        z: lineEnd.z - lineStart.z
    };
    
    const toSphere = {
        x: sphereCenter.x - lineStart.x,
        y: sphereCenter.y - lineStart.y,
        z: sphereCenter.z - lineStart.z
    };
    
    const a = direction.x*direction.x + direction.y*direction.y + direction.z*direction.z;
    const b = 2 * (toSphere.x*direction.x + toSphere.y*direction.y + toSphere.z*direction.z);
    const c = toSphere.x*toSphere.x + toSphere.y*toSphere.y + toSphere.z*toSphere.z - sphereRadius*sphereRadius;
    
    const discriminant = b*b - 4*a*c;
    
    if (discriminant < 0) {
        return null; // No intersection
    }
    
    const t1 = (-b + Math.sqrt(discriminant)) / (2*a);
    const t2 = (-b - Math.sqrt(discriminant)) / (2*a);
    
    const t = Math.min(t1, t2);
    
    if (t < 0 || t > 1) {
        return null; // Intersection outside line segment
    }
    
    return {
        x: lineStart.x + t * direction.x,
        y: lineStart.y + t * direction.y,
        z: lineStart.z + t * direction.z
    };
}

// Format percentage
function formatPercentage(value, decimals = 1) {
    return `${(value * 100).toFixed(decimals)}%`;
}

// Format large numbers with commas
function formatNumberWithCommas(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Get ordinal suffix for numbers
function getOrdinalSuffix(number) {
    const j = number % 10;
    const k = number % 100;
    
    if (j === 1 && k !== 11) {
        return number + "st";
    }
    if (j === 2 && k !== 12) {
        return number + "nd";
    }
    if (j === 3 && k !== 13) {
        return number + "rd";
    }
    return number + "th";
}

// Deep clone object
function deepClone(obj) {
    if (obj === null || typeof obj !== "object") {
        return obj;
    }
    
    if (obj instanceof Date) {
        return new Date(obj.getTime());
    }
    
    if (obj instanceof Array) {
        return obj.map(item => deepClone(item));
    }
    
    if (typeof obj === "object") {
        const clonedObj = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = deepClone(obj[key]);
            }
        }
        return clonedObj;
    }
}

// Check if object is empty
function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}

// Get random element from array
function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// Shuffle array
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        formatScientificNotation,
        convertLatLonToCartesian,
        convertCartesianToLatLon,
        formatDistance,
        formatTime,
        formatEnergy,
        formatMass,
        formatVelocity,
        debounce,
        throttle,
        showNotification,
        validateNumericInput,
        calculateDistance,
        calculateAngle,
        lerp,
        clamp,
        randomBetween,
        randomIntBetween,
        isPointInsideSphere,
        doSpheresIntersect,
        lineSphereIntersection,
        formatPercentage,
        formatNumberWithCommas,
        getOrdinalSuffix,
        deepClone,
        isEmpty,
        getRandomElement,
        shuffleArray
    };
}
