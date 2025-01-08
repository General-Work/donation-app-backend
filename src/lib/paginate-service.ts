import { Injectable } from '@nestjs/common';
import { Repository, SelectQueryBuilder, Like, Brackets } from 'typeorm';

export enum OrderDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}
export enum Data_Sort {
  updatedAt_asc = 'updatedAt_asc',
  updatedAt_desc = 'updatedAt_desc',
}

export type OrderBy = { column: string; direction: OrderDirection };

export interface PaginationOptions {
  page?: number;
  pageSize?: number;
  filter?: Record<string, any>;
  dateRange?: { startDate: Date; endDate: Date }; // Add dateRange field
  order?: OrderBy[];
  repository?: Repository<any> | SelectQueryBuilder<any>;
  routeName: string;
  relations?: string[];
  search?: string; // Add search field
  path: string;
  query: string;
}

export interface PageInfo {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalCount: number;
}

export interface INewPaginate {
  currentPage: string | number;
  nextPageUrl: string | null;
  prevPageUrl: string | null;
  perPage: number;
  total: number;
  lastPageUrl: string | null;
  firstPageUrl: string | null;
  path: string;
}

export interface PaginatedResult {
  items: any[];
  pageInfo: PageInfo;
  newPageInfo: INewPaginate;
}

@Injectable()
export class PaginationService {
  async paginate<T>(options: PaginationOptions): Promise<PaginatedResult> {
    const {
      page,
      pageSize,
      filter,
      dateRange,
      order,
      repository,
      routeName,
      relations,
      search,
      path,
      query,
    } = options;

    let queryBuilder: SelectQueryBuilder<T>;

    if (repository instanceof Repository) {
      queryBuilder = this.createPaginationQueryBuilder(
        page,
        pageSize,
        repository,
      );
    } else if (repository instanceof SelectQueryBuilder) {
      if (page && pageSize) {
        const skip = (page - 1) * pageSize;
        queryBuilder = repository.skip(skip).take(pageSize);
      } else {
        queryBuilder = repository;
      }
    } else {
      throw new Error(
        'Invalid repository type. Must be Repository or SelectQueryBuilder.',
      );
    }

    if (filter) {
      this.applyWhereConditions(queryBuilder, filter);
    }

    if (dateRange) {
      this.applyDateRangeConditions(queryBuilder, dateRange);
    }

    if (search) {
      this.applySearchConditions(queryBuilder, search);
    }

    if (order.length) {
      this.applyOrderConditions(queryBuilder, order);
    } else {
      queryBuilder.orderBy('item.updatedAt', 'DESC');
    }

    if (relations) {
      this.applyRelations(queryBuilder, relations);
    }

    const [items, totalCount] = await queryBuilder.getManyAndCount();
    const pageInfo = this.calculatePageInfo(page, pageSize, totalCount);

    const newPage = +page;
    const nextPageUrl = pageInfo.hasNextPage
      ? this.formatRoute(routeName, newPage + 1, pageSize, query)
      : null;
    const prevPageUrl =
      pageInfo.hasPreviousPage && newPage > 1
        ? this.formatRoute(routeName, newPage - 1, pageSize, query)
        : null;

    return {
      items,
      pageInfo,
      newPageInfo: {
        currentPage: pageInfo.currentPage,
        nextPageUrl,
        prevPageUrl,
        perPage: pageSize,
        total: totalCount,
        lastPageUrl: this.formatRoute(
          routeName,
          pageInfo.totalPages,
          pageSize,
          query,
        ),
        firstPageUrl: this.formatRoute(routeName, 1, pageSize, query),

        path,
      },
    };
  }

  private formatRoute(routeName, page, pageSize, query) {
    return query
      ? `${routeName}?page=${page}&pageSize=${pageSize}&${query}`
      : `${routeName}?page=${page}&pageSize=${pageSize}`;
  }

  private createPaginationQueryBuilder<T>(
    page: number = 1,
    pageSize: number = 10,
    repository: Repository<T>,
  ): SelectQueryBuilder<T> {
    const skip = (page - 1) * pageSize;
    return repository.createQueryBuilder('item').skip(skip).take(pageSize);
  }

