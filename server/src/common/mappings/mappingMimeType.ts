// ^ mapping (расшир.связь ф.mimeType с FileType)

import { FileType } from '../types/file-types';

export const mappingMimeType = {
  audio: FileType.AUDIO,
  image: FileType.IMAGE,
  text: {
    plain: FileType.DOCUMENT, // txt
    html: FileType.WEB,
    css: FileType.WEB,
    scss: FileType.WEB,
    javascript: FileType.WEB,
    'x-python': FileType.WEB,
    xml: FileType.DOCUMENT,
    csv: FileType.IMAGE,
  },
  application: {
    msword: FileType.DOCUMENT, //  стар.DOC
    xml: FileType.DOCUMENT,
    json: FileType.DOCUMENT,
    'schema+json': FileType.DOCUMENT,
    pdf: FileType.DOCUMENT,
    'vnd.openxmlformats-officedocument.wordprocessingml.document':
      FileType.DOCUMENT, // DOCX
    'vnd.openxmlformats-officedocument.spreadsheetml.sheet': FileType.DOCUMENT, // Excel
    'vnd.openxmlformats-officedocument.presentationml.presentation':
      FileType.DOCUMENT, // PowrPoint
    'octet-stream': FileType.BOOK, // fb2
    zip: FileType.APPLICATION,
    'x-rar-compressed': FileType.APPLICATION,
    'x-msdownload': FileType.APPLICATION,
  },
  video: FileType.VIDEO,
};
