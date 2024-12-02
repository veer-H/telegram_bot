import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
    tgId:{
        type: String,
        required: true,
        unique: true
    },
    firstName:{
        type: String,
        required: true
    },
    lastName:{
        type: String,
        required: true
    },
    isbot: {
        type: Boolean,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    subcribe: {
        type: Boolean,
        required: true,
        default: false
    },
    city:{
        type: String,
        required: true
    }
   

})

export default mongoose.model('User', userSchema)