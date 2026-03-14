import cloudinary from "../config/cloudinary.js";
import PostModel from "../model/postModel.js";
import StudentModel from "../model/studentModel.js";


const addPost = async (req, res) => {

    if (!req.student) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized - student not found in request",
        });
    }

    if (!req.files || req.files.length === 0) {
    return res.status(400).json({
        success: false,
        message: "No images uploaded"
    });
}

    try {

        const { title, content, images, tags } = req.body;

        const studentId = req.student._id;

        const uploadedImages = [];

        try {
            for (const file of req.files) {
                const result = await cloudinary.uploader.upload(file.path, {
                    folder: "electrothon/posts",
                });

                uploadedImages.push({
                    public_id: result.public_id,
                    url: result.secure_url,
                });
            }


        } catch (error) {
         
            console.error("Error uploading images to Cloudinary:", error);
            return res.status(500).json({
                success: false,
                message: "Error uploading images",
                error: error.message,
            });
         }
        
        const newPost = new PostModel({
            title,
            content,
            images: uploadedImages,
            tags,
            createdBy: studentId
        });

        await newPost.save();

        res.json({
            success: true,
            message: "Post added successfully",
            post: newPost
        });

    } catch (error) {
        console.log("error in addPost controller", error);

        res.json({
            success: false,
            message: "Error in adding post",
            error: error.message
        })

    }
}


const getFeed = async (req, res) => {
  try {

    const userId = req.student._id;

    const user = await StudentModel.findById(userId);

    const interests = user.interests || [];
    const skills = user.skills || [];

    const posts = await PostModel.find()
      .populate("createdBy", "name avatar branch headline")
      .lean();

    const personalizedPosts = posts.map(post => {

      let score = 0;

      // interest match
      if(post.tags?.some(tag => interests.includes(tag))){
        score += 5;
      }

      // skill match
      if(post.tags?.some(tag => skills.includes(tag))){
        score += 4;
      }

      // same branch
      if(post.createdBy?.branch === user.branch){
        score += 3;
      }

      // recent post bonus
      const hoursAgo = (Date.now() - new Date(post.createdAt)) / (1000 * 60 * 60);
      if(hoursAgo < 24){
        score += 2;
      }

      return {
        ...post,
        score
      }

    });

    personalizedPosts.sort((a,b)=> b.score - a.score);

    res.status(200).json({
      success:true,
      posts:personalizedPosts
    });

  } catch (error) {

    console.error("Error in getFeed controller:", error);

    res.status(500).json({
      success:false,
      message:"Feed error"
    });

  }
};


export { addPost ,getFeed };
