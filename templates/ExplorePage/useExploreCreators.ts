
import { useExploreCreators as useQueryExplore } from "@/hooks/useQueries";

export const useExploreCreators = () => {
    const { data, isLoading, isError, error, refetch } = useQueryExplore();

    return {
        creators: data || [],
        isLoading,
        error: isError ? (error instanceof Error ? error.message : "Failed to load creators") : null,
        refresh: refetch
    };
};
