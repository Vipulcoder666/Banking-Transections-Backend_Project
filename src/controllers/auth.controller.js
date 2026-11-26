const userModel = require('../models/user.model');
const jwt = require("jsonwebtoken");

async function userRegisterController(req, res) {
    try {
        const { email, password, name } = req.body;

        // Input validation
        if (!email || !password || !name) {
            return res.status(400).json({
                message: "All fields (email, password, name) are required",
                status: "failed"
            });
        }

        // Check if user already exists
        const isExists = await userModel.findOne({ email });

        if (isExists) {
            return res.status(422).json({
                message: "User already exists with this email",
                status: "failed"
            });
        }

        // Create new user in database
        const user = await userModel.create({
            email,
            password,
            name
        });

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "3d" }
        );

        // Set secure HTTP-only cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 3 * 24 * 60 * 60 * 1000 // 3 days
        });

        return res.status(201).json({
            message: "User registered successfully",
            status: "success",
            user: {
                _id: user._id,
                email: user.email,
                name: user.name
            },
            token
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}

module.exports = {
    userRegisterController
};
