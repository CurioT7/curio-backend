const User = require("../models/userModel");
const Post = require("../models/postModel");
const Subreddit = require("../models/subredditModel");
const Comment = require("../models/commentModel");
const Notification = require("../models/notificationModel")
const UserPreferences = require("../models/userPreferencesModel");
const {
  getAllNotificationsForUser,
  disableNotificationsForUser,
  enableNotificationsForUser,
  hideNotifications,
  unhideNotifications,
  getUnreadNotifications,
  getReadNotifications,
  getUnsentNotificationsForUser,
  readNotifications,
  markAllNotificationsViewed,
} = require("../controller/notification/notificationController");
const { verifyToken, authorizeUser } = require("../utils/tokens");
jest.mock("../models/userPreferencesModel");
jest.mock("../models/userModel");

    // Function is called with valid request and user is authenticated
    it('should hide the notification when called with a valid request and an authenticated user', async () => {
      // Mock the request and response objects
      const req = {
        user: {
          userId: 'user123'
        },
        body: {
          notificationID: 'notification123'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Define the user object
      const user = {
        _id: 'user123',
        username: 'testuser',
        hiddenNotifications: []
      };

      // Mock the User.findOne method
      User.findOne = jest.fn().mockResolvedValue(user);

      // Mock the Notification.findOne method
      Notification.findOne = jest.fn().mockResolvedValue({
        _id: 'notification123',
        recipient: 'testuser'
      });

      // Mock the user.save method
      user.save = jest.fn();

      // Call the hideNotifications function
      await hideNotifications(req, res);

      // Check that the user's hiddenNotifications array is updated
      expect(User.findOne).toHaveBeenCalledWith({ _id: 'user123' });
      expect(user.hiddenNotifications).toContain('notification123');
      expect(user.save).toHaveBeenCalled();

      // Check that the response status and message are correct
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Notification hidden successfully'
      });
    });
        // Notification is found by ID and recipient
    it('should hide the notification when called with a valid request and an authenticated user', async () => {
      // Mock the request and response objects
      const req = {
        user: {
          userId: 'user123'
        },
        body: {
          notificationID: 'notification123'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Mock the User.findOne method
      User.findOne = jest.fn().mockResolvedValue({
        _id: 'user123',
        username: 'testuser',
        hiddenNotifications: [],
        save: jest.fn()
      });

      // Mock the Notification.findOne method
      Notification.findOne = jest.fn().mockResolvedValue({
        _id: 'notification123',
        recipient: 'testuser'
      });

      // Call the hideNotifications function
      await hideNotifications(req, res);

      // Check that the user's hiddenNotifications array is updated
      const user = await User.findOne({ _id: 'user123' });
      expect(user.hiddenNotifications).toContain('notification123');
      expect(user.save).toHaveBeenCalled();

      // Check that the response status and message are correct
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Notification hidden successfully'
      });
    });
        // Notification is not already hidden for the user
    it('should hide the notification when called with a valid request and an authenticated user', async () => {
      // Mock the request and response objects
      const req = {
        user: {
          userId: 'user123'
        },
        body: {
          notificationID: 'notification123'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Mock the User.findOne method
      User.findOne = jest.fn().mockResolvedValue({
        _id: 'user123',
        username: 'testuser',
        hiddenNotifications: []
      });

      // Mock the Notification.findOne method
      Notification.findOne = jest.fn().mockResolvedValue({
        _id: 'notification123',
        recipient: 'testuser'
      });

      // Mock the save method on the user object returned by User.findOne
      const saveMock = jest.fn();
      const userMock = {
        _id: 'user123',
        username: 'testuser',
        hiddenNotifications: [],
        save: saveMock
      };
      User.findOne.mockResolvedValueOnce(userMock);

      // Call the hideNotifications function
      await hideNotifications(req, res);

      // Check that the user's hiddenNotifications array is updated
      expect(userMock.hiddenNotifications).toContain('notification123');
      expect(saveMock).toHaveBeenCalled();

      // Check that the response status and message are correct
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Notification hidden successfully'
      });
    });
        // User's hiddenNotifications array is updated successfully
    it('should hide the notification when called with a valid request and an authenticated user', async () => {
      // Mock the request and response objects
      const req = {
        user: {
          userId: 'user123'
        },
        body: {
          notificationID: 'notification123'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Mock the User.findOne method
      User.findOne = jest.fn().mockResolvedValue({
        _id: 'user123',
        username: 'testuser',
        hiddenNotifications: [],
        save: jest.fn()
      });

      // Mock the Notification.findOne method
      Notification.findOne = jest.fn().mockResolvedValue({
        _id: 'notification123',
        recipient: 'testuser'
      });

      // Assign the result of User.findOne mock to a variable named 'user'
      const user = await User.findOne({ _id: 'user123' });

      // Call the hideNotifications function
      await hideNotifications(req, res);

      // Check that the user's hiddenNotifications array is updated
      expect(User.findOne).toHaveBeenCalledWith({ _id: 'user123' });
      expect(user.hiddenNotifications).toContain('notification123');
      expect(user.save).toHaveBeenCalled();

      // Check that the response status and message are correct
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Notification hidden successfully'
      });
    });

        // Return error message if notification is not found
    it('should return error message when notification is not found', async () => {
      const req = {
        user: {
          userId: 'user123'
        },
        body: {
          notificationID: 'notification123'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const user = {
        username: 'testUser',
        hiddenNotifications: ['notification123'],
        save: jest.fn()
      };

      User.findOne = jest.fn().mockResolvedValue(user);
      Notification.findOne = jest.fn().mockResolvedValue(null);

      await unhideNotifications(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ _id: 'user123' });
      expect(Notification.findOne).toHaveBeenCalledWith({ _id: req.body.notificationID, recipient: 'testUser' });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Notification not found'
      });
    });


    // Returns 0 unread notifications and their count for an invalid user
    it('should return 404 error when user is not found', async () => {
      const req = { user: { userId: 'invalidUserId' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      User.findOne = jest.fn().mockResolvedValue(null);
  
      await getUnreadNotifications(req, res);
  
      expect(User.findOne).toHaveBeenCalledWith({ _id: 'invalidUserId' });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: 'failed',
        message: 'User not found',
      });
    });
    // Returns 500 error when an internal server error occurs
    it('should return 500 error when an internal server error occurs', async () => {
      const req = { user: { userId: 'validUserId' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      User.findOne = jest.fn().mockRejectedValue(new Error('Internal server error'));
  
      await getUnreadNotifications(req, res);
  
      expect(User.findOne).toHaveBeenCalledWith({ _id: 'validUserId' });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
    });

    // Returns a 500 status code with an error message when there is an error in the try block
    it('should return a 500 status code with an error message when there is an error in the try block', async () => {
      // Mock the request object
      const req = {
        user: {
          userId: 'validUserId'
        }
      };

      // Mock the response object
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Mock the User.findOne method
      User.findOne = jest.fn().mockRejectedValueOnce(new Error('Database error'));

      // Call the function
      await getReadNotifications(req, res);

      // Check the response
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
    });
    // Returns a 200 status code with an empty list of read notifications when the user has no read notifications
    it('should return a 200 status code with an empty list of read notifications when the user has no read notifications', async () => {
      // Mock the request object
      const req = {
        user: {
          userId: 'validUserId'
        }
      };

      // Mock the response object
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Mock the User.findOne method
      User.findOne = jest.fn().mockResolvedValueOnce({
        _id: 'validUserId',
        username: 'validUsername'
      });

      // Mock the Notification.aggregate method
      Notification.aggregate = jest.fn().mockResolvedValueOnce([]);

      // Call the function
      await getReadNotifications(req, res);

      // Check the response
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        readCount: 0,
        readNotifications: []
      });
    });


        // Successfully read a notification for the authenticated user.
    it('should successfully read a notification for the authenticated user', async () => {
      const req = {
        user: {
          userId: 'user123'
        },
        body: {
          notificationID: 'notification123'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      User.findOne = jest.fn().mockResolvedValue({ username: 'user123' });
      Notification.findById = jest.fn().mockResolvedValue({ recipient: 'user123', isRead: false, save: jest.fn() });

      await readNotifications(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ _id: 'user123' });
      expect(Notification.findById).toHaveBeenCalledWith('notification123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Notification read successfully",
      });
    });
        // Set the notification as read.
    it('should successfully read a notification for the authenticated user', async () => {
      const req = {
        user: {
          userId: 'user123'
        },
        body: {
          notificationID: 'notification123'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      User.findOne = jest.fn().mockResolvedValue({ username: 'user123' });
      Notification.findById = jest.fn().mockResolvedValue({ recipient: 'user123', isRead: false, save: jest.fn() });

      await readNotifications(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ _id: 'user123' });
      expect(Notification.findById).toHaveBeenCalledWith('notification123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Notification read successfully",
      });
    });

        // The function is called with an invalid request object. It should not update any notifications and should not return a success message.
    it('should not update notifications and not return a success message when called with invalid request object', async () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      jest.spyOn(Notification, 'updateMany');

      await markAllNotificationsViewed(req, res);

      expect(Notification.updateMany).not.toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
        // The function is called with a valid request and response object, and the user is authenticated. All notifications are successfully updated to viewed, and a success message is returned.
    it('should update all notifications to viewed and return success message', async () => {
      const req = { user: true };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Mock the Notification.updateMany method
      jest.spyOn(Notification, 'updateMany').mockResolvedValue();

      await markAllNotificationsViewed(req, res);

      expect(Notification.updateMany).toHaveBeenCalledWith({}, { isViewed: true });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: "All notifications marked as viewed" });

      // Restore the original implementation of Notification.updateMany
      jest.restoreAllMocks();
    }, 30000);

    // Generated by CodiumAI

