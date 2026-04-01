import { useState, useEffect, useMemo, useCallback } from 'react';
import api from '../services/api';
import type { Client, Activity } from '../interfaces/interfaces';
import type { ClientRegistrationForm } from '../types/clientForms';
import { isTicketSaleActivityActive } from '../types/ticketing';
import { EMPTY_CLIENT_FORM } from '../types/clientForms';
import type { ClientHistoryEntry } from '../types/clientHistory';

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [qrClient, setQrClient] = useState<Client | null>(null);
  const [detailClient, setDetailClient] = useState<Client | null>(null);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [currentHistory, setCurrentHistory] = useState<ClientHistoryEntry[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [originalActivityIds, setOriginalActivityIds] = useState<number[]>([]); // Activités déjà souscrites

  const [formData, setFormData] = useState<ClientRegistrationForm>({
    ...EMPTY_CLIENT_FORM,
  });

  const [editForm, setEditForm] = useState<ClientRegistrationForm>({
    ...EMPTY_CLIENT_FORM,
  });

  const formatNumberLocal = (num: number) => {
    return Number(num || 0).toLocaleString('fr-FR');
  };

  const [copied, setCopied] = useState(false);
  const copyToClipboard = async (text: string) => {
    if (!text) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'absolute';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => { setCopied(false); }, 2000);
    } catch {
      console.error('Erreur copie code');
    }
  };

  const calculatedRegFee = useMemo(() => {
    if (formData.subscription_mode === 'pack') return 15000;
    return formData.selected_activity_ids.reduce((sum, id) => {
      const act = activities.find(a => a.id === id);
      return sum + (act?.registration_fee || 0);
    }, 0);
  }, [formData.subscription_mode, formData.selected_activity_ids, activities]);

  const calculatedSubFee = useMemo(() => {
    const months = Number(formData.duration_months);
    if (formData.subscription_mode === 'pack') return 30000 * months;

    return formData.selected_activity_ids.reduce((sum, id) => {
      const act = activities.find(a => a.id === id);
      let price = act?.monthly_price || 0;
      if (months >= 12 && act?.yearly_price) price = act.yearly_price / 12;
      else if (months >= 6 && act?.semester_price) price = act.semester_price / 6;
      else if (months >= 3 && act?.quarterly_price) price = act.quarterly_price / 3;
      return sum + (price * months);
    }, 0);
  }, [formData.subscription_mode, formData.duration_months, formData.selected_activity_ids, activities]);

  const formTotalDue = useMemo(() => {
    const registrationDue = formData.waive_registration_fee ? 0 : calculatedRegFee;
    const raw = formData.only_registration_today
      ? registrationDue
      : calculatedSubFee + (formData.include_registration_fee ? registrationDue : 0);
    const discount = Math.min(Math.max(formData.discount_percent || 0, 0), 100);
    return Math.round(raw * (1 - discount / 100));
  }, [
    calculatedRegFee,
    calculatedSubFee,
    formData.discount_percent,
    formData.only_registration_today,
    formData.include_registration_fee,
    formData.waive_registration_fee,
  ]);

  const formExpirationDate = useMemo(() => {
    const months = Number(formData.duration_months);
    const d = new Date();
    d.setMonth(d.getMonth() + months);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  }, [formData.duration_months]);

  const editRegFee = useMemo(() => {
    // Pas de frais d'inscription si renouvellement (activités déjà souscrites)
    if (editForm.subscription_mode === 'pack') return 0;
    const newActivityIds = editForm.selected_activity_ids.filter(
      (id) => !originalActivityIds.includes(id)
    );
    return newActivityIds.reduce((sum, id) => {
      const act = activities.find(a => a.id === id);
      return sum + (act?.registration_fee || 0);
    }, 0);
  }, [editForm.subscription_mode, editForm.selected_activity_ids, activities, originalActivityIds]);

  const editSubFee = useMemo(() => {
    const months = Number(editForm.duration_months);
    // Seulement les NOUVELLES activités (pas celles déjà souscrites)
    const newActivityIds = editForm.selected_activity_ids.filter(
      (id) => !originalActivityIds.includes(id)
    );
    if (editForm.subscription_mode === 'pack') return 30000 * months;
    return newActivityIds.reduce((sum, id) => {
      const act = activities.find(a => a.id === id);
      let price = act?.monthly_price || 0;
      if (months >= 12 && act?.yearly_price) price = act.yearly_price / 12;
      else if (months >= 6 && act?.semester_price) price = act.semester_price / 6;
      else if (months >= 3 && act?.quarterly_price) price = act.quarterly_price / 3;
      return sum + (price * months);
    }, 0);
  }, [editForm.subscription_mode, editForm.duration_months, editForm.selected_activity_ids, activities, originalActivityIds]);

  const editTotalDue = useMemo(() => {
    const registrationDue = editForm.waive_registration_fee ? 0 : editRegFee;
    const raw = editForm.only_registration_today
      ? registrationDue
      : editSubFee + (editForm.include_registration_fee ? registrationDue : 0);
    const discount = Math.min(Math.max(editForm.discount_percent || 0, 0), 100);
    return Math.round(raw * (1 - discount / 100));
  }, [
    editRegFee,
    editSubFee,
    editForm.discount_percent,
    editForm.only_registration_today,
    editForm.include_registration_fee,
    editForm.waive_registration_fee,
  ]);

  const editExpirationDate = useMemo(() => {
    const months = Number(editForm.duration_months);
    const d = new Date();
    d.setMonth(d.getMonth() + months);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  }, [editForm.duration_months]);

  const fetchClients = useCallback(async () => {
    try {
      const response = await api.get('/clients');
      setClients(response.data.data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const fetchActivities = useCallback(async () => {
    try {
      const response = await api.get('/activities');
      setActivities(response.data.data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    fetchClients();
    fetchActivities();
  }, [fetchClients, fetchActivities]);

  const subscribableActivities = useMemo(
    () => activities.filter(isTicketSaleActivityActive),
    [activities],
  );

  /** Liste édition abonnement : actives + anciennes activités du client désormais inactives (lecture seule). */
  const activitiesForEditModal = useMemo(() => {
    if (!editClient) {
      return subscribableActivities;
    }
    const extra = activities.filter(
      (a) =>
        originalActivityIds.includes(a.id) &&
        !subscribableActivities.some((b) => b.id === a.id),
    );
    return [...subscribableActivities, ...extra];
  }, [
    editClient,
    activities,
    subscribableActivities,
    originalActivityIds,
  ]);

  const openModal = () => {
    setFormData({ ...EMPTY_CLIENT_FORM });
    setIsModalOpen(true);
  };

  const selectDetail = (client: Client) => {
    setDetailClient(detailClient?.id === client.id ? null : client);
  };

  const openEdit = (client: Client) => {
    setEditClient(client);
    const currentIds = client.activity_ids ? String(client.activity_ids).split(',').map(Number) : [];
    const hasPackName = client.activity_name?.toLowerCase().includes('pack');
    const isPack = !!hasPackName;

    setOriginalActivityIds(isPack ? [] : currentIds);
    const activeCurrentIds = currentIds.filter((id) => {
      const act = activities.find((a) => a.id === id);
      return act && isTicketSaleActivityActive(act);
    });
    setEditForm({
      first_name: client.first_name,
      last_name: client.last_name,
      email: client.email || '',
      phone: client.phone || '',
      address: client.address || '',
      subscription_mode: isPack ? 'pack' : 'custom',
      selected_activity_ids: isPack ? [] : activeCurrentIds,
      duration_months: '1',
      payment_method: 'CASH',
      discount_percent: 0,
      only_registration_today: false,
      include_registration_fee: true,
      waive_registration_fee: false,
    });
    setSaveError('');
    setSaveSuccess(false);
  };

  const openHistory = async (clientId: number) => {
    setIsHistoryOpen(true);
    setLoadingHistory(true);
    try {
      const response = await api.get(`/clients/${clientId}/history`);
      setCurrentHistory(response.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const filteredClients = useMemo(() => {
    if (!searchQuery) return clients;
    const q = searchQuery.toLowerCase();
    return clients.filter(c =>
      c.first_name.toLowerCase().includes(q) ||
      c.last_name.toLowerCase().includes(q) ||
      (c.client_code || '').toLowerCase().includes(q)
    );
  }, [searchQuery, clients]);

  const isSubscriptionValid = (endDate?: string) => {
    if (!endDate) return false;
    return new Date(endDate) > new Date();
  };

  const formatDate = (date?: string) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const sendWhatsapp = (client: Client) => {
    alert(`QR Code envoyé par WhatsApp au ${client.phone}`);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      if (formData.subscription_mode === 'custom' && formData.selected_activity_ids.length === 0) {
        alert("Sélectionnez au moins une activité");
        return;
      }
      if (formData.subscription_mode === 'pack' && subscribableActivities.length === 0) {
        alert("Aucune activité active : le pack complet n'est pas disponible pour de nouveaux abonnements.");
        return;
      }
      const activityIds =
        formData.subscription_mode === 'pack'
          ? subscribableActivities.map((a) => a.id)
          : formData.selected_activity_ids;
      await api.post('/clients', {
        ...formData,
        activity_id: activityIds,
        amount_paid: formTotalDue,
        subscription_type: Number(formData.duration_months) === 3 ? 'quarterly' : 
                          Number(formData.duration_months) === 6 ? 'semester' :
                          Number(formData.duration_months) === 12 ? 'yearly' : 'monthly',
        include_registration_fee: formData.include_registration_fee,
        only_registration_today: formData.only_registration_today,
        waive_registration_fee: formData.waive_registration_fee,
      });
      await fetchClients();
      setIsModalOpen(false);
    } catch {
      alert("Erreur lors de l'inscription");
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editClient) return;
    setSaving(true);
    setSaveError('');
    setSaveSuccess(false);
    try {
      if (editForm.subscription_mode === 'pack' && subscribableActivities.length === 0) {
        setSaveError("Aucune activité active : impossible d'appliquer le pack.");
        setSaving(false);
        return;
      }
      const activityIds =
        editForm.subscription_mode === 'pack'
          ? subscribableActivities.map((a) => a.id)
          : editForm.selected_activity_ids;
      await api.put(`/clients/${editClient.id}`, {
        ...editForm,
        activity_id: activityIds,
        amount_paid: editTotalDue,
        subscription_type: Number(editForm.duration_months) === 3 ? 'quarterly' : 
                          Number(editForm.duration_months) === 6 ? 'semester' :
                          Number(editForm.duration_months) === 12 ? 'yearly' : 'monthly',
        include_registration_fee: editForm.include_registration_fee,
        only_registration_today: editForm.only_registration_today,
        waive_registration_fee: editForm.waive_registration_fee,
      });
      await fetchClients();
      setSaveSuccess(true);
      setTimeout(() => { setEditClient(null); }, 1200);
    } catch (err: unknown) {
      const msg =
        err &&
        typeof err === 'object' &&
        'response' in err &&
        err.response &&
        typeof err.response === 'object' &&
        'data' in err.response &&
        err.response.data &&
        typeof err.response.data === 'object' &&
        'message' in err.response.data &&
        typeof (err.response.data as { message?: unknown }).message === 'string'
          ? (err.response.data as { message: string }).message
          : null;
      setSaveError(msg || 'Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  return {
    clients,
    activities,
    subscribableActivities,
    activitiesForEditModal,
    isModalOpen,
    setIsModalOpen,
    searchQuery,
    setSearchQuery,
    qrClient,
    setQrClient,
    detailClient,
    setDetailClient,
    editClient, setEditClient, saving, saveError, saveSuccess, isHistoryOpen, setIsHistoryOpen, currentHistory, loadingHistory,
    formData, setFormData, editForm, setEditForm, copied, calculatedRegFee, calculatedSubFee, formTotalDue, formExpirationDate,
    editRegFee, editSubFee, editTotalDue, editExpirationDate, filteredClients, originalActivityIds,
    formatNumberLocal, copyToClipboard, openModal, selectDetail, openEdit, openHistory,
    isSubscriptionValid, formatDate, sendWhatsapp, handleSubmit, handleSave, fetchClients
  };
}
