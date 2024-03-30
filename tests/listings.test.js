// Retrieve and sort posts based on upvotes and downvotes proportion
it("should retrieve and sort posts based on upvotes and downvotes proportion", async () => {
  const req = {};
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  // Mock the Post.find method to return an array of posts
  Post.find = jest.fn().mockResolvedValue([
    { upvotes: 10, downvotes: 5 },
    { upvotes: 5, downvotes: 10 },
    { upvotes: 15, downvotes: 0 },
  ]);

  await getBestPosts(req, res);

  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({
    success: true,
    SortedPosts: [
      { upvotes: 15, downvotes: 0 },
      { upvotes: 10, downvotes: 5 },
      { upvotes: 5, downvotes: 10 },
    ],
  });
});
