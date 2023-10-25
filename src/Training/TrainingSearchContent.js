/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable no-unused-vars */
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Card,
  CardHeader,
  CardMedia,
  CardContent,
  CardActions,
  Collapse,
  Avatar,
  IconButton,
  Typography,
  Grid,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Input,
} from '@material-ui/core';
import { red } from '@material-ui/core/colors';
import FavoriteIcon from '@material-ui/icons/Favorite';
import ShareIcon from '@material-ui/icons/Share';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import { useDropzone } from 'react-dropzone';

const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: 345,
  },
  media: {
    height: 0,
    paddingTop: '100%', // 16:9
  },
  avatar: {
    backgroundColor: theme.palette.secondary.main,
  },
  input: {
    display: 'none',
  },
  dropzone: {
    border: '2px dashed gray',
    padding: '20px',
    textAlign: 'center',
    width: '300px',
    height: '150px',
  },
  fileInput: {
    display: 'none',
  },
}));

const DeepVaCard = ({ title, subheader, image, description, imageCount, classId, datasetId }) => {
  const classes = useStyles();

  const [deepData, setData] = React.useState(undefined);

  const [expanded, setExpanded] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [selectedFiles, setSelectedFiles] = React.useState([]);

  const onDrop = React.useCallback((acceptedFiles) => {
    setSelectedFiles(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  console.log(deepData);
  async function fetchImage(apiKey, imgId) {
    const url = `/api/v2/storage/${imgId}/file/`;

    const options = {
      method: 'GET',
      headers: {
        Authorization: apiKey,
      },
    };

    try {
      const response = await fetch(url, options);
      if (response.ok) {
        const blob = await response.blob();

        // Create an object URL for the blob
        const objectURL = URL.createObjectURL(blob);

        return objectURL;
      }
      throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
    } catch (error) {
      console.error('An error occurred:', error);
      throw error;
    }
  }

  const apiKey = 'Key OSgGHLZ0WU31A1o119djd4rpVPFz8JWb55HolGKHdUAtx0flH1';
  function removeStoragePrefix(str) {
    const prefix = 'storage://';
    if (str.startsWith(prefix)) {
      return str.slice(prefix.length);
    }
    return str;
  }

  const imgId = removeStoragePrefix(image);

  React.useEffect(() => {
    fetchImage(apiKey, imgId)
      .then((r) => {
        // console.log(imgURL);
        setData(r);
        // console.log(r);
      })
      .catch((error) => {
        console.error('An error occurred:', error);
      });
  }, [imgId]);

  const handleUploadToDeepVA = async () => {
    const folder = `/TrainingDataAPIUpload/MediaPortalDemo/face/`;
    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append('file', file);
      formData.append('folder', folder);
    });

    try {
      const response = await fetch(`/api/v2/storage/`, {
        method: 'POST',
        headers: {
          Authorization: 'Key OSgGHLZ0WU31A1o119djd4rpVPFz8JWb55HolGKHdUAtx0flH1',
        },
        body: formData,
      });

      if (response.ok) {
        const jsonResponse = await response.json();
        try {
          const imgResponse = await fetch(
            `/api/v1/datasets/${datasetId}/classes/${classId}/images/`,
            {
              method: 'POST',
              headers: {
                Authorization: 'Key OSgGHLZ0WU31A1o119djd4rpVPFz8JWb55HolGKHdUAtx0flH1',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                file_uri: jsonResponse.url,
              }),
            },
          );

          if (imgResponse.ok) {
            const resp = await response.json();
            console.log('Successfully uploaded:', resp);
          } else {
            console.log('Failed to upload:', response.status, response.statusText);
          }
        } catch (error) {
          console.error('Error uploading files:', error);
        }
      } else {
        console.log('Failed to upload:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error uploading files:', error);
    }
  };
  const handleClose = () => {
    setOpen(false);
  };

  const handleUpload = () => {
    handleUploadToDeepVA(datasetId, classId); // Call the upload function when closing the dialog
    setOpen(false);
  };
  return (
    <Card className={classes.root}>
      <CardHeader
        // avatar={
        //   <Avatar aria-label="recipe" className={classes.avatar}>
        //     VA
        //   </Avatar>
        // }
        action={
          <IconButton aria-label="upload" onClick={handleClickOpen}>
            <CloudUploadIcon />
          </IconButton>
        }
        title={title}
        subheader={subheader}
      />
      <CardMedia
        className={classes.media}
        image={deepData} // Replace this with actual image URL if needed
        title="Placeholder Image"
      />
      <CardContent>
        <Typography variant="body2" color="textSecondary" component="p">
          Number of images: {imageCount}
        </Typography>
        <Typography variant="body2" color="textSecondary" component="p">
          {description || 'No additional notes'}
        </Typography>
      </CardContent>

      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Upload Image</DialogTitle>
        <DialogContent>
          <div {...getRootProps()} className={classes.dropzone}>
            <input {...getInputProps()} />
            {isDragActive ? (
              <p>Drop the files here...</p>
            ) : (
              <p>Drag and drop some files here, or click to select files</p>
            )}
          </div>
          {selectedFiles.length > 0 && (
            <div>
              <h5>Selected Files:</h5>
              <ul>
                {selectedFiles.map((file, index) => (
                  <li key={file.name}>{file.name}</li>
                ))}
              </ul>
            </div>
          )}
          <input
            accept="image/*"
            className={classes.fileInput}
            id="contained-button-file"
            multiple
            type="file"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleUpload} color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

const CardGrid = ({ data, datasetId }) => {
  return (
    <Grid container spacing={3}>
      {data.data.map((item) => (
        <Grid item xs={6} sm={4} md={3} key={item.id}>
          <DeepVaCard
            title={item.label}
            subheader={item.time_created}
            image={item.preview_image.file_uri} // Replace this with actual image URL if needed
            description={item.notes}
            imageCount={item.number_of_images}
            classId={item.id}
            datasetId={datasetId}
          />
        </Grid>
      ))}
    </Grid>
  );
};

const TrainingSearchContent = ({ data, datasetId }) => {
  console.log(data);
  return (
    <div>
      <CardGrid data={data} datasetId={datasetId} />
    </div>
  );
};

export default TrainingSearchContent;
