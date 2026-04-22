export type Algorithm = 'separate-chaining' | 'linear-probing' | 'double-hashing';

export type OpenAddressingCell = {
  key: number | null;
  deleted: boolean;
};

export type ChainingCell = number[];

export type TableState = OpenAddressingCell[] | ChainingCell[];

export type LogEntry = {
  id: string;
  text: string;
  type: 'info' | 'success' | 'error' | 'warning';
};

export type AnimationFrame = {
  table: TableState;
  activeTarget: { index: number; chainIndex?: number } | null;
  status: 'probing' | 'success' | 'error' | 'idle';
  log: LogEntry;
};
