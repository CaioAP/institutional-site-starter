/**
 * Checks seed/content.ndjson against the studio schema: every field must be
 * declared, every object/array member must have a known `_type`, array items
 * need a `_key`. Catches drift between scripts/sanity-seed.ts and the schemas
 * before a real import would. Run: pnpm --filter @starter/sanity-studio check:seed
 */
import { readFileSync } from 'node:fs'
import { createSchema } from 'sanity'
import { schemaTypes } from '../schemas'

interface SType {
  name: string
  jsonType: string
  fields?: Array<{ name: string, type: SType }>
  of?: SType[]
  type?: SType
}

const schema = createSchema({ name: 'default', types: schemaTypes })
// Added by @sanity/document-internationalization, not part of our schema.
const PLUGIN_TYPES = new Set(['translation.metadata'])

const errors: string[] = []
const isType = (t: SType | undefined, name: string): boolean => !!t && (t.name === name || isType(t.type, name))

function check(value: unknown, type: SType, path: string) {
  if (value === null || value === undefined) return
  if (type.jsonType === 'object') {
    if (typeof value !== 'object' || Array.isArray(value)) return void errors.push(`${path}: expected an object`)
    for (const [key, v] of Object.entries(value)) {
      if (key.startsWith('_')) continue
      const field = type.fields?.find(f => f.name === key)
      if (!field) errors.push(`${path}.${key}: not in schema type "${type.name}"`)
      else if (!isType(type, 'block') && !isType(type, 'reference') && !isType(type, 'slug')) check(v, field.type, `${path}.${key}`)
    }
  }
  else if (type.jsonType === 'array') {
    if (!Array.isArray(value)) return void errors.push(`${path}: expected an array`)
    value.forEach((item, i) => {
      const p = `${path}[${i}]`
      if (typeof item !== 'object' || item === null) {
        if (!type.of?.some(m => m.jsonType === typeof item)) errors.push(`${p}: ${typeof item} not allowed`)
        return
      }
      const t = (item as { _type?: string })._type
      if (!(item as { _key?: string })._key) errors.push(`${p}: missing _key`)
      const member = type.of?.find(m => m.name === t || (t === 'reference' && isType(m, 'reference')) || (t === 'block' && isType(m, 'block')))
      if (!member) errors.push(`${p}: _type "${t}" not allowed (${type.of?.map(m => m.name).join(', ')})`)
      else check(item, member, p)
    })
  }
}

const lines = readFileSync(new URL('../seed/content.ndjson', import.meta.url), 'utf8').split('\n').filter(Boolean)
for (const line of lines) {
  const doc = JSON.parse(line) as { _id: string, _type: string }
  if (PLUGIN_TYPES.has(doc._type)) continue
  const type = schema.get(doc._type) as SType | undefined
  if (!type) errors.push(`${doc._id}: unknown document type "${doc._type}"`)
  else check(doc, type, doc._id)
}

if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}
console.log(`Seed matches the schema (${lines.length} documents).`)
