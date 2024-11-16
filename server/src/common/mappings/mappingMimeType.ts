// ^ mapping (расшир.связь ф.mimeType с FileGroups)

import { FileGroups } from '../types/typeFileGroups';

export const mappingMimeType = {
  audio: FileGroups.AUDIO,
  image: FileGroups.IMAGE,
  text: {
    plain: FileGroups.DOCUMENT, // txt
    html: FileGroups.WEB,
    css: FileGroups.WEB,
    scss: FileGroups.WEB,
    javascript: FileGroups.WEB,
    'x-python': FileGroups.WEB,
    xml: FileGroups.DOCUMENT,
    csv: FileGroups.IMAGE,
  },
  application: {
    msword: FileGroups.DOCUMENT, //  стар.DOC
    xml: FileGroups.DOCUMENT,
    json: FileGroups.DOCUMENT,
    'schema+json': FileGroups.DOCUMENT,
    pdf: FileGroups.DOCUMENT,
    'vnd.openxmlformats-officedocument.wordprocessingml.document':
      FileGroups.DOCUMENT, // DOCX
    'vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      FileGroups.DOCUMENT, // Excel
    'vnd.openxmlformats-officedocument.presentationml.presentation':
      FileGroups.DOCUMENT, // PowrPoint
    'octet-stream': FileGroups.BOOK, // fb2
    zip: FileGroups.APPLICATION,
    'x-rar-compressed': FileGroups.APPLICATION,
    'x-msdownload': FileGroups.APPLICATION,
  },
  video: FileGroups.VIDEO,
};
