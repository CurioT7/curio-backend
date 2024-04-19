const { searchSuggestions } = require("../controller/search/searchController");
const User = require("../models/userModel");
const Subreddit = require("../models/subredditModel");
const Post = require("../models/postModel");

jest.mock("dotenv");
jest.mock("../models/userModel");
jest.mock("../models/subredditModel");
jest.mock("../models/postModel");

// Mocking the request and response objects
const req = {
  params: {
    query: encodeURIComponent("exampleQuery"),
  },
};
const res = {
  status: jest.fn(() => res),
  json: jest.fn(),
};

// Mocking the User.find and Subreddit.aggregate functions
User.find = jest.fn(() => ({
  select: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnValueOnce([
    { username: "user1", profilePicture: "url1", karma: 100 },
    { username: "user2", profilePicture: "url2", karma: 200 },
  ]),
}));
Subreddit.aggregate = jest.fn(() => [
  { name: "subreddit1", icon: "icon1", members: 1000 },
  { name: "subreddit2", icon: "icon2", members: 2000 },
]);

describe("searchSuggestions", () => {
  it("should return search suggestions for users and subreddits", async () => {
    await searchSuggestions(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      users: [
        { username: "user1", profilePicture: "url1", karma: 100 },
        { username: "user2", profilePicture: "url2", karma: 200 },
      ],
      subreddits: [
        { name: "subreddit1", icon: "icon1", members: 1000 },
        { name: "subreddit2", icon: "icon2", members: 2000 },
      ],
    });
  });

  it("should handle errors", async () => {
    const errorMessage = "Internal server error";
    User.find = jest.fn(() => {
      throw new Error(errorMessage);
    });
    await searchSuggestions(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: errorMessage,
    });
  });
});
