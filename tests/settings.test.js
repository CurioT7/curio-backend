const { signUp } = require("../controller/Auth/userController");
const User = require("../models/userModel");
const UserPreferences = require("../models/userPreferencesModel");
const Subreddit = require("../models/subredditModel");
const block = require("../models/blockModel");
const { userExist } = require("../controller/Auth/userController");
const { appLogin } = require("../controller/Auth/appUserController");
const { getMe, getUserPreferences, deleteAccount } = require("../controller/identity/identityController");

describe(" user get settings", () => {
  // Returns user information when user exists and is authenticated
  it("should return user information when user exists and is authenticated", async () => {
    const req = { user: { userId: "123" } };
    const res = { json: jest.fn() };

    const userExists = {
      _id: "123",
      username: "testUser",
      gender: "male",
      language: "English",
      email: "test@example.com",
      isVerified: true,
      createdPassword: true,
      googleId: "google123",
    };

    User.findOne = jest.fn().mockResolvedValue(userExists);

    await getMe(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ _id: "123" });
    expect(res.json).toHaveBeenCalledWith({
      username: "testUser",
      gender: "male",
      language: "English",
      email: "test@example.com",
      isVerified: true,
      createdPassword: true,
      connectedToGoogle: true,
    });
  });
  // Returns 404 error when user does not exist
  it("should return 404 error when user does not exist", async () => {
    const req = { user: { userId: "123" } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    User.findOne = jest.fn().mockResolvedValue(null);

    await getMe(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ _id: "123" });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  // Returns default values for gender, language, and email when they are not provided
  it("should return default values for gender, language, and email when they are not provided", async () => {
    const req = { user: { userId: "123" } };
    const res = { json: jest.fn() };

    const userExists = {
      _id: "123",
      username: "testUser",
      isVerified: true,
      createdPassword: true,
      googleId: "google123",
    };

    User.findOne = jest.fn().mockResolvedValue(userExists);

    await getMe(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ _id: "123" });
    expect(res.json).toHaveBeenCalledWith({
      username: "testUser",
      gender: "N/A",
      language: "N/A",
      email: "N/A",
      isVerified: true,
      createdPassword: true,
      connectedToGoogle: true,
    });
  });

  // Returns 500 error when an error occurs during fetching user information
  it("should return a 500 error when an error occurs during fetching user information", async () => {
    const req = { user: { userId: "123" } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    User.findOne = jest.fn().mockRejectedValue(new Error("Database error"));

    await getMe(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ _id: "123" });
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Database error",
    });
  });

  // Returns 500 if an error occurs
  it("should return 500 if an error occurs", async () => {
    const req = {
      user: {
        userId: "validUserId",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const findOneMock = jest
      .spyOn(User, "findOne")
      .mockRejectedValueOnce(new Error("Database error"));

    await getUserPreferences(req, res);

    expect(findOneMock).toHaveBeenCalledWith({ _id: "validUserId" });
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
  });
  // Returns 404 if user is not found
  it("should return 404 when user is not found", async () => {
    const req = {
      user: {
        userId: "invalidUserId",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const findOneMock = jest.spyOn(User, "findOne").mockResolvedValueOnce(null);

    await getUserPreferences(req, res);

    expect(findOneMock).toHaveBeenCalledWith({ _id: "invalidUserId" });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });
});

describe("delete account", () => {
  // Verify if the user is authorized to delete the account
  it("should return 401 if the token is invalid or expired", async () => {
    const req = {
      headers: {
        authorization: "Bearer invalidToken",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    await deleteAccount(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
  });
});
