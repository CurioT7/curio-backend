const { signUp } = require("../controller/Auth/userController");
const User = require("../models/userModel");
const { userExist } = require("../controller/Auth/userController");
const { appLogin } = require("../controller/Auth/appUserController");
const {
  forgotPassword,
  forgotUsername,
} = require("../controller/Auth/userController");
const { deserializeUser } = require("passport");

// test userExists function
describe("userExist function", () => {
  it("Should return 200 if username is available", async () => {
    const req = {
      params: {
        username: "unique_username1",
      },
    };
    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };
    const userFindOneMock = jest.spyOn(User, "findOne");
    userFindOneMock.mockResolvedValue(null);
    await userExist(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("Should return 409 if user already exists", async () => {
    const req = {
      params: {
        username: "test_user",
      },
    };
    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };
    const userFindOneMock = jest.spyOn(User, "findOne");
    userFindOneMock.mockResolvedValue("test_user");
    await userExist(req, res);
    expect(res.status).toHaveBeenCalledWith(409);
  });
});

// test signUp function
describe("signUp function", () => {
  it("Should return 409 if user already exists", async () => {
    const req = {
      body: {
        username: "test_user",
        email: "email@gmail.com",
        password: "password",
      },
    };
    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };
    const userFindOneMock = jest.spyOn(User, "findOne");
    userFindOneMock.mockResolvedValue("test_user");
    await signUp(req, res);
    expect(res.status).toHaveBeenCalledWith(409);
  });
});

describe("appLogin function", () => {
  it("Should return 404 if invalid credintials", async () => {
    const req = {
      body: {
        usernameOrEmail: "notfound@mail.com",
        password: "password",
      },
    };
    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };
    const userFindOneMock = jest.spyOn(User, "findOne");
    userFindOneMock.mockResolvedValue(null);
    await appLogin(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});

describe("forgotPassword function", () => {
  it("Should return 404 if user not found", async () => {
    const req = {
      body: {
        username: "notfound",
      },
    };
    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };
    const userFindOneMock = jest.spyOn(User, "findOne");
    userFindOneMock.mockResolvedValue(null);
    await forgotPassword(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});

describe("forgotUsername function", () => {
  it("Should return 200 and send email if user found", async () => {
    const req = {
      body: {
        email: "test@mail.com",
      },
    };
    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };
    const userFindOneMock = jest.spyOn(User, "findOne");
    userFindOneMock.mockResolvedValue("test_user");
    await forgotUsername(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
