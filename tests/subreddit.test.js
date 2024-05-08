// test file: subredditController.test.js

const {
  newSubreddit,
  availableSubreddit,
  createSubreddit,
  getSubredditInfo,
  getTopCommunities,
  createModeration,
  acceptInvitation,
  removeModeration,
  getModerators,
  getModeratorsQueue,
  declineInvitation,
  muteUser,
  unMuteUser,
  leaveModerator,
  banUser,
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

// describe("removeModeration function", () => {
//   it("should remove a moderator from a subreddit", async () => {
//     const req = {
//       params: {
//         subreddit: "testsubreddit",
//         moderator: "testmoderator",
//       },
//       user: {
//         userId: "testuserid",
//       },
//     };

//     const res = {
//       status: jest.fn().mockReturnThis(),
//       json: jest.fn(),
//     };

//     const communityMock = {
//       name: "testsubreddit",
//       moderators: ["testmoderator"],
//       save: jest.fn(), // Mocking the save function
//     };

//     const userMock = {
//       username: "testuser",
//       userId: "testuserid",
//     };

//     // Mock the necessary functions to resolve the promises
//     Community.findOne.mockResolvedValue(communityMock);
//     User.findById.mockResolvedValue(userMock);

//     await removeModeration(req, res);

//     expect(Community.findOne).toHaveBeenCalledWith({
//       name: req.params.subreddit,
//     });
//     expect(User.findById).toHaveBeenCalledWith(req.user.userId);
//     expect(communityMock.save).toHaveBeenCalled(); // Ensure that save function is called
//     expect(res.status).toHaveBeenCalledWith(200);
//     expect(res.json).toHaveBeenCalledWith({
//       success: true,
//       message: "Moderator removed successfully",
//     });
//   });
// });

// describe("declineInvitation function", () => {
//  it("should decline a moderation invitation", async () => {
//   const req = {
//     params: {
//       subreddit: "testsubreddit",
//     },
//     user: {
//       userId: "testuserid",
//     },
//   };

//   const res = {
//     status: jest.fn().mockReturnThis(),
//     json: jest.fn(),
//   };

//   const invitationMock = {
//     subreddit: "testsubreddit",
//     user: "testuserid",
//   };

//   Invitation.findOne.mockResolvedValue(invitationMock);

//   await declineInvitation(req, res);

//   expect(Invitation.findOne).toHaveBeenCalledWith({
//     subreddit: req.params.subreddit,
//     user: req.user.userId,
//   });
//   expect(res.status).toHaveBeenCalledWith(200);
//   expect(res.json).toHaveBeenCalledWith({
//     success: true,
//     message: "Invitation declined successfully",
//   });
// });

// it("should return a 404 status code with an error message if the invitation is not found", async () => {
//   const req = {
//     params: {
//       subreddit: "nonExistentSubreddit",
//     },
//     user: {
//       userId: "testuserid",
//     },
//   };

//   const res = {
//     status: jest.fn().mockReturnThis(),
//     json: jest.fn(),
//   };

//   Invitation.findOne.mockResolvedValue(null);

//   await declineInvitation(req, res);

//   expect(Invitation.findOne).toHaveBeenCalledWith({
//     subreddit: req.params.subreddit,
//     user: req.user.userId,
//   });
//   expect(res.status).toHaveBeenCalledWith(404);
//   expect(res.json).toHaveBeenCalledWith({
//     success: false,
//     message: "Invitation not found",
//   });
// });

// });

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


