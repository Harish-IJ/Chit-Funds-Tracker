/**
 * Data Access Layer
 *
 * Handles reading and writing to JSON files.
 * This will be replaced with actual API calls when backend is ready.
 */

import type { ChitFundData } from "@/types/chit.types";
import { testData } from "@/lib/test-data/seed";

/**
 * In-memory data store
 * Initialized with test data
 */
let dataStore: ChitFundData = testData;

/**
 * Get all data
 */
export function getAllData(): ChitFundData {
  return dataStore;
}

/**
 * Update data
 * @param newData - Updated data
 */
export function setData(newData: ChitFundData): void {
  dataStore = newData;
  // In a real implementation, this would write to the JSON file
  // or make an API call to save the data
}

/**
 * Reset data to test data
 */
export function resetData(): void {
  dataStore = testData;
}

/**
 * Load data from JSON file
 * This is a placeholder - in production, this would fetch from an API
 */
export async function loadData(): Promise<ChitFundData> {
  // In a real implementation, this would read from the JSON file
  // or fetch from an API
  return dataStore;
}

/**
 * Save data to JSON file
 * This is a placeholder - in production, this would save to an API
 */
export async function saveData(data: ChitFundData): Promise<void> {
  dataStore = data;
  // In a real implementation, this would write to the JSON file
  // or make an API call
  console.log("Data saved:", data);
}
