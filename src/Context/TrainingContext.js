/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { useApi } from '@vidispine/vdt-react';
import {
  collection as CollectionApi,
  search as SearchApi,
  resource as ResourceApi,
} from '@vidispine/vdt-api';

import {
  TRAINING_METADATA_KEY as key,
  TRAINING_METADATA_VALUE as value,
  TRAINING_METADATA_METHOD as method,
  TRAINING_METADATA_EXTERNALID as externalId,
  TRAINING_COLLECTION_ID as trainId,
  SAMPLE_COLLECTION_ID as sampleId,
} from '../const';

export const TrainingContext = React.createContext({});

export const TrainingProvider = ({ children }) => {
  const {
    request: getCollection,
    data: collection = {},
    isLoading: isLoadingCollection,
    isError: isErrorCollection,
  } = useApi(CollectionApi.searchCollection);
  React.useEffect(() => {
    const itemSearchDocument = {
      operator: {
        field: [{ name: 'vcs_face_isTrainingCollection', value: [{ value: true }] }],
        operation: 'OR',
      },
    };
    getCollection({ itemSearchDocument });
  }, [getCollection]);
  const trainingId = React.useMemo(() => {
    if (isLoadingCollection || isErrorCollection) return null;
    const { collection: trainingCollection, hits = 0 } = collection;
    if (!hits) return null;
    const [{ id }] = trainingCollection;
    window.localStorage.setItem('TRAINING_COLLECTION_ID', id);
    return id;
  }, [isLoadingCollection, isErrorCollection, collection]);

  const {
    request: getCallback,
    data: callback,
    isLoading: isLoadingCallback,
    isError: isErrorCallback,
  } = useApi(ResourceApi.listResourceType);
  React.useEffect(() => {
    getCallback({ resourceType: 'callback' });
  }, [getCallback]);

  const callbackId = React.useMemo(() => {
    if (isLoadingCallback || isErrorCallback) return null;
    const { resource = [{}] } = callback;
    const [{ id }] = resource;
    window.localStorage.setItem('CALLBACK_ID', id);
    return id;
  }, [isLoadingCallback, isErrorCallback, callback]);

  const {
    request: checkMetadataFields,
    isLoading: isLoadingMetadata,
    isError: isErrorMetadata,
  } = useApi(SearchApi.searchItemCollection);
  React.useEffect(() => {
    const string = [value, method, externalId];
    const boolean = [key, trainId, sampleId];
    const itemSearchDocument = {
      filter: [
        ...string.map((name) => ({
          operation: 'OR',
          field: [{ name, value: [{ value: '*' }] }],
        })),
        ...boolean.map((name) => ({
          operation: 'OR',
          field: [{ name, value: [{ value: true }] }],
        })),
      ],
    };
    checkMetadataFields({ queryParams: { number: 1 }, itemSearchDocument });
  }, [checkMetadataFields]);

  const isError = isErrorMetadata || isErrorCollection || isErrorCallback;
  const isLoading = isLoadingMetadata || isLoadingCollection || isLoadingCallback;
  const isConfigured = !isLoading && !isError;

  return (
    <TrainingContext.Provider value={{ trainingId, callbackId, isConfigured, isLoading, isError }}>
      {children}
    </TrainingContext.Provider>
  );
};

export const useTraining = () => {
  const context = React.useContext(TrainingContext);
  if (context === undefined) {
    throw new Error('useDialogContext must be used within a DialogProvider');
  }
  return context;
};
