const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    email:{
        type:String,
        required: [true, "Email is required for creating user"],
        trim: true,
        lowercase: true,
        match:[/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/, "Invalid e,ail address"
        ],
        unique: [true,"Email already exits."]
    },

    name:{
        type: String,
        required: [true, "Name is required for creating an account.."]
    },

    password: {
        type: String,
        required: [true, "Password is required.."],
        minlenth: [6, "Password should contain more than 6 charecters"],
        select: false
    },

    timestamps: true
})

userSchema.pre("save", async function (next) {
    if(!this.isModified("password")){
        return next()
    }

    const hash = await bcrypt.hash(this.password, 10)
    this.password = hash
    return next()
})

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password)
}

const userModel = mongoose.model("user",userSchema)

module.exports = userModel