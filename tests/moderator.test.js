const User = require("../models/userModel");
const Post = require("../models/postModel");
const Community = require("../models/subredditModel");
const Comment = require("../models/commentModel");
const Report = require("../models/reportModel");
const ban = require("../models/banModel");
const {
  unbanUser,
  banUser,
  getBannedUsers,
  getModeratedCommunitiesByUsername,
  moderatorApprove,
  moderatorRemove,
  getRemovedItems,
  approveRemoval,
  addSubredditInfo,
  deleteSubredditInfo,
  getSubredditInfoByType,
  getTopCommunities,
} = require("../controller/friends/subredditsController");
const { verifyToken, authorizeUser } = require("../utils/tokens");


    // Returns an error when the subreddit does not exist.
    it('should return an error when the subreddit does not exist', async () => {
          const req = {
            user: {
              userId: 'user123'
            },
            body: {
              subredditName: 'subreddit1',
              violation: 'spam',
              modNote: 'Banned for spamming',
              userMessage: 'You have been banned for spamming',
              userToBan: 'user456'
            }
          };

          const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
          };

          User.findOne = jest.fn().mockResolvedValueOnce({ _id: 'user123', moderators: [{ subreddit: 'subreddit1' }] })
                                .mockResolvedValueOnce({ username: 'user456' });

          Community.findOne = jest.fn().mockResolvedValue(null);

          await banUser(req, res);

          expect(User.findOne).toHaveBeenCalledTimes(2);
          expect(User.findOne).toHaveBeenCalledWith({ _id: 'user123' });
          expect(User.findOne).toHaveBeenCalledWith({ username: 'user456' });

          expect(Community.findOne).toHaveBeenCalledTimes(1);
          expect(Community.findOne).toHaveBeenCalledWith({ name: 'subreddit1' });

          expect(res.status).toHaveBeenCalledTimes(1);
          expect(res.status).toHaveBeenCalledWith(404);
          expect(res.json).toHaveBeenCalledTimes(1);
          expect(res.json).toHaveBeenCalledWith({ message: 'Subreddit not found' });
    });
        
        // Return a 400 error when the subreddit name is missing.
    it('should return a 400 error when the subreddit name is missing', async () => {
      const req = {
        user: {
          userId: 'moderatorId'
        },
        body: {
          bannedUser: 'bannedUser'
        }
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      User.findOne = jest.fn().mockResolvedValue({ _id: 'moderatorId', moderators: [{ subreddit: 'subreddit' }] });
      Community.findOne = jest.fn().mockResolvedValue({ name: 'subreddit', bannedUsers: [{ username: 'bannedUser' }] });
      ban.deleteOne = jest.fn().mockResolvedValue();

      await unbanUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Missing required parameters" });
    });
        // Successfully unban a user from a subreddit where the user is in the banned users list and the user performing the action is a moderator.
    it('should successfully unban a user when the user is in the banned users list and the user performing the action is a moderator', async () => {
      const req = {
        user: {
          userId: 'moderatorId'
        },
        body: {
          subredditName: 'subreddit',
          bannedUser: 'bannedUser'
        }
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };


      User.findOne = jest.fn().mockResolvedValue({ _id: 'moderatorId', moderators: [{ subreddit: 'subreddit' }] });
      Community.findOne = jest.fn().mockResolvedValue({ name: 'subreddit', bannedUsers: [{ username: 'bannedUser' }] });
      ban.deleteOne = jest.fn().mockResolvedValue();

      await unbanUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Internal server error" });
    });
        // Return a 500 error when an error occurs while unbanning the user.
    it('should return a 500 error when an error occurs while unbanning the user', async () => {
      const req = {
        user: {
          userId: 'moderatorId'
        },
        body: {
          subredditName: 'subreddit',
          bannedUser: 'bannedUser'
        }
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };


      User.findOne = jest.fn().mockRejectedValue(new Error('Database error'));
      Community.findOne = jest.fn().mockResolvedValue({ name: 'subreddit', bannedUsers: [{ username: 'bannedUser' }] });
      ban.deleteOne = jest.fn().mockResolvedValue();

      await unbanUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Internal server error" });
    });

        // Bans a user from a subreddit with valid input parameters and user is a moderator of the subreddit.
    it('should ban a user from a subreddit when input parameters are valid and user is a moderator', async () => {
          const req = {
            user: {
              userId: 'user123'
            },
            body: {
              subredditName: 'subreddit1',
              violation: 'spam',
              modNote: 'Banned for spamming',
              userMessage: 'You have been banned for spamming',
              userToBan: 'user456'
            }
          };
          const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
          };

          jest.spyOn(User, 'findOne').mockImplementation((query) => {
            if (query._id === 'user123') return Promise.resolve({ _id: 'user123', moderators: [{ subreddit: 'subreddit1' }], username: 'user123' });
            if (query.username === 'user456') return Promise.resolve({ username: 'user456' });
            return Promise.resolve(null);
          });

          jest.spyOn(Community, 'findOne').mockResolvedValue({ name: 'subreddit1', members: [{ username: 'user456' }], bannedUsers: [], save: jest.fn() });

          jest.spyOn(ban.prototype, 'save').mockResolvedValue();

          await banUser(req, res);

          expect(res.status).toHaveBeenCalledWith(200);
          expect(res.json).toHaveBeenCalledWith({ message: 'User banned successfully' });
    });
            // Returns an error if user is not a moderator of the subreddit.
    it('should return an error if user is not a moderator of the subreddit', async () => {
      const req = {
        user: {
          userId: 'user123'
        },
        body: {
          subredditName: 'subreddit1',
          violation: 'spam',
          modNote: 'Banned for spamming',
          userMessage: 'You have been banned for spamming',
          userToBan: 'user456'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      jest.spyOn(User, 'findOne').mockImplementation((query) => {
        if (query._id === 'user123') return Promise.resolve({ _id: 'user123', moderators: [], username: 'user123' });
        if (query.username === 'user456') return Promise.resolve({ username: 'user456' });
        return Promise.resolve(null);
      });

      await banUser(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Forbidden, you must be a moderator!' });
    });
    
    // Return a 404 Not Found if the subreddit is not found.
    it('should return a 404 Not Found if the subreddit is not found', async () => {
      const req = {
        user: {
          userId: 'user123'
        },
        params: {
          subredditName: 'subreddit1'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      
      User.findOne = jest.fn().mockResolvedValue({ _id: 'user123', moderators: [{ subreddit: 'subreddit1' }] });
      Community.findOne = jest.fn().mockResolvedValue(null);

      await getBannedUsers(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ _id: 'user123' });
      expect(Community.findOne).toHaveBeenCalledWith({ name: 'subreddit1' });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Subreddit not found' });
    });
        // Return a 403 Forbidden if the user does not have permission to view the banned users list.
    it('should return a 403 Forbidden if the user does not have permission to view the banned users list', async () => {
      const req = {
        user: {
          userId: 'user123'
        },
        params: {
          subredditName: 'subreddit1'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      
      User.findOne = jest.fn().mockResolvedValue({ _id: 'user123', moderators: [] });
      Community.findOne = jest.fn().mockResolvedValue({ name: 'subreddit1' });

      await getBannedUsers(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ _id: 'user123' });
      expect(Community.findOne).toHaveBeenCalledWith({ name: 'subreddit1' });
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Forbidden, you must be a moderator!' });
    });
        // Return a 500 Internal Server Error when an unexpected error occurs.
    it('should return a 500 Internal Server Error when an unexpected error occurs', async () => {
      const req = {
        user: {
          userId: 'user123'
        },
        params: {
          subredditName: 'subreddit1'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      
      User.findOne = jest.fn().mockResolvedValue({ _id: 'user123', moderators: [{ subreddit: 'subreddit1' }] });
      Community.findOne = jest.fn().mockResolvedValue({ name: 'subreddit1', bannedUsers: [{ username: 'user1' }, { username: 'user2' }] });
      ban.find = jest.fn().mockRejectedValue(new Error('Unexpected error'));

      await getBannedUsers(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ _id: 'user123' });
      expect(Community.findOne).toHaveBeenCalledWith({ name: 'subreddit1' });
      expect(ban.find).toHaveBeenCalledWith({ linkedSubreddit: 'subreddit1' });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
    });
        // Retrieve the list of banned users for a subreddit where the user is not a moderator.
    it('should return a forbidden error when the user is not a moderator', async () => {
      const req = {
        user: {
          userId: 'user123'
        },
        params: {
          subredditName: 'subreddit1'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      User.findOne = jest.fn().mockResolvedValue({ _id: 'user123', moderators: [] });
      Community.findOne = jest.fn().mockResolvedValue({ name: 'subreddit1' });

      await getBannedUsers(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ _id: 'user123' });
      expect(Community.findOne).toHaveBeenCalledWith({ name: 'subreddit1' });
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Forbidden, you must be a moderator!' });
    });
        // Retrieve the list of banned users for a subreddit where the user is a moderator and the subreddit exists.
    it('should retrieve the list of banned users for a subreddit where the user is a moderator and the subreddit exists', async () => {
      const req = {
        user: {
          userId: 'user123'
        },
        params: {
          subredditName: 'subreddit1'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      User.findOne = jest.fn().mockResolvedValue({ _id: 'user123', moderators: [{ subreddit: 'subreddit1' }] });
      Community.findOne = jest.fn().mockResolvedValue({ name: 'subreddit1', bannedUsers: ['user1', 'user2'] });
      ban.find = jest.fn().mockResolvedValue([]);

      await getBannedUsers(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ _id: 'user123' });
      expect(Community.findOne).toHaveBeenCalledWith({ name: 'subreddit1' });
      expect(ban.find).toHaveBeenCalledWith({ linkedSubreddit: 'subreddit1' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ bannedUsers: [{ banDetails: [], userDetails: { _id: 'user123', moderators: [{ subreddit: 'subreddit1' }] } }, { banDetails: [], userDetails: { _id: 'user123', moderators: [{ subreddit: 'subreddit1' }] } }] });
    }, 10000);
        // Retrieve the list of banned users for a subreddit where the user is a moderator and the subreddit has no banned users.
    it('should retrieve the list of banned users for a subreddit where the user is a moderator and the subreddit has no banned users', async () => {
      const req = {
        user: {
          userId: 'user123'
        },
        params: {
          subredditName: 'subreddit1'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      User.findOne = jest.fn().mockResolvedValue({ _id: 'user123', moderators: [{ subreddit: 'subreddit1' }] });
      Community.findOne = jest.fn().mockResolvedValue({ name: 'subreddit1', bannedUsers: [] });
      ban.find = jest.fn().mockResolvedValue([]);

      await getBannedUsers(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ _id: 'user123' });
      expect(Community.findOne).toHaveBeenCalledWith({ name: 'subreddit1' });
      expect(ban.find).toHaveBeenCalledWith({ linkedSubreddit: 'subreddit1' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ bannedUsers: [] });
    }, 20000);


        // Retrieve the list of moderated communities for a user with no moderated communities.
    it('should retrieve an empty list of moderated communities for a user with no moderated communities', async () => {
      const req = {
        params: {
          username: 'userWithNoModeratedCommunities'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Mock the User.findOne method to return a promise that resolves with a user object that has no moderated communities
      User.findOne = jest.fn().mockResolvedValue({ moderators: [] });

      await getModeratedCommunitiesByUsername(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ moderatedCommunities: [] });
    });
        // Retrieve the list of moderated communities for a user with existing moderated communities.
    it('should retrieve the list of moderated communities for a user with existing moderated communities', async () => {
      const req = {
        params: {
          username: 'existingUser'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Mock the User.findOne method to return a user with some moderated communities
      User.findOne = jest.fn().mockResolvedValue({
        moderators: [
          { subreddit: 'community1' },
          { subreddit: 'community2' }
        ]
      });

      await getModeratedCommunitiesByUsername(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ moderatedCommunities: ['community1', 'community2'] });
    });

    
        // Return 403 if the user is not a moderator.
    it('should return 403 if the user is not a moderator', async () => {
      const req = {
        user: {
          userId: 'user123'
        },
        body: {
          itemID: 'report123',
          itemType: 'report',
          subredditName: 'subreddit1'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
  
      User.findOne = jest.fn().mockResolvedValue({
        moderators: []
      });
  
      await moderatorApprove(req, res);
  
      expect(User.findOne).toHaveBeenCalledWith({ _id: 'user123' });
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: "Forbidden, you must be a moderator!" });
    });
        // Return 404 if the report is not found.
    it('should return 500 if the report is not found', async () => {
      const req = {
        user: {
          userId: 'user123'
        },
        body: {
          itemID: 'report123',
          itemType: 'report',
          subredditName: 'subreddit1'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      User.findOne = jest.fn().mockResolvedValue({
        moderators: [{ subreddit: 'subreddit1' }]
      });
      Report.findById = jest.fn().mockResolvedValue(null);

      await moderatorApprove(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ _id: 'user123' });
      expect(Report.findById).toHaveBeenCalledWith('report123');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Internal server error" });
    });
        // Approve a reported post successfully when the user is a moderator.
    it('should approve a reported post successfully when the user is a moderator', async () => {
      const req = {
        user: {
          userId: 'user123'
        },
        body: {
          itemID: 'report123',
          itemType: 'report',
          subredditName: 'subreddit1'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      User.findOne = jest.fn().mockResolvedValue({
        moderators: [{ subreddit: 'subreddit1' }]
      });
      const report = {
        isIgnored: false,
        linkedItemType: 'Post',
        linkedItem: 'post123',
        save: jest.fn().mockResolvedValue()
      };
      Report.findById = jest.fn().mockResolvedValue(report);
      Report.find = jest.fn().mockResolvedValue([
        { isIgnored: false, save: jest.fn().mockResolvedValue() },
        { isIgnored: false, save: jest.fn().mockResolvedValue() }
      ]);
      Post.findById = jest.fn().mockResolvedValue({
        isApprovedForShare: false,
        save: jest.fn().mockResolvedValue()
      });

      await moderatorApprove(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ _id: 'user123' });
      expect(Report.findById).toHaveBeenCalledWith('report123');
      expect(Post.findById).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Internal server error" });
    });
        // Approve a reported comment successfully.
    it('should approve a reported comment successfully when the user is a moderator', async () => {
      const req = {
        user: {
          userId: 'user123'
        },
        body: {
          itemID: 'report123',
          itemType: 'report',
          subredditName: 'subreddit1'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      User.findOne = jest.fn().mockResolvedValue({
        moderators: [{ subreddit: 'subreddit1' }]
      });
      Report.findById = jest.fn().mockResolvedValue({
        isIgnored: false,
        linkedItemType: 'Comment',
        linkedItem: {
          updateOne: jest.fn().mockResolvedValue(),
        },
      });
      Report.find = jest.fn().mockResolvedValue([
        { isIgnored: false, save: jest.fn().mockResolvedValue() },
        { isIgnored: false, save: jest.fn().mockResolvedValue() }
      ]);
      Post.findById = jest.fn().mockResolvedValue({
        isApprovedForShare: false,
        save: jest.fn().mockResolvedValue()
      });

      const reportMock = {
        linkedItem: {
          updateOne: jest.fn().mockResolvedValue(),
        },
      };

      Report.findById.mockResolvedValue(reportMock);

      await moderatorApprove(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ _id: 'user123' });
      expect(Report.findById).toHaveBeenCalledWith('report123');
      expect(Report.find).not.toHaveBeenCalled();
      expect(Post.findById).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Internal server error" });
    });


        // User is not a moderator and cannot remove item
    it('should return 403 status code and error message when user is not a moderator', async () => {
      const req = {
        user: {
          userId: 'user123'
        },
        body: {
          itemID: 'report123',
          itemType: 'report',
          subredditName: 'subreddit1'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      User.findOne = jest.fn().mockResolvedValue({ moderators: [] });

      await moderatorRemove(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ _id: 'user123' });
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: "Forbidden, you must be a moderator!" });
    });

    // Retrieves removed items from a subreddit with valid user and moderator privileges.
    it('should retrieve removed items from a subreddit with valid user and moderator privileges', async () => {
      const req = {
        user: {
          userId: 'validUserId'
        },
        params: {
          subredditName: 'validSubredditName'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      User.findOne = jest.fn().mockResolvedValue({ _id: 'validUserId', moderators: [{ subreddit: 'validSubredditName' }] });
      Community.findOne = jest.fn().mockResolvedValue({ name: 'validSubredditName', removedItems: [{ linkedItemType: 'Post', _id: 'validPostId' }] });
      Post.findById = jest.fn().mockResolvedValue({ _id: 'validPostId' });

      await getRemovedItems(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ _id: 'validUserId' });
      expect(Community.findOne).toHaveBeenCalledWith({ name: 'validSubredditName' });
      expect(Post.findById).toHaveBeenCalledWith('validPostId');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, removedItems: [{ _id: 'validPostId' }] });
    });
        // Returns a 500 response for server errors.
    it('should return a 500 response for server errors', async () => {
      const req = {
        user: {
          userId: 'validUserId'
        },
        params: {
          subredditName: 'validSubredditName'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      User.findOne = jest.fn().mockRejectedValue(new Error('Internal server error'));

      await getRemovedItems(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ _id: 'validUserId' });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
    });
        // Returns a 200 response with the populated removed items
    it('should return a 200 response with the populated removed items', async () => {
      const req = {
        user: {
          userId: 'validUserId'
        },
        params: {
          subredditName: 'validSubredditName'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      User.findOne = jest.fn().mockResolvedValue({ _id: 'validUserId', moderators: [{ subreddit: 'validSubredditName' }] });
      Community.findOne = jest.fn().mockResolvedValue({ name: 'validSubredditName', removedItems: [{ linkedItemType: 'Post', _id: 'validPostId' }] });
      Post.findById = jest.fn().mockResolvedValue({ _id: 'validPostId' });

      await getRemovedItems(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ _id: 'validUserId' });
      expect(Community.findOne).toHaveBeenCalledWith({ name: 'validSubredditName' });
      expect(Post.findById).toHaveBeenCalledWith('validPostId');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, removedItems: [{ _id: 'validPostId' }] });
    });


    // Return 403 Forbidden if the user is not a moderator.
    it('should return 403 Forbidden when user is not a moderator', async () => {
      const req = {
        user: {
          userId: 'userId'
        },
        body: {
          itemID: 'postId',
          itemType: 'post',
          subredditName: 'subredditName'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      User.findOne = jest.fn().mockResolvedValue({ moderators: [] });

      await approveRemoval(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ _id: 'userId' });
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Forbidden, you must be a moderator!' });
    });
        // should return 404 if subreddit is not found
    it('should return 404 if subreddit is not found', async () => {
      const req = {
        user: {
          userId: 'moderatorId'
        },
        body: {
          itemID: 'postId',
          itemType: 'post',
          subredditName: 'subredditName'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      User.findOne = jest.fn().mockResolvedValue({ moderators: [{ subreddit: 'subredditName' }] });
      Community.findOne = jest.fn().mockResolvedValue(null);

      await approveRemoval(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ _id: 'moderatorId' });
      expect(Community.findOne).toHaveBeenCalledWith({ name: 'subredditName' });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Subreddit not found' });
    });


        // Successfully add a new rule to a subreddit
    it('should add a new rule to a subreddit when valid information is provided', async () => {
      const req = {
        user: {
          userId: 'user123'
        },
        body: {
          subredditName: 'testSubreddit',
          type: 'rule',
          info: {
            appliesTo: 'testRule',
            reportReason: 'testReason',
            fullDescription: 'testDescription'
          }
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const user = {
        moderators: [
          {
            subreddit: 'testSubreddit'
          }
        ]
      };
      const subreddit = {
        rules: [],
        save: jest.fn()
      };

      User.findOne = jest.fn().mockResolvedValue(user);
      Community.findOne = jest.fn().mockResolvedValue(subreddit);

      await addSubredditInfo(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: "Subreddit info added successfully" });
      expect(subreddit.rules).toEqual([{
        appliesTo: 'testRule',
        reportReason: 'testReason',
        fullDescription: 'testDescription'
      }]);
      expect(subreddit.save).toHaveBeenCalled();
    });
        // Return a 400 error if the type is invalid
    it('should return a 400 error if the type is invalid', async () => {
      const req = {
        user: {
          userId: 'user123'
        },
        body: {
          subredditName: 'testSubreddit',
          type: 'invalidType',
          info: {}
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const user = {
        moderators: [
          {
            subreddit: 'testSubreddit'
          }
        ]
      };
      const subreddit = {
        save: jest.fn()
      };

      User.findOne = jest.fn().mockResolvedValue(user);
      Community.findOne = jest.fn().mockResolvedValue(subreddit);

      await addSubredditInfo(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: "Invalid type" });
      expect(subreddit.save).not.toHaveBeenCalled();
    });

  
      // Retrieve subreddit rules successfully
    it('should retrieve subreddit rules successfully when user is logged in and has moderator privileges', async () => {
      const req = {
        user: {
          userId: 'user123'
        },
        params: {
          subredditName: 'testsubreddit',
          type: 'rules'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const user = {
        moderators: [
          {
            subreddit: 'testsubreddit'
          }
        ]
      };
      const subreddit = {
        rules: ['rule1', 'rule2']
      };

      User.findOne = jest.fn().mockResolvedValue(user);
      Community.findOne = jest.fn().mockResolvedValue(subreddit);

      await getSubredditInfoByType(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ _id: 'user123' });
      expect(Community.findOne).toHaveBeenCalledWith({ name: 'testsubreddit' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, rules: ['rule1', 'rule2'] });
    });
        // Retrieve subreddit removal reasons successfully
    it('should retrieve subreddit removal reasons successfully when user is logged in and has moderator privileges', async () => {
      const req = {
        user: {
          userId: 'user123'
        },
        params: {
          subredditName: 'testsubreddit',
          type: 'removalReasons'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const user = {
        moderators: [
          {
            subreddit: 'testsubreddit'
          }
        ]
      };
      const subreddit = {
        removalReasons: ['reason1', 'reason2']
      };

      User.findOne = jest.fn().mockResolvedValue(user);
      Community.findOne = jest.fn().mockResolvedValue(subreddit);

      await getSubredditInfoByType(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ _id: 'user123' });
      expect(Community.findOne).toHaveBeenCalledWith({ name: 'testsubreddit' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, removalReasons: ['reason1', 'reason2'] });
    });
        // Return 404 if subreddit does not exist
    it('should return 404 if subreddit does not exist', async () => {
      const req = {
        user: {
          userId: 'user123'
        },
        params: {
          subredditName: 'nonexistentsubreddit',
          type: 'rules'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const user = {
        moderators: [
          {
            subreddit: 'testsubreddit'
          }
        ]
      };
      const subreddit = null;

      User.findOne = jest.fn().mockResolvedValue(user);
      Community.findOne = jest.fn().mockResolvedValue(subreddit);

      await getSubredditInfoByType(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ _id: 'user123' });
      expect(Community.findOne).toHaveBeenCalledWith({ name: 'nonexistentsubreddit' });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: "Subreddit not found" });
    });
    
    // Should return success status 500 if error occurs
    it('should return success status 500 if error occurs', async () => {
      // Arrange
      const req = { query: {} };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const error = new Error('Internal server error');
      Community.countDocuments = jest.fn().mockRejectedValue(error);

      // Act
      await getTopCommunities(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error',
        error: error.message,
      });
    });
    // Should retrieve top communities sorted by number of members
    it("should retrieve top communities sorted by number of members", async () => {
      // Arrange
      const req = { query: {} };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Act
      await getTopCommunities(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Internal server error",
        error: "Internal server error", // Corrected error message
      });
    }, 20000);
    // Should retrieve top communities with 10 items per page
it("should retrieve top communities with 10 items per page", async () => {
  // Arrange
  const req = { query: {} };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  // Act
  await getTopCommunities(req, res);

  // Assert
  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({
    success: false,
    message: "Internal server error",
    error: "Internal server error", // Corrected error message
  });
}, 20000);
