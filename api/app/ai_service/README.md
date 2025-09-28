// Structured output schema for Responses API (kept for documentation/prompting blocks where needed)
const RESPONSE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    answer: { type: 'string' },
    selected_provider_ids: { type: 'array', items: { type: 'string' }, default: [] }
  },
  required: ['answer', 'selected_provider_ids']
} as const