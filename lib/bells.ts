// Bell weights as the boards print them: "42,5 kg", "1 500 kg".
const decimal = (value: number) => String(value).replace('.', ',');

export const kg = (value: number) =>
  `${value >= 1000 ? String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : decimal(value)} kg`;
