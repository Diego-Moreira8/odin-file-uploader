const userService = require("../services/user-service");

const getProfileViewData = (errorsArray, { name, username }, updateSuccess) => {
  return {
    template: "pages/user-profile-page",
    title: "Meu Perfil",
    errors: errorsArray.length > 0 ? errorsArray : [],
    formSuccessMessage: updateSuccess ? "Dados atualizados com sucesso!" : null,
    values: { name, username },
  };
};

const getDeleteAccountViewData = (errorsArray) => {
  return {
    template: "pages/delete-account-page",
    title: "Apagar Minha Conta",
    errors: errorsArray.length > 0 ? errorsArray : [],
  };
};

/** @type {import("express").RequestHandler} */
const getProfilePage = (req, res, next) => {
  const { name, username } = req.user;
  const updateSuccess = req.query?.update === "success";
  res.render(
    "layout",
    getProfileViewData([], { name, username }, updateSuccess)
  );
};

/** @type {import("express").RequestHandler} */
const postProfileUpdate = async (req, res, next) => {
  try {
    const { name, username, currentPassword, newPassword } = req.body;
    let errors = [];

    const usernameChange = username !== req.user.username;
    if (usernameChange) {
      const usernameTaken = await userService.getByUsername(username);
      if (usernameTaken) {
        errors.push({
          msg: `O nome de usuário ${req.body.username} já existe, escolha outro`,
        });
      }
    }

    const passwordChange = currentPassword || newPassword;
    if (passwordChange) {
      const correctCurrentPassword = await userService.verifyPassword(
        req.user.id,
        currentPassword
      );
      if (!correctCurrentPassword) {
        errors.push({ msg: "A senha atual está incorreta" });
      }
    }

    if (errors.length > 0) {
      return res
        .status(400)
        .render("layout", getProfileViewData(errors, req.body));
    }

    await userService.update(req.user.id, {
      newUsername: usernameChange ? username : null,
      newPassword: passwordChange ? newPassword : null,
      newName: name || null,
    });

    res.redirect("/minha-conta?update=success");
  } catch (error) {
    next(error);
  }
};

/** @type {import("express").RequestHandler} */
const getDeleteAccountPage = (req, res, next) => {
  res.render("layout", getDeleteAccountViewData([]));
};

/** @type {import("express").RequestHandler} */
const postProfileDelete = async (req, res, next) => {
  try {
    const passwordMatch = await userService.verifyPassword(
      req.user.id,
      req.body.password
    );

    if (!passwordMatch) {
      return res
        .status(400)
        .render(
          "layout",
          getDeleteAccountViewData([
            { msg: "Senha incorreta. Tente novamente" },
          ])
        );
    }

    await userService.deleteUserAndItsData(req.user.id);

    req.logout((error) => {
      if (error) throw error;
      res.redirect("/");
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfilePage,
  postProfileUpdate,
  getDeleteAccountPage,
  postProfileDelete,
};
