import { memo } from 'react';
import styles from './Leads.module.css';

function Pagination({ pagination, onPage, noun = 'lead' }) {
  const { page, pages, total } = pagination;
  return (
    <div className={styles.pager}>
      <span>{total} {noun}{total === 1 ? '' : 's'}</span>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button className="btn btn-sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>← Prev</button>
        <span>Page {page} of {pages}</span>
        <button className="btn btn-sm" disabled={page >= pages} onClick={() => onPage(page + 1)}>Next →</button>
      </div>
    </div>
  );
}
export default memo(Pagination);
