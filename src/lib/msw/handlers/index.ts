import { accountsHandlers } from './accounts';
import { transactionsHandlers } from './transactions';
import { transfersHandlers } from './transfers';

export const handlers = [
  ...accountsHandlers,
  ...transactionsHandlers,
  ...transfersHandlers,
]; 