require("dotenv").config();
const express = require("express");
const authRouter = require("./routes/auth");

const app = express();


// baca body JSON dari request
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API berjalan");
});

app.get("/Profil", (req, res) => {
  res.send("Ini Halaman Profil");
});


// pasang route dari auth.js (jadi: POST /register)
app.use(authRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});