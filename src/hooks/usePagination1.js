import { useState, useCallback } from 'react';

/**
 * Custom hook for managing pagination state.
 *
 * @returns {Object} paginationState - Pagination state and handlers.
 * @returns {number} paginationState.page - Current page number.
 * @returns {number} paginationState.limit - Number of items per page.
 * @returns {number} paginationState.lastPageIndex - Index of the last page.
 * @returns {function} paginationState.handlePageChange - Handler for changing the page.
 * @returns {function} paginationState.handleLimitChange - Handler for changing the page limit.
 * @returns {function} paginationState.handleLastPageIndexChange - Handler for setting the last page index.
 */
function usePagination1(initialPage = 1, initialLimit = 10, initialLastPageIndex = 1) {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [lastPageIndex, setLastPageIndex] = useState(initialLastPageIndex);

  /**
   * Handles changes to the page limit and resets the current page to 1.
   * @param {Object} event - Event object containing the new limit value.
   */
  const handleLimitChange = useCallback((event) => {
    setLimit(+event.target.value);
    setPage(1);
  }, []);

  /**
   * Handles changes to the current page.
   * @param {number} value - The new page value.
   */
  const handlePageChange = useCallback((value) => {
    setPage(value);
  }, []);

  /**
   * Handles changes to the last page index.
   * @param {number} value - The new last page index.
   */
  const handleLastPageIndexChange = useCallback((value) => {
    setLastPageIndex(value);
  }, []);

  return {
    page,
    limit,
    lastPageIndex,
    handlePageChange,
    handleLimitChange,
    handleLastPageIndexChange
  };
}

export default usePagination1;
