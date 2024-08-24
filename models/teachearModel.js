const { default: mongoose } = require('mongoose')
const mongoose= require('mongoose')
const teacherSchema = mongoose.Schema({
    firstName:{
        type:String,
        requir:true,
        trim:true
     },
     surnName:{
        type:String,
        requir:true,
        trim:true
     },
     lastName:{
        type:String,
        requir:true,
        trim:true
     },
     address:{
        type:String,
        required:true
     },
     state:{
        type:String,
        require:true
     },
     LGA:{
        type:String,
        require:true,
     },
     gender:{
        type:String,
        require:true,
        enum:['male', 'female']
     },
     maritalStatus:{
        type:String,
        require:true,
        enum:['married', 'single', 'divorce', 'widow']
     },
     teacherID:{
      type:Number,
      unique:true
     }
     
})
const teacherModel = mongoose.model('teacher', teacherSchema)
module.exports = teacherModel