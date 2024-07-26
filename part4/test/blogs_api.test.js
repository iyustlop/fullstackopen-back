const { test, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blogs = require('../models/blogs')
const helper = require('./test_helper')


beforeEach(async () => {
  await Blogs.deleteMany({})
  let noteObject = new Blogs(helper.initialBlogs[0])
  await noteObject.save()
  noteObject = new Blogs(helper.initialBlogs[1])
  await noteObject.save()
})

const api = supertest(app)

test('notes are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('there are two notes', async () => {
  const response = await api.get('/api/blogs')

  assert.strictEqual(response.body.length, helper.initialBlogs.length)
})

test('the first note is about HTTP methods', async () => {
  const response = await api.get('/api/blogs')

  const titles = response.body.map(e => e.title)
  // es el argumento truthy
  assert(titles.includes('HTML is easy'))
})

test('a valid note can be added ', async () => {
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

  const blogsAtEnd = await helper.notesInDb()

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

  const blogsAtEnd = await helper.notesInDb()
  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)

})

test('a specific note can be viewed', async () => {
  const blogsAtStart = await helper.notesInDb()

  const blogToView = blogsAtStart[0]

  const resultBlogs = await api
    .get(`/api/blogs/${blogToView.id}`)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  assert.deepStrictEqual(resultBlogs.body, blogToView)
})

test('a note can be deleted', async () => {
  const blogsAtStart = await helper.notesInDb()
  const blogsToDelete = blogsAtStart[0]

  await api
    .delete(`/api/blogs/${blogsToDelete.id}`)
    .expect(204)

  const blogsAtEnd = await helper.notesInDb()

  const titles = blogsAtEnd.map(r => r.title)
  assert(!titles.includes(blogsToDelete.content))

  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)
})

after(async () => {
  await mongoose.connection.close()
})