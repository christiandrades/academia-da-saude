import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/shared/auth";
import HomePage from "@/react-app/pages/Home";
import AuthCallback from "@/react-app/pages/AuthCallback";
import Dashboard from "@/react-app/pages/Dashboard";
import Ranking from "@/react-app/pages/Ranking";
import Badges from "@/react-app/pages/Badges";
import Challenges from "@/react-app/pages/Challenges";
import Admin from "@/react-app/pages/Admin";
import AdminTurmas from "@/react-app/pages/AdminTurmas";
import AdminAulas from "@/react-app/pages/AdminAulas";
import AdminFrequencia from "@/react-app/pages/AdminFrequencia";
import AdminRelatorios from "@/react-app/pages/AdminRelatorios";
import AdminUsuarios from "@/react-app/pages/AdminUsuarios";
import AdminDesafios from "@/react-app/pages/AdminDesafios";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/ranking" element={<Ranking />} />
          <Route path="/badges" element={<Badges />} />
          <Route path="/challenges" element={<Challenges />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/turmas" element={<AdminTurmas />} />
          <Route path="/admin/aulas" element={<AdminAulas />} />
          <Route path="/admin/frequencia" element={<AdminFrequencia />} />
          <Route path="/admin/relatorios" element={<AdminRelatorios />} />
          <Route path="/admin/usuarios" element={<AdminUsuarios />} />
          <Route path="/admin/desafios" element={<AdminDesafios />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
