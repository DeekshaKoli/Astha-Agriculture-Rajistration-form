const cloudinary = require("./cloudinary");

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const ExcelJS = require("exceljs");

const streamifier = require("streamifier");

const app = express();

app.use(cors());
app.use(express.json());

/* ---------------- DATABASE ---------------- */
mongoose.connect(
"mongodb://Deeksha:Deeksha123@ac-8knbqn9-shard-00-00.hsywxd3.mongodb.net:27017,ac-8knbqn9-shard-00-01.hsywxd3.mongodb.net:27017,ac-8knbqn9-shard-00-02.hsywxd3.mongodb.net:27017/studentDB?ssl=true&replicaSet=atlas-52fikm-shard-0&authSource=admin&appName=Cluster0"
).then(() => console.log("DB Connected"));

/* ---------------- MULTER (Vercel SAFE) ---------------- */
const upload = multer({
  storage: multer.memoryStorage()
});

/* ---------------- SCHEMA ---------------- */
const studentSchema = new mongoose.Schema({
    name: String,
    father: String,
    address: String,
    dob: String,
    category: String,
    mobile: String,
    whatsapp: String,
    email: String,
    occupation: String,
    fees: String,
    course: [String],
    photo: String,

    tenthBoard: String,
    tenthYear: String,
    tenthMarks: String,
    twelfthBoard: String,
    twelfthYear: String,
    twelfthMarks: String,

    aadhaar: Boolean,
    photoDoc: Boolean,
    marksheet: Boolean,
    tc: Boolean
});

const Student = mongoose.model("Student", studentSchema);

/* ---------------- LOGIN ---------------- */
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (username === "Anand" && password === "Anand@8815") {
        const token = jwt.sign({ user: "admin" }, "secretkey");
        res.json({ token });
    } else {
        res.status(401).json({ message: "Invalid" });
    }
});

/* ---------------- REGISTER (FIXED) ---------------- */
app.post("/register", upload.single("photo"), async (req, res) => {

    try {

        let imageUrl = "";

        // Upload image to Cloudinary
        if (req.file) {

            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: "students" },
                async (error, result) => {
                    if (error) {
                        return res.status(500).json({ error: error.message });
                    }

                    imageUrl = result.secure_url;

                    await saveStudent();
                }
            );

            streamifier.createReadStream(req.file.buffer).pipe(uploadStream);

        } else {
            await saveStudent();
        }

        async function saveStudent() {

            let courses = [];

            try {
                if (req.body.course) {
                    courses = JSON.parse(req.body.course);
                }
            } catch (e) {
                courses = [];
            }

            const student = new Student({
                name: req.body.name || "",
                father: req.body.father || "",
                address: req.body.address || "",
                dob: req.body.dob || "",
                category: req.body.category || "",
                mobile: req.body.mobile || "",
                whatsapp: req.body.whatsapp || "",
                email: req.body.email || "",
                occupation: req.body.occupation || "",
                fees: req.body.fees || "",
                course: courses,

                tenthBoard: req.body.tenthBoard || "",
                tenthYear: req.body.tenthYear || "",
                tenthMarks: req.body.tenthMarks || "",

                twelfthBoard: req.body.twelfthBoard || "",
                twelfthYear: req.body.twelfthYear || "",
                twelfthMarks: req.body.twelfthMarks || "",

                aadhaar: req.body.aadhaar === "true",
                photoDoc: req.body.photoDoc === "true",
                marksheet: req.body.marksheet === "true",
                tc: req.body.tc === "true",

                photo: imageUrl
            });

            await student.save();

            res.json({ message: "Saved Successfully" });
        }

    } catch (err) {
        console.log("ERROR:", err);
        res.status(500).json({ error: err.message });
    }
});

/* ---------------- STUDENTS ---------------- */
app.get("/students", async (req, res) => {

    const token = req.headers.authorization;

    if (!token) return res.status(403).send("Unauthorized");

    try {
        jwt.verify(token, "secretkey");
        const data = await Student.find();
        res.json(data);
    } catch {
        res.status(401).send("Invalid Token");
    }
});

/* ---------------- EXCEL EXPORT ---------------- */
app.get("/export", async (req, res) => {

    const students = await Student.find();

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Students");

    sheet.columns = [
        { header: "Name", key: "name" },
        { header: "Mobile", key: "mobile" },
        { header: "Course", key: "course" },
        { header: "Fees", key: "fees" }
    ];

    students.forEach(s => {
        sheet.addRow({
            name: s.name,
            mobile: s.mobile,
            course: s.course.join(", "),
            fees: s.fees
        });
    });

    res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
        "Content-Disposition",
        "attachment; filename=students.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
});

/* ---------------- EXPORT FOR VERCEL ---------------- */
module.exports = app;