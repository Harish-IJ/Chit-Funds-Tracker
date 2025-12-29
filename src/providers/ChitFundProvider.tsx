/**
 * Chit Fund Data Context
 *
 * Provides data access throughout the application with backend API persistence
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import type {
  ChitFundData,
  Chit,
  ChitMonth,
  Participant,
  Payment,
  CompanyCashMovement,
} from "@/types/chit.types";
import { testData } from "@/lib/test-data/seed";

const API_URL = "http://localhost:3001/api";

// Load data from backend API
const loadInitialData = async (): Promise<ChitFundData> => {
  try {
    const response = await fetch(`${API_URL}/data`);
    if (response.ok) {
      const data = await response.json();
      // If backend returns empty data, use test data
      if (data.chits.length === 0) {
        return testData;
      }
      return data;
    }
  } catch (error) {
    console.error("Failed to load data from backend:", error);
  }
  // Fallback to test data if backend is not available
  return testData;
};

// Save data to backend API
const saveData = async (data: ChitFundData): Promise<void> => {
  try {
    await fetch(`${API_URL}/data`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error("Failed to save data to backend:", error);
  }
};

interface ChitFundContextType {
  data: ChitFundData;
  isLoading: boolean;

  // Chits
  addChit: (chit: Chit) => void;
  updateChit: (id: string, updates: Partial<Chit>) => void;
  deleteChit: (id: string) => void;

  // Chit Months
  addChitMonth: (chitMonth: ChitMonth) => void;
  updateChitMonth: (id: string, updates: Partial<ChitMonth>) => void;
  deleteChitMonth: (id: string) => void;

  // Participants
  addParticipant: (participant: Participant) => void;
  updateParticipant: (id: string, updates: Partial<Participant>) => void;
  deleteParticipant: (id: string) => void;

  // Payments
  addPayment: (payment: Payment) => void;
  updatePayment: (id: string, updates: Partial<Payment>) => void;
  deletePayment: (id: string) => void;

  // Company Cash Movements
  addCashMovement: (movement: CompanyCashMovement) => void;
  updateCashMovement: (id: string, updates: Partial<CompanyCashMovement>) => void;
  deleteCashMovement: (id: string) => void;

  // Utility
  resetData: () => void;
  exportData: () => void;
  importData: (jsonData: ChitFundData) => void;
}

const ChitFundContext = createContext<ChitFundContextType | undefined>(undefined);

export function ChitFundProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<ChitFundData>(testData);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial data from backend
  useEffect(() => {
    console.log("🔄 Loading initial data from backend...");
    loadInitialData()
      .then((loadedData) => {
        console.log("✅ Data loaded:", loadedData);
        setData(loadedData);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("❌ Failed to load data:", error);
        setData(testData);
        setIsLoading(false);
      });
  }, []);

  // Save to backend whenever data changes (debounced)
  useEffect(() => {
    if (!isLoading) {
      const timeoutId = setTimeout(() => {
        console.log("💾 Saving data to backend...");
        saveData(data)
          .then(() => {
            console.log("✅ Data saved successfully");
          })
          .catch((error) => {
            console.error("❌ Failed to save data:", error);
          });
      }, 500); // Debounce 500ms
      return () => clearTimeout(timeoutId);
    }
  }, [data, isLoading]);

  // Chits
  const addChit = useCallback((chit: Chit) => {
    setData((prev) => ({
      ...prev,
      chits: [...prev.chits, chit],
    }));
  }, []);

  const updateChit = useCallback((id: string, updates: Partial<Chit>) => {
    setData((prev) => ({
      ...prev,
      chits: prev.chits.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }));
  }, []);

  const deleteChit = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      chits: prev.chits.filter((c) => c.id !== id),
    }));
  }, []);

  // Chit Months
  const addChitMonth = useCallback((chitMonth: ChitMonth) => {
    setData((prev) => ({
      ...prev,
      chitMonths: [...prev.chitMonths, chitMonth],
    }));
  }, []);

  const updateChitMonth = useCallback((id: string, updates: Partial<ChitMonth>) => {
    setData((prev) => ({
      ...prev,
      chitMonths: prev.chitMonths.map((cm) => (cm.id === id ? { ...cm, ...updates } : cm)),
    }));
  }, []);

  const deleteChitMonth = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      chitMonths: prev.chitMonths.filter((cm) => cm.id !== id),
    }));
  }, []);

  // Participants
  const addParticipant = useCallback((participant: Participant) => {
    setData((prev) => ({
      ...prev,
      participants: [...prev.participants, participant],
    }));
  }, []);

  const updateParticipant = useCallback((id: string, updates: Partial<Participant>) => {
    setData((prev) => ({
      ...prev,
      participants: prev.participants.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }));
  }, []);

  const deleteParticipant = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      participants: prev.participants.filter((p) => p.id !== id),
    }));
  }, []);

  // Payments
  const addPayment = useCallback((payment: Payment) => {
    setData((prev) => ({
      ...prev,
      payments: [...prev.payments, payment],
    }));
  }, []);

  const updatePayment = useCallback((id: string, updates: Partial<Payment>) => {
    setData((prev) => ({
      ...prev,
      payments: prev.payments.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }));
  }, []);

  const deletePayment = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      payments: prev.payments.filter((p) => p.id !== id),
    }));
  }, []);

  // Company Cash Movements
  const addCashMovement = useCallback((movement: CompanyCashMovement) => {
    setData((prev) => ({
      ...prev,
      companyCashMovements: [...prev.companyCashMovements, movement],
    }));
  }, []);

  const updateCashMovement = useCallback((id: string, updates: Partial<CompanyCashMovement>) => {
    setData((prev) => ({
      ...prev,
      companyCashMovements: prev.companyCashMovements.map((m) =>
        m.id === id ? { ...m, ...updates } : m
      ),
    }));
  }, []);

  const deleteCashMovement = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      companyCashMovements: prev.companyCashMovements.filter((m) => m.id !== id),
    }));
  }, []);

  // Utility
  const resetData = useCallback(async () => {
    try {
      await fetch(`${API_URL}/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testData),
      });
      setData(testData);
    } catch (error) {
      console.error("Failed to reset data:", error);
    }
  }, []);

  const exportData = useCallback(() => {
    try {
      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `chit-fund-data-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export data:", error);
    }
  }, [data]);

  const importData = useCallback(async (jsonData: ChitFundData) => {
    try {
      setData(jsonData);
      await saveData(jsonData);
    } catch (error) {
      console.error("Failed to import data:", error);
      throw error;
    }
  }, []);

  return (
    <ChitFundContext.Provider
      value={{
        data,
        isLoading,
        addChit,
        updateChit,
        deleteChit,
        addChitMonth,
        updateChitMonth,
        deleteChitMonth,
        addParticipant,
        updateParticipant,
        deleteParticipant,
        addPayment,
        updatePayment,
        deletePayment,
        addCashMovement,
        updateCashMovement,
        deleteCashMovement,
        resetData,
        exportData,
        importData,
      }}
    >
      {children}
    </ChitFundContext.Provider>
  );
}

export function useChitFund() {
  const context = useContext(ChitFundContext);
  if (!context) {
    throw new Error("useChitFund must be used within ChitFundProvider");
  }
  return context;
}
