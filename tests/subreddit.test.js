// Test case for newSubreddit function

it("should create subreddit and update user subreddits when token and user exist", async () => {
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
  const token = "token123";
  const decoded = { userId: "user123" };
  const user = { username: "testUser" };
  const result = {
    success: true,
    response: "Subreddit created successfully",
    communityName: "testSubreddit_testUser",
  };

  // Mocking necessary functions and values
  req.headers.authorization.split.mockReturnValueOnce(["Bearer", token]);
  verifyToken.mockResolvedValueOnce(decoded);
  User.findOne.mockResolvedValueOnce(user);
  createSubreddit.mockResolvedValueOnce(result);
  addUserToSubbreddit.mockResolvedValueOnce();

  // Executing the function
  await newSubreddit(req, res);

  // Assertions
  expect(req.headers.authorization.split).toHaveBeenCalledWith(" ");
  expect(verifyToken).toHaveBeenCalledWith(token);
  expect(User.findOne).toHaveBeenCalledWith({ _id: decoded.userId });
  expect(createSubreddit).toHaveBeenCalledWith(req.body, user);
  expect(addUserToSubbreddit).toHaveBeenCalledWith(user, result.communityName);
  expect(res.status).toHaveBeenCalledWith(201);
  expect(res.json).toHaveBeenCalledWith({
    success: true,
    message: result.response,
    communityName: result.communityName,
  });
});

// Test case for createSubreddit function

it("should create a subreddit successfully with valid input data", async () => {
  // Mocking necessary dependencies
  const Community = require("../../models/subredditModel");
  const User = require("../../models/userModel");
  const { availableSubreddit } = require("./helpers");

  // Mocking input data and user
  const data = {
    name: "testSubreddit",
    over18: false,
    description: "Test subreddit description",
    privacyMode: "public",
  };
  const user = {
    username: "testUser",
  };

  // Mocking the availableSubreddit function
  availableSubreddit.mockResolvedValueOnce({
    success: true,
    subreddit: null,
  });

  // Mocking the Community.create function
  Community.create.mockResolvedValueOnce();

  // Mocking the User.findOneAndUpdate function
  User.findOneAndUpdate.mockResolvedValueOnce();

  // Calling the createSubreddit function
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

// Test case for availableSubreddit function

it("should return success true and null subreddit when the subreddit is not found in the database", async () => {
  const subreddit = "nonexistentSubreddit";
  const result = await availableSubreddit(subreddit);
  expect(result.success).toBe(true);
  expect(result.subreddit).toBeNull();
});
