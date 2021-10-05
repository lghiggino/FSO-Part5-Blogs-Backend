const blogsRouter = require("express").Router()
const Blog = require("../models/blogModel")
const User = require("../models/userModel")
const jwt = require("jsonwebtoken")

blogsRouter.get("/", async (request, response, next) => {
    try {
        const blogs = await Blog
            .find({})
            .populate("user", { username: 1, name: 1 })
        response.json(blogs)
    }
    catch (error) {
        next(error)
    }
})

blogsRouter.get("/:id", async (request, response, next) => {
    try {
        const blog = await Blog.findById(request.params.id)
        if (blog) {
            response.json(blog)
        } else {
            response.status(404).end()
        }
    }
    catch (error) {
        next(error)
    }
})

blogsRouter.post("/", async (request, response) => {
    const blog = new Blog(request.body)

    const decodedToken = jwt.verify(request.token, process.env.SECRET)

    if (!request.token || !decodedToken.id) {
        return response.status(401).json({ error: "token missing or invalid" })
    }

    const user = await User.findById(decodedToken.id)

    if (!blog.url || !blog.title) {
        return response.status(400).send({ error: "title or url missing " })
    }

    if (!blog.likes) {
        blog.likes = 0
    }

    blog.user = user
    const savedBlog = await blog.save()

    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()

    response.status(201).json(savedBlog)
})

blogsRouter.delete("/:id", async (request, response) => {
    const decodedToken = jwt.verify(request.token, process.env.SECRET)

    if (!request.token || !decodedToken.id) {
        return response.status(401).json({ error: "token missing or invalid" })
    }

    const user = await User.findById(decodedToken.id)
    const blog = await Blog.findById(request.params.id)
    if (blog.user.toString() !== user.id.toString()) {
        return response.status(401).json({ error: "only the creator can delete blogs" })
    }

    await blog.remove()
    user.blogs = user.blogs.filter(b => b.id.toString() !== request.params.id.toString())
    await user.save()
    response.status(204).end()
})

blogsRouter.put("/:id", async (request, response, next) => {
    const body = request.body

    const blog = {
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes
    }

    try {
        const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
        response.json(updatedBlog.toJSON())
    }
    catch (error) {
        next(error)
    }
})

module.exports = blogsRouter