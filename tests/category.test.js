// Retrieves communities belonging to a specified category.
it("should retrieve communities belonging to a specified category", async () => {
  const req = { body: { category: "testCategory" } };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  // Mock the Subreddit.find method to return a predefined result
  Subreddit.find = jest
    .fn()
    .mockResolvedValue([{ name: "community1" }, { name: "community2" }]);

  await getCommunitiesByCategory(req, res);

  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({
    success: true,
    communities: expect.any(Array),
  });
}, 10000);
