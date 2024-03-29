require("dotenv").config(); // Ensure this is at the top if you're using dotenv for environment variables
const mongoose = require("mongoose");
const faker = require("faker");

const Comment = require("../models/commentModel"); // Adjust the path as necessary
const Post = require("../models/postModel");
const User = require("../models/userModel");
const Subreddit = require("../models/subredditModel");
const UserReports = require("../models/reportModel");
const Block = require("../models/block");
const UserPreferences = require("../models/userPreferences");

async function seedUsers(n = 10) {
  const users = [];
  for (let i = 0; i < n; i++) {
    const cakeDay = faker.date.past(); // Generate a random past date
    const formattedCakeDay = cakeDay.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
    const user = new User({
      username: faker.internet.userName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      googleId: faker.datatype.uuid(),
      isVerified: faker.datatype.boolean(),
      gender: faker.random.arrayElement(["male", "female", "other"]),
      language: faker.random.locale(),
      cakeDay: formattedCakeDay,
      goldAmount: faker.datatype.number(),
      banner: faker.internet.url(),
      profilePicture: faker.internet.avatar(),
      bio: faker.lorem.sentences(),
      socialLinks: [
        {
          platform: faker.random.word(),
          url: faker.internet.url(),
        },
      ],
      displayName: faker.name.findName(),
      isOver18: faker.datatype.boolean(),
      comments: [new mongoose.Types.ObjectId()],
      posts: [new mongoose.Types.ObjectId()],
      upvotes: [
        {
          itemId: new mongoose.Types.ObjectId(),
          itemType: faker.random.arrayElement(["Post", "Comment"]),
        },
      ],
      downvotes: [
        {
          itemId: new mongoose.Types.ObjectId(),
          itemType: faker.random.arrayElement(["Post", "Comment"]),
        },
      ],
      followers: [faker.internet.userName()],
      followings: [faker.internet.userName()],
      subreddits: [
        {
          subreddit: new mongoose.Types.ObjectId(),
          role: faker.random.arrayElement(["moderator", "creator", "member"]),
        },
      ],
      member: [
        {
          subreddit: new mongoose.Types.ObjectId(),
        },
      ],
      moderators: [
        {
          subreddit: new mongoose.Types.ObjectId(),
          role: faker.random.arrayElement(["creator", "moderator"]),
        },
      ],
    });
    await user.save();
    users.push(user);
  }
  return users;
}

async function seedBlock(n = 5, users) {
  const blocks = [];
  const userCount = users.length;

  // Generate unique pairs of user IDs for blockerId and blockedId
  const uniquePairs = new Set();

  while (uniquePairs.size < n) {
    const blockerIndex = faker.datatype.number({ min: 0, max: userCount - 1 });
    const blockedIndex = faker.datatype.number({ min: 0, max: userCount - 1 });

    // Ensure blockerId and blockedId are different
    if (blockerIndex !== blockedIndex) {
      uniquePairs.add(`${blockerIndex}-${blockedIndex}`);
    }
  }

  // Create blocks using unique pairs
  for (const pair of uniquePairs) {
    const [blockerIndex, blockedIndex] = pair.split("-");
    const block = new Block({
      blockerId: users[blockerIndex]._id,
      blockedId: users[blockedIndex]._id,
      unblockTimestamp: faker.date.past(),
    });
    await block.save();
    blocks.push(block);
  }

  return blocks;
}

async function seedPreferences(n = 5, users) {
  const preferences = [];
  for (let i = 0; i < n; i++) {
    const userIndex = faker.datatype.number({
      min: 0,
      max: users.length - 1,
    });
    const preference = new UserPreferences({
      username: users[userIndex].username,
      gender: faker.random.arrayElement([
        "woman",
        "man",
        "i prefer not to say",
      ]),
      language: faker.random.arrayElement([
        "Deutsch",
        "English(us)",
        "Espanol(es)",
        "Espanol(mx)",
        "Francias",
        "Italiano",
        "portugues(br)",
        "portugues(pt)",
      ]),
      locationCustomization: faker.address.city(),
      displayName: faker.name.findName(),
      about: faker.lorem.sentence(),
      socialLinks: faker.internet.url(),
      images: {
        pfp: faker.image.avatar(),
        banner: faker.image.imageUrl(),
      },
      NSFW: faker.datatype.boolean(),
      allowFollow: faker.datatype.boolean(),
      contentVisibility: faker.datatype.boolean(),
      activeInCommunityVisibility: faker.datatype.boolean(),
      clearHistory: faker.datatype.boolean(),
      block: [{ username: faker.internet.userName() }],
      viewBlockedPeople: [{ username: faker.internet.userName() }],
      viewMutedCommunities: [
        { communityName: faker.lorem.words(2).substring(0, 20) },
      ],
      adultContent: faker.datatype.boolean(),
      autoplayMedia: faker.datatype.boolean(),
      communityThemes: faker.datatype.boolean(),
      communityContentSort: faker.random.arrayElement([
        "hot",
        "new",
        "top",
        "rising",
      ]),
      globalContentView: faker.random.arrayElement(["card", "classic"]),
      rememberPerCommunity: {
        rememberContentSort: faker.datatype.boolean(),
        rememberContentView: faker.datatype.boolean(),
      },
      openPostsInNewTab: faker.datatype.boolean(),
      mentions: faker.datatype.boolean(),
      comments: faker.datatype.boolean(),
      upvotesPosts: faker.datatype.boolean(),
      upvotesComments: faker.datatype.boolean(),
      replies: faker.datatype.boolean(),
      newFollowers: faker.datatype.boolean(),
      postsYouFollow: faker.datatype.boolean(),
      newFollowerEmail: faker.datatype.boolean(),
      chatRequestEmail: faker.datatype.boolean(),
      unsubscribeFromAllEmails: faker.datatype.boolean(),
    });
    await preference.save();
    preferences.push(preference);
  }
  return preferences;
}

