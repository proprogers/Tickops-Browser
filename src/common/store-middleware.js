import shallow from 'zustand/shallow';

function getUseStore(store) {
  return (props) => store((state) => {
    if (!props) return state;
    // if (typeof props === 'string') {
    //   return store[props];
    // }
    const ret = {};
    props.forEach((name) => ret[name] = state[name]);
    return ret;
  }, shallow);
}

export { getUseStore };
