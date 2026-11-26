import { useMemo } from 'react';
import { useParams } from 'react-router';
import { DisproportionalityMatrix } from '../components/DisproportionalityMatrix.jsx';
import { SANCTION_LABEL, computeMatrix } from '../domain/matrix.js';
import { useDossier } from '../hooks/useDossier.js';
import { NotFound } from './NotFound.jsx';
import styles from './DossierPage.module.css';

/** Trang /dossier/:playerID. useParams trả chuỗi; id hồ sơ quy ước chữ thường. */
export default function DossierPage() {
  const { playerID = '' } = useParams();
  const { status, dossier, error, retry } = useDossier(playerID.toLowerCase());

  // Ma trận dẫn xuất trong render (slide 33): chỉ tính lại khi hồ sơ đổi.
  const matrix = useMemo(() => computeMatrix(dossier), [dossier]);

  if (status === 'loading') return <p role="status">Đang tải hồ sơ…</p>;
  if (status === 'not-found') return <NotFound title="Không tìm thấy hồ sơ" />;
  if (status === 'error') {
    return (
      <div role="alert" className={styles.alert}>
        <p>{error}</p>
        <button type="button" onClick={retry}>
          Thử lại
        </button>
      </div>
    );
  }

  const { sanction } = dossier;
  return (
    <article className={styles.page} aria-labelledby="dossier-title">
      <header>
        <h2 id="dossier-title">{dossier.name}</h2>
        <p className={styles.muted}>{dossier.realName}</p>
        <p>{dossier.summary}</p>
      </header>

      <section aria-labelledby="case-title" className={styles.card}>
        <h3 id="case-title">Vụ việc</h3>
        <dl className={styles.facts}>
          <dt>Cáo buộc</dt>
          <dd>{dossier.accusation}</dd>
          <dt>Án phạt</dt>
          <dd>
            {SANCTION_LABEL[sanction.kind]}: {sanction.scope}
          </dd>
          <dt>Ban hành</dt>
          <dd>
            {sanction.issuer}, <time dateTime={sanction.issuedAt}>{sanction.issuedAt}</time>
          </dd>
        </dl>
      </section>

      <DisproportionalityMatrix matrix={matrix} sanctionKind={sanction.kind} />

      <section aria-labelledby="sources-title">
        <h3 id="sources-title">Nguồn</h3>
        <ul>
          {dossier.sources.map((s) => (
            <li key={s.url}>
              <a href={s.url} target="_blank" rel="noreferrer">
                {s.title}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
