const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const jwt = require("jsonwebtoken");
const ExcelJS = require("exceljs");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

/* ---------------- DATABASE ---------------- */
mongoose.connect(
"mongodb://Deeksha:Deeksha123@ac-8knbqn9-shard-00-00.hsywxd3.mongodb.net:27017,ac-8knbqn9-shard-00-01.hsywxd3.mongodb.net:27017,ac-8knbqn9-shard-00-02.hsywxd3.mongodb.net:27017/studentDB?ssl=true&replicaSet=atlas-52fikm-shard-0&authSource=admin&appName=Cluster0"
).then(() => console.log("DB Connected"));

/* ---------------- FILE UPLOAD ---------------- */
const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

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
    photo: String
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

/* ---------------- REGISTER ---------------- */
app.post("/register", upload.single("photo"), async (req, res) => {

    try {

        console.log("BODY:", req.body);
        console.log("FILE:", req.file);

        // safe course parsing
        let courses = [];
        try {
            if (req.body.course) {
                courses = JSON.parse(req.body.course);
            }
        } catch (e) {
            console.log("Course parse error:", e.message);
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

            photo: req.file ? req.file.filename : ""
        });

        await student.save();

        console.log("Student saved successfully");

        return res.json({
            message: "Saved Successfully"
        });

    } catch (err) {
        console.log("🔥 REGISTER ERROR:", err);

        return res.status(500).json({
            message: "Server Error",
            error: err.message
        });
    }
});
/* ---------------- STUDENTS (ADMIN) ---------------- */
app.get("/students", async (req, res) => {

    const token = req.headers.authorization;

    if (!token) {
        return res.status(403).send("Unauthorized");
    }

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

/* ---------------- SERVER ---------------- */
app.listen(5000, () => console.log("Server running on 5000"));