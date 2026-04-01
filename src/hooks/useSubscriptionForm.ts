import { useState, useEffect, useMemo, useCallback } from 'react';
import api from '../services/api';
import type { Activity, Client } from '../interfaces/interfaces';

export function useSubscriptionForm(activity: Activity | null, onSuccess?: () => void) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [subscriptionForm, setSubscriptionForm] = useState({
    clientMode: 'existing' as 'existing' | 'new',
    client_id: 0,
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    subscription_type: 'monthly',
    payment_method: 'CASH',
    only_registration_today: false,
    include_registration_fee: true,
    waive_registration_fee: false,
    discount_percent: 0,
  });

  const fetchClients = useCallback(async () => {
    setLoadingClients(true);
    try {
      const response = await api.get('/clients');
      setClients(response.data.data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoadingClients(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const selectedClient = useMemo(() => 
    clients.find(c => c.id === subscriptionForm.client_id) || null
  , [clients, subscriptionForm.client_id]);

  const subscriptionTypeOptions = useMemo(() => {
    if (!activity) return [{ value: 'monthly', label: 'Mensuel', price: 0 }];

    const options = [
      { value: 'monthly', label: 'Mensuel', price: Number(activity.monthly_price || 0) },
      { value: 'quarterly', label: 'Trimestriel', price: Number(activity.quarterly_price || 0) },
      { value: 'semester', label: 'Semestriel', price: Number(activity.semester_price || 0) },
      { value: 'yearly', label: 'Annuel', price: Number(activity.yearly_price || 0) },
    ].filter((option) => option.price > 0);

    return options.length ? options : [{ value: 'monthly', label: 'Mensuel', price: 0 }];
  }, [activity]);

  const selectedSubscriptionPrice = useMemo(() => {
    const selectedType = subscriptionTypeOptions.find((option) => option.value === subscriptionForm.subscription_type);
    return selectedType ? selectedType.price : 0;
  }, [subscriptionTypeOptions, subscriptionForm.subscription_type]);

  const registrationFeeDue = useMemo(() => {
    if (!activity || subscriptionForm.waive_registration_fee) return 0;
    return Number(activity.registration_fee || 0);
  }, [activity, subscriptionForm.waive_registration_fee]);

  const totalDue = useMemo(() => {
    let raw = 0;
    if (subscriptionForm.only_registration_today) {
      raw = registrationFeeDue;
    } else {
      const includeRegistration = subscriptionForm.include_registration_fee && !subscriptionForm.waive_registration_fee;
      raw = selectedSubscriptionPrice + (includeRegistration ? registrationFeeDue : 0);
    }
    const discount = Math.min(Math.max(subscriptionForm.discount_percent || 0, 0), 100);
    return Math.round(raw * (1 - discount / 100));
  }, [subscriptionForm.only_registration_today, subscriptionForm.include_registration_fee, subscriptionForm.waive_registration_fee, subscriptionForm.discount_percent, selectedSubscriptionPrice, registrationFeeDue]);

  useEffect(() => {
    if (activity) {
      const hasSelectedType = subscriptionTypeOptions.some((option) => option.value === subscriptionForm.subscription_type);
      if (!hasSelectedType && subscriptionTypeOptions.length > 0) {
        setSubscriptionForm(prev => ({ ...prev, subscription_type: subscriptionTypeOptions[0].value }));
      }
    }
  }, [activity, subscriptionTypeOptions, subscriptionForm.subscription_type]);

  useEffect(() => {
    if (subscriptionForm.waive_registration_fee) {
      setSubscriptionForm(prev => ({ ...prev, include_registration_fee: false }));
    }
  }, [subscriptionForm.waive_registration_fee]);

  useEffect(() => {
    if (subscriptionForm.only_registration_today) {
      setSubscriptionForm(prev => ({ ...prev, include_registration_fee: true }));
    }
  }, [subscriptionForm.only_registration_today]);

  const resetSubscriptionForm = useCallback(() => {
    setSubscriptionForm({
      clientMode: 'existing',
      client_id: 0,
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      address: '',
      subscription_type: subscriptionTypeOptions[0]?.value || 'monthly',
      payment_method: 'CASH',
      only_registration_today: false,
      include_registration_fee: true,
      waive_registration_fee: false,
      discount_percent: 0,
    });
  }, [subscriptionTypeOptions]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activity) return;

    setSubmitting(true);
    const amountPaid = Number(totalDue || 0);
    const paymentMethod = subscriptionForm.payment_method;

    try {
      if (subscriptionForm.clientMode === 'existing') {
        if (!subscriptionForm.client_id) {
          alert('Veuillez sélectionner un client.');
          setSubmitting(false);
          return;
        }
        await api.post(`/clients/${subscriptionForm.client_id}/subscribe`, {
          activity_id: activity.id,
          amount_paid: amountPaid,
          payment_method: paymentMethod,
          subscription_type: subscriptionForm.subscription_type,
          discount_percent: subscriptionForm.discount_percent, // Ensure discount is passed if backend supports it
        });
      } else {
        await api.post('/clients', {
          ...subscriptionForm,
          activity_id: activity.id,
          amount_paid: amountPaid,
          include_registration_fee: subscriptionForm.include_registration_fee && !subscriptionForm.waive_registration_fee,
        });
      }
      resetSubscriptionForm();
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error('Subscription error:', error);
      alert(error?.response?.data?.message || "Erreur lors de l'enregistrement de l'abonnement");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    subscriptionForm,
    setSubscriptionForm,
    clients,
    loadingClients,
    submitting,
    selectedClient,
    subscriptionTypeOptions,
    selectedSubscriptionPrice,
    registrationFeeDue,
    totalDue,
    handleSubmit,
    resetSubscriptionForm
  };
}
