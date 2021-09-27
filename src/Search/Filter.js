import React from 'react';
import { useTranslation } from 'react-i18next';
import debounce from 'lodash.debounce';
import { FilterCard } from '@vidispine/vdt-materialui';

const DEBOUNCE_TIMEOUT = 400;
export default function Filter({
  setSearchFilter: debounceSetSearchFilter,
  initialSearchFilter,
  itemListType = { facet: [] },
  filterFields = [],
}) {
  const { t } = useTranslation();
  const fields = filterFields.map(({ label, ...fieldProps }) => ({
    ...fieldProps,
    label: t(fieldProps.value, label),
  }));

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const setSearchFilter = React.useCallback(debounce(debounceSetSearchFilter, DEBOUNCE_TIMEOUT), [
    debounceSetSearchFilter,
  ]);

  return (
    <FilterCard
      itemListType={itemListType}
      onChange={setSearchFilter}
      fields={fields}
      initialSearchFilter={initialSearchFilter}
      CardProps={{ elevation: 0, square: true, variant: 'outlined' }}
      hideEmptyFilters
    />
  );
}
