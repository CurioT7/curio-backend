const {
  getJoinedCommunities,
  getPostsByUser,
  getCommentsByUser,
  getVotedContent,
  getUpvotedContent,
  getDownvotedContent,
  getAboutInformation,
  getOverviewInformation,
  fetchPostsByUsername,
  findUserByUsername,
  handleServerError,
} = require("../controller/profile/profileController");
const { s3, sendFileToS3, getFilesFromS3 } = require("../utils/s3-bucket");
const { getVoteStatusAndSubredditDetails } = require("../../utils/posts");
const { verifyToken, authorizeUser } = require("../utils/tokens");

const User = require("../models/userModel");
const Post = require("../models/postModel");
const Comment = require("../models/commentModel");
const Subreddit = require("../models/subredditModel");


//   it("should fetch and return posts and comments for a valid user", async () => {
//     // Arrange
//     const req = { params: { username: "validUser" } };
//     const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

//     User.findOne.mockResolvedValue({});
//     Post.find.mockResolvedValue(["Post1", "Post2"]);
//     Comment.find.mockResolvedValue(["Comment1", "Comment2"]);

//     // Act
//     await getOverviewInformation(req, res);

//     // Assert
//     expect(res.status).toHaveBeenCalledWith(200);
//     expect(res.json).toHaveBeenCalledWith({
//       userPosts: expect.any(Array),
//       userComments: expect.any(Array),
//     });
//   });
// });

// describe("getJoinedCommunities", () => {
//   it("should return communities joined by the user", async () => {
//     // Arrange
//     const req = { params: { username: "communityUser" } };
//     const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

//     User.findOne.mockResolvedValue({
//       subreddits: [{ subreddit: "community1" }, { subreddit: "community2" }],
//     });
//     Subreddit.find.mockResolvedValue([
//       { _doc: { name: "community1", members: [] } },
//       { _doc: { name: "community2", members: [1, 2, 3] } },
//     ]);

//     // Act
//     await getJoinedCommunities(req, res);

//     // Assert
//     expect(res.status).toHaveBeenCalledWith(200);
//     expect(res.json).toHaveBeenCalledWith(expect.any(Object));
//   });
// });



//fetch posts by user
    // Should fetch posts made by a specific user when given a valid username
    it('should fetch posts made by a specific user when given a valid username', async () => {
      // Arrange
      const username = 'validUsername';
      const expectedPosts = [{ title: 'Post 1', save: jest.fn() }, { title: 'Post 2', save: jest.fn() }];

      // Mock the Post.find() function
      Post.find = jest.fn().mockReturnValue({ populate: jest.fn().mockResolvedValue(expectedPosts) });

      // Act
      const result = await fetchPostsByUsername(username);

      // Assert
      expect(result).toEqual(expectedPosts);
      expect(Post.find).toHaveBeenCalledWith({ authorName: username });
    });
    // Should return an empty array when given a username with no posts
    it('should return an empty array when given a username with no posts', async () => {
      // Arrange
      const username = 'noPostsUsername';
      const expectedPosts = [];

      // Mock the Post.find() function
      Post.find = jest.fn().mockReturnValue({ populate: jest.fn().mockResolvedValue(expectedPosts) });

      // Act
      const result = await fetchPostsByUsername(username);

      // Assert
      expect(result).toEqual(expectedPosts);
      expect(Post.find).toHaveBeenCalledWith({ authorName: username });
    });

