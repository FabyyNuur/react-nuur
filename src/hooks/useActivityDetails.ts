import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { Activity } from '../interfaces/interfaces';

export type SubscriptionDetail = {
  subscription_id: number;
  client_id?: number;
  first_name: string;
  last_name: string;
  email?: string | null;
  phone?: string | null;
  end_date: string;
  status: string;
  last_access_at?: string | null;
};

export type TicketDetail = {
  ticket_id: number;
  price: number;
  valid_until: string;
  status: string;
  last_access_at?: string | null;
};

export function useActivityDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [subscriptions, setSubscriptions] = useState<SubscriptionDetail[]>([]);
  const [tickets, setTickets] = useState<TicketDetail[]>([]);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [metrics, setMetrics] = useState({
    subscribers_count: 0,
    active_subscribers_count: 0,
    tickets_count: 0,
  });

  const activityId = useMemo(() => Number(id), [id]);

  const formatNumber = (num: number | null | undefined) => Number(num || 0).toLocaleString('fr-FR');

  const formatDate = (value?: string | null) => {
    if (!value) return 'N/A';
    return new Date(value).toLocaleDateString('fr-FR');
  };

  const formatDateTime = (value?: string | null) => {
    if (!value) return 'Aucun accès';
    return new Date(value).toLocaleString('fr-FR');
  };

  const isSubActive = (item: SubscriptionDetail) => {
    const end = new Date(item.end_date);
    return !Number.isNaN(end.getTime()) && end > new Date();
  };

  const isTicketValid = (item: TicketDetail) => {
    if (item.status !== 'VALID') return false;
    return new Date(item.valid_until) > new Date();
  };

  const fetchDetails = useCallback(async () => {
    if (!activityId) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.get(`/activities/${activityId}/details`);
      setActivity(response.data.data.activity);
      setSubscriptions(response.data.data.subscriptions);
      setTickets(response.data.data.tickets);
      setMetrics(response.data.data.metrics);
    } catch (error: any) {
      if (error?.response?.status === 404) {
        alert("Cette activité est indisponible.");
        navigate("/activities");
        return;
      }
      console.error(error);
      setActivity(null);
    } finally {
      setLoading(false);
    }
  }, [activityId, navigate]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const goBack = () => navigate('/activities');


  const isCashierOrAdmin = useMemo(() => {
    const role = user?.role?.toUpperCase();
    return role === 'ADMIN' || role === 'CAISSIER';
  }, [user]);

  const latestSubscriptions = useMemo(() => {
    const byClient = new Map<string, SubscriptionDetail>();
    for (const sub of subscriptions) {
      const key =
        sub.client_id != null
          ? `id:${sub.client_id}`
          : `name:${sub.first_name.toLowerCase()}|${sub.last_name.toLowerCase()}|${(sub.phone || sub.email || "").toLowerCase()}`;
      const current = byClient.get(key);
      if (!current) {
        byClient.set(key, sub);
        continue;
      }

      const currentEnd = new Date(current.end_date).getTime();
      const nextEnd = new Date(sub.end_date).getTime();
      if (nextEnd > currentEnd) {
        byClient.set(key, sub);
      }
    }
    return Array.from(byClient.values()).sort(
      (a, b) => new Date(b.end_date).getTime() - new Date(a.end_date).getTime(),
    );
  }, [subscriptions]);

  const filteredSubscriptions = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return latestSubscriptions;
    return latestSubscriptions.filter(s => 
      s.first_name.toLowerCase().includes(q) || 
      s.last_name.toLowerCase().includes(q) ||
      (s.phone && s.phone.includes(q)) ||
      (s.email && s.email.toLowerCase().includes(q))
    );
  }, [latestSubscriptions, searchQuery]);

  const filteredTickets = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return tickets;
    return tickets.filter(t => 
      t.ticket_id.toString().includes(q)
    );
  }, [tickets, searchQuery]);

  return {
    loading, activity, 
    subscriptions: filteredSubscriptions, 
    tickets: filteredTickets, 
    metrics, isCashierOrAdmin,
    formatNumber, formatDate, formatDateTime,
    isSubActive, isTicketValid,
    goBack, fetchDetails,
    isSubscriptionModalOpen, setIsSubscriptionModalOpen,
    searchQuery, setSearchQuery
  };
}
