import * as GrammyTypes from './deps.deno.ts'

type CommonFormatType =
  | "bold"
  | "italic"
  | "underline"
  | "strikethrough"
  | "spoiler"
  | "code"

type ArgType = string | FormattedString | any

const unwrap = (child: ArgType): FormattedString => {
  if (child instanceof FormattedString) {
    return child
  }
  return new FormattedString(child.toString(), [])
}


const commonFormat = (type: CommonFormatType) => (child: ArgType): FormattedString => {
  const c = unwrap(child)
  console.log(c)
  return new FormattedString(c.text, [{type, offset: 0, length: c.text.length}, ...c.entities])
}

export const bold = commonFormat('bold')
export const italic = commonFormat('italic')
export const underline = commonFormat('underline')
export const strikethrough = commonFormat('strikethrough')
export const spoiler = commonFormat('spoiler')
export const code = commonFormat('code')
export function link(child: ArgType, url: string): FormattedString {
  const c = unwrap(child)
  return new FormattedString(c.text, [{type: 'text_link', offset: 0, length: c.text.length, url}, ...c.entities])
}
export function pre(child: ArgType, language?: string): FormattedString {
  const c = unwrap(child)
  return new FormattedString(c.text, [{type: 'pre', offset: 0, length: c.text.length, language}, ...c.entities])
}
// example util function
export function mentionUser(child: ArgType, userId: number) {
  return link(child, `tg://user?id=${userId}`)
}

type Entity = GrammyTypes.MessageEntity
class FormattedString {
  text: string
  entities: Entity[]

  constructor(text: string, entities: Entity[]) {
    this.text = text
    this.entities = entities
  }
}

export function fmt(strings: TemplateStringsArray, ...formats: ArgType[]): FormattedString {
  let text = ''
  let entities: Entity[] = []

  for (let i = 0; i < strings.length; ++i) {
    text += strings[i]
    if (i < formats.length) {
      const format = formats[i]
      console.log(format)
      if (format instanceof FormattedString) {
        entities = entities.concat(format.entities.map((v) => ({...v, offset: v.offset + text.length})))
        text += format.text
      } else {
        text += format.toString()
      }
    }
  }
  return new FormattedString(text, entities)
}
