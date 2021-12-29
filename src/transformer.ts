import type { Transformer } from './deps.deno.ts';

const wellKnownParseModesMap = new Map([
  ['html', 'HTML'],
  ['markdown', 'Markdown'],
  ['markdownv2', 'MarkdownV2'],
]);

const buildTransformer = (parseMode: string) => {
  const normalisedParseMode = wellKnownParseModesMap.get(parseMode.toLowerCase()) ?? parseMode;
  if (!wellKnownParseModesMap.has(parseMode.toLowerCase())) {
    console.warn(`Could not find parse_mode: ${parseMode}. If this is a valid parse_mode, you should ignore this message.`);
  }

  const transformer: Transformer = (prev, method, payload, signal) => {
    if (!payload || 'parse_mode' in payload) {
      return prev(method, payload, signal);
    }

    return prev(method, { ...payload, ...{ parse_mode: normalisedParseMode } }, signal);
  };
  return transformer;
};

export { buildTransformer as parseMode };
