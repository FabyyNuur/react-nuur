import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  Shield,
  User,
  UserX,
  Mail,
  UserPlus,
  Pencil,
  RefreshCw,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { cn } from "../lib/utils";
import type { AppUser, UserForm } from "../types/usersPage";
import { INITIAL_USER_FORM } from "../types/usersPage";

/** 1 = actif, 0 = inactiv ; gère nombres, booléens, chaînes, BigInt (driver SQL). */
function toActiveFlag(v: unknown): 0 | 1 {
  if (v == null) return 1;
  if (typeof v === "boolean") return v ? 1 : 0;
  if (typeof v === "bigint") return v === 1n ? 1 : 0;
  if (typeof v === "number") return v === 1 ? 1 : 0;
  if (typeof v === "string") {
    const t = v.trim().toLowerCase();
    if (t === "1" || t === "true" || t === "active") return 1;
    if (t === "0" || t === "false" || t === "inactive" || t === "") return 0;
    const n = Number(v);
    if (!Number.isNaN(n)) return n === 1 ? 1 : 0;
  }
  return 1;
}

function isUserActive(u: Pick<AppUser, "is_active">): boolean {
  return toActiveFlag(u.is_active as unknown) === 1;
}

function normalizeUserRow(row: AppUser): AppUser {
  return {
    ...row,
    id: Number(row.id),
    is_active: toActiveFlag(row.is_active as unknown),
  };
}

