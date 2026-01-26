
export type ApiResponse<T> = {
  statusCode: number;
  succeeded: boolean;
  message: string;
  data: T;
  errors: unknown | null;
  meta: unknown | null;
};

export type PaginatedResult<T> = {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};