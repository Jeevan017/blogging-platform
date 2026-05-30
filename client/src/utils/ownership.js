export const isPostOwner = (post, userId) => {
  if (!post || !userId) return false;
  
  // Extract author ID - handle both populated objects and raw IDs
  const authorId = post.author?._id ?? post.author;
  if (!authorId) return false;
  
  // Safely convert both to strings for comparison
  try {
    return authorId.toString() === userId.toString();
  } catch {
    return false;
  }
};

export const isProfileOwner = (profileId, userId) => {
  if (!profileId || !userId) return false;
  
  try {
    return profileId.toString() === userId.toString();
  } catch {
    return false;
  }
};
