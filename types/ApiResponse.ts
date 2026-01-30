
export type ApiResponse<T> = | {
  statusCode: number;
  succeeded: true;
  message: string;
  data: T;
  errors: null;
  meta: PaginationMeta;
} | {
  statusCode: number;
  succeeded: false;
  message: string;
  data: T | null;
  errors:  null;
  meta: null;
};

export type PaginationMeta = {
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};