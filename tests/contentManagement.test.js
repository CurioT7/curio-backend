const {
  hidePost,
  unhidePost,
  save,
  unsave,
  hidden,
  saved_categories,
  submit,
  sharePost,
  getPostLink,
} = require("../controller/User/contentManagementController");
const { verifyToken } = require("../utils/tokens");
const User = require("../models/userModel");
const Post = require("../models/postModel");
const Comment = require("../models/commentModel");
const { decode } = require("jsonwebtoken");

// Mock verifyToken
jest.mock("../utils/tokens", () => ({
  verifyToken: jest.fn(),
}));

describe("hidePost function", () => {
  let req, res, userFindOneMock, postFindOneMock, userSaveMock;

  beforeEach(() => {
    userFindOneMock = jest.spyOn(User, "findOne");
    userSaveMock = jest.spyOn(User.prototype, "save");
    postFindOneMock = jest.spyOn(Post, "findOne");

    req = {
      headers: {
        authorization:
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NjAyM2Q4MDdmNzBkYjg4M2NjZjVhOTIiLCJpYXQiOjE3MTE0NzU0ODgsImV4cCI6MTcxMTU2MTg4OH0.Yvil4qLVPXSV7cB5RBhiki7hzqFreQIR8rEUICBqPaU", // Your token here
      },
      body: {
        postId: "660227d61650ec9f41404c80", // Your post ID here
      },
    };

    res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 if token is missing or invalid", async () => {
    verifyToken.mockResolvedValue(null); // Simulate token verification failure

    await hidePost(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
  });

  it("should return 404 if user is not found", async () => {
    const payload = { userId: "userId123" };
    verifyToken.mockResolvedValue(payload); // Simulate token verification success
    userFindOneMock.mockResolvedValue(null); // Simulate user not found

    await hidePost(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "User not found",
    });
  });

  it("should return 404 if post is not found", async () => {
    const payload = { userId: "userId123" };
    verifyToken.mockResolvedValue(payload); // Simulate token verification success
    userFindOneMock.mockResolvedValue({}); // Simulate user found
    postFindOneMock.mockResolvedValue(null); // Simulate post not found

    await hidePost(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Post not found",
    });
  });

  it("should return 400 if post is already hidden", async () => {
    const payload = { userId: "userId123" };
    verifyToken.mockResolvedValue(payload); // Simulate token verification success
    userFindOneMock.mockResolvedValue({
      hiddenPosts: ["660227d61650ec9f41404c80"],
    }); // Simulate user found
    postFindOneMock.mockResolvedValue({}); // Simulate post found

    await hidePost(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Post already hidden",
    });
  });

  it("should handle internal server error", async () => {
    const payload = { userId: "userId123" };
    verifyToken.mockResolvedValue(payload); // Simulate token verification success
    userFindOneMock.mockRejectedValue(new Error("Database error")); // Simulate database error

    await hidePost(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Internal server error",
    });
  });
});

describe("unhidePost function", () => {
  let req, res, userFindOneMock, postFindOneMock, userSaveMock;

  beforeEach(() => {
    userFindOneMock = jest.spyOn(User, "findOne");
    userSaveMock = jest.spyOn(User.prototype, "save");
    postFindOneMock = jest.spyOn(Post, "findOne");

    req = {
      headers: {
        authorization:
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NjAyM2Q4MDdmNzBkYjg4M2NjZjVhOTIiLCJpYXQiOjE3MTE0NzU0ODgsImV4cCI6MTcxMTU2MTg4OH0.Yvil4qLVPXSV7cB5RBhiki7hzqFreQIR8rEUICBqPaU", // Your token here
      },
      body: {
        postId: "660227d61650ec9f41404c80", // Your post ID here
      },
    };

    res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 if token is missing or invalid", async () => {
    verifyToken.mockResolvedValue(null); // Simulate token verification failure

    await unhidePost(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
  });

  it("should return 404 if user is not found", async () => {
    const payload = { userId: "userId123" };
    verifyToken.mockResolvedValue(payload); // Simulate token verification success
    userFindOneMock.mockResolvedValue(null); // Simulate user not found

    await unhidePost(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "User not found",
    });
  });

  it("should handle internal server error", async () => {
    const payload = { userId: "userId123" };
    verifyToken.mockResolvedValue(payload); // Simulate token verification success
    userFindOneMock.mockRejectedValue(new Error("Database error")); // Simulate database error

    await unhidePost(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Internal server error",
    });
  });

  it("should return 404 if post is not found", async () => {
    const payload = { userId: "userId123" };
    verifyToken.mockResolvedValue(payload); // Simulate token verification success
    userFindOneMock.mockResolvedValue({}); // Simulate user found
    postFindOneMock.mockResolvedValue(null); // Simulate post not found

    await unhidePost(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Post not found",
    });
  });
});

describe("save function", () => {
  let req, res, userFindOneMock, postFindOneMock, userSaveMock;

  beforeEach(() => {
    userFindOneMock = jest.spyOn(User, "findOne");
    userSaveMock = jest.spyOn(User.prototype, "save");
    postFindOneMock = jest.spyOn(Post, "findOne");

    req = {
      headers: {
        authorization:
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NjAyM2Q4MDdmNzBkYjg4M2NjZjVhOTIiLCJpYXQiOjE3MTE0NzU0ODgsImV4cCI6MTcxMTU2MTg4OH0.Yvil4qLVPXSV7cB5RBhiki7hzqFreQIR8rEUICBqPaU", // Your token here
      },
      body: {
        postId: "660227d61650ec9f41404c80", // Your post ID here
      },
    };

    res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 if token is missing or invalid", async () => {
    verifyToken.mockResolvedValue(null); // Simulate token verification failure

    await save(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
  });

  it("should return 404 if user is not found", async () => {
    const payload = { userId: "userId123" };
    verifyToken.mockResolvedValue(payload); // Simulate token verification success
    userFindOneMock.mockResolvedValue(null); // Simulate user not found

    await save(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "User not found",
    });
  });

  it("should return 404 if post is not found", async () => {
    const payload = { userId: "userId123" };
    verifyToken.mockResolvedValue(payload); // Simulate token verification success
    userFindOneMock.mockResolvedValue({}); // Simulate user found
    postFindOneMock.mockResolvedValue(null); // Simulate post not found

    await save(req, res);
  });
});

