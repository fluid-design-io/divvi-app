import TransactionView from '~/components/screens/transaction-view';
import { transactions$ } from '~/lib/sync';

export default function Transactions() {
  return <TransactionView transactions$={transactions$} />;
}
