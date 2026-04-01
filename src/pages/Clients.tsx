import { Search, UserPlus } from "lucide-react";
import { useClients } from "../hooks/useClients";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { cn } from "../lib/utils";
import { useState } from "react";
import { getClientActivities } from "../lib/clientActivities";
import { ClientCard } from "../components/clients/ClientCard";
import { ClientDetailsPanel } from "../components/clients/ClientDetailsPanel";
import { ClientAddModal } from "../components/clients/ClientAddModal";
import { ClientEditModal } from "../components/clients/ClientEditModal";
import { ClientHistoryModal } from "../components/clients/ClientHistoryModal";
import { ClientQrDialog } from "../components/clients/ClientQrDialog";

export default function Clients() {
  const [addStep, setAddStep] = useState<1 | 2>(1);
  const [editStep, setEditStep] = useState<1 | 2>(1);
  const {
    clients,
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
    editClient,
    setEditClient,
    saving,
    saveError,
    saveSuccess,
    isHistoryOpen,
    setIsHistoryOpen,
    currentHistory,
    loadingHistory,
    formData,
    setFormData,
    editForm,
    setEditForm,
    copied,
    formTotalDue,
    formExpirationDate,
    editTotalDue,
    filteredClients,
    originalActivityIds,
    formatNumberLocal,
    copyToClipboard,
    openModal,
    selectDetail,
    openEdit,
    openHistory,
    isSubscriptionValid,
    formatDate,
    handleSubmit,
    handleSave,
  } = useClients();

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-white">
            Gestion des clients
          </h1>
          <p className="text-slate-300/80 text-sm mt-1">
            Gérez vos membres et leurs abonnements multiples.
          </p>
        </div>
        <Button
          onClick={() => {
            setAddStep(1);
            openModal();
          }}
          className="h-10 px-12 rounded-full bg-[#18c7ef] hover:bg-[#12b7dc] text-[#071326] font-bold text-[18px] leading-none tracking-tight shadow-[0_0_30px_rgba(24,199,239,0.45)] transition-all"
        >
          <UserPlus className="w-6 h-6 mr-3" />
          Nouveau Client
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div
          className={cn(
            "transition-all duration-500 space-y-6",
            detailClient ? "lg:col-span-8" : "lg:col-span-12",
          )}
        >
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Rechercher un membre par nom, téléphone ou code..."
                className="w-full bg-[#1f3f86]/25 border border-white/10 rounded-xl h-12 pl-14 pr-6 focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium transition-all text-white placeholder:text-slate-500"
                value={searchQuery}
                aria-label="Rechercher un membre"
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">
                {clients.length} Total
              </Badge>
              <Badge className="glass text-slate-400 border-white/5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">
                {filteredClients.length} Filtrés
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mt-6">
            {filteredClients.map((client) => {
              const clientActivities = getClientActivities(client);
              const isActive = clientActivities.some((a) =>
                isSubscriptionValid(a.date),
              );

              return (
                <ClientCard
                  key={client.id}
                  client={client}
                  selected={detailClient?.id === client.id}
                  clientActivities={clientActivities}
                  isActive={isActive}
                  onSelect={() => selectDetail(client)}
                  onEdit={(e) => {
                    e.stopPropagation();
                    openEdit(client);
                  }}
                  onQr={(e) => {
                    e.stopPropagation();
                    setQrClient(client);
                  }}
                  onHistory={(e) => {
                    e.stopPropagation();
                    openHistory(client.id);
                  }}
                  formatDate={formatDate}
                  isSubscriptionValid={isSubscriptionValid}
                />
              );
            })}
          </div>
        </div>

        {detailClient ? (
          <ClientDetailsPanel
            detailClient={detailClient}
            onClose={() => setDetailClient(null)}
            onHistory={openHistory}
            onQr={setQrClient}
            onEdit={openEdit}
            formatDate={formatDate}
            isSubscriptionValid={isSubscriptionValid}
          />
        ) : null}
      </div>

      <ClientAddModal
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) setAddStep(1);
        }}
        addStep={addStep}
        setAddStep={setAddStep}
        formData={formData}
        setFormData={setFormData}
        activities={subscribableActivities}
        onSubmit={handleSubmit}
        formatNumberLocal={formatNumberLocal}
        formTotalDue={formTotalDue}
        formExpirationDate={formExpirationDate}
      />

      <ClientEditModal
        open={!!editClient}
        onOpenChange={(open) => {
          if (!open) {
            setEditClient(null);
            setEditStep(1);
          }
        }}
        editStep={editStep}
        setEditStep={setEditStep}
        editForm={editForm}
        setEditForm={setEditForm}
        activities={activitiesForEditModal}
        originalActivityIds={originalActivityIds}
        onSubmit={handleSave}
        formatNumberLocal={formatNumberLocal}
        editTotalDue={editTotalDue}
        saving={saving}
        saveError={saveError}
        saveSuccess={saveSuccess}
        onCancel={() => {
          setEditClient(null);
          setEditStep(1);
        }}
      />

      <ClientHistoryModal
        open={isHistoryOpen}
        onOpenChange={setIsHistoryOpen}
        loading={loadingHistory}
        entries={currentHistory}
        formatDate={formatDate}
        isSubscriptionValid={isSubscriptionValid}
      />

      <ClientQrDialog
        client={qrClient}
        onOpenChange={(open) => {
          if (!open) setQrClient(null);
        }}
        formatDate={formatDate}
        copyToClipboard={copyToClipboard}
        copied={copied}
      />
    </div>
  );
}
