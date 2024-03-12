// Successfully retrieve all posts made by a specific user
it("should retrieve all posts made by a specific user", async () => {
  const req = { params: { username: "testUser" } };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  const next = jest.fn();
  const dataType = "posts";

  const user = { username: "testUser" };
  User.findOne = jest.fn().mockResolvedValue(user);

  const posts = [{ title: "Post 1" }, { title: "Post 2" }];
  Post.find = jest.fn().mockResolvedValue(posts);

  const profileController = new ProfileController();
  await profileController.getDataByUser(req, res, next, dataType);

  expect(User.findOne).toHaveBeenCalledWith({ username: "testUser" });
  expect(Post.find).toHaveBeenCalledWith({ authorName: "testUser" });
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith(posts);
});
    // Successfully retrieve all comments made by a specific user
    it('should retrieve all comments made by a specific user', async () => {
      const req = { params: { username: 'testUser' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      const dataType = 'comments';

      const user = { username: 'testUser' };
      User.findOne = jest.fn().mockResolvedValue(user);

      const comments = [{ text: 'Comment 1' }, { text: 'Comment 2' }];
      Comment.find = jest.fn().mockResolvedValue(comments);

      const profileController = new ProfileController();
      await profileController.getDataByUser(req, res, next, dataType);

      expect(User.findOne).toHaveBeenCalledWith({ username: 'testUser' });
      expect(Comment.find).toHaveBeenCalledWith({ authorName: 'testUser' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(comments);
    });
        // Successfully retrieve upvoted posts and comments by a specific user
    it('should retrieve upvoted posts and comments by a specific user when user exists', async () => {
      const req = { params: { username: 'testUser' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      const user = { username: 'testUser', upvotes: [{ itemType: 'Post', itemId: 'post1' }, { itemType: 'Comment', itemId: 'comment1' }] };
      User.findOne = jest.fn().mockResolvedValue(user);

      const posts = [{ title: 'Post 1' }];
      const comments = [{ text: 'Comment 1' }];
      Post.find = jest.fn().mockResolvedValue(posts);
      Comment.find = jest.fn().mockResolvedValue(comments);

      const profileController = new ProfileController();
      await profileController.getUpvotedContent(req, res, next);

      expect(User.findOne).toHaveBeenCalledWith({ username: 'testUser' });
      expect(Post.find).toHaveBeenCalledWith({ _id: { $in: ['post1'] } });
      expect(Comment.find).toHaveBeenCalledWith({ _id: { $in: ['comment1'] } });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        upvotedPosts: posts,
        upvotedComments: comments,
      });
    });