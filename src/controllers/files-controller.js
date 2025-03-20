const fs = require("fs/promises");
const path = require("path");
const fileService = require("../services/file-service");

/** @type {import("express").RequestHandler} */
const getFileDetails = (req, res, next) => {
  res.render("layout", {
    template: "pages/file-details",
    title: "Detalhes do Arquivo",
    file: res.locals.file,
  });
};

/** @type {import("express").RequestHandler} */
const uploadFile = async (req, res, next) => {
  try {
    const reloadDirectory = () =>
      res.redirect(`/pasta/${req.body.directoryId}`);

    if (!req.file) {
      return reloadDirectory();
    }

    await fileService.create(
      req.user.id,
      parseInt(req.body.directoryId),
      req.file.originalname,
      req.file.filename,
      req.file.size,
      req.file.mimetype,
      req.file.path
    );

    return reloadDirectory();
  } catch (err) {
    next(err);
  }
};

/** @type {import("express").RequestHandler} */
const downloadFile = async (req, res, next) => {
  try {
    const { nameOnStorage, fileName } = res.locals.file;
    res.download(
      path.join(__dirname, `../../multer-uploads/${nameOnStorage}`),
      fileName
    );
  } catch (err) {
    return next(err);
  }
};

/** @type {import("express").RequestHandler} */
const promptDeleteFile = (req, res, next) => {
  res.render("layout", {
    template: "pages/prompt",
    title: "Apagar Arquivo",
    promptTitle: "Apagar Arquivo",
    promptText: `Tem certeza que deseja apagar o arquivo "${res.locals.file.fileName}"?`,
    action: `/arquivo/${res.locals.file.id}/apagar`,
  });
};

/** @type {import("express").RequestHandler} */
const postDeleteFile = async (req, res, next) => {
  try {
    const { id, nameOnStorage, directoryId } = res.locals.file;
    const deleteConfirmed = req.body.response === "true";

    if (!deleteConfirmed) {
      return res.redirect(`/pasta/${directoryId}`);
    }

    await fs.unlink(
      path.join(__dirname, `../../multer-uploads/${nameOnStorage}`)
    );
    await fileService.deleteFile(id);
    res.redirect(`/pasta/${directoryId}`);
  } catch (err) {
    return next(err);
  }
};

const filesController = {
  getFileDetails,
  uploadFile,
  downloadFile,
  promptDeleteFile,
  postDeleteFile,
};

module.exports = filesController;
