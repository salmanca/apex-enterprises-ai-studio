import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { db } from './db.js';
import { generateToken, verifyPassword, hashPassword, requireAdmin, AuthRequest } from './auth.js';

export const apiRouter = express.Router();

// Ensure upload directory exists
const UPLOAD_DIR = path.resolve(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `${cleanName}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/svg+xml'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, WebP, and SVG images are supported'));
    }
  }
});

// Health check
apiRouter.get('/health', (_req, res) => {
  res.json({ status: 'ok', business: 'Apex Enterprises', time: new Date().toISOString() });
});

// -------------------------------------------------------------
// PUBLIC API ROUTES
// -------------------------------------------------------------

// Settings
apiRouter.get('/settings', (_req, res) => {
  const settings = db.getSettings();
  res.json(settings);
});

// Categories
apiRouter.get('/categories', (_req, res) => {
  const categories = db.getCategories(true);
  res.json(categories);
});

apiRouter.get('/categories/:slug', (req, res) => {
  const category = db.getCategoryBySlug(req.params.slug);
  if (!category) {
    res.status(404).json({ error: 'Category not found' });
    return;
  }
  const products = db.getProducts({ categoryId: category.id, activeOnly: true });
  res.json({ category, products });
});

// Brands
apiRouter.get('/brands', (_req, res) => {
  const brands = db.getBrands(true);
  res.json(brands);
});

// Stores
apiRouter.get('/stores', (_req, res) => {
  const stores = db.getStores(true);
  res.json(stores);
});

apiRouter.get('/stores/:id', (req, res) => {
  const store = db.getStoreById(req.params.id);
  if (!store || !store.isActive) {
    res.status(404).json({ error: 'Store location not found' });
    return;
  }
  res.json(store);
});

// Products Catalogue
apiRouter.get('/products', (req, res) => {
  const { category, brand, appliance, search, availability, featured } = req.query;
  
  const products = db.getProducts({
    categorySlug: category as string,
    brandId: brand as string,
    applianceType: appliance as string,
    search: search as string,
    availability: availability as string,
    featured: featured !== undefined ? featured === 'true' : undefined,
    activeOnly: true
  });

  // Attach enriched brand and category info for seamless rendering
  const enriched = products.map(prod => {
    const brandObj = db.getBrandById(prod.brandId);
    const catObj = db.getCategoryById(prod.categoryId);
    return {
      ...prod,
      brandName: brandObj ? brandObj.name : 'Apex Certified',
      categoryName: catObj ? catObj.name : prod.applianceType
    };
  });

  res.json(enriched);
});

// Single Product Details
apiRouter.get('/products/:idOrSlug', (req, res) => {
  const { idOrSlug } = req.params;
  let product = db.getProductBySlug(idOrSlug);
  if (!product) {
    product = db.getProductById(idOrSlug);
  }

  if (!product || !product.isActive) {
    res.status(404).json({ error: 'Spare part product not found or is currently archived.' });
    return;
  }

  const brandObj = db.getBrandById(product.brandId);
  const catObj = db.getCategoryById(product.categoryId);
  
  // Get related products in same category
  const related = db.getProducts({ categoryId: product.categoryId, activeOnly: true })
    .filter(p => p.id !== product!.id)
    .slice(0, 4)
    .map(p => ({
      ...p,
      brandName: db.getBrandById(p.brandId)?.name || 'Apex Certified',
      categoryName: catObj?.name || p.applianceType
    }));

  res.json({
    ...product,
    brandName: brandObj ? brandObj.name : 'Apex Certified',
    categoryName: catObj ? catObj.name : product.applianceType,
    relatedProducts: related
  });
});

// Analytics tracking endpoint
apiRouter.post('/analytics/event', (req, res) => {
  const { type, details } = req.body;
  if (!type) {
    res.status(400).json({ error: 'Event type required' });
    return;
  }
  const event = db.logEvent(type, details);
  res.json({ status: 'ok', eventId: event.id });
});

// -------------------------------------------------------------
// ADMIN AUTHENTICATION
// -------------------------------------------------------------

apiRouter.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  const user = db.getUserByEmail(email);
  if (!user) {
    res.status(401).json({ error: 'Invalid administrator email or password' });
    return;
  }

  const isValid = verifyPassword(password, user.passwordHash);
  if (!isValid) {
    res.status(401).json({ error: 'Invalid administrator email or password' });
    return;
  }

  const token = generateToken(user);
  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

apiRouter.get('/auth/me', requireAdmin, (req: AuthRequest, res) => {
  res.json({ user: req.user });
});

apiRouter.post('/auth/change-password', requireAdmin, (req: AuthRequest, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    res.status(400).json({ error: 'Current password and new password are required' });
    return;
  }

  if (newPassword.length < 6) {
    res.status(400).json({ error: 'New password must be at least 6 characters long' });
    return;
  }

  const user = db.getUserById(req.user!.id);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  if (!verifyPassword(currentPassword, user.passwordHash)) {
    res.status(400).json({ error: 'Current password is incorrect' });
    return;
  }

  const newHash = hashPassword(newPassword);
  db.updateUserPassword(user.id, newHash);
  res.json({ status: 'ok', message: 'Password updated successfully' });
});

// -------------------------------------------------------------
// PROTECTED ADMIN CRUD ROUTES
// -------------------------------------------------------------

// Dashboard Stats
apiRouter.get('/admin/dashboard', requireAdmin, (_req, res) => {
  const stats = db.getDashboardStats();
  res.json(stats);
});

// Image Upload
apiRouter.post('/admin/upload', requireAdmin, upload.single('image'), (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: 'No image file uploaded or unsupported file format' });
    return;
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({
    url: fileUrl,
    filename: req.file.filename,
    size: req.file.size,
    mimetype: req.file.mimetype
  });
});

// Admin Products CRUD
apiRouter.get('/admin/products', requireAdmin, (_req, res) => {
  const products = db.getProducts({ activeOnly: false });
  const enriched = products.map(prod => ({
    ...prod,
    brandName: db.getBrandById(prod.brandId)?.name || 'Unknown',
    categoryName: db.getCategoryById(prod.categoryId)?.name || 'Unknown'
  }));
  res.json(enriched);
});

apiRouter.post('/admin/products', requireAdmin, (req, res) => {
  const { name, sku, categoryId, brandId, applianceType, description, specifications, compatibility, availability, isActive, images, featured } = req.body;
  
  if (!name || !categoryId || !sku) {
    res.status(400).json({ error: 'Product name, SKU, and category are required' });
    return;
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + `-${Date.now().toString().slice(-4)}`;

  const newProduct = db.createProduct({
    name,
    slug,
    sku,
    categoryId,
    brandId: brandId || '',
    applianceType: applianceType || 'Appliance',
    description: description || '',
    specifications: specifications || {},
    compatibility: Array.isArray(compatibility) ? compatibility : [],
    availability: availability || 'Available',
    isActive: isActive !== undefined ? isActive : true,
    featured: Boolean(featured),
    images: Array.isArray(images) && images.length > 0 ? images : [
      {
        id: `img-${Date.now()}`,
        imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
        altText: name,
        sortOrder: 1,
        isPrimary: true
      }
    ]
  });

  res.status(201).json(newProduct);
});

apiRouter.put('/admin/products/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const updated = db.updateProduct(id, req.body);
  if (!updated) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }
  res.json(updated);
});

apiRouter.delete('/admin/products/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const success = db.deleteProduct(id);
  if (!success) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }
  res.json({ status: 'ok', message: 'Product successfully deleted' });
});

// Admin Categories CRUD
apiRouter.get('/admin/categories', requireAdmin, (_req, res) => {
  const categories = db.getCategories(false);
  res.json(categories);
});

apiRouter.post('/admin/categories', requireAdmin, (req, res) => {
  const { name, slug, description, imageUrl, applianceType, sortOrder, isActive, commonParts } = req.body;
  if (!name) {
    res.status(400).json({ error: 'Category name is required' });
    return;
  }

  const catSlug = slug?.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  const newCat = db.createCategory({
    name,
    slug: catSlug,
    description: description || '',
    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=80',
    applianceType: applianceType || name,
    sortOrder: Number(sortOrder) || 10,
    isActive: isActive !== undefined ? isActive : true,
    commonParts: Array.isArray(commonParts) ? commonParts : []
  });

  res.status(201).json(newCat);
});

apiRouter.put('/admin/categories/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const updated = db.updateCategory(id, req.body);
  if (!updated) {
    res.status(404).json({ error: 'Category not found' });
    return;
  }
  res.json(updated);
});

apiRouter.delete('/admin/categories/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const success = db.deleteCategory(id);
  if (!success) {
    res.status(404).json({ error: 'Category not found' });
    return;
  }
  res.json({ status: 'ok', message: 'Category deleted successfully' });
});

// Admin Brands CRUD
apiRouter.get('/admin/brands', requireAdmin, (_req, res) => {
  const brands = db.getBrands(false);
  res.json(brands);
});

apiRouter.post('/admin/brands', requireAdmin, (req, res) => {
  const { name, slug, logoUrl, description, appliancesSupported, website, isActive } = req.body;
  if (!name) {
    res.status(400).json({ error: 'Brand name is required' });
    return;
  }

  const brandSlug = slug?.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const newBrand = db.createBrand({
    name,
    slug: brandSlug,
    logoUrl: logoUrl || '',
    description: description || '',
    appliancesSupported: Array.isArray(appliancesSupported) ? appliancesSupported : [],
    website: website || '',
    isActive: isActive !== undefined ? isActive : true
  });
  res.status(201).json(newBrand);
});

apiRouter.put('/admin/brands/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const updated = db.updateBrand(id, req.body);
  if (!updated) {
    res.status(404).json({ error: 'Brand not found' });
    return;
  }
  res.json(updated);
});

apiRouter.delete('/admin/brands/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const success = db.deleteBrand(id);
  if (!success) {
    res.status(404).json({ error: 'Brand not found' });
    return;
  }
  res.json({ status: 'ok', message: 'Brand deleted successfully' });
});

// Admin Stores CRUD
apiRouter.get('/admin/stores', requireAdmin, (_req, res) => {
  const stores = db.getStores(false);
  res.json(stores);
});

apiRouter.post('/admin/stores', requireAdmin, (req, res) => {
  const { name, storeCode, address, area, city, state, postalCode, latitude, longitude, phone, whatsapp, email, openingHours, weeklyClosedDay, description, imageUrl, isActive } = req.body;
  
  if (!name || !address || !phone) {
    res.status(400).json({ error: 'Store name, address, and phone number are required' });
    return;
  }

  const lat = Number(latitude) || 19.0760;
  const lng = Number(longitude) || 72.8777;

  const newStore = db.createStore({
    name,
    storeCode: storeCode || `APEX-${Date.now().toString().slice(-4)}`,
    address,
    area: area || '',
    city: city || 'Mumbai',
    state: state || 'Maharashtra',
    postalCode: postalCode || '',
    latitude: lat,
    longitude: lng,
    phone,
    whatsapp: whatsapp || phone.replace(/[^0-9]/g, ''),
    email: email || 'store@apexenterprises.com',
    googleMapsUrl: `https://maps.google.com/?q=${lat},${lng}`,
    openingHours: openingHours || 'Mon - Sat: 9:30 AM - 8:30 PM',
    weeklyClosedDay: weeklyClosedDay || 'Sunday',
    description: description || '',
    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
    isActive: isActive !== undefined ? isActive : true
  });

  res.status(201).json(newStore);
});

apiRouter.put('/admin/stores/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const updates = { ...req.body };
  if (updates.latitude !== undefined) updates.latitude = Number(updates.latitude);
  if (updates.longitude !== undefined) updates.longitude = Number(updates.longitude);
  if (updates.latitude && updates.longitude && !updates.googleMapsUrl) {
    updates.googleMapsUrl = `https://maps.google.com/?q=${updates.latitude},${updates.longitude}`;
  }

  const updated = db.updateStore(id, updates);
  if (!updated) {
    res.status(404).json({ error: 'Store not found' });
    return;
  }
  res.json(updated);
});

apiRouter.delete('/admin/stores/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const success = db.deleteStore(id);
  if (!success) {
    res.status(404).json({ error: 'Store not found' });
    return;
  }
  res.json({ status: 'ok', message: 'Store deleted successfully' });
});

// Admin Site Settings
apiRouter.put('/admin/settings', requireAdmin, (req, res) => {
  const updated = db.updateSettings(req.body);
  res.json(updated);
});
