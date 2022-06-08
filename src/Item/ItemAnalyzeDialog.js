import React from 'react';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import Typography from '@material-ui/core/Typography';
import LinearProgress from '@material-ui/core/LinearProgress';
import Divider from '@material-ui/core/Divider';
import Box from '@material-ui/core/Box';
import { item as ItemApi, vidinet as VidinetApi } from '@vidispine/vdt-api';

import { useCognitiveResources, useTraining } from '../Context';

export const DIALOG_ID = 'ITEM_ANALYZE_DIALOG';

export function ItemAnalyzeDialogComponent({ open, onClose, itemId }) {
  const { callbackId } = useTraining();
  const { resource: resourceList = [] } = useCognitiveResources();
  const [costEstimates, setCostEstimates] = React.useState();
  const timeoutSession = React.useRef();
  const [resourceId, setResourceId] = React.useState('');
  const handleChange = (event) => {
    setResourceId(event.target.value);
  };
  const onStartAnalyze = () =>
    ItemApi.createItemAnalyze({
      itemId,
      analyzeJobDocument: {},
      queryParams: {
        resourceId,
        jobmetadata: [{ key: 'cognitive_service_KeyframeInterval', value: 2 }],
        ...(callbackId && { callbackId }),
      },
    }).then(() => onClose());
  React.useEffect(() => {
    timeoutSession.current = {};
    Promise.all(
      resourceList.map(({ id }) =>
        ItemApi.createItemAnalyze({
          itemId,
          analyzeJobDocument: {},
          queryParams: {
            resourceId: id,
            jobmetadata: [{ key: 'cognitive_service_KeyframeInterval', value: 2 }],
            ...(callbackId && { callbackId }),
          },
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
  }, [itemId]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Analyze</DialogTitle>
      <Divider />
      <DialogContent>
        {resourceList.length > 0 ? (
          <FormControl>
            <FormLabel>Choose Cognitive Service</FormLabel>
            <RadioGroup value={resourceId} onChange={handleChange}>
              {resourceList.map(({ id, vidinet }) => (
                <FormControlLabel
                  key={id}
                  value={id}
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
        {costEstimates === undefined ? <LinearProgress variant="query" /> : <Divider />}
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

export default ItemAnalyzeDialogComponent;
