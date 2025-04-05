import Topbar from '../components/Topbar'
import ghostImg from "../assets/ghost.png";
import tasklistImg from "../assets/任務清單.png";
import progressRateImg from "../assets/進度追蹤.png";
import cloudImg from "../assets/資料共享.png";
import suggestionImg from "../assets/建議箱.png";
import MemberImg from "../assets/專案成員資料3.png";
import personalImg from "../assets/個人專案管理.png";
import styles from './notification.module.css'

function Notification(){
    
    return (
        <div>
            <Topbar />
            <div className={styles.attribution_container}>
                <p className={styles.attribution_title}>Image Attribution</p>
                <div className={styles.attribution_content}>
                    <img src={ghostImg} className={styles.attribution_img} alt="MemberImg" />
                    <a href="https://www.flaticon.com/free-icons/halloween-party" title="halloween party icons" className={styles.attribution_alink}>Halloween party icons created by Pixelmeetup - Flaticon</a>
                </div>
                <div className={styles.attribution_content}>
                    <img src={tasklistImg} className={styles.attribution_img} alt="MemberImg" />
                    <a href="https://www.flaticon.com/free-icons/terms" title="terms icons" className={styles.attribution_alink}>Terms icons created by Uniconlabs - Flaticon</a>
                </div>
                <div className={styles.attribution_content}>
                    <img src={progressRateImg} className={styles.attribution_img} alt="MemberImg" />
                    <a href="https://www.flaticon.com/free-icons/gantt-chart" title="gantt chart icons" className={styles.attribution_alink}>Gantt chart icons created by Good Ware - Flaticon</a>
                </div>
                <div className={styles.attribution_content}>
                    <img src={cloudImg} className={styles.attribution_img} alt="MemberImg" />
                    <a href="https://www.flaticon.com/free-icons/share" title="share icons" className={styles.attribution_alink}>Share icons created by Freepik - Flaticon</a>
                </div>
                <div className={styles.attribution_content}>
                    <img src={suggestionImg} className={styles.attribution_img} alt="MemberImg" />
                    <a href="https://www.flaticon.com/free-icons/mailbox" title="mailbox icons" className={styles.attribution_alink}>Mailbox icons created by Freepik - Flaticon</a>
                </div>
                <div className={styles.attribution_content}>
                    <img src={MemberImg} className={styles.attribution_img} alt="MemberImg" />
                    <a href="https://www.flaticon.com/free-icons/supplier" title="supplier icons" className={styles.attribution_alink}>Supplier icons created by zero_wing - Flaticon</a>
                </div>
                <div className={styles.attribution_content}>
                    <img src={personalImg} className={styles.attribution_img} alt="MemberImg" />
                    <a href="https://www.flaticon.com/free-icons/project" title="project icons" className={styles.attribution_alink}>Project icons created by Freepik - Flaticon</a>
                </div>

            </div>
        </div>
    )
}

export default Notification