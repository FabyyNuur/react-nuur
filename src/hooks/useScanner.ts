import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import api from '../services/api';

type ApiErrorPayload = { message?: string; error?: string };

function apiErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error)) return fallback;
  const data = error.response?.data as ApiErrorPayload | string | undefined;
  if (typeof data === 'string') return data.slice(0, 200) || fallback;
  return data?.message ?? data?.error ?? fallback;
}

export interface ScanLog {
    id: number;
    qr_code_scanned: string;
    is_valid: boolean;
    scanned_at: string;
    details: string;
}

export function useScanner() {
    const [manualCode, setManualCode] = useState('');
    const [scanResult, setScanResult] = useState<{ valid: boolean; message: string } | null>(null);
    const [scanning, setScanning] = useState(false);
    const [loadingLogs, setLoadingLogs] = useState(false);
    const [logs, setLogs] = useState<ScanLog[]>([]);
    const [activeFilter, setActiveFilter] = useState('all');
    const [stats, setStats] = useState({ total: 0, valid: 0, refused: 0 });
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
    const [scannerActive, setScannerActive] = useState(false);
    const [permissionError, setPermissionError] = useState<string | null>(null);

    const fetchLogs = useCallback(async (page = 1) => {
        setLoadingLogs(true);
        try {
            const response = await api.get(`/tickets/logs?page=${page}&limit=${pagination.limit}&filter=${activeFilter}`);
            setLogs(response.data.data || []);
            setPagination(prev => ({
                ...prev,
                page: response.data.pagination?.page || page,
                total: response.data.pagination?.total || 0,
                totalPages: response.data.pagination?.totalPages || 0
            }));

            // Backend doesn't expose a dedicated stats endpoint for logs.
            const currentLogs = response.data.data || [];
            const valid = currentLogs.filter((log: ScanLog) => Boolean(log.is_valid)).length;
            const refused = currentLogs.length - valid;
            setStats({
                total: response.data.pagination?.total || currentLogs.length,
                valid,
                refused,
            });
        } catch (error) {
            console.error("Erreur de récupération des logs", error);
        } finally {
            setLoadingLogs(false);
        }
    }, [activeFilter, pagination.limit]);

    useEffect(() => {
        fetchLogs(1);
    }, [fetchLogs]);

    const handleManualScan = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!manualCode.trim()) return;

        setScanning(true);
        setScanResult(null);
        try {
            const response = await api.post('/tickets/scan', {
                qr_code: manualCode.trim(),
            });
            const result = response.data;
            setScanResult({
                valid: true,
                message: result.message || "Accès autorisé."
            });
            
            // Refresh logs and stats
            await fetchLogs(1);
            setManualCode('');
            
            // Auto hide result after 5 seconds
            setTimeout(() => setScanResult(null), 5000);
        } catch (error: unknown) {
            setScanResult({
                valid: false,
                message: apiErrorMessage(
                    error,
                    'Erreur de connexion au serveur',
                ),
            });
        } finally {
            setScanning(false);
        }
    };

    const startCamera = () => {
        setScannerActive(true);
        setPermissionError(null);
    };

    const stopCamera = () => {
        setScannerActive(false);
    };

    const changePage = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchLogs(newPage);
        }
    };

    const formatTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDateShort = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
    };

    return {
        manualCode, setManualCode, scanResult, setScanResult, scanning, loadingLogs, logs,
        activeFilter, setActiveFilter, stats, pagination, scannerActive, permissionError,
        startCamera, stopCamera, fetchLogs, handleManualScan, changePage, formatTime, formatDateShort
    };
}
