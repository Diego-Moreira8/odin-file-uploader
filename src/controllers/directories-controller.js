const directoryService = require("../services/directory-service");
const hierarchizeDirectories = require("../utils/hierarchize-directories");

const getCreateDirectoryFormView = (errorsArray, value) => {
  return {
    template: "pages/directory-form",
    isEdit: false,
    title: "Criar pasta",
    errors: errorsArray || [],
    value: value || "",
  };
};

const getRenameDirectoryFormView = (directoryName, errorsArray, value) => {
  return {
    template: "pages/directory-form",
    isEdit: true,
    title: `Renomear pasta ${directoryName}`,
    errors: errorsArray || [],
    value: value || "",
  };
};

/** @type {import("express").RequestHandler} */
const getIndexPage = async (req, res, next) => {
  try {
    const rootDirectory = await directoryService.getUserRoot(req.user.id);
    res.redirect(`/pasta/${rootDirectory.id}`);
  } catch (err) {
    next(err);
  }
};

/** @type {import("express").RequestHandler} */
const getDirectoryPage = async (req, res, next) => {
  const allDirectories = hierarchizeDirectories(
    await directoryService.getUserDirectories(req.user.id)
  );

  res.render("layout", {
    template: "pages/file-explorer",
    directory: res.locals.directory,
    allDirectories,
  });
};

/** @type {import("express").RequestHandler} */
const getCreateDirectory = async (req, res, next) => {
  res.render("layout", getCreateDirectoryFormView());
};

/** @type {import("express").RequestHandler} */
const postCreateDirectory = async (req, res, next) => {
  try {
    const nameTaken = await directoryService.getByName(
      req.body.name,
      res.locals.directory.id
    );
    if (nameTaken) {
      res.locals.formErrors.push({ msg: "Já existe uma pasta com este nome" });
    }

    if (res.locals.formErrors.length > 0) {
      return res
        .status(400)
        .render(
          "layout",
          getCreateDirectoryFormView(res.locals.formErrors, req.body.name)
        );
    }

    const newDirectory = await directoryService.create(
      req.body.name,
      req.user.id,
      parseInt(req.params.id)
    );
    res.redirect(`/pasta/${newDirectory.id}`);
  } catch (err) {
    next(err);
  }
};

/** @type {import("express").RequestHandler} */
const getRenameDirectory = (req, res, next) => {
  const currDirName = res.locals.directory.name;
  res.render(
    "layout",
    getRenameDirectoryFormView(currDirName, [], currDirName)
  );
};

/** @type {import("express").RequestHandler} */
const postRenameDirectory = async (req, res, next) => {
  try {
    const nameNotChanged = res.locals.directory.name === req.body.name;
    if (nameNotChanged) {
      return res.redirect(`/pasta/${res.locals.directory.id}`);
    }

    const nameTaken = await directoryService.getByName(
      req.body.name,
      res.locals.directory.parentId
    );
    if (nameTaken) {
      res.locals.formErrors.push({ msg: "Já existe uma pasta com este nome" });
    }

    if (res.locals.formErrors.length > 0) {
      return res
        .status(400)
        .render(
          "layout",
          getRenameDirectoryFormView(
            res.locals.directory.name,
            res.locals.formErrors,
            req.body.name
          )
        );
    }

    await directoryService.renameDirectory(
      res.locals.directory.id,
      req.body.name
    );
    res.redirect(`/pasta/${res.locals.directory.id}`);
  } catch (err) {
    next(err);
  }
};

/** @type {import("express").RequestHandler} */
const promptDeleteDirectory = (req, res, next) => {
  res.render("layout", {
    template: "pages/prompt",
    title: "Apagar Diretório",
    promptTitle: "Apagar Diretório",
    promptText: `Tem certeza que deseja apagar o diretório "${res.locals.directory.name}" e todos os seus arquivos?`,
    action: `/pasta/${res.locals.directory.id}/apagar`,
  });
};

/** @type {import("express").RequestHandler} */
const postDeleteDirectory = async (req, res, next) => {
  try {
    const deleteConfirmed = req.body.response === "true";

    if (!deleteConfirmed) {
      return res.redirect(`/pasta/${res.locals.directory.id}`);
    }

    await directoryService.deleteDirectoryAndItsFiles(res.locals.directory.id);
    res.redirect(`/pasta/${res.locals.directory.parentId}`);
  } catch (err) {
    next(err);
  }
};

const directoriesController = {
  getIndexPage,
  getDirectoryPage,
  getCreateDirectory,
  postCreateDirectory,
  getRenameDirectory,
  postRenameDirectory,
  promptDeleteDirectory,
  postDeleteDirectory,
};
module.exports = directoriesController;
