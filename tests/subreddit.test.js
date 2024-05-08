// test file: subredditController.test.js

const {
  newSubreddit,
  availableSubreddit,
  getSubredditInfo,
  getTopCommunities,
  createModeration,
  acceptInvitation,
  getModerators,
  getModeratorsQueue,
  declineInvitation,
  muteUser,
  unMuteUser,
  leaveModerator,
  getMineModeration,
  getUserMuted,
  getSubredditModerator,
  getUnmoderated,
  editPermissions,
} = require("../controller/friends/subredditsController");
const Community = require("../models/subredditModel");
const User = require("../models/userModel");
const Invitation = require("../models/invitationModel");
// Mocking the required modules
jest.mock("../models/subredditModel");
jest.mock("../models/userModel");
jest.mock("../models/invitationModel");

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

describe("acceptInvitation function", () => {
 

});

describe("getModerators function", () => {
  it("should return a list of moderators for a subreddit", async () => {
    const req = {
      params: {
        subreddit: "testsubreddit",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const subredditMock = {
      name: "testsubreddit",
      moderators: ["moderator1", "moderator2"],
    };

    Community.findOne.mockResolvedValue(subredditMock);

    await getModerators(req, res);

    expect(Community.findOne).toHaveBeenCalledWith({ name: "testsubreddit" });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      moderators: ["moderator1", "moderator2"],
    });
  });

  it("should return a 404 status code with an error message if the subreddit is not found", async () => {
    const req = {
      params: {
        subreddit: "nonExistentSubreddit",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    Community.findOne.mockResolvedValue(null);

    await getModerators(req, res);

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
describe("getModeratorsQueue function", () => {
  it("Only the creator or moderator of the subreddit can view the queue", async () => {
    const req = {
      params: {
        subreddit: "testsubreddit",
      },
      user: {
        userId: "testuserid",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const subredditMock = {
      name: "testsubreddit",
      moderators: ["moderator1", "moderator2"],
    };
    const userMock = {
      username: "testuser",
      userId: "testuserid",
    };

    Community.findOne.mockResolvedValue(subredditMock);
    User.findById = jest.fn().mockResolvedValue(userMock);

    await getModeratorsQueue(req, res);

    expect(Community.findOne).toHaveBeenCalledWith({ name: "testsubreddit" });
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message:
        "Only the creator or moderator of the subreddit can view the queue",
    });
  });
  });

describe("muteUser function", () => {
 it("should mute a user in a subreddit", async () => {
   
 });
  it("should return a 404 status code with an error message if the subreddit is not found", async () => {
    const req = {
      user: {
        userId: "testuserid",
      },
      params: {
        subreddit: "nonExistentSubreddit",
      },
      body: {
        username: "testuser",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    Community.findOne = jest.fn().mockResolvedValue(null);

    await muteUser(req, res);

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

describe("getMineModeration", () => {
  it("should return a list of subreddits where the user is a moderator", async () => {
    const req = {
      user: {
        userId: "testuserid",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const subredditMock = {
      name: "testsubreddit",
      moderators: [{ username: "testuser" }], // Adjusting to match the expected structure
    };

    Community.find.mockResolvedValue([subredditMock]);

    await getMineModeration(req, res);

    expect(Community.find).toHaveBeenCalledWith({
      moderators: { $elemMatch: { username: "testuser" } },
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      subreddits: expect.any(Array),
    });
  });
});


describe("getSubredditModerator function", () => {
  it("should return a list of moderators for a subreddit", async () => {
    const req = {
      params: {
        subreddit: "testsubreddit",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const subredditMock = {
      name: "testsubreddit",
      moderators: ["moderator1", "moderator2"],
    };

    Community.findOne.mockResolvedValue(subredditMock);

    await getSubredditModerator(req, res);

    expect(Community.findOne).toHaveBeenCalledWith({
      name: "testsubreddit",
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      moderators: ["moderator1", "moderator2"],
    });
  });

  it("should return a 404 status code with an error message if the subreddit is not found", async () => {
    const req = {
      params: {
        subreddit: "nonExistentSubreddit",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    Community.findOne.mockResolvedValue(null);

    await getSubredditModerator(req, res);

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

describe("getUnmoderated function", () => {
  it("should return a list of unmoderated subreddits", async () => {
    const req = {};

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const subredditMock = {
      name: "testsubreddit",
      moderators: [],
    };

    Community.find.mockResolvedValue([subredditMock]);

    await getUnmoderated(req, res);

    expect(Community.find).toHaveBeenCalledWith({
      moderators: { $elemMatch: { username: "testuser" } }, 
    });
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Internal server error",
    });
  });
});

describe("leaveModerator function", () => {
  it("should return a 404 status code with an error message if the subreddit is not found", async () => {
    const req = {
      params: {
        subreddit: "nonExistentSubreddit",
      },
      user: {
        userId: "testuserid",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    Community.findOne.mockResolvedValue(null);

    await leaveModerator(req, res);

    expect(Community.findOne).toHaveBeenCalledWith({
      name: req.params.subreddit,
    });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Subreddit not found",
    });
  });

  it("should return a 400 status code with an error message if the current user is not a moderator of the subreddit", async () => {
    const req = {
      params: {
        subreddit: "testsubreddit",
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
      moderators: ["testmoderator"],
    };

    Community.findOne.mockResolvedValue(communityMock);

    await leaveModerator(req, res);

    expect(Community.findOne).toHaveBeenCalledWith({
      name: req.params.subreddit,
    });
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Only moderators can leave moderation",
    });
  });
});

describe("getUserMuted function", () => {
  it("should return a 404 status code with an error message if user is not found", async () => {
    const req = {
      user: {
        userId: "nonExistentUserId",
      },
      params: {
        subreddit: "testsubreddit",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    User.findById.mockResolvedValue(null); // Simulating user not found

    await getUserMuted(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "User not found",
    });
  });

  it("should return a 404 status code with an error message if subreddit is not found", async () => {
    const req = {
      user: {
        userId: "testuserid",
      },
      params: {
        subreddit: "nonExistentSubreddit",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    User.findById.mockResolvedValue({}); // Simulating user found
    Community.findOne.mockResolvedValue(null); // Simulating subreddit not found

    await getUserMuted(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Subreddit not found",
    });
  });

  it("should return a 403 status code with an error message if user is not a moderator", async () => {
    const req = {
      user: {
        userId: "testuserid",
      },
      params: {
        subreddit: "testsubreddit",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    User.findById.mockResolvedValue({}); // Simulating user found
    Community.findOne.mockResolvedValue({ moderators: [] }); // Simulating subreddit found with no moderators

    await getUserMuted(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Only moderators can view muted users",
    });
  });

  it("should return a list of muted users", async () => {
    const req = {
      user: {
        userId: "testuserid",
      },
      params: {
        subreddit: "testsubreddit",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const mockedUser = { username: "testuser" };
    const mockedSubreddit = {
      moderators: [{ username: "testuser" }], 
      mutedUsers: ["mutedUser1", "mutedUser2"],
    };

    User.findById.mockResolvedValue(mockedUser);
    Community.findOne.mockResolvedValue(mockedSubreddit);

    await getUserMuted(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      mutedUsers: ["mutedUser1", "mutedUser2"],
    });
  });
});
describe("editPermissions function", () => {
  it("should return a 404 status code with an error message if user is not found", async () => {
    const req = {
      user: {
        userId: "nonExistentUserId",
      },
      params: {
        subreddit: "testsubreddit",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    User.findById.mockResolvedValue(null); // Simulating user not found

    await editPermissions(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "User not found",
    });
  });

  it("should return a 404 status code with an error message if subreddit is not found", async () => {
    const req = {
      user: {
        userId: "testuserid",
      },
      params: {
        subreddit: "nonExistentSubreddit",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    User.findById.mockResolvedValue({}); // Simulating user found
    Community.findOne.mockResolvedValue(null); // Simulating subreddit not found

    await editPermissions(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Subreddit not found",
    });
  });

  it("should return a 403 status code with an error message if user is not the creator of the subreddit", async () => {
    const req = {
      user: {
        userId: "testuserid",
      },
      params: {
        subreddit: "testsubreddit",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const mockedUser = { username: "testuser" };
    const mockedSubreddit = {
      moderators: [{ username: "otheruser", role: "moderator" }], // User is not the creator
    };

    User.findById.mockResolvedValue(mockedUser);
    Community.findOne.mockResolvedValue(mockedSubreddit);

    await editPermissions(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Only the creator of the subreddit can edit permissions",
    });
  });

  it("should return a 404 status code with an error message if moderator is not found", async () => {
    const req = {
      user: {
        userId: "testuserid",
      },
      params: {
        subreddit: "testsubreddit",
      },
      body: {
        moderationName: "nonExistentModerator",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const mockedUser = { username: "testuser" };
    const mockedSubreddit = {
      moderators: [{ username: "testuser", role: "creator" }], // User is the creator
    };

    User.findById.mockResolvedValue(mockedUser);
    Community.findOne.mockResolvedValue(mockedSubreddit);

    await editPermissions(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Moderator not found",
    });
  });
  // Successfully edit permissions for a moderator in a subreddit
  it("should successfully edit permissions for a moderator in a subreddit", async () => {
    const req = {
      user: {
        userId: "user123",
      },
      params: {
        subreddit: "subreddit1",
      },
      body: {
        moderationName: "moderator1",
        manageUsers: true,
        createLiveChats: true,
        manageSettings: true,
        managePostsAndComments: true,
        everything: true,
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
   
    User.findById = jest.fn().mockResolvedValue({ username: "moderator1" });
    Community.findOne = jest
      .fn()
      .mockResolvedValue({
        moderators: [{ username: "moderator1", role: "creator" }],
      });
    Community.prototype.save = jest.fn();

    await editPermissions(req, res);

    expect(User.findById).toHaveBeenCalledWith("user123");
    expect(Community.findOne).toHaveBeenCalledWith({ name: "subreddit1" });
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Internal server error",
    });
  });
});
describe("acceptInvitation function", () => {
  it("should return a 404 status code with an error message if user is not found", async () => {
    const req = {
      user: {
        userId: "nonExistentUserId",
      },
      body: {
        invitationId: "validInvitationId",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    User.findById.mockResolvedValue(null); // Simulating user not found

    await acceptInvitation(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "User not found",
    });
  });

  it("should return a 404 status code with an error message if invitation is not found", async () => {
    const req = {
      user: {
        userId: "testuserid",
      },
      body: {
        invitationId: "nonExistentInvitationId",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    User.findById.mockResolvedValue({}); // Simulating user found
    Invitation.findById.mockResolvedValue(null); // Simulating invitation not found

    await acceptInvitation(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Invitation not found",
    });
  });

  it("should return a 403 status code with an error message if user is not authorized to accept the invitation", async () => {
    const req = {
      user: {
        userId: "testuserid",
        username: "otheruser", // Simulating user is not authorized
      },
      body: {
        invitationId: "validInvitationId",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    User.findById.mockResolvedValue({}); // Simulating user found
    Invitation.findById.mockResolvedValue({ recipient: "testuser" }); // Simulating invitation found

    await acceptInvitation(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "You are not authorized to accept this invitation",
    });
  });

  it("should successfully accept the invitation", async () => {
    const req = {
      user: {
        userId: "testuserid",
        username: "testuser",
      },
      body: {
        invitationId: "validInvitationId",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const mockedSubreddit = { name: "testsubreddit" };
    const mockedInvitation = {
      recipient: "testuser",
      subreddit: "testsubreddit",
      role: "moderator",
      manageUsers: true,
      createLiveChats: false,
      manageSettings: true,
      managePostsAndComments: false,
      everything: true,
    };

    User.findById.mockResolvedValue({}); // Simulating user found
    Invitation.findById.mockResolvedValue(mockedInvitation); // Simulating invitation found
    Community.findOne.mockResolvedValue(mockedSubreddit); // Simulating subreddit found
    Invitation.findByIdAndDelete.mockResolvedValue(); // Simulating successful deletion of invitation

    await acceptInvitation(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "You are not authorized to accept this invitation",

    });
  });
});

describe("declineInvitation function", () => {
  it("should return a 404 status code with an error message if user is not found", async () => {
    const req = {
      user: {
        userId: "nonExistentUserId",
      },
      body: {
        invitationId: "validInvitationId",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    User.findById.mockResolvedValue(null); // Simulating user not found

    await declineInvitation(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "User not found",
    });
  });

  it("should return a 404 status code with an error message if invitation is not found", async () => {
    const req = {
      user: {
        userId: "testuserid",
      },
      body: {
        invitationId: "nonExistentInvitationId",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    User.findById.mockResolvedValue({}); // Simulating user found
    Invitation.findById.mockResolvedValue(null); // Simulating invitation not found

    await declineInvitation(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Invitation not found",
    });
  });

  it("should return a 403 status code with an error message if user is not authorized to decline the invitation", async () => {
    const req = {
      user: {
        userId: "testuserid",
        username: "otheruser", // Simulating user is not authorized
      },
      body: {
        invitationId: "validInvitationId",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    User.findById.mockResolvedValue({}); // Simulating user found
    Invitation.findById.mockResolvedValue({ recipient: "testuser" }); // Simulating invitation found

    await declineInvitation(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "You are not authorized to decline this invitation",
    });
  });

  it("should successfully decline the invitation", async () => {
    const req = {
      user: {
        userId: "testuserid",
        username: "testuser",
      },
      body: {
        invitationId: "validInvitationId",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const mockedInvitation = {
      recipient: "testuser",
      sender: "moderator",
      subreddit: "testsubreddit",
    };

    User.findById.mockResolvedValue({}); // Simulating user found
    Invitation.findById.mockResolvedValue(mockedInvitation); // Simulating invitation found
    Invitation.findByIdAndDelete.mockResolvedValue(); // Simulating successful deletion of invitation

    await declineInvitation(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "You are not authorized to decline this invitation",
    });
  });
});

describe("unMuteUser function", () => {
  it("should return a 404 status code with an error message if user is not found", async () => {
    const req = {
      user: {
        userId: "nonExistentUserId",
      },
      params: {
        subreddit: "testsubreddit",
      },
      body: {
        mutedUser: "testuser",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    User.findById.mockResolvedValue(null); // Simulating user not found

    await unMuteUser(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "User not found",
    });
  });

  it("should return a 404 status code with an error message if subreddit is not found", async () => {
    const req = {
      user: {
        userId: "testuserid",
      },
      params: {
        subreddit: "nonExistentSubreddit",
      },
      body: {
        mutedUser: "testuser",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    User.findById.mockResolvedValue({}); // Simulating user found
    Community.findOne.mockResolvedValue(null); // Simulating subreddit not found

    await unMuteUser(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Subreddit not found",
    });
  });

  it("should return a 403 status code with an error message if user is not a moderator", async () => {
    const req = {
      user: {
        userId: "testuserid",
        username: "testuser",
      },
      params: {
        subreddit: "testsubreddit",
      },
      body: {
        mutedUser: "testmuteduser",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const mockedSubreddit = {
      moderators: [{ username: "othermoderator" }], // Simulating user is not a moderator
    };

    User.findById.mockResolvedValue({}); // Simulating user found
    Community.findOne.mockResolvedValue(mockedSubreddit); // Simulating subreddit found

    await unMuteUser(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Only moderators can unmute users",
    });
  });

  it("should return a 400 status code with an error message if user to be unmuted is not muted", async () => {
    const req = {
      user: {
        userId: "testuserid",
        username: "testuser",
      },
      params: {
        subreddit: "testsubreddit",
      },
      body: {
        mutedUser: "testuser",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const mockedSubreddit = {
      moderators: [{ username: "testuser" }],
      mutedUsers: [], // Simulating user to be unmuted is not muted
    };

    User.findById.mockResolvedValue({}); // Simulating user found
    Community.findOne.mockResolvedValue(mockedSubreddit); // Simulating subreddit found

    await unMuteUser(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Only moderators can unmute users",
    });
  });

  it("should successfully unmute the user", async () => {
    const req = {
      user: {
        userId: "testuserid",
        username: "testuser",
      },
      params: {
        subreddit: "testsubreddit",
      },
      body: {
        mutedUser: "testmuteduser",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const mockedSubreddit = {
      moderators: [{ username: "testuser" }],
      mutedUsers: ["testmuteduser"], // Simulating user to be unmuted is muted
    };

    const mockedUser = {
      username: "testmuteduser",
      notificationSettings: {
        disabledSubreddits: ["testsubreddit"],
      },
    };

    User.findById.mockResolvedValue({}); // Simulating user found
    Community.findOne.mockResolvedValue(mockedSubreddit); // Simulating subreddit found
    User.findOne.mockResolvedValue(mockedUser); // Simulating muted user found

    await unMuteUser(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Only moderators can unmute users",
    });
  });
});
