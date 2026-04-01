import { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { Activity } from '../interfaces/interfaces';
import { isTicketSaleActivityActive } from '../types/ticketing';

type ApiErrorPayload = { message?: string; error?: string };

function apiErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error)) return fallback;
  const data = error.response?.data as ApiErrorPayload | undefined;
  return data?.message ?? data?.error ?? fallback;
}

export function useActivities() {
  const fallbackColor = '#F36F6F';
  const colorPresets = ['#F36F6F', '#4F46E5', '#63D1BE', '#D9A05B', '#22C55E', '#0EA5E9'];

  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<Activity[]>([]);

  const { user } = useAuth();

  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [editingActivityId, setEditingActivityId] = useState<number | null>(null);

  const [activityForm, setActivityForm] = useState({
    name: '',
    registration_fee: 0,
    daily_ticket_price: 0,
    monthly_price: 0,
    quarterly_price: 0,
    semester_price: 0,
    yearly_price: 0,
    subscription_only: false,
    is_active: true,
    color: fallbackColor,
  });

  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState<number | null>(null);
  
  const formatNumber = (num: number | null | undefined) => Number(num || 0).toLocaleString('fr-FR');

  const activityColor = useCallback((activity: Activity) => {
    return (activity.color && activity.color.trim()) ? activity.color : fallbackColor;
  }, []);

  const hexToRgba = (hex: string, alpha: number) => {
    const normalized = hex.replace('#', '');
    const value = normalized.length === 3
      ? normalized.split('').map((char) => char + char).join('')
      : normalized;
    const intValue = parseInt(value, 16);
    const r = (intValue >> 16) & 255;
    const g = (intValue >> 8) & 255;
    const b = intValue & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const activityBadgeStyle = useCallback((activity: Activity) => {
    const color = activityColor(activity);
    return {
      backgroundColor: hexToRgba(color, 0.15),
      border: `1px solid ${hexToRgba(color, 0.35)}`,
    };
  }, [activityColor]);

  const selectedActivity = useMemo(() => 
    activities.find((item) => item.id === selectedActivityId) || null
  , [activities, selectedActivityId]);

  useEffect(() => {
    if (activityForm.subscription_only) {
      setActivityForm(prev => ({ ...prev, daily_ticket_price: 0 }));
    }
  }, [activityForm.subscription_only]);

  const fetchActivities = useCallback(async () => {
    try {
      const response = await api.get('/activities');
      setActivities(response.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const resetActivityForm = () => {
    setActivityForm({
      name: '',
      registration_fee: 0,
      daily_ticket_price: 0,
      monthly_price: 0,
      quarterly_price: 0,
      semester_price: 0,
      yearly_price: 0,
      subscription_only: false,
      is_active: true,
      color: fallbackColor,
    });
  };

  const openActivityModal = () => {
    setEditingActivityId(null);
    resetActivityForm();
    setIsActivityModalOpen(true);
  };

  const handleEdit = (activity: Activity) => {
    setEditingActivityId(activity.id);
    setActivityForm({
      name: activity.name,
      registration_fee: Number(activity.registration_fee || 0),
      daily_ticket_price: Number(activity.daily_ticket_price || 0),
      monthly_price: Number(activity.monthly_price || 0),
      quarterly_price: Number(activity.quarterly_price || 0),
      semester_price: Number(activity.semester_price || 0),
      yearly_price: Number(activity.yearly_price || 0),
      subscription_only: Boolean(activity.subscription_only),
      is_active: Boolean(activity.is_active ?? true),
      color: activity.color || fallbackColor,
    });
    setIsActivityModalOpen(true);
  };

  const handleActivitySubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const payload = {
      ...activityForm,
      color: (activityForm.color || fallbackColor).trim(),
      registration_fee: Number(activityForm.registration_fee || 0),
      daily_ticket_price: Number(activityForm.daily_ticket_price || 0),
      monthly_price: Number(activityForm.monthly_price || 0),
      quarterly_price: Number(activityForm.quarterly_price || 0),
      semester_price: Number(activityForm.semester_price || 0),
      yearly_price: Number(activityForm.yearly_price || 0),
      is_active: Boolean(activityForm.is_active),
    };

    try {
      if (editingActivityId) {
        await api.put(`/activities/${editingActivityId}`, payload);
      } else {
        await api.post('/activities', payload);
      }
      await fetchActivities();
      setIsActivityModalOpen(false);
      resetActivityForm();
    } catch (error: unknown) {
      alert(apiErrorMessage(error, "Erreur lors de l'enregistrement"));
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette activité ?')) return;
    try {
      await api.delete(`/activities/${id}`);
      await fetchActivities();
    } catch (error: unknown) {
      alert(apiErrorMessage(error, 'Erreur lors de la suppression'));
    }
  };

  const openSubscriptionModal = (activity: Activity) => {
    if (!isTicketSaleActivityActive(activity)) {
      alert("Cette activité est désactivée.");
      return;
    }
    setSelectedActivityId(activity.id);
    setIsSubscriptionModalOpen(true);
  };

  const toggleActivityStatus = async (activity: Activity) => {
    try {
      await api.put(`/activities/${activity.id}`, {
        name: activity.name,
        registration_fee: Number(activity.registration_fee || 0),
        daily_ticket_price: Number(activity.daily_ticket_price || 0),
        monthly_price: Number(activity.monthly_price || 0),
        quarterly_price: Number(activity.quarterly_price || 0),
        semester_price: Number(activity.semester_price || 0),
        yearly_price: Number(activity.yearly_price || 0),
        subscription_only: Boolean(activity.subscription_only),
        color: activity.color || fallbackColor,
        is_active: !(activity.is_active ?? true),
      });
      await fetchActivities();
    } catch (error: unknown) {
      alert(
        apiErrorMessage(
          error,
          "Impossible de changer le statut de l'activité",
        ),
      );
    }
  };

  const isAdmin = user?.role?.toUpperCase() === 'ADMIN';
  const isCashierOrAdmin = isAdmin || user?.role?.toUpperCase() === 'CAISSIER';

  return {
    loading, activities, isAdmin, isCashierOrAdmin,
    isActivityModalOpen, setIsActivityModalOpen, editingActivityId, activityForm, setActivityForm,
    isSubscriptionModalOpen, setIsSubscriptionModalOpen, selectedActivityId, 
    colorPresets, formatNumber, activityColor, activityBadgeStyle,
    selectedActivity, 
    openActivityModal, handleEdit, handleActivitySubmit, handleDelete,
    openSubscriptionModal, fetchActivities, toggleActivityStatus
  };
}
