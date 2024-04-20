const {
  reportContent,
  getReportedContent,
} = require("../controller/profile/reportController");
const { verifyToken } = require("../utils/tokens");
const User = require("../models/userModel");
const Post = require("../models/postModel");
const Comment = require("../models/commentModel");
const UserReports = require("../models/reportModel");
const Subreddit = require("../models/subredditModel");

jest.mock("../utils/tokens", () => ({
  verifyToken: jest.fn(),
}));
jest.mock("../models/userModel");
jest.mock("../models/postModel");
jest.mock("../models/commentModel");
jest.mock("../models/reportModel");
jest.mock("../models/subredditModel");

describe("reportContent function", () => {
  let req, res;

  beforeEach(() => {
    req = {
      headers: {
        authorization: "Bearer fakeToken",
      },
      body: {
        itemID: "item123",
        reportType: "post", 
        reportReason: "Spam",
        reportDetails: "This post is spamming promotional content.",
      },
    };
    res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };
  });

  it("should return 401 if the token is invalid", async () => {
    verifyToken.mockResolvedValue(null);

    await reportContent(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
  });

  it("should return 404 if user is not found", async () => {
    verifyToken.mockResolvedValue({ userId: "userId123" });
    User.findOne.mockResolvedValue(null);

    await reportContent(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  it("should return 404 if the reported item is not found", async () => {
    verifyToken.mockResolvedValue({ userId: "userId123" });
    User.findOne.mockResolvedValue({ username: "username123" });
    Post.findOne.mockResolvedValue(null); 

    await reportContent(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Item not found",
    });
  });

  it("should prevent users from reporting their own content", async () => {
    verifyToken.mockResolvedValue({ userId: "userId123" });
    User.findOne.mockResolvedValue({ username: "username123" });
    Post.findOne.mockResolvedValue({ authorName: "username123" }); 

    await reportContent(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "You cannot report your own content",
    });
  });

  it("should return 201 if the report is submitted successfully", async () => {
    verifyToken.mockResolvedValue({ userId: "userId123" });
    User.findOne.mockResolvedValue({ username: "reporterUsername" });
    Post.findOne.mockResolvedValue({
      authorName: "authorUsername",
      linkedSubreddit: "subreddit123",
    });
    UserReports.mockImplementation(() => ({ save: jest.fn() }));

    await reportContent(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Report submitted successfully",
    });
  });

  // it("should return 500 if there is an error saving the report", async () => {
  //   verifyToken.mockResolvedValue({ userId: "userId123" });
  //   User.findOne.mockResolvedValue({ username: "reporterUsername" });
  //   Post.findOne.mockResolvedValue({
  //     authorName: "authorUsername",
  //     linkedSubreddit: "subreddit123",
  //   });
  //   UserReports.mockImplementation(() => ({
  //     save: jest.fn(() => Promise.reject(new Error("Database error"))),
  //   }));

  //   await reportContent(req, res);

  //   expect(res.status).toHaveBeenCalledWith(500);
  //   expect(res.json).toHaveBeenCalledWith({
  //     success: false,
  //     message: "Internal server error",
  //     error: "Database error",
  //   });
  // });
});

describe("getReportedContent function", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {
        authorization: "Bearer fakeToken",
      },
      params: {
        subreddit: encodeURIComponent("subredditName"),
      },
    };
    res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };
    next = jest.fn();
  });
    
     it("should return 200 with reported content and reports when content is found", async () => {
       // Mocking the authorization and user/subreddit lookup
       verifyToken.mockResolvedValue({ userId: "userId123" });
       User.findOne.mockResolvedValue({ _id: "userId123", name: "Test User" });
       Subreddit.findOne.mockResolvedValue({
         _id: "subredditId123",
         name: "subredditName",
       });

       // Mocking the reports found
       UserReports.find.mockResolvedValue([
         { itemID: "item1", reportType: "post" },
         { itemID: "item2", reportType: "comment" },
       ]);

       // Mocking content retrieval
       Post.find.mockResolvedValue([
         { _id: "item1", title: "Post Title", content: "Post Content" },
       ]);
       Comment.find.mockResolvedValue([
         { _id: "item2", content: "Comment Content" },
       ]);

       await getReportedContent(req, res, next);

       expect(res.status).toHaveBeenCalledWith(200);
       expect(res.json).toHaveBeenCalledWith({
         success: true,
         reportedContet: [
           { _id: "item1", title: "Post Title", content: "Post Content" },
           { _id: "item2", content: "Comment Content" },
         ],
         reports: [
           { itemID: "item1", reportType: "post" },
           { itemID: "item2", reportType: "comment" },
         ],
       });
     });

  it("should return 401 if no authorization header is provided", async () => {
    req.headers.authorization = undefined;

    await getReportedContent(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "No authorization header provided",
    });
  });

  it("should return 401 if token is invalid", async () => {
    verifyToken.mockResolvedValue(null);

    await getReportedContent(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
  });

  it("should return 404 if user is not found", async () => {
    verifyToken.mockResolvedValue({ userId: "userId123" });
    User.findOne.mockResolvedValue(null);

    await getReportedContent(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  it("should return 404 if subreddit is not found", async () => {
    verifyToken.mockResolvedValue({ userId: "userId123" });
    User.findOne.mockResolvedValue({});
    Subreddit.findOne.mockResolvedValue(null);

    await getReportedContent(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Subreddit not found" });
  });

  // it("should handle server errors", async () => {
  //   verifyToken.mockRejectedValue(new Error("Server error"));

  //   await getReportedContent(req, res, next);

  //   expect(res.status).toHaveBeenCalledWith(500);
  //   expect(res.json).toHaveBeenCalledWith({
  //     success: false,
  //     message: "Internal server error",
  //     error: "Server error",
  //   });
  // });
});
