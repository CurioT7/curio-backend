// test file: subredditController.test.js

const {
  newSubreddit,
  availableSubreddit,
  createSubreddit,
  getSubredditInfo,
  getTopCommunities,
} = require("../controller/friends/subredditsController");
const Community = require("../models/subredditModel");
const User = require("../models/userModel");

// Mocking the required modules
jest.mock("../models/subredditModel");
jest.mock("../models/userModel");

  describe("newSubreddit", () => {
    // Create new subreddit with provided data
    it("should return 401 Unauthorized when invalid token provided in headers", async () => {
      const req = {
        headers: {
          authorization: "Bearer invalidToken",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      await newSubreddit(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Unauthorized",
      });
    });
  });

  describe("availableSubreddit", () => {
    // Returns success true and null subreddit when the subreddit is available
    it("should return success true and null subreddit when the subreddit is available", async () => {
      const subreddit = "testSubreddit";
      const result = await availableSubreddit(subreddit);
      expect(result.success).toBe(true);
      expect(result.subreddit).toBeNull();
    });
  });

  describe("Subreddit Controller", () => {

  describe("getSubredditInfo", () => {
    // Return a 404 status code with an error message if the subreddit is not found in the database.
    it("should return a 404 status code with an error message when the subreddit is not found", async () => {
      const req = { params: { subreddit: "nonExistentSubreddit" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      Community.findOne = jest.fn().mockResolvedValue(null);

      await getSubredditInfo(req, res);

      expect(Community.findOne).toHaveBeenCalledWith({
        name: "nonExistentSubreddit",
      });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Subreddit not found",
      });
    });
  });

  describe("getTopCommunities", () => {
    // Retrieves the top communities sorted by the number of members with default values.
    it("should retrieve the top communities sorted by the number of members with default values", async () => {
      const req = { query: {} };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await getTopCommunities(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        communities: expect.any(Array),
      });
    });
  });
});
