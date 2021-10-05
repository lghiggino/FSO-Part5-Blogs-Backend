const bcrypt = require("bcrypt")
const usersRouter = require("express").Router()
const User = require("../models/userModel")

usersRouter.post("/", async (request, response, next) => {
    const { password, name, username } = request.body

    // const blog = await Blog.findById(body.blogId)

    if (username.length < 3) {
        return response.status(400).send({
            error: "username must have at least 3 characters"
        })
    }
    if (!password || password.length < 3) {
        return response.status(400).send({
            error: "password must have at least 3 characters"
        })
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    try {
        const user = new User({
            username,
            name,
            passwordHash
        })

        const savedUser = await user.save()
        response.json(savedUser)
    } catch (error) {
        next(error)
    }
})

usersRouter.delete("/:id", async (request, response, next) => {
    try {
        await User.findByIdAndRemove(request.params.id)
        response.status(204).end()
    }
    catch (error) {
        next(error)
    }
})

usersRouter.get("/", async (request, response, next) => {
    try {
        const users = await User.find({}).populate("blogs", { title: 1, author: 1, url: 1, likes: 1, })
        response.json(users.map(u => u.toJSON()))
    }
    catch (error) {
        next(error)
    }
})

usersRouter.get("/:username", async (request, response, next) => {
    try {
        const user = await User.findOne({ username: request.params.username })
        if (user) {
            response.json(user)
        } else {
            response.status(404).end()
        }
    }
    catch (error) {
        next(error)
    }
})

module.exports = usersRouter