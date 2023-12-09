const mongodb = require('mongodb');
var fs = require('fs');
const cloudinary = require('cloudinary').v2;
const db = require('../data/database');

const ObjectId = mongodb.ObjectId

class Task {
    constructor(accountId, title, summary, desc, status, filePath, fileName, fileId, id) {
        this.accountId = accountId;
        this.title = title;
        this.summary = summary;
        this.desc = desc;
        this.status = status;
        this.filePath = filePath;
        this.orignalName = fileName;
        this.fileId = fileId
        this.id = id;
    }

    async fetchAll() {
        // const tasks = await db.getDb().collection('todos').find({ accountId: new ObjectId(this.accountId) }, { title: 1, summary: 1 }).toArray();
        const tasks = await db.getDb().collection('todos').find({ accountId: new ObjectId(this.accountId) }).toArray();

        return tasks;
    }

    async save(flag) {
        let result;

        if (this.id) {
            if (flag == 1) {
                result = await db.getDb().collection('todos').updateOne({ _id: new ObjectId(this.id) }, {
                    $set: {
                        title: this.title,
                        summary: this.summary,
                        filePath: this.filePath,
                        fileId: this.fileId,
                        orignalName: this.orignalName,
                        desc: this.desc,
                        status: this.status,
                    }
                });
            }
            else {
                result = await db.getDb().collection('todos').updateOne({ _id: new ObjectId(this.id) }, {
                    $set: {
                        title: this.title,
                        summary: this.summary,
                        desc: this.desc,
                        status: this.status
                    }
                });
            }
        }

        else {
            result = await db.getDb().collection('todos').insertOne({
                title: this.title,
                summary: this.summary,
                filePath: this.filePath,
                fileId: this.fileId,
                orignalName: this.orignalName,
                desc: this.desc,
                status: this.status,
                accountId: new ObjectId(this.accountId)
            });

        }
        return result;

    }

    async getTask() {
        const task = await db.getDb().collection('todos').findOne({ _id: new ObjectId(this.id) });

        return task;
    }

    async deleteTask() {
        const task = await db.getDb().collection('todos').findOne({ _id: new ObjectId(this.id) }, { filePath: 1 });

        if (task.filePath) {

            if (process.env.CLOUD_NAME) {

                cloudinary.uploader.destroy(task.fileId);

            } else {

                fs.unlink(task.filePath, function (err) {
                    if (err) {
                        throw err;
                    }
                })
            }
        }

        const deleteTask = await db.getDb().collection('todos').deleteOne({ _id: new ObjectId(this.id) });
    }

    async removeFile() {
        const task = await db.getDb().collection('todos').findOne({ _id: new ObjectId(this.id) }, { filePath: 1 });
        if (process.env.CLOUD_NAME) {
            cloudinary.uploader.destroy(task.fileId);
        } else {
            
            fs.unlink(task.filePath, function (err) {
                if (err) {
                    throw err;
                }
            })
        }

        await db.getDb().collection('todos').updateOne({ _id: new ObjectId(this.id) }, { $set: { filePath: null, orignalName: null } })
    }

}

module.exports = Task;