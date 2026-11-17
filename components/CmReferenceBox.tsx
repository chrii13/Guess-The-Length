'use client'

// Riferimento di 1 cm reale (unità CSS cm), da usare come unità di misura a occhio
export function CmReferenceBox() {
  return (
    <div className="flex flex-col items-end gap-1.5">
      <div
        className="h-5 border-x border-b border-inchiostro"
        style={{ width: '1cm', minWidth: '1cm', maxWidth: '1cm' }}
      />
      <p className="whitespace-nowrap text-xs text-grafite">Questo è 1 cm</p>
    </div>
  )
}
