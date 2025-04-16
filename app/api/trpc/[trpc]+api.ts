import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

import { appRouter } from '~/server/api/root';
import { createTRPCContext } from '~/server/api/trpc';

const defaultHeaders = (req: Request) => {
  const origin = req.headers.get('origin');
  return {
    'Access-Control-Allow-Origin': origin ?? '*',
    'Access-Control-Allow-Headers':
      'x-trpc-source, x-device-id, x-cardplus-api-key, content-type, authorization',
    'Access-Control-Allow-Credentials': 'true',
  };
};

const handler = (req: Request) => {
  const origin =
    req.headers.get('origin') !== '' ? req.headers.get('origin')! : 'https://www.merchant.store';
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () =>
      createTRPCContext({
        headers: req.headers,
      }),
    allowMethodOverride: true,
    onError({ error, path, input, type }) {
      console.error(`>>> tRPC Error on '${path}'`, error);
      console.error(`>>> Input: ${JSON.stringify(input)}`);
      console.error(`>>> Request: ${JSON.stringify(req)}`);
      console.error(`>>> Type: ${type}`);
    },
    responseMeta() {
      if (process.env.NODE_ENV === 'production') {
        return {
          headers: new Headers([
            ['Access-Control-Allow-Origin', origin],
            [
              'Access-Control-Allow-Headers',
              'x-trpc-source, x-device-id, x-cardplus-api-key, content-type, authorization',
            ],
          ]),
        };
      }
      return {
        headers: new Headers([
          [
            'Access-Control-Allow-Headers',
            'x-trpc-source, x-device-id, x-cardplus-api-key, content-type, authorization',
          ],
        ]),
      };
    },
  });
};

export async function OPTIONS(req: Request) {
  return new Response(req.body, {
    status: 200,
    headers: defaultHeaders(req),
  });
}

export { handler as GET, handler as POST };
