import StudentModel from "../model/studentModel.js";
import CollageModel from "../model/collageModel.js";
import sendOTPEmail from "../services/sendEmail.js";


const registerStudent = async (req, res) => {
    const {name, email, studentIdEmailDomain, yearOfStudy} = req.body;

    if (!name || !email || !studentIdEmailDomain || !yearOfStudy) {
        return res.status(400).json({
            success: false,
            message: 'Name, email and student ID email domain are required.'
        });
    }

    try {

        const existingStudent = await StudentModel.findOne({email});
        if (existingStudent && existingStudent.isVerified) {
            return res.status(400).json({
                success: false,
                message: 'A student with this email already exists.'
            });
        }


        // check if the email domain matches the collage's student ID email domain
        const collageData = await CollageModel.findOne({studentIdEmailDomain});
        if (!collageData) {
            return res.status(400).json({
                success: false,
                message: 'Invalid collage ID.'
            });
        }
        const emailDomain = email.split('@')[1];
        if (emailDomain !== collageData.studentIdEmailDomain) {
            return res.status(400).json({
                success: false,
                message: 'Email domain does not match the collage\'s student ID email domain.'
            });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // OTP valid for 5 minutes

        try {
            
            const result = await sendOTPEmail(email, otp);

            if(!result){
                return res.status(500).json({
                    success: false,
                    message: 'Failed to send OTP email. Please try again later.'
                });
            }

        } catch (error) {
            console.log('Error sending OTP email:', error);
             return res.status(500).json({
                success: false,
                message: 'Error sending OTP email. Please try again later.'
            });
            
        }

        if(existingStudent && !existingStudent.isVerified){
            existingStudent.name = name;
            existingStudent.yearOfStudy = yearOfStudy;
            existingStudent.collage = collageData._id;
            existingStudent.otp = otp;
            existingStudent.otpExpiry = otpExpiry;
            await existingStudent.save();
            return res.status(200).json({
                success: true,
                message: 'OTP sent to email. Please verify to complete registration.',
                student: existingStudent
            });
        }

        const newStudent = new StudentModel({name, email, yearOfStudy, collage: collageData._id, otp, otpExpiry});
        await newStudent.save();
        res.status(201).json({
            success: true,
            message: 'Student registered successfully.',
            student: newStudent
        });
        

    } catch (error) {
        console.error('Error registering student:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while registering the student.',
            error: error.message
        });
    }
}


const verifyOTP = async (req, res) => {
    const {email, otp} = req.body;

    if (!email || !otp) {
        return res.status(400).json({
            success: false,
            message: 'Email and OTP are required.'
        });
    }

    try {
        const student = await StudentModel.findOne({email});
        if (!student) {
            return res.status(400).json({
                success: false,
                message: 'No student found with this email.'
            });
        }
        if (student.otp !== otp) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP.'
            });
        }
        if (student.otpExpiry < new Date()) {
            return res.status(400).json({
                success: false,
                message: 'OTP has expired.'
            });
        }

        student.isVerified = true;
        student.otp = null;
        student.otpExpiry = null;
        await student.save();
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'An error occurred while verifying the OTP.'
        });
    }
}


export {registerStudent, verifyOTP};