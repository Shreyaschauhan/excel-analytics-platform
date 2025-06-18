const LoadingSpinner = ({ size = "large", text = "Loading..." }) => {
  const sizeClasses = {
    small: "h-4 w-4",
    medium: "h-8 w-8",
    large: "h-12 w-12",
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div
        className={`animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 ${sizeClasses[size]}`}
      ></div>
      <p className="mt-4 text-gray-600">{text}</p>
    </div>
  )
}

export default LoadingSpinner
