const { updatePostComments } = require("../controller/post/postController");
const { createComments } = require("../controller/post/postController");
const { deleteComments } = require("../controller/post/postController");
const { verifyToken } = require("../utils/tokens");
const Comment = require("../models/commentModel");
const User = require('../models/userModel');
const Post = require('../models/postModel');


jest.mock("../utils/tokens", () => ({
    verifyToken: jest.fn(),
  }));

jest.mock("../models/userModel", () => ({
    findOne: jest.fn(), // Mock the findOne method
  }));

jest.mock("../models/postModel", () => ({
    findById: jest.fn(), // Mock the findById method
  }));

jest.mock("../models/commentModel", () => ({
    save: jest.fn(), // Mock the save method
  }));


describe("updatePostComments", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  
  // Verify if the user is authenticated by checking the token in the request header and decoding it.
 it("should return an error response with status code 401 if the token is invalid or not present in the request header", async () => {
  const req = {
    headers: {
      authorization: "Bearer invalidToken",
    },
  };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  await updatePostComments(req, res);

  expect(res.status).toHaveBeenCalledWith(401);
  expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
   });

});

describe("createComments", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Verify if the user is authenticated by checking the token in the request header and decoding it.
  it("should return an error response with status code 401 if the token is invalid or not present in the request header", async () => {
    const req = {
      headers: {
        authorization: "Bearer invalidToken",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await createComments(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
  });
   
  
  it("should return a 500 error if an error occurs while saving the comment", async () => {
    const req = {
      body: {
        postId: "validPostId",
        content: "This is a test comment",
      },
      headers: {
        authorization: "Bearer validToken",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const user = { username: "testUser" };
    const post = { _id: "validPostId", linkedSubreddit: "testSubreddit" };
  
    verifyToken.mockResolvedValue(user);
    User.findOne.mockResolvedValue(user);
    Post.findById.mockResolvedValue(post);
    Comment
 });
});

describe("deleteComments", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Verify if the user is authenticated by checking the token in the request header and decoding it.
  it("should return an error response with status code 401 if the token is invalid or not present in the request header", async () => {
    const req = {
      headers: {
        authorization: "Bearer invalidToken",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  
    // Assuming your function calls verifyToken
    verifyToken.mockResolvedValue(null); // Simulate invalid token
  
    await deleteComments(req, res);
  
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
  });
  
  it("should return a 500 error if an error occurs while deleting the comment", async () => {
    const req = {
      params: {
        commentId: "validCommentId",
      },
      headers: {
        authorization: "Bearer validToken",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const user = { username: "testUser" };
    const comment = { _id: "validCommentId" };
  
    verifyToken.mockResolvedValue(user);
    User.findOne.mockResolvedValue(user);
    jest.mock("../models/commentModel", () => ({
      findById: jest.fn().mockResolvedValue(comment),
      deleteOne: jest.fn().mockRejectedValue(new Error("Database error")),
    }));
  
    await deleteComments(req, res);
  
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "Internal server Error" });
  });
});
