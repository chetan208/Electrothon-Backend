import {model, Schema} from 'mongoose';

const postSchema = new Schema({
    title:{
        type:String,
    },
    content:{
        type:String,
    },
    images:[
        {
            public_id: String,
            url: String
        }
    ],
    tags:[String],
    createdBy:{
        type:Schema.Types.ObjectId,
        ref:'Student'
    }
},
{timestamps:true}

)

const PostModel = model('Post', postSchema);

export default PostModel;