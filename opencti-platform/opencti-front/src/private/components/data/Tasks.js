import React, { useContext } from 'react';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';
import Alert from '@mui/material/Alert';
import { useFormatter } from '../../../components/i18n';
import { QueryRenderer } from '../../../relay/environment';
import TasksList, { tasksListQuery } from './tasks/TasksList';
import Loader from '../../../components/Loader';
import { UserContext } from '../../../utils/hooks/useAuth';
import { TASK_MANAGER } from '../../../utils/platformModulesHelper';

const useStyles = makeStyles(() => ({
  container: {
    margin: 0,
  },
}));

const Tasks = () => {
  const { t } = useFormatter();
  const classes = useStyles();
  const { helper } = useContext(UserContext);
  const optionsInProgress = {
    count: 50,
    orderBy: 'created_at',
    orderMode: 'desc',
    filters: [{ key: 'completed', values: ['false'] }],
  };
  const optionsFinished = {
    count: 50,
    orderBy: 'created_at',
    orderMode: 'desc',
    filters: [{ key: 'completed', values: ['true'] }],
  };
  if (!helper.isTasksManagerEnable()) {
    return (
      <Alert severity="info">
        {t(helper.generateDisableMessage(TASK_MANAGER))}
      </Alert>
    );
  }
  return (
    <div className={classes.container}>
      <Typography variant="h4" gutterBottom={true}>
        {t('In progress tasks')}
      </Typography>
      <QueryRenderer
        query={tasksListQuery}
        variables={optionsInProgress}
        render={({ props }) => {
          if (props) {
            return <TasksList data={props} options={optionsInProgress} />;
          }
          return <Loader variant="inElement" />;
        }}
      />
      <Typography variant="h4" gutterBottom={true} style={{ marginTop: 35 }}>
        {t('Completed tasks')}
      </Typography>
      <QueryRenderer
        query={tasksListQuery}
        variables={optionsFinished}
        render={({ props }) => {
          if (props) {
            return <TasksList data={props} options={optionsFinished} />;
          }
          return <Loader variant="inElement" />;
        }}
      />
    </div>
  );
};

export default Tasks;
