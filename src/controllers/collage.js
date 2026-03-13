
import CollageModel from "../model/collageModel.js";

const addCollage = async (req, res) => {
    const collages = req.body; // frontend se array aayega

    if (!Array.isArray(collages) || collages.length === 0) {
        return res.status(400).json({
            success: false,
            message: "Collages array is required."
        });
    }

    try {

        // validation
        for (let collage of collages) {
            if (!collage.name || !collage.studentIdEmailDomain || !collage.type || !collage.state) {
                return res.status(400).json({
                    success: false,
                    message: "Each collage must have name, studentIdEmailDomain, type and state."
                });
            }
        }

        const savedCollages = await CollageModel.insertMany(collages);

        res.status(201).json({
            success: true,
            message: "Collages added successfully.",
            total: savedCollages.length,
            collages: savedCollages
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error adding collages.",
            error: error.message
        });
    }
};


const getCollages = async (req, res) => {
    try {
        const collages = await CollageModel.find();
        res.status(200).json({
            success: true,
            collages
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching collages.',
            error: error.message
        });
    }
}

export {addCollage, getCollages};