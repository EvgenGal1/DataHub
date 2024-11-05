import { FileType } from '../types/file-types';

export const mappingMimeType = {
  audio: FileType.AUDIO,
  image: FileType.IMAGE,
  text: FileType.TEXT,
  application: {
    pdf: FileType.DOCUMENT,
    doc: FileType.DOCUMENT,
    docx: FileType.DOCUMENT,
    zip: FileType.FILE,
    xlsx: FileType.FILE,
    pptx: FileType.FILE,
    'vnd.openxmlformats-officedocument.wordprocessingml.document':
      FileType.DOCUMENT,
    msword: FileType.DOCUMENT,
  },
  video: FileType.FILE,
};
