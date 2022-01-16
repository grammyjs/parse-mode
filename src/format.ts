import * as GrammyTypes from './deps.deno.ts'

const neverReached = (_never: never): never => {
  throw new Error()
}

type FormatChild = string | Format

interface BaseAbstractFormat {
  type: string
}

interface AbstractFormat extends BaseAbstractFormat {
  child: string | Format
}

type CommonFormat = AbstractFormat & {
  type:
    | "bold"
    | "italic"
    | "underline"
    | "strikethrough"
    | "spoiler"
    | "code"
}
type LinkFormat = AbstractFormat & {
  type: 'text_link'
  url: string
}
type PreFormat = AbstractFormat & {
  type: 'pre'
  language?: string
}

type Format =
  | CommonFormat
  | LinkFormat
  | PreFormat

const commonFormat = (type: CommonFormat['type']) => (child: FormatChild) => ({
  type,
  child,
})

export const bold = commonFormat('bold')
export const italic = commonFormat('italic')
export const underline = commonFormat('underline')
export const strikethrough = commonFormat('strikethrough')
export const spoiler = commonFormat('spoiler')
export const code = commonFormat('code')
export function link(child: FormatChild, url: string): LinkFormat {
  return {
    type: 'text_link',
    child,
    url,
  }
}
export function pre(child: FormatChild, language?: string) {
  return {
    type: 'pre',
    child,
    language,
  }
}
// example util function
export function mentionUser(child: FormatChild, userId: number) {
  return link(child, `tg://user?id=${userId}`)
}

type Entity = GrammyTypes.MessageEntity

const formatEntity = (format: Format, offset: number): {text: string, entities: Entity[]} => {
  let entities: Entity[] = []

  let text: string
  if (typeof format.child === 'string') {
    text = format.child
  } else {
    const res = formatEntity(format.child, offset)
    text = res.text
    entities = res.entities
  }

  const getEntity = (): Entity => {
    const base = {
      offset,
      length: text.length,
    }
    switch (format.type) {
      case 'bold':
      case 'italic':
      case 'underline':
      case 'strikethrough':
      case 'spoiler':
      case 'code':
        return {
          ...base,
          type: format.type,
        }
      case 'text_link':
        return {
          ...base,
          type: 'text_link',
          url: format.url,
        }
      case 'pre':
        return {
          ...base,
          type: 'pre',
          language: format.language,
        }
      default:
        throw neverReached(format)
    }
  }
  return {
    text,
    entities: [...entities, getEntity()],
  }
}

export function fmt(strings: TemplateStringsArray, ...formats: Format[]): {text: string, entities: Entity[]} {
  let text = ''
  let entities: Entity[] = []

  for (let i = 0; i < strings.length; ++i) {
    text += strings[i]
    if (i < formats.length) {
      const {text: returnedText, entities: returnedEntities} = formatEntity(formats[i], text.length)
      text += returnedText
      entities = entities.concat(returnedEntities)
    }
  }
  return {
    text,
    entities,
  }
}
