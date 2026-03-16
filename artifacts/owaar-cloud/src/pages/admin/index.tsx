import { useState, useEffect } from "react";
import { useTranslation } from "@/lib/i18n";
import { useAuthStore } from "@/store/use-store";
import { 
  useGetSettings, useUpdateSetting, 
  useListServices, useCreateService, useDeleteService,
  useListUsers, useTriggerUpdate
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Settings, Layers, Users, Terminal, Save, Plus, Trash2, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { getGetSettingsQueryKey, getListServicesQueryKey } from "@workspace/api-client-react";

export default function Admin() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState("branding");

  const tabs = [
    { id: "branding", label: t("admin.tabs.branding"), icon: Settings },
    { id: "services", label: t("admin.tabs.services"), icon: Layers },
    { id: "users", label: t("admin.tabs.users"), icon: Users },
    { id: "system", label: t("admin.tabs.system"), icon: Terminal },
  ];

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-muted-foreground">يرجى تسجيل الدخول أولاً</p>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-destructive font-bold text-lg">غير مصرح لك بالوصول لهذه الصفحة</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl flex flex-col md:flex-row gap-8">
      {/* Sidebar */}
      <aside className="w-full md:w-64 shrink-0">
        <div className="sticky top-28 space-y-2">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 px-4">
            {t("admin.title")}
          </h2>
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 min-w-0">
        {activeTab === "branding" && <BrandingTab />}
        {activeTab === "services" && <ServicesTab />}
        {activeTab === "users" && <UsersTab />}
        {activeTab === "system" && <SystemTab />}
      </main>
    </div>
  );
}

