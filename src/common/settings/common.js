function findAndUpdateArrayItems({ values, array = [] }) {
  const updated = [];
  values.forEach(({ value, findIndexFunc }) => {
    const index = array.findIndex(findIndexFunc);
    if (index === -1) return;
    const updatedItem = { ...array[index], ...value };
    updated.push(updatedItem);
    array.splice(index, 1, updatedItem);
  });
  return { updated, array };
}

module.exports = { findAndUpdateArrayItems };
