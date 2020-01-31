function UInt8ToString(array) {
  var str = "";
  for (var i = 0; i < array.length; i++) {
    str += array[i];
  }
  return str;
}

function secondsToDate(time) {
  var date = new Date(1970, 0, 1);
  date.setSeconds(time.seconds);
  return date;
}

module.exports = { UInt8ToString, secondsToDate };