import { useState, useEffect } from 'react';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Fade from '@mui/material/Fade';

const timeout = 1000;

export default function LoadingCardWrapper(props) {
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const jobId = setTimeout(() => setFade(!fade), timeout);
    return () => clearTimeout(jobId);
  }, [fade]);

  return (
    <Grid container id="loading-card-grid">
      <Card elevation={0} id="loading-card">
        <Fade in={fade} timeout={timeout}>
          {props.cardContent}
        </Fade>
      </Card>
    </Grid>
  );
}
