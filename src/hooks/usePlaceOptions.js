// usePlaceOptions.js
import { useState, useEffect } from 'react';
import { GETallGodown } from '@/services/apiServices';

// Shared cache and loading state outside the hook
let cachedOptions = null;
let cachedTimestamp = null;
let isFetching = false; 
let fetchPromise = null; 
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const usePlaceOptions = () => {
  const [options, setOptions] = useState([
    { value: "venue", label: "At venue", id: "venue" },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGodowns = async () => {
      try {
        // Check if we have valid cached data
        const now = Date.now();
        if (
          cachedOptions && 
          cachedTimestamp && 
          (now - cachedTimestamp < CACHE_DURATION)
        ) {
      
          setOptions(cachedOptions);
          return;
        }

        // ✅ NEW: If already fetching, wait for the existing promise
        if (isFetching && fetchPromise) {
       
          setLoading(true);
          await fetchPromise;
          // After the promise resolves, use the cached data
          if (cachedOptions) {
            setOptions(cachedOptions);
          }
          setLoading(false);
          return;
        }

        // ✅ NEW: Set the lock before starting the fetch
        isFetching = true;
        setLoading(true);
        setError(null);

        const userId = localStorage.getItem("userId");

        if (!userId || userId === "undefined" || userId === "null") {
          console.warn("No valid userId found, skipping godown fetch");
          isFetching = false;
          setLoading(false);
          return;
        }

        // ✅ NEW: Create and store the fetch promise
        fetchPromise = GETallGodown(userId);
        const res = await fetchPromise;

        if (res?.data?.data?.length) {
          const godownOptions = res.data.data.map((g) => ({
            value: g.nameEnglish,
            label: g.nameEnglish,
            id: g.id,
          }));

          const finalOptions = [
            { value: "venue", label: "At venue", id: "venue" },
            ...godownOptions,
          ];

          // Update cache
          cachedOptions = finalOptions;
          cachedTimestamp = Date.now();
          
          setOptions(finalOptions);
       
        }
      } catch (err) {
        console.error("Error fetching godowns:", err);
        setError(err);
      } finally {
        // ✅ NEW: Release the lock
        isFetching = false;
        fetchPromise = null;
        setLoading(false);
      }
    };

    fetchGodowns();
  }, []); // ✅ Empty dependency array - only run once per mount

  // Function to manually refresh the data
  const refresh = async () => {
    // Clear cache and lock
    cachedOptions = null;
    cachedTimestamp = null;
    isFetching = false;
    fetchPromise = null;
    
    const userId = localStorage.getItem("userId");
    
    if (!userId) return;

    try {
      isFetching = true;
      setLoading(true);
      
      fetchPromise = GETallGodown(userId);
      const res = await fetchPromise;
      
      if (res?.data?.data?.length) {
        const godownOptions = res.data.data.map((g) => ({
          value: g.nameEnglish,
          label: g.nameEnglish,
          id: g.id,
        }));

        const finalOptions = [
          { value: "venue", label: "At venue", id: "venue" },
          ...godownOptions,
        ];

        cachedOptions = finalOptions;
        cachedTimestamp = Date.now();
        setOptions(finalOptions);
      }
    } catch (err) {
      console.error("Error refreshing godowns:", err);
      setError(err);
    } finally {
      isFetching = false;
      fetchPromise = null;
      setLoading(false);
    }
  };

  return { 
    options, 
    loading, 
    error,
    refresh
  };
};
