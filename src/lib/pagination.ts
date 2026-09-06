export type PageResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export function readPage(page: number | undefined, pageSize: number | undefined) {
  const safePageSize = Math.min(Math.max(Math.floor(pageSize ?? 25), 1), 100);
  const safePage = Math.max(Math.floor(page ?? 1), 1);
  return { page: safePage, pageSize: safePageSize, skip: (safePage - 1) * safePageSize };
}
