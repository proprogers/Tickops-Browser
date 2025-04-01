import { useState, useEffect } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';

export default function ErrorCard(props) {
  const [statusCode, setStatusCode] = useState();
  const [errorCode, setErrorCode] = useState();

  useEffect(() => {
    if (props.error.status > 0) {
      setStatusCode(props.error.status);
    } else {
      setErrorCode(props.error.status);
    }
  }, [props.error]);

  return (
    <Grid container justifyContent="center" alignItems="center">
      <Card elevation={0} id="error-card">
        <CardContent>
          <div className="text-center">
            <h2>Something went wrong</h2>
            <div className="error mx-auto" data-text={statusCode}>
              {statusCode}
            </div>
            <p className="lead text-gray-800">
              {props.error.message || props.page && !props.page.session && `Server isn't responding`}
            </p>
            <p className="text-gray-500">
              {props.error.statusText} {errorCode && `(${errorCode})`}
            </p>
          </div>
        </CardContent>
      </Card>
    </Grid>
  );
}
