// ^^ типы/назначениея файлов с определением пути сохранения и значением
export const getFileTarget = (fileType: string) => {
  console.log('getFileTarget fileType : ' + fileType);
  const fileTarget =
    fileType === 'IMAGE'
      ? 'images/picture'
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
