const date = new Date()
const mongoose = require('mongoose')
const schoolSchema = new mongoose.Schema({
schoolName:{
    type:String,
    require:true,
    trim:true
},
schoolType:{
    type:String,
    require:true,
    enum:['secondary', 'high-school', 'collage']
},
schoolAddress:{
    type:String,
    require:true,
},
schoolPhone:{
    type:String,
    require:true
},
schoolEmail:{
    type:String,
    require:true,
    unique:true
},
schoolID:{
    type:Number,
    unique:true
},
schoolPassword:{
    type:String,
    require:true
},
students:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:'student'
}],
teachers:[{
    type:mongoose.Schema.Types.ObjectId,
    ref: 'teacher'
}],
isVerified:{
    type:Boolean,
    default:false
  }

},{timestamps:true})
const schoolModel = mongoose.model('school', schoolSchema)
module.exports = schoolModel