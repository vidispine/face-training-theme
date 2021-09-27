import React from 'react';
import { useTranslation } from 'react-i18next';
import { withStyles } from '@material-ui/core/styles';
import debounce from 'lodash.debounce';
import Hidden from '@material-ui/core/Hidden';
import Grid from '@material-ui/core/Grid';
import {
  SearchInput,
  Sort,
  Pagination,
  SearchSuggestions,
  LayoutButtonGroup,
  SpellCheck,
} from '@vidispine/vdt-materialui';
import { useAutocomplete } from '@vidispine/vdt-react';

import Filter from './Filter';
import CustomBinList from '../Bin/CustomBinList';

const AUTOCOMPLETE_DEBOUNCE_TIMEOUT = 200;

const defaultSortOptions = [
  { label: 'Created by', value: 'created' },
  { label: 'Title', value: 'title' },
];

const styles = (theme) => ({
  root: {
    height: '95%',
    width: '100%',
  },
  resultContainer: { height: 'inherit', width: 'inherit', display: 'flex' },
  filterContainer: { minWidth: 220, marginBottom: theme.spacing(1) },
  leftResultContainer: { flexDirection: 'column', marginRight: theme.spacing(2) },
  rightResultContainer: { flexGrow: 1, minWidth: '0%' },
  QueryBuilderContainer: {
    marginBottom: theme.spacing(1),
  },
});

function SearchItemForm({
  classes,
  children,
  setSearchText,
  isLoading,
  sortOptions = defaultSortOptions,
  onChangeSort,
  onChangePage,
  onChangeRowsPerPage,
  page,
  rowsPerPage,
  itemSearchDocument,
  layout,
  onChangeViewLayout,
  itemListType,
  setSearchFilter = () => null,
  filterFields,
  withBin = false,
  BinProps = {},
  onRefresh,
}) {
  const searchInputRef = React.useRef(null);

  const initialSearchText = React.useMemo(
    () =>
      (itemSearchDocument.text &&
        itemSearchDocument.text.length > 0 &&
        itemSearchDocument.text[0].value) ||
      '',
    [itemSearchDocument.text],
  );
  const { sort: initialSort } = itemSearchDocument;
  const { t } = useTranslation();
  const { suggestions, setAutocompleteText } = useAutocomplete();
  const debouncedSetAutocompleteText = React.useRef(
    debounce(setAutocompleteText, AUTOCOMPLETE_DEBOUNCE_TIMEOUT),
  ).current;
  const minExpectedCount = isLoading ? page * rowsPerPage + 1 : 0;
  const compatibleInitialSort = React.useMemo(
    () =>
      initialSort && initialSort.length
        ? {
            option: sortOptions.find((o) => o.value === initialSort[0].field),
            direction: initialSort[0].order,
          }
        : undefined,
    [initialSort, sortOptions],
  );
  const onClickSuggestion = React.useCallback(
    (s) => {
      setSearchText(s);
      searchInputRef.current.value = s;
    },
    [searchInputRef, setSearchText],
  );
  const { suggestion = [], hits: count = 0 } = itemListType;
  const { text: [{ value: searchText } = {}] = [] } = itemSearchDocument;
  const [savedSearchId] = React.useState();

  const debouncedSetSearchFilter = React.useRef(
    debounce(setSearchFilter, AUTOCOMPLETE_DEBOUNCE_TIMEOUT),
  ).current;

  const onSearchButtonClick = () => {
    if (!searchInputRef) return;
    const inputValue = searchInputRef.current.value;
    if (!inputValue || searchText === inputValue) {
      onRefresh();
    } else {
      setSearchText(inputValue);
    }
  };

  return (
    <div className={classes.root}>
      <Grid container alignItems="center" justifyContent="flex-start">
        <Grid item sm={8} md={4} lg={6}>
          <Grid container wrap="nowrap">
            <SearchInput
              defaultValue={initialSearchText}
              onSubmit={setSearchText}
              submitting={isLoading}
              searchPlaceholder={t('searchItems')}
              onChange={debouncedSetAutocompleteText}
              SuggestionsComponent={SearchSuggestions}
              suggestions={suggestions}
              inputRef={searchInputRef}
              ButtonProps={{
                onClick: onSearchButtonClick,
                type: 'button',
              }}
            />
          </Grid>
        </Grid>
        <Grid item sm={4} md={8} lg={6}>
          <Grid container alignItems="center" justifyContent="flex-end">
            {sortOptions && (
              <Grid item>
                <Hidden smDown>
                  <Sort
                    options={sortOptions.map((o) => ({
                      label: t(o.label),
                      value: o.value,
                    }))}
                    initialSort={compatibleInitialSort}
                    onChange={onChangeSort}
                  />
                </Hidden>
              </Grid>
            )}
            {page !== undefined && (
              <Grid item>
                <Hidden smDown>
                  <Pagination
                    onChangePage={onChangePage}
                    onChangeRowsPerPage={onChangeRowsPerPage}
                    count={count || minExpectedCount}
                    page={page}
                    rowsPerPage={rowsPerPage}
                  />
                </Hidden>
              </Grid>
            )}
            {layout !== undefined && (
              <Grid item>
                <LayoutButtonGroup viewLayout={layout} onChangeViewLayout={onChangeViewLayout} />
              </Grid>
            )}
          </Grid>
        </Grid>
      </Grid>
      <div className={classes.resultContainer}>
        {(withBin || filterFields) && (
          <Hidden smDown>
            <div className={classes.leftResultContainer}>
              {filterFields && (
                <div className={classes.filterContainer}>
                  <Filter
                    key={savedSearchId}
                    setSearchFilter={debouncedSetSearchFilter}
                    initialSearchFilter={itemSearchDocument.filter}
                    isLoading={isLoading}
                    itemListType={itemListType}
                    filterFields={filterFields}
                  />
                </div>
              )}
              {withBin && (
                <CustomBinList
                  // eslint-disable-next-line react/jsx-props-no-spreading
                  {...BinProps}
                />
              )}
            </div>
          </Hidden>
        )}
        <div className={classes.rightResultContainer}>
          {suggestion && suggestion.length > 0 ? (
            <SpellCheck
              searchText={searchText}
              suggestions={suggestion}
              onClick={onClickSuggestion}
            />
          ) : null}
          {children}
        </div>
      </div>
    </div>
  );
}

export default withStyles(styles)(SearchItemForm);
