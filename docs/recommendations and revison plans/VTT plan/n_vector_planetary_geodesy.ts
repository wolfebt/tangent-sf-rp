/**
 * @file NVectorCalculator.ts
 * @description Stage 4.4: Spherical geodesy and orbital mechanics math.
 * Replaces flawed Haversine flat-map formulas with 3D Cartesian n-vectors, 
 * eliminating polar singularities and allowing accurate great-circle and cross-track
 * measurements for orbital combat in Tangent SF RP.
 */

export interface LatLon {
  latitude: number;  // In degrees
  longitude: number; // In degrees
}

export interface NVector {
  x: number;
  y: number;
  z: number;
}

// Earth's mean radius in kilometers (can be substituted for custom planetary radii)
const PLANETARY_RADIUS_KM = 6371; 

export class NVectorCalculator {

  /**
   * Converts degrees to radians.
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Converts standard geographic coordinates into a 3D n-vector.
   * This projects a point on the sphere surface outward from the core.
   */
  public latLonToNVector(coord: LatLon): NVector {
    const latRad = this.toRadians(coord.latitude);
    const lonRad = this.toRadians(coord.longitude);

    return {
      x: Math.cos(latRad) * Math.cos(lonRad),
      y: Math.cos(latRad) * Math.sin(lonRad),
      z: Math.sin(latRad)
    };
  }

  /**
   * Calculates the dot product of two n-vectors.
   */
  public dotProduct(v1: NVector, v2: NVector): number {
    return (v1.x * v2.x) + (v1.y * v2.y) + (v1.z * v2.z);
  }

  /**
   * Calculates the cross product of two n-vectors.
   * Crucial for determining the plane that passes through both vectors.
   */
  public crossProduct(v1: NVector, v2: NVector): NVector {
    return {
      x: (v1.y * v2.z) - (v1.z * v2.y),
      y: (v1.z * v1.x) - (v1.x * v2.z),
      z: (v1.x * v2.y) - (v1.y * v1.x)
    };
  }

  /**
   * Calculates the magnitude (length) of a vector.
   */
  public magnitude(v: NVector): number {
    return Math.sqrt((v.x * v.x) + (v.y * v.y) + (v.z * v.z));
  }

  /**
   * Normalizes a vector (scales it to a length of exactly 1).
   */
  public normalize(v: NVector): NVector {
    const mag = this.magnitude(v);
    if (mag === 0) return { x: 0, y: 0, z: 0 };
    return {
      x: v.x / mag,
      y: v.y / mag,
      z: v.z / mag
    };
  }

  /**
   * Calculates the true shortest distance across a planetary surface (Great-Circle)
   * using the atan2 of the cross and dot products. Highly stable across all poles.
   * @returns Distance in kilometers.
   */
  public greatCircleDistance(a: LatLon, b: LatLon, radius: number = PLANETARY_RADIUS_KM): number {
    const n1 = this.latLonToNVector(a);
    const n2 = this.latLonToNVector(b);

    const cross = this.crossProduct(n1, n2);
    const dot = this.dotProduct(n1, n2);

    // Delta Sigma is the central angle in radians
    const centralAngle = Math.atan2(this.magnitude(cross), dot);

    return radius * centralAngle;
  }

  /**
   * Calculates the Cross-Track Distance.
   * e.g., If a spacecraft is travelling on a Great Circle path from Point A to Point B, 
   * how close does it come to a planetary defense laser located at Point P?
   * @returns Distance in kilometers.
   */
  public crossTrackDistance(pathStart: LatLon, pathEnd: LatLon, pointP: LatLon, radius: number = PLANETARY_RADIUS_KM): number {
    const nA = this.latLonToNVector(pathStart);
    const nB = this.latLonToNVector(pathEnd);
    const nP = this.latLonToNVector(pointP);

    // The cross product of A and B gives the normal vector of the great-circle plane
    const pathNormal = this.normalize(this.crossProduct(nA, nB));

    // The dot product of the point vector and the plane normal gives the sine of the angular distance
    const dot = this.dotProduct(nP, pathNormal);
    
    const angularDistance = Math.asin(dot);

    // Absolute value because we only care about distance, not which side of the path it is on
    return Math.abs(radius * angularDistance);
  }
}