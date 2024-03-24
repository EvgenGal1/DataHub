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
      : fileType === 'COVER'
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

  // доп.обраб.частичного сходства // ^^ переимен.const fileTarget > partialFileTargets
  // let fileTarget: string = 'other';
  // for (const key in fileTarget) {
  //     if (fileType.toUpperCase().startsWith(key)) {
  //         fileTarget = partialFileTargets[key];
  //         break;
  //     }
  // }

  return fileTarget;
};
