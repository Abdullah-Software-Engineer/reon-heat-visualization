import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <h1 className="text-9xl font-bold text-gray-800 dark:text-gray-200 mb-4">404</h1>
      <h2 className="text-3xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
        Page Not Found
      </h2>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="px-6 py-3 bg-blue-600 text-gray-800 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
      >
        Go Back Home
      </Link>
    </div>
  )
}

export default NotFound

