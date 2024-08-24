require('dotenv').config()
const mongoose = require('mongoose')
const url = process.env.DATABASE_URL
mongoose.connect(url).then(()=>{
console.log('database is connected succesfully');

}).catch((error)=>{
    console.log(`connection to database failed`, error.message);
    
})