const jwt = require('jsonwebtoken');
// require('dotenv').config();

const User = require('../models/User');
const {JWT_SECRET} = process.env;


exports.createUser = async (req, res) => {
    try {
        const {email, fullname} = req.body;
        const username = email.split('@')[0];
        const password = username;
        const user = new User({ username, password, email, fullname });
        await user.save();
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json(error);
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username, password });
        if (!user) {
            return res.status(404).json({error: 'Wrong username or password'});
        }
        else if(user.isLocked){
            return res.status(409).json({error: "Your account is locked, please contact to admin"})
        }
        else if(!user.isActive){
            return res.status(409).json({error: "Your account is not activated, please check your email"})
        }
        user.status = "online";
        await user.save();
        req.session.user = user;
        res.status(200).json({user : user.role});
    } catch (error) {
        res.status(400).json(error);
    }
};

exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json();
        }
        res.json(user);
    } catch (error) {
        res.status(500).json(error);
    }
};

exports.updateUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.userId, req.body, { new: true, runValidators: true });
        if (!user) {
            return res.status(404).json();
        }
        res.json(user);
    } catch (error) {
        res.status(400).json(error);
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.userId);
        if (!user) {
            return res.status(404).json();
        }
        res.json(user);
    } catch (error) {
        res.status(500).json(error);
    }
};

exports.authenticateUser = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username });
        if (!user || !bcrypt.compareSync(req.body.password, user.password)) {
            return res.status(401).json({ message: 'Authentication failed' });
        }
        // Implement token generation or session management as per your authentication strategy
        res.json({ message: 'User authenticated successfully' });
    } catch (error) {
        res.status(500).json(error);
    }
};

// Other utility functions as needed...