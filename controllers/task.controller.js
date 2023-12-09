const mongodb = require('mongodb');
var fs = require('fs');
const db = require('../data/database');
const ObjectId = mongodb.ObjectId;
const Task = require('../models/task.model');
const cloudinary = require('cloudinary').v2;
const { type } = require('os');

function home(req, res) {

    if (!res.locals.isAuth) {
        return res.status(401).redirect('login');
    }

    res.redirect('/tasks');
}

async function allTasks(req, res) {

    if (!res.locals.isAuth) {
        return res.status(401).redirect('login');
    }

    let tasks = await new Task(res.locals.userId, null, null, null, null, null, null).fetchAll();

    res.render('task-list', { tasks: tasks });
}

function getCreateTask(req, res) {
    if (!res.locals.isAuth) {
        return res.status(401).redirect('login');
    }
    res.render('create-task');
}

// from here we will be continuing

async function createTask(req, res) {
    let uploadedFile = req.file;
    if (!uploadedFile || uploadedFile == null) {
        uploadedFile = {
            path: null,
            orignalname: null
        }
    }

    if (process.env.CLOUD_NAME) {
        cloudinary.v2.uploader.upload(req.file,
            { public_id: req.file.originalname },
            function (error, result) { console.log(result); }
        );
    }

    const taskData = {
        accountId: new ObjectId(res.locals.userId),
        title: req.body.title,
        summary: req.body.summary,
        desc: req.body.desc,
        status: req.body.status,
        filePath: uploadedFile.path,
        orignalName: uploadedFile.originalname
    };

    await new Task(taskData.accountId, taskData.title, taskData.summary, taskData.desc, taskData.status, taskData.filePath, taskData.orignalName, null).save(0);

    res.redirect('/');
}

async function taskDetail(req, res) {
    if (!res.locals.isAuth) {
        return res.status(401).redirect('login');
    }

    const taskId = req.params.id;
    const accountId = res.locals.userId;

    const task = await new Task(accountId, null, null, null, null, null, null, taskId).getTask();

    if (JSON.stringify(task.accountId) != JSON.stringify(accountId)) {
        return res.redirect('/'); // Private resources
    }

    res.render('task-detail', { task: task });
}

async function getUpdateTask(req, res) {
    if (!res.locals.isAuth) {
        return res.status(401).redirect('login');
    }

    const accountId = res.locals.userId;

    // This will extract id form dynamic link and get list of task
    const taskId = req.params.id;
    const task = await new Task(null, null, null, null, null, null, null, taskId).getTask();

    if (JSON.stringify(task.accountId) != JSON.stringify(accountId)) {
        return res.redirect('/'); // Private resources
    }

    res.render('update-task', { task: task });
}

async function updateTask(req, res) {

    const taskId = req.params.id;
    const task = await new Task(null, null, null, null, null, null, null, taskId).getTask();
    // try consoling file path and all data without excuting anything else
    let uploadedFile = req.file;

    if (uploadedFile) {

        if (task.filePath) {
            fs.unlink(task.filePath, function (err) {
                if (err) {
                    throw err;
                }
            })

            if (!uploadedFile || uploadedFile == null) {
                uploadedFile = {
                    path: null
                }
            }
        }

        const taskData = {
            accountId: new ObjectId(res.locals.userId),
            title: req.body.title,
            summary: req.body.summary,
            desc: req.body.desc,
            status: req.body.status,
            filePath: uploadedFile.path,
            orignalName: uploadedFile.originalname
        };

        await new Task(taskData.accountId, taskData.title, taskData.summary, taskData.desc, taskData.status, taskData.filePath, taskData.orignalName, taskId).save(1);
    }

    else {
        const taskData = {
            accountId: new ObjectId(res.locals.userId),
            title: req.body.title,
            summary: req.body.summary,
            desc: req.body.desc,
            status: req.body.status,
        };

        await new Task(taskData.accountId, taskData.title, taskData.summary, taskData.desc, taskData.status, null, null, taskId).save(0);
    }

    res.redirect('/')
}

async function deleteTask(req, res) {

    if (!res.locals.isAuth) {
        return res.redirect('/tasks');
    }

    const taskId = req.params.id;

    const task = new Task(null, null, null, null, null, null, null, taskId).deleteTask();

    res.redirect('/')
}

async function removeFile(req, res) {
    const taskId = req.params.id;

    const task = new Task(null, null, null, null, null, null, null, taskId).removeFile();

    res.redirect('/task/' + taskId + '/edit');
}

module.exports = {
    home: home,
    allTasks: allTasks,
    getCreateTask: getCreateTask,
    createTask: createTask,
    taskDetail: taskDetail,
    getUpdateTask: getUpdateTask,
    updateTask: updateTask,
    deleteTask: deleteTask,
    removeFile: removeFile,
}