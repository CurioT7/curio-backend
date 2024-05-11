const User = require("../models/userModel");
const Post = require("../models/postModel");
const Subreddit = require("../models/subredditModel");
const Comment = require("../models/commentModel");
const UserReports = require("../models/reportModel");
const {
  filterHiddenPosts,
  filterRemovedComments,
  getVoteStatusAndSubredditDetails,
} = require("../utils/posts");
const { verifyToken, authorizeUser } = require("../utils/tokens");

    // Given a list of posts and a user object, return a filtered list of posts without hidden or removed posts.
    it('should return a filtered list of posts without hidden or removed posts', async () => {
      // Arrange
      const posts = [
        { _id: '1', isRemoved: false },
        { _id: '2', isRemoved: true },
        { _id: '3', isRemoved: false },
        { _id: '4', isRemoved: true },
      ];
      const user = {
        hiddenPosts: Promise.resolve(['2', '4']),
      };

      // Act
      const result = await filterHiddenPosts(posts, user);

      // Assert
      expect(result).toEqual([{ _id: '1', isRemoved: false }, { _id: '3', isRemoved: false }]);
    });
        // If all posts are hidden, return an empty list.
    it('should return an empty list when all posts are hidden', async () => {
      // Arrange
      const posts = [
        { _id: '1', isRemoved: false },
        { _id: '2', isRemoved: false },
        { _id: '3', isRemoved: false },
      ];
      const user = {
        hiddenPosts: Promise.resolve(['1', '2', '3']),
      };

      // Act
      const result = await filterHiddenPosts(posts, user);

      // Assert
      expect(result).toEqual([]);
    });

        // Returns the original list of comments if no comments are removed.
    it('should return the original list of comments when no comments are removed', async () => {
      // Arrange
      const comments = [
        { id: 1, text: 'Comment 1', isRemoved: false },
        { id: 2, text: 'Comment 2', isRemoved: false },
        { id: 3, text: 'Comment 3', isRemoved: false }
      ];
  
      // Act
      const result = await filterRemovedComments(comments);
  
      // Assert
      expect(result).toEqual(comments);
    });
        // Returns an empty list if the input list is empty.
    it('should return an empty list when the input list is empty', async () => {
      // Arrange
      const comments = [];
  
      // Act
      const result = await filterRemovedComments(comments);
  
      // Assert
      expect(result).toEqual([]);
    });
    // Throws an error if item data is not found.
    it('should throw an error if item data is not found', async () => {
      const item = {
        _id: 'post_id',
        authorName: 'author_name'
      };

      const user = {
        member: []
      };

      jest.spyOn(Post, 'findById').mockResolvedValue(null);
      jest.spyOn(Comment, 'findById').mockResolvedValue(null);

      await expect(getVoteStatusAndSubredditDetails(item, user)).rejects.toThrow('Item data not found');
    });