export default function Users() {
  const { user: authUser } = useAuth();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingDeactivateUser, setPendingDeactivateUser] =
    useState<AppUser | null>(null);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [form, setForm] = useState<UserForm>(INITIAL_USER_FORM);

  const isEdit = Boolean(editingUser);

  const fetchUsers = async () => {
    try {
      const response = await api.get("/users");
      const raw = response.data.data || [];
      setUsers(raw.map((row: AppUser) => normalizeUserRow(row)));
    } catch (error: unknown) {
      console.error(error);
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        (error as { response?: { status?: number } })?.response?.status === 403
          ? "Accès refusé : réservé aux administrateurs."
          : "Impossible de charger les utilisateurs.";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const sortedUsers = useMemo(
    () => [...users].sort((a, b) => a.name.localeCompare(b.name, "fr")),
    [users],
  );

  const openCreateModal = () => {
    setEditingUser(null);
    setForm(INITIAL_USER_FORM);
    setIsModalOpen(true);
  };

  const openEditModal = (u: AppUser) => {
    setEditingUser(u);
    setForm({
      name: u.name || "",
      email: u.email || "",
      role:
        u.role === "ADMIN" || u.role === "CAISSIER" || u.role === "CONTROLEUR"
          ? u.role
          : "CONTROLEUR",
      password: "",
      is_active: isUserActive(u),
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    if (!isEdit && !form.password.trim()) {
      alert("Le mot de passe est obligatoire pour créer un utilisateur.");
      return;
    }

    setSaving(true);
    try {
      if (editingUser) {
        const payload: Record<string, string> = {
          name: form.name.trim(),
          email: form.email.trim(),
          role: form.role,
          is_active: form.is_active ? "1" : "0",
        };
        if (form.password.trim()) payload.password = form.password.trim();
        await api.put(`/users/${editingUser.id}`, payload);
      } else {
        await api.post("/users", {
          name: form.name.trim(),
          email: form.email.trim(),
          role: form.role,
          password: form.password.trim(),
          is_active: form.is_active,
        });
      }

      await fetchUsers();
      setIsModalOpen(false);
      setEditingUser(null);
      setForm(INITIAL_USER_FORM);
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string; error?: string } } })
          ?.response?.data?.message ||
        (error as { response?: { data?: { message?: string; error?: string } } })
          ?.response?.data?.error ||
        "Erreur lors de l'enregistrement de l'utilisateur.";
      alert(
        message,
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleUserStatus = async (u: AppUser) => {
    const nextFlag: 0 | 1 = isUserActive(u) ? 0 : 1;
    if (nextFlag === 0 && Number(authUser?.id) === Number(u.id)) {
      alert("Vous ne pouvez pas désactiver votre propre compte.");
      return;
    }
    try {
      await api.put(`/users/${u.id}`, {
        name: String(u.name ?? ""),
        email: String(u.email ?? ""),
        role: u.role,
        is_active: nextFlag,
      });
      setUsers((prev) =>
        prev.map((row) =>
          Number(row.id) === Number(u.id)
            ? { ...row, is_active: nextFlag }
            : row,
        ),
      );
      await fetchUsers();
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string; error?: string } } })
          ?.response?.data?.message ||
        (error as { response?: { data?: { message?: string; error?: string } } })
          ?.response?.data?.error ||
        "Erreur lors du changement de statut utilisateur.";
      alert(message);
    }
  };

  const handleStatusButtonClick = (u: AppUser) => {
    if (!isUserActive(u)) {
      void toggleUserStatus(u);
      return;
    }
    if (Number(authUser?.id) === Number(u.id)) {
      alert("Vous ne pouvez pas désactiver votre propre compte.");
      return;
    }
    setPendingDeactivateUser(u);
  };

  const confirmDeactivate = async () => {
    const u = pendingDeactivateUser;
    if (!u) return;
    setPendingDeactivateUser(null);
    await toggleUserStatus(u);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[320px] gap-3 text-slate-300/80">
        <RefreshCw className="w-5 h-5 animate-spin text-primary" />
        <span className="text-sm">Chargement des utilisateurs...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-white">
            Utilisateurs & Rôles
          </h1>
          <p className="text-blue-200/65 text-sm mt-1">
            Gérez le personnel et les accès à la plateforme.
          </p>
        </div>
        <Button
          onClick={openCreateModal}
          className="h-11 px-6 rounded-full bg-[#18c7ef] hover:bg-[#13b8de] text-[#071326] shadow-[0_0_24px_rgba(24,199,239,0.35)] font-semibold text-sm"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Ajouter un utilisateur
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {sortedUsers.map((u) => (
          <div
            key={u.id}
            className="glass-card border border-white/10 bg-white/3 rounded-2xl p-4 flex items-start justify-between"
          >
            <div className="flex gap-3">
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  u.role === "ADMIN"
                    ? "bg-primary/20 text-primary"
                    : u.role === "CAISSIER"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-white/10 text-slate-300",
                )}
              >
                {u.role === "ADMIN" ? (
                  <Shield className="w-5 h-5" />
                ) : (
                  <User className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-white text-base leading-tight">
                  {u.name}
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-300/70 mt-1">
                  <Mail className="w-3.5 h-3.5" />
                  {u.email}
                </div>
                <Badge
                  className={cn(
                    "mt-2 text-[10px] font-semibold uppercase tracking-wide border",
                    u.role === "ADMIN"
                      ? "bg-primary/15 text-primary border-primary/30"
                      : u.role === "CAISSIER"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                        : "bg-white/10 text-slate-300 border-white/20",
                  )}
                >
                  {u.role}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => handleStatusButtonClick(u)}
                className={cn(
                  "h-8 rounded-lg px-3 text-[10px]",
                  isUserActive(u)
                    ? "border-red-400/30 bg-red-500/10 text-red-300 hover:bg-red-500/20"
                    : "border-emerald-400/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20",
                )}
              >
                {isUserActive(u) ? "Désactiver" : "Activer"}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => openEditModal(u)}
                className="w-8 h-8 rounded-lg bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10"
                title="Modifier utilisateur"
              >
                <Pencil className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog
        open={pendingDeactivateUser !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDeactivateUser(null);
        }}
      >
        <DialogContent className="max-w-md bg-[#0f1f45]/95 backdrop-blur-2xl border-red-500/20 text-white rounded-2xl p-6 sm:p-8 text-center shadow-[0_0_40px_rgba(239,68,68,0.12)]">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/15 ring-1 ring-red-400/30">
            <UserX className="h-7 w-7 text-red-300" />
          </div>
          <DialogHeader className="space-y-2 text-center sm:text-center">
            <DialogTitle className="text-xl font-semibold text-white">
              Désactiver ce compte ?
            </DialogTitle>
            <DialogDescription className="text-slate-300/80 text-sm leading-relaxed">
              <span className="font-semibold text-white">
                {pendingDeactivateUser?.name}
              </span>{" "}
              ne pourra plus se connecter jusqu&apos;à ce que vous réactiviez
              l&apos;accès depuis cette liste.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex-col-reverse gap-3 sm:flex-row sm:justify-center">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setPendingDeactivateUser(null)}
              className="h-10 rounded-xl px-6 text-white/70 hover:text-white hover:bg-white/10 w-full sm:w-auto"
            >
              Annuler
            </Button>
            <Button
              type="button"
              onClick={() => void confirmDeactivate()}
              className="h-10 rounded-xl px-6 w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-semibold border-0"
            >
              Désactiver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) {
            setEditingUser(null);
            setForm(INITIAL_USER_FORM);
          }
        }}
      >
        <DialogContent className="max-w-lg bg-[#0f1f45]/95 backdrop-blur-2xl border-white/15 text-white rounded-xl p-6 [&>button]:hidden">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {isEdit ? "Modifier utilisateur" : "Nouvel utilisateur"}
            </DialogTitle>
            <DialogDescription className="text-slate-300/70">
              {isEdit
                ? "Mettez à jour les informations du membre du staff."
                : "Créez un nouveau compte utilisateur."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-2">
              <label className="text-[10px] font-semibold uppercase tracking-wide text-white/40">
                Nom
              </label>
              <Input
                className="h-10 text-sm bg-white/5 border-white/10 rounded-xl px-3"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-semibold uppercase tracking-wide text-white/40">
                Email
              </label>
              <Input
                type="email"
                className="h-10 text-sm bg-white/5 border-white/10 rounded-xl px-3"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-semibold uppercase tracking-wide text-white/40">
                Rôle
              </label>
              <select
                className="w-full h-10 text-sm bg-white/5 border border-white/10 rounded-xl px-3 outline-none focus:ring-2 focus:ring-primary/40"
                value={form.role}
                onChange={(e) =>
                  setForm({
                    ...form,
                    role: e.target.value as UserForm["role"],
                  })
                }
              >
                <option value="CONTROLEUR" className="bg-slate-900">
                  Contrôleur
                </option>
                <option value="CAISSIER" className="bg-slate-900">
                  Caissier
                </option>
                <option value="ADMIN" className="bg-slate-900">
                  Admin
                </option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-semibold uppercase tracking-wide text-white/40">
                Mot de passe {isEdit ? "(laisser vide si inchangé)" : ""}
              </label>
              <Input
                type="password"
                className="h-10 text-sm bg-white/5 border-white/10 rounded-xl px-3"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required={!isEdit}
              />
            </div>
            <label className="flex items-center gap-2 text-xs font-semibold text-white/70">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="accent-primary"
              />
              Autoriser la connexion
            </label>

            <DialogFooter className="pt-2 gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsModalOpen(false)}
                className="h-10 rounded-xl px-4 text-white/70 hover:text-white"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="h-10 rounded-xl px-5 bg-gradient-to-br from-primary to-accent text-sm font-semibold"
              >
                {saving ? "Enregistrement..." : isEdit ? "Enregistrer" : "Créer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
