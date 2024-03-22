// ^^ типы/назначения файлов с определением пути сохранения и значением
export const fileTargets = (fileType: string) => {
  console.log('fileTargets fileType : ' + fileType);
  const fileTarget =
    fileType === 'IMAGE'
      ? 'images'
      : fileType === 'PICTURE'
      ? 'images/picture'
      : fileType === 'AVATAR'
      ? 'users/avatar'
      : fileType === 'ALBUM'
      ? 'images/album'
      : fileType === 'PHOTO'
      ? 'users/photo'
      : fileType === 'PERSONAL'
      ? 'users/personal'
      : fileType === 'AUDIO'
      ? 'audios'
      : fileType === 'TRACK'
      ? 'audios/track'
      : fileType === 'BOOK'
      ? 'books/book'
      : fileType === 'FILE'
      ? 'books/file'
      : fileType === 'PROSE'
      ? 'books/prose'
      : fileType === 'CODE'
      ? 'prog/code'
      : fileType === 'SCHEME'
      ? 'prog/scheme'
      : fileType === 'BLUEPRINT'
      ? 'prog/blueprint'
      : 'other';
  return fileTarget;
};
