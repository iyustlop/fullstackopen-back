const lodash = require('lodash')

const totalLikes = (blogs) => {
  let result = 0
  blogs.forEach(blog => {
    result = result + blog.likes
  })

  return result
}

const favoriteBlog = (blogs) => {
  const max = blogs.reduce((max, blog) => {
    return blog.likes > max.likes ? blog : max
  })

  const propiedadesAExcluir = ['_id', 'url','__v']

  const objetoCopiado = Object.keys(max).reduce((acc, key) => {
    if (!propiedadesAExcluir.includes(key)) {
      acc[key] = max[key]
    }
    return acc
  }, {})

  return objetoCopiado
}

const mostBlogs = (blogs) => {
  const authors = lodash.map(blogs, 'author')
  const countAuthors = lodash.countBy(authors)
  const mostFrequentAuthor = lodash.maxBy(lodash.keys(countAuthors), author => countAuthors[author])
  return { author: mostFrequentAuthor, blogs: countAuthors[mostFrequentAuthor] }
}

const mostLikes = (blogs) => {
  const likesByAuthor = lodash.reduce(blogs, (result, item) => {
    if (result[item.author]) {
      result[item.author] += item.likes
    } else {
      result[item.author] = item.likes
    }
    return result
  }, {})

  const authorWithMoreLikes = lodash.maxBy(lodash.keys(likesByAuthor), author => likesByAuthor[author])

  const numberOfLikes = likesByAuthor[authorWithMoreLikes]
  return { author: authorWithMoreLikes, likes: numberOfLikes }
}

module.exports = {
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}