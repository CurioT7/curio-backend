// test file: subredditController.test.js

const {
  newSubreddit,
  availableSubreddit,
  createSubreddit,
  getSubredditInfo,
  getTopCommunities,
} = require("../controller/friends/subredditsController");
const{getCommunitiesByCategory}=require("../controller/community/categoryController");
const Community = require("../models/subredditModel");
const User = require("../models/userModel");
const { s3, sendFileToS3, getFilesFromS3 } = require("../utils/s3-bucket");
const { getVoteStatusAndSubredditDetails } = require("../../utils/posts");
const { verifyToken, authorizeUser } = require("../utils/tokens");

const Post = require("../models/postModel");
const Comment = require("../models/commentModel");
const Subreddit = require("../models/subredditModel");

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

    // Should return a status code of 400 when category parameter is missing
    it('should return a status code of 400 when category parameter is missing', async () => {
      const req = { body: {} };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await getCommunitiesByCategory(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: "Category parameter is required" });
    });
    // The test should simulate an error condition by mocking the 'Subreddit.find' function to throw an error. This will trigger the error handling code in 'getCommunitiesByCategory'.
    it('should handle errors thrown by the server', async () => {
      const req = { body: { category: 'testCategory' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Mock the Subreddit.find function to throw an error
      Subreddit.find = jest.fn().mockRejectedValue(new Error('Database error'));

      await getCommunitiesByCategory(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: "Internal server error" });
    });
    // Should return a success status code of 200
    it('should return communities belonging to a specified category', async () => {
      const req = { body: { category: 'testCategory' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Mock the Subreddit.find function to return a resolved promise immediately
      Subreddit.find = jest.fn().mockResolvedValue([]);

      await getCommunitiesByCategory(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, communities: expect.any(Array) });
    }, 10000);