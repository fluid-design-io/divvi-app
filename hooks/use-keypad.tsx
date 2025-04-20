import { useState } from 'react';

interface NumericKeypadOptions {
  maxWholeLength?: number;
  maxDecimalPlaces?: number;
  initialValue?: string;
  onAmountChange?: (amount: number) => void;
}

export function useKeypad({
  maxWholeLength = 7,
  maxDecimalPlaces = 2,
  initialValue = '',
  onAmountChange,
}: NumericKeypadOptions = {}) {
  const [amount, setAmount] = useState(initialValue);
  const handleNumberPress = (num: string) => {
    if (num.startsWith('reset:')) {
      setAmount(num.slice(6));
      return;
    }
    if (num === '') {
      setAmount('0');
      return;
    }
    if (num === 'backspace') {
      setAmount((prev) => prev.slice(0, -1));
      return;
    }

    // Prevent multiple leading zeros
    if (num === '0' && amount === '0') return;
    if (num === '000' && amount === '0') return;

    // Handle first digit
    if (amount === '0' && num !== '000') {
      setAmount(num);
      return;
    }

    // Limit to decimal places
    const newAmount = amount + num;
    const [whole, decimal] = newAmount.split('.');
    if (decimal && decimal.length > maxDecimalPlaces) return;

    // Limit total length
    if (whole.length > maxWholeLength) return;

    setAmount(newAmount);
    onAmountChange?.(Number(newAmount));
  };

  const handleLongPress = (num: string) => {
    if (num === 'backspace') {
      setAmount('0');
    }
  };

  const clear = () => setAmount('');
  const setValue = (value: string) => setAmount(value);

  return {
    amount,
    setAmount: setValue,
    handleNumberPress,
    handleLongPress,
    clear,
  };
}
