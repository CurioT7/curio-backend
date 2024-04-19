const User = require("../models/userModel");

/**
 * Check if a username exists in the database.
 * @param {string} username - The username to check.
 * @returns {Promise<boolean>} A promise that resolves with a boolean indicating if the username exists.
 */

async function usernameExists(username) {
  const user = await User.findOne({ username });
  return user !== null;
}

const adjectives = [
  "Red",
  "Blue",
  "Green",
  "Happy",
  "Sad",
  "Clever",
  "Silly",
  "Brave",
  "Fast",
  "Slow",
  "Gentle",
  "Fierce",
  "Bright",
  "Dark",
  "Loud",
  "Quiet",
  "Playful",
  "Serious",
  "Vivid",
  "Mellow",
  "Vibrant",
  "Witty",
  "Cheerful",
  "Charming",
  "Mysterious",
  "Curious",
  "Energetic",
  "Calm",
  "Friendly",
  "Grumpy",
  "Whimsical",
  "Zesty",
  "Joyful",
  "Radiant",
  "Sunny",
  "Chill",
  "Lively",
  "Cozy",
  "Daring",
  "Dynamic",
  "Inventive",
  "Magical",
  "Enchanting",
  "Quirky",
  "Thoughtful",
  "Epic",
  "Legendary",
  "Majestic",
  "Wondrous",
  "Zealous",
];

const nouns = [
  "Dog",
  "Cat",
  "Elephant",
  "Tiger",
  "Mountain",
  "Ocean",
  "Sun",
  "Moon",
  "Star",
  "Rain",
  "Forest",
  "River",
  "Valley",
  "Island",
  "Castle",
  "Dragon",
  "Wizard",
  "Knight",
  "Sphinx",
  "Phoenix",
  "Pirate",
  "Mermaid",
  "Unicorn",
  "Fairy",
  "Ninja",
  "Samurai",
  "Journey",
  "Adventure",
  "Discovery",
  "Dreamer",
  "Explorer",
  "Traveler",
  "Creator",
  "Seeker",
  "Hero",
  "Legend",
  "Mystery",
  "Wanderer",
  "Infinity",
  "Harmony",
  "Majesty",
  "Whisper",
  "Serenity",
  "Cascade",
  "Aurora",
  "Eclipse",
  "Horizon",
  "Grove",
  "Enigma",
  "Bliss",
];

/**
 * Generates a random username using an adjective, noun, and a 4-digit number
 * @returns {Promise<string>} A unique username
 */

const generateRandomUsername = async () => {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 9000) + 1000; // Generates a 4-digit number
  const username = `${adjective}_${noun}_${number}`;
  // Check if the username exists asynchronously
  const exists = await usernameExists(username);
  if (exists) return generateRandomUsername();

  return username;
};

module.exports = { usernameExists, generateRandomUsername };
