import { parseTags } from './parseTags.js';

export const buildPostFormData = ({ title, content, tags, imageFile }) => {
  const formData = new FormData();
  formData.append('title', title);
  formData.append('content', content);
  formData.append('tags', parseTags(tags).join(','));
  if (imageFile) {
    formData.append('image', imageFile);
  }
  return formData;
};

export const buildProfileFormData = ({ bio, profilePictureFile }) => {
  const formData = new FormData();
  if (bio !== undefined) {
    formData.append('bio', bio);
  }
  if (profilePictureFile) {
    formData.append('profilePicture', profilePictureFile);
  }
  return formData;
};
