import { describe, it, expect } from 'vitest'
import { getSortedPostsData, getAllTags, getPostsByTag, getAllPostSlugs } from '@/lib/posts'

describe('posts', () => {
  it('getSortedPostsDataが記事をID降順で返す', () => {
    const posts = getSortedPostsData()
    expect(posts.length).toBeGreaterThan(0)

    for (let i = 0; i < posts.length - 1; i++) {
      expect(posts[i].id).toBeGreaterThanOrEqual(posts[i + 1].id)
    }
  })

  it('全記事にslug, id, titleが含まれる', () => {
    const posts = getSortedPostsData()
    posts.forEach((post) => {
      expect(post.slug).toBeTruthy()
      expect(post.id).toBeDefined()
      expect(post.title).toBeTruthy()
    })
  })

  it('記事IDに重複がない', () => {
    const posts = getSortedPostsData()
    const ids = posts.map((p) => p.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })

  it('getAllPostSlugsが全記事のslugを返す', () => {
    const slugs = getAllPostSlugs()
    expect(slugs.length).toBeGreaterThan(0)
    slugs.forEach(({ slug }) => {
      expect(slug).toBeTruthy()
      expect(slug).not.toMatch(/^\d+_/)
    })
  })

  it('getAllTagsがタグと件数を返す', () => {
    const tags = getAllTags()
    expect(tags.length).toBeGreaterThan(0)
    tags.forEach(({ tag, count }) => {
      expect(tag).toBeTruthy()
      expect(count).toBeGreaterThan(0)
    })
  })

  it('getPostsByTagが該当する記事を返す', () => {
    const tags = getAllTags()
    if (tags.length > 0) {
      const firstTag = tags[0].tag
      const posts = getPostsByTag(firstTag)
      expect(posts.length).toBe(tags[0].count)
      posts.forEach((post) => {
        expect(post.tags).toContain(firstTag)
      })
    }
  })
})
