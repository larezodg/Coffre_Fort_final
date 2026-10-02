import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface Column<T> {
    key: string;
    label: string;
    render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    searchable?: boolean;
    searchPlaceholder?: string;
    onSearch?: (query: string) => void;
    actions?: (item: T) => React.ReactNode;
    emptyMessage?: string;
    loading?: boolean;
}

function DataTable<T extends Record<string, any>>({
                                                      columns, data, searchable, searchPlaceholder = 'Rechercher...', onSearch, actions, emptyMessage = 'Aucune donnée disponible', loading,
                                                  }: DataTableProps<T>) {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);
    const pageSize = 10;

    const filtered = searchable && !onSearch
        ? data.filter((item) => columns.some((col) => String(item[col.key] ?? '').toLowerCase().includes(search.toLowerCase())))
        : data;

    const paged = filtered.slice(page * pageSize, (page + 1) * pageSize);
    const totalPages = Math.ceil(filtered.length / pageSize);

    return (
        <div className="medical-card p-0 overflow-hidden">
            {searchable && (
                <div className="p-4 border-b border-border">
                    <div className="relative max-w-sm">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="search"
                            placeholder={searchPlaceholder}
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(0); onSearch?.(e.target.value); }}
                            className="medical-input pl-9"
                            aria-label={searchPlaceholder}
                        />
                    </div>
                </div>
            )}
            <div className="overflow-x-auto">
                <table className="medical-table" role="table">
                    <thead>
                    <tr>
                        {columns.map((col) => (
                            <th key={col.key} scope="col">{col.label}</th>
                        ))}
                        {actions && <th scope="col">Actions</th>}
                    </tr>
                    </thead>
                    <tbody>
                    {loading ? (
                        <tr><td colSpan={columns.length + (actions ? 1 : 0)} className="text-center py-12 text-muted-foreground">
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                                Chargement...
                            </div>
                        </td></tr>
                    ) : paged.length === 0 ? (
                        <tr><td colSpan={columns.length + (actions ? 1 : 0)} className="text-center py-12 text-muted-foreground">{emptyMessage}</td></tr>
                    ) : (
                        paged.map((item, i) => (
                            <tr key={item.id ?? i}>
                                {columns.map((col) => (
                                    <td key={col.key}>{col.render ? col.render(item) : String(item[col.key] ?? '')}</td>
                                ))}
                                {actions && <td>{actions(item)}</td>}
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                    <span className="text-sm text-muted-foreground">{filtered.length} résultat(s)</span>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="p-1.5 rounded-md hover:bg-muted disabled:opacity-30" aria-label="Page précédente">
                            <ChevronLeft size={16} />
                        </button>
                        <span className="text-sm">{page + 1} / {totalPages}</span>
                        <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="p-1.5 rounded-md hover:bg-muted disabled:opacity-30" aria-label="Page suivante">
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DataTable;
