const express = require("express");
const multer = require("multer");
const cors = require("cors");
const docxToPDF = require("docx-pdf");
const path = require("path");
const fs = require("fs");

const app = express();
const port = 3000;

app.use(cors());

// Ensure the directories exist
const uploadDir = path.join(__dirname, "uploads");
const outputDir = path.join(__dirname, "files");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

// Setting up the file storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads");
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});

const upload = multer({ storage: storage });


app.get("/", (req, res) => {
    res.send("Welcome to the DOCX to PDF conversion service. Use the /convertFile endpoint to upload and convert your files.");
});

app.post("/convertFile", upload.single("file"), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: "No file uploaded",
            });
        }

        // Define output file path
        const outputPath = path.join(outputDir, `${req.file.originalname}.pdf`);

        docxToPDF(req.file.path, outputPath, (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    message: "Error converting docx to pdf",
                });
            }

            res.download(outputPath, (err) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({
                        message: "Error downloading file",
                    });
                }
                console.log("File downloaded");

                // Optionally, you can delete the files after download
                fs.unlink(req.file.path, () => {});
                fs.unlink(outputPath, () => {});
            });
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error",
        });
    }
});

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});



