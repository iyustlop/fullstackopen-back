require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Contact = require('./models/contact')

const app = express()

app.use(express.json())
app.use(express.static('dist'))
app.use(cors())

morgan.token('body', (res) => JSON.stringify(res.body));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));


app.get('/info', (request, response) => {
    const time = new Date();
    response.send(`<p>Phonebook has info for ${persons.length} people</p>
        <p>${time}  </p>`)
})

app.get('/api/persons', (request, response) => {
    console.log('phonebook:');
    Contact.find({}).then(result => {
        response.json(result)
    })
})

app.get('/api/persons/:id', (request, response) => {
    Contact.findById(request.params.id).then(contact => {
        response.json(contact)
    })
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)

    response.status(204).end()
})


app.post('/api/persons', (request, response) => {
    const body = request.body

    if (!body) {
        return response.status(400).json({
            error: 'content missing'
        })
    }

    if (!body.number) {
        return response.status(400).json({
            error: 'number is missing'
        })
    }

    const person = new Contact({
        name: body.name,
        number: body.number || false,
    })

    person.save().then(savedContact => {
        response.json(savedContact)
    })
})


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})