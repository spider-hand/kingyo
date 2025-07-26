import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    breadcrumb?: { name: string; path?: string }[]
  }
}
