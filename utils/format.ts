export const formatCurrency = (
  amount = 0,
  currency = 'USD',
  ...props: Intl.NumberFormatOptions[]
) => {
  return amount.toLocaleString('en-US', {
    currency: currency === '' ? 'USD' : currency,
    style: 'currency',
    ...props,
  });
};

export const formatFromSnakeCase = (str: string, capitalize: boolean = false) => {
  const result = str.replace(/_/g, ' ');
  return capitalize ? result.replace(/\b\w/g, (char) => char.toUpperCase()) : result;
};

export const formatFromCamelCase = (str: string, capitalize: boolean = false) => {
  // merchantDomain -> Merchant Domain
  const result = str.replace(/([A-Z])/g, ' $1');
  return capitalize ? result.replace(/\b\w/g, (char) => char.toUpperCase()) : result;
};

export const formatCardNumber = (number: string) => {
  return number.replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, '$1 $2 $3 $4');
};

export const initials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
};
