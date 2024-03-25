// Returns a 404 response if subreddit not found
it("should return a 404 response if subreddit not found", async () => {
  const subredditModel = require("../../models/subredditModel");
  const Post = require("../../models/postModel");
  const listingController = require("./listingController");

  const subredditName = "testSubreddit";
  const subreddit = null;

  subredditModel.findOne = jest.fn().mockResolvedValue(subreddit);

  const req = { params: { subreddit: subredditName } };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  await listingController.getTopPosts(req, res);

  expect(subredditModel.findOne).toHaveBeenCalledWith({ name: subredditName });
  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({
    success: false,
    message: "Subreddit not found",
  });
});
