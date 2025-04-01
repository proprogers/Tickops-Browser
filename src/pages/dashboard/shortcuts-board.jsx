/* global window */
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

export default function ShortcutsBoard() {
  const aStyle = window.currentSessionData ? null : {
    // pointerEvents: 'none',
    // color: '#858796'
  };

  const list = [{
    text: 'Ticketmaster',
    url: 'https://www.ticketmaster.com',
  }, {
    text: 'My Orders',
    url: 'https://my.ticketmaster.com/orders',
    style: { marginLeft: '30px' }
  }, {
    text: 'AXS',
    url: 'https://www.axs.com',
  }, {
    text: 'Eventbrite',
    url: 'https://www.eventbrite.com',
  }, {
    text: 'Ticketweb',
    url: 'https://www.ticketweb.com',
  }, {
    text: 'Etix',
    url: 'https://www.etix.com',
  }, {
    text: 'Front Gate Tickets',
    url: 'https://www.frontgatetickets.com',
  }, {
    text: 'See Tickets',
    url: 'https://www.seetickets.us',
  }];

  return (
    <Card style={{ marginBottom: '20px' }} className="card">
      <CardContent style={{ margin: '4px 10px' }} className="card-body">
        <Typography style={{ fontWeight: 'bold' }} variant="h7">
          Shortcuts
        </Typography>
        <div className="my-4 text-left small">
          {list.map(({ text, url, style = {} }) => {
            return (
              <h5 style={{ color: "grey", ...style }} key={text}>
                • <a style={aStyle} href={url}>{text}</a>
              </h5>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
