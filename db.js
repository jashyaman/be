require("dotenv").config(); 
const mongoose = require("mongoose");
const mongoUrl = process.env.MONGODB_URL;
mongoose.connect(
    mongoUrl, 
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
);


const todoSchema = new mongoose.Schema({
    uname: String,
    taskname: String,
    done: Boolean
});
const TodoEntry = mongoose.model('todo', todoSchema);


exports.TodoEntry = TodoEntry;