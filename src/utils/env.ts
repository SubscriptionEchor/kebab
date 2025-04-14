/**
 * Get environment variable with fallback values
 */
export function getEnvVar(key: string): string {
  switch (key) {
    case 'MAPS_URL':
      return 'https://maps.kebapp-chefs.com:444/api';
    case 'TILES_URL':
      return 'https://d3qp57w6m10wuf.cloudfront.net/styles/basic-preview/512/{z}/{x}/{y}.png';
    default:
      console.warn(`Environment variable ${key} not found, using fallback value`);
      return '';
  }
}