import LoadingCardWrapper from './loading-card-wrapper.jsx';
import CardContent from '@mui/material/CardContent';

export default function ErrorFixedCard(props) {
  const cardContent = (
    <CardContent style={{ minHeight: '300px' }}>
      <div className="text-center">
        <h2>{`Restoring the connection`}</h2>
      </div>
    </CardContent>
  );

  return <LoadingCardWrapper cardContent={cardContent}/>;
}
