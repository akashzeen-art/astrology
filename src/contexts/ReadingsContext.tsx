import React, { createContext, useContext, useState, useCallback } from "react";
import { apiService } from "@/lib/apiService";
import type {
  PalmReading,
  AstrologyReading,
  Reading as BaseReading,
} from "@/lib/apiService";

type Reading = PalmReading | AstrologyReading;

interface ReadingsContextType {
  readings: Reading[];
  currentReading: Reading | null;
  isAnalyzing: boolean;
  progress: number;
  setCurrentReading: (reading: Reading | null) => void;
  addReading: (reading: Reading) => void;
  updateReading: (id: string, updates: Partial<Reading>) => void;
  deleteReading: (id: string) => void;
  loadReadings: () => Promise<void>;
  startPalmAnalysis: (file: File) => Promise<PalmReading>;
  startAstrologyReading: (birthData: any) => Promise<AstrologyReading>;
}

const ReadingsContext = createContext<ReadingsContextType | undefined>(
  undefined,
);

export const useReadings = (): ReadingsContextType => {
  const context = useContext(ReadingsContext);
  if (!context) {
    throw new Error("useReadings must be used within a ReadingsProvider");
  }
  return context;
};

interface ReadingsProviderProps {
  children: React.ReactNode;
}

export const ReadingsProvider: React.FC<ReadingsProviderProps> = ({
  children,
}) => {
  const [readings, setReadings] = useState<Reading[]>([]);
  const [currentReading, setCurrentReading] = useState<Reading | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);

  const addReading = useCallback((reading: Reading) => {
    setReadings((prev) => [reading, ...prev]);
  }, []);

  const updateReading = useCallback(
    (id: string, updates: Partial<Reading>) => {
      setReadings((prev) =>
        prev.map((reading) =>
          reading.id === id ? { ...reading, ...updates } : reading,
        ),
      );

      if (currentReading?.id === id) {
        setCurrentReading((prev) => (prev ? { ...prev, ...updates } : null));
      }
    },
    [currentReading],
  );

  const deleteReading = useCallback(
    (id: string) => {
      setReadings((prev) => prev.filter((reading) => reading.id !== id));
      if (currentReading?.id === id) {
        setCurrentReading(null);
      }
    },
    [currentReading],
  );

  const loadReadings = useCallback(async () => {
    try {
      const readingHistory = await apiService.getReadings(20);
      setReadings(readingHistory);
    } catch (error) {
      console.error("Failed to load readings:", error);
    }
  }, []);

  const startPalmAnalysis = useCallback(
    async (file: File): Promise<PalmReading> => {
      setIsAnalyzing(true);
      setProgress(0);

      try {
        // Step 1: Upload image
        setProgress(20);
        const { upload_id } = await apiService.uploadPalmImage(file);

        // Step 2: Start analysis
        setProgress(40);

        // Progress simulation while waiting for AI analysis
        const progressInterval = setInterval(() => {
          setProgress((prev) => {
            const newProgress = Math.min(prev + 5, 90);
            return newProgress;
          });
        }, 500);

        const reading = await apiService.analyzePalm(upload_id);
        clearInterval(progressInterval);

        setProgress(100);
        addReading(reading);
        setCurrentReading(reading);

        return reading;
      } catch (error) {
        console.error("Palm analysis failed:", error);
        setProgress(0);
        throw error;
      } finally {
        setIsAnalyzing(false);
      }
    },
    [addReading],
  );

  const startAstrologyReading = useCallback(
    async (birthData: {
      name: string;
      birth_date: string;
      birth_time: string;
      birth_place: string;
      gender: string;
    }): Promise<AstrologyReading> => {
      setIsAnalyzing(true);
      setProgress(0);

      try {
        // Simulate progress updates with different stages
        const stages = [
          "Mapping celestial coordinates...",
          "Calculating planetary aspects...",
          "Analyzing house positions...",
          "Generating personalized insights...",
        ];

        let currentStage = 0;
        const progressInterval = setInterval(() => {
          setProgress((prev) => {
            const newProgress = prev + 8;

            // Update stage every 25%
            if (newProgress > (currentStage + 1) * 25 && currentStage < 3) {
              currentStage++;
            }

            if (newProgress >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return newProgress;
          });
        }, 300);

        const reading = await apiService.createAstrologyReading(birthData);
        clearInterval(progressInterval);

        setProgress(100);
        addReading(reading);
        setCurrentReading(reading);

        return reading;
      } catch (error) {
        console.error("Astrology reading failed:", error);
        setProgress(0);
        throw error;
      } finally {
        setIsAnalyzing(false);
      }
    },
    [addReading],
  );

  const value: ReadingsContextType = {
    readings,
    currentReading,
    isAnalyzing,
    progress,
    setCurrentReading,
    addReading,
    updateReading,
    deleteReading,
    loadReadings,
    startPalmAnalysis,
    startAstrologyReading,
  };

  return (
    <ReadingsContext.Provider value={value}>
      {children}
    </ReadingsContext.Provider>
  );
};

export default ReadingsProvider;
