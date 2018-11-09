const fs = require('fs');
const akarata = require('akarata');

const CLEANING = require('./cleaningDataset');

class Preprocessing {
  constructor() {
    this.data = [];
    this.questionMessages = [];
    this.answerMessages = [];
    this.unknownReplyMessages = [];
    this.cleanDataset = [];
  }

  async init() {
    this.data = await CLEANING();
    this.questionMessages = await this.getSelectedTypeMessage('Q');
    this.answerMessages = await this.getSelectedTypeMessage('A');
  }

  async getSelectedTypeMessage(type) {
    let allQuestions = [];

    allQuestions = this.data
      .filter(d => d.type === type)
      .map(d => d.message);

    return allQuestions;
  }

  async removeStopwords() {
    let stopWords = () => fs.readFileSync(`${__dirname}/../datasets/stopwords.txt`, 'utf8');
    stopWords = stopWords().split(/\n/);

    this.data = this.data.map((d) => {
      let { message } = d;

      if (d.type === 'Q') {
        message = d.message.split(' ');

        for (const sw of stopWords) {
          const isConsistStopword = message.indexOf(sw) !== -1;

          if (isConsistStopword) {
            message.splice(message.indexOf(sw), 1);
          }
        }

        message = message.join(' ');
      }

      return {
        ...d,
        message,
      };
    });
  }

  async removePunctuation() {
    this.data = this.data.map(d => ({
      ...d,
      message: d.message
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
        .replace(/\s{2,}/g, ' '),
    }));
  }

  async removeEmojis() {
    this.data = this.data.map(d => ({
      ...d,
      message: d.message.replace(/([\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2694-\u2697]|\uD83E[\uDD10-\uDD5D])/g, ''),
    }));
  }

  async stemmingWords() {
    this.data = this.data.map((d) => {
      let splitted = d.message.split(' ');

      splitted = splitted.map(s => akarata.stem(s));

      return {
        ...d,
        message: splitted.join(' '),
      };
    });
  }

  async exportToTxt() {
    fs.writeFileSync('./data/export.txt', this.questionMessages.map(d => `${d}\n`).join(''));
  }
}

module.exports = Preprocessing;
