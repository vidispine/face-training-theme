/* eslint-disable */
import React from 'react';
import clsx from 'clsx';
import ReactDOM from 'react-dom';
import { withStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Tooltip from '@material-ui/core/Tooltip';
import Camera from '@material-ui/icons/Face';

const grabFaceStyles = ({ palette }) => ({
  button: {
    // backgroundColor: `${palette.background.default} !important`,
    zIndex: 10,
    // position: 'absolute !important',
    // right: 56 * 2,
    height: '44px !important',
    cursor: 'pointer',
  },
});

const GrabFaceIconButton = ({ onClick, container, classes }) => {
  const [innerHtmlEmptied, setInnerHtmlEmptied] = React.useState(false);
  React.useEffect(() => {
    if (!innerHtmlEmptied) {
      container.innerHTML = '';
      container.title = 'Capture face';
      container.style.overflow = 'hidden';
      setInnerHtmlEmptied(true);
    }
  }, [innerHtmlEmptied]);
  if (!innerHtmlEmptied) return null;
  return ReactDOM.createPortal(
    <Box height={1} width={1} display="flex" alignItems="center" justifyContent="center">
      <Camera />
    </Box>,
    container,
  );
};

const GrabFaceButton = withStyles(grabFaceStyles)(({ screenshotRef, onClick, classes }) => {
  const [node, setNode] = React.useState(null);
  React.useEffect(() => {
    const getNode = () => {
      const { current } = screenshotRef;
      if (!current) setTimeout(getNode, 250);
      else setNode(document.querySelector('.vdt-screenshot-button'));
    };
    getNode();
    // eslint-disable-next-line
  }, []);
  if (!node) return null;
  return <GrabFaceIconButton container={node} classes={classes} />;
});

export default GrabFaceButton;
