import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router';
import { Layout } from './components/Layout.jsx';
import { DossierList } from './pages/DossierList.jsx';
import { NotFound } from './pages/NotFound.jsx';

// Trang hồ sơ nặng nhất (form, ma trận, đồng hồ) nên tách chunk theo route.
const DossierPage = lazy(() => import('./pages/DossierPage.jsx'));

/** Toàn bộ route của app nằm ở đây. */
export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<DossierList />} />
        <Route
          path="dossier/:playerID"
          element={
            <Suspense fallback={<p role="status">Đang tải hồ sơ…</p>}>
              <DossierPage />
            </Suspense>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