  private applyWhereConditions(
    queryBuilder: SelectQueryBuilder<any>,
    where:
      | Record<string, any>
      | { AND?: Record<string, any>[]; OR?: Record<string, any>[] },
    alias: string = 'item',
  ): void {
    if (!queryBuilder['_appliedConditions']) {
      queryBuilder['_appliedConditions'] = true; // Custom flag to prevent duplicates

      const handleConditions = (
        conditions:
          | Record<string, any>
          | { AND?: Record<string, any>[]; OR?: Record<string, any>[] },
        currentAlias: string,
        operator: 'AND' | 'OR' = 'AND',
      ) => {
        const conditionKeys = Object.keys(conditions);

        // Group conditions based on logical operators
        const andConditions = (conditions as any).AND || [];
        const orConditions = (conditions as any).OR || [];
        const simpleConditions = conditionKeys.filter(
          (key) => key !== 'AND' && key !== 'OR',
        );

        // Process simple key-value conditions
        simpleConditions.forEach((key) => {
          const value = (conditions as Record<string, any>)[key];

          // Check if the value is an object with operator and value
          if (
            typeof value === 'object' &&
            value !== null &&
            !Array.isArray(value) &&
            ('value' in value || 'operator' in value)
          ) {
            const comparisonOperator = value.operator || 'LIKE'; // Default to 'LIKE'
            const paramKey = `${currentAlias.replace(/\./g, '_')}_${key}`;

            if (comparisonOperator === 'LIKE') {
              queryBuilder[operator === 'AND' ? 'andWhere' : 'orWhere'](
                `${currentAlias}.${key} LIKE :${paramKey}`,
                { [paramKey]: `%${value.value}%` },
              );
            } else {
              queryBuilder[operator === 'AND' ? 'andWhere' : 'orWhere'](
                `${currentAlias}.${key} ${comparisonOperator} :${paramKey}`,
                { [paramKey]: value.value },
              );
            }
          } else if (
            typeof value === 'object' &&
            value !== null &&
            !Array.isArray(value)
          ) {
            const newAlias = `${currentAlias}_${key}`;
            queryBuilder.leftJoinAndSelect(`${currentAlias}.${key}`, newAlias);
            handleConditions(value, newAlias, operator);
          } else {
            const paramKey = `${currentAlias.replace(/\./g, '_')}_${key}`;
            queryBuilder[operator === 'AND' ? 'andWhere' : 'orWhere'](
              `${currentAlias}.${key} LIKE :${paramKey}`,
              { [paramKey]: `%${value}%` },
            );
          }
        });

        // Handle nested AND conditions
        andConditions.forEach((conditionGroup) => {
          queryBuilder.andWhere(
            new Brackets((qb) => {
              handleConditions(conditionGroup, currentAlias, 'AND');
            }),
          );
        });

        // Handle nested OR conditions
        orConditions.forEach((conditionGroup) => {
          queryBuilder.orWhere(
            new Brackets((qb) => {
              handleConditions(conditionGroup, currentAlias, 'OR');
            }),
          );
        });
      };

      handleConditions(where, alias);
    } else {
      console.warn('applyWhereConditions already executed.');
    }
  }

  private applyDateRangeConditions(
    queryBuilder: SelectQueryBuilder<any>,
    dateRange: { startDate: Date; endDate: Date },
  ): void {
    queryBuilder.andWhere('item.createdAt BETWEEN :startDate AND :endDate', {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    });
  }

  private applySearchConditions<T>(
    queryBuilder: SelectQueryBuilder<T>,
    search: string,
  ): void {
    const entityColumns =
      queryBuilder.expressionMap.mainAlias.metadata.columns.map(
        (column) => column.propertyName,
      );
    const searchConditions = entityColumns.map(
      (column) => `${queryBuilder.alias}.${column} LIKE :search`,
    );

    queryBuilder.andWhere(`(${searchConditions.join(' OR ')})`, {
      search: `%${search}%`,
    });
  }

  private applyOrderConditions(
    queryBuilder: SelectQueryBuilder<any>,
    order: { column: string; direction: 'ASC' | 'DESC' }[],
  ): void {
    order.forEach(({ column, direction }) => {
      queryBuilder.addOrderBy(`item.${column}`, direction);
    });
  }

  private applyRelations<T>(
    queryBuilder: SelectQueryBuilder<T>,
    relations: string[],
  ): SelectQueryBuilder<T> {
    relations.forEach((relation) => {
      const nestedRelations = relation.split('.');
      nestedRelations.reduce((builder, rel) => {
        return builder.leftJoinAndSelect(`item.${rel}`, rel);
      }, queryBuilder);
    });

    return queryBuilder;
  }

  private calculatePageInfo(
    page: number,
    pageSize: number,
    totalCount: number,
  ): PageInfo {
    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
      totalCount,
    };
  }
}
