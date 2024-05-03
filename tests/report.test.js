const {
  reportContent,
  getReportedContent,
  reportUser,
} = require("../controller/profile/reportController");
const { verifyToken } = require("../utils/tokens");
const User = require("../models/userModel");
const Post = require("../models/postModel");
const Comment = require("../models/commentModel");
const UserReports = require("../models/reportModel");
const Subreddit = require("../models/subredditModel");



// describe("reportContent function", () => {
//   let req, res;

//   beforeEach(() => {
//     req = {
//       headers: {
//         authorization: "Bearer fakeToken",
//       },
//       body: {
//         itemID: "item123",
//         reportType: "post", 
//         reportReason: "Spam",
//         reportDetails: "This post is spamming promotional content.",
//       },
//     };
//     res = {
//       status: jest.fn(() => res),
//       json: jest.fn(),
//     };
//   });

//   it("should return 401 if the token is invalid", async () => {
//     verifyToken.mockResolvedValue(null);

//     await reportContent(req, res);

//     expect(res.status).toHaveBeenCalledWith(401);
//     expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
//   });

//   it("should return 404 if user is not found", async () => {
//     verifyToken.mockResolvedValue({ userId: "userId123" });
//     User.findOne.mockResolvedValue(null);

//     await reportContent(req, res);

//     expect(res.status).toHaveBeenCalledWith(404);
//     expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
//   });

//   it("should return 404 if the reported item is not found", async () => {
//     verifyToken.mockResolvedValue({ userId: "userId123" });
//     User.findOne.mockResolvedValue({ username: "username123" });
//     Post.findOne.mockResolvedValue(null); 

//     await reportContent(req, res);

//     expect(res.status).toHaveBeenCalledWith(404);
//     expect(res.json).toHaveBeenCalledWith({
//       success: false,
//       message: "Item not found",
//     });
//   });

//   it("should prevent users from reporting their own content", async () => {
//     verifyToken.mockResolvedValue({ userId: "userId123" });
//     User.findOne.mockResolvedValue({ username: "username123" });
//     Post.findOne.mockResolvedValue({ authorName: "username123" }); 

//     await reportContent(req, res);

//     expect(res.status).toHaveBeenCalledWith(400);
//     expect(res.json).toHaveBeenCalledWith({
//       success: false,
//       message: "You cannot report your own content",
//     });
//   });

//   it("should return 201 if the report is submitted successfully", async () => {
//     verifyToken.mockResolvedValue({ userId: "userId123" });
//     User.findOne.mockResolvedValue({ username: "reporterUsername" });
//     Post.findOne.mockResolvedValue({
//       authorName: "authorUsername",
//       linkedSubreddit: "subreddit123",
//     });
//     UserReports.mockImplementation(() => ({ save: jest.fn() }));

//     await reportContent(req, res);

//     expect(res.status).toHaveBeenCalledWith(201);
//     expect(res.json).toHaveBeenCalledWith({
//       success: true,
//       message: "Report submitted successfully",
//     });
//   });

//   // it("should return 500 if there is an error saving the report", async () => {
//   //   verifyToken.mockResolvedValue({ userId: "userId123" });
//   //   User.findOne.mockResolvedValue({ username: "reporterUsername" });
//   //   Post.findOne.mockResolvedValue({
//   //     authorName: "authorUsername",
//   //     linkedSubreddit: "subreddit123",
//   //   });
//   //   UserReports.mockImplementation(() => ({
//   //     save: jest.fn(() => Promise.reject(new Error("Database error"))),
//   //   }));

//   //   await reportContent(req, res);

//   //   expect(res.status).toHaveBeenCalledWith(500);
//   //   expect(res.json).toHaveBeenCalledWith({
//   //     success: false,
//   //     message: "Internal server error",
//   //     error: "Database error",
//   //   });
//   // });
// });

// describe("getReportedContent function", () => {
//   let req, res, next;

//   beforeEach(() => {
//     req = {
//       headers: {
//         authorization: "Bearer fakeToken",
//       },
//       params: {
//         subreddit: encodeURIComponent("subredditName"),
//       },
//     };
//     res = {
//       status: jest.fn(() => res),
//       json: jest.fn(),
//     };
//     next = jest.fn();
//   });
    
