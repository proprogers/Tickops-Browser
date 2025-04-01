import LoadingCardWrapper from './loading-card-wrapper.jsx';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

export default function AutoCartLoadingCard(props) {
  const cardContent = (
    <CardContent style={{ minHeight: '300px' }}>
      <Typography variant="h4">
        Carting your tickets ...
      </Typography>
    </CardContent>
  );

  return (
    <LoadingCardWrapper cardContent={cardContent} {...props}/>
  );
}
