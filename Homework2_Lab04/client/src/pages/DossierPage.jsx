import { useMemo } from 'react';
import { useParams } from 'react-router';
import { AppealReceipt } from '../components/AppealReceipt.jsx';
import { DisproportionalityMatrix } from '../components/DisproportionalityMatrix.jsx';
import { AppealForm } from '../form/AppealForm.jsx';
import { SlaCountdown } from '../components/SlaCountdown.jsx';
import { SANCTION_LABEL, computeMatrix } from '../domain/matrix.js';
import { useAppealSlaTimer } from '../hooks/useAppealSlaTimer.js';
import { useDossier } from '../hooks/useDossier.js';
import { NotFound } from './NotFound.jsx';
import styles from './DossierPage.module.css';

/** Trang /dossier/:playerID. useParams trả chuỗi; id hồ sơ quy ước chữ thường. */
export default function DossierPage() {
  const { playerID = '' } = useParams();
  const { status, dossier, error, retry, setAppeal } = useDossier(playerID.toLowerCase());

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
  // key: đổi hồ sơ thì dựng lại toàn bộ (form, đồng hồ) từ đầu.
  return <DossierView key={dossier.id} dossier={dossier} onAppealSubmitted={setAppeal} onReload={retry} />;
}

/**
 * Hồ sơ đã tải xong. Tách khỏi DossierPage để hook đồng hồ chỉ chạy khi đã có hạn SLA.
 * @param {{ dossier: object, onAppealSubmitted: (appeal: object) => void, onReload: () => void }} props
 */
function DossierView({ dossier, onAppealSubmitted, onReload }) {
  // Ma trận dẫn xuất trong render (slide 33): chỉ tính lại khi hồ sơ đổi.
  const matrix = useMemo(() => computeMatrix(dossier), [dossier]);
  const timer = useAppealSlaTimer(dossier.appealDeadline);
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

      <section aria-labelledby="appeal-title" className={styles.card}>
        <h3 id="appeal-title">Kháng cáo</h3>
        {dossier.appeal ? (
          <AppealReceipt appeal={dossier.appeal} />
        ) : (
          <>
            <SlaCountdown {...timer} />
            <AppealForm playerId={dossier.id} disabled={timer.expired} onSubmitted={onAppealSubmitted} onAlreadySubmitted={onReload} />
          </>
        )}
      </section>

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
