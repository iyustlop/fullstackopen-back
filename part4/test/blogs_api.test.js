const { describe, test, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')
const app = require('../app')
const helper = require('./test_helper')
const Blogs = require('../models/blogs')
const User = require('../models/user')

beforeEach(async () => {

  await User.deleteMany({})
  const passwordHash = await bcrypt.hash('sekret', 10)
  const user = new User({ username: 'root', passwordHash })
  await user.save()
})

const getToken = async () => {
  const user = {
    username: 'root',
    password: 'sekret'
  }

  const response = await api
    .post('/api/login')
    .send(user)
    .expect(200)
  return response.body.token
}

const api = supertest(app)

describe ('Blogs test for fullstackopen Part 4', () => {
  beforeEach(async () => {
    await Blogs.deleteMany({})

    const blogsObjects = helper.initialBlogs.map(blog => new Blogs(blog))
    const promiseArray = blogsObjects.map(blogs => blogs.save())
    await Promise.all(promiseArray)
  })
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

  test('a specific blog is within the returned blogs', async () => {
    const response = await api.get('/api/blogs')

    const contents = response.body.map(r => r.title)
    assert(contents.includes('HTML is easy'))
  })

  test('check property id', async () => {
    const response = await api
      .get('/api/blogs')

    const ids =  response.body.map(e => e.id)
    assert(ids.length >0)
  })

  describe('viewing a specific note', () => {
    test('a specific blog can be viewed', async () => {
      const blogsAtStart = await helper.blogsInDb()

      const blogToView = blogsAtStart[0]

      const resultBlogs = await api
        .get(`/api/blogs/${blogToView.id}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      assert.deepStrictEqual(resultBlogs.body, blogToView)
    })
  })

  describe('addition of a new blog', () => {
    test('a valid blog can be added ', async () => {
      const token = await getToken()
      const user = await helper.usersInDb()

      const newBlog = {
        title: 'async/await simplifies making async calls',
        author: 'FDV',
        url: 'https://www.tumblr.com/blog/iyustlop',
        likes: 0,
        user: user[0].id
      }

      await api
        .post('/api/blogs')
        .set('Authorization', 'Bearer ' + token)
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const blogsAtEnd = await helper.blogsInDb()

      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)

      const titles = blogsAtEnd.map(n => n.title)
      assert(titles.includes(newBlog.title))
    })

    test('blog without likes returns default value 0', async () => {
      const token = await getToken()
      const user = await helper.usersInDb()
      const newBlog = {
        title: 'async/await simplifies making async calls',
        author: 'FDV',
        url: 'https://www.tumblr.com/blog/iyustlop',
        user: user[0].id
      }

      await api
        .post('/api/blogs')
        .set('Authorization', 'Bearer ' + token)
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const blogsAtEnd = await helper.blogsInDb()
      const blogFromDB = blogsAtEnd.filter(blog => blog.title === newBlog.title)
      assert.strictEqual(blogFromDB[0].likes,0)

    })

    test('blog without author is not added ans return 400', async () => {
      const token = await getToken()
      const newBlog = {
        title: 'async/await simplifies making async calls',
        url: 'https://www.tumblr.com/blog/iyustlop',
        likes: 0,
      }

      await api
        .post('/api/blogs')
        .set('Authorization', 'Bearer ' + token)
        .send(newBlog)
        .expect(400)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
    })

    test('blog without title is not added and return 400', async () => {
      const token = await getToken()
      const newBlog = {
        author: 'FDV',
        url: 'https://www.tumblr.com/blog/iyustlop',
        likes: 0,
      }

      await api
        .post('/api/blogs')
        .set('Authorization', 'Bearer ' + token)
        .send(newBlog)
        .expect(400)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
    })

    test('a blog can be deleted', async () => {
      const token = await getToken()
      const user = await helper.usersInDb()

      const newBlog = {
        title: 'async/await simplifies making async calls',
        author: 'FDV',
        url: 'https://www.tumblr.com/blog/iyustlop',
        likes: 0,
        user: user[0].id
      }

      await api
        .post('/api/blogs')
        .set('Authorization', 'Bearer ' + token)
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const blogsAtStart = await helper.blogsInDb()
      const blogsToDelete = blogsAtStart[blogsAtStart.length-1]

      await api
        .delete(`/api/blogs/${blogsToDelete.id}`)
        .set('Authorization', 'Bearer ' + token)
        .expect(204)

      const blogsAtEnd = await helper.blogsInDb()

      const titles = blogsAtEnd.map(r => r.title)
      assert(!titles.includes(blogsToDelete.content))

      assert.strictEqual(blogsAtEnd.length, blogsAtStart.length - 1)
    })
  })

  describe('update options for blogs', () => {
    test('the number of likes of one test is updates', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const originalBlog = blogsAtStart.filter(blog => blog.likes === 0)
      const likes = 15

      const blogWithNewValue = {
        title: originalBlog[0].title,
        author: originalBlog[0].author,
        url: originalBlog[0].url,
        likes: likes
      }

      await api
        .put(`/api/blogs/${originalBlog[0].id}`)
        .send(blogWithNewValue)

      const blogsAtEnd = await helper.blogsInDb()
      const updatedBlog = blogsAtEnd.filter(blog => blog.title === blogWithNewValue.title)
      assert.strictEqual(updatedBlog[0].likes, likes)
    })
  })
})


after(async () => {
  await mongoose.connection.close()
})