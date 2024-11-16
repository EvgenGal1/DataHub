// ^ mapping (расшир.связь ф.mimeType с FilePaths)

import { FilePaths } from '../types/typeFilePaths';

export const mappingMimeType = {
  audio: FilePaths.AUDIO,
  image: FilePaths.IMAGE,
  text: {
    plain: FilePaths.DOCUMENT, // txt
    html: FilePaths.WEB,
    css: FilePaths.WEB,
    scss: FilePaths.WEB,
    javascript: FilePaths.WEB,
    'x-python': FilePaths.WEB,
    xml: FilePaths.DOCUMENT,
    csv: FilePaths.IMAGE,
  },
  application: {
    msword: FilePaths.DOCUMENT, //  стар.DOC
    xml: FilePaths.DOCUMENT,
    json: FilePaths.DOCUMENT,
    'schema+json': FilePaths.DOCUMENT,
    pdf: FilePaths.DOCUMENT,
    'vnd.openxmlformats-officedocument.wordprocessingml.document':
      FilePaths.DOCUMENT, // DOCX
    'vnd.openxmlformats-officedocument.spreadsheetml.sheet': FilePaths.DOCUMENT, // Excel
    'vnd.openxmlformats-officedocument.presentationml.presentation':
      FilePaths.DOCUMENT, // PowrPoint
    'octet-stream': FilePaths.BOOK, // fb2
    zip: FilePaths.APPLICATION,
    'x-rar-compressed': FilePaths.APPLICATION,
    'x-msdownload': FilePaths.APPLICATION,
  },
  video: FilePaths.VIDEO,
};
