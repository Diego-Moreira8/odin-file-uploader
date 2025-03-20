const { prisma } = require("../prisma-client/prisma-client");
const uploadToCloudinary = require("../storage/cloudinary");
const directoryService = require("./directory-service");

const create = async (
  userId,
  directoryId,
  fileName,
  nameOnStorage,
  size,
  mimeType,
  pathOnServer
) => {
  try {
    if (!(await directoryService.isDirectoryOfUser(directoryId, userId))) {
      throw new Error(
        `The user with ID ${userId} cannot manipulate the directory with ID ${directoryId}.`
      );
    }

    await uploadToCloudinary(userId, directoryId, pathOnServer);

    const newFile = await prisma.file.create({
      data: {
        fileName: fileName,
        nameOnStorage: nameOnStorage,
        size: size,
        mimeType: mimeType,
        ownerId: userId,
        directoryId: directoryId,
      },
    });

    return newFile;
  } catch (err) {
    console.error("Error at creating file:", err.message);
    throw err;
  }
};

const getById = async (fileId) => {
  try {
    const file = await prisma.file.findUnique({
      where: {
        id: fileId,
      },
      include: {
        owner: true,
      },
    });
    return file;
  } catch (err) {
    console.error("Error at retrieving file:", err.message);
    throw err;
  }
};

const rename = async (fileId, newName) => {
  try {
    const file = await prisma.file.update({
      where: {
        id: fileId,
      },
      data: {
        fileName: newName,
      },
    });
    return file;
  } catch (err) {
    console.error("Error at renaming file:", err.message);
    throw err;
  }
};

const renameSafe = async (fileId, newName) => {
  try {
    const preserveFileExtension = (fileName, newName) => {
      let result = fileName.split(".");
      result[0] = newName;
      result = result.join(".");
      return result;
    };

    const file = await getById(fileId);
    const updatedFile = await rename(
      fileId,
      preserveFileExtension(file.fileName, newName)
    );

    return updatedFile;
  } catch (err) {
    console.error("Error at safe renaming file:", err.message);
    throw err;
  }
};

const deleteFile = async (fileId) => {
  try {
    const deletedFile = await prisma.file.delete({ where: { id: fileId } });
    return deletedFile;
  } catch (err) {
    console.error("Error at deleting file:", err.message);
    throw err;
  }
};

module.exports = {
  create,
  getById,
  rename,
  renameSafe,
  deleteFile,
};
