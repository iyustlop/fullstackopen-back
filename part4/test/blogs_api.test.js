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

  describe('addition of a new note', () => {
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
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)

      const titles = blogsAtEnd.map(n => n.title)
      assert(titles.includes(newBlog.title))
    })

    test('blog without likes returns default value 0', async () => {
      const newBlog = {
        title: 'async/await simplifies making async calls',
        author: 'FDV',
        url: 'https://www.tumblr.com/blog/iyustlop',
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const blogsAtEnd = await helper.blogsInDb()
      const blogFromDB = blogsAtEnd.filter(blog => blog.title === newBlog.title)
      assert.strictEqual(blogFromDB[0].likes,0)

    })

    test('blog without author is not added ans return 400', async () => {
      const newBlog = {
        title: 'async/await simplifies making async calls',
        url: 'https://www.tumblr.com/blog/iyustlop',
        likes: 0,
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
    })

    test('blog without title is not added ans return 400', async () => {
      const newBlog = {
        author: 'FDV',
        url: 'https://www.tumblr.com/blog/iyustlop',
        likes: 0,
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
    })
  })

  describe('deletion of a blogs', () => {
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

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    assert(usernames.includes(newUser.username))
  })
})

test('creation fails with proper statuscode and message if username already taken', async () => {
  const usersAtStart = await helper.usersInDb()

  const newUser = {
    username: 'root',
    name: 'Superuser',
    password: 'salainen',
  }

  const result = await api
    .post('/api/users')
    .send(newUser)
    .expect(400)
    .expect('Content-Type', /application\/json/)

  const usersAtEnd = await helper.usersInDb()
  assert(result.body.error.includes('expected `username` to be unique'))

  assert.strictEqual(usersAtEnd.length, usersAtStart.length)
})

after(async () => {
  await mongoose.connection.close()
})