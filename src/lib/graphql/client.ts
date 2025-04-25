import { ApolloClient, ApolloLink, InMemoryCache, Observable, concat, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { RetryLink } from '@apollo/client/link/retry';
import { toast } from 'sonner';
import { config } from '../../constants';
// import { config } from "../../constants"
// export const cache = new InMemoryCache({
//   typePolicies: {
//     Query: {
//       fields: {
//         getAllRestaurantOnboardingApplication: {
//           merge(_existing, incoming) {
//             return incoming;
//           },
//           read(existing) {
//             return existing;
//           }
//         },
//         platformStatistics: {
//           merge: true
//         },
//       },
//     },
//   },
// });

// export const retryLink = new RetryLink({
//   delay: {
//     initial: 300,
//     max: 10000,
//     jitter: true
//   },
//   attempts: {
//     max: 5,
//     retryIf: (error) => {
//       // Don't retry if:
//       // 1. No error
//       // 2. Unauthorized error
//       // 3. Bad request (400) error
//       if (!error) return false;
//       if (error.message?.includes('Unauthorized')) return false;

//       const statusCode = error.statusCode || error.networkError?.statusCode;
//       if (statusCode === 400) return false;

//       return true;
//     }
//   }
// });

// export const httpLink = createHttpLink({
//   uri: 'https://del-qa-api.kebapp-chefs.com/graphql',
//   credentials: 'omit',
//   fetchOptions: {
//     mode: 'cors'
//   },
//   headers: {
//     'Access-Control-Allow-Origin': '*'
//   }
// });

const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(error => {
      console.error(
        `[GraphQL error]: Operation: ${operation.operationName}, Error: ${error.message}`,
        error
      );
    });

    const primaryError = graphQLErrors[0];
    const errorCode = primaryError.extensions?.code;
    const showToaster = primaryError.extensions?.showToaster ?? true;

    let userMessage = '';

    switch (errorCode) {
      case 'UNAUTHENTICATED':
      case 'UNAUTHORIZED':
        userMessage = 'Your session has expired. Please sign in again.';
        break;
      case 'BAD_USER_INPUT':
        userMessage = 'Please check your input and try again.';
        break;
      case 'FORBIDDEN':
        userMessage = 'You do not have permission to perform this action.';
        break;
      case 'KA113':
        // Don't show toast for vendor not found error - let the mutation handle it
        return forward(operation);
        break;
      case 'KA101':
        userMessage = 'Invalid status transition. Please try again.';
        break;
      default:
        // Extract user-friendly message from error
        userMessage = primaryError.message.split(':').pop()?.trim() ||
          'Something went wrong. Please try again.';
    }

    // Skip toast if showToaster is false or if there's already a toast with this ID
    const toastId = `${operation.operationName}-error`;
    if (!showToaster || document.querySelector(`[data-toast-id="${toastId}"]`)) {
      return forward(operation);
    }
    toast.dismiss()
    toast.error(userMessage, {
      duration: 3000,
      id: toastId,
      closeButton: true
    });

    return forward(operation);
  }

  if (networkError) {
    console.error('[Network error]:', networkError);

    const statusCode = (networkError as any)?.statusCode ||
      (networkError as any)?.response?.status;

    let message = 'A network error occurred. Please try again.';
    if (statusCode === 400) {
      message = 'Invalid request. Please check your input.';
    } else if (networkError.message === 'Failed to fetch') {
      message = 'Unable to reach the server. Please check your connection.';
    }
    toast.dismiss()
    toast.error(message, {
      duration: 3000,
      id: `network-error-${operation.operationName}`, // Prevent duplicate toasts
      closeButton: true
    });
    return forward(operation);
  }
});

// export const authLink = setContext((operation, { headers }) => {
//   try {
//     const authData = localStorage.getItem('kebab_admin_auth');
//     const token = authData ? JSON.parse(authData).token : null;

