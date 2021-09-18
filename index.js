const express = require('express');
const app = express();
const mongoose = require('mongoose');
const ejs = require('ejs');
const path = require('path');
const bcrypt = require('bcrypt');
const session = require('express-session')

const User = require('./models/user');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'keyboardpassword',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60,
        expires: Date.now() + 1000 * 60 * 60
    }
}))


async function main() {
    await mongoose.connect('mongodb://localhost:27017/authdemo');
}
main()
    .then(() => console.log('Datebase connected!'))
    .catch(err => console.log(err));


// Define Middlewares
const requireLogin = (req, res, next) => {
    if (req.session.userId) {
        console.log('login already');
        next()
    }
    else {
        console.log('not login');
        res.redirect('login')
    }
}



// Route 
app.get('/', (req, res) => {
    res.render('home');
})


// Register
app.get('/register', (req, res) => {
    res.render('register');
})

app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await new User(req.body);
        await user.save(); //trigger pre save middleware
        res.redirect('login');
    } catch (e) {
        console.log(e)
    }
})

// Login
app.get('/login', (req, res) => {
    res.render('login');
})

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log(`input:${username},${password}`);
        //static function -- findAndValidate()
        const user = await User.findAndValidate(username, password);
        if (user) {
            req.session.userId = user._id;
            res.redirect('admin');
        }
        else res.redirect('login');
    } catch (e) {
        console.log(e)
    }
})

// require validate
app.get('/admin', requireLogin, (req, res) => {
    res.render('admin');

})



// Logout
app.post('/logout', async (req, res) => {
    try {
        req.session.destroy();
        res.redirect('home');

    } catch (e) {
        console.log(e)
    }
})








app.listen(3000, () => {
    console.log('server is listening on port 3000!')
});