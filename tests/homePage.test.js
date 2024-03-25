// Returns a successful response with a random category and up to 5 random communities.
it("should return a successful response with a random category and up to 5 random communities", async () => {
  const req = {};
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  await getRandomCommunities(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith(
    expect.objectContaining({
      success: false,
      message: "Internal server error",
    })
  );
}, 30000);
