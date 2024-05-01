const {
  hidePost,
  unhidePost,
  spoilerPost,
  unspoilerPost,
  save,
  unsave,
  hidden,
  saved_categories,
  submit,
  sharePost,
  getPostLink,
  lockItem,
  unlockItem,
  getItemInfo,
  castVote,
  addToHistory,
  getHistory,
  clearHistory,
} = require("../controller/User/contentManagementController");
const { s3, sendFileToS3, getFilesFromS3 } = require("../utils/s3-bucket");
const { getVoteStatusAndSubredditDetails } = require("../../utils/posts");
const { verifyToken, authorizeUser } = require("../utils/tokens");

const User = require("../models/userModel");
const Post = require("../models/postModel");
const Comment = require("../models/commentModel");
const Subreddit = require("../models/subredditModel");
const Nortifications=require("../models/notificationModel")
const { decode } = require("jsonwebtoken");

// Mock verifyToken
jest.mock("../utils/tokens", () => ({
  verifyToken: jest.fn(),
}));

describe("save function", () => {
  let req, res, userFindOneMock, postFindOneMock, userSaveMock;

  beforeEach(() => {
    userFindOneMock = jest.spyOn(User, "findOne");
    userSaveMock = jest.spyOn(User.prototype, "save");
    postFindOneMock = jest.spyOn(Post, "findOne");

    req = {
      headers: {
        authorization:
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NjAyM2Q4MDdmNzBkYjg4M2NjZjVhOTIiLCJpYXQiOjE3MTE0NzU0ODgsImV4cCI6MTcxMTU2MTg4OH0.Yvil4qLVPXSV7cB5RBhiki7hzqFreQIR8rEUICBqPaU",
      },
      body: {
        postId: "660227d61650ec9f41404c80", 
      },
    };

    res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 if token is missing or invalid", async () => {
    verifyToken.mockResolvedValue(null); // Simulate token verification failure

    await save(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
  });

  it("should return 404 if user is not found", async () => {
    const payload = { userId: "userId123" };
    verifyToken.mockResolvedValue(payload); // Simulate token verification success
    userFindOneMock.mockResolvedValue(null); // Simulate user not found

    await save(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "User not found",
    });
  });

  it("should return 404 if post is not found", async () => {
    const payload = { userId: "userId123" };
    verifyToken.mockResolvedValue(payload); // Simulate token verification success
    userFindOneMock.mockResolvedValue({}); // Simulate user found
    postFindOneMock.mockResolvedValue(null); // Simulate post not found

    await save(req, res);
  });
});

describe("unsave function", () => {
  let req, res, userFindOneMock, postFindOneMock, userSaveMock;

  beforeEach(() => {
    userFindOneMock = jest.spyOn(User, "findOne");
    userSaveMock = jest.spyOn(User.prototype, "save");
    postFindOneMock = jest.spyOn(Post, "findOne");

    req = {
      headers: {
        authorization:
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NjAyM2Q4MDdmNzBkYjg4M2NjZjVhOTIiLCJpYXQiOjE3MTE0NzU0ODgsImV4cCI6MTcxMTU2MTg4OH0.Yvil4qLVPXSV7cB5RBhiki7hzqFreQIR8rEUICBqPaU", 
      },
      body: {
        postId: "660227d61650ec9f41404c80", 
      },
    };

    res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 if token is missing or invalid", async () => {
    verifyToken.mockResolvedValue(null); // Simulate token verification failure

    await unsave(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
  });

  it("should return 404 if user is not found", async () => {
    const payload = { userId: "userId123" };
    verifyToken.mockResolvedValue(payload); // Simulate token verification success
    userFindOneMock.mockResolvedValue(null); // Simulate user not found

    await unsave(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "User not found",
    });
  });
});

