const userProfileController = require("../controllers/user-profile-controller");
const {
  validateUpdateProfileForm,
} = require("../middlewares/express-validator");

const { Router } = require("express");

const userProfileRouter = Router();

userProfileRouter.get("/", userProfileController.getProfilePage);

userProfileRouter.post(
  "/",
  validateUpdateProfileForm,
  userProfileController.postProfileUpdate
);

userProfileRouter.get("/apagar", userProfileController.getDeleteAccountPage);
userProfileRouter.post("/apagar", userProfileController.postProfileDelete);

module.exports = userProfileRouter;
