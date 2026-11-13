import { Navigate, Route, Routes } from 'react-router';
import { AppLayout } from './AppLayout.jsx';
import { NotFound } from './NotFound.jsx';
import { Placeholder } from './Placeholder.jsx';
import { PEOPLE } from './sprint1-router/people.js';
import PeopleLayout from './sprint1-router/PeopleLayout.jsx';
import { PeopleIndex } from './sprint1-router/PeopleIndex.jsx';
import PersonDetail from './sprint1-router/PersonDetail.jsx';

// Toàn bộ route nằm ở đây (một chỗ duy nhất, dễ sửa khi bảo vệ).
export function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/people" replace />} />
        <Route path="people" element={<PeopleLayout people={PEOPLE} />}>
          <Route index element={<PeopleIndex />} />
          <Route path=":id" element={<PersonDetail people={PEOPLE} />} />
        </Route>
        <Route path="form" element={<Placeholder title="Form" sprint="Sprint 2" />} />
        <Route path="forum" element={<Placeholder title="Forum" sprint="Sprint 3" />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
