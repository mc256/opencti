import React, { useState } from 'react';
import { Field, Form, Formik } from 'formik';
import Drawer from '@mui/material/Drawer';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Fab from '@mui/material/Fab';
import { Add, Close } from '@mui/icons-material';
import { assoc, pipe, pluck } from 'ramda';
import * as Yup from 'yup';
import { graphql } from 'react-relay';
import makeStyles from '@mui/styles/makeStyles';
import { useFormatter } from '../../../../components/i18n';
import { commitMutation, handleErrorInForm } from '../../../../relay/environment';
import TextField from '../../../../components/TextField';
import CreatedByField from '../../common/form/CreatedByField';
import ObjectLabelField from '../../common/form/ObjectLabelField';
import ObjectMarkingField from '../../common/form/ObjectMarkingField';
import MarkDownField from '../../../../components/MarkDownField';
import { ExternalReferencesField } from '../../common/form/ExternalReferencesField';
import { fieldSpacingContainerStyle } from '../../../../utils/field';
import { useSchemaCreationValidation } from '../../../../utils/hooks/useEntitySettings';
import { insertNode } from '../../../../utils/store';

const useStyles = makeStyles((theme) => ({
  drawerPaper: {
    minHeight: '100vh',
    width: '50%',
    position: 'fixed',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    padding: 0,
  },
  dialogActions: {
    padding: '0 17px 20px 0',
  },
  createButton: {
    position: 'fixed',
    bottom: 30,
    right: 30,
  },
  createButtonContextual: {
    position: 'fixed',
    bottom: 30,
    right: 30,
    zIndex: 2000,
  },
  buttons: {
    marginTop: 20,
    textAlign: 'right',
  },
  button: {
    marginLeft: theme.spacing(2),
  },
  header: {
    backgroundColor: theme.palette.background.nav,
    padding: '20px 20px 20px 60px',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    left: 5,
    color: 'inherit',
  },
  importButton: {
    position: 'absolute',
    top: 15,
    right: 20,
  },
  container: {
    padding: '10px 20px 20px 20px',
  },
}));

const courseOfActionMutation = graphql`
  mutation CourseOfActionCreationMutation($input: CourseOfActionAddInput!) {
    courseOfActionAdd(input: $input) {
        id
        name
        description
        entity_type
        ...CourseOfActionLine_node
    }
  }
`;

