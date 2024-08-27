const mongoose= require('mongoose')
const teacherSchema = new mongoose.Schema({
    firstName:{
        type:String,set: (entry) => {
         const capitalize =
         entry.charAt(0).toUpperCase() + entry.slice(1).toLowerCase();
           return capitalize;},
        requir:true,
        trim:true
     },
     surnName:{
        type:String,set: (entry) => {
         const capitalize =
         entry.charAt(0).toUpperCase() + entry.slice(1).toLowerCase();
           return capitalize;},
        requir:true,
        trim:true
     },
     lastName:{
        type:String,set: (entry) => {
         const capitalize =
         entry.charAt(0).toUpperCase() + entry.slice(1).toLowerCase();
           return capitalize;},
        requir:true,
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
        required:true
     },
     state:{
        type:String,
        require:true
     },
     gender:{
        type:String,
        require:true,
        enum:['male', 'female']
     },
     phoneNumber:{
      type:String,
      require:true
     },
    maritalStatus :{
        type:String,
        require:true,
        enum:['married', 'single', 'divorce', 'widow']
     },
     teacherID:{
      type:Number,
      unique:true
     },
     student:{
      type:mongoose.Schema.Types.ObjectId,
      ref: 'student'
     },
     isVerified:{
      type:Boolean,
      default:false
    },
    school:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"school"
     }
     
},{timestamps:true})
const teacherModel = mongoose.model('teacher', teacherSchema)
module.exports = teacherModel