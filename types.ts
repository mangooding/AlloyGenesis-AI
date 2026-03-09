export interface ElementComposition {
  element: string;
  percentage: number; // 0-100
  role: string;
}

export interface AlloyProperty {
  name: string;
  value: number; // Normalized 0-100
  unit: string;
  predictedValue: string;
  description: string;
}

export interface FeasibilityAnalysis {
  score: number; // 0-100
  level: 'High' | 'Medium' | 'Low';
  productionComplexity: 'Low' | 'Medium' | 'High';
  equipmentRequirements: string[];
  environmentalImpact: string;
  challenges: string[];
  recommendations: string[];
}

export interface CostBreakdownItem {
  item: string;
  percentage: number;
}

export interface BulkPricing {
  minOrderQuantity: string;
  estimatedPriceRange: string;
}

export interface CostAnalysis {
  estimatedCostPerKg: string;
  marketAvailability: 'Common' | 'Rare' | 'Exotic';
  expensiveComponents: string[];
  materialCostBreakdown: CostBreakdownItem[];
  manufacturingCostBreakdown: CostBreakdownItem[];
  bulkPricing: BulkPricing;
  notes: string;
}

export interface ProcessStep {
  step: string;
  details: string; // Temperature, duration, etc.
}

export interface ManufacturingData {
  method: string; // e.g., "Vacuum Induction Melting (VIM)"
  steps: ProcessStep[];
  specificEquipment: string[];
}

export interface HistoricalAlloy {
  name: string;
  compositionSummary: string;
  application: string;
  similarityNote: string; // How it compares to the generated alloy
}

export interface DeepApplication {
  industry: string;
  specificProduct: string;
  reason: string;
  marketPotential: 'High' | 'Medium' | 'Low';
}

export interface AlloyResult {
  alloyName: string;
  codeName: string; // Cool trade name
  description: string;
  composition: ElementComposition[];
  properties: AlloyProperty[];
  feasibility: FeasibilityAnalysis;
  manufacturing: ManufacturingData;
  costAnalysis: CostAnalysis;
  applications: string[]; // Basic list
  deepApplications?: DeepApplication[]; // New detailed analysis
  similarAlloys: HistoricalAlloy[];
}

export interface SavedRecipe extends AlloyResult {
  id: string;
  timestamp: number;
  originalRequirements: UserRequirements;
}

export interface UserRequirements {
  targetHardness: number;
  targetFlexibility: number;
  targetCorrosionResistance: number;
  targetHeatResistance: number;
  targetWeight: number;
  costConstraint: 'Budget' | 'Standard' | 'Premium';
  applicationContext: string;
}

export type Language = 'en' | 'zh';