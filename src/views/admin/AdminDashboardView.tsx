import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Layers, 
  Bookmark, 
  MapPin, 
  Settings, 
  LogOut, 
  Plus, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  Search, 
  ExternalLink,
  Eye,
  Navigation,
  Phone,
  MessageSquare,
  AlertCircle,
  Save,
  Upload,
  Filter,
  RotateCcw,
  SlidersHorizontal,
  Globe,
  Tag,
  Loader2,
  ArrowUpDown,
  CheckCircle2,
  XCircle,
  Image as ImageIcon,
  ShieldCheck,
  ShieldAlert,
  Key,
  Users,
  UserPlus,
  EyeOff,
  Clock,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSite } from '../../context/SiteContext';
import { api } from '../../api/client';
import { Product, Category, Brand, Store, SiteSettings, AdminUser } from '../../types';

interface AdminDashboardViewProps {
  initialSubview?: string;
}

const APPLIANCE_OPTIONS = [
  'Air Conditioner',
  'Washing Machine',
  'Microwave Oven',
  'Water Purifier',
  'Refrigerator'
];

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ initialSubview = 'dashboard' }) => {
  const { logout, user, updateCurrentUser } = useAuth();
  const { navigateTo, settings, refreshSettings } = useSite();
  const [activeTab, setActiveTab] = useState(initialSubview);

  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Security & Admin Profile states
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Change Password states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Admin Team states
  const [teamMembers, setTeamMembers] = useState<AdminUser[]>([]);
  const [isLoadingTeam, setIsLoadingTeam] = useState(false);
  const [isAddTeamModalOpen, setIsAddTeamModalOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamEmail, setNewTeamEmail] = useState('');
  const [newTeamPassword, setNewTeamPassword] = useState('');
  const [newTeamRole, setNewTeamRole] = useState<'admin' | 'super_admin'>('admin');
  const [isSavingTeamMember, setIsSavingTeamMember] = useState(false);
  const [teamFormError, setTeamFormError] = useState<string | null>(null);

  // Modals
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryTag, setNewCategoryTag] = useState('');

  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);

  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);

  // Uploading states
  const [isUploadingCategoryImage, setIsUploadingCategoryImage] = useState(false);
  const [isUploadingBrandLogo, setIsUploadingBrandLogo] = useState(false);
  const [isUploadingProductImage, setIsUploadingProductImage] = useState(false);

  // File input refs
  const categoryFileInputRef = useRef<HTMLInputElement | null>(null);
  const brandFileInputRef = useRef<HTMLInputElement | null>(null);
  const productFileInputRef = useRef<HTMLInputElement | null>(null);

  // Settings form state
  const [settingsForm, setSettingsForm] = useState<SiteSettings | null>(null);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Product table filters
  const [tableSearch, setTableSearch] = useState('');
  const [productApplianceFilter, setProductApplianceFilter] = useState('all');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [productBrandFilter, setProductBrandFilter] = useState('all');
  const [productAvailabilityFilter, setProductAvailabilityFilter] = useState('all');

  // Category filters & search
  const [categorySearch, setCategorySearch] = useState('');
  const [categoryApplianceFilter, setCategoryApplianceFilter] = useState('all');
  const [categoryStatusFilter, setCategoryStatusFilter] = useState('all');
  const [categorySort, setCategorySort] = useState<'order' | 'name-asc' | 'name-desc' | 'products-count'>('order');

  // Brand filters & search
  const [brandSearch, setBrandSearch] = useState('');
  const [brandApplianceFilter, setBrandApplianceFilter] = useState('all');
  const [brandStatusFilter, setBrandStatusFilter] = useState('all');
  const [brandSort, setBrandSort] = useState<'name-asc' | 'name-desc' | 'products-count' | 'newest'>('name-asc');

  // In-app Delete Confirmation Dialog State (avoids blocked window.confirm in iframes)
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'product' | 'category' | 'brand' | 'store' | 'admin';
    id: string;
    name: string;
    warning?: string;
    linkedCount?: number;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // In-app Notification Banner (avoids blocked window.alert in iframes)
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 4500);
  };

  // Fetch all administrative data (including inactive items for management)
  const loadAllData = async () => {
    setLoading(true);
    try {
      const [prods, cats, brs, sts, stats, currentSettings] = await Promise.all([
        api.adminGetProducts(),
        api.adminGetCategories(),
        api.adminGetBrands(),
        api.adminGetStores(),
        api.getAnalytics(),
        api.getSettings()
      ]);
      setProducts(prods);
      setCategories(cats);
      setBrands(brs);
      setStores(sts);
      setAnalytics(stats);
      setSettingsForm(currentSettings);
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleLogout = () => {
    logout();
    navigateTo({ name: 'home' });
  };

  // --- FILE UPLOAD HANDLER ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'category' | 'brand' | 'product') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (target === 'category') setIsUploadingCategoryImage(true);
      if (target === 'brand') setIsUploadingBrandLogo(true);
      if (target === 'product') setIsUploadingProductImage(true);

      const res = await api.uploadImage(file);

      if (target === 'category' && editingCategory) {
        setEditingCategory({ ...editingCategory, imageUrl: res.url });
      } else if (target === 'brand' && editingBrand) {
        setEditingBrand({ ...editingBrand, logoUrl: res.url });
      } else if (target === 'product' && editingProduct) {
        const updatedImages = [...editingProduct.images];
        if (updatedImages.length > 0) {
          updatedImages[0] = { ...updatedImages[0], imageUrl: res.url };
        } else {
          updatedImages.push({
            id: `img-${Date.now()}`,
            imageUrl: res.url,
            altText: editingProduct.name || 'Product Image',
            sortOrder: 1,
            isPrimary: true
          });
        }
        setEditingProduct({ ...editingProduct, images: updatedImages });
      }
    } catch (err: any) {
      showNotification('error', err.message || 'Image upload failed. Please try again.');
    } finally {
      if (target === 'category') setIsUploadingCategoryImage(false);
      if (target === 'brand') setIsUploadingBrandLogo(false);
      if (target === 'product') setIsUploadingProductImage(false);
      e.target.value = '';
    }
  };

  // --- PRODUCT CRUD ---
  const handleOpenNewProduct = () => {
    setEditingProduct({
      id: '',
      name: '',
      slug: '',
      sku: '',
      categoryId: categories[0]?.id || '',
      brandId: brands[0]?.id || '',
      applianceType: 'Air Conditioner',
      description: '',
      specifications: { 'Voltage': '220-240V', 'Warranty': 'Physical Inspection & Counter Testing' },
      compatibility: [],
      images: [
        {
          id: 'img-1',
          imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
          altText: 'Product Photo',
          sortOrder: 1,
          isPrimary: true
        }
      ],
      availability: 'Available',
      featured: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      if (editingProduct.id) {
        await api.updateProduct(editingProduct.id, editingProduct);
        showNotification('success', `Product "${editingProduct.name}" updated successfully.`);
      } else {
        await api.createProduct(editingProduct);
        showNotification('success', `Product "${editingProduct.name}" added to catalogue.`);
      }
      setIsProductModalOpen(false);
      setEditingProduct(null);
      await loadAllData();
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to save product');
    }
  };

  const handleDeleteProduct = (id: string, name: string) => {
    setDeleteTarget({
      type: 'product',
      id,
      name,
      warning: 'This spare part will be permanently removed from the product catalogue.'
    });
  };

  const handleToggleProductActive = async (p: Product) => {
    try {
      await api.updateProduct(p.id, { isActive: !p.isActive });
      showNotification('success', `Product "${p.name}" status updated.`);
      await loadAllData();
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to toggle product status');
    }
  };

  // --- CATEGORY CRUD ---
  const handleOpenNewCategory = () => {
    setEditingCategory({
      id: '',
      name: '',
      slug: '',
      applianceType: 'Air Conditioner',
      description: '',
      imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
      sortOrder: (categories.length + 1) * 10,
      isActive: true,
      commonParts: ['Capacitors', 'Fan Motors', 'Sensors', 'PCB Boards'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    setNewCategoryTag('');
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    try {
      const payload = {
        ...editingCategory,
        name: editingCategory.name.trim(),
        slug: editingCategory.slug?.trim() || editingCategory.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
        sortOrder: Number(editingCategory.sortOrder) || 10,
        commonParts: Array.isArray(editingCategory.commonParts) ? editingCategory.commonParts : []
      };

      if (editingCategory.id) {
        await api.updateCategory(editingCategory.id, payload);
        showNotification('success', `Category "${payload.name}" updated successfully.`);
      } else {
        await api.createCategory(payload);
        showNotification('success', `Category "${payload.name}" created successfully.`);
      }
      setIsCategoryModalOpen(false);
      setEditingCategory(null);
      await loadAllData();
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to save category');
    }
  };

  const handleDeleteCategory = (id: string, name: string) => {
    const linkedCount = products.filter(p => p.categoryId === id).length;
    setDeleteTarget({
      type: 'category',
      id,
      name,
      linkedCount,
      warning: linkedCount > 0
        ? `⚠️ Warning: ${linkedCount} spare part(s) in the catalogue are currently linked to "${name}". Deleting this category will leave these products without a valid category.`
        : 'This category will be permanently removed from the catalogue.'
    });
  };

  const handleToggleCategoryActive = async (cat: Category) => {
    try {
      await api.updateCategory(cat.id, { isActive: !cat.isActive });
      showNotification('success', `Category "${cat.name}" visibility updated.`);
      await loadAllData();
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to toggle category status');
    }
  };

  const handleAddCategoryTag = (tag?: string) => {
    const val = (tag !== undefined ? tag : newCategoryTag).trim();
    if (!val || !editingCategory) return;
    const current = editingCategory.commonParts || [];
    if (!current.includes(val)) {
      setEditingCategory({
        ...editingCategory,
        commonParts: [...current, val]
      });
    }
    setNewCategoryTag('');
  };

  const handleRemoveCategoryTag = (index: number) => {
    if (!editingCategory) return;
    const current = [...(editingCategory.commonParts || [])];
    current.splice(index, 1);
    setEditingCategory({
      ...editingCategory,
      commonParts: current
    });
  };

  // --- BRAND CRUD ---
  const handleOpenNewBrand = () => {
    setEditingBrand({
      id: '',
      name: '',
      slug: '',
      logoUrl: '',
      description: '',
      appliancesSupported: ['Air Conditioner', 'Washing Machine'],
      website: '',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    setIsBrandModalOpen(true);
  };

  const handleSaveBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBrand) return;
    try {
      const payload = {
        ...editingBrand,
        name: editingBrand.name.trim(),
        slug: editingBrand.slug?.trim() || editingBrand.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
        appliancesSupported: Array.isArray(editingBrand.appliancesSupported) ? editingBrand.appliancesSupported : []
      };

      if (editingBrand.id) {
        await api.updateBrand(editingBrand.id, payload);
        showNotification('success', `Brand "${payload.name}" updated successfully.`);
      } else {
        await api.createBrand(payload);
        showNotification('success', `Brand "${payload.name}" added to catalogue.`);
      }
      setIsBrandModalOpen(false);
      setEditingBrand(null);
      await loadAllData();
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to save brand');
    }
  };

  const handleDeleteBrand = (id: string, name: string) => {
    const linkedCount = products.filter(p => p.brandId === id).length;
    setDeleteTarget({
      type: 'brand',
      id,
      name,
      linkedCount,
      warning: linkedCount > 0
        ? `⚠️ Warning: ${linkedCount} spare part(s) in the catalogue are currently linked to brand "${name}". Deleting this brand may affect brand filtering for these products.`
        : 'This brand manufacturer will be permanently removed.'
    });
  };

  const handleToggleBrandActive = async (b: Brand) => {
    try {
      await api.updateBrand(b.id, { isActive: !b.isActive });
      showNotification('success', `Brand "${b.name}" visibility updated.`);
      await loadAllData();
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to toggle brand status');
    }
  };

  const handleToggleBrandAppliance = (appliance: string) => {
    if (!editingBrand) return;
    const current = editingBrand.appliancesSupported || [];
    const exists = current.includes(appliance);
    const updated = exists ? current.filter(a => a !== appliance) : [...current, appliance];
    setEditingBrand({
      ...editingBrand,
      appliancesSupported: updated
    });
  };

  // --- STORE CRUD ---
  const handleSaveStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStore) return;
    try {
      if (editingStore.id) {
        await api.updateStore(editingStore.id, editingStore);
        showNotification('success', `Store "${editingStore.name}" updated successfully.`);
      } else {
        await api.createStore(editingStore);
        showNotification('success', `Store "${editingStore.name}" added.`);
      }
      setIsStoreModalOpen(false);
      setEditingStore(null);
      await loadAllData();
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to save store');
    }
  };

  const handleDeleteStore = (id: string, name: string) => {
    setDeleteTarget({
      type: 'store',
      id,
      name,
      warning: 'This physical branch location will be removed from customer map directions and store listings.'
    });
  };

  // --- EXECUTE CONFIRMED DELETE ---
  const handleExecuteDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      if (deleteTarget.type === 'product') {
        await api.deleteProduct(deleteTarget.id);
        setProducts(prev => prev.filter(p => p.id !== deleteTarget.id));
        if (editingProduct?.id === deleteTarget.id) {
          setIsProductModalOpen(false);
          setEditingProduct(null);
        }
        showNotification('success', `Spare part "${deleteTarget.name}" deleted successfully.`);
      } else if (deleteTarget.type === 'category') {
        await api.deleteCategory(deleteTarget.id);
        setCategories(prev => prev.filter(c => c.id !== deleteTarget.id));
        if (editingCategory?.id === deleteTarget.id) {
          setIsCategoryModalOpen(false);
          setEditingCategory(null);
        }
        showNotification('success', `Category "${deleteTarget.name}" deleted successfully.`);
      } else if (deleteTarget.type === 'brand') {
        await api.deleteBrand(deleteTarget.id);
        setBrands(prev => prev.filter(b => b.id !== deleteTarget.id));
        if (editingBrand?.id === deleteTarget.id) {
          setIsBrandModalOpen(false);
          setEditingBrand(null);
        }
        showNotification('success', `Brand "${deleteTarget.name}" deleted successfully.`);
      } else if (deleteTarget.type === 'store') {
        await api.deleteStore(deleteTarget.id);
        setStores(prev => prev.filter(s => s.id !== deleteTarget.id));
        if (editingStore?.id === deleteTarget.id) {
          setIsStoreModalOpen(false);
          setEditingStore(null);
        }
        showNotification('success', `Store branch "${deleteTarget.name}" deleted successfully.`);
      } else if (deleteTarget.type === 'admin') {
        await api.deleteAdminTeamMember(deleteTarget.id);
        setTeamMembers(prev => prev.filter(m => m.id !== deleteTarget.id));
        showNotification('success', `Administrator account "${deleteTarget.name}" removed successfully.`);
      }
      setDeleteTarget(null);
      // Background re-fetch to ensure counts and stats update
      loadAllData();
    } catch (err: any) {
      showNotification('error', err.message || 'Deletion failed. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  // --- LOAD ADMIN TEAM ---
  const loadTeamMembers = async () => {
    try {
      setIsLoadingTeam(true);
      const list = await api.getAdminTeam();
      setTeamMembers(list);
    } catch (err: any) {
      console.error('Failed to load admin team', err);
    } finally {
      setIsLoadingTeam(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'security') {
      loadTeamMembers();
    }
  }, [activeTab]);

  useEffect(() => {
    if (user) {
      setProfileName(user.name || '');
      setProfileEmail(user.email || '');
    }
  }, [user]);

  // --- SAVE ADMIN PROFILE ---
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim() || !profileEmail.trim()) {
      showNotification('error', 'Administrator name and email are required');
      return;
    }

    try {
      setIsSavingProfile(true);
      const res = await api.updateProfile(profileName.trim(), profileEmail.trim());
      updateCurrentUser(res.user, res.token);
      showNotification('success', 'Administrator profile details updated successfully.');
      loadTeamMembers();
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // --- CHANGE PASSWORD ---
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      showNotification('error', 'Please enter both your current password and new password');
      return;
    }

    if (newPassword.length < 6) {
      showNotification('error', 'New password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      showNotification('error', 'New passwords do not match. Please verify.');
      return;
    }

    try {
      setIsChangingPassword(true);
      await api.changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showNotification('success', 'Administrator password updated securely.');
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Password strength calculation for live visual meter
  const passwordStrength = useMemo(() => {
    if (!newPassword) return { score: 0, label: 'Not entered', color: 'bg-slate-200', text: 'text-slate-400' };
    let score = 0;
    if (newPassword.length >= 6) score += 1;
    if (newPassword.length >= 10) score += 1;
    if (/[0-9]/.test(newPassword)) score += 1;
    if (/[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword)) score += 1;
    if (/[^A-Za-z0-9]/.test(newPassword)) score += 1;

    if (score <= 1) return { score: 1, label: 'Very Weak', color: 'bg-red-500', text: 'text-red-600' };
    if (score === 2) return { score: 2, label: 'Weak', color: 'bg-amber-500', text: 'text-amber-600' };
    if (score === 3) return { score: 3, label: 'Fair', color: 'bg-yellow-500', text: 'text-yellow-600' };
    if (score === 4) return { score: 4, label: 'Good', color: 'bg-blue-500', text: 'text-blue-600' };
    return { score: 5, label: 'Strong & Secure', color: 'bg-emerald-500', text: 'text-emerald-600' };
  }, [newPassword]);

  // --- ADD ADMIN TEAM MEMBER ---
  const handleCreateTeamMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setTeamFormError(null);

    if (!newTeamName.trim() || !newTeamEmail.trim() || !newTeamPassword) {
      setTeamFormError('Please complete all required fields');
      return;
    }

    if (newTeamPassword.length < 6) {
      setTeamFormError('Password must be at least 6 characters');
      return;
    }

    try {
      setIsSavingTeamMember(true);
      const created = await api.createAdminTeamMember({
        name: newTeamName.trim(),
        email: newTeamEmail.trim(),
        password: newTeamPassword,
        role: newTeamRole
      });
      setTeamMembers(prev => [...prev, created]);
      setIsAddTeamModalOpen(false);
      setNewTeamName('');
      setNewTeamEmail('');
      setNewTeamPassword('');
      setNewTeamRole('admin');
      showNotification('success', `Administrator "${created.name}" added successfully.`);
    } catch (err: any) {
      setTeamFormError(err.message || 'Failed to add administrator');
    } finally {
      setIsSavingTeamMember(false);
    }
  };

  const handleDeleteAdminClick = (member: AdminUser) => {
    if (member.id === user?.id) {
      showNotification('error', 'You cannot delete your own active administrator account.');
      return;
    }
    setDeleteTarget({
      type: 'admin',
      id: member.id,
      name: `${member.name} (${member.email})`,
      warning: `This will permanently revoke ${member.name}'s administrative console privileges and invalidate all existing sessions.`
    });
  };

  // --- SETTINGS SAVE ---
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsForm) return;
    try {
      const updated = await api.updateSettings(settingsForm);
      setSettingsForm(updated);
      await refreshSettings();
      setSettingsSaved(true);
      showNotification('success', 'Website contact & business settings saved successfully.');
      setTimeout(() => setSettingsSaved(false), 2500);
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to save settings');
    }
  };

  // Count products linked to each category
  const categoryProductCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of products) {
      map[p.categoryId] = (map[p.categoryId] || 0) + 1;
    }
    return map;
  }, [products]);

  // Count products linked to each brand
  const brandProductCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of products) {
      map[p.brandId] = (map[p.brandId] || 0) + 1;
    }
    return map;
  }, [products]);

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch = !tableSearch || 
        p.name.toLowerCase().includes(tableSearch.toLowerCase()) || 
        p.sku.toLowerCase().includes(tableSearch.toLowerCase()) ||
        p.applianceType.toLowerCase().includes(tableSearch.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(tableSearch.toLowerCase()));

      const matchAppliance = productApplianceFilter === 'all' || p.applianceType === productApplianceFilter;
      const matchCategory = productCategoryFilter === 'all' || p.categoryId === productCategoryFilter;
      const matchBrand = productBrandFilter === 'all' || p.brandId === productBrandFilter;
      const matchAvailability = productAvailabilityFilter === 'all' || p.availability === productAvailabilityFilter;

      return matchSearch && matchAppliance && matchCategory && matchBrand && matchAvailability;
    });
  }, [products, tableSearch, productApplianceFilter, productCategoryFilter, productBrandFilter, productAvailabilityFilter]);

  // Filtered and sorted categories
  const filteredCategories = useMemo(() => {
    let result = categories.filter(cat => {
      const matchSearch = !categorySearch ||
        cat.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
        cat.slug.toLowerCase().includes(categorySearch.toLowerCase()) ||
        (cat.description && cat.description.toLowerCase().includes(categorySearch.toLowerCase())) ||
        (cat.commonParts && cat.commonParts.some(cp => cp.toLowerCase().includes(categorySearch.toLowerCase())));

      const matchAppliance = categoryApplianceFilter === 'all' || cat.applianceType === categoryApplianceFilter;
      const matchStatus = categoryStatusFilter === 'all' || 
        (categoryStatusFilter === 'active' && cat.isActive !== false) ||
        (categoryStatusFilter === 'inactive' && cat.isActive === false);

      return matchSearch && matchAppliance && matchStatus;
    });

    result.sort((a, b) => {
      if (categorySort === 'order') {
        return (a.sortOrder || 0) - (b.sortOrder || 0);
      }
      if (categorySort === 'name-asc') {
        return a.name.localeCompare(b.name);
      }
      if (categorySort === 'name-desc') {
        return b.name.localeCompare(a.name);
      }
      if (categorySort === 'products-count') {
        const countA = categoryProductCountMap[a.id] || 0;
        const countB = categoryProductCountMap[b.id] || 0;
        return countB - countA;
      }
      return 0;
    });

    return result;
  }, [categories, categorySearch, categoryApplianceFilter, categoryStatusFilter, categorySort, categoryProductCountMap]);

  // Filtered and sorted brands
  const filteredBrands = useMemo(() => {
    let result = brands.filter(b => {
      const matchSearch = !brandSearch ||
        b.name.toLowerCase().includes(brandSearch.toLowerCase()) ||
        b.slug.toLowerCase().includes(brandSearch.toLowerCase()) ||
        (b.description && b.description.toLowerCase().includes(brandSearch.toLowerCase())) ||
        (b.appliancesSupported && b.appliancesSupported.some(app => app.toLowerCase().includes(brandSearch.toLowerCase())));

      const matchAppliance = brandApplianceFilter === 'all' || 
        (b.appliancesSupported && b.appliancesSupported.includes(brandApplianceFilter));
      
      const matchStatus = brandStatusFilter === 'all' ||
        (brandStatusFilter === 'active' && b.isActive !== false) ||
        (brandStatusFilter === 'inactive' && b.isActive === false);

      return matchSearch && matchAppliance && matchStatus;
    });

    result.sort((a, b) => {
      if (brandSort === 'name-asc') {
        return a.name.localeCompare(b.name);
      }
      if (brandSort === 'name-desc') {
        return b.name.localeCompare(a.name);
      }
      if (brandSort === 'products-count') {
        const countA = brandProductCountMap[b.id] || 0;
        const countB = brandProductCountMap[a.id] || 0;
        return countA - countB;
      }
      if (brandSort === 'newest') {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
      return 0;
    });

    return result;
  }, [brands, brandSearch, brandApplianceFilter, brandStatusFilter, brandSort, brandProductCountMap]);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Admin Navigation Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-black flex items-center justify-center text-sm">
                A
              </span>
              <div>
                <span className="font-bold text-sm tracking-tight text-white">
                  Apex Enterprises
                </span>
                <span className="text-[10px] ml-2 px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-mono">
                  Admin Console
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('security')}
                className="text-slate-400 hover:text-white transition-colors hidden sm:flex items-center gap-2 bg-slate-800/80 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700/60 cursor-pointer"
                title="Account Security & Access Control"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate max-w-[200px]">
                  <strong className="text-white">{user?.name || user?.email || 'admin@apexenterprises.com'}</strong>
                </span>
                {user?.role && (
                  <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-bold font-mono ${
                    user.role === 'super_admin' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  }`}>
                    {user.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                  </span>
                )}
              </button>

              <button
                onClick={() => navigateTo({ name: 'home' })}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>View Live Site</span>
              </button>

              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-lg bg-red-950/40 text-red-400 hover:bg-red-900/60 border border-red-800/40 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Sub-nav tabs */}
          <div className="flex items-center space-x-1 overflow-x-auto pb-1 text-xs font-semibold">
            {[
              { id: 'dashboard', label: 'Overview & Insights', icon: LayoutDashboard },
              { id: 'products', label: `Products (${products.length})`, icon: Package },
              { id: 'categories', label: `Categories (${categories.length})`, icon: Layers },
              { id: 'brands', label: `Brands (${brands.length})`, icon: Bookmark },
              { id: 'stores', label: `Stores (${stores.length})`, icon: MapPin },
              { id: 'settings', label: 'Site Settings', icon: Settings },
              { id: 'security', label: 'Security & Admins', icon: ShieldCheck },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-t-lg transition-colors border-b-2 whitespace-nowrap ${
                    active
                      ? 'bg-white text-slate-900 border-amber-500'
                      : 'text-slate-400 hover:text-white border-transparent hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-amber-600' : ''}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500 mt-2">Loading administrative records...</p>
          </div>
        ) : (
          <>
            {/* 1. OVERVIEW & ANALYTICS SUBVIEW */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                {/* Metric Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">
                      Catalogue Products
                    </span>
                    <span className="text-3xl font-black text-slate-900 mt-1 block">
                      {products.length}
                    </span>
                    <span className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
                      {products.filter(p => p.availability === 'Available').length} In-Stock
                    </span>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">
                      Physical Stores
                    </span>
                    <span className="text-3xl font-black text-slate-900 mt-1 block">
                      {stores.length}
                    </span>
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      GPS & Walk-in active
                    </span>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">
                      Total Product Views
                    </span>
                    <span className="text-3xl font-black text-slate-900 mt-1 block">
                      {analytics?.totalProductViews || 0}
                    </span>
                    <span className="text-[11px] text-amber-600 font-medium mt-1 flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      Live visitor traffic
                    </span>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">
                      Direction Requests
                    </span>
                    <span className="text-3xl font-black text-slate-900 mt-1 block">
                      {analytics?.totalDirectionsClicked || 0}
                    </span>
                    <span className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
                      <Navigation className="w-3 h-3" />
                      Physical store trips
                    </span>
                  </div>
                </div>

                {/* Quick Shortcuts */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
                  <h3 className="font-bold text-slate-900 text-sm">Quick Administrative Actions</h3>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => { setActiveTab('products'); handleOpenNewProduct(); }}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Spare Part</span>
                    </button>

                    <button
                      onClick={() => {
                        setEditingStore({
                          id: '',
                          name: '',
                          storeCode: `APEX-0${stores.length + 1}`,
                          address: '',
                          area: '',
                          city: 'Mumbai',
                          state: 'Maharashtra',
                          postalCode: '400001',
                          phone: '+91 98201 54321',
                          whatsapp: '+919820154321',
                          email: 'store@apexenterprises.com',
                          openingHours: 'Mon - Sat: 9:30 AM - 8:30 PM',
                          weeklyClosedDay: 'Sunday',
                          latitude: 19.0760,
                          longitude: 72.8777,
                          googleMapsUrl: 'https://maps.google.com',
                          imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
                          isActive: true,
                          createdAt: new Date().toISOString(),
                          updatedAt: new Date().toISOString()
                        });
                        setIsStoreModalOpen(true);
                        setActiveTab('stores');
                      }}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-amber-400" />
                      <span>Add Physical Store Location</span>
                    </button>
                  </div>
                </div>

                {/* Recent Visitor Engagement Logs */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-sm">
                      Recent Visitor Inquiries & Direction Clicks
                    </h3>
                    <span className="text-xs text-slate-400">
                      Last 10 user interactions
                    </span>
                  </div>
                  <div className="divide-y divide-slate-100 text-xs">
                    {analytics?.recentEvents && analytics.recentEvents.length > 0 ? (
                      analytics.recentEvents.slice(0, 8).map((evt: any) => (
                        <div key={evt.id} className="p-3.5 flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            {evt.eventType === 'directions_clicked' && <Navigation className="w-4 h-4 text-amber-500" />}
                            {evt.eventType === 'product_viewed' && <Eye className="w-4 h-4 text-blue-500" />}
                            {evt.eventType === 'phone_clicked' && <Phone className="w-4 h-4 text-emerald-500" />}
                            {evt.eventType === 'whatsapp_clicked' && <MessageSquare className="w-4 h-4 text-emerald-600" />}
                            <span className="font-semibold text-slate-800">
                              {evt.eventType.replace('_', ' ').toUpperCase()}
                            </span>
                            <span className="text-slate-500">
                              {evt.payload?.name || evt.payload?.storeName || JSON.stringify(evt.payload)}
                            </span>
                          </div>
                          <span className="text-slate-400 text-[11px]">
                            {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-slate-400">
                        No visitor engagement logs yet. Interactions will appear as users navigate the catalogue.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 2. PRODUCTS SUBVIEW */}
            {activeTab === 'products' && (
              <div className="space-y-4">
                {/* Product Search & Filter Bar */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={tableSearch}
                        onChange={(e) => setTableSearch(e.target.value)}
                        placeholder="Search parts by name, SKU, or keywords..."
                        className="w-full pl-9 pr-8 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                      />
                      {tableSearch && (
                        <button 
                          onClick={() => setTableSearch('')}
                          className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <button
                      onClick={handleOpenNewProduct}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create Spare Part</span>
                    </button>
                  </div>

                  {/* Secondary Filter Controls */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs border-t border-slate-100">
                    <div className="flex items-center gap-1.5 text-slate-500 font-semibold text-[11px]">
                      <Filter className="w-3.5 h-3.5 text-amber-600" />
                      <span>Filter:</span>
                    </div>

                    {/* Appliance Type Filter */}
                    <select
                      value={productApplianceFilter}
                      onChange={(e) => setProductApplianceFilter(e.target.value)}
                      className="bg-slate-50 border border-slate-200 text-slate-700 py-1 px-2.5 rounded-lg text-xs font-medium focus:ring-1 focus:ring-amber-500"
                    >
                      <option value="all">All Appliances</option>
                      {APPLIANCE_OPTIONS.map((app) => (
                        <option key={app} value={app}>{app}</option>
                      ))}
                    </select>

                    {/* Category Filter */}
                    <select
                      value={productCategoryFilter}
                      onChange={(e) => setProductCategoryFilter(e.target.value)}
                      className="bg-slate-50 border border-slate-200 text-slate-700 py-1 px-2.5 rounded-lg text-xs font-medium focus:ring-1 focus:ring-amber-500"
                    >
                      <option value="all">All Categories</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>

                    {/* Brand Filter */}
                    <select
                      value={productBrandFilter}
                      onChange={(e) => setProductBrandFilter(e.target.value)}
                      className="bg-slate-50 border border-slate-200 text-slate-700 py-1 px-2.5 rounded-lg text-xs font-medium focus:ring-1 focus:ring-amber-500"
                    >
                      <option value="all">All Brands</option>
                      {brands.map((b) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>

                    {/* Availability Filter */}
                    <select
                      value={productAvailabilityFilter}
                      onChange={(e) => setProductAvailabilityFilter(e.target.value)}
                      className="bg-slate-50 border border-slate-200 text-slate-700 py-1 px-2.5 rounded-lg text-xs font-medium focus:ring-1 focus:ring-amber-500"
                    >
                      <option value="all">All Availability</option>
                      <option value="Available">Available</option>
                      <option value="Contact Store">Contact Store</option>
                      <option value="Check Availability">Check Availability</option>
                      <option value="Currently Unavailable">Currently Unavailable</option>
                    </select>

                    {/* Reset button */}
                    {(tableSearch || productApplianceFilter !== 'all' || productCategoryFilter !== 'all' || productBrandFilter !== 'all' || productAvailabilityFilter !== 'all') && (
                      <button
                        onClick={() => {
                          setTableSearch('');
                          setProductApplianceFilter('all');
                          setProductCategoryFilter('all');
                          setProductBrandFilter('all');
                          setProductAvailabilityFilter('all');
                        }}
                        className="text-slate-500 hover:text-amber-600 px-2 py-1 rounded flex items-center gap-1 font-semibold text-[11px] ml-auto"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reset Filters</span>
                      </button>
                    )}

                    <span className="text-[11px] text-slate-400 font-mono ml-auto">
                      Showing {filteredProducts.length} of {products.length} parts
                    </span>
                  </div>
                </div>

                {/* Products Table */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600">
                      <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                        <tr>
                          <th className="p-3.5">Product Name & SKU</th>
                          <th className="p-3.5">Appliance / Category</th>
                          <th className="p-3.5">Brand</th>
                          <th className="p-3.5">Availability</th>
                          <th className="p-3.5">Status</th>
                          <th className="p-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredProducts.length > 0 ? (
                          filteredProducts.map((p) => (
                            <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="p-3.5">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg bg-slate-100 border overflow-hidden shrink-0 flex items-center justify-center">
                                    <img 
                                      src={p.images[0]?.imageUrl || ''} 
                                      alt={p.name} 
                                      className="w-full h-full object-contain" 
                                    />
                                  </div>
                                  <div>
                                    <span className="font-bold text-slate-900 block">{p.name}</span>
                                    <span className="font-mono text-[11px] text-slate-400">{p.sku}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="p-3.5">
                                <span className="font-medium text-slate-800 block">{p.applianceType}</span>
                                <span className="text-slate-400 text-[11px]">
                                  {categories.find(c => c.id === p.categoryId)?.name || p.categoryName || 'General'}
                                </span>
                              </td>
                              <td className="p-3.5">
                                <span className="font-medium text-slate-800">
                                  {brands.find(b => b.id === p.brandId)?.name || p.brandName || 'OEM / Universal'}
                                </span>
                              </td>
                              <td className="p-3.5">
                                <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-semibold ${
                                  p.availability === 'Available' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                                }`}>
                                  {p.availability}
                                </span>
                              </td>
                              <td className="p-3.5">
                                <button
                                  type="button"
                                  onClick={() => handleToggleProductActive(p)}
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                                    p.isActive !== false
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                      : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                                  }`}
                                  title="Click to toggle active status"
                                >
                                  {p.isActive !== false ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3 text-slate-400" />}
                                  <span>{p.isActive !== false ? 'Active' : 'Inactive'}</span>
                                </button>
                              </td>
                              <td className="p-3.5 text-right space-x-1">
                                <button
                                  type="button"
                                  id={`admin-edit-product-${p.id}`}
                                  onClick={() => {
                                    setEditingProduct(p);
                                    setIsProductModalOpen(true);
                                  }}
                                  className="p-1.5 text-slate-600 hover:text-amber-600 rounded-lg hover:bg-amber-50 cursor-pointer transition-colors"
                                  title={`Edit ${p.name}`}
                                >
                                  <Edit className="w-4 h-4 inline" />
                                </button>
                                <button
                                  type="button"
                                  id={`admin-delete-product-${p.id}`}
                                  onClick={() => handleDeleteProduct(p.id, p.name)}
                                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 cursor-pointer transition-colors"
                                  title={`Delete ${p.name}`}
                                >
                                  <Trash2 className="w-4 h-4 inline" />
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="p-10 text-center text-slate-400">
                              <p className="font-semibold">No spare parts match your filters.</p>
                              <p className="text-xs text-slate-400 mt-1">Try resetting the filters or modifying your search.</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 3. CATEGORIES SUBVIEW */}
            {activeTab === 'categories' && (
              <div className="space-y-4">
                {/* Header & Create Button */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-base">Appliance Spare Categories</h3>
                        <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                          {categories.length} Total
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Create, edit, organize sort order, and link spare parts to appliance categories
                      </p>
                    </div>

                    <button
                      onClick={handleOpenNewCategory}
                      className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Category</span>
                    </button>
                  </div>

                  {/* Filter & Search Toolbar */}
                  <div className="pt-2 border-t border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 text-xs">
                    <div className="flex flex-wrap items-center gap-2 flex-1">
                      {/* Search box */}
                      <div className="relative flex-1 min-w-[200px] max-w-sm">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          value={categorySearch}
                          onChange={(e) => setCategorySearch(e.target.value)}
                          placeholder="Search categories or common parts..."
                          className="w-full pl-8 pr-7 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                        />
                        {categorySearch && (
                          <button onClick={() => setCategorySearch('')} className="absolute right-2 top-2 text-slate-400 hover:text-slate-600">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Appliance Filter */}
                      <select
                        value={categoryApplianceFilter}
                        onChange={(e) => setCategoryApplianceFilter(e.target.value)}
                        className="bg-slate-50 border border-slate-200 text-slate-700 py-1.5 px-2.5 rounded-xl text-xs font-medium focus:ring-1 focus:ring-amber-500"
                      >
                        <option value="all">All Appliances</option>
                        {APPLIANCE_OPTIONS.map((app) => (
                          <option key={app} value={app}>{app}</option>
                        ))}
                      </select>

                      {/* Status Filter */}
                      <select
                        value={categoryStatusFilter}
                        onChange={(e) => setCategoryStatusFilter(e.target.value)}
                        className="bg-slate-50 border border-slate-200 text-slate-700 py-1.5 px-2.5 rounded-xl text-xs font-medium focus:ring-1 focus:ring-amber-500"
                      >
                        <option value="all">All Statuses</option>
                        <option value="active">Active in Catalogue</option>
                        <option value="inactive">Inactive / Hidden</option>
                      </select>

                      {/* Sort Dropdown */}
                      <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1">
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                        <select
                          value={categorySort}
                          onChange={(e: any) => setCategorySort(e.target.value)}
                          className="bg-transparent text-slate-700 text-xs font-medium focus:outline-none"
                        >
                          <option value="order">Sort Order</option>
                          <option value="name-asc">Name (A-Z)</option>
                          <option value="name-desc">Name (Z-A)</option>
                          <option value="products-count">Most Spare Parts</option>
                        </select>
                      </div>

                      {/* Clear button */}
                      {(categorySearch || categoryApplianceFilter !== 'all' || categoryStatusFilter !== 'all' || categorySort !== 'order') && (
                        <button
                          onClick={() => {
                            setCategorySearch('');
                            setCategoryApplianceFilter('all');
                            setCategoryStatusFilter('all');
                            setCategorySort('order');
                          }}
                          className="text-slate-500 hover:text-amber-600 px-2 py-1 rounded flex items-center gap-1 font-semibold text-[11px]"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Reset</span>
                        </button>
                      )}
                    </div>

                    <span className="text-[11px] text-slate-400 font-mono shrink-0">
                      Showing {filteredCategories.length} of {categories.length} categories
                    </span>
                  </div>
                </div>

                {/* Categories Grid */}
                {filteredCategories.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCategories.map((cat) => {
                      const linkedCount = categoryProductCountMap[cat.id] || 0;
                      return (
                        <div 
                          key={cat.id} 
                          className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                        >
                          <div>
                            {/* Card Media Header */}
                            <div className="relative h-36 bg-slate-100 overflow-hidden group">
                              <img 
                                src={cat.imageUrl} 
                                alt={cat.name} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e: any) => {
                                  e.target.src = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80';
                                }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
                              
                              {/* Top Badges */}
                              <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-900/80 text-amber-300 backdrop-blur-xs">
                                  {cat.applianceType}
                                </span>

                                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-white/90 text-slate-700 shadow-xs">
                                  Order #{cat.sortOrder || 10}
                                </span>
                              </div>

                              {/* Bottom Badges on Image */}
                              <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between">
                                <button
                                  type="button"
                                  onClick={() => handleToggleCategoryActive(cat)}
                                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-all shadow-xs ${
                                    cat.isActive !== false
                                      ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                  }`}
                                  title="Click to toggle category visibility in public catalogue"
                                >
                                  {cat.isActive !== false ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                  <span>{cat.isActive !== false ? 'Active' : 'Inactive'}</span>
                                </button>

                                <span className="text-[11px] font-mono text-slate-200">
                                  /{cat.slug}
                                </span>
                              </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-4 space-y-3">
                              <div>
                                <h4 className="font-bold text-slate-900 text-base">{cat.name}</h4>
                                <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                                  {cat.description || 'Appliance components and replacement assemblies.'}
                                </p>
                              </div>

                              {/* Common Parts Tags */}
                              {cat.commonParts && cat.commonParts.length > 0 && (
                                <div className="space-y-1">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    Key Spare Parts:
                                  </span>
                                  <div className="flex flex-wrap gap-1">
                                    {cat.commonParts.map((tag, idx) => (
                                      <span 
                                        key={idx} 
                                        className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Card Footer Actions */}
                          <div className="p-4 pt-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                            {/* Filter Products Link Button */}
                            <button
                              type="button"
                              onClick={() => {
                                setProductCategoryFilter(cat.id);
                                setActiveTab('products');
                              }}
                              className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1.5"
                              title="Click to view all parts in this category"
                            >
                              <Package className="w-3.5 h-3.5" />
                              <span>{linkedCount} {linkedCount === 1 ? 'Part' : 'Parts'} in Catalogue</span>
                            </button>

                            {/* Edit / Delete Buttons */}
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                id={`admin-edit-category-${cat.id}`}
                                onClick={() => {
                                  setEditingCategory(cat);
                                  setIsCategoryModalOpen(true);
                                }}
                                className="p-1.5 text-slate-600 hover:text-amber-600 rounded-lg hover:bg-amber-100/50 transition-colors cursor-pointer"
                                title={`Edit ${cat.name}`}
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                id={`admin-delete-category-${cat.id}`}
                                onClick={() => handleDeleteCategory(cat.id, cat.name)}
                                className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                                title={`Delete ${cat.name}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-3">
                    <Layers className="w-10 h-10 text-slate-300 mx-auto" />
                    <h4 className="font-bold text-slate-800 text-sm">No categories match your filters</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Try clearing your search query or changing your appliance filter.
                    </p>
                    <button
                      onClick={() => {
                        setCategorySearch('');
                        setCategoryApplianceFilter('all');
                        setCategoryStatusFilter('all');
                      }}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
                    >
                      Clear Filters
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 4. BRANDS SUBVIEW */}
            {activeTab === 'brands' && (
              <div className="space-y-4">
                {/* Header & Create Button */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-base">Supported Brands & OEMs</h3>
                        <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                          {brands.length} Total
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Manage manufacturers, logos, supported appliances, and filter tags across the spare-parts catalogue
                      </p>
                    </div>

                    <button
                      onClick={handleOpenNewBrand}
                      className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Brand</span>
                    </button>
                  </div>

                  {/* Filter & Search Toolbar */}
                  <div className="pt-2 border-t border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 text-xs">
                    <div className="flex flex-wrap items-center gap-2 flex-1">
                      {/* Search box */}
                      <div className="relative flex-1 min-w-[200px] max-w-sm">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          value={brandSearch}
                          onChange={(e) => setBrandSearch(e.target.value)}
                          placeholder="Search brands or appliance types..."
                          className="w-full pl-8 pr-7 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                        />
                        {brandSearch && (
                          <button onClick={() => setBrandSearch('')} className="absolute right-2 top-2 text-slate-400 hover:text-slate-600">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Appliance Filter */}
                      <select
                        value={brandApplianceFilter}
                        onChange={(e) => setBrandApplianceFilter(e.target.value)}
                        className="bg-slate-50 border border-slate-200 text-slate-700 py-1.5 px-2.5 rounded-xl text-xs font-medium focus:ring-1 focus:ring-amber-500"
                      >
                        <option value="all">All Appliances</option>
                        {APPLIANCE_OPTIONS.map((app) => (
                          <option key={app} value={app}>{app}</option>
                        ))}
                      </select>

                      {/* Status Filter */}
                      <select
                        value={brandStatusFilter}
                        onChange={(e) => setBrandStatusFilter(e.target.value)}
                        className="bg-slate-50 border border-slate-200 text-slate-700 py-1.5 px-2.5 rounded-xl text-xs font-medium focus:ring-1 focus:ring-amber-500"
                      >
                        <option value="all">All Statuses</option>
                        <option value="active">Active in Catalogue</option>
                        <option value="inactive">Inactive / Hidden</option>
                      </select>

                      {/* Sort Dropdown */}
                      <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1">
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                        <select
                          value={brandSort}
                          onChange={(e: any) => setBrandSort(e.target.value)}
                          className="bg-transparent text-slate-700 text-xs font-medium focus:outline-none"
                        >
                          <option value="name-asc">Name (A-Z)</option>
                          <option value="name-desc">Name (Z-A)</option>
                          <option value="products-count">Most Spare Parts</option>
                          <option value="newest">Newest Added</option>
                        </select>
                      </div>

                      {/* Clear button */}
                      {(brandSearch || brandApplianceFilter !== 'all' || brandStatusFilter !== 'all' || brandSort !== 'name-asc') && (
                        <button
                          onClick={() => {
                            setBrandSearch('');
                            setBrandApplianceFilter('all');
                            setBrandStatusFilter('all');
                            setBrandSort('name-asc');
                          }}
                          className="text-slate-500 hover:text-amber-600 px-2 py-1 rounded flex items-center gap-1 font-semibold text-[11px]"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Reset</span>
                        </button>
                      )}
                    </div>

                    <span className="text-[11px] text-slate-400 font-mono shrink-0">
                      Showing {filteredBrands.length} of {brands.length} brands
                    </span>
                  </div>
                </div>

                {/* Brands Grid */}
                {filteredBrands.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredBrands.map((b) => {
                      const linkedCount = brandProductCountMap[b.id] || 0;
                      return (
                        <div 
                          key={b.id} 
                          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-3"
                        >
                          <div className="space-y-2.5">
                            {/* Top row: Monogram/Logo & Actions */}
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2.5">
                                {b.logoUrl ? (
                                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 p-1 flex items-center justify-center shrink-0">
                                    <img 
                                      src={b.logoUrl} 
                                      alt={b.name} 
                                      className="max-h-full max-w-full object-contain" 
                                      onError={(e: any) => {
                                        e.target.style.display = 'none';
                                      }}
                                    />
                                  </div>
                                ) : (
                                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-amber-400 font-black flex items-center justify-center text-sm shadow-xs shrink-0">
                                    {b.name.slice(0, 2).toUpperCase()}
                                  </div>
                                )}

                                <div>
                                  <h4 className="font-bold text-slate-900 text-sm leading-tight">{b.name}</h4>
                                  <span className="text-[10px] text-slate-400 font-mono">/{b.slug}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-0.5">
                                <button
                                  type="button"
                                  id={`admin-edit-brand-${b.id}`}
                                  onClick={() => {
                                    setEditingBrand(b);
                                    setIsBrandModalOpen(true);
                                  }}
                                  className="p-1.5 text-slate-500 hover:text-amber-600 rounded-lg hover:bg-amber-50 cursor-pointer transition-colors"
                                  title={`Edit ${b.name}`}
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  id={`admin-delete-brand-${b.id}`}
                                  onClick={() => handleDeleteBrand(b.id, b.name)}
                                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 cursor-pointer transition-colors"
                                  title={`Delete ${b.name}`}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Description if present */}
                            {b.description && (
                              <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                                {b.description}
                              </p>
                            )}

                            {/* Supported Appliances Chips */}
                            {b.appliancesSupported && b.appliancesSupported.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {b.appliancesSupported.map((app, idx) => (
                                  <span 
                                    key={idx}
                                    className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium"
                                  >
                                    {app}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Bottom Stats & Status row */}
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                            <button
                              type="button"
                              onClick={() => {
                                setProductBrandFilter(b.id);
                                setActiveTab('products');
                              }}
                              className="text-[11px] font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1"
                              title="Click to view all parts under this brand"
                            >
                              <Package className="w-3 h-3" />
                              <span>{linkedCount} {linkedCount === 1 ? 'Part' : 'Parts'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleBrandActive(b)}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                                b.isActive !== false
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                              }`}
                              title="Click to toggle brand active status"
                            >
                              {b.isActive !== false ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3 text-slate-400" />}
                              <span>{b.isActive !== false ? 'Active' : 'Inactive'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-3">
                    <Bookmark className="w-10 h-10 text-slate-300 mx-auto" />
                    <h4 className="font-bold text-slate-800 text-sm">No brands match your filters</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Try clearing your search query or changing your appliance filter.
                    </p>
                    <button
                      onClick={() => {
                        setBrandSearch('');
                        setBrandApplianceFilter('all');
                        setBrandStatusFilter('all');
                      }}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
                    >
                      Clear Filters
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 5. STORES SUBVIEW */}
            {activeTab === 'stores' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200">
                  <h3 className="font-bold text-slate-900 text-sm">Physical Stores Directory</h3>
                  <button
                    onClick={() => {
                      setEditingStore({
                        id: '',
                        name: '',
                        storeCode: `APEX-0${stores.length + 1}`,
                        address: '',
                        area: '',
                        city: 'Mumbai',
                        state: 'Maharashtra',
                        postalCode: '400001',
                        phone: '+91 98201 54321',
                        whatsapp: '+919820154321',
                        email: 'store@apexenterprises.com',
                        openingHours: 'Mon - Sat: 9:30 AM - 8:30 PM',
                        weeklyClosedDay: 'Sunday',
                        latitude: 19.0760,
                        longitude: 72.8777,
                        googleMapsUrl: 'https://maps.google.com',
                        imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
                        isActive: true,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                      });
                      setIsStoreModalOpen(true);
                    }}
                    className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Store Branch</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {stores.map((st) => (
                    <div key={st.id} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            {st.storeCode}
                          </span>
                          <h4 className="font-bold text-slate-900 text-sm mt-1">{st.name}</h4>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            id={`admin-edit-store-${st.id}`}
                            onClick={() => {
                              setEditingStore(st);
                              setIsStoreModalOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-amber-600 rounded-lg hover:bg-amber-50 cursor-pointer transition-colors"
                            title={`Edit ${st.name}`}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            id={`admin-delete-store-${st.id}`}
                            onClick={() => handleDeleteStore(st.id, st.name)}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 cursor-pointer transition-colors"
                            title={`Delete ${st.name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600">{st.address}, {st.city}</p>
                      <div className="text-xs text-slate-500">
                        <p>Hours: {st.openingHours}</p>
                        <p>Phone: {st.phone}</p>
                        <p className="text-[11px] font-mono text-slate-400 mt-1">
                          Lat/Lng: {st.latitude.toFixed(4)}, {st.longitude.toFixed(4)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. SETTINGS SUBVIEW */}
            {activeTab === 'settings' && settingsForm && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Website & Business Settings</h3>
                    <p className="text-xs text-slate-500">Update company phone, WhatsApp, and homepage branding text</p>
                  </div>
                  {settingsSaved && (
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      Saved Successfully
                    </span>
                  )}
                </div>

                <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 uppercase mb-1">Business Name</label>
                      <input
                        type="text"
                        value={settingsForm.businessName}
                        onChange={(e) => setSettingsForm({ ...settingsForm, businessName: e.target.value })}
                        className="w-full text-sm border p-2 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 uppercase mb-1">Tagline</label>
                      <input
                        type="text"
                        value={settingsForm.tagline}
                        onChange={(e) => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
                        className="w-full text-sm border p-2 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 uppercase mb-1">Central Phone</label>
                      <input
                        type="text"
                        value={settingsForm.phone}
                        onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                        className="w-full text-sm border p-2 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 uppercase mb-1">WhatsApp Helpline</label>
                      <input
                        type="text"
                        value={settingsForm.whatsapp}
                        onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp: e.target.value })}
                        className="w-full text-sm border p-2 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 uppercase mb-1">Email</label>
                      <input
                        type="email"
                        value={settingsForm.email}
                        onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                        className="w-full text-sm border p-2 rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Headquarters Address</label>
                    <input
                      type="text"
                      value={settingsForm.headquartersAddress}
                      onChange={(e) => setSettingsForm({ ...settingsForm, headquartersAddress: e.target.value })}
                      className="w-full text-sm border p-2 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Homepage Headline</label>
                    <input
                      type="text"
                      value={settingsForm.homepageHeadline}
                      onChange={(e) => setSettingsForm({ ...settingsForm, homepageHeadline: e.target.value })}
                      className="w-full text-sm border p-2 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Homepage Subheadline</label>
                    <input
                      type="text"
                      value={settingsForm.homepageSubheadline}
                      onChange={(e) => setSettingsForm({ ...settingsForm, homepageSubheadline: e.target.value })}
                      className="w-full text-sm border p-2 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Homepage Supporting Text</label>
                    <input
                      type="text"
                      value={settingsForm.homepageSupportingText}
                      onChange={(e) => setSettingsForm({ ...settingsForm, homepageSupportingText: e.target.value })}
                      className="w-full text-sm border p-2 rounded-lg"
                    />
                  </div>

                  <div className="pt-3">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 shadow"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Business Settings</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 7. SECURITY & ACCESS SUBVIEW */}
            {activeTab === 'security' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                {/* Header Banner */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-black text-slate-900 text-lg tracking-tight">Security & Administrator Access</h2>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                          Active Protection
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Manage your profile, rotate credentials with instant strength validation, and audit team access permissions.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddTeamModalOpen(true)}
                      className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Add Administrator</span>
                    </button>
                  </div>
                </div>

                {/* Grid: Profile & Password */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Card 1: Administrator Profile */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-amber-600" />
                        <h3 className="font-bold text-slate-900 text-sm">Administrator Profile</h3>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        user?.role === 'super_admin' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user?.role === 'super_admin' ? 'Super Administrator' : 'Administrator'}
                      </span>
                    </div>

                    <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                      <div>
                        <label className="block font-bold text-slate-700 uppercase mb-1">Full Display Name *</label>
                        <input
                          type="text"
                          required
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                          className="w-full text-sm border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                          placeholder="e.g., Mohammed Salman Faris"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 uppercase mb-1">Administrator Email *</label>
                        <input
                          type="email"
                          required
                          value={profileEmail}
                          onChange={(e) => setProfileEmail(e.target.value)}
                          className="w-full text-sm border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                          placeholder="admin@apexenterprises.com"
                        />
                      </div>

                      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-[11px] text-slate-600 space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Account ID:</span>
                          <span className="font-mono text-slate-700">{user?.id || 'admin-01'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Last Session Login:</span>
                          <span className="text-slate-700">
                            {user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Active Current Session'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Token Validity:</span>
                          <span className="text-emerald-700 font-semibold">24h Rolling JWT</span>
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={isSavingProfile}
                          className="w-full sm:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {isSavingProfile ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Updating Profile...</span>
                            </>
                          ) : (
                            <>
                              <Save className="w-3.5 h-3.5" />
                              <span>Save Profile Details</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Card 2: Password Security & Rotation */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <Key className="w-4 h-4 text-amber-600" />
                        <h3 className="font-bold text-slate-900 text-sm">Change Administrator Password</h3>
                      </div>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3" />
                        Bcrypt Hashed
                      </span>
                    </div>

                    <form onSubmit={handleChangePassword} className="space-y-3.5 text-xs">
                      <div>
                        <label className="block font-bold text-slate-700 uppercase mb-1">Current Password *</label>
                        <div className="relative">
                          <input
                            type={showCurrentPassword ? 'text' : 'password'}
                            required
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full text-sm border border-slate-300 rounded-xl pl-3 pr-10 py-2.5 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                            placeholder="Enter current password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                          >
                            {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 uppercase mb-1">New Password *</label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full text-sm border border-slate-300 rounded-xl pl-3 pr-10 py-2.5 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                            placeholder="Minimum 6 characters"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                          >
                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>

                        {/* Password Strength Indicator */}
                        {newPassword && (
                          <div className="mt-2 space-y-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-slate-500">Password Strength:</span>
                              <span className={`font-bold ${passwordStrength.text}`}>{passwordStrength.label}</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden flex gap-1">
                              {[1, 2, 3, 4, 5].map((lvl) => (
                                <div
                                  key={lvl}
                                  className={`h-full flex-1 rounded-full transition-all duration-200 ${
                                    lvl <= passwordStrength.score ? passwordStrength.color : 'bg-slate-200'
                                  }`}
                                />
                              ))}
                            </div>
                            <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-500 pt-0.5">
                              <span className={newPassword.length >= 6 ? 'text-emerald-600 font-semibold' : ''}>
                                {newPassword.length >= 6 ? '✓' : '○'} At least 6 characters
                              </span>
                              <span className={/[0-9]/.test(newPassword) ? 'text-emerald-600 font-semibold' : ''}>
                                {/[0-9]/.test(newPassword) ? '✓' : '○'} Contains number
                              </span>
                              <span className={/[A-Z]/.test(newPassword) ? 'text-emerald-600 font-semibold' : ''}>
                                {/[A-Z]/.test(newPassword) ? '✓' : '○'} Capital letter
                              </span>
                              <span className={/[^A-Za-z0-9]/.test(newPassword) ? 'text-emerald-600 font-semibold' : ''}>
                                {/[^A-Za-z0-9]/.test(newPassword) ? '✓' : '○'} Special character
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block font-bold text-slate-700 uppercase">Confirm New Password *</label>
                          {confirmPassword && (
                            <span className={`text-[10px] font-bold ${
                              confirmPassword === newPassword ? 'text-emerald-600' : 'text-red-500'
                            }`}>
                              {confirmPassword === newPassword ? '✓ Passwords Match' : '✗ Does Not Match'}
                            </span>
                          )}
                        </div>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full text-sm border border-slate-300 rounded-xl pl-3 pr-10 py-2.5 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                            placeholder="Re-enter new password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={isChangingPassword || !currentPassword || !newPassword || newPassword !== confirmPassword}
                          className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {isChangingPassword ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Updating Password...</span>
                            </>
                          ) : (
                            <>
                              <Key className="w-3.5 h-3.5" />
                              <span>Update Password Securely</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

                {/* Team Access Management Table */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-amber-600" />
                        <h3 className="font-bold text-slate-900 text-sm">Authorized Administrator Accounts ({teamMembers.length})</h3>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Team members who can authenticate into this Apex Enterprises management console.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsAddTeamModalOpen(true)}
                      className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>+ Add New Admin</span>
                    </button>
                  </div>

                  {isLoadingTeam ? (
                    <div className="p-8 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                      <span>Loading team accounts...</span>
                    </div>
                  ) : teamMembers.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs">
                      No additional administrator accounts registered.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                            <th className="pb-2.5">Administrator</th>
                            <th className="pb-2.5">Email Address</th>
                            <th className="pb-2.5">Role</th>
                            <th className="pb-2.5">Last Login</th>
                            <th className="pb-2.5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {teamMembers.map((member) => {
                            const isCurrentUser = member.id === user?.id || member.email.toLowerCase() === user?.email.toLowerCase();
                            return (
                              <tr key={member.id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="py-3 font-medium text-slate-900">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-xs shrink-0">
                                      {member.name ? member.name.charAt(0).toUpperCase() : 'A'}
                                    </div>
                                    <div>
                                      <span className="font-bold text-slate-900 block">{member.name}</span>
                                      {isCurrentUser && (
                                        <span className="text-[10px] text-amber-600 font-bold block">Current Session</span>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 font-mono text-slate-600 text-[11px]">
                                  {member.email}
                                </td>
                                <td className="py-3">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                    member.role === 'super_admin' 
                                      ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                                  }`}>
                                    {member.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                                  </span>
                                </td>
                                <td className="py-3 text-slate-500 text-[11px]">
                                  {member.lastLoginAt ? new Date(member.lastLoginAt).toLocaleDateString(undefined, {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  }) : '—'}
                                </td>
                                <td className="py-3 text-right">
                                  {isCurrentUser ? (
                                    <span className="text-[10px] bg-slate-100 text-slate-500 font-semibold px-2 py-1 rounded-md">
                                      You
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteAdminClick(member)}
                                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                      title="Revoke administrator access"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Security Status & Safeguards Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Brute-Force Shield</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      5 failed attempts initiates an automatic 5-minute security lockout to protect against unauthorized password guessing.
                    </p>
                  </div>

                  <div className="p-4 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      <Key className="w-4 h-4 text-amber-600" />
                      <span>Bcrypt Salt Encryption</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Credentials are salted and hashed cryptographically before disk storage. Plaintext passwords are never stored.
                    </p>
                  </div>

                  <div className="p-4 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span>Session Token Integrity</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Sessions automatically expire after 24 hours. The application intercepts expired tokens cleanly with no data loss.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* --- MODAL: CREATE / EDIT PRODUCT --- */}
      {isProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                {editingProduct.id ? 'Edit Product' : 'Add New Spare Part'}
              </h3>
              <button onClick={() => setIsProductModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Part Name *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full text-sm border p-2 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">SKU / Part Number *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.sku}
                    onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                    className="w-full text-sm border p-2 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Appliance Type</label>
                  <select
                    value={editingProduct.applianceType}
                    onChange={(e) => setEditingProduct({ ...editingProduct, applianceType: e.target.value as any })}
                    className="w-full text-sm border p-2 rounded-lg bg-white"
                  >
                    <option value="Air Conditioner">Air Conditioner</option>
                    <option value="Washing Machine">Washing Machine</option>
                    <option value="Microwave Oven">Microwave Oven</option>
                    <option value="Water Purifier">Water Purifier</option>
                    <option value="Refrigerator">Refrigerator</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Category</label>
                  <select
                    value={editingProduct.categoryId}
                    onChange={(e) => setEditingProduct({ ...editingProduct, categoryId: e.target.value })}
                    className="w-full text-sm border p-2 rounded-lg bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Brand</label>
                  <select
                    value={editingProduct.brandId}
                    onChange={(e) => setEditingProduct({ ...editingProduct, brandId: e.target.value })}
                    className="w-full text-sm border p-2 rounded-lg bg-white"
                  >
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Availability Status</label>
                  <select
                    value={editingProduct.availability}
                    onChange={(e) => setEditingProduct({ ...editingProduct, availability: e.target.value as any })}
                    className="w-full text-sm border p-2 rounded-lg bg-white"
                  >
                    <option value="Available">Available (In-Stock)</option>
                    <option value="Contact Store">Contact Store</option>
                    <option value="Check Availability">Check Availability</option>
                    <option value="Currently Unavailable">Currently Unavailable</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="featured-checkbox"
                    checked={editingProduct.featured || false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, featured: e.target.checked })}
                    className="w-4 h-4 text-amber-500 rounded"
                  />
                  <label htmlFor="featured-checkbox" className="font-bold text-slate-800">
                    Feature on Homepage
                  </label>
                </div>
              </div>

              <div className="space-y-1.5">
                <input 
                  type="file" 
                  ref={productFileInputRef} 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => handleFileUpload(e, 'product')} 
                />
                <label className="block font-bold text-slate-700 uppercase mb-1">Primary Image</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="url"
                    required
                    value={editingProduct.images[0]?.imageUrl || ''}
                    onChange={(e) => {
                      const newImages = [...editingProduct.images];
                      newImages[0] = {
                        id: 'img-1',
                        imageUrl: e.target.value,
                        altText: editingProduct.name,
                        sortOrder: 1,
                        isPrimary: true
                      };
                      setEditingProduct({ ...editingProduct, images: newImages });
                    }}
                    className="flex-1 text-sm border p-2 rounded-lg"
                    placeholder="https://... or upload image"
                  />
                  <button
                    type="button"
                    onClick={() => productFileInputRef.current?.click()}
                    disabled={isUploadingProductImage}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center gap-1.5 font-bold text-xs shrink-0 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-amber-600" />
                    <span>{isUploadingProductImage ? 'Uploading...' : 'Upload File'}</span>
                  </button>
                </div>

                {editingProduct.images[0]?.imageUrl && (
                  <div className="mt-1 flex items-center gap-3 p-2 bg-slate-50 border border-slate-200 rounded-xl">
                    <img 
                      src={editingProduct.images[0]?.imageUrl} 
                      alt="Part Preview" 
                      className="w-14 h-14 object-contain rounded-lg border bg-white p-1"
                    />
                    <div className="text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-700 block">Current Photo Preview</span>
                      <span className="text-[10px] text-slate-400 truncate max-w-[280px] block font-mono">
                        {editingProduct.images[0]?.imageUrl}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full text-sm border p-2 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Compatible Models (comma-separated)
                </label>
                <input
                  type="text"
                  value={editingProduct.compatibility ? editingProduct.compatibility.join(', ') : ''}
                  onChange={(e) => setEditingProduct({ 
                    ...editingProduct, 
                    compatibility: e.target.value.split(',').map(s => s.trim()).filter(Boolean) 
                  })}
                  className="w-full text-sm border p-2 rounded-lg"
                  placeholder="LG 6.5kg Front Load, Model FHM1207SDW, etc."
                />
              </div>

              <div className="pt-3 flex items-center justify-between border-t border-slate-200">
                {editingProduct.id ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteProduct(editingProduct.id, editingProduct.name)}
                    className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer text-xs"
                    title="Delete this spare part"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Part</span>
                  </button>
                ) : <div />}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsProductModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg shadow text-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Spare Part</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: CREATE / EDIT CATEGORY --- */}
      {isCategoryModalOpen && editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  {editingCategory.id ? 'Edit Category' : 'Add Appliance Category'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Organize and classify spare parts by appliance family
                </p>
              </div>
              <button 
                onClick={() => { setIsCategoryModalOpen(false); setEditingCategory(null); }} 
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
              <input 
                type="file" 
                ref={categoryFileInputRef} 
                accept="image/*" 
                className="hidden" 
                onChange={(e) => handleFileUpload(e, 'category')} 
              />

              {/* Name & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingCategory.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      const slug = (!editingCategory.id && (!editingCategory.slug || editingCategory.slug === editingCategory.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')))
                        ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
                        : editingCategory.slug;
                      setEditingCategory({ 
                        ...editingCategory, 
                        name,
                        slug
                      });
                    }}
                    placeholder="e.g. AC Motors & Blowers"
                    className="w-full text-sm border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-700 uppercase">
                      URL Slug *
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const slug = editingCategory.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                        setEditingCategory({ ...editingCategory, slug });
                      }}
                      className="text-[10px] text-amber-600 hover:underline font-semibold cursor-pointer"
                    >
                      Generate from Name
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={editingCategory.slug}
                    onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                    placeholder="e.g. ac-motors-blowers"
                    className="w-full text-sm border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              {/* Appliance Type & Sort Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Appliance Family *
                  </label>
                  <select
                    required
                    value={editingCategory.applianceType}
                    onChange={(e) => setEditingCategory({ ...editingCategory, applianceType: e.target.value })}
                    className="w-full text-sm border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 bg-white"
                  >
                    {APPLIANCE_OPTIONS.map((app) => (
                      <option key={app} value={app}>{app}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Display Sort Order
                  </label>
                  <input
                    type="number"
                    value={editingCategory.sortOrder ?? 10}
                    onChange={(e) => setEditingCategory({ ...editingCategory, sortOrder: parseInt(e.target.value, 10) || 0 })}
                    placeholder="10, 20, 30..."
                    className="w-full text-sm border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                  />
                  <span className="text-[10px] text-slate-400">Lower numbers appear first</span>
                </div>
              </div>

              {/* Category Image URL & File Upload */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700 uppercase">
                  Category Banner Image
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={editingCategory.imageUrl || ''}
                    onChange={(e) => setEditingCategory({ ...editingCategory, imageUrl: e.target.value })}
                    placeholder="https://... or upload below"
                    className="flex-1 text-sm border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => categoryFileInputRef.current?.click()}
                    disabled={isUploadingCategoryImage}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center gap-1.5 font-bold text-xs shrink-0 cursor-pointer transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5 text-amber-600" />
                    <span>{isUploadingCategoryImage ? 'Uploading...' : 'Upload Image'}</span>
                  </button>
                </div>

                {editingCategory.imageUrl && (
                  <div className="mt-2 flex items-center gap-3 p-2 bg-slate-50 border border-slate-200 rounded-xl">
                    <img 
                      src={editingCategory.imageUrl} 
                      alt="Category Preview" 
                      className="w-20 h-14 object-cover rounded-lg border bg-white"
                      onError={(e: any) => { e.target.src = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80'; }}
                    />
                    <div className="text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-700 block">Image Preview</span>
                      <span className="text-[10px] text-slate-400 truncate max-w-[280px] block font-mono">
                        {editingCategory.imageUrl}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Description / Parts Scope
                </label>
                <textarea
                  rows={2}
                  value={editingCategory.description || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  placeholder="e.g. Copper coils, universal capacitors, temperature sensors, fan motors and replacement blades."
                  className="w-full text-sm border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                />
              </div>

              {/* Common Parts Tag Manager */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-700 uppercase">
                  Key Common Parts / Keywords (for quick customer search)
                </label>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCategoryTag}
                    onChange={(e) => setNewCategoryTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCategoryTag();
                      }
                    }}
                    placeholder="Type part name (e.g. Blower Fan) and press enter"
                    className="flex-1 text-sm border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-amber-500/30"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddCategoryTag()}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-lg cursor-pointer"
                  >
                    Add Tag
                  </button>
                </div>

                {/* Predefined Quick Suggestion Tags */}
                <div className="flex flex-wrap gap-1.5 items-center pt-1">
                  <span className="text-[10px] font-semibold text-slate-400">Quick add:</span>
                  {['Capacitors', 'Sensors', 'Motors', 'PCB', 'Valves', 'Filters', 'Thermostats', 'Drain Pump', 'Belts'].map(suggested => (
                    <button
                      key={suggested}
                      type="button"
                      onClick={() => handleAddCategoryTag(suggested)}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 border border-slate-200 transition-colors cursor-pointer"
                    >
                      + {suggested}
                    </button>
                  ))}
                </div>

                {/* Active Tags */}
                {editingCategory.commonParts && editingCategory.commonParts.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 p-2.5 bg-slate-50 border border-slate-200 rounded-xl mt-2">
                    {editingCategory.commonParts.map((tag, idx) => (
                      <span 
                        key={idx}
                        className="inline-flex items-center gap-1 bg-white border border-slate-200 text-slate-800 text-xs px-2.5 py-1 rounded-lg font-medium shadow-2xs"
                      >
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCategoryTag(idx)}
                          className="text-slate-400 hover:text-red-600 ml-0.5 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Active Toggle */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block text-xs">Catalogue Visibility Status</span>
                  <span className="text-[11px] text-slate-500">Enable this category for customer browsing and search</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingCategory.isActive !== false}
                    onChange={(e) => setEditingCategory({ ...editingCategory, isActive: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Form Buttons */}
              <div className="pt-3 flex items-center justify-between border-t border-slate-100">
                {editingCategory.id ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(editingCategory.id, editingCategory.name)}
                    className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer text-xs"
                    title="Delete this category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Category</span>
                  </button>
                ) : <div />}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => { setIsCategoryModalOpen(false); setEditingCategory(null); }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg cursor-pointer text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5 text-xs"
                  >
                    <Save className="w-4 h-4" />
                    <span>{editingCategory.id ? 'Save Category Changes' : 'Create Category'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: CREATE / EDIT BRAND --- */}
      {isBrandModalOpen && editingBrand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  {editingBrand.id ? 'Edit Brand' : 'Add Supported Brand / OEM'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage appliance manufacturer details, logos, and supported categories
                </p>
              </div>
              <button 
                onClick={() => { setIsBrandModalOpen(false); setEditingBrand(null); }} 
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBrand} className="space-y-4 text-xs">
              <input 
                type="file" 
                ref={brandFileInputRef} 
                accept="image/*" 
                className="hidden" 
                onChange={(e) => handleFileUpload(e, 'brand')} 
              />

              {/* Name & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Brand Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingBrand.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      const slug = (!editingBrand.id && (!editingBrand.slug || editingBrand.slug === editingBrand.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')))
                        ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
                        : editingBrand.slug;
                      setEditingBrand({ 
                        ...editingBrand, 
                        name,
                        slug
                      });
                    }}
                    placeholder="e.g. Daikin, Voltas, LG"
                    className="w-full text-sm border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-700 uppercase">
                      URL Slug *
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const slug = editingBrand.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                        setEditingBrand({ ...editingBrand, slug });
                      }}
                      className="text-[10px] text-amber-600 hover:underline font-semibold cursor-pointer"
                    >
                      Generate from Name
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={editingBrand.slug || ''}
                    onChange={(e) => setEditingBrand({ ...editingBrand, slug: e.target.value })}
                    placeholder="e.g. daikin"
                    className="w-full text-sm border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              {/* Brand Logo URL & File Upload */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700 uppercase">
                  Brand Logo
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={editingBrand.logoUrl || ''}
                    onChange={(e) => setEditingBrand({ ...editingBrand, logoUrl: e.target.value })}
                    placeholder="https://... logo URL or upload image"
                    className="flex-1 text-sm border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => brandFileInputRef.current?.click()}
                    disabled={isUploadingBrandLogo}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center gap-1.5 font-bold text-xs shrink-0 cursor-pointer transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5 text-amber-600" />
                    <span>{isUploadingBrandLogo ? 'Uploading...' : 'Upload Logo'}</span>
                  </button>
                </div>

                {editingBrand.logoUrl && (
                  <div className="mt-2 flex items-center gap-3 p-2 bg-slate-50 border border-slate-200 rounded-xl">
                    <img 
                      src={editingBrand.logoUrl} 
                      alt="Brand Logo Preview" 
                      className="h-10 w-24 object-contain rounded-lg border bg-white p-1"
                      onError={(e: any) => { e.target.style.display = 'none'; }}
                    />
                    <div className="text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-700 block">Logo Preview</span>
                      <span className="text-[10px] text-slate-400 truncate max-w-[280px] block font-mono">
                        {editingBrand.logoUrl}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Official Website URL */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Official Website URL (Optional)
                </label>
                <input
                  type="url"
                  value={editingBrand.website || ''}
                  onChange={(e) => setEditingBrand({ ...editingBrand, website: e.target.value })}
                  placeholder="https://www.brand.com"
                  className="w-full text-sm border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                />
              </div>

              {/* Description / OEM Notes */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Brand Description / OEM Notes
                </label>
                <textarea
                  rows={2}
                  value={editingBrand.description || ''}
                  onChange={(e) => setEditingBrand({ ...editingBrand, description: e.target.value })}
                  placeholder="e.g. Genuine OEM manufacturer for split & inverter air conditioners, chillers, and scroll compressors."
                  className="w-full text-sm border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                />
              </div>

              {/* Supported Appliance Types (Multi-Select Pills) */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700 uppercase">
                  Appliances Supported by this Brand *
                </label>
                <div className="flex flex-wrap gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  {APPLIANCE_OPTIONS.map((app) => {
                    const isSelected = editingBrand.appliancesSupported?.includes(app);
                    return (
                      <button
                        key={app}
                        type="button"
                        onClick={() => {
                          const current = editingBrand.appliancesSupported || [];
                          const updated = isSelected 
                            ? current.filter(x => x !== app) 
                            : [...current, app];
                          setEditingBrand({ ...editingBrand, appliancesSupported: updated });
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                        <span>{app}</span>
                      </button>
                    );
                  })}
                </div>
                <span className="text-[10px] text-slate-400">Select all appliance product lines made or serviced by this brand</span>
              </div>

              {/* Active Toggle */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block text-xs">Catalogue Visibility Status</span>
                  <span className="text-[11px] text-slate-500">Display this brand in public brand filter menus and catalogue headers</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingBrand.isActive !== false}
                    onChange={(e) => setEditingBrand({ ...editingBrand, isActive: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Form Buttons */}
              <div className="pt-3 flex items-center justify-between border-t border-slate-100">
                {editingBrand.id ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteBrand(editingBrand.id, editingBrand.name)}
                    className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer text-xs"
                    title="Delete this brand"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Brand</span>
                  </button>
                ) : <div />}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => { setIsBrandModalOpen(false); setEditingBrand(null); }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg cursor-pointer text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5 text-xs"
                  >
                    <Save className="w-4 h-4" />
                    <span>{editingBrand.id ? 'Save Brand Changes' : 'Create Brand'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: CREATE / EDIT STORE --- */}
      {isStoreModalOpen && editingStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                {editingStore.id ? 'Edit Store Branch' : 'Add Physical Store Location'}
              </h3>
              <button onClick={() => setIsStoreModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStore} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Store Name *</label>
                  <input
                    type="text"
                    required
                    value={editingStore.name}
                    onChange={(e) => setEditingStore({ ...editingStore, name: e.target.value })}
                    className="w-full text-sm border p-2 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Branch Code *</label>
                  <input
                    type="text"
                    required
                    value={editingStore.storeCode}
                    onChange={(e) => setEditingStore({ ...editingStore, storeCode: e.target.value })}
                    className="w-full text-sm border p-2 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Full Address *</label>
                <input
                  type="text"
                  required
                  value={editingStore.address}
                  onChange={(e) => setEditingStore({ ...editingStore, address: e.target.value })}
                  className="w-full text-sm border p-2 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Area</label>
                  <input
                    type="text"
                    value={editingStore.area}
                    onChange={(e) => setEditingStore({ ...editingStore, area: e.target.value })}
                    className="w-full text-sm border p-2 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">City</label>
                  <input
                    type="text"
                    value={editingStore.city}
                    onChange={(e) => setEditingStore({ ...editingStore, city: e.target.value })}
                    className="w-full text-sm border p-2 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">PIN Code</label>
                  <input
                    type="text"
                    value={editingStore.postalCode}
                    onChange={(e) => setEditingStore({ ...editingStore, postalCode: e.target.value })}
                    className="w-full text-sm border p-2 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Store Phone *</label>
                  <input
                    type="text"
                    required
                    value={editingStore.phone}
                    onChange={(e) => setEditingStore({ ...editingStore, phone: e.target.value })}
                    className="w-full text-sm border p-2 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">WhatsApp Helpline *</label>
                  <input
                    type="text"
                    required
                    value={editingStore.whatsapp}
                    onChange={(e) => setEditingStore({ ...editingStore, whatsapp: e.target.value })}
                    className="w-full text-sm border p-2 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Opening Hours</label>
                  <input
                    type="text"
                    value={editingStore.openingHours}
                    onChange={(e) => setEditingStore({ ...editingStore, openingHours: e.target.value })}
                    className="w-full text-sm border p-2 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Weekly Off Day</label>
                  <input
                    type="text"
                    value={editingStore.weeklyClosedDay}
                    onChange={(e) => setEditingStore({ ...editingStore, weeklyClosedDay: e.target.value })}
                    className="w-full text-sm border p-2 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Latitude (for Map Pin)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={editingStore.latitude}
                    onChange={(e) => setEditingStore({ ...editingStore, latitude: parseFloat(e.target.value) || 0 })}
                    className="w-full text-sm border p-2 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Longitude (for Map Pin)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={editingStore.longitude}
                    onChange={(e) => setEditingStore({ ...editingStore, longitude: parseFloat(e.target.value) || 0 })}
                    className="w-full text-sm border p-2 rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-between border-t border-slate-200">
                {editingStore.id ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteStore(editingStore.id, editingStore.name)}
                    className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer text-xs"
                    title="Delete this store location"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Store</span>
                  </button>
                ) : <div />}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsStoreModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg shadow text-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Store</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: ADD ADMINISTRATOR TEAM MEMBER --- */}
      {isAddTeamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">Add Administrator Account</h3>
              </div>
              <button 
                type="button" 
                onClick={() => { setIsAddTeamModalOpen(false); setTeamFormError(null); }} 
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {teamFormError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{teamFormError}</span>
              </div>
            )}

            <form onSubmit={handleCreateTeamMember} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-amber-500 outline-none"
                  placeholder="e.g., Alex Johnson"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={newTeamEmail}
                  onChange={(e) => setNewTeamEmail(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-amber-500 outline-none"
                  placeholder="alex@apexenterprises.com"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Temporary Initial Password *</label>
                <input
                  type="password"
                  required
                  value={newTeamPassword}
                  onChange={(e) => setNewTeamPassword(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-amber-500 outline-none"
                  placeholder="Minimum 6 characters"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Access Role *</label>
                <select
                  value={newTeamRole}
                  onChange={(e) => setNewTeamRole(e.target.value as 'admin' | 'super_admin')}
                  className="w-full text-sm border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-amber-500 outline-none bg-white"
                >
                  <option value="admin">Administrator (Catalogue, Inventory & Store Management)</option>
                  <option value="super_admin">Super Administrator (Full System & User Control)</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setIsAddTeamModalOpen(false); setTeamFormError(null); }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingTeamMember}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg shadow-xs text-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSavingTeamMember ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Create Administrator</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- IN-APP DELETE CONFIRMATION MODAL --- */}
      {deleteTarget && (
        <div 
          id="admin-delete-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div 
            id="admin-delete-modal-dialog"
            className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 text-base">
                  Delete {deleteTarget.type === 'product' ? 'Spare Part' : deleteTarget.type === 'category' ? 'Category' : deleteTarget.type === 'brand' ? 'Brand' : deleteTarget.type === 'admin' ? 'Administrator Account' : 'Store Location'}?
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Are you sure you want to permanently delete <strong className="font-bold text-slate-900 break-words">"{deleteTarget.name}"</strong>?
                </p>
              </div>
            </div>

            {deleteTarget.warning && (
              <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  {deleteTarget.warning}
                </div>
              </div>
            )}

            <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
              <button
                type="button"
                id="admin-cancel-delete-btn"
                disabled={isDeleting}
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                id="admin-confirm-delete-btn"
                disabled={isDeleting}
                onClick={handleExecuteDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer transition-colors flex items-center gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Permanently</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- IN-APP TOAST NOTIFICATIONS --- */}
      {notification && (
        <div 
          id="admin-toast-notification"
          className={`fixed bottom-6 right-6 z-50 max-w-sm w-full p-4 rounded-xl shadow-2xl border flex items-center gap-3 animate-in slide-in-from-bottom-4 duration-200 ${
            notification.type === 'success' 
              ? 'bg-slate-900 text-white border-slate-700' 
              : 'bg-red-950 text-white border-red-800'
          }`}
        >
          {notification.type === 'success' ? (
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
              <AlertCircle className="w-4 h-4" />
            </div>
          )}
          <p className="text-xs font-medium flex-1 text-slate-100">{notification.message}</p>
          <button 
            type="button"
            id="admin-close-toast-btn"
            onClick={() => setNotification(null)}
            className="p-1 hover:bg-white/10 rounded-lg text-white/60 hover:text-white cursor-pointer transition-colors"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