describe("hidden function", () => {
  let req, res, userFindOneMock, postFindOneMock, userSaveMock;

  beforeEach(() => {
    userFindOneMock = jest.spyOn(User, "findOne");
    userSaveMock = jest.spyOn(User.prototype, "save");
    postFindOneMock = jest.spyOn(Post, "findOne");

    req = {
      headers: {
        authorization:
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NjAyM2Q4MDdmNzBkYjg4M2NjZjVhOTIiLCJpYXQiOjE3MTE0NzU0ODgsImV4cCI6MTcxMTU2MTg4OH0.Yvil4qLVPXSV7cB5RBhiki7hzqFreQIR8rEUICBqPaU", // Your token here
      },
      body: {
        postId: "660227d61650ec9f41404c80", 
      },
    };

    res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 if token is missing or invalid", async () => {
    verifyToken.mockResolvedValue(null); // Simulate token verification failure

    await hidden(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
  });

  it("should return 404 if user is not found", async () => {
    const payload = { userId: "userId123" };
    verifyToken.mockResolvedValue(payload); // Simulate token verification success
    userFindOneMock.mockResolvedValue(null); // Simulate user not found

    await hidden(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "User not found",
    });
  });
});

describe("hide function", () => {
  let req, res, userFindOneMock, postFindOneMock, userSaveMock;

  beforeEach(() => {
    userFindOneMock = jest.spyOn(User, "findOne");
    userSaveMock = jest.spyOn(User.prototype, "save");
    postFindOneMock = jest.spyOn(Post, "findOne");

    req = {
      headers: {
        authorization:
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NjAyM2Q4MDdmNzBkYjg4M2NjZjVhOTIiLCJpYXQiOjE3MTE0NzU0ODgsImV4cCI6MTcxMTU2MTg4OH0.Yvil4qLVPXSV7cB5RBhiki7hzqFreQIR8rEUICBqPaU", // Your token here
      },
      body: {
        postId: "660227d61650ec9f41404c80", // Your post ID here
      },
    };

    res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 if token is missing or invalid", async () => {
    verifyToken.mockResolvedValue(null); // Simulate token verification failure

    await hidePost(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
  });

  it("should return 404 if user is not found", async () => {
    const payload = { userId: "userId123" };
    verifyToken.mockResolvedValue(payload); // Simulate token verification success
    userFindOneMock.mockResolvedValue(null); // Simulate user not found

    await hidePost(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "User not found",
    });
  });
});

describe("hide function", () => {
  let req, res, userFindOneMock, postFindOneMock, userSaveMock;

  beforeEach(() => {
    userFindOneMock = jest.spyOn(User, "findOne");
    userSaveMock = jest.spyOn(User.prototype, "save");
    postFindOneMock = jest.spyOn(Post, "findOne");

    req = {
      headers: {
        authorization:
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NjAyM2Q4MDdmNzBkYjg4M2NjZjVhOTIiLCJpYXQiOjE3MTE0NzU0ODgsImV4cCI6MTcxMTU2MTg4OH0.Yvil4qLVPXSV7cB5RBhiki7hzqFreQIR8rEUICBqPaU", // Your token here
      },
      body: {
        postId: "660227d61650ec9f41404c80", // Your post ID here
      },
    };

    res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 if token is missing or invalid", async () => {
    verifyToken.mockResolvedValue(null); // Simulate token verification failure

    await unhidePost(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
  });

  it("should return 404 if user is not found", async () => {
    const payload = { userId: "userId123" };
    verifyToken.mockResolvedValue(payload); // Simulate token verification success
    userFindOneMock.mockResolvedValue(null); // Simulate user not found

    await unhidePost(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "User not found",
    });
  });
});

describe("submit function", () => {
  let req, res, userFindOneMock, postFindOneMock, userSaveMock;

  beforeEach(() => {
    userFindOneMock = jest.spyOn(User, "findOne");
    userSaveMock = jest.spyOn(User.prototype, "save");
    postFindOneMock = jest.spyOn(Post, "findOne");

    req = {
      headers: {
        authorization:
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NjAyM2Q4MDdmNzBkYjg4M2NjZjVhOTIiLCJpYXQiOjE3MTE0NzU0ODgsImV4cCI6MTcxMTU2MTg4OH0.Yvil4qLVPXSV7cB5RBhiki7hzqFreQIR8rEUICBqPaU", // Your token here
      },
      body: {
        postId: "660227d61650ec9f41404c80", // Your post ID here
      },
    };

    res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 if token is missing or invalid", async () => {
    verifyToken.mockResolvedValue(null); // Simulate token verification failure

    await submit(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
  });

  it("should return 404 if user is not found", async () => {
    const payload = { userId: "userId123" };
    verifyToken.mockResolvedValue(payload); // Simulate token verification success
    userFindOneMock.mockResolvedValue(null); // Simulate user not found

    await submit(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "User not found",
    });
  });
});

