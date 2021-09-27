export const PREVIEW_SHAPE_TAG = '__mp4';

export const JOB_PRIORITIES = ['LOWEST', 'LOW', 'MEDIUM', 'HIGH', 'HIGHEST', 'IMMEDIATE'];
export const JOB_STATES = [
  'READY',
  'STARTED',
  'VIDINET_JOB',
  'FINISHED',
  'FINISHED_WARNING',
  'WAITING',
  'ABORT_PENDING',
  'ABORTED',
  'FAILED_TOTAL',
];

export const BIN_LOCAL_STORAGE_KEY = 'bin';

export const VIDISPINE_URL = process.env.REACT_APP_VIDISPINE_URL;
export const APP_TITLE = process.env.REACT_APP_APP_TITLE;

export const PREFIX_STRING = '^^PREFIX^^';
export const SUFFIX_STRING = '^^SUFFIX^^';

export const TRAINING_METADATA_KEY = 'vcs_face_isTrainingMaterial';
export const TRAINING_METADATA_VALUE = 'vcs_face_value';
export const TRAINING_METADATA_METHOD = 'vcs_face_method';
export const TRAINING_METADATA_EXTERNALID = 'vcs_face_externalId';
export const TRAINING_COLLECTION_ID = 'vcs_face_isTrainingCollection';
export const SAMPLE_COLLECTION_ID = 'vcs_face_isSampleCollection';

export const ANALYSIS_MODEL_GROUP = 'adu_face_DeepVAKeyframeAnalyzer';
export const ANALYSIS_MODEL_SUBGROUP = 'adu_av_analyzedValue';
export const ANALYSIS_ID_FIELD = 'adu_valueId';
export const ANALYSIS_VALUE_FIELD = 'adu_value';
export const ANALYSIS_MODEL_ID_FIELD = 'adu_av_valueId';
export const ANALYSIS_MODEL_VALUE_FIELD = 'adu_av_value';
export const ANALYSIS_MODEL_CONFIDENCE_FIELD = 'adu_av_confidence';