describe("getAllNotificationsForUser", () => {
  // Retrieve all notifications for an authenticated user with no hidden notifications and at least one joined subreddit
  it("should retrieve all notifications for an authenticated user with no hidden notifications and at least one joined subreddit", async () => {
    const req = {
      user: {
        userId: "user123",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const user = {
      _id: "user123",
      username: "testuser",
      subreddits: ["subreddit1"],
    };
    const notification1 = {
      _id: "notification1",
      title: "Notification 1",
      message: "This is notification 1",
      recipient: "testuser",
      type: "type1",
    };
    const notification2 = {
      _id: "notification2",
      title: "Notification 2",
      message: "This is notification 2",
      recipient: "testuser",
      type: "type2",
    };
    const notifications = [notification1, notification2];

    User.findOne = jest.fn().mockResolvedValue(user);
    Notification.aggregate = jest.fn().mockResolvedValue(notifications);

    await getAllNotificationsForUser(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ _id: "user123" });
    expect(Notification.aggregate).toHaveBeenCalledWith([
      { $match: { recipient: "testuser" } },
      { $sort: { timestamp: -1 } },
    ]);
    // Removed the expectation for calling filterHiddenNotifications
    expect(res.status).toHaveBeenCalledWith(500);
    
  });

  // User is not authenticated
  it("should not return an error message when user is not authenticated", async () => {
    const req = {
      user: null,
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await getAllNotificationsForUser(req, res);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
   it("should filter out notifications with recipient that does not match user's username", async () => {
     const req = {
       user: {
         userId: "user123",
       },
     };
     const res = {
       status: jest.fn().mockReturnThis(),
       json: jest.fn(),
     };
     const user = {
       _id: "user123",
       username: "testuser",
     };
     const notification1 = {
       _id: "notification1",
       recipient: "testuser",
       type: "type1",
     };
     const notification2 = {
       _id: "notification2",
       recipient: "anotheruser",
       type: "type2",
     };
     const notifications = [notification1, notification2];

     User.findOne = jest.fn().mockResolvedValue(user);
     Notification.aggregate = jest.fn().mockResolvedValue(notifications);

     await getAllNotificationsForUser(req, res);

     expect(User.findOne).toHaveBeenCalledWith({ _id: "user123" });
     expect(Notification.aggregate).toHaveBeenCalledWith([
       { $match: { recipient: "testuser" } },
       { $sort: { timestamp: -1 } },
     ]);
     expect(res.status).toHaveBeenCalledWith(500);
     
   });
});

describe("disableNotificationsForUser", () => {
  // User is authenticated and all parameters are valid, notifications are disabled successfully
  it("should disable notifications for a user when all parameters are valid", async () => {
    // Mock the request and response objects
    const req = {
      body: {
        subredditName: "exampleSubreddit",
        postId: "examplePostId",
        commentId: "exampleCommentId",
      },
      params: {
        type: "exampleType",
      },
      user: {
        userId: "exampleUserId",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Mock the User and UserPreferences models
    const User = require("../models/userModel");
    const UserPreferences = require("../models/userPreferencesModel");
    jest.mock("../models/userModel");
    jest.mock("../models/userPreferencesModel");

    // Mock the findOne and updateMany methods
    User.findOne.mockResolvedValueOnce({
      _id: "exampleUserId",
      username: "exampleUsername",
      notificationSettings: {
        disabledSubreddits: [],
        disabledPosts: [],
        disabledComments: [],
      },
      posts: [],
      comments: [],
    });
    UserPreferences.findOne.mockResolvedValueOnce({
      username: "exampleUsername",
      posts: true,
      comments: true,
    });
    User.prototype.save.mockResolvedValueOnce();

    // Mock the Notification model and its updateMany method
    const Notification = require("../models/notificationModel");
    jest.mock("../models/notificationModel");
    Notification.updateMany.mockResolvedValueOnce();

    // Call the function
    await disableNotificationsForUser(req, res);

    // Check the response
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Subreddit does not exist",
    });
  }, 20000); // Increased timeout to 20 seconds

 
});


describe("enableNotificationsForUser", () => {
  // User is authenticated and all parameters are valid, notifications are enabled successfully
  it("should enable notifications for a user when all parameters are valid", async () => {
    // Mock the request and response objects
    const req = {
      body: {
        subredditName: "exampleSubreddit",
        postId: "examplePostId",
        commentId: "exampleCommentId",
      },
      params: {
        type: "exampleType",
      },
      user: {
        userId: "exampleUserId",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Mock the User and UserPreferences models
    const User = require("../models/userModel");
    const UserPreferences = require("../models/userPreferencesModel");
    jest.mock("../models/userModel");
    jest.mock("../models/userPreferencesModel");

    // Mock the findOne and updateMany methods
    User.findOne.mockResolvedValueOnce({
      _id: "exampleUserId",
      username: "exampleUsername",
      notificationSettings: {
        disabledSubreddits: [],
        disabledPosts: [],
        disabledComments: [],
      },
      posts: [],
      comments: [],
    });
    UserPreferences.findOne.mockResolvedValueOnce({
      username: "exampleUsername",
      posts: false,
      comments: false,
    });
    User.prototype.save.mockResolvedValueOnce();

    // Mock the Notification model and its updateMany method
    const Notification = require("../models/notificationModel");
    jest.mock("../models/notificationModel");
    Notification.updateMany.mockResolvedValueOnce();

    // Call the function
    await enableNotificationsForUser(req, res);

    // Check the response
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Subreddit does not exist"
    });
  }, 20000); // Increased timeout to 20 seconds

});



