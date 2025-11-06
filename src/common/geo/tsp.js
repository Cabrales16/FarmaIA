// src/common/geo/tsp.js

// Distancia Haversine (km)
export function haversineKm(a, b) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Heurística: Vecino más cercano
export function nearestNeighborRoute(points, depot) {
  const unvisited = points.map((p) => ({ ...p }));
  const route = [];
  let current = depot;

  while (unvisited.length) {
    let bestIdx = 0;
    let bestDist = Infinity;
    for (let i = 0; i < unvisited.length; i++) {
      const d = haversineKm(current, unvisited[i]);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    }
    const next = unvisited.splice(bestIdx, 1)[0];
    route.push(next);
    current = next;
  }
  return route;
}

// Refinamiento: 2-Opt
export function twoOpt(route, depot, maxIters = 200) {
  const n = route.length;
  if (n < 4) return route;

  const fullDist = (seq) => {
    let sum = haversineKm(depot, seq[0]);
    for (let i = 0; i < seq.length - 1; i++) sum += haversineKm(seq[i], seq[i + 1]);
    return sum;
  };

  let best = route.slice();
  let bestDist = fullDist(best);

  let improved = true;
  let iters = 0;
  while (improved && iters < maxIters) {
    improved = false;
    iters++;
    for (let i = 0; i < n - 1; i++) {
      for (let k = i + 1; k < n; k++) {
        const candidate = best.slice();
        candidate.splice(i, k - i + 1, ...best.slice(i, k + 1).reverse());
        const candDist = fullDist(candidate);
        if (candDist + 1e-9 < bestDist) {
          best = candidate;
          bestDist = candDist;
          improved = true;
        }
      }
    }
  }
  return best;
}

// Distancia total (km)
export function totalDistanceKm(route, depot) {
  if (!route.length) return 0;
  let sum = haversineKm(depot, route[0]);
  for (let i = 0; i < route.length - 1; i++) sum += haversineKm(route[i], route[i + 1]);
  return sum;
}

// ETA: distancia / kmh
export function estimateETAkmh(totalKm, kmh = 25) {
  const hours = totalKm / kmh;
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return { h, m };
}

// GPX para navegación (Organic Maps/OsmAnd)
export function buildGPX(route, depot, name = "Ruta FarmaIA") {
  const header = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="FarmaIA" xmlns="http://www.topografix.com/GPX/1/1">
  <trk><name>${name}</name><trkseg>
`;
  const footer = `  </trkseg></trk></gpx>`;
  const points = [depot, ...route];
  const segs = points
    .map(
      (p) => `    <trkpt lat="${p.lat.toFixed(6)}" lon="${p.lng.toFixed(6)}"></trkpt>`
    )
    .join("\n");
  return header + segs + "\n" + footer;
}