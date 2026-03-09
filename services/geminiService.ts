import type { AlloyResult, UserRequirements, Language, DeepApplication } from "../types";

export const generateAlloyComposition = async (requirements: UserRequirements, language: Language): Promise<AlloyResult> => {
  try {
    const response = await fetch("/api/generate-alloy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ requirements, language }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to generate alloy composition");
    }

    return await response.json();
  } catch (error) {
    console.error("Error generating alloy composition:", error);
    throw error;
  }
};

export const analyzeMarketRequirements = async (marketInput: string, language: Language): Promise<UserRequirements> => {
  try {
    const response = await fetch("/api/analyze-market", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ marketInput, language }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to analyze market requirements");
    }

    return await response.json();
  } catch (error) {
    console.error("Error analyzing market requirements:", error);
    throw error;
  }
};

export const generateDeepApplications = async (alloyResult: AlloyResult, language: Language): Promise<DeepApplication[]> => {
  try {
    const response = await fetch("/api/deep-applications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ alloyResult, language }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to generate deep applications");
    }

    return await response.json();
  } catch (error) {
    console.error("Error generating deep applications:", error);
    throw error;
  }
};
