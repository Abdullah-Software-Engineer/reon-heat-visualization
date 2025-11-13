import { type RouteObject } from 'react-router-dom'
import { lazy } from 'react'

const Home = lazy(() => import('../page/Home'))
const NotFound = lazy(() => import('../page/NotFound'))

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
  // Add more routes here
]

