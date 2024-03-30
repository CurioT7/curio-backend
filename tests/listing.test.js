const subredditModel = require("../models/subredditModel");
const Post = require("../models/postModel");
const {
  randomPost,
  getTopPosts,
  getTopPostsbytime,
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

    const subredditModel = require("../../models/subredditModel");
    const Post = require("../../models/postModel");

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

    const subredditModel = require("../../models/subredditModel");
    const Post = require("../../models/postModel");

    subredditModel.findOne = jest.fn().mockResolvedValue(null);

    await hotPosts(req, res);

    expect(subredditModel.findOne).toHaveBeenCalledWith({ name: 'invalidSubreddit' });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "Subreddit not found" });
  });