import { useState, useEffect, useCallback } from 'react';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  refetch: () => void;
}

/**
 * Custom hook for fetching data from API
 * @param fetchFn - The API function to call
 * @param immediate - Whether to fetch immediately on mount (default: true)
 */
export function useApi<T>(
  fetchFn: () => Promise<T>,
  immediate: boolean = true
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: immediate,
    error: null,
  });

  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const data = await fetchFn();
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error : new Error('Unknown error')
      });
    }
  }, [fetchFn]);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [fetchData, immediate]);

  return {
    ...state,
    refetch: fetchData,
  };
}

/**
 * Custom hook for fetching data with parameters
 * @param fetchFn - The API function to call with parameters
 * @param params - Parameters to pass to the fetch function
 * @param deps - Additional dependencies for refetching
 */
export function useApiWithParams<T, P>(
  fetchFn: (params: P) => Promise<T>,
  params: P,
  deps: React.DependencyList = []
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const data = await fetchFn(params);
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error : new Error('Unknown error')
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchFn, JSON.stringify(params), ...deps]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    ...state,
    refetch: fetchData,
  };
}

export default useApi;
