import LoadingCardWrapper from './loading-card-wrapper.jsx';
import CardContent from '@mui/material/CardContent';
import logo from '../../../img/app-icon.png'; 
export default function SessionLoadingCard(props) {
  const cardContent = (
    <CardContent style={{ minHeight: '300px' }}>
      <div className="text-center">
      <img className="lead" src={logo} style={{float: 'center', left: '48%', width: 80, position: 'absolute'}} alt="Logo" />
        {/* {props.sessionName &&
        <h2 className="lead">
          &quot;{props.sessionName}&quot;...
        </h2>} */}
      </div>
    </CardContent>
  );

  return <LoadingCardWrapper cardContent={cardContent}/>;
}

