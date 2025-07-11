// Встроенные BIN-данные (добавьте больше при необходимости)
const binData = {
  "414949": { "dict": "ПриватБанк" },
  "516874": { "dict": "Монобанк" },
  "541159": { "dict": "VTB" },
  "427714": { "dict": "ALFA" },
  "510621": { "dict": "Тинькофф Банк" }
};

// Синонимы популярных банков
const BANK_ALIASES = {
  VTB: ["втб", "vtb", "втб банк", "банк втб"],
  ALFA: ["альфа", "alfa", "альфабанк", "альфа-банк", "alfa bank"],
  TINKOFF: ["тинькофф", "тиньков", "тинька", "т банк", "tinkoff"],
  SBERBANK: ["сбер", "сбербанк", "sberbank"],
  MONOBANK: ["моно", "монобанк"],
  PRIVATBANK: ["приват", "приватбанк"]
};

// Алгоритм Луна
function luhnCheck(card) {
  let sum = 0;
  const digits = card.split('').reverse().map(d => +d);
  for (let i = 0; i < digits.length; i++) {
    let digit = digits[i];
    if (i % 2) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return sum % 10 === 0;
}

// Извлекаем карту из текста
function findCardNumber(text) {
  const match = text.match(/\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}|\d{15,16}\b/);
  return match ? match[0].replace(/\D/g, '') : null;
}

// Определяем, какой банк пользователь указал словами
function findDeclaredBank(text) {
  const lower = text.toLowerCase();
  for (let [bank, aliases] of Object.entries(BANK_ALIASES)) {
    if (aliases.some(alias => lower.includes(alias))) return bank;
  }
  return null;
}

// Основная проверка
function checkCard() {
  const text = document.getElementById('userText').value;
  const cardNumber = findCardNumber(text);
  const declaredBank = findDeclaredBank(text);
  const resultDiv = document.getElementById('result');

  if (!cardNumber) {
    resultDiv.innerText = "❌ Номер карты не найден.";
    return;
  }

  if (cardNumber.length < 16) {
    resultDiv.innerText = "⚠️ Карта слишком короткая (менее 16 цифр).";
    return;
  }

  const bin = cardNumber.slice(0, 6);
  const info = binData[bin];
  const realBank = info ? info.dict.toUpperCase() : null;

  if (!realBank) {
    resultDiv.innerText = "❌ BIN не найден в базе.";
    return;
  }

  if (!luhnCheck(cardNumber)) {
    resultDiv.innerText = "⚠️ Некорректная карта (ошибка Луна).";
    return;
  }

  if (declaredBank && realBank !== declaredBank) {
    resultDiv.innerText = `⚠️ Несовпадение:\nЗаявленный: ${declaredBank}\nПо BIN: ${realBank}`;
    return;
  }

  resultDiv.innerText = `✅ Карта действительна.\nБанк: ${realBank}`;
}
