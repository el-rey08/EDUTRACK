const date = new Date()
const mongoose = require('mongoose')
const studentSchema = new mongoose.Schema({
 fullName:{
    type:String,set: (entry) => {
      const capitalize =
      entry.charAt(0).toUpperCase() + entry.slice(1).toLowerCase();
        return capitalize;},
    require:true,
    trim:true
 },
 
 email:{
   type:String,
   trim:true
   },
 address:{
    type:String,
    require:true
 },
 gender:{
    type:String,
    require:true,
    enum:['male', 'female']
 },
 studentID:{
    type:Number,
    required:true,
    unique:true
 },
 class: {
  type: String,
  enum: [
      'JSS 1', 'JSS 2', 'JSS 3',
      'SS 1', 'SS 2', 'SS 3'
  ],
  required: true
},
 isVerified:{
   type:Boolean,
   default:false
 },
 role: {
   type: String,
   default: 'student'
},
 school:{
  type:mongoose.Schema.Types.ObjectId,
  ref:"school"
 },
 studentProfile:{
  type:String,
  require:true
 }
})
const studentModel = mongoose.model('student', studentSchema)
module.exports = studentModel