async function seedReports(n = 5, users) {
  const reports = [];
  const userCount = users.length;

  // Generate unique pairs of user indices for reporterUsername and reportedUsername
  const uniquePairs = new Set();

  while (uniquePairs.size < n) {
    const reporterIndex = faker.datatype.number({ min: 0, max: userCount - 1 });
    const reportedIndex = faker.datatype.number({ min: 0, max: userCount - 1 });

    // Ensure reporterUsername and reportedUsername are different
    if (reporterIndex !== reportedIndex) {
      uniquePairs.add(`${reporterIndex}-${reportedIndex}`);
    }
  }

  // Create reports using unique pairs
  for (const pair of uniquePairs) {
    const [reporterIndex, reportedIndex] = pair.split("-");
    const report = new UserReports({
      reporterUsername: users[reporterIndex].username,
      reportedUsername: users[reportedIndex].username,
      reportType: faker.random.arrayElement([
        "username",
        "profile image",
        "banner image",
        "bio",
      ]),
      reportReason: faker.random.arrayElement([
        "harassment",
        "threatening violence",
        "hate",
        "minor abuse or sexualization",
        "sharing personal information",
        "non-consensual intimate media",
        "prohibited transaction",
        "impersonation",
        "copyright violation",
        "trademark violation",
        "self-harm or suicide",
        "spam",
      ]),
    });
    await report.save();
    reports.push(report);
  }

  return reports;
}

async function seedSubreddits(n = 5, users) {
  const subreddits = [];
  for (let i = 0; i < n; i++) {
    const subreddit = new Subreddit({
      name: faker.lorem.words(2).substring(0, 20),
      description: faker.lorem.sentence(),
      createdAt: faker.date.past(),
      creator:
        users[faker.datatype.number({ min: 0, max: users.length - 1 })]._id,
      members:
        users[faker.datatype.number({ min: 0, max: users.length - 1 })]._id,
      posts: [new mongoose.Types.ObjectId()],
      banner: faker.internet.url(),
      icon: faker.internet.url(),
      isOver18: faker.datatype.boolean(),
      privacyMode: faker.random.arrayElement([
        "private",
        "public",
        "restricted",
      ]),
      isNSFW: faker.datatype.boolean(),
      isSpoiler: faker.datatype.boolean(),
      isOC: faker.datatype.boolean(),
      isCrosspost: faker.datatype.boolean(),
      rules: [faker.lorem.sentence()],
      category: faker.random.word(),
      language: faker.random.locale(),
      allowImages: faker.datatype.boolean(),
      allowVideos: faker.datatype.boolean(),
      allowText: faker.datatype.boolean(),
      allowLink: faker.datatype.boolean(),
      allowPoll: faker.datatype.boolean(),
      allowEmoji: faker.datatype.boolean(),
      allowGif: faker.datatype.boolean(),
      role: faker.random.arrayElement(["moderator", "creator", "member"]),
      members: [
        {
          username: faker.internet.userName(),
        },
      ],
      moderators: [
        {
          username: faker.internet.userName(),
          role: faker.random.arrayElement(["creator", "moderator"]),
        },
      ],
    });
    await subreddit.save();
    subreddits.push(subreddit);
  }
  return subreddits;
}

async function seedPosts(n = 20, users, subreddits) {
  const posts = [];
  for (let i = 0; i < n; i++) {
    const userIndex = faker.datatype.number({
      min: 0,
      max: users.length - 1,
    });
    const subredditIndex = faker.datatype.number({
      min: 0,
      max: subreddits.length - 1,
    });
    const post = new Post({
      title: faker.lorem.sentence(),
      content: faker.lorem.paragraph(),
      authorName: users[userIndex].username,
      linkedSubreddit: subreddits[subredditIndex]._id,
      views: faker.datatype.number(),
      createdAt: faker.date.past(),
      upvotes: faker.datatype.number(),
      downvotes: faker.datatype.number(),
      comments: [],
      shares: faker.datatype.number(),
      isNSFW: faker.datatype.boolean(),
      isSpoiler: faker.datatype.boolean(),
      isOC: faker.datatype.boolean(),
      isCrosspost: faker.datatype.boolean(),
      awards: faker.datatype.number(),
      media: faker.internet.url(),
      link: faker.internet.url(),
      isDraft: faker.datatype.boolean(),
    });
    await post.save();
    posts.push(post);
  }
  return posts;
}

