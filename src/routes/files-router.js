const { Router } = require("express");
const {
  getFileIfOwnedByUser,
  checkUser,
} = require("../middlewares/custom-middlewares");
const filesController = require("../controllers/files-controller");
const uploadToServer = require("../middlewares/multer");

const filesRouter = Router();

filesRouter.use(checkUser);

filesRouter.post("/enviar", uploadToServer, filesController.uploadFile);

filesRouter.get(
  "/:id/baixar",
  getFileIfOwnedByUser,
  filesController.downloadFile
);

filesRouter.get(
  "/:id/apagar",
  getFileIfOwnedByUser,
  filesController.promptDeleteFile
);

filesRouter.post(
  "/:id/apagar",
  getFileIfOwnedByUser,
  filesController.postDeleteFile
);

filesRouter.get("/:id", getFileIfOwnedByUser, filesController.getFileDetails);

module.exports = filesRouter;
