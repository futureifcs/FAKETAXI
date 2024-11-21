const TelegramBot = require('node-telegram-bot-api');
const cron = require('node-cron');
const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

const token = '';

const bot = new TelegramBot(token, { polling: true });

bot.on('polling_error', (error) => {
  console.log(error);
});

const playersPairs = [
  'Директор + Андрик',
  'Директор + Стасик',
  'Директор + Вовчик',
  'Стасик + Андрик',
  'Стасик + Вовчик',
  'Андрик + Вовчик'
];

function getrandomPair() {
  return playersPairs[Math.floor(Math.random(), playersPairs.length)];
}

function message() {
  const randomPair = getrandomPair();
  return `На сегодня директором лиги была назначена следующая пара игроков ${randomPair}`;
}

function smokemessage() {
  return 'Пошлите на перекур';
}

function lunchmessage() {
  return 'БЫСТРО ВСЕ НА ОБЕД!!!';
}

function packetmessage() {
  return '@belevandy пошли в джульету заносить пакет';
}

let chatId;

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

function otpravka() {
    const url = `httpsapi.telegram.orgbot${token}sendMessagechat_id=-1002257244471&text=${encodeURIComponent(message())}`; 
    const xht = new XMLHttpRequest();
    xht.open(GET, url);
    xht.send();
    console.log(`Сообщение отправлено по URL ${url}`);
}

function smokeotpravka() {
  const url = `httpsapi.telegram.orgbot${token}sendMessagechat_id=-1002257244471&text=${encodeURIComponent(smokemessage())}`; 
  const xht = new XMLHttpRequest();
  xht.open(GET, url);
  xht.send();
  console.log(`Сообщение отправлено по URL ${url}`);
}

function lunchotpravka() {
  const url = `httpsapi.telegram.orgbot${token}sendMessagechat_id=-1002257244471&text=${encodeURIComponent(lunchmessage())}`; 
  const xht = new XMLHttpRequest();
  xht.open(GET, url);
  xht.send();
  console.log(`Сообщение отправлено по URL ${url}`);
}

function packetpravka() {
  const url = `httpsapi.telegram.orgbot${token}sendMessagechat_id=-1002257244471&text=${encodeURIComponent(packetmessage())}`; 
  const xht = new XMLHttpRequest();
  xht.open(GET, url);
  xht.send();
  console.log(`Сообщение отправлено по URL ${url}`);
}

/*bot.on('message', (msg) => {
  chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Добрый день.');
  console.log(`Сохраненный chatId ${chatId}`);
});*/


cron.schedule('0 40 9 * * *', () => {
  if (chatId) {
    smokeotpravka();
  } else {
    console.log('chatId не определен');
  }
}, {
  timezone: "Europe/Moscow"
});

cron.schedule('0 0 12 * * *', () => {
  if (chatId) {
    lunchotpravka();
  } else {
    console.log('chatId не определен');
  }
}, {
  timezone: "Europe/Moscow"
});

cron.schedule('0 0 12 * * *', () => {
  if (chatId) {
    otpravka();
  } else {
    console.log('chatId не определен');
  }
}, {
  timezone: "Europe/Moscow"
});

cron.schedule('0 0 14 * * *', () => {
  if (chatId) {
    packetpravka();
  } else {
    console.log('chatId не определен');
  }
}, {
  timezone: "Europe/Moscow"
});

cron.schedule('0 30 15 * * *', () => {
  if (chatId) {
    smokeotpravka();
  } else {
    console.log('chatId не определен');
  }
}, {
  timezone: "Europe/Moscow"
});

cron.schedule('0 04 16 * * *', () => {
  if (chatId) {
    smokeotpravka();
  } else {
    console.log('chatId не определен');
  }
}, {
  timezone: "Europe/Moscow"
});

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Бот SC Kicker готов к работе.');
  console.log(`chatId из start команды ${chatId}`);
});

let players = [];

bot.onText(/\/random/, (msg) => {
  const chatId = msg.chat.id;
  if (players.length !== 4) {
      bot.sendMessage(chatId, 'Нужно 4 игрока. Напишите их имена сначала.');
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
          bot.sendMessage(chatId, `Игрок "${text}" добавлен. Осталось ${4 - players.length} игроков.`);
          if (players.length === 4) {
              bot.sendMessage(chatId, 'Все игроки добавлены. Используйте /random для составления пар.');
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