import { defineFunction, secret } from '@aws-amplify/backend';

/**
 * Lambda that categorizes an aid request with Google Gemini.
 *
 * The Gemini API key lives ONLY here, as an Amplify secret — it is never shipped
 * to the browser (this is the whole reason categorization moved server-side).
 * Set it with:
 *   npx ampx sandbox secret set GEMINI_API_KEY            (local dev)
 *   npx ampx secret set GEMINI_API_KEY --branch <branch>  (deployed branch)
 */
export const categorizeRequest = defineFunction({
  name: 'categorize-request',
  environment: {
    GEMINI_API_KEY: secret('GEMINI_API_KEY'),
  },
  // LLM calls take a few seconds; the default 3s timeout is too short.
  timeoutSeconds: 30,
});
