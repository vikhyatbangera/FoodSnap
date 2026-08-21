function roundMoney(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return value;
  return Math.round((number + Number.EPSILON) * 100) / 100;
}

module.exports = roundMoney;
