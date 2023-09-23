const mongoose = require('mongoose');
const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true, 
  },
  author: {
    type: String,
    required: true, 
  },
  genre: String, 
},
{timestamps : true}
);

// Create the Book model using the schema
const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
