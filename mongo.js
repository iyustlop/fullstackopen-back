const mongoose = require('mongoose')

if (process.argv.length < 3) {
    console.log('give password as argument')
    process.exit(1)
}

const password = process.argv[2]
const name = process.argv[3]
const number = process.argv[4]

const url =
    `mongodb+srv://iyustlop:${password}@atlascluster.x7ikeow.mongodb.net/phonebookApp?retryWrites=true&w=majority&appName=AtlasCluster`

mongoose.set('strictQuery', false)

mongoose.connect(url)

const contactSchema = new mongoose.Schema({
    name: String,
    number: String,
})

const Contact = mongoose.model('Contact', contactSchema)

const contact = new Contact({
    name: `${name}`,
    number: `${number}`,
})


if (process.argv.length > 3) {
    contact.save().then(result => {
        console.log(`Added ${name} ${number} to phonebook`)
        mongoose.connection.close()
    })
}

if (process.argv.length == 3) {
    console.log('phonebook:');
    Contact.find({}).then(result => {
        result.forEach(contact => {
            console.log(contact.name, contact.number)
        })
        mongoose.connection.close()
    })
}
