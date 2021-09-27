import React from 'react';
import { resource as ResourceApi } from '@vidispine/vdt-api';

export const ResourceContext = React.createContext({
  resourceType: undefined,
  resourceListDocument: undefined,
});

export const ResourceProvider = ({ children, resourceType }) => {
  const [resourceListDocument, setResourceListDocument] = React.useState();
  const onListResourceType = () => {
    ResourceApi.listResourceType({ resourceType }).then(({ data }) =>
      setResourceListDocument(data),
    );
  };
  React.useEffect(onListResourceType, [resourceType]);
  return (
    <ResourceContext.Provider
      value={{
        resourceListDocument,
        resourceType,
      }}
    >
      {children}
    </ResourceContext.Provider>
  );
};

export function useCognitiveResources() {
  const context = React.useContext(ResourceContext);
  if (context === undefined) {
    throw new Error('getCognitiveResources must be used within a ResourceProvider');
  }
  const { resourceListDocument: { resource: resourceList = [] } = {} } = context;
  const resourceFilter = ({ vidinet: { state, type } = {} }) =>
    state === 'ONLINE' && type === 'COGNITIVE_SERVICE';
  const resource = resourceList.filter(resourceFilter);
  return { resource };
}

export function useTranscoderResource() {
  const context = React.useContext(ResourceContext);
  if (context === undefined) {
    throw new Error('useTranscoderResource must be used within a ResourceProvider');
  }
  const { resourceListDocument: { resource: resourceList = [] } = {} } = context;
  const resourceFilter = ({ vidinet: { type: resourceType } = {} }) =>
    resourceType === 'TRANSCODER';
  const [resource] = resourceList.filter(resourceFilter);
  return { resource };
}
