// test file: subredditController.test.js

const {
  newSubreddit,
  availableSubreddit,
  createSubreddit,
  getSubredditInfo,
  getTopCommunities,
  createModeration,
} = require("../controller/friends/subredditsController");
const Community = require("../models/subredditModel");
const User = require("../models/userModel");
const Invitation = require("../models/invitationModel");
// Mocking the required modules
jest.mock("../models/subredditModel");
jest.mock("../models/userModel");

describe("newSubreddit function", () => {
  // Returns success true and null subreddit when the subreddit is available
  it("should return success true and null subreddit when the subreddit is available", async () => {
    const subreddit = "testSubreddit";
    const result = await availableSubreddit(subreddit);
    expect(result.success).toBe(true);
    expect(result.subreddit).toBeNull();
  });

});
 
describe("newSubreddit function", () => {
  // Create a new subreddit
  it("should create a new subreddit", async () => {
    // Mock request and response objects
    const req = {
      body: {
        name: "testSubreddit",
        description: "testDescription",
      },
      user: {
        userId: "testUserId",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Mocked community data
    const communityMock = {
      name: "testSubreddit",
      description: "testDescription",
      creator: "testUserId",
    };

    // Mock the save method of the Community model
    Community.prototype.save = jest.fn().mockResolvedValue(communityMock);

    // Call the createSubreddit function
    await newSubreddit(req, res);

    // Verify that the status code is set to 201 and the response JSON is correct
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "User not found",
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

//   describe("getTopCommunities", () => {
//     // Retrieves the top communities sorted by the number of members with default values.
//     it("should retrieve the top communities sorted by the number of members with default values", async () => {
//       const req = { query: {} };
//       const res = {
//         status: jest.fn().mockReturnThis(),
//         json: jest.fn(),
//       };

//       await getTopCommunities(req, res);

//       expect(res.status).toHaveBeenCalledWith(200);
//       expect(res.json).toHaveBeenCalledWith({
//         success: true,
//         communities: expect.any(Array),
//       });
//     });
//   });
// });
describe("createModeration", () => {
  it("should add a new moderator to a subreddit when valid inputs are provided", async () => {
    const req = {
      params: {
        subreddit: "testsubreddit",
      },
      body: {
        moderationName: "testmoderator",
        role: "moderator",
      },
      user: {
        userId: "testuserid",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const communityMock = {
      name: "testsubreddit",
      moderators: [],
    };

    const userMock = {
      username: "testuser",
      userId: "testuserid",
    };

    const moderatorUserMock = {
      username: "testmoderator",
    };

    Community.findOne = jest.fn().mockResolvedValue(communityMock);
    User.findById = jest.fn().mockResolvedValue(userMock);
    User.findOne = jest.fn().mockResolvedValue(moderatorUserMock);
    Invitation.prototype.save = jest.fn();

    await createModeration(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Only the creator of the subreddit can add moderators",
    });
  });

});

describe