import Topbar from '../components/Topbar'

import MemberImg from '../assets/專案成員資料3.png'
import styles from './notification.module.css'

function Notification(){
    
    return (
        <div>
            <Topbar />
            <div className={styles.attribution_container}>
                <p className={styles.attribution_title}>Image Attribution</p>
                <div className={styles.attribution_content}>
                    <img src={MemberImg} className={styles.attribution_img} alt="MemberImg" />
                    <a href="https://www.flaticon.com/free-icons/supplier" title="supplier icons" className={styles.attribution_alink}>Supplier icons created by zero_wing - Flaticon</a>
                </div>
                <div>

                </div>
            </div>
        </div>
    )
}

export default Notification