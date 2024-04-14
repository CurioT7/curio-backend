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
  
describe("sortComments", () => {
  // Returns sorted comments based on specified type
  it("should return sorted comments based on specified type", async () => {
    const req = {
      params: {
        subreddit: "testSubreddit",
        postID: "testPostID",
        type: "top",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const subreddit = { _id: "testSubredditID" };
    const post = { _id: "testPostID", linkedSubreddit: "testSubredditID" };
    const comments = [{ upvotes: 5 }, { upvotes: 3 }, { upvotes: 7 }];

    // Define getTopComments properly as a jest.fn() mock
    const getTopComments = jest.fn().mockResolvedValue(comments);

    Subreddit.findOne = jest.fn().mockResolvedValue(subreddit);
    Post.findOne = jest.fn().mockResolvedValue(post);

    // Use the defined getTopComments function
    await sortComments(req, res, getTopComments);

    expect(Subreddit.findOne).toHaveBeenCalledWith({ name: "testSubreddit" });
    expect(Post.findOne).toHaveBeenCalledWith({
      _id: "testPostID",
      linkedSubreddit: "testSubredditID",
    });
    expect(getTopComments).toHaveBeenCalledWith(
      "testSubredditID",
      "testPostID"
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, comments });
  });
});
describe("getUserPosts", () => {
  // Returns the top posts for every subreddit that the user follows when the request is valid and authorized.
  it("should return the top posts for every subreddit that the user follows when the request is valid and authorized", async () => {
    // Mocking dependencies
    const req = {
      headers: {
        authorization: "Bearer token",
      },
      params: {
        type: "top",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const token = "token";
    const decoded = { userId: "user-id" };
    const user = {
      subreddits: [
        { subreddit: "subreddit1", name: "Subreddit 1" },
        { subreddit: "subreddit2", name: "Subreddit 2" },
      ],
    };
    const posts = [
      { _id: "post1", upvotes: 10 },
      { _id: "post2", upvotes: 5 },
    ];

    // Mocking functions
    req.headers.authorization.split = jest
      .fn()
      .mockReturnValue(["Bearer", token]);
    verifyToken = jest.fn().mockResolvedValue(decoded);
    User.findOne = jest.fn().mockResolvedValue(user);
    Post.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        then: jest.fn().mockResolvedValue(posts),
      }),
    });
    Post.updateOne = jest.fn().mockResolvedValue();

    // Calling the function
    await getUserPosts(req, res);

    // Assertions
    expect(req.headers.authorization.split).toHaveBeenCalledWith(" ");
    expect(verifyToken).toHaveBeenCalledWith(token);
    expect(User.findOne).toHaveBeenCalledWith({ _id: decoded.userId });
    expect(Post.find).toHaveBeenCalledWith({ linkedSubreddit: "subreddit1" });
    expect(Post.find).toHaveBeenCalledWith({ linkedSubreddit: "subreddit2" });
    expect(Post.find().sort).toHaveBeenCalledWith({ upvotes: -1 });
    expect(Post.updateOne).toHaveBeenCalledWith(
      { _id: "post1" },
      { $inc: { views: 1 } }
    );
    expect(Post.updateOne).toHaveBeenCalledWith(
      { _id: "post2" },
      { $inc: { views: 1 } }
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      posts: [
        { subreddit: "Subreddit 1", post: { _id: "post1", upvotes: 10 } },
        { subreddit: "Subreddit 2", post: { _id: "post2", upvotes: 5 } },
      ],
    });
  });
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