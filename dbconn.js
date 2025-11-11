const pkg = require('pg')
const dotenv = require('dotenv')


dotenv.config()

const {Pool} = pkg


const connectDB = () => {
    const pool = new Pool({
        connectionString: process.env.DBURL,
        ssl: {
            rejectUnauthorized: false
        } 
    })
    pool.on('connect', () => {
        console.log("db connected")
    }) 
    pool.on('error', (err) => {
        console.log("Error connecting to db" + err)
    })

    return pool
}

  

module.exports = connectDB