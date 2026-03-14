import jwt from 'jsonwebtoken';
import StudentModel from '../model/studentModel.js'; 

const checkAuthMiddelware = async (req, res, next) => {


    const token = req?.cookies['token'];
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "No token provided",
        });
    }

    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const student = await StudentModel.findById(decoded.id).select("-password");
        if (!student) {
            return res.status(401).json({
                success: false,
                message: "Invalid token - student not found",
            });
        }


        req.student=student;

        next();
        
    } catch (error) {
        console.error("Error verifying token:", error);
        res.status(401).json({
            success: false,
            message: "Invalid token",
            error: error.message,
        });
        
    }
}

export {checkAuthMiddelware};