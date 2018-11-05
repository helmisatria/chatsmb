const fs = require('fs');
const _ = require('lodash');
const akarata = require('akarata');
const removePunctuation = require('remove-punctuation');

const readFile = async () => fs.readFileSync(`${__dirname}/../datasets/dataset1.txt`, 'utf8');
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
    } if (d[0] !== '[') {
      realData[currentIndex] = `${realData[currentIndex]}, ${d}`;
      indexArrayDeleted.push(d);
      return;
    }
    currentIndex = index;
  });

  indexArrayDeleted.forEach((arrayItem) => {
    _.remove(allData, item => item === arrayItem);
  });

  // console.log(JSON.stringify(allData, {}, 2));
  return allData;
};

const separateNumberMessage = async () => {
  const data = await processingData();

  // console.log(JSON.stringify(data, {}, 2))

  const separation = data.map((d, index) => {
    const number = d.split(/[+:]/)[2];

    const isAdmin = number === '62 811-2025-200';

    return {
      id: index,
      timestamp: `${d.split(' ')[0]} ${d.split(' ')[1]}`,
      number,
      message: isAdmin ? d.split(':')[2].trim().toLowerCase() : removePunctuation(d.split(':')[2].trim().toLowerCase()),
      type: isAdmin ? 'A' : 'Q',
    };
  });

  // console.log(JSON.stringify(separation, {}, 2));

  return separation;
};

const mergeMessageWithSameNumber = async () => {
  let separatedData = await separateNumberMessage();

  // console.log('====================================');
  // console.log(JSON.stringify(separatedData, {}, 2));
  // console.log('====================================');

  const deletedId = [];
  const questionAnswersIndex = [];
  let currentIndex = 0;
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
    questionAnswersIndex.push(currentIndex);
    currentNumber = number;
  });

  deletedId.forEach((id) => {
    _.remove(separatedData, data => data.id === id);
  });

  separatedData = separatedData.map((sp, index) => {
    const nextSp = separatedData[index + 1];

    const notLastValue = separatedData.length - 1 !== index;
    if (notLastValue && sp.type === 'Q' && nextSp.type === 'Q') {
      return {
        ...sp,
        pairId: null,
      };
    }

    return {
      ...sp,
      pairId: sp.type === 'Q' ? questionAnswersIndex[index + 1] : questionAnswersIndex[index - 1],
    };
  });

  return separatedData;
};

const stemmingWords = async (isStem) => {
  const mergedData = await mergeMessageWithSameNumber();

  if (isStem) {
    mergedData.map((data) => {
      let splitted = data.message.split(' ');

      splitted = splitted.map(s => akarata.stem(s));

      return {
        ...data,
        message: splitted.join(', '),
      };
    });
  }

  return mergedData;
};

module.exports = stemmingWords;
