import { ServerParseError, ServerError } from '@apollo/client';

declare module '@apollo/client' {
  interface ServerError {
    statusCode?: number;
  }

  interface ServerParseError {
    statusCode?: number;
  }
}

export interface NetworkError extends Error {
  statusCode?: number;
  response?: {
    status: number;
  };
}