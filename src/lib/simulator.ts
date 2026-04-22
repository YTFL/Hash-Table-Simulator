import { Algorithm, AnimationFrame, TableState, OpenAddressingCell, ChainingCell, LogEntry } from './types';

let logCounter = 0;

function createLog(text: string, type: LogEntry['type']): LogEntry {
  logCounter++;
  return { id: `${Date.now()}-${logCounter}-${Math.random().toString(36).substring(2, 9)}`, text, type };
}

function cloneTable(table: TableState): TableState {
  return JSON.parse(JSON.stringify(table));
}

export function initializeTable(size: number, algorithm: Algorithm): TableState {
  if (algorithm === 'separate-chaining') {
    return Array.from({ length: size }, () => [] as ChainingCell);
  } else {
    return Array.from({ length: size }, () => ({ key: null, deleted: false }) as OpenAddressingCell);
  }
}

export function simulateOperation(
  currentTable: TableState,
  size: number,
  algorithm: Algorithm,
  operation: 'insert' | 'search' | 'delete',
  val: number
): AnimationFrame[] {
  const frames: AnimationFrame[] = [];
  const table = cloneTable(currentTable);
  
  const h1 = val % size;
  
  if (algorithm === 'separate-chaining') {
    const chainTable = table as ChainingCell[];
    const chain = chainTable[h1];
    
    frames.push({
      table: cloneTable(chainTable),
      activeTarget: { index: h1 },
      status: 'probing',
      log: createLog(`Hash(${val}) = ${val} % ${size} = ${h1}. Checking index ${h1}.`, 'info')
    });

    let foundIdx = -1;
    for (let i = 0; i < chain.length; i++) {
        frames.push({
            table: cloneTable(chainTable),
            activeTarget: { index: h1, chainIndex: i },
            status: 'probing',
            log: createLog(`Traversing chain at index ${h1}... found ${chain[i]}.`, 'info')
        });
        if (chain[i] === val) {
            foundIdx = i;
            break;
        }
    }

    if (operation === 'search') {
        if (foundIdx !== -1) {
            frames.push({
                table: cloneTable(chainTable),
                activeTarget: { index: h1, chainIndex: foundIdx },
                status: 'success',
                log: createLog(`Key ${val} found at index ${h1}, position ${foundIdx}.`, 'success')
            });
        } else {
            frames.push({
                table: cloneTable(chainTable),
                activeTarget: { index: h1 },
                status: 'error',
                log: createLog(`Key ${val} not found in chain at index ${h1}.`, 'warning')
            });
        }
    } else if (operation === 'insert') {
        if (foundIdx !== -1) {
            frames.push({
                table: cloneTable(chainTable),
                activeTarget: { index: h1, chainIndex: foundIdx },
                status: 'error',
                log: createLog(`Key ${val} already exists! Duplicate insertion rejected.`, 'error')
            });
        } else {
            chain.push(val);
            frames.push({
                table: cloneTable(chainTable),
                activeTarget: { index: h1, chainIndex: chain.length - 1 },
                status: 'success',
                log: createLog(`Inserted ${val} at the end of chain ${h1}.`, 'success')
            });
        }
    } else if (operation === 'delete') {
        if (foundIdx !== -1) {
            chain.splice(foundIdx, 1);
            frames.push({
                table: cloneTable(chainTable),
                activeTarget: { index: h1 },
                status: 'success',
                log: createLog(`Deleted ${val} from chain ${h1}.`, 'success')
            });
        } else {
            frames.push({
                table: cloneTable(chainTable),
                activeTarget: { index: h1 },
                status: 'error',
                log: createLog(`Cannot delete: Key ${val} not found.`, 'warning')
            });
        }
    }
    
    return frames;
  } 
  
  // Open Addressing (Linear Probing & Double Hashing)
  const openTable = table as OpenAddressingCell[];
  
  // R is prime smaller than size, fallback to size - 1 if size is small
  const R = [7, 5, 3].find(p => p < size) || Math.max(1, size - 1);
  const h2 = R - (val % R);

  let firstFree = -1;
  let found = false;
  let i = 0;
  
  while (i < size) {
    let probeIdx = -1;
    if (algorithm === 'linear-probing') {
      probeIdx = (h1 + i) % size;
      if (i === 0) {
        frames.push({
            table: cloneTable(openTable), activeTarget: { index: probeIdx }, status: 'probing',
            log: createLog(`Hash(${val}) = ${val} % ${size} = ${probeIdx}. Probing index ${probeIdx}...`, 'info')
        });
      } else {
        frames.push({
            table: cloneTable(openTable), activeTarget: { index: probeIdx }, status: 'probing',
            log: createLog(`Collision! Linear Probing: (${h1} + ${i}) % ${size} = ${probeIdx}. Probing index ${probeIdx}...`, 'info')
        });
      }
    } else { // double-hashing
      probeIdx = (h1 + i * h2) % size;
      if (i === 0) {
        frames.push({
            table: cloneTable(openTable), activeTarget: { index: probeIdx }, status: 'probing',
            log: createLog(`Hash1(${val}) = ${val} % ${size} = ${h1}. Probing index ${probeIdx}...`, 'info')
        });
      } else {
        frames.push({
            table: cloneTable(openTable), activeTarget: { index: probeIdx }, status: 'probing',
            log: createLog(`Collision! Double Hashing step: Hash2(${val}) = ${R} - (${val} % ${R}) = ${h2}. Probing (${h1} + ${i} * ${h2}) % ${size} = ${probeIdx}...`, 'info')
        });
      }
    }

    const cell = openTable[probeIdx];

    if (cell.key === val && !cell.deleted) {
      found = true;
      if (operation === 'search') {
        frames.push({
            table: cloneTable(openTable), activeTarget: { index: probeIdx }, status: 'success',
            log: createLog(`Key ${val} found at index ${probeIdx}.`, 'success')
        });
      } else if (operation === 'insert') {
        frames.push({
            table: cloneTable(openTable), activeTarget: { index: probeIdx }, status: 'error',
            log: createLog(`Key ${val} already exists at index ${probeIdx}! Duplicate rejected.`, 'error')
        });
      } else if (operation === 'delete') {
        openTable[probeIdx].deleted = true;
        // Notice we do NOT set key = null, to conceptually maintain it as a tombstone
        frames.push({
            table: cloneTable(openTable), activeTarget: { index: probeIdx }, status: 'success',
            log: createLog(`Key ${val} deleted from index ${probeIdx}. Slot marked as Tombstone (Lazy Deletion).`, 'success')
        });
      }
      return frames;
    }

    if ((cell.key === null || cell.deleted) && firstFree === -1) {
      firstFree = probeIdx;
      if (operation === 'insert') {
          frames.push({
              table: cloneTable(openTable), activeTarget: { index: probeIdx }, status: 'probing',
              log: createLog(`Index ${probeIdx} is ${cell.deleted ? 'a Tombstone' : 'empty'}. Remembering this slot. Continuing search through cluster to ensure no duplicates...`, 'info')
          });
      }
    } else if (cell.deleted && (operation === 'search' || operation === 'delete')) {
      frames.push({
          table: cloneTable(openTable), activeTarget: { index: probeIdx }, status: 'probing',
          log: createLog(`Index ${probeIdx} is a Tombstone. Continuing search through the cluster...`, 'info')
      });
    }

    if (cell.key === null && !cell.deleted) {
        // Reached end of cluster
        frames.push({
            table: cloneTable(openTable), activeTarget: { index: probeIdx }, status: 'probing',
            log: createLog(`Found pure empty slot (NULL) at ${probeIdx}. End of cluster.`, 'info')
        });
        break; 
    }

    i++;
  }

  // If we reach here, key was not found.
  if (operation === 'search') {
      frames.push({
          table: cloneTable(openTable), activeTarget: null, status: 'error',
          log: createLog(`Key ${val} not found in the table.`, 'warning')
      });
  } else if (operation === 'delete') {
      frames.push({
          table: cloneTable(openTable), activeTarget: null, status: 'error',
          log: createLog(`Cannot delete: Key ${val} not found.`, 'warning')
      });
  } else if (operation === 'insert') {
      if (firstFree !== -1) {
          const wasTombstone = openTable[firstFree].deleted;
          openTable[firstFree] = { key: val, deleted: false };
          frames.push({
              table: cloneTable(openTable), activeTarget: { index: firstFree }, status: 'success',
              log: createLog(wasTombstone ? `Reused Tombstone slot at index ${firstFree} for new key ${val}.` : `Inserted ${val} at empty index ${firstFree}.`, 'success')
          });
      } else {
          frames.push({
              table: cloneTable(openTable), activeTarget: null, status: 'error',
              log: createLog(`Error: Hash Table is full. Cannot insert.`, 'error')
          });
      }
  }

  return frames;
}
