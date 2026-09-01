/**
 * @file NVectorCalculator.ts
 * @description Stage 4.4: Spherical geodesy and orbital mechanics math on the Stage.
 * Replaces flawed Haversine flat-map formulas with 3D Cartesian n-vectors, 
 * eliminating polar singularities and allowing accurate great-circle and cross-track
 * measurements for orbital combat in Tangent SF RP.
 */

export interface LatLon {
  latitude: number;  // In degrees (-90 to +90)
  longitude: number; // In degrees (-180 to +180)
}

export interface NVector {
  x: number;
  y: number;
  z: number;
}

export const DEFAULT_PLANETARY_RADIUS_KM = 6371; // Earth / standard terrestrial world baseline

export class NVectorCalculator {
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Converts standard geographic coordinates into a 3D n-vector.
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

  public dotProduct(v1: NVector, v2: NVector): number {
    return (v1.x * v2.x) + (v1.y * v2.y) + (v1.z * v2.z);
  }

  public crossProduct(v1: NVector, v2: NVector): NVector {
    return {
      x: (v1.y * v2.z) - (v1.z * v2.y),
      y: (v1.z * v1.x) - (v1.x * v2.z),
      z: (v1.x * v2.y) - (v1.y * v1.x)
    };
  }

  public magnitude(v: NVector): number {
    return Math.sqrt((v.x * v.x) + (v.y * v.y) + (v.z * v.z));
  }

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
   * Calculates true shortest distance across a planetary surface (Great-Circle)
   * using atan2 of cross and dot products. Stable across all poles.
   * @returns Distance in kilometers.
   */
  public greatCircleDistance(a: LatLon, b: LatLon, radiusKm: number = DEFAULT_PLANETARY_RADIUS_KM): number {
    const n1 = this.latLonToNVector(a);
    const n2 = this.latLonToNVector(b);

    const cross = this.crossProduct(n1, n2);
    const dot = this.dotProduct(n1, n2);

    const centralAngle = Math.atan2(this.magnitude(cross), dot);
    return radiusKm * centralAngle;
  }

  /**
   * Calculates Cross-Track Distance for orbital flybys and surface strikes.
   * @returns Distance in kilometers.
   */
  public crossTrackDistance(
    pathStart: LatLon, 
    pathEnd: LatLon, 
    pointP: LatLon, 
    radiusKm: number = DEFAULT_PLANETARY_RADIUS_KM
  ): number {
    const nA = this.latLonToNVector(pathStart);
    const nB = this.latLonToNVector(pathEnd);
    const nP = this.latLonToNVector(pointP);

    const pathNormal = this.normalize(this.crossProduct(nA, nB));
    const dot = this.dotProduct(nP, pathNormal);
    const angularDistance = Math.asin(Math.max(-1, Math.min(1, dot)));

    return Math.abs(radiusKm * angularDistance);
  }
}
