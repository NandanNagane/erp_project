// ────────────────────────────────────────────────────────────
// Shared interfaces for paginated list queries across all repositories.
// ────────────────────────────────────────────────────────────

/** Standard pagination parameters accepted by listing endpoints. */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/** Sort direction and field. */
export interface SortParams {
  sortBy?: string;
  order?: 'ASC' | 'DESC';
}

/** Combined filter params used by every list repository method. */
export interface ListFilterParams extends PaginationParams, SortParams {
  /** Free-text search applied across relevant columns. */
  search?: string;
  /** Status filter: 1 = active, 0 = inactive. */
  status?: number;
}

/** Paginated result wrapper returned by list methods. */
export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Tenant scope injected from the authenticated service context.
 * Repositories use this to enforce company-scoped queries.
 *
 * - `companyId` – the authenticated user's owning company.
 * - `isSuperAdmin` – when true the repository skips the company filter.
 * - `userId` – the authenticated user's id, used for audit columns.
 */
export interface TenantScope {
  companyId: number;
  isSuperAdmin?: boolean;
  userId?: number;
}

/** Helper to normalise raw pagination params with safe defaults. */
export function normalisePagination(params: PaginationParams): {
  page: number;
  limit: number;
  skip: number;
} {
  const page = Math.max(1, Number(params.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(params.limit) || 10));
  return { page, limit, skip: (page - 1) * limit };
}
