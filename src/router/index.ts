import { contentRoutes } from './content-routes'
import { deployRoute } from './deploy-route'
import { publicRoutes } from './public-routes'

/** All application routes */
export const routes = [...publicRoutes, ...contentRoutes, deployRoute]
