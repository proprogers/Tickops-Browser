import Dashboard from '@mui/icons-material/Dashboard';
import { NEW_TAB } from '@/common/consts';

export default function DashboardSidebar() {
  return (
    <ul className="navbar-nav bg-gradient-primary sidebar sidebar-dark accordion" id="accordionSidebar">
      <div className="sidebar-brand d-flex align-items-center justify-content-center">
        <div className="sidebar-brand-text mx-3">TickOps</div>
      </div>
      <hr className="sidebar-divider my-0"/>
      <li className="nav-item active">
        <a className="nav-link" href={NEW_TAB}>
          <Dashboard fontSize="small" className="ml-2 mr-2"/>
          <span>Dashboard</span>
        </a>
      </li>
      <hr className="sidebar-divider d-none d-md-block"/>
    </ul>
  );
}
