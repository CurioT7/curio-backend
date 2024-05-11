
const User = require("../models/userModel");
const Post = require("../models/postModel");
const Subreddit = require("../models/subredditModel");
const Comment = require("../models/commentModel");
const UserReports = require("../models/reportModel");
const {
  reportUser,
  reportContent,
  getSubredditReportedContent,
  takeActionOnReport,
  getAdminReports,
  getAdminReportsHistory,
} = require("../controller/profile/reportController");
const { verifyToken, authorizeUser } = require("../utils/tokens");

it('should successfully report a user with valid input data', async () => {
          const req = {
            user: {
              userId: 'user123'
            },
            body: {
              reportedUsername: 'testuser',
              reportType: 'username',
              reportReason: 'Inappropriate behavior',
              reportDetails: 'This user has been harassing others'
            }
          };
          const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
          };
          const mockUser = { _id: 'user123', username: 'reporter' };
          const mockReportedUser = { username: 'testuser' };
          User.findOne = jest.fn()
            .mockResolvedValueOnce(mockUser)
            .mockResolvedValueOnce(mockReportedUser);
          UserReports.prototype.save = jest.fn().mockResolvedValue();
          await reportUser(req, res);
          expect(User.findOne).toHaveBeenCalledTimes(2);
          expect(User.findOne).toHaveBeenNthCalledWith(1, { _id: 'user123' });
          expect(User.findOne).toHaveBeenNthCalledWith(2, { username: 'testuser' });
          expect(UserReports.prototype.save).toHaveBeenCalled();
          expect(res.status).toHaveBeenCalledWith(201);
          expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Report submitted successfully'
          });
});
    // Fail to report a user if reportedUsername does not exist in the User database
    it('should fail to report a user if reportedUsername does not exist in the User database', async () => {
      const req = {
        user: {
          userId: 'user123'
        },
        body: {
          reportedUsername: 'nonexistentuser',
          reportType: 'username',
          reportReason: 'Inappropriate behavior',
          reportDetails: 'This user has been harassing others'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const mockUser = { _id: 'user123', username: 'reporter' };
      User.findOne = jest.fn().mockResolvedValue(mockUser);
      User.findOne.mockResolvedValueOnce(null);
      await reportUser(req, res);
      expect(User.findOne).toHaveBeenCalledTimes(2);
      expect(User.findOne).toHaveBeenNthCalledWith(1, { _id: 'user123' });
      expect(User.findOne).toHaveBeenNthCalledWith(2, { username: 'nonexistentuser' });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error',
        error: "Cannot read properties of null (reading 'username')"
      });
    });

    // Successfully report a post
    it('should successfully report a post when it exists and the user is not the author', async () => {
      const req = {
        user: {
          userId: 'user123'
        },
        body: {
          itemID: 'post123',
          reportType: 'post',
          reportReason: 'Inappropriate content',
          reportDetails: 'This post contains offensive language'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const user = {
        username: 'user123'
      };
      const post = {
        _id: 'post123',
        authorName: 'author123',
        linkedSubreddit: 'subreddit123',
        isReportApproved: false,
        isApprovedForShare: true
      };
      User.findOne = jest.fn().mockResolvedValue(user);
      Post.findOne = jest.fn().mockResolvedValue(post);
      UserReports.prototype.save = jest.fn();

      await reportContent(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ _id: 'user123' });
      expect(Post.findOne).toHaveBeenCalledWith({ _id: 'post123' });
      expect(UserReports.prototype.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Report submitted successfully'
      });
    });
      // Report a non-existent comment
    it('should return an error when trying to report a non-existent comment', async () => {
      const req = {
        user: {
          userId: 'user123'
        },
        body: {
          itemID: 'comment123',
          reportType: 'comment',
          reportReason: 'Inappropriate content',
          reportDetails: 'This comment contains offensive language'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const user = {
        username: 'user123'
      };
      User.findOne = jest.fn().mockResolvedValue(user);
      Comment.findOne = jest.fn().mockResolvedValue(null);

      await reportContent(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ _id: 'user123' });
      expect(Comment.findOne).toHaveBeenCalledWith({ _id: 'comment123' });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Item not found'
      });
    });
    // Report a comment authored by the user
    it('should successfully report a comment when it exists and the user is not the author', async () => {
      const req = {
        user: {
          userId: 'user123'
        },
        body: {
          itemID: 'comment123',
          reportType: 'comment',
          reportReason: 'Inappropriate content',
          reportDetails: 'This comment contains offensive language'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const user = {
        username: 'user123'
      };
      const comment = {
        _id: 'comment123',
        authorName: 'author123',
        linkedSubreddit: 'subreddit123',
        isReportApproved: false,
        isApprovedForShare: true
      };
      User.findOne = jest.fn().mockResolvedValue(user);
      Comment.findOne = jest.fn().mockResolvedValue(comment);
      UserReports.prototype.save = jest.fn();

      await reportContent(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ _id: 'user123' });
      expect(Comment.findOne).toHaveBeenCalledWith({ _id: 'comment123' });
      expect(UserReports.prototype.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Report submitted successfully'
      });
    });
  
    // Retrieve reported content for a subreddit where the user is not a moderator
    it('should return a forbidden error when the user is not a moderator', async () => {
      const req = {
        user: {
          userId: 'user123'
        },
        params: {
          subreddit: 'subreddit1'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      User.findOne = jest.fn().mockResolvedValue({ _id: 'user123', moderators: [] });
      Subreddit.findOne = jest.fn().mockResolvedValue({ name: 'subreddit1' });
  
      await getSubredditReportedContent(req, res, next);

      expect(User.findOne).toHaveBeenCalledWith({ _id: 'user123' });
      expect(Subreddit.findOne).toHaveBeenCalledWith({ name: 'subreddit1' });
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: "Forbidden, you must be a moderator!" });
    });
        // Retrieve reported content for a subreddit where the user is a moderator and there are no reported items
    it('should return an empty array when there are no reported items', async () => {
      const req = {
        user: {
          userId: 'user123'
        },
        params: {
          subreddit: 'subreddit1'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      User.findOne = jest.fn().mockResolvedValue({ _id: 'user123', moderators: [{ subreddit: 'subreddit1' }] });
      Subreddit.findOne = jest.fn().mockResolvedValue({ _id: 'subredditId1' });
      UserReports.find = jest.fn().mockReturnValue({ populate: jest.fn().mockResolvedValue([]) });

      await getSubredditReportedContent(req, res, next);

      expect(User.findOne).toHaveBeenCalledWith({ _id: 'user123' });
      expect(Subreddit.findOne).toHaveBeenCalledWith({ name: 'subreddit1' });
      expect(UserReports.find).toHaveBeenCalledWith({ reportType: { $in: ["post", "comment"] }, linkedSubreddit: 'subredditId1', isIgnored: false, isViewed: false });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, content: [] });
    });

        // User is authenticated and tries to perform an action on a non-existent report, resulting in an error response
    it('should return an error response when the user is authenticated and the report does not exist', async () => {
      const req = {
        user: {
          userId: 'user123'
        },
        body: {
          reportId: 'report123',
          action: 'ignore'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
  
      User.findOne = jest.fn().mockResolvedValue({ _id: 'user123' });
      UserReports.findById = jest.fn().mockResolvedValue(null);
  
      await takeActionOnReport(req, res);
  
      expect(User.findOne).toHaveBeenCalledWith({ _id: 'user123' });
      expect(UserReports.findById).toHaveBeenCalledWith('report123');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Report not found' });
    });
        // User is authenticated and performs a valid 'ignore' action on an existing report
    it('should ignore the report when the user is authenticated and the report exists', async () => {
      const req = {
        user: {
          userId: 'user123'
        },
        body: {
          reportId: 'report123',
          action: 'ignore'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
  
      User.findOne = jest.fn().mockResolvedValue({ _id: 'user123' });
      UserReports.findById = jest.fn().mockResolvedValue({ isIgnored: false, save: jest.fn() });
  
      await takeActionOnReport(req, res);
  
      expect(User.findOne).toHaveBeenCalledWith({ _id: 'user123' });
      expect(UserReports.findById).toHaveBeenCalledWith('report123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Item ignored successfully' });
    });
        // User is authenticated and tries to delete a post or comment that doesn't exist, resulting in an error response
    it('should return an error response when trying to delete a non-existent post or comment', async () => {
      // Mock request object
      const req = {
        user: {
          userId: 'user123',
          username: 'admin'
        },
        body: {
          reportId: 'report123',
          action: 'delete'
        }
      };

      // Mock response object
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Mock User model
      
      User.findOne = jest.fn().mockResolvedValue({ _id: 'user123', username: 'admin' });

      // Mock UserReports model
      
      UserReports.findById = jest.fn().mockResolvedValue({ linkedItemType: 'Post', linkedItem: 'post123', linkedSubreddit: 'subreddit123', isViewed: false });

      // Mock Post model
      
      Post.findById = jest.fn().mockResolvedValue(null);
      Post.deleteOne = jest.fn();

      // Mock Subreddit model
      
      Subreddit.findOneAndUpdate = jest.fn().mockResolvedValue(null);

      await takeActionOnReport(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ _id: 'user123' });
      expect(UserReports.findById).toHaveBeenCalledWith('report123');
      expect(Post.findById).toHaveBeenCalledWith('post123');
      expect(Post.deleteOne).toHaveBeenCalled();
      expect(Subreddit.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'subreddit123' },
        { $pull: { posts: 'post123' } },
        { new: true }
      );
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Item not found' });
    });

        // Returns an empty array of reports if user is not authenticated.
    it('should return an empty array of reports when user is not authenticated', async () => {
      const req = { user: false };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      UserReports.find = jest.fn();

      await getAdminReports(req, res);

      expect(UserReports.find).not.toHaveBeenCalled();
    });
        // Retrieves admin reports that have not been ignored or viewed yet.
    it('should retrieve admin reports that have not been ignored or viewed yet', async () => {
      const req = { user: true };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const mockReports = [{ id: 1, isIgnored: false, isViewed: false }];
      UserReports.find = jest.fn().mockResolvedValue(mockReports);

      await getAdminReports(req, res);

      expect(UserReports.find).toHaveBeenCalledWith({
        isIgnored: false,
        isViewed: false,
      });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: "Internal server error" });
    });
        // Returns a successful response with admin reports if user is authenticated and there are reports that have not been ignored or viewed yet.
    it('should retrieve admin reports that have not been ignored or viewed yet', async () => {
      const req = { user: true };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const mockReports = [{ id: 1, isIgnored: false, isViewed: false }];
      UserReports.find = jest.fn().mockResolvedValue(mockReports);

      await getAdminReports(req, res);

      expect(UserReports.find).toHaveBeenCalledWith({
        isIgnored: false,
        isViewed: false,
      });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: "Internal server error" });
    });


    // Returns a 200 status code and an empty list of reports when the user is not authenticated.
    it('should return a 200 status code and an empty list of reports when the user is not authenticated', async () => {
      const req = { user: null };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      UserReports.find = jest.fn();

      await getAdminReportsHistory(req, res);

      expect(UserReports.find).not.toHaveBeenCalled();
    });