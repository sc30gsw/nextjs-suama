// ?https://zenn.dev/sirok/articles/nextjs-app-router-with-tanstack-query#%E3%82%AF%E3%82%A8%E3%83%AA%E3%83%95%E3%82%A1%E3%82%AF%E3%83%88%E3%83%AA%E3%81%AE%E5%AE%9F%E8%A3%85
import {
  type InfiniteData,
  type QueryClient,
  type QueryFunction,
  type QueryKey,
  type UseInfiniteQueryOptions,
  type UseInfiniteQueryResult,
  type UseQueryOptions,
  type UseQueryResult,
  useInfiniteQuery,
  useQuery,
} from '@tanstack/react-query'

export function createQueryFactory<
  TData = unknown,
  TError = unknown,
  // 呼び出し側が任意個の引数を渡せるように
  TArgs extends readonly unknown[] = readonly unknown[],
>(keyFn: (...args: TArgs) => QueryKey, fn: (...args: TArgs) => Promise<TData>) {
  // ↓ 呼び出し時に実体化されるクロージャ
  return (...args: TArgs) => {
    const queryKey = keyFn(...args)
    const queryFn: QueryFunction<TData> = () => fn(...args)

    /** サーバー用：prefetchQuery ラッパー */
    const prefetch = (queryClient: QueryClient) =>
      queryClient.prefetchQuery({ queryKey, queryFn })

    /** クライアント用：useQuery ラッパー */
    const use = (
      options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>,
    ): UseQueryResult<TData, TError> =>
      useQuery({ queryKey, queryFn, ...options })

    return { queryKey, prefetch, use } as const
  }
}

export function createInfiniteQueryFactory<
  TPage = unknown, // 1ページ分の型（ResTypeなど）
  TError = unknown,
  TArgs extends readonly unknown[] = readonly unknown[],
  TPageParam = unknown,
>(
  keyFn: (...args: TArgs) => QueryKey,
  queryFn: (pageParam: TPageParam, ...args: TArgs) => Promise<TPage>,
  getNextPageParam: (
    lastPage: TPage,
    allPages: TPage[],
  ) => TPageParam | undefined,
  initialPageParam: TPageParam,
) {
  return (...args: TArgs) => {
    const queryKey = keyFn(...args)

    const use = (
      options?: Omit<
        UseInfiniteQueryOptions<
          TPage,
          TError,
          InfiniteData<TPage>,
          TPage,
          QueryKey,
          TPageParam
        >,
        'queryKey' | 'queryFn' | 'getNextPageParam' | 'initialPageParam'
      >,
    ): UseInfiniteQueryResult<InfiniteData<TPage>, TError> =>
      useInfiniteQuery({
        queryKey,
        queryFn: ({ pageParam }) => queryFn(pageParam as TPageParam, ...args),
        initialPageParam,
        getNextPageParam,
        ...options,
      })

    const prefetch = (queryClient: QueryClient) =>
      queryClient.prefetchInfiniteQuery({
        queryKey,
        queryFn: ({ pageParam }) => queryFn(pageParam as TPageParam, ...args),
        initialPageParam,
        getNextPageParam,
      })

    return { queryKey, use, prefetch } as const
  }
}
