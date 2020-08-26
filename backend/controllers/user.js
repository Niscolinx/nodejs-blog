const { validationResult } = require('express-validator/check')

const User = require('../models/user')
const bcrypt = require('bcryptjs')

exports.postSignup = (req, res, next) => {
    const { email, password, username } = req.body

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.')
        error.statusCode = 422
        error.errorMessage = errors.array()[0].msg
        throw error
    }

    bcrypt
        .hash(password, 12)
        .then((hashedPassword) => {
            const user = new User({
                email,
                username,
                password: hashedPassword,
                status: 'New user',
            })

            return user.save()
        })
        .then((result) => {
            console.log(result)
            res.status(201).json({ message: 'Successful signup' })
        })
        .catch((err) => {
            next(err)
        })
}

exports.postLogin = (req, res, next) => {
    const { email, password } = req.body

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.')
        error.statusCode = 422
        error.errorMessage = errors.array()[0].msg
        throw error
    }

    User.findOne({ email })
        .then((user) => {
            console.log('the user', user)
            if (!user) {
                const error = new Error('user validation failed')
                error.statusCode = 500
                throw error
            } else {
                bcrypt.compare(password, user.password).then((isEqual) => {
                    console.log('the hash', isEqual)
                    if (!isEqual) {
                        res.status(403).json({message: 'Incorrect password'})
                        const error = new Error('Incorrect password')
                        error.statusCode = 403
                        throw error
                    }
                    res.status(201).json({ message: 'Successful login' })
                })
            }
        })

        .catch((err) => {
            console.log('the error', err)
            next(err)
        })
}
