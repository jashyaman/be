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

const userLoginSchema = new mongoose.Schema({
    username: String,
    password: String,
});
const UserLogin = mongoose.model('userlogin', userLoginSchema);

const configSchema = new mongoose.Schema({
    type: String,
    data: Object
})
const Configuration = mongoose.model('configuration', configSchema);

const projectSchema = new mongoose.Schema({
    project_name: String,
    owner_name: String,
    project_type: String
})
const Project = mongoose.model('project', projectSchema);

const moduleSchema = new mongoose.Schema({
    module_name: String,
    estimate: String,
    description: String,
    owner_name: String,
    parent: String
})
const Module = mongoose.model('module', moduleSchema);

const submoduleSchema = new mongoose.Schema({
    submodule_name: String,
    estimate: String,
    description: String,
    owner_name: String,
    parent: String
})
const Submodule = mongoose.model('submodule', submoduleSchema);

const taskSchema = new mongoose.Schema({
    task_name: String,
    estimate: String,
    description: String,
    owner_name: String,
    parent: String
})
const Task = mongoose.model('task', taskSchema);

const subtaskSchema = new mongoose.Schema({
    subtask_name: String,
    estimate: String,
    description: String,
    owner_name: String,
    parent: String
})
const Subtask = mongoose.model('subtask', subtaskSchema);

let determineSchemaFn = (collection) => {
    switch(collection) {
      case "projects":
        return Project;
      case "modules":
        return Module;
      case "submodules":
        return Submodule;
      case "tasks":
        return Task;
      case "subtasks":
        return Subtask;
      break;
      default:
        console.log("not a value collection name " + collection);
        return null;
        break;
    }
};

exports.TodoEntry = TodoEntry;
exports.UserLogin = UserLogin;
exports.Configuration = Configuration;
exports.Project = Project;
exports.Module = Module;
exports.Submodule = Submodule;
exports.Task = Task;
exports.Subtask = Subtask;
exports.determineSchema = determineSchemaFn
