const hasClass = (elementClass, className) => {
   return (' ' + elementClass + ' ').indexOf(' ' + className+ ' ') > -1;
}

module.exports = {
   hasClass
};
