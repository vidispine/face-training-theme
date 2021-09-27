import React from 'react';
import { useHistory } from 'react-router-dom';

import { CircularProgress } from '@material-ui/core';

import {
  useSearch,
  useSearchItem,
  useQueryInitialState,
  useUpdateQueryState,
} from '@vidispine/vdt-react';
import {
  CheckboxGroupField,
  ExpandedFormControlLabel,
  SelectField,
  SliderField,
  TagField,
  TextField,
} from '@vidispine/vdt-materialui';

import SearchItemForm from './SearchItemForm';
import SearchItemGrid from './SearchItemGrid';
import SearchItemTable from './SearchItemTable';
import SearchInFilters from './SearchInFilters';
import { PREFIX_STRING, SUFFIX_STRING, TRAINING_METADATA_KEY } from '../const';

import { useTraining } from '../Context';

const filterFields = [
  {
    value: 'title',
    component: TextField,
  },
  {
    value: 'mediaType',
    component: CheckboxGroupField,
    FormControlLabelComponent: ExpandedFormControlLabel,
    FacetProps: {
      count: true,
      exclude: ['mediaType'], // there are no items that have both media type video and any of the other media types
    },
    parseOptions: (facet = {}) => {
      const newOpt = Object.keys(facet).map((value) => ({
        value,
        label: `${value} (${facet[value]})`,
      }));
      newOpt.unshift({ value: '*', label: 'Any Media Type ' });
      return newOpt;
    },
    selectAllValue: '*',
    FormLabelComponent: SearchInFilters,
  },
  {
    value: 'originalVideoCodec',
    component: SelectField,
    FacetProps: {
      count: true,
    },
  },
  {
    value: 'originalAudioCodec',
    component: SelectField,
    FacetProps: {
      count: true,
    },
  },
  {
    value: 'originalHeight',
    showMarks: false,
    component: SliderField,
    isRange: true,
    exclude: true,
    FacetProps: {
      count: true,
    },
  },
  {
    value: 'mimeType',
    label: 'Mime Types',
    component: TagField,
    parseOptions: (facet = {}) => Object.keys(facet).map((value) => ({ value, label: value })),
    freeSolo: true,
    FacetProps: {
      count: true,
    },
    AutocompleteProps: {
      multiple: true,
    },
  },
];

const defaultInitialState = {
  itemSearchDocument: {
    intervals: 'all',
    highlight: {
      matchingOnly: false,
      prefix: PREFIX_STRING,
      suffix: SUFFIX_STRING,
      field: ['title'],
    },
    facet: filterFields
      .filter(({ FacetProps = {} }) => FacetProps.count === true)
      .map(({ value, exclude, FacetProps: { ...props } = {} }) => {
        const excludeFilter = exclude
          ? { exclude: Array.isArray(exclude) ? exclude : [value] }
          : {};
        return {
          field: value,
          name: value,
          ...excludeFilter,
          ...props,
        };
      }),
    filter: [],
    suggestion: {
      maximumSuggestions: 3,
      accuracy: 0.7,
    },
  },
  queryParams: {
    field: [
      'title',
      'originalFilename',
      'created',
      'user',
      'durationSeconds',
      'mimeType',
      'itemId',
    ],
    content: ['metadata', 'thumbnail'],
    'noauth-url': true,
  },
};

const trainingOperation = {
  operation: 'NOT',
  field: [
    {
      name: TRAINING_METADATA_KEY,
      value: [
        {
          value: true,
        },
      ],
    },
  ],
};

const GRID_VIEW = 'GRID_VIEW';
const ROW_VIEW = 'ROW_VIEW';
const DEFAULT_VIEW = GRID_VIEW;

function SearchItem({ isConfigured }) {
  const history = useHistory();
  const { queryInitialState } = useQueryInitialState({
    history,
    defaultState: {
      ...defaultInitialState,
      ...(isConfigured && {
        itemSearchDocument: {
          ...defaultInitialState.itemSearchDocument,
          operator: trainingOperation,
        },
      }),
    },
  });
  const {
    state,
    setSearchText,
    setItemSearchDocument,
    onChangeRowsPerPage,
    onChangePage,
    onChangeSort,
    setSearchFilter,
  } = useSearch(queryInitialState);
  const { matrixParams, queryParams, itemSearchDocument, page, rowsPerPage } = state;
  useUpdateQueryState({ history, state });
  const { itemListType, isLoading, onRefresh } = useSearchItem({
    itemSearchDocument,
    queryParams,
    matrixParams,
  });

  const [layout, setLayout] = React.useState(DEFAULT_VIEW);
  const onChangeViewLayout = (e, newLayout) => setLayout(newLayout);
  let ViewComponent;
  switch (layout) {
    case GRID_VIEW:
      ViewComponent = SearchItemGrid;
      break;
    case ROW_VIEW:
      ViewComponent = SearchItemTable;
      break;
    default:
      ViewComponent = SearchItemGrid;
      break;
  }

  return (
    <SearchItemForm
      itemSearchDocument={itemSearchDocument}
      itemListType={itemListType}
      setSearchText={setSearchText}
      isLoading={isLoading}
      onChangeSort={onChangeSort}
      onChangePage={onChangePage}
      onChangeRowsPerPage={onChangeRowsPerPage}
      page={page}
      rowsPerPage={rowsPerPage}
      onChangeViewLayout={onChangeViewLayout}
      layout={layout}
      setItemSearchDocument={setItemSearchDocument}
      setSearchFilter={setSearchFilter}
      filterFields={filterFields}
      withBin
      onRefresh={onRefresh}
    >
      <ViewComponent itemListType={itemListType} />
    </SearchItemForm>
  );
}

const SearchItemWrapper = () => {
  const { isConfigured, isLoading } = useTraining();
  if (isLoading) return <CircularProgress />;
  return <SearchItem isConfigured={isConfigured} />;
};

export default SearchItemWrapper;
