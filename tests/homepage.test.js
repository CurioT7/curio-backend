const Subreddit = require("../models/subredditModel");
const {
  getRandomCommunities,
  getCommunitiesByCategory,
} = require("../controller/community/categoryController");
jest.mock("../models/subredditModel");
jest.mock("../models/userModel");
jest.mock("../utils/tokens");


describe("getCommunitiesByCategory function", () => {
  it("should return communities belonging to the specified category", async () => {
    // Mocking request and response objects
    const req = {
      body: {
        category: "testCategory",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const communities = [
      { name: "community1", category: "testCategory" },
      { name: "community2", category: "testCategory" },
    ];

    Subreddit.find.mockResolvedValue(communities);

    await getCommunitiesByCategory(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      communities: communities,
    });
  });

  it("should return a 400 status code if category parameter is missing", async () => {
    const req = {
      body: {},
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await getCommunitiesByCategory(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Category parameter is required",
    });
  });

  it("should retrieve communities belonging to a specified category when category parameter is provided", async () => {
    const req = { body: { category: "testCategory" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Mock the Subreddit.find() function to return a resolved promise
    Subreddit.find = jest.fn().mockResolvedValue([]);

    await getCommunitiesByCategory(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, communities: [] });
  });
});
describe("getRandomCommunities function", () => {
  it("should return random communities from a random category", async () => {
    // Mocking distinct categories and communities
    const categories = ["category1", "category2"];
    const communities = [
      { name: "community1", category: "category1" },
      { name: "community2", category: "category1" },
      { name: "community3", category: "category2" },
    ];

    // Mocking Subreddit.distinct and Subreddit.find
    Subreddit.distinct.mockResolvedValue(categories);
    Subreddit.find.mockImplementation(({ category }) => {
      const filteredCommunities = communities.filter(
        (community) => community.category === category
      );
      return Promise.resolve(filteredCommunities);
    });

    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await getRandomCommunities(req, res);

    // Assertions
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      category: expect.any(String),
      communities: expect.any(Array),
    });
  });

  it("should return a 404 status code if no categories are found", async () => {
    // Mocking no categories found
    Subreddit.distinct.mockResolvedValue([]);

    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await getRandomCommunities(req, res);

    // Assertions
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "No categories found",
    });
  });

  it("should return a 404 status code if no communities are found in the random category", async () => {
    // Mocking categories but no communities found in the random category
    Subreddit.distinct.mockResolvedValue(["category1"]);
    Subreddit.find.mockResolvedValue([]);

    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await getRandomCommunities(req, res);

    // Assertions
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "No communities found in the random category",
    });
  });

});
