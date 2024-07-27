const { describe, test, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blogs = require('../models/blogs')
const helper = require('./test_helper')

beforeEach(async () => {
  await Blogs.deleteMany({})
  console.log('cleared')

  const blogsObjects = helper.initialBlogs.map(blog => new Blogs(blog))
  const promiseArray = blogsObjects.map(blogs => blogs.save())
  await Promise.all(promiseArray)

  console.log('done')
})

const api = supertest(app)

describe ('Blogs test for fullstackopen', () => {
  test('there are two blogs', async () => {
    const response = await api
      .get('/api/blogs')

    assert.strictEqual(response.body.length, helper.initialBlogs.length)
  })

  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('the first blog is about HTTP methods', async () => {
    const response = await api.get('/api/blogs')

    const titles = response.body.map(e => e.title)
    // es el argumento truthy
    assert(titles.includes('HTML is easy'))
  })

  test('a valid blog can be added ', async () => {
    const newBlog = {
      title: 'async/await simplifies making async calls',
      author: 'FDV',
      url: 'https://www.tumblr.com/blog/iyustlop',
      likes: 0,
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()

    const titles = blogsAtEnd.map(n => n.title)
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)
    assert(titles.includes('async/await simplifies making async calls'))
  })

  test('blog without likes is not added', async () => {
    const newBlog = {
      title: 'async/await simplifies making async calls',
      author: 'FDV',
      url: 'https://www.tumblr.com/blog/iyustlop',
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)

  })

  test('a specific blog can be viewed', async () => {
    const blogsAtStart = await helper.blogsInDb()

    const blogToView = blogsAtStart[0]

    const resultBlogs = await api
      .get(`/api/blogs/${blogToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.deepStrictEqual(resultBlogs.body, blogToView)
  })

  test('a blog can be deleted', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogsToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogsToDelete.id}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()

    const titles = blogsAtEnd.map(r => r.title)
    assert(!titles.includes(blogsToDelete.content))

    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)
  })

  after(async () => {
    await mongoose.connection.close()
  })

})