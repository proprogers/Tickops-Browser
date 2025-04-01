const makeId = (length, possible = 'abcdefghijklmnopqrstuvwxyz') => {
    let id = '';
    for (let i = 0; i < length; i++) {
        id += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return id;
};
const replaceAll = (str, find, replace, options = 'gi') => {
    find = find.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1');
    return str.replace(new RegExp(find, options), replace);
};
const capitalizeFirst = (str) => {
    return str.substr(0, 1).toUpperCase() + str.substring(1).toLowerCase();
};
const hashCode = (str) => {
    let hash = 0;
    if (str.length === 0) {
        return hash;
    }
    for (let i = 0; i < str.length; i++) {
        const chr = str.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0;
    }
    return hash;
};