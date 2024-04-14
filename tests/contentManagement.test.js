const {
  hidePost,
  unhidePost,
  spoilerPost,
  unspoilerPost,
} = require("../controller/User/contentManagementController");
const { verifyToken } = require("../utils/tokens");
const User = require("../models/userModel");
const Post = require("../models/postModel");
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

describe("spoilerPost function", () => {
  // Successfully mark a post as spoiler with valid token and post ID
  it("should mark a post as spoiler when given a valid token and post ID", async () => {
    const req = {
      headers: {
        authorization: "Bearer validToken",
      },
      body: {
        idpost: "validPostId",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const decoded = {
      userId: "validUserId",
    };
    const findOneMock = jest.fn().mockResolvedValue({
      _id: "validPostId",
      authorID: "validUserId",
      isSpoiler: false,
      save: jest.fn(),
    });
    jest.spyOn(Post, "findOne").mockReturnValueOnce(findOneMock);
    const verifyToken = jest.fn().mockResolvedValue(decoded);
    jest
      .spyOn(require("../../utils/tokens"), "verifyToken")
      .mockReturnValueOnce(verifyToken);

    await spoilerPost(req, res);

    expect(verifyToken).toHaveBeenCalledWith("validToken");
    expect(findOneMock).toHaveBeenCalledWith({
      _id: "validPostId",
      authorID: "validUserId",
    });
    expect(findOneMock().isSpoiler).toBe(true);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Post marked as spoiler successfully",
    });
  });
});

describe("unspoilerPost function", () => {
  // Verify that the function returns a 200 status code and a success message when the post is successfully unmarked as a spoiler.
  it("should return a 200 status code and a success message when the post is successfully unmarked as a spoiler", async () => {
    const req = {
      headers: {
        authorization: "Bearer token",
      },
      body: {
        idpost: "post123",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const findOneMock = jest.fn().mockResolvedValue({
      _id: "post123",
      authorID: "user123",
      isSpoiler: true,
      save: jest.fn(),
    });
    jest.spyOn(Post, "findOne").mockReturnValueOnce(findOneMock);
    const verifyToken = jest.fn().mockResolvedValue({ userId: "user123" });
    jest
      .spyOn(require("../../utils/tokens"), "verifyToken")
      .mockReturnValueOnce(verifyToken);

    await unspoilerPost(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Post unmarked as spoiler successfully",
    });
    expect(findOneMock).toHaveBeenCalledWith({
      _id: "post123",
      authorID: "user123",
    });
    expect(findOneMock().save).toHaveBeenCalled();
  });
});