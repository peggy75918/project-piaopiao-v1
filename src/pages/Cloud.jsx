import Topbar from '../components/Topbar'
import UnderConstruction from '../assets/建置中.png'
import styles from './cloud.module.css'

function Cloud(){
    
    return (
        <div>
            <Topbar />
            <div className={styles.cloud_container}>
                <p style={{margin: "0px", marginBottom: "20px"}}>👻 共用雲端功能將於3/28開放使用</p>
                <img src={UnderConstruction} className={styles.cloud_img} alt="cloud" />
                <a 
                    href="https://www.flaticon.com/free-icons/process" 
                    title="process icons"
                    className={styles.cloud_alink}
                >
                    Process icons created by Freepik - Flaticon
                </a>
            </div>
            
        </div>
    )
}

export default Cloud