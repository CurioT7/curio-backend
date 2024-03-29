const subredditModel = require("../models/subredditModel");
const Post = require("../models/postModel");
const { randomPost } = require("../controller/listing/listingController");

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
