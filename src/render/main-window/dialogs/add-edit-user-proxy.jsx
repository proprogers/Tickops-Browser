import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useState } from 'react';

export default function AddEditUserProxy(props) {
  const [isPasswordShown, setIsPasswordShown] = useState(false);

  return (
    <div className="pb-3">
      <div className="form-group row">
        <div className="col-sm-9">
          <label htmlFor="host-input">
            Host or IP Address:
          </label>
          <input type="text"
                 className="form-control form-control-user"
                 id="host-input"
                 placeholder="host.com / 1.2.3.4"
                 value={props.host}
                 onChange={({ target: { value } }) => props.setHost(value)}
          />
        </div>
        <div className="col-sm-3">
          <label htmlFor="port-input">
            Port:
          </label>
          <input type="text"
                 className="form-control form-control-user"
                 id="port-input"
                 placeholder="1234"
                 value={props.port}
                 onChange={({ target: { value } }) => props.setPort(value)}
          />
        </div>
      </div>
      <div className="form-group row">
        <label htmlFor="proxy-username-input" className="col-3 col-form-label">
          Username:
        </label>
        <div className="col-sm-9">
          <input type="text"
                 className="form-control form-control-user"
                 id="proxy-username-input"
                 value={props.username}
                 onChange={({ target: { value } }) => props.setUsername(value)}
          />
        </div>
      </div>
      <div className="form-group row">
        <label htmlFor="proxy-password-input" className="col-3 col-form-label">
          Password:
        </label>
        <div className="col-sm-9 input-group">
          <input type={isPasswordShown ? 'text' : 'password'}
                 className="form-control form-control-user"
                 id="proxy-password-input"
                 value={props.password}
                 onChange={({ target: { value } }) => props.setPassword(value)}
          />
          <div className="input-group-append">
            <button className="btn btn-outline-primary btn-sm" type="button"
                    onClick={() => setIsPasswordShown(!isPasswordShown)}>
              {isPasswordShown ? <Visibility fontSize="small"/> : <VisibilityOff fontSize="small"/>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
