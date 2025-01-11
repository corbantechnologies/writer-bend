const express = require('express');
const cors = require('cors');
require("dotenv").config();
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const app = express();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const Work = require('./models/Work');

const salt = bcrypt.genSaltSync(10);
const secret = 'bvwfqygdwhfiuvy67r5s'

//cors
app.use(
    cors({
      origin: process.env.ORIGIN,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      credentials: true,
    })
  );

app.use(express.json());
app.use(cookieParser());

//cloudinary config
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_SECRET_KEY,
  });
mongoose.connect(process.env.DBURI || '')

app.post('/register', async (req, res)=>{
    const {email, password} = req.body;
    try {
        await User.create({
            email,
            password:bcrypt.hashSync(password,salt)
        });
        res.status(200).json('User created successfully')
    } catch (error) {
        res.status(400).json(error)
    }
})
app.post('/login', async (req, res)=>{
    const {email, password} = req.body;
    try {
        const userDoc = await User.findOne({email})
        const passOk = bcrypt.compareSync(password, userDoc.password)
        if(passOk){
            jwt.sign({email, userId: userDoc._id}, secret, {}, (err,token)=>{
                if(err) throw err;
                res.cookie('token', token).json('ok');
            })
        }else{
            res.status(400).json('Wrong credentials')
        }
    } catch (error) {
        res.status(400).json(error)
    }
})

app.post('/writer/admin/work', async (req, res) =>{
    let {title, content, isCourse, imageUrl } = req.body;
    try {
        const work = await Work.create({
            title,
            content,
            isCourse,
            imageUrl
        });
        res.status(200).json(work);
    } catch (error) {
        res.status(400).json(error)
    }
})

app.get('/writer/admin', async (req, res) => {
    try {
        const works = await Work.find({});
        res.status(200).json(works);
    } catch (error) {
        res.status(400).json(error)
    }
})

app.get('/profile', async (req, res) => {
    const {token} = req.cookies;
    jwt.verify(token, secret, {}, (err, info)=>{
        if(err) throw err;
        res.json(info)
    })
})

app.post('/logout', (req,res)=>{
    res.cookie('token','').json('ok')
})


app.listen(4000);