// Import dependencies and modules
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/userModel");
const Community = require("../models/subredditModel");
const { addUserToSubbreddit } = require("../controller/friends/friendController");
const { verifyToken } = require("../utils/tokens");

// Mock the split method on the String prototype
String.prototype.split = jest.fn();

// Mock the verifyToken function
jest.mock("../utils/tokens");

// Mock the Community and User models
jest.mock("../models/userModel");
jest.mock("../models/subredditModel");

// Import the functions to test
const {
  newSubreddit,
  availableSubreddit,
  createSubreddit,
} = require("../controller/friends/subredditsController");

describe("newSubreddit function", () => {
  it("should create subreddit and update user subreddits when token and user exist", async () => {
    // Mock request and response objects
    const req = {
      headers: {
        authorization: "Bearer token123",
      },
      body: {
        name: "testSubreddit",
        over18: false,
        description: "Test subreddit",
        privacyMode: "public",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Mock token and user data
    const token = "token123";
    const decoded = { userId: "user123" };
    const user = { username: "testUser" };
    const result = {
      success: true,
      response: "Subreddit created successfully",
      communityName: "testSubreddit_testUser",
    };

    // Mock necessary functions and values
    verifyToken.mockResolvedValueOnce(decoded);
    User.findOne.mockResolvedValueOnce(user);
    createSubreddit.mockResolvedValueOnce(result);
    addUserToSubbreddit.mockResolvedValueOnce();

    // Execute the function
    await newSubreddit(req, res);

    // Assertions
    expect(verifyToken).toHaveBeenCalledWith(token);
    expect(User.findOne).toHaveBeenCalledWith({ _id: decoded.userId });
    expect(createSubreddit).toHaveBeenCalledWith(req.body, user);
    expect(addUserToSubbreddit).toHaveBeenCalledWith(
      user,
      result.communityName
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: result.response,
      communityName: result.communityName,
    });
  });
});

describe("createSubreddit function", () => {
  it("should create a subreddit successfully with valid input data", async () => {
    // Mock the availableSubreddit function
    const availableSubreddit = jest.fn().mockResolvedValueOnce({
      success: true,
      subreddit: null,
    });

    // Mock the Community.create and User.findOneAndUpdate functions
    Community.create.mockResolvedValueOnce();
    User.findOneAndUpdate.mockResolvedValueOnce();

    // Mock input data and user
    const data = {
      name: "testSubreddit",
      over18: false,
      description: "Test subreddit description",
      privacyMode: "public",
    };
    const user = {
      username: "testUser",
    };

    // Call the createSubreddit function
    const result = await createSubreddit(data, user);

    // Assertions
    expect(result.success).toBe(true);
    expect(result.response).toBe("Subreddit created successfully");
    expect(result.communityName).toBe("testSubreddit_testUser");
    expect(availableSubreddit).toHaveBeenCalledWith("testSubreddit");
    expect(Community.create).toHaveBeenCalledWith({
      name: "testSubreddit",
      isOver18: false,
      description: "Test subreddit description",
      privacyMode: "public",
      moderators: [
        {
          subreddit: "testSubreddit",
          username: "testUser",
          role: "creator",
        },
      ],
      members: [
        {
          subreddit: "testSubreddit",
          username: "testUser",
        },
      ],
    });
    expect(User.findOneAndUpdate).toHaveBeenCalledWith(
      { username: "testUser" },
      {
        $push: {
          subreddits: {
            subreddit: "testSubreddit",
            role: "creator",
          },
          members: { subreddit: "testSubreddit" },
          moderators: { subreddit: "testSubreddit" },
        },
      }
    );
  });
});

describe("availableSubreddit function", () => {
  it("should return success true and null subreddit when the subreddit is not found in the database", async () => {
    // Mock the Community.findOne function
    const existingSubreddit = null;
    Community.findOne.mockResolvedValueOnce(existingSubreddit);

    // Call the availableSubreddit function
    const subreddit = "nonexistentSubreddit";
    const result = await availableSubreddit(subreddit);

    // Assertions
    expect(result.success).toBe(true);
    expect(result.subreddit).toBeNull();
  });

  it("should return success false and existing subreddit when the subreddit is found in the database", async () => {
    // Mock the Community.findOne function
    const existingSubreddit = { name: "existingSubreddit" };
    Community.findOne.mockResolvedValueOnce(existingSubreddit);

    // Call the availableSubreddit function
    const subreddit = "existingSubreddit";
    const result = await availableSubreddit(subreddit);

    // Assertions
    expect(result.success).toBe(false);
    expect(result.subreddit).toEqual(existingSubreddit);
  });
});
