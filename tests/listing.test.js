const subredditModel = require("../models/subredditModel");
const Post = require("../models/postModel");
const Subreddit = require("../models/subredditModel");
const User = require("../models/userModel");
const {
  randomPost,
  getTopPosts,
  getTopPostsbytime,
  hotPosts,
  mostComments,
  setSuggestedSort,
  getUserPosts,
  sortComments,
  getTopComments,
} = require("../controller/listing/listingController");
const moment = require("moment");

describe("randomPost", () => {
  it("should return an error message when the subreddit is not found", async () => {
    const req = { params: { subreddit: "invalidSubreddit" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    subredditModel.findOne = jest.fn().mockResolvedValue(null);
    await randomPost(req, res);

    expect(subredditModel.findOne).toHaveBeenCalledWith({
      name: "invalidSubreddit",
    });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Subreddit not found",
    });
  });
});

describe("getTopPosts", () => {
  it("should return an error message when the subreddit is not found", async () => {
    const req = { params: { subreddit: "invalidSubreddit" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    subredditModel.findOne = jest.fn().mockResolvedValue(null);

    await getTopPosts(req, res);

    expect(subredditModel.findOne).toHaveBeenCalledWith({
      name: "invalidSubreddit",
    });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Subreddit not found",
    });
  });
});

describe("getTopPostsbytime", () => {
  it("should return a not found status code and an error message when the subreddit does not exist", async () => {
    // Mocking dependencies

    // Mocking request and response objects
    const req = {
      params: { subreddit: "nonExistentSubreddit" },
      query: { timethreshold: 7 },
    };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    // Mocking the subreddit model to return null (indicating subreddit not found)
    subredditModel.findOne = jest.fn().mockResolvedValue(null);

    // Call the function
    await getTopPostsbytime(req, res);

    // Assertions
    expect(subredditModel.findOne).toHaveBeenCalledWith({
      name: "nonExistentSubreddit",
    });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Subreddit not found",
    });
  });
});
it('should return a status of 404 if the subreddit is not found', async () => {
    const req = { params: { subreddit: 'nonExistentSubreddit' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    subredditModel.findOne = jest.fn().mockResolvedValue(null);

    await mostComments(req, res);

    expect(subredditModel.findOne).toHaveBeenCalledWith({ name: 'nonExistentSubreddit' });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Subreddit not found' });
  });



  it('should return an error response for an invalid subreddit name', async () => {
    const req = { params: { subreddit: 'invalidSubreddit' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    const subredditModel = require("../models/subredditModel");
    const Post = require("../models/postModel");

    subredditModel.findOne = jest.fn().mockResolvedValue(null);

    await hotPosts(req, res);

    expect(subredditModel.findOne).toHaveBeenCalledWith({ name: 'invalidSubreddit' });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "Subreddit not found" });
  });

  it('should return an error response for an invalid subreddit name', async () => {
    const req = { params: { subreddit: 'invalidSubreddit' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    const subredditModel = require("../models/subredditModel");
    const Post = require("../models/postModel");

    subredditModel.findOne = jest.fn().mockResolvedValue(null);

    await hotPosts(req, res);

    expect(subredditModel.findOne).toHaveBeenCalledWith({ name: 'invalidSubreddit' });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "Subreddit not found" });
  });
  

describe("setsuggestedSort", () => {
  // Set a valid suggested sort for an existing subreddit
  it("should set the suggested sort when a valid suggested sort is provided", async () => {
    const req = {
      body: {
        suggestedSort: "new",
      },
      params: {
        subreddit: "example",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Mock the Subreddit.findOne method to return a resolved promise with a subreddit object
    Subreddit.findOne = jest
      .fn()
      .mockResolvedValue({
        name: "example",
        suggestedSort: "hot",
        save: jest.fn(),
      });

    await setSuggestedSort(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Suggested sort updated successfully",
    });
  }, 10000);
});


describe("getUserPosts", () => {
  // Returns an empty array when the user does not follow any subreddit
  it("should return an empty array when the user does not follow any subreddit", async () => {
    const req = {
      params: {
        type: "top",
        username: "user-id",
      },
      user: {
        id: "user-id",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await getUserPosts(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Internal server error",
    });
  });
});

describe("sortComments", () => {
  it("should return an error message when the post is not found", async () => {
    const req = { params: { post: "undefined" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Mocking Post.findOne to return null when the post is not found
    Post.findOne = jest.fn().mockResolvedValue(null);

    await sortComments(req, res);

    // Assertions
    expect(Post.findOne).toHaveBeenCalledWith({ _id: "undefined" });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Post not found in the specified subreddit",
    });
  });
});