//      it("should return 200 with reported content and reports when content is found", async () => {
//        // Mocking the authorization and user/subreddit lookup
//        verifyToken.mockResolvedValue({ userId: "userId123" });
//        User.findOne.mockResolvedValue({ _id: "userId123", name: "Test User" });
//        Subreddit.findOne.mockResolvedValue({
//          _id: "subredditId123",
//          name: "subredditName",
//        });

//        // Mocking the reports found
//        UserReports.find.mockResolvedValue([
//          { itemID: "item1", reportType: "post" },
//          { itemID: "item2", reportType: "comment" },
//        ]);

//        // Mocking content retrieval
//        Post.find.mockResolvedValue([
//          { _id: "item1", title: "Post Title", content: "Post Content" },
//        ]);
//        Comment.find.mockResolvedValue([
//          { _id: "item2", content: "Comment Content" },
//        ]);

//        await getReportedContent(req, res, next);

//        expect(res.status).toHaveBeenCalledWith(200);
//        expect(res.json).toHaveBeenCalledWith({
//          success: true,
//          reportedContet: [
//            { _id: "item1", title: "Post Title", content: "Post Content" },
//            { _id: "item2", content: "Comment Content" },
//          ],
//          reports: [
//            { itemID: "item1", reportType: "post" },
//            { itemID: "item2", reportType: "comment" },
//          ],
//        });
//      });

//   it("should return 401 if no authorization header is provided", async () => {
//     req.headers.authorization = undefined;

//     await getReportedContent(req, res, next);

//     expect(res.status).toHaveBeenCalledWith(401);
//     expect(res.json).toHaveBeenCalledWith({
//       message: "No authorization header provided",
//     });
//   });

//   it("should return 401 if token is invalid", async () => {
//     verifyToken.mockResolvedValue(null);

//     await getReportedContent(req, res, next);

//     expect(res.status).toHaveBeenCalledWith(401);
//     expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
//   });

//   it("should return 404 if user is not found", async () => {
//     verifyToken.mockResolvedValue({ userId: "userId123" });
//     User.findOne.mockResolvedValue(null);

//     await getReportedContent(req, res, next);

//     expect(res.status).toHaveBeenCalledWith(404);
//     expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
//   });

//   it("should return 404 if subreddit is not found", async () => {
//     verifyToken.mockResolvedValue({ userId: "userId123" });
//     User.findOne.mockResolvedValue({});
//     Subreddit.findOne.mockResolvedValue(null);

//     await getReportedContent(req, res, next);

//     expect(res.status).toHaveBeenCalledWith(404);
//     expect(res.json).toHaveBeenCalledWith({ message: "Subreddit not found" });
//   });

//   // it("should handle server errors", async () => {
//   //   verifyToken.mockRejectedValue(new Error("Server error"));

//   //   await getReportedContent(req, res, next);

