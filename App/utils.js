import * as FileSystem from 'expo-file-system';

export const getImagePath = async (imageUrl, filename) => {
  const dir = FileSystem.documentDirectory + 'images/';
  const decodedFilename = decodeURIComponent(filename);
  const filepath = dir + decodedFilename;

  const dirExists = await FileSystem.getInfoAsync(dir);

  if (!dirExists.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  } else {
  }

  const fileExists = await FileSystem.getInfoAsync(filepath);

  if (!fileExists.exists) {
    const { status } = await FileSystem.downloadAsync(imageUrl, filepath);
    if (status !== 200) {
      throw new Error(`Failed to download image from ${imageUrl}`);
    }
  } 

  return filepath;
};

export const updateCacheIfNeeded = async (imageUrl, filename) => {
  console.log("1")
  const dir = FileSystem.documentDirectory + 'images/';
  const decodedFilename = decodeURIComponent(filename);
  const filepath = dir + decodedFilename;
  console.log("2")
  const dirExists = await FileSystem.getInfoAsync(dir);

  if (!dirExists.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  } else {
  }

  const fileExists = await FileSystem.getInfoAsync(filepath);
  console.log("3" + fileExists)
  const { status } = await FileSystem.downloadAsync(imageUrl, filepath);
  if (status !== 200) {
    throw new Error(`Failed to download image from ${imageUrl}`);
  }
  console.log("4 "+ status)
  return filepath;
};
