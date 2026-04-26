import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

type NoteSection = {
  id: string;
  title: string;
  intro: string;
  points: string[];
};

type Props = {
  activeNoteId: string | null;
  onSelectNote: (id: string) => void;
  onCloseNote: () => void;
};

const noteSections: NoteSection[] = [
  {
    id: 'hashing',
    title: 'Hashing',
    intro: 'Hashing is an efficient dictionary technique where keys are distributed into a one-dimensional table using a computed address.',
    points: [
      'Its core goal is to support insertion, search, and deletion efficiently.',
      'Keys are distributed into an array H[0 ... m-1], called the hash table.',
      'For each key, we compute a predefined function h, called the hash function.',
      'The value returned by h is the hash address used as the storage location.',
      'Example: with m = 10 and h(key) = length(key) mod 10, the key "apple" maps to address 5.',
      'A practical hash design balances three competing needs: keep table size reasonable, distribute keys evenly, and keep h easy to compute.',
    ],
  },
  {
    id: 'collision',
    title: 'Collision',
    intro: 'A collision is the normal case where multiple keys map to the same table cell.',
    points: [
      'If table size m is smaller than the number of keys n, collisions are unavoidable.',
      'Collision means two or more keys are hashed into the same cell.',
      'Example: with length-based hashing and m = 10, both "apple" and "grape" map to index 5.',
      'Collisions should still be expected even when m is larger than n.',
      'In the worst case, all keys could end up in one cell.',
      'With a well-chosen table size and good hash function, that worst case is rare.',
    ],
  },
  {
    id: 'types-of-hashing',
    title: 'Types of hashing',
    intro: 'Collision handling is typically organized into two main families.',
    points: [
      'Open Hashing (Separate Chaining).',
      'Closed Hashing (Open Addressing).',
      'Both solve the same collision problem, but with different storage and probing behavior.',
    ],
  },
  {
    id: 'open-hashing',
    title: 'Open Hashing (Separate Chaining)',
    intro: 'Separate chaining stores colliding keys in linked lists attached to each hash table cell.',
    points: [
      'Each list contains all keys hashed to that cell.',
      'If "apple" is already at index 5 and "grape" also hashes to 5, "grape" is appended to the linked list from H[5].',
      'Search efficiency depends on chain length, which depends on dictionary size, table size, and hash quality.',
      'If n keys are distributed evenly across m cells, average chain length is about n/m.',
      'Load factor is α = n/m and is central to performance.',
      'Expected pointer inspections: successful search s = 1 + α/2, unsuccessful search U = α (under uniform distribution assumptions).',
      'Compared to a plain linked list, hashing reduces average list size by about a factor of m.',
      'Keep α near 1: too small wastes space with empty lists, too large creates long lists and slower searches.',
      'Insertion is typically at the end of a list.',
      'Deletion is done by searching for the key and removing it from its list.',
      'Insertion and deletion therefore have the same average efficiency profile as searching.',
      'When n is about m, average-case performance is Θ(1).',
    ],
  },
  {
    id: 'closed-hashing',
    title: 'Closed Hashing (Open Addressing)',
    intro: 'Open addressing stores all keys directly in the table and resolves collisions by probing alternative slots.',
    points: [
      'No linked lists are used; all keys stay in the hash table itself.',
      'Because of that, table size m must be at least as large as key count n.',
      'Different collision-resolution strategies are used within open addressing.',
    ],
  },
  {
    id: 'linear-probing',
    title: 'Linear Probing',
    intro: 'Linear probing is the simplest open-addressing strategy: on collision, check the next slot, then the next, and so on.',
    points: [
      'If the next cell is empty, place the new key there.',
      'If occupied, continue to immediate successors until a suitable slot is found.',
      'At the end of the table, probing wraps to the beginning (circular array behavior).',
      'Approximate average probe counts are often written as:',
      'Successful search: S = 1/2 * (1 + 1/(1 - α)).',
      'Unsuccessful search: U = 1/2 * (1 + 1/(1 - α)²).',
      'These approximations become more accurate for larger hash table sizes.',
    ],
  },
  {
    id: 'searching',
    title: 'Searching',
    intro: 'Open-addressing search starts from the hashed location and follows the probe sequence until it can prove success or failure.',
    points: [
      'Compute h(K) for the target key K.',
      'If cell h(K) is empty, the search is unsuccessful.',
      'If the cell is occupied, compare K with that occupant.',
      'If equal, the key is found.',
      'If not equal, continue checking the next probe positions until either a match or an empty cell is encountered.',
    ],
  },
  {
    id: 'deletion',
    title: 'Deletion',
    intro: 'In open addressing, deletion must preserve probe chains; otherwise later searches can fail incorrectly.',
    points: [
      'Simple hard-deletion can break the path needed to find keys inserted later in the same cluster.',
      'As a result, a valid search may be reported as unsuccessful.',
      'The fix is lazy deletion: mark deleted cells with a special tombstone symbol.',
      'Tombstones distinguish previously-occupied slots from never-used slots.',
      'This preserves search correctness and still allows future insertions to reuse space.',
    ],
  },
  {
    id: 'clustering',
    title: 'Clustering',
    intro: 'As linear probing tables get fuller, contiguous occupied runs appear and performance deteriorates.',
    points: [
      'A cluster is a sequence of contiguously occupied cells (possibly with wrapping).',
      'Clusters hurt dictionary operation efficiency.',
      'As clusters grow, new keys are increasingly likely to attach to existing clusters.',
      'Large clusters can merge when new keys arrive, which worsens the clustering effect further.',
    ],
  },
  {
    id: 'double-hashing',
    title: 'Double Hashing',
    intro: 'Double hashing introduces a second hash function to choose probe step size after collisions.',
    points: [
      'If l = h(K) is the initial location, the probe sequence is typically (l + s(K)) % m, (l + 2s(K)) % m, and so on.',
      'To guarantee all table locations are reachable in probing, s(K) and m should be relatively prime.',
      'With strong primary and secondary hash functions, double hashing is generally superior to linear probing.',
      'Performance still degrades as the table gets close to full.',
      'Standard remedy: rehash by scanning the table and relocating keys into a larger table.',
    ],
  },
  {
    id: 'finishers',
    title: 'Hashing finishers',
    intro: 'Final takeaway: hashing is usually very fast, but it has limits and tradeoffs.',
    points: [
      'Searching, insertion, and deletion are Θ(1) on average, but can degrade to Θ(n) in rare worst-case patterns.',
      'Hashing does not assume key ordering and generally does not preserve order.',
      'Because of this, hashing is less suitable for ordered iteration and range queries such as counting keys between lower and upper bounds.',
    ],
  },
  {
    id: 'applications',
    title: 'Applications of Hashing',
    intro: 'Hashing appears across systems that depend on fast lookup and rapid existence checks.',
    points: [
      'Compilers use hash tables for symbol tables and identifier lookups.',
      'Web browsers and servers use hashing in caches for recently accessed data.',
      'Databases use hashing in indexing and record-to-block mapping (for example, extendible hashing).',
      'Security and cryptography use hashing for password verification and integrity checks.',
      'AI and game systems use hashing to quickly detect whether a state or position has already been evaluated.',
    ],
  },
];

