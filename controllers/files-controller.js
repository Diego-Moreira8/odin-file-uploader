const path = require("path");
const { unlink } = require("node:fs");
const fileService = require("../services/file-service");

const checkFilePermissions = (fileData, userId) => {
  if (!fileData) {
    throw {
      statusCode: 400,
      message: "Não existe um arquivo com o ID fornecido.",
    };
  }
  if (fileData.userId !== userId) {
    throw {
      statusCode: 403,
      message: "Você não tem autorização para manipular esse arquivo.",
    };
  }
};

const validadeId = (id) => {
  const integerId = parseInt(id);
  if (isNaN(integerId)) {
    throw {
      statusCode: 400,
      message: "O ID fornecido precisa ser um número.",
    };
  }
  return integerId;
};

/** @type {import("express").RequestHandler} */
const uploadFile = async (req, res, next) => {
  if (!req.file) {
    // No file sent
    return res.redirect("/");
  }
  await fileService.create(req.user.id, req.file);
  res.redirect("/");
};

/** @type {import("express").RequestHandler} */
const downloadFile = async (req, res, next) => {
  try {
    const id = validadeId(req.params.fileId);
    const file = await fileService.getFile(id);
    checkFilePermissions(file, req.user.id);
    res.download(
      path.join(__dirname, `../uploads/${file.nameOnStorage}`),
      file.fileName
    );
  } catch (err) {
    return next(err);
  }
};

/** @type {import("express").RequestHandler} */
const deleteFile = async (req, res, next) => {
  try {
    const id = validadeId(req.params.fileId);
    const file = await fileService.getFile(id);
    checkFilePermissions(file, req.user.id);
    const deletedFile = await fileService.deleteFile(id);

    // Delete from uploads directory
    unlink(
      path.join(__dirname, `../uploads/${deletedFile.nameOnStorage}`),
      (err) => {
        if (err) throw err;
      }
    );

    res.redirect("/");
  } catch (err) {
    return next(err);
  }
};

module.exports = { uploadFile, downloadFile, deleteFile };
