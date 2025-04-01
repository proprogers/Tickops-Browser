/* global document, window */
import { useEffect } from 'react';
import { render } from 'react-dom';
import { useStore as useUserStore } from '@/common/components/user-store';
import SessionsBoard from './sessions-board/index.jsx';
import TrafficBoard from './traffic-board.jsx';
import ShortcutsBoard from './shortcuts-board.jsx';

export function Dashboard() {
  const {
    setSavedSessionsLimit,
    setTraffic,
  } = useUserStore([
    'setSavedSessionsLimit',
    'setTraffic',
  ]);

 
  const loadUsage = async () => {
    var savedSessionsLimit = 1000;
    var userTrafficLimits = await window.Settings.get("TRAFFIC");
    if(userTrafficLimits === undefined){
      var { savedSessionsLimit, traffic } =  await window.getTrafficLimits();
    } else {
      userTrafficLimits = userTrafficLimits;
    }
    
    setSavedSessionsLimit(savedSessionsLimit);
    setTraffic(userTrafficLimits);

  };

  useEffect(() => {
    loadUsage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div id="wrapper">
      <div id="content-wrapper" className="d-flex flex-column">
        <div id="content">
          <div className="container-fluid">
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
              <h1 className="h3 mb-0 text-gray-800">Browser Dashboard</h1>
            </div>
            <div className="row">
              <div className="col-xl-4">
                <TrafficBoard/>
                <ShortcutsBoard/>
              </div>
              <SessionsBoard/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const root = document.createElement('div');
root.id = 'app';
document.body.appendChild(root);

render(
  <Dashboard/>,
  document.getElementById('app')
);