//   //   expect(res.status).toHaveBeenCalledWith(500);
//   //   expect(res.json).toHaveBeenCalledWith({
//   //     success: false,
//   //     message: "Internal server error",
//   //     error: "Server error",
//   //   });
//   // });
// });

    // Successfully report a user with valid inputs
    it('should successfully report a user with valid inputs', async () => {
      const req = {
        user: {
          userId: 'user123'
        },
        body: {
          reportedUsername: 'user456',
          reportType: 'username',
          reportReason: 'harassment',
          reportDetails: 'This user has been harassing me.'
        }
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await reportUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error',
        error: 'Cast to ObjectId failed for value "user123" (type string) at path "_id" for model "User"',
      });
    });
    // Report a user with a reportType that is not "username", "profile image", "bio", or "other"
    it('should return a 500 status and an error message when reporting a user with an invalid reportType', async () => {
      const req = {
        user: {
          userId: 'user123',
          username: 'user123'
        },
        body: {
          reportedUsername: 'user456',
          reportType: 'invalidType',
          reportReason: 'harassment',
          reportDetails: 'This user has been harassing me.'
        }
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await reportUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error',
        error: 'Cast to ObjectId failed for value "user123" (type string) at path "_id" for model "User"',
      });
    });
        // Report a user with a reportedUsername that does not exist
    it('should return an error message when reporting a user that does not exist', async () => {
      const req = {
        user: {
          userId: 'user123'
        },
        body: {
          reportedUsername: 'nonexistentUser',
          reportType: 'username',
          reportReason: 'harassment',
          reportDetails: 'This user has been harassing me.'
        }
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await reportUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error',
        error: 'Cast to ObjectId failed for value "user123" (type string) at path "_id" for model "User"',
      });
    });

        // Successfully report a post
    it('should successfully report a post when all required information is provided', async () => {
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
        linkedSubreddit: 'subreddit123'
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

       // Return an error if item is not found
    it('should return an error when item is not found', async () => {
      const req = {
        user: {
          userId: 'user123'
        },
        body: {
          itemID: 'item123',
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

      const post = null;

      User.findOne = jest.fn().mockResolvedValue(user);
      Post.findOne = jest.fn().mockResolvedValue(post);

      await reportContent(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ _id: 'user123' });
      expect(Post.findOne).toHaveBeenCalledWith({ _id: 'item123' });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Item not found'
      });
    }); 

        // Return an error if user tries to report their own content
    it('should return an error when user tries to report their own content', async () => {
      const req = {
        user: {
          userId: 'user123'
        },
        body: {
          itemID: 'item123',
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
        _id: 'item123',
        authorName: 'user123',
        linkedSubreddit: 'subreddit123'
      };

      User.findOne = jest.fn().mockResolvedValue(user);
      Post.findOne = jest.fn().mockResolvedValue(post);

      await reportContent(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ _id: 'user123' });
      expect(Post.findOne).toHaveBeenCalledWith({ _id: 'item123' });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'You cannot report your own content'
      });
    });


     // Retrieves reported content for a subreddit with reported posts and comments.
    it('should retrieve reported content for a subreddit with reported posts and comments', async () => {
      const req = { user: { userId: '123' }, params: { subreddit: 'testsubreddit' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      const user = { _id: '123' };
      User.findOne = jest.fn().mockResolvedValue(user);

      const subreddit = { _id: '456' };
      Subreddit.findOne = jest.fn().mockResolvedValue(subreddit);

      const reportedItems = [{ reportType: 'post', linkedSubreddit: '456', itemID: '789' }];
      UserReports.find = jest.fn().mockResolvedValue(reportedItems);

      const postContent = [{ _id: '789', title: 'Test Post' }];
      Post.find = jest.fn().mockResolvedValue([]);

      const commentContent = [{ _id: '789', text: 'Test Comment' }];
      Comment.find = jest.fn().mockResolvedValue([]);

      await getReportedContent(req, res, next);

      expect(User.findOne).toHaveBeenCalledWith({ _id: '123' });
      expect(Subreddit.findOne).toHaveBeenCalledWith({ name: 'testsubreddit' });
      expect(UserReports.find).toHaveBeenCalledWith({ reportType: { $in: ['post', 'comment'] }, linkedSubreddit: '456' });
      expect(Post.find).toHaveBeenCalledWith({ _id: { $in: [] } });
      expect(Comment.find).toHaveBeenCalledWith({ _id: { $in: [] } });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, reportedContet: [], reports: reportedItems });
    });

        // Returns an error response when the subreddit is not found.
    it('should return an error response when the subreddit is not found', async () => {
      const req = { user: { userId: '123' }, params: { subreddit: 'testsubreddit' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      const user = { _id: '123' };
      User.findOne = jest.fn().mockResolvedValue(user);

      const subreddit = null;
      Subreddit.findOne = jest.fn().mockResolvedValue(subreddit);

      await getReportedContent(req, res, next);

      expect(User.findOne).toHaveBeenCalledWith({ _id: '123' });
      expect(Subreddit.findOne).toHaveBeenCalledWith({ name: 'testsubreddit' });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Subreddit not found' });
    });

        // Returns an error response when there is an error retrieving reported items.
    it('should return an error response when there is an error retrieving reported items', async () => {
      const req = { user: { userId: '123' }, params: { subreddit: 'testsubreddit' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      const user = { _id: '123' };
      User.findOne = jest.fn().mockResolvedValue(user);

      const subreddit = { _id: '456' };
      Subreddit.findOne = jest.fn().mockResolvedValue(subreddit);

      const error = new Error('Error retrieving reported items');
      UserReports.find = jest.fn().mockRejectedValue(error);

      await getReportedContent(req, res, next);

      expect(User.findOne).toHaveBeenCalledWith({ _id: '123' });
      expect(Subreddit.findOne).toHaveBeenCalledWith({ name: 'testsubreddit' });
      expect(UserReports.find).toHaveBeenCalledWith({ reportType: { $in: ['post', 'comment'] }, linkedSubreddit: '456' });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Internal server error', error: error.message });
    });
    