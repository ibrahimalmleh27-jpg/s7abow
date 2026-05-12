const fileUpload = require("express-fileupload");
const FormData = require("form-data");
const fetch = require("node-fetch");

module.exports = function (app) {

    // تفعيل رفع الملفات
    app.use(fileUpload());

    // روت GET عشان الواجهة ما تعملش 404
    app.get("/upload/shadow", (req, res) => {
        res.json({
            status: true,
            message: "Shadow Upload API is working. Use POST to upload files.",
            usage: {
                method: "POST",
                endpoint: "/upload/shadow",
                formData: "file: <your file>"
            }
        });
    });

    // دالة رفع الملف باستخدام fetch
    async function uploadToShadow(fileBuffer, fileName) {
        try {
            const form = new FormData();
            form.append("file", fileBuffer, fileName);

            const response = await fetch(
                "https://s7adow-production.up.railway.app/api/upload",
                {
                    method: "POST",
                    body: form
                }
            );

            const data = await response.json();
            return data;

        } catch (error) {
            throw error;
        }
    }

    // روت POST لرفع الملفات
    app.post("/upload/shadow", async (req, res) => {
        try {
            if (!req.files || !req.files.file) {
                return res.json({
                    status: false,
                    creator: "IBRAHIM",
                    message: "No file uploaded"
                });
            }

            const file = req.files.file;

            // رفع الملف إلى API الخارجي
            const result = await uploadToShadow(file.data, file.name);

            res.json({
                status: true,
                creator: "IBRAHIM",
                result
            });

        } catch (error) {
            res.status(500).json({
                status: false,
                creator: "IBRAHIM",
                error: error.message
            });
        }
    });
};