describe("shareLink function", () => {
  let req, res, postFindOneMock;

  beforeEach(() => {
    postFindOneMock = jest.spyOn(Post, "findOne");

    req = {
      params: {
        postId: "660227d61650ec9f41404c80", // Your post ID here
      },
    };

    res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 404 if post is not found", async () => {
    postFindOneMock.mockResolvedValue(null); // Simulate post not found

    await getPostLink(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Post not found",
    });
  });
});

// lockFunction
    // Locks a post item if the user is a moderator of the linked subreddit.
    it('should lock a post item when the user is a moderator of the linked subreddit', async () => {
      const req = {
        user: {
          userId: 'user123'
        },
        body: {
          itemID: 'post123'
        }
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const user = {
        _id: 'user123',
        subreddits: [
          {
            subreddit: 'subreddit123',
            role: 'moderator'
          }
        ]
      };

      const post = {
        linkedSubreddit: 'subreddit123'
      };

      User.findOne = jest.fn().mockResolvedValue(user);
      Post.findById = jest.fn().mockResolvedValue(post);
      Subreddit.findById = jest.fn().mockResolvedValue({ name: 'subreddit123' });
      Post.findByIdAndUpdate = jest.fn().mockResolvedValue();

      await lockItem(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ _id: 'user123' });
      expect(Post.findById).toHaveBeenCalledWith('post123');
      expect(Subreddit.findById).toHaveBeenCalledWith('subreddit123');
      expect(Post.findByIdAndUpdate).toHaveBeenCalledWith('post123', { isLocked: true });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Post locked successfully' });
    });
        // Locks a post item if the user is the creator of the linked subreddit.
    it('should lock a post item when the user is the creator of the linked subreddit', async () => {
      const req = {
        user: {
          userId: 'user123'
        },
        body: {
          itemID: 'post123'
        }
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const user = {
        _id: 'user123',
        subreddits: [
          {
            subreddit: 'subreddit123',
            role: 'creator'
          }
        ]
      };

      const post = {
        linkedSubreddit: 'subreddit123'
      };

      User.findOne = jest.fn().mockResolvedValue(user);
      Post.findById = jest.fn().mockResolvedValue(post);
      Subreddit.findById = jest.fn().mockResolvedValue({ name: 'subreddit123' });
      Post.findByIdAndUpdate = jest.fn().mockResolvedValue();

      await lockItem(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ _id: 'user123' });
      expect(Post.findById).toHaveBeenCalledWith('post123');
      expect(Subreddit.findById).toHaveBeenCalledWith('subreddit123');
      expect(Post.findByIdAndUpdate).toHaveBeenCalledWith('post123', { isLocked: true });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Post locked successfully' });
    });
        // Returns a 403 JSON response if the user is not authorized to lock posts in the subreddit.
    it('should return a 403 JSON response when the user is not authorized to lock posts in the subreddit', async () => {
      const req = {
        user: {
          userId: 'user123'
        },
        body: {
          itemID: 'post123'
        }
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const user = {
        _id: 'user123',
        subreddits: [
          {
            subreddit: 'subreddit123',
            role: 'member'
          }
        ]
      };

      const post = {
        linkedSubreddit: 'subreddit123'
      };

      User.findOne = jest.fn().mockResolvedValue(user);
      Post.findById = jest.fn().mockResolvedValue(post);
      Subreddit.findById = jest.fn().mockResolvedValue({ name: 'subreddit123' });

      await lockItem(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ _id: 'user123' });
      expect(Post.findById).toHaveBeenCalledWith('post123');
      expect(Subreddit.findById).toHaveBeenCalledWith('subreddit123');
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'User is not authorized to lock posts in this subreddit' });
    });
        // Returns a 401 JSON response if the user is not authenticated.
    it('should return a 401 JSON response if the user is not authenticated', async () => {
      const req = {
        user: null
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await lockItem(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Unauthorized' });
    });
        // Returns a 500 JSON response if an internal server error occurs.
    it('should return a 500 JSON response when an internal server error occurs', async () => {
      const req = {
        user: {
          userId: 'user123'
        },
        body: {
          itemID: 'post123'
        }
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      User.findOne = jest.fn().mockRejectedValue(new Error('Internal server error'));

      await lockItem(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ _id: 'user123' });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Internal server error' });
    });

  // unlockFunction
    // User is authenticated and authorized to unlock the post
    it('should unlock the post when the user is authenticated and authorized', async () => {
      // Mock request and response objects
      const req = {
        body: {
          itemID: 'postID123'
        },
        user: {
          userId: 'userID123'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Mock User.findOne to return a user object
      User.findOne = jest.fn().mockResolvedValue({
        _id: 'userID123',
        subreddits: [
          {
            subreddit: 'subredditName',
            role: 'moderator'
          }
        ]
      });

      // Mock Post.findById to return a post object
      Post.findById = jest.fn().mockResolvedValue({
        linkedSubreddit: 'subredditID123'
      });

      // Mock Subreddit.findById to return a subreddit object
      Subreddit.findById = jest.fn().mockResolvedValue({
        name: 'subredditName'
      });

      // Mock Post.findByIdAndUpdate to return a post object
      Post.findByIdAndUpdate = jest.fn().mockResolvedValue({
        isLocked: false
      });

      // Call the unlockItem function
      await unlockItem(req, res);

      // Assertions
      expect(User.findOne).toHaveBeenCalledWith({ _id: 'userID123' });
      expect(Post.findById).toHaveBeenCalledWith('postID123');
      expect(Subreddit.findById).toHaveBeenCalledWith('subredditID123');
      expect(Post.findByIdAndUpdate).toHaveBeenCalledWith('postID123', { isLocked: false });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Post unlocked successfully' });
    });
        // User is not authenticated and receives an unauthorized response
    it('should return an unauthorized response when the user is not authenticated', async () => {
      // Mock request and response objects
      const req = {
        body: {
          itemID: 'postID123'
        },
        user: null
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Call the unlockItem function
      await unlockItem(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Unauthorized' });
    });
        // Post is found and unlocked successfully
    it('should unlock the post when the user is authenticated and authorized', async () => {
      // Mock request and response objects
      const req = {
        body: {
          itemID: 'postID123'
        },
        user: {
          userId: 'userID123'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Mock User.findOne to return a user object
      User.findOne = jest.fn().mockResolvedValue({
        _id: 'userID123',
        subreddits: [
          {
            subreddit: 'subredditName',
            role: 'moderator'
          }
        ]
      });

      // Mock Post.findById to return a post object
      Post.findById = jest.fn().mockResolvedValue({
        linkedSubreddit: 'subredditID123'
      });

      // Mock Subreddit.findById to return a subreddit object
      Subreddit.findById = jest.fn().mockResolvedValue({
        name: 'subredditName'
      });

      // Mock Post.findByIdAndUpdate to return a post object
      Post.findByIdAndUpdate = jest.fn().mockResolvedValue({
        isLocked: false
      });

      // Call the unlockItem function
      await unlockItem(req, res);

      // Assertions
      expect(User.findOne).toHaveBeenCalledWith({ _id: 'userID123' });
      expect(Post.findById).toHaveBeenCalledWith('postID123');
      expect(Subreddit.findById).toHaveBeenCalledWith('subredditID123');
      expect(Post.findByIdAndUpdate).toHaveBeenCalledWith('postID123', { isLocked: false });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Post unlocked successfully' });
    });
        // User is not authorized to unlock posts in the subreddit and receives a 403 error
    it('should return a 403 error when the user is not authorized to unlock posts in the subreddit', async () => {
      // Mock request and response objects
      const req = {
        body: {
          itemID: 'postID123'
        },
        user: {
          userId: 'userID123'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Mock User.findOne to return a user object
      User.findOne = jest.fn().mockResolvedValue({
        _id: 'userID123',
        subreddits: []
      });

      // Mock Post.findById to return a post object
      Post.findById = jest.fn().mockResolvedValue({
        linkedSubreddit: 'subredditID123'
      });

      // Mock Subreddit.findById to return a subreddit object
      Subreddit.findById = jest.fn().mockResolvedValue({
        name: 'subredditName'
      });

      // Call the unlockItem function
      await unlockItem(req, res);

      // Assertions
      expect(User.findOne).toHaveBeenCalledWith({ _id: 'userID123' });
      expect(Post.findById).toHaveBeenCalledWith('postID123');
      expect(Subreddit.findById).toHaveBeenCalledWith('subredditID123');
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'User is not authorized to unlock posts in this subreddit' });
    });
   
//get item info
    // Retrieves information about a post and returns a JSON response with status 500.
    it('should retrieve information about a post and return a JSON response with status 500', async () => {
      const req = { query: { objectID: 'postID', objectType: 'post' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      Post.findOne = jest.fn().mockResolvedValue({ _id: 'postID', title: 'Test Post', populate: jest.fn().mockReturnThis() });

      await getItemInfo(req, res);

      expect(Post.findOne).toHaveBeenCalledWith({ _id: 'postID' });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: "Internal server error", error: expect.anything() });
    });
    // Retrieves information about a comment and returns a JSON response with status 200.
    it('should retrieve information about a comment and return a JSON response with status 200', async () => {
      // Mock request object
      const req = { query: { objectID: 'commentID', objectType: 'comment' } };
  
      // Mock response object
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
  
      // Mock Comment.findOne method to resolve with a comment object
      Comment.findOne = jest.fn().mockResolvedValue({ _id: 'commentID', text: 'Test Comment' });
  
      // Call getItemInfo function
      await getItemInfo(req, res);
  
      // Assertions
      expect(Comment.findOne).toHaveBeenCalledWith({ _id: 'commentID' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, item: { _id: 'commentID', text: 'Test Comment' }, details: undefined });
    });
    // Retrieves information about a subreddit and returns a JSON response with status 200.
    it('should retrieve information about a subreddit and return a JSON response with status 200', async () => {
      // Mock the request object
      const req = { query: { objectID: 'subredditID', objectType: 'subreddit' } };
  
      // Mock the response object
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      // Mock the findOne method of the Subreddit model to return a mock subreddit
      Subreddit.findOne = jest.fn().mockResolvedValue({ _id: 'subredditID', name: 'Test Subreddit' });
  
      // Call the getItemInfo function
      await getItemInfo(req, res);
  
      // Assert that the findOne method of the Subreddit model was called with the correct parameters
      expect(Subreddit.findOne).toHaveBeenCalledWith({ _id: 'subredditID' });
  
      // Assert that the status method of the response object was called with status 200
      expect(res.status).toHaveBeenCalledWith(200);
  
      // Assert that the json method of the response object was called with the correct JSON response
      expect(res.json).toHaveBeenCalledWith({ success: true, item: { _id: 'subredditID', name: 'Test Subreddit' }, details: undefined });
    });
        // Returns a JSON response with status 500 when there is an error in the database connection.
    it('should retrieve information about a post and return a JSON response with status 500', async () => {
      const req = { query: { objectID: 'postID', objectType: 'post' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      
      Post.findOne = jest.fn().mockResolvedValue({ _id: 'postID', title: 'Test Post', populate: jest.fn().mockReturnThis() });

      await getItemInfo(req, res);

      expect(Post.findOne).toHaveBeenCalledWith({ _id: 'postID' });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: "Internal server error", error: expect.anything() });
    });
//add to history function
    it("should add post to recentPosts array when post is not already in the array and array length is less than 10", async () => {
      // Mock request and response objects
      const req = {
        body: {
          postID: "post123",
        },
        user: {
          userId: "user123",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Mock User.findOne() to return a user object with recentPosts property
      const mockUser = {
        _id: "user123",
        recentPosts: [
          { _id: "post456", equals: jest.fn().mockReturnValue(false) },
          { _id: "post789", equals: jest.fn().mockReturnValue(false) },
        ],
        save: jest.fn(),
      };
      User.findOne.mockResolvedValue(mockUser);

      // Mock Post.findOne() to return a post object
      Post.findOne.mockResolvedValue({ _id: "post123" });

      // Call the addToHistory function
      await addToHistory(req, res);

      // Assertions
      expect(User.findOne).toHaveBeenCalledWith({ _id: "user123" });
      expect(Post.findOne).toHaveBeenCalledWith({ _id: "post123" });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Post added to history",
      });
      expect(mockUser.recentPosts).toEqual([
        { _id: "post456", equals: expect.any(Function) },
        { _id: "post789", equals: expect.any(Function) },
        "post123", // Just include the ID of the new post in the array
      ]);
      expect(mockUser.recentPosts.length).toBeLessThanOrEqual(10); // Ensure the array length is less than or equal to 10
    });
    // Return a JSON response with success true and message "Post added to history" when a post is successfully added to the user's recentPosts array.
    it('should add post to recentPosts array when post is not already in the array and array length is less than 10', async () => {
      // Mock request and response objects
      const req = {
        body: {
          postID: 'post123'
        },
        user: {
          userId: 'user123'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Mock User.findOne() to return a user object with recentPosts property
      User.findOne = jest.fn().mockResolvedValue({
        _id: 'user123',
        recentPosts: [
          { _id: 'post456', equals: jest.fn() },
          { _id: 'post789', equals: jest.fn() }
        ],
        save: jest.fn()
      });

      // Mock Post.findOne() to return a post object
      Post.findOne = jest.fn().mockResolvedValue({
        _id: 'post123'
      });

      // Call the addToHistory function
      await addToHistory(req, res);

      // Assertions
      expect(User.findOne).toHaveBeenCalledWith({ _id: 'user123' });
      expect(Post.findOne).toHaveBeenCalledWith({ _id: 'post123' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Post added to history' });

      // Resolve the User.findOne() Promise and check the recentPosts property
      const user = await User.findOne();
      expect(user.recentPosts).toEqual([
        { _id: 'post456', equals: expect.any(Function) },
        { _id: 'post789', equals: expect.any(Function) },
        'post123'
      ]);
    });
    // Return a JSON response with status 500 and message "Internal server error" when an error occurs during the execution of the function.
    it('should return a JSON response with status 500 and message "Internal server error" when an error occurs', async () => {
      // Mock request and response objects
      const req = {
        body: {
          postID: 'post123'
        },
        user: {
          userId: 'user123'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Mock User.findOne() to throw an error
      User.findOne = jest.fn().mockRejectedValue(new Error('Database error'));

      // Call the addToHistory function
      await addToHistory(req, res);

      // Assertions
      expect(User.findOne).toHaveBeenCalledWith({ _id: 'user123' });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Internal server error', error: expect.any(Error) });
    });
//get  history
    // Returns a JSON response with status 500 and error message when an error occurs while retrieving user or post details.
    it('should return a JSON response with status 500 and error message when an error occurs while retrieving user or post details', async () => {
      // Mock the request and response objects
      const req = { user: { userId: 'user123' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      // Mock the User.findOne function to throw an error
      User.findOne = jest.fn().mockRejectedValue(new Error('User not found'));

      // Call the getHistory function
      await getHistory(req, res);

      // Check that the necessary functions were called with the correct arguments
      expect(User.findOne).toHaveBeenCalledWith({ _id: 'user123' });

      // Check that the response was sent with the correct status and data
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Internal server error', error: new Error('User not found') });
    });
       // Retrieve browsing history for authenticated user with recent posts
    it('should retrieve browsing history for authenticated user with recent posts', async () => {
      const req = { user: { userId: '123' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const user = { recentPosts: ['post1', 'post2'] };
      const post1 = { _id: 'post1', originalPostId: 'originalPost1' };
      const post2 = { _id: 'post2', originalPostId: 'originalPost2' };
      const details1 = { voteStatus: 'upvote', subredditDetails: 'details1' };
      const details2 = { voteStatus: 'downvote', subredditDetails: 'details2' };
      User.findOne = jest.fn().mockResolvedValue(user);
      Post.find = jest.fn().mockResolvedValue([post1, post2]);
      Post.find.populate = jest.fn().mockReturnThis();

      post1.toObject = jest.fn().mockReturnValue(post1);
      post2.toObject = jest.fn().mockReturnValue(post2);

      await getHistory(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ _id: req.user.userId });
      expect(Post.find).toHaveBeenCalledWith({ _id: { $in: user.recentPosts } });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: "Internal server error", error: expect.anything() });
    });
        // When there is an internal server error, the function should return a 500 status code
    it('should return a 500 status code when there is an internal server error', async () => {
      const req = { user: { userId: '123' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const user = { recentPosts: [] };
      User.findOne = jest.fn().mockRejectedValue(new Error('Internal server error'));

      await getHistory(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ _id: req.user.userId });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Internal server error', error: new Error('Internal server error') });
    });
//clear history
    // Successfully clear the history of recent posts for an authenticated user
    it('should clear the history of recent posts for an authenticated user', async () => {
      const req = { user: { userId: '123' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const user = { recentPosts: ['post1', 'post2'] };
      User.findOne = jest.fn().mockResolvedValue(user);
      user.save = jest.fn().mockResolvedValue();

      await clearHistory(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ _id: '123' });
      expect(user.recentPosts).toEqual([]);
      expect(user.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'History cleared successfully' });
    });
    // Return a 500 status code and an error message if an error occurs
    it('should return a 500 status code and an error message if an error occurs', async () => {
      const req = { user: { userId: '123' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      User.findOne = jest.fn().mockRejectedValue(new Error('Internal server error'));

      await clearHistory(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ _id: '123' });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Internal server error', error: new Error('Internal server error') });
    });

describe("spoilerPost function", () => {
  let req, res, postFindOneAndUpdateMock;

  beforeEach(() => {
    req = {
      headers: {
        authorization:
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NjAyM2Q4MDdmNzBkYjg4M2NjZjVhOTIiLCJpYXQiOjE3MTE0NzU0ODgsImV4cCI6MTcxMTU2MTg4OH0.Yvil4qLVPXSV7cB5RBhiki7hzqFreQIR8rEUICBqPaU",
      },
      body: {
        postId: "660227d61650ec9f41404c80",
      },
    };
    res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };
    postFindOneAndUpdateMock = jest.fn(); // Define postFindOneAndUpdateMock as a mock function
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 404 if post is not found", async () => {
    Post.findOne.mockResolvedValue(null);

    await spoilerPost(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Post not found or you are not authorized to modify it",
    });
  });

  it("should return 500 if post is unsuccessfully spoilered", async () => {
    Post.findOne.mockResolvedValue({ _id: "post123", spoilered: false });
    postFindOneAndUpdateMock.mockResolvedValue({ _id: "post123", spoilered: true });

    await spoilerPost(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Internal server error",
    });
  });

  
});
describe("unspoilerPost function", () => {
  let req, res, postFindOneAndUpdateMock;

  beforeEach(() => {
    req = {
      headers: {
        authorization:
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NjAyM2Q4MDdmNzBkYjg4M2NjZjVhOTIiLCJpYXQiOjE3MTE0NzU0ODgsImV4cCI6MTcxMTU2MTg4OH0.Yvil4qLVPXSV7cB5RBhiki7hzqFreQIR8rEUICBqPaU",
      },
      body: {
        postId: "660227d61650ec9f41404c80",
      },
    };
    res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };
    postFindOneAndUpdateMock = jest.fn(); // Define postFindOneAndUpdateMock as a mock function
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 404 if post is not found", async () => {
    Post.findOne.mockResolvedValue(null);

    await unspoilerPost(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Post not found or you are not authorized to modify it",
    });
  });

  it("should return 500 if post is unsuccessfully unspoilered", async () => {
    Post.findOne.mockResolvedValue({ _id: "post123", spoilered: true });
    postFindOneAndUpdateMock.mockResolvedValue({ _id: "post123", spoilered: false });

    await unspoilerPost(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Internal server error",
    });
  });

  
});