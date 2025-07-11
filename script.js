let binData = {};
fetch('bin_data.json')
  .then(res => res.json())
  .then(data => binData = data)
  .catch(() => document.getElementById('result').innerText = "Ошибка загрузки BIN-данных");

const BANK_ALIASES = {
  VTB: ["втб", "vtb", "втб банк", "vtb bank", "банк втб"],
  ALFA: ["альфа", "альфабанк", "альфа-банк", "alfa-bank", "alfa bank"],
  TINKOFF: ["тинькофф", "тиньков", "т банк", "тинька", "tinkoff"],
  SBERBANK: ["сбер", "сбербанк", "sberbank"],
  // Добавьте остальные синонимы по необходимости
};

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

function findCardNumber(text) {
  const match = text.match(/\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}|\d{15,16}\b/);
  return match ? match[0].replace(/\D/g, '') : null;
}

function findDeclaredBank(text) {
  const lower = text.toLowerCase();
  for (let [bank, aliases] of Object.entries(BANK_ALIASES)) {
    if (aliases.some(alias => lower.includes(alias))) return bank;
  }
  return null;
}

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

  if (declaredBank && declaredBank !== realBank) {
    resultDiv.innerText = `⚠️ Несовпадение:\nЗаявленный банк: ${declaredBank}\nНайден по BIN: ${realBank}`;
    return;
  }

  resultDiv.innerText = `✅ Карта действительна.\nБанк: ${realBank}`;
}
}
