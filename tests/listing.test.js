const subredditModel = require("../models/subredditModel");
const {
  getTopPosts,
  getTopPostsbytime,
} = require("../controller/listing/listingController");
    const moment = require("moment");

describe("getTopPosts", () => {
  it("should return a 404 response if subreddit not found", async () => {
    // Mock the subredditModel.findOne function to return null (subreddit not found)
    subredditModel.findOne = jest.fn().mockResolvedValue(null);

    const subredditName = "testSubreddit";
    const req = { params: { subreddit: subredditName } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await getTopPosts(req, res);

    // Verify that subredditModel.findOne was called with the correct parameters
    expect(subredditModel.findOne).toHaveBeenCalledWith({
      name: subredditName,
    });

    // Verify that the response status is set to 404 and the appropriate message is sent
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