// get voted content
     // Should fetch upvoted posts and comments when voteType is "upvotes"
    it('should fetch upvoted posts and comments when voteType is "upvotes"', async () => {
      const req = { user: { userId: '123' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      const user = { upvotes: [{ itemId: '456' }] };
      const post = { _id: '456' };
      const comment = { _id: '456' };

      User.findOne = jest.fn().mockResolvedValue(user);
      Post.find = jest.fn().mockResolvedValue([post]);
      Comment.find = jest.fn().mockResolvedValue([comment]);

      await getVotedContent(req, res, next, 'upvotes');

      expect(User.findOne).toHaveBeenCalledWith({ _id: '123' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ votedPosts: [post], votedComments: [comment] });
    });
    // Should return 400 status code and error message when voteType is not "upvotes" or "downvotes"
    it('should return 400 status code and error message when voteType is not "upvotes" or "downvotes"', async () => {
      const req = { user: { userId: '123' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      const user = { upvotes: [{ itemId: '456' }] };

      User.findOne = jest.fn().mockResolvedValue(user);

      await getVotedContent(req, res, next, 'invalid');

      expect(User.findOne).toHaveBeenCalledWith({ _id: '123' });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Invalid vote type' });
    });

        // Should handle server error and return 500 status code
    it('should handle server error and return 500 status code', async () => {
      const req = { user: { userId: '123' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      User.findOne = jest.fn().mockRejectedValue(new Error('Server Error'));

      await getVotedContent(req, res, next, 'upvotes');

      expect(User.findOne).toHaveBeenCalledWith({ _id: '123' });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Server Error', error: 'Server Error' });
    });



// Successfully retrieve all posts made by a specific user
// it("should retrieve all posts made by a specific user", async () => {
//   const req = { params: { username: "testUser" } };
//   const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
//   const next = jest.fn();
//   const dataType = "posts";

//   const user = { username: "testUser" };
//   User.findOne = jest.fn().mockResolvedValue(user);

//   const posts = [{ title: "Post 1" }, { title: "Post 2" }];
//   Post.find = jest.fn().mockResolvedValue(posts);

//   const profileController = new ProfileController();
//   await profileController.getDataByUser(req, res, next, dataType);

//   expect(User.findOne).toHaveBeenCalledWith({ username: "testUser" });
//   expect(Post.find).toHaveBeenCalledWith({ authorName: "testUser" });
//   expect(res.status).toHaveBeenCalledWith(200);
//   expect(res.json).toHaveBeenCalledWith(posts);
// });
// // Successfully retrieve all comments made by a specific user
// it("should retrieve all comments made by a specific user", async () => {
//   const req = { params: { username: "testUser" } };
//   const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
//   const next = jest.fn();
//   const dataType = "comments";

//   const user = { username: "testUser" };
//   User.findOne = jest.fn().mockResolvedValue(user);

//   const comments = [{ text: "Comment 1" }, { text: "Comment 2" }];
//   Comment.find = jest.fn().mockResolvedValue(comments);

//   const profileController = new ProfileController();
//   await profileController.getDataByUser(req, res, next, dataType);

//   expect(User.findOne).toHaveBeenCalledWith({ username: "testUser" });
//   expect(Comment.find).toHaveBeenCalledWith({ authorName: "testUser" });
//   expect(res.status).toHaveBeenCalledWith(200);
//   expect(res.json).toHaveBeenCalledWith(comments);
// });
// // Retrieves all downvoted posts and comments by a specific user.
// it("should retrieve all downvoted posts and comments made by a specific user", async () => {
//   // Mock request and response objects
//   const req = { params: { username: "testUser" } };
//   const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
//   const next = jest.fn();

//   // Mock User.findOne to return a promise that resolves immediately
//   User.findOne = jest.fn().mockResolvedValue({ downvotes: [] });

//   // Mock Post.find to return a promise that resolves immediately
//   Post.find = jest.fn().mockResolvedValue([]);

//   // Mock Comment.find to return a promise that resolves immediately
//   Comment.find = jest.fn().mockResolvedValue([]);

//   // Create an instance of ProfileController
//   const profileController = new ProfileController();

//   // Call the getDownvotedContent method
//   await profileController.getDownvotedContent(req, res, next);

//   // Assertions
//   expect(User.findOne).toHaveBeenCalledWith({ username: "testUser" });
//   expect(res.status).toHaveBeenCalledWith(200);
//   expect(res.json).toHaveBeenCalledWith({ votedPosts: [], votedComments: [] });
// });
// // Retrieves upvoted content by calling the 'getVotedContent' method with the 'upvotes' voteType parameter.
// it("should retrieve upvoted content by calling the getVotedContent method with the upvotes voteType parameter", async () => {
//   const req = { params: { username: "testUser" } };
//   const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
//   const next = jest.fn();
//   const profileController = new ProfileController();

//   // Mock the User.findOne method
//   User.findOne = jest
//     .fn()
//     .mockResolvedValue({ username: "testUser", upvotes: [] });

//   // Mock the Post.find and Comment.find methods
//   Post.find = jest.fn().mockResolvedValue([]);
//   Comment.find = jest.fn().mockResolvedValue([]);

//   await profileController.getUpvotedContent(req, res, next);

//   expect(User.findOne).toHaveBeenCalledWith({ username: "testUser" });
//   expect(Post.find).toHaveBeenCalled();
//   expect(Comment.find).toHaveBeenCalled();
//   expect(res.status).toHaveBeenCalledWith(200);
//   expect(res.json).toHaveBeenCalledWith({
//     votedPosts: [],
//     votedComments: [],
//   });
// }, 20000);
//     // Successfully retrieve detailed profile information about a user
//     it('should retrieve detailed profile information about a user', async () => {
//       // Mock dependencies
//       const req = { params: { username: 'testUser' } };
//       const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
//       const next = jest.fn();
//       const User = require('../../models/userModel');
//       const Post = require('../../models/postModel');
//       const Comment = require('../../models/commentModel');
//       const Subreddit = require('../../models/subredditModel');
//       const userMockData = {
//         followers: ['follower1', 'follower2'],
//         followings: ['following1', 'following2'],
//         goldAmount: 10,
//         cakeDay: '2022-01-01',
//         socialLinks: ['link1', 'link2'],
//         bio: 'Test bio',
//         displayName: 'Test User',
//         banner: 'banner.jpg',
//         subreddits: [
//           { subreddit: 'subreddit1', role: 'moderator' },
//           { subreddit: 'subreddit2', role: 'member' },
//         ],
//       };
//       User.findOne = jest.fn().mockResolvedValue(userMockData);
//       Post.find = jest.fn().mockResolvedValue([{ title: 'Test Post 1', karma: 10 }, { title: 'Test Post 2', karma: 5 }]);
//       Comment.find = jest.fn().mockResolvedValue([{ text: 'Test Comment 1', karma: 3 }, { text: 'Test Comment 2', karma: 7 }]);
//       Subreddit.find = jest.fn().mockResolvedValue([{ name: 'Subreddit 1' }, { name: 'Subreddit 2' }]);

//       // Initialize and invoke ProfileController
//       const profileController = new ProfileController();
//       await profileController.getAboutInformation(req, res, next);

//       // Assertions
//       expect(res.status).toHaveBeenCalledWith(200);
//       expect(res.json).toHaveBeenCalledWith({
//         followersCount: 2,
//         followingCount: 2,
//         goldRecieved: 10,
//         cakeDay: '2022-01-01',
//         postKarma: 15,
//         commentKarma: 10,
//         socialLinks: ['link1', 'link2'],
//         bio: 'Test bio',
//         displayName: 'Test User',
//         banner: 'banner.jpg',
//         moderatedSubreddits: [{ name: 'Subreddit 1' }, { name: 'Subreddit 2' }],
//       });
//     });
//         // Successfully retrieve overview information about a user including their posts and comments
//     it('should retrieve overview information about a user including their posts and comments', async () => {
//       // Arrange
//       const profileController = new ProfileController();
//       const req = { params: { username: "testUser" } };
//       const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
//       const next = jest.fn();

//       // Mock the findUserByUsername method
//       profileController.findUserByUsername = jest.fn().mockResolvedValue({ username: "testUser" });

//       // Mock the fetchPostsByUsername method
//       profileController.fetchPostsByUsername = jest.fn().mockResolvedValue([{ title: "Post 1" }, { title: "Post 2" }]);

//       // Mock the fetchCommentsByUsername method
//       profileController.fetchCommentsByUsername = jest.fn().mockResolvedValue([{ text: "Comment 1" }, { text: "Comment 2" }]);

//       // Act
//       await profileController.getOverviewInformation(req, res, next);

//       // Assert
//       expect(profileController.findUserByUsername).toHaveBeenCalledWith("testUser");
//       expect(profileController.fetchPostsByUsername).toHaveBeenCalledWith("testUser");
//       expect(profileController.fetchCommentsByUsername).toHaveBeenCalledWith("testUser");
//       expect(res.status).toHaveBeenCalledWith(200);
//       expect(res.json).toHaveBeenCalledWith({
//         userPosts: [{ title: "Post 1" }, { title: "Post 2" }],
//         userComments: [{ text: "Comment 1" }, { text: "Comment 2" }],
//       });
//     });
//         // Successfully report a user with valid input data
//     it('should successfully report a user when valid input data is provided', async () => {
//       const req = {
//         body: {
//           reportedUsername: "testUser",
//           reportType: "username",
//           reportReason: "inappropriate content"
//         }
//       };
//       const res = {
//         status: jest.fn().mockReturnThis(),
//         json: jest.fn()
//       };

//       // Mock the User.findOne function to return a resolved promise with a dummy user
//       User.findOne = jest.fn().mockResolvedValue({ username: "testUser" });

//       // Mock the newReport.save function to return a resolved promise
//       UserReports.prototype.save = jest.fn().mockResolvedValue();

//       await reportUser(req, res);

//       expect(res.status).toHaveBeenCalledWith(201);
//       expect(res.json).toHaveBeenCalledWith({
//         succes: true,
//         message: "Report submitted successfully"
//       });
//     });
