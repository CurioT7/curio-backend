require("dotenv").config(); // Ensure this is at the top if you're using dotenv for environment variables
const mongoose = require("mongoose");
const faker = require("faker");

const Comment = require("../models/commentModel"); // Adjust the path as necessary
const Post = require("../models/postModel");
const User = require("../models/userModel");
const Subreddit = require("../models/subredditModel");
const UserReports = require("../models/reportModel");
const Block = require("../models/blockModel");
const UserPreferences = require("../models/userPreferencesModel");
const CommunitySettings = require("../models/communitySettingsModel");

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
      gender: faker.random.arrayElement([
        "male",
        "female",
        "i prefer not to say",
      ]),
      language: faker.random.locale(),
      cakeDay: formattedCakeDay,
      goldAmount: faker.datatype.number(),
      banner: faker.internet.url(),
      profilePicture: faker.internet.avatar(),
      bio: faker.lorem.sentences(),
      socialLinks: [
        {
          displayName: faker.random.word(),
          platform: faker.random.arrayElement([
            "facebook",
            "instagram",
            "linkedin",
            "github",
            "twitter",
          ]),
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

  const uniquePairs = new Set();

  while (uniquePairs.size < n) {
      const blockerIndex = faker.datatype.number({ min: 0, max: userCount - 1 });
      const blockedIndex = faker.datatype.number({ min: 0, max: userCount - 1 });

      if (blockerIndex !== blockedIndex) {
          uniquePairs.add(`${blockerIndex}-${blockedIndex}`);
      }
  }

  for (const pair of uniquePairs) {
      const [blockerIndex, blockedIndex] = pair.split("-");

      const block = new Block({
          blockerId: users[blockerIndex]._id,
          blockedId: users[blockedIndex]._id,
          unblockTimestamp: faker.date.past(),
          blockedUsername: users[blockedIndex].username, // Add blocked username
      });

      await block.save();
      blocks.push(block);
  }

  return blocks;
}

async function seedCommunitySettings(n = 5, subreddits, users) {
  const communitySettingsList = [];

  for (let i = 0; i < n; i++) {
      const subredditIndex = faker.datatype.number({ min: 0, max: subreddits.length - 1 });
      const subreddit = subreddits[subredditIndex];

      const communitySettings = new CommunitySettings({
          name: subreddit.name,
          description: subreddit.description,
          welcomeMessage: faker.datatype.boolean(),
          privacyMode: faker.random.arrayElement(["private", "public", "restricted"]),
          isNSFW: faker.datatype.boolean(),
          posts: faker.random.arrayElement(["Any", "Links Only", "Text Posts Only"]),
          isSpoiler: faker.datatype.boolean(),
          allowsCrossposting: faker.datatype.boolean(),
          archivePosts: faker.datatype.boolean(),
          allowImages: faker.datatype.boolean(),
          allowMultipleImages: faker.datatype.boolean(),
          allowPolls: faker.datatype.boolean(),
          postSpamFilterStrength: faker.random.arrayElement(["Low", "High", "All"]),
          commentSpamFilterStrength: faker.random.arrayElement(["Low", "High", "All"]),
          linksSpamFilterStrength: faker.random.arrayElement(["Low", "High", "All"]),
          commentsSort: faker.random.arrayElement(["None", "Best", "Old", "Q&A", "New", "Top", "Controversial"]),
          collapseDeletedComments: faker.datatype.boolean(),
          commentScoreHide: faker.datatype.number({ min: 0, max: 100 }),
          allowGifComment: faker.datatype.boolean(),
          allowImageComment: faker.datatype.boolean(),
          allowCollectibleExpressions: faker.datatype.boolean(),
          createdAt: faker.date.past(),
          banner: faker.image.imageUrl(),
          avatar: faker.image.imageUrl(),
          creator: [users[faker.datatype.number({ min: 0, max: users.length - 1 })]._id],
      });

      await communitySettings.save();
      communitySettingsList.push(communitySettings);
  }

  return communitySettingsList;
}

async function seedPreferences(n = 5, users) {
  const userPreferencesList = [];

  for (let i = 0; i < n; i++) {
      const userIndex = faker.datatype.number({ min: 0, max: users.length - 1 });
      const user = users[userIndex];

      const userPreferences = new UserPreferences({
          username: user.username,
          gender: faker.random.arrayElement(["woman", "man", "i prefer not to say"]),
          language: faker.random.arrayElement(["Deutsch", "English(us)", "Espanol(es)", "Espanol(mx)", "Francias", "Italiano", "portugues(br)", "portugues(pt)"]),
          locationCustomization: faker.address.country(),
          displayName: faker.name.findName(),
          about: faker.lorem.paragraph(),
          socialLinks: Array.from({ length: faker.datatype.number({ min: 0, max: 3 }) }, () => ({
              displayName: faker.name.jobTitle(),
              url: faker.internet.url(),
              platform: faker.random.word()
          })),
          banner: faker.image.imageUrl(),
          profilePicture: faker.image.imageUrl(),
          NSFW: faker.datatype.boolean(),
          allowFollow: faker.datatype.boolean(),
          contentVisibility: faker.datatype.boolean(),
          activeInCommunityVisibility: faker.datatype.boolean(),
          clearHistory: faker.datatype.boolean(),
          viewBlockedPeople: [],
          viewMutedCommunities: [],
          adultContent: faker.datatype.boolean(),
          autoplayMedia: faker.datatype.boolean(),
          communityThemes: faker.datatype.boolean(),
          communityContentSort: faker.random.arrayElement(["hot", "new", "top"]),
          globalContentView: faker.random.arrayElement(["card", "classic"]),
          rememberPerCommunity: {
              rememberContentSort: faker.datatype.boolean(),
              rememberContentView: faker.datatype.boolean()
          },
          openPostsInNewTab: faker.datatype.boolean(),
          mentions: faker.datatype.boolean(),
          comments: faker.datatype.boolean(),
          posts: faker.datatype.boolean(),
          subreddit: faker.datatype.boolean(),
          upvotesPosts: faker.datatype.boolean(),
          upvotesComments: faker.datatype.boolean(),
          replies: faker.datatype.boolean(),
          newFollowers: faker.datatype.boolean(),
          postsYouFollow: faker.datatype.boolean(),
          newFollowerEmail: faker.datatype.boolean(),
          chatRequestEmail: faker.datatype.boolean(),
          unsubscribeFromAllEmails: faker.datatype.boolean(),
          allowPrivateMessages: faker.datatype.boolean(),
          allowChatRequests: faker.datatype.boolean(),
          allowChatNotifications: faker.datatype.boolean(),
          // Add other fields as needed
      });

      // Add viewBlockedPeople data
      for (let j = 0; j < faker.datatype.number({ min: 0, max: 3 }); j++) {
          userPreferences.viewBlockedPeople.push({
              blockedUsername: users[faker.datatype.number({ min: 0, max: users.length - 1 })].username,
              blockTimestamp: faker.date.past()
          });
      }

      // Add viewMutedCommunities data
      for (let k = 0; k < faker.datatype.number({ min: 0, max: 3 }); k++) {
          userPreferences.viewMutedCommunities.push({
              communityName: faker.random.word()
          });
      }

      await userPreferences.save();
      userPreferencesList.push(userPreferences);
  }

  return userPreferencesList;
}

// async function seedPreferences(n = 5, users, subreddits) {
//   const preferences = [];
//   for (let i = 0; i < n; i++) {
//     const userIndex = faker.datatype.number({
//       min: 0,
//       max: users.length - 1,
//     });
//     const preference = new UserPreferences({
//       username: users[userIndex].username,
//       gender: faker.random.arrayElement([
//         "woman",
//         "man",
//         "i prefer not to say",
//       ]),
//       language: faker.random.arrayElement([
//         "Deutsch",
//         "English(us)",
//         "Espanol(es)",
//         "Espanol(mx)",
//         "Francias",
//         "Italiano",
//         "portugues(br)",
//         "portugues(pt)",
//       ]),
//       locationCustomization: faker.address.city(),
//       displayName: faker.name.findName(),
//       about: faker.lorem.sentence(),
//       socialLinks: [
//         {
//           displayName: faker.random.word(),
//           platform: faker.random.arrayElement([
//             "facebook",
//             "instagram",
//             "linkedin",
//             "github",
//             "twitter",
//           ]),
//           url: faker.internet.url(),
//         },
//       ],
//       images: {
//         pfp: faker.image.avatar(),
//         banner: faker.image.imageUrl(),
//       },
//       NSFW: faker.datatype.boolean(),
//       allowFollow: faker.datatype.boolean(),
//       contentVisibility: faker.datatype.boolean(),
//       activeInCommunityVisibility: faker.datatype.boolean(),
//       clearHistory: faker.datatype.boolean(),
//       block: [
//         { username: faker.internet.userName() },
//         { username: faker.internet.userName() },
//       ],
//       viewBlockedPeople: [
//         {
//           username: faker.internet.userName(),
//           blockTimestamp: faker.date.past(),
//         },
//         {
//           username: faker.internet.userName(),
//           blockTimestamp: faker.date.past(),
//         },
//       ],
//       viewMutedCommunities: [
//         { communityName: faker.lorem.words(2).substring(0, 20) },
//         { communityName: faker.lorem.words(2).substring(0, 20) },
//       ],
//       adultContent: faker.datatype.boolean(),
//       autoplayMedia: faker.datatype.boolean(),
//       communityThemes: faker.datatype.boolean(),
//       communityContentSort: faker.random.arrayElement([
//         "hot",
//         "new",
//         "top",
//         "rising",
//       ]),
//       globalContentView: faker.random.arrayElement(["card", "classic"]),
//       rememberPerCommunity: {
//         rememberContentSort: faker.datatype.boolean(),
//         rememberContentView: faker.datatype.boolean(),
//       },
//       openPostsInNewTab: faker.datatype.boolean(),
//       mentions: faker.datatype.boolean(),
//       comments: faker.datatype.boolean(),
//       upvotesPosts: faker.datatype.boolean(),
//       upvotesComments: faker.datatype.boolean(),
//       replies: faker.datatype.boolean(),
//       newFollowers: faker.datatype.boolean(),
//       postsYouFollow: faker.datatype.boolean(),
//       newFollowerEmail: faker.datatype.boolean(),
//       chatRequestEmail: faker.datatype.boolean(),
//       unsubscribeFromAllEmails: faker.datatype.boolean(),
//     });
//     // Link viewMutedCommunities array with existing communities
//     const mutedCommunityIndex1 = faker.datatype.number({
//       min: 0,
//       max: subreddits.length - 1,
//     });
//     const mutedCommunityIndex2 = faker.datatype.number({
//       min: 0,
//       max: subreddits.length - 1,
//     });
//     preference.viewMutedCommunities = [
//       { communityName: subreddits[mutedCommunityIndex1].name },
//       { communityName: subreddits[mutedCommunityIndex2].name },
//     ];

//     // Link viewBlockedPeople array with existing users
//     const blockedUserIndex1 = faker.datatype.number({
//       min: 0,
//       max: users.length - 1,
//     });
//     const blockedUserIndex2 = faker.datatype.number({
//       min: 0,
//       max: users.length - 1,
//     });
//     preference.viewBlockedPeople = [
//       {
//         username: users[blockedUserIndex1].username,
//         blockTimestamp: faker.date.past(),
//       },
//       {
//         username: users[blockedUserIndex2].username,
//         blockTimestamp: faker.date.past(),
//       },
//     ];
//     await preference.save();
//     preferences.push(preference);
//   }
//   return preferences;
// }

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
        "display name",
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
      reportDetails: faker.random.word(),
    });
    await report.save();
    reports.push(report);
  }

  return reports;
}

