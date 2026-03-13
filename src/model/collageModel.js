import {model, Schema} from 'mongoose';

const collageSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    studentIdEmailDomain: {
        type: String,
        required: true
    },
    type: {
        type: String,
    },
    state:{
        type: String,
    }

});

const CollageModel = model('Collage', collageSchema);

export default CollageModel;