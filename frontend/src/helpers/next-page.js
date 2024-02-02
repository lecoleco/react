export const nextPage = (config) => {
  let nextPage = null;

  const { currentPage, totalPages } = config;

  if (currentPage !== undefined && totalPages !== undefined) {
    nextPage = currentPage + 1;

    if (nextPage <= 0 || nextPage > totalPages || nextPage === currentPage) {
      nextPage = null;
    }
  }

  return nextPage;
};
