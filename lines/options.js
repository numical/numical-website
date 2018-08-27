// age dropdown
let ageHtml = '';
for (let i = 16; i < 81; i++) {
  const selected = (i === 30) ? 'selected' : '';
  ageHtml += `<option ${selected}>${i}</option>`;
}
document.getElementById('age').innerHTML = ageHtml;

// income drodown
const incomeValues = [
  100,
  150,
  200,
  250,
  300,
  350,
  400,
  450,
  500,
  550,
  600,
  650,
  700,
  750,
  800,
  850,
  900,
  950,
  1000,
  1250,
  1500,
  1750,
  2000,
  2500,
  3000,
  3500,
  4000,
  4500,
  5000,
  6000,
  7000,
  8000,
  9000,
  10000,
  11000,
  12000,
  14000,
  15000,
  17500,
  20000,
  22500,
  25000,
  27500,
  30000,
  32500,
  35000,
  37500,
  40000,
  42500,
  45000,
  47500,
  50000,
  55000,
  60000,
  65000,
  70000,
  75000,
  80000,
  85000,
  90000,
  95000,
  100000,
  110000,
  120000,
  130000,
  140000,
  150000,
  175000,
  200000,
  225000,
  250000
];
let incomeHtml = '';
incomeValues.forEach(value => {
  const selected = (value === 22500) ? 'selected' : '';
  incomeHtml += `<option ${selected}>${value}</option>`;
});
document.getElementById('income').innerHTML = incomeHtml;
