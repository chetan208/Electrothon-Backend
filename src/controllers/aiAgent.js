import axios from 'axios';
import StudentModel from '../model/studentModel.js';   

const opportunityRecomendation = async (req, res) => {

    const { email } = req.query;
    if (!email) {
        return res.status(400).json({
            success: false,
            message: "Email query parameter is required"
        });
    }

    try {

        const student = await StudentModel.findOne({ email })
        .populate('collage', 'name')
        .select('-password -otp -otpExpiry -__v'); // Exclude sensitive fields

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        const response = await axios.post('https://chetan-nith.app.n8n.cloud/webhook/student-agent', {
            student
        })

        const responseData = response.data;

        res.status(200).json({
            success: true,
            data: responseData
        });

        
        
    } catch (error) {
            console.error('Error fetching opportunity recommendations:', error);
            return res.status(500).json({
                success: false,
                message: 'An error occurred while fetching opportunity recommendations.',
                error: error.message
            });
        
    }
}

export { opportunityRecomendation };