const subredditModel = require("../models/subredditModel");
const {
  getTopPosts,
} = require("../controller/listing/listingController");

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

