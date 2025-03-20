const path = require("path");
const multer = require("multer");

const uploadSingleFile = multer({
  dest: path.join(__dirname, `../../multer-uploads/`),
  limits: { fileSize: 25000000 /*25 MB*/ },
}).single("file");

/** @type {import("express").RequestHandler} */
const uploadToServer = (req, res, next) => {
  uploadSingleFile(req, res, function (err) {
    if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
      return next({
        statusCode: 400,
        message: "Tamanho máximo de arquivo excedido.",
      });
    } else if (err) {
      console.error("Error at uploading file to server with Multer:", err);
      return next({
        message: "Houve um erro ao enviar o arquivo.",
      });
    }

    // Fix issue with accented characters
    req.file.originalname = Buffer.from(
      req.file.originalname,
      "latin1"
    ).toString("utf8");

    next();
  });
};

module.exports = uploadToServer;
