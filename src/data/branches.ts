export interface Branch {
  id: string;
  name: string;
  region: string;
  district: string;
  lat: number;
  lng: number;
  healthScore: number;
  monthlyRevenue: number;
}

const DISTRICTS = [
  ['Nasr City', 'Greater Cairo', 30.065, 31.341, 24],
  ['Maadi', 'Greater Cairo', 29.959, 31.260, 18],
  ['Zamalek', 'Greater Cairo', 30.062, 31.219, 8],
  ['Heliopolis', 'Greater Cairo', 30.088, 31.323, 22],
  ['Mohandessin', 'Greater Cairo', 30.061, 31.199, 16],
  ['Dokki', 'Greater Cairo', 30.036, 31.211, 14],
  ['New Cairo', 'Greater Cairo', 30.029, 31.469, 28],
  ['6th October', 'Greater Cairo', 29.940, 30.937, 20],
  ['Sheikh Zayed', 'Greater Cairo', 30.020, 30.945, 12],
  ['Obour', 'Greater Cairo', 30.217, 31.473, 10],
  ['Shorouk', 'Greater Cairo', 30.140, 31.611, 8],
  ['Smouha', 'Alexandria', 31.205, 29.947, 16],
  ['Sidi Gaber', 'Alexandria', 31.221, 29.953, 12],
  ['Miami', 'Alexandria', 31.281, 29.990, 10],
  ['Montaza', 'Alexandria', 31.293, 30.003, 12],
  ['Stanley', 'Alexandria', 31.239, 29.970, 8],
  ['Sporting', 'Alexandria', 31.215, 29.940, 10],
  ['Roushdy', 'Alexandria', 31.230, 29.960, 12],
  ['Tanta', 'Delta', 30.793, 30.998, 22],
  ['Mansoura', 'Delta', 31.042, 31.380, 24],
  ['Mahalla', 'Delta', 30.974, 31.168, 16],
  ['Zagazig', 'Delta', 30.588, 31.502, 14],
  ['Damanhour', 'Delta', 31.034, 30.468, 8],
  ['Kafr El Sheikh', 'Delta', 31.107, 30.939, 6],
  ['Assiut', 'Upper Egypt', 27.182, 31.183, 18],
  ['Sohag', 'Upper Egypt', 26.558, 31.695, 16],
  ['Luxor', 'Upper Egypt', 25.687, 32.639, 14],
  ['Aswan', 'Upper Egypt', 24.091, 32.900, 12],
  ['Minya', 'Upper Egypt', 28.082, 30.756, 12],
  ['Beni Suef', 'Upper Egypt', 29.081, 31.098, 8],
  ['Suez', 'Suez Canal', 29.974, 32.541, 12],
  ['Ismailia', 'Suez Canal', 30.604, 32.272, 10],
  ['Port Said', 'Suez Canal', 31.257, 32.284, 10],
  ['Sharm El Sheikh', 'Suez Canal', 27.916, 34.330, 4],
  ['Hurghada', 'Suez Canal', 27.258, 33.813, 4],
  ['Fayoum', 'Other', 29.309, 30.841, 6],
  ['Qena', 'Other', 26.162, 32.726, 5],
  ['Asyut', 'Other', 27.200, 31.100, 5],
  ['Damietta', 'Other', 31.416, 31.813, 5],
  ['North Sinai', 'Other', 30.928, 33.797, 5],
  ['Beni Mazar', 'Other', 28.500, 30.800, 4],
] as const;

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function buildBranches(): Branch[] {
  const branches: Branch[] = [];
  let idx = 0;
  let seed = 42;

  for (const [district, region, baseLat, baseLng, count] of DISTRICTS) {
    for (let i = 0; i < count; i++) {
      seed++;
      const r1 = seededRandom(seed);
      seed++;
      const r2 = seededRandom(seed);
      seed++;
      const r3 = seededRandom(seed);

      const lat = (baseLat as number) + (r1 - 0.5) * 0.04;
      const lng = (baseLng as number) + (r2 - 0.5) * 0.04;

      let healthScore: number;
      if (r3 < 0.6) healthScore = 75 + Math.floor(r3 * 41.7);
      else if (r3 < 0.9) healthScore = 55 + Math.floor((r3 - 0.6) * 63.3);
      else healthScore = 35 + Math.floor((r3 - 0.9) * 200);
      healthScore = Math.min(100, Math.max(20, healthScore));

      const reg = String(region);
      const prefix =
        reg === 'Greater Cairo' ? 'CAI' :
        reg === 'Alexandria'    ? 'ALX' :
        reg === 'Delta'         ? 'DLT' :
        reg === 'Upper Egypt'   ? 'UPR' :
        reg === 'Suez Canal'    ? 'SUZ' : 'OTH';
      idx++;

      branches.push({
        id: `BR-${prefix}-${String(idx).padStart(3, '0')}`,
        name: `El Ezaby ${String(district)} Branch ${i + 1}`,
        region: reg,
        district: String(district),
        lat,
        lng,
        healthScore,
        monthlyRevenue: 80000 + Math.floor(seededRandom(seed + 1000) * 120000),
      });
    }
  }
  return branches;
}

export const BRANCHES: Branch[] = buildBranches();
