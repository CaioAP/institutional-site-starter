import { category } from './documents/category'
import { page } from './documents/page'
import { post } from './documents/post'
import { practiceArea } from './documents/practiceArea'
import { siteSettings } from './documents/siteSettings'
import { teamMember } from './documents/teamMember'
import { altImage } from './objects/image'
import { siteLink } from './objects/link'
import { richText, videoEmbed } from './objects/richText'
import { sectionTypes } from './objects/sections'
import { seo } from './objects/seo'

export const schemaTypes = [
  siteSettings, page, practiceArea, teamMember, category, post,
  altImage, siteLink, seo, richText, videoEmbed, ...sectionTypes,
]
