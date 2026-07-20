export const SHIPMENT_PACKAGE_TYPES = ['SMALL', 'LARGE', 'MANUAL'] as const;

export type ShipmentPackageType = (typeof SHIPMENT_PACKAGE_TYPES)[number];

export type PackageRecommendation = {
  packageType: ShipmentPackageType;
  weightKg: number | null;
  lengthCm: number | null;
  breadthCm: number | null;
  heightCm: number | null;
  requiresManualDetails: boolean;
};

const recommendations: Record<number, Omit<PackageRecommendation, 'requiresManualDetails'>> = {
  1: { packageType: 'SMALL', weightKg: 0.7, lengthCm: 40, breadthCm: 38, heightCm: 3 },
  2: { packageType: 'SMALL', weightKg: 1.2, lengthCm: 40, breadthCm: 38, heightCm: 3 },
  3: { packageType: 'LARGE', weightKg: 1.4, lengthCm: 40, breadthCm: 38, heightCm: 6 },
  4: { packageType: 'LARGE', weightKg: 1.9, lengthCm: 40, breadthCm: 38, heightCm: 6 },
};

export function recommendPackage(totalQuantity: number): PackageRecommendation {
  const recommendation = recommendations[totalQuantity];

  if (recommendation) return { ...recommendation, requiresManualDetails: false };

  return {
    packageType: 'MANUAL',
    weightKg: null,
    lengthCm: null,
    breadthCm: null,
    heightCm: null,
    requiresManualDetails: true,
  };
}

export function validateReviewedPackage(input: {
  packageType: string;
  weightKg: number;
  lengthCm: number;
  breadthCm: number;
  heightCm: number;
}) {
  if (!SHIPMENT_PACKAGE_TYPES.includes(input.packageType as ShipmentPackageType)) {
    return 'Invalid package type.';
  }

  const values: Array<[string, number, number, number]> = [
    ['Weight', input.weightKg, 0.05, 30],
    ['Length', input.lengthCm, 1, 200],
    ['Breadth', input.breadthCm, 1, 200],
    ['Height', input.heightCm, 1, 200],
  ];

  for (const [label, value, min, max] of values) {
    if (!Number.isFinite(value) || value < min || value > max) {
      return `${label} must be between ${min} and ${max}.`;
    }
  }

  return null;
}
