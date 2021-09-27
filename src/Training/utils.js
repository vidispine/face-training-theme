import { job as JobApi, item as ItemApi, shape as ShapeApi } from '@vidispine/vdt-api';
import { handleRemoveEntity, handleAddEntity } from '@vidispine/vdt-react';
import { createMetadataType } from '@vidispine/vdt-js';

import { TRAINING_METADATA_VALUE } from '../const';

export const mergeItems = (source, target, modelType = 'face') =>
  JobApi.createJob({
    queryParams: {
      type: 'VCS_TRAINING_MERGE_ITEMS',
      jobmetadata: [
        { key: 'itemId', value: source },
        { key: 'targetItemId', value: target },
        { key: 'modelType', value: modelType },
      ],
    },
  });

export const relabelItem = (itemId, filename, modelType = 'face') =>
  new Promise((resolve, reject) =>
    JobApi.createJob({
      queryParams: {
        type: 'VCS_TRAINING_RELABEL_ITEM',
        jobmetadata: [
          { key: 'itemId', value: itemId },
          { key: 'newLabel', value: filename },
          { key: 'modelType', value: modelType },
        ],
      },
    })
      .then((res) => {
        const metadataDocument = createMetadataType({ [TRAINING_METADATA_VALUE]: filename });
        return ItemApi.updateItemMetadata({ itemId, metadataDocument })
          .then(() => resolve(res))
          .catch(reject);
      })
      .catch(reject),
  );

export const moveItem = (entityId, addToCollectionId = [], oldCollectionId = []) => {
  const entityType = 'item';
  const rootParentId = window.localStorage.getItem('TRAINING_COLLECTION_ID');
  let sourceCollectionId = oldCollectionId;
  if (!sourceCollectionId) sourceCollectionId = [];
  let targetCollectionId = addToCollectionId;
  if (!targetCollectionId) targetCollectionId = [];
  if (!Array.isArray(sourceCollectionId)) sourceCollectionId = sourceCollectionId.split(', ');
  if (!Array.isArray(targetCollectionId)) targetCollectionId = targetCollectionId.split(', ');
  if (!sourceCollectionId.includes(rootParentId)) targetCollectionId.push(rootParentId);
  if (!targetCollectionId.length) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const addPromises = targetCollectionId.map(
      (collectionId) =>
        !sourceCollectionId.includes(collectionId) &&
        handleAddEntity({
          entityId,
          entityType,
          collectionId,
          ...(rootParentId !== collectionId && {
            rootParentId,
          }),
        }),
    );
    const removePromises = sourceCollectionId.map(
      (collectionId) =>
        !targetCollectionId.includes(collectionId) &&
        handleRemoveEntity({
          entityId,
          entityType,
          collectionId,
          rootParentId,
        }),
    );
    Promise.all([...addPromises, ...removePromises])
      .then(resolve)
      .catch(reject);
  });
};

// export const deleteItem = (itemId) =>
//   new Promise((resolve) => {
//     const qp = { content: ['metadata'], field: [TRAINING_METADATA_EXTERNALID] };
//     ItemApi.getItem({ itemId, queryParams: qp }).then(({ data = {} }) => {
//       const { [TRAINING_METADATA_EXTERNALID]: externalId } = parseMetadataType(data.metadata, {
//         flat: true,
//         arrayOnSingle: false,
//       });
//       const itemSearchDocument = { text: [{ value: externalId }] };
//       const queryParams = {
//         content: ['metadata'],
//         field: [ANALYSIS_MODEL_ID_FIELD],
//         group: [ANALYSIS_MODEL_GROUP, ANALYSIS_MODEL_SUBGROUP],
//       };
//       ItemApi.searchItem({ itemSearchDocument, queryParams }).then(({ data: { item } = {} }) => {
//         const items = item.reduce((acc, { metadata = {} }) => {
//           const timespans = parseMetadataType(metadata, {
//             includeGroupAttributes: true,
//             groupAsList: true,
//             timespanAsList: true,
//           });
//           const hits = timespans.reduce((prev, { group = [] }) => {
//             const [vcsGroup] = group.filter(({ name }) => name === ANALYSIS_MODEL_GROUP);
//             if (!vcsGroup) return prev;
//             const { group: subgroup = [] } = vcsGroup;
//             if (!subgroup.length) return prev;
//             const matchingEntries = subgroup.filter(
//               ({ field }) =>
//                 field[ANALYSIS_MODEL_ID_FIELD] &&
//                 field[ANALYSIS_MODEL_ID_FIELD].includes(externalId),
//             );
//             if (!matchingEntries.length) return prev;
//             if (subgroup.length === 1) return [...prev, vcsGroup];
//             return [...prev, ...matchingEntries];
//           }, []);
//           if (!hits) return acc;
//           return [...acc, ...hits];
//         }, []);
//         items.forEach(({ uuid }) => console.log(uuid));
//         resolve(items);
//       });
//     });
//   });
export const deleteItem = (itemId) => ItemApi.removeItem({ itemId });

export const deleteShape = (itemId, shapeId) => ShapeApi.removeShape({ itemId, shapeId });

export function moveShape(shapeId, sourceId, targetId) {
  return new Promise((resolve, reject) => {
    ShapeApi.getShape({ itemId: sourceId, shapeId })
      .then(({ data: shapeDocument }) =>
        ShapeApi.createShape({ itemId: targetId, shapeDocument })
          .then(({ data: { id } }) =>
            ShapeApi.removeShape({ itemId: sourceId, shapeId })
              .then(() => resolve(id))
              .catch(reject),
          )
          .catch(reject),
      )
      .catch(reject);
  });
}