describe("unsave function", () => {
  let req, res, userFindOneMock, postFindOneMock, userSaveMock;

  beforeEach(() => {
    userFindOneMock = jest.spyOn(User, "findOne");
    userSaveMock = jest.spyOn(User.prototype, "save");
    postFindOneMock = jest.spyOn(Post, "findOne");

    req = {
      headers: {
        authorization:
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NjAyM2Q4MDdmNzBkYjg4M2NjZjVhOTIiLCJpYXQiOjE3MTE0NzU0ODgsImV4cCI6MTcxMTU2MTg4OH0.Yvil4qLVPXSV7cB5RBhiki7hzqFreQIR8rEUICBqPaU", // Your token here
      },
      body: {
        postId: "660227d61650ec9f41404c80", // Your post ID here
      },
    };

    res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 if token is missing or invalid", async () => {
    verifyToken.mockResolvedValue(null); // Simulate token verification failure

    await unsave(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
  });

  it("should return 404 if user is not found", async () => {
    const payload = { userId: "userId123" };
    verifyToken.mockResolvedValue(payload); // Simulate token verification success
    userFindOneMock.mockResolvedValue(null); // Simulate user not found

    await unsave(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "User not found",
    });
  });
});

describe("hidden function", () => {
  let req, res, userFindOneMock, postFindOneMock, userSaveMock;

  beforeEach(() => {
    userFindOneMock = jest.spyOn(User, "findOne");
    userSaveMock = jest.spyOn(User.prototype, "save");
    postFindOneMock = jest.spyOn(Post, "findOne");

    req = {
      headers: {
        authorization:
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NjAyM2Q4MDdmNzBkYjg4M2NjZjVhOTIiLCJpYXQiOjE3MTE0NzU0ODgsImV4cCI6MTcxMTU2MTg4OH0.Yvil4qLVPXSV7cB5RBhiki7hzqFreQIR8rEUICBqPaU", // Your token here
      },
      body: {
        postId: "660227d61650ec9f41404c80", // Your post ID here
      },
    };

    res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 if token is missing or invalid", async () => {
    verifyToken.mockResolvedValue(null); // Simulate token verification failure

    await hidden(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
  });

  it("should return 404 if user is not found", async () => {
    const payload = { userId: "userId123" };
    verifyToken.mockResolvedValue(payload); // Simulate token verification success
    userFindOneMock.mockResolvedValue(null); // Simulate user not found

    await hidden(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "User not found",
    });
  });
});

describe("saved_categories function", () => {
  let req, res, userFindOneMock, userSaveMock;

  beforeEach(() => {
    userFindOneMock = jest.spyOn(User, "findOne");
    userSaveMock = jest.spyOn(User.prototype, "save");

    req = {
      headers: {
        authorization:
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NjAyM2Q4MDdmNzBkYjg4M2NjZjVhOTIiLCJpYXQiOjE3MTE0NzU0ODgsImV4cCI6MTcxMTU2MTg4OH0.Yvil4qLVPXSV7cB5RBhiki7hzqFreQIR8rEUICBqPaU", // Your token here
      },
    };

    res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 if token is missing or invalid", async () => {
    verifyToken.mockResolvedValue(null); // Simulate token verification failure

    await saved_categories(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
  });

  it("should return 404 if user is not found", async () => {
    const payload = { userId: "userId123" };
    verifyToken.mockResolvedValue(payload); // Simulate token verification success
    userFindOneMock.mockResolvedValue(null); // Simulate user not found

    await saved_categories(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "User not found",
    });
  });
});

describe("submit function", () => {
  let req, res, userFindOneMock, postFindOneMock, userSaveMock, postSaveMock;

  beforeEach(() => {
    userFindOneMock = jest.spyOn(User, "findOne");
    userSaveMock = jest.spyOn(User.prototype, "save");
    postFindOneMock = jest.spyOn(Post, "findOne");
    postSaveMock = jest.spyOn(Post.prototype, "save");

    req = {
      headers: {
        authorization:
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NjAyM2Q4MDdmNzBkYjg4M2NjZjVhOTIiLCJpYXQiOjE3MTE0NzU0ODgsImV4cCI6MTcxMTU2MTg4OH0.Yvil4qLVPXSV7cB5RBhiki7hzqFreQIR8rEUICBqPaU", // Your token here
      },
      body: {
        postId: "660227d61650ec9f41404c80", // Your post ID here
      },
    };

    res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 if token is missing or invalid", async () => {
    verifyToken.mockResolvedValue(null); // Simulate token verification failure

    await submit(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
  });

  it("should return 404 if user is not found", async () => {
    const payload = { userId: "userId123" };
    verifyToken.mockResolvedValue(payload); // Simulate token verification success
    userFindOneMock.mockResolvedValue(null); // Simulate user not found

    await submit(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "User not found",
    });
  });
});
