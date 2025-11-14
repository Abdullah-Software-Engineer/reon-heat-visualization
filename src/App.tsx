import { useRoutes } from 'react-router-dom'
import { Suspense } from 'react'
import { routes } from './route'
import Loader from './component/Loader'
import './App.css'

function App() {
  const element = useRoutes(routes)
  return (
    <Suspense fallback={<Loader fullScreen message="Loading application..." />}>
      {element}
    </Suspense>
  )
}

export default App
