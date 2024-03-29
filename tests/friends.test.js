// followSubreddits fucntion

    // should return an error message if the user is not found
    it('should return an error message if the user is not found', async () => {
      const req = {
        body: {
          subreddit: 'testSubreddit'
        },
        headers: {
          authorization: 'Bearer token'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const verifyToken = jest.fn().mockResolvedValue({ userId: 'testUserId' });
      User.findOne = jest.fn().mockResolvedValue(null);

      await followSubreddit(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Username not found'
      });
    });


// unFollowSubreddits fucntion 
    // Handle case where username is not found in database
    it('should return an error message when username is not found in database', async () => {
      // Arrange
      const username = 'testUser';
      const communityName = 'testSubreddit';
      const userExists = null;
  
      User.findOneAndUpdate = jest.fn();
      Community.findOneAndUpdate = jest.fn();
  
      // Act
      const result = await unFollowSubreddits(username, communityName);
  
      // Assert
      expect(result).toEqual({
        status: false,
        error: "Failed to unfollow subreddit",
      });
    });

// addFriend fucntion

    // Successfully add a friend to a user's followings and the user to the friend's followers
    it('should add a friend to a user\'s followings and the user to the friend\'s followers', async () => {
      const user = { username: 'user1' };
      const friend = 'friend1';

      User.findOneAndUpdate = jest.fn();

      await addFriend(user.username, friend);

      expect(User.findOneAndUpdate).toHaveBeenCalledWith(
        { username: user.username },
        {
          $addToSet: {
            followings: friend,
          },
        }
      );
      expect(User.findOneAndUpdate).toHaveBeenCalledWith(
        { username: friend },
        {
          $addToSet: {
            followers: user.username,
          },
        }
      );
    });

// deleteFriend function
    
    // Verify that the friend is deleted from the user's followings list
    it('should delete friend from user\'s followings list', async () => {
      // Arrange
      const username = 'user1';
      const friend = 'friend1';
      const user = {
        username: username,
        followings: [friend],
      };
      const friendUser = {
        username: friend,
        followers: [username],
      };
      const findOneAndUpdateMock = jest.fn();
      User.findOneAndUpdate = findOneAndUpdateMock.mockResolvedValueOnce(user).mockResolvedValueOnce(friendUser);

      // Act
      await deleteFriend(username, friend);

      // Assert
      expect(findOneAndUpdateMock).toHaveBeenCalledTimes(2);
      expect(findOneAndUpdateMock).toHaveBeenCalledWith(
        { username: username },
        {
          $pull: {
            followings: friend,
          },
        }
      );
      expect(findOneAndUpdateMock).toHaveBeenCalledWith(
        { username: friend },
        {
          $pull: {
            followers: username,
          },
        }
      );
    });

// addUserToSubbreddit
        // Function successfully adds user to subreddit
    it('should add user to subreddit when function is called', async () => {
      const user = {
        username: "testUser",
        moderators: [],
        member: []
      };
      const communityName = "testCommunity";
      const userModerator = {
        communityName: communityName,
        role: "creator",
      };
      const userMember = {
        communityName: communityName,
      };
      const moderator = user.moderators;
      moderator.push(userModerator);
      const members = user.member;
      members.push(userMember);
  
      const findOneAndUpdateMock = jest.fn();
      const userMock = {
        findOneAndUpdate: findOneAndUpdateMock
      };
  
      await addUserToSubbreddit(userMock, communityName);
  
      expect(findOneAndUpdateMock).toHaveBeenCalledWith(
        { username: user.username },
        { moderators: moderator, member: members }
      );
    });

// friendRequest fucntion 

        // Verify token and return 401 if invalid
    it('should return 401 if token is invalid', async () => {
      const req = {
        headers: {
          authorization: 'Bearer invalidToken'
        },
        body: {
          friendUsername: 'friend'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      await friendRequest(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
    });

//unFriendRequest fucntion 

        // Verify that the token is present in the request header and extract it
    it('should return a 401 status code if the token is missing or invalid', async () => {
      const req = {
        headers: {
          authorization: "Bearer invalidToken"
        },
        body: {
          friendUsername: "friend"
        }
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await unFriendRequest(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
    });

//getUserInfo
        // Verify that the function returns a 200 status code and the user's information when a valid token is provided in the authorization header.
    it('should return user information with 200 status code when valid token is provided', async () => {
      const req = {
        headers: {
          authorization: 'Bearer validToken'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const user = {
        username: 'testUser',
        bio: 'testBio',
        profilePicture: 'testProfilePicture'
      };
      User.findOne = jest.fn().mockResolvedValue(user);
      verifyToken = jest.fn().mockResolvedValue({ userId: 'testUserId' });

      await getUserInfo(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        username: user.username,
        bio: user.bio,
        profilePicture: user.profilePicture
      });
    });

//unFollowSubreddit
    
    // Verify if the user is authenticated by checking the token and decoding it.
    it('should return status code 401 and error message when user is not authenticated', async () => {
      const req = {
        headers: {
          authorization: 'Bearer invalidToken'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await unFollowSubreddit(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
    });

//followSubreddit fucntion
    
    // Follows a subreddit successfully when given valid username and communityName
    it('should follow a subreddit successfully when given valid username and communityName', async () => {
      const req = {
        body: {
          subreddit: "testSubreddit"
        },
        headers: {
          authorization: "Bearer token"
        }
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const verifyToken = jest.fn().mockResolvedValue({ userId: "testUserId" });

      const User = {
        findOne: jest.fn().mockResolvedValue({ username: "testUsername" })
      };

      const Community = {
        findOne: jest.fn().mockResolvedValue({ name: "testSubreddit" })
      };

      const followSubreddits = jest.fn();

      await followSubreddit(req, res);

      expect(verifyToken).toHaveBeenCalledWith("token");
      expect(User.findOne).toHaveBeenCalledWith({ _id: "testUserId" });
      expect(Community.findOne).toHaveBeenCalledWith({ name: "testSubreddit" });
      expect(followSubreddits).toHaveBeenCalledWith("testUsername", "testSubreddit");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Subreddit followed successfully"
      });
    });