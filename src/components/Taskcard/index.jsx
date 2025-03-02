import styles from './taskcard.module.css';

const Taskcard = () => {

  return (
    <div className={styles.taskcard_container}>
      <div>
        <div className={styles.taskcard_circle}></div>
      </div>
      <div className={styles.taskcard_content}>
        <p className={styles.taskcard_text}>配色挑選</p>
        <p className={styles.taskcard_text}>負責人：林三折</p>
        <p className={styles.taskcard_text}>任務進度：2/3</p>
      </div>
      <div className={styles.taskcard_time}>
        <p className={styles.taskcard_timetext}>倒數3天</p>
      </div>
    </div>
  );
};

export default Taskcard;