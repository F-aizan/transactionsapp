const express = require('express')
const body = require('express-body')
const cors = require('cors')
const connectDB  = require('./dbconn')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const app = express()
app.use(body)
app.use(cors())

// JWT Secret key
const JWT_SECRET = process.env.JWT_SECRET;

//get transactions
app.get('/transactions', async(req, res) => {
    try {
        const db = connectDB()
        const {authUser} = req.body
        const queryText = `SELECT * FROM "Transactions" where txn_username = $1`
        if(db) {
            const data = await db.query(queryText, [authUser])
            return res.json({"transactions": data.rows}).status(200)
        }
    } catch (error) {
        return res.json({"message": "Error occurred" +error}).status(500)
    } 
})

//post transactions
app.post('/transaction', async(req, res) => {
    try {
        const db = connectDB()
        const {name, amount, txn_username, date} = req.body
        console.log(req.body)
        if(db) {
          const queryText = `INSERT INTO "Transactions" (txn_name, txn_amount, txn_username, txn_date) VALUES ($1, $2, $3, $4)`
        const result = await db.query(queryText, [name, amount, txn_username, date])

            if(result.rowCount > 0) {
                console.log("inserted")
                return res.status(200).json({"message": "details inserted"})
            }else {
                console.log("not inserted")
                return res.status(500).json({"message": "There was an error inserting details"})
            }
            
        } else return res.status(500).json({"message":"Database connection failed"})
    } catch (error) {
        return res.status(500).json({"message": "Error occurred" +error})
    }
})

// LOGIN ENDPOINT
app.post("/login", async (req, res) => {
    try {
      const db = connectDB();
      const { email, password } = req.body;
  
      if (!email || !password) {
        return res.status(400).json({ message: "Some fields are empty" });
      }
  
      // Find user in DB
      const queryText = "SELECT * FROM users WHERE email = $1";
      const result = await db.query(queryText, [email]);
  
      if (result.rows.length === 0) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      const user = result.rows[0];
  
    // Compare password with hashed version
      const isPasswordMatch = await bcrypt.compare(password, user.password);
      if (!isPasswordMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
  
      // Generate JWT token
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          fullname: user.fullname,
        },
        JWT_SECRET,
        { expiresIn: "2h" } // token valid for 2 hours
      );
  
      return res.status(200).json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          fullname: user.fullname,
          email: user.email,
        },
      });
    } catch (error) {
      console.error("Login Error:", error);
      return res.status(500).json({ message: "Failed to login" });
    }
  });

//add users
app.post('/signup', async(req, res) => {
    try {
        const db = connectDB()
        const {fullname, email, password} = req.body
        const hashedpswd = bcrypt.hashSync(password, 10)
        let created_on = new Date().toDateString()
        if(fullname == "" || email == "" || password == ""){
            return res.json({"messge": "Some fields are empty"}).status(500)
        }
        const queryText = `
        INSERT INTO users (fullname, email, password, created_on)
        VALUES ($1, $2, $3, $4)`
        const result = await db.query(queryText, [fullname, email, hashedpswd, created_on])
        if(result.rowCount > 0) {
            console.log("user inserted")
            return res.json({"message": "user inserted"}).status(200)
        } else {
            console.log("failed to insert")
            return res.json({"message": "error inserting "}).status(500)
        }
    } catch (error) {
        return res.json({"message": "Error occurred" + error}).status(500)
    }
}) 

app.listen(3000, (err) => {
    if(err) console.log('Error occurred')
    console.log("listening on port 3000")
} )