async function seedComments(n = 40, users, posts) {
  const comments = [];
  for (let i = 0; i < n; i++) {
    const userIndex = faker.datatype.number({
      min: 0,
      max: users.length - 1,
    });
    const postIndex = faker.datatype.number({ min: 0, max: posts.length - 1 });
    const comment = new Comment({
      content: faker.lorem.sentence(),
      authorName: users[userIndex].username,
      linkedPost: posts[postIndex]._id,
      createdAt: faker.date.past(),
      upvotes: faker.datatype.number(),
      downvotes: faker.datatype.number(),
      linkedSubreddit: new mongoose.Types.ObjectId(),
      awards: faker.datatype.number(),
    });
    await comment.save();
    comments.push(comment); // Push the comment to the array
  }
  return comments; // Return the array of comments
}

async function clearCollections() {
  await Comment.deleteMany({});
  await Post.deleteMany({});
  await User.deleteMany({});
  await Subreddit.deleteMany({});
  await UserReports.deleteMany({});
  await Block.deleteMany({});
  await UserPreferences.deleteMany({});
  // Add any other collections you need to clear
}

async function updateSubredditsWithPosts(subreddits, posts) {
  // This assumes a many-to-one relationship (many posts can belong to one subreddit)
  for (const post of posts) {
    const subredditIndex = faker.datatype.number({
      min: 0,
      max: subreddits.length - 1,
    });
    const subreddit = subreddits[subredditIndex];
    post.subreddit = subreddit._id;
    await post.save();

    subreddit.posts.push(post._id);
    await subreddit.save();
  }
}

async function updateUserData(users, posts, comments, subreddits) {
  for (const user of users) {
    if (!posts || posts.length === 0 || !comments || comments.length === 0) {
      console.error("Posts or comments are empty or undefined.");
      return;
    }
    // Update user posts
    const userPosts = await Post.find({ authorName: user.username }).select(
      "_id"
    );
    user.posts = userPosts.map((post) => post._id);

    // Update user comments
    const userComments = await Comment.find({
      authorName: user.username,
    }).select("_id");
    user.comments = userComments.map((comment) => comment._id);

    const randomPostIndex = faker.datatype.number({
      min: 0,
      max: posts.length - 1,
    });
    const randomCommentIndex = faker.datatype.number({
      min: 0,
      max: comments.length - 1,
    });

    user.upvotes.push({
      itemId: posts[randomPostIndex]._id,
      itemType: "Post",
    });

    user.downvotes.push({
      itemId: comments[randomCommentIndex]._id,
      itemType: "Comment",
    });

    // Link followers and followings to existing users
    const randomFollowerIndex = faker.datatype.number({
      min: 0,
      max: users.length - 1,
    });
    const randomFollowingIndex = faker.datatype.number({
      min: 0,
      max: users.length - 1,
    });

    user.followers.push(users[randomFollowerIndex]._id);
    user.followings.push(users[randomFollowingIndex]._id);

    // Link subreddits to users
    const randomSubredditIndex = faker.datatype.number({
      min: 0,
      max: subreddits.length - 1,
    });
    user.subreddits.push({
      subreddit: subreddits[randomSubredditIndex]._id,
      role: faker.random.arrayElement(["moderator", "creator", "member"]),
    });

    await user.save();
  }
}

async function updatePostsWithComments(posts, comments) {
  // This assumes a many-to-one relationship (many comments can belong to one post)
  for (const comment of comments) {
    const post = posts.find((p) => p._id.equals(comment.linkedPost));
    if (post) {
      post.comments.push(comment._id);
      await post.save();
    }
  }
}

async function seedData() {
  try {
    await clearCollections(); // Caution: This clears the entire database

    const users = await seedUsers(10);
    const subreddits = await seedSubreddits(20, users);
    const posts = await seedPosts(20, users, subreddits);
    const comments = await seedComments(40, users, posts);
    await updateSubredditsWithPosts(subreddits, posts);
    await updatePostsWithComments(posts, comments);
    await seedPreferences(5, users);
    await seedBlock(5, users);
    await seedReports(5, users);
    await updateUserData(users, posts, comments, subreddits);

    console.log("Data seeded successfully");
  } catch (error) {
    console.error("Error seeding data:", error);
  } finally {
    mongoose.connection.close();
  }
}

seedData();
