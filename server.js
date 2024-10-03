// server.js

const express = require("express")
const multer = require("multer")
const app = express()
app.use(express.urlencoded({ extended: true }));
const mongoose = require("mongoose")
require("dotenv").config()
const upload = multer({ dest: "uploads" })
const bcrypt = require("bcrypt")
const File = require("./models/File.js")

mongoose.connect(process.env.MONGO, { dbName: 'test' })

app.set("view engine", "ejs")

app.get("/", (req, res) => {
    res.render("index")
})

app.post("/upload",
    upload?.single("file"), async (req, res) => {
        const fileData = {
            path: req?.file?.path,
            originalName: req?.file?.originalname
        }
        if (req?.body?.password != null &&
            req?.body?.password !== "") {
            fileData.password =
                await bcrypt?.hash(req?.body?.password, 10)
        }
        const file = await File?.create(fileData)
        res.render("index",
            { fileLink: `${req?.headers?.origin}/file/${file?.id}` })
    })


app.get("/file/:id", handleDownload)
app.post("/file/:id", handleDownload)

async function handleDownload(req, res) {
    const file = await File?.findById(req?.params?.id)

    if (file?.password != null) {
        if (req?.body?.password == null) {
            res.render("password")
            return
        }

        if (!(await bcrypt?.compare(
            req?.body?.password, file?.password))) {
            res.render("password", { error: true })
            return
        }
    }

    file.downloadCount++
    await file?.save()
    res.download(file?.path, file?.originalName)
}
app.listen(process.env.PORT || 3000, () => console.log("server is running"))
