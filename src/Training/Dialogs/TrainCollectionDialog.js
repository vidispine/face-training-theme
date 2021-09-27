import React from 'react';
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
  LinearProgress,
} from '@material-ui/core';
import { utils, vidinet as VidinetApi } from '@vidispine/vdt-api';

import { useTraining } from '../../Context';

const createAnalysis = ({ collectionId, resourceId, callbackId, ...params }) => {
  const { vFetch } = utils;
  const path = `/API/collection/${collectionId}/train`;
  const method = 'POST';
  const queryParams = { resourceId, callbackId };
  return vFetch({ path, method, queryParams, body: {}, ...params });
};

export function TrainCollectionDialog({ open, onClose, onSuccess, onError, resourceList = [] }) {
  const { callbackId, trainingId: collectionId } = useTraining();
  const [costEstimates, setCostEstimates] = React.useState();
  const timeoutSession = React.useRef();
  const [resourceId, setResourceId] = React.useState('');
  const handleChange = (event) => {
    setResourceId(event.target.value);
  };
  const onStartAnalyze = () =>
    createAnalysis({
      collectionId,
      analyzeJobDocument: {},
      queryParams: { resourceId, callbackId },
    })
      .then(onSuccess)
      .catch(onError);
  React.useEffect(() => {
    timeoutSession.current = {};
    Promise.all(
      resourceList.map(({ id }) =>
        createAnalysis({
          collectionId,
          analyzeJobDocument: {},
          queryParams: { resourceId: id, callbackId },
          costEstimate: true,
        }),
      ),
    )
      .then((estimateRequests) =>
        Promise.all(
          estimateRequests.map(({ data }) => {
            const { id: costEstimateId } = data;
            return new Promise((resolve, reject) => {
              const newPoll = () => {
                VidinetApi.getCostEstimate({ costEstimateId })
                  .then((response) => {
                    if (timeoutSession.current[costEstimateId] !== null) {
                      clearTimeout(timeoutSession.current[costEstimateId]);
                      delete timeoutSession.current[costEstimateId];
                    }
                    const { data: { state } = {} } = response;
                    if (state === 'FINISHED') resolve(response);
                    else {
                      timeoutSession.current[costEstimateId] = setTimeout(() => newPoll(), 1000);
                    }
                  })
                  .catch((error) => reject(error));
              };
              newPoll();
            });
          }),
        ),
      )
      .then((estimateResponses) => {
        const allEstimates = estimateResponses.reduce((serviceCosts, { data }) => {
          const { service: serviceList = [] } = data;
          const [service] = serviceList;
          const { cost, resource } = service;
          return { ...serviceCosts, [resource]: cost };
        }, {});
        setCostEstimates(allEstimates);
      })
      .catch(() => setCostEstimates({}));
    return () => {
      if (timeoutSession.current !== null) {
        Object.values(timeoutSession.current).forEach((timerId) => clearTimeout(timerId));
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Train collection</DialogTitle>
      <DialogContent dividers>
        {resourceList.length > 0 ? (
          <FormControl>
            <RadioGroup value={resourceId} onChange={handleChange}>
              {resourceList.map(({ id, vidinet }) => (
                <FormControlLabel
                  key={id}
                  value={id}
                  disabled={!costEstimates || costEstimates[id] === undefined}
                  control={<Radio />}
                  label={`${vidinet ? vidinet.name : id}${
                    costEstimates && costEstimates[id]
                      ? ` - $${costEstimates[id].value.toFixed(2)}`
                      : ''
                  }`}
                />
              ))}
            </RadioGroup>
          </FormControl>
        ) : (
          <Typography>No VCS resources available.</Typography>
        )}
      </DialogContent>
      <Box height={4} width="100%">
        {costEstimates === undefined && <LinearProgress variant="query" />}
      </Box>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button
          variant="contained"
          color="primary"
          onClick={onStartAnalyze}
          disabled={resourceId === ''}
        >
          Start
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default TrainCollectionDialog;
