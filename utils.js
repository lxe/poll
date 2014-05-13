module.exports.simpleId = function createSimpleId(length) {
  var letters = 'abcdefghjkmnpqrstuvwxyz';
  function rndLetter() {
    return letters[Math.round(Math.random() * (letters.length - 1))];
  }
  
  var id = '';
  for (var i = 0; i < length || 3; i++) {
    id += rndLetter();
  }

  return id;
};
