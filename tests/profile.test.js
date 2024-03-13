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
it("should retrieve all comments made by a specific user", async () => {
  const req = { params: { username: "testUser" } };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  const next = jest.fn();
  const dataType = "comments";

  const user = { username: "testUser" };
  User.findOne = jest.fn().mockResolvedValue(user);

  const comments = [{ text: "Comment 1" }, { text: "Comment 2" }];
  Comment.find = jest.fn().mockResolvedValue(comments);

  const profileController = new ProfileController();
  await profileController.getDataByUser(req, res, next, dataType);

  expect(User.findOne).toHaveBeenCalledWith({ username: "testUser" });
  expect(Comment.find).toHaveBeenCalledWith({ authorName: "testUser" });
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith(comments);
});
// Retrieves all downvoted posts and comments by a specific user.
it("should retrieve all downvoted posts and comments made by a specific user", async () => {
  // Mock request and response objects
  const req = { params: { username: "testUser" } };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  const next = jest.fn();

  // Mock User.findOne to return a promise that resolves immediately
  User.findOne = jest.fn().mockResolvedValue({ downvotes: [] });

  // Mock Post.find to return a promise that resolves immediately
  Post.find = jest.fn().mockResolvedValue([]);

  // Mock Comment.find to return a promise that resolves immediately
  Comment.find = jest.fn().mockResolvedValue([]);

  // Create an instance of ProfileController
  const profileController = new ProfileController();

  // Call the getDownvotedContent method
  await profileController.getDownvotedContent(req, res, next);

  // Assertions
  expect(User.findOne).toHaveBeenCalledWith({ username: "testUser" });
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({ votedPosts: [], votedComments: [] });
});
// Retrieves upvoted content by calling the 'getVotedContent' method with the 'upvotes' voteType parameter.
it("should retrieve upvoted content by calling the getVotedContent method with the upvotes voteType parameter", async () => {
  const req = { params: { username: "testUser" } };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  const next = jest.fn();
  const profileController = new ProfileController();

  // Mock the User.findOne method
  User.findOne = jest
    .fn()
    .mockResolvedValue({ username: "testUser", upvotes: [] });

  // Mock the Post.find and Comment.find methods
  Post.find = jest.fn().mockResolvedValue([]);
  Comment.find = jest.fn().mockResolvedValue([]);

  await profileController.getUpvotedContent(req, res, next);

  expect(User.findOne).toHaveBeenCalledWith({ username: "testUser" });
  expect(Post.find).toHaveBeenCalled();
  expect(Comment.find).toHaveBeenCalled();
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({
    votedPosts: [],
    votedComments: [],
  });
}, 20000);
