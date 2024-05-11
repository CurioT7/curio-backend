const {
  hidePost,
  unhidePost,
  spoilerPost,
  unspoilerPost,
  save,
  unsave,
  hidden,
  saved_categories,
  submit,
  sharePost,
  getPostLink,
  lockItem,
  unlockItem,
  getItemInfo,
  castVote,
  addToHistory,
  getHistory,
  pollVote,
} = require("../controller/User/contentManagementController");

const { verifyToken, authorizeUser } = require("../utils/tokens");
const { filterHiddenPosts, filterRemovedComments } = require("../utils/posts");

const User = require("../models/userModel");
const Post = require("../models/postModel");
const Subreddit = require("../models/subredditModel");
const Comment = require("../models/commentModel");
const { decode } = require("jsonwebtoken");

// Mock verifyToken
jest.mock("../utils/tokens", () => ({
  verifyToken: jest.fn(),
}));

describe("save function", () => {
  let req, res, userFindOneMock, postFindOneMock, userSaveMock;

  beforeEach(() => {
    userFindOneMock = jest.spyOn(User, "findOne");
    userSaveMock = jest.spyOn(User.prototype, "save");
    postFindOneMock = jest.spyOn(Post, "findOne");

    req = {
      headers: {
        authorization:
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NjAyM2Q4MDdmNzBkYjg4M2NjZjVhOTIiLCJpYXQiOjE3MTE0NzU0ODgsImV4cCI6MTcxMTU2MTg4OH0.Yvil4qLVPXSV7cB5RBhiki7hzqFreQIR8rEUICBqPaU",
      },
      body: {
        postId: "660227d61650ec9f41404c80",
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
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NjAyM2Q4MDdmNzBkYjg4M2NjZjVhOTIiLCJpYXQiOjE3MTE0NzU0ODgsImV4cCI6MTcxMTU2MTg4OH0.Yvil4qLVPXSV7cB5RBhiki7hzqFreQIR8rEUICBqPaU",
      },
      body: {
        postId: "660227d61650ec9f41404c80",
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

describe("hidePost", () => {
  // Successfully hide a post for a user with valid post ID and user ID
  it("should successfully hide a post when valid post ID and user ID are provided", async () => {
    const req = {
      body: {
        postId: "validPostId",
      },
      user: {
        userId: "validUserId",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const user = {
      _id: "validUserId",
      hiddenPosts: [],
    };
    const post = {
      _id: "validPostId",
    };

    User.findOne = jest.fn().mockResolvedValue(user);
    Post.findOne = jest.fn().mockResolvedValue(post);
    user.save = jest.fn().mockResolvedValue();

    await hidePost(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ _id: "validUserId" });
    expect(Post.findOne).toHaveBeenCalledWith({ _id: "validPostId" });
    expect(user.hiddenPosts).toContain("validPostId");
    expect(user.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Post hidden successfully",
    });
  });

  // Hide a post with an invalid post ID
  it("should return an error message when an invalid post ID is provided", async () => {
    const req = {
      body: {
        postId: "invalidPostId",
      },
      user: {
        userId: "validUserId",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const user = {
      _id: "validUserId",
      hiddenPosts: [],
    };

    User.findOne = jest.fn().mockResolvedValue(user);
    Post.findOne = jest.fn().mockResolvedValue(null);

    await hidePost(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ _id: "validUserId" });
    expect(Post.findOne).toHaveBeenCalledWith({ _id: "invalidPostId" });
    expect(user.hiddenPosts).not.toContain("invalidPostId");
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Post not found",
    });
  });
});

// Generated by CodiumAI

describe("unhidePost", () => {
  // Unhide a post successfully when all conditions are met
  it("should unhide a post successfully when all conditions are met", async () => {
    const req = {
      body: {
        postId: "post123",
      },
      user: {
        userId: "user123",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const user = {
      hiddenPosts: {
        pull: jest.fn(),
        includes: jest.fn().mockReturnValue(true),
      },
      save: jest.fn(),
    };
    const post = {
      _id: "post123",
    };
    User.findOne = jest.fn().mockResolvedValue(user);
    Post.findOne = jest.fn().mockResolvedValue(post);

    await unhidePost(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ _id: "user123" });
    expect(Post.findOne).toHaveBeenCalledWith({ _id: "post123" });
    expect(user.hiddenPosts.pull).toHaveBeenCalledWith("post123");
    expect(user.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Post unhidden successfully",
    });
  });

  // Throw a 500 error response when there is an error unhiding the post
  it("should throw a 500 error response when there is an error unhiding the post", async () => {
    const req = {
      body: {
        postId: "post123",
      },
      user: {
        userId: "user123",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    User.findOne = jest
      .fn()
      .mockRejectedValue(new Error("Internal server error"));

    await unhidePost(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ _id: "user123" });
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Internal server error",
    });
  });
});

// Generated by CodiumAI

describe("submit", () => {
  // Submitting a post with missing required fields
  it("should return an error when required fields are missing", async () => {
    const req = {
      user: {
        userId: "1234567890",
      },
      file: null,
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const user = {
      _id: "1234567890",
      username: "testuser",
      posts: [],
    };

    User.findOne = jest.fn().mockResolvedValue(user);

    await submit(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ _id: "1234567890" });
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Internal server error",
    });
  });
});

// Generated by CodiumAI

describe("hidden", () => {
  // Returns a 200 status code with a list of hidden posts when a valid user is found and has hidden posts
  it("should return a 200 status code with a list of hidden posts when a valid user is found and has hidden posts", async () => {
    const req = {
      user: {
        userId: "validUserId",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const user = {
      hiddenPosts: ["hiddenPostId1", "hiddenPostId2"],
    };
    const post = [
      { _id: "hiddenPostId1", title: "Hidden Post 1" },
      { _id: "hiddenPostId2", title: "Hidden Post 2" },
    ];
    User.findOne = jest.fn().mockResolvedValue(user);
    Post.find = jest.fn().mockResolvedValue(post);

    await hidden(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ _id: "validUserId" });
    expect(Post.find).toHaveBeenCalledWith({
      _id: { $in: ["hiddenPostId1", "hiddenPostId2"] },
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, hiddenPosts: post });
  });

  // Returns a 500 status code with an error message when there is an error finding the user
  it("should return a 500 status code with an error message when there is an error finding the user", async () => {
    const req = {
      user: {
        userId: "invalidUserId",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    User.findOne = jest
      .fn()
      .mockRejectedValue(new Error("Internal server error"));

    await hidden(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ _id: "invalidUserId" });
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Internal server error",
    });
  });

  // Returns a 404 status code with a user not found message when the user is not found
  it("should return a 404 status code with a user not found message when the user is not found", async () => {
    const req = {
      user: {
        userId: "nonexistentUserId",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    User.findOne = jest.fn().mockResolvedValue(null);

    await hidden(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ _id: "nonexistentUserId" });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "User not found",
    });
  });
});

// Generated by CodiumAI

describe("sharePost", () => {
  // Throw an error if user is not authenticated
  it("should throw an error if user is not authenticated", async () => {
    const req = {
      user: { userId: "609c3d0b1c7e8c0015f6e2a1" },
      body: {
        subreddit: null,
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Mock User.findOne() to return null
    User.findOne = jest.fn().mockResolvedValue(null);

    await sharePost(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
  });

  // Throw an error if subreddit is not found
  it("should throw an error if subreddit is not found", async () => {
    const req = {
      user: {
        userId: "user_id",
      },
      body: {
        subreddit: "subreddit_name",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const user = {
      _id: "user_id",
    };
    User.findOne = jest.fn().mockResolvedValue(user);
    Subreddit.findOne = jest.fn().mockResolvedValue(null);

    await sharePost(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ _id: "user_id" });
    expect(Subreddit.findOne).toHaveBeenCalledWith({ name: "subreddit_name" });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Subreddit not found",
    });
  });
});

describe("shareLink function", () => {
  let req, res, postFindOneMock;

  beforeEach(() => {
    postFindOneMock = jest.spyOn(Post, "findOne");

    req = {
      params: {
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

  it("should return 404 if post is not found", async () => {
    postFindOneMock.mockResolvedValue(null); // Simulate post not found

    await getPostLink(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Post not found",
    });
  });
});

// Generated by CodiumAI

describe("saved_categories", () => {
  // Returns a successful response with saved posts and comments when a valid user ID is provided
  it("should return a successful response with saved posts and comments when a valid user ID is provided", async () => {
    const req = { user: { userId: "validUserId" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const user = { savedItems: ["postId", "commentId"] };
    User.findOne = jest.fn().mockResolvedValue(user);
    Post.find = jest.fn().mockResolvedValue([{ _id: "postId" }]);
    Comment.find = jest.fn().mockResolvedValue([{ _id: "commentId" }]);

    await saved_categories(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ _id: "validUserId" });
    expect(Post.find).toHaveBeenCalledWith({
      _id: { $in: ["postId", "commentId"] },
    });
    expect(Comment.find).toHaveBeenCalledWith({
      _id: { $in: ["postId", "commentId"] },
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      savedPosts: [{ _id: "postId" }],
      savedComments: [{ _id: "commentId" }],
    });
  });

  // Returns a 404 error response when the user ID is not found
  it("should return a 404 error response when the user ID is not found", async () => {
    const req = { user: { userId: "invalidUserId" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    User.findOne = jest.fn().mockResolvedValue(null);

    await saved_categories(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ _id: "invalidUserId" });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "User not found",
    });
  });
});

// Generated by CodiumAI

describe("pollVote", () => {
  // Successfully record a vote for a poll option
  it("should successfully record a vote for a poll option", async () => {
    const req = {
      user: {
        userId: "user123",
      },
      body: {
        postId: "post123",
        option: "option1",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const user = {
      _id: "user123",
      pollVotes: [],
    };
    const post = {
      _id: "post123",
      type: "poll",
      createdAt: new Date(),
      voteLength: 7,
      options: [
        { name: "option1", votes: 0, voters: [] },
        { name: "option2", votes: 0, voters: [] },
      ],
    };
    User.findById = jest.fn().mockResolvedValue(user);
    Post.findById = jest.fn().mockResolvedValue(post);
    post.save = jest.fn().mockResolvedValue(post);
    user.save = jest.fn().mockResolvedValue(user);

    await pollVote(req, res);

    expect(User.findById).toHaveBeenCalledWith("user123");
    expect(Post.findById).toHaveBeenCalledWith("post123");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Vote recorded successfully",
    });
    expect(post.options[0].votes).toBe(1);
    expect(post.options[0].voters).toContain("user123");
    expect(user.pollVotes[0]).toEqual({ pollId: "post123", option: "option1" });
    expect(post.save).toHaveBeenCalled();
    expect(user.save).toHaveBeenCalled();
  });

  // Return a 400 error if option is not found
  it("should return a 400 error if option is not found", async () => {
    const req = {
      user: {
        userId: "user123",
      },
      body: {
        postId: "post123",
        option: "option3",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const user = {
      _id: "user123",
      pollVotes: [],
    };
    const post = {
      _id: "post123",
      type: "poll",
      createdAt: new Date(),
      voteLength: 7,
      options: [
        { name: "option1", votes: 0, voters: [] },
        { name: "option2", votes: 0, voters: [] },
      ],
    };
    User.findById = jest.fn().mockResolvedValue(user);
    Post.findById = jest.fn().mockResolvedValue(post);

    await pollVote(req, res);

    expect(User.findById).toHaveBeenCalledWith("user123");
    expect(Post.findById).toHaveBeenCalledWith("post123");
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Option not found",
    });
  });
});

// describe("lockItem function", () => {
//   let req,
//     res,
//     userFindOneMock,
//     postFindOneAndUpdateMock,
//     subredditFindByIdMock;

//   beforeEach(() => {
//     userFindOneMock = jest.spyOn(User, "findOne");
//     postFindOneAndUpdateMock = jest.spyOn(Post, "findOneAndUpdate");
//     subredditFindByIdMock = jest.spyOn(Subreddit, "findById");

//     req = {
//       headers: {
//         authorization:
//           "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NjAyM2Q4MDdmNzBkYjg4M2NjZjVhOTIiLCJpYXQiOjE3MTE0NzU0ODgsImV4cCI6MTcxMTU2MTg4OH0.Yvil4qLVPXSV7cB5RBhiki7hzqFreQIR8rEUICBqPaU",
//       },
//       body: {
//         itemID: "660227d61650ec9f41404c80",
//       },
//     };

//     res = {
//       status: jest.fn(() => res),
//       json: jest.fn(),
//     };
//   });

//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   it("should return 401 if token is missing or invalid", async () => {
//     verifyToken.mockResolvedValue(null); // Simulate token verification failure

//     await lockItem(req, res);

//     expect(res.status).toHaveBeenCalledWith(401);
//     expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
//   });

//   it("should return 404 if user is not found", async () => {
//     const payload = { userId: "userId123" };
//     verifyToken.mockResolvedValue(payload); // Simulate token verification success
//     userFindOneMock.mockResolvedValue(null); // Simulate user not found

//     await lockItem(req, res);

//     expect(res.status).toHaveBeenCalledWith(404);
//     expect(res.json).toHaveBeenCalledWith({
//       success: false,
//       message: "User not found",
//     });
//   });

//   it("should return 404 if post is not found", async () => {
//     const payload = { userId: "userId123" };
//     verifyToken.mockResolvedValue(payload); // Simulate token verification success
//     userFindOneMock.mockResolvedValue({}); // Simulate user found
//     postFindOneAndUpdateMock.mockResolvedValue(null); // Simulate post not found

//     await lockItem(req, res);

//     expect(res.status).toHaveBeenCalledWith(404);
//     expect(res.json).toHaveBeenCalledWith({
//       success: false,
//       message: "Post not found",
//     });
//   });

//   it("should return 403 if user is not authorized to lock posts in the subreddit", async () => {
//     const payload = { userId: "userId123" };
//     verifyToken.mockResolvedValue(payload); // Simulate token verification success
//     // Simulate user found without any subreddit roles
//     userFindOneMock.mockResolvedValueOnce({ subreddits: [] });
//     postFindOneAndUpdateMock.mockResolvedValue({}); // Simulate post found
//     subredditFindByIdMock.mockResolvedValue({ name: "exampleSubreddit" }); // Simulate subreddit found

//     await lockItem(req, res);

//     expect(res.status).toHaveBeenCalledWith(403);
//     expect(res.json).toHaveBeenCalledWith({
//       success: false,
//       message: "User is not authorized to lock posts in this subreddit",
//     });
//   });

//   it("should return 200 if post is locked successfully", async () => {
//     const payload = { userId: "userId123" };
//     verifyToken.mockResolvedValue(payload); // Simulate token verification success
//     // Simulate user with moderator role in the subreddit
//     const subredditRole = { role: "moderator", subreddit: "exampleSubreddit" };
//     userFindOneMock.mockResolvedValueOnce({ subreddits: [subredditRole] });
//     postFindOneAndUpdateMock.mockResolvedValue({}); // Simulate post found
//     subredditFindByIdMock.mockResolvedValue({ name: "exampleSubreddit" }); // Simulate subreddit found

//     await lockItem(req, res);

//     expect(res.status).toHaveBeenCalledWith(200);
//     expect(res.json).toHaveBeenCalledWith({
//       success: true,
//       message: "Post locked successfully",
//     });
//   });

//   it("should handle internal server error", async () => {
//     const payload = { userId: "userId123" };
//     verifyToken.mockResolvedValue(payload); // Simulate token verification success
//     userFindOneMock.mockRejectedValue(new Error("Database error")); // Simulate database error

//     await lockItem(req, res);

//     expect(res.status).toHaveBeenCalledWith(500);
//     expect(res.json).toHaveBeenCalledWith({
//       success: false,
//       message: "Internal server error",
//     });
//   });
// });

// describe("unlockItem function", () => {
//   let req,
//     res,
//     userFindOneMock,
//     postFindOneAndUpdateMock,
//     subredditFindByIdMock;

//   beforeEach(() => {
//     userFindOneMock = jest.spyOn(User, "findOne");
//     postFindOneAndUpdateMock = jest.spyOn(Post, "findOneAndUpdate");
//     subredditFindByIdMock = jest.spyOn(Subreddit, "findById");

//     req = {
//       headers: {
//         authorization:
//           "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NjAyM2Q4MDdmNzBkYjg4M2NjZjVhOTIiLCJpYXQiOjE3MTE0NzU0ODgsImV4cCI6MTcxMTU2MTg4OH0.Yvil4qLVPXSV7cB5RBhiki7hzqFreQIR8rEUICBqPaU", // Your token here
//       },
//       body: {
//         itemID: "660227d61650ec9f41404c80",
//       },
//     };

//     res = {
//       status: jest.fn(() => res),
//       json: jest.fn(),
//     };
//   });

//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   it("should return 401 if token is missing or invalid", async () => {
//     verifyToken.mockResolvedValue(null); // Simulate token verification failure

//     await unlockItem(req, res);

//     expect(res.status).toHaveBeenCalledWith(401);
//     expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
//   });

//   it("should return 404 if user is not found", async () => {
//     const payload = { userId: "userId123" };
//     verifyToken.mockResolvedValue(payload); // Simulate token verification success
//     userFindOneMock.mockResolvedValue(null); // Simulate user not found

//     await unlockItem(req, res);

//     expect(res.status).toHaveBeenCalledWith(404);
//     expect(res.json).toHaveBeenCalledWith({
//       success: false,
//       message: "User not found",
//     });
//   });

//   it("should return 404 if post is not found", async () => {
//     const payload = { userId: "userId123" };
//     verifyToken.mockResolvedValue(payload); // Simulate token verification success
//     userFindOneMock.mockResolvedValue({}); // Simulate user found
//     postFindOneAndUpdateMock.mockResolvedValue(null); // Simulate post not found

//     await unlockItem(req, res);

//     expect(res.status).toHaveBeenCalledWith(404);
//     expect(res.json).toHaveBeenCalledWith({
//       success: false,
//       message: "Post not found",
//     });
//   });

//   it("should return 403 if user is not authorized to unlock posts in the subreddit", async () => {
//     const payload = { userId: "userId123" };
//     verifyToken.mockResolvedValue(payload); // Simulate token verification success
//     // Simulate user found without any subreddit roles
//     userFindOneMock.mockResolvedValueOnce({ subreddits: [] });
//     postFindOneAndUpdateMock.mockResolvedValue({}); // Simulate post found
//     subredditFindByIdMock.mockResolvedValue({ name: "exampleSubreddit" }); // Simulate subreddit found

//     await unlockItem(req, res);

//     expect(res.status).toHaveBeenCalledWith(403);
//     expect(res.json).toHaveBeenCalledWith({
//       success: false,
//       message: "User is not authorized to unlock posts in this subreddit",
//     });
//   });

//   it("should return 200 if post is unlocked successfully", async () => {
//     const payload = { userId: "userId123" };
//     verifyToken.mockResolvedValue(payload); // Simulate token verification success
//     // Simulate user with moderator or creator role in the subreddit
//     const subredditRole = { role: "moderator", subreddit: "exampleSubreddit" };
//     userFindOneMock.mockResolvedValueOnce({ subreddits: [subredditRole] });
//     postFindOneAndUpdateMock.mockResolvedValue({}); // Simulate post found
//     subredditFindByIdMock.mockResolvedValue({ name: "exampleSubreddit" }); // Simulate subreddit found

//     await unlockItem(req, res);

//     expect(res.status).toHaveBeenCalledWith(200);
//     expect(res.json).toHaveBeenCalledWith({
//       success: true,
//       message: "Post unlocked successfully",
//     });
//   });

//   it("should handle internal server error", async () => {
//     const payload = { userId: "userId123" };
//     verifyToken.mockResolvedValue(payload); // Simulate token verification success
//     userFindOneMock.mockRejectedValue(new Error("Database error")); // Simulate database error

//     await unlockItem(req, res);

//     expect(res.status).toHaveBeenCalledWith(500);
//     expect(res.json).toHaveBeenCalledWith({
//       success: false,
//       message: "Internal server error",
//     });
//   });
// });

// describe("getItemInfo function", () => {
//   let req,
//     res,
//     userFindOneMock,
//     postFindOneMock,
//     commentFindOneMock,
//     subredditFindOneMock;

//   beforeEach(() => {
//     userFindOneMock = jest.spyOn(User, "findOne");
//     postFindOneMock = jest.spyOn(Post, "findOne");
//     commentFindOneMock = jest.spyOn(Comment, "findOne");
//     subredditFindOneMock = jest.spyOn(Subreddit, "findOne");

//     req = {
//       headers: {
//         authorization:
//           "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NjAyM2Q4MDdmNzBkYjg4M2NjZjVhOTIiLCJpYXQiOjE3MTE0NzU0ODgsImV4cCI6MTcxMTU2MTg4OH0.Yvil4qLVPXSV7cB5RBhiki7hzqFreQIR8rEUICBqPaU", // Your token here
//       },
//       body: {
//         objectID: "660227d61650ec9f41404c80",
//         objectType: "post",
//       },
//     };

//     res = {
//       status: jest.fn(() => res),
//       json: jest.fn(),
//     };
//   });

//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   it("should return 401 if token is missing or invalid", async () => {
//     verifyToken.mockResolvedValue(null); // Simulate token verification failure

//     await getItemInfo(req, res);

//     expect(res.status).toHaveBeenCalledWith(401);
//     expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
//   });

//   it("should return 404 if user is not found", async () => {
//     const payload = { userId: "userId123" };
//     verifyToken.mockResolvedValue(payload); // Simulate token verification success
//     userFindOneMock.mockResolvedValue(null); // Simulate user not found

//     await getItemInfo(req, res);

//     expect(res.status).toHaveBeenCalledWith(404);
//     expect(res.json).toHaveBeenCalledWith({
//       success: false,
//       message: "User not found",
//     });
//   });

//   it("should return 200 with item info if item is found (post)", async () => {
//     const payload = { userId: "userId123" };
//     verifyToken.mockResolvedValue(payload); // Simulate token verification success
//     userFindOneMock.mockResolvedValue({}); // Simulate user found
//     postFindOneMock.mockResolvedValue({}); // Simulate post found

//     await getItemInfo(req, res);

//     expect(res.status).toHaveBeenCalledWith(200);
//     expect(res.json).toHaveBeenCalledWith({
//       success: true,
//       item: expect.any(Object),
//     });
//   });

//   it("should return 200 with item info if item is found (comment)", async () => {
//     req.body.objectType = "comment";
//     const payload = { userId: "userId123" };
//     verifyToken.mockResolvedValue(payload); // Simulate token verification success
//     userFindOneMock.mockResolvedValue({}); // Simulate user found
//     commentFindOneMock.mockResolvedValue({}); // Simulate comment found

//     await getItemInfo(req, res);

//     expect(res.status).toHaveBeenCalledWith(200);
//     expect(res.json).toHaveBeenCalledWith({
//       success: true,
//       item: expect.any(Object),
//     });
//   });

//   it("should return 200 with item info if item is found (subreddit)", async () => {
//     req.body.objectType = "subreddit";
//     const payload = { userId: "userId123" };
//     verifyToken.mockResolvedValue(payload); // Simulate token verification success
//     userFindOneMock.mockResolvedValue({}); // Simulate user found
//     subredditFindOneMock.mockResolvedValue({}); // Simulate subreddit found

//     await getItemInfo(req, res);

//     expect(res.status).toHaveBeenCalledWith(200);
//     expect(res.json).toHaveBeenCalledWith({
//       success: true,
//       item: expect.any(Object),
//     });
//   });
// });

// describe("castVote function", () => {
//   let req, res;

//   beforeEach(() => {
//     req = {
//       headers: { authorization: "Bearer fake.token" },
//       body: { itemID: "123", itemName: "post", direction: 1 },
//     };
//     res = {
//       status: jest.fn(() => res),
//       json: jest.fn(),
//     };
//   });

//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   it("should return 401 if token is invalid", async () => {
//     verifyToken.mockResolvedValue(null);

//     await castVote(req, res);

//     expect(res.status).toHaveBeenCalledWith(401);
//     expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
//   });

//   it("should return 404 if user not found", async () => {
//     verifyToken.mockResolvedValue({ userId: "someUserId" });
//     User.findOne.mockResolvedValue(null);

//     await castVote(req, res);

//     expect(res.status).toHaveBeenCalledWith(404);
//     expect(res.json).toHaveBeenCalledWith({
//       success: false,
//       message: "User not found",
//     });
//   });

//   it("should return 404 if item not found", async () => {
//     verifyToken.mockResolvedValue({ userId: "someUserId" });
//     User.findOne.mockResolvedValue({});
//     Post.findOne.mockResolvedValue(null);

//     await castVote(req, res);

//     expect(res.status).toHaveBeenCalledWith(404);
//     expect(res.json).toHaveBeenCalledWith({
//       success: false,
//       message: "Item not found",
//     });
//   });

//   it("should handle internal server error", async () => {
//     verifyToken.mockRejectedValue(new Error("Internal server error"));

//     await castVote(req, res);

//     expect(res.status).toHaveBeenCalledWith(500);
//     expect(res.json).toHaveBeenCalledWith({
//       success: false,
//       message: "Internal server error",
//       error: new Error("Internal server error"),
//     });
//   });
// });

// describe("addToHistory function", () => {
//   let req, res;

//   beforeEach(() => {
//     req = {
//       headers: { authorization: "Bearer fake.token" },
//       body: { postID: "post123" },
//     };
//     res = {
//       status: jest.fn(() => res),
//       json: jest.fn(),
//     };
//   });

//   it("should add a post to user history if not already present", async () => {
//     verifyToken.mockResolvedValue({ userId: "user123" });
//     User.findOne.mockResolvedValue({ recentPosts: [], save: jest.fn() });
//     Post.findOne.mockResolvedValue({ _id: "post123" });

//     await addToHistory(req, res);

//     expect(res.status).toHaveBeenCalledWith(200);
//     expect(res.json).toHaveBeenCalledWith({
//       success: true,
//       message: "Post added to history",
//     });
//   });
// });

// describe("getHistory function", () => {
//   let req, res;

//   beforeEach(() => {
//     req = {
//       headers: { authorization: "Bearer fake.token" },
//     };
//     res = {
//       status: jest.fn(() => res),
//       json: jest.fn(),
//     };

//     // Mock setup for Post.find
//     Post.find = jest.fn();
//   });

//   it("should retrieve the user's browsing history", async () => {
//     verifyToken.mockResolvedValue({ userId: "user123" });
//     User.findOne.mockResolvedValue({ recentPosts: ["post123"] });
//     Post.find.mockResolvedValue([{ _id: "post123", title: "Example Post" }]);

//     await getHistory(req, res);

//     expect(res.status).toHaveBeenCalledWith(200);
//     expect(res.json).toHaveBeenCalledWith({
//       success: true,
//       recentPosts: [{ _id: "post123", title: "Example Post" }],
//     });
//   });
// });

// describe("getHistory function", () => {
//   let req, res;

//   beforeEach(() => {
//     req = {
//       headers: {},
//     };
//     res = {
//       status: jest.fn(() => res),
//       json: jest.fn(),
//     };

//     // Mock setup for Post.find
//     Post.find = jest.fn();
//   });

//   it("should send false when no post id is provided", async () => {
//     await getHistory(req, res);

//     expect(res.status).toHaveBeenCalledWith(500);
//     expect(res.json).toHaveBeenCalledWith({
//       success: false,
//       message: "Internal server error",
//     });
//   });
// });

describe("spoilerPost function", () => {
  // Successfully mark a post as a spoiler
  it("should mark a post as a spoiler when valid post ID is provided", async () => {
    const req = {
      body: {
        idpost: "validPostId",
      },
      user: {
        userId: "validUserId",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const user = {
      _id: "validUserId",
    };
    const post = {
      _id: "validPostId",
      authorID: "validUserId",
      isSpoiler: false,
      save: jest.fn(),
    };
    User.findById = jest.fn().mockResolvedValue(user);
    Post.findOne = jest.fn().mockResolvedValue(post);

    await spoilerPost(req, res);

    expect(Post.findOne).toHaveBeenCalledWith({
      _id: "validPostId",
      authorID: user,
    });
    expect(post.isSpoiler).toBe(true);
    expect(post.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Post marked as spoiler successfully",
    });
  });
});
describe("unspoilerPost function", () => {
  it("should mark a post as a unspoiler when valid post ID is provided", async () => {
    const req = {
      body: {
        idpost: "validPostId",
      },
      user: {
        userId: "validUserId",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const user = {
      _id: "validUserId",
    };
    const post = {
      _id: "validPostId",
      authorID: "validUserId",
      isSpoiler: true,
      save: jest.fn(),
    };
    User.findById = jest.fn().mockResolvedValue(user);
    Post.findOne = jest.fn().mockResolvedValue(post);

    await unspoilerPost(req, res);

    expect(Post.findOne).toHaveBeenCalledWith({
      _id: "validPostId",
      authorID: user,
    });
    expect(post.isSpoiler).toBe(false);
    expect(post.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Post unmarked as spoiler successfully",
    });
  });
});

// Generated by CodiumAI

describe("filterHiddenPosts", () => {
  // Returns the list of posts without hidden and removed posts.
  it("should return the list of posts without hidden and removed posts", async () => {
    // Arrange
    const posts = [
      { _id: "1", isRemoved: false },
      { _id: "2", isRemoved: true },
      { _id: "3", isRemoved: false },
    ];
    const user = {
      hiddenPosts: Promise.resolve(["2"]),
    };

    // Act
    const result = await filterHiddenPosts(posts, user);

    // Assert
    expect(result).toEqual([
      { _id: "1", isRemoved: false },
      { _id: "3", isRemoved: false },
    ]);
  });

  // Throws an error if posts parameter is not an array.
  it("should throw an error if posts parameter is not an array", async () => {
    // Arrange
    const posts = "not an array";
    const user = {
      hiddenPosts: Promise.resolve([]),
    };

    // Act and Assert
    await expect(filterHiddenPosts(posts, user)).rejects.toThrowError();
  });
});

// Generated by CodiumAI

describe("filterRemovedComments", () => {
  // Returns the same list of comments if none of them are removed.
  it("should return the same list of comments when none of them are removed", async () => {
    // Arrange
    const comments = [
      { id: 1, text: "Comment 1", isRemoved: false },
      { id: 2, text: "Comment 2", isRemoved: false },
      { id: 3, text: "Comment 3", isRemoved: false },
    ];

    // Act
    const result = await filterRemovedComments(comments);

    // Assert
    expect(result).toEqual(comments);
  });

  // Returns a list of comments without removed comments if there are any.
  it("should return a list of comments without removed comments if there are any", async () => {
    // Arrange
    const comments = [
      { id: 1, text: "Comment 1", isRemoved: false },
      { id: 2, text: "Comment 2", isRemoved: true },
      { id: 3, text: "Comment 3", isRemoved: false },
    ];

    // Act
    const result = await filterRemovedComments(comments);

    // Assert
    expect(result).toEqual([
      { id: 1, text: "Comment 1", isRemoved: false },
      { id: 3, text: "Comment 3", isRemoved: false },
    ]);
  });

  // Returns an empty list if all comments are removed.
  it("should return an empty list if all comments are removed", async () => {
    // Arrange
    const comments = [
      { id: 1, text: "Comment 1", isRemoved: true },
      { id: 2, text: "Comment 2", isRemoved: true },
      { id: 3, text: "Comment 3", isRemoved: true },
    ];

    // Act
    const result = await filterRemovedComments(comments);

    // Assert
    expect(result).toEqual([]);
  });

  // Returns an empty array if the input is an empty array.
  it("should return an empty array if the input is an empty array", async () => {
    // Arrange
    const comments = [];

    // Act
    const result = await filterRemovedComments(comments);

    // Assert
    expect(result).toEqual([]);
  });
});
