const TelegramBot = require('node-telegram-bot-api');
const cron = require('node-cron');
const axios = require('axios');

const token = '7681745281:AAEpAifF1O1fh0-P5Cugdbj1tuUjpI4nV4k';

const bot = new TelegramBot(token, { polling: true });

bot.setMyCommands([
  {command: '/start', description: 'Приветствие бота'},
  {command: '/random', description: 'Команда для составления пар'},
  {command: '/order', description: 'Команда для заказа в сайгоне'},
  {command: '/orders', description: 'Команда для показа текущих заказов'}
])

bot.on('message', msg => {
  console.log(msg);
});

const messages = {
  lunch: 'БЫСТРО ВСЕ НА ОБЕД!!!',
  packet: '@belevandy пошли в джульету заносить пакет.',
  provetrivanie: 'В кабинете тестировщиков проветривание. Директор предлагает выйти на кофеек.',
  shava: 'Директор напоминает, что пятница - день шаурмы. Предлагаю сделать заказ.',
  proshcanie: 'Директор лиги желает всем хоророшего дня. До свидания!'
};

async function sendRequest(message) {
  const url = `https://api.telegram.org/bot${token}/sendMessage?chat_id=-1002257244471&text=${encodeURIComponent(message)}`;
  try {
    await axios.get(url);
    console.log(`Сообщение отправлено по URL: ${url}`);
  } catch (error) {
    console.error('Ошибка при отправке сообщения:', error);
  }
}

function sendMessage(messageKey) {
  sendRequest(messages[messageKey]);
}

const cronJobs = [
  { cronTime: '0 0 12 * * 1-5', messageKey: 'lunch' },
  { cronTime: '0 0 14 * * 1-5', messageKey: 'packet' },
  { cronTime: '0 30 15 * * 1-5', messageKey: 'provetrivanie' },
  { cronTime: '0 45 11 * * 5', messageKey: 'shava' },
  { cronTime: '0 00 18 * * 1-5', messageKey: 'proshcanie' }
];

cronJobs.forEach(({ cronTime, messageKey }) => {
  cron.schedule(cronTime, () => sendMessage(messageKey), { timezone: "Europe/Moscow" });
});

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Бот SC Kicker команды разрабочиков лиги кикера готов к работе.');
  console.log(`chatId из start команды ${chatId}`);
});

let players = [];
let isAddingPlayers = false;
let orders = {};
let isAddingOrders = false;

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

bot.onText(/\/random/, (msg) => {
  const chatId = msg.chat.id;
  if (isAddingPlayers) {
    if (players.length !== 4) {
      bot.sendMessage(chatId, 'Для запуска великого директорского рандома необходимо ввести имена четырех игроков в величайшую игру.');
    } else {
      const shuffledPlayers = shuffleArray(players);
      const pair1 = `${shuffledPlayers[0]} + ${shuffledPlayers[1]}`;
      const pair2 = `${shuffledPlayers[2]} + ${shuffledPlayers[3]}`;
      bot.sendMessage(chatId, `Рандом директора лиги назначил на сегодня следующие пары:\n${pair1}\n${pair2}. \nВыполни команду /clear для очистки массива игроков.`);
      players = [];
      isAddingPlayers = false;
    }
  } else {
    isAddingPlayers = true;
    players = [];
    bot.sendMessage(chatId, 'Введите имена четырех игроков для составления пар.');
  }
});

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  if (isAddingPlayers && !text.startsWith('/')) {
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
  } else if (isAddingOrders && !text.startsWith('/')) {
      if (!orders[chatId]) {
          orders[chatId] = [];
      }
      orders[chatId].push(text);
      bot.sendMessage(chatId, `Заказ "${text}" от пользователя @${msg.from.username} добавлен. Введите следующий заказ или нажмите /orders для просмотра всех заказов.`);
  }
});

bot.onText(/\/clear/, (msg) => {
  const chatId = msg.chat.id;
  players = [];
  isAddingPlayers = false;
  bot.sendMessage(chatId, 'Список игроков очищен.');
});

bot.onText(/\/order/, (msg) => {
  const chatId = msg.chat.id;
  isAddingOrders = true;
  bot.sendMessage(chatId, 'Введите заказ из меню сайгона.');
});

bot.onText(/\/orders/, async (msg) => {
  const chatId = msg.chat.id;
  if (Object.keys(orders).length === 0) {
    bot.sendMessage(chatId, 'Список заказов пуст.');
  } else {
    let orderList = '';
    for (const userChatId of Object.keys(orders)) {
      const chat = await bot.getChat(userChatId);
      const username = chat.username || chat.first_name;
      orderList += `@${username}: ${orders[userChatId].join('\n')}\n`;
    }
    bot.sendMessage(chatId, `Заказы на сегодня:\n${orderList}`);
  }
});

bot.onText(/\/cleanorders/, (msg) => {
  const chatId = msg.chat.id;
  orders = {};
  isAddingOrders = false;
  bot.sendMessage(chatId, 'Список заказов очищен.');
});

async function sendOrders() {
  if (Object.keys(orders).length === 0) {
    return;
  }

  let orderList = '';
  for (const userChatId of Object.keys(orders)) {
    const chat = await bot.getChat(userChatId);
    const username = chat.username || chat.first_name;
    orderList += `@${username}: ${orders[userChatId].join('\n')}\n`;
  }

  await bot.sendMessage(-1002257244471, `Заказы на сегодня:\n${orderList}`);
}

cron.schedule('45 11 * * 1-4', sendOrders, { timezone: "Europe/Moscow" });