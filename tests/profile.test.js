// Test with a user that has no posts.
it("should return an empty array when the user has no posts", async () => {
  const req = { params: { username: "testUser" } };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
  const next = jest.fn();

  // Mock User.findOne to return null
  jest.spyOn(User, "findOne").mockResolvedValue(null);

  const profileController = new ProfileController();
  await profileController.getPostsByUser(req, res, next);

  expect(User.findOne).toHaveBeenCalledWith({ username: "testUser" });
  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({
    success: false,
    message: "User not found",
  });
});
    // Retrieves all posts made by a specific user.
    it('should retrieve all posts made by a specific user', async () => {
      const req = { params: { username: 'testUser' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      // Mock User.findOne
      jest.spyOn(User, 'findOne').mockResolvedValue({ username: 'testUser' });

      // Mock Post.find
      jest.spyOn(Post, 'find').mockResolvedValue([{ title: 'Post 1' }, { title: 'Post 2' }]);

      const profileController = new ProfileController();
      await profileController.getPostsByUser(req, res, next);

      expect(User.findOne).toHaveBeenCalledWith({ username: 'testUser' });
      expect(Post.find).toHaveBeenCalledWith({ authorName: 'testUser' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([{ title: 'Post 1' }, { title: 'Post 2' }]);
    });
    