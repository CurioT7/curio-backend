it('should return a status of 404 if the subreddit is not found', async () => {
    const req = { params: { subreddit: 'nonExistentSubreddit' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    subredditModel.findOne = jest.fn().mockResolvedValue(null);

    await mostComments(req, res);

    expect(subredditModel.findOne).toHaveBeenCalledWith({ name: 'nonExistentSubreddit' });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Subreddit not found' });
  });



  it('should return an error response for an invalid subreddit name', async () => {
    const req = { params: { subreddit: 'invalidSubreddit' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    const subredditModel = require("../../models/subredditModel");
    const Post = require("../../models/postModel");

    subredditModel.findOne = jest.fn().mockResolvedValue(null);

    await hotPosts(req, res);

    expect(subredditModel.findOne).toHaveBeenCalledWith({ name: 'invalidSubreddit' });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "Subreddit not found" });
  });

  it('should return an error response for an invalid subreddit name', async () => {
    const req = { params: { subreddit: 'invalidSubreddit' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    const subredditModel = require("../../models/subredditModel");
    const Post = require("../../models/postModel");

    subredditModel.findOne = jest.fn().mockResolvedValue(null);

    await hotPosts(req, res);

    expect(subredditModel.findOne).toHaveBeenCalledWith({ name: 'invalidSubreddit' });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "Subreddit not found" });
  });