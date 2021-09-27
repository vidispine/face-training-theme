import { useApi } from '@vidispine/vdt-react';
import useDeepCompareEffect from 'use-deep-compare-effect';
import { collection as CollectionApi } from '@vidispine/vdt-api';

export default function useSearchItem({ itemSearchDocument, queryParams, matrixParams }) {
  const { request, data: collectionListType = {}, isLoading, isError } = useApi(
    CollectionApi.searchCollection,
  );
  const onRefresh = () => request({ itemSearchDocument, queryParams, matrixParams });
  useDeepCompareEffect(() => {
    onRefresh();
  }, [itemSearchDocument, queryParams, matrixParams]);
  return {
    collectionListType,
    isLoading,
    isError,
    onRefresh,
  };
}
