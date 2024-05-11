
const User = require("../models/userModel");
const Post = require("../models/postModel");
const Subreddit = require("../models/subredditModel");
const Comment = require("../models/commentModel");
const UserReports = require("../models/reportModel");
const {
  handleServerError,
  findUserByUsername,
    fetchPostsByUsername,
    getVotedContent,
  getPostsByUser,
} = require("../controller/profile/profileController");
const { verifyToken, authorizeUser } = require("../utils/tokens");

    // Logs the error object.
    it('should log the error object when it is not null', () => {
      const res = {
        status: function(code) {
          return this;
        },
        json: function(data) {}
      };

      const error = new Error("Example server error");

      const consoleSpy = jest.spyOn(console, 'error');
      handleServerError(res, error);
      expect(consoleSpy).toHaveBeenCalledWith(error);
    });
        // Should find a user by their username and return the user object
    it('should find a user by their username and return the user object', async () => {
      const username = "exampleUser";
      const user = { username: "exampleUser", name: "John Doe" };

      User.findOne = jest.fn().mockResolvedValue(user);

      try {
        const result = await findUserByUsername(username);
        expect(result).toEqual(user);
        expect(User.findOne).toHaveBeenCalledWith({ username });
      } catch (error) {
        fail("Should not throw an error");
      }
    });

        // Should fetch posts made by a specific user when valid username is provided
    it('should fetch posts made by a specific user when valid username is provided', async () => {
      const username = 'validUsername';
      const expectedPosts = [{ title: 'Post 1', save: jest.fn() }, { title: 'Post 2', save: jest.fn() }];

      // Mock the Post.find() function to return the expected posts
      Post.find = jest.fn().mockReturnValue({ populate: jest.fn().mockResolvedValue(expectedPosts) });

      // Call the fetchPostsByUsername function
      const result = await fetchPostsByUsername(username);

      // Check that the Post.find() function was called with the correct parameters
      expect(Post.find).toHaveBeenCalledWith({ authorName: username });

      // Check that the result matches the expected posts
      expect(result).toEqual(expectedPosts);
    });

        // Should fetch upvoted posts and comments when voteType is "upvotes"
    it('should fetch upvoted posts and comments when voteType is "upvotes"', async () => {
      const req = { user: { userId: 'user123' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      const user = { upvotes: [{ itemId: 'post123' }, { itemId: 'comment123' }] };
      const post = { _id: 'post123' };
      const comment = { _id: 'comment123' };

      User.findOne = jest.fn().mockResolvedValue(user);
      Post.find = jest.fn().mockResolvedValue([post]);
      Comment.find = jest.fn().mockResolvedValue([comment]);

      await getVotedContent(req, res, next, 'upvotes');

      expect(User.findOne).toHaveBeenCalledWith({ _id: 'user123' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        votedPosts: [post],
        votedComments: [comment],
      });
    });
    // Should return a 400 error when voteType is not "upvotes" or "downvotes"
    it('should return a 400 error when voteType is not "upvotes" or "downvotes"', async () => {
      const req = { user: { userId: 'user123' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      const user = { upvotes: [{ itemId: 'post123' }, { itemId: 'comment123' }] };

      User.findOne = jest.fn().mockResolvedValue(user);

      await getVotedContent(req, res, next, 'invalid');

      expect(User.findOne).toHaveBeenCalledWith({ _id: 'user123' });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid vote type',
      });
    });