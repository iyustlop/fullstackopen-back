const Blogs = require('../models/blogs')
const Users = require('../models/user')

const initialBlogs = [
  {
    'title': 'HTML is easy',
    'author': 'iyustlop',
    'url': 'https://www.tumblr.com/blog/iyustlop',
    'likes': 10,
  },
  {
    'title': 'FDV',
    'author': 'FDV',
    'url': 'https://www.tumblr.com/blog/iyustlop',
    'likes': 0,
  }
]


const nonExistingId = async () => {
  const note = new Blogs({ title: 'willremovethissoon' })
  await note.save()
  await note.deleteOne()

  return note._id.toString()
}

const blogsInDb = async () => {
  const blogs = await Blogs.find({})
  return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
  const users = await Users.find({})
  return users.map(user => user.toJSON())
}


module.exports = {
  initialBlogs, nonExistingId, blogsInDb, usersInDb
}