require('dotenv').config()
require('./config/DBC')
const express = require('express')
const app = express()
const studentRouter = require('./router/studentRouter')
const teacherRouter = require('./router/teacherRouter')
const adminRouter = require('./router/adminRouter')
app.use(express.json())
app.use('/api/v1/student', studentRouter)
app.use('/api/v1/teacher', teacherRouter)
app.use('/api/v1/admin', adminRouter)
const port = process.env.port || 7095
app.listen(port,()=>{
    console.log(`app is running on port: ${port}`);
})
