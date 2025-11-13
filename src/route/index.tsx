import { type RouteObject } from 'react-router-dom'
import { lazy } from 'react'

const Home = lazy(() => import('../page/Home'))

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Home />,
  },
  // Add more routes here
]

