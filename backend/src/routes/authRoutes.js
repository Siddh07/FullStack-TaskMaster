const express = require('express');
const { register, login, getMe } = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');


const router = express.Router();// we called the router efature from   express  ?

router.post('/register',register) //login end point
router.post('/login',login)
router.get('/me',auth,getMe) // this the layering to get to inisde getMe ?

module.exports = router