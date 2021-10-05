const config = require("./utils/config")
const express = require("express")
require("express-async-errors")
const cors = require("cors")
const logger = require("./utils/logger")
const middleware = require("./utils/middleware")
const blogsRouter = require("./controllers/blogsController")
const usersRouter = require("./controllers/usersController")
const loginRouter = require("./controllers/loginController")
const mongoose = require("mongoose")

const app = express()

logger.info(`connecting to ${config.MONGODB_URI}`)

mongoose.set("useCreateIndex", true)

mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
    .then(() => {
        logger.info("Connected to MongoDB")
    })
    .catch(error => {
        logger.error("Error connecting to MongoDB", error.message)
    })

app.use(cors())
app.use(express.static("build"))
app.use(express.json())
app.use(middleware.tokenExtractor)
app.use(middleware.requestLogger)

app.use("/api/blogs", blogsRouter)
app.use("/api/users", usersRouter)
app.use("/api/login", loginRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app