async function seedSubreddits(n = 5, users) {
  const subreddits = [];
  const themes = [
    "Technology",
    "Science",
    "Art",
    "Books",
    "Music",
    "Photography",
    "Movies",
    "Food",
    "Fitness",
    "Travel",
  ];
  for (let i = 0; i < n; i++) {
    const themeIndex = faker.datatype.number({
      min: 0,
      max: themes.length - 1,
    });
    let name = `${themes[themeIndex]} ${faker.lorem.word()}`;
    // Ensure uniqueness of the subreddit name
    let isUnique = false;
    while (!isUnique) {
      const existingSubreddit = await Subreddit.findOne({ name });
      if (!existingSubreddit) {
        isUnique = true;
      } else {
        // Append a random string to make the name unique
        name = `${name}-${faker.datatype.uuid().substring(0, 2)}`;
      }
    }
    const maxLength = 21;
    const truncatedName = name.substring(0, maxLength);
    const theme = themes[themeIndex];
    let description = "";

    // Generate a meaningful description based on the theme
    switch (theme.toLowerCase()) {
      case "technology":
        description =
          "A community for discussing the latest advancements in technology, from AI to blockchain.";
        break;
      case "science":
        description =
          "Explore the wonders of the universe and delve into cutting-edge scientific research.";
        break;
      case "art":
        description =
          "Celebrate creativity in all its forms, from traditional paintings to digital art.";
        break;
      case "books":
        description =
          "Dive into the world of literature and share your favorite books, authors, and literary discussions.";
        break;
      case "music":
        description =
          "Discover new tunes, discuss your favorite artists, and explore the diverse world of music genres.";
        break;
      case "photography":
        description =
          "Share your stunning photos, exchange photography tips, and appreciate the beauty of visual storytelling.";
        break;
      case "movies":
        description =
          "Discuss classic films, analyze the latest blockbusters, and explore the art of cinematography.";
        break;
      case "food":
        description =
          "From recipes to restaurant recommendations, join us to indulge in the world of gastronomy.";
        break;
      case "fitness":
        description =
          "Achieve your fitness goals, share workout routines, and motivate each other towards a healthier lifestyle.";
        break;
      case "travel":
        description =
          "Embark on virtual journeys, share travel experiences, and gather tips for your next adventure.";
        break;
      default:
        description =
          "A diverse community for engaging discussions on various topics.";
        break;
    }
    const subreddit = new Subreddit({
      name: truncatedName,
      description: description,
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
    const subreddit = subreddits[subredditIndex];

    // Generate title and content based on subreddit theme
    const title = generatePostTitle(subreddit);
    const content = generatePostContent(subreddit);

    const post = new Post({
      title: title,
      content: content,
      authorName: users[userIndex].username,
      linkedSubreddit: subreddit._id,
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
      isSaved: faker.datatype.boolean(),
      isDraft: faker.datatype.boolean(),
    });
    // Calculate karma for the post using the virtual property
    const karma = post.karma;
    post.karma = karma;

    await post.save();
    posts.push(post);
  }
  return posts;
}
// Function to generate post title based on subreddit theme
function generatePostTitle(subreddit) {
  const theme = subreddit.name.split(" ")[0]; // Extracting the theme from the subreddit name
  let title = "";

  switch (theme.toLowerCase()) {
    case "technology":
      title = "Exploring the Latest Tech Trends";
      break;
    case "science":
      title = "Discovering Scientific Wonders";
      break;
    case "art":
      title = "Appreciating Creative Expressions";
      break;
    case "books":
      title = "Dive into Captivating Stories";
      break;
    case "music":
      title = "Exploring Melodic Landscapes";
      break;
    case "photography":
      title = "Capturing Moments in Time";
      break;
    case "movies":
      title = "Unraveling Cinematic Masterpieces";
      break;
    case "food":
      title = "Savoring Culinary Delights";
      break;
    case "fitness":
      title = "Achieving Wellness Goals";
      break;
    case "travel":
      title = "Embarking on Adventures Around the World";
      break;
    default:
      title = "Engaging Discussion";
      break;
  }

  return title;
}

// Function to generate post content based on subreddit theme
function generatePostContent(subreddit) {
  // Example logic: generate content related to the subreddit theme
  if (subreddit.name.toLowerCase().includes("technology")) {
    return "Exploring the impact of AI on various industries and its potential for reshaping the future.";
  } else if (subreddit.name.toLowerCase().includes("science")) {
    return "Delving into recent breakthroughs in quantum mechanics and their implications for our understanding of the universe.";
  } else if (subreddit.name.toLowerCase().includes("art")) {
    return "Analyzing the works of renowned abstract expressionist artists and their influence on contemporary art movements.";
  } else if (subreddit.name.toLowerCase().includes("books")) {
    return "Sharing personal reviews and recommendations for compelling novels across various genres, from classics to contemporary literature.";
  } else if (subreddit.name.toLowerCase().includes("music")) {
    return "Introducing lesser-known indie rock bands and albums that deserve more recognition, along with discussions on the evolution of the genre.";
  } else if (subreddit.name.toLowerCase().includes("photography")) {
    return "Sharing expert photography techniques for capturing breathtaking landscapes, along with insights into composition and post-processing.";
  } else if (subreddit.name.toLowerCase().includes("movies")) {
    return "Examining the stylistic elements and cultural significance of film noir classics, from iconic characters to atmospheric cinematography.";
  } else if (subreddit.name.toLowerCase().includes("food")) {
    return "Embarking on a gastronomic journey to discover the vibrant flavors and cultural diversity of street food delicacies across different continents.";
  } else if (subreddit.name.toLowerCase().includes("fitness")) {
    return "Discussing the benefits of HIIT workouts for improving cardiovascular health, building muscle strength, and maximizing calorie burn.";
  } else if (subreddit.name.toLowerCase().includes("travel")) {
    return "Sharing travel stories and insider tips for exploring the enchanting landscapes, rich cultures, and hidden gems of Southeast Asia.";
  } else {
    return faker.lorem.paragraph();
  }
}
async function seedComments(n = 5, users, posts, subreddits) {
  const comments = [];

  for (let i = 0; i < n; i++) {
      const authorIndex = faker.datatype.number({ min: 0, max: users.length - 1 });
      const postIndex = faker.datatype.number({ min: 0, max: posts.length - 1 });
      const subredditIndex = faker.datatype.number({ min: 0, max: subreddits.length - 1 });

      const comment = new Comment({
          content:generateCommentContent(subreddits[subredditIndex]),
          authorName: users[authorIndex].username,
          createdAt: faker.date.past(),
          upvotes: faker.datatype.number({ min: 0, max: 100 }),
          downvotes: faker.datatype.number({ min: 0, max: 100 }),
          linkedPost: posts[postIndex]._id,
          linkedSubreddit: subreddits[subredditIndex]._id,
          awards: faker.datatype.number(),
          isEdited: faker.datatype.boolean(),
          isReportApproved: faker.datatype.boolean(),
          isRemoved: faker.datatype.boolean(),
          // Add other fields as needed
      });

      await comment.save();
      comments.push(comment);
  }

  return comments;
}
// Function to generate comment content based on subreddit theme
function generateCommentContent(subreddit) {
  if (subreddit.name.toLowerCase().includes("technology")) {
    return "I think AI has the potential to revolutionize various industries, especially in the field of healthcare.";
  } else if (subreddit.name.toLowerCase().includes("science")) {
    return "The recent discoveries in quantum mechanics are mind-blowing! It's fascinating to see how our understanding of the universe evolves.";
  } else if (subreddit.name.toLowerCase().includes("art")) {
    return "This painting beautifully captures the essence of abstract expressionism, don't you think?";
  } else if (subreddit.name.toLowerCase().includes("books")) {
    return "I just finished reading a gripping thriller novel. Anyone else here a fan of mystery novels?";
  } else if (subreddit.name.toLowerCase().includes("music")) {
    return "I can't stop listening to this new indie rock band. Their music is so refreshing!";
  } else if (subreddit.name.toLowerCase().includes("photography")) {
    return "Wow, these landscape photos are breathtaking! The photographer really knows how to capture natural beauty.";
  } else if (subreddit.name.toLowerCase().includes("movies")) {
    return "The cinematography in this classic film is unparalleled. It's a timeless masterpiece.";
  } else if (subreddit.name.toLowerCase().includes("food")) {
    return "This recipe looks delicious! I can't wait to try it out this weekend.";
  } else if (subreddit.name.toLowerCase().includes("fitness")) {
    return "Does anyone have tips for staying motivated to work out regularly?";
  } else if (subreddit.name.toLowerCase().includes("travel")) {
    return "I recently visited Japan and had an amazing time exploring Tokyo. Can't wait to go back!";
  } else {
    return faker.lorem.sentence();
  }
}

async function clearCollections() {
  await Comment.deleteMany({});
  await Post.deleteMany({});
  await User.deleteMany({});
  await Subreddit.deleteMany({});
  await UserReports.deleteMany({});
  await Block.deleteMany({});
  await UserPreferences.deleteMany({});
  await CommunitySettings.deleteMany({});
  // Add any other collections you need to clear
}

async function updateSubredditsWithPosts(subreddits, posts) {
  for (const subreddit of subreddits) {
    // Clear existing posts in the subreddit
    subreddit.posts = [];
    await subreddit.save();
  }
  for (const post of posts) {
    const subredditIndex = faker.datatype.number({
      min: 0,
      max: subreddits.length - 1,
    });
    const subreddit = subreddits[subredditIndex];
    post.linkedSubreddit = subreddit._id;
    await post.save();

    subreddit.posts.push(post._id);
    await subreddit.save();
  }
}

async function updateUserData(users, posts, comments, subreddits) {
  for (const user of users) {
    if (
      !posts ||
      posts.length === 0 ||
      !comments ||
      comments.length === 0 ||
      !subreddits ||
      subreddits.length === 0
    ) {
      console.error("Posts, comments, or subreddits are empty or undefined.");
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

    // Upvotes and downvotes are chosen randomly for demonstration
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

    // For followers and followings, use existing users randomly
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

    // Clear existing user subreddits before adding new ones to avoid duplicates
    user.subreddits = [];

    // Assign user to multiple subreddits (e.g., 2 for this example) with different roles
    for (let i = 0; i < 2; i++) {
      const randomSubredditIndex = faker.datatype.number({
        min: 0,
        max: subreddits.length - 1,
      });
      const selectedSubreddit = subreddits[randomSubredditIndex];

      // Prevent duplicate subreddit assignments
      if (
        !user.subreddits.some(
          (sub) => sub.subreddit.toString() === selectedSubreddit._id.toString()
        )
      ) {
        user.subreddits.push({
          subreddit: selectedSubreddit._id,
          role: faker.random.arrayElement(["moderator", "member"]),
        });
      }
    }

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
    const comments = await seedComments(40, users, posts, subreddits);
    await updateSubredditsWithPosts(subreddits, posts);
    await updatePostsWithComments(posts, comments);
    await seedPreferences(5, users, subreddits);
    await seedBlock(5, users);
    await seedReports(5, users);
    await updateUserData(users, posts, comments, subreddits);
    await seedCommunitySettings(5, subreddits, users);

    console.log("Data seeded successfully");
  } catch (error) {
    console.error("Error seeding data:", error);
  } finally {
    mongoose.connection.close();
  }
}

seedData();
