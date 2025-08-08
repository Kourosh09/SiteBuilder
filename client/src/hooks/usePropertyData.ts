import { useState, useEffect } from 'react';

interface PropertyData {
  address: string;
  city: string;
  currentValue?: number;
  lotSize: number;
  currentUse: string;
  proposedUse: string;
  sessionId?: string;
}

const PROPERTY_STORAGE_KEY = 'buildwiseai_property_session';

export function usePropertyData() {
  const [propertyData, setPropertyDataState] = useState<PropertyData | null>(null);

  useEffect(() => {
    // Load property data from localStorage on component mount
    const storedData = localStorage.getItem(PROPERTY_STORAGE_KEY);
    if (storedData) {
      try {
        setPropertyDataState(JSON.parse(storedData));
      } catch (error) {
        console.error('Error parsing stored property data:', error);
      }
    }
  }, []);

  const setPropertyData = (data: PropertyData | null) => {
    setPropertyDataState(data);
    if (data) {
      localStorage.setItem(PROPERTY_STORAGE_KEY, JSON.stringify(data));
    } else {
      localStorage.removeItem(PROPERTY_STORAGE_KEY);
    }
  };

  const clearPropertyData = () => {
    setPropertyDataState(null);
    localStorage.removeItem(PROPERTY_STORAGE_KEY);
  };

  const hasPropertyData = !!propertyData && !!propertyData.address && !!propertyData.city;

  return {
    propertyData,
    setPropertyData,
    clearPropertyData,
    hasPropertyData
  };
}