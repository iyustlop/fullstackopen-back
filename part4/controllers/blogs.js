const blogsRouter = require('express').Router()
const Blog = require('../models/blogs')
const User = require('../models/user')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({})
    .populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id)
  if (blog) {
    response.json(blog)
  } else {
    response.status(404).end()
  }
})

blogsRouter.post('/', async (request, response) => {
  const body = request.body

  const user = await User.findById(request.user)
  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
    user: user
  })

  const savedBlogs = await blog.save()
  user.blogs = user.blogs.concat(savedBlogs._id)
  await user.save()

  response.status(201).json(savedBlogs)
})

blogsRouter.put('/:id', async (request, response) => {
  const body = request.body

  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
  }

  const updatedBlogs = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true, runValidators: true, context: 'query' })
  response.status(200).json(updatedBlogs)
})

blogsRouter.delete('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id)

  if (blog.user.toString() !== request.user.toString()) {
    return response.status(401).json({ error: 'user invalid' })
  } else {
    await Blog.findByIdAndDelete(request.params.id)
    response.status(204).end()
  }
})

module.exports = blogsRouter