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
    taskname: String
});
const TodoEntry = mongoose.model('todo', todoSchema);


export default function() {
    "TodoEntry" : TodoEntry
}