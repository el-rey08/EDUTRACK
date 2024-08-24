const date = new Date()
const mongoose = require('mongoose')
const studentSchema = mongoose.Schema({
 firstName:{
    type:String,
    require:true,
    trim:true
 },
 surnName:{
    type:String,
    require:true,
    trim:true
 },
 lastName:{
    type:String,
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
 isVerified:{
   type:Boolean,
   default:false
 }
})
const studentModel = mongoose.model('student', studentSchema)
module.exports = studentModel