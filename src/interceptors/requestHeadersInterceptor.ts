import { isFunction } from '@varlet/shared'
import type { RequestInterceptor } from '../instance'
import type { AxiosInterceptorOptions } from 'axios'

export interface RequestHeadersInterceptorOptions {
  headers?: Record<string, string> | (() => Record<string, string>)
  axiosInterceptorOptions?: AxiosInterceptorOptions
}

export function requestHeadersInterceptor(options: RequestHeadersInterceptorOptions = {}): RequestInterceptor {
  const { headers: headersOrGetter } = options

  return {
    onFulfilled(config) {
      const headers = (isFunction(headersOrGetter) ? headersOrGetter() : headersOrGetter) ?? {}

      Object.entries(headers).forEach(([key, value]) => {
        config.headers[key] = value
      })

      return config
    },
    onRejected(error) {
      return Promise.reject(error)
    },
    options: options.axiosInterceptorOptions,
  }
}
