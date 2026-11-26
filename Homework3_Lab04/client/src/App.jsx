import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router';
import { Layout } from './components/Layout.jsx';
import { GalleryPage } from './pages/GalleryPage.jsx';
import { NotFound } from './pages/NotFound.jsx';

// Trang chủ (LCP) tải ngay; trang phụ tách chunk theo route.
const AboutPage = lazy(() => import('./pages/AboutPage.jsx'));

/** Toàn bộ route của app nằm ở đây. */
export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<GalleryPage />} />
        <Route
          path="about"
          element={
            <Suspense fallback={<p role="status">Đang tải…</p>}>
              <AboutPage />
            </Suspense>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
