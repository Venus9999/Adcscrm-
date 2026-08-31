import React, { useState } from 'react';
import { CRMProvider, useCRM } from './context/CRMContext';
import { GmailProvider } from './context/GmailContext';
import { GmailConfirmDialog } from './components/gmail/GmailConfirmDialog';
import { GmailHub } from './components/gmail/GmailHub';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MasterDashboard } from './components/dashboard/MasterDashboard';
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { EmployeeDashboard } from './components/dashboard/EmployeeDashboard';
import { ClientPortal } from './components/dashboard/ClientPortal';
import { ClientsList } from './components/clients/ClientsList';
import { ClientDetailModal } from './components/clients/ClientDetailModal';
import { AddClientModal } from './components/clients/AddClientModal';
import { WorkStagesPipeline } from './components/pipeline/WorkStagesPipeline';
import { CompaniesManagement } from './components/companies/CompaniesManagement';
import { DocumentVault } from './components/documents/DocumentVault';
import { PDFEditorModal } from './components/documents/PDFEditorModal';
import { TasksManager } from './components/tasks/TasksManager';
import { InvoicesPayments } from './components/payments/InvoicesPayments';
import { MessagesHub } from './components/messages/MessagesHub';
import { ReportsAnalytics } from './components/reports/ReportsAnalytics';
import { AuditTrail } from './components/audit/AuditTrail';
import { ServicesCatalog } from './components/services/ServicesCatalog';
import { SystemSettings } from './components/settings/SystemSettings';
import { DepartmentSettings } from './components/settings/DepartmentSettings';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { LeadsManagement } from './components/leads/LeadsManagement';
import { TransactionsManagement } from './components/transactions/TransactionsManagement';
import { EmployeesManagement } from './components/employees/EmployeesManagement';
import { UserProfileSettings } from './components/settings/UserProfileSettings';
import { VendorsManagement } from './components/vendors/VendorsManagement';
import { VisaServicesManager } from './components/visa/VisaServicesManager';
import { AIVisaCountryAdvisor } from './components/visa/AIVisaCountryAdvisor';
import { AIImageStudio } from './components/ai/AIImageStudio';
import { LoginScreen } from './components/auth/LoginScreen';
import { PWAInstallBanner } from './components/common/PWAInstallBanner';
import { PWAInstallModal } from './components/common/PWAInstallModal';

import { ErrorBoundary } from './components/common/ErrorBoundary';

const AppContent: React.FC = () => {
  const { currentUser, activeTab, selectedClientId, setSelectedClientId, setActiveTab, isAuthenticated } = useCRM();

  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showPWAInstallModal, setShowPWAInstallModal] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // If not authenticated, render the secure Login Screen
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  // Render main screen based on active tab and current user role
  const renderContent = () => {
    // If client role is active, always prioritize Client Portal if dashboard or client_portal is active
    if (currentUser.role === 'client' && (activeTab === 'dashboard' || activeTab === 'client_portal')) {
      return <ClientPortal />;
    }

    switch (activeTab) {
      case 'dashboard':
        if (currentUser.role === 'master') return <MasterDashboard />;
        if (currentUser.role === 'admin') return <AdminDashboard />;
        if (currentUser.role === 'employee') return <EmployeeDashboard />;
        return <ClientPortal />;

      case 'client_portal':
        return <ClientPortal />;

      case 'leads':
        return <LeadsManagement />;

      case 'transactions':
        return <TransactionsManagement />;

      case 'users':
      case 'employees':
      case 'team':
        return <EmployeesManagement />;

      case 'profile':
        return <UserProfileSettings />;

      case 'companies':
        return <CompaniesManagement />;

      case 'vendors':
      case 'partners':
        return <VendorsManagement />;

      case 'clients':
        return (
          <ClientsList
            onOpenAddClient={() => setShowAddClientModal(true)}
            onOpenClientDetail={(id) => setSelectedClientId(id)}
          />
        );

      case 'pipeline':
        return <WorkStagesPipeline onOpenClientDetail={(id) => setSelectedClientId(id)} />;

      case 'visa':
      case 'visas':
        return <VisaServicesManager />;

      case 'ai_advisor':
      case 'visa_advisor':
        return <AIVisaCountryAdvisor />;

      case 'photo_studio':
      case 'image_studio':
      case 'ai_image':
        return <AIImageStudio />;

      case 'services':
        return <ServicesCatalog />;

      case 'documents':
        return <DocumentVault />;

      case 'pdf_editor':
      case 'pdf':
        return (
          <div className="relative">
            <DocumentVault />
            <PDFEditorModal
              isOpen={true}
              onClose={() => setActiveTab('documents')}
            />
          </div>
        );

      case 'tasks':
        return <TasksManager />;

      case 'payments':
        return <InvoicesPayments />;

      case 'messages':
        return <MessagesHub />;

      case 'reports':
        return <ReportsAnalytics />;

      case 'audit':
        return <AuditTrail />;

      case 'gmail':
        return <GmailHub />;

      case 'smtp':
      case 'smtp_settings':
      case 'email_settings':
      case 'email':
        return <SystemSettings initialTab="smtp" />;

      case 'departments':
      case 'department':
        if (currentUser.role !== 'master' && currentUser.role !== 'admin') {
          return <MasterDashboard />;
        }
        return <DepartmentSettings />;

      case 'categories':
      case 'lead_config':
      case 'lead-categories':
        if (currentUser.role !== 'master' && currentUser.role !== 'admin') {
          return <MasterDashboard />;
        }
        return <SystemSettings initialTab="lead_config" />;

      case 'billing':
        return <SystemSettings initialTab="billing" />;

      case 'branding':
        return <SystemSettings initialTab="branding" />;

      case 'settings':
        return <SystemSettings />;

      default:
        return <MasterDashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
      {/* Left Sidebar */}
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <Navbar
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenAddClient={() => setShowAddClientModal(true)}
          onOpenCreateInvoice={() => setActiveTab('payments')}
          onOpenAddTask={() => setActiveTab('tasks')}
          onOpenUploadDoc={() => setActiveTab('documents')}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
        />

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">{renderContent()}</div>
        </main>
      </div>

      {/* Global Search Modal */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Add Client Modal */}
      <AddClientModal
        isOpen={showAddClientModal}
        onClose={() => setShowAddClientModal(false)}
      />

      {/* Client Detail / Dossier Modal */}
      {selectedClientId && (
        <ClientDetailModal
          clientId={selectedClientId}
          onClose={() => setSelectedClientId(null)}
          onOpenInvoiceModal={() => {
            setActiveTab('payments');
          }}
        />
      )}

      {/* Mandatory Gmail Mutating Action Confirmation Dialog */}
      <GmailConfirmDialog />

      {/* PWA / Android Mobile App Install Banner */}
      <PWAInstallBanner onOpenModal={() => setShowPWAInstallModal(true)} />

      {/* PWA / Android Install Guide Modal */}
      <PWAInstallModal
        isOpen={showPWAInstallModal}
        onClose={() => setShowPWAInstallModal(false)}
      />
    </div>
  );
};

export function App() {
  return (
    <ErrorBoundary>
      <CRMProvider>
        <GmailProvider>
          <AppContent />
        </GmailProvider>
      </CRMProvider>
    </ErrorBoundary>
  );
}

export default App;