function BrandingTab() {
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useGetSettings();
  const updateSetting = useUpdateSetting();

  const [form, setForm] = useState({
    site_name_en: "",
    site_name_ar: "",
    site_logo: "",
  });

  useEffect(() => {
    if (settings) {
      const nameRow = settings.find(s => s.key === "site_name");
      const logoRow = settings.find(s => s.key === "site_logo");
      setForm({
        site_name_en: nameRow?.valueEn || "",
        site_name_ar: nameRow?.valueAr || "",
        site_logo: logoRow?.valueEn || "",
      });
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      await updateSetting.mutateAsync({
        key: "site_name",
        data: { valueEn: form.site_name_en, valueAr: form.site_name_ar },
      });
      await updateSetting.mutateAsync({
        key: "site_logo",
        data: { valueEn: form.site_logo, valueAr: form.site_logo },
      });
      queryClient.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
      alert("تم الحفظ بنجاح ✅");
    } catch {
      alert("حدث خطأ أثناء الحفظ");
    }
  };

  if (isLoading) return <div className="p-8 text-muted-foreground">جارٍ التحميل...</div>;

  return (
    <Card className="p-8">
      <h3 className="text-2xl font-bold mb-6">هوية المنصة</h3>
      <div className="space-y-6 max-w-2xl">
        <div>
          <label className="text-sm font-medium mb-2 block">اسم الموقع بالإنجليزية</label>
          <Input
            value={form.site_name_en}
            onChange={e => setForm({ ...form, site_name_en: e.target.value })}
            placeholder="OWAAR CLOUD"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">اسم الموقع بالعربية</label>
          <Input
            value={form.site_name_ar}
            onChange={e => setForm({ ...form, site_name_ar: e.target.value })}
            placeholder="أوار كلاود"
            dir="rtl"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">رابط الشعار (Logo URL)</label>
          <Input
            value={form.site_logo}
            onChange={e => setForm({ ...form, site_logo: e.target.value })}
            placeholder="https://..."
          />
          {form.site_logo && (
            <img src={form.site_logo} alt="Preview" className="h-12 mt-4 rounded bg-secondary p-2" />
          )}
        </div>
        <Button onClick={handleSave} disabled={updateSetting.isPending} className="mt-4 gap-2">
          {updateSetting.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          حفظ التغييرات
        </Button>
      </div>
    </Card>
  );
}

function ServicesTab() {
  const { isAr } = useTranslation();
  const queryClient = useQueryClient();
  const { data: services, isLoading } = useListServices();
  const deleteService = useDeleteService();
  const [showForm, setShowForm] = useState(false);

  const handleDelete = async (id: number) => {
    if (confirm("هل أنت متأكد من الحذف؟")) {
      await deleteService.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: getListServicesQueryKey() });
    }
  };

  if (isLoading) return <div className="p-8 text-muted-foreground">جارٍ التحميل...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-card p-6 rounded-2xl border border-border">
        <h3 className="text-2xl font-bold">مكتبة الخدمات</h3>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="w-4 h-4" /> إضافة خدمة
        </Button>
      </div>

      {showForm && <ServiceForm onClose={() => setShowForm(false)} />}

      <div className="grid gap-4">
        {services?.map(service => (
          <Card key={service.id} className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center text-2xl">
                {service.icon}
              </div>
              <div>
                <h4 className="font-bold">{isAr ? service.nameAr : service.nameEn}</h4>
                <p className="text-sm text-muted-foreground">
                  {service.provider} • {service.templateId}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:bg-destructive/10"
              onClick={() => handleDelete(service.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ServiceForm({ onClose }: { onClose: () => void }) {
  const createService = useCreateService();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    nameEn: "", nameAr: "", descEn: "", descAr: "",
    icon: "📦", templateId: "", provider: "coolify" as "coolify" | "cloudron",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createService.mutateAsync({ data: form });
    queryClient.invalidateQueries({ queryKey: getListServicesQueryKey() });
    onClose();
  };

  return (
    <Card className="p-6 border-primary/40">
      <form onSubmit={handleSubmit} className="space-y-4">
        <h4 className="font-bold text-lg mb-2">خدمة جديدة</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs mb-1 block">الاسم بالإنجليزية</label>
            <Input required value={form.nameEn} onChange={e => setForm({ ...form, nameEn: e.target.value })} />
          </div>
          <div>
            <label className="text-xs mb-1 block">الاسم بالعربية</label>
            <Input required value={form.nameAr} onChange={e => setForm({ ...form, nameAr: e.target.value })} dir="rtl" />
          </div>
          <div className="col-span-2">
            <label className="text-xs mb-1 block">الوصف بالإنجليزية</label>
            <Input required value={form.descEn} onChange={e => setForm({ ...form, descEn: e.target.value })} />
          </div>
          <div className="col-span-2">
            <label className="text-xs mb-1 block">الوصف بالعربية</label>
            <Input required value={form.descAr} onChange={e => setForm({ ...form, descAr: e.target.value })} dir="rtl" />
          </div>
          <div>
            <label className="text-xs mb-1 block">الأيقونة (Emoji)</label>
            <Input required value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} />
          </div>
          <div>
            <label className="text-xs mb-1 block">Template UUID</label>
            <Input required value={form.templateId} onChange={e => setForm({ ...form, templateId: e.target.value })} />
          </div>
          <div>
            <label className="text-xs mb-1 block">المزود</label>
            <select
              className="w-full h-12 rounded-xl border border-border bg-background px-4 text-sm"
              value={form.provider}
              onChange={e => setForm({ ...form, provider: e.target.value as any })}
            >
              <option value="coolify">Coolify</option>
              <option value="cloudron">Cloudron</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>إلغاء</Button>
          <Button type="submit" disabled={createService.isPending}>
            {createService.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            حفظ الخدمة
          </Button>
        </div>
      </form>
    </Card>
  );
}

function UsersTab() {
  const { data: users, isLoading } = useListUsers();

  if (isLoading) return <div className="p-8 text-muted-foreground">جارٍ التحميل...</div>;

  return (
    <Card className="overflow-hidden">
      <div className="p-6 border-b border-border">
        <h3 className="text-xl font-bold">المستخدمون المسجّلون</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-muted-foreground">
            <tr>
              <th className="p-4 font-medium text-start">الاسم</th>
              <th className="p-4 font-medium text-start">البريد الإلكتروني</th>
              <th className="p-4 font-medium text-start">الصلاحية</th>
              <th className="p-4 font-medium text-start">تاريخ التسجيل</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users?.map(user => (
              <tr key={user.id} className="hover:bg-secondary/20 transition-colors">
                <td className="p-4 font-medium">{user.name}</td>
                <td className="p-4 text-muted-foreground">{user.email}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
                    user.role === "admin"
                      ? "bg-primary/15 text-primary"
                      : "bg-secondary text-secondary-foreground"
                  }`}>
                    {user.role === "admin" ? "مسؤول" : "مستخدم"}
                  </span>
                </td>
                <td className="p-4 text-muted-foreground">
                  {format(new Date(user.createdAt), "d MMM yyyy")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function SystemTab() {
  const updateMutation = useTriggerUpdate();
  const [output, setOutput] = useState("");

  const handleUpdate = async () => {
    try {
      const res = await updateMutation.mutateAsync();
      setOutput(res.output);
    } catch (e: any) {
      setOutput(e?.response?.data?.error || "فشل التحديث");
    }
  };

  return (
    <Card className="p-8">
      <h3 className="text-2xl font-bold mb-2">صيانة النظام</h3>
      <p className="text-muted-foreground mb-8">
        سحب آخر التحديثات من المستودع وإعادة تشغيل الخدمات.
      </p>

      <Button
        size="lg"
        onClick={handleUpdate}
        disabled={updateMutation.isPending}
        className="mb-8 gap-2"
      >
        {updateMutation.isPending
          ? <Loader2 className="w-5 h-5 animate-spin" />
          : <Terminal className="w-5 h-5" />}
        تحديث النظام الآن
      </Button>

      {output && (
        <div className="bg-black/60 border border-border rounded-xl p-4 font-mono text-sm text-green-400 whitespace-pre-wrap overflow-x-auto">
          {output}
        </div>
      )}
    </Card>
  );
}
