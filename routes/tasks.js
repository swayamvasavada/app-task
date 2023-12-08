const express = require('express');
const multer = require('multer');

const taskController = require('../controllers/task.controller');

const storageConfig = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'files');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storageConfig });
const router = express.Router();


// From this point we are starting with routes functions


router.get('/', taskController.home);

router.get('/tasks', taskController.allTasks);


// This route is used for adding new tasks

router.post('/tasks', upload.single('file'), taskController.createTask);


router.get('/add-task', taskController.getCreateTask);


// This route is used to view task with dynamic link

router.get('/task/:id', taskController.taskDetail);


router.get('/task/:id/edit', taskController.getUpdateTask);


// This route is used to update task

router.post('/task/:id/edit', upload.single('file'), taskController.updateTask);


// This route is used to dleete task

router.post('/task/:id/delete', taskController.deleteTask);

router.post('/task/:id/remove-file', taskController.removeFile);

module.exports = router;