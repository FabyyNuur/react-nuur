import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./routes";
import { AuthProvider } from "./context/AuthContext";
import { Suspense } from "react";
import { Toaster } from "sonner";

function AppContent(){
  return <AppRoutes/>
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<div className="h-screen bg-bg-dark flex items-center justify-center text-brand-primary">Chargement Nuur GYM...</div>}>
          <AppContent/>
          <Toaster position="top-right" richColors theme="dark" />
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  )
}
