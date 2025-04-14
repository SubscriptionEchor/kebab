export default function SectionListSkeleton() {
  return (
    <div className="table-container">
      <div className="table-wrapper">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="table-header" style={{ width: '30%' }}>
                Section Name
              </th>
              <th className="table-header" style={{ width: '35%' }}>
                Restaurants
              </th>
              <th className="table-header" style={{ width: '15%' }}>
                Status
              </th>
              <th className="table-header text-right" style={{ width: '20%' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {[...Array(5)].map((_, index) => (
              <tr key={index} className="animate-pulse">
                <td className="table-cell">
                  <div className="h-4 w-32 bg-gray-200 rounded" />
                </td>
                <td className="table-cell">
                  <div className="h-4 w-48 bg-gray-200 rounded" />
                </td>
                <td className="table-cell">
                  <div className="h-6 w-20 bg-gray-200 rounded-full" />
                </td>
                <td className="table-cell text-right">
                  <div className="flex items-center justify-end space-x-3">
                    <div className="h-8 w-20 bg-gray-200 rounded" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}