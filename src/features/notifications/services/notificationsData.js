// Mock notifications dataset representing live curation database
// Standardized to match backend-ready status flow structures

export const MOCK_NOTIFICATIONS = [
  {
    id: 'n1',
    type: 'recipe_approved',
    recipeId: 'r1',
    recipeTitle: 'Mughal Shahi Tukda',
    message: 'Recipe Approved by Curator',
    description: 'Your contribution of Mughal Shahi Tukda has been successfully verified and approved by senior curator Dr. Alok Sharma.',
    status: 'approved',
    createdAt: new Date(Date.now() - 3600000 * 1.5).toISOString(), // 1.5 hours ago
    isRead: false,
    actionLabel: 'View Recipe',
    navigationTarget: 'MyRecipeDetails',
    metadata: {
      curatorName: 'Dr. Alok Sharma',
      region: 'Delhi / Awadh',
    }
  },
  {
    id: 'n2',
    type: 'curator_feedback',
    recipeId: 'r2',
    recipeTitle: 'Vedic Somavalli Porridge',
    message: 'New Curator Feedback Received',
    description: 'Curator Karan Dev left notes requesting verification on native wild grains proportions.',
    status: 'changes_requested',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(), // 4 hours ago
    isRead: false,
    actionLabel: 'Open Feedback',
    navigationTarget: 'MyRecipeDetails',
    metadata: {
      curatorName: 'Karan Dev',
      notes: 'Please verify if the wild barley used matches the Vedic records or local varieties.',
    }
  },
  {
    id: 'n3',
    type: 'recipe_rejected',
    recipeId: 'r3',
    recipeTitle: 'Himalayan Nettle Soup',
    message: 'Recipe Rejected',
    description: 'Historical geo-coordinates were invalid. Curation demands authentic geographical records.',
    status: 'rejected',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(), // 12 hours ago
    isRead: false,
    actionLabel: 'Continue Editing',
    navigationTarget: 'EditRecipe',
    metadata: {
      curatorName: 'Meera Negi',
      reason: 'GPS coordinate pins specify an urban center instead of the native high-altitude valley.',
    }
  },
  {
    id: 'n4',
    type: 'recipe_published',
    recipeId: 'r1',
    recipeTitle: 'Mughal Shahi Tukda',
    message: 'Recipe Published to Exhibit',
    description: 'Shahi Tukda has been added to the public digital collection "Mughal Cuisine".',
    status: 'published',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(), // 24 hours ago
    isRead: true,
    actionLabel: 'View Published',
    navigationTarget: 'MyRecipeDetails',
    metadata: {
      collectionId: 'col_mughal',
      views: 142,
    }
  },
  {
    id: 'n5',
    type: 'version_created',
    recipeId: 'r1',
    recipeTitle: 'Mughal Shahi Tukda',
    message: 'New Version Created',
    description: 'You successfully committed Version 2.0 of the recipe after verifying syrup ratios.',
    status: 'draft',
    createdAt: new Date(Date.now() - 3600000 * 30).toISOString(), // 30 hours ago
    isRead: true,
    actionLabel: 'Compare Versions',
    navigationTarget: 'RecipeVersionHistory',
    metadata: {
      version: '2.0',
      editedFields: ['ingredients', 'prepTime'],
    }
  },
  {
    id: 'n6',
    type: 'submission_under_review',
    recipeId: 'r4',
    recipeTitle: 'Grand Trunk Road Seekh',
    message: 'Submission Under Review',
    description: 'Your recipe draft has been received and queued for review by curator team.',
    status: 'pending_review',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(), // 2 days ago
    isRead: true,
    actionLabel: 'View Recipe',
    navigationTarget: 'MyRecipeDetails',
    metadata: {
      queuePosition: 3,
    }
  },
  {
    id: 'n7',
    type: 'draft_saved',
    recipeId: 'r5',
    recipeTitle: 'Coastal Fish Tamarind',
    message: 'Draft Saved Locally',
    description: 'Recipe details saved as a local draft. Complete remaining steps to request curation.',
    status: 'draft',
    createdAt: new Date(Date.now() - 3600000 * 96).toISOString(), // 4 days ago
    isRead: true,
    actionLabel: 'Continue Editing',
    navigationTarget: 'EditRecipe',
    metadata: {
      completedSteps: 5,
      remainingSteps: 3,
    }
  },
  {
    id: 'n8',
    type: 'achievement_unlocked',
    recipeId: '',
    recipeTitle: '',
    message: 'Achievement Unlocked 🏆',
    description: 'Congratulations! You unlocked the "Heritage Custodian" badge for documenting your first 3 approved traditions.',
    status: 'approved',
    createdAt: new Date(Date.now() - 3600000 * 120).toISOString(), // 5 days ago
    isRead: true,
    actionLabel: 'View Archives',
    navigationTarget: 'MyArchive',
    metadata: {
      badgeId: 'custodian_1',
      pointsEarned: 500,
    }
  },
  {
    id: 'n9',
    type: 'info_requested',
    recipeId: 'r6',
    recipeTitle: 'Tribal Bamboo Shoots',
    message: 'Information Requested',
    description: 'Senior curator Dr. Alok Sharma requested additional details on native fermentation timelines.',
    status: 'pending_review',
    createdAt: new Date(Date.now() - 3600000 * 144).toISOString(), // 6 days ago
    isRead: true,
    actionLabel: 'Open Feedback',
    navigationTarget: 'MyRecipeDetails',
    metadata: {
      curatorName: 'Dr. Alok Sharma',
      fieldRequested: 'Fermentation Duration',
    }
  },
  {
    id: 'n10',
    type: 'version_restored',
    recipeId: 'r1',
    recipeTitle: 'Mughal Shahi Tukda',
    message: 'Version Restored',
    description: 'You restored active record back to Version 1.0 based on curator recommendation.',
    status: 'draft',
    createdAt: new Date(Date.now() - 3600000 * 180).toISOString(), // 7.5 days ago
    isRead: true,
    actionLabel: 'Compare Versions',
    navigationTarget: 'RecipeVersionHistory',
    metadata: {
      restoredFrom: '1.0',
    }
  },
  {
    id: 'n11',
    type: 'community_comment',
    recipeId: 'r1',
    recipeTitle: 'Mughal Shahi Tukda',
    message: 'New Community Verification Comment',
    description: 'Custodian Rajesh Kumar commented: "Verified authentic, matches oral histories from Lucknow."',
    status: 'published',
    createdAt: new Date(Date.now() - 3600000 * 240).toISOString(), // 10 days ago
    isRead: true,
    actionLabel: 'View Recipe',
    navigationTarget: 'MyRecipeDetails',
    metadata: {
      commenterName: 'Rajesh Kumar',
    }
  },
  {
    id: 'n12',
    type: 'recipe_archived',
    recipeId: 'r7',
    recipeTitle: 'Silk Route Flatbread',
    message: 'Recipe Card Archived',
    description: 'This record has been moved to archive logs and is hidden from public exhibit catalogs.',
    status: 'draft',
    createdAt: new Date(Date.now() - 3600000 * 300).toISOString(), // 12.5 days ago
    isRead: true,
    actionLabel: 'Restore Draft',
    navigationTarget: 'EditRecipe',
    metadata: {
      archivedDate: '2026-06-24',
    }
  }
];
