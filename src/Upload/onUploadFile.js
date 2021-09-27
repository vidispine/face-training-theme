import {
  vsimport as ImportApi,
  ChunkedUpload,
  collection as CollectionApi,
} from '@vidispine/vdt-api';
import { createMetadataType } from '@vidispine/vdt-js';

import { TRAINING_METADATA_KEY, TRAINING_METADATA_VALUE } from '../const';

export function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    // eslint-disable-next-line
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
}

export const DEFAULT_AUDIO_SHAPETAGS = ['__mp3_160k'];
export const DEFAULT_VIDEO_SHAPETAGS = ['__mp4'];
export const DEFAULT_IMAGE_SHAPETAGS = ['__png'];
export const AUDIO_MIMETYPE_PREFIX = 'audio';
export const VIDEO_MIMETYPE_PREFIX = 'video';
export const IMAGE_MIMETYPE_PREFIX = 'image';
export const ADDITIONAL_VIDEO_MIMETYPES = ['application/mxf'];
export const ADDITIONAL_IMAGE_MIMETYPES = [];
export const ADDITIONAL_AUDIO_MIMETYPES = [];

export const getDefaultShapeTags = (file) => {
  if (!file || !file.type) return [];
  const mimeType = file.type.toLowerCase();
  if (mimeType.startsWith(AUDIO_MIMETYPE_PREFIX) || ADDITIONAL_AUDIO_MIMETYPES.includes(mimeType))
    return DEFAULT_AUDIO_SHAPETAGS;
  if (mimeType.startsWith(VIDEO_MIMETYPE_PREFIX) || ADDITIONAL_VIDEO_MIMETYPES.includes(mimeType))
    return DEFAULT_VIDEO_SHAPETAGS;
  if (mimeType.startsWith(IMAGE_MIMETYPE_PREFIX) || ADDITIONAL_IMAGE_MIMETYPES.includes(mimeType))
    return DEFAULT_IMAGE_SHAPETAGS;
  return [];
};

export const chunkedUpload = (file, props = {}) =>
  new Promise((resolve, reject) => {
    const uploadInstance = new ChunkedUpload(file, {
      onFail: (error) => reject(error),
      onComplete: (resp) => resolve(resp),
      ...props,
    });
    uploadInstance.upload();
  });

export default ({
  file,
  collectionId,
  onProgress,
  metadata: propsMetadata = {},
  placeholderParams = {},
  importParams = {},
  chunkedUploadProps = {},
  generateTransferId = uuidv4,
  getShapeTags = getDefaultShapeTags,
}) =>
  new Promise((resolve, reject) => {
    try {
      const trainingId = window.localStorage.getItem('TRAINING_COLLECTION_ID');
      let itemId;
      onProgress({});
      const shapeTags = getShapeTags(file);
      const {
        [TRAINING_METADATA_KEY]: trainingMaterial,
        [TRAINING_METADATA_VALUE]: name,
        ...rest
      } = propsMetadata;
      const mimeType = file.type;
      const [mediaType] = mimeType.split('/');
      const metadata = {
        mimeType,
        mediaType,
        ...rest,
        ...(trainingMaterial && {
          [TRAINING_METADATA_KEY]: true,
          [TRAINING_METADATA_VALUE]: name,
        }),
      };
      const metadataDocument = createMetadataType(metadata);
      ImportApi.createImportPlaceholder({
        metadataDocument,
        queryParams: {
          container: 1,
          ...placeholderParams,
        },
      })
        .then(({ data: itemDocument }) => {
          itemId = itemDocument.id;
          let collectionIds = [];
          if (collectionId) {
            if (!Array.isArray(collectionId)) collectionIds.push(collectionId);
            else collectionIds = collectionIds.concat(collectionId);
          }
          if (trainingMaterial) collectionIds.push(trainingId);
          if (!collectionIds.length) return Promise.resolve();
          return Promise.all(
            collectionIds.map((id) =>
              CollectionApi.addCollectionEntity({
                collectionId: id,
                entityId: itemId,
              }),
            ),
          );
        })
        .then(() => {
          const transferId = generateTransferId();
          const queryParams = {
            transferId,
            tag: shapeTags,
            ...(trainingMaterial && {
              noTranscode: true,
              tag: [TRAINING_METADATA_KEY],
              original: TRAINING_METADATA_KEY,
            }),
            ...importParams,
          };
          return chunkedUpload(file, {
            api: {
              method: ImportApi.createImportComponentRaw,
              props: {
                itemId,
                component: 'container',
                queryParams,
              },
            },
            onProgress,
            ...chunkedUploadProps,
          });
        })
        .then((response) => {
          resolve({ ...response, itemId, collectionId });
        })
        .catch((error) => reject(error));
    } catch (err) {
      /* eslint-disable-next-line no-console */
      console.error(err);
      reject(err);
    }
  });
