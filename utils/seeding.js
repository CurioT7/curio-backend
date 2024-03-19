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

async function seedModel(Model, createData, n = 10) {
  await Model.deleteMany({});
  for (let i = 0; i < n; i++) {
    try {
      await Model.create(createData());
    } catch (error) {
      console.error(`Error seeding ${Model.modelName}:`, error);
      return;
    }
  }
  console.log(`Seeded ${n} documents into ${Model.modelName}.`);
}

async function seedData() {
  console.log("Clearing the database...");

  await Promise.all([
    seedModel(Comment, () => ({
      content: faker.lorem.sentence(),
      authorName: faker.name.findName(),
      authorID: new mongoose.Types.ObjectId(),
      createdAt: faker.date.past(),
      upvotes: faker.datatype.number(),
      downvotes: faker.datatype.number(),
      linkedPost: new mongoose.Types.ObjectId(),
      linkedSubreddit: new mongoose.Types.ObjectId(),
      awards: faker.datatype.number(),
    })),
    seedModel(Post, () => ({
      title: faker.lorem.sentence(),
      content: faker.lorem.paragraph(),
      authorName: faker.name.findName(),
      views: faker.datatype.number(),
      createdAt: faker.date.past(),
      upvotes: faker.datatype.number(),
      downvotes: faker.datatype.number(),
      linkedSubreddit: new mongoose.Types.ObjectId(),
      comments: [new mongoose.Types.ObjectId()],
      shares: faker.datatype.number(),
      isNSFW: faker.datatype.boolean(),
      isSpoiler: faker.datatype.boolean(),
      isOC: faker.datatype.boolean(),
      isCrosspost: faker.datatype.boolean(),
      awards: faker.datatype.number(),
      media: faker.internet.url(),
      link: faker.internet.url(),
      isDraft: faker.datatype.boolean(),
    })),
    seedModel(User, () => ({
      username: faker.internet.userName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      googleId: faker.datatype.uuid(),
      createdAt: faker.date.past(),
      isVerified: faker.datatype.boolean(),
      gender: faker.random.arrayElement(["male", "female", "other"]),
      language: faker.random.locale(),
      cakeDay: faker.date.past(),
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
    })),

    seedModel(Block, () => ({
      blockerId: new mongoose.Types.ObjectId(),
      blockedId: new mongoose.Types.ObjectId(),
      unblockTimestamp: faker.date.past(),
    })),

    seedModel(Subreddit, () => ({
      name: faker.lorem.words(2).substring(0, 20),
      description: faker.lorem.sentence(),
      createdAt: faker.date.past(),
      creator: new mongoose.Types.ObjectId(),
      members: [new mongoose.Types.ObjectId()],
      posts: [new mongoose.Types.ObjectId()],
      banner: faker.internet.url(),
      icon: faker.internet.url(),
      isOver18: faker.datatype.boolean(),
      isPrivate: faker.datatype.boolean(),
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
    })),

    seedModel(UserReports, () => ({
      reporterUsername: faker.internet.userName(),
      reportedUsername: faker.internet.userName(),
      reportType: faker.random.arrayElement([
        "username",
        "profile image",
        "banner image",
        "bio",
      ]), // Randomly select a report type
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
    })),
    seedModel(UserPreferences, () => ({
      username: faker.internet.userName(),
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
      mute: [{ username: faker.internet.userName() }],
      viewMutedCommunities: [{ communityId: faker.datatype.uuid() }],
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
      upvotes: faker.datatype.boolean(),
      replies: faker.datatype.boolean(),
      newFollowers: faker.datatype.boolean(),
      postsYouFollow: faker.datatype.boolean(),
      newFollowerEmail: faker.datatype.boolean(),
      chatRequestEmail: faker.datatype.boolean(),
      unsubscribeFromAllEmails: faker.datatype.boolean(),
    })),
  ]);

  console.log("Data Seeded Successfully.");
  mongoose.connection.close();
}

seedData().catch((err) => {
  console.error(err);
  mongoose.connection.close();
});
