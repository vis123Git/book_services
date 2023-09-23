const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Admin = require("../models/adminModel");
const Book = require("../models/bookModel");

// Admin Signup
const adminSignup = async (req, res) => {
  try {
    const { admin_name, email, password } = req.body;

    if (!admin_name) return res.status(400).json({ message: "Name is required" });
    if (!email) return res.status(400).json({ message: "Email is required" });
    if (!password) return res.status(400).json({ message: "Password is required" });

    // Check if the admin with the same email already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin with this email already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new admin
    const newAdmin = new Admin({ admin_name, email, password: hashedPassword });
    await newAdmin.save();

    // Return a success message
    res.status(201).json({ message: "Admin created successfully. You can login" });
  } catch (error) {
    console.error("Error creating admin:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//ADMIN LOGIN
const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the admin by email
    const admin = await Admin.findOne({ email });

    // Check if the admin exists
    if (!admin) {
      return res.status(401).json({ message: "Authentication failed" });
    }

    // Compare the provided password with the stored hashed password
    const passwordMatch = await bcrypt.compare(password, admin.password);

    if (passwordMatch) {
      const token = jwt.sign({ admin_id: admin._id, isAdmin: true }, process.env.JWT_KEY, {
        expiresIn: "1h",
      });

      admin.token = token;
      await admin.save();
      return res.status(200).json({ message: "Authentication successful", token });
    } else {
      return res.status(401).json({ message: "Authentication failed" });
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

//ADD BOOK
const addBook = async (req, res) => {
  try {
    const { title, author, genre } = req.body;

    if (!title) return res.status(400).json({ message: "Title is required" });
    if (!author) return res.status(400).json({ message: "Author is required" });

    // Check if the admin with the same email already exists
    const existingAdmin = await Admin.findOne({ _id: req.admin_id });
    if (!existingAdmin || !req.isAdmin) return res.status(400).json({ message: "Only Admin can add books!!" });

    //CHECK FOR ALREADY ADDED
    const findOneBook = Book.findOne({ title, author });
    if (findOneBook) return res.status(400).json({ message: "Already added this book!!" });

    const newBook = new Book({ title, author, genre: genre ? genre : "" });
    await newBook.save();

    return res.status(201).json({ data: newBook, message: "Book created successfully" });
  } catch (error) {
    console.error("Error creating admin:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//GET BOOK
const getBooks = async (req, res) => {
  try {
    const books = await Book.find();
    return res.status(200).json({ data: books, message: "Books retrieved successfully" });
  } catch (error) {
    console.error("Error retrieving books:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//GET BOOK BY ID
const getBookById = async (req, res) => {
  const { id } = req.params;
  try {
    const book = await Book.findById(id);
    if (!book) return res.status(404).json({ message: "Book not found" });
    return res.status(200).json({ data: book, message: "Book retrieved successfully" });
  } catch (error) {
    console.error("Error retrieving book:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};



//DEL BOOK BY ID
const delBookById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await Book.deleteOne({ _id: id });

    if (result.deletedCount === 0) return res.status(404).json({ message: 'Book not found' });
    return res.status(200).json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Error deleting book:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


//GET BOOK BY ID AND UPDATE
const getBookByIdAndUpdate = async (req, res) => {
  const { id } = req.params;
  const { title, author, genre } = req.body;
  try {
    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    // Update book properties
    book.title = title || book.title;
    book.author = author || book.author;
    book.genre = genre || book.genre;
    await book.save();
    return res.status(200).json({ data: book, message: "Book updated successfully" });
  } catch (error) {
    console.error("Error updating book:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { adminSignup, adminLogin, addBook, getBooks, getBookById, getBookByIdAndUpdate,delBookById };
