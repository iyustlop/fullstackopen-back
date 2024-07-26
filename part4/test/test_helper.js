const Blogs = require('../models/blogs')

const initialBlogs = [
  {
    'title': 'HTML is easy',
    'author': 'iyustlop',
    'url': 'https://www.tumblr.com/blog/iyustlop',
    'likes': 0,
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

const notesInDb = async () => {
  const notes = await Blogs.find({})
  return notes.map(note => note.toJSON())
}

module.exports = {
  initialBlogs, nonExistingId, notesInDb
}