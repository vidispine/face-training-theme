/* eslint react/jsx-props-no-spreading: "off" */
import React from 'react';
import { Link } from 'react-router-dom';
import { formatTimeCodeText } from '@vidispine/vdt-js';

const ItemLink = (Component) => (props) => {
  const { innerProps = {} } = props;
  const { itemId, itemType: { start } = {} } = innerProps;
  let to = `/item/${itemId}`;
  if (start && start !== '-INF') to += `?t=${formatTimeCodeText(start).toSeconds()}`;
  return (
    <Link to={to}>
      <Component {...props} />
    </Link>
  );
};

export default ItemLink;