function SectionCard({ section, onSelect }: { section: NoteSection; onSelect: (id: string) => void }) {
  return (
    <motion.button
      type="button"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(section.id)}
      className="w-full rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-left shadow-[0_0_0_1px_rgba(15,23,42,0.2)] transition-colors hover:border-cyan-500/40 hover:bg-slate-900"
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-white leading-snug">{section.title}</h3>
        <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-slate-400">{section.intro}</p>
    </motion.button>
  );
}

export function EducationalSection({ activeNoteId, onSelectNote, onCloseNote }: Props) {
  const selectedSection = noteSections.find((section) => section.id === activeNoteId) ?? null;
  const selectedIndex = selectedSection ? noteSections.findIndex((section) => section.id === selectedSection.id) : -1;
  const hasPreviousSection = selectedIndex > 0;
  const hasNextSection = selectedIndex >= 0 && selectedIndex < noteSections.length - 1;

  const handlePreviousSection = () => {
    if (!hasPreviousSection) return;
    const previousSection = noteSections[selectedIndex - 1];
    onSelectNote(previousSection.id);
  };

  const handleNextSection = () => {
    if (!hasNextSection) return;
    const nextSection = noteSections[selectedIndex + 1];
    onSelectNote(nextSection.id);
  };

  return (
    <>
      <section className="text-slate-300">
        <div className="space-y-3">
          {noteSections.map((section) => (
            <SectionCard key={section.id} section={section} onSelect={onSelectNote} />
          ))}
        </div>
      </section>

      <AnimatePresence>
        {selectedSection && (
          <motion.div
            key="note-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4"
            onClick={onCloseNote}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
              className="w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-950 shadow-2xl shadow-cyan-950/30 overflow-hidden"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4 border-b border-slate-800 px-5 py-4">
                <div>
                  <h3 className="text-xl font-semibold text-white">{selectedSection.title}</h3>
                </div>
                <button
                  type="button"
                  onClick={onCloseNote}
                  className="rounded-lg border border-slate-700 bg-slate-900 p-2 text-slate-400 transition-colors hover:text-white hover:border-slate-500"
                  aria-label="Close notes popup"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="max-h-[70vh] overflow-y-auto px-5 py-4 custom-scrollbar">
                <p className="text-sm leading-relaxed text-slate-300">{selectedSection.intro}</p>
                <ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate-200">
                  {selectedSection.points.map((point) => (
                    <li key={point} className="flex gap-3">
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-cyan-500" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-between border-t border-slate-800 px-5 py-3 bg-slate-950">
                <span className="text-xs text-slate-500">
                  Page {selectedIndex + 1} of {noteSections.length}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePreviousSection}
                    disabled={!hasPreviousSection}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm font-semibold text-slate-200 transition-colors hover:border-cyan-500/60 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous Page
                  </button>
                  <button
                    type="button"
                    onClick={handleNextSection}
                    disabled={!hasNextSection}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm font-semibold text-slate-200 transition-colors hover:border-cyan-500/60 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next Page
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
