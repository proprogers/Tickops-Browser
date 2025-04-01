import { useStore as usePasswordsStore } from './passwords-store';

export default function PasswordsChecklist(props) {
  const {
    sitesFreeCredentialsArray,
    checkedPasswordsIdsArray,
    setCheckedPasswordsIdsArray,
  } = usePasswordsStore([
    'sitesFreeCredentialsArray',
    'checkedPasswordsIdsArray',
    'setCheckedPasswordsIdsArray',
  ]);

  const onToggleCheckbox = (id) => {
    const currentIndex = checkedPasswordsIdsArray.indexOf(id);
    const checkedPasssIds = [...checkedPasswordsIdsArray];

    if (currentIndex === -1) {
      checkedPasssIds.push(id);
    } else {
      checkedPasssIds.splice(currentIndex, 1);
    }
    setCheckedPasswordsIdsArray(checkedPasssIds);
  };

  return (
    <div className="list-group pt-2" role="tablist">
      {(props.list || sitesFreeCredentialsArray).map((curr) => {
        const isChecked = checkedPasswordsIdsArray.indexOf(curr._id) !== -1;
        return (
          <li className="list-group-item" key={curr._id}>
            <div className="row">
              <div className="col-1">
                <div className="custom-control custom-checkbox">
                  <input type="checkbox"
                         className="custom-control-input"
                         id={curr._id + '-pass'}
                         onClick={() => onToggleCheckbox(curr._id)}
                         checked={isChecked} onChange={() => {
                  }}/>
                  <label className="custom-control-label" htmlFor={curr._id + '-pass'}/>
                </div>
              </div>
              <div className="col-5">
                <div className="text-truncate">{curr.hostname}</div>
              </div>
              <div className="col-6">
                <div className="text-truncate">{curr.login}</div>
              </div>
            </div>
          </li>
        );
      })}
    </div>
  );
}
