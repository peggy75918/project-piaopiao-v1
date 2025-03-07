import Topbar from '../components/Topbar'
import UnderConstruction from '../assets/建置中.png'
import styles from './notification.module.css'

function Notification(){
    
    return (
        <div>
            <Topbar />
            <div className={styles.notification_container}>
                <p style={{margin: "0px", marginBottom: "20px"}}>👻 通知設定功能將於3/28開放使用</p>
                <img src={UnderConstruction} className={styles.notification_img} alt="cloud" />
                <a 
                    href="https://www.flaticon.com/free-icons/process" 
                    title="process icons"
                    className={styles.notification_alink}
                >
                    Process icons created by Freepik - Flaticon
                </a>
            </div>
        </div>
    )
}

export default Notification