//     if (!token) {
//       console.warn(`No auth token found for operation: ${operation.operationName}`);
//     }

//     return {
//       headers: {
//         ...headers,
//         authorization: token ? `Bearer ${token}` : '',
//       }
//     };
//   } catch (error) {
//     console.error('Error setting auth context:', error);
//     return { headers };
//   }
// });

// const request = async operation => {
//   let token = localStorage.getItem('kebab_admin_auth')
//   if (!token) {
//     return
//   }
//   const existingHeaders = operation.getContext().headers || {}
//   operation.setContext({
//     headers: {
//       ...existingHeaders,
//       authorization: token ? `Bearer ${token}` : '',
//     }
//   })
// }

// const requestLink = new ApolloLink(
//   (operation, forward) => {
//     return new Observable(observer => {
//       let handle;
//       Promise.resolve(operation)
//         .then(oper => {
//           return request(oper); // Ensure request is awaited if needed
//         })
//         .then(() => {
//           console.log("Request headers after token added:", operation.getContext().headers);
//           handle = forward(operation).subscribe({
//             next: observer.next.bind(observer),
//             error: observer.error.bind(observer),
//             complete: observer.complete.bind(observer),
//           });
//         })
//         .catch(observer.error.bind(observer));

//       return () => {
//         if (handle) handle.unsubs  cribe();
//       };
//     });
//   }
// );

// export const client = new ApolloClient({
//   link: from([errorLink, retryLink, authLink, httpLink]),
//   cache,
//   defaultOptions: {
//     watchQuery: {
//       fetchPolicy: 'cache-and-network',
//       nextFetchPolicy: 'cache-first',
//       errorPolicy: 'all',
//       notifyOnNetworkStatusChange: true,
//     },
//     query: {
//       fetchPolicy: 'cache-first',
//       errorPolicy: 'all',
//       notifyOnNetworkStatusChange: true,
//     },
//     mutate: {
//       errorPolicy: 'all',
//       fetchPolicy: 'no-cache',
//     },
//   },
//   connectToDevTools: true,
//   name: 'kebab-admin',
//   version: '1.0.0'
// });

const cache = new InMemoryCache()
const httpLink = createHttpLink({
  uri: config.SERVER_URL + "graphql"
})
// Commented out WebSocket link
// const wsLink = new WebSocketLink({
//   uri: `${WS_SERVER_URL}/graphql`,
//   options: {
//     reconnect: true
//   }
// })

const request = async operation => {
  const authData = localStorage.getItem('kebab_admin_auth');
  const selectedLanguage = localStorage.getItem('selectedLanguage') || 'en';
  const token = authData ? JSON.parse(authData).token : null;
  if (!token) {
    console.warn(`No auth token found for operation: ${operation.operationName}`);
  }
  const existingHeaders = operation.getContext().headers || {}
  operation.setContext({
    headers: {
      ...existingHeaders,
      authorization: token ? `Bearer ${token}` : '',
      'lang': selectedLanguage,
    }
  })
}

const requestLink = new ApolloLink(
  (operation, forward) => {
    return new Observable(observer => {
      let handle;
      Promise.resolve(operation)
        .then(oper => {
          return request(oper); // Ensure request is awaited if needed
        })
        .then(() => {
          handle = forward(operation).subscribe({
            next: observer.next.bind(observer),
            error: observer.error.bind(observer),
            complete: observer.complete.bind(observer),
          });
        })
        .catch(observer.error.bind(observer));

      return () => {
        if (handle) handle.unsubscribe();
      };
    });
  }
);
// Commented out terminating link
// const terminatingLink = split(({ query }) => {
//   const { kind, operation } = getMainDefinition(query)
//   return kind === 'OperationDefinition' && operation === 'subscription'
// }, wsLink)

export const client = new ApolloClient({
  link: ApolloLink.from([errorLink, requestLink, httpLink]), // Removed terminatingLink
  cache,
  resolvers: {},
  connectToDevTools: true
})