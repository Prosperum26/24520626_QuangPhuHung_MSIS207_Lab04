import { useParams } from 'react-router';
import { NotFound } from '../NotFound.jsx';
import styles from './PersonDetail.module.css';

/**
 * Chi tiết một người theo :id trên URL.
 * useParams() luôn trả chuỗi, và id trong dữ liệu cũng là chuỗi nên === đúng kiểu.
 * @param {{ people: readonly import('./people.js').Person[] }} props
 */
export default function PersonDetail({ people }) {
  const { id } = useParams();
  const person = people.find((p) => p.id === id);

  if (!person) {
    return <NotFound message="404: Không tìm thấy người này" />;
  }

  return (
    <article className={styles.detail}>
      <h2>{person.name}</h2>
      <dl className={styles.attributes}>
        <dt>Name</dt>
        <dd>{person.name}</dd>
        <dt>Age</dt>
        <dd>{person.age}</dd>
        <dt>IQ</dt>
        <dd>{person.iq}</dd>
      </dl>
    </article>
  );
}
