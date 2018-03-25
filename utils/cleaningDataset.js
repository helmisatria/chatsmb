const fs = require('fs');
const _ = require('lodash');

const readFile = async () => fs.readFileSync(`${__dirname}/../datasets/try.txt`, 'utf8', (err) => {
  if (err) {
    console.log(err);
  }
});
const processingData = async () => {
  const data = await readFile();

  const allData = data.split(/\r\n/);

  // console.log(allData.length);

  // Merge data yang gaada nomerny
  let currentIndex = 0;
  const indexArrayDeleted = [];

  allData.forEach((d, index, realData) => {
    if (d[0] === '=') {
      indexArrayDeleted.push(d);
      return;
    } else if (d[0] !== '[') {
      realData[currentIndex] = `${realData[currentIndex]}, ${d}`;
      indexArrayDeleted.push(d);
      return;
    }
    currentIndex = index;
  });

  indexArrayDeleted.forEach((arrayItem) => {
    _.remove(allData, item => item === arrayItem);
  });

  console.log(JSON.stringify(allData, {}, 2));
  return allData;
};

const separateNumberMessage = async () => {
  const data = await processingData();

  // console.log(JSON.stringify(data, {}, 2))

  const separation = data.map((d, index) => ({
    id: index,
    timestamp: `${d.split(' ')[0]} ${d.split(' ')[1]}`,
    number: d.split(/[+:]/)[2],
    message: d.substr(5, 9999).match(/:.*/)[0].substr(1, 9999).trim(),
  }));

  // console.log(JSON.stringify(separation, {}, 2));

  return separation;
};

const mergeMessageWithSameNumber = async () => {
  const separatedData = await separateNumberMessage();

  // console.log('====================================');
  // console.log(JSON.stringify(separatedData, {}, 2));
  // console.log('====================================');

  let currentIndex = 0;
  const deletedId = [];
  let currentNumber = '';

  separatedData.forEach(({
    id, number, message,
  }, index, realArray) => {
    if (id === '0') {
      currentNumber = number;
      currentIndex = id;
      return;
    }

    if (number === currentNumber) {
      realArray[currentIndex].message += ` ${message}`;

      deletedId.push(index);

      return;
    }
    currentIndex = index;
    currentNumber = number;
  });

  deletedId.forEach((id) => {
    _.remove(separatedData, data => data.id === id);
  });

  // console.log('====================================');
  // console.log(JSON.stringify(separatedData, {}, 2));
  // console.log('====================================');

  return separatedData;
};

module.exports = mergeMessageWithSameNumber;
