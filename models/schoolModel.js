const date = new Date()
const mongoose = require('mongoose')
const adminSchema = mongoose.Schema({
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
password:{
    type:String,
    require:true
},
})
const adminModel = mongoose.model('school', adminSchema)
module.exports = adminModel