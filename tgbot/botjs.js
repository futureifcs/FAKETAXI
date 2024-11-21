const TelegramBot = require('node-telegram-bot-api');
const cron = require('node-cron');
const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

const token = '';

const bot = new TelegramBot(token, { polling: true });

bot.on('polling_error', (error) => {
  console.log(error);
});

function smokemessage() {
  return 'Директору надо перекурить, @KaNaPaTsky @belevandy вы с ним?';
}

function lunchmessage() {
  return 'БЫСТРО ВСЕ НА ОБЕД!!!';
}

function packetmessage() {
  return '@belevandy пошли в джульету заносить пакет.';
}

function provetrivanie() {
  return 'В кабинете тестировщиков проветривание. Директор предлагает выйти на кофеек.';
}

function sendRequest(message) {
  const url = `https://api.telegram.org/bot${token}/sendMessage?chat_id=-1002257244471&text=${encodeURIComponent(message)}`;
  const xht = new XMLHttpRequest();
  xht.open("GET", url, true);
  xht.send(); console.log(`Сообщение отправлено по URL: ${url}`);
}

function smokeotpravka() {
  sendRequest(smokemessage());
}

function lunchotpravka() {
  sendRequest(lunchmessage());
}

function packetotpravka() {
  sendRequest(packetmessage());
}

function provetrivanieotpravka() {
  sendRequest(provetrivanie());
}

cron.schedule('0 40 9 * * 1-5', () => {
  smokeotpravka();
}, {
  timezone: "Europe/Moscow"
});

cron.schedule('0 0 12 * * 1-5', () => {
  lunchotpravka();
}, {
  timezone: "Europe/Moscow"
});

cron.schedule('0 0 14 * * 1-5', () => {
  packetotpravka();
}, {
  timezone: "Europe/Moscow"
});

cron.schedule('0 23 21 * * 1-5', () => {
  provetrivanieotpravka();
}, {
  timezone: "Europe/Moscow"
});

/*Запуск бота*/
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Бот SC Kicker готов к работе.');
  console.log(`chatId из start команды ${chatId}`);
});

/*Код рандома*/
let players = [];

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

bot.onText(/\/random/, (msg) => {
  const chatId = msg.chat.id;
  if (players.length !== 4) {
      bot.sendMessage(chatId, 'Для запуска великого директорского рандома необходимо ввести имена четырех игроков в величайшую игру.');
  } else {
      const shuffledPlayers = shuffleArray(players);
      const pair1 = `${shuffledPlayers[0]} + ${shuffledPlayers[1]}`;
      const pair2 = `${shuffledPlayers[2]} + ${shuffledPlayers[3]}`;
      bot.sendMessage(chatId, `Рандом директора лиги назначил на сегодня следующие пары:\n${pair1}\n${pair2}`);
  }
});

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  if (!text.startsWith('/')) {
      if (players.length < 4) {
          players.push(text);
          if (players.length === 1){
            bot.sendMessage(chatId, `Задрот в кикер "${text}" залетел в директорский рандом. Введи имена еще ${4 - players.length}-ех олухов которые будут играть.`);
          }
          if (players.length === 2){
            bot.sendMessage(chatId, `Задрот в кикер "${text}" залетел в директорский рандом. Введи имена еще ${4 - players.length}-ух олухов которые будут играть.`);
          }
          if (players.length === 3){
            bot.sendMessage(chatId, `Задрот в кикер "${text}" залетел в директорский рандом. Введи имя последнего олуха который будет играть.`);
          }
          if (players.length === 4) {
              bot.sendMessage(chatId, 'Все олухи добавлены. Нажми на /random для принятия решения директора.');
          }
      } else {
          bot.sendMessage(chatId, 'Все 4 игрока уже добавлены.');
      }
  }
});

bot.onText(/\/clear/, (msg) => {
  const chatId = msg.chat.id;
  players = [];
  bot.sendMessage(chatId, 'Список игроков очищен.');
});