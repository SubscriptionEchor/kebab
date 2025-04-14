import { range } from '../../utils/array';

export default function BannerListSkeleton() {
  return (
    <div className="overflow-x-auto max-w-[calc(100vw-2rem)] animate-fade-in">
      <table className="w-full border-separate border-spacing-0">
        <thead>
          <tr className="text-xs text-gray-500 uppercase tracking-wider text-left">
            <th className="sticky top-0 z-10 bg-white px-4 py-3 font-medium border-b border-gray-200 w-[25%]">Template</th>
            <th className="sticky top-0 z-10 bg-white px-4 py-3 font-medium border-b border-gray-200 w-[20%]">Preview</th>
            <th className="sticky top-0 z-10 bg-white px-4 py-3 font-medium border-b border-gray-200 w-[40%]">Content</th>
            <th className="sticky top-0 z-10 bg-white px-4 py-3 font-medium border-b border-gray-200 w-[15%] text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {range(0, 5).map((index) => (
            <tr 
              key={index} 
              className="group border-b border-gray-100 last:border-0"
              style={{
                animationDelay: `${index * 100}ms`
              }}
            >
              <td className="px-4 py-3">
                <div className="space-y-2">
                  <div className="h-6 w-32 rounded-md bg-gray-200 relative overflow-hidden">
                    <div className="absolute inset-0 shimmer-wave" />
                  </div>
                  <div className="h-4 w-24 rounded-md bg-gray-200 relative overflow-hidden">
                    <div className="absolute inset-0 shimmer-wave" />
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-center">
                  <div className="w-32 h-20 rounded-lg bg-gray-200 relative overflow-hidden">
                    <div className="absolute inset-0 shimmer-wave" />
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <div className="h-4 w-16 rounded-md bg-gray-200 relative overflow-hidden">
                      <div className="absolute inset-0 shimmer-wave" />
                    </div>
                    <div className="h-4 w-32 rounded-md bg-gray-200 relative overflow-hidden">
                      <div className="absolute inset-0 shimmer-wave" />
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="h-4 w-16 rounded-md bg-gray-200 relative overflow-hidden">
                      <div className="absolute inset-0 shimmer-wave" />
                    </div>
                    <div className="h-4 w-40 rounded-md bg-gray-200 relative overflow-hidden">
                      <div className="absolute inset-0 shimmer-wave" />
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="h-4 w-16 rounded-md bg-gray-200 relative overflow-hidden">
                      <div className="absolute inset-0 shimmer-wave" />
                    </div>
                    <div className="h-4 w-36 rounded-md bg-gray-200 relative overflow-hidden">
                      <div className="absolute inset-0 shimmer-wave" />
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-center">
                <div className="flex items-center justify-center">
                  <div className="h-8 w-20 rounded-md bg-gray-200 relative overflow-hidden">
                    <div className="absolute inset-0 shimmer-wave" />
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}