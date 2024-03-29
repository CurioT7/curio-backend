
const subredditModel = require("../models/subredditModel");
const { getRandomCommunities } = require("../controller/homePage/homepageController");

describe("getRandomCommunities", () => {
  it("should return a successful response with a random category and up to 5 random communities", async () => {
    // Mocking the database interaction
    const mockCategories = ["category1", "category2", "category3"];
    const mockCommunities = [
      { name: "community1" },
      { name: "community2" },
      { name: "community3" },
    ];

    // Mocking the database functions
    subredditModel.distinct = jest.fn().mockResolvedValue(mockCategories);
    subredditModel.find = jest.fn().mockResolvedValue(mockCommunities);

    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await getRandomCommunities(req, res);

    // Expecting a 200 status code and a response containing category and communities
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        category: expect.any(String),
        communities: expect.arrayContaining([
          expect.objectContaining({ name: expect.any(String) }),
        ]),
      })
    );
  });
});
