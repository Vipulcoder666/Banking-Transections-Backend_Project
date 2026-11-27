const userModel = require('../models/user.model');
const jwt = require("jsonwebtoken");

// ==========================================
// 1. User Register Controller
// ==========================================
async function userRegisterController(req, res) {
    // Extract input fields from request body
    const { email, password, name } = req.body;

    // Check if user already exists with this email
    const isExists = await userModel.findOne({ email });

    if (isExists) {
        return res.status(422).json({
            message: "user already exists with this email",
            status: "failed"
        });
    }

    // Create new user in the database (password is automatically hashed by model hook)
    const user = await userModel.create({
        email,
        password,
        name
    });

    // Generate JWT token with user id
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "3d" });

    // Save token in browser cookie
    res.cookie("token", token);

    // Send success response with created user details
    res.status(201).json({
        user: {
            _id: user._id,
            email: user.email,
            name: user.name
        },
        token
    });
}

// ==========================================
// 2. User Login Controller
// ==========================================
async function userLoginController(req, res) {
    // Extract login credentials from request body
    const { email, password } = req.body;

    // Find user by email and explicitly select password (since select: false in schema)
    const user = await userModel.findOne({ email }).select("+password");

    // If user does not exist
    if (!user) {
        return res.status(401).json({
            message: "Invalid email or password",
            status: "failed"
        });
    }

    // Compare entered password with stored hashed password
    const isMatch = await user.comparePassword(password);

    // If password does not match
    if (!isMatch) {
        return res.status(401).json({
            message: "Invalid email or password",
            status: "failed"
        });
    }

    // Generate JWT token on successful login
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "3d" });

    // Save token in cookie
    res.cookie("token", token);

    // Send success response
    res.status(200).json({
        message: "Logged in successfully",
        user: {
            _id: user._id,
            email: user.email,
            name: user.name
        },
        token
    });
}

module.exports = {
    userRegisterController,
    userLoginController
};
