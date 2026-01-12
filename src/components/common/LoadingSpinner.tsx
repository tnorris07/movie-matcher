export const LoadingSpinner = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className="flex justify-center items-center">
      <div
        className={`${sizeClasses[size]} border-4 border-gray-600 border-t-primary rounded-full animate-spin`}
      />
    </div>
  );
};

export const LoadingScreen = () => {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-secondary">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-gray-400">Loading...</p>
    </div>
  );
};
