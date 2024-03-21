//newSubreddit Function 

// Verify token and user exist, create subreddit and update user subreddits
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

  req.headers.authorization.split.mockReturnValueOnce(["Bearer", token]);
  verifyToken.mockResolvedValueOnce(decoded);
  User.findOne.mockResolvedValueOnce(user);
  createSubreddit.mockResolvedValueOnce(result);
  addUserToSubbreddit.mockResolvedValueOnce();

  await newSubreddit(req, res);

  expect(req.headers.authorization.split).toHaveBeenCalledWith(" ");
  expect(verifyToken).toHaveBeenCalledWith(token);
  expect(User.findOne).toHaveBeenCalledWith({ _id: decoded.userId });
  expect(createSubreddit).toHaveBeenCalledWith(req.body, user);
  expect(addUserToSubbreddit).toHaveBeenCalledWith(user, result.communityName);
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({
    success: true,
    message: result.response,
    communityName: result.communityName,
  });
});

//createSubreddit fucntion 

    // Create a subreddit successfully with valid input data
    it('should create a subreddit successfully with valid input data', async () => {
      // Mock the necessary dependencies
      const Community = require("../../models/subredditModel");
      const User = require("../../models/userModel");
      const { availableSubreddit } = require("./helpers");

      // Mock the input data and user
      const data = {
        name: "testSubreddit",
        over18: false,
        description: "Test subreddit description",
        privacyMode: "public",
      };
      const user = {
        username: "testUser",
      };

      // Mock the availableSubreddit function to return a successful response
      availableSubreddit.mockResolvedValue({
        success: true,
        subreddit: null,
      });

      // Mock the Community.create function to return a successful response
      Community.create.mockResolvedValue();

      // Mock the User.findOneAndUpdate function to return a successful response
      User.findOneAndUpdate.mockResolvedValue();

      // Call the createSubreddit function
      const result = await createSubreddit(data, user);

      // Assert that the result is successful and has the correct response message
      expect(result.success).toBe(true);
      expect(result.response).toBe("Subreddit created successfully");
      expect(result.communityName).toBe("testSubreddit_testUser");

      // Assert that the availableSubreddit function was called with the correct arguments
      expect(availableSubreddit).toHaveBeenCalledWith("testSubreddit");

      // Assert that the Community.create function was called with the correct arguments
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

      // Assert that the User.findOneAndUpdate function was called with the correct arguments
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

//avaliableSubreddit Fucntion
    
    // Returns success true and null subreddit when the subreddit is not found in the database
    it('should return success true and null subreddit when the subreddit is not found in the database', async () => {
      const subreddit = 'nonexistentSubreddit';
      const result = await availableSubreddit(subreddit);
      expect(result.success).toBe(true);
      expect(result.subreddit).toBeNull();
    });