// buat endpoint register yang endpointnya menerima username, password, dan name dari FE
// untuk password itu menggunakan bcrypt (hashing) untuk password
// cek apakah request sudah benar, misal apakah usernamenya terisi dan atau passwordnya terisi, jika tidak maka akan mengembalikan respon code (400) dengan pesan {"username dan atau password harus terisi"}
//  kalau berhasil, maka akan mengembalikan response dengan code 200 dan mengembalikan json berupa id, username, dan name

const express = require("express");
const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken");

const prisma = new PrismaClient();
const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { username, password, name } = req.body || {};

    // username dan/atau password harus terisi
    if (!username || !password) {
      return res.status(400).json({ message: "username dan atau password harus terisi" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { username, password: hashedPassword, name },
      select: { id: true, username: true, name: true },
    });

    return res.status(200).json(user);
  } catch (err) {

    if (err.code === "P2002") {
      return res.status(400).json({ message: "username sudah digunakan" });
    }
    console.error(err);
    return res.status(500).json({ message: "terjadi kesalahan pada server" });
  }
});

//  POST /login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body || {};

    // username dan/atau password harus terisi

    if (!username && !password ) {
      return res.status(400).json({ message: "Register Gagal" });
    }
    
    if (!username ) {
      return res.status(400).json({ message: "username harus terisi" });
    }

    if (!password ) {
      return res.status(400).json({ message: "password harus terisi" });
    }

    

    

    // cari user berdasarkan username
    const user = await prisma.user.findUnique({ where: { username } });

    // pesan sengaja sama untuk username salah dan password salah
    if (!user) {
      return res.status(401).json({ message: "username atau password salah" });
    }

    // bandingkan password input dengan hash di database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "username atau password salah" });
    }

    // buat token JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      id: user.id,
      username: user.username,
      name: user.name,
      token,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "terjadi kesalahan pada server" });
  }
});

module.exports = router;