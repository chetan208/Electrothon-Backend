import {Schema, model} from 'mongoose';

const studentSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
      
    },
    collage: {
        type: Schema.Types.ObjectId,
        ref: 'Collage'
    },

    yearOfStudy: {
        type: String,
        required: true
    },

    isVerified: {
        type: Boolean,
        default: false
    },

    isProfileCompleted: {
        type: Boolean,
        default: false
    },

    otp: {
        type: String,
    },
    otpExpiry: {
        type: Date,
    },


});

const StudentModel = model('Student', studentSchema);

export default StudentModel;