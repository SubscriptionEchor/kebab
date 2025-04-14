export default function BannerFormSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Form Section */}
      <div className="space-y-6">
        {/* Template Selection */}
        <div>
          <div className="shimmer h-5 w-32 rounded mb-2 bg-gray-100" />
          <div className="shimmer h-10 w-full rounded-md bg-gray-100" />
        </div>

        {/* Title Section */}
        <div>
          <div className="shimmer h-5 w-24 rounded mb-2 bg-gray-100" />
          <div className="shimmer h-10 w-full rounded-md mb-3 bg-gray-100" />
          <div className="shimmer h-8 w-32 rounded-md bg-gray-100" />
        </div>

        {/* Highlight Section */}
        <div>
          <div className="shimmer h-5 w-28 rounded mb-2 bg-gray-100" />
          <div className="shimmer h-10 w-full rounded-md mb-3 bg-gray-100" />
          <div className="shimmer h-8 w-32 rounded-md bg-gray-100" />
        </div>

        {/* Content Section */}
        <div>
          <div className="shimmer h-5 w-24 rounded mb-2 bg-gray-100" />
          <div className="shimmer h-32 w-full rounded-md mb-3 bg-gray-100" />
          <div className="shimmer h-8 w-32 rounded-md bg-gray-100" />
        </div>

        {/* Image Upload */}
        <div>
          <div className="shimmer h-5 w-32 rounded mb-2 bg-gray-100" />
          <div className="shimmer h-48 w-full rounded-lg bg-gray-100" />
        </div>

        {/* Background Section */}
        <div>
          <div className="shimmer h-5 w-36 rounded mb-2 bg-gray-100" />
          <div className="space-y-4">
            <div className="shimmer h-10 w-full rounded-md bg-gray-100" />
            <div className="grid grid-cols-2 gap-4">
              <div className="shimmer h-10 rounded-md bg-gray-100" />
              <div className="shimmer h-10 rounded-md bg-gray-100" />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="shimmer h-10 w-full rounded-md bg-gray-100" />
      </div>

      {/* Preview Section */}
      <div>
        <div className="shimmer h-7 w-36 rounded mb-4 bg-gray-100" />
        <div className="shimmer w-full aspect-[16/9] rounded-lg bg-gray-100" />
      </div>
    </div>
  );
}