import { useParams } from 'react-router';

/** Trang hồ sơ: dựng đầy đủ ở H2-06. */
export default function DossierPage() {
  const { playerID } = useParams();
  return <h2>{playerID}</h2>;
}
