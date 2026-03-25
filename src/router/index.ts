import { contentRoutes } from './content-routes'
import { publicRoutes } from './public-routes'

/** All application routes */
export const routes = [...publicRoutes, ...contentRoutes]
