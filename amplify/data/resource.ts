import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import { categorizeRequest } from '../functions/categorize-request/resource';

/**
 * RapidAid data model.
 *
 * `Request` is the aid-request board (was the Supabase `requests` table). Every
 * signed-in user can create, read, and update ALL requests — responders need to
 * act on requests they didn't create, so this is intentionally NOT owner-scoped.
 * Deletes are omitted (mirrors the old RLS, which blocked deletes).
 *
 * `categorizeRequest` is a Lambda-backed mutation that runs Gemini server-side
 * (see ../functions/categorize-request).
 */
const schema = a.schema({
  Request: a
    .model({
      name: a.string(),
      location: a.string().required(),
      requestText: a.string().required(),
      categories: a.string().array(),
      status: a.enum(['unclaimed', 'claimed', 'completed']),
      // Future-ready, currently unused by the UI:
      priority: a.string(),
      latitude: a.float(),
      longitude: a.float(),
      contactInfo: a.string(),
    })
    .authorization((allow) => [allow.authenticated().to(['create', 'read', 'update'])]),

  categorizeRequest: a
    .mutation()
    .arguments({
      name: a.string(),
      location: a.string().required(),
      requestText: a.string().required(),
    })
    .returns(a.string().array())
    .handler(a.handler.function(categorizeRequest))
    .authorization((allow) => [allow.authenticated()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
