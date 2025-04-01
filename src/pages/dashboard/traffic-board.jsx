import { useStore as useUserStore } from '@/common/components/user-store';
import FiberManualRecord from '@mui/icons-material/FiberManualRecord';
import { Doughnut } from 'react-chartjs-2';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

const chartOptions = {
  maintainAspectRatio: false,
  tooltips: {
    backgroundColor: 'rgb(255,255,255)',
    bodyFontColor: '#858796',
    borderColor: '#dddfeb',
    borderWidth: 1,
    xPadding: 15,
    yPadding: 15,
    displayColors: false,
    caretPadding: 10,
  },
  legend: { display: false },
  cutoutPercentage: 80,
};
const chartData = {
  labels: ['Consumed', 'Available'],
  datasets: [{
    data: [0, 0],
    backgroundColor: ['#4e73df', '#1cc88a'],
    hoverBackgroundColor: ['#2e59d9', '#17a673'],
    hoverBorderColor: 'rgba(234, 236, 244, 1)',
  }]
};

export default function TrafficBoard() {
  const { traffic } = useUserStore(['traffic']);
  console.log(`traffic: ${JSON.stringify(traffic)}`);
  const consumed = ((traffic.usedBytes || 0) / 1000 / 1000).toFixed(2);
  const consumed_gib = ((traffic.usedBytes || 0) / 1000 / 1000/1000).toFixed(2);
  const limit = ((traffic.limitBytes || 0) / 1000 / 1000/1000).toFixed(2);

  let available = Math.floor((traffic.limitBytes / 1e9) * 100) / 100;

  console.log(`consumed_gib: ${consumed_gib}`)
  console.log(`available: ${available}`)
  chartData.datasets[0].data = [consumed_gib, available];

  return (
    <Card style={{ marginBottom: '20px' }}>
      <CardContent style={{ marginTop: '4px' }}>
        <Typography style={{ margin: '0 10px', fontWeight: 'bold' }} variant="h7">
          Usage Chart
        </Typography>
        <div className="chart-pie pt-4 pb-2">
          <Doughnut options={chartOptions} data={chartData}/>
        </div>
        <div className="mt-4 text-center small">
          <i className="mr-2 text-success">
            <FiberManualRecord fontSize="small"/>
          </i>
          Available: {available} GB
          <br/>
          <i className="mr-2 text-primary">
            <FiberManualRecord fontSize="small"/>
          </i>
          Traffic used: {consumed > 0.1 ? consumed : '< 0.1'} MB
        </div>
      </CardContent>
    </Card>
  );
}
