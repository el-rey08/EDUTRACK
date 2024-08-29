const date = new Date()
const mongoose = require('mongoose')
const studentSchema = new mongoose.Schema({
 firstName:{
    type:String,set: (entry) => {
      const capitalize =
      entry.charAt(0).toUpperCase() + entry.slice(1).toLowerCase();
        return capitalize;},
    require:true,
    trim:true
 },
 surnName:{
    type:String,set: (entry) => {
      const capitalize =
      entry.charAt(0).toUpperCase() + entry.slice(1).toLowerCase();
        return capitalize;},
    require:true,
    trim:true
 },
 lastName:{
    type:String,set: (entry) => {
      const capitalize =
      entry.charAt(0).toUpperCase() + entry.slice(1).toLowerCase();
        return capitalize;},
    require:true,
    trim:true
 },
 email:{
   type:String,
   unique:true,
   trim:true
   },
 password:{
   type:String,
   require:true
 },
 address:{
    type:String,
    require:true
 },
 state:{
    type:String,
    require:true
 },
 age:{
   type:String,
 },
 datheOfBirth:{
   type:Number,
   require:true
 },
 gender:{
    type:String,
    require:true,
    enum:['male', 'female']
 },
 studentID:{
    type:Number,
    unique:true
 },
 class: {
  type: String,
  enum: [
      'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6',
      'JSS 1', 'JSS 2', 'JSS 3',
      'SS 1', 'SS 2', 'SS 3'
  ],
  required: true
},
 isVerified:{
   type:Boolean,
   default:false
 },
 school:{
  type:mongoose.Schema.Types.ObjectId,
  ref:"school"
 },
 studentProfile:{
  type:String
 }
},{timestamps:true})
const studentModel = mongoose.model('student', studentSchema)
module.exports = studentModel