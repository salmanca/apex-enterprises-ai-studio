import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SiteProvider, useSite } from './context/SiteContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { HomeView } from './views/HomeView';
import { ProductsView } from './views/ProductsView';
import { ProductDetailView } from './views/ProductDetailView';
import { CategoriesView } from './views/CategoriesView';
import { StoresView } from './views/StoresView';
import { AboutView } from './views/AboutView';
import { ContactView } from './views/ContactView';
import { PolicyView } from './views/PolicyView';
import { AdminLoginView } from './views/admin/AdminLoginView';
import { AdminDashboardView } from './views/admin/AdminDashboardView';
import { PartIdentifierModal } from './components/common/PartIdentifierModal';

function AppContent() {
  const { currentRoute } = useSite();
  const { isAuthenticated } = useAuth();

  // If user requests admin console and is not authenticated, show login
  if (currentRoute.name === 'admin' && !isAuthenticated) {
    return <AdminLoginView />;
  }

  if (currentRoute.name === 'admin' && isAuthenticated) {
    return <AdminDashboardView initialSubview={currentRoute.subview} />;
  }

  if (currentRoute.name === 'admin-login') {
    return <AdminLoginView />;
  }

  const renderActiveView = () => {
    switch (currentRoute.name) {
      case 'home':
        return <HomeView />;
      case 'products':
        return (
          <ProductsView
            initialCategory={currentRoute.category}
            initialBrand={currentRoute.brand}
            initialAppliance={currentRoute.appliance}
            initialSearch={currentRoute.search}
          />
        );
      case 'product-detail':
        return <ProductDetailView slug={currentRoute.slug} />;
      case 'categories':
        return <CategoriesView />;
      case 'stores':
        return <StoresView initialStoreId={currentRoute.storeId} />;
      case 'about':
        return <AboutView />;
      case 'contact':
        return <ContactView />;
      case 'policy':
        return <PolicyView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased selection:bg-amber-500 selection:text-slate-950">
      <Header />
      <main className="flex-1">
        {renderActiveView()}
      </main>
      <Footer />
      <PartIdentifierModal />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SiteProvider>
        <AppContent />
      </SiteProvider>
    </AuthProvider>
  );
}

