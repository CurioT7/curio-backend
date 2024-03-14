// Successfully retrieve all posts made by a specific user
it("should retrieve all posts made by a specific user", async () => {
  const req = { params: { username: "testUser" } };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  const next = jest.fn();
  const dataType = "posts";

  const user = { username: "testUser" };
  User.findOne = jest.fn().mockResolvedValue(user);

  const posts = [{ title: "Post 1" }, { title: "Post 2" }];
  Post.find = jest.fn().mockResolvedValue(posts);

  const profileController = new ProfileController();
  await profileController.getDataByUser(req, res, next, dataType);

  expect(User.findOne).toHaveBeenCalledWith({ username: "testUser" });
  expect(Post.find).toHaveBeenCalledWith({ authorName: "testUser" });
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith(posts);
});
// Successfully retrieve all comments made by a specific user
it("should retrieve all comments made by a specific user", async () => {
  const req = { params: { username: "testUser" } };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  const next = jest.fn();
  const dataType = "comments";

  const user = { username: "testUser" };
  User.findOne = jest.fn().mockResolvedValue(user);

  const comments = [{ text: "Comment 1" }, { text: "Comment 2" }];
  Comment.find = jest.fn().mockResolvedValue(comments);

  const profileController = new ProfileController();
  await profileController.getDataByUser(req, res, next, dataType);

  expect(User.findOne).toHaveBeenCalledWith({ username: "testUser" });
  expect(Comment.find).toHaveBeenCalledWith({ authorName: "testUser" });
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith(comments);
});
// Retrieves all downvoted posts and comments by a specific user.
it("should retrieve all downvoted posts and comments made by a specific user", async () => {
  // Mock request and response objects
  const req = { params: { username: "testUser" } };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  const next = jest.fn();

  // Mock User.findOne to return a promise that resolves immediately
  User.findOne = jest.fn().mockResolvedValue({ downvotes: [] });

  // Mock Post.find to return a promise that resolves immediately
  Post.find = jest.fn().mockResolvedValue([]);

  // Mock Comment.find to return a promise that resolves immediately
  Comment.find = jest.fn().mockResolvedValue([]);

  // Create an instance of ProfileController
  const profileController = new ProfileController();

  // Call the getDownvotedContent method
  await profileController.getDownvotedContent(req, res, next);

  // Assertions
  expect(User.findOne).toHaveBeenCalledWith({ username: "testUser" });
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({ votedPosts: [], votedComments: [] });
});
// Retrieves upvoted content by calling the 'getVotedContent' method with the 'upvotes' voteType parameter.
it("should retrieve upvoted content by calling the getVotedContent method with the upvotes voteType parameter", async () => {
  const req = { params: { username: "testUser" } };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  const next = jest.fn();
  const profileController = new ProfileController();

  // Mock the User.findOne method
  User.findOne = jest
    .fn()
    .mockResolvedValue({ username: "testUser", upvotes: [] });

  // Mock the Post.find and Comment.find methods
  Post.find = jest.fn().mockResolvedValue([]);
  Comment.find = jest.fn().mockResolvedValue([]);

  await profileController.getUpvotedContent(req, res, next);

  expect(User.findOne).toHaveBeenCalledWith({ username: "testUser" });
  expect(Post.find).toHaveBeenCalled();
  expect(Comment.find).toHaveBeenCalled();
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({
    votedPosts: [],
    votedComments: [],
  });
}, 20000);
    // Successfully retrieve detailed profile information about a user
    it('should retrieve detailed profile information about a user', async () => {
      // Mock dependencies
      const req = { params: { username: 'testUser' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      const User = require('../../models/userModel');
      const Post = require('../../models/postModel');
      const Comment = require('../../models/commentModel');
      const Subreddit = require('../../models/subredditModel');
      const userMockData = {
        followers: ['follower1', 'follower2'],
        followings: ['following1', 'following2'],
        goldAmount: 10,
        cakeDay: '2022-01-01',
        socialLinks: ['link1', 'link2'],
        bio: 'Test bio',
        displayName: 'Test User',
        banner: 'banner.jpg',
        subreddits: [
          { subreddit: 'subreddit1', role: 'moderator' },
          { subreddit: 'subreddit2', role: 'member' },
        ],
      };
      User.findOne = jest.fn().mockResolvedValue(userMockData);
      Post.find = jest.fn().mockResolvedValue([{ title: 'Test Post 1', karma: 10 }, { title: 'Test Post 2', karma: 5 }]);
      Comment.find = jest.fn().mockResolvedValue([{ text: 'Test Comment 1', karma: 3 }, { text: 'Test Comment 2', karma: 7 }]);
      Subreddit.find = jest.fn().mockResolvedValue([{ name: 'Subreddit 1' }, { name: 'Subreddit 2' }]);

      // Initialize and invoke ProfileController
      const profileController = new ProfileController();
      await profileController.getAboutInformation(req, res, next);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        followersCount: 2,
        followingCount: 2,
        goldRecieved: 10,
        cakeDay: '2022-01-01',
        postKarma: 15,
        commentKarma: 10,
        socialLinks: ['link1', 'link2'],
        bio: 'Test bio',
        displayName: 'Test User',
        banner: 'banner.jpg',
        moderatedSubreddits: [{ name: 'Subreddit 1' }, { name: 'Subreddit 2' }],
      });
    });
        // Successfully retrieve overview information about a user including their posts and comments
    it('should retrieve overview information about a user including their posts and comments', async () => {
      // Arrange
      const profileController = new ProfileController();
      const req = { params: { username: "testUser" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      // Mock the findUserByUsername method
      profileController.findUserByUsername = jest.fn().mockResolvedValue({ username: "testUser" });

      // Mock the fetchPostsByUsername method
      profileController.fetchPostsByUsername = jest.fn().mockResolvedValue([{ title: "Post 1" }, { title: "Post 2" }]);

      // Mock the fetchCommentsByUsername method
      profileController.fetchCommentsByUsername = jest.fn().mockResolvedValue([{ text: "Comment 1" }, { text: "Comment 2" }]);

      // Act
      await profileController.getOverviewInformation(req, res, next);

      // Assert
      expect(profileController.findUserByUsername).toHaveBeenCalledWith("testUser");
      expect(profileController.fetchPostsByUsername).toHaveBeenCalledWith("testUser");
      expect(profileController.fetchCommentsByUsername).toHaveBeenCalledWith("testUser");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        userPosts: [{ title: "Post 1" }, { title: "Post 2" }],
        userComments: [{ text: "Comment 1" }, { text: "Comment 2" }],
      });
    });
