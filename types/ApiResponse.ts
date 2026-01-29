
export type ApiResponse<T> = {
  statusCode: number;
  succeeded: boolean;
  message: string;
  data: T | null;
  errors: unknown | null;
  meta: PaginationMeta;
};

export type PaginationMeta = {
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};