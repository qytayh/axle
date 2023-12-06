import type { AxiosInterceptorOptions, AxiosResponse } from 'axios'
import type { ResponseInterceptor } from '../instance'
import { createMatcher } from '../matcher'

export interface ResponseBlobInterceptorOptions {
  onResponse?: (response: AxiosResponse<any, any>) => any
  include?: string[]
  exclude?: string[]
  axiosInterceptorOptions?: AxiosInterceptorOptions
}

export function responseBlobInterceptor(options: ResponseBlobInterceptorOptions = {}): ResponseInterceptor {
  return {
    onFulfilled(response) {
      const matcher = createMatcher(options.include, options.exclude)
      if (!matcher(response.config.method ?? '', response.config.url ?? '')) {
        return response
      }

      if (response.request.responseType === 'blob') {
        return options.onResponse?.(response) ?? response
      }

      return response
    },
    onRejected: Promise.reject,
    options: options.axiosInterceptorOptions,
  }
}
