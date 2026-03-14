import cloudinary from "../config/cloudinary.js";
import StudentModel from "../model/studentModel.js";



const completeStudentProfile = async (req, res) => {
  try {

    const { studentId } = req.params;

    const {
      headline,
      bio,
      branch,
      cgpa,
      currentYear,
      graduationYear,
      rollNumber,
      skills,
      interests,
      openTo,
      github,
      linkedin,
      portfolio,
      twitter,
      instagram
    } = req.body;

    // Find student
    const student = await StudentModel.findById(studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    let avatarUrl = student.avatar;
    let avatarPublicId = null;

    // PHOTO UPLOAD
    if (req.file) {

      // TODO: Upload image to Cloudinary
      // Example:
      // const uploadedImage = await cloudinary.uploader.upload(req.file.path)
      // avatarUrl = uploadedImage.secure_url

     try {

        console.log("imageUpload stared", req.file)
        
      const uploadedImage = await cloudinary.uploader.upload(req.file.path, {
        folder: "electrothon/avatars",
      });       

      avatarUrl = uploadedImage.secure_url; // replace after uploading
      avatarPublicId = uploadedImage.public_id; // store public_id for future deletions   
        
     } catch (error) {
        console.log("error while uploading")
        return res.status(400).json({
            success:false,
            error:error.message
        })
        
     }
    }

    // Update profile fields
    student.avatar = avatarUrl;
    student.avatarPublicId = avatarPublicId; // store public_id for future deletions
    student.headline = headline;
    student.bio = bio;

    student.branch = branch;
    student.cgpa = cgpa;
    student.currentYear = currentYear;
    student.graduationYear = graduationYear;
    student.rollNumber = rollNumber;

    student.skills = skills;
    student.interests = interests;
    student.openTo = openTo;

    student.github = github;
    student.linkedin = linkedin;
    student.portfolio = portfolio;
    student.twitter = twitter;
    student.instagram = instagram;

    student.isProfileCompleted = true;

    await student.save();

    res.status(200).json({
      success: true,
      message: "Profile completed successfully",
      data: student
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }
};

const getStudentDetails = async (req, res) => {
    const {email}= req.student


    console.log("fetching details for email:", email);

    try {
        const student = await StudentModel.findOne({ email })
        .populate('collage', 'name state type')
        .select('-otp -otpExpiry -__v -password'); // Exclude sensitive fields like OTP, password, and version key 

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found.'
            });
        }
        res.status(200).json({
            success: true,
            student
        });
        
    } catch (error) {
        console.error('Error fetching student details:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while fetching student details.',
            error: error.message
        });
        
    }
}


export { completeStudentProfile, getStudentDetails };   

