/**
 * PATCH for admin-backend/controllers/siteImageController.js
 *
 * In the `defaults` map (wherever you define the human-readable metadata
 * for known keys), ADD these 4 new entries and REMOVE the old 2:
 *
 * REMOVE:
 *   about_story_image_main: { ... }
 *   about_story_image_over:  { ... }
 *
 * ADD:
 */

const newDefaults = {
  // Homepage story teaser section
  home_jar_image: {
    belongsTo: 'Homepage story teaser — jar image',
    category: 'Homepage',
  },
  home_protein_image: {
    belongsTo: 'Homepage story teaser — protein shake overlay',
    category: 'Homepage',
  },
  // Our Story / About page
  story_jar_image: {
    belongsTo: 'Our Story page — Why Choose Squirrel Nuts jar image',
    category: 'About Page',
  },
  story_protein_image: {
    belongsTo: 'Our Story page — Why Choose Squirrel Nuts protein overlay',
    category: 'About Page',
  },
};

/**
 * Merge `newDefaults` into your existing `defaults` object inside
 * siteImageController.js — no other changes needed to that file.
 *
 * The old keys (about_story_image_main / about_story_image_over) can be left
 * in the DB; they'll just stop being referenced by the frontend.
 */

module.exports = newDefaults;
