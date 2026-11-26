import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { fetchDossiers } from '../api/appealApi.js';

/** Trang chủ: danh sách hồ sơ, mỗi hồ sơ một link /dossier/:playerID. */
export function DossierList() {
  const [result, setResult] = useState({ status: 'loading', dossiers: [] });

  useEffect(() => {
    const controller = new AbortController();
    fetchDossiers({ signal: controller.signal })
      .then((dossiers) => {
        if (!controller.signal.aborted) setResult({ status: 'ready', dossiers });
      })
      .catch((err) => {
        if (controller.signal.aborted || err.name === 'AbortError') return;
        setResult({ status: 'error', dossiers: [] });
      });
    return () => controller.abort();
  }, []);

  return (
    <section aria-labelledby="list-title">
      <h2 id="list-title">Hồ sơ kháng cáo</h2>
      {result.status === 'loading' && <p role="status">Đang tải danh sách…</p>}
      {result.status === 'error' && <p role="alert">Không tải được danh sách. Kiểm tra server rồi tải lại trang.</p>}
      <ul>
        {result.dossiers.map((d) => (
          <li key={d.id}>
            <Link to={`/dossier/${d.id}`}>{d.name}</Link>
            {d.hasAppeal && ' (đã nộp đơn)'}
          </li>
        ))}
      </ul>
    </section>
  );
}
