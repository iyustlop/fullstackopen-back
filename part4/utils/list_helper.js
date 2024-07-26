const dummy = (blogs) => {
  return 1
}

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

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog
}