export const CourseOfActionCreationForm = ({ updater, onReset, inputValue, onCompleted,
  defaultCreatedBy, defaultMarkingDefinitions }) => {
  const classes = useStyles();
  const { t } = useFormatter();
  const basicShape = {
    name: Yup.string().min(2).required(t('This field is required')),
    description: Yup.string().nullable(),
  };
  const courseOfActionValidator = useSchemaCreationValidation('Course-Of-Action', basicShape);
  const onSubmit = (values, { setSubmitting, setErrors, resetForm }) => {
    const finalValues = pipe(
      assoc('createdBy', values.createdBy?.value),
      assoc('objectMarking', pluck('value', values.objectMarking)),
      assoc('objectLabel', pluck('value', values.objectLabel)),
      assoc('externalReferences', pluck('value', values.externalReferences)),
    )(values);
    commitMutation({
      mutation: courseOfActionMutation,
      variables: {
        input: finalValues,
      },
      updater: (store) => {
        if (updater) {
          updater(store, 'courseOfActionAdd');
        }
      },
      onError: (error) => {
        handleErrorInForm(error, setErrors);
        setSubmitting(false);
      },
      setSubmitting,
      onCompleted: () => {
        setSubmitting(false);
        resetForm();
        if (onCompleted) {
          onCompleted();
        }
      },
    });
  };

  return <Formik
        initialValues={{
          name: inputValue ?? '',
          description: '',
          createdBy: defaultCreatedBy ?? '',
          objectMarking: defaultMarkingDefinitions ?? [],
          objectLabel: [],
          externalReferences: [],
        }}
        validationSchema={courseOfActionValidator}
        onSubmit={onSubmit}
        onReset={onReset}>
        {({
          submitForm,
          handleReset,
          isSubmitting,
          setFieldValue,
          values,
        }) => (
            <Form style={{ margin: '20px 0 20px 0' }}>
                <Field
                    component={TextField}
                    variant="standard"
                    name="name"
                    label={t('Name')}
                    fullWidth={true}
                    detectDuplicate={['Course-Of-Action']}
                />
                <Field
                    component={MarkDownField}
                    name="description"
                    label={t('Description')}
                    fullWidth={true}
                    multiline={true}
                    rows="4"
                    style={{ marginTop: 20 }}
                />
                <CreatedByField
                    name="createdBy"
                    style={fieldSpacingContainerStyle}
                    setFieldValue={setFieldValue}
                />
                <ObjectLabelField
                    name="objectLabel"
                    style={fieldSpacingContainerStyle}
                    setFieldValue={setFieldValue}
                    values={values.objectLabel}
                />
                <ObjectMarkingField
                    name="objectMarking"
                    style={fieldSpacingContainerStyle}
                />
                <ExternalReferencesField
                    name="externalReferences"
                    style={fieldSpacingContainerStyle}
                    setFieldValue={setFieldValue}
                    values={values.externalReferences}
                />
                <div className={classes.buttons}>
                    <Button
                        variant="contained"
                        onClick={handleReset}
                        disabled={isSubmitting}
                        classes={{ root: classes.button }}
                    >
                        {t('Cancel')}
                    </Button>
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={submitForm}
                        disabled={isSubmitting}
                        classes={{ root: classes.button }}
                    >
                        {t('Create')}
                    </Button>
                </div>
            </Form>
        )}
    </Formik>;
};

const CourseOfActionCreation = ({ paginationOptions, contextual, display, inputValue }) => {
  const classes = useStyles();
  const { t } = useFormatter();
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const updater = (store) => insertNode(
    store,
    'Pagination_coursesOfAction',
    paginationOptions,
    'courseOfActionAdd',
  );

  const renderClassic = () => {
    return (
      <div>
        <Fab onClick={handleOpen}
          color="secondary"
          aria-label="Add"
          className={classes.createButton}
        >
          <Add />
        </Fab>
        <Drawer open={open}
          anchor="right" elevation={1}
          sx={{ zIndex: 1202 }}
          classes={{ paper: classes.drawerPaper }}
          onClose={handleClose}>
          <div className={classes.header}>
            <IconButton
              aria-label="Close"
              className={classes.closeButton}
              onClick={handleClose}
              size="large"
              color="primary"
            >
              <Close fontSize="small" color="primary" />
            </IconButton>
            <Typography variant="h6">
              {t('Create a course of action')}
            </Typography>
          </div>
          <div className={classes.container}>
              <CourseOfActionCreationForm inputValue={inputValue} updater={updater}
                                     onCompleted={handleClose} onReset={handleClose}/>
          </div>
        </Drawer>
      </div>
    );
  };

  const renderContextual = () => {
    return (
      <div style={{ display: display ? 'block' : 'none' }}>
        <Fab onClick={handleOpen}
          color="secondary" aria-label="Add"
          className={classes.createButtonContextual}>
          <Add />
        </Fab>
        <Dialog open={open} onClose={handleClose} PaperProps={{ elevation: 1 }}>
            <DialogTitle>{t('Create a course of action')}</DialogTitle>
            <DialogContent>
                <CourseOfActionCreationForm inputValue={inputValue} updater={updater}
                                       onCompleted={handleClose} onReset={handleClose}/>
            </DialogContent>
        </Dialog>
      </div>
    );
  };

  if (contextual) {
    return renderContextual();
  }
  return renderClassic();
};

export default CourseOfActionCreation;
