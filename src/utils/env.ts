/**
 * Get environment variable with fallback values
 */
export function getEnvVar(key: string, country?: string): string {
  switch (key) {
    case 'MAPS_URL':
      // Return different URLs based on country
      if (country === 'AUSTRIA') {
        return 'https://maps.kebapp-chefs.com:8008/api';
      } else if (country === 'GERMANY') {
        return 'https://maps.kebapp-chefs.com:8009/api';
      }
      // Default to Germany URL if no country specified
      return 'https://maps.kebapp-chefs.com:8009/api';
    case 'TILES_URL':
      return 'https://d3qp57w6m10wuf.cloudfront.net/styles/basic-preview/512/{z}/{x}/{y}.png';
    default:
      console.warn(`Environment variable ${key} not found, using fallback value`);
      return '';
  }
}