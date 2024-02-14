require("dotenv").config();
const express = require('express');
const mongoose =  require('mongoose');
const session =  require('express-session');
const pasth = require('path');

const app = express();
const PORT = process.env.PORT || 4000;

//database connection
mongoose.connect(
  `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER}/${process.env.DB_DATABASE}`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  );

// mongoose.set('strictQuery', false);
// const connectDB = async ()=> {
//   try{
//     const conn = await mongoose.connect(process.env.MONGO_URI);
//     console.log(`MongoDB Conected: ${conn.connection.host}`)
//   } catch(error) {
//     console.log(`Error : ${error}`);
//     process.exit(1);
//   }
// }

const db = mongoose.connection;
db.on("error", (error) => console.log(error));
db.once("open", () =>console.log("Connected to the database"));

app.use(express.urlencoded({extended: false}));
app.use(express.json());

app.use(session({
    secret: "my secret key",
    saveUninitialized: true,
    resave: false
}));

app.use((req, res, next) => {
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
})

app.use(express.static('uploads'));

app.set("view engine", "ejs");

app.use("", require("./routes/routes"));

// app.get("/", (req, res) => {
//     res.send("Hello World");
// });



app.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}/signup`);
});