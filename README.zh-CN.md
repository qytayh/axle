<a href="https://github.com/varletjs/axle/blob/main/README.md">English</a> |
<span>中文</span>

### 介绍

基于 [axios](https://axios-http.com/) 的渐进式请求工具。 它不会破坏 `axios` 原有的能力，帮助您更轻松地处理请求。

### 快速开始

#### 安装

```shell
# 通过 npm, yarn, pnpm 安装

# npm
npm i @varlet/axle -S

#yarn
yarn add @varlet/axle

#pnpm
pnpm add @varlet/axle
```

#### 发送请求

`Axle` 归一化了请求函数的参数，并针对不同的业务需求，扩展了更多请求函数，下面是一个简单的例子。

```js
import { createAxle } from '@varlet/axle'

const axle = createAxle(/** @see https://axios-http.com **/)

axle.get('/url', { current: 1, pageSize: 10 }, { headers: {} })
axle.post('/url', { name: 'Axle' }, { headers: {} })
```

### 配置

`Axle` 完全支持 `axios` 的所有配置能力。

```js
const axle = createAxle(/** @see https://axios-http.com **/)
// axle 内置的 axios ，用法和 axios 一模一样，并且和 axle 共享配置。
const { axios } = axle

axios.defaults.baseURL = 'https://api.example.com'
axios.defaults.headers.common['TOKEN'] = TOKEN
axios.defaults.timeout = 2500

// 添加请求前拦截器
axios.interceptors.request.use((config) => {
  // 请求前处理
  return config
}, (error) => {
  // 请求错误处理
  return Promise.reject(error)
})

// 添加请求后返回拦截器
axios.interceptors.response.use((response) => {
  // 任何位于 2xx 范围内的状态码都会导致该函数触发
  // 对响应数据做一些事情
  return response
}, (error) => {
  // 任何超出 2xx 范围的状态代码都会导致此函数触发
  // 对响应错误做一些事情
  return Promise.reject(error)
})
```

#### 拦截器

Axle 为业务内置了一些拦截器

```js
import { AxleTIMEOUTInterceptor } from '@varlet/axle'

//添加
axios.interceptors.response.use(...AxleTIMEOUTInterceptor())

axios.interceptors.response.use((response) => {
  return response
}, (error) => {
  if(error.code === 'TIMEOUT') {
    console.error('这个请求超时啦')
  }
  return Promise.reject(error)
})

```

## Axle & Axios 请求函数

`Axle` 提供的请求函数可以帮助您更轻松地发送请求。 以下是一些示例，包括与 `axios` 的比较。
提示：下面只是以 `get` 和 `post` 为例，除此之外 Axle 还支持 `options`、`head`、`delete`、`patch` 、`put` 方法。

### get

#### JSON

```js
// axios
axios.get('/url', { params: { id: 1 } })
// axle
axle.get('/url', { id: 1 })
```

#### Blob

```js
// axios
axios.get('/url', { params: { id: 1 }, responseType: 'blob' })
// axle
axle.getBlob('/url', { id: 1 })
```

#### Text

```js
// axios
axios.get('/url', { params: { id: 1 }, responseType: 'text' })
// axle
axle.getText('/url', { id: 1 })
```

#### Document

```js
// axios
axios.get('/url', { params: { id: 1 }, responseType: 'document' })
// axle
axle.getDocument('/url', { id: 1 })
```

#### ArrayBuffer

```js
// axios
axios.get('/url', { params: { id: 1 }, responseType: 'arraybuffer' })
// axle
axle.getArrayBuffer('/url', { id: 1 })
```

#### Stream

```js
// axios
axios.get('/url', { params: { id: 1 }, responseType: 'stream' })
// axle
axle.getStream('/url', { id: 1 })
```

### post

#### JSON

和 axios 一致。

```js
// axios
axios.post('/url', { name: 'foo' })
// axle
axle.post('/url', { name: 'foo' })
```

#### application/x-www-form-urlencoded

```js
// axios
axios.post('/url', qs.stringify({ name: 'foo' }), { 
  headers: { 
    'Content-Type': 'application/x-www-form-urlencoded'
  }
})
// axle
axle.postUrlEncode('/url', { name: 'foo' })
```

#### multipart/form-data

```js
// axios
const formData = new FormData()
formData.append('name', 'foo')
formData.append('file', new File())

axios.post('/url', formData, { 
  headers: { 
    'Content-Type': 'multipart/form-data'
  }
})
// axle
axle.postMultipart('/url', { name: 'foo', file: new File() })
```

## 实用工具

#### 通知浏览器下载文件

```js
import { download } from '@varlet/axle'

download(await axle.getBlob('/url', { id: 1 }), 'filename')
```

#### 公共 header 操作

```js
const headers = axle.getHeaders()
axle.setHeader('TOKEN', TOKEN)
axle.removeHeader('TOKEN')
```

## Vue 组合式 API

Axle 提供了 Vue Composition API 风格的用法，封装了请求的 `加载状态`, `错误状态`, `请求的上下行进度`，`返回数据`，`错误重试`，`生命周期` 等等，并继承了 `axios` 的所有配置。

```html
<script setup>
import { createAxle } from '@varlet/axle'
import { createUseAxle } from '@varlet/axle/use'

const axle = createAxle(/** @see https://axios-http.com **/)
const useAxle = createUseAxle({
  axle,
  // 可选项: useAxle 的默认 onTransform
  onTransform: response => response
})

const [users, getUsers, { loading, error, uploadProgress, downloadProgress, abort }] = useAxle({
  // 请求初始化数据
  value: [],
  // 请求方法
  method: 'get',
  // 请求地址
  url: '/user',
  // 是否立即发送请求, 默认值: false
  immediate: true,
  // 错误重试次数, 默认值: 0
  retry: 3,
  // 请求前是否需要重置 value, 默认值: false
  resetValue: true,
  // 请求参数, 默认值: {}
  // 当参数是一个对象时，发送第一个请求（immediate）时将携带它
  // 当参数是一个函数时，每次发送请求时都会携带它。
  params: { current: 1, pageSize: 10 },
  // Axios 配置, see https://axios-http.com
  config: { headers: {} },
  // 生命周期
  onBefore(refs) {
    const { data, loading, error, uploadProgress, downloadProgress } = refs
    console.log(
      data.value, 
      loading.value,
      error.value, 
      uploadProgress.value, 
      downloadProgress.value
    )
    // 处理请求前逻辑
  },
  onTransform(response, refs) {
    // 处理数据转换，转换后的数据将成为 users 的值。
    return response.data
  },
  onSuccess(response, refs) {
    // 处理请求成功逻辑
  },
  onError(error, refs) {
    // 处理请求错误逻辑
  },
  onAfter(refs) {
    // 处理请求结束逻辑，无论成功失败都会触发。
  }
})
</script>

<template>
  <span>{{ users }}</span>
  <span>{{ loading }}</span>
  <span>{{ error }}</span>
  <span>{{ uploadProgress }}</span>
  <span>{{ downloadProgress }}</span>
  <button @click="getUsers">发送请求</button>
  <button @click="abort">中断请求</button>
</template>
```

### 并行请求实用工具

Axle 提供了一些并行请求处理工具，请参考以下示例。

```html
<script setup>
import { createAxle } from '@varlet/axle'
import { createUseAxle, useValues, useAverageProgress, useHasLoading } from '@varlet/axle/use'

const axle = createAxle(/** @see https://axios-http.com **/)
const useAxle = createUseAxle({ axle })

const [users, getUsers, { loading: isUsersLoading, downloadProgress: usersDownloadProgress }] = useAxle({
  value: [],
  method: 'get',
  url: '/user',
})

const [roles, getRoles, { loading: isRolesLoading, downloadProgress: rolesDownloadProgress }] = useAxle({
  value: [],
  method: 'get',
  url: '/role',
})

// 所有请求结束时，loading 为 false
const loading = useHasLoading(isUsersLoading, isRolesLoading)
// 所有请求结束时，downloadProgress 为 1
const downloadProgress = useAverageProgress(usersDownloadProgress, rolesDownloadProgress)
// Ref<[
//   [{ name: 'foo' }, { name: 'bar' }], 
//   [{ role: 'admin' }, { role: 'user' }]
// ]> <-
// [
//   Ref<[{ name: 'foo' }, { name: 'bar' }]>, 
//   Ref<[{ role: 'admin' }, { role: 'user' }]>
// ]
const usersRoles = useValues(users, roles)

function sendAllRequest() {
  // parallel
  getUsers()
  getRoles()
}
</script>

<template>
  <span>{{ usersRoles }}</span>
  <span>{{ loading }}</span>
  <span>{{ downloadProgress }}</span>
  <button @click="sendAllRequest">发送全部请求</button>
</template>
```




