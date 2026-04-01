import { useState, useEffect, useMemo, useCallback } from 'react';
import api from '../services/api';

export interface Transaction {
    id: number;
    amount: number;
    type: 'INCOME' | 'EXPENSE';
    description: string;
    payment_method: string;
    created_at: string;
}

export function useTreasury() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filterPeriod, setFilterPeriod] = useState('all');
    const [filterType, setFilterType] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [saving, setSaving] = useState(false);
    const [page, setPage] = useState(1);
    const pageSize = 8;

    const [formData, setFormData] = useState({
        type: 'INCOME' as 'INCOME' | 'EXPENSE',
        amount: 0,
        description: '',
        payment_method: 'CASH'
    });

    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/transactions');
            setTransactions(response.data.data || []);
        } catch (error) {
            console.error("Erreur de récupération trésorerie", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const openModal = () => {
        setFormData({
            type: 'INCOME',
            amount: 0,
            description: '',
            payment_method: 'CASH'
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.amount <= 0 || !formData.description) return;
        
        setSaving(true);
        try {
            const response = await api.post('/transactions', formData);
            if (response.data.data) {
                setTransactions(prev => [response.data.data, ...prev]);
            } else {
                await fetchTransactions();
            }
            setIsModalOpen(false);
        } catch (error: any) {
            alert(error.response?.data?.message || error.message || "Erreur lors de l'enregistrement");
        } finally {
            setSaving(false);
        }
    };

    const filteredTransactions = useMemo(() => {
        let filtered = [...transactions];

        if (filterPeriod === 'today') {
            const now = new Date();
            filtered = filtered.filter((t) => {
                const created = new Date(t.created_at);
                return created.getFullYear() === now.getFullYear()
                    && created.getMonth() === now.getMonth()
                    && created.getDate() === now.getDate();
            });
        } else if (filterPeriod === 'week') {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            filtered = filtered.filter((t) => new Date(t.created_at) >= weekAgo);
        } else if (filterPeriod === 'month') {
            const monthAgo = new Date();
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            filtered = filtered.filter((t) => new Date(t.created_at) >= monthAgo);
        }

        if (filterType !== 'all') {
            filtered = filtered.filter((t) => t.type === filterType);
        }

        if (searchQuery.trim()) {
            const q = searchQuery.trim().toLowerCase();
            filtered = filtered.filter((t) =>
                (t.description || '').toLowerCase().includes(q)
            );
        }

        return filtered.sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    }, [transactions, filterPeriod, filterType, searchQuery]);

    useEffect(() => {
        setPage(1);
    }, [filterPeriod, filterType, searchQuery]);

    const paginatedTransactions = useMemo(() => {
        const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / pageSize));
        const safePage = Math.min(Math.max(page, 1), totalPages);
        const start = (safePage - 1) * pageSize;
        return {
            items: filteredTransactions.slice(start, start + pageSize),
            page: safePage,
            totalPages,
            total: filteredTransactions.length,
            pageSize,
        };
    }, [filteredTransactions, page]);

    const stats = useMemo(() => {
        const totalIncome = filteredTransactions
            .filter((t) => t.type === 'INCOME')
            .reduce((sum, t) => sum + (t.amount || 0), 0);

        const totalExpense = filteredTransactions
            .filter((t) => t.type === 'EXPENSE')
            .reduce((sum, t) => sum + (t.amount || 0), 0);

        const cashBalance = transactions.reduce((balance, t) => {
            if (t.type === 'INCOME') return balance + (t.amount || 0);
            if (t.type === 'EXPENSE') return balance - (t.amount || 0);
            return balance;
        }, 0);

        return {
            totalIncome,
            totalExpense,
            cashBalance,
            net: totalIncome - totalExpense,
        };
    }, [filteredTransactions, transactions]);

    const exportData = () => {
        const csvRows = [
            ['Date', 'Type', 'Catégorie', 'Montant', 'Description', 'Mode de paiement']
        ];

        filteredTransactions.forEach((t) => {
            csvRows.push([
                new Date(t.created_at).toLocaleString('fr-FR'),
                t.type === 'INCOME' ? 'Recette' : 'Dépense',
                t.type === 'INCOME' ? 'Recette' : 'Dépense',
                t.amount.toString(),
                `"${(t.description || '').replace(/"/g, '""')}"`,
                t.payment_method || 'CASH'
            ]);
        });

        const csvContent = csvRows.map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('href', url);
        a.setAttribute('download', `caisse-nuur-gym-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('fr-FR').format(num);
    };

    return {
        transactions, loading, isModalOpen, setIsModalOpen, filterPeriod, setFilterPeriod,
        filterType, setFilterType, searchQuery, setSearchQuery, saving, formData, setFormData,
        filteredTransactions, paginatedTransactions, page, setPage, stats, openModal, handleSubmit, exportData, formatNumber
    };
}
