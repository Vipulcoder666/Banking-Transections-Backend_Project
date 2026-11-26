const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: [true, "Email is required"],
            trim: true, // Removes extra spaces
            lowercase: true, // Saves email in small letters
            match: [
                /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/,
                "Invalid email address"
            ],
            unique: [true, "Email already exists"] // No duplicate emails
        },

        name: {
            type: String,
            required: [true, "Name is required"]
        },

        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters"],
            select: false // Hide password in find queries
        }
    },
    {
        timestamps: true // Auto adds createdAt and updatedAt
    }
);

// Hash password before saving to database
userSchema.pre("save", async function () {
    // If password is not changed, skip hashing
    if (!this.isModified("password")) {
        return ;
    }

    // else Hash the password
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;
    return ;
});

// Compare password during login
userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

const userModel = mongoose.model("user", userSchema);

module.exports = userModel;
